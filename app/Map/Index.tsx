import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { decodePolyline, LatLng } from "@/Utilities/decodePolyline";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FuelPaymentModal } from "@/payments";
import { useThemeColor } from "@/hooks/useThemeColor";
import { hp, wp } from "@/constants/common";

export default function Map() {
  const {
    destinationLati,
    destinationLongi,
    originLati,
    originLongi,
    routePolyline,
    bounds,
    distance,
    duration,
    durationInTraffic
  } = useLocalSearchParams();

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [currentLocErrorMsg, setCurrentLocErrorMsg] = useState<string | null>(
    null
  );

  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [hasFitted, setHasFitted] = useState(false); // ✅ prevents re-snapping
  const mapRef = useRef<MapView>(null);
  const theme = useColorScheme() ?? "light";
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedFuelStation, setSelectedFuelStation] = useState<any>(null);

  const accent = useThemeColor('accent');
  const background = useThemeColor('background');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCurrentLocErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    })();
  }, []);

  const destinationCoords = React.useMemo(() => ({
    latitude: destinationLati ? parseFloat(destinationLati as string) : 0,
    longitude: destinationLongi ? parseFloat(destinationLongi as string) : 0,
  }), [destinationLati, destinationLongi]);

  const providedOriginCoords = React.useMemo(() => ({
    latitude: originLati ? parseFloat(originLati as string) : 0,
    longitude: originLongi ? parseFloat(originLongi as string) : 0,
  }), [originLati, originLongi]);

  // Validate destination coordinates
  const isValidDestination = React.useMemo(() =>
    !isNaN(destinationCoords.latitude) &&
    !isNaN(destinationCoords.longitude) &&
    destinationCoords.latitude !== 0 &&
    destinationCoords.longitude !== 0,
    [destinationCoords.latitude, destinationCoords.longitude]
  );

  // Validate provided origin coordinates
  const isValidProvidedOrigin = React.useMemo(() =>
    !isNaN(providedOriginCoords.latitude) &&
    !isNaN(providedOriginCoords.longitude) &&
    providedOriginCoords.latitude !== 0 &&
    providedOriginCoords.longitude !== 0,
    [providedOriginCoords.latitude, providedOriginCoords.longitude]
  );

  const originCoords = React.useMemo(() => {
    // Use provided origin coordinates if available and valid
    if (isValidProvidedOrigin) {
      return providedOriginCoords;
    }
    // Fall back to current location
    return currentLocation?.coords
      ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
      : null;
  }, [isValidProvidedOrigin, providedOriginCoords, currentLocation?.coords?.latitude, currentLocation?.coords?.longitude]);

  useEffect(() => {
    async function fetchRoute() {
      // If route data is already provided, use it instead of calling API
      if (routePolyline) {
        let points: LatLng[] = [];
        try {
          points = decodePolyline(routePolyline as string);
          setRouteCoords(points);
        } catch (error) {
          console.error('Error decoding polyline:', error);
          setRouteCoords([]);
        }

        // ✅ Fit map only once using provided bounds or coordinates
        if (mapRef.current && points.length > 0 && !hasFitted) {
          try {
            if (bounds) {
              // Use provided bounds if available
              const boundsData = JSON.parse(bounds as string);
              if (boundsData.southwest && boundsData.northeast) {
                mapRef.current.fitToCoordinates(
                  [
                    { latitude: boundsData.southwest.lat, longitude: boundsData.southwest.lng },
                    { latitude: boundsData.northeast.lat, longitude: boundsData.northeast.lng }
                  ],
                  {
                    edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                    animated: true,
                  }
                );
              } else {
                throw new Error('Invalid bounds data');
              }
            } else {
              // Fallback to using route coordinates
              const coordsToFit = [destinationCoords, ...points];
              if (originCoords) {
                coordsToFit.unshift(originCoords);
              }
              mapRef.current.fitToCoordinates(coordsToFit, {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            }
            setHasFitted(true);
          } catch (error) {
            console.error('Error fitting map to coordinates:', error);
            // Fallback to basic coordinates
            if (isValidDestination) {
              mapRef.current.fitToCoordinates([destinationCoords], {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            }
            setHasFitted(true);
          }
        }
        return;
      }

      // Only call API if route data is not provided
      const GOOGLE_MAPS_API_KEY =
        "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";
      const origin = `${originCoords?.latitude},${originCoords?.longitude}`;
      const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.status === "OK") {
          const polyline = json.routes[0].overview_polyline.points;
          const points: LatLng[] = decodePolyline(polyline);
          setRouteCoords(points);

          // ✅ Fit map only once
          if (mapRef.current && points.length > 0 && !hasFitted) {
            mapRef.current.fitToCoordinates(
              [originCoords!, destinationCoords, ...points],
              {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              }
            );
            setHasFitted(true);
          }
        } else {
          console.error("Directions API error:", json.status);
          setCurrentLocErrorMsg("Could not find a route.");
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
        setCurrentLocErrorMsg("Failed to fetch route.");
      }
    }
    if (originCoords || routePolyline) {
      fetchRoute();
    }
  }, [originCoords?.latitude, originCoords?.longitude, routePolyline, bounds]);

  const getInitialRegion = () => {
    if (!originCoords && !isValidDestination) return null;

    const allLatitudes = [];
    const allLongitudes = [];

    if (originCoords) {
      allLatitudes.push(originCoords.latitude);
      allLongitudes.push(originCoords.longitude);
    }

    if (isValidDestination) {
      allLatitudes.push(destinationCoords.latitude);
      allLongitudes.push(destinationCoords.longitude);
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

  const initialRegion = getInitialRegion();

  const handleFuelPayment = () => {
    // Create a mock fuel station for payment
    const mockFuelStation = {
      id: 'map-fuel-station',
      name: 'Fuel Station at Destination',
      location: {
        description: 'Destination Fuel Station',
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude,
        city: null,
        country: null,
      },
      fuelTypes: {
        diesel: { price: '1.50', available: true },
        petrol: { price: '1.45', available: true },
        other: { name: 'Premium', price: '1.60', available: true },
      },
      contactNumber: '+263 77 123 4567',
      operatingHours: '24/7',
      amenities: ['ATM', 'Restaurant', 'Restrooms'],
      description: 'Full-service fuel station with modern amenities',
      addedBy: 'system',
      addedAt: new Date(),
    };

    setSelectedFuelStation(mockFuelStation);
    setIsPaymentModalVisible(true);
  };

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          {currentLocErrorMsg || "Loading map data..."}
        </ThemedText>
        {!isValidDestination && (
          <ThemedText style={[styles.loadingText, { color: 'red', marginTop: 10 }]}>
            Invalid destination coordinates provided
          </ThemedText>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider="google"
        customMapStyle={theme === "dark" ? darkMapStyle : undefined}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {originCoords && (
          <Marker
            coordinate={originCoords}
            title={isValidProvidedOrigin ? "Load Origin" : "Your Current Location"}
          >
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              style={styles.markerCircle}
            >
              <FontAwesome name="dot-circle-o" size={24} color="white" />
            </LinearGradient>
          </Marker>
        )}

        {isValidDestination && (
          <Marker coordinate={destinationCoords} title="Destination">
            <LinearGradient
              colors={["#43A047", "#2E7D32"]}
              style={styles.markerCircle}
            >
              <FontAwesome5 name="gas-pump" size={20} color="white" />
            </LinearGradient>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <>
            <Polyline
              coordinates={routeCoords}
              strokeColor="rgba(30,144,255,1)"
              strokeWidth={6}
            />
            <Polyline
              coordinates={routeCoords}
              strokeColor="rgba(0,229,255,0.6)"
              strokeWidth={3}
            />
          </>
        )}
      </MapView>

      {/* Fuel Payment Button Overlay */}
      {isValidDestination && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, { backgroundColor: accent }]}
            onPress={handleFuelPayment}
          >
            <Ionicons name="card" size={wp(5)} color="white" />
            <ThemedText style={styles.paymentButtonText}>Pay for Fuel</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Fuel Payment Modal */}
      <FuelPaymentModal
        isVisible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        fuelStation={selectedFuelStation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
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
  paymentButtonContainer: {
    position: 'absolute',
    bottom: wp(10),
    left: wp(4),
    right: wp(4),
    alignItems: 'center',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(4),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
    gap: wp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
});
