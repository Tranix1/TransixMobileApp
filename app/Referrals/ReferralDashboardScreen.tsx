import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import WithdrawModal from '@/components/WithdrawModal';

// TODO: implement in referralService.ts — pull from your DB (e.g. Referrals + TrackedVehicles
// collections) and shape the response as ReferralDashboardData below.

import { getReferralDashboardData } from '@/Utilities/referralService.additions';

// ---------- Types ----------
// Adjust these to match your actual schema — this is my best guess based on
// SubscriptionPaymentModal and creditReferralIfEligible.

type ReferralStatus = 'subscribed' | 'not_subscribed';

interface ReferredUser {
  id: string;
  name: string;
  phoneNumber: string;
  status: ReferralStatus;
  dateReferred: string; // ISO date
  dateSubscribed?: string; // ISO date, only if subscribed
  subscriptionType?: 'truck' | 'broker' | 'tracking';
  commissionEarned: number; // total earned from this specific user
}

interface EarningsEntry {
  id: string;
  referredUserName: string;
  amount: number;
  date: string; // ISO date
  reason: string; // e.g. "Truck Subscription commission"
}

interface ReferralDashboardData {
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  referredUsers: ReferredUser[];
  earningsHistory: EarningsEntry[];
}

type FilterTab = 'all' | 'subscribed' | 'not_subscribed';

