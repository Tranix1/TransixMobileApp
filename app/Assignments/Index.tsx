import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList,
    Alert,
    ToastAndroid,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import { ThemedText } from '@/components/ThemedText';
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/db/fireBaseConfig';
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, increment, getDoc, serverTimestamp, arrayUnion, where } from 'firebase/firestore';
import Heading from '@/components/Heading';
import { wp, hp } from '@/constants/common';
import Input from '@/components/Input';
import { getRelativeTime } from '@/Utilities/getDateRelativeTime';
import { fetchDocuments, updateDocument, uploadImage } from '@/db/operations';
import * as ImagePicker from "expo-image-picker";
import { takePhoto, selectMultipleImages } from '@/Utilities/photoPickerUtils';
import { Image } from 'expo-image';
import { ImagePickerAsset } from 'expo-image-picker';
import DriverDefaultModal from '@/components/DriverDefaultModal';
import FinancePanel from '@/components/FinancePanel';
import TruckDefaultModal from '@/components/TruckDefaultModal';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import AssignmentCard from '@/components/AssignmentComponent';
import AccentRingLoader from '@/components/AccentRingLoader';
import { trackAssignmentCompleted, trackAssignmentStarted } from '@/services/analytics/appAnalytics';
import { incrementAssignmentsCompleted, incrementAssignmentsStarted } from '@/services/analytics/dashboardAnalytics';
import { incrementCompletedTrips, incrementActiveTrips } from '@/services/analytics/organizationAnalytics';

// ---------------------------------------------------------------------------
// Independent Assignments page for Fleet / Broker use.
// (Standalone — does not depend on any driver-specific state or flow.)
//
// ASSUMPTIONS (please adjust to match your real schema/components):
// 1. `currentRole.accType` is 'fleet' or 'brokerage'.
// 2. Fleet assignments live at `fleets/{fleetId}/assignments`.
//    Brokerage assignments are assumed to live at `brokerages/{brokerageId}/assignments`.
//    Update getAssignmentsPath() below if your actual paths differ.
// 3. Truck/Driver/Customer live under the fleet/brokerage doc; Load pulls from
//    the top-level `Cargo` collection.
//    Update SELECTOR_CONFIG below to point at your real collections, or swap
//    the fetch call inside SelectorModal for your existing selector screens.
// 4. Each assignment doc has a top-level `status` field, updated directly.
// 5. Activity (notes/issues) live at `fleets/{fleetDetails.id}/Assignments/{assignmentId}/activity`,
//    matching assignmentData.fleetDetails.id used elsewhere in this file for
//    the Truck action button. Update ACTIVITY_SUBCOLLECTION below if it differs.
// ---------------------------------------------------------------------------


interface CargoItem {
    id: string;
    cargoId: string;
    truckId: string;
    truckName: string;
    status: 'PENDING' | 'active' | 'COMPLETED' | 'accepted' | 'rejected';
    assignedAt: string;
    loadData?: any;
    createdAt: string;
    acceptedAt: string;
    rejectionReason?: string;
    customerId?: string;
}

type StatusTab = 'IN_TRANSIT' | 'PENDING' | 'COMPLETED' | 'rejected' | 'all';
type FilterType = 'truck' | 'driver' | 'customer' | 'load';

interface FilterValue {
    id: string;
    label: string;
}

type FiltersState = Partial<Record<FilterType, FilterValue>>;

const FILTER_TYPES: { key: FilterType; label: string; icon: any }[] = [
    { key: 'load', label: 'Load', icon: 'cube-outline' },
    { key: 'truck', label: 'Truck', icon: 'car-outline' },
    { key: 'driver', label: 'Driver', icon: 'person-outline' },
    { key: 'customer', label: 'Customer', icon: 'business-outline' },
];

// Firestore paths/labels for each selector type. Adjust to your real schema.
const SELECTOR_CONFIG: Record<
    FilterType,
    {
        getPath: (scopeId: string | null | undefined) => string;
        labelField: string;
        subLabelField?: string;
    }
