import React ,{useEffect} from "react";
import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image , ScrollView } from "react-native";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';
import { db, auth } from "../config/fireBase";

import { Ionicons } from "@expo/vector-icons";
import {v4 as uuidv4} from "react-native-uuid"

const { Paynow } = require("paynow");


function Events({route,navigation}) {

  const {username , contact} = route.params

const [dspSelEvent , setDspSelEvent] = React.useState(true)

const [selectedEvent , setSelectedEvent]=React.useState("")

function moveToEventsPage(theEvent){
  setDspSelEvent(false)
  setSelectedEvent(theEvent)
}



  const [getEvent , setGetEvent]=React.useState([])
  const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)

async function loadedData(loadMore) {

  try{
      loadMore ? setLoadMoreData(true) : null;

    const orderByF = "timeStamp";
    const orderByField = orderBy(orderByF, 'desc'); // Order by timestamp in descending order

    const pagination = loadMore && loadsList.length > 0 ? [startAfter(loadsList[loadsList.length - 1][orderByF])] : [];
         let dataQuery = query(collection(db, "availableEvents") );

    
    const docsSnapshot = await getDocs(dataQuery);
    
    let userItemsMap = [];
    
    docsSnapshot.forEach(doc => {
        userItemsMap.push({ id: doc.id, ...doc.data() });
    });

    const verifiedUsers = userItemsMap.filter(user => user.isVerified);
    const nonVerifiedUsers = userItemsMap.filter(user => !user.isVerified);
    
    userItemsMap = verifiedUsers.concat(nonVerifiedUsers);
    let loadedData = userItemsMap;

    if (loadedData.length === 0) {
        setLoadMoreBtn(false);
    }

    // Update state with the new data
    setGetEvent(loadMore ? [  ...getEvent , ...loadedData] : loadedData);

    loadMore ? setLoadMoreData(false) : null;
    }catch(err){
      console.error(err)
    }
}
    
  
console.log(getEvent)

