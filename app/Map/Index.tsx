import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { decodePolyline, LatLng } from "@/Utilities/decodePolyline";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { ThemedText } from "@/components/ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Map() {
  const { destinationLati, destinationLongi } = useLocalSearchParams();

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [currentLocErrorMsg, setCurrentLocErrorMsg] = useState<string | null>(
    null
  );

  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [hasFitted, setHasFitted] = useState(false); // ✅ prevents re-snapping
  const mapRef = useRef<MapView>(null);
  const theme = useColorScheme() ?? "light";

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

  const destinationCoords = {
    latitude: parseFloat(destinationLati as string),
    longitude: parseFloat(destinationLongi as string),
  };

  const originCoords = currentLocation?.coords
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    : null;

  useEffect(() => {
    async function fetchRoute() {
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
    if (originCoords) {
      fetchRoute();
    }
  }, [originCoords]);

  const getInitialRegion = () => {
    if (!originCoords) return null;

    const allLatitudes = [originCoords.latitude, destinationCoords.latitude];
    const allLongitudes = [originCoords.longitude, destinationCoords.longitude];
    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5,
      longitudeDelta: (maxLng - minLng) * 1.5,
    };
  };

  const initialRegion = getInitialRegion();

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          Fetching your location...
        </ThemedText>
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
          <Marker coordinate={originCoords} title="Your Current Location">
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              style={styles.markerCircle}
            >
              <FontAwesome name="dot-circle-o" size={24} color="white" />
            </LinearGradient>
          </Marker>
        )}

        <Marker coordinate={destinationCoords} title="Destination">
          <LinearGradient
            colors={["#43A047", "#2E7D32"]}
            style={styles.markerCircle}
          >
            <FontAwesome5 name="gas-pump" size={20} color="white" />
          </LinearGradient>
        </Marker>

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
});
