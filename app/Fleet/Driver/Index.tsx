import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import AccentRingLoader from '@/components/AccentRingLoader';

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
}

export default function DriverIndex() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentFleet, setCurrentFleet] = useState<any>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const getCurrentFleetAndDrivers = async () => {
            try {
                const fleetData = await AsyncStorage.getItem('currentRole');
                if (fleetData) {
                    const parsedFleet = JSON.parse(fleetData);
                    setCurrentFleet(parsedFleet);
                    await fetchDrivers(parsedFleet.fleetId);
                }
            } catch (error) {
                console.error('Error getting current fleet:', error);
            } finally {
                setLoading(false);
                setHasLoaded(true);
            }
        };

        getCurrentFleetAndDrivers();
    }, []);

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
        <TouchableOpacity onPress={() => router.push({ pathname: "/Fleet/Driver/Add", params: { driverId: item.id, editMode: "true" } })} style={[styles.driverCard, { backgroundColor: backgroundLight }]}>
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
});