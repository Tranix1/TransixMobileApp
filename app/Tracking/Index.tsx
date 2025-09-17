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
import SubscriptionPaymentModal from "@/components/SubscriptionPaymentModal";
import AccentRingLoader from "@/components/AccentRingLoader";

interface Device {
  id: string;
  vehicleName: string;
  status?: string;
  deviceId: number;
  subscription?: {
    status: string; // trial | active | expired | cancelled
    expiryDate?: string; // for active subscriptions
    trialStartAt?: string; // ISO string
    trialEndAt?: string;   // ISO string
    nextBillingAt?: string;
    isTrial?: boolean;
    trialDays?: number;
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedVehicleName, setSelectedVehicleName] = useState('');


  const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)

  useEffect(() => {
    const checkAgentStatus = async () => {
      if (user) {
        const agent = await isTrackingAgent(user.uid);
        setIsAgent(agent);
      }
    };
    checkAgentStatus();
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

  const handleSubscription = (vehicleId: string, vehicleName: string) => {
    setSelectedVehicleId(vehicleId);
    setSelectedVehicleName(vehicleName);
    setIsModalVisible(true);
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
          const isAccessible = isActivePaid || isActiveTrial;
          const subscriptionColor = isAccessible ? 'green' : 'red';

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
        params: { deviceId: item.deviceId },
      });
    } else {
      handleSubscription(item.id, item.vehicleName);
    }
  }}
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
        color: isAccessible ? subscriptionColor : "red",
      }}
    >
      {isActivePaid
        ? `Subscribed until ${item.subscription?.expiryDate ? new Date(item.subscription.expiryDate).toLocaleDateString() : ''}`
        : isActiveTrial
          ? `Free trial until ${item.subscription?.trialEndAt ? new Date(item.subscription.trialEndAt).toLocaleDateString() : ''}`
          : "Subscription expired"}
    </ThemedText>
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
              !loadingMore ?
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

      <SubscriptionPaymentModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        vehicleId={selectedVehicleId}
        vehicleName={selectedVehicleName}
      />

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
})