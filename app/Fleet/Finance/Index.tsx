/**
 * FleetFinanceScreen.tsx
 *
 * Fleet/broker-level finance management screen.
 *
 * This is the "manage it all" screen that sits ABOVE your existing
 * per-assignment FinancePanel.tsx. Where FinancePanel records money
 * for ONE assignment/trip, this screen manages the fleet as a whole:
 *
 *   - Trip Expenses   -> quick day-to-day trip costs (Tolls, Parking, Police,
 *                        Border Fees, Accommodation, Loading, Other)
 *   - Categories       -> the 12 fleet-wide cost/income buckets, each with
 *                        its own subcategories, tagged Weekly / Monthly / One-off
 *   - Tyres            -> tracks tyre purchase date vs expected life (default
 *                        24 months when bought new) so you know what's due
 *   - Driver Pay        -> per-driver toggle: paid Monthly or Per Trip
 *   - Overview          -> weekly/monthly/all-time totals + breakdown by category
 *
 * USAGE:
 *   import FleetFinanceScreen from "./FleetFinanceScreen";
 *
 *   <FleetFinanceScreen fleetId={fleetId} />
 *
 * ⚠️ ADJUST THESE IMPORTS to match your project's actual paths (same 6 as
 * FinancePanel.tsx, plus SafeAreaView if you use one):
 *   - db, ThemedText, Input, wp, useAuth
 *
 * Firestore layout used by this screen:
 *   fleetFinance/{fleetId}/entries/{entryId}     -> FleetFinanceEntry
 *   fleetFinance/{fleetId}/tyres/{tyreId}        -> TyreRecord
 *   fleetFinance/{fleetId}/driverPay/{driverId}  -> DriverPaySetting
 *
 * This is separate from the assignmentFinance/{assignmentId}/entries
 * collection your existing FinancePanel.tsx already uses — the two can
 * live side by side. If you'd rather have Trip Expenses logged here also
 * show up on a specific assignment, just pass a tripRef into addFleetEntry.
 */

import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Platform,ToastAndroid,
    FlatList,
    RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    doc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";

// ---- ADJUST THESE IMPORTS TO MATCH YOUR PROJECT ----
import { db } from "@/db/fireBaseConfig";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { wp } from "@/constants/common";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import CustomHeader from "@/components/CustomHeader";
import Heading from "@/components/Heading";
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchDocuments } from "@/db/operations";
import AccentRingLoader from "@/components/AccentRingLoader";
import { FleetTripTaransactionCard } from "@/components/fleetTripTaransactionCard";
import { hp } from "@/constants/common";

// ------------------------------------------------------
//
// ⚠️ NEW DEPENDENCY for the tyre purchase-date picker below:
//   expo install @react-native-community/datetimepicker
// (ships fine with Expo Go / a dev client — no extra native config needed)

// ============================================================
// TYPES
// ============================================================

type TopTab = "OVERVIEW" | "Fleet_Operations" | "CATEGORIES" | "TYRES" | "DRIVER_PAY";
type Recurrence = "WEEKLY" | "MONTHLY" | "ONE_OFF";
type PayFrequency = "MONTHLY" | "PER_TRIP";
type EntryFlow = "COST" | "INCOME"; // Income category is the only INCOME flow

interface CustomField {
    label: string;
    value: string;
}

interface CategoryDef {
    key: string;
    label: string;
    icon: any;
    flow: EntryFlow;
    subcategories: string[];
    allowCustomSubcategory?: boolean;
}

interface FleetFinanceEntry {
    id: string;
    scope: "FLEET" | "TRIP";
    categoryKey: string;
    categoryLabel: string;
    subcategory: string;
    customFields?: CustomField[];
    amount: number;
    flow: EntryFlow;
    recurrence?: Recurrence; // FLEET scope only
    tripRef?: string; // free-text trip / assignment reference (TRIP scope)
    vehicleRef?: string;
    note?: string;
    createdAt: number;
    createdBy: string;
    createdByName: string;
    createdByRole: string;
}

interface TyreRecord {
    id: string;
    vehicleRef: string;
    position?: string; // e.g. "Front Left"
    purchaseDate: number; // timestamp, day of purchase (new)
    cost: number;
    expectedLifeMonths: number; // default 24
    note?: string;
    createdAt: number;
}

interface DriverPaySetting {
    id: string; // == driverName slug for now, or driverId if you wire one in
    driverName: string;
    payFrequency: PayFrequency;
    updatedAt: number;
}

// ============================================================
// CATEGORY STRUCTURE (the 12 fleet-wide buckets)
// ============================================================

