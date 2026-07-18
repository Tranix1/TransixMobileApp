import React, { useState } from "react";
import { ThemedText } from "./ThemedText";

import { TouchableOpacity, StyleSheet, View, ActivityIndicator, LayoutAnimation, Platform, UIManager } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
// import FinancePanel from "./FinancePanel";
import { getRelativeTime } from "@/Utilities/getDateRelativeTime";
import { router } from "expo-router";
import { wp, hp } from "@/constants/common";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";
import FinancePanel from "./FinancePanel";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getStatusColor = (status: string) => {
    switch ((status || "").toUpperCase()) {
        case 'IN_TRANSIT': return '#4CAF50';
        case 'PENDING': return '#FF9800';
        case 'COMPLETED': return '#2196F3';
        case 'REJECTED': return '#F44336';
        case 'ACCEPTED': return '#8BC34A';
        default: return '#666';
    }
};

type TripFinanceEntry = {
    id: string;
    entryType: "INCOME" | "EXPENSE";
    amount: number;
    note?: string;
    category?: string;
    milestoneLabel?: string;
    paymentMethod?: string;
    createdAt?: number;
    [key: string]: any;
};

export const FleetTripTaransactionCard = ({ assignmentData }: any) => {
    const backgroundLight = useThemeColor("backgroundLight");
    const background = useThemeColor("background")
    const accent = useThemeColor("accent");
    const textColor = useThemeColor("text")

    const [financeView, setFinanceView] = useState(false);

    // Collapsed by default so many cards can be scanned quickly.
    // Expands to reveal route/truck, customer, driver, assigned-time and trip info.
    const [showDetails, setShowDetails] = useState(false);

    const [showIncomeList, setShowIncomeList] = useState(false);
    const [loadingIncome, setLoadingIncome] = useState(false);
    const [incomeEntries, setIncomeEntries] = useState<TripFinanceEntry[]>([]);
    const [incomeLoaded, setIncomeLoaded] = useState(false);

    const [showExpenseList, setShowExpenseList] = useState(false);
    const [loadingExpense, setLoadingExpense] = useState(false);
    const [expenseEntries, setExpenseEntries] = useState<TripFinanceEntry[]>([]);
    const [expenseLoaded, setExpenseLoaded] = useState(false);

    const totalIncome = assignmentData?.totalIncome ?? 0;
    const totalExpenses = assignmentData?.totalExpenses ?? 0;
    const netAmount = totalIncome - totalExpenses;
    const marginPct = totalIncome > 0 ? Math.round((netAmount / totalIncome) * 100) : 0;
    const ratePerKm = assignmentData?.loadDetails?.ratePerKm;

    const currencySymbol = assignmentData?.loadDetails?.currency === "USD" ? "$" : (assignmentData?.loadDetails?.currency || "$");

    const originCity = assignmentData?.loadDetails?.pickupLocation?.city || assignmentData?.loadDetails?.origin?.city || "Origin";
    const destCity = assignmentData?.loadDetails?.deliveryLocation?.city || assignmentData?.loadDetails?.destination?.city || "Destination";

    const isPrivate = (assignmentData?.visibility || "").toUpperCase() === "PRIVATE";
    const source = assignmentData?.source || "N/A";
    const trackingEnabled = !!assignmentData?.loadDetails?.isTrackingEnabled;

    const customerName = assignmentData?.shipper?.name || assignmentData?.loadDetails?.shipper?.name || "N/A";
    const driverName = assignmentData?.driverDetails?.driverName || "Unassigned";
    const paymentTiming = assignmentData?.loadDetails?.paymentTerms?.timing || "N/A";

    const goToAssignment = () => {
        router.push({
            pathname: "/Assignments/Index",
            params: { id: assignmentData.id },
        });
    };

    const toggleDetails = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowDetails((prev) => !prev);
    };

    const fetchTripEntries = async (entryType: "INCOME" | "EXPENSE") => {
        const fleetId = assignmentData?.fleetId;
        const assignmentId = assignmentData?.id;
        if (!fleetId || !assignmentId) return;

        try {
            if (entryType === "INCOME") setLoadingIncome(true);
            else setLoadingExpense(true);

            const financeRef = collection(db, "fleets", fleetId, "Finance", "Account", "Transactions");
            const q = query(financeRef, where("tripId", "==", assignmentId), where("entryType", "==", entryType));
            const snap = await getDocs(q);

            const results: TripFinanceEntry[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TripFinanceEntry));
            results.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

            if (entryType === "INCOME") {
                setIncomeEntries(results);
                setIncomeLoaded(true);
            } else {
                setExpenseEntries(results);
                setExpenseLoaded(true);
            }
        } catch (error) {
            console.log(`Failed to fetch ${entryType} entries`, error);
        } finally {
            if (entryType === "INCOME") setLoadingIncome(false);
            else setLoadingExpense(false);
        }
    };

    const handleToggleIncome = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const next = !showIncomeList;
        setShowIncomeList(next);
        if (next && !incomeLoaded) fetchTripEntries("INCOME");
    };

    const handleToggleExpense = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const next = !showExpenseList;
        setShowExpenseList(next);
        if (next && !expenseLoaded) fetchTripEntries("EXPENSE");
    };

    const toggleFinanceView = () => {
    setFinanceView(prev => !prev);
    setShowExpenseList(false)
    setShowIncomeList(false)

};

    return (
        <View style={[styles.cargoItem, { borderColor: `${accent}`,}]}>

            {/* HEADER */}
            <View style={{flex :1 , backgroundColor : background}} >
            <View style={styles.cargoHeader }>
               
        <View style={styles.headerLeft}>
    <Ionicons name="cube-outline" size={16} color={accent} />

    <ThemedText style={styles.cargoTitle} numberOfLines={1}>
        {assignmentData?.loadDetails?.productName || 'Load'}
    </ThemedText>

    <Ionicons name="bus-outline" size={16} color={accent} />

    <ThemedText style={styles.cargoTitle} numberOfLines={1}>
        {assignmentData?.truckDetails?.truckName || "N/A"}
    </ThemedText>
</View>

                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(assignmentData.status)}1F` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(assignmentData.status) }]} />
                    <ThemedText style={[styles.statusText, { color: getStatusColor(assignmentData.status) }]}>
                        {(assignmentData.status || "").toUpperCase()}
                    </ThemedText>
                </View>
                </View>
             {/* BADGE ROW */}
                    <View style={styles.badgeRow}>
                        <View style={styles.badgePill}>
                            <Ionicons name={isPrivate ? "lock-closed-outline" : "globe-outline"} size={12} color="#666" />
                            <ThemedText style={[styles.badgePillText]}>{isPrivate ? "Private" : "Public"}</ThemedText>
                        </View>
                        <View style={styles.badgePill}>
                            <Ionicons name="people-outline" size={12} color="#666" />
                            <ThemedText style={[styles.badgePillText ]}>{source}</ThemedText>
                        </View>
                        {trackingEnabled && (
                            <View style={[styles.badgePill, { backgroundColor: `${accent}14` }]}>
                                <Ionicons name="radio-outline" size={12} color={accent} />
                                <ThemedText style={[styles.badgePillText, { color: accent }]}>Tracking</ThemedText>
                            </View>
                        )}
                    </View>
                   </View>     


                   <View style={{backgroundColor:backgroundLight , borderRadius:13 , padding :8  , shadowColor: '#3535353b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 13}}>

            {/* Compact route line always visible for quick scanning */}
            <View style={[styles.truckLine  ]}>
                <Ionicons name="location-outline" size={14} color={accent} />
                <ThemedText style={[styles.routeInlineText,{color : textColor}]} numberOfLines={1}>
                    {originCity} → {destCity}
                </ThemedText>
            </View>

            <View style={[styles.hairline, { backgroundColor: `${accent}22`, marginTop: 10 }]} />

            {/* FINANCIAL OVERVIEW - always visible, this is what matters for fast analysis */}
            <ThemedText style={styles.sectionLabel}>Financial overview</ThemedText>

            <View style={[styles.financeSummaryRow]}>
                <View style={styles.financeSummaryItem}>
                    <ThemedText style={styles.financeSummaryLabel}>Revenue</ThemedText>
                    <ThemedText style={[styles.financeSummaryValue, { color: '#2E7D32' }]}>
                        {currencySymbol}{totalIncome.toLocaleString()}
                    </ThemedText>
                </View>
                <View style={styles.financeSummaryItem}>
                    <ThemedText style={styles.financeSummaryLabel}>Expenses</ThemedText>
                    <ThemedText style={[styles.financeSummaryValue, { color: '#C62828' }]}>
                        {currencySymbol}{totalExpenses.toLocaleString()}
                    </ThemedText>
                </View>
                <View style={styles.financeSummaryItem}>
                    <ThemedText style={styles.financeSummaryLabel}>Profit</ThemedText>
                    <ThemedText style={[styles.financeSummaryValue, { color: netAmount >= 0 ? '#2E7D32' : '#C62828' }]}>
                        {currencySymbol}{netAmount.toLocaleString()}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.marginRow}>
                <ThemedText style={styles.marginText}>
                    Margin <ThemedText style={{ fontWeight: '700', color: netAmount >= 0 ? '#2E7D32' : '#C62828' }}>{marginPct}%</ThemedText>
                </ThemedText>
                {!!ratePerKm && (
                    <ThemedText style={styles.marginText}>
                        Rate/km <ThemedText style={{ fontWeight: '700' }}>{currencySymbol}{Number(ratePerKm).toFixed(2)}</ThemedText>
                    </ThemedText>
                )}
            </View>

            <View style={[styles.hairline, { backgroundColor: `${accent}22`, marginTop: 12 }]} />

            {/* QUICK ACTIONS */}
            <ThemedText style={styles.sectionLabel}>Quick actions</ThemedText>

            <View style={[styles.actionGrid, { borderColor: `${accent}22` }]}>
                <View style={styles.actionGridRow}>
                    <TouchableOpacity
                        style={[styles.gridButton, styles.gridButtonLeft, { borderRightColor: `${accent}22` }]}
                        onPress={handleToggleIncome}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(46,125,50,0.12)' }]}>
                            <Ionicons name="add-circle-outline" size={16} color="#2E7D32" />
                        </View>
                        <ThemedText style={styles.gridButtonText}>Income</ThemedText>
                        <Ionicons name={showIncomeList ? "chevron-up" : "chevron-down"} size={13} color="#999" style={styles.gridChevron} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.gridButton, styles.gridButtonRight]}
                        onPress={handleToggleExpense}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(198,40,40,0.12)' }]}>
                            <Ionicons name="add-circle-outline" size={16} color="#C62828" />
                        </View>
                        <ThemedText style={styles.gridButtonText}>Expense</ThemedText>
                        <Ionicons name={showExpenseList ? "chevron-up" : "chevron-down"} size={13} color="#999" style={styles.gridChevron} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.actionGridRow, { borderTopColor: `${accent}22` }]}>
                    <TouchableOpacity
                        style={[styles.gridButton, styles.gridButtonLeft, styles.gridButtonBottom, { borderRightColor: `${accent}22`, borderTopColor: `${accent}22` }]}
                        onPress={goToAssignment}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.gridIconWrap, { backgroundColor: 'rgba(69,90,100,0.12)' }]}>
                            <Ionicons name="document-text-outline" size={16} color="#455A64" />
                        </View>
                        <ThemedText style={styles.gridButtonText}>Assignment</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.gridButton, styles.gridButtonRight, styles.gridButtonBottom, { borderTopColor: `${accent}22` }]}
                        onPress={toggleFinanceView}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.gridIconWrap, { backgroundColor: `${accent}1F` }]}>
                            <Ionicons name="bar-chart-outline" size={16} color={accent} />
                        </View>
                        <ThemedText style={styles.gridButtonText}>Finance</ThemedText>
                        <Ionicons name={financeView ? "chevron-up" : "chevron-down"} size={13} color="#999" style={styles.gridChevron} />

                    </TouchableOpacity>
                </View>
            </View>

            {/* INCOME */}
            {showIncomeList && (
                <>
                    <View style={[styles.hairline, { backgroundColor: `${accent}22`, marginTop: 14 }]} />
                    <ThemedText style={styles.sectionLabel}>Income</ThemedText>

                    {loadingIncome && <ActivityIndicator size="small" color={accent} style={{ marginVertical: 12 }} />}

                    {!loadingIncome && incomeEntries.length === 0 && (
                        <ThemedText style={styles.entriesEmpty}>No income recorded for this trip yet.</ThemedText>
                    )}

                    {!loadingIncome && incomeEntries.map((entry) => (
                        <View key={entry.id} style={styles.lineRow}>
                            <ThemedText style={styles.lineLabel} numberOfLines={1}>
                                {entry.milestoneLabel || entry.note || "Customer payment"}
                            </ThemedText>
                            <ThemedText style={[styles.lineAmount, { color: '#2E7D32' }]}>
                                +{currencySymbol}{Number(entry.amount).toLocaleString()}
                            </ThemedText>
                        </View>
                    ))}
                </>
            )}

            {/* EXPENSES */}
            {showExpenseList && (
                <>
                    <View style={[styles.hairline, { backgroundColor: `${accent}22`, marginTop: 14 }]} />
                    <ThemedText style={styles.sectionLabel}>Expenses</ThemedText>

                    {loadingExpense && <ActivityIndicator size="small" color={accent} style={{ marginVertical: 12 }} />}

                    {!loadingExpense && expenseEntries.length === 0 && (
                        <ThemedText style={styles.entriesEmpty}>No expenses recorded for this trip yet.</ThemedText>
                    )}

                    {!loadingExpense && expenseEntries.map((entry) => (
                        <View key={entry.id} style={styles.lineRow}>
                            <ThemedText style={styles.lineLabel} numberOfLines={1}>
                                {entry.category || entry.note || "Expense"}
                            </ThemedText>
                            <ThemedText style={[styles.lineAmount, { color: '#C62828' }]}>
                                -{currencySymbol}{Number(entry.amount).toLocaleString()}
                            </ThemedText>
                        </View>
                    ))}
                </>
            )}

            <View style={[styles.hairline, { backgroundColor: `${accent}22`, marginTop: 14 }]} />

            {/* DETAILS TOGGLE - reveals truck, badges, customer/driver, assigned time, trip info */}
            <TouchableOpacity
                style={[styles.detailsToggle, { borderColor: `${accent}22` }]}
                onPress={toggleDetails}
                activeOpacity={0.85}
            >
                <Ionicons name="information-circle-outline" size={15} color={accent} />
                <ThemedText style={[styles.detailsToggleText, { color: accent }]}>
                    {showDetails ? "Hide trip details" : "Show trip details"}
                </ThemedText>
                <Ionicons name={showDetails ? "chevron-up" : "chevron-down"} size={14} color={accent} style={styles.gridChevron} />
            </TouchableOpacity>

            {showDetails && (
                <>
                    <View style={styles.truckLine}>
                        <Ionicons name="car-sport-outline" size={14} color="#888" />
                        <ThemedText style={styles.truckLineText} numberOfLines={1}>
                            {assignmentData?.truckDetails?.truckName || "N/A"}
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.truckSubLine} numberOfLines={1}>
                        {assignmentData?.truckDetails?.truckCapacity || "N/A"} {assignmentData?.truckDetails?.truckType || ""} • Plate {assignmentData?.truckDetails?.numberPlate || "N/A"}
                    </ThemedText>

                   

                    <View style={[styles.hairline, { backgroundColor: `${accent}22` }]} />

                    {/* CUSTOMER / DRIVER */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoGridItem}>
                            <ThemedText style={styles.infoLabel}>Customer</ThemedText>
                            <ThemedText style={styles.infoValue} numberOfLines={1}>{customerName}</ThemedText>
                        </View>
                        <View style={styles.infoGridItem}>
                            <ThemedText style={styles.infoLabel}>Driver</ThemedText>
                            <ThemedText style={styles.infoValue} numberOfLines={1}>{driverName}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={12} color={"#999"} />
                        <ThemedText style={styles.metaText}>
                            Assigned {assignmentData.createdAt ? getRelativeTime(parseInt(assignmentData.createdAt)) : 'N/A'}
                        </ThemedText>
                    </View>

                    <View style={[styles.hairline, { backgroundColor: `${accent}22`, marginTop: 12 }]} />

                    {/* TRIP INFORMATION */}
                    <ThemedText style={styles.sectionLabel}>Trip information</ThemedText>

                    <View style={styles.tripInfoTable}>
                        <View style={styles.tripInfoRow}>
                            <ThemedText style={styles.tripInfoKey}>Payment terms</ThemedText>
                            <ThemedText style={styles.tripInfoVal}>{paymentTiming}</ThemedText>
                        </View>
                        <View style={styles.tripInfoRow}>
                            <ThemedText style={styles.tripInfoKey}>Visibility</ThemedText>
                            <ThemedText style={styles.tripInfoVal}>{isPrivate ? "Private" : "Public"}</ThemedText>
                        </View>
                        <View style={styles.tripInfoRow}>
                            <ThemedText style={styles.tripInfoKey}>Source</ThemedText>
                            <ThemedText style={styles.tripInfoVal}>{source}</ThemedText>
                        </View>
                        <View style={styles.tripInfoRow}>
                            <ThemedText style={styles.tripInfoKey}>Tracking</ThemedText>
                            <ThemedText style={styles.tripInfoVal}>{trackingEnabled ? "Enabled" : "Disabled"}</ThemedText>
                        </View>
                        <View style={styles.tripInfoRow}>
                            <ThemedText style={styles.tripInfoKey}>Truck</ThemedText>
                            <ThemedText style={styles.tripInfoVal}>{assignmentData?.truckDetails?.truckName || "N/A"}</ThemedText>
                        </View>
                        <View style={[styles.tripInfoRow, { borderBottomWidth: 0 }]}>
                            <ThemedText style={styles.tripInfoKey}>Driver</ThemedText>
                            <ThemedText style={styles.tripInfoVal}>{driverName}</ThemedText>
                        </View>
                    </View>
                </>
            )}
            
            

            <FinancePanel
                visible={financeView}
                onClose={() => setFinanceView(false)}
                assignmentId={assignmentData.id}
                rate={assignmentData?.loadDetails?.rate }
                cargoRateCurrency={assignmentData.loadDetails.currency}
                cargoRateModel={assignmentData.loadDetails.model}
                ratePerKm={Number(assignmentData.loadDetails.ratePerKm)}
                paymentTerms={assignmentData.loadDetails.paymentTerms}
            />

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    buttonContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 8 },
    statusButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, minWidth: 80, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
    buttonText: { fontSize: 14 },
    activeButtonText: { color: 'white' },
    filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#455A64', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
    filterButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    filterChipsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 6, gap: 8 },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2196F3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
    filterChipText: { color: 'white', fontSize: 12, fontWeight: '600' },
    clearFiltersButton: { paddingHorizontal: 10, paddingVertical: 6 },
    clearFiltersText: { color: '#F44336', fontSize: 12, fontWeight: '700' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    cargoList: { flex: 1, paddingHorizontal: 20 },
    cargoItem: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
      
         shadowColor: '#3535353b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 13
    },
    cargoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',  },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    cargoTitle: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 5 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
    cargoDetails: { gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 14, flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    emptyStateText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 16, marginBottom: 8 },
    emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, gap: 4 },
    actionButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
    statusActionButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 12 },
    statusActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, gap: 6, minWidth: 100 },
    statusActionButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
    expandedDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
    detailSection: { marginBottom: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', marginBottom: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: 'bold' },
    filterTypeSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
    filterTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    filterTypeRowText: { flex: 1, fontSize: 16 },
    selectorSheet: { height: '75%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
    selectorRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    selectorRowTitle: { fontSize: 15, fontWeight: '600' },
    selectorRowSub: { fontSize: 13, color: '#999', marginTop: 2 },
    rejectSheet: { margin: 20, borderRadius: 16, padding: 20 },
    reasonInput: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: 12, marginTop: 12, marginBottom: 16, minHeight: 90, textAlignVertical: 'top', fontSize: 14 },
    rejectButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    metaText: { marginLeft: 6, fontSize: 11, color: "#999" },
    proofOption: { flexDirection: "row", alignItems: "center", gap: wp(3), paddingVertical: hp(2), borderBottomWidth: 1, borderColor: "rgba(128,128,128,0.2)" },
    imageContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    imageWrapper: { position: "relative" },
    thumbnail: { width: 80, height: 80, borderRadius: 8 },
    removeButton: { position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "red" },
    removeText: { color: "white", fontSize: 18, fontWeight: "bold" },

    truckLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    truckLineText: { fontSize: 13, fontWeight: '600' },
    truckSubLine: { fontSize: 11.5, color: '#888', marginLeft: 20, marginTop: 1 },
    routeInlineText: { fontSize: 12.5, fontWeight: '600', color: '#555' },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4},
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    badgePillText: { fontSize: 10.5, fontWeight: '600', color: '#666' },

    hairline: { height: 1, marginTop: 12, marginBottom: 12 },

    infoGrid: { flexDirection: 'row', gap: 16 },
    infoGridItem: { flex: 1 },
    infoLabel: { fontSize: 10.5, color: '#999', fontWeight: '500', marginBottom: 2 },
    infoValue: { fontSize: 13, fontWeight: '600' },

    metaRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },

    sectionLabel: {
        fontSize: 10.5,
        fontWeight: '700',
        color: '#999',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 10,
    },

    financeSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    financeSummaryItem: { flex: 1, alignItems: 'center' },
    financeSummaryLabel: { fontSize: 11, color: '#888', marginBottom: 3, fontWeight: '500' },
    financeSummaryValue: { fontSize: 17, fontWeight: '700' },

    marginRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
    marginText: { fontSize: 12, color: '#777' },

    actionGrid: { borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
    actionGridRow: { flexDirection: 'row' },
    gridButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.015)' },
    gridButtonLeft: { borderRightWidth: 1 },
    gridButtonRight: {},
    gridButtonBottom: { borderTopWidth: 1 },
    gridIconWrap: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
    gridButtonText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
    gridChevron: { marginLeft: 'auto' },

    entriesEmpty: { fontSize: 12.5, color: '#999', paddingVertical: 4 },

    lineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 7,
    },
    lineLabel: { fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },
    lineAmount: { fontSize: 13, fontWeight: '700' },

    detailsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    detailsToggleText: { fontSize: 12.5, fontWeight: '600' },

    tripInfoTable: { marginTop: 12 },
    tripInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tripInfoKey: { fontSize: 12.5, color: '#888' },
    tripInfoVal: { fontSize: 12.5, fontWeight: '600' },
});
