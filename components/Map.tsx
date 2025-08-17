import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { FontAwesome5 } from "@expo/vector-icons";

type GoogleRoute = {
  polylineCoords: { latitude: number; longitude: number }[];
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
};

function decodePolyline(encoded: string) {
  let points: { latitude: number; longitude: number }[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b: number,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

export default function Map() {
  const [routes, setRoutes] = useState<GoogleRoute[]>([]);
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: -17.8252,
    longitude: 31.0335,
    latitudeDelta: 2,
    longitudeDelta: 2,
  });

  // Example coords: Harare → Mutare
  const fromLocation = "-17.8252,31.0335";
  const toLocation = "-18.9235,32.1116";

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation}&destination=${toLocation}&alternatives=true&key=AIzaSyACiyh-wyKUcTXP0w9FU_N00l7L1ahZP8w`
        );
        const data = await res.json();

        if (data.status === "OK") {
          const fetchedRoutes: GoogleRoute[] = data.routes.map((route: any) => ({
            polylineCoords: decodePolyline(route.overview_polyline.points),
            start: route.legs[0].start_location,
            end: route.legs[0].end_location,
          }));

          setRoutes(fetchedRoutes);
          setStart(fetchedRoutes[0].start);
          setEnd(fetchedRoutes[0].end);
        } else {
          console.log("Directions API error:", data.status);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }
    };

    fetchRoute();
  }, []);

  // Scale marker size based on zoom (longitudeDelta)
  const getMarkerSize = () => {
    // smaller delta = more zoomed in
    if (region.longitudeDelta < 0.05) return 40; // zoomed in close
    if (region.longitudeDelta < 0.2) return 32; // medium zoom
    if (region.longitudeDelta < 1) return 26;   // wider view
    return 20; // zoomed out far
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(reg) => setRegion(reg)}
      >
        {/* Start marker with scaling truck */}
        {start && (
          <Marker
            coordinate={{ latitude: start.lat, longitude: start.lng }}
            title="Start"
            description="Starting point"
          >
            <FontAwesome5 name="truck" size={getMarkerSize()} color="blue" />
          </Marker>
        )}

        {/* End marker */}
        {end && (
          <Marker
            coordinate={{ latitude: end.lat, longitude: end.lng }}
            title="Destination"
          />
        )}

        {/* Draw all alternative routes */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route.polylineCoords}
            strokeColor={index === 0 ? "blue" : "gray"} // best route blue
            strokeWidth={5}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
