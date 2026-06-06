import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { fetchDocuments } from '@/db/operations';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { TokenHistory, TokenTransaction } from '@/types/types';

const RewardsHistory = () => {
  const { rewardId } = useLocalSearchParams<{ rewardId: string }>();
  const router = useRouter();
  const [tokenHistory, setTokenHistory] = useState<TokenHistory | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const background = useThemeColor('background') || Colors.light.background;
  const backgroundLight = useThemeColor('backgroundLight') || Colors.light.backgroundLight;
  const icon = useThemeColor('icon') || Colors.light.icon;
  const accent = useThemeColor('accent') || Colors.light.accent;
  const coolGray = useThemeColor('coolGray') || Colors.light.coolGray;

  useEffect(() => {
    loadTokenHistory();
  }, [rewardId]);

  const loadTokenHistory = async () => {
    if (!user?.uid || !rewardId) return;

    setLoading(true);
    try {
      const filters = [
        where("userId", "==", user.uid),
        where("rewardId", "==", rewardId)
      ];
      const result = await fetchDocuments('tokenHistory', 1, undefined, filters);

      if (result.data && result.data.length > 0) {
        setTokenHistory(result.data[0] as TokenHistory);
      } else {
        Alert.alert('No History', 'No token history found for this reward batch.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading token history:', error);
      Alert.alert('Error', 'Failed to load token history');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: 'spend' | 'reward') => {
    return type === 'spend' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTransactionColor = (type: 'spend' | 'reward') => {
    return type === 'spend' ? '#F44336' : '#4CAF50';
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Heading page="Token History" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText type="default" color={coolGray}>
            Loading token history...
          </ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!tokenHistory) {
    return (
      <ScreenWrapper>
        <Heading page="Token History" />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={coolGray} />
          <ThemedText type="default" color={coolGray}>
            No token history available
          </ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={icon} />
        </TouchableOpacity>
        <Heading page="Token History" />
      </View>

      <ScrollView style={styles.container}>
        {/* Summary Section */}
        <View style={[styles.summaryCard, { backgroundColor: background }]}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            Token Batch Summary
          </ThemedText>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <ThemedText type="tiny" color={coolGray}>Issued</ThemedText>
              <ThemedText type="subtitle" style={styles.summaryValue}>
                {tokenHistory.totalTokensGiven}
              </ThemedText>
            </View>

            <View style={styles.summaryItem}>
              <ThemedText type="tiny" color={coolGray}>Used</ThemedText>
              <ThemedText type="subtitle" style={[styles.summaryValue, { color: '#F44336' }]}>
                {tokenHistory.totalTokensUsed}
              </ThemedText>
            </View>

            <View style={styles.summaryItem}>
              <ThemedText type="tiny" color={coolGray}>Remaining</ThemedText>
              <ThemedText type="subtitle" style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {tokenHistory.tokensAvailable}
              </ThemedText>
            </View>

            <View style={styles.summaryItem}>
              <ThemedText type="tiny" color={coolGray}>Expired</ThemedText>
              <ThemedText type="subtitle" style={[styles.summaryValue, { color: '#FF9800' }]}>
                {tokenHistory.totalTokensExpired}
              </ThemedText>
            </View>
          </View>

          {/* Utilization Bar */}
          <View style={styles.utilizationContainer}>
            <View style={styles.utilizationLabel}>
              <ThemedText type="defaultSemiBold">Utilization</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                {tokenHistory.utilizationPercentage.toFixed(1)}%
              </ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(tokenHistory.utilizationPercentage, 100)}%`,
                    backgroundColor: tokenHistory.utilizationPercentage > 80 ? '#F44336' :
                                   tokenHistory.utilizationPercentage > 50 ? '#FF9800' : '#4CAF50'
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <ThemedText type="tiny" color={coolGray}>Issue Date</ThemedText>
              <ThemedText type="default">{formatDate(tokenHistory.issueDate)}</ThemedText>
            </View>
            <View style={styles.dateItem}>
              <ThemedText type="tiny" color={coolGray}>Expiry Date</ThemedText>
              <ThemedText type="default">{formatDate(tokenHistory.expiryDate)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={[styles.transactionsCard, { backgroundColor: background }]}>
          <ThemedText type="subtitle" style={styles.transactionsTitle}>
            Transaction History ({tokenHistory.transactions?.length || 0})
          </ThemedText>

          {(!tokenHistory.transactions || tokenHistory.transactions.length === 0) ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={32} color={coolGray} />
              <ThemedText type="tiny" color={coolGray}>
                No transactions yet
              </ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.transactionsList}>
              {tokenHistory.transactions.map((transaction, index) => (
                <View key={index} style={[styles.transactionItem, { backgroundColor: backgroundLight }]}>
                  <View style={styles.transactionHeader}>
                    <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                      <Ionicons
                        name={getTransactionIcon(transaction.type)}
                        size={20}
                        color={getTransactionColor(transaction.type)}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.transactionDescription}>
                        {transaction.description}
                      </ThemedText>
                      <ThemedText type="tiny" color={coolGray}>
                        {formatDate(transaction.createdAt)}
                      </ThemedText>
                      {transaction.relatedId && (
                        <ThemedText type="tiny" color={accent}>
                          ID: {transaction.relatedId}
                        </ThemedText>
                      )}
                    </View>
                    <View style={styles.transactionAmount}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ color: getTransactionColor(transaction.type) }}
                      >
                        {transaction.type === 'spend' ? '-' : '+'}{transaction.amount} T
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  closeButton: {
    marginRight: wp(2),
    padding: wp(1),
  },
  container: {
    flex: 1,
    padding: wp(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(2),
  },
  summaryCard: {
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    marginBottom: wp(3),
    color: '#1E90FF',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(4),
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: wp(5),
    fontWeight: 'bold',
    marginTop: wp(1),
  },
  utilizationContainer: {
    marginBottom: wp(4),
  },
  utilizationLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(2),
  },
  progressBar: {
    height: wp(3),
    backgroundColor: '#E0E0E0',
    borderRadius: wp(1.5),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: wp(1.5),
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    alignItems: 'center',
    flex: 1,
  },
  transactionsCard: {
    padding: wp(4),
    borderRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsTitle: {
    marginBottom: wp(3),
    color: '#1E90FF',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: wp(8),
    gap: wp(2),
  },
  transactionsList: {
    maxHeight: wp(120),
  },
  transactionItem: {
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: wp(2),
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    marginBottom: wp(1),
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
});

export default RewardsHistory;