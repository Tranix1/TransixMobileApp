import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, ScrollView } from 'react-native';
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

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: string;
  phoneNumber?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function NewPaymentHistory() {
  const accent = useThemeColor('accent') || '#007AFF';
  const icon = useThemeColor('icon') || '#333';
  const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
  const { user } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'reward' | 'bonus'>('all');

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const filters = [where("userId", "==", user.uid)];
      const result = await fetchDocuments("WalletTransactions", 20, undefined, filters);

      if (result.data.length) {
        console.log('Loaded wallet transactions:', result.data);
        setTransactions(result.data as WalletTransaction[]);
        setLastVisible(result.lastVisible);
      }
    } catch (error) {
      console.error('Error loading wallet transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadTransactions();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (loadingMore || !lastVisible || !user) return;

    setLoadingMore(true);
    try {
      const filters = [where("userId", "==", user.uid)];
      const result = await fetchDocuments('WalletTransactions', 20, lastVisible, filters);
      if (result) {
        setTransactions([...transactions, ...result.data as WalletTransaction[]]);
        setLastVisible(result.lastVisible);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Ionicons name="arrow-down-circle" size={wp(6)} color="#4CAF50" />;
      case 'withdrawal':
        return <Ionicons name="arrow-up-circle" size={wp(6)} color="#F44336" />;
      case 'reward':
        return <Ionicons name="gift" size={wp(6)} color="#FF9800" />;
      case 'bonus':
        return <Ionicons name="star" size={wp(6)} color="#9C27B0" />;
      default:
        return <Ionicons name="card" size={wp(6)} color="#45B7D1" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return '#4CAF50';
      case 'withdrawal':
        return '#F44336';
      case 'reward':
        return '#FF9800';
      case 'bonus':
        return '#9C27B0';
      default:
        return '#45B7D1';
    }
  };

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'reward':
        return 'Reward';
      case 'bonus':
        return 'Bonus';
      default:
        return 'Transaction';
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    filter === 'all' || transaction.type === filter
  );

  const renderFilterButton = (filterType: 'all' | 'deposit' | 'withdrawal' | 'reward' | 'bonus', label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && { backgroundColor: accent }]}
      onPress={() => setFilter(filterType)}
    >
      <ThemedText style={[styles.filterButtonText, filter === filterType && { color: 'white' }]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
    const transactionColor = getTransactionColor(item.type);
    const isPositive = item.type === 'deposit' || item.type === 'reward' || item.type === 'bonus';

    return (
      <TouchableOpacity style={[styles.transactionCard, {
        borderColor: transactionColor + '30',
        backgroundColor: backgroundLight,
        borderLeftWidth: 4,
        borderLeftColor: transactionColor
      }]}>
        <View style={styles.transactionContent}>
          <View style={[styles.transactionIconContainer, { backgroundColor: transactionColor + '20' }]}>
            {getTransactionIcon(item.type)}
          </View>
          <View style={styles.transactionInfo}>
            <ThemedText type="defaultSemiBold" style={[styles.transactionType, { color: transactionColor }]}>
              {getTransactionTypeName(item.type)}
            </ThemedText>
            <ThemedText type="tiny" style={[styles.transactionDescription, { color: icon }]}>
              {item.description}
            </ThemedText>
            <ThemedText type="tiny" style={[styles.transactionDate, { color: icon }]}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <View style={styles.transactionAmount}>
            <ThemedText type="subtitle" style={[styles.amount, {
              color: isPositive ? '#4CAF50' : '#F44336'
            }]}>
              {isPositive ? '+' : '-'}${item.amount.toFixed(2)}
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
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Heading page='Transaction History' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText style={styles.loadingText}>Loading transaction history...</ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Heading page='Transaction History' />

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('deposit', 'Deposits')}
          {renderFilterButton('withdrawal', 'Withdrawals')}
          {renderFilterButton('reward', 'Rewards')}
          {renderFilterButton('bonus', 'Bonuses')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreTransactions}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={wp(15)} color={icon} />
            <ThemedText type="defaultSemiBold" style={styles.emptyText}>
              No {filter === 'all' ? '' : getTransactionTypeName(filter)} Transactions
            </ThemedText>
            <ThemedText type="tiny" style={styles.emptySubtext}>
              Your transaction history will appear here
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={accent} />
              <ThemedText type="tiny" style={styles.loadingMoreText}>
                Loading more transactions...
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
  filterContainer: {
    marginHorizontal: wp(4),
    marginBottom: wp(2),
  },
  filterScroll: {
    marginVertical: wp(2),
  },
  filterButton: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    marginRight: wp(2),
    borderRadius: wp(5),
    backgroundColor: '#f0f0f0',
  },
  filterButtonText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#666',
  },
  transactionCard: {
    marginVertical: wp(1),
    marginHorizontal: wp(4),
    padding: wp(4),
    borderRadius: wp(3),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: wp(4.5),
    marginBottom: wp(1),
  },
  transactionDescription: {
    fontSize: wp(3.5),
    marginBottom: wp(0.5),
  },
  transactionDate: {
    fontSize: wp(3),
  },
  transactionAmount: {
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