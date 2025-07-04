import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Linking, } from "react-native";
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
import { auth, db } from "../components/config/fireBase";
import { Ionicons, Octicons } from "@expo/vector-icons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";

const accent = "#6a0c0c";
const background = "#fff";
const cardBg = "#f8f8f8";
const coolGray = "#e5e7eb";

function BookingsandBiddings({ }) {
  const { dbName, dspRoute } = useLocalSearchParams();
  console.log(dspRoute)

  const [newItermBooked, setNewBkedIterm] = useState(0);
  const [newItermBidded, setNewBiddedIterm] = useState(0);
  const [getAllIterms, setAllIterms] = useState<Item[]>([]);
  const [dspLoadMoreBtn, setLoadMoreBtn] = useState(true);
  const [LoadMoreData, setLoadMoreData] = useState(false);
  const [contactDisplay, setContactDisplay] = useState<{ [key: string]: boolean }>({ "": false });

  // ... (keep all your existing useEffect hooks and functions)

  // --- Main Render ---
  return (
    <ScreenWrapper >
      {/* Header */}
      <Heading page={dspRoute ? dspRoute.toString() : " Bookings and Biddings"} />

      <View style={{ padding: wp(4), flex: 1 }}>
        {dspRoute === "Iterms You Bidded" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: wp(4) }}>
            <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) }}>
              <View style={{ position: 'absolute', top: wp(2.5), right: wp(2), zIndex: 66 }}>
                <Octicons name="verified" size={wp(5)} color="green" />
              </View>

              <ThemedText type="subtitle" style={{ color: '#5a0c0c', textAlign: 'center', marginBottom: wp(2) }}>Chibuku logistics</ThemedText>

              <Divider />
              <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Bidded</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Weed</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate</ThemedText>
                  <ThemedText style={{ color: "#222" }}>USD 300 per Tonne</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>from Harare to Kadoma</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Decision</ThemedText>
                  <View style={{ padding: wp(2), paddingVertical: wp(1), borderRadius: wp(20), backgroundColor: "#737373" }}>
                    <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>Pending</ThemedText>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Get In Touch Now</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: '#f25022', alignItems: 'center', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Not interested</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {dspRoute === "Your Booked Items" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: wp(4) }}>
            <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) }}>
              <View style={{ position: 'absolute', top: wp(2.5), right: wp(2), zIndex: 66 }}>
                <MaterialIcons name="verified" size={wp(5)} color="green" />
              </View>

              <ThemedText type="subtitle" style={{ color: '#5a0c0c', textAlign: 'center', marginBottom: wp(2) }}>CHIHOKO LOGISTICS</ThemedText>

              <Divider />
              <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Booked</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Weed</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate</ThemedText>
                  <ThemedText style={{ color: "#222" }}>USD 899 per Tonne</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>from Lopansi to Chihoro</ThemedText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={styles.bttonIsTrue}>
                  <ThemedText style={{ color: 'white' }}>Accept</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonIsFalse}>
                  <ThemedText>Deny</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: accent, paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Booker's Trucks</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Get In Touch</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{ backgroundColor: 'red', paddingVertical: wp(2), borderRadius: wp(4), marginTop: wp(2), alignItems: 'center' }}>
                <ThemedText style={{ color: 'white' }}>Load Taken</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {dspRoute === "Items You Booked" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: wp(4) }}>
            <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) }}>
              <View style={{ position: 'absolute', top: wp(2.5), right: wp(2), zIndex: 66 }}>
                <Octicons name="verified" size={wp(5)} color="green" />
              </View>

              <ThemedText type="subtitle" style={{ color: '#5a0c0c', textAlign: 'center', marginBottom: wp(2) }}>Chibuku logistics</ThemedText>

              <Divider />
              <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Booked</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Weed</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate</ThemedText>
                  <ThemedText style={{ color: "#222" }}>USD 300 per Tonne</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>from Harare to Kadoma</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Decision</ThemedText>
                  <View style={{ padding: wp(2), paddingVertical: wp(1), borderRadius: wp(20), backgroundColor: "#737373" }}>
                    <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>Pending</ThemedText>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Get In Touch Now</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: '#f25022', alignItems: 'center', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Not interested</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {dspRoute === "Your Bidded Items" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: wp(4) }}>
            <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) }}>
              <View style={{ position: 'absolute', top: wp(2.5), right: wp(2), zIndex: 66 }}>
                <MaterialIcons name="verified" size={wp(5)} color="green" />
              </View>

              <ThemedText type="subtitle" style={{ color: '#5a0c0c', textAlign: 'center', marginBottom: wp(2) }}>CHIHOKO LOGISTICS</ThemedText>

              <Divider />
              <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Bidded</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Weed</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate</ThemedText>
                  <ThemedText style={{ color: "#222" }}>USD 899 per Tonne</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>from Lopansi to Chihoro</ThemedText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={styles.bttonIsTrue}>
                  <ThemedText style={{ color: 'white' }}>Accept</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonIsFalse}>
                  <ThemedText>Deny</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: accent, paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Booker's Trucks</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Get In Touch</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{ backgroundColor: 'red', paddingVertical: wp(2), borderRadius: wp(4), marginTop: wp(2), alignItems: 'center' }}>
                <ThemedText style={{ color: 'white' }}>Load Taken</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {getAllIterms.length > 15 && dspLoadMoreBtn && (
          <TouchableOpacity onPress={() => loadMoreData(true)} style={styles.loadMoreBtn}>
            <ThemedText style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ScreenWrapper>
  );
}

export default React.memo(BookingsandBiddings);

const styles = StyleSheet.create({
  // ... (keep your existing styles)
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  infoLabel: {
    width: 90,
    color: "#444",
    fontWeight: "bold",
    fontSize: 15,
  },
  infoValue: {
    color: "#222",
    fontSize: 15,
    flexShrink: 1,
  },
  actionButton: {
    backgroundColor: "#228B22",
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    minWidth: 140,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#228B22",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    alignItems: "center",
    minWidth: 90,
  },
  buttonIsFalse: {
    borderWidth: 1,
    borderColor: '#6a0c0c',
    padding: wp(2),
    borderRadius: wp(4),
    alignItems: 'center',
    flex: 1,
    backgroundColor: "white"
  },
  bttonIsTrue: {
    backgroundColor: 'green',
    padding: wp(2),
    borderRadius: wp(4),
    alignItems: 'center',
    flex: 1
  },
  secondaryButton: {
    backgroundColor: accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 120,
    marginRight: 10,
  },
  denyButton: {
    backgroundColor: "#e53935",
    borderRadius: 25,
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 22,
    alignItems: "center",
    minWidth: 110,
  },
  loadMoreBtn: {
    height: 45,
    backgroundColor: accent,
    margin: 25,
    justifyContent: 'center',
    borderRadius: 25,
    alignItems: "center",
    shadowColor: accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  slctView: {
    height: 45,
    width: 200,
    borderColor: "#6a0c0c",
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
});