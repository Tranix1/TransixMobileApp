import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import MapView, { AnimatedRegion, Marker, Polyline } from "react-native-maps";
// Depending on your react-native-maps version the animated marker export is
// either `MarkerAnimated` (newer) or `Marker.Animated` (older). Import the
// one that matches your installed version:
import { MarkerAnimated } from "react-native-maps";
import { decodePolyline, LatLng } from "@/Utilities/decodePolyline";
import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { darkMapStyle } from "@/Utilities/MapDarkMode";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { wp } from "@/constants/common";
import { useVehicleLocation, VehicleStatus } from "@/hooks/useVehicleLocation";
import { splitRouteByLocation, bearingBetween } from "@/Utilities/routeUtils";

const ROUTE_COLORS = {
  traveled: "rgba(229,57,53,0.95)", // red — where it came from
  traveledGlow: "rgba(229,57,53,0.30)",
  remaining: "rgba(30,144,255,1)", // blue — where it's going
  remainingGlow: "rgba(0,229,255,0.45)",
};

const GOOGLE_MAPS_API_KEY = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";

interface Params {
  vehicleId?: string;
  loadId?: string;
  cargoId?: string;
  pickupLati?: string;
  pickupLongi?: string;
  pickupName?: string;
  dropoffLati?: string;
  dropoffLongi?: string;
  dropoffName?: string;
  // encoded polyline for the planned pickup -> dropoff leg
  plannedRoutePolyline?: string;
  bounds?: string;
}

