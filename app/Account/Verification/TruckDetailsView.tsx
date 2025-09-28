import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Pressable, ToastAndroid, Alert, Linking, Image } from 'react-native';
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
import { deleteDocument, updateDocument } from '@/db/operations';
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
    createdAt: string;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}

const TruckDetailsView = () => {
    const { details } = useLocalSearchParams();
    const { user, alertBox } = useAuth();

    // Theme colors
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const border = useThemeColor('border');
    const coolGray = useThemeColor('coolGray');

    const [truckDetails, setTruckDetails] = useState<TruckPersonDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showAlert, setShowAlert] = useState<React.ReactElement | null>(null);

    // Image viewing state
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState<string[]>([]);

    // PDF viewing state
    const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
    const [currentPdfUrl, setCurrentPdfUrl] = useState('');
    const [currentPdfTitle, setCurrentPdfTitle] = useState('');

    useEffect(() => {
        if (details) {
            try {
                const parsedDetails = JSON.parse(details as string);
                setTruckDetails(parsedDetails);
                prepareImages(parsedDetails);
            } catch (error) {
                console.error('Error parsing details:', error);
                ToastAndroid.show('Error loading details', ToastAndroid.SHORT);
            }
        }
    }, [details]);

    const prepareImages = (details: TruckPersonDetails) => {
        const imageList: string[] = [];

        if (details.accType === 'owner') {
            if (details.ownershipProof && details.proofOfTruckOwnerhipType === 'image') {
                imageList.push(details.ownershipProof);
            }
            if (details.directorOwnerId && details.directorOwnerIdType === 'image') {
                imageList.push(details.directorOwnerId);
            }
            if (details.ownerProofOfRes && details.ownerProofOfResType === 'image') {
                imageList.push(details.ownerProofOfRes);
            }
        } else if (details.accType === 'broker') {
            if (details.brockerId && details.brockerIdType === 'image') {
                imageList.push(details.brockerId);
            }
            if (details.proofOfResidence && details.proofOfResidenceType === 'image') {
                imageList.push(details.proofOfResidence);
            }
            if (details.companyRegCertificate && details.companyRegCertificateType === 'image') {
                imageList.push(details.companyRegCertificate);
            }
            if (details.companyLtterHead && details.companyLtterHeadType === 'image') {
                imageList.push(details.companyLtterHead);
            }
        }

        setImages(imageList);
    };

    const handleImagePress = (index: number) => {
        setCurrentIndex(index);
        setIsVisible(true);
    };

    const handleDocumentPress = (url: string, type: string, title: string) => {
        if (type === 'pdf') {
            // Open PDF in viewer
            setCurrentPdfUrl(url);
            setCurrentPdfTitle(title);
            setPdfViewerVisible(true);
        } else {
            // Open image in viewer
            const imageIndex = images.findIndex(img => img === url);
            if (imageIndex !== -1) {
                handleImagePress(imageIndex);
            }
        }
    };

    const handleEdit = () => {
        setModalVisible(false);
        // Navigate to edit page with the details
        router.push({
            pathname: '/Logistics/Trucks/AddTrucks',
            params: { editDetails: JSON.stringify(truckDetails) }
        });
    };

    const handleDelete = () => {
        setModalVisible(false);
        alertBox(
            "Delete Verification Details",
            "Are you sure you want to delete these verification details? This action cannot be undone.",
            [
                {
                    title: "Delete",
                    onPress: async () => {
                        try {
                            if (truckDetails?.id) {
                                await deleteDocument('truckPersonDetails', truckDetails.id);
                                ToastAndroid.show("Verification details deleted successfully", ToastAndroid.SHORT);
                                router.back();
                            }
                        } catch (error) {
                            console.error('Error deleting details:', error);
                            alertBox("Error", "Failed to delete verification details", [], "error");
                        }
                    },
                },
            ],
            "destructive"
        );
    };

    const renderDocumentItem = (url: string, label: string, type: 'pdf' | 'image') => (
        <TouchableOpacity
            key={url}
            onPress={() => handleDocumentPress(url, type, label)}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: wp(3),
                backgroundColor: backgroundLight,
                borderRadius: wp(2),
                marginVertical: wp(1),
                borderWidth: 1,
                borderColor: border
            }}
        >
            <View style={{
                width: wp(10),
                height: wp(10),
                backgroundColor: type === 'pdf' ? '#FF5722' : accent,
                borderRadius: wp(2),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: wp(3)
            }}>
                <Ionicons
                    name={type === 'pdf' ? 'document-text' : 'image'}
                    size={wp(5)}
                    color="white"
                />
            </View>
            <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={{ color: textColor }}>
                    {label}
                </ThemedText>
                <ThemedText type="tiny" style={{ color: icon }}>
                    {type.toUpperCase()} • Tap to {type === 'pdf' ? 'open' : 'view'}
                </ThemedText>
            </View>
            <Ionicons
                name="chevron-forward"
                size={wp(4)}
                color={icon}
            />
        </TouchableOpacity>
    );

    const renderOwnerDetails = () => {
        if (!truckDetails || truckDetails.accType !== 'owner') return null;

        return (
            <View>
                <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                    Owner Information
                </ThemedText>

                <View style={{ gap: wp(2), marginBottom: wp(4) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText style={{ color: textColor }}>Name:</ThemedText>
                        <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                            {truckDetails.ownerName || 'Not provided'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText style={{ color: textColor }}>Phone:</ThemedText>
                        <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                            {truckDetails.ownerPhoneNum || 'Not provided'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText style={{ color: textColor }}>Email:</ThemedText>
                        <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                            {truckDetails.ownerEmail || 'Not provided'}
                        </ThemedText>
                    </View>
                </View>

                <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                    Owner Documents
                </ThemedText>

                {truckDetails.ownershipProof && renderDocumentItem(
                    truckDetails.ownershipProof,
                    'Proof of Ownership',
                    truckDetails.proofOfTruckOwnerhipType as 'pdf' | 'image'
                )}
                {truckDetails.directorOwnerId && renderDocumentItem(
                    truckDetails.directorOwnerId,
                    'Director/Owner ID',
                    truckDetails.directorOwnerIdType as 'pdf' | 'image'
                )}
                {truckDetails.ownerProofOfRes && renderDocumentItem(
                    truckDetails.ownerProofOfRes,
                    'Proof of Residence',
                    truckDetails.ownerProofOfResType as 'pdf' | 'image'
                )}
            </View>
        );
    };

    const renderBrokerDetails = () => {
        if (!truckDetails || truckDetails.accType !== 'broker') return null;

        return (
            <View>
                <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                    Broker Information
                </ThemedText>

                <View style={{ gap: wp(2), marginBottom: wp(4) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText style={{ color: textColor }}>Name:</ThemedText>
                        <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                            {truckDetails.brokerName || 'Not provided'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText style={{ color: textColor }}>Phone:</ThemedText>
                        <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                            {truckDetails.brokerPhoneNum || 'Not provided'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText style={{ color: textColor }}>Email:</ThemedText>
                        <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                            {truckDetails.brokerEmail || 'Not provided'}
                        </ThemedText>
                    </View>
                    {truckDetails.typeOfBroker && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <ThemedText style={{ color: textColor }}>Type:</ThemedText>
                            <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                {truckDetails.typeOfBroker}
                            </ThemedText>
                        </View>
                    )}
                </View>

                <ThemedText type="subtitle" style={{ color: accent, marginBottom: wp(3) }}>
                    Broker Documents
                </ThemedText>

                {truckDetails.brockerId && renderDocumentItem(
                    truckDetails.brockerId,
                    'National ID / Passport',
                    truckDetails.brockerIdType as 'pdf' | 'image'
                )}
                {truckDetails.proofOfResidence && renderDocumentItem(
                    truckDetails.proofOfResidence,
                    'Proof of Residence',
                    truckDetails.proofOfResidenceType as 'pdf' | 'image'
                )}
                {truckDetails.companyRegCertificate && renderDocumentItem(
                    truckDetails.companyRegCertificate,
                    'Company Registration Certificate',
                    truckDetails.companyRegCertificateType as 'pdf' | 'image'
                )}
                {truckDetails.companyLtterHead && renderDocumentItem(
                    truckDetails.companyLtterHead,
                    'Company Letter Head',
                    truckDetails.companyLtterHeadType as 'pdf' | 'image'
                )}
            </View>
        );
    };

    if (!truckDetails) {
        return (
            <ScreenWrapper>
                <Heading page="Truck Verification Details" />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>Loading details...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page="Truck Verification Details" />

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={{ padding: wp(4) }}>
                    {/* Status Section */}
                    <View style={{
                        backgroundColor: backgroundLight,
                        padding: wp(4),
                        borderRadius: wp(3),
                        marginBottom: wp(4),
                        borderWidth: 1,
                        borderColor: border
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
                            <ThemedText type="subtitle" style={{ color: textColor }}>
                                Verification Status
                            </ThemedText>
                            <View style={{
                                backgroundColor: truckDetails.approvalStatus === 'approved' ? '#4CAF50' :
                                    truckDetails.approvalStatus === 'pending' ? '#FF9800' : '#F44336',
                                paddingHorizontal: wp(3),
                                paddingVertical: wp(1),
                                borderRadius: wp(2)
                            }}>
                                <ThemedText style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                    {truckDetails.approvalStatus}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={{ gap: wp(2) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <ThemedText style={{ color: textColor }}>Account Type:</ThemedText>
                                <ThemedText style={{ color: textColor, fontWeight: 'bold', textTransform: 'capitalize' }}>
                                    {truckDetails.accType}
                                </ThemedText>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <ThemedText style={{ color: textColor }}>Created:</ThemedText>
                                <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                    {formatDate(truckDetails.createdAt)}
                                </ThemedText>
                            </View>
                            {truckDetails.approvedAt && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <ThemedText style={{ color: textColor }}>Approved:</ThemedText>
                                    <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                        {formatDate(truckDetails.approvedAt)}
                                    </ThemedText>
                                </View>
                            )}
                            {truckDetails.rejectionReason && (
                                <View style={{ marginTop: wp(2) }}>
                                    <ThemedText style={{ color: '#F44336', fontWeight: 'bold' }}>Rejection Reason:</ThemedText>
                                    <ThemedText style={{ color: textColor, marginTop: wp(1) }}>
                                        {truckDetails.rejectionReason}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Details Section */}
                    <View style={{
                        backgroundColor: backgroundLight,
                        padding: wp(4),
                        borderRadius: wp(3),
                        marginBottom: wp(4),
                        borderWidth: 1,
                        borderColor: border
                    }}>
                        {renderOwnerDetails()}
                        {renderBrokerDetails()}
                    </View>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: wp(3), marginBottom: wp(4) }}>
                        <Button
                            title="Edit Details"
                            onPress={() => setModalVisible(true)}
                            colors={{ text: 'white', bg: accent }}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Delete"
                            onPress={handleDelete}
                            colors={{ text: 'white', bg: '#F44336' }}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Action Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setModalVisible(false)}
                >
                    <BlurView intensity={20} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Pressable
                            style={{
                                backgroundColor: background,
                                padding: wp(6),
                                borderRadius: wp(4),
                                width: wp(80),
                                alignItems: 'center'
                            }}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <ThemedText type="subtitle" style={{ marginBottom: wp(4), color: textColor }}>
                                What would you like to do?
                            </ThemedText>

                            <View style={{ gap: wp(3), width: '100%' }}>
                                <TouchableOpacity
                                    onPress={handleEdit}
                                    style={{
                                        backgroundColor: accent,
                                        padding: wp(4),
                                        borderRadius: wp(3),
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        gap: wp(2)
                                    }}
                                >
                                    <FontAwesome6 name="edit" size={wp(4)} color="white" />
                                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                        Edit Details
                                    </ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={{
                                        backgroundColor: coolGray,
                                        padding: wp(4),
                                        borderRadius: wp(3),
                                        alignItems: 'center'
                                    }}
                                >
                                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                        Cancel
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </BlurView>
                </Pressable>
            </Modal>

            {/* Image Viewer */}
            <ImageViewing
                images={images.map(uri => ({ uri }))}
                imageIndex={currentIndex}
                visible={isVisible}
                onRequestClose={() => setIsVisible(false)}
                onImageIndexChange={setCurrentIndex}
            />

            {/* PDF Viewer */}
            <PDFViewer
                visible={pdfViewerVisible}
                onClose={() => setPdfViewerVisible(false)}
                pdfUrl={currentPdfUrl}
                title={currentPdfTitle}
            />

            {/* Alert Component */}
            {showAlert}
        </ScreenWrapper>
    );
};

export default TruckDetailsView;
