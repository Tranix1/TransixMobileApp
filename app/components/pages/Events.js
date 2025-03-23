import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { collection,  query, getDocs } from "firebase/firestore";
import { db, } from "../config/fireBase";
import { Ionicons } from "@expo/vector-icons";

function Events({ route, navigation }) {
  // Destructure route parameters if needed (username and contact were defined but never used)
  // const { username, contact } = route.params;

  const [dspSelEvent, setDspSelEvent] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [getEvent, setGetEvent] = useState([]);

  // Load events from Firestore
  async function loadedData(loadMore) {
    try {
      const orderByF = "timeStamp";
      // Build query for available events
       let dataQuery = query(collection(db, "availableEvents") );
      const docsSnapshot = await getDocs(dataQuery);

      let userItemsMap = [];
      docsSnapshot.forEach((doc) => {
        userItemsMap.push({ id: doc.id, ...doc.data() });
      });

      // Separate verified and non-verified users, then combine them
      const verifiedUsers = userItemsMap.filter((user) => user.isVerified);
      const nonVerifiedUsers = userItemsMap.filter((user) => !user.isVerified);
      userItemsMap = verifiedUsers.concat(nonVerifiedUsers);
      let loadedData = userItemsMap;

      // If no events, you might disable load-more functionality (not used in render)
      // if (loadedData.length === 0) { ... }

      // Update state with the new data
      setGetEvent(loadMore ? [...getEvent, ...loadedData] : loadedData);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadedData();
  }, []);

  function moveToEventsPage(theEvent) {
    setDspSelEvent(false);
    setSelectedEvent(theEvent);
  }

  // Map over events to create a list of event items
  let rendereIterms = getEvent.map((item) => {
    return (
      <View key={item.id} style={{ flexDirection: "row", marginHorizontal: 10 }}>
        <Image
          source={{
            uri: "https://i.ytimg.com/vi/bBf1Gs6EpBk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD-EfeycyQtz2eQP8pjYxmkO9985Q",
          }}
          style={{ height: 122, width: 120, borderRadius: 10, alignSelf: "center" ,marginTop:4}}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 25 }}>Selecka Base</Text>
          <Text style={{ fontSize: 17 }}>Jan 10 2025 12 00</Text>
          <Text style={{ fontWeight: "bold" }}>ZKS Arena Bulawayo</Text>
          <TouchableOpacity
            style={{
              height: 30,
              width: 100,
              backgroundColor: "red",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 6,
              marginTop: 12,
            }}
            onPress={() =>
              navigation.navigate("viewEvent", {
                eventName: item.eventName,
                ticketType: item.ticketType,
                earlyBPrice: item.earlyBPrice,
                ordiPrice: item.ordiPrice,
                vipPrice: item.vipPrice,
                vvipPrice: item.vvipPrice,
              })
            }
          >
            <Text style={{ color: "white" }}>View Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  return (
    <View style={{ paddingTop: 80 }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          height: 74,
          paddingLeft: 6,
          paddingRight: 15,
          paddingTop: 15,
          backgroundColor: "#6a0c0c",
          alignItems: "center",
        }}
      >
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: "white" }}>
          {!selectedEvent ? "Events" : `${selectedEvent}`}
        </Text>
      </View>
      {dspSelEvent && (
        <ScrollView style={{ alignSelf: "center", marginBottom: 120 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Drag Races</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle} onPress={() => moveToEventsPage("Burnouts")}>
            <Text style={styles.sEventButtonText}>Burnouts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Drift Competitions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Stunt Pulls</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Racing Tournaments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Car Shows</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Monster Truck Shows</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Demolition Derbies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Truck Pulls</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Rally Cross Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Transport Expos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Logistics Conferences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sEventButtonStyle}>
            <Text style={styles.sEventButtonText}>Fleet Seminars</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {selectedEvent && rendereIterms}
    </View>
  );
}

export default React.memo(Events);

const styles = StyleSheet.create({
  sEventButtonStyle: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    width: 220,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sEventButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a0c0c",
    textTransform: "uppercase",
  },
});
