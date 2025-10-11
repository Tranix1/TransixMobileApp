import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Image, Linking } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { formatDate } from '@/services/services';
import { approveLoadAccount, rejectLoadAccount } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import ImageViewing from 'react-native-image-viewing';
import { fixFirebaseUrl } from '@/Utilities/utils';

interface LoadAccountDetails {
    id: string;
    userId: string;
    accType: 'general' | 'professional';
    fullName: string;
    phoneNumber: string;
    email: string;
    countryCode: string;
    idDocument?: string;
    idDocumentType?: string;
    proofOfResidence?: string;
    proofOfResidenceType?: string;
    brokerId?: string;
    brokerIdType?: string;
    companyRegCertificate?: string;
    companyRegCertificateType?: string;
    companyLetterHead?: string;
    companyLetterHeadType?: string;
    typeOfBroker?: string;
    createdAt: string;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'edited';
    isApproved: boolean;
    approvedAt?: string;
    rejectedAt?: string;
    approvedBy?: string;
    rejectedBy?: string;
    rejectionReason?: string;
}

const LoadAccountDetailsView = () => {
    const { accountId, details } = useLocalSearchParams();
    const [accountDetails, setAccountDetails] = useState<LoadAccountDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<{ url: string, type: string, name: string } | null>(null);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [imageViewerImages, setImageViewerImages] = useState<Array<{ uri: string }>>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user } = useAuth();

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');

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
        setLoading(false);
    }, [details]);

    const handleApprove = async () => {
        if (!accountDetails || !user) return;

        Alert.alert(
            'Approve Account',
            'Are you sure you want to approve this load account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await approveLoadAccount(accountDetails.id, user.uid);

                            Alert.alert('Success', 'Load account approved successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error approving account:', error);
                            Alert.alert('Error', 'Failed to approve account');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async () => {
        if (!accountDetails || !user) return;

        Alert.prompt(
            'Reject Account',
            'Please provide a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async (rejectionReason?: string) => {
                        if (!rejectionReason || rejectionReason.trim() === '') {
                            Alert.alert('Error', 'Please provide a rejection reason');
                            return;
                        }

                        setProcessing(true);
                        try {
                            await rejectLoadAccount(accountDetails.id, user.uid, rejectionReason.trim());

                            Alert.alert('Success', 'Load account rejected successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error rejecting account:', error);
                            Alert.alert('Error', 'Failed to reject account');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ],
            'plain-text',
            ''
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#F48024';
            case 'approved':
                return '#4CAF50';
            case 'rejected':
                return '#F44336';
            case 'edited':
                return '#2196F3';
            default:
                return accent;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return 'time-outline';
            case 'approved':
                return 'checkmark-circle-outline';
            case 'rejected':
                return 'close-circle-outline';
            case 'edited':
                return 'create-outline';
            default:
                return 'help-circle-outline';
        }
    };

    const getAccountTypeIcon = (accType: string) => {
        switch (accType) {
            case 'professional':
                return 'briefcase-outline';
            case 'general':
                return 'person-outline';
            default:
                return 'person-outline';
        }
    };

    const getAccountTypeColor = (accType: string) => {
        switch (accType) {
            case 'professional':
                return '#FF9800';
            case 'general':
                return '#4CAF50';
            default:
                return accent;
        }
    };

    const handleDocumentPress = (url: string, type: string, name: string) => {
        if (!url) {
            Alert.alert('Error', 'Document not available');
            return;
        }

        // Check if it's an image
        const isImage = type === 'image' || type === 'jpg' || type === 'jpeg' || type === 'png';

        if (isImage) {
            // Validate URL format
            const isValidUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://');

            if (!isValidUrl) {
                Alert.alert('Error', 'Invalid image URL format');
                return;
            }

            // Use the proper Firebase URL fixing function
            const fixedUrl = fixFirebaseUrl(url);
            const imageArray = [{ uri: fixedUrl }];
            setImageViewerImages(imageArray);
            setCurrentImageIndex(0);
            setShowImageViewer(true);
        } else {
            setSelectedDocument({ url, type, name });
            setShowDocumentModal(true);
        }
    };

    const openDocumentInBrowser = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open this document');
            }
        } catch (error) {
            console.error('Error opening document:', error);
            Alert.alert('Error', 'Failed to open document');
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Account Details' />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accent} />
                    <ThemedText style={{ marginTop: wp(4) }}>Loading account details...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!accountDetails) {
        return (
            <ScreenWrapper>
                <Heading page='Account Details' />
                <View style={styles.errorContainer}>
                    <ThemedText>Account details not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Account Details' />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Status Header */}
                <View style={[styles.statusHeader, { backgroundColor: backgroundLight }]}>
                    <View style={styles.statusInfo}>
                        <Ionicons
                            name={getStatusIcon(accountDetails.approvalStatus)}
                            size={wp(6)}
                            color={getStatusColor(accountDetails.approvalStatus)}
                        />
                        <View style={styles.statusTextContainer}>
                            <ThemedText type="subtitle">
                                {accountDetails.approvalStatus.charAt(0).toUpperCase() + accountDetails.approvalStatus.slice(1)}
                            </ThemedText>
                            <ThemedText type="tiny" style={{ color: icon }}>
                                Submitted: {formatDate(accountDetails.createdAt)}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Account Type */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Account Type</ThemedText>

                    <View style={styles.detailRow}>
                        <Ionicons
                            name={getAccountTypeIcon(accountDetails.accType)}
                            size={wp(4)}
                            color={getAccountTypeColor(accountDetails.accType)}
                        />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Type</ThemedText>
                            <ThemedText style={{ color: getAccountTypeColor(accountDetails.accType), fontWeight: 'bold' }}>
                                {accountDetails.accType.charAt(0).toUpperCase() + accountDetails.accType.slice(1)}
                                {accountDetails.typeOfBroker && ` - ${accountDetails.typeOfBroker}`}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Personal Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Personal Information</ThemedText>

                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Full Name</ThemedText>
                            <ThemedText>{accountDetails.fullName}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Phone Number</ThemedText>
                            <ThemedText>{accountDetails.countryCode} {accountDetails.phoneNumber}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="mail-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Email Address</ThemedText>
                            <ThemedText>{accountDetails.email}</ThemedText>
                        </View>
                    </View>
                </View>



                {/* Document Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Document Information</ThemedText>

                    <TouchableOpacity
                        style={styles.detailRow}
                        onPress={() => {
                            const idDoc = accountDetails.idDocument || accountDetails.brokerId;
                            const idDocType = accountDetails.idDocumentType || accountDetails.brokerIdType;
                            idDoc && handleDocumentPress(
                                idDoc,
                                idDocType || 'unknown',
                                'ID Document'
                            );
                        }}
                        disabled={!(accountDetails.idDocument || accountDetails.brokerId)}
                    >
                        <Ionicons name="document-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>ID Document</ThemedText>
                            <ThemedText style={{ color: (accountDetails.idDocument || accountDetails.brokerId) ? accent : icon }}>
                                {(accountDetails.idDocument || accountDetails.brokerId) ? `✓ Uploaded (Tap to view)` : '✗ Not uploaded'}
                                {(accountDetails.idDocumentType || accountDetails.brokerIdType) && ` (${(accountDetails.idDocumentType || accountDetails.brokerIdType || '').toUpperCase()})`}
                            </ThemedText>
                        </View>
                        {(accountDetails.idDocument || accountDetails.brokerId) && (
                            <Ionicons name="eye-outline" size={wp(4)} color={accent} />
                        )}
                    </TouchableOpacity>

                    {accountDetails.accType === 'professional' && (
                        <>
                            <TouchableOpacity
                                style={styles.detailRow}
                                onPress={() => accountDetails.proofOfResidence && handleDocumentPress(
                                    accountDetails.proofOfResidence,
                                    accountDetails.proofOfResidenceType || 'unknown',
                                    'Proof of Residence'
                                )}
                                disabled={!accountDetails.proofOfResidence}
                            >
                                <Ionicons name="home-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Proof of Residence</ThemedText>
                                    <ThemedText style={{ color: accountDetails.proofOfResidence ? accent : icon }}>
                                        {accountDetails.proofOfResidence ? '✓ Uploaded (Tap to view)' : '✗ Not uploaded'}
                                        {accountDetails.proofOfResidenceType && ` (${accountDetails.proofOfResidenceType.toUpperCase()})`}
                                    </ThemedText>
                                </View>
                                {accountDetails.proofOfResidence && (
                                    <Ionicons name="eye-outline" size={wp(4)} color={accent} />
                                )}
                            </TouchableOpacity>

                            {accountDetails.typeOfBroker === 'Company Broker' && (
                                <>
                                    <TouchableOpacity
                                        style={styles.detailRow}
                                        onPress={() => accountDetails.companyRegCertificate && handleDocumentPress(
                                            accountDetails.companyRegCertificate,
                                            accountDetails.companyRegCertificateType || 'unknown',
                                            'Company Registration Certificate'
                                        )}
                                        disabled={!accountDetails.companyRegCertificate}
                                    >
                                        <Ionicons name="business-outline" size={wp(4)} color={icon} />
                                        <View style={styles.detailContent}>
                                            <ThemedText type="tiny" style={{ color: icon }}>Company Registration Certificate</ThemedText>
                                            <ThemedText style={{ color: accountDetails.companyRegCertificate ? accent : icon }}>
                                                {accountDetails.companyRegCertificate ? '✓ Uploaded (Tap to view)' : '✗ Not uploaded'}
                                                {accountDetails.companyRegCertificateType && ` (${accountDetails.companyRegCertificateType.toUpperCase()})`}
                                            </ThemedText>
                                        </View>
                                        {accountDetails.companyRegCertificate && (
                                            <Ionicons name="eye-outline" size={wp(4)} color={accent} />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.detailRow}
                                        onPress={() => accountDetails.companyLetterHead && handleDocumentPress(
                                            accountDetails.companyLetterHead,
                                            accountDetails.companyLetterHeadType || 'unknown',
                                            'Company Letter Head'
                                        )}
                                        disabled={!accountDetails.companyLetterHead}
                                    >
                                        <Ionicons name="mail-outline" size={wp(4)} color={icon} />
                                        <View style={styles.detailContent}>
                                            <ThemedText type="tiny" style={{ color: icon }}>Company Letter Head</ThemedText>
                                            <ThemedText style={{ color: accountDetails.companyLetterHead ? accent : icon }}>
                                                {accountDetails.companyLetterHead ? '✓ Uploaded (Tap to view)' : '✗ Not uploaded'}
                                                {accountDetails.companyLetterHeadType && ` (${accountDetails.companyLetterHeadType.toUpperCase()})`}
                                            </ThemedText>
                                        </View>
                                        {accountDetails.companyLetterHead && (
                                            <Ionicons name="eye-outline" size={wp(4)} color={accent} />
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                        </>
                    )}
                </View>

                {/* Rejection Reason (if rejected) */}
                {accountDetails.approvalStatus === 'rejected' && accountDetails.rejectionReason && (
                    <View style={[styles.section, { backgroundColor: '#F4433624' }]}>
                        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#F44336' }]}>
                            Rejection Reason
                        </ThemedText>
                        <ThemedText style={{ color: '#F44336' }}>
                            {accountDetails.rejectionReason}
                        </ThemedText>
                    </View>
                )}

                {/* Action Buttons */}
                {accountDetails && (accountDetails.approvalStatus === 'pending' || accountDetails.approvalStatus === 'edited' || !accountDetails.isApproved) && (
                    <View style={styles.actionButtonsContainer}>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.customButton,
                                    styles.rejectButton,
                                    { marginRight: wp(2) },
                                    processing && styles.disabledButton
                                ]}
                                onPress={handleReject}
                                disabled={processing}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close-circle" size={wp(4)} color="#F44336" style={{ marginRight: wp(2) }} />
                                <ThemedText style={[styles.buttonText, styles.rejectButtonText]}>
                                    Reject
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.customButton,
                                    styles.approveButton,
                                    { marginLeft: wp(2) },
                                    processing && styles.disabledButton
                                ]}
                                onPress={handleApprove}
                                disabled={processing}
                                activeOpacity={0.7}
                            >
                                {processing ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#4CAF50" />
                                        <ThemedText style={[styles.buttonText, styles.approveButtonText, { marginLeft: wp(2) }]}>
                                            Approving...
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={wp(4)} color="#4CAF50" style={{ marginRight: wp(2) }} />
                                        <ThemedText style={[styles.buttonText, styles.approveButtonText]}>
                                            Approve
                                        </ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Document Viewer Modal */}
            <Modal
                visible={showDocumentModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDocumentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.documentModal, { backgroundColor: background }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle">{selectedDocument?.name}</ThemedText>
                            <TouchableOpacity
                                onPress={() => setShowDocumentModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={wp(6)} color={icon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.documentContent}>
                            {selectedDocument?.type === 'image' || selectedDocument?.type === 'jpg' || selectedDocument?.type === 'jpeg' || selectedDocument?.type === 'png' ? (
                                <Image
                                    source={{ uri: selectedDocument.url }}
                                    style={styles.documentImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.documentPlaceholder}>
                                    <Ionicons
                                        name={selectedDocument?.type === 'pdf' ? 'document-text' : 'document'}
                                        size={wp(20)}
                                        color={icon}
                                    />
                                    <ThemedText style={{ marginTop: wp(4), textAlign: 'center' }}>
                                        {selectedDocument?.type.toUpperCase()} Document
                                    </ThemedText>
                                    <ThemedText type="tiny" style={{ color: icon, textAlign: 'center', marginTop: wp(2) }}>
                                        Tap "Open in Browser" to view this document
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.customButton, styles.modalButton, { backgroundColor: accent }]}
                                onPress={() => selectedDocument && openDocumentInBrowser(selectedDocument.url)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                    Open in Browser
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.customButton, styles.modalButton, { backgroundColor: backgroundLight }]}
                                onPress={() => setShowDocumentModal(false)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={[styles.buttonText, { color: icon }]}>
                                    Close
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Image Viewer */}
            <ImageViewing
                images={imageViewerImages}
                imageIndex={currentImageIndex}
                visible={showImageViewer}
                onRequestClose={() => setShowImageViewer(false)}
                onImageIndexChange={(index) => setCurrentImageIndex(index)}
                presentationStyle="fullScreen"
                doubleTapToZoomEnabled={true}
                swipeToCloseEnabled={true}
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
                        <TouchableOpacity onPress={() => setShowImageViewer(false)} style={{ marginRight: 8, marginLeft: 4 }}>
                            <AntDesign name="close" size={15} color="#fff" />
                        </TouchableOpacity>
                        <ThemedText style={{ fontWeight: 'bold', fontSize: 14 }}>
                            Document Image ({currentImageIndex + 1}/{imageViewerImages.length})
                        </ThemedText>
                    </View>
                )}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    statusHeader: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusTextContainer: {
        marginLeft: wp(3),
        flex: 1,
    },
    section: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(3),
        color: '#1E90FF',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: wp(3),
    },
    detailContent: {
        flex: 1,
        marginLeft: wp(3),
    },
    actionButtonsContainer: {
        marginTop: wp(6),
        marginBottom: wp(8),
        paddingHorizontal: wp(2),
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    actionButton: {
        flex: 1,
    },
    customButton: {
        flex: 1,
        paddingVertical: wp(4),
        paddingHorizontal: wp(4),
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: wp(14),
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    rejectButton: {
        backgroundColor: '#F4433624',
        borderWidth: 1,
        borderColor: '#F44336',
    },
    approveButton: {
        backgroundColor: '#4CAF5024',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    rejectButtonText: {
        color: '#F44336',
        fontWeight: '700',
        fontSize: wp(4),
    },
    approveButtonText: {
        color: '#4CAF50',
        fontWeight: '700',
        fontSize: wp(4),
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        fontWeight: '700',
        fontSize: wp(4),
    },
    modalButton: {
        flex: 1,
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentModal: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: wp(4),
        padding: wp(4),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4),
        paddingBottom: wp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    closeButton: {
        padding: wp(2),
    },
    documentContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp(40),
    },
    documentImage: {
        width: '100%',
        height: hp(40),
        borderRadius: wp(2),
    },
    documentPlaceholder: {
        alignItems: 'center',
        padding: wp(8),
    },
    modalActions: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(4),
    },
});

export default LoadAccountDetailsView;