export default function VehicleTrackingMap() {
  const {
    vehicleId,
    pickupLati,
    pickupLongi,
    pickupName,
    dropoffLati,
    dropoffLongi,
    dropoffName,
    plannedRoutePolyline,
  } = useLocalSearchParams();

  const theme = useColorScheme() ?? "light";
  const background = useThemeColor("background");
  const accent = useThemeColor("accent");

  const mapRef = useRef<MapView>(null);
  const hasFittedInitially = useRef(false);

  const { location: vehicleLocation, error: vehicleError } =
    useVehicleLocation(vehicleId as string | undefined, {
      pollIntervalMs: 8000,
    });

  // ---------------------------------------------------------------------
  // Smooth marker: position animates via AnimatedRegion, heading rotates
  // via a separate Animated.Value so the truck icon eases into its new
  // bearing instead of snapping.
  // ---------------------------------------------------------------------
  const animatedCoord = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const rotationValueRef = useRef(0);
  const lastCoordRef = useRef<LatLng | null>(null);
  const [markerReady, setMarkerReady] = useState(false);

  useEffect(() => {
    const sub = animatedRotation.addListener(({ value }) => {
      rotationValueRef.current = value;
    });
    return () => animatedRotation.removeListener(sub);
  }, [animatedRotation]);

  useEffect(() => {
    if (!vehicleLocation) return;
    const next: LatLng = {
      latitude: vehicleLocation.latitude,
      longitude: vehicleLocation.longitude,
    };

    if (!lastCoordRef.current) {
      // first fix — snap in, nothing to animate from yet
      animatedCoord.setValue({
        ...next,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
      animatedRotation.setValue(vehicleLocation.heading ?? 0);
      rotationValueRef.current = vehicleLocation.heading ?? 0;
      lastCoordRef.current = next;
      setMarkerReady(true);
      return;
    }

    const bearing = bearingBetween(lastCoordRef.current, next);
    // rotate the short way round so it never spins the long way past 180°
    const delta = ((bearing - rotationValueRef.current + 540) % 360) - 180;
    const targetRotation = rotationValueRef.current + delta;

    Animated.parallel([
      animatedCoord.timing({
        latitude: next.latitude,
        longitude: next.longitude,
        // @ts-ignore — lib types mark these required but they're unused for a marker coordinate
        latitudeDelta: 0,
        // @ts-ignore
        longitudeDelta: 0,
        duration: 1200,
        useNativeDriver: false,
      } as any),
      Animated.timing(animatedRotation, {
        toValue: targetRotation,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    lastCoordRef.current = next;
  }, [vehicleLocation?.latitude, vehicleLocation?.longitude]);

  // ---------------------------------------------------------------------
  // Which leg are we drawing?
  // ---------------------------------------------------------------------
  const status: VehicleStatus = vehicleLocation?.status ?? "IDLE";
  const isEnRouteWithLoad = status === "TO_DROPOFF" || status === "DELIVERED";

  const pickupCoords: LatLng | null =
    pickupLati && pickupLongi
      ? {
          latitude: parseFloat(pickupLati as string),
          longitude: parseFloat(pickupLongi as string),
        }
      : null;

  const dropoffCoords: LatLng | null =
    dropoffLati && dropoffLongi
      ? {
          latitude: parseFloat(dropoffLati as string),
          longitude: parseFloat(dropoffLongi as string),
        }
      : null;

  const plannedRoutePoints = useMemo(() => {
    if (!plannedRoutePolyline) return [];
    try {
      return decodePolyline(plannedRoutePolyline as string);
    } catch (e) {
      console.error("Error decoding planned route polyline:", e);
      return [];
    }
  }, [plannedRoutePolyline]);

  // When the truck hasn't picked up the load yet, we don't have a planned
  // polyline for "current spot -> pickup", so fetch it live, same pattern
  // as your existing origin/destination screen.
  const [toPickupRoute, setToPickupRoute] = useState<LatLng[]>([]);

  useEffect(() => {
    async function fetchToPickupRoute() {
      if (isEnRouteWithLoad) return;
      if (!vehicleLocation || !pickupCoords) return;

      const origin = `${vehicleLocation.latitude},${vehicleLocation.longitude}`;
      const destination = `${pickupCoords.latitude},${pickupCoords.longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.status === "OK") {
          setToPickupRoute(
            decodePolyline(json.routes[0].overview_polyline.points)
          );
        }
      } catch (e) {
        console.error("Failed to fetch to-pickup route:", e);
      }
    }
    fetchToPickupRoute();
    // Re-fetch when status flips or the pickup point changes — not on every
    // small GPS jitter, so we don't hammer the Directions API.
  }, [isEnRouteWithLoad, pickupCoords?.latitude, pickupCoords?.longitude, status]);

  const { traveled, remaining } = useMemo(() => {
    if (isEnRouteWithLoad && plannedRoutePoints.length > 1 && vehicleLocation) {
      if (status === "DELIVERED") {
        return { traveled: plannedRoutePoints, remaining: [] as LatLng[] };
      }
      const split = splitRouteByLocation(plannedRoutePoints, {
        latitude: vehicleLocation.latitude,
        longitude: vehicleLocation.longitude,
      });
      return { traveled: split.traveled, remaining: split.remaining };
    }
    // Not on the load leg yet: nothing traveled, everything ahead is blue.
    return { traveled: [] as LatLng[], remaining: toPickupRoute };
  }, [isEnRouteWithLoad, plannedRoutePoints, vehicleLocation, toPickupRoute, status]);

  // Fit the map once when the route first appears — after that we leave the
  // camera alone so live updates don't yank the view around.
  useEffect(() => {
    if (hasFittedInitially.current || !mapRef.current) return;
    const allPoints = [...traveled, ...remaining];
    if (allPoints.length === 0) return;

    mapRef.current.fitToCoordinates(allPoints, {
      edgePadding: { top: 120, right: 60, bottom: 220, left: 60 },
      animated: true,
    });
    hasFittedInitially.current = true;
  }, [traveled, remaining]);

  const recenter = () => {
    const allPoints = [...traveled, ...remaining];
    if (!mapRef.current || allPoints.length === 0) return;
    mapRef.current.fitToCoordinates(allPoints, {
      edgePadding: { top: 120, right: 60, bottom: 220, left: 60 },
      animated: true,
    });
  };

  if (!vehicleLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          {vehicleError ?? "Locating vehicle..."}
        </ThemedText>
      </View>
    );
  }

  const destinationLabel = isEnRouteWithLoad
    ? (dropoffName as string) || "Drop-off"
    : (pickupName as string) || "Loading point";

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        customMapStyle={theme === "dark" ? darkMapStyle : undefined}
        initialRegion={{
          latitude: vehicleLocation.latitude,
          longitude: vehicleLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* traveled — red, where it came from */}
        {traveled.length > 1 && (
          <>
            <Polyline
              coordinates={traveled}
              strokeColor={ROUTE_COLORS.traveledGlow}
              strokeWidth={9}
            />
            <Polyline
              coordinates={traveled}
              strokeColor={ROUTE_COLORS.traveled}
              strokeWidth={5}
            />
          </>
        )}

        {/* remaining — blue, where it's going. Dashed while it's still just
            heading to the loading point, solid once it's on the load leg. */}
        {remaining.length > 1 && (
          <>
            <Polyline
              coordinates={remaining}
              strokeColor={ROUTE_COLORS.remainingGlow}
              strokeWidth={9}
            />
            <Polyline
              coordinates={remaining}
              strokeColor={ROUTE_COLORS.remaining}
              strokeWidth={5}
              lineDashPattern={isEnRouteWithLoad ? undefined : [1, 8]}
            />
          </>
        )}

        {pickupCoords && (
          <Marker
            coordinate={pickupCoords}
            title={(pickupName as string) || "Loading point"}
            anchor={{ x: 0.5, y: 1 }}
          >
            <LinearGradient colors={["#FB8C00", "#EF6C00"]} style={styles.markerCircle}>
              <FontAwesome5 name="warehouse" size={16} color="white" />
            </LinearGradient>
          </Marker>
        )}

        {dropoffCoords && (
          <Marker
            coordinate={dropoffCoords}
            title={(dropoffName as string) || "Drop-off"}
            anchor={{ x: 0.5, y: 1 }}
          >
            <LinearGradient colors={["#43A047", "#2E7D32"]} style={styles.markerCircle}>
              <FontAwesome5 name="flag-checkered" size={16} color="white" />
            </LinearGradient>
          </Marker>
        )}

        {markerReady && (
          <MarkerAnimated coordinate={animatedCoord} anchor={{ x: 0.5, y: 0.5 }} flat>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: animatedRotation.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ["-360deg", "360deg"],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient colors={["#2196F3", "#1565C0"]} style={styles.truckMarker}>
                <MaterialCommunityIcons name="truck-fast" size={20} color="white" />
              </LinearGradient>
            </Animated.View>
          </MarkerAnimated>
        )}
      </MapView>

      <View style={[styles.statusPill, { backgroundColor: background }]}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isEnRouteWithLoad ? "#1E90FF" : "#FB8C00" },
          ]}
        />
        <ThemedText type="tiny" style={styles.statusText}>
          {isEnRouteWithLoad
            ? `En route to ${destinationLabel}`
            : `Heading to ${destinationLabel}`}
        </ThemedText>
        {typeof vehicleLocation.speedKph === "number" && (
          <ThemedText type="tiny" style={styles.statusSubText}>
            {Math.round(vehicleLocation.speedKph)} km/h
          </ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={[styles.recenterButton, { backgroundColor: background }]}
        onPress={recenter}
      >
        <FontAwesome5 name="compress-arrows-alt" size={wp(4)} color={accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10 },
  markerCircle: {
    padding: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  truckMarker: {
    padding: 8,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  statusPill: {
    position: "absolute",
    top: wp(8),
    left: wp(4),
    right: wp(4),
    borderRadius: wp(6),
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(4),
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: wp(2) },
  statusText: { fontWeight: "bold", flex: 1 },
  statusSubText: { opacity: 0.7 },
  recenterButton: {
    position: "absolute",
    bottom: wp(10),
    right: wp(4),
    padding: wp(3),
    borderRadius: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