> = {
    truck: { getPath: (scopeId) => `fleets/${scopeId}/trucks`, labelField: 'truckName', subLabelField: 'plateNumber' },
    driver: { getPath: (scopeId) => `fleets/${scopeId}/drivers`, labelField: 'name', subLabelField: 'phoneNumber' },
    customer: { getPath: (scopeId) => `fleets/${scopeId}/customers`, labelField: 'name', subLabelField: 'phoneNumber' },
    load: { getPath: () => `Cargo`, labelField: 'typeofLoad', subLabelField: 'pickupLocation.description' },
};

function getNested(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// ---------------------------------------------------------------------------
// Generic reusable Selector Modal (Truck / Driver / Customer / Load)
// ---------------------------------------------------------------------------
function SelectorModal({
    visible,
    type,
    scopeId,
    onClose,
    onSelect,
}: {
    visible: boolean;
    type: FilterType | null;
    scopeId: string | null | undefined;
    onClose: () => void;
    onSelect: (type: FilterType, value: FilterValue) => void;
}) {
    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");

    const theIcon = useThemeColor("icon")


    const [search, setSearch] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible || !type) return;
        setSearch('');
        fetchItems(type);
    }, [visible, type]);

    const fetchItems = async (t: FilterType) => {
        try {
            setLoading(true);
            const config = SELECTOR_CONFIG[t];
            const path = config.getPath(scopeId);
            const snap = await getDocs(collection(db, path));
            const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setItems(results);
        } catch (error) {
            console.error(`Error fetching ${t} list:`, error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        if (!type) return [];
        const config = SELECTOR_CONFIG[type];
        if (!search.trim()) return items;
        const s = search.toLowerCase();
        return items.filter((item) => {
            const label = String(getNested(item, config.labelField) || '').toLowerCase();
            const sub = config.subLabelField ? String(getNested(item, config.subLabelField) || '').toLowerCase() : '';
            return label.includes(s) || sub.includes(s);
        });
    }, [items, search, type]);





    if (!type) return null;
    const config = SELECTOR_CONFIG[type];
    const typeLabel = FILTER_TYPES.find((f) => f.key === type)?.label ?? type;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.selectorSheet, { backgroundColor: backgroundLight }]}>
                    <View style={styles.sheetHeader}>
                        <ThemedText style={styles.sheetTitle}>Select {typeLabel}</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={accent} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={18} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${typeLabel.toLowerCase()}...`}
                            placeholderTextColor="#999"
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="none"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={18} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={accent} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredItems}
                            keyExtractor={(item) => item.id}
                            style={{ flex: 1 }}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <ThemedText style={styles.emptyStateSubtext}>
                                        No {typeLabel.toLowerCase()} found
                                    </ThemedText>
                                </View>
                            }
                            renderItem={({ item }) => {
                                const label = getNested(item, config.labelField) || 'Unnamed';
                                const sub = config.subLabelField ? getNested(item, config.subLabelField) : null;
                                return (
                                    <TouchableOpacity
                                        style={styles.selectorRow}
                                        onPress={() => {
                                            onSelect(type, { id: item.id, label });
                                            onClose();
                                        }}
                                    >
                                        <ThemedText style={styles.selectorRowTitle}>{label}</ThemedText>
                                        {!!sub && <ThemedText style={styles.selectorRowSub}>{sub}</ThemedText>}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Filter Type picker modal (Load / Truck / Driver / Customer)
// ---------------------------------------------------------------------------
function FilterTypeModal({ visible, onClose, onPick, }: {
    visible: boolean;
    onClose: () => void;
    onPick: (type: FilterType) => void;
}) {
    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.filterTypeSheet, { backgroundColor: backgroundLight }]}>
                    <View style={styles.sheetHeader}>
                        <ThemedText style={styles.sheetTitle}>Filter By</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={accent} />
                        </TouchableOpacity>
                    </View>
                    {FILTER_TYPES.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={styles.filterTypeRow}
                            onPress={() => onPick(f.key)}
                        >
                            <Ionicons name={f.icon} size={20} color={accent} />
                            <ThemedText style={styles.filterTypeRowText}>{f.label}</ThemedText>
                            <Ionicons name="chevron-forward" size={18} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Reject Reason modal
// ---------------------------------------------------------------------------
function RejectReasonModal({
    visible,
    onClose,
    onConfirm,
}: {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}) {
    const backgroundLight = useThemeColor("backgroundLight");
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (visible) setReason('');
    }, [visible]);

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.rejectSheet, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={styles.sheetTitle}>Reason for Rejection</ThemedText>
                    <TextInput
                        style={styles.reasonInput}
                        placeholder="Enter reason..."
                        placeholderTextColor="#999"
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        numberOfLines={4}
                    />
                    <View style={styles.rejectButtonsRow}>
                        <TouchableOpacity style={[styles.statusActionButton, { backgroundColor: '#999' }]} onPress={onClose}>
                            <ThemedText style={styles.statusActionButtonText}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.statusActionButton, { backgroundColor: '#F44336' }]}
                            onPress={() => {
                                if (!reason.trim()) {
                                    Alert.alert('Reason required', 'Please provide a reason for rejection.');
                                    return;
                                }
                                onConfirm(reason.trim());
                            }}
                        >
                            <ThemedText style={styles.statusActionButtonText}>Confirm Reject</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Notes / Issues panel for a single assignment. Replaces the old
// "Add Note / Issue" button + inline bottom-sheet. Persists to Firestore
// under fleets/{fleetId}/Assignments/{assignmentId}/activity, keeps a
// running list per type, and bumps notesCount/issuesCount on the parent doc.
// ---------------------------------------------------------------------------
function AssignmentActivityPanel({

    assignmentId,
    fleetId,
    initialNotesCount,
    initialIssuesCount,
    cargoRate,
    cargoRateCurrency,
    cargoRateModel,
    cargoRatePerKm,
    cargoPaymentTerms,
    accent,
    backgroundLight,
    icon,

}: {
    assignmentId: string;
    fleetId: string | undefined;
    initialNotesCount?: number;
    initialIssuesCount?: number;
    cargoRate: string,
    cargoRateCurrency: string;
    cargoRateModel: string;
    cargoRatePerKm: string;
    cargoPaymentTerms: [];
    accent: string;
    backgroundLight: string;
    icon: string
}) {















}




// ---------------------------------------------------------------------------
// Main Assignments page (Fleet / Broker only — independent, no driver logic)
// ---------------------------------------------------------------------------
function Jobs() {
    const background = useThemeColor("background");
    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");
    const icon = useThemeColor("icon")

    const { currentRole, user } = useAuth();
    const accType = currentRole?.accType; // 'fleet' | 'brokerage'
    const scopeId = accType === 'brokerage' ? currentRole?.organizationId : currentRole?.fleetId;

    const [assignedCargo, setAssignedCargo] = useState<CargoItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [hasMoreAssignments, setHasMoreAssignments] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<StatusTab>('all');
    const [expandedCargo, setExpandedCargo] = useState<string | null>(null);

    // ---- Filter state ----
    const [filters, setFilters] = useState<FiltersState>({});
    const [filterTypeModalVisible, setFilterTypeModalVisible] = useState(false);
    const [activeSelectorType, setActiveSelectorType] = useState<FilterType | null>(null);

    // ---- Reject flow state ----
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<{ cargoId: string; assignmentDocId: string } | null>(null);


    const changeTab = (tab: StatusTab) => {
        setActiveTab(tab);
        setAssignedCargo([]);
        setLastVisible(null);
        setHasMoreAssignments(true);
    };


    const getAssignmentsPath = useCallback(() => {

        if (accType === 'brokerage') return `brokerages/${scopeId}/assignments`;
        return `fleets/${scopeId}/assignments`;

    }, [accType, scopeId]);


    const fetchAssignments = async () => {
        if (!scopeId) return;

        setIsLoading(true)

        try {
            setLoading(true);

            const collectionName = getAssignmentsPath();

            const filters = activeTab !== "all"
                ? [
                    where("status", "==", activeTab)
                ]
                : [];

            const result = await fetchDocuments(
                collectionName,
                50,
                undefined,
                filters
            );

            setAssignedCargo(result.data as any[]);

            setLastVisible(result.lastVisible || null);

            if (!result.lastVisible) {
                setHasMoreAssignments(false);
            } else {
                setHasMoreAssignments(true);
            }

            setIsLoading(false)

        } catch (error) {
            console.error("Error fetching assignments:", error);
            setIsLoading(false)

        } finally {
            setLoading(false);
        }
    };



    const loadMoreAssignments = async () => {
        if (loadingMore || !lastVisible || !hasMoreAssignments) return;

        try {
            setLoadingMore(true);

            const filters = activeTab !== "all"
                ? [
                    where("status", "==", activeTab)
                ]
                : [];

            const result = await fetchDocuments(
                getAssignmentsPath(),
                50,
                lastVisible,
                filters
            );

            const newData = result.data as any[];

            if (newData.length === 0) {
                setHasMoreAssignments(false);
                return;
            }

            setAssignedCargo(prev => {
                const existingIds = new Set(prev.map(item => item.id));

                return [
                    ...prev,
                    ...newData.filter(item => !existingIds.has(item.id))
                ];
            });

            setLastVisible(result.lastVisible || null);

            if (!result.lastVisible || newData.length < 50) {
                setHasMoreAssignments(false);
            }

        } catch (error) {
            console.log("Load more assignments error", error);

        } finally {
            setLoadingMore(false);
        }
    };
    const onRefresh = async () => {
                try {
                    setRefreshing(true);
                    setError(null);
                    await fetchAssignments();
                } catch (error) {
                    console.error('Error refreshing loads:', error);
                    setError('Failed to refresh loads. Please try again.');
                    ToastAndroid.show('Failed to refresh loads', ToastAndroid.SHORT);
                } finally {
                    setRefreshing(false);
                }
            };

    useEffect(() => {

        fetchAssignments();
    }, [accType, scopeId, activeTab]);




    const updateCargoStatus = async (
        cargoId: string,
        assignmentDocId: string,
        newStatus: string,
        rejectionReason?: string
    ) => {
        try {
            const path = getAssignmentsPath();
            const docRef = doc(db, path, assignmentDocId);

            await updateDoc(docRef, {
                status: newStatus,
                ...(rejectionReason ? { rejectionReason } : {}),
            });

            const analyticsOrganizationId = currentRole?.organizationId || currentRole?.fleetId || scopeId;
            const normalizedStatus = newStatus.toLowerCase();
            if (analyticsOrganizationId && (currentRole?.accType === 'fleet' || currentRole?.accType === 'brokerage')) {
                const context = { userId: user?.uid, organizationId: analyticsOrganizationId, organizationProfileId: analyticsOrganizationId, organizationType: currentRole?.accType, role: currentRole?.userRole, accountType: currentRole?.accType, metadata: { cargoId, assignmentId: assignmentDocId, status: newStatus } };
                if (normalizedStatus === 'active' || normalizedStatus === 'started') {
                    void trackAssignmentStarted(context).catch(console.error);
                    void incrementAssignmentsStarted(currentRole.accType, analyticsOrganizationId).catch(console.error);
                    void incrementActiveTrips(analyticsOrganizationId).catch(console.error);
                }
                if (normalizedStatus === 'completed') {
                    void trackAssignmentCompleted(context).catch(console.error);
                    void incrementAssignmentsCompleted(currentRole.accType, analyticsOrganizationId).catch(console.error);
                    void incrementCompletedTrips(analyticsOrganizationId).catch(console.error);
                }
            }

            setAssignedCargo((prev) =>
                prev.map((item) =>
                    item.id === assignmentDocId
                        ? { ...item, status: newStatus as any, ...(rejectionReason ? { rejectionReason } : {}) }
                        : item
                )
            );

            Alert.alert('Success', `Job status updated to ${newStatus}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update.');
        }
    };



    const confirmReject = (reason: string) => {
        if (rejectTarget) {
            updateCargoStatus(rejectTarget.cargoId, rejectTarget.assignmentDocId, 'rejected', reason);
        }
        setRejectModalVisible(false);
        setRejectTarget(null);
    };

    // ---- Filtering ----
    const applyFilter = (type: FilterType, value: FilterValue) => {
        setFilters((prev) => ({ ...prev, [type]: value }));
    };

    const removeFilter = (type: FilterType) => {
        setFilters((prev) => {
            const next = { ...prev };
            delete next[type];
            return next;
        });
    };

    const clearAllFilters = () => setFilters({});


    const activeFilterEntries = Object.entries(filters) as [FilterType, FilterValue][];



    const statusTabs: { key: StatusTab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'IN_TRANSIT', label: 'Active' },
        { key: 'COMPLETED', label: 'Completed' },
        { key: 'rejected', label: 'Rejected' },
    ];



    return (
        <View style={[styles.container, { backgroundColor: background }]} >

            {/* <CustomHeader pageTitle="Jobs" filterElement={setFilterTypeModalVisible} /> */}
            {(currentRole.accType !== "driver") &&
                <View style={{ paddingTop: 30 }}> <Heading page="My Assignments" rightComponent={<View>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setFilterTypeModalVisible(true)}
                    >
                        <Ionicons name="filter" size={16} color="white" />
                        <ThemedText style={styles.filterButtonText}>Filter</ThemedText>
                    </TouchableOpacity>
                </View>} /> </View>}

            {currentRole.accType === "driver" && <CustomHeader pageTitle='Jobs' />}

            <View style={styles.content}>

                <View style={{ height: 58, marginBottom: 14, marginTop: 8 }}>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buttonContainer}>
                        {statusTabs.map((tab) => {
                            const count =
                                tab.key === 'all'
                                    ? assignedCargo.length
                                    : assignedCargo.filter((c) => c.status === tab.key).length;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[
                                        styles.statusButton,
                                        activeTab === tab.key && {
                                            backgroundColor: accent,
                                            borderWidth: 0,
                                        },
                                    ]}
                                    onPress={() => changeTab(tab.key)}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[
                                            styles.buttonText,
                                            activeTab === tab.key && styles.activeButtonText,
                                        ]}
                                    >
                                        {tab.label} ({count})
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}

                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => setFilterTypeModalVisible(true)}
                        >
                            <Ionicons name="filter" size={16} color="white" />
                            <ThemedText style={styles.filterButtonText}>Filter</ThemedText>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {activeFilterEntries.length > 0 && (
                    <View style={styles.filterChipsRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                            {activeFilterEntries.map(([type, value]) => (
                                <View key={type} style={styles.filterChip}>
                                    <ThemedText style={styles.filterChipText}>
                                        {FILTER_TYPES.find((f) => f.key === type)?.label}: {value.label}
                                    </ThemedText>
                                    <TouchableOpacity onPress={() => removeFilter(type)}>
                                        <Ionicons name="close" size={14} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersButton}>
                            <ThemedText style={styles.clearFiltersText}>Clear Filters</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Cargo List */}
                <FlatList
                    data={assignedCargo}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AssignmentCard assignmentData={item} />
                    )}
                    onEndReached={loadMoreAssignments}
                    onEndReachedThreshold={0.5}
                     refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={[accent]}
                                        />
                                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            {isLoading ? (
                                <>
                                    <AccentRingLoader color={accent} size={32} dotSize={6} />
                                    <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                        Loading Assignments…
                                    </ThemedText>
                                    <ThemedText type='tiny' style={styles.emptySubtext}>
                                        Please Wait
                                    </ThemedText>
                                </>
                            ) : error ? (
                                <>
                                    <Ionicons name="alert-circle-outline" size={wp(8)} color="#ef4444" />
                                    <ThemedText type='defaultSemiBold' style={[styles.emptyText, { color: '#ef4444' }]}>
                                        {error}
                                    </ThemedText>
                                    <ThemedText type='tiny' style={styles.emptySubtext}>
                                        Pull to refresh
                                    </ThemedText>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="cube-outline" size={wp(8)} color={icon} />
                                    <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                        No Assignments Available
                                    </ThemedText>


                                    <TouchableOpacity onPress={() => router.push("/Logistics/Loads/AddLoads")} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                                    >
                                        <ThemedText style={{ color: '#666' }}>
                                            Create a load to get started. Post it privately or request carriers from the network.
                                        </ThemedText>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={accent}
                                            style={{ marginLeft: 4 }}
                                        />
                                    </TouchableOpacity>


                                    {activeTab && <ThemedText type='tiny' style={styles.emptySubtext}>
                                        Check back later
                                    </ThemedText>}
                                </>
                            )}
                        </View>
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <AccentRingLoader color={accent} size={20} dotSize={4} />

                        ) :
                            (!lastVisible && assignedCargo.length > 0) ?
                                <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                    <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more assigments to Load
                                    </ThemedText>
                                    <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />

                                </View>
                                : null
                    }
                />



            </View>

            <FilterTypeModal
                visible={filterTypeModalVisible}
                onClose={() => setFilterTypeModalVisible(false)}
                onPick={(type) => {
                    setFilterTypeModalVisible(false);
                    setActiveSelectorType(type);
                }}
            />

            <SelectorModal
                visible={!!activeSelectorType}
                type={activeSelectorType}
                scopeId={scopeId}
                onClose={() => setActiveSelectorType(null)}
                onSelect={applyFilter}
            />

            <RejectReasonModal
                visible={rejectModalVisible}
                onClose={() => {
                    setRejectModalVisible(false);
                    setRejectTarget(null);
                }}
                onConfirm={confirmReject}
            />
        </View>
    );
}

