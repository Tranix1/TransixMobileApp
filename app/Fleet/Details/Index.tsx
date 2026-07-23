import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, TouchableNativeFeedback, Linking, Pressable, ToastAndroid, StyleSheet } from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import Heading from "@/components/Heading";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons, Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

// Shape matches the fleetVerificationData object used when creating/submitting a fleet.
// Adjust / move to @/types/types once you have a shared Fleet interface.
interface FleetVerificationData {
    id: string;
    organizationId: string;
    userId: string;
    accType: string;

    organizationName: string; // fleet name
    organizationEmail?: string;
    organizationPhone: string;

    fleetMainAdminName?: string;
    organizationAdminPhone?: string;
    organizationAdminEmail?: string;

    countryCode?: string;
    typeOfFleet?: string; // e.g. "Individual Fleet" | "Company Fleet"

    billingAddress?: string;
    billingAddressFull?: any;
    baseAdress?: string;
    baseAdressFull?: any;
    operationCountries?: string[];
    location?: string;

    documents: {
        fleetMainAdminId?: string;
        fleetMainAdminIdType?: string;
        proofOfResidence?: string;
        proofOfResidenceType?: string;
        selfieDocument?: string;
        selfieDocumentType?: string;
        companyCertificate?: string;
        companyCertificateType?: string;
        truckRegistrationBook?: string;
        truckRegistrationBookType?: string; // not currently set on submit — falls back to "document" tile
    };

    verificationStatus: 'pending' | 'approved' | 'rejected' | string;
    rejectionReason?: string;
    submittedAt?: string;
    createdAt?: string;
    updatedAt?: string;

    performanceMetrics?: {
        totalLoads: number;
        completedLoads: number;
        revenue: number;
        rating: number;
    };

    expoPushToken?: string;
}

type DocItem = {
    label: string;
    uri: string;
    fileType?: string;
    isImage: boolean;
};