const CATEGORIES: CategoryDef[] = [
    {
        key: "FUEL",
        label: "Fuel",
        icon: "flame-outline",
        flow: "COST",
        subcategories: ["Fuel Purchase", "Fuel Top-up", "Fuel Adjustment", "Fuel Theft"],
    },
    {
        key: "DRIVER_COSTS",
        label: "Driver Costs",
        icon: "person-outline",
        flow: "COST",
        subcategories: ["Salary / Wage", "Per-Trip Pay", "Bonus", "Advance", "Deduction"],
    },
    {
        key: "MAINTENANCE",
        label: "Maintenance",
        icon: "construct-outline",
        flow: "COST",
        subcategories: ["Service", "Repair", "Parts", "Labour"],
    },
    {
        key: "TYRES",
        label: "Tyres",
        icon: "disc-outline",
        flow: "COST",
        subcategories: ["Tyre Purchase", "Tyre Replacement", "Tyre Repair", "Tyre Rotation"],
    },
    {
        key: "LICENCES",
        label: "Licences & Compliance",
        icon: "document-text-outline",
        flow: "COST",
        subcategories: ["Vehicle Licence", "Route Permit", "Fitness / COF", "Permit Renewal", "Other"],
    },
    {
        key: "INSURANCE",
        label: "Insurance",
        icon: "shield-checkmark-outline",
        flow: "COST",
        subcategories: ["Premium", "Claim Payout", "Excess Payment"],
    },
    {
        key: "FINANCING",
        label: "Financing",
        icon: "cash-outline",
        flow: "COST",
        subcategories: ["Loan Repayment", "Interest", "Lease Payment", "Bank Charges"],
    },
    {
        key: "OVERHEADS",
        label: "Fleet Overheads",
        icon: "business-outline",
        flow: "COST",
        subcategories: ["Office Rent", "Utilities", "Admin Salaries", "Communication", "Software / Tools"],
    },
    {
        key: "DEPRECIATION",
        label: "Depreciation & Wear",
        icon: "trending-down-outline",
        flow: "COST",
        subcategories: ["Vehicle Depreciation", "General Wear & Tear"],
    },
    {
        key: "UNEXPECTED",
        label: "Unexpected Costs",
        icon: "alert-circle-outline",
        flow: "COST",
        subcategories: ["Breakdown", "Accident", "Fine / Traffic Ticket", "Towing", "Other"],
    },
    {
        key: "INCOME",
        label: "Income",
        icon: "trending-up-outline",
        flow: "INCOME",
        subcategories: ["Trip Income", "Contract Income", "Broker Commission", "Other Income"],
    },
    {
        key: "OTHER",
        label: "Other (Custom)",
        icon: "add-circle-outline",
        flow: "COST",
        subcategories: [],
        allowCustomSubcategory: true,
    },
];

const TRIP_SUBCATEGORIES = [
    "Tolls",
    "Parking",
    "Police",
    "Border Fees",
    "Accommodation",
    "Loading",
    "Other",
];

const RECURRENCE_OPTIONS: { key: Recurrence; label: string }[] = [
    { key: "WEEKLY", label: "Weekly" },
    { key: "MONTHLY", label: "Monthly" },
    { key: "ONE_OFF", label: "One-off" },
];

const DEFAULT_TYRE_LIFE_MONTHS = 24;

// ============================================================
// DATE HELPERS
// ============================================================

