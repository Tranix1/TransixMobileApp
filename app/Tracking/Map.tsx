// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { View, StyleSheet, ActivityIndicator, Text, SectionList, TouchableOpacity, ScrollView } from "react-native";
// import MapView, { Marker, Polyline, LatLng } from "react-native-maps";
// import ScreenWrapper from "@/components/ScreenWrapper";
// import { ThemedText } from "@/components/ThemedText";

// /** =========================
//  *  Traccar API Types
//  *  ========================= */
// interface Device {
//   id: number;
//   name: string;
//   status?: string; // "online" | "offline"
// }

// interface Trip {
//   id?: number; // not guaranteed by API; we’ll synthesize
//   deviceId: number;
//   startTime: string; // ISO
//   endTime: string;   // ISO
//   startLat: number;
//   startLon: number;
//   endLat: number;
//   endLon: number;
//   startAddress?: string;
//   endAddress?: string;
//   distance?: number; // meters
//   duration?: number; // milliseconds
// }

// interface Stop {
//   id?: number; // not guaranteed
//   deviceId: number;
//   startTime: string; // ISO
//   endTime: string;   // ISO
//   latitude: number;
//   longitude: number;
//   address?: string;
//   duration?: number; // milliseconds
// }

// interface Position {
//   deviceId: number;
//   latitude: number;
//   longitude: number;
//   deviceTime?: string;
//   speed?: number; // knots
// }

// type SectionItem = {
//   kind: "trip";
//   trip: Trip;
// };

// type DaySection = {
//   title: string; // "Mon 25 Aug"
//   key: string;   // "2025-08-25"
//   totals: {
//     km: number;
//     driveMs: number;
//     parkMs: number;
//   };
//   stops: Stop[];
//   data: SectionItem[]; // trips as list items
// };

// /** =========================
//  *  Small Utilities
//  *  ========================= */
// const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// function fmtDayHeader(d: Date) {
//   const day = DAY_NAMES[d.getDay()];
//   const dd = d.getDate();
//   const mon = MONTH_ABBR[d.getMonth()];
//   return `${day} ${dd} ${mon}`;
// }

// function msToHMM(ms: number) {
//   const totalMins = Math.floor(ms / 60000);
//   const h = Math.floor(totalMins / 60);
//   const m = totalMins % 60;
//   return `${h}h ${m}m`;
// }

// function toKm(meters?: number) {
//   if (!meters) return 0;
//   return meters / 1000;
// }

// function startOfWeekMonday(date: Date) {
//   const d = new Date(date);
//   const day = d.getDay(); // 0..6 (Sun..Sat)
//   const diff = (day + 6) % 7; // days since Monday
//   d.setHours(0, 0, 0, 0);
//   d.setDate(d.getDate() - diff);
//   return d;
// }

// function addDays(date: Date, days: number) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + days);
//   return d;
// }

// function toISOZ(d: Date) {
//   return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().replace(/\.\d{3}Z$/, "Z");
// }

// // Lightweight base64 (ASCII) for Basic Auth in RN (to avoid external deps/Buffer)
// function b64EncodeAscii(input: string): string {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
//   let str = input;
//   let output = "";

//   for (let block = 0, charCode: number, i = 0, map = chars;
//        str.charAt(i | 0) || ((map = "="), i % 1);
//        output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))) {
//     charCode = str.charCodeAt((i += 3 / 4));
//     if (charCode > 0xff) {
//       throw new Error("b64EncodeAscii: input contains non-ASCII characters.");
//     }
//     block = (block << 8) | charCode;
//   }
//   return output;
// }

// /** =========================
//  *  Screen
//  *  ========================= */
// export default function TrackingHistoryScreen() {
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string>("");

//   const [device, setDevice] = useState<Device | null>(null);
//   const [sections, setSections] = useState<DaySection[]>([]);

//   const [selectedPolyline, setSelectedPolyline] = useState<LatLng[]>([]);
//   const [selectedTripMarkers, setSelectedTripMarkers] = useState<{ start?: LatLng; end?: LatLng }>({});
//   const [latestPos, setLatestPos] = useState<Position | null>(null);

//   const [activeTab, setActiveTab] = useState<"history" | "info">("history");

//   const mapRef = useRef<MapView | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         // ====== AUTH (replace with env) ======
//         const username = "Kelvinyaya8@gmail.com";
//         const password = "PPPlllmmm!23";
//         const basicAuth = "Basic " + b64EncodeAscii(`${username}:${password}`);

