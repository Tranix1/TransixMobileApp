import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { useAuth } from '@/context/AuthContext';
import { fetchDocuments } from '@/db/operations';
import { where } from 'firebase/firestore';

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  description: string;
}

const Wallet = () => {
  const router = useRouter();
  const accent = useThemeColor('accent') || '#007AFF';
  const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
  const background = useThemeColor('background') || '#fff';
  const { user } = useAuth();
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

  const handleDepositWithdraw = () => {
    router.push('/Wallet/DepositAndWithdraw');
  };

  const handleWalletHistory = () => {
    router.push('/Wallet/WalletHistory');
  };

  const handleRewardsBonuses = () => {
    router.push('/Wallet/RewardsAndBonuses');
  };

  const handleAmbassadorEarnings = () => {
    router.push('/Wallet/AmbassodorEarnings');
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Wallet</Text>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: accent }]}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: backgroundLight }]}
            onPress={handleDepositWithdraw}
          >
            <Ionicons name="add-circle" size={wp(8)} color={accent} />
            <Text style={[styles.actionText, { color: accent }]}>Deposit/Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: backgroundLight }]}
            onPress={handleWalletHistory}
          >
            <Ionicons name="time" size={wp(8)} color={accent} />
            <Text style={[styles.actionText, { color: accent }]}>Wallet History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: backgroundLight }]}
            onPress={handleRewardsBonuses}
          >
            <Ionicons name="gift" size={wp(8)} color={accent} />
            <Text style={[styles.actionText, { color: accent }]}>Rewards & Bonuses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: backgroundLight }]}
            onPress={handleAmbassadorEarnings}
          >
            <Ionicons name="people" size={wp(8)} color={accent} />
            <Text style={[styles.actionText, { color: accent }]}>Ambassador Earnings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: wp(4),
    alignItems: 'center',
  },
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
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
  balanceLabel: {
    fontSize: wp(4),
    color: 'white',
    marginBottom: wp(2),
  },
  balanceAmount: {
    fontSize: wp(8),
    fontWeight: 'bold',
    color: 'white',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: wp(4),
  },
  actionButton: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: wp(3.5),
    fontWeight: '600',
    marginTop: wp(1),
    textAlign: 'center',
  },
});

export default Wallet;