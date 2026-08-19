import { fetchDocuments } from "@/db/operations";
import { notifyUserById } from "./pushNotification";
import { ToastAndroid, Platform, Alert } from "react-native";
import { TruckNeededType } from "@/types/types";
import { incrementRecommendedTrucksOrg } from "@/services/analytics/organizationAnalytics";
import { notifyLoadAlertsForTruck } from "./notifyLoadAlertsForTruck";

interface MarketplaceTruck {
  id: string;

  truckType: string;
  cargoArea: string;
  truckCapacity: string;
  tankerType?: string | null;

  locations: string[];

  notificationSettings?: {
    notificationsEnabled?: boolean;
    notifyRoles?: ("driver" | "dispatcher")[];
    minRatePerKm?: number;

    assignments?: {
      driver?: {
        id: string;
        name: string;
        phoneNumber: string;
        profilePhoto: string;
        expoPushToken: string;
      };

      dispatcher?: {
        id: string;
        name: string;
        expoPushToken: string;
      };
    };
  };

  availabilityData?: {
    status?: string;
  };
}

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

export const notifyTrucksByFilters = async ({
  trucksNeeded,
  cargoId,
  loadItem,
  user,
  currentRole,
}: {
  trucksNeeded: TruckNeededType[];
  cargoId?: string;
  loadItem: any;
  user: any;
  currentRole: any;
}) => {
  const loadRatePerKm = Number(loadItem.ratePerKm) || 0;

  console.log("");
  console.log("====================================================");
  console.log("🚛 NOTIFICATION DISPATCH STARTED");
  console.log("====================================================");
  console.log("Cargo ID:", cargoId);
  console.log("Origin:", loadItem.origin);
  console.log("Destination:", loadItem.destination);
  console.log("Rate/km:", loadRatePerKm);
  console.log(
    "Trucks needed:",
    JSON.stringify(trucksNeeded, null, 2)
  );

  for (let needIndex = 0; needIndex < trucksNeeded.length; needIndex++) {
    const need = trucksNeeded[needIndex];

    const {
      cargoArea,
      truckType,
      tankerType,
      capacity,
      operationCountries = [],
    } = need;

    console.log("");
    console.log("====================================================");
    console.log(`🚛 PROCESSING TRUCK REQUIREMENT ${needIndex + 1}`);
    console.log("====================================================");

    console.log(
      "Truck requirement:",
      JSON.stringify(need, null, 2)
    );

    // ==================================================
    // 1. LOAD ALERTS
    //
    // IMPORTANT:
    // This happens BEFORE marketplace fetching.
    //
    // Therefore marketplace failure can NEVER stop
    // load-alert notifications.
    // ==================================================

    console.log("");
    console.log("🔔 STEP 1: CHECKING LOAD ALERTS");
    console.log("🔔 Marketplace is NOT required for this step.");

    try {
      /*
       * Build a virtual truck from the truck requirement
       * of the load.
       *
       * This is intentional:
       *
       * The load requires:
       *   Triaxle
       *   34T
       *   Flat deck
       *   Zimbabwe
       *
       * A load alert containing those same requirements
       * should receive the notification.
       */

      const alertCheckTruck: MarketplaceTruck = {
        id: `load-requirement-${cargoId ?? "unknown"}-${needIndex}`,

        truckType: truckType?.name || "",
        cargoArea: cargoArea?.name || "",
        truckCapacity: capacity?.name || "",
        tankerType: tankerType?.name ?? null,

        locations: operationCountries ?? [],

        availabilityData: {
          status: "AVAILABLE",
        },

        notificationSettings: {
          notificationsEnabled: true,
        },
      };

      console.log(
        "🚚 Virtual truck used for load-alert matching:"
      );

      console.log(
        JSON.stringify(alertCheckTruck, null, 2)
      );

      await notifyLoadAlertsForTruck({
        truck: alertCheckTruck,

        origin: loadItem.origin || "",

        destination: loadItem.destination || "",

        ratePerKm: loadRatePerKm,

        cargoId,
      });

      console.log(
        "✅ LOAD ALERT CHECK COMPLETED"
      );

    } catch (error) {
      /*
       * CRITICAL:
       *
       * If load-alert processing itself fails,
       * marketplace notifications should STILL continue.
       */

      console.error("");
      console.error(
        "❌ LOAD ALERT PROCESSING FAILED"
      );

      console.error(error);

      console.error(
        "⚠️ Continuing to marketplace notifications..."
      );
    }

    // ==================================================
    // 2. MARKETPLACE
    //
    // Completely independent from load alerts.
    // ==================================================

    console.log("");
    console.log("🔎 STEP 2: FETCHING MARKETPLACE TRUCKS");

    let truckResult;

    try {
      truckResult = await fetchDocuments(
        "truckMarketplaceProfile",
        100,
        undefined
      );

      console.log(
        "✅ Marketplace fetch completed"
      );

    } catch (error) {
      console.error("");
      console.error(
        "❌ MARKETPLACE FETCH FAILED"
      );

      console.error(error);

      console.error(
        "⚠️ Load alerts were already checked successfully."
      );

      continue;
    }

    if (
      !truckResult?.data ||
      truckResult.data.length === 0
    ) {
      console.log("");
      console.log(
        "⚠️ NO MARKETPLACE TRUCKS FOUND"
      );

      console.log(
        "⚠️ This does NOT affect load alerts."
      );

      continue;
    }

    console.log(
      `✅ Marketplace trucks found: ${truckResult.data.length}`
    );

    // ==================================================
    // 3. FIND MATCHING MARKETPLACE TRUCKS
    // ==================================================

    console.log("");
    console.log("🔎 STEP 3: MATCHING MARKETPLACE TRUCKS");

    const matchedTrucks =
      (truckResult.data as MarketplaceTruck[]).filter(
        (truck) => {

          if (
            truckType?.name &&
            truck.truckType !== truckType.name
          ) {
            return false;
          }

          if (
            cargoArea?.name &&
            truck.cargoArea !== cargoArea.name
          ) {
            return false;
          }

          if (
            capacity?.name &&
            truck.truckCapacity !== capacity.name
          ) {
            return false;
          }

          if (
            tankerType?.name &&
            truck.tankerType !== tankerType.name
          ) {
            return false;
          }

          if (
            truck.availabilityData?.status &&
            truck.availabilityData.status !== "AVAILABLE"
          ) {
            return false;
          }

          if (
            truck.notificationSettings?.notificationsEnabled === false
          ) {
            return false;
          }

          const minimumRate =
            truck.notificationSettings?.minRatePerKm ?? 0;

          if (
            loadRatePerKm < minimumRate
          ) {
            return false;
          }

          if (
            operationCountries.length > 0
          ) {
            const truckCountries =
              truck.locations ?? [];

            /*
             * ANY country overlap.
             *
             * Example:
             *
             * Required:
             * ["Zimbabwe", "South Africa"]
             *
             * Truck:
             * ["Zimbabwe"]
             *
             * => MATCH
             */

            const countryMatch =
              operationCountries.some(
                (country) =>
                  truckCountries.includes(country)
              );

            if (!countryMatch) {
              return false;
            }
          }

          return true;
        }
      );

    console.log(
      `🎯 Matching marketplace trucks: ${matchedTrucks.length}`
    );

    // ==================================================
    // 4. ANALYTICS
    // ==================================================

    const createdAt =
      typeof user?.createdAt === "number"
        ? user.createdAt
        : Date.now();

    const daysSinceSignup =
      (Date.now() - createdAt) /
      (1000 * 60 * 60 * 24);

    const accountAge =
      daysSinceSignup < 30
        ? "new"
        : daysSinceSignup < 90
        ? "active"
        : "established";

    const analyticsOrganizationId =
      currentRole?.organizationId ||
      currentRole?.fleetId;

    if (
      analyticsOrganizationId &&
      (
        currentRole?.accType === "fleet" ||
        currentRole?.accType === "brokerage"
      )
    ) {
      void incrementRecommendedTrucksOrg(
        analyticsOrganizationId
      ).catch(console.error);
    }

    // ==================================================
    // 5. NOTIFY MARKETPLACE MATCHES
    // ==================================================

    console.log("");
    console.log(
      `📤 Sending marketplace notifications: ${matchedTrucks.length}`
    );

    for (const truck of matchedTrucks) {
      try {

        const dispatcherId =
          truck.notificationSettings
            ?.assignments
            ?.dispatcher
            ?.id;

        if (!dispatcherId) {
          console.log(
            `⚠️ Truck ${truck.id} has no dispatcher`
          );

          continue;
        }

        console.log(
          `📤 Notifying dispatcher ${dispatcherId}`
        );

        await notifyUserById(
          dispatcherId,

          "🚚 New Load Match",

          `${loadItem.typeofLoad || "Load"} available from ${
            loadItem.origin
          } to ${
            loadItem.destination
          }. ${
            loadItem.currency || ""
          } ${
            Number(loadItem.rate || 0).toLocaleString()
          } (${
            loadRatePerKm.toFixed(2)
          }/km). Tap to review.`,

          {
            pathname:
              "/BooksAndBids/ViewBidsAndBooks",

            params: {
              dbName: "bookings",

              dspRoute:
                "Booked by Carriers",

              contractId:
                cargoId ?? null,
            },
          },

          {
            cargoId,

            truckId:
              truck.id,
          }
        );

        console.log(
          `✅ Dispatcher notification sent for truck ${truck.id}`
        );

      } catch (error) {

        console.error(
          `❌ Failed marketplace notification for truck ${truck.id}:`,
          error
        );

        /*
         * Continue with the next truck.
         */
      }
    }
  }

  console.log("");
  console.log("====================================================");
  console.log("🏁 NOTIFICATION DISPATCH FINISHED");
  console.log("====================================================");

  showToast(
    "Notifications dispatched to matching trucks."
  );
};