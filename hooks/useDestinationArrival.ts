import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
    checkDestinationArrival,
    getArrivalStatus,
    getDistanceToDestination
} from '@/Utilities/destinationArrivalService';

interface UseDestinationArrivalOptions {
    loadRequestId: string;
    currentLocation?: { latitude: number; longitude: number } | null;
    checkInterval?: number; // in milliseconds, default 30000 (30 seconds)
    enabled?: boolean;
}

interface ArrivalData {
    hasArrived: boolean;
    arrivalTime?: string;
    arrivalCoordinates?: { latitude: number; longitude: number };
    distanceToDestination?: number;
    isChecking: boolean;
    lastChecked?: string;
}

export const useDestinationArrival = ({
    loadRequestId,
    currentLocation,
    checkInterval = 30000, // 30 seconds
    enabled = true
}: UseDestinationArrivalOptions): ArrivalData => {
    const [arrivalData, setArrivalData] = useState<ArrivalData>({
        hasArrived: false,
        isChecking: false
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const checkArrival = async () => {
        if (!currentLocation || !enabled) return;

        setArrivalData(prev => ({ ...prev, isChecking: true }));

        try {
            // Check if already arrived
            const existingStatus = await getArrivalStatus(loadRequestId);
            if (existingStatus?.hasArrived) {
                setArrivalData(prev => ({
                    ...prev,
                    hasArrived: true,
                    arrivalTime: existingStatus.arrivalTime,
                    arrivalCoordinates: existingStatus.arrivalCoordinates,
                    isChecking: false,
                    lastChecked: new Date().toISOString()
                }));
                return;
            }

            // Check current arrival status
            const arrivalStatus = await checkDestinationArrival(
                loadRequestId,
                currentLocation.latitude,
                currentLocation.longitude
            );

            // Get distance to destination
            const distance = await getDistanceToDestination(
                loadRequestId,
                currentLocation.latitude,
                currentLocation.longitude
            );

            setArrivalData(prev => ({
                ...prev,
                hasArrived: arrivalStatus.hasArrived,
                arrivalTime: arrivalStatus.arrivalTime,
                arrivalCoordinates: arrivalStatus.arrivalCoordinates,
                distanceToDestination: distance || undefined,
                isChecking: false,
                lastChecked: new Date().toISOString()
            }));

        } catch (error) {
            console.error('Error checking destination arrival:', error);
            setArrivalData(prev => ({
                ...prev,
                isChecking: false,
                lastChecked: new Date().toISOString()
            }));
        }
    };

    // Handle app state changes
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground, check immediately
                checkArrival();
            }
            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [loadRequestId, currentLocation, enabled]);

    // Set up interval checking
    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Check immediately
        checkArrival();

        // Set up interval
        intervalRef.current = setInterval(checkArrival, checkInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [loadRequestId, currentLocation, enabled, checkInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return arrivalData;
};

export default useDestinationArrival;













