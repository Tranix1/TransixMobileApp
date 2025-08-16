import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Map() {
  const harareRegion = {
    latitude: -17.824858,
    longitude: 31.053028,
    latitudeDelta: 0.0922, // The difference between min and max latitude. Determines zoom level.
    longitudeDelta: 0.0421, // The difference between min and max longitude.
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={harareRegion} // Use initialRegion to set the map's starting position and zoom
        provider="google" // This ensures Google Maps is used on both Android and iOS
      >
        {/* You can add a marker to show a specific location */}
        <Marker coordinate={harareRegion} title="Harare" />
      </MapView>
    </View>
  );
}