//         // ====== DEVICE ======
//         const devRes = await fetch("https://demo.traccar.org/api/devices", {
//           headers: { Authorization: basicAuth },
//         });
//         if (!devRes.ok) throw new Error("Failed to fetch devices");
//         const devs: Device[] = await devRes.json();
//         if (!devs.length) throw new Error("No devices found");
//         const primary = devs[0];
//         setDevice(primary);

//         // ====== WEEK RANGE (Mon -> next Mon) ======
//         const now = new Date();
//         const monday = startOfWeekMonday(now);
//         const nextMonday = addDays(monday, 7);
//         const from = toISOZ(monday);
//         const to = toISOZ(nextMonday);

//         // ====== LATEST POSITION for initial map ======
//         const posRes = await fetch(`https://demo.traccar.org/api/positions?deviceId=${primary.id}`, {
//           headers: { Authorization: basicAuth },
//         });
//         if (!posRes.ok) throw new Error("Failed to fetch positions");
//         const posList: Position[] = await posRes.json();
//         if (posList.length) setLatestPos(posList[posList.length - 1]);

//         // ====== TRIPS ======
//         const tripsRes = await fetch(
//           `https://demo.traccar.org/api/reports/trips?deviceId=${primary.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
//           { headers: { Authorization: basicAuth } }
//         );
//         if (!tripsRes.ok) throw new Error("Failed to fetch trips");
//         const trips: Trip[] = await tripsRes.json();

//         // ====== STOPS ======
//         const stopsRes = await fetch(
//           `https://demo.traccar.org/api/reports/stops?deviceId=${primary.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
//           { headers: { Authorization: basicAuth } }
//         );
//         if (!stopsRes.ok) throw new Error("Failed to fetch stops");
//         const stops: Stop[] = await stopsRes.json();

//         // ====== GROUP BY DAY ======
//         const bucket = new Map<string, { trips: Trip[]; stops: Stop[] }>();

//         // normalize/synthesize ids for stable keys
//         trips.forEach((t, i) => {
//           (t as any).id = i + 1;
//           const dKey = new Date(t.startTime);
//           dKey.setHours(0, 0, 0, 0);
//           const key = dKey.toISOString().slice(0, 10); // yyyy-mm-dd
//           if (!bucket.has(key)) bucket.set(key, { trips: [], stops: [] });
//           bucket.get(key)!.trips.push(t);
//         });

//         stops.forEach((s, j) => {
//           (s as any).id = j + 1;
//           const dKey = new Date(s.startTime);
//           dKey.setHours(0, 0, 0, 0);
//           const key = dKey.toISOString().slice(0, 10);
//           if (!bucket.has(key)) bucket.set(key, { trips: [], stops: [] });
//           bucket.get(key)!.stops.push(s);
//         });

//         // ====== BUILD SECTIONS ======
//         const built: DaySection[] = Array.from(bucket.entries())
//           .map(([key, val]) => {
//             // daily totals
//             const totalKm = val.trips.reduce((sum, t) => sum + toKm(t.distance ?? 0), 0);
//             const driveMs = val.trips.reduce((sum, t) => sum + (t.duration ?? 0), 0);
//             const parkMs = val.stops.reduce((sum, s) => sum + (s.duration ?? 0), 0);

//             const date = new Date(key + "T00:00:00Z");
//             const title = fmtDayHeader(date);

//             // sort trips by startTime
//             val.trips.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));

//             return {
//               title,
//               key,
//               totals: { km: totalKm, driveMs, parkMs },
//               stops: val.stops.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime)),
//               data: val.trips.map((t) => ({ kind: "trip", trip: t })),
//             } as DaySection;
//           })
//           // sort sections by date ascending within the current week
//           .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

//         setSections(built);
//       } catch (e: any) {
//         setErr(e?.message || "Something went wrong.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /** Fetch and draw a specific trip’s route */
//   const showTripOnMap = async (trip: Trip) => {
//     try {
//       if (!device) return;

//       // AUTH
//       const username = "Kelvinyaya8@gmail.com";
//       const password = "PPPlllmmm!23";
//       const basicAuth = "Basic " + b64EncodeAscii(`${username}:${password}`);

//       const routeRes = await fetch(
//         `https://demo.traccar.org/api/reports/route?deviceId=${device.id}&from=${encodeURIComponent(trip.startTime)}&to=${encodeURIComponent(trip.endTime)}`,
//         { headers: { Authorization: basicAuth } }
//       );
//       if (!routeRes.ok) throw new Error("Failed to fetch route");
//       const routePoints: Position[] = await routeRes.json();

