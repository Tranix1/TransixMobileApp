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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import { ThemedText } from '@/components/ThemedText';
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/db/fireBaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import Heading from '@/components/Heading';
import { wp } from '@/constants/common';
import Input from '@/components/Input';
import { getRelativeTime } from '@/Utilities/getDateRelativeTime';

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
// ---------------------------------------------------------------------------

interface CargoItem {
    id: string;
    cargoId: string;
    truckId: string;
    truckName: string;
    status: 'pending' | 'active' | 'completed' | 'accepted' | 'rejected';
    assignedAt: string;
    loadData?: any;
    createdAt: string;
    acceptedAt: string;
    rejectionReason?: string;
    customerId?: string;
}

type StatusTab = 'active' | 'pending' | 'completed' | 'rejected' | 'all';
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
// Main Assignments page (Fleet / Broker only — independent, no driver logic)
// ---------------------------------------------------------------------------
function Jobs() {
    const background = useThemeColor("background");
    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");

    const { currentRole } = useAuth();
    const accType = currentRole?.accType; // 'fleet' | 'brokerage'
    const scopeId = accType === 'brokerage' ? currentRole?.brokerId : currentRole?.fleetId;

    const [assignedCargo, setAssignedCargo] = useState<CargoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<StatusTab>('all');
    const [expandedCargo, setExpandedCargo] = useState<string | null>(null);

    // ---- Filter state ----
    const [filters, setFilters] = useState<FiltersState>({});
    const [filterTypeModalVisible, setFilterTypeModalVisible] = useState(false);
    const [activeSelectorType, setActiveSelectorType] = useState<FilterType | null>(null);

    // ---- Reject flow state ----
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<{ cargoId: string; assignmentDocId: string } | null>(null);

    // NOTE STATE (place at top of component)
    const [noteVisible, setNoteVisible] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [noteType, setNoteType] = useState<"NOTE" | "ISSUE">("NOTE");

    const getAssignmentsPath = useCallback(() => {
        if (accType === 'brokerage') return `brokerages/${scopeId}/assignments`;
        return `fleets/${scopeId}/assignments`;
    }, [accType, scopeId]);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!scopeId) return;

            try {
                setLoading(true);
                const path = getAssignmentsPath();
                const snapshot = await getDocs(collection(db, path));
                const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setAssignedCargo(results as any);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [accType, scopeId]);

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

    const openRejectModal = (cargoId: string, assignmentDocId: string) => {
        setRejectTarget({ cargoId, assignmentDocId });
        setRejectModalVisible(true);
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

    const getFilteredCargo = () => {
        return assignedCargo.filter((item: any) => {
            if (activeTab !== 'all' && item.status !== activeTab) return false;

            if (filters.truck && item.truckId !== filters.truck.id) return false;

            if (filters.driver && item.driverId !== filters.driver.id) return false;

            if (filters.customer) {
                const matchesCustomer =
                    item.customerId === filters.customer.id || item?.coordinator?.id === filters.customer.id;
                if (!matchesCustomer) return false;
            }

            if (filters.load && item.cargoId !== filters.load.id) return false;

            return true;
        });
    };



    const filteredCargo = getFilteredCargo();
    const activeFilterEntries = Object.entries(filters) as [FilterType, FilterValue][];

    const renderCargoItem = (assignmentData: any) => {
        return (
            <View key={assignmentData.id} style={[styles.cargoItem, { backgroundColor: backgroundLight }]}>

                {/* HEADER */}

                <View style={styles.cargoHeader}>
                    <ThemedText style={styles.cargoTitle}>
                        {assignmentData?.loadDetails?.productName || 'Load'} - {assignmentData.truckDetails.truckName}
                    </ThemedText>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignmentData.status) }]}>
                        <ThemedText style={styles.statusText}>
                            {assignmentData.status.toUpperCase()}
                        </ThemedText>
                    </View>
                </View>



                {/* DETAILS */}
                <View style={styles.cargoDetails}>

                    {/* ROUTE */}
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            {assignmentData?.loadDetails?.pickupLocation?.description || "Origin"} →{" "}
                            {assignmentData?.loadDetails?.deliveryLocation?.description || "Destination"}
                        </ThemedText>
                    </View>

                    {/* TRUCK */}
                    <View style={styles.detailRow}>
                        <Ionicons name="car-sport-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText} numberOfLines={1}>
                            {assignmentData?.truckDetails?.truckCapacity || "N/A"} •{" "}
                            {assignmentData?.truckDetails?.truckType || "N/A"} • Plate:{" "}
                            {assignmentData?.truckDetails?.numberPlate || "N/A"}
                        </ThemedText>
                    </View>

                    {/* DRIVER */}
                    <View style={styles.detailRow}>
                        <Ionicons name="person-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText} numberOfLines={1}>
                            {assignmentData?.driverDetails?.driverName || "Unassigned"} •{" "}
                            {assignmentData?.driverDetails?.driverPhone || "No phone"}
                        </ThemedText>
                    </View>

                    {/* SHIPPER */}
                    {assignmentData?.shipper?.name && (
                        <View style={styles.detailRow}>
                            <Ionicons name="business-outline" size={16} color={accent} />
                            <ThemedText style={styles.detailText} numberOfLines={1}>
                                {assignmentData.shipper.name} •{" "}
                                {assignmentData.shipper.phone || "N/A"}
                            </ThemedText>
                        </View>
                    )}

                    {/* LOADING DATE */}
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Loading:{" "}
                            {assignmentData?.loadDetails?.pickupDate
                                ? new Date(assignmentData.loadDetails.pickupDate).toLocaleDateString()
                                : "TBD"}
                        </ThemedText>
                    </View>

                    {/* DELIVERY DATE */}
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Delivery:{" "}
                            {assignmentData?.loadDetails?.deliveryDate
                                ? new Date(assignmentData.loadDetails.deliveryDate).toLocaleDateString()
                                : "TBD"}
                        </ThemedText>
                    </View>

                    {/* CREATED */}

                    <View style={styles.metaRow}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={"#777"}
                        />
                        <ThemedText style={{ marginLeft: 6, fontSize: 12, color: "#777", }}>
                            Assigned {assignmentData.createdAt ? getRelativeTime(parseInt(assignmentData.createdAt)) : 'N/A'}
                        </ThemedText>
                    </View>

                </View>

                {/* ACTION BUTTONS */}
                <View style={{
                    flexDirection: 'row',
                    gap: wp(2),
                    marginTop: wp(2),
                }}>

                    {/* DRIVER */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => { }}
                    >
                        <Ionicons name="person-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>Driver</ThemedText>
                    </TouchableOpacity>

                    {/* LOAD */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            router.push({
                                pathname: "/Logistics/Loads/Index",
                                params: { itemId: assignmentData.loadDetails.cargoId ||assignmentData.loadDetails.loadId },
                            });
                        }}
                    >
                        <Ionicons name="cube-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>Load</ThemedText>
                    </TouchableOpacity>

                    {/* TRUCK */}
                    <TouchableOpacity
                        style={styles.actionButton}

                        onPress={() => router.push({
                            pathname: "/Logistics/Trucks/TruckDetails",
                            params: { truckid: assignmentData.truckDetails.truckId, dspDetails: "false", fleetId: assignmentData.fleetDetails.id || undefined }
                        })}


                    >
                        <Ionicons name="car-sport-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>Truck</ThemedText>
                    </TouchableOpacity>

                </View>

                {/* OPERATION ACTIONS */}
                <View
                    style={{
                        flexDirection: 'row',
                        gap: wp(2),
                        marginTop: wp(2),
                    }}
                >

                    {/* VIEW TRACKER */}
                    <TouchableOpacity
                        style={styles.actionButton}

                    >
                        <Ionicons name="navigate-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>
                            Tracker
                        </ThemedText>
                    </TouchableOpacity>

                    {/* PROOF OF DELIVERY */}
                    <TouchableOpacity
                        style={styles.actionButton}

                    >
                        <Ionicons name="camera-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>
                            Proof dispute , handle dispute issuehandling
                        </ThemedText>
                    </TouchableOpacity>

                    {/* CONFIRM DELIVERY */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            // confirm logic here
                            console.log("Confirm delivery", assignmentData.id);
                        }}
                    >
                        <Ionicons name="checkmark-done-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>
                            Confirm
                        </ThemedText>
                    </TouchableOpacity>

                </View>



                {/* NOTES + ISSUE TRIGGER */}
                <TouchableOpacity
                    style={{
                        marginTop: wp(2),
                        padding: wp(2),
                        borderRadius: wp(3),
                        borderWidth: 1,
                        borderColor: accent,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: wp(1),
                    }}
                    onPress={() => setNoteVisible(true)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={accent} />
                    <ThemedText style={{ color: accent }}>
                        Add Note / Issue
                    </ThemedText>
                </TouchableOpacity>

                {/* SIMPLE NOTE MODAL */}
                {noteVisible && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: backgroundLight,
                        padding: wp(4),
                        borderTopLeftRadius: wp(5),
                        borderTopRightRadius: wp(5),
                    }}>

                        {/* TYPE SELECTOR */}
                        <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: wp(2) }}>

                            <TouchableOpacity onPress={() => setNoteType("NOTE")}>
                                <ThemedText style={{ color: noteType === "NOTE" ? accent : "#999" }}>
                                    Note
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setNoteType("ISSUE")}>
                                <ThemedText style={{ color: noteType === "ISSUE" ? "#F44336" : "#999" }}>
                                    Issue
                                </ThemedText>
                            </TouchableOpacity>

                        </View>

                        {/* INPUT */}
                        <Input
                            placeholder={noteType === "ISSUE" ? "Report issue..." : "Write note..."}
                            value={noteText}
                            onChangeText={setNoteText}
                        />

                        {/* ACTIONS */}
                        <View style={{ flexDirection: 'row', gap: wp(2), marginTop: wp(2) }}>

                            <TouchableOpacity
                                style={[styles.actionButton, { flex: 1 }]}
                                onPress={() => {
                                    setNoteVisible(false);
                                    setNoteText("");
                                }}
                            >
                                <ThemedText style={{ color: accent }}>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { flex: 1, borderColor: noteType === "ISSUE" ? "#F44336" : accent }]}
                                onPress={() => {
                                    const payload = {
                                        text: noteText,
                                        type: noteType,
                                        createdAt: Date.now(),
                                        assignmentId: assignmentData.id,
                                    };

                                    // SAVE TO DB HERE
                                    console.log(payload);

                                    setNoteVisible(false);
                                    setNoteText("");
                                }}
                            >
                                <ThemedText style={{ color: noteType === "ISSUE" ? "#F44336" : accent }}>
                                    Save
                                </ThemedText>
                            </TouchableOpacity>

                        </View>

                    </View>
                )}

            </View>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'completed': return '#2196F3';
            case 'rejected': return '#F44336';
            case 'accepted': return '#8BC34A';
            default: return '#666';
        }
    };

    const statusTabs: { key: StatusTab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'active', label: 'Active' },
        { key: 'completed', label: 'Completed' },
        { key: 'rejected', label: 'Rejected' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
            {/* <CustomHeader pageTitle="Jobs" filterElement={setFilterTypeModalVisible} /> */}
            <Heading page="My Assignments" rightComponent={<View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterTypeModalVisible(true)}
                >
                    <Ionicons name="filter" size={16} color="white" />
                    <ThemedText style={styles.filterButtonText}>Filter</ThemedText>
                </TouchableOpacity>
            </View>} />

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
                                    style={[styles.statusButton, activeTab === tab.key && { backgroundColor: accent, borderWidth: 0 }]}
                                    onPress={() => setActiveTab(tab.key)}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[styles.buttonText, activeTab === tab.key && styles.activeButtonText]}
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
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={accent} />
                        <ThemedText style={styles.loadingText}>Loading jobs...</ThemedText>
                    </View>
                ) : (
                    <ScrollView style={styles.cargoList} showsVerticalScrollIndicator={false}>
                        {filteredCargo.length > 0 ? (
                            filteredCargo.map(renderCargoItem)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={64} color="#ccc" />
                                <ThemedText style={styles.emptyStateText}>
                                    No {activeTab === 'all' ? '' : activeTab} jobs found
                                </ThemedText>
                                <ThemedText style={styles.emptyStateSubtext}>
                                    {activeFilterEntries.length > 0
                                        ? 'Try adjusting or clearing your filters'
                                        : activeTab === 'pending' ? 'New assignments will appear here' :
                                            activeTab === 'active' ? 'Active jobs will be shown here' :
                                                activeTab === 'rejected' ? 'Rejected jobs will appear here' :
                                                    'Completed jobs will appear here'}
                                </ThemedText>
                            </View>
                        )}
                    </ScrollView>
                )}
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
        </SafeAreaView>
    );
}