export default Jobs;

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },

    buttonContainer: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
        gap: 8,
    },

    statusButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    buttonText: {
        fontSize: 14,
    },

    activeButtonText: {
        color: "white",
    },

    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#455A64",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },

    filterButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },

    filterChipsRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 6,
        gap: 8,
    },

    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#2196F3",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },

    filterChipText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },

    clearFiltersButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    clearFiltersText: {
        color: "#F44336",
        fontSize: 12,
        fontWeight: "700",
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },

    cargoList: {
        flex: 1,
        paddingHorizontal: 20,
    },

    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },

    emptyStateText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#666",
        marginTop: 16,
        marginBottom: 8,
    },

    emptyStateSubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },

    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        gap: 8,
    },

    statusActionButtons: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
        gap: 12,
    },

    statusActionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
        minWidth: 100,
    },

    statusActionButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },

    expandedDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },

    detailSection: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: "rgba(0,0,0,0.02)",
        borderRadius: 8,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2196F3",
        marginBottom: 8,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    sheetTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    filterTypeSheet: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },

    filterTypeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },

    filterTypeRowText: {
        flex: 1,
        fontSize: 16,
    },

    selectorSheet: {
        height: "75%",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 4,
    },

    selectorRow: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },

    selectorRowTitle: {
        fontSize: 15,
        fontWeight: "600",
    },

    selectorRowSub: {
        fontSize: 13,
        color: "#999",
        marginTop: 2,
    },

    rejectSheet: {
        margin: 20,
        borderRadius: 16,
        padding: 20,
    },

    reasonInput: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
        minHeight: 90,
        textAlignVertical: "top",
        fontSize: 14,
    },

    rejectButtonsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    }, emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    }, emptyText: {
        textAlign: 'center'
    }, emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center',
        alignItems: 'center'
    },
});