useEffect(() => {
  loadedData();
  
}, []);


  const [dspActivities , setDspActivities]=React.useState(false)
  function toggleActivities(){
    setDspActivities(prev=>!prev)
    setEntertainer(false)
    setDspParticipant(false)
  }

  const [dspParticipants,setDspParticipant]=React.useState(false)
  function toggleDspPartic(){
    setDspParticipant(prev=>!prev)
    setDspActivities(false)
    setEntertainer(false)

  }

  const [entertainers , setEntertainer]=React.useState(false)
  function toggleEnter(){
    setEntertainer(prev=>!prev)
    setDspActivities(false)
    setDspParticipant(false)
  }



    const checkExistixtBBDoc = async (ticketId) => {
    const chatsRef = collection(db, 'Tickets'); // Reference to the 'ppleInTouch' collection
    const chatQuery = query(chatsRef, where('ticketId', '==', ticketId)); // Query for matching chat ID

      const querySnapshot = await getDocs(chatQuery);  
     // Check if any documents exist with the chat ID
      return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    };

  let rendereIterms = getEvent.map((item)=>{
    
  async function handlePurchase(){

      navigation.navigate("viewEventsCode")
      setSpinnerItem(true)

      const userId = auth.currentUser.uid
      const ticketId = `${item.eventLocation}${userId}${item.eventType}${item.eventDate}`
          const existingBBDoc = await checkExistixtBBDoc(ticketId);
          
  const gitCollection = collection(db, "Tickets");
  
  try {
    if(!existingBBDoc){


      const docRef = await addDoc(gitCollection, {
        userId: userId, // Add the user ID to the document
        username : username ,
        contact : contact ,

        ticketId :ticketId ,
        ticketEvent : "burnout" ,
        ticketType : "vip " ,

        ticketPrice :ticketPrice ,

        ticketStatus : ticketStatus +"sold avialble reserved",

        orderDate : orderDate ,
        paymentMethod :paymentMethod,
        
        orderStatus : orderStatus+"pending confirmed cancelled" ,
        orderId :orderId ,
        orderTotal :orderTotal ,



      });

    }else{
      navigation.navigate("viewEventsCode")

    }

      setSpinnerItem(false)
   
    } catch (err) {
      setSpinnerItem(false)
      console.error(err.toString());
      }
  }

  return(
    <TouchableOpacity 
  onPress={handlePurchase} 
  key={item.id} 
  style={{  
    marginBottom: 10,  
    padding: 10,  
    borderWidth: 2,  
    borderColor: '#6a0c0c',  
    borderRadius: 10,  
    backgroundColor: '#fff',  
    shadowColor: '#6a0c0c',  
    shadowOffset: { width: 1, height: 2 },  
    shadowOpacity: 0.5,  
    shadowRadius: 4,  
    elevation: 5,  
    margin: 12 
  }} 
>

  {/* Header */}
  <Text style={{ 
    alignSelf: 'center', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    color: '#d91e18', 
    fontSize: 24, 
    letterSpacing: 2, 
    textTransform: 'uppercase', 
    textShadowColor: '#6a0c0c', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2,
    marginBottom: 5 ,
    textDecorationLine:'underline',
    textDecorationColor:'#6a0c0c'
  }}>
   SELECKA BASE
  </Text>






 <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
  {/* NOW Section (More Engaging Colors) */}
  <View style={{ width: 170 }}>
    <Text 
  style={{ 
    textDecorationLine: 'underline', 
    color: '#1DB954', 
    textDecorationColor: '#1DB954', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }}>
  Get Your Ticket Now!
</Text>

      
      

    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 5 }}>Cooler Box: $2</Text>

    <View style={{ flexDirection: 'row', marginTop: 5, }}>
      {/* Ordinary - Bright Green */}
      <View style={styles.ticketBox('#00c853', '#ccff90')}>
        <Text style={styles.ticketLabel('#00c853')}>Ord</Text>
        <Text style={styles.ticketPrice('#00c853')}>5</Text>
      </View>

      {/* VIP - Gold */}
      <View style={styles.ticketBox('#ff9800', '#ffe0b2')}>
        <Text style={styles.ticketLabel('#ff9800')}>VIP</Text>
        <Text style={styles.ticketPrice('#ff9800')}>4</Text>
      </View>

      {/* VVIP - Royal Purple */}
      <View style={styles.ticketBox('#6a1b9a', '#e1bee7')}>
        <Text style={styles.ticketLabel('#6a1b9a')}>VVIP</Text>
        <Text style={styles.ticketPrice('#6a1b9a')}>10</Text>
      </View>

      {/* Early Bird - Bright Blue */}
      <View style={styles.ticketBox('#0288d1', '#b3e5fc')}>
        <Text style={styles.ticketLabel('#0288d1')}>Early</Text>
        <Text style={styles.ticketPrice('#0288d1')}>7</Text>
      </View>
    </View>

    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 8 }}>Kids under 12: $3</Text>
  </View>

  {/* GATE Section (Muted Colors) */}
  <View style={{ width: 170 }}>
    <Text style={{ textDecorationLine: 'underline', color: '#d32f2f', textDecorationColor: '#d32f2f', textAlign: 'center', fontSize: 14, fontWeight: 'bold' }}>Gate</Text>

    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 5 }}>Cooler Box: $2</Text>

    <View style={{ flexDirection: 'row', marginTop: 5,  }}>
      {/* Early Bird - Dull Green */}
      <View style={styles.ticketBox('#388e3c', '#c8e6c9')}>
        <Text style={styles.ticketLabel('#388e3c')}>Early</Text>
        <Text style={styles.ticketPrice('#388e3c')}>7</Text>
      </View>

      {/* Ordinary - Muted Green */}
      <View style={styles.ticketBox('#2e7d32', '#a5d6a7')}>
        <Text style={styles.ticketLabel('#2e7d32')}>Ord</Text>
        <Text style={styles.ticketPrice('#2e7d32')}>10</Text>
      </View>
        {/* VIP - Luxurious Gold */}
        <View style={styles.ticketBox('#c99700', '#fff4c2')}>
          <Text style={styles.ticketLabel('#c99700')}>VIP</Text>
          <Text style={styles.ticketPrice('#c99700')}>20</Text>
        </View>

        {/* VVIP - Deep Royal Purple */}
        <View style={styles.ticketBox('#4a148c', '#e1bee7')}>
          <Text style={styles.ticketLabel('#4a148c')}>VVIP</Text>
          <Text style={styles.ticketPrice('#4a148c')}>40</Text>
        </View>

    </View>

    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 8 }}>Kids under 12: $6</Text>
  </View>
