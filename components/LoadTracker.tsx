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

    // Check tracker visibility based on location
    useEffect(() => {
        const checkTrackerStatus = async () => {
            if (!loadRequest.id) return;

            setIsCheckingStatus(true);
            try {
                // Use location data from loadRequest if available, otherwise fetch from database
                let status;
                if (loadRequest.originCoordinates && loadRequest.destinationCoordinates) {
                    // Use location data from loadRequest
                    const loadData = {
                        originCoordinates: loadRequest.originCoordinates,
                        destinationCoordinates: loadRequest.destinationCoordinates,
                        routePolyline: loadRequest.routePolyline,
                        bounds: loadRequest.bounds,
                        distance: loadRequest.distance,
                        duration: loadRequest.duration
                    };

                    // Check if load has precise coordinates
                    if (!loadData.originCoordinates || !loadData.destinationCoordinates) {
                        status = {
                            shouldShow: false,
                            reason: 'Load owner did not provide precise locations. Please ask them to update with accurate coordinates.',
                            locationAccuracy: 'none' as const
                        };
                    } else {
                        // Determine location accuracy based on available data
                        let locationAccuracy: 'high' | 'medium' | 'low' = 'low';
                        if (loadData.routePolyline && loadData.bounds) {
                            locationAccuracy = 'high';
                        } else if (loadData.distance && loadData.duration) {
                            locationAccuracy = 'medium';
                        }

                        // If no current truck position, show tracker but with warning
                        if (!currentTruckLocation?.latitude || !currentTruckLocation?.longitude) {
                            status = {
                                shouldShow: true,
                                reason: 'Tracker available - waiting for truck position updates',
                                locationAccuracy
                            };
                        } else {
                            // Check if truck is within route bounds
                            const withinRoute = isWithinRouteBounds(
                                currentTruckLocation.latitude,
                                currentTruckLocation.longitude,
                                loadData.originCoordinates,
                                loadData.destinationCoordinates
                            );

                            if (!withinRoute) {
                                status = {
                                    shouldShow: false,
                                    reason: 'Truck is not on the specified route. Tracker will be available when truck starts the journey.',
                                    locationAccuracy
                                };
                            } else {
                                // Check if truck has reached destination
                                const reachedDestination = hasReachedDestination(
                                    currentTruckLocation.latitude,
                                    currentTruckLocation.longitude,
                                    loadData.destinationCoordinates
                                );

                                if (reachedDestination) {
                                    status = {
                                        shouldShow: false,
                                        reason: 'Load has reached its destination. Tracking completed.',
                                        locationAccuracy
                                    };
                                } else {
                                    status = {
                                        shouldShow: true,
                                        reason: 'Truck is on route - tracking active',
                                        locationAccuracy
                                    };
                                }
                            }
                        }
                    }
                } else {
                    // Fallback to database fetch
                    status = await shouldShowTracker(
                        loadRequest.id,
                        loadRequest.truckId,
                        currentTruckLocation?.latitude,
                        currentTruckLocation?.longitude
                    );
                }

                // Override status if destination has been reached
                if (arrivalData.hasArrived) {
                    setTrackerStatus({
                        shouldShow: false,
                        reason: 'Load has reached its destination. Tracking completed.',
                        locationAccuracy: status.locationAccuracy
                    });
                } else {
                    // Customize the reason message based on user role
                    let customizedReason = status.reason;

                    if (status.reason.includes('Load owner did not provide precise locations')) {
                        if (isTruckOwner) {
                            customizedReason = 'The load owner has not provided precise pickup and delivery locations. Please ask them to update the load with accurate coordinates.';
                        } else {
                            customizedReason = 'You need to provide precise pickup and delivery locations for this load. Please update the load details with accurate coordinates.';
                        }
                    } else if (status.reason.includes('Truck is not on the specified route')) {
                        if (isTruckOwner) {
                            customizedReason = 'Your truck is not currently on the specified route. The tracker will be available when you start the journey.';
                        } else {
                            customizedReason = 'The assigned truck is not currently on the specified route. Tracking will be available when the journey begins.';
                        }
                    } else if (status.reason.includes('Truck is on route - tracking active')) {
                        if (isTruckOwner) {
                            customizedReason = 'Your truck is on route - tracking is active and working properly.';
                        } else {
                            customizedReason = 'The truck is on route - you can track the load in real-time.';
                        }
                    }

                    setTrackerStatus({
                        ...status,
                        reason: customizedReason
                    });
                }
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
    }, [loadRequest.id, loadRequest.truckId, currentTruckLocation, arrivalData.hasArrived, isTruckOwner]);

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

        setIsSharing(true);
        try {
            // Use the utility function to share tracker
            const success = await shareTrackerWithLoadOwner(
                loadRequest.id,
                loadRequest.truckId,
                loadRequest.trackerId || `TRK_${loadRequest.truckId}_${Date.now()}`
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
            router.push(`/Tracking/Map?trackerId=${loadRequest.trackerId}`);
        } else {
            Alert.alert('No Tracker', 'No tracker information available for this load.');
        }
    };

    const renderTrackerStatus = () => {
        // Show loading state while checking tracker status
        if (isCheckingStatus) {
            return (
                <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                        <Ionicons name="hourglass" size={wp(5)} color={icon} />
                        <Text style={[styles.trackerTitle, { color: textColor }]}>
                            Checking Tracker Status
                        </Text>
                    </View>
                    <Text style={[styles.trackerDescription, { color: textColor }]}>
                        Verifying location accuracy and route status...
                    </Text>
                </View>
            );
        }

        // If no tracker status available, show error
        if (!trackerStatus) {
            return (
                <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                        <Ionicons name="warning" size={wp(5)} color="#ff6b6b" />
                        <Text style={[styles.trackerTitle, { color: '#ff6b6b' }]}>
                            Tracker Unavailable
                        </Text>
                    </View>
                    <Text style={[styles.trackerDescription, { color: textColor }]}>
                        Unable to determine tracker status. Please try again.
                    </Text>
                </View>
            );
        }

        // Show location accuracy message with role-specific context
        const accuracyMessage = getLocationAccuracyMessage(trackerStatus.locationAccuracy);
        let contextualAccuracyMessage = accuracyMessage;

        if (trackerStatus.locationAccuracy === 'none') {
            if (isTruckOwner) {
                contextualAccuracyMessage = '❌ Load owner needs to provide precise pickup and delivery coordinates';
            } else {
                contextualAccuracyMessage = '❌ You need to provide precise pickup and delivery coordinates for this load';
            }
        } else if (trackerStatus.locationAccuracy === 'low') {
            if (isTruckOwner) {
                contextualAccuracyMessage = '⚠️ Load has basic location data - ask load owner to add route details';
            } else {
                contextualAccuracyMessage = '⚠️ Consider adding route details for better tracking accuracy';
            }
        }

        const accuracyColor = trackerStatus.locationAccuracy === 'high' ? '#4caf50' :
            trackerStatus.locationAccuracy === 'medium' ? '#ff9800' :
                trackerStatus.locationAccuracy === 'low' ? '#ff5722' : '#f44336';

        if (isTruckOwner) {
            // Truck owner view
            return (
                <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                        <Ionicons
                            name={trackerStatus.shouldShow ? "location" : "location-outline"}
                            size={wp(5)}
                            color={trackerStatus.shouldShow ? accent : icon}
                        />
                        <Text style={[styles.trackerTitle, { color: trackerStatus.shouldShow ? accent : textColor }]}>
                            Load Tracking
                        </Text>
                    </View>

                    <Text style={[styles.trackerDescription, { color: textColor }]}>
                        {trackerStatus.reason}
                    </Text>

                    <View style={[styles.accuracyContainer, { borderLeftColor: accuracyColor }]}>
                        <Text style={[styles.accuracyText, { color: accuracyColor }]}>
                            {contextualAccuracyMessage}
                        </Text>
                    </View>

                    {trackerStatus.shouldShow && isTruckOwner && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: accent }]}
                            onPress={handleShareTracker}
                            disabled={isSharing || loadRequest.trackerShared}
                        >
                            <Ionicons
                                name={isSharing ? "hourglass" : "share"}
                                size={wp(4)}
                                color="white"
                            />
                            <Text style={styles.buttonText}>
                                {isSharing
                                    ? 'Sharing...'
                                    : loadRequest.trackerShared
                                        ? 'Tracker Shared'
                                        : 'Share Tracker'
                                }
                            </Text>
                        </TouchableOpacity>
                    )}

                    {loadRequest.trackerShared && (
                        <Text style={[styles.sharedText, { color: '#666' }]}>
                            Tracker shared on {formatTrackerSharedDate(loadRequest.trackerSharedAt)}
                        </Text>
                    )}
                </View>
            );
        } else {
            // Load owner view - can only view when tracker is shared
            if (!loadRequest.trackerShared) {
                return (
                    <View style={styles.trackerContainer}>
                        <View style={styles.trackerHeader}>
                            <Ionicons name="location-outline" size={wp(5)} color={icon} />
                            <Text style={[styles.trackerTitle, { color: textColor }]}>
                                Load Tracking
                            </Text>
                        </View>

                        <Text style={[styles.trackerDescription, { color: textColor }]}>
                            Waiting for truck owner to share tracker. You will be notified when tracking becomes available.
                        </Text>

                        <View style={[styles.accuracyContainer, { borderLeftColor: '#ff9800' }]}>
                            <Text style={[styles.accuracyText, { color: '#ff9800' }]}>
                                ⏳ Tracker not yet shared by truck owner
                            </Text>
                        </View>
                    </View>
                );
            }

            if (!trackerStatus.shouldShow) {
                return (
                    <View style={styles.trackerContainer}>
                        <View style={styles.trackerHeader}>
                            <Ionicons name="location-outline" size={wp(5)} color={icon} />
                            <Text style={[styles.trackerTitle, { color: textColor }]}>
                                Load Tracking
                            </Text>
                        </View>

                        <Text style={[styles.trackerDescription, { color: textColor }]}>
                            {trackerStatus.reason}
                        </Text>

                        <View style={[styles.accuracyContainer, { borderLeftColor: accuracyColor }]}>
                            <Text style={[styles.accuracyText, { color: accuracyColor }]}>
                                {accuracyMessage}
                            </Text>
                        </View>
                    </View>
                );
            }

            return (
                <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                        <Ionicons name="location" size={wp(5)} color={accent} />
                        <Text style={[styles.trackerTitle, { color: accent }]}>
                            Load Tracking Active
                        </Text>
                    </View>

                    <Text style={[styles.trackerDescription, { color: textColor }]}>
                        Track your load in real-time. The truck is on the specified route.
                    </Text>

                    <View style={[styles.accuracyContainer, { borderLeftColor: accuracyColor }]}>
                        <Text style={[styles.accuracyText, { color: accuracyColor }]}>
                            {contextualAccuracyMessage}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: accent }]}
                        onPress={handleViewTracker}
                    >
                        <Ionicons name="map" size={wp(4)} color="white" />
                        <Text style={styles.buttonText}>
                            View Tracker
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.sharedText, { color: '#666' }]}>
                        Tracker shared on {formatTrackerSharedDate(loadRequest.trackerSharedAt)}
                    </Text>

                    {/* Arrival Status */}
                    {arrivalData.hasArrived && (
                        <View style={[styles.arrivalContainer, { backgroundColor: '#e8f5e8' }]}>
                            <Ionicons name="checkmark-circle" size={wp(5)} color="#4caf50" />
                            <View style={styles.arrivalTextContainer}>
                                <Text style={[styles.arrivalTitle, { color: '#4caf50' }]}>
                                    Destination Reached!
                                </Text>
                                <Text style={[styles.arrivalSubtitle, { color: '#666' }]}>
                                    Load has arrived at its destination
                                </Text>
                                {arrivalData.arrivalTime && (
                                    <Text style={[styles.arrivalTime, { color: '#666' }]}>
                                        Arrived: {new Date(parseInt(arrivalData.arrivalTime)).toLocaleString()}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Distance to Destination */}
                    {!arrivalData.hasArrived && arrivalData.distanceToDestination !== undefined && (
                        <View style={[styles.distanceContainer, { backgroundColor: '#f0f8ff' }]}>
                            <Ionicons name="location" size={wp(4)} color="#2196f3" />
                            <Text style={[styles.distanceText, { color: '#2196f3' }]}>
                                {arrivalData.distanceToDestination < 1
                                    ? `${Math.round(arrivalData.distanceToDestination * 1000)}m to destination`
                                    : `${arrivalData.distanceToDestination.toFixed(1)}km to destination`
                                }
                            </Text>
                        </View>
                    )}

                    {/* Checking Status */}
                    {arrivalData.isChecking && (
                        <View style={[styles.checkingContainer, { backgroundColor: '#fff3cd' }]}>
                            <Ionicons name="hourglass" size={wp(4)} color="#ff9800" />
                            <Text style={[styles.checkingText, { color: '#ff9800' }]}>
                                Checking arrival status...
                            </Text>
                        </View>
                    )}
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Role indicator */}
            <View style={[styles.roleIndicator, { backgroundColor: isTruckOwner ? '#e3f2fd' : '#f3e5f5' }]}>
                <Ionicons
                    name={isTruckOwner ? "car" : "cube"}
                    size={wp(4)}
                    color={isTruckOwner ? '#1976d2' : '#7b1fa2'}
                />
                <Text style={[styles.roleText, { color: isTruckOwner ? '#1976d2' : '#7b1fa2' }]}>
                    {isTruckOwner ? 'Truck Owner View' : 'Load Owner View'}
                </Text>
            </View>
            {renderTrackerStatus()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: wp(2),
    },
    roleIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(2),
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3',
    },
    roleText: {
        marginLeft: wp(2),
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    trackerContainer: {
        // backgroundColor: '#f8f9fa',
        borderRadius: wp(3),
        padding: wp(4),
        borderLeftWidth: 4,
        borderLeftColor: '#6a0c0c',
        marginVertical: wp(2),
    },
    trackerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(2),
    },
    trackerTitle: {
        marginLeft: wp(2),
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    trackerDescription: {
        marginBottom: wp(3),
        lineHeight: wp(5),
        fontSize: wp(3.5),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    buttonText: {
        color: 'white',
        marginLeft: wp(2),
        fontSize: wp(4),
        fontWeight: '600',
    },
    sharedText: {
        textAlign: 'center',
        fontSize: wp(3),
        fontStyle: 'italic',
    },
    accuracyContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: wp(2),
        padding: wp(3),
        marginVertical: wp(2),
        borderLeftWidth: 4,
    },
    accuracyText: {
        fontSize: wp(3.2),
        fontWeight: '600',
    },
    arrivalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        marginVertical: wp(2),
    },
    arrivalTextContainer: {
        marginLeft: wp(2),
        flex: 1,
    },
    arrivalTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    arrivalSubtitle: {
        fontSize: wp(3.2),
        marginBottom: wp(1),
    },
    arrivalTime: {
        fontSize: wp(2.8),
        fontStyle: 'italic',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(2.5),
        borderRadius: wp(2),
        marginVertical: wp(1),
    },
    distanceText: {
        marginLeft: wp(2),
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    checkingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(2.5),
        borderRadius: wp(2),
        marginVertical: wp(1),
    },
    checkingText: {
        marginLeft: wp(2),
        fontSize: wp(3.2),
        fontStyle: 'italic',
    },
});

export default LoadTracker;
