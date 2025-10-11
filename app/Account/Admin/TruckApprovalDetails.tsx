import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { readById, updateDocument, updateDocumentWithAdminTracking } from '@/db/operations';
import { ADMIN_ACTIONS } from '@/Utilities/adminActionTracker';
import { Truck } from '@/types/types';
import { Image } from 'expo-image';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { sendPushNotification } from '@/Utilities/pushNotification';

const TruckApprovalDetails = () => {
    const { truckId, isAdmin } = useLocalSearchParams();
    const [truck, setTruck] = useState<Truck | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    useEffect(() => {
        if (truckId) {
            loadTruckDetails();
        }
    }, [truckId]);

    const loadTruckDetails = async () => {
        try {
            setLoading(true);
            const truckData = await readById('Trucks', truckId as string);
            if (truckData) {
                setTruck(truckData as Truck);
            } else {
                Alert.alert('Error', 'Truck not found');
            }
        } catch (error) {
            console.error('Error loading truck details:', error);
            Alert.alert('Error', 'Failed to load truck details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!truck) return;

        Alert.alert(
            'Approve Truck',
            'Are you sure you want to approve this truck?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Approve', onPress: () => approveTruck() }
            ]
        );
    };

    const approveTruck = async () => {
        try {
            setProcessing(true);

            // Update truck status with admin tracking
            await updateDocumentWithAdminTracking(
                'Trucks',
                truck!.id,
                {
                    isApproved: true,
                    approvalStatus: 'approved',
                    approvedAt: new Date().toISOString()
                },
                ADMIN_ACTIONS.APPROVE_TRUCK,
                'truck',
                `${truck!.truckType} - ${truck!.truckCapacity}`,
                'Truck approved by admin'
            );

            // Send notification to truck owner
            if (truck!.expoPushToken) {
                await sendPushNotification(
                    truck!.expoPushToken,
                    'Truck Approved! 🎉',
                    `Your truck (${truck!.truckType} - ${truck!.truckCapacity}) has been approved and is now visible to other users.`,
                    '/Logistics/Trucks',
                    { truckId: truck!.id, type: 'truck_approved' }
                );
            }

            Alert.alert('Success', 'Truck approved successfully!', [
                { text: 'OK', onPress: () => goBack() }
            ]);
        } catch (error) {
            console.error('Error approving truck:', error);
            Alert.alert('Error', 'Failed to approve truck');
        } finally {
            setProcessing(false);
        }
    };

    const handleDecline = () => {
        setShowDeclineModal(true);
    };

    const declineTruck = async () => {
        if (!declineReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for declining');
            return;
        }

        try {
            setProcessing(true);

            // Update truck status with admin tracking
            await updateDocumentWithAdminTracking(
                'Trucks',
                truck!.id,
                {
                    isApproved: false,
                    approvalStatus: 'rejected',
                    rejectedAt: new Date().toISOString(),
                    rejectionReason: declineReason.trim()
                },
                ADMIN_ACTIONS.DECLINE_TRUCK,
                'truck',
                `${truck!.truckType} - ${truck!.truckCapacity}`,
                `Truck declined: ${declineReason.trim()}`
            );

            // Send notification to truck owner
            if (truck!.expoPushToken) {
                await sendPushNotification(
                    truck!.expoPushToken,
                    'Truck Declined',
                    `Your truck (${truck!.truckType} - ${truck!.truckCapacity}) has been declined. Reason: ${declineReason}`,
                    '/Logistics/Trucks',
                    { truckId: truck!.id, type: 'truck_declined' }
                );
            }

            Alert.alert('Success', 'Truck declined successfully!', [
                { text: 'OK', onPress: () => goBack() }
            ]);
        } catch (error) {
            console.error('Error declining truck:', error);
            Alert.alert('Error', 'Failed to decline truck');
        } finally {
            setProcessing(false);
            setShowDeclineModal(false);
            setDeclineReason('');
        }
    };

    const goBack = () => {
        // Navigate back to approve trucks list
        // You can use router.back() or navigate to specific route
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';

        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString();
        }

        if (typeof timestamp === 'string') {
            return new Date(timestamp).toLocaleDateString();
        }

        return 'N/A';
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Truck Details' />
                <View style={styles.loadingContainer}>
                    <ThemedText type="default">Loading truck details...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!truck) {
        return (
            <ScreenWrapper>
                <Heading page='Truck Details' />
                <View style={styles.errorContainer}>
                    <ThemedText type="default">Truck not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Truck Approval Details' />
            <ScrollView style={styles.container}>
                {/* Truck Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: truck.imageUrl || 'https://via.placeholder.com/300' }}
                        style={styles.truckImage}
                    />
                </View>

                {/* Basic Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Basic Information
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Company:</ThemedText>
                        <ThemedText type="default">{truck.CompanyName || 'N/A'}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Contact:</ThemedText>
                        <ThemedText type="default">{truck.contact || 'N/A'}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Truck Type:</ThemedText>
                        <ThemedText type="default">{truck.truckType || 'N/A'}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Capacity:</ThemedText>
                        <ThemedText type="default">{truck.truckCapacity || 'N/A'}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Cargo Area:</ThemedText>
                        <ThemedText type="default">{truck.cargoArea || 'N/A'}</ThemedText>
                    </View>
                </View>

                {/* Location Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Location Information
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Operating Countries:</ThemedText>
                        <ThemedText type="default">{truck.locations?.join(', ') || 'N/A'}</ThemedText>
                    </View>
                </View>

                {/* Owner Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Owner Information
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Owner Name:</ThemedText>
                        <ThemedText type="default">{truck.ownerName || 'N/A'}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Owner Email:</ThemedText>
                        <ThemedText type="default">{truck.onwerEmail || 'N/A'}</ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Owner Phone:</ThemedText>
                        <ThemedText type="default">{truck.ownerPhoneNum || 'N/A'}</ThemedText>
                    </View>
                </View>

                {/* Status Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Status Information
                    </ThemedText>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Current Status:</ThemedText>
                        <View style={[
                            styles.statusBadge,
                            {
                                backgroundColor: truck.approvalStatus === 'pending' ? '#F4802424' : '#17a2b824'
                            }
                        ]}>
                            <ThemedText type="tiny" style={[
                                styles.statusText,
                                {
                                    color: truck.approvalStatus === 'pending' ? '#F48024' : '#17a2b8'
                                }
                            ]}>
                                {truck.approvalStatus === 'pending' ? 'Pending' : 'Edited'}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <ThemedText type="default" style={styles.label}>Submitted At:</ThemedText>
                        <ThemedText type="default">{formatDate(truck.timeStamp)}</ThemedText>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Approve Truck"
                        onPress={handleApprove}
                        disabled={processing}
                        style={[styles.approveButton, { backgroundColor: '#28a745' }]}
                    />

                    <Button
                        title="Decline Truck"
                        onPress={handleDecline}
                        disabled={processing}
                        style={[styles.declineButton, { backgroundColor: '#dc3545' }]}
                    />
                </View>
            </ScrollView>

            {/* Decline Reason Modal */}
            <Modal
                visible={showDeclineModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                        <ThemedText type="title" style={styles.modalTitle}>
                            Reason for Declining
                        </ThemedText>

                        <Input
                            value={declineReason}
                            onChangeText={setDeclineReason}
                            placeholder="Please provide a reason for declining this truck..."
                            multiline
                            numberOfLines={4}
                            style={styles.reasonInput}
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                onPress={() => {
                                    setShowDeclineModal(false);
                                    setDeclineReason('');
                                }}
                                style={[styles.modalButton, { backgroundColor: coolGray }]}
                            />

                            <Button
                                title="Decline"
                                onPress={declineTruck}
                                disabled={processing}
                                style={[styles.modalButton, { backgroundColor: '#dc3545' }]}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: wp(4),
    },
    truckImage: {
        width: '100%',
        height: wp(50),
        borderRadius: wp(3),
    },
    section: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(3),
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(2),
    },
    label: {
        fontWeight: '600',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1),
        borderRadius: wp(2),
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: wp(3),
    },
    buttonContainer: {
        gap: wp(3),
        marginTop: wp(4),
    },
    approveButton: {
        paddingVertical: wp(4),
    },
    declineButton: {
        paddingVertical: wp(4),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    modalContent: {
        width: '100%',
        maxWidth: wp(80),
        padding: wp(6),
        borderRadius: wp(4),
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: wp(4),
        fontWeight: 'bold',
    },
    reasonInput: {
        marginBottom: wp(4),
        minHeight: wp(20),
    },
    modalButtons: {
        flexDirection: 'row',
        gap: wp(3),
    },
    modalButton: {
        flex: 1,
        paddingVertical: wp(3),
    },
});

export default TruckApprovalDetails;


