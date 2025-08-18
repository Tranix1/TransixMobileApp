import React from "react";
import { View, Text, StyleSheet,Modal, TouchableOpacity } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

export type SelectLocationProp = {
  description: string;
  placeId: string;
  latitude: number;
  longitude: number;
  country: string | null;
  city: string | null;
};

interface LocationPickerProps {
  pickLocation: SelectLocationProp | null;
  setPickLocation: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
  pickSecLoc: SelectLocationProp | null;
  setPickSecLoc: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
  setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
  dspShowMap: boolean;
}

export function LocationPicker({
  pickLocation,
  setPickLocation,
  pickSecLoc,
  setPickSecLoc,
  setShowMap,
  dspShowMap ,

}: LocationPickerProps) {

  const handlePickLocation = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (!pickLocation) {
      setPickLocation({
        description: "First Location",
        placeId: Date.now().toString(),
        latitude,
        longitude,
        country: null,
        city: null,
      });
    } else if (!pickSecLoc) {
      setPickSecLoc({
        description: "Second Location",
        placeId: Date.now().toString(),
        latitude,
        longitude,
        country: null,
        city: null,
      });
    }
  };

  return (
            <Modal transparent statusBarTranslucent visible={dspShowMap} animationType="fade"> 
    
    <View style={styles.container}>
      <View style={styles.infoBox}>
      <TouchableOpacity onPress={() => setShowMap(false)}>
        <Text style={{ color: 'blue', textAlign: 'right' }}>Close Map</Text>
      </TouchableOpacity>
      
        <Text style={styles.label}>
          First Location: {pickLocation ? `${pickLocation.latitude}, ${pickLocation.longitude}` : "Not selected"}
        </Text>
        <Text style={styles.label}>
          Second Location: {pickSecLoc ? `${pickSecLoc.latitude}, ${pickSecLoc.longitude}` : "Not selected"}
        </Text>
      </View>
      <MapView
        style={styles.map}
        onPress={handlePickLocation}
        initialRegion={{
          latitude: -17.8252,
          longitude: 31.0335,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {pickLocation && (
          <Marker coordinate={{ latitude: pickLocation.latitude, longitude: pickLocation.longitude }} />
        )}
        {pickSecLoc && (
          <Marker coordinate={{ latitude: pickSecLoc.latitude, longitude: pickSecLoc.longitude }} />
        )}
      </MapView>
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBox: {
    padding: 10,
    backgroundColor: "white",
    elevation: 3,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  map: {
    flex: 1,
  },
});