import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, ScrollView } from 'react-native';
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
import QRCode from 'react-native-qrcode-svg';

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

interface Payment {
  id: string;
  serviceType?: string;
  fuelType?: string;
  price?: number;
  quantity?: number;
  totalAmount: number;
  stationName: string;
  stationId: string;
  purchaseDate: string;
  qrCode: string;
  status: 'pending' | 'completed' | 'cancelled';
  serviceCategory?: 'fuel' | 'truckstop' | 'tracking' | 'git' | 'warehouse' | 'loads' | 'trucks' | 'contracts';
  userId: string;
  userEmail?: string;
  paymentMethod: string;
  phoneNumber: string;

  // New multi-item support
  fuelItems?: Array<{
    fuelType: string;
    fuelName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  serviceItems?: Array<{
    serviceType: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  isMultiPayment?: boolean;

  // Route details for navigation
  routeDetails?: {
    destinationLatitude: number;
    destinationLongitude: number;
    destinationName: string;
    distance?: string;
    duration?: string;
    durationInTraffic?: string;
    routePolyline?: string;
    bounds?: any;
  };

  createdAt: Date;
  updatedAt: Date;
}

type HistoryItem = (WalletTransaction | Payment) & { historyType: 'transaction' | 'payment' };

export default function WalletHistory() {
  const accent = useThemeColor('accent') || '#007AFF';
  const icon = useThemeColor('icon') || '#333';
  const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
  const { user } = useAuth();
  const router = useRouter();

  // StyleSheet needs access to theme colors, so we create styles inline
  const dynamicStyles = {
    filterButton: {
      paddingHorizontal: wp(3),
      paddingVertical: wp(0.4),
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: '#666',
    },
    
    filterButtonText: {
      fontSize: wp(3),
      // color: icon,
      fontWeight: '500' as const,
    },
    selectedFilterText: {
      color: accent,
      fontWeight: '800' as const,
    },
  };

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  // Removed unused filter state
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Build filters based on user selections
      let filters: any[] = [where("userId", "==", user.uid)];

      // Add type filter
      if (selectedType !== 'all') {
        if (selectedType === 'transactions') {
          filters.push(where("historyType", "==", "transaction"));
        } else if (selectedType === 'payments') {
          filters.push(where("historyType", "==", "payment"));
        }
      }

      // Add category filter for payments
      if (selectedCategory !== 'all' && selectedType === 'payments') {
        filters.push(where("serviceCategory", "==", selectedCategory));
      }

      const result = await fetchDocuments("WalletHistory", 20, undefined, filters);

      if (result.data.length) {
        // Convert all items to HistoryItem format with proper typing
        const allItems = result.data.map((item: any) => ({
          ...item,
          historyType: item.historyType as 'transaction' | 'payment'
        })) as HistoryItem[];

        setHistoryItems(allItems);
        setLastVisible(result.lastVisible);
      } else {
        setHistoryItems([]);
        setLastVisible(null);
      }
    } catch (error) {
      console.error('Error loading wallet history:', error);
      Alert.alert('Error', 'Failed to load wallet history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedType, selectedCategory]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error('Error refreshing wallet history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreData = async () => {
    if (loadingMore || !lastVisible || !user) return;

    setLoadingMore(true);
    try {
      // Build filters based on current selections
      let filters: any[] = [where("userId", "==", user.uid)];

      if (selectedType !== 'all') {
        if (selectedType === 'transactions') {
          filters.push(where("historyType", "==", "transaction"));
        } else if (selectedType === 'payments') {
          filters.push(where("historyType", "==", "payment"));
        }
      }

      if (selectedCategory !== 'all' && selectedType === 'payments') {
        filters.push(where("serviceCategory", "==", selectedCategory));
      }

      const result = await fetchDocuments('WalletHistory', 20, lastVisible, filters);
      if (result) {
        // Convert and add to history items
        const newItems = result.data.map((item: any) => ({
          ...item,
          historyType: item.historyType as 'transaction' | 'payment'
        })) as HistoryItem[];

        setHistoryItems([...historyItems, ...newItems]);
        setLastVisible(result.lastVisible);
      }
    } catch (error) {
      console.error('Error loading more wallet history:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'No Date';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'Invalid Date';
    }
  };

  // Sort history items by date (newest first)
  const getSortedHistory = (): HistoryItem[] => {
    return historyItems.sort((a, b) => {
      const getDateValue = (item: any) => {
        try {
          if (item.createdAt instanceof Date) return item.createdAt;
          if (item.createdAt) return new Date(item.createdAt);
          if (item.updatedAt instanceof Date) return item.updatedAt;
          if (item.updatedAt) return new Date(item.updatedAt);
          if (item.purchaseDate instanceof Date) return item.purchaseDate;
          if (item.purchaseDate) return new Date(item.purchaseDate);
          return new Date(0);
        } catch (error) {
          console.warn('Error parsing date for item:', item.id, error);
          return new Date(0);
        }
      };

      const dateA = getDateValue(a);
      const dateB = getDateValue(b);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const filteredHistory = getSortedHistory();

  const handleNavigateToMap = (payment: Payment) => {
    console.log('WalletHistory: Navigation button pressed for payment:', payment.id);
    console.log('WalletHistory: Route details:', payment.routeDetails);
    if (payment.routeDetails) {
      const destinationType = payment.serviceCategory === 'fuel' ? 'Fuel Station' : 'Truck Stop';
      router.push({
        pathname: "/Map/Index",
        params: {
          destinationLati: payment.routeDetails.destinationLatitude.toString(),
          destinationLongi: payment.routeDetails.destinationLongitude.toString(),
          destinationName: payment.routeDetails.destinationName,
          destinationType: destinationType
        }
      });
    } else {
      console.log('WalletHistory: No route details available for payment:', payment.id);
    }
  };

  const getServiceIcon = (payment: Payment) => {
    switch (payment.serviceCategory) {
      case 'fuel':
        return <Ionicons name="car" size={wp(5)} color="#FF6B35" />;
      case 'truckstop':
        return <Ionicons name="restaurant" size={wp(5)} color="#4ECDC4" />;
      case 'tracking':
        return <Ionicons name="location" size={wp(5)} color="#9C27B0" />;
      case 'git':
        return <Ionicons name="shield-checkmark" size={wp(5)} color="#FF9800" />;
      case 'warehouse':
        return <Ionicons name="storefront" size={wp(5)} color="#795548" />;
      case 'loads':
        return <Ionicons name="cube" size={wp(5)} color="#607D8B" />;
      case 'trucks':
        return <Ionicons name="car-sport" size={wp(5)} color="#3F51B5" />;
      case 'contracts':
        return <Ionicons name="document-text" size={wp(5)} color="#E91E63" />;
      default:
        if (payment.serviceType === 'fuel' || payment.fuelType) {
          return <Ionicons name="car" size={wp(5)} color="#FF6B35" />;
        } else if (payment.serviceType) {
          return <Ionicons name="restaurant" size={wp(5)} color="#4ECDC4" />;
        }
        return <Ionicons name="card" size={wp(5)} color="#45B7D1" />;
    }
  };

  const getServiceColor = (payment: Payment) => {
    switch (payment.serviceCategory) {
      case 'fuel':
        return '#FF6B35';
      case 'truckstop':
        return '#4ECDC4';
      case 'tracking':
        return '#4CAF50'; // Changed from purple to green for tracking payments
      case 'git':
        return '#FF9800';
      case 'warehouse':
        return '#795548';
      case 'loads':
        return '#607D8B';
      case 'trucks':
        return '#3F51B5';
      case 'contracts':
        return '#E91E63';
      default:
        if (payment.serviceType === 'fuel' || payment.fuelType) {
          return '#FF6B35';
        } else if (payment.serviceType) {
          return '#4ECDC4';
        }
        return '#45B7D1';
    }
  };

  const getServiceName = (payment: Payment) => {
    if (payment.isMultiPayment) {
      if (payment.serviceCategory === 'fuel' && payment.fuelItems && payment.fuelItems.length > 0) {
        const fuelNames = payment.fuelItems.map(item => item.fuelName).join(', ');
        return `Fuel: ${fuelNames}`;
      } else if (payment.serviceCategory === 'truckstop' && payment.serviceItems && payment.serviceItems.length > 0) {
        const serviceNames = payment.serviceItems.map(item => item.serviceType).join(', ');
        return `Truck Stop: ${serviceNames}`;
      }
    }

    switch (payment.serviceCategory) {
      case 'fuel':
        return payment.fuelType || 'Fuel';
      case 'truckstop':
        return payment.serviceType || 'Truck Stop Service';
      case 'tracking':
        return 'Vehicle Tracking Service';
      case 'git':
        return 'GIT Insurance';
      case 'warehouse':
        return 'Warehouse Storage';
      case 'loads':
        return 'Load Management';
      case 'trucks':
        return 'Truck Services';
      case 'contracts':
        return 'Contract Services';
      default:
        if (payment.serviceType === 'fuel' || payment.fuelType) {
          return payment.fuelType || 'Fuel';
        } else if (payment.serviceType) {
          return payment.serviceType;
        }
        return 'Service';
    }
  };

  const showQRCode = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowQRModal(true);
  };

  // Removed unused renderFilterButton function

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    // Skip wallet transactions that are actually service payments (duplicates)
    if (item.historyType === 'transaction' && (item as any).serviceCategory) {
      return null;
    }

    // Skip payment records that are actually wallet transactions (should only show in transactions)
    if (item.historyType === 'payment' && !(item as any).serviceCategory) {
      return null;
    }

    if (item.historyType === 'transaction') {
      const transaction = item as WalletTransaction & { historyType: 'transaction' };
      const transactionColor = transaction.type === 'deposit' ? '#4CAF50' :
                              transaction.type === 'withdrawal' ? '#F44336' :
                              transaction.type === 'reward' ? '#FF9800' : '#9C27B0';
      const isPositive = transaction.type === 'deposit' || transaction.type === 'reward' || transaction.type === 'bonus';

      return (
        <View style={[styles.historyCard, {
          borderColor: transactionColor + '30',
          backgroundColor: backgroundLight,
          borderLeftWidth: 4,
          borderLeftColor: transactionColor
        }]}>
          <View style={styles.historyHeader}>
            <View style={[styles.historyIconContainer, { backgroundColor: transactionColor + '20' }]}>
              {transaction.type === 'deposit' ? <Ionicons name="arrow-down-circle" size={wp(6)} color="#4CAF50" /> :
               transaction.type === 'withdrawal' ? <Ionicons name="arrow-up-circle" size={wp(6)} color="#F44336" /> :
               transaction.type === 'reward' ? <Ionicons name="gift" size={wp(6)} color="#FF9800" /> :
               <Ionicons name="star" size={wp(6)} color="#9C27B0" />}
            </View>
            <View style={styles.historyInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.historyType, { color: transactionColor }]}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </ThemedText>
              <ThemedText type="tiny" style={[styles.historyDescription, { color: icon }]}>
                {transaction.description}
              </ThemedText>
              <ThemedText type="tiny" style={[styles.historyDate, { color: icon }]}>
                {formatDate(transaction.createdAt || transaction.updatedAt)}
              </ThemedText>
            </View>
            <View style={styles.historyAmount}>
              <ThemedText type="subtitle" style={[styles.amount, {
                color: isPositive ? '#4CAF50' : '#F44336'
              }]}>
                {isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
              </ThemedText>
              <View style={[styles.statusBadge, {
                backgroundColor: transaction.status === 'completed' ? '#4CAF50' :
                  transaction.status === 'pending' ? '#FF9800' : '#F44336'
              }]}>
                <ThemedText style={styles.statusText}>
                  {transaction.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      const payment = item as Payment & { historyType: 'payment' };
      const serviceColor = getServiceColor(payment);

      return (
        <View style={[styles.historyCard, {
          borderColor: serviceColor + '30',
          backgroundColor: backgroundLight,
          borderLeftWidth: 4,
          borderLeftColor: serviceColor
        }]}>
          <View style={styles.historyHeader}>
            <View style={[styles.historyIconContainer, { backgroundColor: serviceColor + '20' }]}>
              {getServiceIcon(payment)}
            </View>
            <View style={styles.historyInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.historyType, { color: serviceColor }]}>
                {payment.stationName}
              </ThemedText>
              <ThemedText type="tiny" style={[styles.historyDescription, { color: serviceColor }]}>
                {getServiceName(payment)}
              </ThemedText>
              <ThemedText type="tiny" style={[styles.historyDate, { color: icon }]}>
                {formatDate(payment.purchaseDate || payment.createdAt || payment.updatedAt)}
              </ThemedText>
            </View>
            <View style={styles.historyAmount}>
              <ThemedText type="subtitle" style={[styles.amount, { color: serviceColor }]}>
                ${payment.totalAmount.toFixed(2)}
              </ThemedText>
              <View style={[styles.statusBadge, {
                backgroundColor: payment.status === 'completed' ? '#4CAF50' :
                  payment.status === 'pending' ? '#FF9800' : '#F44336'
              }]}>
                <ThemedText style={styles.statusText}>
                  {payment.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.historyDetails}>
            <View style={styles.detailRow}>
              <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>Payment Method:</ThemedText>
              <ThemedText type="tiny" style={styles.detailValue}>
                {payment.paymentMethod?.toUpperCase() || 'ECOCASH'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: serviceColor }]}
              onPress={() => showQRCode(payment)}
            >
              <Ionicons name="qr-code" size={wp(4)} color="white" />
              <ThemedText style={styles.qrButtonText}>View QR Code</ThemedText>
            </TouchableOpacity>

            {(payment.serviceCategory === 'fuel' || payment.serviceCategory === 'truckstop') && payment.routeDetails && (
              <TouchableOpacity
                style={[styles.navigateButton, {
                  backgroundColor: backgroundLight,
                  borderColor: serviceColor
                }]}
                onPress={() => handleNavigateToMap(payment)}
              >
                <Ionicons name="navigate" size={wp(4)} color={serviceColor} />
                <ThemedText style={[styles.navigateButtonText, { color: serviceColor }]}>
                  Get Directions
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Heading page='Wallet History' rightComponent={<BalanceDisplay />} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText style={styles.loadingText}>Loading wallet history...</ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Heading page='Wallet History' rightComponent={<BalanceDisplay />} />

      <View style={styles.filterContainer}>
        {/* Type and Category Filters */}
        <View style={styles.advancedFilters}>
          <View style={styles.filterRow}>
            <ThemedText style={styles.filterLabel}>Type:</ThemedText>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, selectedType === 'all' && {backgroundColor: accent + '20',borderWidth: 0,}]}
              onPress={() => setSelectedType('all')}
            >
              <ThemedText style={[dynamicStyles.filterButtonText, selectedType === 'all' && dynamicStyles.selectedFilterText]}>All</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, selectedType === 'transactions' && {backgroundColor: accent + '20',borderWidth: 0,}]}
              onPress={() => setSelectedType('transactions')}
            >
              <ThemedText style={[dynamicStyles.filterButtonText, selectedType === 'transactions' && dynamicStyles.selectedFilterText]}>Transactions</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.filterButton, selectedType === 'payments' && {backgroundColor: accent + '20',borderWidth: 0,}]}
              onPress={() => setSelectedType('payments')}
            >
              <ThemedText style={[dynamicStyles.filterButtonText, selectedType === 'payments' && dynamicStyles.selectedFilterText]}>Payments</ThemedText>
            </TouchableOpacity>
          </View>

          {selectedType === 'payments' && (
            <View style={styles.filterRow}>
              <ThemedText style={styles.filterLabel}>Category:</ThemedText>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, selectedCategory === 'all' && {backgroundColor: accent + '20',borderWidth: 0,}]}
                onPress={() => setSelectedCategory('all')}
              >
                <ThemedText style={[dynamicStyles.filterButtonText, selectedCategory === 'all' && dynamicStyles.selectedFilterText]}>All</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, selectedCategory === 'fuel' && {backgroundColor: accent + '20',borderWidth: 0,}]}
                onPress={() => setSelectedCategory('fuel')}
              >
                <ThemedText style={[dynamicStyles.filterButtonText, selectedCategory === 'fuel' && dynamicStyles.selectedFilterText]}>Fuel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, selectedCategory === 'tracking' && {backgroundColor: accent + '20',borderWidth: 0,}]}
                onPress={() => setSelectedCategory('tracking')}
              >
                <ThemedText style={[dynamicStyles.filterButtonText, selectedCategory === 'tracking' && dynamicStyles.selectedFilterText]}>Tracking</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.filterButton, selectedCategory === 'load' && {backgroundColor: accent + '20',borderWidth: 0,}]}
                onPress={() => setSelectedCategory('load')}
              >
                <ThemedText style={[dynamicStyles.filterButtonText, selectedCategory === 'load' && dynamicStyles.selectedFilterText]}>Loads</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => `${item.historyType}_${item.id}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={wp(15)} color={icon} />
            <ThemedText type="defaultSemiBold" style={styles.emptyText}>
              No History Found
            </ThemedText>
            <ThemedText type="tiny" style={styles.emptySubtext}>
              {selectedType !== 'all' || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Your wallet history will appear here'}
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={accent} />
              <ThemedText type="tiny" style={styles.loadingMoreText}>
                Loading more history...
              </ThemedText>
            </View>
          ) : null
        }
      />

      {/* QR Code Modal */}
      {showQRModal && selectedPayment && (
        <View style={styles.qrModalOverlay}>
          <View style={[styles.qrModal, {
            backgroundColor: getServiceBackgroundColor(selectedPayment),
            borderColor: getServiceColor(selectedPayment) + '30',
            borderWidth: 2
          }]}>
            <View style={styles.qrModalHeader}>
              <ThemedText type="subtitle" style={{ color: getServiceColor(selectedPayment) }}>
                QR Code
              </ThemedText>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={wp(5)} color={icon} />
              </TouchableOpacity>
            </View>

            <View style={[styles.qrCodeContainer, {
              borderColor: getServiceColor(selectedPayment) + '20',
              backgroundColor: backgroundLight
            }]}>
              <QRCode
                value={selectedPayment.qrCode}
                size={wp(60)}
                color="black"
                backgroundColor="white"
              />
            </View>

            <View style={styles.qrDetails}>
              <ThemedText type="defaultSemiBold" style={[styles.qrStationName, { color: getServiceColor(selectedPayment) }]}>
                {selectedPayment.stationName}
              </ThemedText>
              <ThemedText type="tiny" style={[styles.qrServiceName, { color: getServiceColor(selectedPayment) }]}>
                {getServiceName(selectedPayment)}
              </ThemedText>
              <ThemedText type="tiny" style={[styles.qrAmount, { color: getServiceColor(selectedPayment) }]}>
                ${selectedPayment.totalAmount.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
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
  // Removed unused filter button styles
  historyCard: {
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
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(3),
  },
  historyIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: wp(4.2),
    marginBottom: wp(1),
  },
  historyDescription: {
    fontSize: wp(3.2),
    marginBottom: wp(0.5),
  },
  historyDate: {
    fontSize: wp(2.8),
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: wp(4.5),
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
  historyDetails: {
    marginBottom: wp(3),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(1),
  },
  detailLabel: {
    fontSize: wp(3),
    color: '#666',
  },
  detailValue: {
    fontSize: wp(3),
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: wp(2),
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    gap: wp(2),
  },
  qrButtonText: {
    color: 'white',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 2,
    gap: wp(2),
  },
  navigateButtonText: {
    fontSize: wp(3.5),
    fontWeight: '600',
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
  qrModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  qrModal: {
    width: '100%',
    maxWidth: wp(90),
    padding: wp(5),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: wp(4),
  },
  qrCodeContainer: {
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrDetails: {
    alignItems: 'center',
    gap: wp(1),
  },
  qrStationName: {
    fontSize: wp(4),
    textAlign: 'center',
  },
  qrServiceName: {
    fontSize: wp(3.2),
    color: '#666',
    textAlign: 'center',
  },
  qrAmount: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  advancedFilters: {
    marginTop: wp(2),
    gap: wp(2),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  filterLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#666',
    minWidth: wp(15),
  },
  // Removed static filter button styles - now using dynamic styles
});

function getServiceBackgroundColor(selectedPayment: Payment) {
  return '#f5f5f5'; // Default background
}