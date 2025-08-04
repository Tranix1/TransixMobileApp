import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { auth, db } from "../components/config/fireBase";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Heading from "@/components/Heading";

function SlctBookingsandBiddings({ }) {
  const [newItermBooked, setNewBkedIterm] = React.useState(0);
  const [newItermBidded, setNewBiddedIterm] = React.useState(0);

  React.useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const loadsQuery = query(collection(db, "newIterms"), where("receriverId", "==", userId));
        const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            setNewBkedIterm(data.bookingdocs || 0);
            setNewBiddedIterm(data.biddingdocs || 0);
          });
        });
        return () => unsubscribe();
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Modern Card Button
  const ModernCard = ({ label, count, color, onPress }: { label: string, count?: number, color: string, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.card, { borderColor: color }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
        <Ionicons name="cube-outline" size={22} color={color} style={{ marginRight: 8 }} />
        <ThemedText style={[styles.cardLabel, { color }]}>{label}</ThemedText>
        {typeof count === "number" && (
          <ThemedText style={[styles.badge, { backgroundColor: color }]}>{count}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>

      <Heading page="My Requests" />
      <View style={styles.container}>
        <ModernCard
          label="Booked by Carriers"
          count={newItermBooked}
          color="#6a0c0c"
          onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "Booked by Carriers" } })}
        />
        <ModernCard
          label="Booked Loads"
          color="#6a0c0c"
          onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "Booked Loads" } })}
        />
        <ModernCard
          label="Bidded by Carriers"
          count={newItermBidded}
          color="#4eb37a"
          onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "biddings", dspRoute: "Bidded by Carriers" } })}
        />
        <ModernCard
          label="Bidded Loads"
          color="#4eb37a"
          onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "biddings", dspRoute: "Bidded Loads" } })}
        />
      </View>
    </ScreenWrapper>
  );
}
export default React.memo(SlctBookingsandBiddings);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    marginTop: 40,
    gap: 18,
    paddingHorizontal: 16,
  },
  column: {
    gap: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 4,
    alignItems: "center",
    shadowColor: "#6a0c0c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  badge: {
    marginLeft: 10,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});