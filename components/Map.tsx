import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -17.8252,   // Harare latitude
          longitude: 31.0335,   // Harare longitude
          latitudeDelta: 10,    // Zoom level
          longitudeDelta: 10,
        }}
      >
        {/* Optional marker */}
        <Marker
          coordinate={{ latitude: -17.8252, longitude: 31.0335 }}
          title="Harare"
          description="Starting point"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
