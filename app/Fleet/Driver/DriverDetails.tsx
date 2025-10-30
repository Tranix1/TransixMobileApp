import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Linking, Alert, Modal, Pressable, TouchableNativeFeedback, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons, Octicons, AntDesign } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import Divider from '@/components/Divider';
import { readById, deleteDocument, updateDocument } from '@/db/operations';
import AlertComponent, { Alertbutton } from '@/components/AlertComponent';
import Input from '@/components/Input';
import ImageViewing from 'react-native-image-viewing';
import { BlurView } from 'expo-blur';

interface Driver {
    id: string;
    fullName: string;
    phoneNumber: string;
    driverLicenseUrl: string;
    passportUrl: string;
    internationalPermitUrl: string;
    fleetId: string;
    createdAt: string;
    status: string;
    truckId?: string;
    truckName?: string;
    docId?: string;
    driverRole?: 'main' | 'second_main' | 'backup';
    userId?: string;
    additionalInfo?: string;
    mainTruck?: {
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    };
    secondMainTruck?: {
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    };
    backupTrucks?: Array<{
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    }>;
}

const DriverDetails = () => {

    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");

    const { driverId, fleetId } = useLocalSearchParams();
    const [driverData, setDriverData] = useState<Driver>({} as Driver)
    const [refreshing, setRefreshing] = useState(false)
    const [isSaved, setIsSaved] = useState(false);

    // Admin approval states
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const [showAlert, setshowAlert] = useState<any>(null);

    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
    const [truckDenialReason, setTruckDenialReason] = useState(false);
    const [reasonForDenial, setReasonForDenial] = useState("");

    const { user } = useAuth();
    const getData = async () => {
        try {
            setRefreshing(true)
            if (!driverId) return;
            // If fleetId is provided, fetch from fleet subcollection, otherwise from main Drivers collection
            const collectionName = fleetId ? `fleets/${fleetId}/Drivers` : 'Drivers';
            const driver = await readById(collectionName, driverId as string)
            if (driver) {
                setDriverData(driver as Driver)
            }

        } catch (error) {

        } finally {
            setRefreshing(false)
        }

    };


    useEffect(() => {
        getData();
        const checkSavedProducts = async () => {
            try {
                const savedProducts = await AsyncStorage.getItem('savedProducts');
                const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];
                const isProductSaved = savedProductsArray.some((item: any) => item.id === driverData.id);
                setIsSaved(isProductSaved);
            } catch (error) {
                console.error('Error checking saved products:', error);
            }
        };
        checkSavedProducts();
    }, [])


    // Function to toggle save state
    const toggleSaveProduct = async () => {
        try {
            const savedProducts = await AsyncStorage.getItem('savedProducts');
            const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];

            if (isSaved) {
                // Remove product from saved list
                const updatedProducts = savedProductsArray.filter((item: any) => item.id !== driverData.id);
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(false);
            } else {
                // Add product to saved list
                const updatedProducts = [...savedProductsArray, driverData];
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

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

    const handleEditDriver = () => {
        router.push({
            pathname: "/Fleet/Driver/Add",
            params: { driverId: driverData.id, editMode: "true" }
        });
    };

    const handleDeleteDriver = () => {
        Alert.alert(
            "Delete Driver",
            `Are you sure you want to delete ${driverData.fullName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDocument(`fleets/${driverData.fleetId}/Drivers`, driverData.id);
                            ToastAndroid.show("Driver deleted successfully", ToastAndroid.SHORT);
                            router.back();
                        } catch (error) {
                            console.error('Error deleting driver:', error);
                            alertBox("Error", "Failed to delete driver", [], "error");
                        }
                    }
                }
            ]
        );
    };



    console.log(currentIndex)

    //  const images = [
    //   truckData.truckBookImage ? { uri: truckData.truckBookImage } : null,
    //   truckData.trailerBookF ? { uri: truckData.trailerBookF } : null,
    //   truckData.trailerBookSc ? { uri: truckData.trailerBookSc } : null,
    //   truckData.driverLicense ? { uri: truckData.driverLicense } : null,
    //   truckData.driverPassport ? { uri: truckData.driverPassport } : null,
    //   truckData.driverIntPermit ? { uri: truckData.driverIntPermit } : null,
    // ].filter(Boolean) as { uri: string }[];




    const driverDetailImages = [];

    if (driverData.driverLicenseUrl) {
        driverDetailImages.push({ label: 'Driver License', uri: driverData.driverLicenseUrl });
    }
    if (driverData.passportUrl) {
        driverDetailImages.push({ label: 'Driver Passport', uri: driverData.passportUrl });
    }
    if (driverData.internationalPermitUrl) {
        driverDetailImages.push({ label: 'Driver International Permit', uri: driverData.internationalPermitUrl });
    }

    const labeledImages = [...driverDetailImages];


    const images = labeledImages.map(item => ({ uri: item.uri }));
    const labels = labeledImages.map(item => item.label);

    // Admin approval functions
    const handleAdminApprove = async () => {
        alertBox(
            'Approve Driver',
            'Are you sure you want to approve this driver?',
            [
                { title: 'Approve', onPress: () => approveDriver() }
            ]
        );
    };

    const approveDriver = async () => {
        try {
            setProcessing(true);

            // Update driver status
            await updateDocument(
                `fleets/${driverData.fleetId}/Drivers`,
                driverData.id,
                {
                    status: 'active',
                    approvedAt: new Date().toISOString()
                }
            );

            alertBox('Success', 'Driver approved successfully!', [
                { title: 'OK', onPress: () => getData() }
            ]);
        } catch (error) {
            console.error('Error approving driver:', error);
            alertBox('Error', 'Failed to approve driver', [], 'error');
        } finally {
            setProcessing(false);
        }
    };

    const declineDriver = async () => {
        if (!declineReason.trim()) {
            alertBox('Error', 'Please provide a reason for declining', [], 'error');
            return;
        }

        try {
            setProcessing(true);

            // Update driver status
            await updateDocument(
                `fleets/${driverData.fleetId}/Drivers`,
                driverData.id,
                {
                    status: 'inactive',
                    declinedAt: new Date().toISOString(),
                    declineReason: declineReason.trim()
                }
            );

            alertBox('Success', 'Driver declined successfully!', [
                {
                    title: 'OK', onPress: () => {
                        setShowDeclineModal(false);
                        setDeclineReason('');
                        getData();
                    }
                }
            ]);
        } catch (error) {
            console.error('Error declining driver:', error);
            alertBox('Error', 'Failed to decline driver', [], 'error');
        } finally {
            setProcessing(false);
        }
    };

    const placeholder = require('@/assets/images/failedimage.jpg')
    return (
        <ScreenWrapper>
            <Modal transparent statusBarTranslucent visible={modalVisible} animationType="fade">
                <Pressable onPress={() => setModalVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <BlurView intensity={100} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: backgroundLight, borderRadius: wp(4), padding: wp(4), width: wp(80), gap: wp(3) }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="title" style={{ textAlign: 'center', marginBottom: wp(4) }}>
                                    Manage Truck
                                </ThemedText>
                                <TouchableOpacity
                                    style={{ backgroundColor: "#1E90FF", alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setAvailabilityModalVisible(true);
                                    }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Truck Available</ThemedText>
                                    {/* <ThemedText color="#fff" type="subtitle">Truck Not Available</ThemedText> */}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    
                                    style={{ backgroundColor: accent, alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Edit Driver Details</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
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
                                                            // Add delete logic here
                                                            // await deleteDocument('Trucks', truckData.id)
                                                            ToastAndroid.show("Success Truck deleted successfully", ToastAndroid.SHORT);
                                                        } catch (error) {
                                                            alertBox("Error", "Failed to delete truck", [], "error");
                                                        }
                                                    },
                                                },
                                            ],
                                            "destructive"
                                        );
                                    }}
                                    style={{ backgroundColor: '#FF5252', alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Delete Truck</ThemedText>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>




            <Modal transparent statusBarTranslucent visible={truckDenialReason} animationType="fade">
                <Pressable onPress={() => setTruckDenialReason(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <BlurView intensity={100} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: backgroundLight, borderRadius: wp(4), padding: wp(4), width: wp(90), gap: wp(3) }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => setTruckDenialReason(false)}>
                                        <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="title" style={{ textAlign: 'center', marginBottom: wp(2.5) }}>
                                    Reason for Denying
                                </ThemedText>

                                <ThemedText type="tiny">e.g. Missing documents, incorrect truck info, or load mismatch</ThemedText>
                                <Input placeholder="Enter reason for denying this truck" value={reasonForDenial} onChangeText={(text) => setReasonForDenial(text)} />
                                <TouchableOpacity style={{ borderWidth: 1, borderColor: icon, borderRadius: 8, backgroundColor: background, height: hp(5), width: wp(56), justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: wp(-3), flexDirection: "row", gap: wp(2) }} 
                                // onPress={() => accecptTruckRquest("Denied")}
                                >
                                    <ThemedText style={{ fontWeight: "bold" }}>Send</ThemedText>
                                    <Ionicons name="send-outline" size={19} color={icon} />
                                </TouchableOpacity>


                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>




            {showAlert}
            <Heading page={driverData.fullName || "Driver Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && user?.uid === (driverData as any).userId &&
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
                            source={driverData.driverLicenseUrl}
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
                        {(driverData?.phoneNumber) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (driverData?.phoneNumber) && Linking.openURL(`tel:${(driverData?.phoneNumber)}`)}>
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
                        {(driverData?.phoneNumber) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${driverData?.fullName},\n\nI would like to discuss driver assignment details.\n`;
                                            (driverData?.phoneNumber) && Linking.openURL(`sms:${(driverData?.phoneNumber)}?body=${encodeURIComponent(message)}`);
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
                        {(driverData?.phoneNumber) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${driverData?.fullName},\n\nI would like to discuss driver assignment details.\n`;
                                            (driverData?.phoneNumber) && Linking.openURL(`https://wa.me/${(driverData?.phoneNumber)}?text=${encodeURIComponent(message)}`);
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

                                </ThemedText>
                                <ThemedText>
                                    {driverData.fullName}
                                </ThemedText>
                            </View>
                            {driverData.status === 'active' &&
                                <View style={{ flexDirection: 'row', alignSelf: 'center', borderRadius: wp(4), alignItems: 'center', gap: wp(2), borderWidth: .4, padding: wp(1), borderColor: coolGray }}>
                                    <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                                        Active
                                    </ThemedText>
                                </View>
                            }
                        </View>
                        {/* <ThemedText type="tiny" style={{ color: icon }}>{truckData.fromLocation}</ThemedText> */}


                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Driver Status
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>

                                {driverData.status === 'active' ? "Active Driver" : "Inactive Driver"}
                            </ThemedText>
                        </View>

                    </View>




                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Phone Number
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {driverData.phoneNumber || '--'}
                            </ThemedText>
                        </View>
                        <ThemedText type="subtitle" color="#1E90FF" >|</ThemedText>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Fleet ID:
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {driverData.fleetId || '--'}
                            </ThemedText>
                        </View>

                    </View>

                    {/* Driver Stats Section */}
                    <View style={{
                        backgroundColor: backgroundLight,
                        padding: wp(4),
                        borderRadius: wp(3),
                        marginBottom: wp(4),
                        borderWidth: 1,
                        borderColor: coolGray
                    }}>
                        <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                            Driver Statistics
                        </ThemedText>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <View style={{ alignItems: 'center' }}>
                                <ThemedText style={{ fontSize: wp(6), fontWeight: 'bold', color: accent }}>0</ThemedText>
                                <ThemedText style={[styles.statLabel, { color: icon }]}>Trips Completed</ThemedText>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <ThemedText style={{ fontSize: wp(6), fontWeight: 'bold', color: accent }}>
                                    {[
                                        driverData.mainTruck ? 1 : 0,
                                        driverData.secondMainTruck ? 1 : 0,
                                        driverData.backupTrucks ? driverData.backupTrucks.length : 0
                                    ].reduce((a, b) => a + b, 0)}
                                </ThemedText>
                                <ThemedText style={[styles.statLabel, { color: icon }]}>Assigned Trucks</ThemedText>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <ThemedText style={{ fontSize: wp(6), fontWeight: 'bold', color: accent }}>0</ThemedText>
                                <ThemedText style={[styles.statLabel, { color: icon }]}>Total Distance</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Assigned Trucks Section */}
                    {((driverData as any).mainTruck || (driverData as any).secondMainTruck || ((driverData as any).backupTrucks && (driverData as any).backupTrucks.length > 0)) ? (
                        <View style={{
                            backgroundColor: backgroundLight,
                            padding: wp(4),
                            borderRadius: wp(3),
                            marginBottom: wp(4),
                            borderWidth: 1,
                            borderColor: coolGray
                        }}>
                            <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                                Assigned Trucks
                            </ThemedText>

                            {/* Main Truck */}
                            {(driverData as any).mainTruck && (
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/Logistics/Trucks/TruckDetails",
                                        params: { truckid: (driverData as any).mainTruck.truckId, fleetId: driverData.fleetId }
                                    })}
                                    style={[styles.truckItem, { backgroundColor: backgroundLight }]}
                                >
                                    <Ionicons name="car-outline" size={wp(5)} color={accent} />
                                    <View style={styles.truckItemDetails}>
                                        <ThemedText style={styles.truckItemName}>{(driverData as any).mainTruck.truckName}</ThemedText>
                                        <ThemedText style={[styles.truckItemRole, { color: accent }]}>Main Driver</ThemedText>
                                    </View>
                                    <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                                </TouchableOpacity>
                            )}

                            {/* Second Main Truck */}
                            {(driverData as any).secondMainTruck && (
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/Logistics/Trucks/TruckDetails",
                                        params: { truckid: (driverData as any).secondMainTruck.truckId, fleetId: driverData.fleetId }
                                    })}
                                    style={[styles.truckItem, { backgroundColor: backgroundLight }]}
                                >
                                    <Ionicons name="car-outline" size={wp(5)} color={accent} />
                                    <View style={styles.truckItemDetails}>
                                        <ThemedText style={styles.truckItemName}>{(driverData as any).secondMainTruck.truckName}</ThemedText>
                                        <ThemedText style={[styles.truckItemRole, { color: accent }]}>Second Main Driver</ThemedText>
                                    </View>
                                    <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                                </TouchableOpacity>
                            )}

                            {/* Backup Trucks */}
                            {(driverData as any).backupTrucks && (driverData as any).backupTrucks.length > 0 && (
                                <View>
                                    <ThemedText type="tiny" style={{ color: icon, marginBottom: wp(1), marginTop: wp(1) }}>Backup Trucks:</ThemedText>
                                    {(driverData as any).backupTrucks.map((backupTruck: any, index: number) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => router.push({
                                                pathname: "/Logistics/Trucks/TruckDetails",
                                                params: { truckid: backupTruck.truckId, fleetId: driverData.fleetId }
                                            })}
                                            style={[styles.truckItem, { backgroundColor: backgroundLight }]}
                                        >
                                            <Ionicons name="car-outline" size={wp(5)} color={accent} />
                                            <View style={styles.truckItemDetails}>
                                                <ThemedText style={styles.truckItemName}>{backupTruck.truckName}</ThemedText>
                                                <ThemedText style={[styles.truckItemRole, { color: accent }]}>Backup Driver</ThemedText>
                                            </View>
                                            <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : null}




                    {/* <Divider /> */}
                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Date Joined Fleet
                                </ThemedText>
                                <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                                    {driverData.createdAt ? new Date(driverData.createdAt).toLocaleDateString() : '--'}
                                </ThemedText>
                            </View>

                        </View>


                    </View>




                    {driverData.additionalInfo &&
                        <View style={{}}>
                            <ThemedText type="tiny" style={{}}>
                                Additional Information:
                            </ThemedText>
                            <ThemedText numberOfLines={3} style={{ paddingTop: 0, }}>
                                {driverData.additionalInfo}
                            </ThemedText>
                            {driverData.additionalInfo.length > 100 && (
                                <TouchableOpacity onPress={() => alertBox("Additional Information:", driverData.additionalInfo || "")}>
                                    <ThemedText type="tiny" style={{ color: accent, marginTop: wp(1) }}>
                                        Read More
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    }

                    {/* Tracker Status Section */}
                    {user?.uid === driverData.userId && <View style={{
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
                                    backgroundColor: (driverData as any).hasTracker ? '#51cf66' : '#ff6b6b',
                                    marginRight: wp(1)
                                }} />
                                <ThemedText style={{
                                    fontSize: 14,
                                    color: (driverData as any).hasTracker ? '#51cf66' : '#ff6b6b',
                                    fontWeight: '500'
                                }}>
                                    {(driverData as any).hasTracker ? 'Has tracker' : 'No tracker'}
                                </ThemedText>
                            </View>
                        </View>

                        {(driverData as any).hasTracker && (
                            <View style={{ marginTop: wp(2) }}>
                                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                    Tracker Name: {(driverData as any).trackerName || 'Not specified'}
                                </ThemedText>
                                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                    Status: {(driverData as any).trackerStatus === 'active' ? 'Active' : 'Available'}
                                </ThemedText>
                            </View>
                        )}

                        {/* Show Get Tracker button for non-owners if no tracker */}
                        {user?.uid !== driverData.userId && !(driverData as any).hasTracker && (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: accent,
                                    padding: wp(2),
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    marginTop: wp(2)
                                }}
                                onPress={() => router.push('/Tracking/AddTrackedVehicle')}
                            >
                                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                    Get Tracker Now
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>}
<View>
    <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Driver Documents</ThemedText>

    <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >

        {driverDetailImages.map((item, index) => (
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


</View>

                    {/* Admin Approval Buttons */}
                    {driverData.status !== 'active' && (
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
                                    Approve Driver
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
                                    Decline Driver
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
                                pathname: "/Fleet/Driver/Index",
                                params: { fleetId: driverData.fleetId },
                            })
                        }
                    >
                        <ThemedText style={{ color: "white" }}>
                            View All Drivers
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
                            placeholder="Please provide a reason for declining this driver..."
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
                                onPress={declineDriver}
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

            <ImageViewing
                images={images}
                imageIndex={currentIndex}
                visible={isVisible}
                onRequestClose={() => setIsVisible(false)}
                HeaderComponent={() => (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: 8,
                        paddingHorizontal: 15,
                        position: 'absolute',
                        top: 10,
                        zIndex: 999,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: 5,
                    }}>
                        <TouchableOpacity onPress={() => setIsVisible(false)} style={{ marginRight: 8, marginLeft: 4 }}>
                            <Ionicons name="close" size={wp(6)} color="white" />
                        </TouchableOpacity>
                        <ThemedText style={{ fontWeight: 'bold', fontSize: 14, color: 'white' }}>
                            {labels[viewerIndex] || 'Document'}
                        </ThemedText>
                    </View>
                )}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    statLabel: {
        fontSize: wp(3),
        textAlign: 'center',
    },
    truckItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        marginBottom: wp(2),
        borderRadius: wp(2),
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    truckItemDetails: {
        flex: 1,
        marginLeft: wp(2),
    },
    truckItemName: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(0.5),
    },
    truckItemRole: {
        fontSize: wp(3),
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        maxHeight: hp(90),
        borderRadius: wp(4),
        padding: wp(4),
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: wp(4),
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(2),
        padding: wp(3),
        marginBottom: wp(4),
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: wp(3),
        justifyContent: 'center',
    },
    modalButton: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
    },
});

export default DriverDetails;