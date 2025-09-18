import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity,TouchableHighlight } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { ThemedText } from "./ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";
import ScreenWrapper from "./ScreenWrapper";
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
  pickDestinationLoc: SelectLocationProp | null;
  setPickDestinationLoc: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
  setShowMap: React.Dispatch<React.SetStateAction<boolean>>;
  dspShowMap: boolean;
}



const GOOGLE_API_KEY = "AIzaSyACiyh-wyKUcTXP0w9FU_N00l7L1ahZP8w";

export const LocationPicker: React.FC<LocationPickerProps> = ({
  pickOriginLocation: pickLocation,
  setPickOriginLocation: setPickLocation,
  pickDestinationLoc: pickSecLoc,
  setPickDestinationLoc: setPickSecLoc,
  setShowMap,
  dspShowMap,
}) => {
  const icon = useThemeColor('icon');

const backgroundLight = useThemeColor('backgroundLight');

  // Helper: fetch address from lat/lng
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

        const finalAddress =
          formattedAddress.includes("Unnamed Road") || !formattedAddress
            ? [city, country].filter(Boolean).join(", ")
            : formattedAddress;

        return { formattedAddress: finalAddress, city, country };
      }

      return { formattedAddress: "Address not found", city: null, country: null };
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
        <ScreenWrapper>
        <View style={styles.container}>
          {/* Top Info Box */}



     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), paddingVertical: wp(1), borderColor: icon }}>
                    <TouchableHighlight
                        underlayColor={'#7f7f7f1c'}
                    onPress={() => setShowMap(false)}

                        style={{ padding: wp(2.5), marginLeft: wp(2), borderRadius: wp(5) }}
                    >
                        <Ionicons name='chevron-back' size={wp(5)} color={icon} />
                    </TouchableHighlight>
                    <ThemedText style={{ lineHeight: 40 }} type='defaultSemiBold'>Pick On Map</ThemedText>
                </View>
            </View>



          <View style={styles.infoBox}>
                       <ThemedText style={styles.instructions}>Tap 3 times to select</ThemedText>

            <View style={styles.locationsContainer}>
              <ThemedText style={styles.label}>
                First Location: {pickLocation ? pickLocation.description : "Not selected"}
              </ThemedText>
              <ThemedText style={styles.label}>
                Second Location: {pickSecLoc ? pickSecLoc.description : "Not selected"}
              </ThemedText>
            </View>
             <TouchableOpacity style={styles.doneButton} onPress={() => {
    // handle done action
    setShowMap(false);
  }}>
    <ThemedText style={styles.doneButtonText}>Done</ThemedText>
  </TouchableOpacity>
          </View>

          {/* Map */}
          <MapView
            style={styles.map}
            customMapStyle={darkMapStyle}
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
    </ScreenWrapper>
      </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoBox: {
    padding: 12,
    elevation: 5,
    zIndex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007aff",
    marginLeft: 6,
  },
  instructions: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007aff",
    marginBottom: 6,
    alignSelf:"center"
  },
  locationsContainer: {
    marginTop: 4,
  },
  label: { 
    fontSize: 14, 
    fontWeight: "500",
    marginVertical: 2,
  },
  map: { flex: 1 },
  doneButton: {
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor:  "#0d9488", // professional blue
  paddingVertical: 6,
  paddingHorizontal: 17,
  borderRadius: 6,
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 2,
},
doneButtonText: {
  color: "white",
  fontWeight: "600",
  fontSize: 14,
},
});
