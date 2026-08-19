import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ToastAndroid,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    orderBy,
} from "firebase/firestore";

import { ThemedText } from "@/components/ThemedText";
import { wp, hp } from "@/constants/common";
import { SelectLocationProp, TruckNeededType, TruckFormData, TruckTypeProps } from "@/types/types";
import { LocationSelector } from "@/components/LocationSelector";
// NOTE: adjust this import path if TruckRequirementsSection lives elsewhere
import { TruckRequirementsSection } from "@/app/Logistics/Loads/TruckRequirementsSection";
import { addDocument } from "@/db/operations";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/fireBaseConfig";

interface LoadAlertsModalProps {
    visible: boolean;
    onClose: () => void;
    background: string;
    backgroundLight: string;
    border: string;
    textlight: string;
}

interface LoadAlertItem {
    id: string;
    pickupLocation: SelectLocationProp | null;
    dropoffLocation: SelectLocationProp | null;
    trucksNotified: TruckNeededType[];
    permitedCountries?: string[];
    ratePerKm: number;
    tripType: "roundtrip" | "one-way";
    userName?: string;
    userId?: string;
    active: boolean;
    createdAt: string;
}

const BRAND = {
    navy: "#12315C",
    teal: "#0E8C82",
};

type TabKey = "create" | "myAlerts";

