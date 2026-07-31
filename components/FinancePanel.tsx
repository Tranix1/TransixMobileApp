/**
 * FinancePanel.tsx
 *
 * Drop-in finance card for an assignment/load: Income + Money Out.
 *
 * INCOME is about the LOAD OWNER paying the fleet, tracked against the
 * load's payment terms (milestones). You pass in `rate`, `ratePerKm` and
 * `paymentTerms` (e.g. 50% on loading / 50% on delivery, or 100% on
 * loading). Each milestone shows the calculated amount, the user taps it,
 * confirms the amount actually received (editable), picks how it was
 * received (Bank / Cash), and hits Confirm. That writes an INCOME entry
 * and increments the assignment's totalIncome. Once a milestone is
 * confirmed it's locked (shown with a checkmark).
 *
 * MONEY OUT is the combined outflow tab. It covers two kinds of records:
 *   1) Regular EXPENSES — Fuel / Police / Parking / VID / Other (up to 4
 *      custom fields under "Other"). These write straight to
 *      Finance/Account/Transactions and increment totalExpenses.
 *   2) PAYOUTS — Driver or Shipper. These write to a separate
 *      Finance/Account/Payout collection (one doc per category per
 *      assignment, id `DRV_PY_{assignmentId}` / `SHP_PY_{assignmentId}`),
 *      starting as "TO_BE_PAID". Once actually paid out, you mark it paid
 *      and it flips to "PAID". A payout's "mark paid" control only shows
 *      up once that payout has actually been created — there's nothing to
 *      mark paid before that.
 *
 * The summary row shows Income / Money Out (expenses + payouts combined,
 * with a breakdown underneath) / Net. The History list merges both
 * Transactions and Payouts into one time-sorted feed.
 *
 * USAGE:
 *   import FinancePanel from "./FinancePanel";
 *
 *   <FinancePanel
 *     visible={financeView}
 *     onClose={() => setFinanceView(false)}
 *     assignmentId={assignmentId}
 *     rate={load.rate}
 *     ratePerKm={load.ratePerKm}
 *     paymentTerms={[
 *       { id: "loading", label: "On Loading", percent: 50 },
 *       { id: "delivery", label: "On Delivery", percent: 50 },
 *     ]}
 *     driverPayment={driverPayment}
 *     driverId={driverId}
 *     driverName={driverName}
 *     brokerId={loadOwnerId}
 *     brokerName={loadOwnerName}
 *   />
 *
 * ⚠️ ADJUST THESE IMPORTS to match your project's actual paths:
 *   - db, ThemedText, Input, wp, useAuth, useThemeColor
 *
 * ⚠️ MIGRATION NOTE: category value "BROKER" was renamed to "SHIPPER".
 * Any existing Payout/Transaction docs written with category: "BROKER"
 * won't match the new "SHIPPER" filters/labels until you migrate them.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    increment,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";

// ---- ADJUST THESE IMPORTS TO MATCH YOUR PROJECT ----
import { db } from "@/db/fireBaseConfig";
import { ThemedText } from "./ThemedText";
import Input from "./Input";
import { wp } from "@/constants/common";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { addDocumentWithId, updateDocument } from "@/db/operations";
// ------------------------------------------------------

type PaymentMethod = "BANK" | "CASH";
type ExpenseCategory = "FUEL" | "POLICE" | "PARKING" | "VID" | "CUSTOM" | "DRIVER" | "SHIPPER";
type PayoutState = "TO_BE_PAID" | "PAID";
type PanelTab = "INCOME" | "OUTFLOW";

interface CustomField {
    label: string;
    value: string;
}

export interface PaymentMilestone {
    id: string;
    label: string;
    percent: number; // 0-100
}

interface FinanceEntry {
    id: string;
    entryType: "INCOME" | "EXPENSE";
    // income fields
    milestoneId?: string;
    milestoneLabel?: string;
    milestonePercent?: number;
    paymentMethod?: PaymentMethod;
    // expense fields
    category?: ExpenseCategory;
    customFields?: CustomField[];
    // shared
    amount: number;
    note?: string;
    createdAt: number;
    createdBy: string;
    createdByName: string;
    createdByRole: string;
    createdByAccRole: string;
}

interface PayoutEntry {
    id: string;
    entryType: "PAYOUT";
    category: "DRIVER" | "SHIPPER";
    amount: number;
    state: PayoutState;
    payeeId?: string | null;
    payeeName?: string | null;
    note?: string;
    createdAt: number;
    createdByName: string;
    paidAt?: number;
}

interface FinancePanelProps {
    visible: boolean;
    onClose: () => void;
    assignmentId: string;
    // Total agreed rate for this load. Milestone amounts are calculated from this.
    rate: number;
    cargoRateCurrency: string;
    cargoRateModel: string;
    ratePerKm?: number;
    paymentTerms?: PaymentMilestone[];
    driverPayment: any;
    driverName?: string;
    driverId: string;
    // "Shipper" here = the load owner being paid out to (prop names kept for compatibility)
    brokerName?: string;
    brokerId?: string;
}

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: any }[] = [
    { key: "FUEL", label: "Fuel", icon: "flame-outline" },
    { key: "POLICE", label: "Police", icon: "shield-outline" },
    { key: "PARKING", label: "Parking", icon: "car-outline" },
    { key: "VID", label: "VID", icon: "document-text-outline" },
    { key: "CUSTOM", label: "Other", icon: "add-circle-outline" },
];

const DEFAULT_TERMS: PaymentMilestone[] = [{ id: "full", label: "Full Payment", percent: 100 }];

export default function FinancePanel({
    visible,
    onClose,
    assignmentId,
    rate,
    cargoRateCurrency,
    cargoRateModel,
    ratePerKm,
    paymentTerms,
    driverPayment,
    driverId,
    driverName,
    brokerId,
    brokerName,
}: FinancePanelProps) {
    const { user, currentRole } = useAuth();
    const fleetId = currentRole?.organizationId || currentRole?.fleetId || "";

    const backgroundLight = useThemeColor("backgroundLight");
    const accent = useThemeColor("accent");
    const icon = useThemeColor("icon");
    const background = useThemeColor("background");

    const terms = paymentTerms && paymentTerms.length > 0 ? paymentTerms : DEFAULT_TERMS;

    const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
    const [payoutEntries, setPayoutEntries] = useState<PayoutEntry[]>([]);
    const [loadingFinance, setLoadingFinance] = useState(false);
    const [savingFinance, setSavingFinance] = useState(false);
    const [markingPaid, setMarkingPaid] = useState<"DRIVER" | "SHIPPER" | null>(null);

    const [tab, setTab] = useState<PanelTab>("INCOME");

    // ---------- OUTFLOW FORM STATE (expenses + payouts share this tab) ----------
    const [category, setCategory] = useState<ExpenseCategory>("FUEL");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    // ---------- INCOME (MILESTONE) FORM STATE ----------
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");
    const [incomeAmount, setIncomeAmount] = useState("");
    const [incomeMethod, setIncomeMethod] = useState<PaymentMethod>("BANK");
    const [incomeNote, setIncomeNote] = useState("");

    const selectedMilestone = useMemo(
        () => terms.find((t) => t.id === selectedMilestoneId),
        [terms, selectedMilestoneId]
    );

    const confirmedMilestoneIds = useMemo(
        () =>
            new Set(
                financeEntries
                    .filter((e) => e.entryType === "INCOME" && e.milestoneId)
                    .map((e) => e.milestoneId as string)
            ),
        [financeEntries]
    );

    const driverPayout = useMemo(
        () => payoutEntries.find((p) => p.category === "DRIVER"),
        [payoutEntries]
    );
    const shipperPayout = useMemo(
        () => payoutEntries.find((p) => p.category === "SHIPPER"),
        [payoutEntries]
    );

    // ---------- LOAD FINANCE + PAYOUT ENTRIES ----------
    const loadAssignmentFinance = async () => {
        if (!fleetId || !assignmentId) return;

        try {
            setLoadingFinance(true);

            const financeRef = collection(db, "fleets", fleetId, "Finance", "Account", "Transactions");
            const financeQ = query(financeRef, where("tripId", "==", assignmentId), orderBy("createdAt", "desc"));

            const payoutRef = collection(db, "fleets", fleetId, "Finance", "Account", "Payout");
            const payoutQ = query(payoutRef, where("tripId", "==", assignmentId));

            const [financeSnap, payoutSnap] = await Promise.all([getDocs(financeQ), getDocs(payoutQ)]);

            setFinanceEntries(financeSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FinanceEntry)));
            setPayoutEntries(payoutSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PayoutEntry)));
        } catch (error) {
            console.log("Finance load error", error);
        } finally {
            setLoadingFinance(false);
        }
    };

    // Fires whenever the panel becomes visible
    useEffect(() => {
        if (visible) {
            loadAssignmentFinance();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, assignmentId, fleetId]);

    // Pre-fill the confirm amount whenever a milestone is picked
    useEffect(() => {
        if (selectedMilestone) {
            const computed = (rate || 0) * (selectedMilestone.percent / 100);
            setIncomeAmount(computed > 0 ? computed.toFixed(2) : "");
        } else {
            setIncomeAmount("");
        }
        setIncomeMethod("BANK");
        setIncomeNote("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMilestoneId]);

    // ---------- CUSTOM FIELD HELPERS (expenses "Other") ----------
    const addCustomField = () => {
        if (customFields.length >= 4) return;
        setCustomFields((prev) => [...prev, { label: "", value: "" }]);
    };

    const updateCustomField = (index: number, key: "label" | "value", val: string) => {
        setCustomFields((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: val } : f)));
    };

    const removeCustomField = (index: number) => {
        setCustomFields((prev) => prev.filter((_, i) => i !== index));
    };

    // ---------- SAVE REGULAR EXPENSE (Fuel / Police / Parking / VID / Other) ----------
    const saveExpense = async () => {
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !fleetId || !assignmentId) return;

        try {
            setSavingFinance(true);

            const financeRef = collection(db, "fleets", fleetId, "Finance", "Account", "Transactions");

            const payload: any = {
                entryType: "EXPENSE",
                category,
                amount: numericAmount,
                note: note.trim() || "",
                tripId: assignmentId,
                createdAt: Date.now(),
                createdBy: user?.uid ?? "",
                createdByName: user?.displayName ?? "User",
                createdByRole: currentRole?.userRole ?? "User",
                createdByAccRole: currentRole?.accType ?? "",
            };

            if (category === "CUSTOM") {
                payload.customFields = customFields.filter((f) => f.label.trim() && f.value.trim());
            }

            const newDoc = await addDoc(financeRef, payload);

            const assignmentRef = doc(db, "fleets", fleetId, "assignments", assignmentId);
            await updateDoc(assignmentRef, {
                totalExpenses: increment(numericAmount),
            });

            setFinanceEntries((prev) => [{ id: newDoc.id, ...payload } as FinanceEntry, ...prev]);

            ToastAndroid.show(
                "Expense recorded successfully.",
                ToastAndroid.SHORT
            );

            setAmount("");
            setNote("");
            setCustomFields([]);
        } catch (error) {
            console.log("Expense save error", error);
            Alert.alert("Error", "Failed to save expense.");
        } finally {
            setSavingFinance(false);
        }
    };

    // ---------- SAVE PAYOUT (Driver / Shipper) ----------
    // One payout doc per category per assignment (fixed id), starts TO_BE_PAID.
    const savePayout = async () => {
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !fleetId || !assignmentId) return;

        const payoutCategory = category as "DRIVER" | "SHIPPER";

        try {
            setSavingFinance(true);

            const payload = {
                entryType: "PAYOUT" as const,
                category: payoutCategory,
                amount: numericAmount,
                state: "TO_BE_PAID" as PayoutState,
                assignmentId,
                tripId: assignmentId,
                payeeId: payoutCategory === "DRIVER" ? driverId : brokerId,
                payeeName: payoutCategory === "DRIVER" ? driverName : brokerName,
                note: note.trim() || "",
                createdAt: Date.now(),
                createdBy: user?.uid ?? "",
                createdByName: user?.displayName ?? "User",
                createdByRole: currentRole?.userRole ?? "User",
                createdByAccRole: currentRole?.accType ?? "",
            };

            const payoutId = `${payoutCategory === "SHIPPER" ? "SHP" : "DRV"}_PY_${assignmentId}`;
            await addDocumentWithId(`fleets/${fleetId}/Finance/Account/Payout`, payoutId, payload);

            const assignmentRef = doc(db, "fleets", fleetId, "assignments", assignmentId);
            await updateDoc(assignmentRef, {
                payoutStatus: "TO_BE_PAID",
                payoutCategory,
                payoutAmount: numericAmount,
                payoutId,
                payeeId: payload.payeeId,
                payeeName: payload.payeeName,
            });

            await updateDocument("organizationProfiles", fleetId, {
                payouts: {
                    [payoutCategory === "DRIVER" ? "driverCreated" : "shipperCreated"]: increment(1),
                },
            });

            setPayoutEntries((prev) => [
                { id: payoutId, ...payload } as PayoutEntry,
                ...prev.filter((p) => p.category !== payoutCategory),
            ]);

            ToastAndroid.show(
                "Payout created and awaiting payment.",
                ToastAndroid.SHORT
            );
            setAmount("");
            setNote("");
        } catch (error) {
            console.log("Payout save error", error);
            Alert.alert("Error", "Failed to add payout.");
        } finally {
            setSavingFinance(false);
        }
    };

    // ---------- MARK PAYOUT PAID ----------
    const markPayoutPaid = async (payoutCategory: "DRIVER" | "SHIPPER") => {
        if (!fleetId || !assignmentId) return;

        try {
            setMarkingPaid(payoutCategory);

            const payoutId = `${payoutCategory === "SHIPPER" ? "SHP" : "DRV"}_PY_${assignmentId}`;
            const payoutRef = doc(db, "fleets", fleetId, "Finance", "Account", "Payout", payoutId);

            const paidAt = Date.now();
            await updateDoc(payoutRef, {
                state: "PAID",
                paidAt,
                paidBy: user?.uid ?? "",
            });

            const assignmentRef = doc(db, "fleets", fleetId, "assignments", assignmentId);
            await updateDoc(assignmentRef, {
                payoutStatus: "PAID",
                payoutPaidCategory: payoutCategory,
                payoutPaidAt: paidAt,
            });

            await updateDocument("organi`zationProfiles", fleetId, {
                payouts: {
                    [payoutCategory === "DRIVER" ? "driverConfirmed" : "shipperConfirmed"]: increment(1),
                },
            });

            setPayoutEntries((prev) =>
                prev.map((p) => (p.category === payoutCategory ? { ...p, state: "PAID", paidAt } : p))
            );
            ToastAndroid.show(
                `${payoutCategory === "DRIVER" ? "Driver" : "Shipper"} payout marked as paid.`,
                ToastAndroid.SHORT
            );
        } catch (error) {
            console.log("Mark payout paid error", error);
            Alert.alert("Error", "Failed to mark payout as paid.");
        } finally {
            setMarkingPaid(null);
        }
    };

    // ---------- CONFIRM INCOME MILESTONE ----------
    const confirmIncome = async () => {
        if (!selectedMilestone || !fleetId || !assignmentId) return;

        const numericAmount = parseFloat(incomeAmount);
        if (!numericAmount || numericAmount <= 0) {
            Alert.alert("Enter amount", "Enter the amount received for this milestone.");
            return;
        }

        try {
            setSavingFinance(true);

            const financeRef = collection(db, "fleets", fleetId, "Finance", "Account", "Transactions");

            const payload: any = {
                entryType: "INCOME",
                milestoneId: selectedMilestone.id,
                milestoneLabel: selectedMilestone.label,
                milestonePercent: selectedMilestone.percent,
                paymentMethod: incomeMethod,
                amount: numericAmount,
                note: incomeNote.trim() || "",
                tripId: assignmentId,
                createdAt: Date.now(),
                createdBy: user?.uid ?? "",
                createdByName: user?.displayName ?? "User",
                createdByRole: currentRole?.userRole ?? "User",
                createdByAccRole: currentRole?.accType ?? "",
            };

            const newDoc = await addDoc(financeRef, payload);

            const assignmentRef = doc(db, "fleets", fleetId, "assignments", assignmentId);
            await updateDoc(assignmentRef, {
                totalIncome: increment(numericAmount),
            });

            setFinanceEntries((prev) => [{ id: newDoc.id, ...payload } as FinanceEntry, ...prev]);

            ToastAndroid.show(
                "Payment recorded successfully.",
                ToastAndroid.SHORT
            );
            setSelectedMilestoneId("");
            setIncomeAmount("");
            setIncomeNote("");
            setIncomeMethod("BANK");
        } catch (error) {
            console.log("Income save error", error);
            Alert.alert("Error", "Failed to confirm income.");
        } finally {
            setSavingFinance(false);
        }
    };

    // ---------- DELETE (Transactions only — Income/Expense) ----------
    const deleteFinanceEntry = async (entry: FinanceEntry) => {
        if (!fleetId || !assignmentId) return;

        try {
            await deleteDoc(doc(db, "fleets", fleetId, "Finance", "Account", "Transactions", entry.id));

            const assignmentRef = doc(db, "fleets", fleetId, "assignments", assignmentId);
            await updateDoc(assignmentRef, {
                [entry.entryType === "INCOME" ? "totalIncome" : "totalExpenses"]: increment(-entry.amount),
            });

            setFinanceEntries((prev) => prev.filter((e) => e.id !== entry.id));
        } catch (error) {
            console.log("Finance delete error", error);
            Alert.alert("Error", "Failed to delete entry.");
        }
    };

    // ---------- TOTALS ----------
    const financeSummary = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;

        financeEntries.forEach((e) => {
            if (e.entryType === "INCOME") totalIncome += e.amount || 0;
            else totalExpense += e.amount || 0;
        });

        const totalPayout = payoutEntries.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalMoneyOut = totalExpense + totalPayout;

        return {
            totalIncome,
            totalExpense,
            totalPayout,
            totalMoneyOut,
            net: totalIncome - totalMoneyOut,
        };
    }, [financeEntries, payoutEntries]);

    // ---------- MERGED HISTORY (Transactions + Payouts, time-sorted) ----------
    const historyItems = useMemo(() => {
        const combined = [
            ...financeEntries.map((e) => ({ kind: "FINANCE" as const, data: e })),
            ...payoutEntries.map((p) => ({ kind: "PAYOUT" as const, data: p })),
        ];
        return combined.sort((a, b) => b.data.createdAt - a.data.createdAt);
    }, [financeEntries, payoutEntries]);

    if (!visible) return null;

    const isOutflowPayoutCategory = category === "DRIVER" || category === "SHIPPER";

    return (
        <View
            style={{
                marginTop: wp(3),
                padding: wp(3.5),
                borderRadius: wp(3),
                backgroundColor: background,
                borderWidth: 1,
                borderColor: "rgba(128,128,128,0.2)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            {/* HEADER */}
            <View style={styles.headerRow}>
                <ThemedText style={{ fontSize: 16, fontWeight: "700", color: accent }}>Finance</ThemedText>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close-circle-outline" size={22} color="#777" />
                </TouchableOpacity>
            </View>

            {/* RATE INFO */}
            {(rate > 0 || !!ratePerKm) && (
                <View style={[styles.rateBar, { backgroundColor: backgroundLight }]}>
                    {rate > 0 ? (
                        <ThemedText style={{ fontSize: 12, color: "#8A8A8E" }}>
                            Rate <ThemedText style={{ fontSize: 12, fontWeight: "700", color: icon }}>{cargoRateCurrency} {rate} {cargoRateModel} </ThemedText>
                        </ThemedText>
                    ) : (
                        <View />
                    )}
                    {ratePerKm ? (
                        <ThemedText style={{ fontSize: 12, color: "#8A8A8E" }}>
                            Rate/km{" "}
                            <ThemedText style={{ fontSize: 12, fontWeight: "700", color: icon }}>
                                ${ratePerKm.toFixed(2)}/km
                            </ThemedText>
                        </ThemedText>
                    ) : null}
                </View>
            )}

            {/* SUMMARY ROW */}
            <View style={{ flexDirection: "row", marginTop: wp(3) }}>
                {[
                    { label: "Income", value: financeSummary.totalIncome, color: "#2E7D32" },
                    { label: "Money Out", value: financeSummary.totalMoneyOut, color: "#D32F2F" },
                    { label: "Net", value: financeSummary.net, color: financeSummary.net >= 0 ? "#2E7D32" : "#D32F2F" },
                ].map((s, idx) => (
                    <View
                        key={s.label}
                        style={{
                            flex: 1,
                            marginRight: idx < 2 ? wp(2) : 0,
                            padding: wp(2.5),
                            borderRadius: wp(2.5),
                            backgroundColor: backgroundLight,
                            alignItems: "center",
                        }}
                    >
                        <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E" }}>{s.label}</ThemedText>
                        <ThemedText style={{ fontSize: 14, fontWeight: "700", color: s.color }}>
                            ${s.value}
                        </ThemedText>
                    </View>
                ))}
            </View>

            {/* MONEY OUT BREAKDOWN */}
            {financeSummary.totalMoneyOut > 0 && (
                <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E", marginTop: wp(1), textAlign: "center" }}>
                    Expenses ${financeSummary.totalExpense} • Payouts ${financeSummary.totalPayout}
                </ThemedText>
            )}

            {/* TAB SWITCH */}
            <View style={[styles.tabRow, { marginTop: wp(3) }]}>
                {(["INCOME", "OUTFLOW"] as PanelTab[]).map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setTab(t)}
                        style={[
                            styles.tabButton,
                            {
                                backgroundColor: tab === t ? accent : backgroundLight,
                                marginRight: t === "INCOME" ? wp(2) : 0,
                            },
                        ]}
                    >
                        <Ionicons
                            name={t === "INCOME" ? "trending-up-outline" : "trending-down-outline"}
                            size={14}
                            color={tab === t ? backgroundLight : icon}
                            style={{ marginRight: 4 }}
                        />
                        <ThemedText style={{ fontSize: 12.5, fontWeight: "700", color: tab === t ? backgroundLight : icon }}>
                            {t === "INCOME" ? "Income" : "Money Out"}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ===================== INCOME TAB ===================== */}
            {tab === "INCOME" ? (
                <View style={{ marginTop: wp(3) }}>
                    <ThemedText style={{ fontSize: 12, color: "#8A8A8E", marginBottom: wp(2) }}>
                        Confirm each milestone once the load owner has paid.
                    </ThemedText>

                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {terms.map((m) => {
                            const isDone = confirmedMilestoneIds.has(m.id);
                            const isSelected = selectedMilestoneId === m.id;
                            const milestoneAmount = (rate || 0) * (m.percent / 100);

                            return (
                                <TouchableOpacity
                                    key={m.id}
                                    disabled={isDone}
                                    onPress={() => setSelectedMilestoneId(isSelected ? "" : m.id)}
                                    style={[
                                        styles.milestoneChip,
                                        {
                                            borderColor: isDone ? accent : isSelected ? accent : "rgba(128,128,128,0.3)",
                                            backgroundColor: isDone ? "rgba(46,125,50,0.08)" : isSelected ? accent : "transparent",
                                        },
                                    ]}
                                >
                                    {isDone && (
                                        <Ionicons name="checkmark-circle" size={14} color={accent} style={{ marginRight: 4 }} />
                                    )}
                                    <View>
                                        <ThemedText
                                            style={{
                                                fontSize: 12,
                                                fontWeight: "bold",
                                                color: isDone ? accent : isSelected ? backgroundLight : icon,
                                            }}
                                        >
                                            {m.label} • {m.percent}%
                                        </ThemedText>
                                        {rate > 0 && (
                                            <ThemedText
                                                style={{
                                                    fontSize: 10.5,
                                                    color: isDone ? accent : isSelected ? backgroundLight : "#8A8A8E",
                                                }}
                                            >
                                                ${milestoneAmount}
                                            </ThemedText>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {selectedMilestone && (
                        <View style={[styles.confirmCard, { backgroundColor: background }]}>
                            <ThemedText style={{ fontSize: 12.5, fontWeight: "700", color: icon, marginBottom: wp(2) }}>
                                Confirm {selectedMilestone.label}
                            </ThemedText>

                            <Input
                                placeholder="Amount received"
                                value={incomeAmount}
                                onChangeText={setIncomeAmount}
                                keyboardType="decimal-pad"
                            />

                            <ThemedText style={{ fontSize: 11, color: "#8A8A8E", marginTop: wp(2), marginBottom: wp(1) }}>
                                Received via
                            </ThemedText>
                            <View style={{ flexDirection: "row" }}>
                                {(["BANK", "CASH"] as PaymentMethod[]).map((pm) => (
                                    <TouchableOpacity
                                        key={pm}
                                        onPress={() => setIncomeMethod(pm)}
                                        style={[
                                            styles.methodChip,
                                            {
                                                borderColor: incomeMethod === pm ? accent : "rgba(128,128,128,0.3)",
                                                backgroundColor: incomeMethod === pm ? accent : "transparent",
                                                marginRight: wp(2),
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={pm === "BANK" ? "card-outline" : "cash-outline"}
                                            size={13}
                                            color={incomeMethod === pm ? backgroundLight : icon}
                                            style={{ marginRight: 4 }}
                                        />
                                        <ThemedText
                                            style={{
                                                fontSize: 12,
                                                fontWeight: "600",
                                                color: incomeMethod === pm ? backgroundLight : icon,
                                            }}
                                        >
                                            {pm === "BANK" ? "Bank" : "Cash"}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Input
                                placeholder="Note (optional)"
                                value={incomeNote}
                                onChangeText={setIncomeNote}
                                style={{ marginTop: wp(2) }}
                            />

                            <View style={{ flexDirection: "row", marginTop: wp(2.5) }}>
                                <TouchableOpacity
                                    onPress={() => setSelectedMilestoneId("")}
                                    style={[styles.actionButton, { flex: 1, marginRight: wp(2), justifyContent: "center" }]}
                                >
                                    <ThemedText style={{ color: icon, fontWeight: "700" }}>Cancel</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={confirmIncome}
                                    disabled={savingFinance || !incomeAmount.trim()}
                                    style={[
                                        styles.actionButton,
                                        {
                                            flex: 1,
                                            justifyContent: "center",
                                            backgroundColor: accent,
                                            borderColor: accent,
                                            opacity: savingFinance || !incomeAmount.trim() ? 0.6 : 1,
                                        },
                                    ]}
                                >
                                    <ThemedText style={{ color: backgroundLight, fontWeight: "700" }}>
                                        {savingFinance ? "Saving..." : "Confirm"}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            ) : (
                /* ===================== MONEY OUT TAB (Expenses + Payouts) ===================== */

                <View style={{ marginTop: wp(3) }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: wp(1) }}>
                        {EXPENSE_CATEGORIES.map((c) => (
                            <TouchableOpacity
                                key={c.key}
                                onPress={() => setCategory(c.key)}
                                style={[
                                    styles.categoryChip,
                                    {
                                        borderColor: category === c.key ? accent : "rgba(128,128,128,0.3)",
                                        backgroundColor: category === c.key ? accent : "transparent",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={c.icon}
                                    size={14}
                                    color={category === c.key ? backgroundLight : "#8A8A8E"}
                                    style={{ marginRight: 4 }}
                                />
                                <ThemedText
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        color: category === c.key ? backgroundLight : icon,
                                    }}
                                >
                                    {c.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}

                        {currentRole.accType === "fleet" && driverPayment.type === "trip" && (
                            <TouchableOpacity
                                onPress={() => setCategory("DRIVER")}
                                style={[
                                    styles.categoryChip,
                                    {
                                        borderColor: category === "DRIVER" ? accent : "rgba(128,128,128,0.3)",
                                        backgroundColor: category === "DRIVER" ? accent : "transparent",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={14}
                                    color={category === "DRIVER" ? backgroundLight : "#8A8A8E"}
                                    style={{ marginRight: 4 }}
                                />
                                <ThemedText
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        color: category === "DRIVER" ? backgroundLight : icon,
                                    }}
                                >
                                    Driver
                                </ThemedText>
                            </TouchableOpacity>
                        )}

                        {currentRole.accType === "fleet" && (
                            <TouchableOpacity
                                onPress={() => setCategory("SHIPPER")}
                                style={[
                                    styles.categoryChip,
                                    {
                                        borderColor: category === "SHIPPER" ? accent : "rgba(128,128,128,0.3)",
                                        backgroundColor: category === "SHIPPER" ? accent : "transparent",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={14}
                                    color={category === "SHIPPER" ? backgroundLight : "#8A8A8E"}
                                    style={{ marginRight: 4 }}
                                />
                                <ThemedText
                                    style={{
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        color: category === "SHIPPER" ? backgroundLight : icon,
                                    }}
                                >
                                    Shipper
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* PAYOUT STATUS ROW — only shows once a payout for that category actually exists */}
                    {(driverPayout || shipperPayout) && (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: wp(2.5) }}>
                            {driverPayout && (
                                driverPayout.state === "PAID" ? (
                                    <View style={[styles.paidBadge, { backgroundColor: "rgba(46,125,50,0.1)" }]}>
                                        <Ionicons name="checkmark-circle" size={13} color="#2E7D32" style={{ marginRight: 4 }} />
                                        <ThemedText style={{ fontSize: 11.5, fontWeight: "700", color: "#2E7D32" }}>
                                            Driver Paid
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => markPayoutPaid("DRIVER")}
                                        disabled={markingPaid === "DRIVER"}
                                        style={[styles.paidBadge, { backgroundColor: "rgba(224,138,44,0.12)" }]}
                                    >
                                        <Ionicons name="time-outline" size={13} color="#E08A2C" style={{ marginRight: 4 }} />
                                        <ThemedText style={{ fontSize: 11.5, fontWeight: "700", color: "#E08A2C" }}>
                                            {markingPaid === "DRIVER" ? "Marking..." : `Mark Driver Paid ($${driverPayout.amount})`}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )
                            )}

                            {shipperPayout && (
                                shipperPayout.state === "PAID" ? (
                                    <View style={[styles.paidBadge, { backgroundColor: "rgba(46,125,50,0.1)" }]}>
                                        <Ionicons name="checkmark-circle" size={13} color="#2E7D32" style={{ marginRight: 4 }} />
                                        <ThemedText style={{ fontSize: 11.5, fontWeight: "700", color: "#2E7D32" }}>
                                            Shipper Paid
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => markPayoutPaid("SHIPPER")}
                                        disabled={markingPaid === "SHIPPER"}
                                        style={[styles.paidBadge, { backgroundColor: "rgba(224,138,44,0.12)" }]}
                                    >
                                        <Ionicons name="time-outline" size={13} color="#E08A2C" style={{ marginRight: 4 }} />
                                        <ThemedText style={{ fontSize: 11.5, fontWeight: "700", color: "#E08A2C" }}>
                                            {markingPaid === "SHIPPER" ? "Marking..." : `Mark Shipper Paid ($${shipperPayout.amount})`}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    )}

                    {category === "CUSTOM" && (
                        <View style={{ marginBottom: wp(2.5) }}>
                            {customFields.map((field, i) => (
                                <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: wp(1.5) }}>
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
                                    style={{ flexDirection: "row", alignItems: "center", marginTop: wp(1) }}
                                >
                                    <Ionicons name="add-circle-outline" size={16} color={accent} />
                                    <ThemedText style={{ fontSize: 12, color: accent, marginLeft: 4, fontWeight: "600" }}>
                                        Add field ({customFields.length}/4)
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <Input placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
                    <Input
                        placeholder="Note (optional)"
                        value={note}
                        onChangeText={setNote}
                        style={{ marginTop: wp(1.5) }}
                    />

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            {
                                marginTop: wp(2.5),
                                justifyContent: "center",
                                backgroundColor: accent,
                                borderColor: accent,
                                opacity: savingFinance || !amount.trim() ? 0.6 : 1,
                            },
                        ]}
                        disabled={savingFinance || !amount.trim()}
                        onPress={isOutflowPayoutCategory ? savePayout : saveExpense}
                    >
                        <ThemedText style={{ color: backgroundLight, fontWeight: "700" }}>
                            {savingFinance
                                ? isOutflowPayoutCategory
                                    ? "Adding payout..."
                                    : "Saving..."
                                : isOutflowPayoutCategory
                                    ? "Add Payout"
                                    : "Add Expense"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            )}

            {/* ENTRY LIST — merged Transactions + Payouts, sorted by time */}
            <View style={{ marginTop: wp(3.5) }}>
                <ThemedText style={{ fontSize: 12.5, fontWeight: "700", color: icon, marginBottom: wp(1.5) }}>
                    History
                </ThemedText>

                {loadingFinance ? (
                    <ActivityIndicator size="small" color={accent} style={{ marginVertical: wp(2) }} />
                ) : historyItems.length === 0 ? (
                    <ThemedText style={{ fontSize: 12, color: "#999" }}>No financial records yet.</ThemedText>
                ) : (
                    historyItems.map((item) => {
                        if (item.kind === "FINANCE") {
                            const e = item.data;
                            return (
                                <View key={`f-${e.id}`} style={styles.entryRow}>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                                            {e.entryType === "INCOME"
                                                ? `${e.milestoneLabel || "Income"} • ${e.paymentMethod === "CASH" ? "Cash" : "Bank"}`
                                                : EXPENSE_CATEGORIES.find((c) => c.key === e.category)?.label || "Expense"}
                                        </ThemedText>

                                        {e.note ? (
                                            <ThemedText style={{ fontSize: 11, color: "#8A8A8E", marginTop: 1 }}>{e.note}</ThemedText>
                                        ) : null}

                                        {e.customFields?.length ? (
                                            <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E", marginTop: 1 }}>
                                                {e.customFields.map((f) => `${f.label}: ${f.value}`).join(" • ")}
                                            </ThemedText>
                                        ) : null}

                                        <ThemedText style={{ fontSize: 10, color: "#B0B0B0", marginTop: 1 }}>
                                            {e.createdByName} • {new Date(e.createdAt).toLocaleString()}
                                        </ThemedText>
                                    </View>

                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <ThemedText
                                            style={{
                                                fontSize: 13,
                                                fontWeight: "700",
                                                color: e.entryType === "INCOME" ? "#2E7D32" : "#D32F2F",
                                                marginRight: wp(2),
                                            }}
                                        >
                                            {e.entryType === "INCOME" ? "+" : "-"}${e.amount}
                                        </ThemedText>

                                        <TouchableOpacity onPress={() => deleteFinanceEntry(e)}>
                                            <Ionicons name="close-outline" size={16} color="#B0B0B0" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }

                        const p = item.data;
                        return (
                            <View key={`p-${p.id}`} style={styles.entryRow}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                                        {p.category === "DRIVER" ? "Driver Payout" : "Shipper Payout"}
                                    </ThemedText>

                                    {p.note ? (
                                        <ThemedText style={{ fontSize: 11, color: "#8A8A8E", marginTop: 1 }}>{p.note}</ThemedText>
                                    ) : null}

                                    <ThemedText
                                        style={{
                                            fontSize: 10.5,
                                            marginTop: 1,
                                            fontWeight: "600",
                                            color: p.state === "PAID" ? "#2E7D32" : "#E08A2C",
                                        }}
                                    >
                                        {p.state === "PAID" ? "Paid" : "To be paid"}
                                    </ThemedText>

                                    <ThemedText style={{ fontSize: 10, color: "#B0B0B0", marginTop: 1 }}>
                                        {p.createdByName} • {new Date(p.createdAt).toLocaleString()}
                                    </ThemedText>
                                </View>

                                <ThemedText style={{ fontSize: 13, fontWeight: "700", color: "#D32F2F" }}>
                                    -${p.amount}
                                </ThemedText>
                            </View>
                        );
                    })
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rateBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabRow: {
        flexDirection: "row",
    },
    tabButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
    },
    milestoneChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    confirmCard: {
        padding: 12,
        borderRadius: 12,
        marginTop: 10,
    },
    methodChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryChip: {
        width: "31%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: "2%",
        marginBottom: 8,
    },
    paidBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(128,128,128,0.25)",
    },
    entryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(128,128,128,0.15)",
    },
});