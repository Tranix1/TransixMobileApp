

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { fetchDocuments, updateDocument } from '@/db/operations';
import { Truck } from '@/types/types';
import { where } from 'firebase/firestore';
import { Image } from 'expo-image';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fixFirebaseUrl } from '@/Utilities/utils';
import Button from '@/components/Button';

const ApproveTrucks = () => {
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');

    useEffect(() => {
        loadUnapprovedTrucks();
    }, []);

    const loadUnapprovedTrucks = async () => {
        try {
            setLoading(true);
            const filters = [
                where("isApproved", "==", false),
                where("approvalStatus", "in", ["pending", "edited"])
            ];

            const result = await fetchDocuments("Trucks", 50, undefined, filters);
            setTrucks(result.data || []);
        } catch (error) {
            console.error('Error loading unapproved trucks:', error);
            Alert.alert('Error', 'Failed to load trucks');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUnapprovedTrucks();
        setRefreshing(false);
    };

    const handleTruckPress = (truck: Truck) => {
        router.push({
            pathname: '/Logistics/Trucks/TruckDetails',
            params: {
                truckid: truck.id,
                dspDetails: 'admin'
            }
        });
    };

    const renderTruckItem = ({ item: truck }: { item: Truck }) => (
        <TouchableOpacity
            style={[styles.truckItem, { backgroundColor: backgroundLight }]}
            onPress={() => handleTruckPress(truck)}
        >
            <View style={styles.truckImageContainer}>
                <Image
                    source={{ uri: fixFirebaseUrl(truck.imageUrl) || 'https://via.placeholder.com/100' }}
                    style={styles.truckImage}
                />
            </View>

            <View style={styles.truckInfo}>
                <ThemedText type="subtitle" numberOfLines={1}>
                    {truck.CompanyName || 'Unknown Company'}
                </ThemedText>

                <View style={styles.truckDetails}>
                    <View style={styles.detailRow}>
                        <FontAwesome5 name="truck" size={wp(3)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1}>
                            {truck.truckType || 'N/A'} - {truck.truckCapacity || 'N/A'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <FontAwesome5 name="map-marker-alt" size={wp(3)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1}>
                            {truck.locations?.join(', ') || 'N/A'}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.statusContainer}>
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

                    <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={wp(20)} color={icon} />
            <ThemedText type="title" style={styles.emptyTitle}>
                No Trucks to Review
            </ThemedText>
            <ThemedText type="default" style={styles.emptySubtitle}>
                All trucks have been reviewed or there are no pending approvals.
            </ThemedText>
            <Button
                title="Refresh"
                onPress={loadUnapprovedTrucks}
                style={styles.refreshButton}
            />
        </View>
    );

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Approve Trucks' />
                <View style={styles.loadingContainer}>
                    <ThemedText type="default">Loading trucks...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Approve Trucks' />
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="subtitle">
                        {trucks.length} truck{trucks.length !== 1 ? 's' : ''} pending review
                    </ThemedText>
                    <Button
                        title="Refresh"
                        onPress={loadUnapprovedTrucks}
                        style={styles.refreshButton}
                    />
                </View>

                <FlatList
                    data={trucks}
                    renderItem={renderTruckItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    refreshButton: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2),
    },
    listContainer: {
        flexGrow: 1,
    },
    truckItem: {
        flexDirection: 'row',
        padding: wp(4),
        marginBottom: wp(3),
        borderRadius: wp(3),
        alignItems: 'center',
    },
    truckImageContainer: {
        marginRight: wp(4),
    },
    truckImage: {
        width: wp(20),
        height: wp(15),
        borderRadius: wp(2),
    },
    truckInfo: {
        flex: 1,
    },
    truckDetails: {
        marginVertical: wp(2),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1),
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(8),
    },
    emptyTitle: {
        marginTop: wp(4),
        marginBottom: wp(2),
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: wp(6),
        opacity: 0.7,
    },
});

export default ApproveTrucks;