export default function LoadAlertsModal({
    visible,
    onClose,
    background,
    backgroundLight,
    border,
    textlight,
}: LoadAlertsModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("create");

    // Pickup / Drop-off locations (via LocationSelector)
    const [pickupLocation, setPickupLocation] = useState<SelectLocationProp | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<SelectLocationProp | null>(null);
    const [dspFromLocation, setDspFromLocation] = useState(false);
    const [dspToLocation, setDspToLocation] = useState(false);
    const [locationPicKERdSP, setPickLocationOnMap] = useState(false);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [durationInTraffic, setDurationInTraffic] = useState("");

    // Truck requirements
    const [trucksNeeded, setTrucksNeeded] = useState<TruckNeededType[]>([]);
    const [selectedTruckType, setSelectedTruckType] = useState<{ id: number; name: string } | null>(null);
    const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null);
    const [selectedTankerType, setSelectedTankerType] = useState<{ id: number; name: string } | null>(null);
    const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number; name: string } | null>(null);
    const [formDataTruck, setFormDataTruck] = useState<TruckFormData>({} as TruckFormData);

    // TruckRequirementsSection also expects its own show/operationCountries pair
    const [truckShowCountries, setTruckShowCountries] = useState(false);
    const [truckOperationCountries, setTruckOperationCountries] = useState<string[]>([]);

    // Rate + trip type
    const [ratePerKm, setRatePerKm] = useState("");
    const [tripType, setTripType] = useState<"roundtrip" | "one-way" | null>(null);
    const [saving, setSaving] = useState(false);

    // My Alerts list
    const [myAlerts, setMyAlerts] = useState<LoadAlertItem[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        if (!visible || activeTab !== "myAlerts" || !user?.uid) return;

        setLoadingAlerts(true);

        const alertsQuery = query(
            collection(db, "loadAlerts"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            alertsQuery,
            (snapshot) => {
                const items: LoadAlertItem[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<LoadAlertItem, "id">),
                }));
                setMyAlerts(items);
                setLoadingAlerts(false);
            },
            (error) => {
                console.error("Error fetching load alerts:", error);
                setLoadingAlerts(false);
            }
        );

        return () => unsubscribe();
    }, [visible, activeTab, user?.uid]);

    const pushTruck = () => {
        if (!selectedTruckType) {
            ToastAndroid.show("Please select a truck type", ToastAndroid.SHORT);
            return;
        }

        setTrucksNeeded((prev) => [
            ...prev,
            {
                truckType: selectedTruckType,
                cargoArea: selectedCargoArea,
                tankerType: selectedTankerType,
                capacity: selectedTruckCapacity,
                operationCountries: truckOperationCountries,
            } as TruckNeededType,
        ]);

        setSelectedTruckType(null);
        setSelectedCargoArea(null);
        setSelectedTankerType(null);
        setSelectedTruckCapacity(null);
        setTruckOperationCountries([]);
    };

    const removeTruck = (index: number) => {
        setTrucksNeeded((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setPickupLocation(null);
        setDropoffLocation(null);
        setDistance("");
        setDuration("");
        setDurationInTraffic("");
        setTrucksNeeded([]);
        setRatePerKm("");
        setTripType(null);
    };

    const handleSave = async () => {
        const errors: string[] = [];

        if (!pickupLocation?.description) errors.push("Pickup location");
        if (!dropoffLocation?.description) errors.push("Drop-off location");
        if (trucksNeeded.length === 0) errors.push("Truck requirement");
        if (!ratePerKm || isNaN(Number(ratePerKm)) || Number(ratePerKm) <= 0) errors.push("Rate per Km");
        if (!tripType) errors.push("Trip type");

        if (errors.length > 0) {
            ToastAndroid.show(
                `Please complete: ${errors.join(", ")}`,
                ToastAndroid.LONG
            );
            return;
        }

        setSaving(true);
        try {
            await addDocument("loadAlerts", {
                pickupLocation,
                dropoffLocation,
                trucksNotified: trucksNeeded,
                ratePerKm: Number(ratePerKm),
                tripType: tripType as "roundtrip" | "one-way",
                userName: user?.displayName || "",
                userId: user?.uid || "",
                active: true,
                createdAt: new Date().toISOString(),
            });

            ToastAndroid.show("Load alerts enabled", ToastAndroid.SHORT);

            resetForm();
            setActiveTab("myAlerts");
        } catch (error) {
            console.error("Error saving load alert:", error);
            ToastAndroid.show("Failed to save alert, please try again", ToastAndroid.SHORT);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleAlert = async (alert: LoadAlertItem) => {
        setTogglingId(alert.id);
        try {
            await updateDoc(doc(db, "loadAlerts", alert.id), {
                active: !alert.active,
            });
        } catch (error) {
            console.error("Error toggling load alert:", error);
            ToastAndroid.show("Failed to update alert, please try again", ToastAndroid.SHORT);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.overlay}>

                    {/* Close when tapping outside */}
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={onClose}
                    />

                    <View
                        style={[
                            styles.modal,
                            {
                                backgroundColor: background,
                                borderColor: border,
                            },
                        ]}
                    >

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                <ThemedText style={styles.title}>
                                    Load Alerts
                                </ThemedText>

                                <ThemedText
                                    type="tiny"
                                    style={{
                                        color: textlight,
                                        marginTop: hp(0.4),
                                    }}
                                >
                                    {activeTab === "create"
                                        ? "Get notified when matching loads are available."
                                        : "Tap an alert to enable or disable it."}
                                </ThemedText>
                            </View>

                            <TouchableOpacity
                                onPress={onClose}
                                style={[
                                    styles.closeButton,
                                    { backgroundColor: backgroundLight },
                                ]}
                            >
                                <Ionicons name="close" size={wp(5)} color={textlight} />
                            </TouchableOpacity>
                        </View>


                        {/* Tabs */}
                        <View
                            style={[
                                styles.tabBar,
                                {
                                    backgroundColor: backgroundLight,
                                    borderColor: border,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setActiveTab("create")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "create" && { backgroundColor: BRAND.teal },
                                ]}
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={wp(4)}
                                    color={activeTab === "create" ? "#fff" : textlight}
                                />
                                <ThemedText
                                    type="tiny"
                                    style={{
                                        color: activeTab === "create" ? "#fff" : textlight,
                                        fontWeight: "700",
                                    }}
                                >
                                    Create Alert
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setActiveTab("myAlerts")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "myAlerts" && { backgroundColor: BRAND.teal },
                                ]}
                            >
                                <Ionicons
                                    name="list-outline"
                                    size={wp(4)}
                                    color={activeTab === "myAlerts" ? "#fff" : textlight}
                                />
                                <ThemedText
                                    type="tiny"
                                    style={{
                                        color: activeTab === "myAlerts" ? "#fff" : textlight,
                                        fontWeight: "700",
                                    }}
                                >
                                    My Alerts{myAlerts.length > 0 ? ` (${myAlerts.length})` : ""}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>


                        <ScrollView
                            style={{ maxHeight: hp(60) }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >

                            {activeTab === "create" ? (
                                <>
                                    {/* Pickup / Drop-off locations */}
                                    <ThemedText style={styles.label}>
                                        Route
                                    </ThemedText>

                                    <LocationSelector
                                        origin={pickupLocation}
                                        destination={dropoffLocation}
                                        setOrigin={setPickupLocation}
                                        setDestination={setDropoffLocation}
                                        dspFromLocation={dspFromLocation}
                                        setDspFromLocation={setDspFromLocation}
                                        dspToLocation={dspToLocation}
                                        setDspToLocation={setDspToLocation}
                                        locationPicKERdSP={locationPicKERdSP}
                                        setPickLocationOnMap={setPickLocationOnMap}
                                        distance={distance}
                                        duration={duration}
                                        durationInTraffic={durationInTraffic}
                                        iconColor={BRAND.teal}
                                        frstInputtTopic="Pickup location"
                                        secondInputTopic="Drop-off location"
                                    />


                                    {/* Truck requirements */}
                                    <ThemedText style={[styles.label, { marginTop: hp(1) }]}>
                                        Truck requirements
                                    </ThemedText>

                                    <TruckRequirementsSection
                                        trucksNeeded={trucksNeeded}
                                        removeTruck={removeTruck}
                                        onAddTruck={pushTruck}
                                        backgroundLight={backgroundLight}
                                        selectedTruckType={selectedTruckType}
                                        setSelectedTruckType={setSelectedTruckType}
                                        selectedCargoArea={selectedCargoArea}
                                        setSelectedCargoArea={setSelectedCargoArea}
                                        selectedTankerType={selectedTankerType}
                                        setSelectedTankerType={setSelectedTankerType}
                                        selectedTruckCapacity={selectedTruckCapacity}
                                        setSelectedTruckCapacity={setSelectedTruckCapacity}
                                        formDataTruck={formDataTruck}
                                        setFormDataTruck={setFormDataTruck}
                                        showCountries={truckShowCountries}
                                        setShowCountries={setTruckShowCountries}
                                        operationCountries={truckOperationCountries}
                                        setOperationCountries={setTruckOperationCountries}
                                    />


                                    {/* Rate per Km */}
                                    <ThemedText style={[styles.label, { marginTop: hp(1) }]}>
                                        Rate per Km
                                    </ThemedText>

                                    <View
                                        style={[
                                            styles.rateInputContainer,
                                            {
                                                backgroundColor: backgroundLight,
                                                borderColor: border,
                                            },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="cash"
                                            size={wp(5)}
                                            color={BRAND.teal}
                                        />

                                        <TextInput
                                            value={ratePerKm}
                                            onChangeText={setRatePerKm}
                                            keyboardType="decimal-pad"
                                            placeholder="0.00"
                                            placeholderTextColor={textlight}
                                            style={[styles.rateInput, { color: textlight }]}
                                        />

                                        <ThemedText type="tiny" style={{ color: textlight }}>
                                            / km
                                        </ThemedText>
                                    </View>


                                    {/* Trip type */}
                                    <ThemedText style={[styles.label, { marginTop: hp(1) }]}>
                                        Trip type
                                    </ThemedText>

                                    <View style={styles.tripTypeRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => setTripType("roundtrip")}
                                            style={[
                                                styles.tripTypeButton,
                                                {
                                                    backgroundColor:
                                                        tripType === "roundtrip" ? BRAND.teal : backgroundLight,
                                                    borderColor: border,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="repeat"
                                                size={wp(4.5)}
                                                color={tripType === "roundtrip" ? "#fff" : textlight}
                                            />
                                            <ThemedText
                                                type="tiny"
                                                style={{
                                                    color: tripType === "roundtrip" ? "#fff" : textlight,
                                                    fontWeight: "700",
                                                }}
                                            >
                                                Round trip
                                            </ThemedText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => setTripType("one-way")}
                                            style={[
                                                styles.tripTypeButton,
                                                {
                                                    backgroundColor:
                                                        tripType === "one-way" ? BRAND.teal : backgroundLight,
                                                    borderColor: border,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="arrow-forward"
                                                size={wp(4.5)}
                                                color={tripType === "one-way" ? "#fff" : textlight}
                                            />
                                            <ThemedText
                                                type="tiny"
                                                style={{
                                                    color: tripType === "one-way" ? "#fff" : textlight,
                                                    fontWeight: "700",
                                                }}
                                            >
                                                One direction
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>


                                    {/* Information */}
                                    <View
                                        style={[
                                            styles.infoBox,
                                            {
                                                backgroundColor: `${BRAND.teal}0D`,
                                                borderColor: `${BRAND.teal}30`,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="notifications-outline"
                                            size={wp(4.5)}
                                            color={BRAND.teal}
                                        />

                                        <ThemedText
                                            type="tiny"
                                            style={[styles.infoText, { color: textlight }]}
                                        >
                                            We'll notify you when loads matching these
                                            preferences are posted.
                                        </ThemedText>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {loadingAlerts ? (
                                        <View style={{ paddingVertical: hp(4), alignItems: "center" }}>
                                            <ActivityIndicator color={BRAND.teal} />
                                        </View>
                                    ) : myAlerts.length === 0 ? (
                                        <View style={{ paddingVertical: hp(4), alignItems: "center" }}>
                                            <Ionicons
                                                name="notifications-off-outline"
                                                size={wp(8)}
                                                color={textlight}
                                            />
                                            <ThemedText
                                                type="tiny"
                                                style={{ color: textlight, marginTop: hp(1) }}
                                            >
                                                You haven't created any load alerts yet.
                                            </ThemedText>
                                        </View>
                                    ) : (
                                        myAlerts.map((alert) => (
                                            <TouchableOpacity
                                                key={alert.id}
                                                activeOpacity={0.8}
                                                disabled={togglingId === alert.id}
                                                onPress={() => handleToggleAlert(alert)}
                                                style={[
                                                    styles.alertCard,
                                                    {
                                                        backgroundColor: backgroundLight,
                                                        borderColor: alert.active
                                                            ? `${BRAND.teal}55`
                                                            : border,
                                                    },
                                                ]}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <View style={styles.alertRouteRow}>
                                                        <Ionicons
                                                            name="location-outline"
                                                            size={wp(3.8)}
                                                            color={BRAND.teal}
                                                        />
                                                        <ThemedText
                                                            type="tiny"
                                                            numberOfLines={1}
                                                            style={{ color: textlight, flexShrink: 1 }}
                                                        >
                                                            {alert.pickupLocation?.description || "—"}
                                                        </ThemedText>
                                                        <Ionicons
                                                            name="arrow-forward"
                                                            size={wp(3.2)}
                                                            color={textlight}
                                                        />
                                                        <ThemedText
                                                            type="tiny"
                                                            numberOfLines={1}
                                                            style={{ color: textlight, flexShrink: 1 }}
                                                        >
                                                            {alert.dropoffLocation?.description || "—"}
                                                        </ThemedText>
                                                    </View>

                                                    <View style={styles.alertMetaRow}>
                                                        <View style={styles.pill}>
                                                            <ThemedText type="tiny" style={{ color: textlight }}>
                                                                {alert.tripType === "roundtrip" ? "Round trip" : "One direction"}
                                                            </ThemedText>
                                                        </View>

                                                        <View style={styles.pill}>
                                                            <ThemedText type="tiny" style={{ color: textlight }}>
                                                                ${alert.ratePerKm}/km
                                                            </ThemedText>
                                                        </View>
                                                    </View>

                                                    {/* Truck requirements for this alert */}
                                                    {alert.trucksNotified && alert.trucksNotified.length > 0 && (
                                                        <View style={styles.trucksList}>
                                                            {alert.trucksNotified.map((truck, index) => (
                                                                <View
                                                                    key={index}
                                                                    style={[
                                                                        styles.truckRow,
                                                                        { borderColor: border },
                                                                    ]}
                                                                >
                                                                    <MaterialCommunityIcons
                                                                        name="truck-outline"
                                                                        size={wp(4)}
                                                                        color={BRAND.navy}
                                                                    />

                                                                    <View style={{ flex: 1 }}>
                                                                        <ThemedText
                                                                            type="tiny"
                                                                            numberOfLines={1}
                                                                            style={{ color: textlight, fontWeight: "700" }}
                                                                        >
                                                                            {truck.truckType?.name || "Any truck type"}
                                                                        </ThemedText>

                                                                        <View style={styles.truckDetailRow}>
                                                                            {!!truck.cargoArea?.name && (
                                                                                <ThemedText type="tiny" style={{ color: textlight }}>
                                                                                    {truck.cargoArea.name}
                                                                                </ThemedText>
                                                                            )}

                                                                            {!!truck.tankerType?.name && (
                                                                                <ThemedText type="tiny" style={{ color: textlight }}>
                                                                                    {" • "}{truck.tankerType.name}
                                                                                </ThemedText>
                                                                            )}

                                                                            {!!truck.capacity?.name && (
                                                                                <ThemedText type="tiny" style={{ color: textlight }}>
                                                                                    {" • "}{truck.capacity.name}
                                                                                </ThemedText>
                                                                            )}
                                                                        </View>

                                                                        {truck.operationCountries && truck.operationCountries.length > 0 && (
                                                                            <ThemedText
                                                                                type="tiny"
                                                                                numberOfLines={1}
                                                                                style={{ color: textlight, marginTop: hp(0.2) }}
                                                                            >
                                                                                {truck.operationCountries.join(", ")}
                                                                            </ThemedText>
                                                                        )}
                                                                    </View>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={styles.alertStatusCol}>
                                                    {togglingId === alert.id ? (
                                                        <ActivityIndicator size="small" color={BRAND.teal} />
                                                    ) : (
                                                        <>
                                                            <View
                                                                style={[
                                                                    styles.statusDot,
                                                                    {
                                                                        backgroundColor: alert.active
                                                                            ? BRAND.teal
                                                                            : "#9CA3AF",
                                                                    },
                                                                ]}
                                                            />
                                                            <ThemedText
                                                                type="tiny"
                                                                style={{
                                                                    color: alert.active ? BRAND.teal : textlight,
                                                                    fontWeight: "700",
                                                                    marginTop: hp(0.3),
                                                                }}
                                                            >
                                                                {alert.active ? "Enabled" : "Disabled"}
                                                            </ThemedText>
                                                        </>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </>
                            )}

                        </ScrollView>

                        {/* Save — only for the create tab */}
                        {activeTab === "create" && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSave}
                                disabled={saving}
                                style={[
                                    styles.saveButton,
                                    { backgroundColor: BRAND.teal, opacity: saving ? 0.7 : 1 },
                                ]}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="notifications-outline"
                                            size={wp(4.5)}
                                            color="#fff"
                                        />

                                        <ThemedText style={styles.saveText}>
                                            Save Alert Preferences
                                        </ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    modal: {
        borderTopLeftRadius: wp(6),
        borderTopRightRadius: wp(6),
        borderWidth: 1,
        paddingHorizontal: wp(5),
        paddingTop: hp(2.5),
        paddingBottom: hp(3),
    },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: hp(2),
    },

    title: {
        fontSize: wp(5),
        fontWeight: "800",
    },

    closeButton: {
        width: wp(9),
        height: wp(9),
        borderRadius: wp(3),
        alignItems: "center",
        justifyContent: "center",
    },

    tabBar: {
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: wp(3),
        padding: wp(1),
        gap: wp(1),
        marginBottom: hp(2),
    },

    tabButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(1.5),
        height: hp(5),
        borderRadius: wp(2.5),
    },

    label: {
        fontSize: wp(3.4),
        fontWeight: "700",
        marginBottom: hp(0.8),
    },

    rateInputContainer: {
        height: hp(6.5),
        borderWidth: 1,
        borderRadius: wp(3),
        paddingHorizontal: wp(3.5),
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        marginBottom: hp(1.8),
    },

    rateInput: {
        flex: 1,
        fontSize: wp(3.6),
    },

    tripTypeRow: {
        flexDirection: "row",
        gap: wp(3),
        marginBottom: hp(1.8),
    },

    tripTypeButton: {
        flex: 1,
        height: hp(6),
        borderWidth: 1,
        borderRadius: wp(3),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(2),
    },

    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2.5),
        padding: wp(3),
        borderRadius: wp(3),
        borderWidth: 1,
        marginTop: hp(0.5),
        marginBottom: hp(2),
    },

    infoText: {
        flex: 1,
        lineHeight: wp(4.5),
    },

    saveButton: {
        height: hp(6.5),
        borderRadius: wp(3),
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: wp(2),
        marginTop: hp(1),
    },

    saveText: {
        color: "#fff",
        fontSize: wp(3.5),
        fontWeight: "800",
    },

    alertCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: wp(3),
        padding: wp(3.5),
        marginBottom: hp(1.2),
        gap: wp(3),
    },

    alertRouteRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1.5),
        marginBottom: hp(0.8),
    },

    alertMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(1.5),
    },

    pill: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.4),
        borderRadius: wp(4),
        backgroundColor: "rgba(14,140,130,0.12)",
    },

    trucksList: {
        marginTop: hp(1),
        gap: hp(0.8),
    },

    truckRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: wp(2),
        padding: wp(2.5),
        borderWidth: 1,
        borderRadius: wp(2.5),
    },

    truckDetailRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: hp(0.2),
    },

    alertStatusCol: {
        alignItems: "center",
        justifyContent: "center",
        minWidth: wp(14),
    },

    statusDot: {
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
    },
});