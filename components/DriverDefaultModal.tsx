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
import { Ionicons } from "@expo/vector-icons";
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

type Props = {
    visible: boolean;
    onClose: () => void;
    fleetId: string;
    truckId: string;
    numberPlate: string;
    onAssigned?: (driver: any) => void;

    typeOfAction?: string
    assignmentId?: string
    brokerageId?: string
    assignmentSource?: string
};


export default function DriverDefaultModal({
    visible,
    onClose,
    fleetId,
    truckId,
    numberPlate,
    onAssigned,
    typeOfAction,
    assignmentId,
    brokerageId,
    assignmentSource,
}: Props) {

console.log(assignmentId)
    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");
    const icon = useThemeColor("icon");
    const coolGray = useThemeColor("coolGray");


    const [staff, setStaff] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    const { currentRole } = useAuth()


    useEffect(() => {
        if (visible) {
            loadStaff();
        }
    }, [visible]);



    const loadStaff = async () => {

        try {
            setLoading(true);

            const driversRef = collection(db, "fleets", fleetId, "Drivers");

            const snap = await getDocs(driversRef);

            const list: any[] = [];

            snap.forEach((item) => {
                const data = item.data();

                list.push({ id: item.id, ...data });
            });

            setStaff(list);
            setFiltered(list);

        } catch (err) {

            console.log("load drivers error", err);

        } finally {

            setLoading(false);

        }
    };




    const handleSearch = (text: string) => {

        setSearch(text);
        if (!text) {

            setFiltered(staff);
            return;
        }
        const result = staff.filter((driver) =>

            driver.fullName
                ?.toLowerCase()
                .includes(text.toLowerCase())

        );
        setFiltered(result);

    };


    const setDriverToAssigment = async () => {


        if (!assignmentId) return
        try {

            if (assignmentSource === "Broker") {
                updateDocument(`brokerages/${brokerageId}/assignments`, assignmentId, {
                    
                    status : "PENDING",
                    driverDetails: {
                        driverId: selected.driverId || selected?.id || null,
                        driverDocId: selected?.docId || selected?.id || selected.driverId || null,
                        driverName: selected.driverName || selected?.fullName || null,
                        driverPhone: selected.driverPhone || selected?.phoneNumber || selected?.phone || null,
                        profilePhoto: selected.profilePhoto || selected?.profilePhoto || null,
                        email: selected?.email || null,
                        role: selected ? 'main' : selected.role || 'assigned',
                        //   isDefault: isDefaultDriver,
                        expoPushToken: selected?.expoPushToken || null,
                    }

                })


                updateDocument(`fleets/${fleetId}/assignments`, assignmentId, {
                    
                    status : "PENDING",
                    driverDetails: {
                        driverId: selected.driverId || selected?.id || null,
                        driverDocId: selected?.docId || selected?.id || selected.driverId || null,
                        driverName: selected.driverName || selected?.fullName || null,
                        driverPhone: selected.driverPhone || selected?.phoneNumber || selected?.phone || null,
                        profilePhoto: selected.profilePhoto || selected?.profilePhoto || null,
                        email: selected?.email || null,
                        role: selected ? 'main' : selected.role || 'assigned',
                        //   isDefault: isDefaultDriver,
                        expoPushToken: selected?.expoPushToken || null,
                    }

                })
            } else if (assignmentSource === "Fleet") {

                updateDocument(`fleets/${fleetId}/assignments`, assignmentId, {

                    status : "PENDING",
                    driverDetails: {
                        driverId: selected.driverId || selected?.id || null,
                        driverDocId: selected?.docId || selected?.id || selected.driverId || null,
                        driverName: selected.driverName || selected?.fullName || null,
                        driverPhone: selected.driverPhone || selected?.phoneNumber || selected?.phone || null,
                        profilePhoto: selected.profilePhoto || selected?.profilePhoto || null,
                        email: selected?.email || null,
                        role: selected ? 'main' : selected.role || 'assigned',
                        //   isDefault: isDefaultDriver,
                        expoPushToken: selected?.expoPushToken || null,
                    }

                })
            }

            if (selected.expoPushToken) {
                await sendUserNotification(
                    selected.expoPushToken,
                    "New Load Assignment 📦",
                    `You have been assigned a new load with ${numberPlate}. Please review and accept or reject it.`,
                    {
                        pathname: "/Driver/AssignmentDetails",
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
                alert("Driver has no push token");
            }

            ToastAndroid.show(
                `${selected.fullName} assigned to the load successfully`,
                ToastAndroid.SHORT
            );

        } catch (e) {
            console.error(e)
        }
    }

    


    const setDefaultDriver = async () => {
        if (!selected) return;

        const oldTruck =
            selected.defaultTruck?.truckNumberPlate;

        if (
            oldTruck &&
            selected.defaultTruck.truckId !== truckId
        ) {

            Alert.alert(
                "Move Driver?",
                `${selected.fullName} is currently assigned to ${oldTruck}. Move them here?`,
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Move",
                        onPress: () => saveDriver()
                    }
                ]
            );

            return;

        }


        saveDriver();

    };


    const saveDriver = async () => {

        try {

            const batch = writeBatch(db);


            const driverRef = doc(db, "fleets", fleetId, "Drivers", selected.id);
            // If driver was already assigned to another truck
            if (
                selected.defaultTruck?.truckId &&
                selected.defaultTruck.truckId !== truckId
            ) {


                const oldTruckRef = doc(db, "fleets", fleetId, "Trucks", selected.defaultTruck.truckId);


                batch.update(oldTruckRef, { defaultDriver: null });

            }

            // Update driver
            batch.update(driverRef, {


                defaultTruck: {

                    truckId: truckId,

                    truckNumberPlate: numberPlate,

                    assignedAt: serverTimestamp()

                }

            });



            // Update new truck
            const newTruckRef = doc(
                db, "fleets", fleetId, "Trucks", truckId);

            batch.update(newTruckRef, {

                defaultDriver: {

                    driverId: selected.id,
                    driverName: selected.fullName,
                    driverPhone: selected.phoneNumber,
                    profilePhoto: selected.profilePhoto || null,

                }

            });



            await batch.commit();



            // Notify driver AFTER successful save
            if (selected.expoPushToken) {
                await sendUserNotification(
                    selected.expoPushToken,
                    "New Truck Assignment 🚛",
                    `You have been assigned to ${numberPlate}`,
                    {
                        pathname: "/Driver/TruckDetails",
                        params: {
                            truckId,
                        },
                    },
                    {
                        type: "truck_assignment",
                        truckId,
                        fleetId,
                    }
                );
            } else {
                alert("Driver has no push token");
            }

            ToastAndroid.show(
                `${selected.fullName} assigned successfully`,
                ToastAndroid.SHORT
            );

            onAssigned?.(selected);



            onClose();



        } catch (err) {

            console.log(
                "assign driver error:",
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
                                {typeOfAction === "Assign Driver" ? "Assign Driver" : "Default Driver"}
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
                            placeholder="Search driver..."
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


                                    renderItem={({ item }) => (


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
                                                item.profilePhoto ? (

                                                    <Image
                                                        source={{
                                                            uri: item.profilePhoto
                                                        }}
                                                        style={styles.profileImage}
                                                    />

                                                ) : (

                                                    <Ionicons
                                                        name="person-circle-outline"
                                                        size={46}
                                                        color={accent}
                                                    />

                                                )
                                            }



                                            <View
                                                style={{
                                                    flex: 1,
                                                    marginLeft: wp(3)
                                                }}
                                            >


                                                <ThemedText type="subtitle">
                                                    {item.fullName}
                                                </ThemedText>



                                                <View style={styles.infoRow}>

                                                    <Ionicons
                                                        name="call-outline"
                                                        size={15}
                                                        color={accent}
                                                    />

                                                    <ThemedText
                                                        style={styles.infoText}
                                                    >
                                                        {item.phoneNumber || "No phone"}
                                                    </ThemedText>

                                                </View>




                                                {
                                                    item.defaultTruck?.truckNumberPlate && (

                                                        <View style={styles.infoRow}>

                                                            <Ionicons
                                                                name="car-outline"
                                                                size={15}
                                                                color={accent}
                                                            />

                                                            <ThemedText
                                                                style={styles.infoText}
                                                            >
                                                                {item.defaultTruck.truckNumberPlate}
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


                                    )}


                                />


                        }



                        <TouchableOpacity

                            disabled={!selected}

                            onPress={typeOfAction === "Assign Driver" ? setDriverToAssigment : setDefaultDriver}


                            style={[
                                styles.button,
                                {
                                    backgroundColor: selected
                                        ?
                                        accent
                                        :
                                        coolGray
                                }
                            ]}

                        >


                            <ThemedText
                                style={{
                                    color: "white",
                                    fontWeight: "600"
                                }}
                            >

                                {typeOfAction === "Assign Driver" ? "Assign Driver": "Set Default Driver"}

                            </ThemedText>


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


    profileImage: {
        width: 46,
        height: 46,
        borderRadius: 23,
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