import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Linking, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  onSnapshot,
  query,
  doc,
  collection,
  where,
  updateDoc,
  deleteDoc,
  runTransaction,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { auth, db } from "@/db/fireBaseConfig";
import { Ionicons, Octicons } from "@expo/vector-icons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { wp, hp } from "@/constants/common";
import Divider from "@/components/Divider";

import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchDocuments, } from '@/db/operations';

import { RequestedCargo } from "@/components/CargoYouRequest";
import { useThemeColor } from '@/hooks/useThemeColor';
import { getCurrentLocation } from '@/Utilities/utils';


const accent = "#6a0c0c";
const background = "#fff";
const cardBg = "#f8f8f8";
const coolGray = "#e5e7eb";

function BookingsandBiddings({ }) {
  const { dspRoute } = useLocalSearchParams();

  const backgroundLight = useThemeColor('backgroundLight')
  const textColor = useThemeColor('text')
  const icon = useThemeColor('icon')
  const [refreshing, setRefreshing] = useState(false)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [fectedDocuments, setFetchedDocuments] = React.useState<any>([])
  const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)
  const [currentLocation, setCurrentLocation] = React.useState<{ latitude: number, longitude: number } | null>(null)

  const [requestType, setRequestType] = React.useState("Booked") // Default to Books view

  // Debug function to check all loadRequests
  const debugLoadRequests = async () => {
    try {
      const allRequestsQuery = query(collection(db, "loadRequests"));
      const snapshot = await getDocs(allRequestsQuery);
      console.log('🔍 All loadRequests in database:');
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`📄 Doc ${doc.id}:`, {
          loadOwnerId: data.loadOwnerId,
          truckOwnerId: data.truckOwnerId,
          status: data.status,
          companyName: data.companyName,
          productName: data.productName
        });
      });
    } catch (error) {
      console.error('❌ Error fetching all requests:', error);
    }
  };

  const LoadTructs = async () => {
    let filters: any[] = [];

    if (requestType) {
      filters.push(where("status", "==", requestType));
    }

    if (dspRoute === "Requested by Carriers") {
      // Show loads where current user is the truck owner (carrier)
      filters.push(where("truckOwnerId", "==", auth.currentUser?.uid));
    } else if (dspRoute === "Requested Loads") {
      // Show loads where current user is the load owner (courier requests)
      filters.push(where("loadOwnerId", "==", auth.currentUser?.uid));
    } else {
      // Default to "My Loads" - show loads requested by current user as carrier
      filters.push(where("truckOwnerId", "==", auth.currentUser?.uid));
    }

    console.log('🔍 Loading with filters:', { dspRoute, requestType, filters: filters.length });

    // Debug: Check all requests in database
    await debugLoadRequests();

    const result = await fetchDocuments('loadRequests', 10, lastVisible, filters);

    if (result) {
      console.log('📊 Fetched documents:', result.data.length);
      if (filters.length > 0 && result.data.length === 0) {
        setFilteredPNotAavaialble(true);
        console.log('❌ No documents found with current filters');
      } else {
        setFilteredPNotAavaialble(false);
      }
      setFetchedDocuments(result.data as any[])
      setLastVisible(result.lastVisible)
    }
  }
  // Get current location for tracking
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    setFilteredPNotAavaialble(false); // Reset filter state when route changes
    LoadTructs();
  }, [requestType, dspRoute])

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await LoadTructs();
      setRefreshing(false);

    } catch (error) {

    }
  };

  const loadMoreLoads = async () => {
    let filters: any[] = [];

    if (requestType) filters.push(where("status", "==", requestType));

    if (dspRoute === "Requested by Carriers") {
      // Show loads where current user is the truck owner (carrier)
      filters.push(where("truckOwnerId", "==", auth.currentUser?.uid));
    } else if (dspRoute === "Requested Loads") {
      // Show loads where current user is the load owner (courier requests)
      filters.push(where("loadOwnerId", "==", auth.currentUser?.uid));
    } else {
      // Default to "My Loads" - show loads requested by current user as carrier
      filters.push(where("truckOwnerId", "==", auth.currentUser?.uid));
    }

    if (loadingMore || !lastVisible) return;
    setLoadingMore(true);
    const result = await fetchDocuments('loadRequests', 10, lastVisible, filters);
    if (result) {
      setFetchedDocuments([...fectedDocuments, ...result.data as any[]]);
      setLastVisible(result.lastVisible);
    }
    setLoadingMore(false);
  };



  return (
    <ScreenWrapper >
      {/* Header */}
      <Heading page={dspRoute ? dspRoute.toString() : "My Loads"} />

      <View style={{ flexDirection: "row", marginHorizontal: 4, justifyContent: "space-evenly" }}>
        <TouchableOpacity
          onPress={() => setRequestType("Booked")}
          style={{
            paddingVertical: wp(0.5),
            marginLeft: wp(2),
            borderRadius: wp(2),
            paddingHorizontal: wp(10),
            backgroundColor: requestType === "Booked" ? accent : backgroundLight,
            borderWidth: 1,
            borderColor: requestType === "Booked" ? accent : coolGray,
          }}
          activeOpacity={0.8}
        >
          <ThemedText
            type="defaultSemiBold"
            style={{
              color: requestType === "Booked" ? 'white' : textColor,
              fontSize: wp(3.5),
            }}
          >
            Bookings
          </ThemedText>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={() => setRequestType("Bidded")}
          style={{
            paddingVertical: wp(0.5),
            marginLeft: wp(2),
            borderRadius: wp(2),
            paddingHorizontal: wp(10),
            backgroundColor: requestType === "Bidded" ? accent : backgroundLight,
            borderWidth: 1,
            borderColor: requestType === "Bidded" ? accent : coolGray,
          }}
          activeOpacity={0.8}
        >
          <ThemedText
            type="defaultSemiBold"
            style={{
              color: requestType === "Bidded" ? 'white' : textColor,
              fontSize: wp(4),
            }}
          >
            Biddings
          </ThemedText>
        </TouchableOpacity>



      </View>


      <FlatList
        keyExtractor={(item) => item.id.toString()}
        data={fectedDocuments}


        renderItem={({ item, index, separators }) =>
          <RequestedCargo
            item={item}
            index={index}
            separators={separators}
            dspRoute={`${dspRoute}`}
            currentLocation={currentLocation}
          />
          // : <CargoRequested item={item} index={index} separators={separators} />
        }
        contentContainerStyle={{ padding: wp(4) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreLoads}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              Requests Loading…
            </ThemedText>}

            {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Please Wait
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              No {requestType.toLowerCase()} requests found
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Route: {dspRoute || 'My Loads'} | Status: {requestType}
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Pull to refresh
            </ThemedText>}
          </View>
        }
        ListFooterComponent={
          <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
            {loadingMore ? (
              <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                <ActivityIndicator size="small" color={accent} />
              </View>
            ) : (!lastVisible && fectedDocuments.length > 0) ? (
              <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>
                  No more Requests to Load
                </ThemedText>
                <Ionicons color={icon} name='alert-circle-outline' size={wp(6)} />
              </View>
            ) : null}
          </View>
        }
      />





    </ScreenWrapper>
  );
}

export default React.memo(BookingsandBiddings);

const styles = StyleSheet.create({
  emptySubtext: {
    textAlign: 'center',
    marginTop: wp(2)
  }, emptyText: {
    textAlign: 'center'
  }, emptyContainer: {
    minHeight: hp(80),
    justifyContent: 'center'
  },
});