import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import Heading from '@/components/Heading';
import BalanceDisplay from '@/components/BalanceDisplay';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface AmbassadorEarning {
  id: string;
  type: 'referral_earning' | 'commission';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  referralCode?: string;
  referredUserId?: string;
  referredUserEmail?: string;
  commissionRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AmbassodorEarnings() {
  const accent = useThemeColor('accent') || '#007AFF';
  const icon = useThemeColor('icon') || '#333';
  const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
  const { user } = useAuth();
  const router = useRouter();

  const [earnings, setEarnings] = useState<AmbassadorEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0
  });

  const loadAmbassadorEarnings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const filters = [
        where("userId", "==", user.uid),
        where("type", "in", ["referral_earning", "commission"])
      ];
      const result = await fetchDocuments("AmbassadorEarnings", 20, undefined, filters);

      if (result.data.length) {
        console.log('Loaded ambassador earnings:', result.data);
        const earningsData = result.data as AmbassadorEarning[];
        setEarnings(earningsData);
        setLastVisible(result.lastVisible);

        // Calculate total earned
        const total = earningsData
          .filter(item => item.status === 'completed')
          .reduce((sum, item) => sum + item.amount, 0);
        setTotalEarned(total);

        // Calculate referral stats
        const referralEarnings = earningsData.filter(item => item.type === 'referral_earning');
        const uniqueReferrals = new Set(referralEarnings.map(item => item.referredUserId).filter(Boolean));
        const activeReferrals = referralEarnings.filter(item => item.status === 'completed').length;

        setReferralStats({
          totalReferrals: uniqueReferrals.size,
          activeReferrals: activeReferrals,
          totalCommission: total
        });
      }
    } catch (error) {
      console.error('Error loading ambassador earnings:', error);
      Alert.alert('Error', 'Failed to load ambassador earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmbassadorEarnings();
  }, [user]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAmbassadorEarnings();
    } catch (error) {
      console.error('Error refreshing ambassador earnings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreEarnings = async () => {
    if (loadingMore || !lastVisible || !user) return;

    setLoadingMore(true);
    try {
      const filters = [
        where("userId", "==", user.uid),
        where("type", "in", ["referral_earning", "commission"])
      ];
      const result = await fetchDocuments('AmbassadorEarnings', 20, lastVisible, filters);
      if (result) {
        const newData = result.data as AmbassadorEarning[];
        setEarnings([...earnings, ...newData]);
        setLastVisible(result.lastVisible);
      }
    } catch (error) {
      console.error('Error loading more ambassador earnings:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEarningIcon = (type: string) => {
    switch (type) {
      case 'referral_earning':
        return <Ionicons name="people" size={wp(6)} color="#4CAF50" />;
      case 'commission':
        return <Ionicons name="cash" size={wp(6)} color="#FF9800" />;
      default:
        return <Ionicons name="wallet" size={wp(6)} color="#9C27B0" />;
    }
  };

  const getEarningColor = (type: string) => {
    switch (type) {
      case 'referral_earning':
        return '#4CAF50';
      case 'commission':
        return '#FF9800';
      default:
        return '#9C27B0';
    }
  };

  const getEarningTypeName = (type: string) => {
    switch (type) {
      case 'referral_earning':
        return 'Referral Earning';
      case 'commission':
        return 'Commission';
      default:
        return 'Earning';
    }
  };

  const renderEarningItem = ({ item }: { item: AmbassadorEarning }) => {
    const color = getEarningColor(item.type);

    return (
      <View style={[styles.earningCard, {
        borderColor: color + '30',
        backgroundColor: backgroundLight,
        borderLeftWidth: 4,
        borderLeftColor: color
      }]}>
        <View style={styles.earningHeader}>
          <View style={[styles.earningIconContainer, { backgroundColor: color + '20' }]}>
            {getEarningIcon(item.type)}
          </View>
          <View style={styles.earningInfo}>
            <ThemedText type="defaultSemiBold" style={[styles.earningType, { color }]}>
              {getEarningTypeName(item.type)}
            </ThemedText>
            <ThemedText type="tiny" style={[styles.earningDescription, { color: icon }]}>
              {item.description}
            </ThemedText>
            {item.referredUserEmail && (
              <ThemedText type="tiny" style={[styles.referredUser, { color: icon }]}>
                Referred: {item.referredUserEmail}
              </ThemedText>
            )}
            <ThemedText type="tiny" style={[styles.earningDate, { color: icon }]}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <View style={styles.earningAmount}>
            <ThemedText type="subtitle" style={[styles.amount, { color: '#4CAF50' }]}>
              +${item.amount.toFixed(2)}
            </ThemedText>
            <View style={[styles.statusBadge, {
              backgroundColor: item.status === 'completed' ? '#4CAF50' :
                item.status === 'pending' ? '#FF9800' : '#F44336'
            }]}>
              <ThemedText style={styles.statusText}>
                {item.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>

        {item.commissionRate && (
          <View style={styles.commissionInfo}>
            <ThemedText type="tiny" style={[styles.commissionRate, { color }]}>
              Commission Rate: {item.commissionRate}%
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Heading page='Ambassador Earnings' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText style={styles.loadingText}>Loading ambassador earnings...</ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Heading page='Ambassador Earnings' rightComponent={<BalanceDisplay />} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: accent }]}>
          <Ionicons name="people" size={wp(8)} color="white" />
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            {referralStats.totalReferrals}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Referrals</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="checkmark-circle" size={wp(8)} color="white" />
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            {referralStats.activeReferrals}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Active Referrals</ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
          <Ionicons name="cash" size={wp(8)} color="white" />
          <ThemedText type="defaultSemiBold" style={styles.statValue}>
            ${referralStats.totalCommission.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Commission</ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.summaryCard, { backgroundColor: backgroundLight }]}>
        <ThemedText type="defaultSemiBold" style={styles.summaryLabel}>Total Ambassador Earnings</ThemedText>
        <ThemedText type="title" style={[styles.summaryAmount, { color: accent }]}>${totalEarned.toFixed(2)}</ThemedText>
        <ThemedText style={styles.summarySubtext}>From referrals and commissions</ThemedText>
      </View>

      <FlatList
        data={earnings}
        renderItem={renderEarningItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreEarnings}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={wp(15)} color={icon} />
            <ThemedText type="defaultSemiBold" style={styles.emptyText}>
              No Ambassador Earnings Yet
            </ThemedText>
            <ThemedText type="tiny" style={styles.emptySubtext}>
              Share your referral code to start earning commissions
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={accent} />
              <ThemedText type="tiny" style={styles.loadingMoreText}>
                Loading more earnings...
              </ThemedText>
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(4),
  },
  loadingText: {
    fontSize: wp(4),
    color: '#666',
  },
  statsContainer: {
    marginHorizontal: wp(4),
    marginBottom: wp(2),
  },
  statCard: {
    width: wp(28),
    padding: wp(4),
    marginRight: wp(3),
    borderRadius: wp(3),
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: wp(6),
    color: 'white',
    marginTop: wp(1),
  },
  statLabel: {
    fontSize: wp(3),
    color: 'white',
    textAlign: 'center',
    marginTop: wp(0.5),
  },
  summaryCard: {
    margin: wp(4),
    padding: wp(6),
    borderRadius: wp(3),
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: wp(4),
    color: '#333',
    marginBottom: wp(1),
  },
  summaryAmount: {
    fontSize: wp(8),
    fontWeight: 'bold',
    marginBottom: wp(1),
  },
  summarySubtext: {
    fontSize: wp(3.5),
    color: '#666',
  },
  earningCard: {
    marginVertical: wp(2),
    marginHorizontal: wp(4),
    padding: wp(4),
    borderRadius: wp(3),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  earningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningIconContainer: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  earningInfo: {
    flex: 1,
  },
  earningType: {
    fontSize: wp(4.5),
    marginBottom: wp(1),
  },
  earningDescription: {
    fontSize: wp(3.2),
    marginBottom: wp(0.5),
  },
  referredUser: {
    fontSize: wp(3),
    marginBottom: wp(0.5),
  },
  earningDate: {
    fontSize: wp(3),
  },
  earningAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: wp(5),
    fontWeight: 'bold',
    marginBottom: wp(1),
  },
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    borderRadius: wp(1.5),
  },
  statusText: {
    color: 'white',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },
  commissionInfo: {
    marginTop: wp(2),
    paddingTop: wp(2),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commissionRate: {
    fontSize: wp(3),
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: wp(20),
    gap: wp(4),
  },
  emptyText: {
    fontSize: wp(4.5),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: wp(3.5),
    textAlign: 'center',
    color: '#666',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(4),
    gap: wp(2),
  },
  loadingMoreText: {
    color: '#666',
  },
});