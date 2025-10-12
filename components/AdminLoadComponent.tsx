import { StyleSheet, TouchableOpacity, View, TouchableHighlight, Linking, Modal, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Load } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { EvilIcons, FontAwesome, Ionicons, Octicons } from '@expo/vector-icons'
import { formatCurrency } from '@/services/services'
import Divider from './Divider'
import FormatedText from './FormatedText'
import ImageViewing from 'react-native-image-viewing';
import { AntDesign } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { parseCoordinateString, isValidCoordinate, DEFAULT_COORDINATES } from '@/Utilities/coordinateUtils';
import DocumentSelectionModal from './DocumentSelectionModal';
import { approveLoad, rejectLoad } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';

interface AdminLoadComponentProps {
    item: Load;
    expandID: string;
    expandId: (id: string) => void;
    onLoadUpdated?: () => void; // Callback when load is approved/rejected
}

const AdminLoadComponent = ({ item, expandID = '', expandId = (id: string) => { }, onLoadUpdated = () => { } }: AdminLoadComponentProps) => {
    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const textColor = useThemeColor('text')
    const accent = useThemeColor('accent')
    const { user } = useAuth()

    const [expand, setExpand] = useState(false)
    const [processing, setProcessing] = useState(false)

    const [dspProofImage, setDspProofImage] = useState(false);
    const [showProofSelectionModal, setShowProofSelectionModal] = useState(false);
    const [selectedProofType, setSelectedProofType] = useState<'images' | 'documents' | null>(null);
    const [showDocumentSelectionModal, setShowDocumentSelectionModal] = useState(false);
    const [availableDocuments, setAvailableDocuments] = useState<Array<{ url: string, type: string }>>([]);

    // Check what proof types are available
    const hasProofImages = item.proofOfOrder && Array.isArray(item.proofOfOrder) && item.proofOfOrderType && Array.isArray(item.proofOfOrderType) &&
        item.proofOfOrder.some((_, index) => item.proofOfOrderType[index] === 'image');
    const hasProofDocuments = item.proofOfOrder && Array.isArray(item.proofOfOrder) && item.proofOfOrderType && Array.isArray(item.proofOfOrderType) &&
        item.proofOfOrder.some((_, index) => ['pdf', 'doc', 'docx'].includes(item.proofOfOrderType[index] as any));

    function handleProofPress() {
        if (hasProofImages && hasProofDocuments) {
            // Both available - show selection modal
            setShowProofSelectionModal(true);
        } else if (hasProofImages) {
            // Only images available
            setSelectedProofType('images');
            setDspProofImage(true);
        } else if (hasProofDocuments) {
            // Only documents available
            setSelectedProofType('documents');
            showDocumentList();
        }
    }

    function showDocumentList() {
        if (item.proofOfOrder && Array.isArray(item.proofOfOrder) && item.proofOfOrderType && Array.isArray(item.proofOfOrderType)) {
            const documents = item.proofOfOrder
                .map((url, index) => ({ url, type: item.proofOfOrderType[index] as any }))
                .filter(doc => ['pdf', 'doc', 'docx'].includes(doc.type));

            if (documents.length === 1) {
                // Only one document, open it directly
                Linking.openURL(documents[0].url);
            } else if (documents.length > 1) {
                // Multiple documents, show custom modal
                setAvailableDocuments(documents);
                setShowDocumentSelectionModal(true);
            } else {
                // No documents found, still show modal with empty state
                setAvailableDocuments([]);
                setShowDocumentSelectionModal(true);
            }
        } else {
            // No proof data available, show modal with empty state
            setAvailableDocuments([]);
            setShowDocumentSelectionModal(true);
        }
    }

    function handleProofTypeSelection(type: 'images' | 'documents') {
        setSelectedProofType(type);
        setShowProofSelectionModal(false);

        if (type === 'images') {
            setDspProofImage(true);
        } else {
            showDocumentList();
        }
    }

    function handleDocumentSelect(document: { url: string, type: string }) {
        Linking.openURL(document.url);
    }

    function replaceSpacesWithPercent(url: string): string {
        return url.replace(/ /g, '%20');
    }

    const toggleItemById = useCallback((
        id: string,
    ): void => {
        setExpand(!expand)
        if (!expand)
            expandId(id)
        else
            expandId('')
    }, [expand, expandId])

    const url = useMemo(() =>
        `https://transix.net/selectedUserLoads/${item.userId}/${item.companyName}/${item.deletionTime}`,
        [item.userId, item.companyName, item.deletionTime]
    );

    const updatedUrl = useMemo(() => replaceSpacesWithPercent(url), [url]);

    const message = useMemo(() =>
        `${item.companyName}
        Is this Load still available
        ${item.typeofLoad} from ${item.origin} to ${item.destination}
        ${item.rate}

        From: ${updatedUrl}`,
        [item.companyName, item.typeofLoad, item.origin, item.destination, item.rate, updatedUrl]
    );

    useEffect(() => {
        if (expandID === item.id) {
            setExpand(true)
        } else {
            setExpand(false)
        }
    }, [expandID])

    const handleApprove = async () => {
        if (!user) return;

        Alert.alert(
            'Approve Load',
            'Are you sure you want to approve this load?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await approveLoad(item.id, user.uid);
                            Alert.alert('Success', 'Load approved successfully');
                            onLoadUpdated(); // Refresh the list
                        } catch (error) {
                            console.error('Error approving load:', error);
                            Alert.alert('Error', 'Failed to approve load');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async () => {
        if (!user) return;

        Alert.prompt(
            'Reject Load',
            'Please provide a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async (rejectionReason) => {
                        if (!rejectionReason || rejectionReason.trim() === '') {
                            Alert.alert('Error', 'Please provide a rejection reason');
                            return;
                        }

                        setProcessing(true);
                        try {
                            await rejectLoad(item.id, user.uid, rejectionReason.trim());
                            Alert.alert('Success', 'Load rejected successfully');
                            onLoadUpdated(); // Refresh the list
                        } catch (error) {
                            console.error('Error rejecting load:', error);
                            Alert.alert('Error', 'Failed to reject load');
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

    return (
        <View>
            <View
                style={[styles.container, { backgroundColor: background, borderColor: accent }]}
            >
                {/* Header with company info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1), marginBottom: wp(1) }}>
                    {!item?.logo && <FontAwesome name='user-circle' color={coolGray} size={wp(8)} />}
                    {item?.logo && <Image
                        style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd' }}
                        source={{ uri: item?.logo || 'https://via.placeholder.com/100' }}
                    />}
                    {item && (
                        <ThemedText
                            type="subtitle"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                                flex: 1,
                                marginLeft: wp(2),
                                maxWidth: wp(60) // Limit width to prevent overlap
                            }}
                        >
                            {item.companyName}
                        </ThemedText>
                    )}
                </View>

                {/* Distance and Time horizontal row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(1) }}>
                    <View style={{ flexDirection: 'row', flex: 1, gap: wp(4) }}>
                        {item.distance ? (
                            <ThemedText type="tiny" style={styles.distanceInfo}>
                                Distance: {item.distance}
                            </ThemedText>
                        ) : null}
                        {item.duration ? (
                            <ThemedText type="tiny" style={styles.distanceInfo}>
                                Time: {item.duration}
                            </ThemedText>
                        ) : null}
                    </View>

                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: item.approvalStatus === 'pending' ? '#F4802424' :
                                item.approvalStatus === 'edited' ? '#2196F324' :
                                    item.approvalStatus === 'approved' ? '#4CAF5024' : '#F4433624'
                        }
                    ]}>
                        <ThemedText type="tiny" style={[
                            styles.statusText,
                            {
                                color: item.approvalStatus === 'pending' ? '#F48024' :
                                    item.approvalStatus === 'edited' ? '#2196F3' :
                                        item.approvalStatus === 'approved' ? '#4CAF50' : '#F44336'
                            }
                        ]}>
                            {item.approvalStatus === 'pending' ? 'Pending' :
                                item.approvalStatus === 'edited' ? 'Edited' :
                                    item.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                        </ThemedText>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{ marginBottom: wp(1) }}>
                            <ThemedText type='tiny' style={{ fontSize: 13, fontStyle: 'italic' }}>
                                Load
                            </ThemedText>
                            <ThemedText type='subtitle'>
                                {item.typeofLoad}
                            </ThemedText>
                        </View>
                    </View>
                    <View style={styles.tagsContainer}>
                        {item.returnLoad && item.returnLoad !== 'No return load' && (
                            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                                <ThemedText type='tiny' style={{}}>Return Load</ThemedText>
                            </View>
                        )}

                        {(hasProofImages || hasProofDocuments) && (
                            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                                <ThemedText type='tiny' style={{}}>Proof Attached</ThemedText>
                            </View>
                        )}

                        {item.roundTrip && (
                            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                                <ThemedText type='tiny' style={{}}>Round Trip</ThemedText>
                            </View>
                        )}

                        {item.isVerified && (
                            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }]}>
                                <Octicons name='verified' size={wp(4)} color={'#4eb3de'} />
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.detailRow, { backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                        <View style={{ gap: wp(1), flex: 2, }}>
                            <ThemedText type='default' style={{ fontSize: 13, fontStyle: 'italic' }}>
                                From
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
                                {item.origin}
                            </ThemedText>
                        </View>
                        <View style={{ gap: wp(1), flex: 2, }}>
                            <ThemedText type='default' style={{ fontSize: 13, fontStyle: 'italic' }}>
                                To
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
                                {item.destination}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={{ backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }}>
                    <View style={styles.detailRow}>
                        <ThemedText type='default' style={{ flex: 2 }}>
                            Rate {item.model}
                        </ThemedText>
                        <ThemedText type='subtitle' style={[{ color: textColor, fontSize: wp(4.5), lineHeight: wp(5), flex: 2 }]}>
                            {item.currency} {item.rate}
                        </ThemedText>
                    </View>
                    {item.rateexplantion && <View style={styles.detailRow}>
                        <ThemedText type='default' style={{ flex: 2 }}>
                            Rate Explanation
                        </ThemedText>
                        <ThemedText type='subtitle' style={[{ color: textColor, fontSize: wp(4.5), lineHeight: wp(5), flex: 2 }]}>
                            {item.rateexplantion}
                        </ThemedText>
                    </View>}
                </View>

                <View style={[{ marginTop: wp(1), backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2), flex: 1, gap: wp(2) }]}>
                    {item.paymentTerms &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                            <ThemedText type='default' style={{ flex: 2 }}>
                                Payment Terms
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                {item.paymentTerms}
                            </ThemedText>
                        </View>
                    }
                    {item.loadingDate &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                            <ThemedText type='default' style={{ flex: 2 }}>
                                Loading
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                {item.loadingDate}
                            </ThemedText>
                        </View>
                    }

                    {item.alertMsg && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                            <ThemedText type='default' style={{ flex: 2 }}>
                                Alert
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                {item.alertMsg}
                            </ThemedText>
                        </View>
                    )}

                    {item.fuelAvai && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                            <ThemedText type='default' style={{ flex: 2 }}>
                                Fuel & Tolls
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                {item.fuelAvai}
                            </ThemedText>
                        </View>
                    )}
                    {item.requirements &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                            <ThemedText type='default' style={{ flex: 2 }}>
                                Requirements
                            </ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                {item.requirements}
                            </ThemedText>
                        </View>
                    }

                    {expand && (
                        <View>
                            {item.additionalInfo && (
                                <>
                                    <Divider />
                                    <View style={{ flex: 1, gap: wp(2), marginTop: wp(2) }}>
                                        <ThemedText type='tiny' style={{ flex: 2 }}>
                                            Additional Info
                                        </ThemedText>
                                        <FormatedText numberOfLines={8} style={{ flex: 1 }}>
                                            {item.additionalInfo}
                                        </FormatedText>
                                    </View>
                                </>
                            )}

                            <Divider style={{ marginTop: wp(2) }} />
                            {item.returnLoad && item.returnLoad !== 'No return load' && (
                                <View style={{ marginTop: wp(2), gap: wp(2) }}>
                                    <ThemedText type='tiny' style={{ marginBottom: wp(1) }}>
                                        Return Load
                                    </ThemedText>

                                    {item.returnLoad && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                                            <ThemedText type='default' style={{ flex: 2 }}>
                                                Load Details
                                            </ThemedText>
                                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                                {item.returnLoad}
                                            </ThemedText>
                                        </View>
                                    )}
                                    {item.returnRate && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                                            <ThemedText type='default' style={{ flex: 2 }}>
                                                Return Rate
                                            </ThemedText>
                                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                                {item.returnRate}
                                            </ThemedText>
                                        </View>
                                    )}
                                    {item.returnTerms && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                                            <ThemedText type='default' style={{ flex: 2 }}>
                                                Return Terms
                                            </ThemedText>
                                            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                                {item.returnTerms}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={{ marginTop: wp(2), gap: wp(2) }}>
                                <ThemedText type='tiny' style={{ marginBottom: wp(1) }}>Trucks Required</ThemedText>

                                {item.trucksRequired && item.trucksRequired.length > 0 ? (
                                    item.trucksRequired.map((neededTruck: any, index: number) => (
                                        <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }} key={index}>
                                            <ThemedText>
                                                {typeof neededTruck.truckType === 'string'
                                                    ? neededTruck.truckType
                                                    : neededTruck.truckType?.name || 'N/A'
                                                }
                                            </ThemedText>
                                            <ThemedText>
                                                {typeof neededTruck.capacity === 'string'
                                                    ? neededTruck.capacity
                                                    : neededTruck.capacity?.name || 'N/A'
                                                }
                                            </ThemedText>
                                            <ThemedText>
                                                {typeof neededTruck.cargoArea === 'string'
                                                    ? neededTruck.cargoArea
                                                    : neededTruck.cargoArea?.name || 'N/A'
                                                }
                                            </ThemedText>
                                        </View>
                                    ))
                                ) : (
                                    <ThemedText type='tiny' style={{ color: coolGray, textAlign: 'center' }}>
                                        No truck requirements specified
                                    </ThemedText>
                                )}
                            </View>

                            <Divider style={{ marginTop: wp(2) }} />

                            {/* Action Buttons */}
                            <View style={styles.actionButtonsContainer}>
                                {(hasProofImages || hasProofDocuments || (item.loadImages && item.loadImages.length > 0)) && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: '#4eb37a' }]}
                                        onPress={() => {
                                            if (hasProofImages || hasProofDocuments) {
                                                handleProofPress();
                                            } else if (item.loadImages && item.loadImages.length > 0) {
                                                setDspProofImage(true);
                                            }
                                        }}
                                    >
                                        <Ionicons name="document-text" size={wp(4)} color="white" />
                                        <ThemedText style={{ color: 'white', fontWeight: 'bold', marginLeft: wp(1) }}>
                                            {(hasProofImages || hasProofDocuments) ? 'Proof' : 'Images'}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#2563eb' }]}
                                    onPress={() => {
                                        // Use stored coordinates if available, otherwise try to parse from strings
                                        const originCoords = item.originCoordinates || parseCoordinateString(item.origin || '');
                                        const destinationCoords = item.destinationCoordinates || parseCoordinateString(item.destination || '');

                                        if (isValidCoordinate(originCoords) && isValidCoordinate(destinationCoords)) {
                                            router.push({
                                                pathname: "/Map/ViewLoadRoutes",
                                                params: {
                                                    loadData: JSON.stringify(item),
                                                    originCoords: JSON.stringify(originCoords),
                                                    destinationCoords: JSON.stringify(destinationCoords),
                                                    destinationType: "Load Destination",
                                                    destinationName: item.destination || "Load Destination",
                                                    ...(item.routePolyline && { routePolyline: item.routePolyline }),
                                                    ...(item.bounds && { bounds: JSON.stringify(item.bounds) }),
                                                    ...(item.distance && { distance: item.distance }),
                                                    ...(item.duration && { duration: item.duration }),
                                                    ...(item.durationInTraffic && { durationInTraffic: item.durationInTraffic }),
                                                }
                                            });
                                        } else {
                                            router.push({
                                                pathname: "/Map/ViewLoadRoutes",
                                                params: {
                                                    loadData: JSON.stringify(item),
                                                    destinationCoords: JSON.stringify(DEFAULT_COORDINATES),
                                                    destinationType: "Load Destination",
                                                    destinationName: item.destination || "Load Destination",
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <Ionicons name="map" size={wp(4)} color="white" />
                                    <ThemedText style={{ color: 'white', fontWeight: 'bold', marginLeft: wp(1) }}>
                                        Map
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            {/* Admin Approval Buttons */}
                            {item.approvalStatus === 'pending' && (
                                <View style={styles.adminActionButtonsContainer}>
                                    <View style={styles.adminActionButtons}>
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
                                            <Ionicons name="close-circle" size={wp(4)} color="#FFFFFF" style={{ marginRight: wp(2) }} />
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
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                    <ThemedText style={[styles.buttonText, { color: '#FFFFFF', marginLeft: wp(2) }]}>
                                                        Approving...
                                                    </ThemedText>
                                                </View>
                                            ) : (
                                                <>
                                                    <Ionicons name="checkmark-circle" size={wp(4)} color="#FFFFFF" style={{ marginRight: wp(2) }} />
                                                    <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                                        Approve
                                                    </ThemedText>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <ImageViewing
                                images={selectedProofType === 'images' && item.proofOfOrder && Array.isArray(item.proofOfOrder) && item.proofOfOrderType && Array.isArray(item.proofOfOrderType)
                                    ? item.proofOfOrder
                                        .map((url, index) => ({ uri: url }))
                                        .filter((_, index) => item.proofOfOrderType[index] as any === 'image')
                                    : (item.loadImages || []).map((img: any) => ({ uri: typeof img === 'string' ? img : img.uri || '' }))
                                }
                                imageIndex={0}
                                visible={dspProofImage}
                                onRequestClose={() => setDspProofImage(false)}
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
                                        <TouchableOpacity onPress={() => setDspProofImage(false)} style={{ marginRight: 8, marginLeft: 4 }}>
                                            <AntDesign name="close" size={15} color="#fff" />
                                        </TouchableOpacity>
                                        <ThemedText style={{ fontWeight: 'bold', fontSize: 14 }}>
                                            {selectedProofType === 'images' ? 'Proof Images' : 'Load Images'}
                                        </ThemedText>
                                    </View>
                                )}
                            />

                            {/* Proof Selection Modal */}
                            <Modal
                                visible={showProofSelectionModal}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={() => setShowProofSelectionModal(false)}
                            >
                                <View style={styles.modalOverlay}>
                                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                                        <ThemedText type="subtitle" style={{ marginBottom: wp(4), textAlign: 'center' }}>
                                            Choose Proof Type
                                        </ThemedText>

                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: '#4eb37a' }]}
                                            onPress={() => handleProofTypeSelection('images')}
                                        >
                                            <Ionicons name="images" size={wp(5)} color="white" />
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold', marginLeft: wp(2) }}>
                                                View Images ({item.proofOfOrder && Array.isArray(item.proofOfOrder) && item.proofOfOrderType && Array.isArray(item.proofOfOrderType) ?
                                                    item.proofOfOrder.filter((_, index) => item.proofOfOrderType[index] as any === 'image').length : 0})
                                            </ThemedText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: '#2563eb' }]}
                                            onPress={() => handleProofTypeSelection('documents')}
                                        >
                                            <Ionicons name="document-text" size={wp(5)} color="white" />
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold', marginLeft: wp(2) }}>
                                                View Documents ({item.proofOfOrder && Array.isArray(item.proofOfOrder) && item.proofOfOrderType && Array.isArray(item.proofOfOrderType) ?
                                                    item.proofOfOrder.filter((_, index) => ['pdf', 'doc', 'docx'].includes(item.proofOfOrderType[index] as any)).length : 0})
                                            </ThemedText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: coolGray, marginTop: wp(2) }]}
                                            onPress={() => setShowProofSelectionModal(false)}
                                        >
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                                Cancel
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            {/* Document Selection Modal */}
                            <DocumentSelectionModal
                                visible={showDocumentSelectionModal}
                                onClose={() => setShowDocumentSelectionModal(false)}
                                documents={availableDocuments}
                                onDocumentSelect={handleDocumentSelect}
                                title="Select Document"
                                subtitle="Choose a document to view:"
                            />
                        </View>
                    )}

                    {/* Expand/Collapse Button - Inside main container */}
                    <TouchableOpacity
                        style={[styles.expandButton, { backgroundColor: backgroundLight, marginTop: wp(2) }]}
                        onPress={() => toggleItemById(item.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={expand ? 'chevron-up' : 'chevron-down'}
                            size={wp(4)}
                            color={accent}
                        />
                        <ThemedText type="tiny" style={{ marginLeft: wp(1.5), color: accent, fontWeight: '500' }}>
                            {expand ? 'Show Less' : 'View Details'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default AdminLoadComponent;

const styles = StyleSheet.create({
    container: {
        margin: wp(2),
        borderWidth: 0.5,
        borderRadius: wp(6),
        paddingHorizontal: wp(4),
        paddingBottom: wp(4),
        paddingVertical: wp(2),
        shadowColor: '#3535353b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 13
    },
    statusBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1),
        borderRadius: wp(2),
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: wp(3),
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: wp(2),
        marginBottom: wp(2)
    },
    tag: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(4),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(1),
    },
    distanceInfo: {
        fontSize: wp(2.7),
        color: '#9ca3af',
        textAlign: 'left',
        flexShrink: 1,
        minWidth: 0,
        fontWeight: 'bold',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: wp(2),
        gap: wp(2),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2.5),
        paddingHorizontal: wp(3),
        borderRadius: wp(2),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    adminActionButtonsContainer: {
        marginTop: wp(4),
        marginBottom: wp(2),
        paddingHorizontal: wp(2),
    },
    adminActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    adminButton: {
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
        backgroundColor: '#F44336',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButtonText: {
        color: '#FFFFFF',
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
    expandButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: wp(2),
        paddingHorizontal: wp(3),
        marginHorizontal: wp(1),
        marginBottom: wp(1),
        borderRadius: wp(2),
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    },
    modalContent: {
        borderRadius: wp(4),
        padding: wp(5),
        width: '100%',
        maxWidth: wp(80),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(2),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});
