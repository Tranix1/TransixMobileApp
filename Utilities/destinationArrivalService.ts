import {
    updateDocument,
    readById,
    query,
    collection,
    where,
    getDocs
} from '@/db/operations';
import {
    hasReachedDestination,
    getLoadLocationData,
    LocationCoordinates
} from './locationTrackerUtils';

export interface ArrivalStatus {
    hasArrived: boolean;
    arrivalTime?: string;
    arrivalCoordinates?: {
        latitude: number;
        longitude: number;
    };
    distanceToDestination?: number;
}

/**
 * Check if a truck has reached its destination for a specific load request
 */
export const checkDestinationArrival = async (
    loadRequestId: string,
    truckLat: number,
    truckLon: number
): Promise<ArrivalStatus> => {
    try {
        // Get load request data
        const loadRequest = await readById('loadRequests', loadRequestId);
        if (!loadRequest) {
            return { hasArrived: false };
        }

        // Get load location data
        const loadData = await getLoadLocationData(loadRequest.cargoId);
        if (!loadData || !loadData.destinationCoordinates) {
            return { hasArrived: false };
        }

        // Check if truck has reached destination
        const hasArrived = hasReachedDestination(
            truckLat,
            truckLon,
            loadData.destinationCoordinates
        );

        if (hasArrived) {
            // Update load request with arrival status
            await updateDocument('loadRequests', loadRequestId, {
                destinationReached: true,
                destinationReachedAt: Date.now().toString(),
                destinationReachedCoordinates: {
                    latitude: truckLat,
                    longitude: truckLon
                },
                trackerShared: false, // Remove tracker access when destination is reached
                trackerRemovedAt: Date.now().toString(),
                trackerRemovedReason: 'Destination reached'
            });

            return {
                hasArrived: true,
                arrivalTime: Date.now().toString(),
                arrivalCoordinates: {
                    latitude: truckLat,
                    longitude: truckLon
                }
            };
        }

        return { hasArrived: false };
    } catch (error) {
        console.error('Error checking destination arrival:', error);
        return { hasArrived: false };
    }
};

/**
 * Check all active load requests for destination arrival
 * This function can be called periodically to check all active loads
 */
export const checkAllActiveLoadsForArrival = async (): Promise<{
    checkedCount: number;
    arrivalsCount: number;
    arrivals: string[];
}> => {
    try {
        // Get all active load requests
        const activeLoadsQuery = query(
            collection(db, 'loadRequests'),
            where('status', '==', 'Booked'),
            where('trackerShared', '==', true),
            where('destinationReached', '==', false)
        );

        const snapshot = await getDocs(activeLoadsQuery);
        const arrivals: string[] = [];
        let checkedCount = 0;

        for (const doc of snapshot.docs) {
            const loadRequest = doc.data();
            checkedCount++;

            // For now, we can't get real-time truck location without a tracking service
            // This would need to be integrated with your actual tracking system
            // For demonstration, we'll just log that we would check this load
            console.log(`Would check arrival for load request: ${doc.id}`);

            // In a real implementation, you would:
            // 1. Get the current truck location from your tracking service
            // 2. Call checkDestinationArrival with the actual coordinates
            // 3. Handle the arrival status
        }

        return {
            checkedCount,
            arrivalsCount: arrivals.length,
            arrivals
        };
    } catch (error) {
        console.error('Error checking all active loads for arrival:', error);
        return {
            checkedCount: 0,
            arrivalsCount: 0,
            arrivals: []
        };
    }
};

/**
 * Get arrival status for a load request
 */
export const getArrivalStatus = async (loadRequestId: string): Promise<ArrivalStatus | null> => {
    try {
        const loadRequest = await readById('loadRequests', loadRequestId);
        if (!loadRequest) return null;

        if (loadRequest.destinationReached) {
            return {
                hasArrived: true,
                arrivalTime: loadRequest.destinationReachedAt,
                arrivalCoordinates: loadRequest.destinationReachedCoordinates
            };
        }

        return { hasArrived: false };
    } catch (error) {
        console.error('Error getting arrival status:', error);
        return null;
    }
};

/**
 * Calculate distance to destination for a load request
 */
export const getDistanceToDestination = async (
    loadRequestId: string,
    currentLat: number,
    currentLon: number
): Promise<number | null> => {
    try {
        const loadRequest = await readById('loadRequests', loadRequestId);
        if (!loadRequest) return null;

        const loadData = await getLoadLocationData(loadRequest.cargoId);
        if (!loadData || !loadData.destinationCoordinates) return null;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = (loadData.destinationCoordinates.latitude - currentLat) * Math.PI / 180;
        const dLon = (loadData.destinationCoordinates.longitude - currentLon) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(currentLat * Math.PI / 180) * Math.cos(loadData.destinationCoordinates.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    } catch (error) {
        console.error('Error calculating distance to destination:', error);
        return null;
    }
};

/**
 * Send arrival notification to load owner
 */
export const sendArrivalNotification = async (
    loadRequestId: string,
    arrivalCoordinates: { latitude: number; longitude: number }
): Promise<boolean> => {
    try {
        const loadRequest = await readById('loadRequests', loadRequestId);
        if (!loadRequest) return false;

        // Here you would integrate with your notification system
        // For now, we'll just log the notification
        console.log(`Arrival notification sent to load owner ${loadRequest.loadOwnerId} for load ${loadRequestId}`);

        // You could also update a notifications collection or send push notifications
        // await sendPushNotification(loadRequest.loadOwnerId, {
        //     title: 'Load Arrived!',
        //     body: `Your load has arrived at its destination.`,
        //     data: { loadRequestId, arrivalCoordinates }
        // });

        return true;
    } catch (error) {
        console.error('Error sending arrival notification:', error);
        return false;
    }
};

/**
 * Mark load as completed and clean up tracking data
 */
export const completeLoadDelivery = async (loadRequestId: string): Promise<boolean> => {
    try {
        await updateDocument('loadRequests', loadRequestId, {
            status: 'Delivered',
            deliveredAt: Date.now().toString(),
            completed: true
        });

        console.log(`Load ${loadRequestId} marked as delivered`);
        return true;
    } catch (error) {
        console.error('Error completing load delivery:', error);
        return false;
    }
};













