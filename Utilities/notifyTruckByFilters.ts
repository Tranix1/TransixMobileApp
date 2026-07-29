import { where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import { notifyUserById, sendPushNotification } from './pushNotification';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { TruckNeededType } from '@/types/types';
import { trackAssignmentCompleted, trackTruckRecommended } from '@/services/analytics/appAnalytics';
import { useAuth } from '@/context/AuthContext';
import { incrementRecommendedTrucksOrg } from '@/services/analytics/organizationAnalytics';

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
  cargoId,
  loadItem,
}: {
  trucksNeeded: TruckNeededType[];
  cargoId?: string;
  loadItem: LoadItem;
}) => {
  const loadRatePerKm = loadItem.ratePerKm || 0;

  for (const need of trucksNeeded) {
    const { cargoArea, truckType, tankerType, capacity, operationCountries } = need;

    const { user, currentRole } = useAuth()

    // 1. Query setup

    const filters = [
      where("truckType", "==", truckType),
      where("cargoArea", "==", cargoArea),
      where("truckCapacity", "==", capacity),
      where("availabilityData.status", "==", "AVAILABLE"),
      where("notificationSettings.notificationsEnabled", "==", true),
    ];

    if (tankerType) {
      filters.push(where("tankerType", "==", tankerType));
    }
    const truckResult = await fetchDocuments("truckMarketplaceProfile", 100, undefined, filters);

    if (!truckResult?.data || truckResult.data.length === 0) {
      continue;
    }

    const matchedTrucks = (truckResult.data as MarketplaceTruck[]).filter((truck) => {
      // Minimum rate
      if (
        loadRatePerKm <
        (truck.notificationSettings?.minRatePerKm ?? 0)
      ) {
        return false;
      }

      // Countries
      if (operationCountries.length > 0) {
        const truckCountries = truck.locations ?? [];

        const matchesCountry = operationCountries.every(country =>
          truckCountries.includes(country)
        );

        if (!matchesCountry) {
          return false;
        }
      }

      return true;
    });


    const daySinceSignup = (Date.now() - user?.createdAt!) / (1000 * 60 * 60 * 24)
    const accountAge = daySinceSignup < 30 ? "new" : daySinceSignup < 90 ? "active" : "established"

    const analyticsOrganizationIdForApp = currentRole?.organizationId || currentRole?.fleetId;
    if (analyticsOrganizationIdForApp && (currentRole?.accType === 'fleet' || currentRole?.accType === 'brokerage')) {
      const context = {
        userId: user?.uid,
        accountAge: accountAge,
        organizationId: analyticsOrganizationIdForApp,
        organizationProfileId: analyticsOrganizationIdForApp,
        organizationType: currentRole?.accType,
        role: currentRole?.userRole,
        accountType: currentRole?.accType,
        metadata: {
          loadId: cargoId,
          trucksData: {
            cargoArea: `${cargoArea}`,
            truckType: `${truckType}`,
            numberOfTrucksRecommended: matchedTrucks.length,
            truckCapacity: `${capacity}`,
            operatingCountries: operationCountries as string[],
            tankerType: `${tankerType}`,

          }
        }
      };

      void trackTruckRecommended(context).catch(console.error);

      void incrementRecommendedTrucksOrg(`${currentRole.organizationId}`,).catch(console.error);
    }


    // 2. Send notifications
    for (const truck of matchedTrucks) {


      try {
        const dispatcherId =
          truck.notificationSettings?.assignments?.dispatcher?.id;

        if (!dispatcherId) {
          console.log(`Truck ${truck.id} has no dispatcher assigned.`);
          continue;
        }

        await notifyUserById(
          dispatcherId,
          "🚚 New Load Match",
          `${loadItem.truckType} load available from ${loadItem.origin} to ${loadItem.destination}. ${loadItem.currency} ${loadItem.rate.toLocaleString()} (${loadItem.ratePerKm}/km). Tap to review and book if interested.`,
          {
            pathname: "/BooksAndBids/ViewBidsAndBooks",
            params: {
              dbName: "bookings",
              dspRoute: "Booked by Carriers",
              contractId: cargoId ?? null,
            },
          },
          {
            cargoId,
            truckId: truck.id,
          }
        );
      } catch (error) {
        console.error(`Failed to notify truck ${truck.id}:`, error);
      }
    }
  }

  showToast("Notifications dispatched to matching trucks.");
};