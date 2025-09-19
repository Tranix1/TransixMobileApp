import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, Pressable, ToastAndroid, Alert } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertComponent, { Alertbutton } from '@/components/AlertComponent';
import { BlurView } from 'expo-blur';
import { Truck, User } from '@/types/types';
import { deleteDocument, readById, updateDocument } from '@/db/operations';
import { TruckTrackerManager } from '@/components/TruckTrackerManager';
import { useAuth } from '@/context/AuthContext';
import Divider from '@/components/Divider';
import { formatNumber } from '@/services/services';
import { sendPushNotification } from '@/Utilities/pushNotification';
import ImageViewing from 'react-native-image-viewing';
import { AntDesign } from '@expo/vector-icons';

// Import refactored components
import { TruckDetailsHeader } from '@/components/TruckDetailsHeader';
import { TruckBasicInfo } from '@/components/TruckBasicInfo';
import { TruckImageGallery } from '@/components/TruckImageGallery';

// Import utilities
import { organizeImagesByCategory } from '@/Utilities/imageEditingUtils';

const TruckDetailsRefactored = () => {
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const background = useThemeColor("background");
    const backgroundLight = useThemeColor("backgroundLight");

    const { truckid, updateReuestDoc, dspDetails, truckBeingReuested, productName, origin, destination, model, rate, currency, expoPushToken } = useLocalSearchParams();

    const [truckData, setTruckData] = useState<Truck>({} as Truck);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [postOwner, setPostUser] = useState<User>();
    const [showAlert, setShowAlert] = useState<React.ReactElement | null>(null);

    // Image viewing state
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewerIndex, setViewerIndex] = useState(0);

    // Image editing state - simplified
    const [imageEditState] = useState({ isEditing: false, currentImageField: null, newImage: null, isUploading: false, uploadProgress: "" });

    // Request handling state
    const [reasonForDenial, setReasonForDenial] = useState("");
    const [truckDenialReason, setTruckDenialReason] = useState(false);

    const { user } = useAuth();
    const isOwner = user?.uid === truckData.userId;

    const getData = async () => {
        try {
            setRefreshing(true);
            if (!truckid) return;
            const truck = await readById('Trucks', truckid as string);
            if (truck) {
                setTruckData(truck as Truck);
                if (truckData) {
                    getOwnerData();
                }
            }
        } catch (error) {
            console.error('Error fetching truck data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const getOwnerData = async () => {
        if (truckData.userId) {
            const owner = await readById('personalData', truckData.userId);
            if (owner) {
                const user: User = {
                    ...owner,
                    uid: String(owner.id),
                    createdAt: (owner as any).createdAt ?? Date.now(),
                };
                setPostUser(user);
            }
        }
    };

    const toggleSaveProduct = async () => {
        try {
            const savedProducts = await AsyncStorage.getItem('savedProducts');
            const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];

            if (isSaved) {
                const updatedProducts = savedProductsArray.filter((item: Truck) => item.id !== truckData.id);
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(false);
            } else {
                const updatedProducts = [...savedProductsArray, truckData];
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const alertBox = (title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) => {
        setShowAlert(
            <AlertComponent
                visible
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onBackPress={() => setShowAlert(null)}
            />
        );
    };

    const handleImagePress = (field: string) => {
        const categories = organizeImagesByCategory(truckData);
        const allImages = [...categories.truck, ...categories.driver, ...categories.additional];
        const imageIndex = allImages.findIndex(img => img.field === field);
        if (imageIndex !== -1) {
            setCurrentIndex(imageIndex);
            setViewerIndex(imageIndex);
            setIsVisible(true);
        }
    };

    const handleEditPress = (field: string) => {
        // Navigate to edit page
        router.push({
            pathname: '/Logistics/Trucks/EditTruck',
            params: { truckId: truckData.id }
        });
    };

    const handleConfirmEdit = () => {
        // Not used in this simplified version
    };

    const handleCancelEdit = () => {
        // Not used in this simplified version
    };

    const handleImageIndexChange = (index: number) => {
        setViewerIndex(index);
    };

    const handleReadMore = (title: string, content: string) => {
        alertBox(title, content);
    };

    const acceptTruckRequest = async (decision: string) => {
        if (decision === "Approved") {
            await updateDocument("CargoBookings", `${updateReuestDoc}`, { ownerDecision: decision });
            await sendPushNotification(
                `${expoPushToken}`,
                `Truck Accepted`,
                `Truck "${truckData.truckName}" has been accepted for load "${productName}" ( ${origin} to ${destination}) rate ${currency} ${rate} ${model} . Tap to view details.`,
                { pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "Booked Loads" } },
            );
        } else if (decision === "Denied") {
            if (!reasonForDenial) {
                alert("Enter Reason For Denial");
                return;
            }
            await updateDocument("CargoBookings", `${updateReuestDoc}`, { ownerDecision: decision, denialReason: reasonForDenial });
            await sendPushNotification(
                `${expoPushToken}`,
                `Truck Denied`,
                `Truck "${truckData.truckName}" was Denied for load "${productName}" ( ${origin} to ${destination}) rate ${currency} ${rate} ${model} . Reason: Details not clear.`,
                { pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "Booked Loads" } },
            );
            setTruckDenialReason(false);
            setReasonForDenial("");
        }
        alert("Done Adding");
    };

    useEffect(() => {
        getData();
        const checkSavedProducts = async () => {
            try {
                const savedProducts = await AsyncStorage.getItem('savedProducts');
                const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];
                const isProductSaved = savedProductsArray.some((item: Truck) => item.id === truckData.id);
                setIsSaved(isProductSaved);
            } catch (error) {
                console.error('Error checking saved products:', error);
            }
        };
        checkSavedProducts();
    }, []);

    // Refresh data when screen comes into focus (e.g., returning from edit)
    useFocusEffect(
        React.useCallback(() => {
            getData();
        }, [truckid])
    );

    // Organize images by category
    const imageCategories = organizeImagesByCategory(truckData);
    const allImages = [...imageCategories.truck, ...imageCategories.driver, ...imageCategories.additional];
    const images = allImages.map(item => ({ uri: item.uri }));
    const labels = allImages.map(item => item.label);

    return (
        <ScreenWrapper>
            {/* Management Modal */}
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
                                >
                                    <ThemedText color="#fff" type="subtitle">Truck Available</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        router.push('/Logistics/Trucks/AddTrucks');
                                    }}
                                    style={{ backgroundColor: accent, alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Edit Truck</ThemedText>
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
                                                            await deleteDocument('Trucks', truckData.id);
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

            {/* Denial Reason Modal */}
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
                                {/* Add Input component here for reason input */}
                                <TouchableOpacity
                                    style={{
                                        borderWidth: 1,
                                        borderColor: icon,
                                        borderRadius: 8,
                                        backgroundColor: background,
                                        height: hp(5),
                                        width: wp(56),
                                        justifyContent: "center",
                                        alignItems: "center",
                                        alignSelf: "center",
                                        marginTop: wp(-3),
                                        flexDirection: "row",
                                        gap: wp(2)
                                    }}
                                    onPress={() => acceptTruckRequest("Denied")}
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

            <Heading
                page={truckData.truckName || "Truck Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && isOwner && (
                            <View style={{ overflow: 'hidden', borderRadius: wp(2.4) }}>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2), padding: wp(1.5) }}>
                                        <Ionicons name='reorder-three-outline' size={wp(6)} color={icon} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                }
            />

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={getData}
                        colors={[accent]}
                        tintColor={accent}
                    />
                }
                contentContainerStyle={{ paddingBottom: hp(6), marginHorizontal: wp(2) }}
            >
                {/* Header with main image and action buttons */}
                <TruckDetailsHeader
                    truckData={truckData}
                    postOwner={postOwner}
                    isSaved={isSaved}
                    onToggleSave={toggleSaveProduct}
                    onManagePress={() => setModalVisible(true)}
                    isOwner={isOwner}
                    refreshing={refreshing}
                />

                {/* Basic truck information */}
                <TruckBasicInfo
                    truckData={truckData}
                    onReadMore={handleReadMore}
                />

                {/* Request handling buttons */}
                {truckBeingReuested === "true" && (
                    <View style={{ flexDirection: "row", justifyContent: "center", gap: wp(3), marginVertical: wp(2) }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#22c55e",
                                width: 110,
                                height: 44,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 24,
                                shadowColor: "#22c55e",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                            activeOpacity={0.85}
                            onPress={() => acceptTruckRequest("Approved")}
                        >
                            <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 16, letterSpacing: 0.5 }}>
                                Accept
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#ef4444",
                                width: 110,
                                height: 44,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 24,
                                shadowColor: "#ef4444",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                            activeOpacity={0.85}
                            onPress={() => setTruckDenialReason(true)}
                        >
                            <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 16, letterSpacing: 0.5 }}>
                                Deny
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tracker Status Section */}
                <View style={{
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
                                backgroundColor: (truckData as any).hasTracker ? '#51cf66' : '#ff6b6b',
                                marginRight: wp(1)
                            }} />
                            <ThemedText style={{
                                fontSize: 14,
                                color: (truckData as any).hasTracker ? '#51cf66' : '#ff6b6b',
                                fontWeight: '500'
                            }}>
                                {(truckData as any).hasTracker ? 'Truck has tracker' : 'Truck doesn\'t have a tracker'}
                            </ThemedText>
                        </View>
                    </View>

                    {(truckData as any).hasTracker && (
                        <View style={{ marginTop: wp(2) }}>
                            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                Tracker Name: {(truckData as any).trackerName || 'Not specified'}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                Status: {(truckData as any).trackerStatus === 'active' ? 'Active' : 'Available'}
                            </ThemedText>
                        </View>
                    )}

                    {isOwner && (
                        <TruckTrackerManager
                            truck={truckData}
                            isOwner={true}
                            onTrackerUpdate={() => {
                                getData();
                            }}
                        />
                    )}

                    {!isOwner && !(truckData as any).hasTracker && (
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
                </View>

                {/* Image galleries - only show if owner or details requested */}
                {(dspDetails === "true" || isOwner) && (
                    <View>
                        {/* Truck Details Images */}
                        <TruckImageGallery
                            images={imageCategories.truck}
                            category="Truck"
                            isOwner={isOwner}
                            imageEditState={imageEditState}
                            onImagePress={handleImagePress}
                            onEditPress={handleEditPress}
                            onConfirmEdit={handleConfirmEdit}
                            onCancelEdit={handleCancelEdit}
                            onImageIndexChange={handleImageIndexChange}
                        />

                        {/* Driver Details */}
                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4), color: "#1E90FF" }}>
                            Driver Details
                        </ThemedText>
                        <Divider />
                        <ThemedText type="tiny" style={{ marginTop: hp(1) }}>Driver Phone</ThemedText>
                        <ThemedText type="subtitle">{formatNumber(parseFloat(truckData.driverPhone))}</ThemedText>
                        <Divider />

                        <TruckImageGallery
                            images={imageCategories.driver}
                            category="Driver"
                            isOwner={isOwner}
                            imageEditState={imageEditState}
                            onImagePress={handleImagePress}
                            onEditPress={handleEditPress}
                            onConfirmEdit={handleConfirmEdit}
                            onCancelEdit={handleCancelEdit}
                            onImageIndexChange={handleImageIndexChange}
                        />

                        {/* Additional Details */}
                        <TruckImageGallery
                            images={imageCategories.additional}
                            category="Additional"
                            isOwner={isOwner}
                            imageEditState={imageEditState}
                            onImagePress={handleImagePress}
                            onEditPress={handleEditPress}
                            onConfirmEdit={handleConfirmEdit}
                            onCancelEdit={handleCancelEdit}
                            onImageIndexChange={handleImageIndexChange}
                        />

                        <Divider />
                    </View>
                )}

                {/* View more trucks button */}
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
                            pathname: "/Logistics/Trucks/Index",
                            params: { userId: truckData.userId, organisationName: truckData.CompanyName },
                        })
                    }
                >
                    <ThemedText style={{ color: "white" }}>
                        View Trucks from{'  '}
                        <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                            {truckData.CompanyName}
                        </ThemedText>
                    </ThemedText>
                </TouchableOpacity>
            </ScrollView>

            {/* Image Viewer */}
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
        </ScreenWrapper>
    );
};

export default TruckDetailsRefactored;
