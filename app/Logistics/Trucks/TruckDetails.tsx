import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, TouchableNativeFeedback, Linking, Pressable, ToastAndroid, Dimensions, StyleSheet, Alert } from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import Heading from "@/components/Heading";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import React, { ReactElement, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { BlurView } from 'expo-blur';
import { Truck, User } from "@/types/types";
import { addDocument, addDocumentWithId, deleteDocument, readById, updateDocument, updateDocumentWithAdminTracking } from "@/db/operations";
import { ADMIN_ACTIONS } from "@/Utilities/adminActionTracker";
import { TruckTrackerManager } from "@/components/TruckTrackerManager";
import { Image } from 'expo-image'
import { useAuth } from "@/context/AuthContext";
import Divider from "@/components/Divider";
import { formatNumber } from "@/services/services";

import { AntDesign } from '@expo/vector-icons'; // or any close icon

// import { sendPushNotification } from "@/Utilities/pushNotification";
import { sendPushNotification } from "@/Utilities/pushNotification";
import Input from "@/components/Input";
import TruckNotificationModal from "@/components/TruckNotificationSettingsModal";

import TruckAvailabilityModal from "@/components/TruckAvailabilityModal";
import DriverDefaultModal from "@/components/DriverDefaultModal";

import ImageViewing from 'react-native-image-viewing';
import { serverTimestamp } from "firebase/firestore";
import DefaultDriverCard from "@/components/DefaultDriverCard";

const TruckDetails = () => {

    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");

    const { truckid, dspDetails, fleetId } = useLocalSearchParams();
    const [truckData, setTruckData] = useState<Truck>({} as Truck)
    const [modalVisible, setModalVisible] = useState(false);
    const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
    const [driverModal, setShowMDriverodal] = useState(false)

    const [notificationModal, setNotificationModal] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isSaved, setIsSaved] = useState(false);

    // Admin approval states
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const { user } = useAuth();
    const getData = async () => {
        try {
            setRefreshing(true)
            if (!truckid) return;
            // If fleetId is provided, fetch from fleet subcollection, otherwise from main Trucks collection
            const collectionName = fleetId ? `fleets/${fleetId}/Trucks` : 'Trucks';
            const truck = await readById(collectionName, truckid as string)
            if (truck) {
                setTruckData(truck as Truck)
                if (truckData) {
                    getowenerdata();
                }
            }

        } catch (error) {

        } finally {
            setRefreshing(false)
        }

    };


    const [postOwner, setPostUser] = useState<User>();

    useEffect(() => {
        getData();
        const checkSavedProducts = async () => {
            try {
                const savedProducts = await AsyncStorage.getItem('savedProducts');
                const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];
                const isProductSaved = savedProductsArray.some((item: Truck) => item.id === truckData.id);
                setIsSaved(isProductSaved);
            } catch (error) {
                console.error('Error checking saved products:', error);
            }
        };
        checkSavedProducts();
    }, [])

    const getowenerdata = async () => {
        if (truckData.userId) {
            const owner = await readById('personalData', truckData.userId);

            if (owner) {
                const user: User = {
                    ...owner,
                    uid: String(owner.id),
                    createdAt: (owner as any).createdAt ?? Date.now(), // fallback if missing
                };
                setPostUser(user);
            }
        }
    };

    // Function to toggle save state
    const toggleSaveProduct = async () => {
        try {
            const savedProducts = await AsyncStorage.getItem('savedProducts');
            const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];

            if (isSaved) {
                // Remove product from saved list
                const updatedProducts = savedProductsArray.filter((item: Truck) => item.id !== truckData.id);
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(false);
            } else {
                // Add product to saved list
                const updatedProducts = [...savedProductsArray, truckData];
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const [showAlert, setshowAlert] = useState<ReactElement | null>(null);
    function alertBox(title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) {
        setshowAlert(
            <AlertComponent
                visible
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onBackPress={() => setshowAlert(null)}
            />
        )

    }




    truckData.driverLicense, truckData.driverPassport, truckData.driverIntPermit


    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewerIndex, setViewerIndex] = useState(0);   // internal tracking while viewing


    //  const images = [
    //   truckData.truckBookImage ? { uri: truckData.truckBookImage } : null,
    //   truckData.trailerBookF ? { uri: truckData.trailerBookF } : null,
    //   truckData.trailerBookSc ? { uri: truckData.trailerBookSc } : null,
    //   truckData.driverLicense ? { uri: truckData.driverLicense } : null,
    //   truckData.driverPassport ? { uri: truckData.driverPassport } : null,
    //   truckData.driverIntPermit ? { uri: truckData.driverIntPermit } : null,
    // ].filter(Boolean) as { uri: string }[];







    const truckDetailImages = [];
    const driverDetailImages = [];
    const additionalImages = [];

    if (truckData.truckBookImage) {
        truckDetailImages.push({ label: 'Truck Book Image', uri: truckData.truckBookImage });
    }
    if (truckData.trailerBookF) {
        truckDetailImages.push({ label: 'Trailer Book', uri: truckData.trailerBookF });
    }
    if (truckData.trailerBookSc) {
        truckDetailImages.push({ label: 'Trailer Book Second', uri: truckData.trailerBookSc });
    }

    if (truckData.driverLicense) {
        driverDetailImages.push({ label: 'Driver License', uri: truckData.driverLicense });
    }
    if (truckData.driverPassport) {
        driverDetailImages.push({ label: 'Driver Passport', uri: truckData.driverPassport });
    }
    if (truckData.driverIntPermit) {
        driverDetailImages.push({ label: 'Driver International Permit', uri: truckData.driverIntPermit });
    }

    if (truckData.gitImage) {
        additionalImages.push({ label: 'GIT Image', uri: truckData.gitImage });
    }
    if (truckData.truckNumberPlate) {
        additionalImages.push({ label: 'Truck Number Plate', uri: truckData.truckNumberPlate });
    }
    if (truckData.truckThirdPlate) {
        additionalImages.push({ label: 'Truck Third Plate', uri: truckData.truckThirdPlate });
    }

    const labeledImages = [...truckDetailImages, ...driverDetailImages, ...additionalImages];


    const driverOffset = truckDetailImages.length;
    const additionalOffset = driverOffset + driverDetailImages.length;



    const images = labeledImages.map(item => ({ uri: item.uri }));
    const labels = labeledImages.map(item => item.label);



    // Admin approval functions
    const handleAdminApprove = async () => {
        alertBox(
            'Approve Truck',
            'Are you sure you want to approve this truck?',
            [
                // { title: 'Cancel', onPress: () => { } },
                { title: 'Approve', onPress: () => approveTruck() }
            ]
        );
    };

    const approveTruck = async () => {
        try {
            setProcessing(true);

            // Update truck status with admin tracking
            await updateDocumentWithAdminTracking(
                'Trucks',
                truckData.id,
                {
                    isApproved: true,
                    approvalStatus: 'approved',
                    approvedAt: new Date().toISOString()
                },
                ADMIN_ACTIONS.APPROVE_TRUCK,
                'truck',
                `${truckData.truckType} - ${truckData.truckCapacity}`,
                'Truck approved by admin'
            );

            // Send notification to truck owner
            if (truckData.expoPushToken) {
                await sendPushNotification(
                    truckData.expoPushToken,
                    'Truck Approved! 🎉',
                    `Your truck (${truckData.truckType} - ${truckData.truckCapacity}) has been approved and is now visible to other users.`,
                    '/Logistics/Trucks',
                    { truckId: truckData.id, type: 'truck_approved' }
                );
            }

            alertBox('Success', 'Truck approved successfully!', [
                { title: 'OK', onPress: () => getData() }
            ]);
        } catch (error) {
            console.error('Error approving truck:', error);
            alertBox('Error', 'Failed to approve truck', [], 'error');
        } finally {
            setProcessing(false);
        }
    };

    const declineTruck = async () => {
        if (!declineReason.trim()) {
            alertBox('Error', 'Please provide a reason for declining', [], 'error');
            return;
        }

        try {
            setProcessing(true);

            // Update truck status with admin tracking
            await updateDocumentWithAdminTracking(
                'Trucks',
                truckData.id,
                {
                    isApproved: false,
                    approvalStatus: 'rejected',
                    rejectedAt: new Date().toISOString(),
                    rejectionReason: declineReason.trim()
                },
                ADMIN_ACTIONS.DECLINE_TRUCK,
                'truck',
                `${truckData.truckType} - ${truckData.truckCapacity}`,
                `Truck declined: ${declineReason.trim()}`
            );

            // Send notification to truck owner
            if (truckData.expoPushToken) {
                await sendPushNotification(
                    truckData.expoPushToken,
                    'Truck Declined',
                    `Your truck (${truckData.truckType} - ${truckData.truckCapacity}) has been declined. Reason: ${declineReason}`,
                    '/Logistics/Trucks',
                    { truckId: truckData.id, type: 'truck_declined' }
                );
            }

            alertBox('Success', 'Truck declined successfully!', [
                {
                    title: 'OK', onPress: () => {
                        setShowDeclineModal(false);
                        setDeclineReason('');
                        getData();
                    }
                }
            ]);
        } catch (error) {
            console.error('Error declining truck:', error);
            alertBox('Error', 'Failed to decline truck', [], 'error');
        } finally {
            setProcessing(false);
        }
    };


    const handleSaveNotification = async (notifictionData: any) => {



        await updateDocument(`fleets/${fleetId}/trucks`, truckData.id, {
            truckDispatchProfile: {
                notificationsEnabled: notifictionData.notificationsEnabled,
                notifyRoles: notifictionData.notifyRoles,
                minRatePerKm: notifictionData.minimumRate,
            },
            lastAvailabilityUpdate: new Date().toISOString(),
        });


        await updateDocument("truckMarketplaceProfile", truckData.id, {
            truckId: truckid,
            notificationSettings: {
                notificationsEnabled: notifictionData.notificationsEnabled,
                notifyRoles: notifictionData.notifyRoles,
                minRatePerKm: notifictionData.minimumRate,
            },
            // driverId
            // dispatcherId
            // truckType,
            //   capacity,
            //   cargoArea,
            //   locations,

            updatedAt: serverTimestamp()
        })

    }

    const handleSaveAvailability = async (availabilityData: any) => {
        try {
            // Update truck with availability data
            await updateDocument(`fleets/${fleetId}/trucks`, truckData.id, {
                truckDispatchProfile: {

                    availabilityData: {
                        status: availabilityData.status,
                        offlineReason: availabilityData.offlineReason,
                        matchingState: {
                            type: availabilityData?.matchType,
                            lastMatchedAt: "",
                            activeLoadId: "",
                            lastSeenAvailableAt: "",
                        },
                        currentLocation: availabilityData.currentLocation,
                        destinationPreference: {
                            type: "SPECIFIC",
                            location: availabilityData.destination ?? null,
                        },

                    },
                },

                lastAvailabilityUpdate: new Date().toISOString(),
            });

            // truck_dispatch_profile


            await updateDocument("truckMarketplaceProfile", truckData.id, {
                truckId: truckid,

                // 🚛 LIVE STATUS
                status: availabilityData.status,

                offlineReason: availabilityData.offlineReason,

                // 📍 LIVE LOCATION (FROM TRACKER ONLY)
                currentLocation: availabilityData.currentLocation,

                // 🎯 DRIVER PREFERENCE AFTER DELIVERY
                destinationPreference: availabilityData.loction ?? null,

                additionalInfo: availabilityData.additionalInfo,

                // 🧠 MATCHING STATE (SYSTEM CONTROLLED)
                matchingState: {
                    type: availabilityData?.matchType,
                    lastMatchedAt: "",
                    activeLoadId: "",
                    lastSeenAvailableAt: "",
                },

                updatedAt: serverTimestamp()
            }
            )


            alertBox(
                'Success',
                availabilityData.isAvailable
                    ? 'Truck availability updated successfully!'
                    : 'Truck marked as unavailable',
                [{ title: 'OK', onPress: () => getData() }]
            );
        } catch (error) {
            console.error('Error saving truck availability:', error);
            alertBox('Error', 'Failed to save truck availability', [], 'error');
        }
    };


    const handleSaveDefaultDriver = async (driver: any) => {
        await updateDocument(`fleets/${fleetId}/trucks`, truckData.id, {
            defaultDriver: driver,
            // add expo push token
            lastDefaultDriverUpdate: new Date().toISOString(),
        });

        await updateDocument(`fleets/${fleetId}/truckStaffLinks`, truckData.id, {
            defaultDriver: driver,
            updatedAt: new Date().toISOString(),
            truckId: truckData.id,
        });



        await updateDocument("truckMarketplaceProfile", truckData.id, {
            truckId: truckid,

            notificationSettings: {
                assignments: {
                    driver: {
                        id: driver.driverId,
                        expoPushToken: driver.driverExpoPushToken,
                    }
                }
            },


            updatedAt: serverTimestamp()
        })





        //         {
        //   truckId: "T1",

        //   driver: {
        //     id: "D123",
        //     name: "John Doe",
        //     phone: "0771234567"
        //   },

        //   dispatcher: [
        //     id: "DP456",
        //     name: "Mary Jane",
        //     phone: "0788888888"
        //   ],

        //   broker: [
        //     id: "B789",
        //     name: "ABC Logistics"
        //   ],

        //   updatedAt: 1234567890
        // }




        // The truck history of assigment 
        // fleet/{fleetId}/relationship_history/{autoId}
        // {
        //   truckId: "T1",

        //   role: "DRIVER" | "DISPATCHER" | "BROKER",

        //   entity: {
        //     id: "D123",
        //     name: "John Doe"
        //   },

        //   action: "ASSIGNED" | "REMOVED" | "CHANGED",

        //   timestamp: 1234567890
        // }




    }



    const placeholder = require('@/assets/images/failedimage.jpg')
    return (
        <ScreenWrapper>
            <Modal transparent statusBarTranslucent visible={modalVisible} animationType="fade">
                <Pressable onPress={() => setModalVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <BlurView intensity={100} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View
                                style={{
                                    backgroundColor: backgroundLight,
                                    borderRadius: wp(4),
                                    padding: wp(4),
                                    width: wp(82),
                                    gap: wp(3),
                                }}
                            >

                                {/* CLOSE */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                    </TouchableOpacity>
                                </View>

                                {/* TITLE */}
                                <ThemedText
                                    type="title"
                                    style={{ textAlign: 'center', marginBottom: wp(3) }}
                                >
                                    Manage Truck
                                </ThemedText>

                                {/* 1. AVAILABILITY (MOST USED) */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setAvailabilityModalVisible(true);
                                    }}
                                >
                                    <Ionicons name="car-sport-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Truck Availability</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 2. DRIVER (CORE DISPATCH) */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setShowMDriverodal(true);
                                    }}
                                >
                                    <Ionicons name="person-circle-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Set Default Driver</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 3. BROKERAGE (BUSINESS LINK) */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        router.push({
                                            pathname: '/Logistics/Trucks/AssignBrokerageScreen',
                                            params: {
                                                fleetName: truckData.organizationDetails.name,
                                                fleetId: truckData.organizationDetails.id,
                                                truckId: truckData?.id,
                                                truckName: truckData?.truckName,
                                                truckType: truckData.truckType,
                                                cargoArea: truckData.cargoArea,
                                                operaatingLocations: truckData.locations,
                                                capacity: truckData?.truckCapacity,
                                                numberPlate: truckData?.numberPlate,
                                                imageUrl : truckData?.imageUrl ,
                                                truckAssigments : truckData?.assignments

                                            },
                                        });
                                    }}
                                >
                                    <Ionicons name="briefcase-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Set Brokerage</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 4. NOTIFICATIONS (CONFIG) */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setNotificationModal(true);
                                    }}
                                >
                                    <Ionicons name="notifications-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Notification Settings</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 5. EDIT TRUCK */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        router.push({
                                            pathname: '/Logistics/Trucks/EditTruck',
                                            params: { truckId: truckData.id }
                                        });
                                    }}
                                >
                                    <Ionicons name="images-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Edit Truck Images</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 6. DELETE (DANGER LAST) */}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        setModalVisible(false);

                                        alertBox(
                                            "Delete Truck",
                                            "Are you sure you want to delete this truck?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            await deleteDocument("Trucks", truckData.id);

                                                            ToastAndroid.show(
                                                                "Truck deleted successfully",
                                                                ToastAndroid.SHORT
                                                            );
                                                        } catch {
                                                            alertBox(
                                                                "Error",
                                                                "Failed to delete truck",
                                                                [],
                                                                "error"
                                                            );
                                                        }
                                                    },
                                                },
                                            ],
                                            "destructive"
                                        );
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                    <ThemedText type="subtitle" style={{ color: "#EF4444" }}>
                                        Delete Truck
                                    </ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {showAlert}
            <Heading page={truckData.truckName || "Truck Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && user?.uid === truckData.userId &&
                            (<View style={{ overflow: 'hidden', borderRadius: wp(2.4) }}>
                                <TouchableNativeFeedback onPress={() => setModalVisible(true)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2), padding: wp(1.5) }}>
                                        <Ionicons name='reorder-three-outline' size={wp(6)} color={icon} />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>)
                        }
                    </View>} />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={getData}
                        colors={[accent]}
                        tintColor={accent}
                    />
                }
                contentContainerStyle={{ paddingBottom: hp(6), marginHorizontal: wp(2) }}>
                <View style={{ marginHorizontal: wp(2) }}>
                    <View style={{ alignItems: 'center', borderRadius: 2, flex: 1, marginBottom: wp(2) }}>
                        {/* <Image source={{ uri: truckData.images[0] }} /> */}


                        <Image
                            source={truckData.imageUrl}
                            style={{
                                width: wp(96),
                                height: wp(95),
                                borderRadius: wp(4),
                                marginVertical: wp(2),
                                //opacity: index === currentIndex ? 1 : 0.5
                            }}
                            placeholderContentFit='cover' transition={400} contentFit='cover' placeholder={placeholder}
                        />

                    </View>
                </View>

                <View style={{ padding: wp(4), borderRadius: wp(4), backgroundColor: backgroundLight }}>
                    <View style={{ flexDirection: 'row', gap: wp(6), justifyContent: 'center' }}>
                        {(truckData?.contact) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (truckData?.contact) && Linking.openURL(`tel:${(truckData?.contact)}`)}>
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='call-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Call
                                </ThemedText>
                            </View>
                        }
                        {(truckData?.contact) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your product "${truckData.CompanyName}".\n`;
                                            (truckData?.contact) && Linking.openURL(`sms:${(truckData?.contact)}?body=${encodeURIComponent(message)}`);
                                        }}
                                    >
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='chatbox-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    SMS
                                </ThemedText>
                            </View>
                        }
                        {(truckData?.contact) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your product "${truckData.CompanyName}".\n`;
                                            (truckData?.contact) && Linking.openURL(`https://wa.me/${(truckData?.contact)}?text=${encodeURIComponent(message)}`);
                                        }}
                                    >
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='logo-whatsapp' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Whatsapp
                                </ThemedText>
                            </View>
                        }

                        <View style={{ alignItems: 'center', gap: wp(1) }}>
                            <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                <TouchableNativeFeedback onPress={toggleSaveProduct}>
                                    <View
                                        style={{
                                            width: wp(10),
                                            height: wp(10),
                                            backgroundColor: background,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: wp(10),
                                        }}
                                    >
                                        <Ionicons
                                            name={isSaved ? 'heart' : 'heart-outline'}
                                            size={wp(5)}
                                            color={isSaved ? '#FFAB91' : icon}
                                        />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                            <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                {isSaved ? 'Saved' : 'Save'}
                            </ThemedText>
                        </View>
                    </View>
                </View>


                <View
                    style={{
                        gap: wp(4),
                        paddingHorizontal: wp(2),
                        marginBottom: wp(2),
                        paddingVertical: wp(5),
                        backgroundColor: background,
                        borderRadius: wp(4),
                        paddingBottom: wp(4),
                    }}
                >


                    <View style={{}}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>

                                <ThemedText type="title" style={{ maxWidth: wp(80), }}>
                                    {truckData.CompanyName}
                                </ThemedText>
                                <ThemedText>
                                    {truckData.name}
                                </ThemedText>
                            </View>
                            {truckData.isVerified &&
                                <View style={{ flexDirection: 'row', alignSelf: 'center', borderRadius: wp(4), alignItems: 'center', gap: wp(2), borderWidth: .4, padding: wp(1), borderColor: coolGray }}>
                                    <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                                        Verified
                                    </ThemedText>
                                </View>
                            }
                        </View>
                        {/* <ThemedText type="tiny" style={{ color: icon }}>{truckData.fromLocation}</ThemedText> */}


                    </View>



                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Truck Type
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.truckType || '--'}
                            </ThemedText>
                        </View>
                        <ThemedText type="subtitle" color="#1E90FF" >|</ThemedText>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Cargo Area:
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.cargoArea !== "Other" ? truckData.cargoArea : truckData.otherCargoArea}
                            </ThemedText>
                        </View>

                    </View>

                    {/* Assignment Information Section */}
                    {(truckData.brokers && truckData.brokers.length > 0) ? (
                        <View style={{
                            backgroundColor: backgroundLight,
                            padding: wp(4),
                            borderRadius: wp(3),
                            marginBottom: wp(4),
                            borderWidth: 1,
                            borderColor: coolGray
                        }}>
                            <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                                Assignment Information
                            </ThemedText>

                            {/* Broker Information */}
                            {truckData.brokers && truckData.brokers.length > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                                    <ThemedText style={{ color: textColor }}>Assigned Brokers:</ThemedText>
                                    <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                        {truckData.brokers.length} broker{truckData.brokers.length > 1 ? 's' : ''}
                                    </ThemedText>
                                </View>
                            )}



                            {/* Show actual lists if available */}
                            {truckData.brokers && truckData.brokers.length > 0 && (
                                <View style={{ marginTop: wp(2) }}>
                                    <ThemedText type="tiny" style={{ color: icon, marginBottom: wp(1) }}>Brokers:</ThemedText>
                                    {truckData.brokers.map((broker, index) => (
                                        <ThemedText key={index} type="tiny" style={{ color: textColor, marginBottom: wp(0.5) }}>
                                            • {broker}
                                        </ThemedText>
                                    ))}
                                </View>
                            )}



                        </View>
                    ) : null}






                    {truckData.cargoArea === "Tanker" && <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Tanker Type
                                </ThemedText>
                                {
                                    <ThemedText type="subtitle" style={{}}>
                                        {truckData.tankerType !== "Other" ? truckData.tankerType : truckData.otherTankerType}
                                    </ThemedText>
                                }
                            </View>

                        </View>


                    </View>}



                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Maximum Load Capacity
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.maxloadCapacity || '--'}t
                            </ThemedText>
                        </View>
                        <ThemedText type="subtitle" color="#1E90FF" >|</ThemedText>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Capacity:
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.truckCapacity || '--'}t
                            </ThemedText>
                        </View>

                    </View>


                    {/* <Divider /> */}
                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Operation Country{truckData.locations?.length > 1 ? 's' : ''}
                                </ThemedText>
                                <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                                    {truckData.locations?.join(', ') || '--'}
                                </ThemedText>
                            </View>

                        </View>


                    </View>



                    {truckData.additionalInfo &&
                        <View style={{}}>
                            <ThemedText type="tiny" style={{}}>
                                Additional Infomation:
                            </ThemedText>
                            <ThemedText numberOfLines={3} style={{ paddingTop: 0, }}>
                                {truckData.additionalInfo}
                            </ThemedText>
                            {truckData.additionalInfo.length > 100 && (
                                <TouchableOpacity onPress={() => alertBox("Additional Infomation:", truckData.additionalInfo)}>
                                    <ThemedText type="tiny" style={{ color: accent, marginTop: wp(1) }}>
                                        Read More
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    }

                 { truckData?.defaultDriver?.driverId&&  <DefaultDriverCard

                        driver={truckData.defaultDriver}

                        onPress={() => router.push(
                            { pathname: "/", params: { driverId: truckData.defaultDriver.driverId } })} />}

                    {/* Tracker Status Section */}
                    {user?.uid === truckData.userId && <View style={{
                        backgroundColor: backgroundLight,
                        padding: wp(3),
                        borderRadius: 8,
                        marginVertical: wp(2)
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>
                                Tracker Status
                            </ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: (truckData as any).hasTracker ? '#51cf66' : '#ff6b6b',
                                    marginRight: wp(1)
                                }} />
                                <ThemedText style={{
                                    fontSize: 14,
                                    color: (truckData as any).hasTracker ? '#51cf66' : '#ff6b6b',
                                    fontWeight: '500'
                                }}>
                                    {(truckData as any).hasTracker ? 'Truck has tracker' : 'Truck doesn\'t have a tracker'}
                                </ThemedText>
                            </View>
                        </View>

                        {(truckData as any).hasTracker && (
                            <View style={{ marginTop: wp(2) }}>
                                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                    Tracker Name: {(truckData as any).trackerName || 'Not specified'}
                                </ThemedText>
                                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                    Status: {(truckData as any).trackerStatus === 'active' ? 'Active' : 'Available'}
                                </ThemedText>
                            </View>
                        )}

                        {/* Show tracker manager for truck owner */}
                        {user?.uid === truckData.userId && (
                            <TruckTrackerManager
                                truck={truckData}
                                isOwner={true}
                                onTrackerUpdate={() => {
                                    // Refresh truck data
                                    getData();
                                }}
                            />
                        )}

                    </View>}

                    {(dspDetails === "true" || user?.uid === truckData.userId) && <View>
                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Truck Details</ThemedText>

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >

                            {truckDetailImages.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setCurrentIndex(index); // offset 0
                                        setViewerIndex(index)
                                        setIsVisible(true);
                                    }}
                                >
                                    <Image source={{ uri: item.uri }} style={{ height: hp(30), borderRadius: 10, width: wp(80), margin: 5 }} />
                                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1), color: icon }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}


                        </ScrollView>


                        <Image source={{ uri: truckData.trailerBookSc }} />


                        <Divider />

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {driverDetailImages.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setCurrentIndex(index + driverOffset); // ✅ dynamic offset
                                        setViewerIndex(index + driverOffset)
                                        setIsVisible(true);
                                    }}
                                >
                                    <Image source={{ uri: item.uri }} style={styles.imageStyle} />
                                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1), color: icon }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}

                        </ScrollView>









                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}> Additional Details</ThemedText>
                        <Divider />

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {additionalImages.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setCurrentIndex(index + additionalOffset); // ✅ dynamic offset
                                        setViewerIndex(index + additionalOffset)
                                        setIsVisible(true);
                                    }}
                                >
                                    <Image source={{ uri: item.uri }} style={styles.imageStyle} />
                                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1), color: icon }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>



                        <ImageViewing
                            images={images}
                            imageIndex={currentIndex}
                            visible={isVisible}
                            onRequestClose={() => setIsVisible(false)}
                            onImageIndexChange={(index) => setViewerIndex(index)} // only update internal tracker

                            presentationStyle="fullScreen"
                            HeaderComponent={() => (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingTop: 8,
                                        paddingHorizontal: 15,
                                        position: 'absolute',
                                        top: 10,
                                        zIndex: 999,
                                        backgroundColor: backgroundLight,
                                        borderRadius: 5,
                                    }}
                                >
                                    <TouchableOpacity onPress={() => setIsVisible(false)} style={{ marginRight: 8, marginLeft: 4 }}>
                                        <AntDesign name="close" size={15} color="#fff" />
                                    </TouchableOpacity>
                                    <ThemedText style={{ fontWeight: 'bold', fontSize: 14 }}>
                                        {labels[viewerIndex] || 'Document'}
                                    </ThemedText>
                                </View>
                            )}
                        />


                        <Divider />



                    </View>}

                    {/* Admin Approval Buttons */}
                    {dspDetails === 'admin' && !truckData.isApproved && (
                        <View style={{ marginVertical: wp(4), gap: wp(3) }}>
                            <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: wp(2) }}>
                                Admin Actions
                            </ThemedText>

                            <TouchableOpacity
                                style={{
                                    height: 45,
                                    backgroundColor: '#28a745',
                                    width: 240,
                                    borderRadius: 21,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    alignSelf: "center",
                                    shadowColor: '#28a745',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.12,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                                onPress={() => handleAdminApprove()}
                            >
                                <ThemedText style={{ color: "white", fontWeight: 'bold' }}>
                                    Approve Truck
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    height: 45,
                                    backgroundColor: '#dc3545',
                                    width: 240,
                                    borderRadius: 21,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    alignSelf: "center",
                                    shadowColor: '#dc3545',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.12,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                                onPress={() => setShowDeclineModal(true)}
                            >
                                <ThemedText style={{ color: "white", fontWeight: 'bold' }}>
                                    Decline Truck
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={{
                            height: 45,
                            backgroundColor: accent,
                            width: 240,
                            borderRadius: 21,
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center",
                            marginTop: wp(4),
                            marginBottom: wp(4),
                            shadowColor: accent,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 4,
                            elevation: 2,
                            paddingHorizontal: 5
                        }}
                        onPress={() =>
                            router.push({
                                pathname: "/Logistics/Trucks/Index",
                                params: { userId: truckData.userId, organisationName: truckData.CompanyName },
                            })
                        }
                    >
                        <ThemedText style={{ color: "white" }}>
                            View Trucks from{'  '}
                            <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                                {truckData.CompanyName}
                            </ThemedText>
                        </ThemedText>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Admin Decline Modal */}
            <Modal
                visible={showDeclineModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                        <ThemedText type="title" style={styles.modalTitle}>
                            Reason for Declining
                        </ThemedText>

                        <Input
                            value={declineReason}
                            onChangeText={setDeclineReason}
                            placeholder="Please provide a reason for declining this truck..."
                            multiline
                            numberOfLines={4}
                            style={styles.reasonInput}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: coolGray }]}
                                onPress={() => {
                                    setShowDeclineModal(false);
                                    setDeclineReason('');
                                }}
                            >
                                <ThemedText style={{ color: 'white', textAlign: 'center' }}>
                                    Cancel
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#dc3545' }]}
                                onPress={declineTruck}
                                disabled={processing}
                            >
                                <ThemedText style={{ color: 'white', textAlign: 'center' }}>
                                    {processing ? 'Declining...' : 'Decline'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Truck Availability Modal */}
            <TruckNotificationModal
                visible={notificationModal}
                onClose={() => setNotificationModal(false)}
                onSave={handleSaveNotification}
            />
            <TruckAvailabilityModal
                visible={availabilityModalVisible}
                onClose={() => setAvailabilityModalVisible(false)}
                onSave={handleSaveAvailability}
            // truckId={truckData.id}
            />

            <DriverDefaultModal
                visible={driverModal}
                onClose={() => setShowMDriverodal(false)}
                fleetId={truckData?.organizationDetails?.id}
                truckId={truckData.id}
                numberPlate={truckData.numberPlate}
                onAssigned={(driver) => {
                    console.log("Assigned:", driver);
                }}
            />

        </ScreenWrapper >
    )
}

export default TruckDetails

const styles = StyleSheet.create({
    imageStyle: { height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    modalContent: {
        width: '100%',
        maxWidth: wp(80),
        padding: wp(6),
        borderRadius: wp(4),
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: wp(4),
        fontWeight: 'bold',
    },
    reasonInput: {
        marginBottom: wp(4),
        minHeight: wp(20),
    },
    modalButtons: {
        flexDirection: 'row',
        gap: wp(3),
    },
    modalButton: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderWidth: 1,
        borderColor: '#E5E7EB',

        borderRadius: wp(3),
        paddingVertical: wp(3.5),
        paddingHorizontal: wp(4),
    },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderWidth: 1,
        borderColor: '#EF4444',

        borderRadius: wp(3),
        paddingVertical: wp(3.5),
        paddingHorizontal: wp(4),
    },
});

