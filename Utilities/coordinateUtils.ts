/**
 * Utility functions for handling coordinates and map-related operations
 */

export interface Coordinate {
    latitude: number;
    longitude: number;
}

/**
 * Parses a coordinate string in format "lat,lng" and returns a Coordinate object
 * @param coordinateString - String in format "latitude,longitude"
 * @returns Coordinate object or null if parsing fails
 */
export const parseCoordinateString = (coordinateString: string): Coordinate | null => {
    if (!coordinateString || typeof coordinateString !== 'string') {
        return null;
    }

    const coords = coordinateString.split(',').map(coord => parseFloat(coord.trim()));

    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        return null;
    }

    return {
        latitude: coords[0],
        longitude: coords[1]
    };
};

/**
 * Validates if a coordinate is valid (not null, not zero, and within valid ranges)
 * @param coord - Coordinate object to validate
 * @returns boolean indicating if coordinate is valid
 */
export const isValidCoordinate = (coord: Coordinate | null): boolean => {
    if (!coord) return false;

    return (
        !isNaN(coord.latitude) &&
        !isNaN(coord.longitude) &&
        coord.latitude !== 0 &&
        coord.longitude !== 0 &&
        coord.latitude >= -90 &&
        coord.latitude <= 90 &&
        coord.longitude >= -180 &&
        coord.longitude <= 180
    );
};

/**
 * Calculates the distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in kilometers
 */
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Creates a region that encompasses both coordinates with appropriate padding
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Region object for map display
 */
export const createRegionFromCoordinates = (coord1: Coordinate, coord2: Coordinate) => {
    const allLatitudes = [coord1.latitude, coord2.latitude];
    const allLongitudes = [coord1.longitude, coord2.longitude];

    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
        longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
    };
};

/**
 * Default fallback coordinates (Harare, Zimbabwe)
 */
export const DEFAULT_COORDINATES: Coordinate = {
    latitude: -17.8252,
    longitude: 31.0335
};
