import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, TouchableNativeFeedback, ActivityIndicator, RefreshControl, StyleSheet, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { fetchDocuments, isTrackingAgent, addTrackingAgent } from '@/db/operations';
import Heading from "@/components/Heading";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "@/context/AuthContext";
import AccentRingLoader from "@/components/AccentRingLoader";
import { VehicleLifecycleService, startVehicleLifecycleMonitoring } from '@/services/vehicleLifecycleService';
import { openWhatsApp, getContactMessage } from '@/Utilities/whatsappUtils';

interface Device {
  id: string;
  vehicleName: string;
  status?: string;
  deviceId: number;
  vehicleCategory?: string;
  vehicleSubType?: string;
  paymentType?: string;
  customerEmail?: string;
  subscription?: {
    status: string; // trial | active | expired | cancelled | once_off | deleted_from_traccar
    expiryDate?: string; // for active subscriptions
    trialStartAt?: string; // ISO string
    trialEndAt?: string;   // ISO string
    nextBillingAt?: string;
    isTrial?: boolean;
    trialDays?: number;
    isOnceOff?: boolean;
    accessStartAt?: string;
    accessEndAt?: string;
    restrictToCurrentLocation?: boolean;
    autoDeleteFromTraccar?: boolean;
    deletedAt?: string;
  };
}

