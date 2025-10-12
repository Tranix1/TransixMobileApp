import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { fetchDocuments } from '@/db/operations';
import { where, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { formatDate } from '@/services/services';

interface TruckPersonDetails {
    id: string;
    userId: string;
    accType: 'owner' | 'broker';
    typeOfBroker?: string;
    ownerName?: string;
    brokerName?: string;
    ownerPhoneNum?: string;
    brokerPhoneNum?: string;
    ownerEmail?: string;
    brokerEmail?: string;
    companyName?: string;
    createdAt: string;
    submittedAt?: string;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'edited';
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}

const ApproveTruckAccounts = () => {
    const [truckAccounts, setTruckAccounts] = useState<TruckPersonDetails[]>([]);
    console.log(truckAccounts);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');

    useEffect(() => {
        loadPendingTruckAccounts();
    }, []);

    const loadPendingTruckAccounts = async () => {
        try {
            setLoading(true);



            // Now try with filters - using direct Firestore query
            const filters = [
                where("approvalStatus", "in", ["pending", "edited"]),
                where("isApproved", "==", false)
            ];

            console.log('Loading truck accounts with filters:', filters);
            const filteredQuery = query(
                collection(db, 'truckPersonDetails'),
                ...filters
            );
            const filteredSnapshot = await getDocs(filteredQuery);
            const filteredData = filteredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log('Fetched result with filters:', filteredData);
            console.log('Data length with filters:', filteredData.length);
            setTruckAccounts(filteredData as TruckPersonDetails[]);
        } catch (error) {
            console.error('Error loading pending truck accounts:', error);
            Alert.alert('Error', 'Failed to load truck accounts');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPendingTruckAccounts();
        setRefreshing(false);
    };

    const handleAccountPress = (account: TruckPersonDetails) => {
        router.push({
            pathname: '/Account/Admin/TruckAccountDetailsView',
            params: {
                accountId: account.id,
                details: JSON.stringify(account)
            }
        });
    };

    const renderAccountItem = ({ item: account }: { item: TruckPersonDetails }) => (
        <TouchableOpacity
            style={[styles.accountItem, { backgroundColor: backgroundLight }]}
            onPress={() => handleAccountPress(account)}
            activeOpacity={0.7}
        >
            <View style={[styles.accountIconContainer, { backgroundColor: accent + '20' }]}>
                <Ionicons
                    name={account.accType === 'owner' ? 'person' : 'business'}
                    size={wp(5)}
                    color={accent}
                />
            </View>

            <View style={styles.accountInfo}>
                <View style={styles.accountHeader}>
                    <ThemedText type="subtitle" numberOfLines={1} style={styles.accountName}>
                        {account.accType === 'owner' ? account.ownerName : account.brokerName || 'Unknown'}
                    </ThemedText>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: account.approvalStatus === 'pending' ? '#F4802424' :
                                account.approvalStatus === 'edited' ? '#2196F324' :
                                    account.approvalStatus === 'approved' ? '#4CAF5024' : '#F4433624'
                        }
                    ]}>
                        <ThemedText type="tiny" style={[
                            styles.statusText,
                            {
                                color: account.approvalStatus === 'pending' ? '#F48024' :
                                    account.approvalStatus === 'edited' ? '#2196F3' :
                                        account.approvalStatus === 'approved' ? '#4CAF50' : '#F44336'
                            }
                        ]}>
                            {account.approvalStatus === 'pending' ? 'Pending' :
                                account.approvalStatus === 'edited' ? 'Edited' :
                                    account.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.accountDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="mail" size={wp(3.5)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1} style={styles.detailText}>
                            {account.accType === 'owner' ? account.ownerEmail : account.brokerEmail || 'N/A'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call" size={wp(3.5)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1} style={styles.detailText}>
                            {account.accType === 'owner' ? account.ownerPhoneNum : account.brokerPhoneNum || 'N/A'}
                        </ThemedText>
                    </View>

                    {account.companyName && (
                        <View style={styles.detailRow}>
                            <Ionicons name="business" size={wp(3.5)} color={icon} style={{ width: wp(6) }} />
                            <ThemedText type="tiny" numberOfLines={1} style={styles.detailText}>
                                {account.companyName}
                            </ThemedText>
                        </View>
                    )}
                </View>

                <View style={styles.accountFooter}>
                    <ThemedText type="tiny" style={styles.dateText}>
                        {account.submittedAt ? formatDate(account.submittedAt) : formatDate(account.createdAt)}
                    </ThemedText>
                    <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: accent + '20' }]}>
                <Ionicons name="checkmark-circle-outline" size={wp(12)} color={accent} />
            </View>
            <ThemedText type="title" style={styles.emptyTitle}>
                All Caught Up!
            </ThemedText>
            <ThemedText type="default" style={styles.emptySubtitle}>
                No truck account approvals pending at the moment. Pull down to refresh.
            </ThemedText>
        </View>
    );

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Approve Truck Accounts' />
                <View style={styles.loadingContainer}>
                    <ThemedText type="default">Loading truck accounts...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Approve Truck Accounts' />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <ThemedText type="title" style={styles.headerTitle}>
                            Truck Account Approvals
                        </ThemedText>
                        <ThemedText type="default" style={styles.headerSubtitle}>
                            {truckAccounts.length} account{truckAccounts.length !== 1 ? 's' : ''} pending review
                        </ThemedText>
                    </View>
                    <View style={[styles.statusIndicator, { backgroundColor: truckAccounts.length > 0 ? accent : icon }]}>
                        <ThemedText type="tiny" style={styles.statusText}>
                            {truckAccounts.length}
                        </ThemedText>
                    </View>
                </View>

                <FlatList
                    data={truckAccounts}
                    renderItem={renderAccountItem}
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
        marginBottom: wp(6),
        paddingBottom: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        marginBottom: wp(1),
    },
    headerSubtitle: {
        opacity: 0.7,
    },
    statusIndicator: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
    },
    listContainer: {
        flexGrow: 1,
    },
    accountItem: {
        flexDirection: 'row',
        padding: wp(4),
        marginBottom: wp(3),
        borderRadius: wp(4),
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    accountIconContainer: {
        marginRight: wp(4),
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountInfo: {
        flex: 1,
    },
    accountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(2),
    },
    accountName: {
        flex: 1,
        marginRight: wp(2),
    },
    accountDetails: {
        marginBottom: wp(3),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1.5),
    },
    detailText: {
        flex: 1,
        marginLeft: wp(1),
    },
    accountFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        opacity: 0.7,
    },
    statusBadge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: wp(1),
        borderRadius: wp(3),
    },
    statusText: {
        fontWeight: '600',
        fontSize: wp(2.8),
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
        paddingHorizontal: wp(8),
    },
    emptyIconContainer: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    emptyTitle: {
        marginBottom: wp(2),
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: wp(5),
    },
});

export default ApproveTruckAccounts;
