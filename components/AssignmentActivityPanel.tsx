import React, { useState, useEffect } from "react";
import { ThemedText } from "./ThemedText";
import { View, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { db } from "@/db/fireBaseConfig";
import { collection, orderBy, updateDoc, doc, increment, where, getDocs, query, addDoc, getDoc } from "firebase/firestore";
import { wp, hp } from "@/constants/common";
import Input from "./Input";
import FinancePanel from "./FinancePanel";
import { sendPushNotification } from "@/Utilities/pushNotification";
import { readById } from "@/db/operations";

type Props = {
    assignmentId: string;
    fleetId?: string;

    cargoRate?: number;
    cargoRateCurrency?: string;
    cargoRateModel?: string;
    cargoRatePerKm?: number;
    cargoPaymentTerms?: any;

    initialNotesCount?: number;
    initialIssuesCount?: number;

    fleetCoordinator:{
            id: string,
              name: string,
              phoneNumber :string ,
              organizationId :string
    }
    numberPlate : string
    truckId : string

};


export default function AssignmentActivityPanel({
    assignmentId,
    fleetId,
    cargoRate,
    cargoRateCurrency,
    cargoRateModel,
    cargoRatePerKm,
    cargoPaymentTerms,
    initialNotesCount,
    initialIssuesCount,
    fleetCoordinator ,
    numberPlate ,
    truckId ,
}: Props) {

    // existing logic here
    const { user, currentRole } = useAuth();
    const backgroundLight = useThemeColor("backgroundLight")
    const background = useThemeColor("background")
    const accent = useThemeColor("accent")
    const icon = useThemeColor("icon")

    const [activityView, setActivityView] = useState<"NOTE" | "ISSUE" | null>(null);
    const [activityText, setActivityText] = useState("");
    const [assignmentActivity, setAssignmentActivity] = useState<any[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    const [financeView, setFinanceView] = useState(false)

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
        setFinanceView(false)
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



            if (activityView === "ISSUE") {



                if (fleetCoordinator?.id) {

                    const coordinatorData = await readById(
                        "personalData",
                        fleetCoordinator.id
                    ) as {
                        id: string;
                        expoPushToken?: string;
                    };

                    const expoPushToken = coordinatorData?.expoPushToken;

                    if (expoPushToken) {

                        await sendPushNotification(
                            expoPushToken,
                            "New Load Assignment 📦",
                            `A new load has been assigned to truck ${numberPlate}. Please review the assignment.`,
                            {
                                pathname: "/Fleet/AssignmentDetails",
                                params: {
                                    assignmentId,
                                },
                            },
                            {
                                type: "load_assignment",
                                assignmentId,
                                truckId,
                                fleetId,
                            }
                        );

                    } else {
                        alert("Fleet coordinator has no push token");
                    }

                } else {
                    alert("No fleet coordinator linked");
                }

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
        <>
            <View>
                {/* NOTES + ISSUES TRIGGERS */}
                <View style={{ flexDirection: "row", gap: wp(2), marginTop: wp(2) }}>

                    {/* FINANCE */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            {
                                borderColor: "#1E8E5A",
                                backgroundColor: "#1E8E5A25",
                            },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => { setActivityView(null); setFinanceView(true) }}
                    >
                        <Ionicons
                            name="wallet-outline"
                            size={16}
                            color="#1E8E5A"
                        />

                        <ThemedText
                            style={{
                                color: "#1E8E5A",
                                fontWeight: "600",
                            }}
                        >
                            Finance
                        </ThemedText>
                    </TouchableOpacity>


                    {/* NOTES */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openPanel("NOTE")}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={accent}
                        />

                        <ThemedText style={{ color: accent }}>
                            Notes ({counts.notesCount})
                        </ThemedText>
                    </TouchableOpacity>


                    {/* ISSUES */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            {
                                borderColor: "#F44336",
                                backgroundColor: "#F4433612",
                            },
                        ]}
                        onPress={() => openPanel("ISSUE")}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="warning-outline"
                            size={16}
                            color="#F44336"
                        />

                        <ThemedText style={{ color: "#F44336" }}>
                            Issues ({counts.issuesCount})
                        </ThemedText>
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


                <FinancePanel
                    visible={financeView}
                    onClose={() => setFinanceView(false)}
                    assignmentId={assignmentId}
                    rate={Number(cargoRate)}
                    cargoRateCurrency={cargoRateCurrency || ""}
                    cargoRateModel={cargoRateModel || ""}
                    ratePerKm={Number(cargoRatePerKm)}
                    paymentTerms={cargoPaymentTerms}
                />



            </View>
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
        gap: 10,
    },

    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
    },

    statValue: {
        fontSize: 20,
        fontWeight: "700",
    },

    statLabel: {
        fontSize: 12,
        marginTop: 4,
        opacity: 0.7,
    },

    actionRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 12,
    },

    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },

    actionButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    bottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "90%",
    },

    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    closeButton: {
        padding: 4,
    },

    listContent: {
        paddingBottom: 20,
    },

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },

    emptyText: {
        fontSize: 14,
        color: "#888",
    },

    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 16,
    },

    saveButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 10,
    },

    saveButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },

    divider: {
        height: 1,
        marginVertical: 12,
        opacity: 0.15,
    },
});