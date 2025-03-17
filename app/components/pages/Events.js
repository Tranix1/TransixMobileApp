import React ,{useEffect} from "react";
import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image , ScrollView } from "react-native";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';
import { db, auth } from "../config/fireBase";

import { Ionicons } from "@expo/vector-icons";
import {v4 as uuidv4} from "react-native-uuid"



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



     let rendereIterms = getEvent.map((item)=>{
    
  async function handlePurchase(){

      navigation.navigate("viewEvent")
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
      

    }

      setSpinnerItem(false)
   
    } catch (err) {
      setSpinnerItem(false)
      console.error(err.toString());
      }
  }

  return(
    <View key={item.id} style={{flexDirection:'row',marginLeft:10 , marginRight: 10}}   >
  
       <Image source={{uri: "https://firebasestorage.googleapis.com/v0/b/truckers-cace6.appspot.com/o/Trucks%2F1741522836736?alt=media&token=5ed6d0b6-0c85-4264-8237-d91fb385633f" 
}}   style={{  height : 125 , borderRadius: 10, width:120, alignSelf:'center' }} /> 
        
<View style={{marginLeft:10}}>
  <Text style={{fontWeight:'bold', fontSize:25 }}>Scotts Maphuma</Text>
  <Text style={{fontSize:17}}>Jan 10 2025 12 00</Text>
  <Text style={{fontWeight:'bold'}}>ZKS Arena Bulawayo</Text>
  <TouchableOpacity style={{height:30 , width:100 , backgroundColor:'red', justifyContent:'center' ,alignItems:'center', borderRadius:6, marginTop:12}}  
  onPress={()=>navigation.navigate("viewEvent",{ eventName : item.eventName , ticketType: item.ticketType ,earlyBPrice : item.earlyBPrice ,ordiPrice : item.ordiPrice  ,vipPrice : item.vipPrice , vvipPrice : item.vvipPrice })} >
    <Text style={{color:'white'}}>View Event</Text>
  </TouchableOpacity>




</View>




</View>

  )
  })

// Proof of bank account in the name of the company e.g. stamped Bank Statement or letter from the bank which lists bank account number



 return(
    <View style={{paddingTop:80}} >

       <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > {!selectedEvent ? "Events" : `${selectedEvent}`}  </Text>
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