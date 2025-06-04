import React from "react";
import { View, TouchableOpacity, StyleSheet, } from "react-native";
import { onSnapshot, query, collection, where, } from "firebase/firestore"
import { auth, db } from "../components/config/fireBase";

import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";

function SlctBookingsandBiddings({ }) {

  const [newItermBooked, setNewBkedIterm] = React.useState(0);
  const [newItermBidded, setNewBiddedIterm] = React.useState(0);

  // const [ valueOfUpdates , setVlueOfUpdates] = React.useState(null);

  React.useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const loadsQuery = query(collection(db, "newIterms"), where("receriverId", "==", userId));

        const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const newBokedIterms = data.bookingdocs || 0;   // Assuming isVerified is a boolean field
            const newBiiedIterms = data.biddingdocs || 0;   // Assuming isVerified is a boolean field

            setNewBkedIterm(newBokedIterms);
            setNewBiddedIterm(newBiiedIterms)
          });
        });

        return () => unsubscribe(); // Cleanup the listener when the component unmounts
      }

    } catch (error) {
      console.error(error);
    }
  }, []);


  return (
    <ScreenWrapper>


      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginRight: 7 }} >

          <TouchableOpacity
            onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "yourBookedItems" } })}
            style={styles.slctView}>
            <ThemedText>Your booked Items</ThemedText>
            {<ThemedText style={{ backgroundColor: '#6a0c0c', color: 'white', paddingLeft: 5, paddingRight: 5, marginRight: 6, borderRadius: 10, justifyContent: 'center' }} >{newItermBooked} </ThemedText>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "itemsYouBooked" } })}
            style={styles.slctView}>
            <ThemedText>Items you booked</ThemedText>
          </TouchableOpacity>
        </View>

        <View>

          {<TouchableOpacity
            onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "biddings", dspRoute: "yourBiddedItems" } })}
            style={styles.slctView}>

            <ThemedText>Your Bidded Items</ThemedText>
            {<ThemedText style={{ backgroundColor: 'rgb(129,201,149)', color: 'white', paddingLeft: 5, paddingRight: 5, marginRight: 6, borderRadius: 10, justifyContent: 'center' }} > {newItermBidded} </ThemedText>}
          </TouchableOpacity>}

          {<TouchableOpacity
            onPress={() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "biddings", dspRoute: "itermsYouBidded" } })}
            style={styles.slctView}>
            <ThemedText>Items you Bidded</ThemedText>
          </TouchableOpacity>}
        </View>
      </View>

    </ScreenWrapper>
  )
}
export default React.memo(SlctBookingsandBiddings)

const styles = StyleSheet.create({
  slctView: {
    height: 45,
    width: 175,
    borderColor: "#6a0c0c",
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  }
});