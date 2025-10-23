import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import Heading from '@/components/Heading';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface RewardBonus {
  id: string;
  type: 'reward' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  source: string; // e.g., 'referral', 'first_deposit', 'loyalty', etc.
  createdAt: Date;
  updatedAt: Date;
}

export default function RewardsAndBonuses() {
  const accent = useThemeColor('accent') || '#007AFF';
  const icon = useThemeColor('icon') || '#333';
  const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
  const { user } = useAuth();
  const router = useRouter();

  const [rewardsBonuses, setRewardsBonuses] = useState<RewardBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  const loadRewardsBonuses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const filters = [
        where("userId", "==", user.uid),
        where("type", "in", ["reward", "bonus"])
      ];
      const result = await fetchDocuments("WalletTransactions", 20, undefined, filters);

      if (result.data.length) {
        console.log('Loaded rewards and bonuses:', result.data);
        const rewardsData = result.data as RewardBonus[];
        setRewardsBonuses(rewardsData);
        setLastVisible(result.lastVisible);

        // Calculate total earned
        const total = rewardsData
          .filter(item => item.status === 'completed')
          .reduce((sum, item) => sum + item.amount, 0);
        setTotalEarned(total);
      }
    } catch (error) {
      console.error('Error loading rewards and bonuses:', error);
      Alert.alert('Error', 'Failed to load rewards and bonuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewardsBonuses();
  }, [user]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadRewardsBonuses();
    } catch (error) {
      console.error('Error refreshing rewards and bonuses:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreRewardsBonuses = async () => {
    if (loadingMore || !lastVisible || !user) return;

    setLoadingMore(true);
    try {
      const filters = [
        where("userId", "==", user.uid),
        where("type", "in", ["reward", "bonus"])
      ];
      const result = await fetchDocuments('WalletTransactions', 20, lastVisible, filters);
      if (result) {
        const newData = result.data as RewardBonus[];
        setRewardsBonuses([...rewardsBonuses, ...newData]);
        setLastVisible(result.lastVisible);
      }
    } catch (error) {
      console.error('Error loading more rewards and bonuses:', error);
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

  const getRewardBonusIcon = (type: string, source: string) => {
    if (type === 'reward') {
      switch (source) {
        case 'referral':
          return <Ionicons name="people" size={wp(6)} color="#FF9800" />;
        case 'loyalty':
          return <Ionicons name="heart" size={wp(6)} color="#FF9800" />;
        default:
          return <Ionicons name="gift" size={wp(6)} color="#FF9800" />;
      }
    } else {
      switch (source) {
        case 'first_deposit':
          return <Ionicons name="wallet" size={wp(6)} color="#9C27B0" />;
        case 'promotion':
          return <Ionicons name="megaphone" size={wp(6)} color="#9C27B0" />;
        default:
          return <Ionicons name="star" size={wp(6)} color="#9C27B0" />;
      }
    }
  };

  const getRewardBonusColor = (type: string) => {
    return type === 'reward' ? '#FF9800' : '#9C27B0';
  };

  const getSourceName = (source: string) => {
    switch (source) {
      case 'referral':
        return 'Referral Reward';
      case 'first_deposit':
        return 'Welcome Bonus';
      case 'loyalty':
        return 'Loyalty Reward';
      case 'promotion':
        return 'Promotional Bonus';
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };

  const renderRewardBonusItem = ({ item }: { item: RewardBonus }) => {
    const color = getRewardBonusColor(item.type);

    return (
      <View style={[styles.rewardCard, {
        borderColor: color + '30',
        backgroundColor: backgroundLight,
        borderLeftWidth: 4,
        borderLeftColor: color
      }]}>
        <View style={styles.rewardHeader}>
          <View style={[styles.rewardIconContainer, { backgroundColor: color + '20' }]}>
            {getRewardBonusIcon(item.type, item.source)}
          </View>
          <View style={styles.rewardInfo}>
            <ThemedText type="defaultSemiBold" style={[styles.rewardType, { color }]}>
              {item.type === 'reward' ? 'Reward' : 'Bonus'}
            </ThemedText>
            <ThemedText type="tiny" style={[styles.rewardSource, { color }]}>
              {getSourceName(item.source)}
            </ThemedText>
            <ThemedText type="tiny" style={[styles.rewardDescription, { color: icon }]}>
              {item.description}
            </ThemedText>
            <ThemedText type="tiny" style={[styles.rewardDate, { color: icon }]}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <View style={styles.rewardAmount}>
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
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Heading page='Rewards & Bonuses' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText style={styles.loadingText}>Loading rewards and bonuses...</ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Heading page='Rewards & Bonuses' />

      <View style={[styles.summaryCard, { backgroundColor: accent }]}>
        <ThemedText type="defaultSemiBold" style={styles.summaryLabel}>Total Earned</ThemedText>
        <ThemedText type="title" style={styles.summaryAmount}>${totalEarned.toFixed(2)}</ThemedText>
        <ThemedText style={styles.summarySubtext}>From rewards and bonuses</ThemedText>
      </View>

      <FlatList
        data={rewardsBonuses}
        renderItem={renderRewardBonusItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreRewardsBonuses}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={wp(15)} color={icon} />
            <ThemedText type="defaultSemiBold" style={styles.emptyText}>
              No Rewards or Bonuses Yet
            </ThemedText>
            <ThemedText type="tiny" style={styles.emptySubtext}>
              Complete activities to earn rewards and bonuses
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={accent} />
              <ThemedText type="tiny" style={styles.loadingMoreText}>
                Loading more rewards...
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
  summaryCard: {
    margin: wp(4),
    padding: wp(6),
    borderRadius: wp(3),
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: wp(4),
    color: 'white',
    marginBottom: wp(1),
  },
  summaryAmount: {
    fontSize: wp(8),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: wp(1),
  },
  summarySubtext: {
    fontSize: wp(3.5),
    color: 'white',
    opacity: 0.9,
  },
  rewardCard: {
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
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIconContainer: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  rewardInfo: {
    flex: 1,
  },
  rewardType: {
    fontSize: wp(4.5),
    marginBottom: wp(1),
  },
  rewardSource: {
    fontSize: wp(3.5),
    marginBottom: wp(0.5),
  },
  rewardDescription: {
    fontSize: wp(3.2),
    marginBottom: wp(0.5),
  },
  rewardDate: {
    fontSize: wp(3),
  },
  rewardAmount: {
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