import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Cleanup function — can be triggered manually for testing
export const cleanupExpiredVehicles = functions.https.onRequest(
  async (req, res) => {
    const db = admin.firestore();
    const now = new Date();

    console.log("Starting vehicle cleanup at:", now.toISOString());

    try {
      const expiredQuery = await db
        .collection("TrackedVehicles")
        .where("subscription.status", "==", "once_off")
        .where("subscription.autoDeleteFromTraccar", "==", true)
        .get();

      console.log(`Found ${expiredQuery.docs.length} once-off vehicles to check`);

      for (const doc of expiredQuery.docs) {
        const vehicle = doc.data();

        if (vehicle.subscription?.accessEndAt) {
          const accessEndTime = new Date(vehicle.subscription.accessEndAt);

          if (now > accessEndTime) {
            console.log(
              `Processing expired vehicle: ${doc.id} (deviceId: ${vehicle.deviceId})`
            );

            try {
              await deleteFromTraccar(vehicle.deviceId);

              const cooldownUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
              await doc.ref.update({
                "subscription.status": "deleted_from_traccar",
                "subscription.deletedAt": now.toISOString(),
                "subscription.cooldownUntil": cooldownUntil.toISOString(),
              });

              console.log(`✅ Successfully cleaned up vehicle: ${doc.id}`);
            } catch (error) {
              console.error(`❌ Failed to cleanup vehicle ${doc.id}:`, error);
            }
          } else {
            const remainingHours = Math.round(
              (accessEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)
            );
            console.log(`Vehicle ${doc.id} still has ${remainingHours} hours remaining`);
          }
        }
      }

      console.log("Vehicle cleanup completed successfully");
      res.status(200).send("Vehicle cleanup completed successfully");
    } catch (error) {
      console.error("❌ Vehicle cleanup failed:", error);
      res.status(500).send("Vehicle cleanup failed");
    }
  }
);

// Scheduled cleanup (runs every 30 minutes on the server)
export const scheduledCleanupExpiredVehicles = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async () => {
    const db = admin.firestore();
    const now = new Date();

    console.log("[Scheduler] Starting vehicle cleanup at:", now.toISOString());

    try {
      const expiredQuery = await db
        .collection("TrackedVehicles")
        .where("subscription.status", "==", "once_off")
        .where("subscription.autoDeleteFromTraccar", "==", true)
        .get();

      console.log(`[Scheduler] Found ${expiredQuery.docs.length} once-off vehicles to check`);

      for (const doc of expiredQuery.docs) {
        const vehicle = doc.data();

        if (vehicle.subscription?.accessEndAt) {
          const accessEndTime = new Date(vehicle.subscription.accessEndAt);

          if (now > accessEndTime) {
            console.log(`[Scheduler] Processing expired vehicle: ${doc.id} (deviceId: ${vehicle.deviceId})`);

            try {
              await deleteFromTraccar(vehicle.deviceId);

              const cooldownUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
              await doc.ref.update({
                "subscription.status": "deleted_from_traccar",
                "subscription.deletedAt": now.toISOString(),
                "subscription.cooldownUntil": cooldownUntil.toISOString(),
              });

              console.log(`[Scheduler] ✅ Successfully cleaned up vehicle: ${doc.id}`);
            } catch (error) {
              console.error(`[Scheduler] ❌ Failed to cleanup vehicle ${doc.id}:`, error);
            }
          }
        }
      }

      console.log("[Scheduler] Vehicle cleanup completed successfully");
    } catch (error) {
      console.error("[Scheduler] ❌ Vehicle cleanup failed:", error);
    }

    return null;
  });

async function deleteFromTraccar(deviceId: number): Promise<void> {
  const username = process.env.TRACCAR_USERNAME || "Kelvinyaya8@gmail.com";
  const password = process.env.TRACCAR_PASSWORD || "1zuxl2jn";
  const auth = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  const response = await fetch(`https://server.traccar.org/api/devices/${deviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete device ${deviceId} from Traccar: ${response.status} - ${errorText}`
    );
  }

  console.log(`🗑️ Successfully deleted device ${deviceId} from Traccar`);
}
