import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useAuth } from '@/context/AuthContext';
import { wp } from '@/constants/common';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

interface BrokerageFinanceEntry {
  id: string;
  entryType: 'INCOME' | 'EXPENSE';
  amount: number;
  category?: string;
  note?: string;
  createdAt?: number;
  createdByName?: string;
  referralType?: string;
  subscriptionType?: string;
  [key: string]: any;
}

const BrokerageFinance = () => {
  const { currentRole } = useAuth();
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const accent = useThemeColor('accent');
  const coolGray = useThemeColor('coolGray');

  const brokerageId = currentRole?.organizationId || currentRole?.fleetId || '';

  const [entries, setEntries] = useState<BrokerageFinanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const subscriptionPayments = useMemo(
    () => entries.filter((item) => item.entryType === 'INCOME' && item.subscriptionType).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [entries]
  );
  const referralEarnings = useMemo(
    () => entries.filter((item) => item.entryType === 'INCOME' && item.referralType).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [entries]
  );
  const payments = useMemo(
    () => entries.filter((item) => item.entryType === 'EXPENSE').reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [entries]
  );
  const status = payments > subscriptionPayments ? 'Review' : 'Healthy';

  const loadBrokerageFinance = async () => {
    if (!brokerageId) return;
    try {
      setLoading(true);
      const financeRef = collection(db, 'fleets', brokerageId, 'Finance', 'Account', 'Transactions');
      const q = query(financeRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BrokerageFinanceEntry[];
      setEntries(data);
    } catch (error) {
      console.error('Brokerage finance load error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrokerageFinance();
  }, [brokerageId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBrokerageFinance();
    setRefreshing(false);
  };

  const renderTransaction = ({ item }: { item: BrokerageFinanceEntry }) => {
    return (
      <View style={[styles.transactionCard, { backgroundColor: backgroundLight, borderColor: accent }]}> 
        <View style={styles.transactionHeader}>
          <ThemedText type='defaultSemiBold'>{item.subscriptionType ? 'Subscription' : item.referralType ? 'Referral' : item.entryType === 'INCOME' ? 'Income' : 'Expense'}</ThemedText>
          <ThemedText type='defaultSemiBold' style={{ color: item.entryType === 'INCOME' ? '#2E7D32' : '#D32F2F' }}>
            {item.amount?.toLocaleString ? item.amount.toLocaleString() : item.amount}
          </ThemedText>
        </View>
        <View style={styles.transactionDetailRow}>
          <ThemedText type='tiny' color={coolGray}>Type</ThemedText>
          <ThemedText type='default'>{item.category || item.subscriptionType || item.referralType || 'N/A'}</ThemedText>
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
      <Heading page='Brokerage Finance' />
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={[styles.summaryGrid, { backgroundColor: backgroundLight }]}> 
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Subscription Payments</ThemedText>
            <ThemedText type='title'>{subscriptionPayments.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Referral Earnings</ThemedText>
            <ThemedText type='title'>{referralEarnings.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Payments</ThemedText>
            <ThemedText type='title'>{payments.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor }]}> 
            <ThemedText type='defaultSemiBold'>Status</ThemedText>
            <ThemedText type='title'>{status}</ThemedText>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: backgroundLight }]}> 
          <ThemedText type='subtitle' style={styles.sectionTitle}>Payment History</ThemedText>
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

export default BrokerageFinance;