export default function Index() {
  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')
  const { user } = useAuth();
  const backgroundLight = useThemeColor('backgroundLight')

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAgent, setIsAgent] = useState(false);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);


  const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)

  useEffect(() => {
    const checkAgentStatus = async () => {
      if (user) {
        const agent = await isTrackingAgent(user.uid);
        setIsAgent(agent);
      }
    };
    checkAgentStatus();

    // Start vehicle lifecycle monitoring
    startVehicleLifecycleMonitoring();
  }, [user]);

  const LoadTructs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let filters = [where("customerId", "==", user.uid)];
      const maLoads = await fetchDocuments("TrackedVehicles", 10, undefined, filters);

      if (maLoads.data.length) {

        if (filters.length > 0 && maLoads.data.length < 0) setFilteredPNotAavaialble(true)
        setDevices(maLoads.data as Device[])
        setLastVisible(maLoads.lastVisible)
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch devices.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    LoadTructs();
  }, [user])

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await LoadTructs();
      setRefreshing(false);

    } catch (error) {

    }
  };

  const [processingVehicleId, setProcessingVehicleId] = useState<string | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);

  const handleSubscription = async (vehicleId: string, vehicleName: string) => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to subscribe.');
      return;
    }

    setProcessingVehicleId(vehicleId);

    try {
      // Check wallet balance
      const { hasSufficientBalance, deductFromWallet } = await import('@/Utilities/walletUtils');
      const hasBalance = await hasSufficientBalance(user.uid, 10);

      if (!hasBalance) {
        setShowInsufficientBalanceModal(true);
        setProcessingVehicleId(null);
        return;
      }

      // Confirm subscription
      Alert.alert(
        'Confirm Subscription',
        `Subscribe to vehicle tracking for "${vehicleName}" for $10/month?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setProcessingVehicleId(null)
          },
          {
            text: 'Subscribe',
            onPress: async () => {
              try {
                // Deduct from wallet
                const deductionSuccess = await deductFromWallet(
                  user.uid,
                  10,
                  `Vehicle Tracking Subscription for ${vehicleName}`,
                  'wallet'
                );

                if (!deductionSuccess) {
                  Alert.alert('Error', 'Failed to process payment. Please try again.');
                  setProcessingVehicleId(null);
                  return;
                }

                // Update vehicle subscription
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);

                const { updateDocument, addDocument } = await import('@/db/operations');

                await updateDocument("TrackedVehicles", vehicleId, {
                  subscription: {
                    status: "active",
                    expiryDate: expiryDate.toISOString(),
                  },
                  paymentType: "Subscription",
                });

                // Save payment to Payments collection
                const paymentId = `TRACKING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const paymentData = {
                  id: paymentId,
                  serviceType: 'Vehicle Tracking Subscription',
                  price: 10,
                  quantity: 1,
                  totalAmount: 10,
                  stationName: 'Transix Tracking Service',
                  stationId: 'tracking-service',
                  purchaseDate: new Date().toISOString(),
                  qrCode: `TRACKING_PAYMENT:${paymentId}:${vehicleId}:subscription:1:10`,
                  status: 'completed',
                  serviceCategory: 'tracking',
                  userId: user.uid,
                  userEmail: user.email,
                  paymentMethod: 'wallet',
                  phoneNumber: '',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };

                await addDocument('Payments', paymentData);

                Alert.alert('Success', 'Vehicle successfully subscribed to tracking!');
                LoadTructs(); // Refresh the list
              } catch (error: any) {
                console.error('Error processing subscription:', error);
                Alert.alert('Error', 'Failed to process subscription. Please try again.');
              } finally {
                setProcessingVehicleId(null);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error checking balance:', error);
      Alert.alert('Error', 'Failed to check wallet balance. Please try again.');
      setProcessingVehicleId(null);
    }
  };

  const handleReAddVehicle = async (vehicleId: string, vehicleName: string) => {
    Alert.alert(
      "Re-add Vehicle",
      `Do you want to re-add "${vehicleName}" for another 4-hour tracking session?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Re-add",
          onPress: async () => {
            try {
              const result = await VehicleLifecycleService.reAddVehicleToTraccar(vehicleId);
              if (result.success) {
                Alert.alert("Success", "Vehicle re-added successfully! You have 4 hours of tracking.");
                // Immediately navigate to map using the new deviceId
                if (result.deviceId) {
                  router.push({
                    pathname: "/Tracking/Map",
                    params: {
                      deviceId: result.deviceId,
                      firebaseDocId: vehicleId,
                      isOnceOff: 'true'
                    },
                  });
                } else {
                  // Fallback: refresh list if deviceId wasn't returned for any reason
                  LoadTructs();
                }
              } else {
                Alert.alert("Error", result.error || "Failed to re-add vehicle");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to re-add vehicle");
            }
          }
        }
      ]
    );
  };

  const loadMoreLoads = async () => {

    if (loadingMore || !lastVisible) return;
    setLoadingMore(true);
    try {
      let filters = [where("customerId", "==", user?.uid)];
      const result = await fetchDocuments('TrackedVehicles', 10, lastVisible, filters);
      if (result) {
        setDevices([...devices, ...result.data as Device[]]);
        setLastVisible(result.lastVisible);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch more devices.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleBecomeAgent = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to become an agent.');
      return;
    }
    try {
      await addTrackingAgent(user.uid, user.uid);
      setIsAgent(true);
      Alert.alert('Success', 'You are now a tracking agent.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to become a tracking agent.');
    }
  };

  const handleContactUs = () => {
    const message = getContactMessage('tracking');
    openWhatsApp('+263716325160', message);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <AccentRingLoader color={accent} size={48} dotSize={8} />

          <ThemedText>Loading devices...</ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>

      <Heading page='Tracking' rightComponent={
        isAgent ? (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: wp(3) }}>
            <View>
              <TouchableNativeFeedback onPress={() => router.push('/Tracking/AddTrackedVehicle')}>
                <ThemedText style={{ alignSelf: 'flex-start' }}>Add Vehicle</ThemedText>
              </TouchableNativeFeedback>
            </View>
            {user?.uid === 'QOC9krp5BOR7NhFXRuX5f32u17e2' && (
              <View style={{ marginLeft: wp(4) }}>
                <TouchableNativeFeedback onPress={() => router.push('/Tracking/AddAgent')}>
                  <ThemedText style={{ alignSelf: 'flex-start' }}>Add Agent</ThemedText>
                </TouchableNativeFeedback>
              </View>
            )}
          </View>
        ) : !isAgent && user?.uid !== 'QOC9krp5BOR7NhFXRuX5f32u17e2' ? (
          <View style={{ marginRight: wp(3) }}>
            <TouchableNativeFeedback onPress={handleContactUs}>
              <ThemedText style={{ alignSelf: 'flex-start' }}>Contact Us</ThemedText>
            </TouchableNativeFeedback>
          </View>
        ) : undefined
      } />

      <FlatList
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{}}
        data={devices}
        renderItem={({ item }) => {
          const now = new Date();
          const isActivePaid = !!(item.subscription && item.subscription.status === 'active' && item.subscription.expiryDate && new Date(item.subscription.expiryDate) > now);
          const isActiveTrial = !!(item.subscription && item.subscription.status === 'trial' && item.subscription.trialEndAt && new Date(item.subscription.trialEndAt) > now);
          const isOnceOffActive = VehicleLifecycleService.isOnceOffAccessValid(item);
          const isDeletedFromTraccar = item.subscription?.status === 'deleted_from_traccar';
          const isOnceOff = !!item.subscription?.isOnceOff;
          const isOnceOffExpired = isOnceOff && !isOnceOffActive && !isDeletedFromTraccar;
          const isAccessible = isActivePaid || isActiveTrial || isOnceOffActive;
          const subscriptionColor = isAccessible ? 'green' : isDeletedFromTraccar ? 'orange' : 'red';
          const remainingTime = VehicleLifecycleService.getRemainingAccessTime(item);

          // Derive cooldownUntil: prefer stored cooldownUntil, otherwise accessEndAt + 30min
          let cooldownUntil: Date | null = null;
          if ((item as any).subscription?.cooldownUntil) {
            cooldownUntil = new Date((item as any).subscription.cooldownUntil);
          } else if ((item as any).subscription?.accessEndAt) {
            const accessEnd = new Date((item as any).subscription.accessEndAt);
            cooldownUntil = new Date(accessEnd.getTime() + 30 * 60 * 1000);
          }
          const cooldownMs = cooldownUntil ? cooldownUntil.getTime() - now.getTime() : 0;
          const cooldownRemainingMin = cooldownUntil ? Math.max(0, Math.ceil(cooldownMs / 60000)) : 0;

          return (
            <TouchableOpacity
              style={{
                padding: 12,
                marginVertical: 8,
                marginHorizontal: 16,
                borderRadius: 12,
                // borderColor: subscriptionColor,
                backgroundColor: backgroundLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.8}
              onPress={() => {
                if (isAccessible) {
                  router.push({
                    pathname: "/Tracking/Map",
                    params: {
                      deviceId: item.deviceId,
                      firebaseDocId: item.id,
                      isOnceOff: item.subscription?.isOnceOff ? 'true' : 'false'
                    },
                  });
                } else if (isDeletedFromTraccar) {
                  handleReAddVehicle(item.id, item.vehicleName);
                } else if (isOnceOffExpired) {
                  // If cooldown has passed (or not set), allow re-adding immediately
                  if (!cooldownUntil || cooldownRemainingMin === 0) {
                    handleReAddVehicle(item.id, item.vehicleName);
                  } else {
                    Alert.alert("Session regenerating", `Please wait ${cooldownRemainingMin} minute(s) before starting a new 4-hour session.`);
                  }
                } else {
                  handleSubscription(item.id, item.vehicleName);
                }
              }}
              disabled={processingVehicleId === item.id}
            >
              <View style={{ flexDirection: "column" }}>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  {item.vehicleName}
                </ThemedText>

                <ThemedText
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: subscriptionColor,
                  }}
                >
                  {processingVehicleId === item.id ? (
                    <ActivityIndicator size="small" color={accent} />
                  ) : (
                    isActivePaid
                      ? `Subscribed until ${item.subscription?.expiryDate ? new Date(item.subscription.expiryDate).toLocaleDateString() : ''}`
                      : isActiveTrial
                        ? `Free trial until ${item.subscription?.trialEndAt ? new Date(item.subscription.trialEndAt).toLocaleDateString() : ''}`
                        : isOnceOffActive
                          ? `Once-off access: ${remainingTime}`
                          : isDeletedFromTraccar
                            ? "Tap to start a new 4-hour session"
                            : isOnceOff
                              ? (cooldownRemainingMin > 0
                                ? `Session regenerating: ${cooldownRemainingMin}m left`
                                : "Tap to start a new 4-hour session")
                              : "Subscription expired"
                  )}
                </ThemedText>

                {/* Show vehicle category and payment type */}
                {(item.vehicleCategory || item.paymentType) && (
                  <View style={{ flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' }}>
                    {item.vehicleCategory && (
                      <ThemedText style={{ fontSize: 12, color: icon, marginRight: 8 }}>
                        {item.vehicleCategory}{item.vehicleSubType ? ` - ${item.vehicleSubType}` : ''}
                      </ThemedText>
                    )}
                    {item.paymentType && (
                      <ThemedText style={{ fontSize: 12, color: accent, fontWeight: '500' }}>
                        {item.paymentType}
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>

          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreLoads}
        onEndReachedThreshold={.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              No Vehicles Found
            </ThemedText>}

            {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Please add a vehicle to start tracking.
            </ThemedText>}
            {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Commercial, Personal, and Car Dealer vehicles available.
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              Specified Vehicle Not Available!
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              pull to refresh
            </ThemedText>}
          </View>
        }
        ListFooterComponent={
          <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
            {
              loadingMore ?
                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                  <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText><AccentRingLoader color={accent} size={20} dotSize={4} />

                </View>
                :
                (!lastVisible && devices.length > 0) ?
                  <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more Vehicles to Load
                    </ThemedText>
                    <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />

                  </View>
                  : null
            }

          </View>
        }
      />

      {/* Insufficient Balance Modal */}
      {showInsufficientBalanceModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: backgroundLight }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="wallet-outline" size={wp(12)} color={accent} />
              <ThemedText type="title" style={styles.modalTitle}>Insufficient Balance</ThemedText>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.modalMessage}>
                You need $10 to subscribe to vehicle tracking.
              </ThemedText>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInsufficientBalanceModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.depositButton, { backgroundColor: accent }]}
                onPress={() => {
                  setShowInsufficientBalanceModal(false);
                  router.push('/Wallet/DepositAndWithdraw');
                }}
              >
                <Ionicons name="add-circle" size={wp(5)} color="white" />
                <ThemedText style={styles.depositButtonText}>Add Funds</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: wp(2)
  }, countryButton: {
    padding: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(4)

  }, countryButtonSelected: {
    backgroundColor: '#73c8a9'
  }, detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(1),
  },
  contactOptions: {
    paddingVertical: wp(4),
    flexDirection: 'row',
    gap: wp(5),
    marginTop: 'auto',
    justifyContent: 'space-around'
  },
  contactOption: {
    alignItems: 'center'
  },
  contactButton: {
    height: wp(12),
    width: wp(12),
    borderRadius: wp(90),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(1)
  },
  ownerActions: {
    paddingVertical: wp(4),
    flexDirection: 'row',
    gap: wp(5),
    marginTop: 'auto'
  }, emptySubtext: {
    textAlign: 'center',
    marginTop: wp(2)
  }, emptyText: {
    textAlign: 'center'
  }, emptyContainer: {
    minHeight: hp(80),
    justifyContent: 'center'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    margin: wp(6),
    borderRadius: wp(4),
    padding: wp(6),
    minWidth: wp(80),
    maxWidth: wp(90),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: wp(4),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: 'grey',
    marginTop: wp(2),
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: wp(3),
  },
  modalMessage: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    lineHeight: wp(6),
    marginBottom: wp(4),
  },
  balanceInfo: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: wp(4),
    borderRadius: wp(2),
    alignItems: 'center',
  },
  requiredAmount: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: wp(1),
  },
  suggestionText: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  modalButton: {
    flex: 1,
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#666',
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  depositButtonText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: 'white',
  },
})