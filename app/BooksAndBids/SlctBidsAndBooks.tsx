import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  onSnapshot,
  query,
  collection,
  where,
} from "firebase/firestore";
import { auth, db } from "@/db/fireBaseConfig";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Heading from "@/components/Heading";
import { useThemeColor } from "@/hooks/useThemeColor";

function SlctBookingsandBiddings() {
  const [newItermBooked, setNewBkedIterm] = React.useState(0);
  const [newItermBidded, setNewBiddedIterm] = React.useState(0);

  const background = useThemeColor('backgroundLight');

  React.useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;

        const bookingsQuery = query(
          collection(db, "loadRequests"),
          where("loadOwnerId", "==", userId),
          where("status", "==", "Booked")
        );

        const bidsQuery = query(
          collection(db, "loadRequests"),
          where("loadOwnerId", "==", userId),
          where("status", "==", "Bidded")
        );

        const unsubscribeBookings = onSnapshot(bookingsQuery, (snap) => {
          setNewBkedIterm(snap.size);
        });

        const unsubscribeBids = onSnapshot(bidsQuery, (snap) => {
          setNewBiddedIterm(snap.size);
        });

        return () => {
          unsubscribeBookings();
          unsubscribeBids();
        };
      }
    } catch (error) {
      console.error("Error fetching booking/bid counts:", error);
    }
  }, []);

  const PRIMARY = useThemeColor('accent');

  const ModernCard = ({
    label,
    count,
    color,
    icon,
    onPress,
  }: {
    label: string;
    count?: number;
    color: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: background,
          borderColor: color,
        },
      ]}
    >
      <View style={styles.cardRow}>
        <View style={styles.leftRow}>
          <Ionicons name={icon as any} size={22} color={color} />
          <ThemedText style={[styles.cardLabel, { color }]}>
            {label}
          </ThemedText>
        </View>

        {typeof count === "number" && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <ThemedText style={styles.badgeText}>{count}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionCard = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: background,
          borderColor: PRIMARY,
        },
      ]}
    >
      <View style={styles.cardRow}>
        <View style={styles.leftRow}>
          <Ionicons name="checkmark-done-outline" size={22} color={PRIMARY} />
          <ThemedText style={[styles.cardLabel, { color: PRIMARY }]}>
            Assignments
          </ThemedText>
        </View>

        <Ionicons name="chevron-forward" size={20} color={PRIMARY} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Heading page="My Workspace" />

      <View style={styles.container}>
        <ModernCard
          label="Requested by Carriers"
          count={newItermBooked}
          color={PRIMARY}
          icon="cube-outline"
          onPress={() =>
            router.push({
              pathname: "/BooksAndBids/ViewBidsAndBooks",
              params: { dspRoute: "Requested by Carriers" },
            })
          }
        />

        <ModernCard
          label="Requested Loads"
          color={PRIMARY}
          icon="list-outline"
          onPress={() =>
            router.push({
              pathname: "/BooksAndBids/ViewBidsAndBooks",
              params: { dspRoute: "Requested Loads" },
            })
          }
        />

        <SectionCard
          onPress={() => router.push({ pathname: "/Assignments/Index" })}
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

  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  badge: {
    minWidth: 28,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});