interface ReferralDashboardScreenProps {
  referrerUserId: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const ReferralDashboardScreen: React.FC<ReferralDashboardScreenProps> = ({ referrerUserId }) => {
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const iconColorTheme = useThemeColor('icon');
  const successColor =  '#2E7D32';
  const mutedColor =  '#888';

  const [data, setData] = useState<ReferralDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const result = await getReferralDashboardData(referrerUserId);
      setData(result);
    } catch (error) {
      console.error('Error loading referral dashboard:', error);
    }
  }, [referrerUserId]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'all') return data.referredUsers;
    return data.referredUsers.filter((u) => u.status === activeTab);
  }, [data, activeTab]);

  const counts = useMemo(() => {
    if (!data) return { all: 0, subscribed: 0, not_subscribed: 0 };
    const subscribed = data.referredUsers.filter((u) => u.status === 'subscribed').length;
    return {
      all: data.referredUsers.length,
      subscribed,
      not_subscribed: data.referredUsers.length - subscribed,
    };
  }, [data]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator color={accent} size="large" />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={[styles.flex, styles.centered, { backgroundColor: background }]}>
        <Ionicons name="alert-circle-outline" size={wp(10)} color={mutedColor} />
        <ThemedText style={{ color: mutedColor, marginTop: wp(2) }}>
          Couldn't load your referral data.
        </ThemedText>
        <TouchableOpacity onPress={loadData} style={{ marginTop: wp(3) }}>
          <ThemedText style={{ color: accent, fontWeight: '600' }}>Retry</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }]} edges={['top']}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={accent} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Title */}
            <ThemedText type="title" style={styles.screenTitle}>
              My Referrals
            </ThemedText>

            {/* Balance card */}
            <View style={[styles.balanceCard, { backgroundColor: accent }]}>
              <View style={styles.balanceTopRow}>
                <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
                <TouchableOpacity onPress={() => setHistoryVisible(true)} hitSlop={8}>
                  <Ionicons name="information-circle-outline" size={wp(5)} color="white" />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.balanceAmount}>${data.availableBalance.toFixed(2)}</ThemedText>

              <View style={styles.balanceStatsRow}>
                <View style={styles.balanceStat}>
                  <ThemedText style={styles.balanceStatLabel}>Total Earned</ThemedText>
                  <ThemedText style={styles.balanceStatValue}>${data.totalEarned.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.balanceStatDivider} />
                <View style={styles.balanceStat}>
                  <ThemedText style={styles.balanceStatLabel}>Withdrawn</ThemedText>
                  <ThemedText style={styles.balanceStatValue}>${data.totalWithdrawn.toFixed(2)}</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.withdrawButton, { opacity: data.availableBalance > 0 ? 1 : 0.5 }]}
                onPress={() => setWithdrawVisible(true)}
                disabled={data.availableBalance <= 0}
              >
                <Ionicons name="arrow-down-circle-outline" size={wp(4.5)} color={accent} />
                <ThemedText style={[styles.withdrawButtonText, { color: accent }]}>Withdraw</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Filter tabs */}
            <View style={[styles.tabRow, { backgroundColor: backgroundLight }]}>
              {(
                [
                  { key: 'all', label: 'All', count: counts.all },
                  { key: 'subscribed', label: 'Subscribed', count: counts.subscribed },
                  { key: 'not_subscribed', label: 'Not Subscribed', count: counts.not_subscribed },
                ] as { key: FilterTab; label: string; count: number }[]
              ).map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabOption, activeTab === tab.key && { backgroundColor: accent }]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      { color: activeTab === tab.key ? 'white' : iconColorTheme },
                    ]}
                  >
                    {tab.label} ({tab.count})
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.userRow, { backgroundColor: backgroundLight }]}>
            <View style={[styles.userAvatar, { backgroundColor: background }]}>
              <ThemedText style={styles.userAvatarText}>{item.name.charAt(0).toUpperCase()}</ThemedText>
            </View>

            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{item.name}</ThemedText>
              <ThemedText style={[styles.userPhone, { color: mutedColor }]}>{item.phoneNumber}</ThemedText>
              <ThemedText style={[styles.userDate, { color: mutedColor }]}>
                Referred {formatDate(item.dateReferred)}
              </ThemedText>
            </View>

            <View style={styles.userRight}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === 'subscribed' ? `${successColor}20` : `${mutedColor}20`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: item.status === 'subscribed' ? successColor : mutedColor },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: item.status === 'subscribed' ? successColor : mutedColor },
                  ]}
                >
                  {item.status === 'subscribed' ? 'Subscribed' : 'Not Subscribed'}
                </ThemedText>
              </View>

              {item.commissionEarned > 0 && (
                <ThemedText style={[styles.userCommission, { color: successColor }]}>
                  +${item.commissionEarned.toFixed(2)}
                </ThemedText>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={wp(10)} color={mutedColor} />
            <ThemedText style={{ color: mutedColor, marginTop: wp(2), textAlign: 'center' }}>
              {activeTab === 'all'
                ? "You haven't referred anyone yet."
                : activeTab === 'subscribed'
                ? 'None of your referrals have subscribed yet.'
                : 'All your referrals have subscribed. Nice work!'}
            </ThemedText>
          </View>
        }
      />

      <WithdrawModal
        isVisible={withdrawVisible}
        onClose={() => setWithdrawVisible(false)}
        availableBalance={data.availableBalance}
        referrerUserId={referrerUserId}
        onWithdrawSuccess={loadData}
      />

      {/* "How it's added" earnings history */}
      <Modal visible={historyVisible} transparent animationType="slide">
        <View style={styles.historyOverlay}>
          <View style={[styles.historySheet, { backgroundColor: background }]}>
            <View style={styles.historyHeader}>
              <ThemedText type="subtitle">How Your Balance Is Added</ThemedText>
              <TouchableOpacity onPress={() => setHistoryVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={wp(5.5)} color={iconColorTheme} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.historyIntro, { color: mutedColor }]}>
              You earn a commission automatically whenever someone you referred subscribes a
              vehicle. It's added to your balance right away and you can withdraw once you're
              above the minimum.
            </ThemedText>

            <FlatList
              data={data.earningsHistory}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: wp(4) }}
              renderItem={({ item }) => (
                <View style={styles.historyRow}>
                  <View style={[styles.historyIcon, { backgroundColor: `${successColor}20` }]}>
                    <Ionicons name="add" size={wp(4)} color={successColor} />
                  </View>
                  <View style={styles.historyInfo}>
                    <ThemedText style={styles.historyReason}>{item.reason}</ThemedText>
                    <ThemedText style={[styles.historySub, { color: mutedColor }]}>
                      {item.referredUserName} · {formatDate(item.date)}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.historyAmount, { color: successColor }]}>
                    +${item.amount.toFixed(2)}
                  </ThemedText>
                </View>
              )}
              ListEmptyComponent={
                <ThemedText style={{ color: mutedColor, textAlign: 'center', marginTop: wp(4) }}>
                  No earnings yet — refer someone to get started.
                </ThemedText>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: wp(4), paddingBottom: wp(8) },

  screenTitle: {
    fontSize: wp(6),
    fontWeight: 'bold',
    marginTop: wp(2),
    marginBottom: wp(4),
  },

  // Balance card
  balanceCard: {
    borderRadius: wp(4),
    padding: wp(5),
    marginBottom: wp(4),
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: wp(3.6),
    fontWeight: '600',
  },
  balanceAmount: {
    color: 'white',
    fontSize: wp(9),
    fontWeight: 'bold',
    marginTop: wp(1),
    marginBottom: wp(4),
  },
  balanceStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(4),
  },
  balanceStat: { flex: 1 },
  balanceStatDivider: {
    width: 1,
    height: wp(8),
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: wp(4),
  },
  balanceStatLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: wp(3.1),
    marginBottom: wp(0.5),
  },
  balanceStatValue: {
    color: 'white',
    fontSize: wp(4.2),
    fontWeight: '700',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1.5),
    backgroundColor: 'white',
    paddingVertical: wp(3),
    borderRadius: wp(2.5),
  },
  withdrawButtonText: {
    fontSize: wp(4),
    fontWeight: '700',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderRadius: wp(3),
    padding: wp(1),
    marginBottom: wp(4),
  },
  tabOption: {
    flex: 1,
    paddingVertical: wp(2.2),
    borderRadius: wp(2.2),
    alignItems: 'center',
  },
  tabText: {
    fontSize: wp(3.1),
    fontWeight: '600',
  },

  // User rows
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
    borderRadius: wp(3),
    marginBottom: wp(2.5),
  },
  userAvatar: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  userAvatarText: {
    fontSize: wp(4.2),
    fontWeight: '700',
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: wp(3.8),
    fontWeight: '600',
  },
  userPhone: {
    fontSize: wp(3.1),
    marginTop: wp(0.3),
  },
  userDate: {
    fontSize: wp(2.9),
    marginTop: wp(0.3),
  },
  userRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    paddingHorizontal: wp(2.5),
    paddingVertical: wp(1),
    borderRadius: wp(3),
  },
  statusDot: {
    width: wp(1.6),
    height: wp(1.6),
    borderRadius: wp(1),
  },
  statusText: {
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  userCommission: {
    fontSize: wp(3.4),
    fontWeight: '700',
    marginTop: wp(1.5),
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: wp(10),
    paddingHorizontal: wp(6),
  },

  // History sheet
  historyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  historySheet: {
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    padding: wp(5),
    maxHeight: '75%',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(2),
  },
  historyIntro: {
    fontSize: wp(3.3),
    lineHeight: wp(5),
    marginBottom: wp(4),
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp(2.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  historyIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  historyInfo: { flex: 1 },
  historyReason: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  historySub: {
    fontSize: wp(2.9),
    marginTop: wp(0.3),
  },
  historyAmount: {
    fontSize: wp(3.6),
    fontWeight: '700',
  },
});

export default ReferralDashboardScreen;
