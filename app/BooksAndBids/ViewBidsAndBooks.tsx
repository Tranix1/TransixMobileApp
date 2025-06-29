import React, { useEffect, useState } from "react";
import { View, TouchableOpacity,  StyleSheet, ScrollView, Linking, } from "react-native";
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
  console.log(dspRoute)

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



  // --- Main Render ---
  return (
    <ScreenWrapper >
      {/* Header */}

      <Heading page={dspRoute ? dspRoute : " Bookings and Biddings"} />

      <View style={{ paddingTop: 90, flex: 1 }}>
        {dspRoute === "Iterms You Bidded" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {
            <View style={{  marginBottom: 15, width : 350 , padding :7}}>

             <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
            <MaterialIcons name="verified" size={26} color="green" />
            </View>

            
        <ThemedText style={{color:'#5a0c0c' , fontSize:15,textAlign :'center' }} >Chibuku logistics </ThemedText>

         <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :59}} >{dbName === "bookings" ?  "Booked" : "Bidded"}</ThemedText>
        <ThemedText>:  weed </ThemedText>
      </View>

        <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :99}} >Rate</ThemedText>
        <ThemedText>:  usd 300 per Tonne </ThemedText>
      </View> 
      


  <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :60}} >Route</ThemedText>
        <ThemedText>:  from  Harare  to  Kadoma </ThemedText>
      </View>
          
      <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :60}} >Decision</ThemedText>
        <ThemedText>:  "Pending" /"Accepted" / "Denied" </ThemedText>
      </View>

        {  <TouchableOpacity  style={{ width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
          <ThemedText style={{ color:'white'}} > Get In Touch Now</ThemedText>
        </TouchableOpacity>}

          <TouchableOpacity  style={{backgroundColor :'red' , width : 100 , alignItems :'center' , borderRadius :50 , position :'absolute', right :7 , bottom :7}}>
            <ThemedText style={{color:'white'}} > Not intrested </ThemedText>
          </TouchableOpacity>
      </View>
            }
          
          </ScrollView>
        )}

        {dspRoute === "Your Booked Items" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                 
    <View style={{  marginBottom: 15, width : 350 , padding :7}} >


            { <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
            <MaterialIcons name="verified" size={26} color="green" />
            </View>}

            <ThemedText style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' }}  > CHIHOKO lOGISTICS </ThemedText>


 <View style={{flexDirection :'row',marginBottom:6}} >
        <ThemedText style={{width :85 ,fontStyle:'italic',fontSize:16}} >Commodity</ThemedText>
        <ThemedText style={{fontSize:17}} >: weed was {dbName === "bookings" ?  "Booked" : "Bidded"} </ThemedText>
      </View>

        {<View style={{flexDirection :'row'}} >
        <ThemedText style={{width :100}} >Rate</ThemedText>
        <ThemedText>:  USD 899 PER TONNE </ThemedText>
      </View>}

      


  <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :75}} >Route</ThemedText>
        <ThemedText>:  from  Lopansi  to  CHihoro </ThemedText>
      </View>

                 <View style={{flexDirection:'row' , margin :4}} >      
           <TouchableOpacity style={styles.bttonIsTrue} >
            <ThemedText style={{color:'white'}} >Accept </ThemedText>
          </TouchableOpacity>
          
           <TouchableOpacity  style={styles.buttonIsFalse}>
            <ThemedText  >Deny </ThemedText>
          </TouchableOpacity>
            </View>

      <View style={{flexDirection:'row', marginBottom : 25 , height : 30 , alignSelf:'center' , marginTop : 6,  }} >
          <TouchableOpacity style={{    width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#6a0c0c' ,  alignSelf:'center', margin:5  }} >
          <ThemedText style={{fontSize:17,color:'white' }} >Bookers trucks</ThemedText>

          </TouchableOpacity>

        <TouchableOpacity   style={{    width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  alignSelf:'center', margin:5 }} >
          <ThemedText style={{color:'white'}} > Get In Touch</ThemedText>
        </TouchableOpacity>
        </View>


          <TouchableOpacity  style={{backgroundColor :'red' , width : 100 , alignItems :'center' , borderRadius :50 , position :'absolute', right :7 , bottom :7}}>
            <ThemedText style={{color:'white'}} > Load Taken </ThemedText>
          </TouchableOpacity>
      </View>  



          </ScrollView>
        )}

        {dspRoute === "Items You Booked" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              {
            <View style={{  marginBottom: 15, width : 350 , padding :7}}>

             <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
            <MaterialIcons name="verified" size={26} color="green" />
            </View>

            
        <ThemedText style={{color:'#5a0c0c' , fontSize:15,textAlign :'center' }} >Chibuku logistics </ThemedText>

         <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :59}} >{dbName === "bookings" ?  "Booked" : "Bidded"}</ThemedText>
        <ThemedText>:  weed </ThemedText>
      </View>

        <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :99}} >Rate</ThemedText>
        <ThemedText>:  usd 300 per Tonne </ThemedText>
      </View> 
      


  <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :60}} >Route</ThemedText>
        <ThemedText>:  from  Harare  to  Kadoma </ThemedText>
      </View>
          
      <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :60}} >Decision</ThemedText>
        <ThemedText>:  "Pending" /"Accepted" / "Denied" </ThemedText>
      </View>

        {  <TouchableOpacity  style={{ width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
          <ThemedText style={{ color:'white'}} > Get In Touch Now</ThemedText>
        </TouchableOpacity>}

          <TouchableOpacity  style={{backgroundColor :'red' , width : 100 , alignItems :'center' , borderRadius :50 , position :'absolute', right :7 , bottom :7}}>
            <ThemedText style={{color:'white'}} > Not intrested </ThemedText>
          </TouchableOpacity>
      </View>
            }
            {getAllIterms.length > 15 && dspLoadMoreBtn && (
              <TouchableOpacity onPress={() => loadedData(true)} style={styles.loadMoreBtn}>
                <ThemedText style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {dspRoute === "Your Bidded Items" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {

    <View style={{  marginBottom: 15, width : 350 , padding :7}} >


            { <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
            <MaterialIcons name="verified" size={26} color="green" />
            </View>}

            <ThemedText style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' }}  > CHIHOKO lOGISTICS </ThemedText>


 <View style={{flexDirection :'row',marginBottom:6}} >
        <ThemedText style={{width :85 ,fontStyle:'italic',fontSize:16}} >Commodity</ThemedText>
        <ThemedText style={{fontSize:17}} >: weed was {dbName === "bookings" ?  "Booked" : "Bidded"} </ThemedText>
      </View>

        {<View style={{flexDirection :'row'}} >
        <ThemedText style={{width :100}} >Rate</ThemedText>
        <ThemedText>:  USD 899 PER TONNE </ThemedText>
      </View>}

      


  <View style={{flexDirection :'row'}} >
        <ThemedText style={{width :75}} >Route</ThemedText>
        <ThemedText>:  from  Lopansi  to  CHihoro </ThemedText>
      </View>

                 <View style={{flexDirection:'row' , margin :4}} >      
           <TouchableOpacity style={styles.bttonIsTrue} >
            <ThemedText style={{color:'white'}} >Accept </ThemedText>
          </TouchableOpacity>
          
           <TouchableOpacity  style={styles.buttonIsFalse}>
            <ThemedText  >Deny </ThemedText>
          </TouchableOpacity>
            </View>

      <View style={{flexDirection:'row', marginBottom : 25 , height : 30 , alignSelf:'center' , marginTop : 6,  }} >
          <TouchableOpacity style={{    width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#6a0c0c' ,  alignSelf:'center', margin:5  }} >
          <ThemedText style={{fontSize:17,color:'white' }} >Bookers trucks</ThemedText>

          </TouchableOpacity>

        <TouchableOpacity   style={{    width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  alignSelf:'center', margin:5 }} >
          <ThemedText style={{color:'white'}} > Get In Touch</ThemedText>
        </TouchableOpacity>
        </View>


          <TouchableOpacity  style={{backgroundColor :'red' , width : 100 , alignItems :'center' , borderRadius :50 , position :'absolute', right :7 , bottom :7}}>
            <ThemedText style={{color:'white'}} > Load Taken </ThemedText>
          </TouchableOpacity>
      </View>  



            }
            {getAllIterms.length > 15 && dspLoadMoreBtn && (
              <TouchableOpacity onPress={() => loadedData(true)} style={styles.loadMoreBtn}>
                <ThemedText style={{ color: 'white', fontSize: 18, textAlign: 'center', fontWeight: "bold" }}>Load More</ThemedText>
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
        borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
     backgroundColor:"red"
    //  marginLeft : 6`
    },
        bttonIsTrue:{
    backgroundColor : 'green' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' 

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


