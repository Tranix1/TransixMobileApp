import React from "react";

import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image,TextInput } from "react-native";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from "@expo/vector-icons";

const { Paynow } = require("paynow");

import { auth , db } from "../config/fireBase";

import inputstyles from "../styles/inputElement";

import {v4 as uuidv4} from "react-native-uuid"

function ViewEventsCode({navigation,route}) {

const {username ,contact , } = route.params

  const [alreadyHveTicket , setAlreadyHaveT] = React.useState("")

        React.useEffect(() => {
        try {

          if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const statusQuery = query(collection(db, "purchasedTickets"), where("ticketId", "==", userId));

            const unsubscribe = onSnapshot(statusQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();

                const alreadyHT = data.ticketId || false; // Assuming isVerified is a boolean field

            setAlreadyHaveT(alreadyHT)
                            
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
          }
        } catch (error) {
          console.error(error);
        }
      }, [ username]);


      

  const [ ecocashPhoneNUm , SetEcocashPhoneNum] = React.useState('');
  const [ ticketPrice , SetTicketPrice] = React.useState(0);
  const [ eventName , SetEventName] = React.useState('Burn Out');




  const ticketsCollection = collection(db, "boughtTickets");

    async function handleSubDB({pollUrl}){
        try{


      const userId = auth.currentUser.uid
      const orderId = `${eventLocation}${userId}${eventType}${eventDate}`
      const docRef = await addDoc(ticketsCollection, {
        userId: userId, // Add the user ID to the document
        username : username ,
        contact : contact ,

        ticketId : "uniues code",
        ticketEvent : "burnout" ,
        ticketType : "vip " ,

        ticketPrice :ticketPrice ,

        orderDate : orderDate ,
        orderId : orderId ,
        paymentMethod :paymentMethod,
        
        pollUrl : pollUrl ,

        dsplayedId : dsplayedId
        


      });


        }catch(e){
            console.error(e)
        }
    }



      let uniqueRecepipt = Math.floor(100000000000 + Math.random() * 900000000000).toString() 

async function handleSubmission() {
  let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");

  let payment = paynow.createPayment( `${uniqueRecepipt}r`, "kelvinyaya8@gmail.com");

  paynow.resultUrl = "https://transix.net";
  paynow.returnUrl = "https://transix.net";

  // Add items/services
  payment.add("Bananas", 3.5);

  try {
    let response = await paynow.sendMobile(payment, "0771111111", "ecocash");

    if (response.success) {
      let pollUrl = response.pollUrl; // Save this URL to check the payment status
      console.log("✅ Payment initiated! Polling for status...");

      // Poll every 10 seconds until payment is complete
      let pollInterval = setInterval(async () => {
        try {
          let status = await paynow.pollTransaction(pollUrl);
          console.log("🔄 Checking payment status:", status.status);

          if (status.status === "paid") {
            console.log("✅ Payment Complete!");
              handleSubDB(pollUrl)
            clearInterval(pollInterval); // Stop polling
          } else if (status.status === "cancelled" || status.status === "failed") {
            console.log("❌ Payment Failed or Cancelled.");
            clearInterval(pollInterval);
          }
        } catch (pollError) {
          console.log("⚠️ Polling Error:", pollError);
          clearInterval(pollInterval);
        }
      }, 10000); // Poll every 10 seconds
    } else {
      console.log("❌ Error:", response.error);
    }
  } catch (error) {
    console.log("⚠️ Payment Error:", error);
  }
}



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
// handleSubDB(pollUrl )


  const [dspTickets , setDspTickets] = React.useState(false)

  function toggleDspSellT(){
    setDspTickets(true)
    setDspDescripton(false)
  }
 const [dspDescription , setDspDescripton] = React.useState(true)

  function toggleDspDescription(){
    setDspDescripton(true)
    setDspTickets(false)
  }

    return(
             
  <View style={{paddingTop:100}} >
             <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} >
            {/* <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  /> */}
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > SELECKTA BURNOUT  </Text>
       </View>

<View style={{width:270 , alignSelf:'center'}} >


       { <Image source={{uri: "https://firebasestorage.googleapis.com/v0/b/truckers-cace6.appspot.com/o/Trucks%2F1741522836736?alt=media&token=5ed6d0b6-0c85-4264-8237-d91fb385633f"
}} style={{ height : 220 , borderRadius: 10, width:345, alignSelf:'center'}} />}












<View style={{flexDirection:'row' , height: 40 , alignItems:'center' , justifyContent:'space-around'}} >
  <TouchableOpacity   onPress={toggleDspDescription} >
    <Text style={dspDescription ?{color:'red' }:null} >Description</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={toggleDspSellT} >
    <Text style={dspTickets ?{color:'red' }:null} >Tickets</Text>
  </TouchableOpacity>
</View>



{dspTickets&&<View>
 
  <View style={{flexDirection:'row',justifyContent:'space-between', backgroundColor:'grey', height:35, borderRadius:6,alignItems:'center', paddingLeft:8 , paddingRight:8,marginBottom:12}} >
    <Text style={{fontWeight:"bold"}} >General</Text>
    <Text style={{fontWeight:"bold"}}>$2 </Text>
    <TouchableOpacity style={{backgroundColor:'red', height:25 , width:40 , borderRadius:5 , justifyContent:'center',alignItems:'center' }} >
      <Text>Buy</Text>
    </TouchableOpacity>
  </View>

  <View style={{flexDirection:'row',justifyContent:'space-between', backgroundColor:'grey', height:35, borderRadius:6,alignItems:'center', paddingLeft:8 , paddingRight:8,marginBottom:12}} >
    <Text style={{fontWeight:"bold"}} >VIP Access</Text>
    <Text style={{fontWeight:"bold"}} >$20 </Text>
    <TouchableOpacity style={{backgroundColor:'red', height:25 , width:40 , borderRadius:5 , justifyContent:'center',alignItems:'center' }}>
      <Text>Buy</Text>
    </TouchableOpacity>
  </View>

<TouchableOpacity style={{backgroundColor:'red', marginTop:15 ,height:30,borderRadius:6, justifyContent:'center',alignItems:'center' }}>
  <Text>Check out $20</Text>
</TouchableOpacity>


</View>}







{dspDescription&&<View>



<View>
  <Text style={{fontWeight:'bold', fontSize:20}} >Piano Cuzzle</Text>
  <View style={{flexDirection:'row', justifyContent:'space-between'}} >
    <Text style={{}}>My stiue garderns</Text>
    <Text style={{color:'red'}}>$5</Text>
  </View>
</View>

<View>
  <Text>March 30 2025</Text>
  <Text>2 Pm</Text>
</View>







  {/* Buttons */}
  <View style={{ alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 }}>
    <TouchableOpacity>
      <Text>Description</Text>
    </TouchableOpacity>
    <TouchableOpacity  onPress={toggleEnter}>
      <Text >Entertainers</Text>
    </TouchableOpacity>

    <TouchableOpacity  onPress={toggleDspPartic}>
      <Text >Participants</Text>
    </TouchableOpacity>

    <TouchableOpacity  onPress={toggleActivities}>
      <Text >Activities</Text>
    </TouchableOpacity>
  </View>


 
<View>
  <Text>Event descrip</Text>
  <Text>kjasdh asjhd asdjha sdh asdhweu asdha sdhj lahsdahsdl dfss sdf sdf sdf sdf sdf sd sdfsdf sdfsdf asjdh</Text>
</View>


  
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
  <View style={{ alignSelf: "center", marginTop: 10 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>Sponsorship / Partnership</Text>
    
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
      <TouchableOpacity style={{}}>
        <Text style={{ }}>263787884434</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{ }}>
        <Text style={{ }}>kelvinyaya8@gmail.com</Text>
      </TouchableOpacity>
    </View>
  </View>

 {/* Sponsors */}
  <View style={{ marginTop: 15 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>Sponsors</Text>
    
    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5 }}>
      <Text >SOLATEX</Text>
      <Text >AUTO UIP</Text>
      <Text >TRANSIX</Text>
      <Text >PROTON</Text>
      <Text >KHARL</Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 5 }}>
      <Text >Schweppes</Text>
      <Text >AHOGANT</Text>
      <Text >BAVARIAN</Text>
    </View>
  </View>

</View>}

</View>

</View>
    )
}

export default React.memo(ViewEventsCode)
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