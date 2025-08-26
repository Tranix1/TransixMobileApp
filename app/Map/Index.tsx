import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { decodePolyline, LatLng } from "@/Utilities/decodePolyline";
import { useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location';
import { ThemedText } from "@/components/ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";

export default function Map() {
  const { destinationLati, destinationLongi } = useLocalSearchParams();

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [currentLocErrorMsg, setCurrentLocErrorMsg] = useState<string | null>(null);

  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    })();
  }, []);

  const destinationCoords = {
    latitude: parseFloat(destinationLati as string),
    longitude: parseFloat(destinationLongi as string)
  };

  const originCoords = currentLocation?.coords ? {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude
  } : null;

  useEffect(() => {
    async function fetchRoute() {
      const GOOGLE_MAPS_API_KEY = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";
      const origin = `${originCoords?.latitude},${originCoords?.longitude}`;
      const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.status === "OK") {
          const polyline = json.routes[0].overview_polyline.points;
          const points: LatLng[] = decodePolyline(polyline);
              const distance = json.distance.text;
        const duration = json.duration.text;
          setRouteCoords(points);
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
        <ThemedText style={styles.loadingText}>Fetching your location...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        provider="google"
          customMapStyle={darkMapStyle} // 👈 add this
      >
        {originCoords && (
          <Marker coordinate={originCoords} title="Your Current Location" pinColor="blue" />
        )}
        <Marker coordinate={destinationCoords} title="Destination" />
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#007bff" strokeWidth={4} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  }
});
