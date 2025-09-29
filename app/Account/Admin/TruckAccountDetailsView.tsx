import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Pressable, Alert, StyleSheet, TextInput } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/services/services';
import { updateDocument, fetchDocuments } from '@/db/operations';
import { where } from 'firebase/firestore';
import ImageViewing from 'react-native-image-viewing';
import { BlurView } from 'expo-blur';
import Button from '@/components/Button';
import PDFViewer from '@/components/PDFViewer';
import { fixFirebaseUrl } from '@/Utilities/utils';
import { Truck } from '@/types/types';

interface TruckPersonDetails {
    id: string;
    userId: string;
    accType: 'owner' | 'broker';
    typeOfBroker?: string;
    ownerName?: string;
    brokerName?: string;
    ownerPhoneNum?: string;
    brokerPhoneNum?: string;
    ownerEmail?: string;
    brokerEmail?: string;
    ownershipProof?: string;
    directorOwnerId?: string;
    ownerProofOfRes?: string;
    brockerId?: string;
    proofOfResidence?: string;
    companyRegCertificate?: string;
    companyLtterHead?: string;
    companyName?: string;
    createdAt: string;
    submittedAt?: string;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'edited';
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}

const TruckAccountDetailsView = () => {
    const { accountId, details } = useLocalSearchParams();
    const { user } = useAuth();

    const [accountDetails, setAccountDetails] = useState<TruckPersonDetails | null>(null);
    console.log('accountDetails', accountDetails);
    const [processing, setProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState<string[]>([]);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [showPDFViewer, setShowPDFViewer] = useState(false);
    const [currentPDFUrl, setCurrentPDFUrl] = useState('');
    const [currentPDFTitle, setCurrentPDFTitle] = useState('');

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const border = useThemeColor('border');

    useEffect(() => {
        if (details) {
            try {
                const parsedDetails = JSON.parse(details as string);
                setAccountDetails(parsedDetails);
            } catch (error) {
                console.error('Error parsing account details:', error);
                Alert.alert('Error', 'Failed to load account details');
            }
        }
    }, [details]);

    const handleApprove = async () => {
        if (!accountDetails) return;
        Alert.alert('Approve Account', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: async () => {
                    try {
                        setProcessing(true);

                        // First, approve the account
                        await updateDocument('truckPersonDetails', accountDetails.id, {
                            isApproved: true,
                            approvalStatus: 'approved',
                            approvedAt: new Date().toISOString(),
                            approvedBy: user?.uid || 'admin',
                        });

                        // Check if the account type was not approved before
                        // If so, update all trucks belonging to this user to set accTypeIsApproved to true
                        if (!accountDetails.isApproved) {
                            try {
                                // Query all trucks belonging to this user
                                const trucksResult = await fetchDocuments('Trucks', 100, undefined, [
                                    where('userId', '==', accountDetails.userId)
                                ]);

                                if (trucksResult.data && trucksResult.data.length > 0) {
                                    // Update all trucks to set accTypeIsApproved to true
                                    const updatePromises = trucksResult.data.map((truck: Truck) =>
                                        updateDocument('Trucks', truck.id, {
                                            accTypeIsApproved: true
                                        })
                                    );

                                    await Promise.all(updatePromises);
                                }
                            } catch (truckUpdateError) {
                                console.error('Error updating trucks:', truckUpdateError);
                            }
                        }

                        Alert.alert('Success', 'Account approved successfully!', [
                            { text: 'OK', onPress: () => router.back() },
                        ]);
                    } catch (error) {
                        console.error('Error approving account:', error);
                        Alert.alert('Error', 'Failed to approve account');
                    } finally {
                        setProcessing(false);
                    }
                },
            },
        ]);
    };

    const handleReject = async () => {
        if (!accountDetails || !rejectionReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for rejection');
            return;
        }
        try {
            setProcessing(true);
            await updateDocument('truckPersonDetails', accountDetails.id, {
                isApproved: false,
                approvalStatus: 'rejected',
                rejectedAt: new Date().toISOString(),
                rejectedBy: user?.uid || 'admin',
                rejectionReason: rejectionReason.trim(),
            });
            Alert.alert('Success', 'Account rejected successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error('Error rejecting account:', error);
            Alert.alert('Error', 'Failed to reject account');
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
            setRejectionReason('');
        }
    };

    const openImageViewer = (imageUrl: string, allImages: string[]) => {
        const fixedImages = allImages.map(url => fixFirebaseUrl(url));
        setImages(fixedImages);
        setCurrentImageIndex(fixedImages.indexOf(fixFirebaseUrl(imageUrl)));
        setShowImageViewer(true);
    };

    const openPDFViewer = (pdfUrl: string, title: string) => {
        setCurrentPDFUrl(fixFirebaseUrl(pdfUrl));
        setCurrentPDFTitle(title);
        setShowPDFViewer(true);
    };

    const isPDF = (url: string) => {
        return url?.toLowerCase().includes('.pdf');
    };


    const renderDocumentSection = (
        title: string,
        documents: { url: string; type: string }[],
        iconName: string
    ) => {
        if (!documents || documents.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name={iconName as any} size={wp(5)} color={accent} />
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        {title}
                    </ThemedText>
                </View>
                <View style={styles.documentsGrid}>
                    {documents.map((doc, index) => {
                        const isPdfDoc = isPDF(doc.url) || doc.type === 'pdf';
                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.documentItem}
                                onPress={() => {
                                    if (isPdfDoc) {
                                        openPDFViewer(doc.url, title);
                                    } else {
                                        openImageViewer(
                                            doc.url,
                                            documents.filter(d => !isPDF(d.url)).map(d => d.url)
                                        );
                                    }
                                }}
                            >
                                {isPdfDoc ? (
                                    <View style={styles.documentPreview}>
                                        <Ionicons
                                            name="document-text"
                                            size={wp(10)}
                                            color={accent}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.documentPreview}>
                                        <ExpoImage
                                            source={{ uri: fixFirebaseUrl(doc.url) }}
                                            style={styles.documentThumbnail}
                                            contentFit="cover"
                                        />
                                    </View>
                                )}
                                <ThemedText
                                    type="tiny"
                                    style={styles.documentText}
                                    numberOfLines={1}
                                >
                                    {isPdfDoc ? 'PDF File' : 'Image'}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    if (!accountDetails) {
        return (
            <ScreenWrapper>
                <Heading page="Account Details" />
                <View style={styles.loadingContainer}>
                    <ThemedText type="default">Loading account details...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    const isOwner = accountDetails.accType === 'owner';

    return (
        <ScreenWrapper>
            <Heading page="Account Details" />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Status */}
                <View style={[styles.statusHeader, { backgroundColor: backgroundLight }]}>
                    <View style={styles.statusInfo}>
                        <Ionicons
                            name={isOwner ? 'person' : 'business'}
                            size={wp(6)}
                            color={accent}
                        />
                        <View style={styles.statusTextContainer}>
                            <ThemedText type="title">
                                {isOwner ? accountDetails.ownerName : accountDetails.brokerName}
                            </ThemedText>
                            <ThemedText type="default" style={{ color: icon }}>
                                {isOwner ? 'Truck Owner' : 'Broker'} •{' '}
                                {accountDetails.companyName || 'No Company'}
                            </ThemedText>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    accountDetails.approvalStatus === 'approved'
                                        ? '#4CAF50'
                                        : accountDetails.approvalStatus === 'pending'
                                            ? '#FF9800'
                                            : accountDetails.approvalStatus === 'edited'
                                                ? '#2196F3'
                                                : '#F44336',
                            },
                        ]}
                    >
                        <ThemedText
                            style={{
                                color: 'white',
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                            }}
                        >
                            {accountDetails.approvalStatus}
                        </ThemedText>
                    </View>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call" size={wp(5)} color={accent} />
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Contact Information
                        </ThemedText>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <ThemedText type="tiny" style={{ color: icon }}>
                                Email
                            </ThemedText>
                            <ThemedText type="default">
                                {isOwner ? accountDetails.ownerEmail : accountDetails.brokerEmail}
                            </ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <ThemedText type="tiny" style={{ color: icon }}>
                                Phone
                            </ThemedText>
                            <ThemedText type="default">
                                {isOwner
                                    ? accountDetails.ownerPhoneNum
                                    : accountDetails.brokerPhoneNum}
                            </ThemedText>
                        </View>
                        {accountDetails.companyName && (
                            <View style={styles.infoItem}>
                                <ThemedText type="tiny" style={{ color: icon }}>
                                    Company
                                </ThemedText>
                                <ThemedText type="default">
                                    {accountDetails.companyName}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Documents */}
                {isOwner ? (
                    <>
                        {renderDocumentSection(
                            'Ownership Proof',
                            accountDetails.ownershipProof
                                ? [{ url: accountDetails.ownershipProof, type: 'image' }]
                                : [],
                            'document'
                        )}
                        {renderDocumentSection(
                            'Director/Owner ID',
                            accountDetails.directorOwnerId
                                ? [{ url: accountDetails.directorOwnerId, type: 'image' }]
                                : [],
                            'card'
                        )}
                        {renderDocumentSection(
                            'Proof of Residence',
                            accountDetails.ownerProofOfRes
                                ? [{ url: accountDetails.ownerProofOfRes, type: 'image' }]
                                : [],
                            'home'
                        )}
                    </>
                ) : (
                    <>
                        {renderDocumentSection(
                            'Broker ID',
                            accountDetails.brockerId
                                ? [{ url: accountDetails.brockerId, type: 'image' }]
                                : [],
                            'card'
                        )}
                        {renderDocumentSection(
                            'Proof of Residence',
                            accountDetails.proofOfResidence
                                ? [{ url: accountDetails.proofOfResidence, type: 'image' }]
                                : [],
                            'home'
                        )}
                        {renderDocumentSection(
                            'Company Registration Certificate',
                            accountDetails.companyRegCertificate
                                ? [{ url: accountDetails.companyRegCertificate, type: 'pdf' }]
                                : [],
                            'business'
                        )}
                        {renderDocumentSection(
                            'Company Letterhead',
                            accountDetails.companyLtterHead
                                ? [{ url: accountDetails.companyLtterHead, type: 'image' }]
                                : [],
                            'document-text'
                        )}
                    </>
                )}
            </ScrollView>

            {/* Image Viewer */}
            <ImageViewing
                images={images.map(url => ({ uri: url }))}
                imageIndex={currentImageIndex}
                visible={showImageViewer}
                onRequestClose={() => setShowImageViewer(false)}
            />

            {/* Action Buttons - Only show for pending/edited accounts */}
            {accountDetails.approvalStatus === 'pending' || accountDetails.approvalStatus === 'edited' ? (
                <View style={styles.actionButtonsContainer}>
                    <Button
                        title="Reject"
                        onPress={() => setShowRejectModal(true)}
                        style={[styles.actionButton, styles.rejectButton]}
                        textStyle={styles.rejectButtonText}
                        disabled={processing}
                    />
                    <Button
                        title="Approve"
                        onPress={handleApprove}
                        style={[styles.actionButton, styles.approveButton]}
                        textStyle={styles.approveButtonText}
                        disabled={processing}
                    />
                </View>
            ) : null}

            {/* Rejection Modal */}
            <Modal
                visible={showRejectModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRejectModal(false)}
            >
                <BlurView intensity={20} style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: background }]}>
                        <ThemedText type="title" style={styles.modalTitle}>
                            Reject Account
                        </ThemedText>
                        <ThemedText type="default" style={styles.modalSubtitle}>
                            Please provide a reason for rejecting this account:
                        </ThemedText>

                        <View style={[styles.textInputContainer, { borderColor: border }]}>
                            <TextInput
                                style={[styles.textInput, { color: textColor }]}
                                multiline
                                numberOfLines={4}
                                placeholder="Enter rejection reason..."
                                placeholderTextColor={icon}
                                value={rejectionReason}
                                onChangeText={setRejectionReason}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                onPress={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                style={[styles.modalButton, styles.cancelButton]}
                                textStyle={styles.cancelButtonText}
                                disabled={processing}
                            />
                            <Button
                                title="Reject"
                                onPress={handleReject}
                                style={[styles.modalButton, styles.confirmRejectButton]}
                                textStyle={styles.confirmRejectButtonText}
                                disabled={processing || !rejectionReason.trim()}
                            />
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* PDF Viewer */}
            <PDFViewer
                visible={showPDFViewer}
                onClose={() => setShowPDFViewer(false)}
                pdfUrl={currentPDFUrl}
                title={currentPDFTitle}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: wp(4) },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    statusInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    statusTextContainer: { marginLeft: wp(3), flex: 1 },
    statusBadge: { paddingHorizontal: wp(3), paddingVertical: wp(1.5), borderRadius: wp(2) },
    section: { marginBottom: wp(4) },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: wp(3) },
    sectionTitle: { marginLeft: wp(2) },
    infoGrid: { gap: wp(3) },
    infoItem: { gap: wp(1) },
    documentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2) },
    documentItem: {
        width: wp(22),
        alignItems: 'center',
        padding: wp(2),
        borderRadius: wp(2),
        backgroundColor: '#f0f0f0',
    },
    documentPreview: {
        width: '100%',
        height: wp(20),
        borderRadius: wp(2),
        overflow: 'hidden',
        marginBottom: wp(1),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
    },
    documentThumbnail: { width: '100%', height: '100%' },
    documentText: { textAlign: 'center' },
    // Action buttons styles
    actionButtonsContainer: {
        flexDirection: 'row',
        padding: wp(4),
        gap: wp(3),
        backgroundColor: 'transparent',
    },
    actionButton: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    rejectButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    approveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    modalContainer: {
        width: '100%',
        maxWidth: wp(90),
        borderRadius: wp(3),
        padding: wp(5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: wp(2),
    },
    modalSubtitle: {
        textAlign: 'center',
        marginBottom: wp(4),
        opacity: 0.7,
    },
    textInputContainer: {
        borderWidth: 1,
        borderRadius: wp(2),
        padding: wp(3),
        marginBottom: wp(4),
        minHeight: wp(20),
    },
    textInput: {
        textAlignVertical: 'top',
        minHeight: wp(15),
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
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    confirmRejectButton: {
        backgroundColor: '#F44336',
    },
    confirmRejectButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default TruckAccountDetailsView;
