import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Linking } from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";

const accent = "#6a0c0c";
const background = "#fff";
const cardBg = "#f8f8f8";
const coolGray = "#e5e7eb";

function BookingsandBiddings({ }) {
  const { dbName, dspRoute } = useLocalSearchParams();

  const [newItermBooked, setNewBkedIterm] = useState(0);
  const [newItermBidded, setNewBiddedIterm] = useState(0);
  const [getAllIterms, setAllIterms] = useState<Item[]>([]);
  const [dspLoadMoreBtn, setLoadMoreBtn] = useState(true);
  const [LoadMoreData, setLoadMoreData] = useState(false);
  const [contactDisplay, setContactDisplay] = useState<{ [key: string]: boolean }>({ "": false });

  useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const loadsQuery = query(collection(db, "newIterms"), where("receriverId", "==", userId));

        const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
          let booked = 0;
          let bidded = 0;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.bookingdocs) {
              booked = data.bookingdocs;
            }
            if (data.biddingdocs) {
              bidded = data.biddingdocs;
            }
          });
          setNewBkedIterm(booked);
          setNewBiddedIterm(bidded);
        });

        return () => unsubscribe();
      }
    } catch (error) {
      console.error(error);
    }
  }, [dspRoute]);

  useEffect(() => {
    if (dspRoute === "yourBiddedItems" || dspRoute === "yourBookedItems") {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const docRef = doc(db, "newIterms", userId);
        runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(docRef);

          if (docSnap.exists()) {
            const currentBiddingDocs = docSnap.data().biddingdocs || 0;
            const currentBookingsDocs = docSnap.data().bookingdocs || 0;
            let updatedBiddingDocs = currentBiddingDocs;
            let updateBokingsDocs = currentBookingsDocs;

            if (dspRoute === "yourBiddedItems") {
              updatedBiddingDocs = 0;
            } else if (dspRoute === "yourBookedItems") {
              updateBokingsDocs = 0;
            }

            transaction.update(docRef, {
              biddingdocs: updatedBiddingDocs,
              bookingdocs: updateBokingsDocs,
            });
          }
        }).catch((error) => {
          console.error("Transaction failed: ", error);
        });
      }
    }
  }, [dspRoute]);

  const deleteLoad = async (id: string) => {
    try {
      const loadsDocRef = doc(db, `${dbName}`, id);
      await deleteDoc(loadsDocRef);
      setAllIterms((prevLoadsList) => prevLoadsList.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const checkAndDeleteExpiredItems = () => {
    getAllIterms.forEach((item) => {
      const deletionTime = item.deletionTime;
      const timeRemaining = deletionTime - Date.now();
      if (timeRemaining <= 0) {
        deleteLoad(item.id);
      } else {
        setTimeout(() => {
          deleteLoad(item.id);
        }, timeRemaining);
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndDeleteExpiredItems();
    }, 1000);
    return () => clearTimeout(timer);
  }, [getAllIterms]);

  async function loadedData(loadMore?: boolean) {
    try {
      loadMore ? setLoadMoreData(true) : null;
      const orderByF = "timestamp";
      const orderByField = orderBy(orderByF, "desc");

      const pagination = loadMore && getAllIterms.length > 0 ? [startAfter(getAllIterms[getAllIterms.length - 1][orderByF])] : [];
      const userId = auth.currentUser?.uid;
      let dataQuery;

      if (userId) {
        if (dspRoute === "yourBookedItems" || dspRoute === "yourBiddedItems") {
          dataQuery = query(collection(db, `${dbName}`), orderByField, ...pagination, limit(15), where("ownerId", "==", userId));
        } else {
          dataQuery = query(collection(db, `${dbName}`), orderByField, ...pagination, limit(15), where("bookerId", "==", userId));
        }

        const docsSnapshot = await getDocs(dataQuery);

        let userItemsMap: Item[] = [];

        docsSnapshot.forEach((doc) => {
          userItemsMap.push({ id: doc.id, ...doc.data() } as Item);
        });

        const verifiedUsers = userItemsMap.filter((user) => user.isVerified);
        const nonVerifiedUsers = userItemsMap.filter((user) => !user.isVerified);

        userItemsMap = verifiedUsers.concat(nonVerifiedUsers);
        let loadedData = userItemsMap;

        if (loadedData.length === 0) {
          setLoadMoreBtn(false);
        }

        setAllIterms(loadMore ? [...getAllIterms, ...loadedData] : loadedData);
        loadMore ? setLoadMoreData(false) : null;
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadedData();
  }, [dspRoute]);

  const loadTaken = async (loadid?: string | null, bbId?: string | null) => {
    try {
      if (bbId && !loadid) {
        const bbDocRef = doc(db, `${dbName}`, bbId);
        await deleteDoc(bbDocRef);
      } else if (bbId && loadid) {
        const bbDocRef = doc(db, `${dbName}`, bbId);
        await deleteDoc(bbDocRef);
        const loadsDocRef = doc(db, "Loads", loadid);
        await deleteDoc(loadsDocRef);
      }
      loadedData();
    } catch (error) {
      console.error("Error handling load taken:", error);
    }
  };

  const toggleAcceptOrDeny = async (
    dbNameMin: string,
    id: string,
    decision: "Accept" | "Deny",
    contact?: string,
    message?: string
  ) => {
    try {
      const docRef = doc(db, `${dbNameMin}`, id);
      if (decision === "Accept") {
        await updateDoc(docRef, { Accept: true });
        if (contact && message) {
          Linking.openURL(`whatsapp://send?phone=${contact}&text=${encodeURIComponent(message)}`);
        }
      } else {
        await updateDoc(docRef, { Accept: false });
        alert("Username denied the offer!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleContact = (itemId: string) => {
    setContactDisplay((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const navigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  // --- Card Component ---
  const Card = ({ children, isVerified }: { children: React.ReactNode, isVerified?: boolean }) => (
    <View style={{
      backgroundColor: cardBg,
      marginBottom: 18,
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: coolGray,
      position: "relative",
      width: 360,
      alignSelf: "center"
    }}>
      {isVerified && (
        <View style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 2,
          zIndex: 10,
          borderWidth: 1,
          borderColor: "#d1fae5"
        }}>
          <MaterialIcons name="verified" size={24} color="green" />
        </View>
      )}
      {children}
    </View>
  );

  // --- Redesigned List Items ---
  const whnBookBiddAload = getAllIterms.map((item) => {
    const userId = auth.currentUser?.uid;
    if (!userId || item.bookerId !== userId) return null;
    const message = ` ${item.ownerName} \n Is this Load still available    ${item.itemName} from    ${item.fromLocation} to ${item.toLocation} \nRate    ${item.linksrate || item.triaxleRate
      ? (item.triaxlerate ? `triaxle ${item.triaxleRate} ` : "") + (item.linksrate ? `links for ${item.linksrate}` : "")
      : `${item.ratepertonne}`
      } ${item.pertonne ? "per tonne" : ""}
from https://transix.net/selectedUserLoads/${item.userId}/${item.id} `;
    let contactMe = (
      <View style={{ paddingLeft: 30 }}>
        <TouchableOpacity
          onPress={() => navigate(`/message/${item.userId}/${item.CompanyName} `)}
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#008080",
            justifyContent: "center",
            marginBottom: 5,
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#008080" }}>Message now</Text>
          <MaterialIcons name="chat" size={24} color="#008080" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${item.contact}`)}
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#40E0D0",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Text style={{ color: "#40E0D0" }}>Phone call</Text>
          <MaterialIcons name="call" size={24} color="#0074D9" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)}
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#25D366",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#25D366" }}>WhatsApp </Text>
          <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Card key={item.id} isVerified={item.isVerified}>
        <Text style={{ color: accent, textAlign: "center", fontSize: 18, fontWeight: "bold", marginBottom: 6 }}>
          {item.ownerName}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{dbName === "bookings" ? "Booked" : "Bidded"}</Text>
          <Text style={styles.infoValue}>{item.itemName}</Text>
        </View>
        {item.rate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rate</Text>
            <Text style={styles.infoValue}>{item.currency ? "USD" : "RAND"} {item.rate} {item.pertonne ? "Per tonne" : null}</Text>
          </View>
        )}
        {item.linksRate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Links</Text>
            <Text style={styles.infoValue}>{item.currency ? "USD" : "RAND"} {item.linksRate} {item.pertonne ? "Per tonne" : null}</Text>
          </View>
        )}
        {item.triaxleRate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Triaxle</Text>
            <Text style={styles.infoValue}>{item.currency ? "USD" : "RAND"} {item.triaxleRate} {item.pertonne ? "Per tonne" : null}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Route</Text>
          <Text style={styles.infoValue}>from {item.fromLocation} to {item.toLocation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Decision</Text>
          <Text style={styles.infoValue}>{item.Accept === null ? "Pending" : item.Accept === true ? "Accepted" : item.Accept === false ? "Denied" : "Unknown"}</Text>
        </View>
        {contactDisplay[item.id] && contactMe}
        {item.Accept && (
          <TouchableOpacity
            onPress={() => toggleContact(item.id)}
            style={styles.actionButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Get In Touch Now</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => loadTaken(null, item.id)}
          style={styles.denyButton}
        >
          <Text style={{ color: "white" }}>Not interested</Text>
        </TouchableOpacity>
      </Card>
    );
  });

  const whenMyLoadBookBidd = getAllIterms.map((item) => {
    const userId = auth.currentUser?.uid;
    if (!userId || item.ownerId !== userId) return null;

    let theRateD: string | undefined;

    if (item.rate) {
      theRateD = `Rate ${item.rate} ${item.perTonneB ? "per tonne" : ""}`;
    } else if (item.triaxleRate && item.linksRate) {
      theRateD = `Links ${item.linksRate} Triaxle ${item.triaxleRate} ${item.perTonneB ? "per tonne" : ""}`;
    } else if (item.triaxleRate) {
      theRateD = `Triaxle ${item.triaxleRate} ${item.perTonneB ? "per tonne" : ""}`;
    } else if (item.linksRate) {
      theRateD = `Links ${item.linksRate} ${item.perTonneB ? "per tonne" : ""}`;
    }

    const message = `${item.ownerName}
Is this Load still available
${item.itemName} from ${item.fromLocation} to ${item.toLocation}
${theRateD}

From: https://transix.net/selectedUserLoads/${item.userId}/${item.id}`;

    const messageV = `${item.ownerName}
Is this Load still available
Commodity ${item.itemName}
from ${item.fromLocation} to ${item.toLocation}
${theRateD}

Truck Details
- Horse Registration: ${item.horseReg}
- Trailer Type: ${item.trailerType}
- Trailer Registration: ${item.trailerReg}
- Second Trailer Registration: ${item.scndTrailerReg}

Driver Details
- Driver Name: ${item.driverName}
- Driver License: ${item.driverLicense}
- Driver Passport: ${item.driverPassport}
- Driver Phone: ${item.driverPhone}

From: https://transix.net/selectedUserLoads/${item.userId}/${item.id} `;

    let messageSend = item.isVerified ? messageV : message;

    let contactMe = (
      <View style={{ paddingLeft: 30, marginBottom: 30 }}>
        <TouchableOpacity
          onPress={() => navigate(`/message/${item.userId}/${item.CompanyName} `)}
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#008080",
            justifyContent: "center",
            marginBottom: 5,
            marginTop: 6,
          }}
        >
          <Text style={{ color: "#008080" }}>Message now</Text>
          <MaterialIcons name="chat" size={24} color="#008080" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(messageSend)}`)}
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#25D366",
            justifyContent: "center",
            marginBottom: 6,
          }}
        >
          <Text style={{ color: "#25D366" }}>WhatsApp </Text>
          <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${item.contact}`)}
          style={{
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#0074D9",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Text style={{ color: "#0074D9" }}>Phone call</Text>
          <MaterialIcons name="call" size={24} color="#0074D9" />
        </TouchableOpacity>
      </View>
    );


    let dbToBechanged = ""
    dbName === "bookings" ? (dbToBechanged = "bookings") : (dbToBechanged = "biddings");

    return (
      <Card key={item.id} isVerified={item.isVerified}>
        <Text style={{ color: accent, textAlign: "center", fontSize: 18, fontWeight: "bold", marginBottom: 6 }}>
          {item.bookerName}
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { fontStyle: "italic" }]}>Commodity</Text>
          <Text style={styles.infoValue}>: {item.itemName} was {dbName === "bookings" ? "Booked" : "Bidded"}</Text>
        </View>
        {item.rate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rate</Text>
            <Text style={styles.infoValue}>{item.currencyB ? "USD" : "RAND"} {item.rate} {item.perTonneB ? "Per tonne" : null}</Text>
          </View>
        )}
        {item.linksRate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Links</Text>
            <Text style={styles.infoValue}>{item.currency ? "USD" : "RAND"} {item.linksRate} {item.pertonne ? "Per tonne" : null}</Text>
          </View>
        )}
        {item.triaxleRate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Triaxle</Text>
            <Text style={styles.infoValue}>{item.currency ? "USD" : "RAND"} {item.triaxleRate} {item.pertonne ? "Per tonne" : null}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Route</Text>
          <Text style={styles.infoValue}>from {item.fromLocation} to {item.toLocation}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 8, marginBottom: 8 }]}>
          <TouchableOpacity
            onPress={() => toggleAcceptOrDeny(dbToBechanged, item.id, "Accept", item.contact, messageSend)}
            style={styles.acceptButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleAcceptOrDeny(dbToBechanged, item.id, "Deny")}
            style={styles.buttonIsFalse}
          >
            <Text style={{ color: accent, fontWeight: "bold" }}>Deny</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.infoRow, { marginBottom: 10 }]}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={{ fontSize: 16, color: "white" }}>Bookers trucks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleContact(item.id)}
            style={styles.actionButton}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Get In Touch</Text>
          </TouchableOpacity>
        </View>
        {contactDisplay[item.id] && contactMe}
        <TouchableOpacity
          onPress={() => loadTaken(item.loadId, item.id)}
          style={styles.denyButton}
        >
          <Text style={{ color: "white" }}>Load Taken</Text>
        </TouchableOpacity>
      </Card>
    );
  });

  // --- Main Render ---
  return (
    <ScreenWrapper >
      {/* Header */}

      <Heading page={dspRoute ? dspRoute.toString() : " Bookings and Biddings"} />

      <View style={{ paddingTop: 90, flex: 1 }}>
        {dspRoute === "itermsYouBidded" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {whnBookBiddAload}
            {getAllIterms.length > 15 && dspLoadMoreBtn && (
              <TouchableOpacity onPress={() => loadedData(true)} style={styles.loadMoreBtn}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {dspRoute === "yourBiddedItems" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {whenMyLoadBookBidd}
            {getAllIterms.length > 15 && dspLoadMoreBtn && (
              <TouchableOpacity onPress={() => loadedData(true)} style={styles.loadMoreBtn}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {dspRoute === "itemsYouBooked" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {whnBookBiddAload}
            {getAllIterms.length > 15 && dspLoadMoreBtn && (
              <TouchableOpacity onPress={() => loadedData(true)} style={styles.loadMoreBtn}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {dspRoute === "yourBookedItems" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {whenMyLoadBookBidd}
            {getAllIterms.length > 15 && dspLoadMoreBtn && (
              <TouchableOpacity onPress={() => loadedData(true)} style={styles.loadMoreBtn}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
}

export default React.memo(BookingsandBiddings);

const styles = StyleSheet.create({
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
    borderColor: accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 90,
    marginLeft: 10,
    backgroundColor: "#fff",
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


