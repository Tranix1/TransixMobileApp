import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline, LatLng } from "react-native-maps";
import ScreenWrapper from "@/components/ScreenWrapper";
// Traccar API types
interface Device {
  id: number;
  name: string;
  status?: string;
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
    sat?: number;
  };
}

interface Trip {
  deviceId: number;
  distance: number;
  averageSpeed: number;
  startOdometer: number;
  endOdometer: number;
  startTime: string;
  endTime: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  startAddress: string;
  endAddress: string;
  duration: number;
}

interface Stop {
  deviceId: number;
  startTime: string;
  endTime: string;
  duration: number;
  address: string;
  latitude: number;
  longitude: number;
  startOdometer: number;
  endOdometer: number;
}

// Combined type for Summary tab
type CombinedItem = (Trip & { type: "trip" }) | (Stop & { type: "stop" });

type TabType = "summary";
type BottomTab = "info" | "history";

export default function Tracking() {
  // Use Expo Router's hook to get local parameters
  const params = useLocalSearchParams();
  const deviceId = params.deviceId ? Number(params.deviceId) : null;

  const [deviceCoords, setDeviceCoords] = useState<Position | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Device | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [tab, setTab] = useState<TabType>("summary");
  const [bottomTab, setBottomTab] = useState<BottomTab>("info");

  const [selectedItem, setSelectedItem] = useState<{
    type: "trip" | "stop" | "device";
    coords: LatLng | LatLng[];
    info?: any;
  } | null>(null);

  // Fetch data
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchData() {
      // Check for a valid deviceId before fetching
      if (!deviceId || isNaN(deviceId)) {
        setLoading(false);
        setErrorMsg("Invalid device ID provided.");
        return;
      }

      try {
        const username = "Kelvinyaya8@gmail.com";
        const password = "1zuxl2jn";
        const basicAuth = "Basic " + btoa(`${username}:${password}`);

        // Fetch a single device by ID
        const deviceResponse = await fetch(
          `https://server.traccar.org/api/devices?id=${deviceId}`,
          { headers: { Authorization: basicAuth, Accept: "application/json" } }
        );

        if (!deviceResponse.ok) {
          throw new Error("Failed to fetch device.");
        }
        const devices: Device[] = await deviceResponse.json();
        const device = devices[0];
        if (!device) {
          throw new Error("Device not found.");
        }
        setDeviceInfo(device);

        // Positions
        const positionsResponse = await fetch(
          `https://server.traccar.org/api/positions?deviceId=${deviceId}`,
          { headers: { Authorization: basicAuth, Accept: "application/json" } }
        );
        if (!positionsResponse.ok) {
          throw new Error("Failed to fetch positions.");
        }
        const positions: Position[] = await positionsResponse.json();
        if (!positions || positions.length === 0) {
          throw new Error("No positions found for this device.");
        }

        const lastPos = positions[positions.length - 1];
        setDeviceCoords(lastPos);

        // Set initial marker
        if (!selectedItem) {
          setSelectedItem({
            type: "device",
            coords: { latitude: lastPos.latitude, longitude: lastPos.longitude },
            info: lastPos,
          });
        }

        // Date range for history
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - selectedDayOffset);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);

        // Trips
        const tripsResponse = await fetch(
          `https://server.traccar.org/api/reports/trips?deviceId=${deviceId}&from=${start.toISOString()}&to=${end.toISOString()}`,
          { headers: { Authorization: basicAuth, Accept: "application/json" } }
        );
        setTrips(tripsResponse.ok ? await tripsResponse.json() : []);

        // Stops
        const stopsResponse = await fetch(
          `https://server.traccar.org/api/reports/stops?deviceId=${deviceId}&from=${start.toISOString()}&to=${end.toISOString()}`,
          { headers: { Authorization: basicAuth, Accept: "application/json" } }
        );
        setStops(stopsResponse.ok ? await stopsResponse.json() : []);
      } catch (error: any) {
        setErrorMsg(error.message || "Error fetching device data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [selectedDayOffset, deviceId]); // Added deviceId to dependency array

  // Combine trips + stops and reverse the order
  const getCombinedSummary = (): CombinedItem[] => {
    const combined: CombinedItem[] = [
      ...trips.map((t) => ({ ...t, type: "trip" as const })),
      ...stops.map((s) => ({ ...s, type: "stop" as const })),
    ];
    // Sort in reverse chronological order (latest first)
    combined.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    return combined;
  };

  const getVehicleState = (): string => {
    if (!deviceCoords) return "Unknown";
    const speed = (deviceCoords.speed ?? 0) * 1.852;
    const ignition = deviceCoords.attributes?.ignition ?? false;
    if (speed > 2) return "Moving";
    return ignition ? "Parked (Ignition On)" : "Parked (Ignition Off)";
  };

  const getSatelliteStatus = (): string => {
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
        <Text>Loading data...</Text>
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

  const mapRegion = selectedItem
    ? {
        latitude: Array.isArray(selectedItem.coords)
          ? selectedItem.coords[0].latitude
          : selectedItem.coords.latitude,
        longitude: Array.isArray(selectedItem.coords)
          ? selectedItem.coords[0].longitude
          : selectedItem.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : null;

  return (
    <ScreenWrapper fh={false}>
      <View style={styles.container}>
        {/* Map */}
        {deviceCoords ? (
          <MapView
            style={styles.map}
            region={
              mapRegion || {
                latitude: deviceCoords.latitude,
                longitude: deviceCoords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            }
          >
            {selectedItem?.type === "device" && (
              <Marker
                coordinate={selectedItem.coords as LatLng}
                title={deviceInfo?.name || "Device"}
              />
            )}
            {selectedItem?.type === "stop" && (
              <Marker
                coordinate={selectedItem.coords as LatLng}
                pinColor="orange"
                title={selectedItem.info.address}
              />
            )}
            {selectedItem?.type === "trip" && (
              <>
                <Marker
                  coordinate={(selectedItem.coords as LatLng[])[0]}
                  pinColor="green"
                  title="Trip Start"
                />
                <Marker
                  coordinate={(selectedItem.coords as LatLng[])[1]}
                  pinColor="red"
                  title="Trip End"
                />
                <Polyline
                  coordinates={selectedItem.coords as LatLng[]}
                  strokeColor="purple"
                  strokeWidth={4}
                />
              </>
            )}
          </MapView>
        ) : (
          <View style={styles.center}>
            <Text>No device coordinates available.</Text>
          </View>
        )}

        <View>
          <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
            {" "}
            {deviceInfo?.name ?? "Unknown"}
          </ThemedText>
        </View>
        {/* Info */}
        {bottomTab === "info" && (
          <View style={styles.infoBox}>
            <ThemedText>
              Speed:{" "}
              {deviceCoords?.speed
                ? (deviceCoords.speed * 1.852).toFixed(1)
                : "0"}{" "}
              km/h
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
        )}

        {/* History */}
        {bottomTab === "history" && (
          <View style={{ flex: 1 }}>
            {/* Day selectors */}
            <View style={styles.dayButtons}>
              <Button
                title="Today"
                onPress={() => {
                  setSelectedDayOffset(0);
                  if (deviceCoords) {
                    setSelectedItem({
                      type: "device",
                      coords: {
                        latitude: deviceCoords.latitude,
                        longitude: deviceCoords.longitude,
                      },
                      info: deviceCoords,
                    });
                  }
                }}
              />
              <Button title="Yesterday" onPress={() => setSelectedDayOffset(1)} />
              <Button title="2 Days Ago" onPress={() => setSelectedDayOffset(2)} />
            </View>

            {/* Summary */}
            <ScrollView style={{ flex: 1, padding: 10 }}>
              {tab === "summary" &&
                (getCombinedSummary().length === 0 ? (
                  <ThemedText>No trips or stops for this day.</ThemedText>
                ) : (
                  getCombinedSummary().map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        if (item.type === "trip") {
                          setSelectedItem({
                            type: "trip",
                            coords: [
                              {
                                latitude: item.startLat,
                                longitude: item.startLon,
                              },
                              { latitude: item.endLat, longitude: item.endLon },
                            ],
                            info: item,
                          });
                        } else {
                          setSelectedItem({
                            type: "stop",
                            coords: {
                              latitude: item.latitude,
                              longitude: item.longitude,
                            },
                            info: item,
                          });
                        }
                      }}
                      style={[
                        styles.card,
                        item.type === "trip" ? styles.tripCard : styles.stopCard,
                      ]}
                    >
                      <Text style={styles.cardHeader}>
                        {item.type === "trip" ? "Trip" : "Stop"}
                      </Text>
                      <Text>
                        Start: {new Date(item.startTime).toLocaleTimeString()} | End:{" "}
                        {new Date(item.endTime).toLocaleTimeString()}
                      </Text>
                      <Text>Duration: {(item.duration / 60000).toFixed(1)} min</Text>
                      {item.type === "trip" && (
                        <>
                          <Text>
                            Distance: {(item.distance / 1000).toFixed(2)} km
                          </Text>
                          <Text>
                            Average Speed: {item.averageSpeed.toFixed(1)} km/h
                          </Text>
                        </>
                      )}
                      <Text>
                        Address:{" "}
                        {item.type === "trip"
                          ? `From: ${item.startAddress || "N/A"} to ${
                              item.endAddress || "N/A"
                            }`
                          : item.address || "N/A"}
                      </Text>
                    </TouchableOpacity>
                  ))
                ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom buttons */}
        <View style={styles.bottomTabs}>
          <TouchableOpacity
            style={[
              styles.bottomBtn,
              bottomTab === "info" && styles.activeBottomBtn,
            ]}
            onPress={() => setBottomTab("info")}
          >
            <Text
              style={[
                styles.bottomBtnText,
                bottomTab === "info" && styles.activeBottomBtnText,
              ]}
            >
              Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.bottomBtn,
              bottomTab === "history" && styles.activeBottomBtn,
            ]}
            onPress={() => setBottomTab("history")}
          >
            <Text
              style={[
                styles.bottomBtnText,
                bottomTab === "history" && styles.activeBottomBtnText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoBox: { padding: 12 },

  dayButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  card: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  tripCard: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  stopCard: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  cardHeader: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },

  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  bottomBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  bottomBtnText: { fontSize: 16, color: "#333" },
  activeBottomBtn: {
    backgroundColor: "#007bff",
  },
  activeBottomBtnText: { color: "white", fontWeight: "bold" },
});