//       const coords: LatLng[] = routePoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));

//       setSelectedPolyline(coords);
//       setSelectedTripMarkers({
//         start: { latitude: trip.startLat, longitude: trip.startLon },
//         end: { latitude: trip.endLat, longitude: trip.endLon },
//       });

//       if (coords.length && mapRef.current) {
//         // Fit the polyline nicely into view
//         (mapRef.current as any).fitToCoordinates(coords, {
//           edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
//           animated: true,
//         });
//       }
//       setActiveTab("history");
//     } catch (e) {
//       // no-op, keep prior state
//     }
//   };

//   const weekTotals = useMemo(() => {
//     const km = sections.reduce((sum, s) => sum + s.totals.km, 0);
//     const driveMs = sections.reduce((sum, s) => sum + s.totals.driveMs, 0);
//     const parkMs = sections.reduce((sum, s) => sum + s.totals.parkMs, 0);
//     return { km, driveMs, parkMs };
//   }, [sections]);

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//         <Text>Loading weekly history…</Text>
//       </View>
//     );
//   }

//   // if (err) {
//   //   return (
//   //     <View style={styles.center}>
//   //       <Text style={{ color: "red" }}>{err}</Text>
//   //     </View>
//   //   );
//   // }

//   const initialRegion = latestPos
//     ? {
//         latitude: latestPos.latitude,
//         longitude: latestPos.longitude,
//         latitudeDelta: 0.08,
//         longitudeDelta: 0.08,
//       }
//     : {
//         latitude: -17.8292, // Harare (fallback)
//         longitude: 31.0522,
//         latitudeDelta: 5,
//         longitudeDelta: 5,
//       };

//   return (
//     <ScreenWrapper fh={false}>
//       <View style={styles.container}>
//         {/* MAP */}
//         <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
//           {latestPos && !selectedPolyline.length && (
//             <Marker coordinate={{ latitude: latestPos.latitude, longitude: latestPos.longitude }} title={device?.name || "Device"} />
//           )}

//           {selectedTripMarkers.start && <Marker coordinate={selectedTripMarkers.start} title="Start" />}
//           {selectedTripMarkers.end && <Marker coordinate={selectedTripMarkers.end} title="End" />}

//           {selectedPolyline.length > 1 && <Polyline coordinates={selectedPolyline} strokeWidth={3} />}
//         </MapView>

//         {/* TABS */}
//         <View style={styles.tabs}>
//           <TouchableOpacity style={[styles.tabBtn, activeTab === "history" && styles.tabActive]} onPress={() => setActiveTab("history")}>
//             <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>History</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={[styles.tabBtn, activeTab === "info" && styles.tabActive]} onPress={() => setActiveTab("info")}>
//             <Text style={[styles.tabText, activeTab === "info" && styles.tabTextActive]}>Information</Text>
//           </TouchableOpacity>
//         </View>

