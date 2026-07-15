/**
 * FinancePanel.tsx
 *
 * Drop-in finance card for an assignment: payouts (monthly / per trip)
 * and expenses (Police, Fuel, Parking, VID + up to 4 custom fields).
 *
 * USAGE:
 *   import FinancePanel from "./FinancePanel";
 *
 *   <FinancePanel
 *     visible={financeView}
 *     onClose={() => setFinanceView(false)}
 *     assignmentId={assignmentId}
 *   />
 *
 * All data loading / saving / totals live inside this file — you just
 * toggle `visible` true/false from the parent screen.
 *
 * ⚠️ ADJUST THESE 6 IMPORTS to match your project's actual paths:
 *   - db              (your firebase firestore instance)
 *   - ThemedText       (your themed text component)
 *   - Input            (your themed input component)
 *   - wp               (your responsive width helper, e.g. react-native-responsive-screen)
 *   - useAuth / user    (however you currently get the logged-in user)
 *   - useCurrentRole / currentRole (however you currently get userRole / accType)
 *
 * Everything else (state, firestore calls, UI) is self-contained below.
 */

import React, { useState, useMemo } from "react";
import {
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";

// ---- ADJUST THESE IMPORTS TO MATCH YOUR PROJECT ----
import { db } from "@/db/fireBaseConfig";
import { ThemedText } from "./ThemedText";
import Input from "./Input";
import { wp } from "@/constants/common";
import { useAuth } from "@/context/AuthContext";
// ------------------------------------------------------

type EntryType = "PAYOUT" | "EXPENSE";
type PayoutFrequency = "MONTHLY" | "PER_TRIP";
type ExpenseCategory = "FUEL" | "POLICE" | "PARKING" | "VID" | "CUSTOM";

interface CustomField {
    label: string;
    value: string;
}

interface FinanceEntry {
    id: string;
    entryType: EntryType;
    payoutFrequency?: PayoutFrequency;
    category?: ExpenseCategory;
    customFields?: CustomField[];
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
    accent?: string;
    icon?: string;
    backgroundLight?: string;
}

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: any }[] = [
    { key: "FUEL", label: "Fuel", icon: "flame-outline" },
    { key: "POLICE", label: "Police", icon: "shield-outline" },
    { key: "PARKING", label: "Parking", icon: "car-outline" },
    { key: "VID", label: "VID", icon: "document-text-outline" },
    { key: "CUSTOM", label: "Other", icon: "add-circle-outline" },
];

