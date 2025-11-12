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

interface RewardBonus {
  id: string;
  type: 'reward' | 'bonus';
  totalTokens: number;
  availableTokens: number;
  usedTokens: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  expiryDate: Date;
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

  const loadRewardsBonuses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const filters = [
        where("userId", "==", user.uid),
      ];
      const result = await fetchDocuments("rewards", 20, undefined, filters);

      if (result.data.length) {
        console.log('Loaded rewards and bonuses:', result.data);
        const rewardsData = (result.data as any[]).map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(item.createdAt),
          expiryDate: new Date(item.expiryDate)
        })) as RewardBonus[];
        setRewardsBonuses(rewardsData);
        setLastVisible(result.lastVisible);

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
      ];
      const result = await fetchDocuments('rewards', 20, lastVisible, filters);
      if (result) {
        const newData = (result.data as any[]).map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(item.createdAt),
          expiryDate: new Date(item.expiryDate)
        })) as RewardBonus[];
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
          return <Ionicons name="people" size={wp(6)} color="#1565C0" />;
        case 'loyalty':
          return <Ionicons name="heart" size={wp(6)} color="#1565C0" />;
        case 'loadPosting':
          return <Ionicons name="cube" size={wp(6)} color="#1565C0" />;
        case 'tracking':
          return <Ionicons name="location" size={wp(6)} color="#1565C0" />;
        default:
          return <Ionicons name="gift" size={wp(6)} color="#1565C0" />;
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
    return type === 'reward' ? '#1565C0' : '#9C27B0';
  };

  const getSourceName = (source: string) => {
    if (!source) return 'Unknown Source';
    switch (source) {
      case 'referral':
        return 'Referral Reward';
      case 'first_deposit':
        return 'Welcome Bonus';
      case 'loyalty':
        return 'Loyalty Reward';
      case 'promotion':
        return 'Promotional Bonus';
      case 'loadPosting':
        return 'Load Posting Reward';
      case 'tracking':
        return 'Tracking Reward';
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
                {item.description}
              </ThemedText>
             <View style={{ alignItems: 'flex-start', marginTop: wp(1) }}>
  {/* Issued Date */}
  <ThemedText type="tiny" style={[styles.rewardDate, { color: icon }]}>
    Issued: {formatDate(item.createdAt)}
  </ThemedText>

  {/* Expiry Date */}
  {item.expiryDate && (
    <ThemedText type="tiny" style={[styles.rewardDate, { color: '#F44336', marginTop: wp(0.5) }]}>
      Expires: {formatDate(item.expiryDate)}
    </ThemedText>
  )}
</View>

            </View>
            <View style={styles.rewardCard}>
    <ThemedText type="subtitle" style={styles.label}>Balance</ThemedText>
    <ThemedText type="subtitle" style={styles.balanceText}>
      {Math.abs(item.availableTokens || 0)} T
    </ThemedText>

    <View style={styles.separator} />

    <ThemedText type="subtitle" style={styles.label}>Used</ThemedText>
    <ThemedText type="subtitle" style={styles.usedText}>
      {Math.abs(item.usedTokens || 0)} T
    </ThemedText>
  </View>

          </View>
        </View>
      );
  };

 

  return (
    <ScreenWrapper>
      <Heading page='Rewards & Bonuses'  />


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
  // Loading states
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

  // Reward card
  rewardCard: {
    backgroundColor: 'transparent',
    marginVertical: wp(1.5),
    paddingVertical: wp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  // Reward labels
  label: {
    fontSize: wp(2.8),
    color: '#757575',
    fontWeight: '600',
  },
  balanceText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#1565C0',
    marginTop: wp(0.5),
  },
  usedText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#F44336',
    marginTop: wp(0.5),
  },

  // Separator line
  separator: {
    width: '80%',
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    marginVertical: wp(1),
  },

  // Reward header
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(2),
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
    fontSize: wp(4),
    fontWeight: '600',
    marginBottom: wp(0.5),
  },
  rewardSource: {
    fontSize: wp(3.5),
    color: '#555',
    marginBottom: wp(0.5),
  },
  rewardDescription: {
    fontSize: wp(3.2),
    color: '#666',
    marginBottom: wp(0.5),
  },
  rewardDate: {
    fontSize: wp(3),
    color: '#999',
  },

  // Reward amount section
  rewardAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    marginBottom: wp(0.5),
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    borderRadius: wp(1.5),
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },

  // Empty states
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

  // Loading more
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(3),
    gap: wp(2),
  },
  loadingMoreText: {
    color: '#666',
  },
});
