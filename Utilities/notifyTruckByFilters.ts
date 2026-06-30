import { where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import { sendPushNotification } from './pushNotification';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { TruckNeededType } from '@/types/types';

type LatLng = { latitude: number; longitude: number };

type Truck = {
  id?: string;
  expoPushToken?: string;
  locations?: string[];
  lastKnownLocation?: LatLng | null;

  // Truck economics settings (from TruckNotificationSettings)
  fuelEfficiency?: number;
  fuelPrice?: number;
  minimumProfitPercentage?: number;
  emptyReturnPercentage?: number;
  loadedReturnPercentage?: number;
  additionalDistanceBuffer?: number;
  notificationsEnabled?: boolean;
};

type LoadItem = {
  typeofLoad: string;
  origin: string;
  destination: string;
  rate: string;
  model?: string;
  currency: string;
  originCoords?: LatLng | null;
  destinationCoords?: LatLng | null;
};

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";

// --- Distance helper -------------------------------------------------

async function getDrivingDistanceKm(from: LatLng, to: LatLng): Promise<number | null> {
  try {
    const origin = `${from.latitude},${from.longitude}`;
    const destination = `${to.latitude},${to.longitude}`;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();

    if (data.status === 'OK' && data.routes?.length > 0) {
      const meters = data.routes[0].legs[0]?.distance?.value;
      if (typeof meters === 'number') return meters / 1000;
    }
    return null;
  } catch (err) {
    console.error('Directions API error:', err);
    return null;
  }
}

// --- Profit algorithm --------------------------------------------------

export type LoadMatchResult = {
  profitable: boolean;
  profitPercentage: number;
  deadheadDistance: number;
  tripDistance: number;
  emptyReturnDistance: number;
  totalDistance: number;
  fuelUsed: number;
  fuelCost: number;
  remaining: number;
};

export async function calculateLoadMatch(
  truck: Truck,
  loadRate: number,
  tripDistance: number,
  deadheadDistance: number
): Promise<LoadMatchResult | null> {
  const fuelEfficiency = truck.fuelEfficiency ?? 3;
  const fuelPrice = truck.fuelPrice ?? 1.7;
  const minimumProfitPercentage = truck.minimumProfitPercentage ?? 40;
  const emptyReturnPercentage = truck.emptyReturnPercentage ?? 100;
  const additionalDistanceBuffer = truck.additionalDistanceBuffer ?? 50;

  if (fuelEfficiency <= 0 || !loadRate || loadRate <= 0) return null;

  // Conservative: assume empty return at owner's configured %
  const emptyReturnDistance = (tripDistance * emptyReturnPercentage) / 100;

  const totalDistance = deadheadDistance + tripDistance + emptyReturnDistance + additionalDistanceBuffer;

  const fuelUsed = totalDistance / fuelEfficiency;
  const fuelCost = fuelUsed * fuelPrice;

  const remaining = loadRate - fuelCost;
  const profitPercentage = (remaining / loadRate) * 100;

  return {
    profitable: profitPercentage >= minimumProfitPercentage,
    profitPercentage,
    deadheadDistance,
    tripDistance,
    emptyReturnDistance,
    totalDistance,
    fuelUsed,
    fuelCost,
    remaining,
  };
}

// --- Main notifier -------------------------------------------------

export const notifyTrucksByFilters = async ({
  trucksNeeded,
  contractId,
  loadItem,
}: {
  trucksNeeded: TruckNeededType[];
  contractId?: string;
  loadItem: LoadItem;
}) => {
  const loadRate = Number(loadItem.rate) || 0;

  for (let i = 0; i < trucksNeeded.length; i++) {
    const need = trucksNeeded[i];
    const { cargoArea, truckType, tankerType, capacity, operationCountries } = need;

    showToast(`Now notifying: ${truckType?.name || "-"}, ${cargoArea?.name || "-"}, ${capacity?.name || "-"}`);

    let filters: any[] = [];

    if (truckType) filters.push(where("truckType", "==", truckType?.name));
    if (cargoArea) filters.push(where("cargoArea", "==", cargoArea?.name));
    if (tankerType) filters.push(where("tankerType", "==", tankerType?.name));
    if (capacity) filters.push(where("truckCapacity", "==", capacity?.name));
    filters.push(where("isApproved", "==", true));
    filters.push(where("approvalStatus", "==", "approved"));

    const truckResult = await fetchDocuments("Trucks", 50, undefined, filters);

    let matchingTrucks: Truck[] = [];

    if (truckResult && truckResult.data) {
      const trucksFetched = truckResult.data as Truck[];

      matchingTrucks = operationCountries.length > 0
        ? trucksFetched.filter(truck =>
            operationCountries.every(c => truck.locations?.includes(c))
          )
        : trucksFetched;
    }

    if (matchingTrucks.length === 0) {
      showToast(`No trucks found for Truck: ${truckType?.name}, ${cargoArea?.name}, ${capacity?.name}`);
      continue;
    }

    // Pre-calculate the trip distance once per filter group (same load for all trucks in this group)
    let tripDistance = 0;
    if (loadItem.originCoords && loadItem.destinationCoords) {
      const dist = await getDrivingDistanceKm(loadItem.originCoords, loadItem.destinationCoords);
      tripDistance = dist ?? 0;
    }

    const message = `${truckType?.name}, ${capacity?.name} , ${cargoArea?.name}  matched a load.\nLoad: ${loadItem.typeofLoad}, From ${loadItem.origin} to ${loadItem.destination}, Rate: ${loadItem.currency} ${loadItem.rate} (${loadItem.model}).\n\nTap to view more info , book, or bid.`;

    for (let truck of matchingTrucks) {
      if (!truck.expoPushToken) continue;

      // Skip trucks that turned notifications off in their settings
      if (truck.notificationsEnabled === false) continue;

      // If we don't have enough location/economics data, fall back to notifying without profit filtering
      const canCalculate =
        tripDistance > 0 &&
        truck.fuelEfficiency != null &&
        truck.fuelPrice != null;

      if (!canCalculate) {
        await sendPushNotification(
          truck.expoPushToken,
          `New Truck Request`,
          message,
          {
            pathname: '/BooksAndBids/ViewBidsAndBooks',
            params: {
              dbName: "bookings",
              dspRoute: "Booked by Carriers",
              contractId: contractId || null,
            }
          }
        );
        continue;
      }

      let deadheadDistance = 0;
      if (truck.lastKnownLocation && loadItem.originCoords) {
        const dist = await getDrivingDistanceKm(truck.lastKnownLocation, loadItem.originCoords);
        deadheadDistance = dist ?? 0;
      }

      const match = await calculateLoadMatch(truck, loadRate, tripDistance, deadheadDistance);

      if (!match || !match.profitable) continue;

      const profitMessage = `${message}\n\nEstimated profit: ${match.profitPercentage.toFixed(0)}%`;

      await sendPushNotification(
        truck.expoPushToken,
        `New Truck Request`,
        profitMessage,
        {
          pathname: '/BooksAndBids/ViewBidsAndBooks',
          params: {
            dbName: "bookings",
            dspRoute: "Booked by Carriers",
            contractId: contractId || null,
          }
        }
      );
    }
  }
};