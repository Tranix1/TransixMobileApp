import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

interface VehicleDocument {
  id: string;
  deviceId: number;
  imei: string;
  customerEmail: string;
  subscription: {
    status: string;
    accessEndAt?: string;
    autoDeleteFromTraccar?: boolean;
    isOnceOff?: boolean;
  };
}

export class VehicleLifecycleService {
  private static readonly TRACCAR_USERNAME = "Kelvinyaya8@gmail.com";
  private static readonly TRACCAR_PASSWORD = "1zuxl2jn";
  private static readonly TRACCAR_AUTH = "Basic " + btoa(`${this.TRACCAR_USERNAME}:${this.TRACCAR_PASSWORD}`);

  /**
   * Check for expired once-off vehicles and delete them from Traccar
   */
  static async processExpiredOnceOffVehicles(): Promise<void> {
    try {
      const now = new Date();
      const vehiclesRef = collection(db, 'TrackedVehicles');
      
      // Query for once-off vehicles that have expired
      const expiredQuery = query(
        vehiclesRef,
        where('subscription.status', '==', 'once_off'),
        where('subscription.autoDeleteFromTraccar', '==', true)
      );

      const snapshot = await getDocs(expiredQuery);
      
      for (const docSnapshot of snapshot.docs) {
        const vehicle = { id: docSnapshot.id, ...docSnapshot.data() } as VehicleDocument;
        
        if (vehicle.subscription.accessEndAt) {
          const accessEndTime = new Date(vehicle.subscription.accessEndAt);
          
          if (now > accessEndTime) {
            console.log(`Processing expired vehicle: ${vehicle.id}`);
            await this.deleteVehicleFromTraccar(vehicle);
            await this.markVehicleAsDeleted(vehicle.id);
          }
        }
      }
    } catch (error) {
      console.error('Error processing expired once-off vehicles:', error);
    }
  }

  /**
   * Delete a vehicle from Traccar
   */
  private static async deleteVehicleFromTraccar(vehicle: VehicleDocument): Promise<void> {
    try {
      const response = await fetch(`https://server.traccar.org/api/devices/${vehicle.deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': this.TRACCAR_AUTH,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete device from Traccar: ${response.status}`);
      }

      console.log(`Successfully deleted device ${vehicle.deviceId} from Traccar`);
    } catch (error) {
      console.error(`Error deleting device ${vehicle.deviceId} from Traccar:`, error);
      throw error;
    }
  }

  /**
   * Mark vehicle as deleted in Firebase (update status, don't delete document)
   */
  private static async markVehicleAsDeleted(vehicleId: string): Promise<void> {
    try {
      const vehicleRef = doc(db, 'TrackedVehicles', vehicleId);
      await updateDoc(vehicleRef, {
        'subscription.status': 'deleted_from_traccar',
        'subscription.deletedAt': new Date().toISOString(),
      });
      
      console.log(`Marked vehicle ${vehicleId} as deleted in Firebase`);
    } catch (error) {
      console.error(`Error marking vehicle ${vehicleId} as deleted:`, error);
      throw error;
    }
  }

  /**
   * Re-add a vehicle to Traccar (for once-off users who want to track again)
   */
  static async reAddVehicleToTraccar(vehicleId: string): Promise<{ success: boolean; deviceId?: number; error?: string }> {
    try {
      const vehicleRef = doc(db, 'TrackedVehicles', vehicleId);
      const vehicleDoc = await getDocs(query(collection(db, 'TrackedVehicles'), where('__name__', '==', vehicleId)));
      
      if (vehicleDoc.empty) {
        return { success: false, error: 'Vehicle not found' };
      }

      const vehicle = vehicleDoc.docs[0].data() as any;
      
      // Validate required fields for Traccar
      if (!vehicle.imei || !vehicle.vehicleName) {
        return { success: false, error: 'Missing IMEI or vehicle name' };
      }
      
      // Re-add to Traccar using stored IMEI and vehicle name
      const traccarResponse = await fetch('https://server.traccar.org/api/devices', {
        method: 'POST',
        headers: {
          'Authorization': this.TRACCAR_AUTH,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: vehicle.vehicleName,
          uniqueId: vehicle.imei,
          category: vehicle.vehicleCategory + (vehicle.vehicleSubType ? ` - ${vehicle.vehicleSubType}` : ''),
        }),
      });

      if (!traccarResponse.ok) {
        const errorBody = await traccarResponse.text();
        console.error('Traccar API Error:', traccarResponse.status, errorBody);
        throw new Error(`Failed to re-add device to Traccar: ${traccarResponse.status}`);
      }

      const traccarDevice = await traccarResponse.json();
      const newDeviceId = traccarDevice.id;

      if (!newDeviceId) {
        throw new Error('Device ID not returned from Traccar');
      }

      // Update Firebase with new device ID and reset access time
      const accessStartAt = new Date();
      const accessEndAt = new Date(accessStartAt);
      accessEndAt.setHours(accessEndAt.getHours() + 6); // 6 hours access

      await updateDoc(vehicleRef, {
        deviceId: newDeviceId,
        'subscription.status': 'once_off',
        'subscription.accessStartAt': accessStartAt.toISOString(),
        'subscription.accessEndAt': accessEndAt.toISOString(),
        'subscription.autoDeleteFromTraccar': true,
        'subscription.deletedAt': null,
      });

      console.log(`Successfully re-added vehicle ${vehicle.vehicleName} (IMEI: ${vehicle.imei}) to Traccar with device ID: ${newDeviceId}`);
      return { success: true, deviceId: newDeviceId };
    } catch (error) {
      console.error('Error re-adding vehicle to Traccar:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if a vehicle's once-off access is still valid
   */
  static isOnceOffAccessValid(vehicle: any): boolean {
    if (!vehicle.subscription?.isOnceOff || vehicle.subscription.status !== 'once_off') {
      return false;
    }

    if (!vehicle.subscription.accessEndAt) {
      return false;
    }

    const now = new Date();
    const accessEndTime = new Date(vehicle.subscription.accessEndAt);
    
    return now <= accessEndTime;
  }

  /**
   * Get remaining access time for once-off vehicles
   */
  static getRemainingAccessTime(vehicle: any): string | null {
    if (!this.isOnceOffAccessValid(vehicle)) {
      return null;
    }

    const now = new Date();
    const accessEndTime = new Date(vehicle.subscription.accessEndAt);
    const remainingMs = accessEndTime.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return null;
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }
}

// Auto-run cleanup every 30 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

export const startVehicleLifecycleMonitoring = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Run immediately
  VehicleLifecycleService.processExpiredOnceOffVehicles();
  
  // Then run every 30 minutes
  cleanupInterval = setInterval(() => {
    VehicleLifecycleService.processExpiredOnceOffVehicles();
  }, 30 * 60 * 1000); // 30 minutes
};

export const stopVehicleLifecycleMonitoring = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};
