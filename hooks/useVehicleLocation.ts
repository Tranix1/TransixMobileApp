import { useCallback, useEffect, useRef, useState } from "react";

export type VehicleStatus =
  | "TO_PICKUP" // heading to the loading point, not yet loaded
  | "AT_PICKUP" // arrived at loading point, loading
  | "TO_DROPOFF" // on route with the load
  | "DELIVERED"
  | "IDLE";

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number; // degrees, 0 = north
  speedKph?: number;
  status: VehicleStatus;
  updatedAt: string;
}

// TODO: replace with your real "get vehicle by id" endpoint
async function fetchVehicleById(vehicleId: string): Promise<VehicleLocation> {
  const res = await fetch(
    `https://YOUR_API_HOST/api/vehicles/${vehicleId}/location`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch vehicle ${vehicleId}: ${res.status}`);
  }
  return res.json();
}

interface UseVehicleLocationOptions {
  pollIntervalMs?: number; // default 8s
  enabled?: boolean;
}

export function useVehicleLocation(
  vehicleId: string | undefined,
  { pollIntervalMs = 8000, enabled = true }: UseVehicleLocationOptions = {}
) {
  const [location, setLocation] = useState<VehicleLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const data = await fetchVehicleById(vehicleId);
      if (isMounted.current) {
        setLocation(data);
        setError(null);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err?.message ?? "Failed to fetch vehicle location");
      }
    }
  }, [vehicleId]);

  useEffect(() => {
    isMounted.current = true;
    if (!vehicleId || !enabled) return;

    refresh();
    intervalRef.current = setInterval(refresh, pollIntervalMs);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [vehicleId, enabled, pollIntervalMs, refresh]);

  return { location, error, refresh };
}
