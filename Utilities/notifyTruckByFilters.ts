import { where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import { sendPushNotification } from './pushNotification';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { TruckNeededType } from '@/types/types';

/**
 * Interfaces representing the existing database architecture
 */
interface MarketplaceTruck {
  id: string;
  truckType: string;
  cargoArea: string;
  truckCapacity: string;
  tankerType: string;
  locations: string[];
  notificationSettings: {
    notificationsEnabled: boolean;
    notifyRoles: ('driver' | 'dispatcher')[];
    minRatePerKm: number;
    assignments: {
      driver: {
        id: string;
        name: string;
        phoneNumber: string;
        profilePhoto: string;
        expoPushToken: string;
      };
      dispatcher: {
        id: string;
        name: string;
        expoPushToken: string;
      };
    };
  };
  availabilityData: {
    status: string;
  };
}

interface LoadItem {
  truckType: string;
  cargoArea: string;
  capacity: string;
  tankerType: string;
  operationCountries: string[];
  ratePerKm: number;
  origin: string;
  destination: string;
  currency: string;
  rate: string;
  model: string;
}

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

/**
 * Notifies trucks based on marketplace profile filters and business rules.
 */
export const notifyTrucksByFilters = async ({
  trucksNeeded,
  contractId,
  loadItem,
}: {
  trucksNeeded: TruckNeededType[];
  contractId?: string;
  loadItem: LoadItem;
}) => {
  const loadRatePerKm = loadItem.ratePerKm || 0;

  for (const need of trucksNeeded) {
    const { cargoArea, truckType, tankerType, capacity, operationCountries } = need;

    // 1. Query setup
    const filters = [
      where("truckType", "==", truckType),
      where("cargoArea", "==", cargoArea),
      where("truckCapacity", "==", capacity),
      where("tankerType", "==", tankerType),
    ];

    const truckResult = await fetchDocuments("truckMarketplaceProfile", 100, undefined, filters);
    
    if (!truckResult?.data || truckResult.data.length === 0) {
      continue;
    }

    const matchedTrucks = (truckResult.data as MarketplaceTruck[]).filter((truck) => {
      // Rule 3: Skip if not available
      if (truck.availabilityData?.status !== "AVAILABLE") return false;

      // Rule 4: Skip if notifications disabled
      if (truck.notificationSettings?.notificationsEnabled === false) return false;

      // Rule 5: Rate filtering
      if (loadRatePerKm < (truck.notificationSettings?.minRatePerKm || 0)) return false;

      // Rule 2: Country filtering
      if (operationCountries.length > 0) {
        const matchesCountry = operationCountries.every(c => truck.locations?.includes(c));
        if (!matchesCountry) return false;
      }

      return true;
    });

    // 2. Send notifications
    for (const truck of matchedTrucks) {
      try {
        const { notifyRoles, assignments } = truck.notificationSettings;
        const tokens: string[] = [];

        if (notifyRoles.includes('driver') && assignments.driver?.expoPushToken) {
          tokens.push(assignments.driver.expoPushToken);
        }
        if (notifyRoles.includes('dispatcher') && assignments.dispatcher?.expoPushToken) {
          tokens.push(assignments.dispatcher.expoPushToken);
        }

        const message = `New load matched: ${loadItem.truckType} in ${loadItem.origin} to ${loadItem.destination}. Rate: ${loadItem.currency} ${loadItem.rate}`;

        for (const token of tokens) {
          await sendPushNotification(
            token,
            "New Load Available",
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
        }
      } catch (error) {
        console.error(`Failed to notify truck ${truck.id}:`, error);
      }
    }
  }

  showToast("Notifications dispatched to matching trucks.");
};