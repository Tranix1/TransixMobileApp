import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, TouchableNativeFeedback, Linking, Pressable, ToastAndroid, StyleSheet } from "react-native";

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
import { deleteDocument, readById, updateDocumentWithAdminTracking } from "@/db/operations";
import { ADMIN_ACTIONS } from "@/Utilities/adminActionTracker";
import { Image } from 'expo-image'
import { useAuth } from "@/context/AuthContext";
import Divider from "@/components/Divider";

import { AntDesign } from '@expo/vector-icons';

import { sendPushNotification } from "@/Utilities/pushNotification";
import Input from "@/components/Input";

import ImageViewing from 'react-native-image-viewing';

// Shape matches the driverVerificationData object used when creating/submitting a driver.
// Adjust / move to @/types/types once you have a shared Driver interface.
interface DriverVerificationData {
    id: string;
    organizationId: string;
    userId: string;
    accType: string;
    organizationName: string; // driver full name
    organizationPhone: string;

    fleetMainAdminName?: string;
    organizationAdminPhone?: string;
    organizationAdminEmail?: string;

    driverVerificcationTier?: string;

    location?: string;

    documents: {
        selfieImage?: string;
        nationalIdUrl?: string;
        driverLicenseUrl?: string;
        passportUrl?: string;
        medicalCertificateUrl?: string;
        proofOfResidenceUrl?: string;
        internationalPermitUrl?: string;
    };

    verificationStatus: 'pending' | 'approved' | 'rejected' | string;
    rejectionReason?: string;
    submittedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    expoPushToken?: string;
}

