import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, LatLng } from "react-native-maps";

interface Device {
  id: number;
  name: string;
}

interface Position {
  latitude: number;
  longitude: number;
  deviceId: number;
  // optional fields you may use
  speed?: number;
  altitude?: number;
  deviceTime?: string;
  serverTime?: string;
}

export default function Tracking() {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [deviceCoords, setDeviceCoords] = useState<LatLng | null>(null);
  const [cookie, setCookie] = useState<string>("");

  useEffect(() => {
    async function fetchDevice() {
      try {
        // 1️⃣ Login to Traccar
        const loginResponse = await fetch("https://demo.traccar.org/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "Kelvinyaya8@gmail.com",
            password: "YOUR_PASSWORD"
          })
        });

        if (!loginResponse.ok) {
          console.error("Login failed");
          return;
        }

        const cookieHeader = loginResponse.headers.get("set-cookie") || "";
        setCookie(cookieHeader);

        // 2️⃣ Get devices
        const devicesResponse = await fetch("https://demo.traccar.org/api/devices", {
          headers: { "Cookie": cookieHeader }
        });

        const devices: Device[] = await devicesResponse.json();
        if (devices.length === 0) return;

        const deviceId = devices[0].id; // first device

        // 3️⃣ Get last positions
        const positionsResponse = await fetch(
          `https://demo.traccar.org/api/positions?deviceId=${deviceId}`,
          { headers: { "Cookie": cookieHeader } }
        );

        const positions: Position[] = await positionsResponse.json();
        if (positions.length === 0) return;

        // Map positions to coordinates
        const coords: LatLng[] = positions.map(pos => ({
          latitude: pos.latitude,
          longitude: pos.longitude
        }));

        setRouteCoords(coords);
        setDeviceCoords(coords[coords.length - 1]); // last position
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    }

    fetchDevice();
  }, []);

  return (
    <View style={styles.container}>
      {deviceCoords && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: deviceCoords.latitude,
            longitude: deviceCoords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }}
        >
          <Marker coordinate={deviceCoords} title="Device" />
          {routeCoords.length > 1 && (
            <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={3} />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
});