</View>














  {/* Buttons */}
  <View style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 }}>
    <TouchableOpacity style={{ width: 80, borderColor: '#6a0c0c', backgroundColor: '#ffcccb', justifyContent: 'center', alignItems: 'center', borderRadius: 6, borderWidth: 2 }} onPress={toggleEnter}>
      <Text style={{ fontSize: 12, color: '#6a0c0c', fontWeight: 'bold' }}>Entertainers</Text>
    </TouchableOpacity>

    <TouchableOpacity style={{ width: 80, borderColor: '#0c6a33', backgroundColor: '#c3f3c0', justifyContent: 'center', alignItems: 'center', borderRadius: 6, borderWidth: 2, marginLeft: 6 }} onPress={toggleDspPartic}>
      <Text style={{ fontSize: 12, color: '#0c6a33', fontWeight: 'bold' }}>Participants</Text>
    </TouchableOpacity>

    <TouchableOpacity style={{ width: 80, borderColor: '#0c3e6a', backgroundColor: '#c0e7ff', justifyContent: 'center', alignItems: 'center', borderRadius: 6, borderWidth: 2, marginLeft: 6 }} onPress={toggleActivities}>
      <Text style={{ fontSize: 12, color: '#0c3e6a', fontWeight: 'bold' }}>Activities</Text>
    </TouchableOpacity>
  </View>

  {/* Event Info */}
 {!entertainers&&!dspParticipants&&!dspActivities && <View>

  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#6a0c0c', textAlign: 'center', marginBottom: 5 }}>
     10th Anniversary Celebratio
  </Text>

  <Text style={{ fontSize: 16, color: '#444', textAlign: 'center' }}>
    📍 <Text style={{ fontWeight: 'bold' }}>Location:</Text> Harare
  </Text>

  <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginTop: 3 }}>
    📅 <Text style={{ fontWeight: 'bold' }}>Date:</Text> 28 feb 2025 ⏰ <Text style={{ fontWeight: 'bold' }}>Time:</Text> 1100-2200
  </Text>

  <Text style={{ fontSize: 15, color: '#666', textAlign: 'center', marginTop: 5 }}>
    🎉 <Text style={{ fontWeight: 'bold' }}>HELLOOOOOO</Text>
  </Text>


  </View>}
  
<View style={styles.container}>
  {/* 🎤 Entertainers Section */}
  {entertainers && (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Entertainers</Text>
      <Text style={styles.detailText}><Text style={styles.boldText}>Artist:</Text> Bagga, King 98</Text>
      <Text style={styles.detailText}><Text style={styles.boldText}>DJ's:</Text> Nospa, Royals DJ Harare</Text>
    </View>
  )}

  {/* 🏎️ Participants Section */}
  {dspParticipants && (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Participants</Text>
      <View style={styles.textRow}>
        <Text style={styles.nameText}>Amakhosi</Text>
        <Text style={styles.nameText}>Mac D</Text>
        <Text style={styles.nameText}>Ben AK47</Text>
        <Text style={styles.nameText}>Sbhale</Text>
        <Text style={styles.nameText}>Team Ghost</Text>
        <Text style={styles.nameText}>Mabhudhi</Text>
      </View>
      <View style={styles.textRow}>
        <Text style={styles.nameText}>Mavusane</Text>
        <Text style={styles.nameText}>Mastanda</Text>
        <Text style={styles.nameText}>The Rock</Text>
        <Text style={styles.nameText}>King Fly</Text>
        <Text style={styles.nameText}>King Yago</Text>
      </View>
      <Text style={styles.detailText}>
        Team Baby Driver, King Dee, Damian Dirty Boyz, Team Unique, Team Ghost, Manyuchi, Captain, Team Mahogany, Ben V8 Kings
      </Text>
    </View>
  )}

  {/* 🎆 Activities Section */}
  {dspActivities && (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activities</Text>
      <Text style={styles.detailText}>🔥 Burnouts</Text>
      <Text style={styles.detailText}>🚗 Exhibitions</Text>
      <Text style={styles.detailText}>🏁 Static Car Displays</Text>
      <Text style={styles.detailText}>🏍️ Bikers</Text>
      <Text style={styles.detailText}>🎶 Live Music, DJ Concession, Food & Drinks, Fireworks</Text>
    </View>
  )}
