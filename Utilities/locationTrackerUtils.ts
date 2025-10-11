import { updateDocument, readById } from '@/db/operations';

export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    address: string;
}

export interface RouteBounds {
    northeast: LocationCoordinates;
    southwest: LocationCoordinates;
}

export interface LoadLocationData {
    originCoordinates: LocationCoordinates | null;
    destinationCoordinates: LocationCoordinates | null;
    routePolyline?: string;
    bounds?: RouteBounds;
    distance?: string;
    duration?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

/**
 * Check if a location is within a certain radius of another location
 */
export const isWithinRadius = (
    currentLat: number,
    currentLon: number,
    targetLat: number,
    targetLon: number,
    radiusKm: number = 0.5 // Default 500 meters
): boolean => {
    const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
    return distance <= radiusKm;
};

/**
 * Check if truck is within the route bounds (between origin and destination)
 */
export const isWithinRouteBounds = (
    truckLat: number,
    truckLon: number,
    origin: LocationCoordinates,
    destination: LocationCoordinates,
    toleranceKm: number = 2.0 // 2km tolerance from the direct route
): boolean => {
    // Calculate distance from truck to origin
    const distanceToOrigin = calculateDistance(truckLat, truckLon, origin.latitude, origin.longitude);

    // Calculate distance from truck to destination
    const distanceToDestination = calculateDistance(truckLat, truckLon, destination.latitude, destination.longitude);

    // Calculate total route distance
    const totalRouteDistance = calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
    );

    // Check if truck is within tolerance of the route
    // This is a simplified check - in production, you'd want to use the actual route polyline
    const minDistance = Math.min(distanceToOrigin, distanceToDestination);
    const maxDistance = Math.max(distanceToOrigin, distanceToDestination);

    // Truck should be between origin and destination, not too far from the route
    return minDistance <= toleranceKm && maxDistance <= totalRouteDistance + toleranceKm;
};

/**
 * Check if truck has reached the destination
 */
export const hasReachedDestination = (
    truckLat: number,
    truckLon: number,
    destination: LocationCoordinates,
    arrivalRadiusKm: number = 0.2 // 200 meters arrival radius
): boolean => {
    return isWithinRadius(truckLat, truckLon, destination.latitude, destination.longitude, arrivalRadiusKm);
};

/**
 * Check if truck has left the origin
 */
export const hasLeftOrigin = (
    truckLat: number,
    truckLon: number,
    origin: LocationCoordinates,
    departureRadiusKm: number = 0.3 // 300 meters departure radius
): boolean => {
    return !isWithinRadius(truckLat, truckLon, origin.latitude, origin.longitude, departureRadiusKm);
};

/**
 * Get load location data from database
 */
export const getLoadLocationData = async (loadId: string): Promise<LoadLocationData | null> => {
    try {
        const load = await readById('Cargo', loadId);
        if (!load) return null;

        return {
            originCoordinates: load.originCoordinates || null,
            destinationCoordinates: load.destinationCoordinates || null,
            routePolyline: load.routePolyline,
            bounds: load.bounds,
            distance: load.distance,
            duration: load.duration
        };
    } catch (error) {
        console.error('Error getting load location data:', error);
        return null;
    }
};

/**
 * Check if tracker should be visible based on location accuracy and truck position
 */
