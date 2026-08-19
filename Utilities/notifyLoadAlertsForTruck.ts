import { fetchDocuments } from "@/db/operations";
import { notifyUserById } from "./pushNotification";

interface MarketplaceTruck {
  id: string;

  truckType?: string;
  cargoArea?: string;
  truckCapacity?: string;
  tankerType?: string | null;

  locations?: string[];

  availabilityData?: {
    status?: string;
  };

  notificationSettings?: {
    notificationsEnabled?: boolean;
  };
}

interface AlertTruckRequirement {
  id?: number;
  name?: string;

  capacity?: {
    id?: number;
    name?: string;
  };

  cargoArea?: {
    id?: number;
    name?: string;
    description?: string;
    image?: number;
  };

  truckType?: {
    id?: number;
    name?: string;
  };

  tankerType?: {
    id?: number;
    name?: string;
  } | null;

  operationCountries?: string[];
}

interface LoadAlert {
  id: string;

  active?: boolean;

  userId?: string;

  userName?: string;

  trucksNotified?: AlertTruckRequirement[];

  ratePerKm?: number;

  pickupLocation?: any;

  dropoffLocation?: any;

  tripType?: "roundtrip" | "one-way" | string;

  createdAt?: string;
}

export const notifyLoadAlertsForTruck = async ({
  truck,
  origin,
  destination,
  ratePerKm,
  cargoId,
}: {
  truck: MarketplaceTruck;

  origin: string;

  destination: string;

  ratePerKm: number;

  cargoId?: string;
}) => {

  console.log("");
  console.log("====================================================");
  console.log("🔔 LOAD ALERT ENGINE START");
  console.log("====================================================");

  console.log("Cargo ID:", cargoId);
  console.log("Origin:", origin);
  console.log("Destination:", destination);
  console.log("Rate/km:", ratePerKm);

  console.log("");
  console.log("🚚 TRUCK BEING MATCHED:");
  console.log(
    JSON.stringify(truck, null, 2)
  );

  try {

    // ==================================================
    // 1. FETCH ALERTS
    // ==================================================

    console.log("");
    console.log(
      "📡 Fetching loadAlerts..."
    );

    const alertResult =
      await fetchDocuments(
        "loadAlerts",
        100,
        undefined
      );

    if (
      !alertResult?.data ||
      alertResult.data.length === 0
    ) {

      console.log(
        "⚠️ No load alerts found."
      );

      return;
    }

    const alerts =
      alertResult.data as LoadAlert[];

    console.log(
      `✅ ${alerts.length} total load alerts found`
    );

    // ==================================================
    // 2. ACTIVE ALERTS
    // ==================================================

    const activeAlerts =
      alerts.filter(
        (alert) =>
          alert.active === true
      );

    console.log(
      `🟢 Active alerts: ${activeAlerts.length}`
    );

    // ==================================================
    // 3. MATCH ALERTS
    // ==================================================

    const matchedAlerts: LoadAlert[] = [];

    for (
      const alert of activeAlerts
    ) {

      console.log("");
      console.log("----------------------------------------------------");
      console.log(
        `🔎 CHECKING ALERT ${alert.id}`
      );
      console.log("----------------------------------------------------");

      console.log(
        "User:",
        alert.userId
      );

      console.log(
        "User name:",
        alert.userName
      );

      console.log(
        "Alert rate:",
        alert.ratePerKm
      );

      console.log(
        "Truck requirements:",
        JSON.stringify(
          alert.trucksNotified,
          null,
          2
        )
      );

      // =================================================
      // USER ID
      // =================================================

      if (!alert.userId) {

        console.log(
          "❌ Rejected: alert has no userId"
        );

        continue;
      }

      // =================================================
      // TRUCK REQUIREMENTS
      // =================================================

      if (
        !alert.trucksNotified ||
        alert.trucksNotified.length === 0
      ) {

        console.log(
          "❌ Rejected: trucksNotified is empty"
        );

        continue;
      }

      let truckRequirementMatched =
        false;

      // =================================================
      // CHECK EACH trucksNotified ITEM
      // =================================================

      for (
        let index = 0;
        index < alert.trucksNotified.length;
        index++
      ) {

        const requirement =
          alert.trucksNotified[index];

        console.log("");
        console.log(
          `🚛 Checking trucksNotified[${index}]`
        );

        console.log(
          JSON.stringify(
            requirement,
            null,
            2
          )
        );

        let matches = true;

        // -----------------------------------------------
        // TRUCK TYPE
        // -----------------------------------------------

        const requiredTruckType =
          requirement.truckType?.name;

        const actualTruckType =
          truck.truckType;

        console.log(
          "Truck type:",
          requiredTruckType,
          "vs",
          actualTruckType
        );

        if (
          requiredTruckType &&
          requiredTruckType !== actualTruckType
        ) {

          console.log(
            "❌ Truck type mismatch"
          );

          matches = false;
        }

        // -----------------------------------------------
        // CAPACITY
        // -----------------------------------------------

        const requiredCapacity =
          requirement.capacity?.name;

        const actualCapacity =
          truck.truckCapacity;

        console.log(
          "Capacity:",
          requiredCapacity,
          "vs",
          actualCapacity
        );

        if (
          requiredCapacity &&
          requiredCapacity !== actualCapacity
        ) {

          console.log(
            "❌ Capacity mismatch"
          );

          matches = false;
        }

        // -----------------------------------------------
        // CARGO AREA
        // -----------------------------------------------

        const requiredCargoArea =
          requirement.cargoArea?.name;

        const actualCargoArea =
          truck.cargoArea;

        console.log(
          "Cargo area:",
          requiredCargoArea,
          "vs",
          actualCargoArea
        );

        if (
          requiredCargoArea &&
          requiredCargoArea !== actualCargoArea
        ) {

          console.log(
            "❌ Cargo area mismatch"
          );

          matches = false;
        }

        // -----------------------------------------------
        // TANKER TYPE
        // -----------------------------------------------

        const requiredTankerType =
          requirement.tankerType?.name;

        const actualTankerType =
          truck.tankerType;

        console.log(
          "Tanker:",
          requiredTankerType,
          "vs",
          actualTankerType
        );

        /*
         * null tankerType in the alert means
         * no tanker-specific requirement.
         */

        if (
          requiredTankerType &&
          requiredTankerType !== actualTankerType
        ) {

          console.log(
            "❌ Tanker type mismatch"
          );

          matches = false;
        }

        // -----------------------------------------------
        // COUNTRIES
        // -----------------------------------------------

        const requiredCountries =
          requirement.operationCountries ?? [];

        const truckCountries =
          truck.locations ?? [];

        console.log(
          "Required countries:",
          requiredCountries
        );

        console.log(
          "Truck countries:",
          truckCountries
        );

        if (
          requiredCountries.length > 0
        ) {

          /*
           * IMPORTANT:
           *
           * ANY overlap is enough.
           *
           * Alert:
           * ["Zimbabwe", "South Africa"]
           *
           * Truck:
           * ["Zimbabwe"]
           *
           * => MATCH
           */

          const countryMatch =
            requiredCountries.some(
              (country) =>
                truckCountries.includes(country)
            );

          console.log(
            "Country match:",
            countryMatch
          );

          if (!countryMatch) {

            console.log(
              "❌ Country mismatch"
            );

            matches = false;
          }
        } else {

          console.log(
            "✅ No country requirement"
          );
        }

        // -----------------------------------------------
        // FINAL REQUIREMENT RESULT
        // -----------------------------------------------

        if (matches) {

          console.log("");
          console.log(
            `🎯 trucksNotified[${index}] MATCHED`
          );

          truckRequirementMatched =
            true;

          break;

        } else {

          console.log("");
          console.log(
            `❌ trucksNotified[${index}] DID NOT MATCH`
          );
        }
      }

      // =================================================
      // TRUCK REQUIREMENT RESULT
      // =================================================

      if (!truckRequirementMatched) {

        console.log(
          "❌ Alert rejected: truck requirements did not match"
        );

        continue;
      }

      // =================================================
      // RATE
      // =================================================

      console.log("");
      console.log("💰 RATE CHECK");

      console.log(
        "Alert minimum:",
        alert.ratePerKm
      );

      console.log(
        "Load rate:",
        ratePerKm
      );

      if (
        alert.ratePerKm !== undefined &&
        ratePerKm < alert.ratePerKm
      ) {

        console.log(
          "❌ Alert rejected: rate too low"
        );

        continue;
      }

      console.log(
        "✅ Rate matched"
      );

      // =================================================
      // FULL MATCH
      // =================================================

     

      matchedAlerts.push(alert);
    }

    

    // ==================================================
    // 5. SEND NOTIFICATIONS
    // ==================================================

    if (
      matchedAlerts.length === 0
    ) {

    
      return;
    }

  

    for (
      const alert of matchedAlerts
    ) {

      try {

        if (!alert.userId) {
          continue;
        }

        const alertOrigin =
          alert.pickupLocation ||
          origin;

        const alertDestination =
          alert.dropoffLocation ||
          destination;

        const alertRate =
          alert.ratePerKm !== undefined
            ? alert.ratePerKm
            : ratePerKm;

      
        await notifyUserById(

          alert.userId,

          "🚚 Matching Truck Available",

          `A matching ${
            truck.truckType || "truck"
          } is now available for your load from ${
            alertOrigin.description
          } to ${
            alertDestination.description
          } at ${
            Number(alertRate).toFixed(2)
          }/km.`,

          {
            pathname:
              "/Loads/ViewLoadAlert",

            params: {

              alertId:
                alert.id,

              origin:
                alertOrigin,

              destination:
                alertDestination,

              ratePerKm:
                String(alertRate),

              truckId:
                truck.id,

              cargoId:
                cargoId ?? null,
            },
          },

          {
            alertId:
              alert.id,

            truckId:
              truck.id,

            origin:
              alertOrigin,

            destination:
              alertDestination,

            ratePerKm:
              alertRate,
          }
        );

        console.log("");
        console.log(
          "✅✅ NOTIFICATION SENT"
        );

        console.log(
          "Alert:",
          alert.id
        );

        console.log(
          "User:",
          alert.userId
        );

      } catch (error) {

        console.error("");
        console.error(
          "❌ NOTIFICATION FAILED"
        );

        console.error(
          "Alert:",
          alert.id
        );

        console.error(
          "User:",
          alert.userId
        );

        console.error(
          error
        );
      }
    }

    console.log("");
    console.log("====================================================");
    console.log("🏁 LOAD ALERT ENGINE FINISHED");
    console.log("====================================================");

  } catch (error) {

    console.error("");
    console.error(
      "💥 LOAD ALERT ENGINE ERROR"
    );

    console.error(error);
  }
};