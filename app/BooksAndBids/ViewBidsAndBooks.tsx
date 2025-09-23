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

  const [requestType, setRequestType] = React.useState("Booked") // Default to Books view

  const LoadTructs = async () => {
    let filters: any[] = [];

    if (requestType) {
      filters.push(where("status", "==", requestType));
    }

    if (dspRoute === "Requested by Carriers") {
      filters.push(where("carrierId", "==", auth.currentUser?.uid));
    } else if (dspRoute === "Requested Loads") {
      filters.push(where("loadOwnerId", "==", auth.currentUser?.uid));
    }

    const result = await fetchDocuments('loadRequests', 10, lastVisible, filters);

    if (result) {
      if (filters.length > 0 && result.data.length === 0) setFilteredPNotAavaialble(true)
      setFetchedDocuments(result.data as any[])
      setLastVisible(result.lastVisible)
    }
  }
  useEffect(() => {
    LoadTructs();
  }, [requestType])

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
      <Heading page={dspRoute ? dspRoute.toString() : " Bookings and Biddings"} />

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
          <RequestedCargo item={item} index={index} separators={separators} dspRoute={`${dspRoute}`} />
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
              Contracts Loading…
            </ThemedText>}

            {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Please Wait
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              Specified Contract Not Available!
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              pull to refresh
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
                  No more Contracts to Load
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