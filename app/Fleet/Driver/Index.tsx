import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, RefreshControl, Modal, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import AccentRingLoader from '@/components/AccentRingLoader';
import { deleteDocument } from '@/db/operations';
import ImageViewing from 'react-native-image-viewing';

interface Driver {
    id: string;
    fullName: string;
    phoneNumber: string;
    driverLicenseUrl: string;
    passportUrl: string;
    internationalPermitUrl: string;
    fleetId: string;
    createdAt: string;
    status: string;
    truckId?: string;
    truckName?: string;
    docId?: string;
    driverRole?: 'main' | 'second_main' | 'backup';
    mainTruck?: {
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    };
    secondMainTruck?: {
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    };
    backupTrucks?: Array<{
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    }>;
}

export default function DriverIndex() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');

    const { driverId } = useLocalSearchParams();

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentFleet, setCurrentFleet] = useState<any>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [driverImages, setDriverImages] = useState<any[]>([]);
    const [imageLabels, setImageLabels] = useState<string[]>([]);

    useEffect(() => {
        const getCurrentFleetAndDrivers = async () => {
            try {
                const fleetData = await AsyncStorage.getItem('currentRole');
                if (fleetData) {
                    const parsedFleet = JSON.parse(fleetData);
                    setCurrentFleet(parsedFleet);
                    await fetchDrivers(parsedFleet.fleetId);

                    // If driverId is provided, find and set the selected driver
                    if (driverId) {
                        // We'll set the selected driver after fetching
                        setTimeout(() => {
                            const driver = drivers.find(d => d.id === driverId);
                            if (driver) {
                                setSelectedDriver(driver);
                                setModalVisible(true);
                            }
                        }, 1000); // Small delay to ensure drivers are loaded
                    }
                }
            } catch (error) {
                console.error('Error getting current fleet:', error);
            } finally {
                setLoading(false);
                setHasLoaded(true);
            }
        };

        getCurrentFleetAndDrivers();
    }, [driverId, drivers]);

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            if (currentFleet?.fleetId) {
                await fetchDrivers(currentFleet.fleetId);
            }
        } catch (error) {
            console.error('Error refreshing drivers:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchDrivers = async (fleetId: string) => {
        try {
            const driversRef = collection(db, 'fleets', fleetId, 'Drivers');
            const q = query(driversRef);
            const querySnapshot = await getDocs(q);

            const driversData: Driver[] = [];
            querySnapshot.forEach((doc) => {
                driversData.push({
                    id: doc.id,
                    ...doc.data()
                } as Driver);
            });

            setDrivers(driversData);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const renderDriverItem = ({ item }: { item: Driver }) => (
        <TouchableOpacity onPress={() => {
            router.push({
                pathname: "/Fleet/Driver/DriverDetails",
                params: { driverId: item.id, fleetId: currentFleet?.fleetId }
            });
        }} style={[styles.driverCard, { backgroundColor: backgroundLight }]}>
            <View style={styles.driverInfo}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                    {item.driverLicenseUrl && (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: item.driverLicenseUrl }}
                                style={styles.smallImage}
                                resizeMode="cover"
                            />
                            <ThemedText style={styles.imageLabel}>License</ThemedText>
                        </View>
                    )}
                    {item.passportUrl && (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: item.passportUrl }}
                                style={styles.smallImage}
                                resizeMode="cover"
                            />
                            <ThemedText style={styles.imageLabel}>Passport</ThemedText>
                        </View>
                    )}
                    {item.internationalPermitUrl && (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: item.internationalPermitUrl }}
                                style={styles.smallImage}
                                resizeMode="cover"
                            />
                            <ThemedText style={styles.imageLabel}>Permit</ThemedText>
                        </View>
                    )}
                </ScrollView>
                <View style={styles.driverDetails}>
                    <ThemedText style={styles.driverName}>{item.fullName}</ThemedText>
                    <ThemedText style={[styles.driverPhone, { color: icon }]}>{item.phoneNumber}</ThemedText>

                    {/* Display all assigned trucks */}
                    <View style={styles.trucksContainer}>
                        {item.mainTruck && (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: "/Logistics/Trucks/TruckDetails",
                                    params: { truckid: item.mainTruck!.truckId, fleetId: currentFleet?.fleetId }
                                })}
                                style={styles.truckInfo}
                            >
                                <Ionicons name="car-outline" size={wp(3.5)} color={accent} />
                                <ThemedText style={[styles.truckText, { color: accent }]}>
                                    {item.mainTruck.truckName} (Main)
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/Logistics/Trucks/EditTruck",
                                        params: { truckId: item.mainTruck!.truckId, fleetId: currentFleet?.fleetId }
                                    })}
                                    style={styles.editTruckButton}
                                >
                                    <Ionicons name="pencil" size={wp(3.5)} color={accent} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}

                        {item.secondMainTruck && (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: "/Logistics/Trucks/TruckDetails",
                                    params: { truckid: item.secondMainTruck!.truckId, fleetId: currentFleet?.fleetId }
                                })}
                                style={styles.truckInfo}
                            >
                                <Ionicons name="car-outline" size={wp(3.5)} color={accent} />
                                <ThemedText style={[styles.truckText, { color: accent }]}>
                                    {item.secondMainTruck.truckName} (2nd Main)
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/Logistics/Trucks/EditTruck",
                                        params: { truckId: item.secondMainTruck!.truckId, fleetId: currentFleet?.fleetId }
                                    })}
                                    style={styles.editTruckButton}
                                >
                                    <Ionicons name="pencil" size={wp(3.5)} color={accent} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}

                        {item.backupTrucks && item.backupTrucks.map((backupTruck, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => router.push({
                                    pathname: "/Logistics/Trucks/TruckDetails",
                                    params: { truckid: backupTruck.truckId, fleetId: currentFleet?.fleetId }
                                })}
                                style={styles.truckInfo}
                            >
                                <Ionicons name="car-outline" size={wp(3.5)} color={accent} />
                                <ThemedText style={[styles.truckText, { color: accent }]}>
                                    {backupTruck.truckName} (Backup)
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/Logistics/Trucks/EditTruck",
                                        params: { truckId: backupTruck.truckId, fleetId: currentFleet?.fleetId }
                                    })}
                                    style={styles.editTruckButton}
                                >
                                    <Ionicons name="pencil" size={wp(3.5)} color={accent} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <ThemedText style={[styles.driverStatus, {
                        color: item.status === 'active' ? '#0f9d58' : '#ff6b35'
                    }]}>
                        {item.status.toUpperCase()}
                    </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page="Drivers" />
                <View style={[styles.container, { backgroundColor: background }]}>
                    <AccentRingLoader color={accent} size={32} dotSize={6} />
                    <ThemedText type='defaultSemiBold' style={styles.loadingText}>
                        Loading Drivers…
                    </ThemedText>
                    <ThemedText type='tiny' style={styles.loadingSubtext}>
                        Please Wait
                    </ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    const handleEditDriver = () => {
        if (selectedDriver) {
            setModalVisible(false);
            router.push({ pathname: "/Fleet/Driver/Add", params: { driverId: selectedDriver.id, editMode: "true" } });
        }
    };

    const handleDeleteDriver = () => {
        Alert.alert(
            "Delete Driver",
            `Are you sure you want to delete ${selectedDriver?.fullName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (selectedDriver && currentFleet) {
                            try {
                                await deleteDocument(`fleets/${currentFleet.fleetId}/Drivers`, selectedDriver.id);
                                setModalVisible(false);
                                setSelectedDriver(null);
                                // Refresh the list
                                await fetchDrivers(currentFleet.fleetId);
                            } catch (error) {
                                console.error('Error deleting driver:', error);
                                Alert.alert('Error', 'Failed to delete driver');
                            }
                        }
                    }
                }
            ]
        );
    };

    const openImageViewer = (images: any[], labels: string[], startIndex: number = 0) => {
        setDriverImages(images);
        setImageLabels(labels);
        setCurrentImageIndex(startIndex);
        setImageViewerVisible(true);
    };

    return (
        <ScreenWrapper>
            <Heading
                page="Drivers"
                rightComponent={
                    <TouchableOpacity
                        onPress={() => router.push('/Fleet/Driver/Add')}
                        style={[styles.addButton, { backgroundColor: accent }]}
                    >
                        <Ionicons name="add" size={wp(5)} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={[styles.container, { backgroundColor: background }]}>
                {drivers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={wp(20)} color={icon} />
                        <ThemedText type="title" style={styles.title}>
                            No Drivers Yet
                        </ThemedText>
                        <ThemedText style={styles.description}>
                            Add your first driver to get started.
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={drivers}
                        renderItem={renderDriverItem}
                        keyExtractor={(item) => item.id || Math.random().toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[accent]}
                                tintColor={accent}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                {refreshing ? (
                                    <>
                                        <AccentRingLoader color={accent} size={32} dotSize={6} />
                                        <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                            Refreshing Drivers…
                                        </ThemedText>
                                        <ThemedText type='tiny' style={styles.emptySubtext}>
                                            Please Wait
                                        </ThemedText>
                                    </>
                                ) : (
                                    <>
                                        <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                            No Drivers Available
                                        </ThemedText>
                                        <ThemedText type='tiny' style={styles.emptySubtext}>
                                            Check back later
                                        </ThemedText>
                                    </>
                                )}
                            </View>
                        }
                    />
                )}
            </View>

            {/* Driver Details Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                        {selectedDriver && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Header with close button */}
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={wp(6)} color={icon} />
                                    </TouchableOpacity>
                                </View>

                                {/* Driver Images */}
                                <View style={styles.modalImagesContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {selectedDriver.driverLicenseUrl && (
                                            <TouchableOpacity
                                                onPress={() => openImageViewer(
                                                    [{ uri: selectedDriver.driverLicenseUrl }],
                                                    ['Driver License'],
                                                    0
                                                )}
                                                style={styles.modalImageWrapper}
                                            >
                                                <Image
                                                    source={{ uri: selectedDriver.driverLicenseUrl }}
                                                    style={styles.modalImage}
                                                    resizeMode="cover"
                                                />
                                                <ThemedText style={styles.modalImageLabel}>License</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                        {selectedDriver.passportUrl && (
                                            <TouchableOpacity
                                                onPress={() => openImageViewer(
                                                    [{ uri: selectedDriver.passportUrl }],
                                                    ['Passport'],
                                                    0
                                                )}
                                                style={styles.modalImageWrapper}
                                            >
                                                <Image
                                                    source={{ uri: selectedDriver.passportUrl }}
                                                    style={styles.modalImage}
                                                    resizeMode="cover"
                                                />
                                                <ThemedText style={styles.modalImageLabel}>Passport</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                        {selectedDriver.internationalPermitUrl && (
                                            <TouchableOpacity
                                                onPress={() => openImageViewer(
                                                    [{ uri: selectedDriver.internationalPermitUrl }],
                                                    ['International Permit'],
                                                    0
                                                )}
                                                style={styles.modalImageWrapper}
                                            >
                                                <Image
                                                    source={{ uri: selectedDriver.internationalPermitUrl }}
                                                    style={styles.modalImage}
                                                    resizeMode="cover"
                                                />
                                                <ThemedText style={styles.modalImageLabel}>Permit</ThemedText>
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                </View>

                                {/* Driver Details */}
                                <View style={styles.modalDriverDetails}>
                                    <ThemedText style={styles.modalDriverName}>{selectedDriver.fullName}</ThemedText>
                                    <ThemedText style={[styles.modalDriverPhone, { color: icon }]}>{selectedDriver.phoneNumber}</ThemedText>

                                    {/* Driver Stats */}
                                    <View style={styles.statsContainer}>
                                        <View style={styles.statItem}>
                                            <ThemedText style={styles.statNumber}>0</ThemedText>
                                            <ThemedText style={[styles.statLabel, { color: icon }]}>Trips Completed</ThemedText>
                                        </View>
                                        <View style={styles.statItem}>
                                            <ThemedText style={styles.statNumber}>
                                                {[
                                                    selectedDriver.mainTruck ? 1 : 0,
                                                    selectedDriver.secondMainTruck ? 1 : 0,
                                                    selectedDriver.backupTrucks ? selectedDriver.backupTrucks.length : 0
                                                ].reduce((a, b) => a + b, 0)}
                                            </ThemedText>
                                            <ThemedText style={[styles.statLabel, { color: icon }]}>Assigned Trucks</ThemedText>
                                        </View>
                                        <View style={styles.statItem}>
                                            <ThemedText style={styles.statNumber}>0</ThemedText>
                                            <ThemedText style={[styles.statLabel, { color: icon }]}>Total Distance</ThemedText>
                                        </View>
                                    </View>

                                    {/* Assigned Trucks */}
                                    <View style={styles.trucksSection}>
                                        <ThemedText style={styles.sectionTitle}>Assigned Trucks</ThemedText>

                                        {selectedDriver.mainTruck && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    router.push({
                                                        pathname: "/Logistics/Trucks/TruckDetails",
                                                        params: { truckid: selectedDriver!.mainTruck!.truckId, fleetId: currentFleet?.fleetId }
                                                    });
                                                }}
                                                style={[styles.truckItem, { backgroundColor: backgroundLight }]}
                                            >
                                                <Ionicons name="car-outline" size={wp(5)} color={accent} />
                                                <View style={styles.truckItemDetails}>
                                                    <ThemedText style={styles.truckItemName}>{selectedDriver.mainTruck.truckName}</ThemedText>
                                                    <ThemedText style={[styles.truckItemRole, { color: accent }]}>Main Driver</ThemedText>
                                                </View>
                                                <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                                            </TouchableOpacity>
                                        )}

                                        {selectedDriver.secondMainTruck && (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    router.push({
                                                        pathname: "/Logistics/Trucks/TruckDetails",
                                                        params: { truckid: selectedDriver!.secondMainTruck!.truckId, fleetId: currentFleet?.fleetId }
                                                    });
                                                }}
                                                style={[styles.truckItem, { backgroundColor: backgroundLight }]}
                                            >
                                                <Ionicons name="car-outline" size={wp(5)} color={accent} />
                                                <View style={styles.truckItemDetails}>
                                                    <ThemedText style={styles.truckItemName}>{selectedDriver.secondMainTruck.truckName}</ThemedText>
                                                    <ThemedText style={[styles.truckItemRole, { color: accent }]}>Second Main Driver</ThemedText>
                                                </View>
                                                <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                                            </TouchableOpacity>
                                        )}

                                        {selectedDriver.backupTrucks && selectedDriver.backupTrucks.map((backupTruck, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    setModalVisible(false);
                                                    router.push({
                                                        pathname: "/Logistics/Trucks/TruckDetails",
                                                        params: { truckid: backupTruck.truckId, fleetId: currentFleet?.fleetId }
                                                    });
                                                }}
                                                style={[styles.truckItem, { backgroundColor: backgroundLight }]}
                                            >
                                                <Ionicons name="car-outline" size={wp(5)} color={accent} />
                                                <View style={styles.truckItemDetails}>
                                                    <ThemedText style={styles.truckItemName}>{backupTruck.truckName}</ThemedText>
                                                    <ThemedText style={[styles.truckItemRole, { color: accent }]}>Backup Driver</ThemedText>
                                                </View>
                                                <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                                            </TouchableOpacity>
                                        ))}

                                        {(!selectedDriver.mainTruck && !selectedDriver.secondMainTruck && (!selectedDriver.backupTrucks || selectedDriver.backupTrucks.length === 0)) && (
                                            <View style={styles.noTrucksContainer}>
                                                <Ionicons name="car-outline" size={wp(8)} color={coolGray} />
                                                <ThemedText style={[styles.noTrucksText, { color: coolGray }]}>No trucks assigned</ThemedText>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        onPress={handleEditDriver}
                                        style={[styles.actionButton, { backgroundColor: accent }]}
                                    >
                                        <Ionicons name="pencil" size={wp(5)} color="white" />
                                        <ThemedText style={styles.actionButtonText}>Edit Driver</ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleDeleteDriver}
                                        style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
                                    >
                                        <Ionicons name="trash" size={wp(5)} color="white" />
                                        <ThemedText style={styles.actionButtonText}>Delete Driver</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Image Viewer Modal */}
            <ImageViewing
                images={driverImages}
                imageIndex={currentImageIndex}
                visible={imageViewerVisible}
                onRequestClose={() => setImageViewerVisible(false)}
                HeaderComponent={() => (
                    <View style={styles.imageViewerHeader}>
                        <TouchableOpacity onPress={() => setImageViewerVisible(false)} style={styles.imageViewerClose}>
                            <Ionicons name="close" size={wp(6)} color="white" />
                        </TouchableOpacity>
                        <ThemedText style={styles.imageViewerTitle}>
                            {imageLabels[currentImageIndex] || 'Document'}
                        </ThemedText>
                    </View>
                )}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
    },
    addButton: {
        padding: wp(2),
        borderRadius: wp(2),
        marginRight: wp(2),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingBottom: wp(4),
    },
    driverCard: {
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: wp(3),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    driverInfo: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: wp(3),
    },
    imageWrapper: {
        alignItems: 'center',
        marginRight: wp(2),
    },
    smallImage: {
        width: wp(15),
        height: wp(12),
        borderRadius: wp(2),
        marginBottom: wp(1),
    },
    imageLabel: {
        fontSize: wp(2.5),
        color: '#666',
        textAlign: 'center',
    },
    driverDetails: {
        alignItems: 'center',
    },
    driverName: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(1),
        textAlign: 'center',
    },
    driverPhone: {
        fontSize: wp(3.5),
        marginBottom: wp(1),
        textAlign: 'center',
    },
    driverStatus: {
        fontSize: wp(3),
        fontWeight: '600',
        textAlign: 'center',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: wp(4)
    },
    loadingSubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    },
    emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center'
    },
    emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    },
    truckInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1),
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        backgroundColor: 'rgba(0,123,255,0.1)',
        borderRadius: wp(2),
    },
    truckText: {
        fontSize: wp(3),
        fontWeight: '600',
        marginLeft: wp(1),
        flex: 1,
    },
    editTruckButton: {
        padding: wp(1),
        marginLeft: wp(1),
        borderRadius: wp(1),
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    trucksContainer: {
        width: '100%',
        marginBottom: wp(2),
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        maxHeight: hp(90),
        borderRadius: wp(4),
        padding: wp(4),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: wp(2),
    },
    closeButton: {
        padding: wp(2),
    },
    modalImagesContainer: {
        marginBottom: wp(4),
    },
    modalImageWrapper: {
        alignItems: 'center',
        marginRight: wp(3),
    },
    modalImage: {
        width: wp(25),
        height: wp(20),
        borderRadius: wp(3),
        marginBottom: wp(1),
    },
    modalImageLabel: {
        fontSize: wp(2.5),
        color: '#666',
        textAlign: 'center',
    },
    modalDriverDetails: {
        alignItems: 'center',
        marginBottom: wp(4),
    },
    modalDriverName: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: wp(1),
        textAlign: 'center',
    },
    modalDriverPhone: {
        fontSize: wp(4),
        marginBottom: wp(3),
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: wp(4),
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: wp(5),
        fontWeight: 'bold',
        color: '#1E90FF',
        marginBottom: wp(1),
    },
    statLabel: {
        fontSize: wp(3),
        textAlign: 'center',
    },
    trucksSection: {
        width: '100%',
        marginBottom: wp(4),
    },
    sectionTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(2),
        textAlign: 'center',
    },
    truckItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        marginBottom: wp(2),
        borderRadius: wp(2),
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    truckItemDetails: {
        flex: 1,
        marginLeft: wp(2),
    },
    truckItemName: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(0.5),
    },
    truckItemRole: {
        fontSize: wp(3),
        fontWeight: '600',
    },
    noTrucksContainer: {
        alignItems: 'center',
        padding: wp(4),
    },
    noTrucksText: {
        fontSize: wp(4),
        fontWeight: '600',
        marginTop: wp(2),
    },
    modalActions: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(2),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        borderRadius: wp(2),
        gap: wp(2),
    },
    actionButtonText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    imageViewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 15,
        position: 'absolute',
        top: 10,
        zIndex: 999,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 5,
    },
    imageViewerClose: {
        marginRight: 8,
        marginLeft: 4,
    },
    imageViewerTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'white',
    },
});