//         {/* CONTENT */}
//         {activeTab === "history" ? (
//           <SectionList
//             sections={sections}
//             keyExtractor={(item, idx) => (item.trip.id ? `t-${item.trip.id}` : `i-${idx}`)}
//             contentContainerStyle={{ paddingBottom: 24 }}
//             renderSectionHeader={({ section }) => (
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>{section.title}</Text>
//                 <Text style={styles.sectionMetrics}>
//                   Distance: {section.totals.km.toFixed(1)} km • Driving: {msToHMM(section.totals.driveMs)} • Parked: {msToHMM(section.totals.parkMs)}
//                 </Text>
//               </View>
//             )}
//             renderItem={({ item }) => {
//               if (item.kind === "trip") {
//                 const t = item.trip;
//                 const km = toKm(t.distance ?? 0);
//                 return (
//                   <TouchableOpacity onPress={() => showTripOnMap(t)} style={styles.tripCard} activeOpacity={0.8}>
//                     <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//                       <Text style={styles.tripTitle}>{t.startAddress || "Start"} → {t.endAddress || "End"}</Text>
//                       <Text style={styles.tripMeta}>{km.toFixed(1)} km</Text>
//                     </View>
//                     <Text style={styles.tripMeta}>
//                       {new Date(t.startTime).toLocaleTimeString()} — {new Date(t.endTime).toLocaleTimeString()} • {msToHMM(t.duration ?? 0)}
//                     </Text>
//                     <Text style={styles.linkText}>Show route on map</Text>
//                   </TouchableOpacity>
//                 );
//               }
//               return null;
//             }}
//             renderSectionFooter={({ section }) => (
//               <View style={styles.stopsWrap}>
//                 {section.stops.length > 0 && <Text style={styles.stopsTitle}>Parked</Text>}
//                 {section.stops.map((s) => {
//                   const dur = s.duration ?? 0;
//                   return (
//                     <View key={`${section.key}-stop-${s.id}`} style={styles.stopCard}>
//                       <Text style={styles.stopAddr}>{s.address || "Unknown location"}</Text>
//                       <Text style={styles.stopMeta}>
//                         {new Date(s.startTime).toLocaleTimeString()} — {new Date(s.endTime).toLocaleTimeString()} • {msToHMM(dur)}
//                       </Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}
//             stickySectionHeadersEnabled
//           />
//         ) : (
//           <ScrollView style={styles.infoPane} contentContainerStyle={{ padding: 16 }}>
//             <ThemedText type="title">This Week</ThemedText>
//             <ThemedText>Device: {device?.name ?? "Unknown"}</ThemedText>
//             <ThemedText>Status: {device?.status ?? "Unknown"}</ThemedText>
//             <View style={styles.infoRow}>
//               <View style={styles.infoCard}>
//                 <Text style={styles.infoLabel}>Total Distance</Text>
//                 <Text style={styles.infoValue}>{weekTotals.km.toFixed(1)} km</Text>
//               </View>
//               <View style={styles.infoCard}>
//                 <Text style={styles.infoLabel}>Time Driving</Text>
//                 <Text style={styles.infoValue}>{msToHMM(weekTotals.driveMs)}</Text>
//               </View>
//               <View style={styles.infoCard}>
//                 <Text style={styles.infoLabel}>Time Parked</Text>
//                 <Text style={styles.infoValue}>{msToHMM(weekTotals.parkMs)}</Text>
//               </View>
//             </View>
//             <View style={{ height: 12 }} />
//             <ThemedText>Tip: Tap a trip in “History” to highlight its route on the map above.</ThemedText>
//           </ScrollView>
//         )}
//       </View>
//     </ScreenWrapper>
//   );
// }

// /** =========================
//  *  Styles
//  *  ========================= */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fafafa" },
//   map: { height: 260, width: "100%" },

//   tabs: {
//     flexDirection: "row",
//     backgroundColor: "#ffffff",
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderColor: "#e5e7eb",
//   },
//   tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
//   tabActive: { borderBottomWidth: 2, borderBottomColor: "#2563eb" },
//   tabText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
//   tabTextActive: { color: "#111827" },

//   sectionHeader: {
//     backgroundColor: "#f3f4f6",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: "#e5e7eb",
//   },
//   sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
//   sectionMetrics: { fontSize: 12, color: "#4b5563", marginTop: 2 },

//   tripCard: {
//     backgroundColor: "#fff",
//     marginHorizontal: 10,
//     marginVertical: 6,
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 1,
//   },
//   tripTitle: { fontSize: 14, fontWeight: "700", color: "#111827", flex: 1, paddingRight: 8 },
//   tripMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
//   linkText: { fontSize: 12, color: "#2563eb", marginTop: 6 },

//   stopsWrap: { paddingHorizontal: 12, paddingBottom: 10 },
//   stopsTitle: { fontSize: 12, color: "#374151", marginTop: 2, marginBottom: 4, fontWeight: "700" },
//   stopCard: {
//     backgroundColor: "#fff",
//     marginVertical: 4,
//     padding: 10,
//     borderRadius: 10,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: "#e5e7eb",
//   },
//   stopAddr: { fontSize: 13, fontWeight: "600", color: "#111827" },
//   stopMeta: { fontSize: 12, color: "#6b7280", marginTop: 2 },

//   infoPane: { flex: 1, backgroundColor: "#fff" },
//   infoRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
//   infoCard: {
//     minWidth: "30%",
//     flexGrow: 1,
//     backgroundColor: "#f9fafb",
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: "#e5e7eb",
//   },
//   infoLabel: { fontSize: 12, color: "#6b7280" },
//   infoValue: { fontSize: 16, fontWeight: "800", color: "#111827", marginTop: 4 },

//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });





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
  let interval: NodeJS.Timeout;

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

  // ⏱️ Call immediately on mount
  fetchDevice();

  // ⏱️ Repeat every 10 seconds
  interval = setInterval(fetchDevice, 10000);

  // 🧹 Cleanup on unmount
  return () => clearInterval(interval);
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
        <View >
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
 
});
