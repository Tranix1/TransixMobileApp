import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableHighlight, Animated, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";
import { ThemedText } from "./ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";
import ScreenWrapper from "./ScreenWrapper";
import Heading from "./Heading";
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
export type SelectLocationProp = {
  description: string;
  placeId: string;
  latitude: number;
  longitude: number;
  country: string | null;
  city: string | null;
};


interface LocationPickerProps {
  pickOriginLocation: SelectLocationProp | null;
  setPickOriginLocation: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
  pickDestinationLoc?: SelectLocationProp | null;
  setPickDestinationLoc?: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
  setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
  dspShowMap: boolean;
  mode?: 'single' | 'dual'; // New prop to determine if it's single or dual location selection
}



const GOOGLE_API_KEY = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";

export const LocationPicker: React.FC<LocationPickerProps> = ({
  pickOriginLocation: pickLocation,
  setPickOriginLocation: setPickLocation,
  pickDestinationLoc: pickSecLoc,
  setPickDestinationLoc: setPickSecLoc,
  setShowMap,
  dspShowMap,
  mode = 'dual', // Default to dual mode for backward compatibility
}) => {
  const icon = useThemeColor('icon');
  const backgroundLight = useThemeColor('backgroundLight');
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');

  // State for pointer-based selection
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number, longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -17.8252,
    longitude: 31.0335,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });
  const [loading, setLoading] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Helper: Get user's current location
  const getUserCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Location permission denied');
        setLocationPermissionGranted(false);
        // Keep default map region if permission denied
        return;
      }

      setLocationPermissionGranted(true);

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      console.log('User location:', { latitude, longitude });

      setUserLocation({ latitude, longitude });

      // Update map region to zoom to user location
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01, // Zoomed in view
        longitudeDelta: 0.01,
      };

      setMapRegion(newRegion);
      setSelectedCoordinate({ latitude, longitude });

      // Animate map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

    } catch (error) {
      console.error('Error getting user location:', error);
      setLocationPermissionGranted(false);
      // Keep default map region if error occurs
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's current location when map opens
  useEffect(() => {
    if (dspShowMap) {
      getUserCurrentLocation();
    }
  }, [dspShowMap, getUserCurrentLocation]);

  // Helper: fetch address from lat/lng with better error handling
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      console.log(`Geocoding coordinates: ${latitude}, ${longitude}`);

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      console.log('Geocoding URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Geocoding response:', data);

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log('First result:', result);

        const formattedAddress = result.formatted_address || "";
        console.log('Formatted address:', formattedAddress);

        // Extract address components
        let city: string | null = null;
        let country: string | null = null;
        let state: string | null = null;
        let streetNumber: string | null = null;
        let route: string | null = null;
        let neighborhood: string | null = null;
        let sublocality: string | null = null;

        if (result.address_components) {
          result.address_components.forEach((component: any) => {
            const types = component.types || [];
            if (types.includes("locality")) city = component.long_name;
            if (types.includes("country")) country = component.long_name;
            if (types.includes("administrative_area_level_1")) state = component.long_name;
            if (types.includes("street_number")) streetNumber = component.long_name;
            if (types.includes("route")) route = component.long_name;
            if (types.includes("neighborhood")) neighborhood = component.long_name;
            if (types.includes("sublocality")) sublocality = component.long_name;
          });
        }

        console.log('Address components:', { city, state, country, streetNumber, route, neighborhood, sublocality });

        // Build address with multiple fallback strategies
        let finalAddress = formattedAddress;

        // Strategy 1: Use formatted address if it's good
        if (formattedAddress && !formattedAddress.includes("Unnamed") && formattedAddress.length > 10) {
          console.log('Using formatted address:', finalAddress);
          return { formattedAddress: finalAddress, city, country };
        }

        // Strategy 2: Build from components
        const addressParts: string[] = [];
        if (streetNumber) addressParts.push(streetNumber);
        if (route) addressParts.push(route);
        if (neighborhood) addressParts.push(neighborhood);
        if (sublocality) addressParts.push(sublocality);
        if (city) addressParts.push(city);
        if (state) addressParts.push(state);
        if (country) addressParts.push(country);

        if (addressParts.length > 0) {
          finalAddress = addressParts.join(", ");
          console.log('Using component-based address:', finalAddress);
          return { formattedAddress: finalAddress, city, country };
        }

        // Strategy 3: Basic city, state, country
        const basicParts = [city, state, country].filter(Boolean);
        if (basicParts.length > 0) {
          finalAddress = basicParts.join(", ");
          console.log('Using basic address:', finalAddress);
          return { formattedAddress: finalAddress, city, country };
        }

        // Strategy 4: Try alternative geocoding with different parameters
        console.log('Trying alternative geocoding...');
        const altUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&result_type=locality|administrative_area_level_1|country`;
        const altResponse = await fetch(altUrl);
        const altData = await altResponse.json();

        if (altData.status === "OK" && altData.results && altData.results.length > 0) {
          const altResult = altData.results[0];
          const altFormatted = altResult.formatted_address || "";
          if (altFormatted && altFormatted.length > 5) {
            console.log('Using alternative geocoding result:', altFormatted);
            return { formattedAddress: altFormatted, city, country };
          }
        }
      }

      // Last resort - coordinates
      console.log('Falling back to coordinates');
      return {
        formattedAddress: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        city: null,
        country: null
      };
    } catch (error) {
      console.error("Error fetching address:", error);
      return {
        formattedAddress: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        city: null,
        country: null
      };
    } finally {
      setLoading(false);
    }
  };

  // Handle map press to update selected coordinate
  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Update selected coordinate
    setSelectedCoordinate({ latitude, longitude });

    // Start pulse animation for feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle confirm selection
  const handleConfirmSelection = async () => {
    if (!selectedCoordinate) return;

    try {
      console.log('LocationPicker - confirming selection:', selectedCoordinate);
      const { latitude, longitude } = selectedCoordinate;
      const { formattedAddress, city, country } = await getAddressFromCoords(latitude, longitude);

      console.log('LocationPicker - geocoding result:', { formattedAddress, city, country });

      const locationData = {
        description: formattedAddress,
        placeId: Date.now().toString(),
        latitude,
        longitude,
        country,
        city,
      };

      console.log('LocationPicker - setting location data:', locationData);

      if (mode === 'single') {
        // Single mode: always update the origin location
        setPickLocation(locationData);
      } else {
        // Dual mode: check which location to update
        if (!pickLocation) {
          setPickLocation(locationData);
        } else if (!pickSecLoc) {
          setPickSecLoc?.(locationData);
        }
      }

      // Reset selection state
      setSelectedCoordinate(null);
    } catch (error) {
      console.error('LocationPicker - error in confirm selection:', error);
      Alert.alert('Error', 'Failed to process location selection. Please try again.');
    }
  };

  // Handle region change to update selected coordinate
  const handleRegionChange = (region: Region) => {
    setMapRegion(region);
    // Update selected coordinate to center of map
    setSelectedCoordinate({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  return (
    <Modal transparent statusBarTranslucent visible={dspShowMap} animationType="fade">
      <ScreenWrapper>
        <View style={styles.container}>
          {/* Header */}
          <Heading
            page="Pick On Map"
            overrideBack={() => setShowMap(false)}
          />


          {/* Instructions */}
          <View style={[styles.instructionsContainer, { backgroundColor: backgroundLight }]}>
            <ThemedText style={[styles.instructions, { color: accent }]}>
              {mode === 'single'
                ? "Move the map to position the pointer, then tap the checkmark to select location"
                : "Move the map to position the pointer, then tap the checkmark to select"
              }
            </ThemedText>
          </View>

          {/* Location Status */}
          <View style={[styles.statusContainer, { backgroundColor: backgroundLight }]}>
            {mode === 'single' ? (
              <View style={styles.locationStatus}>
                <ThemedText style={[styles.statusLabel, { color: icon }]}>
                  Location: {pickLocation ? pickLocation.description : "Not selected"}
                </ThemedText>
              </View>
            ) : (
              <>
                <View style={styles.locationStatus}>
                  <ThemedText style={[styles.statusLabel, { color: icon }]}>
                    Origin: {pickLocation ? pickLocation.description : "Not selected"}
                  </ThemedText>
                </View>
                <View style={styles.locationStatus}>
                  <ThemedText style={[styles.statusLabel, { color: icon }]}>
                    Destination: {pickSecLoc ? pickSecLoc.description : "Not selected"}
                  </ThemedText>
                </View>
              </>
            )}
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              customMapStyle={darkMapStyle}
              onPress={handleMapPress}
              onRegionChange={handleRegionChange}
              initialRegion={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {/* Existing markers */}
              {pickLocation && (
                <Marker
                  coordinate={{ latitude: pickLocation.latitude, longitude: pickLocation.longitude }}
                  title={mode === 'single' ? "Selected Location" : "Origin"}
                  description={pickLocation.description}
                >
                  <View style={[styles.markerContainer, { backgroundColor: accent }]}>
                    <Ionicons name="location" size={wp(4)} color="white" />
                  </View>
                </Marker>
              )}
              {mode === 'dual' && pickSecLoc && (
                <Marker
                  coordinate={{ latitude: pickSecLoc.latitude, longitude: pickSecLoc.longitude }}
                  title="Destination"
                  description={pickSecLoc.description}
                >
                  <View style={[styles.markerContainer, { backgroundColor: accent }]}>
                    <Ionicons name="flag" size={wp(4)} color="white" />
                  </View>
                </Marker>
              )}
            </MapView>

            {/* Center Pointer */}
            <View style={styles.centerPointerContainer}>
              <Animated.View style={[styles.centerPointer, { transform: [{ scale: pulseAnim }] }]}>
                <View style={[styles.pointerOuter, { borderColor: accent }]}>
                  <View style={[styles.pointerInner, { backgroundColor: accent }]}>
                    <Ionicons name="location" size={wp(3)} color="white" />
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* My Location Button */}
            {locationPermissionGranted && userLocation && (
              <View style={styles.myLocationButtonContainer}>
                <TouchableOpacity
                  style={[styles.myLocationButton, { backgroundColor: background }]}
                  onPress={() => {
                    if (mapRef.current && userLocation) {
                      const region = {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      };
                      mapRef.current.animateToRegion(region, 1000);
                      setSelectedCoordinate(userLocation);
                    }
                  }}
                >
                  <Ionicons name="locate" size={wp(5)} color={accent} />
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm Button */}
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: accent }]}
                onPress={handleConfirmSelection}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="checkmark" size={wp(5)} color="white" />
                )}
              </TouchableOpacity>
              <ThemedText style={[styles.confirmButtonLabel, { color: accent }]}>
                Select
              </ThemedText>
            </View>
          </View>

          {/* Done Button */}
          <View style={styles.doneButtonContainer}>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: accent }]}
              onPress={() => setShowMap(false)}
            >
              <ThemedText style={styles.doneButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionsContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(3),
    alignItems: 'center',
  },
  instructions: {
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: wp(1),
  },
  statusContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    marginHorizontal: wp(4),
    borderRadius: wp(2),
    marginBottom: wp(2),
  },
  locationStatus: {
    marginVertical: wp(1),
  },
  statusLabel: {
    fontSize: wp(3.5),
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerPointerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -wp(6),
    marginLeft: -wp(6),
    zIndex: 1000,
  },
  centerPointer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerOuter: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  pointerInner: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonContainer: {
    position: 'absolute',
    bottom: wp(4),
    left: '50%',
    marginLeft: -wp(8), // Center the button (half of button width + label width)
    zIndex: 1000,
    alignItems: 'center',
  },
  confirmButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  confirmButtonLabel: {
    fontSize: wp(3),
    fontWeight: '600',
    marginTop: wp(1),
    textAlign: 'center',
  },
  markerContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  doneButtonContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(3),
    paddingBottom: wp(6),
  },
  doneButton: {
    paddingVertical: wp(3),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  doneButtonText: {
    color: 'white',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  myLocationButtonContainer: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
  },
  myLocationButton: {
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
});
