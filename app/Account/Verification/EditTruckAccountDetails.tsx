import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ToastAndroid, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, AntDesign, Entypo } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { useAuth } from '@/context/AuthContext';
import Divider from '@/components/Divider';
import Input from '@/components/Input';
import { Dropdown } from 'react-native-element-dropdown';
import { Countries } from '@/types/types';
import { countryCodes } from '@/data/appConstants';
import { selectImage, selectMultipleImages } from '@/Utilities/imageUtils';
import { pickDocument } from '@/Utilities/utils';
import { uploadImage } from '@/db/operations';
import { updateDocument } from '@/db/operations';
import ImageViewing from 'react-native-image-viewing';
import { BlurView } from 'expo-blur';
import Button from '@/components/Button';
import PDFViewer from '@/components/PDFViewer';
import { fixFirebaseUrl } from '@/Utilities/utils';
import type { ImagePickerAsset } from 'expo-image-picker';
import { DocumentAsset } from '@/types/types';

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
    rejectedAt?: string;
    rejectionReason?: string;
}

const EditTruckAccountDetails = () => {
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const background = useThemeColor("background");
    const backgroundLight = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");
    const coolGray = useThemeColor("coolGray");
    const border = useThemeColor("border");

    const { accountId, details } = useLocalSearchParams();
    const { user, alertBox } = useAuth();

    // Form state
    const [accountDetails, setAccountDetails] = useState<TruckPersonDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Basic info state
    const [accType, setAccType] = useState<'owner' | 'broker'>('owner');
    const [typeOfBroker, setTypeOfBroker] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [brokerName, setBrokerName] = useState('');
    const [ownerPhoneNum, setOwnerPhoneNum] = useState('');
    const [brokerPhoneNum, setBrokerPhoneNum] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [brokerEmail, setBrokerEmail] = useState('');
    const [companyName, setCompanyName] = useState('');

    // Document state
    const [documents, setDocuments] = useState<DocumentAsset[]>([]);
    const [documentTypes, setDocumentTypes] = useState<('pdf' | 'image')[]>([]);
    const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});

    // UI state
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState<string[]>([]);
    const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
    const [currentPdfUrl, setCurrentPdfUrl] = useState('');
    const [currentPdfTitle, setCurrentPdfTitle] = useState('');

    const brokerTypes = [
        { value: 'freight', label: 'Freight Broker' },
        { value: 'logistics', label: 'Logistics Broker' },
        { value: 'transport', label: 'Transport Broker' },
    ];

    useEffect(() => {
        console.log('EditTruckAccountDetails - Received params:', { accountId, details });
        if (details) {
            try {
                const parsedDetails = JSON.parse(details as string);
                console.log('EditTruckAccountDetails - Parsed details:', parsedDetails);
                setAccountDetails(parsedDetails);
                initializeFormData(parsedDetails);
            } catch (error) {
                console.error('Error parsing account details:', error);
                alertBox("Error", "Failed to load account details", [], "error");
            }
        } else {
            console.log('EditTruckAccountDetails - No details parameter received');
        }
    }, [details, accountId]);

    const initializeFormData = (details: TruckPersonDetails) => {
        setAccType(details.accType || 'owner');
        setTypeOfBroker(details.typeOfBroker || '');
        setOwnerName(details.ownerName || '');
        setBrokerName(details.brokerName || '');
        setOwnerPhoneNum(details.ownerPhoneNum || '');
        setBrokerPhoneNum(details.brokerPhoneNum || '');
        setOwnerEmail(details.ownerEmail || '');
        setBrokerEmail(details.brokerEmail || '');
        setCompanyName(details.companyName || '');

        // Initialize image cache
        const cache: { [key: string]: string } = {};
        if (details.ownershipProof) cache.ownershipProof = fixFirebaseUrl(details.ownershipProof);
        if (details.directorOwnerId) cache.directorOwnerId = fixFirebaseUrl(details.directorOwnerId);
        if (details.ownerProofOfRes) cache.ownerProofOfRes = fixFirebaseUrl(details.ownerProofOfRes);
        if (details.brockerId) cache.brockerId = fixFirebaseUrl(details.brockerId);
        if (details.proofOfResidence) cache.proofOfResidence = fixFirebaseUrl(details.proofOfResidence);
        if (details.companyRegCertificate) cache.companyRegCertificate = fixFirebaseUrl(details.companyRegCertificate);
        if (details.companyLtterHead) cache.companyLtterHead = fixFirebaseUrl(details.companyLtterHead);
        setImageCache(cache);
    };

    const handleImagePress = useCallback((field: string) => {
        selectImage((image: ImagePickerAsset) => {
            if (image.uri) {
                setImageCache(prev => ({
                    ...prev,
                    [field]: image.uri
                }));
            }
        });
    }, []);

    const handleDocumentPress = useCallback((field: string) => {
        pickDocument(
            (docs) => {
                if (docs.length > 0) {
                    const doc = docs[0];
                    setImageCache(prev => ({
                        ...prev,
                        [field]: doc.uri
                    }));
                }
            },
            (types) => {
                // Handle document types if needed
            }
        );
    }, []);

    const handleViewImage = useCallback((field: string) => {
        const imageUrl = imageCache[field];
        if (imageUrl) {
            setImages([imageUrl]);
            setCurrentIndex(0);
            setIsVisible(true);
        }
    }, [imageCache]);

    const handleViewDocument = useCallback((field: string) => {
        const docUrl = imageCache[field];
        if (docUrl) {
            setCurrentPdfUrl(fixFirebaseUrl(docUrl));
            setCurrentPdfTitle(getFieldLabel(field));
            setPdfViewerVisible(true);
        }
    }, [imageCache]);

    const getFieldLabel = (field: string): string => {
        const labels: { [key: string]: string } = {
            ownershipProof: 'Ownership Proof',
            directorOwnerId: 'Director/Owner ID',
            ownerProofOfRes: 'Owner Proof of Residence',
            brockerId: 'Broker ID',
            proofOfResidence: 'Proof of Residence',
            companyRegCertificate: 'Company Registration Certificate',
            companyLtterHead: 'Company Letterhead',
        };
        return labels[field] || field;
    };

    const handleSaveChanges = async () => {
        console.log('EditTruckAccountDetails - Validation check:', {
            accType,
            typeOfBroker,
            ownerName,
            brokerName,
            ownerPhoneNum,
            brokerPhoneNum,
            ownerEmail,
            brokerEmail
        });

        const missingFields = [
            !accType && "Select Account Type",
            accType === 'broker' && !typeOfBroker && "Select Broker Type",
            accType === 'owner' && !ownerName && "Enter Owner Name",
            accType === 'broker' && !brokerName && "Enter Broker Name",
            accType === 'owner' && !ownerPhoneNum && "Enter Owner Phone Number",
            accType === 'broker' && !brokerPhoneNum && "Enter Broker Phone Number",
            accType === 'owner' && !ownerEmail && "Enter Owner Email",
            accType === 'broker' && !brokerEmail && "Enter Broker Email",
        ].filter(Boolean);

        console.log('EditTruckAccountDetails - Missing fields:', missingFields);

        if (missingFields.length > 0) {
            alertBox("Missing Required Fields", missingFields.join("\n"), [], "error");
            return;
        }

        setSaving(true);

        try {
            // Upload new images/documents
            const updatedData: any = {
                accType,
                companyName,
                approvalStatus: 'edited' as const,
            };

            // Only include relevant fields based on account type
            if (accType === 'broker') {
                updatedData.typeOfBroker = typeOfBroker;
                updatedData.brokerName = brokerName;
                updatedData.brokerPhoneNum = brokerPhoneNum;
                updatedData.brokerEmail = brokerEmail;
                console.log('EditTruckAccountDetails - Saving broker data:', updatedData);
            } else {
                updatedData.ownerName = ownerName;
                updatedData.ownerPhoneNum = ownerPhoneNum;
                updatedData.ownerEmail = ownerEmail;
                console.log('EditTruckAccountDetails - Saving owner data:', updatedData);
            }

            // Upload images if they're new local URIs
            for (const [field, uri] of Object.entries(imageCache)) {
                if (uri && (uri.startsWith('file://') || uri.startsWith('content://'))) {
                    // This is a new local image, upload it
                    const imageAsset: ImagePickerAsset = { uri } as ImagePickerAsset;
                    const uploadedUrl = await uploadImage(
                        imageAsset,
                        "TruckAccountDetails",
                        () => { },
                        `${field}_${Date.now()}`
                    );
                    if (uploadedUrl) {
                        (updatedData as any)[field] = uploadedUrl;
                    }
                } else if (uri) {
                    // This is an existing URL, keep it
                    (updatedData as any)[field] = uri;
                }
            }

            console.log('EditTruckAccountDetails - Final data to update:', updatedData);
            console.log('EditTruckAccountDetails - Account ID:', accountId);
            
            await updateDocument('truckPersonDetails', accountId as string, updatedData);
            ToastAndroid.show('Account details updated successfully', ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.error("Error updating account details:", error);
            alertBox("Error", "Failed to update account details. Please try again.", [], "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        Alert.alert(
            "Discard Changes",
            "Are you sure you want to discard all changes?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Discard", style: "destructive", onPress: () => router.back() }
            ]
        );
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>Loading account details...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!accountDetails) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>Account details not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    const renderDocumentField = (field: string, label: string, isImage: boolean = true) => {
        const uri = imageCache[field];
        return (
            <View style={styles.documentField}>
                <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
                <View style={styles.documentContainer}>
                    {uri ? (
                        <TouchableOpacity
                            onPress={() => isImage ? handleViewImage(field) : handleViewDocument(field)}
                            style={styles.documentPreview}
                        >
                            {isImage ? (
                                <Image source={{ uri }} style={styles.documentImage} />
                            ) : (
                                <View style={styles.pdfIcon}>
                                    <Ionicons name="document-text" size={wp(8)} color={accent} />
                                    <ThemedText type="subtitle" color={accent}>PDF Document</ThemedText>
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.noDocument}>
                            <Ionicons name="document-outline" size={wp(8)} color={icon} />
                            <ThemedText type="subtitle" color={icon}>No Document</ThemedText>
                        </View>
                    )}
                    <View style={styles.documentActions}>
                        <TouchableOpacity
                            onPress={() => isImage ? handleImagePress(field) : handleDocumentPress(field)}
                            style={styles.actionButton}
                        >
                            <Ionicons name="camera" size={wp(4)} color={accent} />
                            <ThemedText type="subtitle" color={accent}>Change</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <Heading
                page="Edit Verification Details"
                rightComponent={
                    <View style={{ flexDirection: 'row', marginRight: wp(2) }}>
                        <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                            <TouchableOpacity onPress={handleDiscardChanges}>
                                <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                    <Ionicons name='close-outline' color={icon} size={wp(4)} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />

            <ScrollView style={styles.container}>
                {/* Account Type */}
                <View style={[styles.card, { backgroundColor: background, borderColor: backgroundLight }]}>
                    <ThemedText style={styles.cardTitle}>Account Type</ThemedText>
                    <Divider />

                    <View style={styles.formSection}>
                        <ThemedText style={styles.label}>Account Type</ThemedText>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={[styles.placeholderStyle, { color: backgroundLight }]}
                            selectedTextStyle={[styles.selectedTextStyle, { color: textColor }]}
                            data={[
                                { value: 'owner', label: 'Truck Owner' },
                                { value: 'broker', label: 'Broker' }
                            ]}
                            maxHeight={hp(60)}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Account Type"
                            value={accType}
                            itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                            activeColor={backgroundLight}
                            containerStyle={styles.dropdownContainer}
                            onChange={item => setAccType(item.value as 'owner' | 'broker')}
                            renderLeftIcon={() => <></>}
                            renderRightIcon={() => <Entypo name="chevron-thin-down" size={wp(4)} color={icon} />}
                            renderItem={(item) => (
                                <View style={[styles.item, item.value === accType && {}]}>
                                    <ThemedText style={[
                                        { textAlign: 'left', flex: 1 },
                                        item.value === accType && { color: accent }
                                    ]}>
                                        {item.label}
                                    </ThemedText>
                                    {item.value === accType && (
                                        <Ionicons
                                            color={accent}
                                            name='checkmark-outline'
                                            size={wp(5)}
                                        />
                                    )}
                                </View>
                            )}
                        />

                        {accType === 'broker' && (
                            <>
                                <ThemedText style={styles.label}>Broker Type</ThemedText>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={[styles.placeholderStyle, { color: backgroundLight }]}
                                    selectedTextStyle={[styles.selectedTextStyle, { color: textColor }]}
                                    data={brokerTypes}
                                    maxHeight={hp(60)}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Broker Type"
                                    value={typeOfBroker}
                                    itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                                    activeColor={backgroundLight}
                                    containerStyle={styles.dropdownContainer}
                                    onChange={item => setTypeOfBroker(item.value)}
                                    renderLeftIcon={() => <></>}
                                    renderRightIcon={() => <Entypo name="chevron-thin-down" size={wp(4)} color={icon} />}
                                    renderItem={(item) => (
                                        <View style={[styles.item, item.value === typeOfBroker && {}]}>
                                            <ThemedText style={[
                                                { textAlign: 'left', flex: 1 },
                                                item.value === typeOfBroker && { color: accent }
                                            ]}>
                                                {item.label}
                                            </ThemedText>
                                            {item.value === typeOfBroker && (
                                                <Ionicons
                                                    color={accent}
                                                    name='checkmark-outline'
                                                    size={wp(5)}
                                                />
                                            )}
                                        </View>
                                    )}
                                />
                            </>
                        )}
                    </View>
                </View>

                {/* Personal Information */}
                <View style={[styles.card, { backgroundColor: background, borderColor: backgroundLight }]}>
                    <ThemedText style={styles.cardTitle}>
                        {accType === 'owner' ? 'Owner Information' : 'Broker Information'}
                    </ThemedText>
                    <Divider />

                    <View style={styles.formSection}>
                        <ThemedText style={styles.label}>
                            {accType === 'owner' ? 'Owner Name' : 'Broker Name'}
                        </ThemedText>
                        <Input
                            containerStyles={styles.input}
                            placeholder={`Enter ${accType === 'owner' ? 'Owner' : 'Broker'} Name`}
                            value={accType === 'owner' ? ownerName : brokerName}
                            onChangeText={accType === 'owner' ? setOwnerName : setBrokerName}
                        />

                        <ThemedText style={styles.label}>
                            {accType === 'owner' ? 'Owner Phone' : 'Broker Phone'}
                        </ThemedText>
                        <Input
                            containerStyles={styles.input}
                            placeholder={`Enter ${accType === 'owner' ? 'Owner' : 'Broker'} Phone`}
                            value={accType === 'owner' ? ownerPhoneNum : brokerPhoneNum}
                            onChangeText={accType === 'owner' ? setOwnerPhoneNum : setBrokerPhoneNum}
                            keyboardType="phone-pad"
                        />

                        <ThemedText style={styles.label}>
                            {accType === 'owner' ? 'Owner Email' : 'Broker Email'}
                        </ThemedText>
                        <Input
                            containerStyles={styles.input}
                            placeholder={`Enter ${accType === 'owner' ? 'Owner' : 'Broker'} Email`}
                            value={accType === 'owner' ? ownerEmail : brokerEmail}
                            onChangeText={accType === 'owner' ? setOwnerEmail : setBrokerEmail}
                            keyboardType="email-address"
                        />

                        <ThemedText style={styles.label}>Company Name</ThemedText>
                        <Input
                            containerStyles={styles.input}
                            placeholder="Enter Company Name"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>
                </View>

                {/* Documents Section */}
                <View style={[styles.card, { backgroundColor: background, borderColor: backgroundLight }]}>
                    <ThemedText style={styles.cardTitle}>Verification Documents</ThemedText>
                    <Divider />

                    <View style={styles.formSection}>
                        {accType === 'owner' ? (
                            <>
                                {renderDocumentField('ownershipProof', 'Ownership Proof', true)}
                                {renderDocumentField('directorOwnerId', 'Director/Owner ID', true)}
                                {renderDocumentField('ownerProofOfRes', 'Owner Proof of Residence', true)}
                            </>
                        ) : (
                            <>
                                {renderDocumentField('brockerId', 'Broker ID', true)}
                                {renderDocumentField('proofOfResidence', 'Proof of Residence', true)}
                                {renderDocumentField('companyRegCertificate', 'Company Registration Certificate', true)}
                                {renderDocumentField('companyLtterHead', 'Company Letterhead', true)}
                            </>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleDiscardChanges}
                        style={[styles.button, styles.discardButton, { borderColor: accent }]}
                        disabled={saving}
                    >
                        <ThemedText color={accent} type="subtitle">Discard</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSaveChanges}
                        style={[styles.button, styles.saveButton, { backgroundColor: accent }]}
                        disabled={saving}
                    >
                        <ThemedText color="#fff" type="subtitle">
                            {saving ? "Saving..." : "Save Changes"}
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

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
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: wp(4),
        paddingHorizontal: 16,
        paddingBottom: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 12,
        shadowColor: '#2f2f2f69',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        paddingTop: wp(2),
    },
    formSection: {
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    dropdown: {
        padding: wp(3),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    dropdownContainer: {
        borderRadius: wp(3),
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 9 },
        shadowOpacity: 0.50,
        shadowRadius: 12.35,
        elevation: 19,
        paddingVertical: wp(1)
    },
    item: {
        padding: 17,
        gap: wp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: wp(1)
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    documentField: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    documentPreview: {
        flex: 1,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentImage: {
        width: '100%',
        height: '100%',
    },
    pdfIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDocument: {
        flex: 1,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentActions: {
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
        padding: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    discardButton: {
        borderWidth: 1,
    },
    saveButton: {
        // backgroundColor set dynamically
    },
});

export default EditTruckAccountDetails;
