import { updateDocument, readById } from '@/db/operations';

export interface TrackerInfo {
    trackerId: string;
    trackerName: string;
    trackerImei: string;
    hasTracker: boolean;
    trackerStatus: 'available' | 'in_use' | 'offline';
    trackerShared: boolean;
    trackerSharedAt?: string;
    trackerSharedBy?: string;
}

/**
 * Generate a unique tracker ID for a truck
 */
export const generateTrackerId = (truckId: string): string => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `TRK_${truckId}_${timestamp}_${randomSuffix}`.toUpperCase();
};

/**
 * Get tracker information for a truck
 */
export const getTruckTrackerInfo = async (truckId: string): Promise<TrackerInfo | null> => {
    try {
        const truck = await readById('Trucks', truckId);
        if (!truck) return null;

        return {
            trackerId: truck.trackerId || '',
            trackerName: truck.trackerName || '',
            trackerImei: truck.trackerImei || '',
            hasTracker: truck.hasTracker || false,
            trackerStatus: truck.trackerStatus || 'offline',
            trackerShared: truck.trackerShared || false,
            trackerSharedAt: truck.trackerSharedAt,
            trackerSharedBy: truck.trackerSharedBy
        };
    } catch (error) {
        console.error('Error getting truck tracker info:', error);
        return null;
    }
};

/**
 * Share tracker with load owner
 */
export const shareTrackerWithLoadOwner = async (
    loadRequestId: string,
    truckId: string,
    trackerId: string
): Promise<boolean> => {
    try {
        await updateDocument('loadRequests', loadRequestId, {
            trackerShared: true,
            trackerSharedAt: Date.now().toString(),
            trackerSharedBy: truckId,
            trackerId: trackerId
        });

        return true;
    } catch (error) {
        console.error('Error sharing tracker:', error);
        return false;
    }
};

/**
 * Check if user is truck owner for a load request
 */
export const isTruckOwnerForLoad = (loadRequest: any, userId: string): boolean => {
    return loadRequest.truckId === userId;
};

/**
 * Check if user is load owner for a load request
 */
export const isLoadOwnerForLoad = (loadRequest: any, userId: string): boolean => {
    return loadRequest.onwerId === userId || loadRequest.ownerId === userId;
};

/**
 * Get tracking URL for a tracker ID
 */
export const getTrackingUrl = (trackerId: string): string => {
    return `/Tracking/Map?trackerId=${trackerId}`;
};

/**
 * Format tracker shared date
 */
export const formatTrackerSharedDate = (timestamp: string): string => {
    try {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Unknown date';
    }
};
