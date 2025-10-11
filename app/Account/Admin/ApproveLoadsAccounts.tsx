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
import { formatDate } from '@/services/services';

interface LoadAccountDetails {
    id: string;
    userId: string;
    accType: 'general' | 'professional';
    fullName: string;
    phoneNumber: string;
    email: string;
    countryCode: string;
    idDocument?: string;
    idDocumentType?: string;
    proofOfResidence?: string;
    proofOfResidenceType?: string;
    brokerId?: string;
    brokerIdType?: string;
    companyRegCertificate?: string;
    companyRegCertificateType?: string;
    companyLetterHead?: string;
    companyLetterHeadType?: string;
    typeOfBroker?: string;
    createdAt: string;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'edited';
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
}

const ApproveLoadsAccounts = () => {
    const [loadAccounts, setLoadAccounts] = useState<LoadAccountDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');

    useEffect(() => {
        loadPendingLoadAccounts();
    }, []);

    const loadPendingLoadAccounts = async () => {
        try {
            setLoading(true);

            // Query for pending cargo personal details
            const filters = [
                where("approvalStatus", "in", ["pending", "edited"]),
                where("isApproved", "==", false)
            ];

            console.log('Loading cargo personal details with filters:', filters);
            const filteredQuery = query(
                collection(db, 'cargoPersonalDetails'),
                ...filters
            );
            const filteredSnapshot = await getDocs(filteredQuery);
            const filteredData = filteredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            console.log('Fetched result with filters:', filteredData);
            console.log('Data length with filters:', filteredData.length);
            setLoadAccounts(filteredData as LoadAccountDetails[]);
        } catch (error) {
            console.error('Error loading pending load accounts:', error);
            Alert.alert('Error', 'Failed to load load accounts');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPendingLoadAccounts();
        setRefreshing(false);
    };

    const handleAccountPress = (account: LoadAccountDetails) => {
        router.push({
            pathname: '/Account/Admin/LoadAccountDetailsView',
            params: {
                accountId: account.id,
                details: JSON.stringify(account)
            }
        });
    };

    const getAccountTypeIcon = (accType: string) => {
        switch (accType) {
            case 'professional':
                return 'briefcase-outline';
            case 'general':
                return 'person-outline';
            default:
                return 'person-outline';
        }
    };

    const getAccountTypeColor = (accType: string) => {
        switch (accType) {
            case 'professional':
                return '#FF9800';
            case 'general':
                return '#4CAF50';
            default:
                return accent;
        }
    };

    const renderAccountItem = ({ item: account }: { item: LoadAccountDetails }) => (
        <TouchableOpacity
            style={[styles.accountItem, { backgroundColor: backgroundLight }]}
            onPress={() => handleAccountPress(account)}
        >
            <View style={styles.accountIconContainer}>
                <Ionicons
                    name={getAccountTypeIcon(account.accType)}
                    size={wp(6)}
                    color={getAccountTypeColor(account.accType)}
                />
            </View>

            <View style={styles.accountInfo}>
                <ThemedText type="subtitle" numberOfLines={1}>
                    {account.fullName}
                </ThemedText>

                <View style={styles.accountDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="mail" size={wp(3)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1}>
                            {account.email}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call" size={wp(3)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1}>
                            {account.countryCode} {account.phoneNumber}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="shield-checkmark" size={wp(3)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1}>
                            {account.accType.charAt(0).toUpperCase() + account.accType.slice(1)}
                            {account.typeOfBroker && ` - ${account.typeOfBroker}`}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="document" size={wp(3)} color={icon} style={{ width: wp(6) }} />
                        <ThemedText type="tiny" numberOfLines={1}>
                            {(account.idDocument || account.brokerId) ? '✓ ID Document' : '✗ ID Document'}
                            {account.accType === 'professional' && (
                                account.proofOfResidence ? ' ✓ Address' : ' ✗ Address'
                            )}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.statusContainer}>
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

                    <View style={styles.dateContainer}>
                        <ThemedText type="tiny" style={{ color: icon }}>
                            {formatDate(account.createdAt)}
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
                No Load Accounts to Review
            </ThemedText>
            <ThemedText type="default" style={styles.emptySubtitle}>
                All load account verifications have been reviewed or there are no pending approvals.
            </ThemedText>
            <TouchableOpacity
                style={[styles.refreshButton, { borderColor: accent }]}
                onPress={loadPendingLoadAccounts}
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
                <Heading page='Approve Load Accounts' />
                <View style={styles.loadingContainer}>
                    <ThemedText type="default">Loading load accounts...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Approve Load Accounts' />
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="subtitle">
                        {loadAccounts.length} account{loadAccounts.length !== 1 ? 's' : ''} pending review
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.refreshButton, { borderColor: accent }]}
                        onPress={loadPendingLoadAccounts}
                        activeOpacity={0.7}
                    >
                        <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                            Refresh
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={loadAccounts}
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
    accountItem: {
        flexDirection: 'row',
        padding: wp(4),
        marginBottom: wp(3),
        borderRadius: wp(3),
        alignItems: 'center',
    },
    accountIconContainer: {
        marginRight: wp(4),
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountInfo: {
        flex: 1,
    },
    accountDetails: {
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
    dateContainer: {
        flex: 1,
        marginLeft: wp(2),
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

export default ApproveLoadsAccounts;
