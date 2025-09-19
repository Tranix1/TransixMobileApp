import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { wp, hp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { updateDocument } from '@/db/operations';
import { shareTrackerWithLoadOwner, formatTrackerSharedDate } from '@/Utilities/trackerUtils';

interface LoadTrackerProps {
    loadRequest: any;
    isTruckOwner: boolean;
    onTrackerShared?: () => void;
}

export const LoadTracker: React.FC<LoadTrackerProps> = ({
    loadRequest,
    isTruckOwner,
    onTrackerShared
}) => {
    const accent = useThemeColor('accent');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');

    const [isSharing, setIsSharing] = useState(false);

    // Debug logging
    console.log('LoadTracker Debug:', {
        isTruckOwner,
        loadRequest: {
            id: loadRequest.id,
            status: loadRequest.status,
            trackerShared: loadRequest.trackerShared,
            truckId: loadRequest.truckId
        }
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
        if (isTruckOwner) {
            // Truck owner view - show share tracker button
            return (
                <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                        <Ionicons name="location" size={wp(5)} color={accent} />
                        <Text style={[styles.trackerTitle, { color: accent }]}>
                            Load Tracking
                        </Text>
                    </View>

                    <Text style={[styles.trackerDescription, { color: textColor }]}>
                        Share your truck's tracker with the load owner so they can monitor the transportation progress.
                    </Text>

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

                    {loadRequest.trackerShared && (
                        <Text style={[styles.sharedText, { color: '#666' }]}>
                            Tracker shared on {formatTrackerSharedDate(loadRequest.trackerSharedAt)}
                        </Text>
                    )}
                </View>
            );
        } else {
            // Load owner view - show view tracker button
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
                            Waiting for truck owner to share tracker information.
                        </Text>
                    </View>
                );
            }

            return (
                <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                        <Ionicons name="location" size={wp(5)} color={accent} />
                        <Text style={[styles.trackerTitle, { color: accent }]}>
                            Load Tracking Available
                        </Text>
                    </View>

                    <Text style={[styles.trackerDescription, { color: textColor }]}>
                        Track your load in real-time. The truck owner has shared their tracker information.
                    </Text>

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
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            {renderTrackerStatus()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: wp(2),
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
});

export default LoadTracker;
