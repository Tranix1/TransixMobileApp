import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
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

const GOOGLE_API_KEY = "YOUR_API_KEY"; // replace with your Google Maps API key

export function LocationPicker({
  pickLocation,
  setPickLocation,
  pickSecLoc,
  setPickSecLoc,
  setShowMap,
  dspShowMap,
}: LocationPickerProps) {
  // helper: fetch address from lat/lng
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const firstResult = data.results[0];
        const formattedAddress = firstResult.formatted_address || "Unknown address";

        let city: string | null = null;
        let country: string | null = null;

        firstResult.address_components.forEach((c: any) => {
          if (c.types.includes("locality")) city = c.long_name;
          if (c.types.includes("country")) country = c.long_name;
        });

        // fallback: if only city/country available
        const finalAddress =
          formattedAddress.includes("Unnamed Road") || !formattedAddress
            ? [city, country].filter(Boolean).join(", ")
            : formattedAddress;

        return { formattedAddress: finalAddress, city, country };
      } else {
        return { formattedAddress: "Address not found", city: null, country: null };
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return { formattedAddress: "Error fetching address", city: null, country: null };
    }
  };

  const handlePickLocation = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (!pickLocation) {
      const { formattedAddress, city, country } = await getAddressFromCoords(latitude, longitude);
      setPickLocation({
        description: formattedAddress,
        placeId: Date.now().toString(),
        latitude,
        longitude,
        country,
        city,
      });
    } else if (!pickSecLoc) {
      const { formattedAddress, city, country } = await getAddressFromCoords(latitude, longitude);
      setPickSecLoc({
        description: formattedAddress,
        placeId: Date.now().toString(),
        latitude,
        longitude,
        country,
        city,
      });
    }
  };

  return (
    <Modal transparent statusBarTranslucent visible={dspShowMap} animationType="fade">
      <View style={styles.container}>
        <View style={styles.infoBox}>
          <TouchableOpacity onPress={() => setShowMap(false)}>
            <Text style={{ color: "blue", textAlign: "right" }}>Close Map</Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            First Location:{" "}
            {pickLocation ? `${pickLocation.description}` : "Not selected"}
          </Text>
          <Text style={styles.label}>
            Second Location:{" "}
            {pickSecLoc ? `${pickSecLoc.description}` : "Not selected"}
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
            <Marker
              coordinate={{ latitude: pickLocation.latitude, longitude: pickLocation.longitude }}
              title="First Location"
              description={pickLocation.description}
            />
          )}
          {pickSecLoc && (
            <Marker
              coordinate={{ latitude: pickSecLoc.latitude, longitude: pickSecLoc.longitude }}
              title="Second Location"
              description={pickSecLoc.description}
            />
          )}
        </MapView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBox: {
    padding: 10,
    backgroundColor: "white",
    elevation: 3,
    zIndex: 1,
  },
  label: { fontSize: 14, fontWeight: "500" },
  map: { flex: 1 },
});
