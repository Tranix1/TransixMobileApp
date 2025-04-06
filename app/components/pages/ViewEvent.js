import React,{useState} from "react";

import { View , Text  , TouchableOpacity , ScrollView,StyleSheet ,Image,TextInput } from "react-native";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from "@expo/vector-icons";

const { Paynow } = require("paynow");

import { auth , db } from "../config/fireBase";

import inputstyles from "../styles/inputElement";

import {v4 as uuidv4} from "react-native-uuid"

import * as DocumentPicker from 'expo-document-picker';
import Feather from '@expo/vector-icons/Feather';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function ViewEventsCode({navigation,route}) {


 const pickDocument = async () => {
 try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    console.log('Picker result:', result);

    if (result.canceled) {
      alert('Document picking was cancelled.');
      return;
    }

    const file = result.assets?.[0];
    if (!file) {
      alert('No document was selected.');
      return;
    }

    if (file.size && file.size > 0.5 * 1024 * 1024) {
      alert('The selected PDF must not be more than 0.5MB.');
      return;
    }

    console.log('Picked file:', file);
    // setSelectedDocumentS(prev => [...prev, file]);
  } catch (error) {
    console.error('Document Picker Error:', error);
    alert('An error occurred while picking the document.');
  }
};


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

    async function handleSubDB(pollUrl){
        try{


      const userId = auth.currentUser.uid
      // const orderId = `${eventLocation}${userId}${eventType}${eventDate}`
      const orderId = `asdhsajdh ashdjashd`
      const docRef = await addDoc(ticketsCollection, {
        userId: userId, // Add the user ID to the document
        username : username ,
        contact : contact ,

        ticketId : "uniues code",
        ticketEvent : "burnout" ,
        ticketType : "vip " ,

        ticketPrice :ticketPrice ,

        orderDate : '6 jam sosd' ,
        orderId : orderId ,
        paymentMethod :"ecocash" ,
        
        pollUrl : pollUrl ,

        dsplayedId : 'sadasjdaskj'
        


      });
alert('doneeeee')

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

function toggleDspDescrip(){
      setDspActivities(false)
    setEntertainer(false)
    setDspParticipant(false)
}

  const [dspActivities , setDspActivities]=React.useState(false)
  function toggleActivities(){
    setDspActivities(true)
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
    setEntertainer(true)
    setDspActivities(false)
    setDspParticipant(false)
  }
// handleSubDB(pollUrl )


  const [dspTickets , setDspTickets] = React.useState(false)

  const [addOnDsp , setAddOnDsp]=React.useState(false)

  function toggleAddOnDsp(){
    setAddOnDsp(prev =>!prev)
  }

  function toggleDspSellT(){
    setDspTickets(true)
    setDspDescripton(false)
  }
 const [dspDescription , setDspDescripton] = React.useState(true)

  function toggleDspDescription(){
    setDspDescripton(true)
    setDspTickets(false)
  }



  const [dspAddBtnTckt , setDspAddBtnTckt] = React.useState({ ['']: false })
  function toggleDspAddBtnTckt(itemId){
          setDspAddBtnTckt((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
  }

const [counts, setCounts] = useState({ ['']: 1 });

const handleAdd = (title) => {
  setCounts((prev) => {
    const current = prev[title] ?? 1; // Use 1 as default if undefined
    if (current < 5) {
      return { ...prev, [title]: current + 1 };
    }
    return prev;
  });
};

const handleRemove = (title) => {
  setCounts((prev) => {
    const current = prev[title] ?? 1;
    if (current === 1) {
      toggleDspAddBtnTckt(title);
      return { ...prev, [title]: 1 }; // optional: you can remove it from state too
    }
    return { ...prev, [title]: current - 1 };
  });
};


  const TicketComponent = ({ title, nowPrice,gatePrice }) => {
  return (
    <View style={styles.ticketContainer}>
      <View style={styles.ticketRow}>
        <Text style={styles.ticketText}>{title}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600' }}>
        <Text style={{ fontWeight: '700' }}>now ${nowPrice} </Text>
        <Text style={{  fontWeight: '600' }}>on-site ${gatePrice}</Text>
      </Text>
       { !dspAddBtnTckt[title] && <TouchableOpacity style={styles.buyButton} onPress={()=>toggleDspAddBtnTckt(title) } >
          <Text style={[styles.ticketText, { color: 'green' }]}>Buy</Text>
        </TouchableOpacity>}

  { dspAddBtnTckt[title] &&  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={ ()=>handleRemove(title) }>
        <Ionicons name="remove" size={20} color={counts[title]  === 1 ? 'gray' : 'green'} />
      </TouchableOpacity>

      <Text style={{ marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' }}>
        {counts[title] || 1}
      </Text>

      <TouchableOpacity onPress={()=> handleAdd(title) }>
        <MaterialIcons name="add" size={20} color={counts[title]  === 5 ? 'gray' : 'green'} />
      </TouchableOpacity>
    </View>}

      </View>
    </View>
  );
};




  const [checkAddOnBtn , setCheckAddOnBtn] = React.useState({ ['']: false })
  function toggleCheckAddOnBtn(itemId){
         setCheckAddOnBtn((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
  }


const AddOnComponent = ({title , nowPrice,gatePrice  })=>(
  <View>
    <View style={[styles.ticketRow,{borderBottomWidth:1 , borderBottomColor:'black'}]} >

        <Text style={{fontSize:16 ,}}>{title}</Text>
          <Text style={{ fontSize: 12, fontWeight: '600' }}>
        <Text style={{ fontWeight: '700' }}>now ${nowPrice} </Text>
        <Text style={{  fontWeight: '600' }}>on-site ${gatePrice}</Text>
      </Text> 

       <TouchableOpacity style={styles.buyButton} onPress={()=>toggleCheckAddOnBtn(title) } >

      {checkAddOnBtn[title]&& <Entypo name="check" size={24} color="green" /> }
      {!checkAddOnBtn[title]&&  <MaterialIcons name="add" size={24} color="red" />}
        </TouchableOpacity>

    </View>
  </View>
)

const CheckoutButton = ({ totalPrice }) => {
  return (
    <TouchableOpacity style={styles.checkoutButton} onPress={handleSubmission} >
      <Text style={styles.checkoutButtonText}>Check out ${totalPrice}</Text>
    </TouchableOpacity>
  );
};


    return(
             
  <View style={{paddingTop:90}} >
             <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} >
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > SELECKTA BURNOUT  </Text>
       </View>

<View style={{width:330 , alignSelf:'center'}} >

<ScrollView horizontal  style={{borderRadius:10}}>

       { <Image source={{uri: "https://i.ytimg.com/vi/bBf1Gs6EpBk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD-EfeycyQtz2eQP8pjYxmkO9985Q"
}} style={{ height : 220 , borderRadius: 10, width:345, alignSelf:'center',marginRight:9,borderRadius:9}} />}
       { <Image source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDH5jFb7P3CPPeC4Kzk3mUVlQ6k93noJP_XA&s"
}} style={{ height : 220 , borderRadius: 10, width:400, alignSelf:'center',borderRadius:9}} />}
</ScrollView>

       {/* { <Image source={{uri: "https://i.ytimg.com/vi/bBf1Gs6EpBk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD-EfeycyQtz2eQP8pjYxmkO9985Q"
}} style={{ height : 220 , borderRadius: 10, width:345, alignSelf:'center'}} />} */}







<View style={{
  flexDirection: 'row',
  height: 40,
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: 10,
}}>
  <TouchableOpacity onPress={toggleDspDescription}>
    <Text style={[{ fontSize: 16, fontWeight: 'bold', color: dspDescription ? 'red' : 'black' }]}>Description</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={toggleDspSellT}>
    <Text style={[{ fontSize: 16, fontWeight: 'bold', color: dspTickets ? 'red' : 'black' }]}>Tickets</Text>
  </TouchableOpacity>
</View>






      {dspTickets && (
        <View >
         {!addOnDsp && <View>

          <TicketComponent title="General" nowPrice="3" gatePrice="7" />
          <TicketComponent title="early bird" nowPrice="3" gatePrice="7" />
          <TicketComponent title="VIP Access" nowPrice="14" gatePrice="26"  />
          <TicketComponent title="VVIP Access" nowPrice="14" gatePrice="26"  />
          
          </View>}

            {addOnDsp&& <View>
          <AddOnComponent title="Cooler Box" nowPrice="3" gatePrice="7" />
          <AddOnComponent title="Parking" nowPrice="3" gatePrice="7" />
            </View>}

     
           <TouchableOpacity onPress={toggleAddOnDsp}>
            <Text style={{fontWeight:'bold',fontSize:20,alignSelf:'flex-end',margin:5,marginBottom:0}}>{addOnDsp ? "TICKETS" : "ADD ONS"}</Text>
            </TouchableOpacity>     

          <CheckoutButton totalPrice="20" />

         
        </View>
      )}




 


{dspDescription&&<ScrollView showsVerticalScrollIndicator={false}>



<View>
  <Text style={{fontWeight:'bold', fontSize:20,marginBottom:5}} >50TH Geration</Text>

  <View style={{flexDirection:'row', justifyContent:'space-between'}} >

    <View  style={{flexDirection:'row',alignItems:'center'}}>

      <EvilIcons name="location" size={25} color="black" style={{marginRight:10}} />
      <Text>Borrowdale</Text>
    </View>

    <Text style={{color:'red',fontSize:16 , fontWeight:'bold'}}>$5</Text>
  </View>
</View>

<View  style={{borderWidth:1 , borderColor:'black', borderRadius:18, height:35,marginTop:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingLeft:15 , paddingRight:15}} >


<View style={{flexDirection:'row',alignItems:'center'}}>

<Feather name="calendar" size={15} color="black" style={{marginRight:10}} />

  <Text style={{borderRightWidth:1 , borderRightColor:'black',width:150 , fontSize:16,fontWeight:'bold'}} >
    March 30 2025
    </Text>
</View>

<View style={{flexDirection:'row',alignItems:'center'}}>

<Feather name="clock" size={15} color="black" style={{marginRight:10}} />
  <Text style={{fontSize:15,fontWeight:'bold'}}>
    2 Pm
    </Text>
</View>

</View>







  {/* Buttons */}
  <View style={{marginTop:12,marginBottom:10}}> 

  <View style={{ flexDirection:'row',justifyContent:"space-evenly"}}>
    <TouchableOpacity onPress={toggleDspDescrip} >
      <Text style={  (!dspActivities && !dspParticipants && !entertainers) ? { color: "#C71F37",textDecorationLine: "underline",textDecorationColor: "#6a0c0c",} :{fontSize: 16,
    fontWeight: "500",color: "#333",} } >Description</Text>
    </TouchableOpacity>
    <TouchableOpacity  onPress={toggleEnter} >
      <Text style={ entertainers? { color: "#C71F37",textDecorationLine: "underline",textDecorationColor: "#6a0c0c",} :{fontSize: 16,
    fontWeight: "500",color: "#333",} }>Entertainers</Text>
    </TouchableOpacity>

  </View>
  
  <View style={{flexDirection:'row',justifyContent:'space-around'}} >

    <TouchableOpacity  onPress={toggleDspPartic}>
      <Text style={ dspParticipants ?{ color: "#C71F37",textDecorationLine: "underline",textDecorationColor: "#6a0c0c",} :{fontSize: 16,
    fontWeight: "500",color: "#333",}}>Participants</Text>
    </TouchableOpacity>

    <TouchableOpacity  onPress={toggleActivities}>
      <Text style={ dspActivities? { color: "#C71F37",textDecorationLine: "underline",textDecorationColor: "#6a0c0c",} :{fontSize: 16,
    fontWeight: "500",color: "#333",} }>Activities</Text>
    </TouchableOpacity>
  </View>

  </View>

 
{!dspActivities && !dspParticipants && !entertainers && <View style={styles.section}>
  <Text style={styles.sectionTitle} >Event descrip</Text>
  <Text style={{ padding: 10, lineHeight: 22, textAlign: "justify" }}>
  kjasdh asjhd asdjha sdh asdhweu asdha sdhj lahsdahsdl dfss sdf sdf sdf sdf sdf sd sdfsdf sdfsdf asjdh
</Text>

</View>}


  
{(dspActivities || dspParticipants || entertainers) && <View style={styles.container}>
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
      <Text style={styles.detailText}>Burnouts</Text>
      <Text style={styles.detailText}>Exhibitions</Text>
      <Text style={styles.detailText}>Static Car Displays</Text>
      <Text style={styles.detailText}>Bikers</Text>
      <Text style={styles.detailText}>Live Music, DJ Concession, Food & Drinks, Fireworks</Text>
    </View>
  )}
</View>}



 {/* Sponsors */}
  <View style={{ marginTop:10 }}>
    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>Sponsors</Text>
    
    <View style={styles.textRow} >
      <Text  style >SOLATEX</Text>
      <Text style={{fontStyle:'italic'}} >AUTO UIP</Text>
      <Text style={{fontStyle:'italic'}} >TRANSIX</Text>
      <Text style={{fontStyle:'italic'}} >PROTON</Text>
      <Text style={{fontStyle:'italic'}} >Schweppes</Text>
      <Text style={{fontStyle:'italic'}} >AHOGANT</Text>
      <Text style={{fontStyle:'italic'}} >AHOGANT</Text>
      <Text style={{fontStyle:'italic'}} >AHOGANT</Text>
      <Text style={{fontStyle:'italic'}} >BAVARIAN</Text>
    </View>

  </View>

 <View style={styles.sponsorshipSection}>
  <Text style={styles.sectionTitle}>Sponsorship / Partnership</Text>

  <View style={styles.contactInfo}>
    <TouchableOpacity style={styles.contactItem}>
      <Text style={styles.contactText}>263787884434</Text>
    </TouchableOpacity>
    <Text style={styles.separator}>/</Text>
    <TouchableOpacity style={styles.contactItem}>
      <Text style={styles.contactText}>kelvinyaya8@gmail.com</Text>
    </TouchableOpacity>
  </View>
</View>
  <View style={{height:600}}>

  </View>
</ScrollView>}


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
  },

   ticketContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    padding: 7,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ticketText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  buyButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    fontWeight: 'bold',
  },
  buyButtonRed: {
    backgroundColor: '#ff5c5c',
  },
  buyButtonBlue: {
    backgroundColor: '#5c8cff',
  },
  checkoutButton: {
    backgroundColor: '#ff5c5c',
    marginTop: 15,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  checkoutButtonBlue: {
    backgroundColor: '#5c8cff',
  },
  sponsorshipSection: {
    alignSelf: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactItem: {
    marginHorizontal: 3,
  },
  contactText: {
    fontStyle: 'italic',
    color: '#555',
  },
  separator: {
    marginHorizontal: 5,
    color: '#555',
  },
  
});