export default function FinancePanel({
    visible,
    onClose,
    assignmentId,
    accent = "#4F46E5",
    icon = "#555",
    backgroundLight = "#F5F6FA",
}: FinancePanelProps) {
    const { user } = useAuth();
    const { currentRole } = useAuth();

    const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
    const [loadingFinance, setLoadingFinance] = useState(false);
    const [savingFinance, setSavingFinance] = useState(false);

    const [entryType, setEntryType] = useState<EntryType>("PAYOUT");
    const [payoutFrequency, setPayoutFrequency] = useState<PayoutFrequency>("PER_TRIP");
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("FUEL");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    // ---------- LOAD ----------
    const loadAssignmentFinance = async () => {
        if (!assignmentId) return;
        try {
            setLoadingFinance(true);
            const financeRef = collection(db, "assignmentFinance", assignmentId, "entries");
            const snap = await getDocs(query(financeRef, orderBy("createdAt", "desc")));
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FinanceEntry));
            setFinanceEntries(data);
        } catch (error) {
            console.log("Finance load error", error);
        } finally {
            setLoadingFinance(false);
        }
    };

    // Fires whenever the panel becomes visible
    React.useEffect(() => {
        if (visible) {
            loadAssignmentFinance();
        }
    }, [visible, assignmentId]);

    // ---------- CUSTOM FIELD HELPERS ----------
    const addCustomField = () => {
        if (customFields.length >= 4) return;
        setCustomFields((prev) => [...prev, { label: "", value: "" }]);
    };

    const updateCustomField = (index: number, key: "label" | "value", val: string) => {
        setCustomFields((prev) =>
            prev.map((f, i) => (i === index ? { ...f, [key]: val } : f))
        );
    };

    const removeCustomField = (index: number) => {
        setCustomFields((prev) => prev.filter((_, i) => i !== index));
    };

    // ---------- SAVE ----------
    const saveFinanceEntry = async () => {
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !assignmentId) return;

        try {
            setSavingFinance(true);
            const financeRef = collection(db, "assignmentFinance", assignmentId, "entries");

            const payload: any = {
                entryType,
                amount: numericAmount,
                note: note.trim(),
                createdAt: Date.now(),
                createdBy: user?.uid ?? "",
                createdByName: user?.displayName ?? "User",
                createdByRole: currentRole?.userRole ?? "User",
                createdByAccRole: currentRole?.accType ?? "",
            };

            if (entryType === "PAYOUT") {
                payload.payoutFrequency = payoutFrequency;
            } else {
                payload.category = expenseCategory;
                if (expenseCategory === "CUSTOM") {
                    payload.customFields = customFields.filter(
                        (f) => f.label.trim() && f.value.trim()
                    );
                }
            }

            await addDoc(financeRef, payload);

            setAmount("");
            setNote("");
            setCustomFields([]);
            loadAssignmentFinance();
        } catch (error) {
            console.log("Finance save error", error);
            Alert.alert("Error", "Failed to save financial entry. Please try again.");
        } finally {
            setSavingFinance(false);
        }
    };

    // ---------- DELETE ----------
    const deleteFinanceEntry = async (entryId: string) => {
        if (!assignmentId) return;
        try {
            await deleteDoc(doc(db, "assignmentFinance", assignmentId, "entries", entryId));
            setFinanceEntries((prev) => prev.filter((e) => e.id !== entryId));
        } catch (error) {
            console.log("Finance delete error", error);
            Alert.alert("Error", "Failed to delete entry.");
        }
    };

    // ---------- TOTALS ----------
    const financeSummary = useMemo(() => {
        let totalPayout = 0;
        let totalExpense = 0;
        const byCategory: Record<string, number> = {
            FUEL: 0,
            POLICE: 0,
            PARKING: 0,
            VID: 0,
            CUSTOM: 0,
        };

        financeEntries.forEach((e) => {
            if (e.entryType === "PAYOUT") {
                totalPayout += e.amount || 0;
            } else {
                totalExpense += e.amount || 0;
                if (e.category) byCategory[e.category] += e.amount || 0;
            }
        });

        return { totalPayout, totalExpense, net: totalPayout - totalExpense, byCategory };
    }, [financeEntries]);

    if (!visible) return null;

    return (
        <View
            style={{
                marginTop: wp(3),
                padding: wp(3.5),
                borderRadius: wp(3),
                backgroundColor: backgroundLight,
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
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: wp(3),
                }}
            >
                <ThemedText style={{ fontSize: 16, fontWeight: "700", color: accent }}>
                    Finance
                </ThemedText>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close-circle-outline" size={22} color="#777" />
                </TouchableOpacity>
            </View>

            {/* SUMMARY ROW */}
            <View style={{ flexDirection: "row", marginBottom: wp(3) }}>
                {[
                    { label: "Payout", value: financeSummary.totalPayout, color: "#2E7D32" },
                    { label: "Expenses", value: financeSummary.totalExpense, color: "#D32F2F" },
                    {
                        label: "Net",
                        value: financeSummary.net,
                        color: financeSummary.net >= 0 ? "#2E7D32" : "#D32F2F",
                    },
                ].map((s, idx) => (
                    <View
                        key={s.label}
                        style={{
                            flex: 1,
                            marginRight: idx < 2 ? wp(2) : 0,
                            padding: wp(2.5),
                            borderRadius: wp(2.5),
                            backgroundColor: "#fff",
                            alignItems: "center",
                        }}
                    >
                        <ThemedText style={{ fontSize: 10.5, color: "#8A8A8E" }}>
                            {s.label}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 14, fontWeight: "700", color: s.color }}>
                            ${s.value.toFixed(2)}
                        </ThemedText>
                    </View>
                ))}
            </View>

            {/* ENTRY TYPE TOGGLE */}
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: "#fff",
                    borderRadius: wp(2),
                    padding: 4,
                    marginBottom: wp(2.5),
                }}
            >
                {(["PAYOUT", "EXPENSE"] as EntryType[]).map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setEntryType(t)}
                        style={{
                            flex: 1,
                            paddingVertical: wp(1.8),
                            borderRadius: wp(1.8),
                            alignItems: "center",
                            backgroundColor: entryType === t ? accent : "transparent",
                        }}
                    >
                        <ThemedText
                            style={{
                                fontWeight: "700",
                                fontSize: 12,
                                color: entryType === t ? "#fff" : icon,
                            }}
                        >
                            {t === "PAYOUT" ? "Payout" : "Expense"}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* PAYOUT FREQUENCY */}
            {entryType === "PAYOUT" && (
                <View style={{ flexDirection: "row", marginBottom: wp(2.5) }}>
                    {(["PER_TRIP", "MONTHLY"] as PayoutFrequency[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setPayoutFrequency(f)}
                            style={{
                                flex: 1,
                                marginRight: f === "PER_TRIP" ? wp(2) : 0,
                                paddingVertical: wp(1.8),
                                borderRadius: wp(2),
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor:
                                    payoutFrequency === f ? accent : "rgba(128,128,128,0.3)",
                                backgroundColor: payoutFrequency === f ? "#EEF2FF" : "#fff",
                            }}
                        >
                            <ThemedText
                                style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: payoutFrequency === f ? accent : icon,
                                }}
                            >
                                {f === "PER_TRIP" ? "Per Trip" : "Monthly"}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* EXPENSE CATEGORY CHIPS */}
            {entryType === "EXPENSE" && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: wp(2.5) }}>
                    {EXPENSE_CATEGORIES.map((c) => (
                        <TouchableOpacity
                            key={c.key}
                            onPress={() => setExpenseCategory(c.key)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: wp(3),
                                paddingVertical: wp(1.5),
                                borderRadius: wp(5),
                                borderWidth: 1,
                                borderColor:
                                    expenseCategory === c.key ? accent : "rgba(128,128,128,0.3)",
                                backgroundColor: expenseCategory === c.key ? "#EEF2FF" : "#fff",
                                marginRight: wp(2),
                                marginBottom: wp(2),
                            }}
                        >
                            <Ionicons
                                name={c.icon}
                                size={14}
                                color={expenseCategory === c.key ? accent : "#8A8A8E"}
                                style={{ marginRight: 4 }}
                            />
                            <ThemedText
                                style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: expenseCategory === c.key ? accent : icon,
                                }}
                            >
                                {c.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* CUSTOM FIELDS (up to 4, only for "Other") */}
            {entryType === "EXPENSE" && expenseCategory === "CUSTOM" && (
                <View style={{ marginBottom: wp(2.5) }}>
                    {customFields.map((field, i) => (
                        <View
                            key={i}
                            style={{ flexDirection: "row", alignItems: "center", marginBottom: wp(1.5) }}
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
                            style={{ flexDirection: "row", alignItems: "center", marginTop: wp(1) }}
                        >
                            <Ionicons name="add-circle-outline" size={16} color={accent} />
                            <ThemedText
                                style={{ fontSize: 12, color: accent, marginLeft: 4, fontWeight: "600" }}
                            >
                                Add field ({customFields.length}/4)
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* AMOUNT + NOTE */}
            <Input
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
            />
            <Input
                placeholder="Note (optional)"
                value={note}
                onChangeText={setNote}
                style={{ marginTop: wp(1.5) }}
            />

            <TouchableOpacity
                style={[
                    styles.actionButton,
                    { marginTop: wp(2.5), justifyContent: "center", backgroundColor: "#fff" },
                ]}
                disabled={savingFinance || !amount.trim()}
                onPress={saveFinanceEntry}
            >
                <ThemedText style={{ color: accent, fontWeight: "700" }}>
                    {savingFinance ? "Saving..." : `Add ${entryType === "PAYOUT" ? "Payout" : "Expense"}`}
                </ThemedText>
            </TouchableOpacity>

            {/* ENTRY LIST */}
            <View style={{ marginTop: wp(3) }}>
                {loadingFinance ? (
                    <ActivityIndicator size="small" color={accent} style={{ marginVertical: wp(2) }} />
                ) : financeEntries.length === 0 ? (
                    <ThemedText style={{ fontSize: 12, color: "#999" }}>
                        No financial records yet.
                    </ThemedText>
                ) : (
                    financeEntries.map((item) => (
                        <View
                            key={item.id}
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
                                    {item.entryType === "PAYOUT"
                                        ? `Payout • ${item.payoutFrequency === "MONTHLY" ? "Monthly" : "Per Trip"}`
                                        : EXPENSE_CATEGORIES.find((c) => c.key === item.category)?.label ||
                                          "Expense"}
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
                                        color: item.entryType === "PAYOUT" ? "#2E7D32" : "#D32F2F",
                                        marginRight: wp(2),
                                    }}
                                >
                                    {item.entryType === "PAYOUT" ? "+" : "-"}${item.amount.toFixed(2)}
                                </ThemedText>
                                <TouchableOpacity onPress={() => deleteFinanceEntry(item.id)}>
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
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(128,128,128,0.25)",
    },
});
