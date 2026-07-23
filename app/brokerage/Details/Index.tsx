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

// Shape matches the brokerVerificationData object used when creating/submitting a broker.
// Adjust / move to @/types/types once you have a shared Broker interface.
interface BrokerVerificationData {
    id: string;
    organizationId: string;
    userId: string;
    accType: string;

    organizationName: string; // broker full name / company name
    phoneNumber?: string;
    email?: string;
    countryCode?: string;
    organizationPhone: string;

    location?: string;
    operationCountries?: string[];

    organizationAdminPhone?: string;
    organizationAdminEmail?: string;
    organizationMainAdminName?: string;

    typeOfBroker?: string; // e.g. "Individual Broker" | "Company Broker"

    documents: {
        nationalId?: string;
        nationalIdType?: string;
        proofOfResidence?: string;
        proofOfResidenceType?: string;
        selfieDocument?: string;
        selfieDocumentType?: string;
        companyRegistrationCertificate?: string;
        companyRegistrationCertificateType?: string;
        companyLetterHead?: string;
        companyLetterHeadType?: string;
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

// File types that can be previewed inline as an image. Anything else (pdf, doc, docx, etc.)
// is treated as a "document" and is opened in a third-party viewer instead of being rendered.
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

const BrokerDetails = () => {

    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");

    const { brokerid, dspDetails } = useLocalSearchParams();
    console.log(brokerid)
    const [brokerData, setBrokerData] = useState<BrokerVerificationData>({} as BrokerVerificationData)
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
            if (!brokerid) return;
            const broker = await readById('verifiedUsers', brokerid as string)
            if (broker) {
                setBrokerData(broker as BrokerVerificationData)
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
    const toggleSaveBroker = async () => {
        try {
            const savedBrokers = await AsyncStorage.getItem('savedBrokers');
            const savedBrokersArray = savedBrokers ? JSON.parse(savedBrokers) : [];

            if (isSaved) {
                const updatedBrokers = savedBrokersArray.filter((item: BrokerVerificationData) => item.id !== brokerData.id);
                await AsyncStorage.setItem('savedBrokers', JSON.stringify(updatedBrokers));
                setIsSaved(false);
            } else {
                const updatedBrokers = [...savedBrokersArray, brokerData];
                await AsyncStorage.setItem('savedBrokers', JSON.stringify(updatedBrokers));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving broker:', error);
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

    const docs = brokerData.documents || {};

    // Identity documents
    const identityDocItems: DocItem[] = [];
    if (docs.nationalId) {
        identityDocItems.push({
            label: 'National ID',
            uri: docs.nationalId,
            fileType: docs.nationalIdType,
            isImage: isImageFileType(docs.nationalIdType, docs.nationalId),
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

    // Company documents (only relevant when typeOfBroker === "Company Broker")
    const companyDocItems: DocItem[] = [];
    if (brokerData.typeOfBroker === 'Company Broker') {
        if (docs.companyRegistrationCertificate) {
            companyDocItems.push({
                label: 'Company Registration Certificate',
                uri: docs.companyRegistrationCertificate,
                fileType: docs.companyRegistrationCertificateType,
                isImage: isImageFileType(docs.companyRegistrationCertificateType, docs.companyRegistrationCertificate),
            });
        }
        if (docs.companyLetterHead) {
            companyDocItems.push({
                label: 'Company Letterhead',
                uri: docs.companyLetterHead,
                fileType: docs.companyLetterHeadType,
                isImage: isImageFileType(docs.companyLetterHeadType, docs.companyLetterHead),
            });
        }
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
            'Approve Broker',
            'Are you sure you want to approve this broker?',
            [
                { title: 'Approve', onPress: () => approveBroker() }
            ]
        );
    };

    const approveBroker = async () => {
        try {
            setProcessing(true);
            await updateDocumentWithAdminTracking(
                'verifiedUsers',
                brokerData.id,
                { verificationStatus: 'approved', rejectionReason: '' },
                ADMIN_ACTIONS.APPROVE_USER,
                'account',
                brokerData.organizationName || brokerData.id,
                'Approved broker verification'
            );

            if (brokerData.expoPushToken) {
                await sendPushNotification(
                    brokerData.expoPushToken,
                    'Broker Verified! 🎉',
                    `Your broker profile (${brokerData.organizationName}) has been approved.`,
                    '/Logistics/Brokers',
                    { brokerId: brokerData.id, type: 'broker_approved' }
                );
            }

            alertBox('Success', 'Broker approved successfully!', [
                { title: 'OK', onPress: () => getData() }
            ]);
        } catch (error) {
            console.error('Error approving broker:', error);
            alertBox('Error', 'Failed to approve broker', [], 'error');
        } finally {
            setProcessing(false);
        }
    };

    const declineBroker = async () => {
        if (!declineReason.trim()) {
            alertBox('Error', 'Please provide a reason for declining', [], 'error');
            return;
        }

        try {
            setProcessing(true);
            await updateDocumentWithAdminTracking(
                'verifiedUsers',
                brokerData.id,
                { verificationStatus: 'rejected', rejectionReason: declineReason.trim() },
                ADMIN_ACTIONS.DECLINE_USER,
                'account',
                brokerData.organizationName || brokerData.id,
                `Declined broker verification: ${declineReason.trim()}`
            );

            if (brokerData.expoPushToken) {
                await sendPushNotification(
                    brokerData.expoPushToken,
                    'Broker Verification Declined',
                    `Your broker profile (${brokerData.organizationName}) has been declined. Reason: ${declineReason}`,
                    '/Logistics/Brokers',
                    { brokerId: brokerData.id, type: 'broker_declined' }
                );
            }

            alertBox('Success', 'Broker declined successfully!', [
                {
                    title: 'OK', onPress: () => {
                        setShowDeclineModal(false);
                        setDeclineReason('');
                        getData();
                    }
                }
            ]);
        } catch (error) {
            console.error('Error declining broker:', error);
            alertBox('Error', 'Failed to decline broker', [], 'error');
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
                                    Manage Broker
                                </ThemedText>

                                {/* 1. EDIT BROKER */}
                                <TouchableOpacity
                                    style={styles.actionButton}
                                >
                                    <Ionicons name="create-outline" size={22} color={accent} />
                                    <ThemedText type="subtitle">Edit Broker Info</ThemedText>
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
                                            "Delete Broker",
                                            "Are you sure you want to delete this broker?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            await deleteDocument('Brokers', brokerData.id);

                                                            ToastAndroid.show(
                                                                "Broker deleted successfully",
                                                                ToastAndroid.SHORT
                                                            );
                                                        } catch {
                                                            alertBox(
                                                                "Error",
                                                                "Failed to delete broker",
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
                                        Delete Broker
                                    </ThemedText>
                                    <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {showAlert}
            <Heading page={brokerData.organizationName || "Broker Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && user?.uid === brokerData.userId &&
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
                        {(brokerData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (brokerData?.organizationPhone) && Linking.openURL(`tel:${(brokerData?.organizationPhone)}`)}>
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
                        {(brokerData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${brokerData.organizationName},\n\nI'd like to get in touch regarding your broker profile.\n`;
                                            (brokerData?.organizationPhone) && Linking.openURL(`sms:${(brokerData?.organizationPhone)}?body=${encodeURIComponent(message)}`);
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
                        {(brokerData?.organizationPhone) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${brokerData.organizationName},\n\nI'd like to get in touch regarding your broker profile.\n`;
                                            (brokerData?.organizationPhone) && Linking.openURL(`https://wa.me/${(brokerData?.organizationPhone)}?text=${encodeURIComponent(message)}`);
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
                        {(brokerData?.email) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (brokerData?.email) && Linking.openURL(`mailto:${(brokerData?.email)}`)}>
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
                                <TouchableNativeFeedback onPress={toggleSaveBroker}>
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
                                    {brokerData.organizationName}
                                </ThemedText>
                                <ThemedText>
                                    {brokerData.location}
                                </ThemedText>
                            </View>
                            {brokerData.verificationStatus === 'approved' &&
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
                                Broker Type
                            </ThemedText>
                            <ThemedText type="subtitle">
                                {brokerData.typeOfBroker || '--'}
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
                                    backgroundColor: statusColor(brokerData.verificationStatus)
                                }} />
                                <ThemedText type="subtitle" style={{ color: statusColor(brokerData.verificationStatus), textTransform: 'capitalize' }}>
                                    {brokerData.verificationStatus || 'pending'}
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
                                    {brokerData.organizationPhone || brokerData.phoneNumber || '--'}
                                </ThemedText>
                            </View>
                        </View>
                        {brokerData.email &&
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="tiny" style={{}}>
                                        Email
                                    </ThemedText>
                                    <ThemedText type="subtitle" style={{ marginBottom: wp(2) }}>
                                        {brokerData.email}
                                    </ThemedText>
                                </View>
                            </View>
                        }
                        {brokerData.operationCountries && brokerData.operationCountries.length > 0 &&
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="tiny" style={{}}>
                                        Operating Countries
                                    </ThemedText>
                                    <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                                        {brokerData.operationCountries.join(', ')}
                                    </ThemedText>
                                </View>
                            </View>
                        }
                    </View>

                    {/* Admin Info Section */}
                    {(brokerData.organizationMainAdminName) ? (
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
                                    {brokerData.organizationMainAdminName}
                                </ThemedText>
                            </View>

                            {brokerData.organizationAdminPhone && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                                    <ThemedText style={{ color: textColor }}>Phone:</ThemedText>
                                    <ThemedText style={{ color: textColor }}>
                                        {brokerData.organizationAdminPhone}
                                    </ThemedText>
                                </View>
                            )}

                            {brokerData.organizationAdminEmail && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <ThemedText style={{ color: textColor }}>Email:</ThemedText>
                                    <ThemedText style={{ color: textColor }}>
                                        {brokerData.organizationAdminEmail}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {brokerData.rejectionReason && brokerData.verificationStatus === 'rejected' &&
                        <View style={{
                            backgroundColor: '#ff6b6b20',
                            padding: wp(3),
                            borderRadius: wp(3),
                        }}>
                            <ThemedText type="tiny" style={{ color: '#ff6b6b', marginBottom: wp(1) }}>
                                Decline Reason:
                            </ThemedText>
                            <ThemedText style={{ color: textColor }}>
                                {brokerData.rejectionReason}
                            </ThemedText>
                        </View>
                    }

                    {<View>
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
                                <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>Company Documents</ThemedText>
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
                    {dspDetails === 'admin' && brokerData.verificationStatus !== 'approved' && (
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
                                    Approve Broker
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
                                    Decline Broker
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
                                {brokerData.organizationName}
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
                            placeholder="Please provide a reason for declining this broker..."
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
                                onPress={declineBroker}
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

export default BrokerDetails

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
