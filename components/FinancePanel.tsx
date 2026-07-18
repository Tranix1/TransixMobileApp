/**
 * FinancePanel.tsx
 *
 * Drop-in finance card for an assignment/load: Income + Expenses.
 *
 * INCOME is now about the LOAD OWNER paying the fleet, tracked against the
 * load's payment terms (milestones). You pass in `rate`, `ratePerKm` and
 * `paymentTerms` (e.g. 50% on loading / 50% on delivery, or 100% on
 * loading). Each milestone shows the calculated amount ("if rate is
 * 5000 and terms are 50/50 -> $2500"), and the user taps it, confirms the
 * amount actually received (editable, in case it's not exact), picks how
 * it was received (Bank / Cash), and hits Confirm. That writes an INCOME
 * entry and increments the assignment's totalIncome. Once a milestone is
 * confirmed it's locked (shown with a checkmark) so it can't be double
 * counted.
 *
 * EXPENSES work like before: Fuel / Police / Parking / VID / Driver /
 * Other, with up to 4 custom fields under "Other". Saving an expense
 * increments the assignment's totalExpenses. Note: driver payments are
 * now just a normal expense category — there is no more separate
 * "Payout" concept living inside expenses.
 *
 * USAGE:
 *   import FinancePanel from "./FinancePanel";
 *
 *   <FinancePanel
 *     visible={financeView}
 *     onClose={() => setFinanceView(false)}
 *     assignmentId={assignmentId}
 *     rate={load.rate}                 // total agreed rate for this load
 *     ratePerKm={load.ratePerKm}       // optional, shown at the top as a reference
 *     paymentTerms={[                  // optional, defaults to 100% "Full Payment"
 *       { id: "loading", label: "On Loading", percent: 50 },
 *       { id: "delivery", label: "On Delivery", percent: 50 },
 *     ]}
 *   />
 *
 * All data loading / saving / totals live inside this file — you just
 * toggle `visible` true/false from the parent screen.
 *
 * ⚠️ ADJUST THESE IMPORTS to match your project's actual paths:
 *   - db              (your firebase firestore instance)
 *   - ThemedText       (your themed text component)
 *   - Input            (your themed input component)
 *   - wp               (your responsive width helper, e.g. react-native-responsive-screen)
 *   - useAuth           (however you currently get { user, currentRole })
 *   - useThemeColor    (however you currently get themed colors)
 *
 * Everything else (state, firestore calls, UI) is self-contained below.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
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
// ------------------------------------------------------

type EntryType = "INCOME" | "EXPENSE";
type PaymentMethod = "BANK" | "CASH";
type ExpenseCategory = "FUEL" | "POLICE" | "PARKING" | "VID" | "DRIVER" | "CUSTOM";
type PanelTab = "INCOME" | "EXPENSE";

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
    entryType: EntryType;
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

interface FinancePanelProps {
    visible: boolean;
    onClose: () => void;
    assignmentId: string;
    // Total agreed rate for this load. Milestone amounts are calculated from this.
    rate: number;
    // Informational only, shown at the top of the panel (e.g. "$2.00/km").
     cargoRateCurrency:string 
    cargoRateModel : string 
    ratePerKm?: number;
    // Payment milestones for this load, e.g. 50/50 split or 100% on loading.
    // Defaults to a single "Full Payment" (100%) milestone if not provided.
    paymentTerms?: PaymentMilestone[];
}

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: any }[] = [
    { key: "FUEL", label: "Fuel", icon: "flame-outline" },
    { key: "POLICE", label: "Police", icon: "shield-outline" },
    { key: "PARKING", label: "Parking", icon: "car-outline" },
    { key: "VID", label: "VID", icon: "document-text-outline" },
    { key: "DRIVER", label: "Driver", icon: "person-outline" },
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
}: FinancePanelProps) {
    const { user, currentRole } = useAuth();
    const fleetId = currentRole?.organizationId || currentRole?.fleetId || "";

    const backgroundLight = useThemeColor("backgroundLight");
    const accent = useThemeColor("accent");
    const icon = useThemeColor("icon");
    const background = useThemeColor("background");

    const terms = paymentTerms && paymentTerms.length > 0 ? paymentTerms : DEFAULT_TERMS;

    const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
    const [loadingFinance, setLoadingFinance] = useState(false);
    const [savingFinance, setSavingFinance] = useState(false);

    const [tab, setTab] = useState<PanelTab>("INCOME");

    // ---------- EXPENSE FORM STATE ----------
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

    // ---------- LOAD FINANCE ENTRIES ----------
    const loadAssignmentFinance = async () => {
        if (!fleetId || !assignmentId) return;

        try {
            setLoadingFinance(true);

            const financeRef = collection(db, "fleets", fleetId, "Finance", "Account", "Transactions");
            const q = query(financeRef, where("tripId", "==", assignmentId), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);

            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FinanceEntry));
            setFinanceEntries(data);
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

    // ---------- SAVE EXPENSE ----------
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

    // ---------- DELETE ----------
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

        return { totalIncome, totalExpense, net: totalIncome - totalExpense };
    }, [financeEntries]);

    if (!visible) return null;

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
                            Rate <ThemedText style={{ fontSize: 12, fontWeight: "700", color: icon }}>{cargoRateCurrency} {rate } {cargoRateModel} </ThemedText>
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
            <View style={{ flexDirection: "row", marginTop: wp(3), marginBottom: wp(3) }}>
                {[
                    { label: "Income", value: financeSummary.totalIncome, color: "#2E7D32" },
                    { label: "Expenses", value: financeSummary.totalExpense, color: "#D32F2F" },
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
                            ${s.value.toFixed(2)}
                        </ThemedText>
                    </View>
                ))}
            </View>

            {/* TAB SWITCH */}
            <View style={styles.tabRow}>
                {(["INCOME", "EXPENSE"] as PanelTab[]).map((t) => (
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
                            {t === "INCOME" ? "Income" : "Expenses"}
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
                                                ${milestoneAmount.toFixed(2)}
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
                /* ===================== EXPENSES TAB ===================== */
                <View style={{ marginTop: wp(3) }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: wp(2.5) }}>
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
                    </View>

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
                        onPress={saveExpense}
                    >
                        <ThemedText style={{ color: backgroundLight, fontWeight: "700" }}>
                            {savingFinance ? "Saving..." : "Add Expense"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            )}

            {/* ENTRY LIST */}
            <View style={{ marginTop: wp(3.5) }}>
                <ThemedText style={{ fontSize: 12.5, fontWeight: "700", color: icon, marginBottom: wp(1.5) }}>
                    History
                </ThemedText>

                {loadingFinance ? (
                    <ActivityIndicator size="small" color={accent} style={{ marginVertical: wp(2) }} />
                ) : financeEntries.length === 0 ? (
                    <ThemedText style={{ fontSize: 12, color: "#999" }}>No financial records yet.</ThemedText>
                ) : (
                    financeEntries.map((item) => (
                        <View key={item.id} style={styles.entryRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText style={{ fontSize: 13, fontWeight: "600" }}>
                                    {item.entryType === "INCOME"
                                        ? `${item.milestoneLabel || "Income"} • ${
                                              item.paymentMethod === "CASH" ? "Cash" : "Bank"
                                          }`
                                        : EXPENSE_CATEGORIES.find((c) => c.key === item.category)?.label || "Expense"}
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
                                        color: item.entryType === "INCOME" ? "#2E7D32" : "#D32F2F",
                                        marginRight: wp(2),
                                    }}
                                >
                                    {item.entryType === "INCOME" ? "+" : "-"}${item.amount.toFixed(2)}
                                </ThemedText>
                                <TouchableOpacity onPress={() => deleteFinanceEntry(item)}>
                                    <Ionicons name="close-outline" size={16} color="#B0B0B0" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
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
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
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