export const shouldShowTracker = async (
    loadRequestId: string,
    truckId: string,
    currentTruckLat?: number,
    currentTruckLon?: number
): Promise<{
    shouldShow: boolean;
    reason: string;
    locationAccuracy: 'high' | 'medium' | 'low' | 'none';
}> => {
    try {
        // Get load request data
        const loadRequest = await readById('loadRequests', loadRequestId);
        if (!loadRequest) {
            return { shouldShow: false, reason: 'Load request not found', locationAccuracy: 'none' };
        }

        // Get load data
        const loadData = await getLoadLocationData(loadRequest.cargoId);
        if (!loadData) {
            return { shouldShow: false, reason: 'Load data not found', locationAccuracy: 'none' };
        }

        // Check if load has precise coordinates
        if (!loadData.originCoordinates || !loadData.destinationCoordinates) {
            return {
                shouldShow: false,
                reason: 'Load owner did not provide precise locations. Please ask them to update with accurate coordinates.',
                locationAccuracy: 'none'
            };
        }

        // Determine location accuracy based on available data
        let locationAccuracy: 'high' | 'medium' | 'low' = 'low';
        if (loadData.routePolyline && loadData.bounds) {
            locationAccuracy = 'high';
        } else if (loadData.distance && loadData.duration) {
            locationAccuracy = 'medium';
        }

        // If no current truck position, show tracker but with warning
        if (!currentTruckLat || !currentTruckLon) {
            return {
                shouldShow: true,
                reason: 'Tracker available - waiting for truck position updates',
                locationAccuracy
            };
        }

        // Check if truck is within route bounds
        const withinRoute = isWithinRouteBounds(
            currentTruckLat,
            currentTruckLon,
            loadData.originCoordinates,
            loadData.destinationCoordinates
        );

        if (!withinRoute) {
            return {
                shouldShow: false,
                reason: 'Truck is not on the specified route. Tracker will be available when truck starts the journey.',
                locationAccuracy
            };
        }

        // Check if truck has reached destination
        const reachedDestination = hasReachedDestination(
            currentTruckLat,
            currentTruckLon,
            loadData.destinationCoordinates
        );

        if (reachedDestination) {
            return {
                shouldShow: false,
                reason: 'Load has reached its destination. Tracking completed.',
                locationAccuracy
            };
        }

        return {
            shouldShow: true,
            reason: 'Truck is on route - tracking active',
            locationAccuracy
        };

    } catch (error) {
        console.error('Error checking tracker visibility:', error);
        return { shouldShow: false, reason: 'Error checking tracker status', locationAccuracy: 'none' };
    }
};

/**
 * Update load request with destination arrival status
 */
export const markDestinationReached = async (
    loadRequestId: string,
    truckLat: number,
    truckLon: number,
    destination: LocationCoordinates
): Promise<boolean> => {
    try {
        const hasReached = hasReachedDestination(truckLat, truckLon, destination);

        if (hasReached) {
            await updateDocument('loadRequests', loadRequestId, {
                destinationReached: true,
                destinationReachedAt: Date.now().toString(),
                destinationReachedCoordinates: {
                    latitude: truckLat,
                    longitude: truckLon
                }
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error marking destination reached:', error);
        return false;
    }
};

/**
 * Get location accuracy message for load owner
 */
export const getLocationAccuracyMessage = (accuracy: 'high' | 'medium' | 'low' | 'none'): string => {
    switch (accuracy) {
        case 'high':
            return '✅ Excellent location accuracy - tracker will work perfectly';
        case 'medium':
            return '⚠️ Good location accuracy - tracker will work well';
        case 'low':
            return '⚠️ Basic location accuracy - tracker may have limited functionality';
        case 'none':
            return '❌ No precise locations - tracker unavailable until accurate coordinates are provided';
        default:
            return 'Unknown location accuracy';
    }
};

/**
 * Validate if load has sufficient location data for tracking
 */
export const validateLoadLocationData = (loadData: LoadLocationData): {
    isValid: boolean;
    message: string;
    suggestions: string[];
} => {
    const suggestions: string[] = [];

    if (!loadData.originCoordinates) {
        suggestions.push('Add precise origin coordinates (latitude/longitude)');
    }

    if (!loadData.destinationCoordinates) {
        suggestions.push('Add precise destination coordinates (latitude/longitude)');
    }

    if (!loadData.routePolyline) {
        suggestions.push('Enable route calculation for better tracking accuracy');
    }

    if (!loadData.distance || !loadData.duration) {
        suggestions.push('Add distance and duration information for route validation');
    }

    const isValid = loadData.originCoordinates && loadData.destinationCoordinates;

    let message = '';
    if (isValid) {
        if (loadData.routePolyline && loadData.bounds) {
            message = '✅ Load has excellent location data for tracking';
        } else if (loadData.distance && loadData.duration) {
            message = '✅ Load has good location data for tracking';
        } else {
            message = '⚠️ Load has basic location data - consider adding route information';
        }
    } else {
        message = '❌ Load needs precise location coordinates for tracking';
    }

    return { isValid, message, suggestions };
};


















