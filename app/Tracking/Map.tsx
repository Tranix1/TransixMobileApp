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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from '@/hooks/useThemeColor';

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
  
  const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')

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

  // Helper function to get the formatted date string for buttons
  const getDayButtonText = (offset: number) => {
    const today = new Date();
    const targetDate = new Date(today.setDate(today.getDate() - offset));

    if (offset === 0) {
      return "Today";
    }
    if (offset === 1) {
      return "Yesterday";
    }

    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfMonth = targetDate.getDate();
    return `${dayOfWeek} ${dayOfMonth}`;
  };

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

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <ThemedText style={{ color: "red" }}>{errorMsg}</ThemedText>
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
            region={{
              latitude: deviceCoords.latitude,
              longitude: deviceCoords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
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
            <ThemedText>No device coordinates available.</ThemedText>
          </View>
        )}

        {/* Device Title */}
        <View style={styles.titleBox}>
          <Ionicons name="car-outline" size={22} style={styles.icon} color={icon}  />
          <ThemedText style={styles.deviceName}>
            {deviceInfo?.name ?? "Unknown"}
          </ThemedText>
        </View>

        {/* Info */}
        {bottomTab === "info" && (
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="speedometer" size={20} style={styles.icon} color={icon}/>
              <ThemedText>
                Speed:{" "}
                {deviceCoords?.speed
                  ? (deviceCoords.speed * 1.852).toFixed(1)
                  : "0"}{" "}
                km/h
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} style={styles.icon} color={icon} />
              <ThemedText>
                Time:{" "}
                {deviceCoords?.deviceTime
                  ? new Date(deviceCoords.deviceTime).toLocaleString()
                  : "N/A"}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} style={styles.icon} color={icon} />
              <ThemedText>Status: {deviceInfo?.status ?? "Unknown"}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="car-sport-outline" size={20} style={styles.icon}  color={icon}/>
              <ThemedText>State: {getVehicleState()}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={20} style={styles.icon}  color={icon}/>
              <ThemedText>Satellites: {getSatelliteStatus()}</ThemedText>
            </View>
          </View>
        )}

        {/* History */}
        {bottomTab === "history" && (
          <View style={{ flex: 1 }}>
            {/* Day selectors */}
            <View style={{height:50}}> 
            <ScrollView horizontal >
              {Array.from({ length: 7 }, (_, i) => {
                const dayText = getDayButtonText(i);
                return (
                  <TouchableOpacity
                    key={i}
                  style={[
                    styles.dayButton,
                    i === selectedDayOffset && { backgroundColor: backgroundLight,borderColor:accent },
                  ]}
                  onPress={() => {
                      setLoading(true);
                      setSelectedDayOffset(i);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.dayButtonText,
                        i === selectedDayOffset && styles.activeDayButtonText,
                      ]}
                    >
                      {dayText}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            </View>

            {/* Summary or loading indicator */}
            {loading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={accent} />
                <Text>Loading history...</Text>
              </View>
            ) : (
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
                                { latitude: item.startLat, longitude: item.startLon },
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
                          item.type === "trip" ? {borderWidth:3 , borderBlockColor:accent , } : {borderWidth:3 , borderBlockColor:icon , },
                        ]}
                      >
                        <ThemedText style={styles.cardHeader}>
                          {item.type === "trip" ? "Trip" : "Stop"}
                        </ThemedText>
                        <ThemedText>
                          Start: {new Date(item.startTime).toLocaleTimeString()} | End:{" "}
                          {new Date(item.endTime).toLocaleTimeString()}
                        </ThemedText>
                        <ThemedText>
                          Duration: {(item.duration / 60000).toFixed(1)} min
                        </ThemedText>
                        {item.type === "trip" && (
                          <>
                            <ThemedText>
                              Distance: {(item.distance / 1000).toFixed(2)} km
                            </ThemedText>
                            <ThemedText>
                              Average Speed: {item.averageSpeed.toFixed(1)} km/h
                            </ThemedText>
                          </>
                        )}
                        <ThemedText>
                          Address:{" "}
                          {item.type === "trip"
                            ? `From: ${item.startAddress || "N/A"} → ${
                                item.endAddress || "N/A"
                              }`
                            : item.address || "N/A"}
                        </ThemedText>
                      </TouchableOpacity>
                    ))
                  ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Bottom Tabs */}
        <View style={styles.bottomTabs}>
          <TouchableOpacity
            style={[
              styles.bottomBtn,
              bottomTab === "info" && {borderWidth:1,  backgroundColor: backgroundLight},
            ]}
            onPress={() => setBottomTab("info")}
          >
            <Ionicons name="information-circle-outline" size={18} style={styles.icon} color={icon} />
            <ThemedText
              style={[
                styles.bottomBtnText,
                bottomTab === "info" && styles.activeBottomBtnText,
              ]}
            >
              Info
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.bottomBtn,
              bottomTab === "history" && {borderWidth:1,  backgroundColor: backgroundLight},
            ]}
            onPress={() => setBottomTab("history")}
          >
            <Ionicons name="time-outline" size={18} style={styles.icon} color={icon} />
            <ThemedText
              style={[
                styles.bottomBtnText,
                bottomTab === "history" && styles.activeBottomBtnText,
              ]}
            >
              History
            </ThemedText>
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

  titleBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  deviceName: { fontSize: 20, fontWeight: "bold", marginLeft: 6 },

  infoBox: { padding: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  icon: { marginRight: 6, },

  dayButtonsContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  dayButton: {
    height:35,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDayButton: {
    borderColor: 'blue',
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  activeDayButtonText: {
    fontWeight: 'bold',
  },

  card: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  tripCard: { borderWidth: 1 },
  stopCard: { borderWidth: 1 },
  cardHeader: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },

  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  bottomBtnText: { fontSize: 16, marginLeft: 4 },
  activeBottomBtnText: { fontWeight: "bold" },
});
