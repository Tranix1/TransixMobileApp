import React, { useEffect, useState, useRef } from "react";
import {
    View,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Dimensions
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { decodePolyline, LatLng } from "@/Utilities/decodePolyline";
import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useThemeColor } from "@/hooks/useThemeColor";
import { hp, wp } from "@/constants/common";
import { Load } from "@/types/types";
import { parseCoordinateString, isValidCoordinate, DEFAULT_COORDINATES, Coordinate } from "@/Utilities/coordinateUtils";
import ScreenWrapper from "@/components/ScreenWrapper";

const { width, height } = Dimensions.get('window');

interface RouteDetails {
    distance: string;
    duration: string;
}

// Removed AlternativeRoute interface - no longer needed

export default function ViewLoadRoutes() {
    const params = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);
    const theme = useColorScheme() ?? "light";

    // Theme colors
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('background');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');

    // State management
    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const [hasFitted, setHasFitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
    const [showDetails, setShowDetails] = useState(true);
    const [routeDetailsLoading, setRouteDetailsLoading] = useState(false);

    // Load data from params
    const loadData = params.loadData ? JSON.parse(params.loadData as string) as Load : null;
    const originCoords = params.originCoords ? JSON.parse(params.originCoords as string) as Coordinate : null;
    const destinationCoords = params.destinationCoords ? JSON.parse(params.destinationCoords as string) as Coordinate : null;
    const routePolyline = params.routePolyline as string;
    const bounds = params.bounds as string;
    const destinationType = params.destinationType as string;
    const destinationName = params.destinationName as string;

    // Debug logging
    console.log('ViewLoadRoutes - Load Data:', loadData);
    console.log('ViewLoadRoutes - Origin Coords:', originCoords);
    console.log('ViewLoadRoutes - Destination Coords:', destinationCoords);
    console.log('ViewLoadRoutes - Route Polyline:', routePolyline);
    console.log('ViewLoadRoutes - Bounds:', bounds);

    // Validate coordinates using utility functions
    const isValidOrigin = isValidCoordinate(originCoords);
    const isValidDestination = isValidCoordinate(destinationCoords);

    useEffect(() => {
        initializeMap();
    }, []);

    // Ensure map fits when routeCoords change
    useEffect(() => {
        if (mapRef.current && routeCoords.length > 0 && !hasFitted) {
            console.log('Auto-fitting map to route with', routeCoords.length, 'points');
            // Add a longer delay to ensure map is fully loaded
            setTimeout(() => {
                if (mapRef.current) {
                    fitMapToRoute(routeCoords);
                    setHasFitted(true);
                }
            }, 1000);
        }
    }, [routeCoords, hasFitted]);

    // Always try to fetch route details if we have valid coordinates
    useEffect(() => {
        if (isValidOrigin && isValidDestination && !routeDetails && !routeDetailsLoading) {
            console.log('Attempting to fetch route details...');
            fetchRouteDetailsOnly();
        }
    }, [isValidOrigin, isValidDestination, routeDetails, routeDetailsLoading]);

    const initializeMap = async () => {
        try {
            setLoading(true);
            setError(null);

            // Process route data
            await processRouteData();
        } catch (err) {
            console.error('Error initializing map:', err);
            setError("Failed to initialize map");
        } finally {
            setLoading(false);
        }
    };

    const processRouteData = async () => {
        try {
            // If route polyline is provided, decode it
            if (routePolyline) {
                console.log('Processing route polyline:', routePolyline);
                const points = decodePolyline(routePolyline);
                console.log('Decoded polyline points:', points.length);
                setRouteCoords(points);

                // Set route details from load data if available, otherwise fetch from API
                if (loadData && loadData.distance && loadData.duration) {
                    setRouteDetails({
                        distance: loadData.distance,
                        duration: loadData.duration,
                    });
                } else if (isValidOrigin && isValidDestination) {
                    // Fetch fresh route details from API even if we have polyline
                    await fetchRouteDetailsOnly();
                }


                // Don't fit map here - let the useEffect handle it after map is ready
                console.log('Route polyline processed with', points.length, 'points - will auto-fit when map is ready');
                return;
            }

            // If no polyline but we have coordinates, fetch route from API
            if (isValidOrigin && isValidDestination) {
                await fetchRouteFromAPI();
                return;
            }

            // Fallback: show basic markers without route
            if (isValidDestination) {
                // Set a basic region for the destination
                const region = {
                    latitude: destinationCoords!.latitude,
                    longitude: destinationCoords!.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };

                // Use setTimeout to ensure map is ready
                setTimeout(() => {
                    if (mapRef.current && !hasFitted) {
                        mapRef.current.animateToRegion(region, 1000);
                        setHasFitted(true);
                    }
                }, 1000);

                // Try to fetch route details even without polyline
                if (isValidOrigin && isValidDestination) {
                    await fetchRouteDetailsOnly();
                }
            }
        } catch (err) {
            console.error('Error processing route data:', err);
            setError("Failed to process route data");
        }
    };

    const fetchRouteDetailsOnly = async () => {
        try {
            setRouteDetailsLoading(true);
            const GOOGLE_MAPS_API_KEY = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";
            const origin = `${originCoords!.latitude},${originCoords!.longitude}`;
            const destination = `${destinationCoords!.latitude},${destinationCoords!.longitude}`;

            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

            console.log('Fetching route details from:', url);
            const response = await fetch(url);
            const json = await response.json();

            console.log('Route details API response:', json);

            if (json.status === "OK" && json.routes.length > 0) {
                const route = json.routes[0];
                const leg = route.legs[0];

                const details = {
                    distance: leg.distance?.text || 'N/A',
                    duration: leg.duration?.text || 'N/A',
                    durationInTraffic: leg.duration_in_traffic?.text
                };

                console.log('Setting route details:', details);
                setRouteDetails(details);
            } else {
                console.error("Directions API error:", json.status);
                console.log("Could not fetch route details");
            }
        } catch (err) {
            console.error('Error fetching route details:', err);
            console.log("Failed to fetch route details");
        } finally {
            setRouteDetailsLoading(false);
        }
    };

    const fetchRouteFromAPI = async () => {
        try {
            const GOOGLE_MAPS_API_KEY = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";
            const origin = `${originCoords!.latitude},${originCoords!.longitude}`;
            const destination = `${destinationCoords!.latitude},${destinationCoords!.longitude}`;

            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

            const response = await fetch(url);
            const json = await response.json();

            if (json.status === "OK" && json.routes.length > 0) {
                // Process main route only
                const route = json.routes[0];
                const polyline = route.overview_polyline.points;
                const points = decodePolyline(polyline);
                const leg = route.legs[0];

                setRouteCoords(points);
                setRouteDetails({
                    distance: leg.distance?.text || 'N/A',
                    duration: leg.duration?.text || 'N/A',
                });

                // Don't fit map here - let the useEffect handle it after map is ready
                console.log('Route fetched from API with', points.length, 'points - will auto-fit when map is ready');
            } else {
                console.error("Directions API error:", json.status);
                setError("Could not find route");
            }
        } catch (err) {
            console.error('Error fetching route from API:', err);
            setError("Failed to fetch route");
        }
    };

    const fitMapToRoute = async (points: LatLng[]) => {
        try {
            if (!mapRef.current || points.length === 0) {
                console.log('Cannot fit map: mapRef or points not available');
                return;
            }

            const allCoords = [...points];
            if (isValidOrigin) allCoords.unshift(originCoords!);
            if (isValidDestination) allCoords.push(destinationCoords!);

            console.log('Fitting map to', allCoords.length, 'coordinates');

            // Calculate bounds with better padding
            const lats = allCoords.map(coord => coord.latitude);
            const lngs = allCoords.map(coord => coord.longitude);

            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            // Add generous padding to ensure full route is visible
            const latPadding = Math.max((maxLat - minLat) * 0.3, 0.01); // 30% padding, minimum 0.01
            const lngPadding = Math.max((maxLng - minLng) * 0.3, 0.01); // 30% padding, minimum 0.01

            const bounds = [
                { latitude: minLat - latPadding, longitude: minLng - lngPadding },
                { latitude: maxLat + latPadding, longitude: maxLng + lngPadding }
            ];

            console.log('Map bounds calculated:', bounds);

            // Use fitToCoordinates directly without setTimeout
            if (mapRef.current) {
                mapRef.current.fitToCoordinates(bounds, {
                    edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
                    animated: true,
                });
                console.log('✅ Map fitted to route successfully');
            }
        } catch (err) {
            console.error('Error fitting map to route:', err);
        }
    };

    const getInitialRegion = (): Region | null => {
        if (!isValidOrigin && !isValidDestination) return null;

        const allLatitudes = [];
        const allLongitudes = [];

        if (isValidOrigin) {
            allLatitudes.push(originCoords!.latitude);
            allLongitudes.push(originCoords!.longitude);
        }

        if (isValidDestination) {
            allLatitudes.push(destinationCoords!.latitude);
            allLongitudes.push(destinationCoords!.longitude);
        }

        if (allLatitudes.length === 0) return null;

        const minLat = Math.min(...allLatitudes);
        const maxLat = Math.max(...allLatitudes);
        const minLng = Math.min(...allLongitudes);
        const maxLng = Math.max(...allLongitudes);

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
            longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
        };
    };

    const handleBack = () => {
        router.back();
    };

    const handleRefresh = () => {
        setHasFitted(false);
        setRouteCoords([]);
        setError(null);
        setRouteDetails(null);
        initializeMap();
    };

    const handleRefreshRouteDetails = () => {
        if (isValidOrigin && isValidDestination) {
            fetchRouteDetailsOnly();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={accent} />
                <ThemedText style={styles.loadingText}>Loading route...</ThemedText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={wp(15)} color={accent} />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: accent }]} onPress={handleRefresh}>
                    <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.backButton, { borderColor: accent }]} onPress={handleBack}>
                    <ThemedText style={[styles.backButtonText, { color: accent }]}>Go Back</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    const initialRegion = getInitialRegion();
    if (!initialRegion) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="location-off" size={wp(15)} color={accent} />
                <ThemedText style={styles.errorText}>No valid coordinates found</ThemedText>
                <TouchableOpacity style={[styles.backButton, { borderColor: accent }]} onPress={handleBack}>
                    <ThemedText style={[styles.backButtonText, { color: accent }]}>Go Back</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScreenWrapper fh={true}>
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={initialRegion}
                    provider="google"
                    customMapStyle={theme === "dark" ? darkMapStyle : undefined}
                    showsCompass={true}
                    showsScale={true}
                    onMapReady={() => {
                        console.log('🗺️ Map is ready!');
                        // Trigger fitting if we have route coords but haven't fitted yet
                        if (routeCoords.length > 0 && !hasFitted) {
                            setTimeout(() => {
                                if (mapRef.current) {
                                    console.log('Auto-fitting map after map ready');
                                    fitMapToRoute(routeCoords);
                                    setHasFitted(true);
                                }
                            }, 500);
                        }
                    }}
                >
                    {/* Origin Marker */}
                    {isValidOrigin && (
                        <Marker
                            coordinate={originCoords!}
                            title={loadData?.originCoordinates?.address || loadData?.fromLocation || loadData?.origin || "Origin"}
                            description="Load Origin"
                        >
                            <LinearGradient
                                colors={[accent, accent + 'CC']}
                                style={styles.markerCircle}
                            >
                                <FontAwesome name="dot-circle-o" size={24} color="white" />
                            </LinearGradient>
                        </Marker>
                    )}

                    {/* Destination Marker */}
                    {isValidDestination && (
                        <Marker
                            coordinate={destinationCoords!}
                            title={loadData?.destinationCoordinates?.address || loadData?.toLocation || loadData?.destination || destinationName || "Destination"}
                            description="Load Destination"
                        >
                            <LinearGradient
                                colors={[accent, accent + 'CC']}
                                style={styles.markerCircle}
                            >
                                <FontAwesome5 name="map-marker-alt" size={20} color="white" />
                            </LinearGradient>
                        </Marker>
                    )}

                    {/* Main Route Polyline */}
                    {routeCoords.length > 0 && (
                        <>
                            <Polyline
                                coordinates={routeCoords}
                                strokeColor={accent}
                                strokeWidth={6}
                            />
                            <Polyline
                                coordinates={routeCoords}
                                strokeColor={accent + '80'}
                                strokeWidth={3}
                            />
                        </>
                    )}

                    {/* Debug: Show route coords count */}
                    {/* {console.log('Rendering map - routeCoords length:', routeCoords.length)} */}

                </MapView>

                {/* Header */}
                <View style={[styles.header, { backgroundColor: background }]}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={wp(6)} color={textColor} />
                    </TouchableOpacity>
                    <View style={styles.headerTitle}>
                        <ThemedText type="subtitle" style={styles.headerTitleText}>
                            Load Route
                        </ThemedText>
                        {loadData && (
                            <ThemedText type="tiny" style={styles.headerSubtitle}>
                                {loadData.companyName}
                            </ThemedText>
                        )}
                    </View>
                    <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
                        <Ionicons name="refresh" size={wp(6)} color={textColor} />
                    </TouchableOpacity>
                </View>

                {/* Route Details Overlay */}
                {showDetails && (routeDetails || loadData) && (
                    <View style={[styles.detailsOverlay, { backgroundColor: background }]}>
                        <TouchableOpacity
                            style={styles.detailsToggle}
                            onPress={() => setShowDetails(!showDetails)}
                        >
                            <Ionicons
                                name={showDetails ? "chevron-down" : "chevron-up"}
                                size={wp(5)}
                                color={icon}
                            />
                        </TouchableOpacity>

                        <View style={styles.detailsContent}>
                            {loadData && (
                                <View style={styles.loadInfo}>
                                    <ThemedText type="defaultSemiBold" style={styles.loadTitle}>
                                        {loadData.typeofLoad}
                                    </ThemedText>
                                    <ThemedText type="tiny" style={styles.loadRoute}>
                                        {loadData?.originCoordinates?.address || loadData?.fromLocation || loadData?.origin || "Origin"} → {loadData?.destinationCoordinates?.address || loadData?.toLocation || loadData?.destination || "Destination"}
                                    </ThemedText>
                                    <ThemedText type="tiny" style={styles.loadRate}>
                                        Rate: {loadData.currency} {loadData.rate} {loadData.model}
                                    </ThemedText>
                                </View>
                            )}

                            {/* Route Details */}
                            <View style={styles.routeInfoContainer}>
                                <ThemedText type="defaultSemiBold" style={[styles.routeTitle, { color: accent }]}>
                                    Route
                                </ThemedText>

                                <View style={styles.routeInfo}>
                                    {/* Distance */}
                                    <View style={styles.routeDetailItem}>
                                        <FontAwesome5 name="route" size={wp(4)} color={accent} />
                                        <ThemedText type="tiny" style={styles.routeDetailText}>
                                            {routeDetails?.distance || loadData?.distance || 'N/A'}
                                        </ThemedText>
                                    </View>

                                    {/* Duration */}
                                    <View style={styles.routeDetailItem}>
                                        <FontAwesome5 name="clock" size={wp(4)} color={accent} />
                                        <ThemedText type="tiny" style={styles.routeDetailText}>
                                            {routeDetails?.duration || loadData?.duration || 'N/A'}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Loading state */}
                                {routeDetailsLoading && (
                                    <ThemedText type="tiny" style={styles.distanceInfo}>
                                        Loading route details...
                                    </ThemedText>
                                )}
                            </View>

                            {/* Alternative routes section removed - simplified UI */}

                            {/* Manual refresh buttons */}
                            {!routeDetailsLoading && isValidOrigin && isValidDestination && (
                                <TouchableOpacity
                                    style={styles.refreshButton}
                                    onPress={handleRefreshRouteDetails}
                                >
                                    <Ionicons name="refresh" size={wp(4)} color={accent} />
                                </TouchableOpacity>
                            )}
                            {!routeDetails && !routeDetailsLoading && isValidOrigin && isValidDestination && (
                                <TouchableOpacity
                                    style={[styles.getDetailsButton, { backgroundColor: accent }]}
                                    onPress={handleRefreshRouteDetails}
                                >
                                    <ThemedText style={styles.getDetailsButtonText}>Get Route Details</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Zoom Controls */}
                <View style={styles.zoomControls}>
                    <TouchableOpacity
                        style={[styles.zoomButton, { backgroundColor: background }]}
                        onPress={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    ...mapRef.current.props.initialRegion!,
                                    latitudeDelta: mapRef.current.props.initialRegion!.latitudeDelta * 0.5,
                                    longitudeDelta: mapRef.current.props.initialRegion!.longitudeDelta * 0.5,
                                }, 1000);
                            }
                        }}
                    >
                        <Ionicons name="add" size={wp(5)} color={accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.zoomButton, { backgroundColor: background }]}
                        onPress={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    ...mapRef.current.props.initialRegion!,
                                    latitudeDelta: mapRef.current.props.initialRegion!.latitudeDelta * 2,
                                    longitudeDelta: mapRef.current.props.initialRegion!.longitudeDelta * 2,
                                }, 1000);
                            }
                        }}
                    >
                        <Ionicons name="remove" size={wp(5)} color={accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.zoomButton, { backgroundColor: background }]}
                        onPress={() => {
                            if (mapRef.current && routeCoords.length > 0) {
                                fitMapToRoute(routeCoords);
                            }
                        }}
                    >
                        <Ionicons name="locate" size={wp(5)} color={accent} />
                    </TouchableOpacity>
                </View>

                {/* Toggle Details Button when hidden */}
                {!showDetails && (
                    <TouchableOpacity
                        style={[styles.toggleButton, { backgroundColor: accent }]}
                        onPress={() => setShowDetails(true)}
                    >
                        <Ionicons name="information-circle" size={wp(6)} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: wp(4),
        fontSize: wp(4),
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: wp(8),
        backgroundColor: '#f5f5f5',
    },
    errorText: {
        fontSize: wp(4),
        textAlign: 'center',
        marginVertical: wp(4),
        color: '#666',
    },
    retryButton: {
        paddingVertical: wp(3),
        paddingHorizontal: wp(6),
        borderRadius: wp(2),
        marginVertical: wp(2),
    },
    retryButtonText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    backButton: {
        paddingVertical: wp(3),
        paddingHorizontal: wp(6),
        borderRadius: wp(2),
        borderWidth: 1,
        marginVertical: wp(2),
    },
    backButtonText: {
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    header: {
        position: 'absolute',
        top: wp(8),
        left: wp(4),
        right: wp(4),
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(3),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    headerButton: {
        padding: wp(2),
    },
    headerTitle: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitleText: {
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#666',
        marginTop: wp(1),
    },
    detailsOverlay: {
        position: 'absolute',
        bottom: wp(8),
        left: wp(4),
        right: wp(4),
        borderRadius: wp(3),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    detailsToggle: {
        alignItems: 'center',
        paddingVertical: wp(2),
    },
    detailsContent: {
        paddingHorizontal: wp(4),
        paddingBottom: wp(4),
    },
    loadInfo: {
        marginBottom: wp(3),
    },
    loadTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    loadRoute: {
        color: '#666',
        marginVertical: wp(1),
    },
    loadRate: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    routeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    routeInfoContainer: {
        marginTop: wp(3),
        gap: wp(1),
    },
    distanceInfo: {
        color: '#666',
        fontSize: wp(3.5),
        fontWeight: '500',
    },
    routeTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    routeDetailItem: {
        alignItems: 'center',
        flex: 1,
    },
    routeDetailText: {
        marginTop: wp(1),
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    refreshButton: {
        position: 'absolute',
        top: -wp(2),
        right: -wp(2),
        padding: wp(2),
        borderRadius: wp(3),
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    getDetailsButton: {
        marginTop: wp(3),
        paddingVertical: wp(2.5),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    getDetailsButtonText: {
        color: 'white',
        fontSize: wp(3.5),
        fontWeight: 'bold',
    },
    toggleButton: {
        position: 'absolute',
        bottom: wp(8),
        right: wp(4),
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    markerCircle: {
        padding: 8,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    zoomControls: {
        position: 'absolute',
        right: wp(4),
        top: wp(20),
        flexDirection: 'column',
        gap: wp(2),
    },
    zoomButton: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    // Alternative route styles removed - no longer needed
});