function startOfWeek(d: Date) {
    const date = new Date(d);
    const day = date.getDay(); // 0 = Sunday
    const diff = (day === 0 ? -6 : 1) - day; // Monday as start
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

function startOfMonth(d: Date) {
    const date = new Date(d.getFullYear(), d.getMonth(), 1);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

function monthsBetween(fromTs: number, toTs: number) {
    const from = new Date(fromTs);
    const to = new Date(toTs);
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) months -= 1;
    return Math.max(months, 0);
}

// ============================================================
// COMPONENT
// ============================================================



export default function FleetFinanceScreen() {
    const { user } = useAuth();
    const { currentRole } = useAuth();
    const backgroundLight = useThemeColor("backgroundLight")
    const icon = useThemeColor("icon")
    const accent = useThemeColor("accent")
    const background = useThemeColor("background")
    const textColor = useThemeColor("text")

    const fleetId = currentRole.organizationId|| currentRole.fleetId || ""

    const [activeTab, setActiveTab] = useState<TopTab>("OVERVIEW");

    // ---------- entries ----------
    const [entries, setEntries] = useState<FleetFinanceEntry[]>([]);
    const [assignments , setAssigments ] = useState([])
    const [loadingEntries, setLoadingEntries] = useState(false);
    const [savingEntry, setSavingEntry] = useState(false);
const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [fleetOpererations, setFleetOperation] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)






    // ---------- tyres ----------
    const [tyres, setTyres] = useState<TyreRecord[]>([]);
    const [loadingTyres, setLoadingTyres] = useState(false);
    const [savingTyre, setSavingTyre] = useState(false);

    // ---------- driver pay ----------
    const [driverPay, setDriverPay] = useState<DriverPaySetting[]>([]);
    const [loadingDrivers, setLoadingDrivers] = useState(false);

    // ---------- shared entry form state ----------
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("FUEL");
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
    const [customSubcategoryName, setCustomSubcategoryName] = useState("");
    const [recurrence, setRecurrence] = useState<Recurrence>("MONTHLY");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [vehicleRef, setVehicleRef] = useState("");
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    // ---------- trip expense form state ----------
    const [tripSubcategory, setTripSubcategory] = useState<string>("Tolls");
    const [tripAmount, setTripAmount] = useState("");
    const [tripNote, setTripNote] = useState("");
    const [tripRef, setTripRef] = useState("");

    // ---------- tyre form state ----------
    const [tyreVehicleRef, setTyreVehicleRef] = useState("");
    const [tyrePosition, setTyrePosition] = useState("");
    const [tyrePurchaseDate, setTyrePurchaseDate] = useState<Date | null>(null);
    const [showTyreDatePicker, setShowTyreDatePicker] = useState(false);
    const [tyreCost, setTyreCost] = useState("");
    const [tyreLifeMonths, setTyreLifeMonths] = useState(String(DEFAULT_TYRE_LIFE_MONTHS));

    const onTyreDateChange = (event: DateTimePickerEvent, selected?: Date) => {
        // Android closes the picker itself after a pick/dismiss; iOS stays open
        // inline, so we only auto-hide on Android.
        if (Platform.OS === "android") setShowTyreDatePicker(false);
        if (event.type === "dismissed") return;
        if (selected) setTyrePurchaseDate(selected);
    };

    // ---------- driver pay form state ----------
    const [newDriverName, setNewDriverName] = useState("");

    // ---------- overview period ----------
    const [period, setPeriod] = useState<"Today"| "WEEK" | "MONTH" | "ALL">("Today");

    // ============================================================
    // LOADERS
    // ============================================================


const onRefresh = async () => {
        try {
            setRefreshing(true);
            setError(null);
            await LoadFleetOperations();
        } catch (error) {
            console.error('Error refreshing loads:', error);
            setError('Failed to refresh loads. Please try again.');
            ToastAndroid.show('Failed to refresh loads', ToastAndroid.SHORT);
        } finally {
            setRefreshing(false);
        }
    };




  const LoadFleetOperations = async () => {
        try {
            setIsLoading(true)
            setError(null)


            let filters: any[] = [];
            let collectionName: string | null = null;

            if(currentRole.accType==="fleet"){
            collectionName= `fleets/${currentRole.organizationId}/assignments`;
            }
          


            // Safety
            if (!collectionName) {
                console.log("No cargo source found");
                return [];
            }


            const maOperation = await fetchDocuments(
                collectionName,
                50,
                undefined,
                filters
            );



            if (maOperation.data.length) {
                setFleetOperation(maOperation.data as [])
                console.log('Loads fetched:', maOperation.data);
                setLastVisible(maOperation.lastVisible)
            } else {
                setFleetOperation([])
                setLastVisible(null)
            }
        } catch (error) {
            console.error('Error loading loads:', error)
            setError('Failed to load loads. Please try again.')
            ToastAndroid.show('Failed to load loads', ToastAndroid.SHORT)
        } finally {
            setIsLoading(false)
        }
    }





    const loadMoreFleetOperations = async () => {
            if (loadingMore || !lastVisible) return;
    
            try {
                setLoadingMore(true);
                setError(null);
    
                let filters: any[] = [];
                let collectionName: string | null = null;
    
    
                // Apply same filters as in LoadTructs for pagination
                if(currentRole.accType==="fleet"){
            collectionName= `fleets/${currentRole.organizationId}/assignments`;
            }
          
       // Safety
            if (!collectionName) {
                console.log("No cargo source found");
                return [];
            }

    
                const result = await fetchDocuments(collectionName, 10, lastVisible, filters);
    
                if (result) {
                    setFleetOperation([...fleetOpererations, ...result.data as []]);
                    setLastVisible(result.lastVisible);
                }
            } catch (error) {
                console.error('Error loading more loads:', error);
                setError('Failed to load more loads. Please try again.');
                ToastAndroid.show('Failed to load more loads', ToastAndroid.SHORT);
            } finally {
                setLoadingMore(false);
            }
        };





    const loadEntries = async () => {
        if (!fleetId) return;
        try {
            setLoadingEntries(true);
            const ref = collection(db, "fleetFinance", fleetId, "entries");
            const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
            setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetFinanceEntry)));
        } catch (error) {
            console.log("Fleet finance load error", error);
        } finally {
            setLoadingEntries(false);
        }
    };







    const loadTyres = async () => {
        if (!fleetId) return;
        try {
            setLoadingTyres(true);
            const ref = collection(db, "fleetFinance", fleetId, "tyres");
            const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
            setTyres(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TyreRecord)));
        } catch (error) {
            console.log("Tyre load error", error);
        } finally {
            setLoadingTyres(false);
        }
    };

    const loadDriverPay = async () => {
        if (!fleetId) return;
        try {
            setLoadingDrivers(true);
            const ref = collection(db, "fleetFinance", fleetId, "driverPay");
            const snap = await getDocs(query(ref, orderBy("updatedAt", "desc")));
            setDriverPay(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DriverPaySetting)));
        } catch (error) {
            console.log("Driver pay load error", error);
        } finally {
            setLoadingDrivers(false);
        }
    };

    useEffect(() => {
        LoadFleetOperations()
        loadEntries();
        loadTyres();
        loadDriverPay();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fleetId]);

    // ============================================================
    // CUSTOM FIELD HELPERS (for "Other (Custom)" category)
    // ============================================================

    const addCustomField = () => {
        if (customFields.length >= 4) return;
        setCustomFields((prev) => [...prev, { label: "", value: "" }]);
    };
    const updateCustomField = (i: number, key: "label" | "value", val: string) => {
        setCustomFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
    };
    const removeCustomField = (i: number) => {
        setCustomFields((prev) => prev.filter((_, idx) => idx !== i));
    };

    // ============================================================
    // SAVE: fleet category entry
    // ============================================================

    const saveFleetEntry = async () => {
        const numericAmount = parseFloat(amount);
        const category = CATEGORIES.find((c) => c.key === selectedCategoryKey);
        if (!numericAmount || numericAmount <= 0 || !fleetId || !category) return;

        const subcategoryName = category.allowCustomSubcategory
            ? customSubcategoryName.trim() || "Custom"
            : selectedSubcategory;

        if (!category.allowCustomSubcategory && !subcategoryName) {
            Alert.alert("Pick a subcategory", "Choose what this entry is for before saving.");
            return;
        }

        try {
            setSavingEntry(true);
            const ref = collection(db, "fleetFinance", fleetId, "entries");
            const payload: Omit<FleetFinanceEntry, "id"> = {
                scope: "FLEET",
                categoryKey: category.key,
                categoryLabel: category.label,
                subcategory: subcategoryName,
                amount: numericAmount,
                flow: category.flow,
                recurrence,
                vehicleRef: vehicleRef.trim() || undefined,
                note: note.trim() || undefined,
                createdAt: Date.now(),
                createdBy: user?.uid ?? "",
                createdByName: user?.displayName ?? "User",
                createdByRole: currentRole?.userRole ?? "User",
            };
            if (category.allowCustomSubcategory) {
                payload.customFields = customFields.filter((f) => f.label.trim() && f.value.trim());
            }

            await addDoc(ref, payload);

            setAmount("");
            setNote("");
            setVehicleRef("");
            setCustomFields([]);
            setCustomSubcategoryName("");
            loadEntries();
        } catch (error) {
            console.log("Fleet finance save error", error);
            Alert.alert("Error", "Failed to save entry. Please try again.");
        } finally {
            setSavingEntry(false);
        }
    };

  
    // ============================================================
    // DELETE entry
    // ============================================================

    const deleteEntry = async (entryId: string) => {
        if (!fleetId) return;
        try {
            await deleteDoc(doc(db, "fleetFinance", fleetId, "entries", entryId));
            setEntries((prev) => prev.filter((e) => e.id !== entryId));
        } catch (error) {
            console.log("Delete entry error", error);
            Alert.alert("Error", "Failed to delete entry.");
        }
    };

    // ============================================================
    // TYRES: save / delete / status
    // ============================================================

    const saveTyre = async () => {
        const numericCost = parseFloat(tyreCost) || 0;
        const lifeMonths = parseInt(tyreLifeMonths, 10) || DEFAULT_TYRE_LIFE_MONTHS;

        if (!fleetId || !tyreVehicleRef.trim() || !tyrePurchaseDate) {
            Alert.alert("Missing info", "Vehicle and a purchase date are required.");
            return;
        }

        try {
            setSavingTyre(true);
            const ref = collection(db, "fleetFinance", fleetId, "tyres");
            const payload: Omit<TyreRecord, "id"> = {
                vehicleRef: tyreVehicleRef.trim(),
                position: tyrePosition.trim() || undefined,
                purchaseDate: tyrePurchaseDate.getTime(),
                cost: numericCost,
                expectedLifeMonths: lifeMonths,
                createdAt: Date.now(),
            };
            await addDoc(ref, payload);

            setTyreVehicleRef("");
            setTyrePosition("");
            setTyrePurchaseDate(null);
            setTyreCost("");
            setTyreLifeMonths(String(DEFAULT_TYRE_LIFE_MONTHS));
            loadTyres();
        } catch (error) {
            console.log("Tyre save error", error);
            Alert.alert("Error", "Failed to save tyre record.");
        } finally {
            setSavingTyre(false);
        }
    };

    const deleteTyre = async (tyreId: string) => {
        if (!fleetId) return;
        try {
            await deleteDoc(doc(db, "fleetFinance", fleetId, "tyres", tyreId));
            setTyres((prev) => prev.filter((t) => t.id !== tyreId));
        } catch (error) {
            console.log("Delete tyre error", error);
            Alert.alert("Error", "Failed to delete tyre record.");
        }
    };

    const tyreStatus = (t: TyreRecord) => {
        const ageMonths = monthsBetween(t.purchaseDate, Date.now());
        const pctUsed = Math.min((ageMonths / t.expectedLifeMonths) * 100, 999);
        let status: "GOOD" | "DUE_SOON" | "OVERDUE" = "GOOD";
        if (pctUsed >= 100) status = "OVERDUE";
        else if (pctUsed >= 75) status = "DUE_SOON";
        return { ageMonths, pctUsed: Math.min(pctUsed, 100), status };
    };

    // ============================================================
    // DRIVER PAY: save toggle
    // ============================================================

    const addDriver = async () => {
        if (!fleetId || !newDriverName.trim()) return;
        try {
            const slug = newDriverName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
            await setDoc(doc(db, "fleetFinance", fleetId, "driverPay", slug), {
                driverName: newDriverName.trim(),
                payFrequency: "PER_TRIP",
                updatedAt: Date.now(),
            } as Omit<DriverPaySetting, "id">);
            setNewDriverName("");
            loadDriverPay();
        } catch (error) {
            console.log("Add driver error", error);
            Alert.alert("Error", "Failed to add driver.");
        }
    };

    const setDriverFrequency = async (driverId: string, freq: PayFrequency) => {
        if (!fleetId) return;
        // optimistic UI update
        setDriverPay((prev) =>
            prev.map((d) => (d.id === driverId ? { ...d, payFrequency: freq } : d))
        );
        try {
            const target = driverPay.find((d) => d.id === driverId);
            await setDoc(
                doc(db, "fleetFinance", fleetId, "driverPay", driverId),
                {
                    driverName: target?.driverName ?? "",
                    payFrequency: freq,
                    updatedAt: Date.now(),
                } as Omit<DriverPaySetting, "id">,
                { merge: true }
            );
        } catch (error) {
            console.log("Update driver pay error", error);
            Alert.alert("Error", "Failed to update driver pay frequency.");
            loadDriverPay();
        }
    };

    const removeDriver = async (driverId: string) => {
        if (!fleetId) return;
        try {
            await deleteDoc(doc(db, "fleetFinance", fleetId, "driverPay", driverId));
            setDriverPay((prev) => prev.filter((d) => d.id !== driverId));
        } catch (error) {
            console.log("Remove driver error", error);
        }
    };

    // ============================================================
    // TOTALS / OVERVIEW
    // ============================================================

    const periodStart = useMemo(() => {
        const now = new Date();
        if (period === "WEEK") return startOfWeek(now);
        if (period === "MONTH") return startOfMonth(now);
        return 0;
    }, [period]);

    const filteredEntries = useMemo(
        () => entries.filter((e) => e.createdAt >= periodStart),
        [entries, periodStart]
    );

    const overview = useMemo(() => {
        let totalIncome = 0;
        let totalCost = 0;
        const byCategory: Record<string, { label: string; amount: number; flow: EntryFlow }> = {};

        filteredEntries.forEach((e) => {
            if (e.flow === "INCOME") totalIncome += e.amount;
            else totalCost += e.amount;

            const key = e.categoryKey;
            if (!byCategory[key]) {
                byCategory[key] = { label: e.categoryLabel, amount: 0, flow: e.flow };
            }
            byCategory[key].amount += e.amount;
        });

        const breakdown = Object.entries(byCategory)
            .map(([key, v]) => ({ key, ...v }))
            .sort((a, b) => b.amount - a.amount);

        return { totalIncome, totalCost, net: totalIncome - totalCost, breakdown };
    }, [filteredEntries]);

    const selectedCategory = CATEGORIES.find((c) => c.key === selectedCategoryKey)!;

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    const TabButton = ({ tab, label, iconName }: { tab: TopTab; label: string; iconName: any }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(tab)}
            style={{
                alignItems: "center",
                paddingVertical: wp(2),
                paddingHorizontal: wp(2.5),
                borderRadius: wp(2),
                backgroundColor: activeTab === tab ? accent : "transparent",
                marginRight: wp(1.5),
            }}
        >
            <Ionicons name={iconName} size={16} color={activeTab === tab ? background : icon} />
            <ThemedText
                style={{
                    fontSize: 10.5,
                    marginTop: 2,
                    fontWeight: "bold",
                    color: activeTab === tab ?textColor : icon,
                }}
            >
                {label}
            </ThemedText>
        </TouchableOpacity>
    );

    const SummaryCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <View
            style={{
                flex: 1,
                padding: wp(2.5),
                borderRadius: wp(2.5),
                backgroundColor: background,
                alignItems: "center",
                marginRight: wp(2),
            }}
        >
            <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E" }}>{label}</ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: "700", color }}>
                ${value.toFixed(2)}
            </ThemedText>
        </View>
    );

    const EntryRow = ({ item }: { item: FleetFinanceEntry }) => (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: wp(2),
                borderBottomWidth: 1,
                borderBottomColor: "rgba(128,128,128,0.15)",
            }}
        >
            <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                    {item.categoryLabel} • {item.subcategory}
                </ThemedText>
                <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E", marginTop: 1 }}>
                    {item.scope === "FLEET"
                        ? item.recurrence === "WEEKLY"
                            ? "Weekly"
                            : item.recurrence === "MONTHLY"
                            ? "Monthly"
                            : "One-off"
                        : item.tripRef
                        ? `Trip: ${item.tripRef}`
                        : "Trip expense"}
                    {item.vehicleRef ? ` • ${item.vehicleRef}` : ""}
                </ThemedText>
                {item.note ? (
                    <ThemedText style={{ fontSize: 11, color: "#8A8A8E", marginTop: 1 }}>
                        {item.note}
                    </ThemedText>
                ) : null}
                {item.customFields?.length ? (
                    <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E", marginTop: 1 }}>
                        {item.customFields.map((f) => `${f.label}: ${f.value}`).join(" • ")}
                    </ThemedText>
                ) : null}
                <ThemedText style={{ fontSize: 10, color: "#B0B0B0", marginTop: 1 }}>
                    {item.createdByName} • {new Date(item.createdAt).toLocaleString()}
                </ThemedText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemedText
                    style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: item.flow === "INCOME" ? "#2E7D32" : "#D32F2F",
                        marginRight: wp(2),
                    }}
                >
                    {item.flow === "INCOME" ? "+" : "-"}${item.amount.toFixed(2)}
                </ThemedText>
                <TouchableOpacity onPress={() => deleteEntry(item.id)}>
                    <Ionicons name="close-outline" size={16} color="#B0B0B0" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // ============================================================
    // TAB CONTENT
    // ============================================================

    const renderOverview = () => (
        <View>
            <View style={{ flexDirection: "row", marginBottom: wp(2.5) }}>
                {(["Today", "WEEK", "MONTH", "ALL"] as const).map((p) => (
                    <TouchableOpacity
                        key={p}
                        onPress={() => setPeriod(p)}
                        style={{
                            paddingVertical: wp(1.5),
                            paddingHorizontal: wp(3.5),
                            borderRadius: wp(5),
                            borderWidth: 1,
                            borderColor: period === p ? accent : "rgba(128,128,128,0.3)",
                            backgroundColor: period === p ? backgroundLight : background,
                            marginRight: wp(2),
                        }}
                    >
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: period === p ? accent : icon,
                            }}
                        >
                            {p === "Today" ? "Today" :p === "WEEK" ? "This Week" : p === "MONTH" ? "This Month" : "All Time"}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: "row", marginBottom: wp(3) }}>
                <SummaryCard label="Income" value={overview.totalIncome} color="#2E7D32" />
                <SummaryCard label="Costs" value={overview.totalCost} color="#D32F2F" />
                <View
                    style={{
                        flex: 1,
                        padding: wp(2.5),
                        borderRadius: wp(2.5),
                        backgroundColor: background,
                        alignItems: "center",
                    }}
                >
                    <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E" }}>Net</ThemedText>
                    <ThemedText
                        style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: overview.net >= 0 ? "#2E7D32" : "#D32F2F",
                        }}
                    >
                        ${overview.net.toFixed(2)}
                    </ThemedText>
                </View>
            </View>

            <ThemedText style={{ fontSize: 13, fontWeight: "700", marginBottom: wp(1.5) }}>
                By Category
            </ThemedText>
            {overview.breakdown.length === 0 ? (
                <ThemedText style={{ fontSize: 12, color: "#999" }}>
                    No entries for this period yet.
                </ThemedText>
            ) : (
                overview.breakdown.map((b) => {
                    const maxVal = Math.max(...overview.breakdown.map((x) => x.amount), 1);
                    const widthPct = (b.amount / maxVal) * 100;
                    return (
                        <View key={b.key} style={{ marginBottom: wp(2) }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 3,
                                }}
                            >
                                <ThemedText style={{ fontSize: 12, color: icon }}>{b.label}</ThemedText>
                                <ThemedText
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "700",
                                        color: b.flow === "INCOME" ? "#2E7D32" : "#D32F2F",
                                    }}
                                >
                                    ${b.amount.toFixed(2)}
                                </ThemedText>
                            </View>
                            <View
                                style={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(128,128,128,0.15)",
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    style={{
                                        height: "100%",
                                        width: `${widthPct}%`,
                                        backgroundColor: b.flow === "INCOME" ? "#2E7D32" : accent,
                                        borderRadius: 3,
                                    }}
                                />
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );

    const renderFleetOperations = () => (
        <View >
            <ThemedText style={{ fontSize: 13,  marginBottom: wp(2) ,color :accent , fontWeight:"bold"}}>
                Fleet Operations
            </ThemedText>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: wp(2.5) }}>
                {TRIP_SUBCATEGORIES.map((s) => (
                    <TouchableOpacity
                        key={s}
                        onPress={() => setTripSubcategory(s)}
                        style={{
                            paddingHorizontal: wp(3),
                            paddingVertical: wp(1.5),
                            borderRadius: wp(5),
                            borderWidth: 1,
                            borderColor: tripSubcategory === s ? accent : "rgba(128,128,128,0.3)",
                            backgroundColor: tripSubcategory === s ? backgroundLight : background,
                            marginRight: wp(2),
                            marginBottom: wp(2),
                        }}
                    >
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: tripSubcategory === s ? accent : icon,
                            }}
                        >
                            {s}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>


            

                 <FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{}}
                data={fleetOpererations}




                renderItem={({ item }) => (<FleetTripTaransactionCard assignmentData={item} />)}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[accent]}
                    />
                }
                onEndReached={loadMoreFleetOperations}
                onEndReachedThreshold={.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {isLoading ? (
                            <>
                                <AccentRingLoader color={accent} size={32} dotSize={6} />
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    Loading Loads…
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
                                
                            </>
                        )}
                    </View>
                }
                ListFooterComponent={
                    <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                        {
                            loadingMore ?
                                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                    <AccentRingLoader color={accent} size={20} dotSize={4} />
                                </View>
                                :
                                (!lastVisible && fleetOpererations.length > 0) ?
                                    <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                        <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more Loads to Load
                                        </ThemedText>
                                        <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />

                                    </View>
                                    : null
                        }

                    </View>
                }
            />

            

            



        </View>
    );

    const renderCategories = () => (
        <View>
            <ThemedText style={{ fontSize: 13, fontWeight: "700", marginBottom: wp(2) }}>
                Categories
            </ThemedText>

            {/* CATEGORY LIST */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: wp(2.5) }}
            >
                {CATEGORIES.map((c) => (
                    <TouchableOpacity
                        key={c.key}
                        onPress={() => {
                            setSelectedCategoryKey(c.key);
                            setSelectedSubcategory(c.subcategories[0] ?? "");
                        }}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: wp(3),
                            paddingVertical: wp(1.8),
                            borderRadius: wp(5),
                            borderWidth: 1,
                            borderColor: selectedCategoryKey === c.key ? accent : "rgba(128,128,128,0.3)",
                            backgroundColor: selectedCategoryKey === c.key ? backgroundLight : background,
                            marginRight: wp(2),
                        }}
                    >
                        <Ionicons
                            name={c.icon}
                            size={14}
                            color={selectedCategoryKey === c.key ? accent : "#8A8A8E"}
                            style={{ marginRight: 4 }}
                        />
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: selectedCategoryKey === c.key ? accent : icon,
                            }}
                        >
                            {c.label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* SUBCATEGORY CHIPS */}
            {selectedCategory.subcategories.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: wp(2.5) }}>
                    {selectedCategory.subcategories.map((s) => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setSelectedSubcategory(s)}
                            style={{
                                paddingHorizontal: wp(3),
                                paddingVertical: wp(1.5),
                                borderRadius: wp(5),
                                borderWidth: 1,
                                borderColor: selectedSubcategory === s ? accent : "rgba(128,128,128,0.3)",
                                backgroundColor: selectedSubcategory === s ? backgroundLight : background,
                                marginRight: wp(2),
                                marginBottom: wp(2),
                            }}
                        >
                            <ThemedText
                                style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: selectedSubcategory === s ? accent : icon,
                                }}
                            >
                                {s}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* CUSTOM SUBCATEGORY (Other) */}
            {selectedCategory.allowCustomSubcategory && (
                <View style={{ marginBottom: wp(2.5) }}>
                    <Input
                        placeholder="Custom category name"
                        value={customSubcategoryName}
                        onChangeText={setCustomSubcategoryName}
                    />
                    {customFields.map((field, i) => (
                        <View
                            key={i}
                            style={{ flexDirection: "row", alignItems: "center", marginTop: wp(1.5) }}
                        >
                            <Input
                                placeholder="Field name"
                                value={field.label}
                                onChangeText={(v: string) => updateCustomField(i, "label", v)}
                                style={{ flex: 1, marginRight: wp(1.5) }}
                            />
                            <Input
                                placeholder="Value"
                                value={field.value}
                                onChangeText={(v: string) => updateCustomField(i, "value", v)}
                                style={{ flex: 1, marginRight: wp(1.5) }}
                            />
                            <TouchableOpacity onPress={() => removeCustomField(i)}>
                                <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {customFields.length < 4 && (
                        <TouchableOpacity
                            onPress={addCustomField}
                            style={{ flexDirection: "row", alignItems: "center", marginTop: wp(1.5) }}
                        >
                            <Ionicons name="add-circle-outline" size={16} color={accent} />
                            <ThemedText style={{ fontSize: 12, color: accent, marginLeft: 4, fontWeight: "600" }}>
                                Add field ({customFields.length}/4)
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* RECURRENCE */}
            <ThemedText style={{ fontSize: 11.5, color: "#8A8A8E", marginBottom: wp(1) }}>
                How often
            </ThemedText>
            <View style={{ flexDirection: "row", marginBottom: wp(2.5) }}>
                {RECURRENCE_OPTIONS.map((r) => (
                    <TouchableOpacity
                        key={r.key}
                        onPress={() => setRecurrence(r.key)}
                        style={{
                            flex: 1,
                            marginRight: r.key !== "ONE_OFF" ? wp(2) : 0,
                            paddingVertical: wp(1.8),
                            borderRadius: wp(2),
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: recurrence === r.key ? accent : "rgba(128,128,128,0.3)",
                            backgroundColor: recurrence === r.key ? accent : background,
                        }}
                    >
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontWeight: "700",
                                color: recurrence === r.key ? background : icon,
                            }}
                        >
                            {r.label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <Input
                placeholder="Vehicle reference (optional)"
                value={vehicleRef}
                onChangeText={setVehicleRef}
            />
            <Input
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={{ marginTop: wp(1.5) }}
            />
            <Input
                placeholder="Note (optional)"
                value={note}
                onChangeText={setNote}
                style={{ marginTop: wp(1.5) }}
            />

            <TouchableOpacity
                style={[styles.actionButton, { marginTop: wp(2.5), justifyContent: "center" }]}
                disabled={savingEntry || !amount.trim()}
                onPress={saveFleetEntry}
            >
                <ThemedText style={{ color: accent, fontWeight: "700" }}>
                    {savingEntry ? "Saving..." : `Add ${selectedCategory.label} Entry`}
                </ThemedText>
            </TouchableOpacity>

            <View style={{ marginTop: wp(3) }}>
                {loadingEntries ? (
                    <ActivityIndicator size="small" color={accent} />
                ) : (
                    entries
                        .filter((e) => e.scope === "FLEET" && e.categoryKey === selectedCategoryKey)
                        .map((item) => <EntryRow key={item.id} item={item} />)
                )}
            </View>
        </View>
    );

    const renderTyres = () => (
        <View>
            <ThemedText style={{ fontSize: 13, fontWeight: "700", marginBottom: wp(1) }}>
                Tyres
            </ThemedText>
            <ThemedText style={{ fontSize: 11.5, color: "#8A8A8E", marginBottom: wp(2.5) }}>
                Tracks each tyre against its expected life (24 months by default when bought new).
            </ThemedText>

            <Input placeholder="Vehicle reference" value={tyreVehicleRef} onChangeText={setTyreVehicleRef} />
            <Input
                placeholder="Position (e.g. Front Left) — optional"
                value={tyrePosition}
                onChangeText={setTyrePosition}
                style={{ marginTop: wp(1.5) }}
            />
            <TouchableOpacity
                onPress={() => setShowTyreDatePicker(true)}
                style={{
                    marginTop: wp(1.5),
                    paddingVertical: wp(2.8),
                    paddingHorizontal: wp(3),
                    borderRadius: wp(2),
                    borderWidth: 1,
                    borderColor: "rgba(128,128,128,0.3)",
                    backgroundColor: background,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <ThemedText style={{ fontSize: 13, color: tyrePurchaseDate ? "#000" : "#8A8A8E" }}>
                    {tyrePurchaseDate ? tyrePurchaseDate.toLocaleDateString() : "Purchase date"}
                </ThemedText>
                <Ionicons name="calendar-outline" size={16} color="#8A8A8E" />
            </TouchableOpacity>
            {showTyreDatePicker && (
                <DateTimePicker
                    value={tyrePurchaseDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    maximumDate={new Date()}
                    onChange={onTyreDateChange}
                />
            )}
            {Platform.OS === "ios" && showTyreDatePicker && (
                <TouchableOpacity
                    onPress={() => setShowTyreDatePicker(false)}
                    style={{ alignSelf: "flex-end", marginTop: wp(1) }}
                >
                    <ThemedText style={{ fontSize: 12, color: accent, fontWeight: "700" }}>Done</ThemedText>
                </TouchableOpacity>
            )}
            <View style={{ flexDirection: "row", marginTop: wp(1.5) }}>
                <Input
                    placeholder="Cost"
                    value={tyreCost}
                    onChangeText={setTyreCost}
                    keyboardType="decimal-pad"
                    style={{ flex: 1, marginRight: wp(1.5) }}
                />
                <Input
                    placeholder="Expected life (months)"
                    value={tyreLifeMonths}
                    onChangeText={setTyreLifeMonths}
                    keyboardType="number-pad"
                    style={{ flex: 1 }}
                />
            </View>

            <TouchableOpacity
                style={[styles.actionButton, { marginTop: wp(2.5), justifyContent: "center" }]}
                disabled={savingTyre || !tyreVehicleRef.trim() || !tyrePurchaseDate}
                onPress={saveTyre}
            >
                <ThemedText style={{ color: accent, fontWeight: "700" }}>
                    {savingTyre ? "Saving..." : "Add Tyre"}
                </ThemedText>
            </TouchableOpacity>

            <View style={{ marginTop: wp(3) }}>
                {loadingTyres ? (
                    <ActivityIndicator size="small" color={accent} />
                ) : tyres.length === 0 ? (
                    <ThemedText style={{ fontSize: 12, color: "#999" }}>No tyres recorded yet.</ThemedText>
                ) : (
                    tyres.map((t) => {
                        const { ageMonths, pctUsed, status } = tyreStatus(t);
                        const statusColor =
                            status === "OVERDUE" ? "#D32F2F" : status === "DUE_SOON" ? "#F59E0B" : "#2E7D32";
                        const statusLabel =
                            status === "OVERDUE" ? "Overdue" : status === "DUE_SOON" ? "Due soon" : "Good";
                        return (
                            <View
                                key={t.id}
                                style={{
                                    paddingVertical: wp(2),
                                    borderBottomWidth: 1,
                                    borderBottomColor: "rgba(128,128,128,0.15)",
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                                        {t.vehicleRef}
                                        {t.position ? ` • ${t.position}` : ""}
                                    </ThemedText>
                                    <TouchableOpacity onPress={() => deleteTyre(t.id)}>
                                        <Ionicons name="close-outline" size={16} color="#B0B0B0" />
                                    </TouchableOpacity>
                                </View>
                                <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E", marginTop: 1 }}>
                                    Bought {new Date(t.purchaseDate).toLocaleDateString()} • {ageMonths} mo old •
                                    life {t.expectedLifeMonths} mo • ${t.cost.toFixed(2)}
                                </ThemedText>
                                <View
                                    style={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: "rgba(128,128,128,0.15)",
                                        overflow: "hidden",
                                        marginTop: 6,
                                    }}
                                >
                                    <View
                                        style={{
                                            height: "100%",
                                            width: `${pctUsed}%`,
                                            backgroundColor: statusColor,
                                            borderRadius: 3,
                                        }}
                                    />
                                </View>
                                <ThemedText style={{ fontSize: 10.5, color: statusColor, marginTop: 3, fontWeight: "700" }}>
                                    {statusLabel}
                                </ThemedText>
                            </View>
                        );
                    })
                )}
            </View>
        </View>
    );

    const renderDriverPay = () => (
        <View>
            <ThemedText style={{ fontSize: 13, fontWeight: "700", marginBottom: wp(1) }}>
                Driver Pay
            </ThemedText>
            <ThemedText style={{ fontSize: 11.5, color: "#8A8A8E", marginBottom: wp(2.5) }}>
                Mark whether each driver is paid Monthly or Per Trip.
            </ThemedText>

            <View style={{ flexDirection: "row" }}>
                <Input
                    placeholder="Driver name"
                    value={newDriverName}
                    onChangeText={setNewDriverName}
                    style={{ flex: 1, marginRight: wp(1.5) }}
                />
                <TouchableOpacity
                    style={[styles.actionButton, { paddingHorizontal: wp(4), justifyContent: "center" }]}
                    disabled={!newDriverName.trim()}
                    onPress={addDriver}
                >
                    <ThemedText style={{ color: accent, fontWeight: "700" }}>Add</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: wp(3) }}>
                {loadingDrivers ? (
                    <ActivityIndicator size="small" color={accent} />
                ) : driverPay.length === 0 ? (
                    <ThemedText style={{ fontSize: 12, color: "#999" }}>No drivers added yet.</ThemedText>
                ) : (
                    driverPay.map((d) => (
                        <View
                            key={d.id}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: wp(2),
                                borderBottomWidth: 1,
                                borderBottomColor: "rgba(128,128,128,0.15)",
                            }}
                        >
                            <ThemedText style={{ fontSize: 13, fontWeight: "600", flex: 1 }}>
                                {d.driverName}
                            </ThemedText>

                            <View
                                style={{
                                    flexDirection: "row",
                                    backgroundColor: background,
                                    borderRadius: wp(2),
                                    padding: 3,
                                    marginRight: wp(2),
                                }}
                            >
                                {(["MONTHLY", "PER_TRIP"] as PayFrequency[]).map((f) => (
                                    <TouchableOpacity
                                        key={f}
                                        onPress={() => setDriverFrequency(d.id, f)}
                                        style={{
                                            paddingVertical: wp(1.3),
                                            paddingHorizontal: wp(2.5),
                                            borderRadius: wp(1.8),
                                            backgroundColor: d.payFrequency === f ? accent : "transparent",
                                        }}
                                    >
                                        <ThemedText
                                            style={{
                                                fontSize: 11,
                                                fontWeight: "700",
                                                color: d.payFrequency === f ? background : icon,
                                            }}
                                        >
                                            {f === "MONTHLY" ? "Monthly" : "Per Trip"}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity onPress={() => removeDriver(d.id)}>
                                <Ionicons name="close-outline" size={16} color="#B0B0B0" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </View>
    );

    // ============================================================
    // MAIN RENDER
    // ============================================================

    return (
        <View style={{backgroundColor: background,flex : 1, paddingHorizontal: wp(2) }}>
          
          <View style={{paddingTop:30}}>
        <Heading page="Finance" />

          </View>



<View style={{marginTop:10 , }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(6) }}>
                <TabButton tab="OVERVIEW" label="Overview" iconName="stats-chart-outline" />
                <TabButton tab="Fleet_Operations" label="Fleet Operations" iconName="car-outline" />
                <TabButton tab="CATEGORIES" label="Categories" iconName="albums-outline" />
                <TabButton tab="TYRES" label="Tyres" iconName="disc-outline" />
                <TabButton tab="DRIVER_PAY" label="Driver Pay" iconName="people-outline" />
            </ScrollView>
</View>


            {activeTab === "OVERVIEW" && renderOverview()}
            {activeTab === "Fleet_Operations" && renderFleetOperations()}
            {activeTab === "CATEGORIES" && renderCategories()}
            {activeTab === "TYRES" && renderTyres()}
            {activeTab === "DRIVER_PAY" && renderDriverPay()}
        </View>
    );


}

const styles = StyleSheet.create({
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(128,128,128,0.25)",
    },

        container: {
            padding: wp(2)
        }, countryButton: {
            padding: wp(2),
            paddingHorizontal: wp(4),
            borderRadius: wp(4)
    
        }, countryButtonSelected: {
            backgroundColor: '#73c8a9'
        }, detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: wp(1),
        },
        contactOptions: {
            paddingVertical: wp(4),
            flexDirection: 'row',
            gap: wp(5),
            marginTop: 'auto',
            justifyContent: 'space-around'
        },
        contactOption: {
            alignItems: 'center'
        },
        contactButton: {
            height: wp(12),
            width: wp(12),
            borderRadius: wp(90),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: wp(1)
        },
        ownerActions: {
            paddingVertical: wp(4),
            flexDirection: 'row',
            gap: wp(5),
            marginTop: 'auto'
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
