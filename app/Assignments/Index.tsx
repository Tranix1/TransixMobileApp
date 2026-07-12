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
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, increment, getDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import Heading from '@/components/Heading';
import { wp, hp } from '@/constants/common';
import Input from '@/components/Input';
import { getRelativeTime } from '@/Utilities/getDateRelativeTime';
import { updateDocument, uploadImage } from '@/db/operations';
import * as ImagePicker from "expo-image-picker";
import { takePhoto, selectMultipleImages } from '@/Utilities/photoPickerUtils';
import { Image } from 'expo-image';
import { ImagePickerAsset } from 'expo-image-picker';

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
    accent,
    backgroundLight,
    icon,
}: {
    assignmentId: string;
    fleetId: string | undefined;
    initialNotesCount?: number;
    initialIssuesCount?: number;
    accent: string;
    backgroundLight: string;
    icon: string
}) {
    const { user, currentRole } = useAuth();

    const [activityView, setActivityView] = useState<"NOTE" | "ISSUE" | null>(null);
    const [activityText, setActivityText] = useState("");
    const [assignmentActivity, setAssignmentActivity] = useState<any[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [savingActivity, setSavingActivity] = useState(false);
    const [counts, setCounts] = useState({
        notesCount: initialNotesCount || 0,
        issuesCount: initialIssuesCount || 0,
    });



    const loadActivityCounts = async () => {
        if (!assignmentId) return;

        try {
            const activityDoc = await getDoc(
                doc(db, "assignmentActivity", assignmentId)
            );

            if (activityDoc.exists()) {
                const data = activityDoc.data();

                setCounts({
                    notesCount: data.notesCount || 0,
                    issuesCount: data.issuesCount || 0,
                });
            }
        } catch (error) {
            console.log("Count loading error", error);
        }
    };
    useEffect(() => {
        loadActivityCounts();
    }, [assignmentId]);

    const loadAssignmentActivity = async () => {
        if (!assignmentId) return;

        try {
            setLoadingActivity(true);

            const activityRef = collection(
                db,
                "assignmentActivity",
                assignmentId,
                "activity"
            );

            const snap = await getDocs(
                query(activityRef, orderBy("createdAt", "desc"))
            );

            const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            setAssignmentActivity(data);
        } catch (error) {
            console.log("Activity error", error);
        } finally {
            setLoadingActivity(false);
        }
    };

    const openPanel = (type: "NOTE" | "ISSUE") => {
        setActivityView(type);
        loadAssignmentActivity();
    };

    const saveActivity = async () => {
        if (!activityText.trim() || !activityView || !fleetId) return;

        try {
            setSavingActivity(true);
            const activityCollection = collection(db, "assignmentActivity", assignmentId, "activity");

            // The note/issue itself is the important write — this is the only
            // thing that can fail the save.
            await addDoc(activityCollection, {
                type: activityView, // NOTE or ISSUE
                text: activityText.trim(),

                createdAt: Date.now(),

                createdBy: user?.uid ?? "",
                createdByName: user?.displayName ?? "User",
                createdByRole: currentRole.userRole, // Driver, Broker, Dispatcher, Consignee...
                createdByAccRole: currentRole.accType,
                status: activityView === "ISSUE" ? "OPEN" : null,
            });

            setActivityText("");
            loadAssignmentActivity();
            setCounts((prev) => ({
                notesCount: prev.notesCount + (activityView === "NOTE" ? 1 : 0),
                issuesCount: prev.issuesCount + (activityView === "ISSUE" ? 1 : 0),
            }));

            // Bumping the count on the parent assignment doc is best-effort —
            // if this fails (e.g. the doc path doesn't match), the note has
            // already been saved, so we shouldn't show a "failed" error.
            try {
                await updateDoc(doc(db, "assignmentActivity", assignmentId), {
                    notesCount: increment(activityView === "NOTE" ? 1 : 0),
                    issuesCount: increment(activityView === "ISSUE" ? 1 : 0),
                });
            } catch (countError) {
                console.log("Could not update assignment counts", countError);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to save. Please try again.');
        } finally {
            setSavingActivity(false);
        }
    };
    const resolveIssue = async (activityId: string) => {
        if (!assignmentId) return;

        try {
            await updateDoc(
                doc(
                    db,
                    "assignmentActivity",
                    assignmentId,
                    "activity",
                    activityId
                ),
                {
                    status: "RESOLVED",

                    resolvedBy: user?.uid ?? "",
                    resolvedByName: user?.displayName ?? "User",
                    resolvedByRole: currentRole.userRole,
                    resolvedByAccRole: currentRole.accType,

                    resolvedAt: Date.now(),
                }
            );

            loadAssignmentActivity();

        } catch (error) {
            console.log("Resolve issue error:", error);
        }
    };











    const [issueFilter, setIssueFilter] = useState<"OPEN" | "RESOLVED">("OPEN");



    return (
        <View>
            {/* NOTES + ISSUES TRIGGERS */}
            <View style={{ flexDirection: "row", gap: wp(2), marginTop: wp(2) }}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openPanel("NOTE")}>
                    <Ionicons name="chatbubble-outline" size={16} color={accent} />
                    <ThemedText style={{ color: accent }}>Notes ({counts.notesCount})</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: "#F44336" }]}
                    onPress={() => openPanel("ISSUE")}
                >
                    <Ionicons name="warning-outline" size={16} color="#F44336" />
                    <ThemedText style={{ color: "#F44336" }}>Issues ({counts.issuesCount})</ThemedText>
                </TouchableOpacity>
            </View>

            {/* DROPDOWN PANEL */}
            {activityView && (
                <View style={{
                    marginTop: wp(3),
                    padding: wp(3),
                    borderRadius: wp(3),
                }}>

                    {/* HEADER + CLOSE */}


                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: wp(2),
                        }}
                    >
                        <ThemedText
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: activityView === "ISSUE" ? "#F44336" : accent,
                            }}
                        >
                            {activityView === "ISSUE" ? "Reported Issues" : "Notes"}
                        </ThemedText>

                        <TouchableOpacity onPress={() => setActivityView(null)}>
                            <Ionicons name="close-circle-outline" size={22} color="#777" />
                        </TouchableOpacity>
                    </View>

                    {activityView === "ISSUE" && (
                        <View
                            style={{
                                flexDirection: "row",
                                marginBottom: wp(2),
                                backgroundColor: backgroundLight,
                                borderRadius: wp(2),
                                padding: 4,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setIssueFilter("OPEN")}
                                style={{
                                    flex: 1,
                                    paddingVertical: wp(2),
                                    borderRadius: wp(2),
                                    alignItems: "center",
                                    backgroundColor:
                                        issueFilter === "OPEN" ? "#F44336" : "transparent",
                                }}
                            >
                                <ThemedText
                                    style={{
                                        color: issueFilter === "OPEN" ? "#fff" : "#777",
                                        fontWeight: "700",
                                    }}
                                >
                                    Open
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIssueFilter("RESOLVED")}
                                style={{
                                    flex: 1,
                                    paddingVertical: wp(2),
                                    borderRadius: wp(2),
                                    alignItems: "center",
                                    backgroundColor:
                                        issueFilter === "RESOLVED" ? "#4CAF50" : "transparent",
                                }}
                            >
                                <ThemedText
                                    style={{
                                        color: issueFilter === "RESOLVED" ? "#fff" : "#777",
                                        fontWeight: "700",
                                    }}
                                >
                                    Resolved
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}



                    {/* EXISTING ACTIVITY */}
                    {loadingActivity ? (
                        <ActivityIndicator size="small" color={accent} style={{ marginVertical: wp(2) }} />
                    ) : assignmentActivity.filter((x) => x.type === activityView).length === 0 ? (
                        <ThemedText style={{ fontSize: 12, color: "#999", marginBottom: wp(2) }}>
                            No {activityView === "ISSUE" ? "issues" : "notes"} yet.
                        </ThemedText>
                    ) : (
                        assignmentActivity
                            .filter((item) => {
                                if (activityView === "NOTE") {
                                    return item.type === "NOTE";
                                }

                                if (activityView === "ISSUE") {
                                    return (
                                        item.type === "ISSUE" &&
                                        item.status === issueFilter
                                    );
                                }

                                return false;
                            })
                            .map((item) => (
                                <View
                                    key={item.id}
                                    style={{
                                        padding: wp(3.5),
                                        marginBottom: wp(2.5),
                                        borderRadius: wp(3),
                                        backgroundColor: backgroundLight,
                                        borderWidth: 1,
                                        borderColor: "rgba(128,128,128,0.25)",
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.04,
                                        shadowRadius: 3,
                                        elevation: 1,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: wp(2),
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", flex: 1 }}>
                                            {/* Avatar */}
                                            <View
                                                style={{
                                                    width: wp(9),
                                                    height: wp(9),
                                                    borderRadius: wp(4.5),
                                                    backgroundColor: "#E0E7FF",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginRight: wp(2.5),
                                                }}
                                            >
                                                <ThemedText style={{ fontSize: 13, fontWeight: "700", color: "#4338CA" }}>
                                                    {(item.createdByName || "U").charAt(0).toUpperCase()}
                                                </ThemedText>
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <ThemedText style={{ fontWeight: "700", fontSize: 14 }}>
                                                    {item.createdByName || "Unknown User"}
                                                </ThemedText>

                                                <ThemedText style={{ fontSize: 11, color: "#8A8A8E", marginTop: 2 }}>
                                                    {item.createdByRole || "User"}
                                                    {item.createdByAccRole ? ` • ${item.createdByAccRole}` : ""}
                                                </ThemedText>
                                            </View>
                                        </View>

                                        {item.type === "ISSUE" && (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    paddingHorizontal: wp(2),
                                                    paddingVertical: wp(0.8),
                                                    borderRadius: wp(3),
                                                    backgroundColor: item.status === "OPEN" ? "#FDECEA" : "#E8F5E9",
                                                    marginLeft: wp(2),
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: item.status === "OPEN" ? "#D32F2F" : "#2E7D32",
                                                        marginRight: 5,
                                                    }}
                                                />
                                                <ThemedText
                                                    style={{
                                                        fontSize: 10.5,
                                                        fontWeight: "700",
                                                        color: item.status === "OPEN" ? "#D32F2F" : "#2E7D32",
                                                    }}
                                                >
                                                    {item.status === "OPEN" ? "Open Issue" : "Resolved"}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    <ThemedText style={{ fontSize: 14, lineHeight: 20, marginLeft: wp(11.5) }}>
                                        {item.text}
                                    </ThemedText>

                                    <ThemedText
                                        style={{
                                            marginTop: wp(2),
                                            marginLeft: wp(11.5),
                                            fontSize: 11,
                                            color: "#8A8A8E",
                                        }}
                                    >
                                        {new Date(item.createdAt).toLocaleString()}
                                    </ThemedText>

                                    {/* Resolve action */}
                                    {item.type === "ISSUE" && item.status === "OPEN" && (
                                        <TouchableOpacity
                                            onPress={() => resolveIssue(item.id)}
                                            activeOpacity={0.7}
                                            style={{
                                                marginTop: wp(3),
                                                marginLeft: wp(11.5),
                                                alignSelf: "flex-start",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                paddingHorizontal: wp(3.5),
                                                paddingVertical: wp(1.5),
                                                borderRadius: wp(5),
                                                backgroundColor: "#2E7D32",
                                            }}
                                        >
                                            <ThemedText style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
                                                ✓ Mark as Resolved
                                            </ThemedText>
                                        </TouchableOpacity>
                                    )}

                                    {/* Resolved info panel */}
                                    {item.type === "ISSUE" && item.status === "RESOLVED" && (
                                        <View
                                            style={{
                                                marginTop: wp(3),
                                                marginLeft: wp(11.5),
                                                padding: wp(2.5),
                                                borderRadius: wp(2.5),
                                                backgroundColor: "#F1F8F2",
                                                borderWidth: 1,
                                                borderColor: "#D5EAD7",
                                            }}
                                        >
                                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                                                <ThemedText style={{ fontSize: 13, marginRight: 5 }}>✅</ThemedText>
                                                <ThemedText style={{ fontSize: 12, color: "#2E7D32", fontWeight: "700" }}>
                                                    Resolved by {item.resolvedByName || "User"}
                                                </ThemedText>
                                            </View>

                                            <ThemedText style={{ fontSize: 10.5, color: "#6B8E6D", marginLeft: 18 }}>
                                                {item.resolvedByRole || "User"}
                                                {item.resolvedByAccRole ? ` • ${item.resolvedByAccRole}` : ""}
                                                {item.resolvedAt ? ` • ${new Date(item.resolvedAt).toLocaleString()}` : ""}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            ))
                    )}

                    {/* INPUT */}
                    <Input
                        placeholder={activityView === "ISSUE" ? "Describe issue..." : "Write note..."}
                        value={activityText}
                        onChangeText={setActivityText}
                    />

                    <TouchableOpacity
                        style={[styles.actionButton, { marginTop: wp(2), justifyContent: 'center' }]}
                        disabled={savingActivity || !activityText.trim()}
                        onPress={saveActivity}
                    >
                        <ThemedText style={{ color: activityView === "ISSUE" ? "#F44336" : accent }}>
                            {savingActivity ? "Saving..." : `Add ${activityView === "ISSUE" ? "Issue" : "Note"}`}
                        </ThemedText>
                    </TouchableOpacity>

                </View>
            )}
        </View>
    );
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




                {(proofTargetId === assignmentData.id) && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            justifyContent: 'flex-end',
                            zIndex: 999,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: backgroundLight || '#1c1c1e',
                                padding: wp(6),
                                paddingBottom: 0,
                                borderTopLeftRadius: wp(6),
                                borderTopRightRadius: wp(6),
                            }}
                        >
                            <ThemedText style={{ fontSize: 18, fontWeight: "700", marginBottom: wp(4) }}>
                                Upload Delivery Proof
                            </ThemedText>

                            <TouchableOpacity
                                style={styles.proofOption}
                                onPress={() => {
                                    const targetId = proofTargetId;
                                    setProofTargetId(null);
                                    takePhoto((image) => {
                                        if (!targetId) return;
                                        setProofImages(prev => ({
                                            ...prev,
                                            [targetId]: [...(prev[targetId] || []), image],
                                        }));
                                    });
                                }}
                            >
                                <Ionicons name="camera-outline" size={24} color={accent} />
                                <ThemedText>Take Photo</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.proofOption}
                                onPress={() => {
                                    const targetId = proofTargetId;
                                    setProofTargetId(null);
                                    selectMultipleImages((images) => {
                                        if (!targetId) return;
                                        setProofImages(prev => ({
                                            ...prev,
                                            [targetId]: [...(prev[targetId] || []), ...images],
                                        }));
                                    });
                                }}
                            >
                                <Ionicons name="images-outline" size={24} color={accent} />
                                <ThemedText>Choose from Gallery</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.proofOption, { marginTop: wp(2) }]}
                                onPress={() => setProofTargetId(null)}
                            >
                                <Ionicons name="close-outline" size={24} color="#F44336" />
                                <ThemedText>Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}




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


                 {  <View style={styles.imageContainer}>
                        {(assignmentData.proofOfDelivery?.files || []).map(
                            (image: string, index: number) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.thumbnail}
                                    />
                                </View>
                            )
                        )}
                    </View>}


                    <View style={styles.imageContainer}>
                        {(proofImages[assignmentData.id] || []).map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>

                                <Image
                                    source={{ uri: image.uri }}
                                    style={styles.thumbnail}
                                />

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => {
                                        setProofImages(prev => ({
                                            ...prev,
                                            [assignmentData.id]: prev[assignmentData.id].filter(
                                                (_, i) => i !== index
                                            )
                                        }));
                                    }}
                                >
                                    <ThemedText style={styles.removeText}>
                                        ×
                                    </ThemedText>
                                </TouchableOpacity>

                            </View>
                        ))}
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
                                params: {
                                    cargoId: assignmentData.loadDetails.cargoId || assignmentData.loadDetails.loadId,
                                    cargoVisibilityG: assignmentData.visibility || null
                                },
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
                        flexWrap: 'wrap'
                    }}
                >

                    {/* TRACKER - Everyone */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            console.log("Open tracker");
                        }}
                    >
                        <Ionicons name="navigate-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>
                            Tracker
                        </ThemedText>
                    </TouchableOpacity>



                    {/* DRIVER ACTION */}
                    {currentRole.accType === "driver" && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {

                                if (assignmentData.status === "PENDING") {
                                    startTrip(assignmentData.id);
                                }

                                else if (assignmentData.status === "IN_TRANSIT") {
                                    // uploadProof(assignmentData.id);
                                    // pickProofImage();
                                    setProofTargetId(assignmentData.id);



                                }

                            }}
                        >
                            <Ionicons
                                name={
                                    assignmentData.status === "PENDING"
                                        ? "play-circle-outline"
                                        : assignmentData.status === "IN_TRANSIT"
                                            ? "camera-outline"
                                            : "checkmark-circle-outline"
                                }
                                size={16}
                                color={accent}
                            />

                            <ThemedText style={styles.actionButtonText}>
                                {
                                    assignmentData.status === "PENDING"
                                        ? "Start Trip"
                                        : assignmentData.status === "IN_TRANSIT"
                                            ? "Upload Proof"
                                            : "Completed"
                                }
                            </ThemedText>

                        </TouchableOpacity>
                    )}

                    {(proofImages[assignmentData.id]?.length || 0) > 0 && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            activeOpacity={0.7}
                            onPress={() => finishTrip(assignmentData.id)}
                        >
                            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                            <ThemedText style={styles.actionButtonText}>
                                Complete
                            </ThemedText>
                        </TouchableOpacity>
                    )}


                    {/* OWNER / BROKER CONFIRM */}
                    {(currentRole.accType === "fleet" || currentRole.accType === "brokerage") &&
                        assignmentData.status === "delivery_submitted" && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    console.log("Confirm delivery");
                                }}
                            >
                                <Ionicons
                                    name="checkmark-done-circle-outline"
                                    size={16}
                                    color={accent}
                                />

                                <ThemedText style={styles.actionButtonText}>
                                    Confirm
                                </ThemedText>

                            </TouchableOpacity>
                        )}



                    {/* HANDLE ISSUES */}
                    {(currentRole.accType === "fleet" || currentRole.accType === "brokerage") && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                console.log("Open dispute");
                            }}
                        >
                            <Ionicons
                                name="alert-circle-outline"
                                size={16}
                                color={accent}
                            />

                            <ThemedText style={styles.actionButtonText}>
                                reolve Issues
                            </ThemedText>

                        </TouchableOpacity>
                    )}

                </View>

                {/* NOTES + ISSUES (persisted to Firestore, per-assignment) */}
                <AssignmentActivityPanel
                    assignmentId={assignmentData.id}
                    fleetId={assignmentData?.fleetDetails?.id}
                    initialNotesCount={assignmentData.notesCount}
                    initialIssuesCount={assignmentData.issuesCount}
                    accent={accent}
                    backgroundLight={backgroundLight}
                    icon={icon}
                />

            </View>
        );
    };

    // remove: const [proofModalVisible, setProofModalVisible] = useState(false);
    const [proofTargetId, setProofTargetId] = useState<string | null>(null);
    const [proofImages, setProofImages] = useState<Record<string, ImagePickerAsset[]>>({});


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_TRANSIT': return '#4CAF50';
            case 'PENDING': return '#FF9800';
            case 'COMPLETED': return '#2196F3';
            case 'rejected': return '#F44336';
            case 'accepted': return '#8BC34A';
            default: return '#666';
        }
    };

    const statusTabs: { key: StatusTab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'PENDING', label: 'Pending' },
        { key: 'IN_TRANSIT', label: 'Active' },
        { key: 'COMPLETED', label: 'Completed' },
        { key: 'rejected', label: 'Rejected' },
    ];


    const startTrip = async (assignmentId: string) => {
        try {
            await updateDocument(
                `fleets/${scopeId}/assignments`,
                assignmentId,
                {
                    status: "IN_TRANSIT",

                    updatedAt: Date.now(),
                    updatedBy: user?.uid ?? "",
                    updatedByName: user?.displayName ?? "User",
                    updatedByRole: currentRole?.userRole ?? "",
                    updatedByAcc: currentRole?.accType ?? "",

                    statusHistory: arrayUnion({
                        fromStatus: "PENDING",
                        toStatus: "IN_TRANSIT",

                        changedAt: Date.now(),

                        changedBy: user?.uid ?? "",
                        changedByName: user?.displayName ?? "User",
                        changedByRole: currentRole?.userRole ?? "",
                        changedByAcc: currentRole?.accType ?? "",
                    })
                }
            );

        } catch (error) {
            console.log("Start trip error:", error);
        }
    };




    const [uploadingImageUpdate, setUploadImageUpdate] = useState("")




    const finishTrip = async (assignmentId: string) => {
        try {
            const images = proofImages[assignmentId] || [];

            // Upload all images in parallel
            const uploadedUrls = await Promise.all(
                images.map(image =>
                    uploadImage(
                        image,
                        `assignments/${assignmentId}/proof`,
                        setUploadImageUpdate,
                        "Proof"
                    )
                )
            );

            // Remove any failed uploads
            const proofFiles = uploadedUrls.filter(
                (url): url is string => url !== null
            );

            await updateDocument(
                `fleets/${scopeId}/assignments`,
                assignmentId,
                {
                    status: "COMPLETED",

                    completedAt: Date.now(),
                    completedBy: user?.uid ?? "",
                    completedByName: user?.displayName ?? "User",
                    completedByRole: currentRole?.userRole ?? "",

                    proofOfDelivery: {
                        uploaded: proofFiles.length > 0,
                        files: proofFiles,
                    },

                    updatedAt: Date.now(),
                    updatedBy: user?.uid ?? "",

                    statusHistory: arrayUnion({
                        fromStatus: "IN_TRANSIT",
                        toStatus: "AWAITING_OWNER_CONFIRMATION",

                        changedAt: Date.now(),

                        changedBy: user?.uid ?? "",
                        changedByName: user?.displayName ?? "User",
                        changedByRole: currentRole?.userRole ?? "",
                        changedByAcc: currentRole?.accType ?? "",
                    }),
                }
            );

            // Clear local images for this assignment
            setProofImages(prev => {
                const updated = { ...prev };
                delete updated[assignmentId];
                return updated;
            });

        } catch (error) {
            console.log("Proof upload error:", error);
        }
    };





    const cargoOwnerConfirmation = async (assignmentId: string) => {
        try {
            await updateDocument(
                `fleets/${scopeId}/assignments`,
                assignmentId,
                {
                    status: "IN_TRANSIT",

                    updatedAt: Date.now(),
                    updatedBy: user?.uid ?? "",
                    updatedByName: user?.displayName ?? "User",
                    updatedByRole: currentRole?.userRole ?? "",
                    updatedByAcc: currentRole?.accType ?? "",

                    statusHistory: arrayUnion({
                        fromStatus: "AWAITING_OWNER_CONFIRMATION",
                        toStatus: "COMPLETED",

                        changedAt: Date.now(),

                        changedBy: user?.uid ?? "",
                        changedByName: user?.displayName ?? "User",
                        changedByRole: currentRole?.userRole ?? "",
                        changedByAcc: currentRole?.accType ?? "",
                    })
                }
            );

        } catch (error) {
            console.log("Start trip error:", error);
        }
    };




    return (
        <View style={[styles.container, { backgroundColor: background }]} >

            {/* <CustomHeader pageTitle="Jobs" filterElement={setFilterTypeModalVisible} /> */}
            {currentRole.accType !== "driver" && <Heading page="My Assignments" rightComponent={<View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterTypeModalVisible(true)}
                >
                    <Ionicons name="filter" size={16} color="white" />
                    <ThemedText style={styles.filterButtonText}>Filter</ThemedText>
                </TouchableOpacity>
            </View>} />}

            <CustomHeader pageTitle='Jobs' />

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
                                        : activeTab === 'PENDING' ? 'New assignments will appear here' :
                                            activeTab === 'IN_TRANSIT' ? 'Active jobs will be shown here' :
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
        </View>
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
    proofOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderColor: "rgba(128,128,128,0.2)",
    },
    imageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    imageWrapper: {
        position: "relative",
    },

    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },

    removeButton: {
        position: "absolute",
        top: -8,
        right: -8,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "red",
    },

    removeText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});





