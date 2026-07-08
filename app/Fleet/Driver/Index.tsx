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
import { collection, query, where, getDocs, doc, deleteDoc, serverTimestamp, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import AccentRingLoader from '@/components/AccentRingLoader';
import { deleteDocument, updateDocument } from '@/db/operations';
// import ImageViewing from 'react-nativeput';
import Input from '@/components/Input';
import { useAuth } from '@/context/AuthContext';

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


interface Driver {
    id: string;
    name: string;
    email: string;
    userId: string
    selfieImage : string  
    // Add other properties present in your 'Drivers' collection
}

interface FleetAccess {
    fleetId: string;
    fleetName: string;
    status: 'pending' | 'active' | 'removed';
    invitedAt: any; // Using 'any' for Firestore serverTimestamp
    acceptedAt?: any;
}

export default function DriverIndex() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');

    const { driverId } = useLocalSearchParams();
    const { currentRole } = useAuth();
    const currentFleet = currentRole


    const [drivers, setFleetDrivers] = useState<Driver[]>([]);
    const [loadinFleetDrivers, setLoadingFleetDrivers] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);


    const onRefresh = async () => {
        try {
            setRefreshing(true);
            if (currentFleet?.fleetId) {
                await fetchDrivers();
            }
        } catch (error) {
            console.error('Error refreshing drivers:', error);
        } finally {
            setRefreshing(false);
        }
    };




    const fetchDrivers = async () => {
        // 1. Add a guard clause
        if (!currentRole || !currentRole.fleetId) {
            console.warn("Fleet ID is missing, skipping fetch.");
            return;
        }
        setLoadingFleetDrivers(true)

        try {
            // Now TypeScript knows fleetId is definitely a string
            const driversRef = collection(db, 'fleets', currentRole.fleetId, 'Drivers');
            const q = query(driversRef);
            const querySnapshot = await getDocs(q);

            const driversData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Driver[];

            setFleetDrivers(driversData);
            setLoadingFleetDrivers(false)

        } catch (error) {
            console.error('Error fetching drivers:', error);
            setLoadingFleetDrivers(false)

        } finally {
            setLoadingFleetDrivers(false)

        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);





    const renderDriverItem = ({ item }: { item: Driver }) => (
        <TouchableOpacity onPress={() => {
            router.push({
                pathname: "/Fleet/Driver/DriverDetails",
                params: { driverId: item.id, fleetId: currentFleet?.fleetId }
            });
        }} style={[styles.driverCard, { backgroundColor: backgroundLight }]}>
            <View style={styles.driverInfo}>
                <View style={styles.driverDetails}>
                    <ThemedText style={styles.driverName}>{item.fullName}</ThemedText>
                    <ThemedText style={[styles.driverPhone, { color: icon }]}>{item.phoneNumber}</ThemedText>


                    <ThemedText style={[styles.driverStatus, {
                        color: item.status === 'active' ? '#0f9d58' : '#ff6b35'
                    }]}>
                        {item.status.toUpperCase()}
                    </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );




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
                                setSelectedDriver(null);
                                // Refresh the list
                                // await fetchDrivers();
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


    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddTracker, setShowAddDriver] = useState(false);

    // States
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [searchedDrivers, setSearchedDrivers] = useState<Driver[]>([]);
    const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
    const [driverSearchQuery, setDriverSearchQuery] = useState('');
    const [loadingAllDrivers, setLoadingAllDrivers] = useState(true);

    // Fetch drivers once — this is the full pool the search box filters
    // against locally, so it's loaded up front and shown in full by
    // default (before any search text is typed).
    useEffect(() => {
        const fetchAllDrivers = async () => {
            setLoadingAllDrivers(true);
            try {
                const querySnapshot = await getDocs(collection(db, "Drivers"));
                const driversData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Driver[];
                setAllDrivers(driversData);
                setSearchedDrivers(driversData);
            } catch (error) {
                console.error('Error fetching all drivers:', error);
            } finally {
                setLoadingAllDrivers(false);
            }
        };
        fetchAllDrivers();
    }, []);



    const handleSearch = (text: string) => {
        setDriverSearchQuery(text);

        const searchText = text.trim().toLowerCase();

        // Input cleared — show everyone again, not an empty list.
        if (!searchText) {
            setSearchedDrivers(allDrivers);
            return;
        }

        // Some text entered — show only what matches, never the full list.
        const filtered = allDrivers.filter(driver =>
            driver.fullName?.toLowerCase().includes(searchText) ||
            driver.email?.toLowerCase().includes(searchText)
        );

        setSearchedDrivers(filtered);
    };

    const handleAddDrivers = async () => {
        if (selectedDrivers.length === 0) return;

        setIsSubmitting(true);

        try {
            const fleetUpdate = {
                fleetId: currentRole.fleetId,
                fleetName: currentRole.companyName,
                status: "pending",
                invitedAt: Date.now(),
                role: "fleet",
                userRole: "driver"
            };

            // Update each selected driver
            await Promise.all(selectedDrivers.map(async (driver) => {
                await updateDocument('personalData', driver.userId, {
                    accesibleFleets: arrayUnion({ ...fleetUpdate, driverId: `DRV_${driver?.userId}` }), // Use arrayUnion to avoid overwriting existing data
                    updatedAt: serverTimestamp(),

                });

                if (!currentRole.fleetId) return
                const driverRef = doc(db, 'fleets', currentRole.fleetId, 'Drivers', `DRV_${driver.userId}`);
                await setDoc(driverRef, { ...fleetUpdate, driverId: `DRV_${driver?.userId}`, fullName: driver.fullName, phoneNumber: driver.phoneNumber, email: driver.email, timeStamp: serverTimestamp() ,profilePhoto:driver.selfieImage, });

            }));


            fetchDrivers()
            setShowAddDriver(false);
            setSelectedDrivers([]); // Clear selection
            setDriverSearchQuery('');
            setSearchedDrivers(allDrivers);
        } catch (e) {
            console.error("Error updating drivers:", e);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <ScreenWrapper>

            <Modal visible={showAddTracker} transparent animationType="slide">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    paddingHorizontal: wp(4)
                }}>
                    <View style={{
                        backgroundColor: background,
                        borderRadius: 12,
                        padding: wp(4)
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>Add Driver</ThemedText>
                            <TouchableOpacity onPress={() => setShowAddDriver(false)}>
                                <Ionicons name="close" size={24} color={accent} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={{ marginBottom: wp(1) }}>Driver Name</ThemedText>
                        <Input
                            placeholder="Search by name or email"
                            onChangeText={handleSearch}
                            value={driverSearchQuery}
                            style={{ marginBottom: wp(3) }}
                        />

                        <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>Available Drivers</ThemedText>

                        
                            <FlatList
                                data={searchedDrivers}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                style={{ maxHeight: hp(35) }}
                                renderItem={({ item }) => {
                                    const isSelected = selectedDrivers.some(
                                        d => d.id === item.id
                                    );

                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedDrivers(prev =>
                                                    isSelected
                                                        ? prev.filter(d => d.id !== item.id)
                                                        : [...prev, item]
                                                );
                                            }}
                                            style={{
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: icon,
                                                borderRadius: 8,
                                                marginVertical: 4,
                                                backgroundColor: isSelected
                                                    ? backgroundLight
                                                    : background,
                                            }}
                                        >
                                            <ThemedText>{item.fullName}</ThemedText>
                                            <ThemedText style={{ fontSize: 12 }}>
                                                {item.email}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    loadingAllDrivers ? (
                                        <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                                            Loading drivers…
                                        </ThemedText>
                                    ) : driverSearchQuery.trim() ? (
                                        <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                                            No drivers found with "{driverSearchQuery.trim()}"
                                        </ThemedText>
                                    ) : (
                                        <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                                            No drivers available
                                        </ThemedText>
                                    )
                                }
                            />
                        

                        <TouchableOpacity
                            disabled={isSubmitting || selectedDrivers.length === 0}
                            onPress={handleAddDrivers}
                            style={{
                                marginTop: wp(4),
                                padding: wp(3),
                                backgroundColor: selectedDrivers.length === 0 ? '#ccc' : accent,
                                borderRadius: 8,
                                alignItems: 'center'
                            }}
                        >
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                                {isSubmitting ? "Submitting..." : `Submit (${selectedDrivers.length})`}
                            </ThemedText>
                        </TouchableOpacity>



                    </View>
                </View>
            </Modal>




            <Heading
                page="Drivers"
                rightComponent={
                    <TouchableOpacity
                        onPress={() => setShowAddDriver(true)}
                        style={[styles.addButton, { backgroundColor: accent }]}
                    >
                        <Ionicons name="add" size={wp(5)} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={[styles.container, { backgroundColor: background }]}>


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
                        />
                    }

                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            {
                                loadinFleetDrivers ? (
                                    <>
                                        <AccentRingLoader color={accent} size={32} dotSize={6} />
                                        <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                            Drivers Loading ....
                                        </ThemedText>
                                        <ThemedText type='tiny' style={styles.emptySubtext}>
                                            Please Wait
                                        </ThemedText>
                                    </>
                                ) :
                                    refreshing ? (
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
                                            <Ionicons name="people-outline" size={wp(16)} color={icon} style={{ alignSelf: "center" }} />

                                            <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                                No Drivers Available
                                            </ThemedText>


                                            <TouchableOpacity onPress={() => setShowAddDriver(true)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                                            >
                                                <ThemedText style={{ color: '#666' }}>
                                                    Assign a driver to assign trucks and loads.
                                                </ThemedText>

                                                <Ionicons
                                                    name="chevron-forward"
                                                    size={16}
                                                    color={accent}
                                                    style={{ marginLeft: 4 }}
                                                />
                                            </TouchableOpacity>

                                        </>
                                    )}
                        </View>
                    }

                />

            </View>


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
        padding: wp(3),
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
});
