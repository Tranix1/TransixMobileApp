import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=Beira&destination=Harare&key=AIzaSyACiyh-wyKUcTXP0w9FU_N00l7L1ahZP8w4`)
  .then(res => res.json())
  .then(data => { 
    alert(`heyy u goo  ${data.routes[0].legs[0].distance.text} and it will take you ${data.routes[0].legs[0].duration.text} to get there`);
})
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