</View>


  {/* Sponsorship Section */}
  <View style={{ alignSelf: "center", marginTop: 15 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>🤝 Sponsorship / Partnership</Text>
    
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
      <TouchableOpacity style={{ backgroundColor: '#0c6a33', padding: 6, borderRadius: 6, marginRight: 10 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>📞 Call</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{ backgroundColor: '#6a0c0c', padding: 6, borderRadius: 6 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>📧 Email</Text>
      </TouchableOpacity>
    </View>
  </View>
 {/* Sponsors */}
  <View style={{ marginTop: 15 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>🏆 Sponsors</Text>
    
    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5 }}>
      <Text style={{ color: '#d91e18', fontWeight: 'bold' }}>SOLATEX</Text>
      <Text style={{ color: '#0c6a33', fontWeight: 'bold' }}>AUTO UIP</Text>
      <Text style={{ color: '#1e3799', fontWeight: 'bold' }}>TRANSIX</Text>
      <Text style={{ color: '#f39c12', fontWeight: 'bold' }}>PROTON</Text>
      <Text style={{ color: '#8e44ad', fontWeight: 'bold' }}>KHARL</Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5 }}>
      <Text style={{ color: '#2980b9', fontWeight: 'bold' }}>Schweppes</Text>
      <Text style={{ color: '#c0392b', fontWeight: 'bold' }}>AHOGANT</Text>
      <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>BAVARIAN</Text>
    </View>
  </View>

</TouchableOpacity>

  )
  })


function handleMakePayement() {
  let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");
  // Create a new payment inside the function to avoid stale data

  let payment = paynow.createPayment("Invoice 37", "kelvinyaya8@gmail.com");
  
  paynow.resultUrl = "https://transix.net";
  paynow.returnUrl = "https://transix.net";
  // Add items/services
  payment.add("Bananas", 2.5);


  paynow.sendMobile(payment, "0771111111", "ecocash")
    .then(response => {
      if (response.success) {
        let pollUrl = response.pollUrl; // Save this URL to check the payment status
          paynow.pollTransaction(pollUrl)
            .then(status => {

                  if (status.status === "paid") {
                    console.log("✅ Payment Complete!");
                    console.log(pollUrl)
                  } else {
                    console.log("❌ Payment Not Complete. Current status:", status.status);

                  }
            })
      } else {
        console.log("Error:", response.error);
      }
    })
    .catch(err => console.log("Error:", err));
}



// Proof of bank account in the name of the company e.g. stamped Bank Statement or letter from the bank which lists bank account number



 return(
    <View style={{paddingTop:80}} >

       <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > {!selectedEvent ? "Events" : `${selectedEvent}🔥 `}  </Text>
       </View>
      {dspSelEvent && <ScrollView style={{alignSelf:'center' , marginBottom:120 }} showsVerticalScrollIndicator={false} >

       <TouchableOpacity style={styles.sEventButtonStyle}>
        <Text style={styles.sEventButtonText}>Drag Races</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sEventButtonStyle} onPress={()=>moveToEventsPage("Burnouts")} >
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


      </ScrollView>}

        {selectedEvent &&  rendereIterms  }

        
    </View>
 )   
}
export default React.memo(Events)

const styles = StyleSheet.create({
   sEventButtonStyle: {
  height: 45,
  justifyContent: 'center',
  alignItems: 'center',
  width: 220,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: "#6a0c0c",
  borderRadius: 8,  // Increased for a softer look
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,  // For Android shadow
},
sEventButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: "#6a0c0c",
  textTransform: 'uppercase', // Makes text more readable
},
 ticketBox: (borderColor, bgColor) => ({
    width: 30,
    borderWidth: 1,
    borderColor: borderColor,
    alignItems: 'center',
    backgroundColor: bgColor,
    borderRadius: 5,
    paddingVertical: 4,
    marginLeft:6
  }),
  ticketLabel: (color) => ({
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: color,
    color: color,
    fontWeight: 'bold'
  }),
  ticketPrice: (color) => ({
    fontWeight: 'bold',
    color: color,
    fontSize: 13
  }), container: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 4,
    textAlign: 'center',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495e',
    padding: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7f8c8d',
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  }

  
});