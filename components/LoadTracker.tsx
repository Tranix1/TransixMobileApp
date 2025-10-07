import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { wp, hp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { updateDocument } from '@/db/operations';
import { shareTrackerWithLoadOwner, formatTrackerSharedDate } from '@/Utilities/trackerUtils';
import {
    shouldShowTracker,
    getLocationAccuracyMessage,
    validateLoadLocationData,
    LocationCoordinates,
    isWithinRouteBounds,
    hasReachedDestination
} from '@/Utilities/locationTrackerUtils';
import { useDestinationArrival } from '@/hooks/useDestinationArrival';

interface LoadTrackerProps {
    loadRequest: any;
    isTruckOwner: boolean;
    onTrackerShared?: () => void;
    currentTruckLocation?: {
        latitude: number;
        longitude: number;
    };
}

export const LoadTracker: React.FC<LoadTrackerProps> = ({
    loadRequest,
    isTruckOwner,
    onTrackerShared,
    currentTruckLocation
}) => {
    const accent = useThemeColor('accent');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');

    const [isSharing, setIsSharing] = useState(false);
    const [trackerStatus, setTrackerStatus] = useState<{
        shouldShow: boolean;
        reason: string;
        locationAccuracy: 'high' | 'medium' | 'low' | 'none';
    } | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Use destination arrival detection
    const arrivalData = useDestinationArrival({
        loadRequestId: loadRequest.id,
        currentLocation: currentTruckLocation,
        enabled: !!loadRequest.id && !!currentTruckLocation
    });

    // Check tracker visibility based on location - simplified
    useEffect(() => {
        const checkTrackerStatus = async () => {
            if (!loadRequest.id) return;

            setIsCheckingStatus(true);
            try {
                // Simplified logic - just check if basic requirements are met
                let shouldShow = false;

                if (loadRequest.originCoordinates && loadRequest.destinationCoordinates) {
                    // Basic check - if we have coordinates, tracker can be used
                    shouldShow = true;
                } else {
                    // Try database fetch as fallback
                    const status = await shouldShowTracker(
                        loadRequest.id,
                        loadRequest.truckId,
                        currentTruckLocation?.latitude,
                        currentTruckLocation?.longitude
                    );
                    shouldShow = status.shouldShow;
                }

                setTrackerStatus({
                    shouldShow,
                    reason: shouldShow ? 'Tracker ready' : 'Tracker not available',
                    locationAccuracy: 'medium'
                });
            } catch (error) {
                console.error('Error checking tracker status:', error);
                setTrackerStatus({
                    shouldShow: false,
                    reason: 'Error checking tracker status',
                    locationAccuracy: 'none'
                });
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkTrackerStatus();
    }, [loadRequest.id, loadRequest.truckId]);

    // Debug logging
    console.log('LoadTracker Debug:', {
        isTruckOwner,
        loadRequest: {
            id: loadRequest.id,
            status: loadRequest.status,
            trackerShared: loadRequest.trackerShared,
            truckId: loadRequest.truckId
        },
        trackerStatus,
        currentTruckLocation
    });

    const handleShareTracker = async () => {
        if (!loadRequest.truckId) {
            Alert.alert('Error', 'No truck assigned to this load');
            return;
        }

        if (!loadRequest.id) {
            Alert.alert('Error', 'Invalid load request');
            return;
        }

        setIsSharing(true);
        try {
            // Generate tracker ID if not exists
            const trackerId = loadRequest.trackerId || `TRK_${loadRequest.truckId}_${Date.now()}`;

            // Use the utility function to share tracker
            const success = await shareTrackerWithLoadOwner(
                loadRequest.id,
                loadRequest.truckId,
                trackerId
            );

            if (success) {
                Alert.alert(
                    'Tracker Shared',
                    'The tracker has been shared with the load owner. They can now view the tracking information.',
                    [{ text: 'OK', onPress: onTrackerShared }]
                );
            } else {
                throw new Error('Failed to share tracker');
            }
        } catch (error) {
            console.error('Error sharing tracker:', error);
            Alert.alert('Error', 'Failed to share tracker. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleViewTracker = () => {
        if (loadRequest.trackerId) {
            // Navigate to Map/Index with proper coordinate data
            const params: any = {
                trackerId: loadRequest.trackerId
            };

            // Add destination coordinates if available
            if (loadRequest.destinationCoordinates?.latitude && loadRequest.destinationCoordinates?.longitude) {
                params.destinationLati = loadRequest.destinationCoordinates.latitude.toString();
                params.destinationLongi = loadRequest.destinationCoordinates.longitude.toString();
            }

            // Add origin coordinates if available
            if (loadRequest.originCoordinates?.latitude && loadRequest.originCoordinates?.longitude) {
                params.originLati = loadRequest.originCoordinates.latitude.toString();
                params.originLongi = loadRequest.originCoordinates.longitude.toString();
            }

            // Add route data if available
            if (loadRequest.routePolyline) {
                params.routePolyline = loadRequest.routePolyline;
            }
            if (loadRequest.bounds) {
                params.bounds = loadRequest.bounds;
            }
            if (loadRequest.distance) {
                params.distance = loadRequest.distance.toString();
            }
            if (loadRequest.duration) {
                params.duration = loadRequest.duration.toString();
            }
            if (loadRequest.durationInTraffic) {
                params.durationInTraffic = loadRequest.durationInTraffic.toString();
            }

            router.push({
                pathname: '/Map' as any,
                params
            });
        } else {
            Alert.alert('No Tracker', 'No tracker information available for this load.');
        }
    };

    const renderTrackerStatus = () => {
        // Show loading state while checking tracker status
        if (isCheckingStatus) {
            return (
                <View style={styles.compactContainer}>
                    <View style={styles.compactRow}>
                        <View style={[styles.statusDot, { backgroundColor: '#ff9800' }]} />
                        <Text style={{ color: "#222", flex: 1 }}>Checking...</Text>
                    </View>
                </View>
            );
        }

        if (isTruckOwner) {
            // Truck owner view - simplified logic
            const isShared = loadRequest.trackerShared;
            const canShare = trackerStatus?.shouldShow && !isShared;

            return (
                <View style={styles.compactContainer}>
                    <View style={styles.compactRow}>
                        <View style={[styles.statusDot, {
                            backgroundColor: isShared ? '#4caf50' : (trackerStatus?.shouldShow ? '#ff9800' : '#f44336')
                        }]} />
                        <Text style={{ color: "#222", flex: 1 }}>
                            {isShared ? 'Tracker Shared' : (trackerStatus?.shouldShow ? 'Ready to Share' : 'Not Available')}
                        </Text>
                        {canShare && (
                            <TouchableOpacity
                                style={styles.compactButton}
                                onPress={handleShareTracker}
                                disabled={isSharing}
                            >
                                <Text style={styles.compactButtonText}>
                                    {isSharing ? 'Sharing...' : 'Share'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        } else {
            // Load owner view - simplified logic
            const isShared = loadRequest.trackerShared;
            const isActive = isShared && trackerStatus?.shouldShow;

            return (
                <View style={styles.compactContainer}>
                    <View style={styles.compactRow}>
                        <View style={[styles.statusDot, {
                            backgroundColor: isActive ? '#4caf50' : (isShared ? '#ff9800' : '#f44336')
                        }]} />
                        <Text style={{ color: "#222", flex: 1 }}>
                            {isActive ? 'Tracking Active' : (isShared ? 'Waiting for Location' : 'Not Shared')}
                        </Text>
                        {isActive && (
                            <TouchableOpacity
                                style={styles.compactButton}
                                onPress={handleViewTracker}
                            >
                                <Text style={styles.compactButtonText}>View</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        }
    };

    return renderTrackerStatus();
};

const styles = StyleSheet.create({
    compactContainer: {
        backgroundColor: "#f4f4f4",
        borderRadius: 10,
        padding: wp(2),
        marginBottom: wp(2),
    },
    compactRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    statusDot: {
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
        marginRight: wp(2),
    },
    compactButton: {
        backgroundColor: '#6a0c0c',
        paddingVertical: wp(1.5),
        paddingHorizontal: wp(3),
        borderRadius: wp(1.5),
    },
    compactButtonText: {
        color: 'white',
        fontSize: wp(3),
        fontWeight: '600',
    },
});

export default LoadTracker;
