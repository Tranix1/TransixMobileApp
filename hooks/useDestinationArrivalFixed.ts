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
    const isMountedRef = useRef(true);

    const checkArrival = async () => {
        if (!currentLocation || !enabled || !isMountedRef.current) return;

        // Prevent multiple simultaneous checks
        if (arrivalData.isChecking) return;

        setArrivalData(prev => ({ ...prev, isChecking: true }));

        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Arrival check timed out after 10 seconds'));
                }, 10000);
            });

            const checkPromise = async () => {
                if (!isMountedRef.current) return;

                // Check if already arrived
                const existingStatus = await getArrivalStatus(loadRequestId);
                if (existingStatus?.hasArrived && isMountedRef.current) {
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

                if (!isMountedRef.current) return;

                // Check current arrival status
                const arrivalStatus = await checkDestinationArrival(
                    loadRequestId,
                    currentLocation.latitude,
                    currentLocation.longitude
                );

                if (!isMountedRef.current) return;

                // Get distance to destination
                const distance = await getDistanceToDestination(
                    loadRequestId,
                    currentLocation.latitude,
                    currentLocation.longitude
                );

                if (isMountedRef.current) {
                    setArrivalData(prev => ({
                        ...prev,
                        hasArrived: arrivalStatus.hasArrived,
                        arrivalTime: arrivalStatus.arrivalTime,
                        arrivalCoordinates: arrivalStatus.arrivalCoordinates,
                        distanceToDestination: distance || undefined,
                        isChecking: false,
                        lastChecked: new Date().toISOString()
                    }));
                }
            };

            await Promise.race([checkPromise(), timeoutPromise]);

        } catch (error) {
            console.error('Error checking destination arrival:', error);
            if (isMountedRef.current) {
                setArrivalData(prev => ({
                    ...prev,
                    isChecking: false,
                    lastChecked: new Date().toISOString()
                }));
            }
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
        return () => {
            subscription?.remove();
        };
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
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return arrivalData;
};

export default useDestinationArrival;
