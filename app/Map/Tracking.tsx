import { ThemedText } from "@/components/ThemedText";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Polyline, LatLng } from "react-native-maps";
import ScreenWrapper from "@/components/ScreenWrapper";

// Traccar API types
interface Device {
  id: number;
  name: string;
  status?: string; // online / offline
}

interface Position {
  latitude: number;
  longitude: number;
  deviceId: number;
  altitude?: number;
  deviceTime?: string;
  speed?: number;
  attributes?: {
    ignition?: boolean;
    sat?: number; // satellites
  };
}

export default function Tracking() {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [deviceCoords, setDeviceCoords] = useState<Position | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    async function fetchDevice() {
      try {
        const username = "Kelvinyaya8@gmail.com";
        const password = "PPPlllmmm!23";
        const basicAuth = "Basic " + btoa(`${username}:${password}`);

        // 1️⃣ Get devices
        const devicesResponse = await fetch("https://demo.traccar.org/api/devices", {
          headers: { Authorization: basicAuth },
        });

        if (!devicesResponse.ok) throw new Error("Failed to fetch devices.");

        const devices: Device[] = await devicesResponse.json();
        if (!devices || devices.length === 0) throw new Error("No devices found.");

        const device = devices[0]; // pick first for now
        setDeviceInfo(device);

        // 2️⃣ Get last positions
        const positionsResponse = await fetch(
          `https://demo.traccar.org/api/positions?deviceId=${device.id}`,
          { headers: { Authorization: basicAuth } }
        );

        if (!positionsResponse.ok) throw new Error("Failed to fetch positions.");

        const positions: Position[] = await positionsResponse.json();
        if (!positions || positions.length === 0) throw new Error("No positions found.");

        const lastPos = positions[positions.length - 1];

        // Map to LatLng for Polyline
        const coords: LatLng[] = positions.map((pos) => ({
          latitude: pos.latitude,
          longitude: pos.longitude,
        }));

        setRouteCoords(coords);
        setDeviceCoords(lastPos);
      } catch (error: any) {
        setErrorMsg(error.message || "Error fetching device data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDevice();
  }, []);

  // 🚗 Compute vehicle state
  const getVehicleState = () => {
    if (!deviceCoords) return "Unknown";

    const speed = (deviceCoords.speed ?? 0) * 1.852; // knots → km/h
    const ignition = deviceCoords.attributes?.ignition ?? false;

    if (speed > 2) {
      return "Moving";
    } else {
      return ignition ? "Parked (Ignition On)" : "Parked (Ignition Off)";
    }
  };

  // 🛰️ Compute satellite signal quality
  const getSatelliteStatus = () => {
    const sat = deviceCoords?.attributes?.sat ?? 0;

    if (sat === 0) return "No satellites (GPS Lost)";
    if (sat <= 3) return `Weak (${sat} satellites)`;
    if (sat <= 6) return `Medium (${sat} satellites)`;
    return `Strong (${sat} satellites)`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading map data...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper fh={false}>
      <View style={styles.container}>
        {deviceCoords ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: deviceCoords.latitude,
              longitude: deviceCoords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={deviceCoords} title={deviceInfo?.name || "Device"} />
            {routeCoords.length > 1 && (
              <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={3} />
            )}
          </MapView>
        ) : (
          <View style={styles.center}>
            <Text>No device coordinates available.</Text>
          </View>
        )}

        {/* Device info panel */}
        <View style={styles.infoBox}>
          <ThemedText>Name: {deviceInfo?.name ?? "Unknown"}</ThemedText>
          <ThemedText>
            Speed: {deviceCoords?.speed ? (deviceCoords.speed * 1.852).toFixed(1) : "0"} km/h
          </ThemedText>

          <ThemedText>
            Time:{" "}
            {deviceCoords?.deviceTime
              ? new Date(deviceCoords.deviceTime).toLocaleString()
              : "N/A"}
          </ThemedText>
          <ThemedText>Status: {deviceInfo?.status ?? "Unknown"}</ThemedText>
          <ThemedText>State: {getVehicleState()}</ThemedText>
          <ThemedText>Satellites: {getSatelliteStatus()}</ThemedText>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoBox: {
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});
