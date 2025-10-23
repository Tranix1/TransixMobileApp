import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useAuth } from '@/context/AuthContext';
import { fetchDocuments } from '@/db/operations';
import { where } from 'firebase/firestore';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';

const BalanceDisplay = () => {
  const { user } = useAuth();
  const accent = useThemeColor('accent') || '#007AFF';
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletBalance();
  }, [user]);

  const loadWalletBalance = async () => {
    if (!user) return;

    try {
      const filters = [where("userId", "==", user.uid)];
      const result = await fetchDocuments("WalletTransactions", 50, undefined, filters);

      let totalBalance = 0;
      if (result.data.length) {
        result.data.forEach((transaction: any) => {
          if (transaction.status === 'completed') {
            if (transaction.type === 'deposit' || transaction.type === 'reward' || transaction.type === 'bonus') {
              totalBalance += transaction.amount;
            } else if (transaction.type === 'withdrawal') {
              totalBalance -= transaction.amount;
            }
          }
        });
      }
      setBalance(totalBalance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.balanceText}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.balanceText, { color: accent }]}>
        ${balance.toFixed(2)}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: wp(4),
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
});

export default BalanceDisplay;