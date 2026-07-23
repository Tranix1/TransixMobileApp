import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useAuth } from '@/context/AuthContext';
import { wp } from '@/constants/common';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { FinancePanel } from '@/components/FinancePanel';

interface DriverFinanceEntry {
  id: string;
  entryType: 'INCOME' | 'EXPENSE';
  amount: number;
  category?: string;
  milestoneLabel?: string;
  paymentMethod?: string;
  note?: string;
  createdAt?: number;
  createdByName?: string;
  tripId?: string;
  tripRef?: string;
  [key: string]: any;
}

const DriverFinance = () => {
  const { user, currentRole } = useAuth();
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const accent = useThemeColor('accent');
  const icon = useThemeColor('icon');
  const coolGray = useThemeColor('coolGray');
  const text = useThemeColor('text');

  const driverId = user?.uid || '';
  const fleetId = currentRole?.fleetId || currentRole?.organizationId || '';

  const [entries, setEntries] = useState<DriverFinanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const earnings = useMemo(
    () => entries.filter((item) => item.entryType === 'INCOME').reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [entries]
  );
  const payments = useMemo(
    () => entries.filter((item) => item.entryType === 'EXPENSE').reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [entries]
  );
  const balance = useMemo(() => earnings - payments, [earnings, payments]);

  const loadDriverFinance = async () => {
    if (!fleetId || !driverId) return;
    try {
      setLoading(true);
      const financeRef = collection(db, 'fleets', fleetId, 'Finance', 'Account', 'Transactions');
      const q = query(financeRef, where('driverId', '==', driverId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DriverFinanceEntry[];
      setEntries(data);
    } catch (error) {
      console.error('Driver finance load error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverFinance();
  }, [fleetId, driverId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDriverFinance();
    setRefreshing(false);
  };

  const status = balance >= 0 ? 'Positive' : 'Review';

  const renderTransaction = ({ item }: { item: DriverFinanceEntry }) => {
    return (
      <View style={[styles.transactionCard, { backgroundColor: backgroundLight, borderColor: accent }]}> 
        <View style={styles.transactionHeader}>
          <ThemedText type='defaultSemiBold'>{item.entryType === 'INCOME' ? 'Earning' : 'Payment'}</ThemedText>
          <ThemedText type='defaultSemiBold' style={{ color: item.entryType === 'INCOME' ? '#2E7D32' : '#D32F2F' }}>
            {item.amount?.toLocaleString ? item.amount.toLocaleString() : item.amount}
          </ThemedText>
        </View>
        <View style={styles.transactionDetailRow}>
          <ThemedText type='tiny' color={coolGray}>Category</ThemedText>
          <ThemedText type='default'>{item.category || item.milestoneLabel || 'N/A'}</ThemedText>
        </View>
        <View style={styles.transactionDetailRow}>
          <ThemedText type='tiny' color={coolGray}>Trip/Load</ThemedText>
          <ThemedText type='default'>{item.tripId || item.tripRef || 'N/A'}</ThemedText>
        </View>
        <View style={styles.transactionDetailRow}>
          <ThemedText type='tiny' color={coolGray}>Status</ThemedText>
          <ThemedText type='default'>{item.paymentMethod || 'N/A'}</ThemedText>
        </View>
        <View style={styles.transactionDetailRow}>
          <ThemedText type='tiny' color={coolGray}>Date</ThemedText>
          <ThemedText type='default'>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</ThemedText>
        </View>
        {item.note ? (
          <View style={styles.transactionDetailRow}>
            <ThemedText type='tiny' color={coolGray}>Note</ThemedText>
            <ThemedText type='default'>{item.note}</ThemedText>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.page, { backgroundColor: background }]}> 
      <Heading page='Driver Finance' />
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={[styles.summaryGrid, { backgroundColor: backgroundLight }]}> 
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Earnings</ThemedText>
            <ThemedText type='title'>{earnings.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Payments</ThemedText>
            <ThemedText type='title'>{payments.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Balance</ThemedText>
            <ThemedText type='title'>{balance.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Status</ThemedText>
            <ThemedText type='title'>{status}</ThemedText>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: backgroundLight }]}> 
          <ThemedText type='subtitle' style={styles.sectionTitle}>Transactions</ThemedText>
          {loading ? (
            <ActivityIndicator size='large' color={accent} />
          ) : (
            <FlatList
              data={entries}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<ThemedText type='default' color={coolGray}>No finance records found.</ThemedText>}
              contentContainerStyle={{ gap: wp(3) }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    padding: wp(4),
    gap: wp(4),
  },
  summaryGrid: {
    borderRadius: wp(4),
    padding: wp(4),
    gap: wp(3),
  },
  summaryCard: {
    borderRadius: wp(3),
    padding: wp(3),
  },
  section: {
    borderRadius: wp(4),
    padding: wp(4),
  },
  sectionTitle: {
    marginBottom: wp(3),
  },
  transactionCard: {
    borderRadius: wp(4),
    padding: wp(4),
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  transactionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(2),
  },
});

export default DriverFinance;