export default Jobs;

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    buttonContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
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
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    buttonText: { fontSize: 14 },
    activeButtonText: { color: 'white' },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#455A64',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    filterButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    filterChipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 6,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#2196F3',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    filterChipText: { color: 'white', fontSize: 12, fontWeight: '600' },
    clearFiltersButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    clearFiltersText: { color: '#F44336', fontSize: 12, fontWeight: '700' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    cargoList: { flex: 1, paddingHorizontal: 20 },
    cargoItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cargoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cargoTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    cargoDetails: { gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 14, flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyStateText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 16, marginBottom: 8 },
    emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8 },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },
    actionButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
    statusActionButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 12 },
    statusActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
        minWidth: 100,
    },
    statusActionButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    expandedDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
    detailSection: { marginBottom: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', marginBottom: 8 },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sheetTitle: { fontSize: 18, fontWeight: 'bold' },

    filterTypeSheet: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    filterTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filterTypeRowText: { flex: 1, fontSize: 16 },

    selectorSheet: {
        height: '75%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
    selectorRow: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    selectorRowTitle: { fontSize: 15, fontWeight: '600' },
    selectorRowSub: { fontSize: 13, color: '#999', marginTop: 2 },

    rejectSheet: {
        margin: 20,
        borderRadius: 16,
        padding: 20,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
        minHeight: 90,
        textAlignVertical: 'top',
        fontSize: 14,
    },
    rejectButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },


    metaRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    metaText: {
        marginLeft: 6,
        fontSize: 12,
        color: "#777",
    },
});
