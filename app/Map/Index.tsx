import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function Map() {
  const beiraCoords = {
    latitude: -19.8458,
    longitude: 34.8427,
  };

  const harareCoords = {
    latitude: -17.8252,
    longitude: 31.0335,
  };

  // Define the route coordinates for the polyline
  const routeCoords = [
    beiraCoords,
    // Add intermediate points for a more accurate route if needed
    { latitude: -18.78, longitude: 33.00 },
    { latitude: -18.00, longitude: 31.50 },
    harareCoords,
  ];

  // Calculate the initial region to fit both points
  const getInitialRegion = () => {
    const allLatitudes = [beiraCoords.latitude, harareCoords.latitude];
    const allLongitudes = [beiraCoords.longitude, harareCoords.longitude];
    
    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5, // Add padding
      longitudeDelta: (maxLng - minLng) * 1.5, // Add padding
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={getInitialRegion()}
        provider="google"
      >
        <Marker coordinate={beiraCoords} title="Beira" />
        <Marker coordinate={harareCoords} title="Harare" />

        <Polyline
          coordinates={routeCoords}
          strokeColor="#007bff"
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});