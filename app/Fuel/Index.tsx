import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, TouchableNativeFeedback, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchDocuments, isServiceStationOwner as checkServiceStationOwner, addServiceStationOwner } from '@/db/operations';
import Heading from "@/components/Heading";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { openWhatsApp, getContactMessage } from '@/Utilities/whatsappUtils';
import { FuelPaymentModal } from "@/payments";
import { getCurrentLocation } from '@/Utilities/utils';
import { calculateDistance, Coordinate } from '@/Utilities/coordinateUtils';
import AccentRingLoader from '@/components/AccentRingLoader';
import { useAuth } from "@/context/AuthContext";

interface FuelStation {
    id: string;
    name: string;
    location: {
        description: string;
        latitude: number;
        longitude: number;
        city: string | null;
        country: string | null;
    };
    fuelTypes: {
        diesel: { price: string; available: boolean };
        petrol: { price: string; available: boolean };
        other: { name: string; price: string; available: boolean };
    };
    contactNumber: string;
    operatingHours: string;
    amenities: string[];
    description: string;
    addedBy: string;
    addedAt: Date;
}

export default function Index() {
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const backgroundLight = useThemeColor('backgroundLight')
    const { user } = useAuth();

    const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isServiceStationOwner, setIsServiceStationOwner] = useState(false);
    const router = useRouter();

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [expandedId, setExpandedId] = useState<string>('');
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [selectedFuelStation, setSelectedFuelStation] = useState<FuelStation | null>(null);
    const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [isCalculatingDistances, setIsCalculatingDistances] = useState(false);

    const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)

    useEffect(() => {
        const checkServiceStationOwnerStatus = async () => {
            if (user) {
                const owner = await checkServiceStationOwner(user.uid);
                setIsServiceStationOwner(owner);
            }
        };
        checkServiceStationOwnerStatus();
    }, [user]);

    const getCurrentUserLocation = async () => {
        try {
            setIsCalculatingDistances(true);
            const location = await getCurrentLocation();
            if (location) {
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
        } catch (error) {
            console.error('Error getting current location:', error);
        } finally {
            setIsCalculatingDistances(false);
        }
    };

    const LoadFuelStations = async () => {
        try {
            setLoading(true);
            const result = await fetchDocuments("FuelStations");

            if (result.data.length) {
                setFuelStations(result.data as FuelStation[]);
                setLastVisible(result.lastVisible);
                setFilteredPNotAavaialble(false);
            } else {
                setFilteredPNotAavaialble(true);
            }
        } catch (error) {
            console.error('Error loading fuel stations:', error);
            setFilteredPNotAavaialble(true);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        LoadFuelStations();
        getCurrentUserLocation();
    }, [])

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await LoadFuelStations();
        } catch (error) {
            console.error('Error refreshing fuel stations:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const loadMoreFuelStations = async () => {
        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        try {
            const result = await fetchDocuments('FuelStations', 10, lastVisible);
            if (result) {
                setFuelStations([...fuelStations, ...result.data as FuelStation[]]);
                setLastVisible(result.lastVisible);
            }
        } catch (error) {
            console.error('Error loading more fuel stations:', error);
        } finally {
            setLoadingMore(false);
        }
    };



    //   if (loading) {
    //     return (
    //       <ScreenWrapper>
    //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //           <ActivityIndicator size="large" />
    //           <ThemedText>Loading devices...</ThemedText>
    //         </View>
    //       </ScreenWrapper>
    //     );
    //   }

    const handleAddFuel = () => {
        router.push('/Fuel/AddFuel');
    };


    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? '' : id);
    };

    const handleFuelPayment = (fuelStation: FuelStation) => {
        setSelectedFuelStation(fuelStation);
        setIsPaymentModalVisible(true);
    };

    const calculateFuelStationDistance = (fuelStation: FuelStation): number => {
        if (!currentLocation || !fuelStation.location) return 0;

        const stationLocation: Coordinate = {
            latitude: fuelStation.location.latitude,
            longitude: fuelStation.location.longitude
        };

        return calculateDistance(currentLocation, stationLocation);
    };

    const getSortedFuelStations = (): FuelStation[] => {
        if (!sortByDistance || !currentLocation) {
            return fuelStations;
        }

        return [...fuelStations].sort((a, b) => {
            const distanceA = calculateFuelStationDistance(a);
            const distanceB = calculateFuelStationDistance(b);
            return distanceA - distanceB;
        });
    };

    return (
        <ScreenWrapper>

            <Heading page='Fuel' rightComponent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3) }}>
                    {currentLocation && (
                        <TouchableNativeFeedback onPress={() => setSortByDistance(!sortByDistance)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }}>
                                <Ionicons
                                    name={sortByDistance ? "location" : "location-outline"}
                                    size={wp(4)}
                                    color={accent}
                                />
                                <ThemedText style={{ marginRight: wp(1) }} type='defaultSemiBold'>
                                    {sortByDistance ? 'Sort by Time' : 'Sort by Distance'}
                                </ThemedText>
                            </View>
                        </TouchableNativeFeedback>
                    )}
                    {isServiceStationOwner && (
                        <TouchableNativeFeedback onPress={handleAddFuel}>
                            <ThemedText style={{ marginRight: wp(3) }} type='defaultSemiBold'>Add Fuel</ThemedText>
                        </TouchableNativeFeedback>
                    )}
                </View>
            } />

            {/* Distance Loading Indicator */}
            {isCalculatingDistances && (
                <View style={[styles.distanceLoadingContainer, { backgroundColor: accent + '10' }]}>
                    <AccentRingLoader color={accent} size={24} dotSize={6} />
                    <ThemedText type="tiny" style={[styles.distanceLoadingText, { color: accent }]}>
                        Calculating distances...
                    </ThemedText>
                </View>
            )}

            <FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{}}
                data={getSortedFuelStations()}
                renderItem={({ item }) => {
                    const isExpanded = expandedId === item.id;
                    const availableFuelTypes = Object.entries(item.fuelTypes).filter(([_, fuel]) => fuel.available);
                    const hasAvailableFuel = availableFuelTypes.length > 0;
                    const distance = currentLocation ? calculateFuelStationDistance(item) : 0;

                    return (
                        <View style={[styles.fuelStationCard, { borderColor: accent + '20' }]}>
                            {/* Main Card Content */}
                            <View style={styles.mainCardContent}>
                                <View style={styles.fuelStationHeader}>
                                    <View style={[styles.fuelIconContainer, { backgroundColor: accent + '15' }]}>
                                        <Ionicons name="car" size={wp(6)} color={accent} />
                                    </View>
                                    <View style={styles.fuelStationInfo}>
                                        <ThemedText type="defaultSemiBold" style={styles.stationName}>
                                            {item.name}
                                        </ThemedText>
                                        <View style={styles.locationRow}>
                                            <Ionicons name="location-outline" size={wp(4)} color={icon} />
                                            <ThemedText type="tiny" style={[styles.locationText, { color: icon }]}>
                                                {item.location.city && item.location.country
                                                    ? `${item.location.city}, ${item.location.country}`
                                                    : item.location.description
                                                }
                                            </ThemedText>
                                            {currentLocation && (
                                                <View style={[styles.distanceContainer, { backgroundColor: accent + '15' }]}>
                                                    {isCalculatingDistances ? (
                                                        <>
                                                            <AccentRingLoader color={accent} size={20} dotSize={4} />
                                                            <ThemedText type="tiny" style={[styles.distanceText, { color: accent }]}>
                                                                Loading...
                                                            </ThemedText>
                                                        </>
                                                    ) : distance > 0 ? (
                                                        <>
                                                            <Ionicons name="navigate" size={wp(3.5)} color={accent} />
                                                            <ThemedText type="tiny" style={[styles.distanceText, { color: accent }]}>
                                                                {distance.toFixed(1)} km
                                                            </ThemedText>
                                                        </>
                                                    ) : null}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {/* <Ionicons name="chevron-forward" size={wp(5)} color={icon} /> */}
                                </View>

                                {/* All Fuel Types Row */}
                                <View style={styles.allFuelTypesContainer}>
                                    {Object.entries(item.fuelTypes)
                                        .sort(([a], [b]) => {
                                            // Sort order: Diesel first, then Petrol, then Other
                                            const order = { diesel: 0, petrol: 1, other: 2 };
                                            return (order[a as keyof typeof order] || 3) - (order[b as keyof typeof order] || 3);
                                        })
                                        .reverse()
                                        .map(([fuelType, fuelData], index) => {
                                            // Unique colors for each fuel type
                                            const fuelColors = {
                                                diesel: '#D32F2F', // Red
                                                petrol: '#1976D2', // Blue
                                                other: '#F57C00'  // Orange
                                            };
                                            const fuelColor = fuelColors[fuelType as keyof typeof fuelColors] || accent;

                                            return (
                                                <View key={fuelType} style={styles.fuelTypeItem}>
                                                    <View style={[
                                                        styles.fuelTypeIcon,
                                                        {
                                                            backgroundColor: fuelData.available ? fuelColor + '20' : '#f0f0f0',
                                                            opacity: fuelData.available ? 1 : 0.5
                                                        }
                                                    ]}>
                                                        <Ionicons
                                                            name="flash"
                                                            size={wp(2.5)}
                                                            color={fuelData.available ? fuelColor : '#999'}
                                                        />
                                                    </View>
                                                    <ThemedText
                                                        type="tiny"
                                                        style={[
                                                            styles.fuelTypeLabel,
                                                            {
                                                                color: fuelData.available ? icon : '#999',
                                                                fontWeight: fuelData.available ? '600' : '400'
                                                            }
                                                        ]}
                                                    >
                                                        {fuelType === 'other'
                                                            ? (fuelData as any).name || 'Other'
                                                            : fuelType.charAt(0).toUpperCase() + fuelType.slice(1)
                                                        }
                                                    </ThemedText>
                                                    <ThemedText
                                                        type="tiny"
                                                        style={[
                                                            styles.fuelPrice,
                                                            {
                                                                color: fuelData.available ? fuelColor : '#999',
                                                                fontWeight: fuelData.available ? 'bold' : '400'
                                                            }
                                                        ]}
                                                    >
                                                        {fuelData.available ? `$${fuelData.price}` : 'N/A'}
                                                    </ThemedText>
                                                    <View style={[
                                                        styles.availabilityDot,
                                                        { backgroundColor: fuelData.available ? '#4CAF50' : '#FF5722' }
                                                    ]} />
                                                </View>
                                            );
                                        })}
                                </View>
                            </View>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    {/* Contact Info Row */}
                                    <View style={styles.contactInfoRow}>
                                        {/* Operating Hours */}
                                        {item.operatingHours && (
                                            <View style={[styles.contactInfoItem, { backgroundColor: backgroundLight }]}>
                                                <View style={[styles.contactInfoIcon, { backgroundColor: accent + '15' }]}>
                                                    <Ionicons name="time-outline" size={wp(3.5)} color={accent} />
                                                </View>
                                                <View style={styles.contactInfoText}>
                                                    <ThemedText type="tiny" style={[styles.contactInfoLabel, { color: icon, opacity: 0.7 }]}>
                                                        Hours
                                                    </ThemedText>
                                                    <ThemedText type="tiny" style={[styles.contactInfoValue, { color: icon }]}>
                                                        {item.operatingHours}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        )}

                                        {/* Contact Number */}
                                        {item.contactNumber && (
                                            <View style={[styles.contactInfoItem, { backgroundColor: backgroundLight }]}>
                                                <View style={[styles.contactInfoIcon, { backgroundColor: accent + '15' }]}>
                                                    <Ionicons name="call-outline" size={wp(3.5)} color={accent} />
                                                </View>
                                                <View style={styles.contactInfoText}>
                                                    <ThemedText type="tiny" style={[styles.contactInfoLabel, { color: icon, opacity: 0.7 }]}>
                                                        Contact
                                                    </ThemedText>
                                                    <ThemedText type="tiny" style={[styles.contactInfoValue, { color: icon }]}>
                                                        {item.contactNumber}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* Amenities */}
                                    {item.amenities && item.amenities.length > 0 && (
                                        <View style={styles.amenitiesSection}>
                                            <ThemedText type="tiny" style={[styles.sectionTitle, { color: icon }]}>
                                                Amenities
                                            </ThemedText>
                                            <View style={styles.amenitiesContainer}>
                                                {item.amenities.map((amenity, index) => (
                                                    <View key={index} style={[styles.amenityChip, { backgroundColor: accent + '15' }]}>
                                                        <ThemedText type="tiny" style={[styles.amenityText, { color: accent }]}>
                                                            {amenity}
                                                        </ThemedText>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Description */}
                                    {item.description && (
                                        <View style={styles.descriptionSection}>
                                            <ThemedText type="tiny" style={[styles.sectionTitle, { color: icon }]}>
                                                Description
                                            </ThemedText>
                                            <ThemedText type="tiny" style={[styles.descriptionText, { color: icon }]}>
                                                {item.description}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity
                                    style={[styles.payButton, { backgroundColor: accent }]}
                                    onPress={() => handleFuelPayment(item)}
                                >
                                    <Ionicons name="card" size={wp(4)} color="white" />
                                    <ThemedText style={styles.payButtonText}>Pay for Fuel</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.viewMoreButton}
                                    onPress={() => toggleExpand(item.id)}
                                >
                                    <ThemedText type="tiny" style={[styles.viewMoreText, { color: accent }]}>
                                        {isExpanded ? 'View Less' : 'View More'}
                                    </ThemedText>
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={wp(4)}
                                        color={accent}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[accent]}
                    />
                }
                onEndReached={loadMoreFuelStations}
                onEndReachedThreshold={.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <>
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    Loading Fuel Stations…
                                </ThemedText>
                                <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Please Wait
                                </ThemedText>
                            </>
                        ) : (
                            <>
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    No Fuel Stations Available!
                                </ThemedText>
                                <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Be the first to add a fuel station
                                </ThemedText>
                            </>
                        )}
                    </View>
                }
                ListFooterComponent={
                    <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                        {
                            loadingMore ?
                                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More Fuel Stations</ThemedText>
                                    <ActivityIndicator size="small" color={accent} />
                                </View>
                                :
                                (!lastVisible && fuelStations.length > 0) ?
                                    <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                        <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more fuel stations to load
                                        </ThemedText>
                                        <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />
                                    </View>
                                    : null
                        }

                    </View>
                }
            />

            <FuelPaymentModal
                isVisible={isPaymentModalVisible}
                onClose={() => setIsPaymentModalVisible(false)}
                fuelStation={selectedFuelStation}
            />

        </ScreenWrapper>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    },
    contactOptions: {
        paddingVertical: wp(4),
        flexDirection: 'row',
        gap: wp(5),
        marginTop: 'auto',
        justifyContent: 'space-around'
    },
    contactOption: {
        alignItems: 'center'
    },
    contactButtonIcon: {
        height: wp(12),
        width: wp(12),
        borderRadius: wp(90),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(1)
    },
    ownerActions: {
        paddingVertical: wp(4),
        flexDirection: 'row',
        gap: wp(5),
        marginTop: 'auto'
    }, emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    }, emptyText: {
        textAlign: 'center'
    }, emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center'
    },
    contactCard: {
        margin: wp(4),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    contactTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    contactDescription: {
        fontSize: wp(3.8),
        lineHeight: wp(5),
        marginBottom: wp(4),
        textAlign: 'center'
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2)
    },
    contactButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    howItWorksCard: {
        margin: wp(4),
        marginBottom: wp(2),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    howItWorksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    howItWorksTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    stepsContainer: {
        gap: wp(2)
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3)
    },
    stepNumber: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepNumberText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    stepText: {
        flex: 1,
        fontSize: wp(3.5),
        lineHeight: wp(4.5)
    },
    featuresContainer: {
        marginTop: wp(3),
        marginBottom: wp(3)
    },
    featuresTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(2)
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2)
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        width: '48%',
        paddingVertical: wp(1)
    },
    featureText: {
        fontSize: wp(3.2),
        flex: 1
    },
    // Fuel Station Card Styles
    fuelStationCard: {
        marginVertical: wp(2),
        marginHorizontal: wp(4),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        backgroundColor: 'transparent',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    fuelStationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    fuelIconContainer: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },
    fuelStationInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: wp(4.2),
        marginBottom: wp(1),
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        flex: 1,
    },
    locationText: {
        fontSize: wp(3.2),
        flex: 1,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(0.8),
        paddingHorizontal: wp(2),
        paddingVertical: wp(0.8),
        borderRadius: wp(1.5),
    },
    distanceText: {
        fontSize: wp(2.8),
        fontWeight: '600',
    },
    fuelDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fuelTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    fuelTypeInfo: {
        alignItems: 'flex-start',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
    },
    statusIndicator: {
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
    },
    statusText: {
        fontSize: wp(3),
    },
    // View more button styles
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2),
        marginTop: wp(2),
        gap: wp(1),
    },
    viewMoreText: {
        fontSize: wp(3.2),
        fontWeight: '600',
    },
    // Fuel types row styles
    allFuelTypesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: wp(2),
        paddingHorizontal: wp(2),
        gap: wp(0.5),
    },
    fuelTypeItem: {
        alignItems: 'center',
        flex: 1,
        gap: wp(0.8),
        paddingHorizontal: wp(0.5),
    },
    fuelTypeIcon: {
        width: wp(5),
        height: wp(5),
        borderRadius: wp(2.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    fuelTypeLabel: {
        fontSize: wp(3.5),
        marginBottom: wp(0.5),
        textAlign: 'center',
    },
    fuelPrice: {
        fontSize: wp(3.2),
        fontWeight: '900',
        textAlign: 'center',
    },
    availabilityDot: {
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        marginTop: wp(0.5),
    },
    // Expanded content styles
    mainCardContent: {
        flex: 1,
    },
    expandedContent: {
        paddingHorizontal: wp(4),
        paddingTop: wp(3),
        paddingBottom: wp(3),
        marginTop: wp(2),
    },
    // Contact info row styles
    contactInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(4),
        gap: wp(2),
    },
    contactInfoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(2.5),
        borderRadius: wp(2),
        gap: wp(2),
    },
    contactInfoIcon: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfoText: {
        flex: 1,
    },
    contactInfoLabel: {
        fontSize: wp(2.8),
        fontWeight: '600',
        marginBottom: wp(0.5),
    },
    contactInfoValue: {
        fontSize: wp(3.2),
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(2),
        gap: wp(2),
    },
    detailText: {
        fontSize: wp(3.2),
        flex: 1,
    },
    amenitiesSection: {
        marginBottom: wp(3),
    },
    sectionTitle: {
        fontSize: wp(3.5),
        fontWeight: '600',
        marginBottom: wp(1.5),
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(1.5),
    },
    amenityChip: {
        paddingVertical: wp(1),
        paddingHorizontal: wp(2),
        borderRadius: wp(1.5),
    },
    amenityText: {
        fontSize: wp(3),
        fontWeight: '500',
    },
    descriptionSection: {
        marginBottom: wp(2),
    },
    descriptionText: {
        fontSize: wp(3.2),
        lineHeight: wp(4.5),
    },
    // Action buttons styles
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: wp(2),
        gap: wp(2),
    },
    payButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2),
    },
    payButtonText: {
        color: 'white',
        fontSize: wp(3.2),
        fontWeight: '600',
    },
    // Distance loading styles
    distanceLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        marginHorizontal: wp(4),
        marginVertical: wp(2),
        borderRadius: wp(2),
        gap: wp(2),
    },
    distanceLoadingText: {
        fontSize: wp(3.2),
        fontWeight: '500',
    },
})