const DriverDetails = () => {

    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");

    const { driverid, dspDetails, fleetId } = useLocalSearchParams();
    const [driverData, setDriverData] = useState<DriverVerificationData>({} as DriverVerificationData)
    const [modalVisible, setModalVisible] = useState(false);
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
            if (!driverid) return;
            // If fleetId is provided, fetch from fleet subcollection, otherwise from main Drivers collection
            const collectionName =  'verifiedUsers';
            const driver = await readById(collectionName, driverid as string)
            if (driver) {
                setDriverData(driver as DriverVerificationData)
            }
        } catch (error) {

        } finally {
            setRefreshing(false)
        }
    };

    

    // Function to toggle save state
    const toggleSaveDriver = async () => {
        try {
            const savedDrivers = await AsyncStorage.getItem('savedDrivers');
            const savedDriversArray = savedDrivers ? JSON.parse(savedDrivers) : [];

            if (isSaved) {
                const updatedDrivers = savedDriversArray.filter((item: DriverVerificationData) => item.id !== driverData.id);
                await AsyncStorage.setItem('savedDrivers', JSON.stringify(updatedDrivers));
                setIsSaved(false);
            } else {
                const updatedDrivers = [...savedDriversArray, driverData];
                await AsyncStorage.setItem('savedDrivers', JSON.stringify(updatedDrivers));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving driver:', error);
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

    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewerIndex, setViewerIndex] = useState(0);

    // Group document images the same way truck images were grouped: identity docs, licensing docs, additional docs
    const identityDocImages = [];
    const licenseDocImages = [];
    const additionalDocImages = [];

    const docs = driverData.documents || {};

    if (docs.nationalIdUrl) {
        identityDocImages.push({ label: 'National ID', uri: docs.nationalIdUrl });
    }
    if (docs.passportUrl) {
        identityDocImages.push({ label: 'Passport', uri: docs.passportUrl });
    }
    if (docs.proofOfResidenceUrl) {
        identityDocImages.push({ label: 'Proof of Residence', uri: docs.proofOfResidenceUrl });
    }

    if (docs.driverLicenseUrl) {
        licenseDocImages.push({ label: 'Driver License', uri: docs.driverLicenseUrl });
    }
    if (docs.internationalPermitUrl) {
        licenseDocImages.push({ label: 'International Permit', uri: docs.internationalPermitUrl });
    }

    if (docs.medicalCertificateUrl) {
        additionalDocImages.push({ label: 'Medical Certificate', uri: docs.medicalCertificateUrl });
    }
    if (docs.selfieImage) {
        additionalDocImages.push({ label: 'Selfie', uri: docs.selfieImage });
    }

    const labeledImages = [...identityDocImages, ...licenseDocImages, ...additionalDocImages];

    const licenseOffset = identityDocImages.length;
    const additionalOffset = licenseOffset + licenseDocImages.length;

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


        
            if (driverData.expoPushToken) {
                await sendPushNotification(
                    driverData.expoPushToken,
                    'Driver Verified! 🎉',
                    `Your driver profile (${driverData.organizationName}) has been approved.`,
                    '/Logistics/Drivers',
                    { driverId: driverData.id, type: 'driver_approved' }
                );
            }

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


          

            if (driverData.expoPushToken) {
                await sendPushNotification(
                    driverData.expoPushToken,
                    'Driver Verification Declined',
                    `Your driver profile (${driverData.organizationName}) has been declined. Reason: ${declineReason}`,
                    '/Logistics/Drivers',
                    { driverId: driverData.id, type: 'driver_declined' }
                );
            }

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

    const tierColor = (tier?: string) => {
        switch ((tier || '').toLowerCase()) {
            case 'gold': return '#D4AF37';
            case 'silver': return '#A8A9AD';
            case 'bronze': return '#CD7F32';
            default: return icon;
        }
    };

    const statusColor = (status?: string) => {
        switch (status) {
            case 'approved': return '#51cf66';
            case 'rejected': return '#ff6b6b';
            default: return '#f5a623'; // pending
        }
    };

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
                                    Manage Driver
                                </ThemedText>

                                {/* 1. EDIT DRIVER */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    
                                      
                                >
                                    <Ionicons name="create-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Edit Driver Info</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 2. EDIT DOCUMENTS */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                   
                                >
                                    <Ionicons name="images-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Edit Documents</ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color={icon} />
                                </TouchableOpacity>

                                {/* 3. DELETE (DANGER LAST) */}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        setModalVisible(false);

                                        alertBox(
                                            "Delete Driver",
                                            "Are you sure you want to delete this driver?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            const collectionName = fleetId ? `fleets/${fleetId}/Drivers` : 'Drivers';
                                                            await deleteDocument(collectionName, driverData.id);

                                                            ToastAndroid.show(
                                                                "Driver deleted successfully",
                                                                ToastAndroid.SHORT
                                                            );
                                                        } catch {
                                                            alertBox(
                                                                "Error",
                                                                "Failed to delete driver",
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
                                        Delete Driver
                                    </ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {showAlert}
            <Heading page={driverData.organizationName || "Driver Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && user?.uid === driverData.userId &&
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
                        <Image
                            source={driverData.documents?.selfieImage}
                            style={{
                                width: wp(96),
                                height: wp(95),
                                borderRadius: wp(4),
                                marginVertical: wp(2),
                            }}
                            placeholderContentFit='cover' transition={400} contentFit='cover' placeholder={placeholder}
                        />
                    </View>
                </View>

                <View style={{ padding: wp(4), borderRadius: wp(4), backgroundColor: backgroundLight }}>
                    <View style={{ flexDirection: 'row', gap: wp(6), justifyContent: 'center' }}>
                        {(driverData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (driverData?.organizationPhone) && Linking.openURL(`tel:${(driverData?.organizationPhone)}`)}>
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
                        {(driverData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${driverData.organizationName},\n\nI'd like to get in touch regarding your driver profile.\n`;
                                            (driverData?.organizationPhone) && Linking.openURL(`sms:${(driverData?.organizationPhone)}?body=${encodeURIComponent(message)}`);
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
                        {(driverData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${driverData.organizationName},\n\nI'd like to get in touch regarding your driver profile.\n`;
                                            (driverData?.organizationPhone) && Linking.openURL(`https://wa.me/${(driverData?.organizationPhone)}?text=${encodeURIComponent(message)}`);
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
                                <TouchableNativeFeedback onPress={toggleSaveDriver}>
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
                                    {driverData.organizationName}
                                </ThemedText>
                                <ThemedText>
                                    {driverData.location}
                                </ThemedText>
                            </View>
                            {driverData.verificationStatus === 'approved' &&
                                <View style={{ flexDirection: 'row', alignSelf: 'center', borderRadius: wp(4), alignItems: 'center', gap: wp(2), borderWidth: .4, padding: wp(1), borderColor: coolGray }}>
                                    <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                                        Verified
                                    </ThemedText>
                                </View>
                            }
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Verification Tier
                            </ThemedText>
                            <ThemedText type="subtitle" style={{ color: tierColor(driverData.driverVerificcationTier) }}>
                                {driverData.driverVerificcationTier || '--'}
                            </ThemedText>
                        </View>
                        <ThemedText type="subtitle" color="#1E90FF" >|</ThemedText>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Verification Status
                            </ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1.5) }}>
                                <View style={{
                                    width: 8, height: 8, borderRadius: 4,
                                    backgroundColor: statusColor(driverData.verificationStatus)
                                }} />
                                <ThemedText type="subtitle" style={{ color: statusColor(driverData.verificationStatus), textTransform: 'capitalize' }}>
                                    {driverData.verificationStatus || 'pending'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Contact Number
                                </ThemedText>
                                <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                                    {driverData.organizationPhone || '--'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Fleet Admin Info Section */}
                    {(driverData.fleetMainAdminName) ? (
                        <View style={{
                            backgroundColor: backgroundLight,
                            padding: wp(4),
                            borderRadius: wp(3),
                            marginBottom: wp(4),
                            borderWidth: 1,
                            borderColor: coolGray
                        }}>
                            <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                                Fleet Admin
                            </ThemedText>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                                <ThemedText style={{ color: textColor }}>Name:</ThemedText>
                                <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                    {driverData.fleetMainAdminName}
                                </ThemedText>
                            </View>

                            {driverData.organizationAdminPhone && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                                    <ThemedText style={{ color: textColor }}>Phone:</ThemedText>
                                    <ThemedText style={{ color: textColor }}>
                                        {driverData.organizationAdminPhone}
                                    </ThemedText>
                                </View>
                            )}

                            {driverData.organizationAdminEmail && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <ThemedText style={{ color: textColor }}>Email:</ThemedText>
                                    <ThemedText style={{ color: textColor }}>
                                        {driverData.organizationAdminEmail}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {driverData.rejectionReason && driverData.verificationStatus === 'rejected' &&
                        <View style={{
                            backgroundColor: '#ff6b6b20',
                            padding: wp(3),
                            borderRadius: wp(3),
                        }}>
                            <ThemedText type="tiny" style={{ color: '#ff6b6b', marginBottom: wp(1) }}>
                                Decline Reason:
                            </ThemedText>
                            <ThemedText style={{ color: textColor }}>
                                {driverData.rejectionReason}
                            </ThemedText>
                        </View>
                    }

                    {(dspDetails === "true" || user?.uid === driverData.userId) && <View>
                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Identity Documents</ThemedText>

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {identityDocImages.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setCurrentIndex(index);
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

                        <Divider />

                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Licensing Documents</ThemedText>

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {licenseDocImages.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setCurrentIndex(index + licenseOffset);
                                        setViewerIndex(index + licenseOffset)
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

                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Additional Documents</ThemedText>
                        <Divider />

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {additionalDocImages.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setCurrentIndex(index + additionalOffset);
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
                            onImageIndexChange={(index) => setViewerIndex(index)}
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
                    {dspDetails === 'admin' && driverData.verificationStatus !== 'approved' && (
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
                           
                    >
                        <ThemedText style={{ color: "white" }}>
                            View Drivers from{'  '}
                            <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                                {driverData.organizationName}
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

        </ScreenWrapper >
    )
}

export default DriverDetails

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
