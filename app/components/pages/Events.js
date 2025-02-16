import React ,{useEffect} from "react";
import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image } from "react-native";
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
    
  
console.log(getEvent)

useEffect(() => {
  loadedData();
  
}, []);

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

                <TouchableOpacity onPress={handlePurchase} key={item.id} style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'black', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden', margin:10}} >
                  <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 21 , fontWeight:'600'}} >SELECKTA</Text>
                  <Text style={{color:'green' , fontSize:15,textAlign :'center' ,fontSize: 13 , fontWeight:'600'}} >Click to Buy</Text>
                  <Text>Location : sadljlsajd</Text>
                  <Text>eventDate : asdasd</Text>
                  <Text>Starthing eventTime : asdasdas</Text>
                  <Text>eventName </Text>
                  <Text>Brief description</Text>
                  <Text>Spornership Info</Text>
                </TouchableOpacity>

  )
  })



 return(
    <View style={{paddingTop:100}} >

       <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > {!selectedEvent ? "Events" : selectedEvent}  </Text>
       </View>


      {dspSelEvent && <View style={{alignSelf:'center'}}>

        <TouchableOpacity onPress={()=>moveToEventsPage("Burn Outs")} style={styles.sEventButtonStyle} >
          <Text style={{textAlign:'center'}} >Burn outs</Text>
        </TouchableOpacity>
         <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Car show</Text>
        </TouchableOpacity>

          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Logistics confrences</Text>
        </TouchableOpacity>

          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Trasport expos</Text>
        </TouchableOpacity>

        <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Fleet seminars</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sEventButtonStyle}>
          <Text>Drift Competion</Text>
        </TouchableOpacity>
  
  <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Car show</Text>
        </TouchableOpacity>

  <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Drag Races</Text>
        </TouchableOpacity>
          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Drift competition</Text>
        </TouchableOpacity>
          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Monster truck shows </Text>
        </TouchableOpacity>
          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Truck Pulls </Text>
        </TouchableOpacity>
  <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>stunt pulls</Text>
        </TouchableOpacity>
          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Racing tournaments</Text>
        </TouchableOpacity>
          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Demolition derbies</Text>
        </TouchableOpacity>
          <TouchableOpacity  style={styles.sEventButtonStyle}>
          <Text>Rally cross events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sEventButtonStyle}>
          <Text>Drag Race</Text>
        </TouchableOpacity>

      </View>}

        {selectedEvent &&  rendereIterms  }

        
    </View>
 )   
}
export default React.memo(Events)

const styles = StyleSheet.create({
    sEventButtonStyle : {
        height : 60,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 200 ,
        marginBottom: 15 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 3
    } ,
  
});