// File types that can be previewed inline as an image. Anything else (pdf, doc, docx, etc.),
// including docs with no type hint at all (e.g. truckRegistrationBook today), is treated as
// a "document" and opened in a third-party viewer instead of being rendered inline.
const IMAGE_TYPE_HINTS = ['image', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

const isImageFileType = (type?: string, uri?: string) => {
    const source = `${type || ''} ${uri || ''}`.toLowerCase();
    return IMAGE_TYPE_HINTS.some(hint => source.includes(hint));
};

const fileIconFor = (type?: string, uri?: string) => {
    const source = `${type || ''} ${uri || ''}`.toLowerCase();
    if (source.includes('pdf')) return 'file-pdf-box';
    if (source.includes('doc')) return 'file-word-box';
    if (source.includes('xls') || source.includes('sheet')) return 'file-excel-box';
    return 'file-document-outline';
};

const FleetDetails = () => {

    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");

    const { fleetid, dspDetails } = useLocalSearchParams();
    console.log(fleetid)
    const [fleetData, setFleetData] = useState<FleetVerificationData>({} as FleetVerificationData)
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
            if (!fleetid) return;
            const fleet = await readById('verifiedUsers', fleetid as string)
            if (fleet) {
                setFleetData(fleet as FleetVerificationData)
            }
        } catch (error) {

        } finally {
            setRefreshing(false)
        }
    };

    useEffect(() => {
        getData();

    }, [])

    // Function to toggle save state
    const toggleSaveFleet = async () => {
        try {
            const savedFleets = await AsyncStorage.getItem('savedFleets');
            const savedFleetsArray = savedFleets ? JSON.parse(savedFleets) : [];

            if (isSaved) {
                const updatedFleets = savedFleetsArray.filter((item: FleetVerificationData) => item.id !== fleetData.id);
                await AsyncStorage.setItem('savedFleets', JSON.stringify(updatedFleets));
                setIsSaved(false);
            } else {
                const updatedFleets = [...savedFleetsArray, fleetData];
                await AsyncStorage.setItem('savedFleets', JSON.stringify(updatedFleets));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving fleet:', error);
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

    // Open a non-image document (pdf, doc, etc.) in whatever third-party app the device
    // has registered for that file type / URL, instead of trying to render it inline.
    const openDocumentExternally = async (item: DocItem) => {
        if (!item.uri) return;
        try {
            const supported = await Linking.canOpenURL(item.uri);
            if (supported) {
                await Linking.openURL(item.uri);
            } else {
                alertBox('Cannot Open File', `No app is available to open "${item.label}".`, [], 'error');
            }
        } catch (error) {
            alertBox('Error', `Failed to open "${item.label}".`, [], 'error');
        }
    };

    const docs = fleetData.documents || {};

    // Identity documents
    const identityDocItems: DocItem[] = [];
    if (docs.fleetMainAdminId) {
        identityDocItems.push({
            label: 'Admin ID',
            uri: docs.fleetMainAdminId,
            fileType: docs.fleetMainAdminIdType,
            isImage: isImageFileType(docs.fleetMainAdminIdType, docs.fleetMainAdminId),
        });
    }
    if (docs.proofOfResidence) {
        identityDocItems.push({
            label: 'Proof of Residence',
            uri: docs.proofOfResidence,
            fileType: docs.proofOfResidenceType,
            isImage: isImageFileType(docs.proofOfResidenceType, docs.proofOfResidence),
        });
    }

    // Personal / selfie documents
    const personalDocItems: DocItem[] = [];
    if (docs.selfieDocument) {
        personalDocItems.push({
            label: 'Selfie',
            uri: docs.selfieDocument,
            fileType: docs.selfieDocumentType,
            isImage: isImageFileType(docs.selfieDocumentType, docs.selfieDocument),
        });
    }

    // Company / vehicle documents
    const companyDocItems: DocItem[] = [];
    if (docs.companyCertificate) {
        companyDocItems.push({
            label: 'Company Certificate',
            uri: docs.companyCertificate,
            fileType: docs.companyCertificateType,
            isImage: isImageFileType(docs.companyCertificateType, docs.companyCertificate),
        });
    }
    if (docs.truckRegistrationBook) {
        companyDocItems.push({
            label: 'Truck Registration Book',
            uri: docs.truckRegistrationBook,
            // No ...Type field is currently saved for this doc on submit, so this
            // will safely fall back to being treated as a generic document tile.
            fileType: docs.truckRegistrationBookType,
            isImage: isImageFileType(docs.truckRegistrationBookType, docs.truckRegistrationBook),
        });
    }

    const allDocItems = [...identityDocItems, ...personalDocItems, ...companyDocItems];

    // Only image-type docs go into the full-screen viewer; the viewer index maps
    // 1:1 against the subset of allDocItems that are images.
    const imageDocItems = allDocItems.filter(item => item.isImage);
    const images = imageDocItems.map(item => ({ uri: item.uri }));
    const imageLabels = imageDocItems.map(item => item.label);

    const openImageViewerFor = (item: DocItem) => {
        const idx = imageDocItems.findIndex(img => img.uri === item.uri && img.label === item.label);
        if (idx === -1) return;
        setCurrentIndex(idx);
        setViewerIndex(idx);
        setIsVisible(true);
    };

    // Reusable doc tile: renders an image thumbnail for image docs, or a
    // generic file card (icon + label) for anything else, opening externally on tap.
    const renderDocTile = (item: DocItem, keyPrefix: string, index: number) => {
        if (item.isImage) {
            return (
                <TouchableOpacity
                    key={`${keyPrefix}-${index}`}
                    onPress={() => openImageViewerFor(item)}
                >
                    <Image source={{ uri: item.uri }} style={styles.imageStyle} />
                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1), color: icon }}>
                        {item.label}
                    </ThemedText>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                key={`${keyPrefix}-${index}`}
                style={[styles.imageStyle, styles.fileCard, { backgroundColor: backgroundLight, borderColor: coolGray }]}
                onPress={() => openDocumentExternally(item)}
            >
                <MaterialCommunityIcons name={fileIconFor(item.fileType, item.uri) as any} size={wp(14)} color={accent} />
                <ThemedText type="tiny" numberOfLines={2} style={{ textAlign: 'center', marginTop: wp(2), paddingHorizontal: wp(2), color: textColor }}>
                    {item.label}
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1), marginTop: wp(1) }}>
                    <Ionicons name="open-outline" size={wp(3.5)} color={accent} />
                    <ThemedText type="tiny" style={{ color: accent }}>
                        Open document
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
    };

    // Admin approval functions
    const handleAdminApprove = async () => {
        alertBox(
            'Approve Fleet',
            'Are you sure you want to approve this fleet?',
            [
                { title: 'Approve', onPress: () => approveFleet() }
            ]
        );
    };

    const approveFleet = async () => {
        try {
            setProcessing(true);
            await updateDocumentWithAdminTracking(
                'verifiedUsers',
                fleetData.id,
                { verificationStatus: 'approved', rejectionReason: '' },
                ADMIN_ACTIONS.APPROVE_USER,
                'account',
                fleetData.organizationName || fleetData.id,
                'Approved fleet verification'
            );

            if (fleetData.expoPushToken) {
                await sendPushNotification(
                    fleetData.expoPushToken,
                    'Fleet Verified! 🎉',
                    `Your fleet profile (${fleetData.organizationName}) has been approved.`,
                    '/Logistics/Fleets',
                    { fleetId: fleetData.id, type: 'fleet_approved' }
                );
            }

            alertBox('Success', 'Fleet approved successfully!', [
                { title: 'OK', onPress: () => getData() }
            ]);
        } catch (error) {
            console.error('Error approving fleet:', error);
            alertBox('Error', 'Failed to approve fleet', [], 'error');
        } finally {
            setProcessing(false);
        }
    };

    const declineFleet = async () => {
        if (!declineReason.trim()) {
            alertBox('Error', 'Please provide a reason for declining', [], 'error');
            return;
        }

        try {
            setProcessing(true);
            await updateDocumentWithAdminTracking(
                'verifiedUsers',
                fleetData.id,
                { verificationStatus: 'rejected', rejectionReason: declineReason.trim() },
                ADMIN_ACTIONS.DECLINE_USER,
                'account',
                fleetData.organizationName || fleetData.id,
                `Declined fleet verification: ${declineReason.trim()}`
            );

            if (fleetData.expoPushToken) {
                await sendPushNotification(
                    fleetData.expoPushToken,
                    'Fleet Verification Declined',
                    `Your fleet profile (${fleetData.organizationName}) has been declined. Reason: ${declineReason}`,
                    '/Logistics/Fleets',
                    { fleetId: fleetData.id, type: 'fleet_declined' }
                );
            }

            alertBox('Success', 'Fleet declined successfully!', [
                {
                    title: 'OK', onPress: () => {
                        setShowDeclineModal(false);
                        setDeclineReason('');
                        getData();
                    }
                }
            ]);
        } catch (error) {
            console.error('Error declining fleet:', error);
            alertBox('Error', 'Failed to decline fleet', [], 'error');
        } finally {
            setProcessing(false);
        }
    };

    const placeholder = require('@/assets/images/failedimage.jpg')

    const statusColor = (status?: string) => {
        switch (status) {
            case 'approved': return '#51cf66';
            case 'rejected': return '#ff6b6b';
            default: return '#f5a623'; // pending
        }
    };

    const selfieUri = docs.selfieDocument && isImageFileType(docs.selfieDocumentType, docs.selfieDocument)
        ? docs.selfieDocument
        : undefined;

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
                                    Manage Fleet
                                </ThemedText>

                                {/* 1. EDIT FLEET */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                >
                                    <Ionicons name="create-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Edit Fleet Info</ThemedText>
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
                                            "Delete Fleet",
                                            "Are you sure you want to delete this fleet?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            await deleteDocument('Fleets', fleetData.id);

                                                            ToastAndroid.show(
                                                                "Fleet deleted successfully",
                                                                ToastAndroid.SHORT
                                                            );
                                                        } catch {
                                                            alertBox(
                                                                "Error",
                                                                "Failed to delete fleet",
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
                                        Delete Fleet
                                    </ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {showAlert}
            <Heading page={fleetData.organizationName || "Fleet Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && user?.uid === fleetData.userId &&
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
                            source={selfieUri}
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
                        {(fleetData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (fleetData?.organizationPhone) && Linking.openURL(`tel:${(fleetData?.organizationPhone)}`)}>
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
                        {(fleetData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${fleetData.organizationName},\n\nI'd like to get in touch regarding your fleet profile.\n`;
                                            (fleetData?.organizationPhone) && Linking.openURL(`sms:${(fleetData?.organizationPhone)}?body=${encodeURIComponent(message)}`);
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
                        {(fleetData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${fleetData.organizationName},\n\nI'd like to get in touch regarding your fleet profile.\n`;
                                            (fleetData?.organizationPhone) && Linking.openURL(`https://wa.me/${(fleetData?.organizationPhone)}?text=${encodeURIComponent(message)}`);
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
                        {(fleetData?.organizationEmail) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (fleetData?.organizationEmail) && Linking.openURL(`mailto:${(fleetData?.organizationEmail)}`)}>
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='mail-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Email
                                </ThemedText>
                            </View>
                        }

                        <View style={{ alignItems: 'center', gap: wp(1) }}>
                            <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                <TouchableNativeFeedback onPress={toggleSaveFleet}>
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
                                    {fleetData.organizationName}
                                </ThemedText>
                                <ThemedText>
                                    {fleetData.location}
                                </ThemedText>
                            </View>
                            {fleetData.verificationStatus === 'approved' &&
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
                                Fleet Type
                            </ThemedText>
                            <ThemedText type="subtitle">
                                {fleetData.typeOfFleet || '--'}
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
                                    backgroundColor: statusColor(fleetData.verificationStatus)
                                }} />
                                <ThemedText type="subtitle" style={{ color: statusColor(fleetData.verificationStatus), textTransform: 'capitalize' }}>
                                    {fleetData.verificationStatus || 'pending'}
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
                                <ThemedText type="subtitle" style={{ marginBottom: wp(2) }}>
                                    {fleetData.organizationPhone || '--'}
                                </ThemedText>
                            </View>
                        </View>
                        {fleetData.organizationEmail &&
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="tiny" style={{}}>
                                        Email
                                    </ThemedText>
                                    <ThemedText type="subtitle" style={{ marginBottom: wp(2) }}>
                                        {fleetData.organizationEmail}
                                    </ThemedText>
                                </View>
                            </View>
                        }
                        {(fleetData.baseAdress || fleetData.billingAddress) &&
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="tiny" style={{}}>
                                        Base / Billing Address
                                    </ThemedText>
                                    <ThemedText type="subtitle" style={{ marginBottom: wp(2) }}>
                                        {fleetData.baseAdress || fleetData.billingAddress}
                                    </ThemedText>
                                </View>
                            </View>
                        }
                        {fleetData.operationCountries && fleetData.operationCountries.length > 0 &&
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="tiny" style={{}}>
                                        Operating Countries
                                    </ThemedText>
                                    <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                                        {fleetData.operationCountries.join(', ')}
                                    </ThemedText>
                                </View>
                            </View>
                        }
                    </View>

                    {/* Admin Info Section */}
                    {(fleetData.fleetMainAdminName) ? (
                        <View style={{
                            backgroundColor: backgroundLight,
                            padding: wp(4),
                            borderRadius: wp(3),
                            marginBottom: wp(4),
                            borderWidth: 1,
                            borderColor: coolGray
                        }}>
                            <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                                Account Admin
                            </ThemedText>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                                <ThemedText style={{ color: textColor }}>Name:</ThemedText>
                                <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                    {fleetData.fleetMainAdminName}
                                </ThemedText>
                            </View>

                            {fleetData.organizationAdminPhone && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                                    <ThemedText style={{ color: textColor }}>Phone:</ThemedText>
                                    <ThemedText style={{ color: textColor }}>
                                        {fleetData.organizationAdminPhone}
                                    </ThemedText>
                                </View>
                            )}

                            {fleetData.organizationAdminEmail && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <ThemedText style={{ color: textColor }}>Email:</ThemedText>
                                    <ThemedText style={{ color: textColor }}>
                                        {fleetData.organizationAdminEmail}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {fleetData.rejectionReason && fleetData.verificationStatus === 'rejected' &&
                        <View style={{
                            backgroundColor: '#ff6b6b20',
                            padding: wp(3),
                            borderRadius: wp(3),
                        }}>
                            <ThemedText type="tiny" style={{ color: '#ff6b6b', marginBottom: wp(1) }}>
                                Decline Reason:
                            </ThemedText>
                            <ThemedText style={{ color: textColor }}>
                                {fleetData.rejectionReason}
                            </ThemedText>
                        </View>
                    }

                    { <View>
                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Identity Documents</ThemedText>

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {identityDocItems.map((item, index) => renderDocTile(item, 'identity', index))}
                        </ScrollView>

                        <Divider />

                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Personal Documents</ThemedText>

                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {personalDocItems.map((item, index) => renderDocTile(item, 'personal', index))}
                        </ScrollView>

                        {companyDocItems.length > 0 && (
                            <>
                                <Divider />
                                <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Company & Vehicle Documents</ThemedText>
                                <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                                    {companyDocItems.map((item, index) => renderDocTile(item, 'company', index))}
                                </ScrollView>
                            </>
                        )}

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
                                        {imageLabels[viewerIndex] || 'Document'}
                                    </ThemedText>
                                </View>
                            )}
                        />

                        <Divider />
                    </View>}

                    {/* Admin Approval Buttons */}
                    {dspDetails === 'admin' && fleetData.verificationStatus !== 'approved' && (
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
                                    Approve Fleet
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
                                    Decline Fleet
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
                            View Loads from{'  '}
                            <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                                {fleetData.organizationName}
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
                            placeholder="Please provide a reason for declining this fleet..."
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
                                onPress={declineFleet}
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

export default FleetDetails

const styles = StyleSheet.create({
    imageStyle: { height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 },
    fileCard: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
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
