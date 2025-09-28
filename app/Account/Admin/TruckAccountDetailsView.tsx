import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Pressable, Alert, Linking, Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, AntDesign, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { useAuth } from '@/context/AuthContext';
import Divider from '@/components/Divider';
import { formatDate } from '@/services/services';
import { updateDocument } from '@/db/operations';
import ImageViewing from 'react-native-image-viewing';
import { BlurView } from 'expo-blur';
import Button from '@/components/Button';
import PDFViewer from '@/components/PDFViewer';

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
    proofOfTruckOwnerhipType?: string;
    directorOwnerIdType?: string;
    ownerProofOfResType?: string;
    brockerIdType?: string;
    proofOfResidenceType?: string;
    companyRegCertificateType?: string;
    companyLtterHeadType?: string;
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
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState<string[]>([]);
    const [showImageViewer, setShowImageViewer] = useState(false);

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

        Alert.alert(
            'Approve Account',
            'Are you sure you want to approve this truck account verification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            setProcessing(true);

                            await updateDocument('truckPersonDetails', accountDetails.id, {
                                isApproved: true,
                                approvalStatus: 'approved',
                                approvedAt: new Date().toISOString(),
                                approvedBy: user?.uid || 'admin'
                            });

                            Alert.alert('Success', 'Account approved successfully!', [
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
                rejectionReason: rejectionReason.trim()
            });

            Alert.alert('Success', 'Account rejected successfully!', [
                { text: 'OK', onPress: () => router.back() }
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
        setImages(allImages);
        setCurrentImageIndex(allImages.indexOf(imageUrl));
        setShowImageViewer(true);
    };

    const renderDocumentSection = (title: string, documents: { url: string; type: string }[], iconName: string) => {
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
                    {documents.map((doc, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.documentItem}
                            onPress={() => openImageViewer(doc.url, documents.map(d => d.url))}
                        >
                            <View style={styles.documentIcon}>
                                <Ionicons
                                    name={doc.type === 'pdf' ? 'document-text' : 'image'}
                                    size={wp(6)}
                                    color={accent}
                                />
                            </View>
                            <ThemedText type="tiny" style={styles.documentText}>
                                {doc.type === 'pdf' ? 'PDF Document' : 'Image Document'}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
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
    const documents = [];

    // Collect all documents for image viewer
    if (isOwner) {
        if (accountDetails.ownershipProof) documents.push({ url: accountDetails.ownershipProof, type: 'image' });
        if (accountDetails.directorOwnerId) documents.push({ url: accountDetails.directorOwnerId, type: 'image' });
        if (accountDetails.ownerProofOfRes) documents.push({ url: accountDetails.ownerProofOfRes, type: 'image' });
    } else {
        if (accountDetails.brockerId) documents.push({ url: accountDetails.brockerId, type: 'image' });
        if (accountDetails.proofOfResidence) documents.push({ url: accountDetails.proofOfResidence, type: 'image' });
        if (accountDetails.companyRegCertificate) documents.push({ url: accountDetails.companyRegCertificate, type: 'image' });
        if (accountDetails.companyLtterHead) documents.push({ url: accountDetails.companyLtterHead, type: 'image' });
    }

    return (
        <ScreenWrapper>
            <Heading page="Account Details" />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Account Status Header */}
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
                                {isOwner ? 'Truck Owner' : 'Broker'} • {accountDetails.companyName || 'No Company'}
                            </ThemedText>
                        </View>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: accountDetails.approvalStatus === 'approved' ? '#4CAF50' :
                                accountDetails.approvalStatus === 'pending' ? '#FF9800' :
                                    accountDetails.approvalStatus === 'edited' ? '#2196F3' : '#F44336'
                        }
                    ]}>
                        <ThemedText style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {accountDetails.approvalStatus}
                        </ThemedText>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call" size={wp(5)} color={accent} />
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Contact Information
                        </ThemedText>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <ThemedText type="tiny" style={{ color: icon }}>Email</ThemedText>
                            <ThemedText type="default">{isOwner ? accountDetails.ownerEmail : accountDetails.brokerEmail}</ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <ThemedText type="tiny" style={{ color: icon }}>Phone</ThemedText>
                            <ThemedText type="default">{isOwner ? accountDetails.ownerPhoneNum : accountDetails.brokerPhoneNum}</ThemedText>
                        </View>
                        {accountDetails.companyName && (
                            <View style={styles.infoItem}>
                                <ThemedText type="tiny" style={{ color: icon }}>Company</ThemedText>
                                <ThemedText type="default">{accountDetails.companyName}</ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Documents Section */}
                {isOwner ? (
                    <>
                        {renderDocumentSection(
                            'Ownership Proof',
                            accountDetails.ownershipProof ? [{ url: accountDetails.ownershipProof, type: 'image' }] : [],
                            'document'
                        )}
                        {renderDocumentSection(
                            'Director/Owner ID',
                            accountDetails.directorOwnerId ? [{ url: accountDetails.directorOwnerId, type: 'image' }] : [],
                            'card'
                        )}
                        {renderDocumentSection(
                            'Proof of Residence',
                            accountDetails.ownerProofOfRes ? [{ url: accountDetails.ownerProofOfRes, type: 'image' }] : [],
                            'home'
                        )}
                    </>
                ) : (
                    <>
                        {renderDocumentSection(
                            'Broker ID',
                            accountDetails.brockerId ? [{ url: accountDetails.brockerId, type: 'image' }] : [],
                            'card'
                        )}
                        {renderDocumentSection(
                            'Proof of Residence',
                            accountDetails.proofOfResidence ? [{ url: accountDetails.proofOfResidence, type: 'image' }] : [],
                            'home'
                        )}
                        {renderDocumentSection(
                            'Company Registration Certificate',
                            accountDetails.companyRegCertificate ? [{ url: accountDetails.companyRegCertificate, type: 'image' }] : [],
                            'business'
                        )}
                        {renderDocumentSection(
                            'Company Letterhead',
                            accountDetails.companyLtterHead ? [{ url: accountDetails.companyLtterHead, type: 'image' }] : [],
                            'document-text'
                        )}
                    </>
                )}

                {/* Timestamps */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="time" size={wp(5)} color={accent} />
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Timeline
                        </ThemedText>
                    </View>

                    <View style={styles.timeline}>
                        <View style={styles.timelineItem}>
                            <ThemedText type="tiny" style={{ color: icon }}>Created</ThemedText>
                            <ThemedText type="default">{formatDate(accountDetails.createdAt)}</ThemedText>
                        </View>
                        {accountDetails.submittedAt && (
                            <View style={styles.timelineItem}>
                                <ThemedText type="tiny" style={{ color: icon }}>Submitted</ThemedText>
                                <ThemedText type="default">{formatDate(accountDetails.submittedAt)}</ThemedText>
                            </View>
                        )}
                        {accountDetails.approvedAt && (
                            <View style={styles.timelineItem}>
                                <ThemedText type="tiny" style={{ color: icon }}>Approved</ThemedText>
                                <ThemedText type="default">{formatDate(accountDetails.approvedAt)}</ThemedText>
                            </View>
                        )}
                        {accountDetails.rejectedAt && (
                            <View style={styles.timelineItem}>
                                <ThemedText type="tiny" style={{ color: icon }}>Rejected</ThemedText>
                                <ThemedText type="default">{formatDate(accountDetails.rejectedAt)}</ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Rejection Reason */}
                {accountDetails.rejectionReason && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="alert-circle" size={wp(5)} color="#F44336" />
                            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#F44336' }]}>
                                Rejection Reason
                            </ThemedText>
                        </View>
                        <ThemedText type="default" style={styles.rejectionReason}>
                            {accountDetails.rejectionReason}
                        </ThemedText>
                    </View>
                )}

                {/* Action Buttons */}
                {(accountDetails.approvalStatus === 'pending' || accountDetails.approvalStatus === 'edited') && (
                    <View style={styles.actionButtons}>
                        <Button
                            title="Approve"
                            onPress={handleApprove}
                            style={[styles.actionButton, styles.approveButton]}
                            loading={processing}
                        />
                        <Button
                            title="Reject"
                            onPress={() => setShowRejectModal(true)}
                            style={[styles.actionButton, styles.rejectButton]}
                            loading={processing}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Rejection Modal */}
            <Modal
                visible={showRejectModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRejectModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowRejectModal(false)}>
                    <BlurView intensity={20} style={styles.modalContent}>
                        <View style={[styles.modalCard, { backgroundColor: backgroundLight }]}>
                            <ThemedText type="title" style={styles.modalTitle}>
                                Reject Account
                            </ThemedText>
                            <ThemedText type="default" style={styles.modalSubtitle}>
                                Please provide a reason for rejecting this account verification:
                            </ThemedText>

                            <View style={styles.inputContainer}>
                                <ThemedText type="tiny" style={{ color: icon, marginBottom: wp(2) }}>
                                    Rejection Reason
                                </ThemedText>
                                <View style={[styles.textInput, { borderColor: border }]}>
                                    <ThemedText
                                        style={styles.textInputText}
                                        onPress={() => {
                                            // You can add a text input here if needed
                                            Alert.alert('Input', 'Please enter rejection reason');
                                        }}
                                    >
                                        {rejectionReason || 'Tap to enter reason...'}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <Button
                                    title="Cancel"
                                    onPress={() => setShowRejectModal(false)}
                                    style={[styles.modalButton, styles.cancelButton]}
                                />
                                <Button
                                    title="Reject"
                                    onPress={handleReject}
                                    style={[styles.modalButton, styles.confirmRejectButton]}
                                    loading={processing}
                                />
                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {/* Image Viewer */}
            <ImageViewing
                images={images.map(url => ({ uri: url }))}
                imageIndex={currentImageIndex}
                visible={showImageViewer}
                onRequestClose={() => setShowImageViewer(false)}
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
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusTextContainer: {
        marginLeft: wp(3),
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: wp(2),
    },
    section: {
        marginBottom: wp(4),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    sectionTitle: {
        marginLeft: wp(2),
    },
    infoGrid: {
        gap: wp(3),
    },
    infoItem: {
        gap: wp(1),
    },
    documentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    documentItem: {
        width: wp(20),
        alignItems: 'center',
        padding: wp(2),
        borderRadius: wp(2),
        backgroundColor: '#f0f0f0',
    },
    documentIcon: {
        marginBottom: wp(1),
    },
    documentText: {
        textAlign: 'center',
        fontSize: wp(2.5),
    },
    timeline: {
        gap: wp(2),
    },
    timelineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rejectionReason: {
        backgroundColor: '#ffebee',
        padding: wp(3),
        borderRadius: wp(2),
        borderLeftWidth: 3,
        borderLeftColor: '#F44336',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(4),
    },
    actionButton: {
        flex: 1,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modalCard: {
        width: '90%',
        padding: wp(4),
        borderRadius: wp(3),
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
    inputContainer: {
        marginBottom: wp(4),
    },
    textInput: {
        borderWidth: 1,
        borderRadius: wp(2),
        padding: wp(3),
        minHeight: wp(12),
        justifyContent: 'center',
    },
    textInputText: {
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: wp(3),
    },
    modalButton: {
        flex: 1,
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    confirmRejectButton: {
        backgroundColor: '#F44336',
    },
});

export default TruckAccountDetailsView;
