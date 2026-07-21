import React, { useEffect, useState } from "react";
import {
    View,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Alert, ToastAndroid,
} from "react-native";

import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    writeBatch
} from "firebase/firestore";

import { db } from "@/db/fireBaseConfig";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/useThemeColor";
import { wp, hp } from "@/constants/common";
import { Image } from "expo-image";
import { sendUserNotification } from "@/Utilities/pushNotification";
import { updateDocument } from "@/db/operations";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

type Props = {
    visible: boolean;
    onClose: () => void;
    fleetId: string;

    // Used for "Set Default Truck" — the driver this truck will be bound to.
    driverId?: string;
    driverName?: string;

    onAssigned?: (truck: any) => void;

    typeOfAction?: string; // "Assign Truck" | "Set Default Truck"
    assignmentId?: string;
    brokerageId?: string;
    assignmentSource?: string; // "Broker" | "Fleet"
};


export default function TruckDefaultModal({
    visible,
    onClose,
    fleetId,
    driverId,
    driverName,
    onAssigned,
    typeOfAction,
    assignmentId,
    brokerageId,
    assignmentSource,
}: Props) {

    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");
    const icon = useThemeColor("icon");
    const coolGray = useThemeColor("coolGray");


    const [trucks, setTrucks] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    const [loadingSubmitting, setLoadingSubmitting] = useState(false)


    const { currentRole } = useAuth()


    useEffect(() => {
        if (visible) {
            loadTrucks();
        }
    }, [visible]);



    const loadTrucks = async () => {

        try {
            setLoading(true);

            const trucksRef = collection(db, "fleets", fleetId, "Trucks");

            const snap = await getDocs(trucksRef);

            const list: any[] = [];

            snap.forEach((item) => {
                const data = item.data();

                list.push({ id: item.id, ...data });
            });

            setTrucks(list);
            setFiltered(list);

        } catch (err) {

            console.log("load trucks error", err);

        } finally {

            setLoading(false);

        }
    };




    const handleSearch = (text: string) => {

        setSearch(text);
        if (!text) {

            setFiltered(trucks);
            return;
        }
        const result = trucks.filter((truck) =>

            truck.truckNumberPlate
                ?.toLowerCase()
                .includes(text.toLowerCase()) ||
            truck.truckType
                ?.toLowerCase()
                .includes(text.toLowerCase())

        );
        setFiltered(result);

    };


    const setTruckToAssignment = async () => {


        if (!assignmentId) return
        setLoadingSubmitting(true)
        try {

            const truckDetails = {

                truckId: selected.id,
                truckType: selected.truckType || null,
                truckCapacity: selected.truckCapacity || null,
                cargoArea: selected.cargoArea || null,
                locations: selected.locations || [],
                trackingDeviceId: (selected as any).trackingDeviceId || null,


                numberPlate: selected.numberPlate || null,
                truckName: selected.truckName,
            };

            if (assignmentSource === "brokerage") {
                updateDocument(`brokerages/${brokerageId}/assignments`, assignmentId, {

                    status: "PENDING",
                    truckDetails,
                    fleetDetails: selected.organizationDetails ?? null,


                })


                updateDocument(`fleets/${fleetId}/assignments`, assignmentId, {

                    status: "PENDING",
                    truckDetails,
                    fleetDetails: selected.organizationDetails ?? null,


                })
            } else if (assignmentSource === "f`leet") {
                console.log("hiiii")

                updateDocument(`fleets/${fleetId}/assignments`, assignmentId, {

                    status: "PENDING",
                    truckDetails,
                    fleetDetails: selected.organizationDetails ?? null,

                })
            }


            ToastAndroid.show(
                `${selected.numberPlate} assigned to the load successfully`,
                ToastAndroid.SHORT
            );
            setLoadingSubmitting(false)
            onClose()

        } catch (e) {
            console.error(e)
            setLoadingSubmitting(false)

        }
    }




    const setDefaultTruck = async () => {
        if (!selected || !driverId) return;

        const oldDriverName =
            selected.defaultDriver?.driverName;

        if (
            oldDriverName &&
            selected.defaultDriver.driverId !== driverId
        ) {

            Alert.alert(
                "Move Truck?",
                `${selected.truckNumberPlate} is currently assigned to ${oldDriverName}. Move it here?`,
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Move",
                        onPress: () => saveTruck()
                    }
                ]
            );

            return;

        }


        saveTruck();

    };


    const saveTruck = async () => {

        if (!driverId) return;

        try {

            const batch = writeBatch(db);


            const truckRef = doc(db, "fleets", fleetId, "Trucks", selected.id);

            // If truck was already assigned to another driver
            if (
                selected.defaultDriver?.driverId &&
                selected.defaultDriver.driverId !== driverId
            ) {

                const oldDriverRef = doc(db, "fleets", fleetId, "Drivers", selected.defaultDriver.driverId);

                batch.update(oldDriverRef, { defaultTruck: null });

            }

            // Update truck
            batch.update(truckRef, {

                defaultDriver: {

                    driverId: driverId,

                    driverName: driverName || null,

                    assignedAt: serverTimestamp()

                }

            });



            // Update driver
            const driverRef = doc(
                db, "fleets", fleetId, "Drivers", driverId);

            batch.update(driverRef, {

                defaultTruck: {

                    truckId: selected.id,
                    truckNumberPlate: selected.truckNumberPlate,
                    imageUrl: selected.imageUrl || null,

                }

            });



            await batch.commit();



            // Notify truck owner AFTER successful save
            if (selected.expoPushToken) {
                await sendUserNotification(
                    selected.expoPushToken,
                    "New Driver Assignment 🚛",
                    `${driverName || "A driver"} has been assigned to ${selected.truckNumberPlate}`,
                    {
                        pathname: "/Fleet/TruckDetails",
                        params: {
                            truckId: selected.id,
                        },
                    },
                    {
                        type: "truck_driver_assignment",
                        truckId: selected.id,
                        fleetId,
                    }
                );
            } else {
                alert("Truck owner has no push token");
            }

            ToastAndroid.show(
                `${selected.truckNumberPlate} assigned successfully`,
                ToastAndroid.SHORT
            );

            onAssigned?.(selected);



            onClose();



        } catch (err) {

            console.log(
                "assign truck error:",
                err
            );

        }

    };




    return (

        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >


            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >


                <BlurView
                    intensity={80}
                    style={styles.blur}
                >


                    <Pressable
                        style={[
                            styles.modal,
                            {
                                backgroundColor: backgroundLight
                            }
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >



                        <View style={styles.header}>


                            <ThemedText type="title">
                                {typeOfAction === "Assign Truck" ? "Assign Truck" : "Default Truck"}
                            </ThemedText>


                            <TouchableOpacity onPress={onClose}>

                                <Ionicons
                                    name="close-circle"
                                    size={26}
                                    color={icon}
                                />

                            </TouchableOpacity>


                        </View>

                        <Input
                            placeholder="Search truck..."
                            value={search}
                            onChangeText={handleSearch}
                        />

                        {
                            loading ?

                                <ActivityIndicator
                                    style={{
                                        marginTop: wp(5)
                                    }}
                                />


                                :

                                <FlatList

                                    data={filtered}

                                    keyExtractor={(i) => i.id}

                                    showsVerticalScrollIndicator={false}


                                    renderItem={({ item }) => {

                                        const locations: string[] = item.locations || [];

                                        return (


                                            <TouchableOpacity
                                                onPress={() => {

                                                    if (selected?.id === item.id) {
                                                        setSelected(null);
                                                    } else {
                                                        setSelected(item);
                                                    }

                                                }}

                                                style={[
                                                    styles.card,
                                                    {
                                                        borderColor:
                                                            selected?.id === item.id
                                                                ? accent
                                                                : coolGray,

                                                        borderWidth:
                                                            selected?.id === item.id
                                                                ? 2
                                                                : 1,
                                                    }
                                                ]}
                                            >

                                                {
                                                    item.imageUrl ? (

                                                        <Image
                                                            source={{
                                                                uri: item.imageUrl
                                                            }}
                                                            style={styles.truckImage}
                                                        />

                                                    ) : (

                                                        <View style={[styles.truckImage, styles.truckImagePlaceholder, { backgroundColor: coolGray + '30' }]}>
                                                            <MaterialCommunityIcons
                                                                name="truck-outline"
                                                                size={30}
                                                                color={accent}
                                                            />
                                                        </View>

                                                    )
                                                }



                                                <View
                                                    style={{
                                                        flex: 1,
                                                        marginLeft: wp(3)
                                                    }}
                                                >


                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                        <ThemedText type="subtitle">
                                                            {item.truckName || "Unnamed Truck"}
                                                        </ThemedText>

                                                        <ThemedText
                                                            style={{
                                                                color: accent,
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            {item.numberPlate || "No plate"}
                                                        </ThemedText>
                                                    </View>



                                                    <View style={styles.infoRow}>

                                                        <Ionicons
                                                            name="car-outline"
                                                            size={15}
                                                            color={accent}
                                                        />

                                                        <ThemedText
                                                            style={styles.infoText}
                                                        >
                                                            {item.truckType || "--"}
                                                            {item.cargoArea ? ` · ${item.cargoArea}` : ""}
                                                        </ThemedText>

                                                    </View>


                                                    {
                                                        item.truckCapacity && (

                                                            <View style={styles.infoRow}>

                                                                <Ionicons
                                                                    name="speedometer-outline"
                                                                    size={15}
                                                                    color={accent}
                                                                />

                                                                <ThemedText
                                                                    style={styles.infoText}
                                                                >
                                                                    {item.truckCapacity}
                                                                </ThemedText>

                                                            </View>

                                                        )
                                                    }


                                                    {
                                                        locations.length > 0 && (

                                                            <View style={styles.infoRow}>

                                                                <Ionicons
                                                                    name="earth-outline"
                                                                    size={15}
                                                                    color={accent}
                                                                />

                                                                <ThemedText
                                                                    style={styles.infoText}
                                                                    numberOfLines={1}
                                                                >
                                                                    {locations.join(", ")}
                                                                </ThemedText>

                                                            </View>

                                                        )
                                                    }


                                                </View>




                                                {
                                                    selected?.id === item.id && (

                                                        <Ionicons
                                                            name="checkmark-circle"
                                                            size={24}
                                                            color={accent}
                                                        />

                                                    )
                                                }


                                            </TouchableOpacity>


                                        );

                                    }}
                                    ListEmptyComponent={<View>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => router.push("/Logistics/Trucks/AddTrucks")}
                                            style={{
                                                marginTop: wp(2),
                                                paddingVertical: wp(3),
                                                paddingHorizontal: wp(4),
                                                borderRadius: 10,
                                                backgroundColor: icon + "20",
                                                alignItems: "center",
                                            }}
                                        >
                                            <ThemedText style={{ fontWeight: "bold", color: accent }}>
                                                No trucks found
                                            </ThemedText>

                                            <ThemedText style={{ marginTop: wp(1), fontSize: 12 }}>
                                                Tap here to add a truck
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>}


                                />


                        }


                        <TouchableOpacity
                            disabled={!selected || loadingSubmitting}
                            onPress={typeOfAction === "Assign Truck" ? setTruckToAssignment : setDefaultTruck}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: selected ? accent : coolGray
                                }
                            ]}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                {loadingSubmitting && (
                                    <ActivityIndicator size="small" color="white" />
                                )}

                                <ThemedText
                                    style={{
                                        color: "white",
                                        fontWeight: "600"
                                    }}
                                >
                                    {typeOfAction === "Assign Truck" ? "Assign Truck" : "Set Default Truck"}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>



                    </Pressable>


                </BlurView>


            </Pressable>


        </Modal>


    )

}



const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end"
    },


    blur: {
        flex: 1,
        justifyContent: "flex-end"
    },


    modal: {
        width: "100%",
        height: hp(65),
        borderTopLeftRadius: wp(6),
        borderTopRightRadius: wp(6),
        padding: wp(4)
    },


    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: wp(3)
    },


    button: {
        marginTop: wp(3),
        padding: wp(4),
        borderRadius: wp(3),
        alignItems: "center"
    }
    , card: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: wp(2.5),
        paddingHorizontal: wp(3),
        borderRadius: wp(4),
        marginBottom: wp(2),
    },


    truckImage: {
        width: 56,
        height: 46,
        borderRadius: wp(2),
    },

    truckImagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },


    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: wp(1),
    },


    infoText: {
        marginLeft: wp(1.5),
        opacity: 0.65,
        fontSize: 13
    },


});
