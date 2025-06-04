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
  const eventList = [
    "Drag Races", "Burnouts", "Drift Competitions", "Stunt Pulls", "Racing Tournaments",
    "Car Shows", "Monster Truck Shows", "Demolition Derbies", "Truck Pulls",
    "Rally Cross Events", "Transport Expos", "Logistics Conferences", "Fleet Seminars"
  ];


  return (
     <View style={{ flex: 1 }}>
      {/* Header */}
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
          zIndex: 10,
        }}
      >
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: "white" }}>
          {!selectedEvent ? "Events" : `${selectedEvent}`}
        </Text>
      </View>

      {/* Scrollable Content */}
        <View style={{ paddingTop: 90 }}>
          {dspSelEvent && (
            <>
              <View style={styles.promoBox}>
                <Text style={styles.sectionTitle}>Hosting an event?</Text>
                <Text style={styles.subText}>
                  List your event and unlock our digital ticketing system for just{" "}
                  <Text style={styles.highlight}>$10</Text>.
                </Text>
                <Text style={styles.subText}>
                  Your event must be transport & logistics related, or match one of the types below to sell tickets.
                </Text>
              </View>


        <Text style={styles.sectionTitle}> Pick an event & get your ticket! </Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
                {eventList.map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sEventButtonStyle}
                    onPress={() => moveToEventsPage(event)}
                  >
                    <Text style={styles.sEventButtonText}>{event}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {selectedEvent && rendereIterms}
        </View>
    </View>
    );
}

export default React.memo(Events);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 16,
  },
  promoBox: {
    backgroundColor: "#fff0f0",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6a0c0c",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  highlight: {
    fontWeight: "bold",
    color: "#d42222",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sEventButtonStyle: {
    marginVertical: 6,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sEventButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#6a0c0c",
    textAlign: "center",
    textTransform: "uppercase",
  },
  scrollContainer: {
  paddingBottom: 30,
  paddingHorizontal: 16,
  backgroundColor: "#f2f2f2",
  alignSelf:'center'
},  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 8,
    paddingHorizontal: 10,
  },

});
