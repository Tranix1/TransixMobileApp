import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { where, collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Load } from '@/types/types';
import AdminLoadComponent from '@/components/AdminLoadComponent';

const ApproveLoads = () => {
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');

    useEffect(() => {
        loadPendingLoads();
    }, []);

    const loadPendingLoads = async () => {
        try {
            setLoading(true);

            // Query for pending loads from Cargo collection
            const filters = [
                where("approvalStatus", "in", ["pending", "edited"]),
                where("isApproved", "==", false)
            ];

            console.log('Loading loads with filters:', filters);
            const filteredQuery = query(
                collection(db, 'Cargo'),
                ...filters
            );
            const filteredSnapshot = await getDocs(filteredQuery);
            const filteredData = filteredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log('Fetched result with filters:', filteredData);
            console.log('Data length with filters:', filteredData.length);
            setLoads(filteredData as Load[]);
        } catch (error) {
            console.error('Error loading pending loads:', error);
            Alert.alert('Error', 'Failed to load loads');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPendingLoads();
        setRefreshing(false);
    };

    const [expandedLoadId, setExpandedLoadId] = useState<string>('');

    const handleLoadUpdated = () => {
        // Refresh the loads list when a load is approved/rejected
        loadPendingLoads();
    };


    const renderLoadItem = ({ item: load }: { item: Load }) => (
        <AdminLoadComponent
            item={load}
            expandID={expandedLoadId}
            expandId={setExpandedLoadId}
            onLoadUpdated={handleLoadUpdated}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={wp(20)} color={icon} />
            <ThemedText type="title" style={styles.emptyTitle}>
                No Loads to Review
            </ThemedText>
            <ThemedText type="default" style={styles.emptySubtitle}>
                All load requests have been reviewed or there are no pending approvals.
            </ThemedText>
            <TouchableOpacity
                style={[styles.refreshButton, { borderColor: accent }]}
                onPress={loadPendingLoads}
                activeOpacity={0.7}
            >
                <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                    Refresh
                </ThemedText>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Approve Loads' />
                <View style={styles.loadingContainer}>
                    <ThemedText type="default">Loading loads...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Approve Loads' />
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="subtitle">
                        {loads.length} load{loads.length !== 1 ? 's' : ''} pending review
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.refreshButton, { borderColor: accent }]}
                        onPress={loadPendingLoads}
                        activeOpacity={0.7}
                    >
                        <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                            Refresh
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={loads}
                    renderItem={renderLoadItem}
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
        borderRadius: wp(2),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        flexGrow: 1,
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

export default ApproveLoads;
