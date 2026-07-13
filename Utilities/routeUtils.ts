import { LatLng } from "@/Utilities/decodePolyline";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371000; // meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Bearing (degrees, 0 = north) from point a to point b — used to rotate the
// truck icon smoothly as it moves.
export function bearingBetween(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Closest point to `point` on segment a-b. Treats lat/lng as planar, which
// is a safe approximation for the short segment lengths in a route polyline.
function closestPointOnSegment(
  point: LatLng,
  a: LatLng,
  b: LatLng
): { point: LatLng; t: number } {
  const dx = b.longitude - a.longitude;
  const dy = b.latitude - a.latitude;

  if (dx === 0 && dy === 0) return { point: a, t: 0 };

  let t =
    ((point.longitude - a.longitude) * dx +
      (point.latitude - a.latitude) * dy) /
    (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  return {
    point: {
      latitude: a.latitude + t * dy,
      longitude: a.longitude + t * dx,
    },
    t,
  };
}

export interface SplitRouteResult {
  traveled: LatLng[]; // where the vehicle has already driven (render red)
  remaining: LatLng[]; // what's left of the route (render blue)
  nearestSegmentIndex: number;
  distanceFromRouteMeters: number;
}

/**
 * Splits a planned route polyline into a "traveled" part and a "remaining"
 * part based on the vehicle's current location. Projects onto each segment
 * so the split point sits exactly under the vehicle, not just on the
 * nearest vertex — this is what keeps the red/blue join looking clean
 * instead of jumping between waypoints.
 */
export function splitRouteByLocation(
  routePoints: LatLng[],
  currentLocation: LatLng
): SplitRouteResult {
  if (routePoints.length < 2) {
    return {
      traveled: [],
      remaining: routePoints,
      nearestSegmentIndex: 0,
      distanceFromRouteMeters: 0,
    };
  }

  let bestDistance = Infinity;
  let bestSegmentIndex = 0;
  let bestPoint: LatLng = routePoints[0];

  for (let i = 0; i < routePoints.length - 1; i++) {
    const { point: projected } = closestPointOnSegment(
      currentLocation,
      routePoints[i],
      routePoints[i + 1]
    );
    const distance = haversineDistance(currentLocation, projected);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestSegmentIndex = i;
      bestPoint = projected;
    }
  }

  const traveled = [...routePoints.slice(0, bestSegmentIndex + 1), bestPoint];
  const remaining = [bestPoint, ...routePoints.slice(bestSegmentIndex + 1)];

  return {
    traveled,
    remaining,
    nearestSegmentIndex: bestSegmentIndex,
    distanceFromRouteMeters: bestDistance,
  };
}
