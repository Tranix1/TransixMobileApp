import React, { useEffect, useState} from 'react';
import { View , Text , ScrollView, TouchableOpacity , ActivityIndicator , StyleSheet , Linking, Alert , TextInput , Share} from "react-native"
import { auth, db } from '../config/fireBase';
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';
import inputstyles from '../styles/inputElement';

import { useNavigation , usePaeams } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
// import {useNavigate,useParams} from 'react-router-dom';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// import route from "expo-router"

function DspAllLoads({username ,route, contactG  , sendPushNotification ,userIsVerified,blockVerifiedU ,blackLWarning }){
  
const {userId ,  location ,itemKey, verfiedLoads,companyNameG ,blockVerifiedUP  , blackLWarningP } = route.params

// const navigate = useNavigate()

const navigation = useNavigation();
// const {messageData ,username } = route.params
  

  const deleteLoad = async (id) => {
  try {
    const loadsDocRef = doc(db, 'Loads', id);
    await deleteDoc(loadsDocRef);
    // Remove the deleted item from loadsList
    setLoadsList((prevLoadsList) => prevLoadsList.filter(item => item.id !== id));
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};



  const [localLoads , setLocalLoads]=React.useState(false)

  function toggleLocalLoads(){
    setLocalLoads(prevState => !prevState)
  }


  function specifyLocation(loc){
     navigation.navigate('selectedUserLoads' , {location : loc})  
    setLocalLoads(prev => false)
  }

  
  const [loadsList, setLoadsList] = useState([]);
  
  const [getOneLoad, setgetOneLoad] = useState([]);

    function getOneItemF(){

        const dataQuery = query(collection(db, "Loads"), where("timeStamp", "==", itemKey) , where("userId", "==", userId) );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          let loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          setgetOneLoad(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();


    }



     const checkAndDeleteExpiredItems = () => {
  loadsList.forEach((item) => {
    const deletionTime = item.deletionTime;
    const timeRemaining = deletionTime - Date.now();
    if (timeRemaining <= 0) {
      deleteLoad(item.id);
    } else {
      setTimeout(() => {
        deleteLoad(item.id);
      }, timeRemaining); // This might not work as expected
    }
  });
};
setTimeout(() => {
  checkAndDeleteExpiredItems();
}, 1000);
    


  const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)

async function loadedData(loadMore) {

  try{
      loadMore ? setLoadMoreData(true) : null;

    const orderByF = "timeStamp";
    const orderByField = orderBy(orderByF, 'desc'); // Order by timestamp in descending order

    const pagination = loadMore && loadsList.length > 0 ? [startAfter(loadsList[loadsList.length - 1][orderByF])] : [];
         let dataQuery
      if (userId && itemKey ) {
         dataQuery = query(collection(db, "Loads"),  where("userId", "==", userId) ,orderByField, ...pagination, limit(15) , where("timeStamp", "!=", itemKey)  );

      }else if(userId){

         dataQuery = query(collection(db, "Loads"),  where("userId", "==", userId) ,orderByField, ...pagination, limit(15)  );
      }else if(location){
         dataQuery = query(collection(db, "Loads"), where("location", "==", location)  ,orderByField, ...pagination, limit(15));

      } else if(verfiedLoads){
         dataQuery = query(collection(db, "Loads"), where("isVerified", "==", true)  ,orderByField, ...pagination, limit(15));
      } else{
         dataQuery = query(collection(db, "Loads"), orderByField, ...pagination, limit(15) );

      }
    
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
    setLoadsList(loadMore ? [  ...loadsList , ...loadedData] : loadedData);

    loadMore ? setLoadMoreData(false) : null;
    }catch(err){
      console.error(err)
    }
}
    
  


useEffect(() => {
  loadedData();
  if(itemKey){

    getOneItemF()
  }
}, []);;


     
    const [contactDisplay, setContactDisplay] = React.useState({ ['']: false });
    const toggleContact = (itemId) => {
      setContactDisplay((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
    };
    
    const [bidDisplay, setBidDisplay] = React.useState({ ['']: false });
    const toggleBid = (itemId) => {
      setBidDisplay((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
    };


    const [spinnerItem, setSpinnerItem] = React.useState(null);
    const [ bookingError , setBookingError] =React.useState("")
    const checkExistiDoc = async (docId) => {
    const chatsRef = collection(db, 'bookings'); // Reference to the 'ppleInTouch' collection
    const chatQuery = query(chatsRef, where('docId', '==',docId )); // Query for matching chat ID

      const querySnapshot = await getDocs(chatQuery);  
     // Check if any documents exist with the chat ID
      return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    };

    const checkExistixtBBDoc = async (receriverId) => {
    const chatsRef = collection(db, 'newIterms'); // Reference to the 'ppleInTouch' collection
    const chatQuery = query(chatsRef, where('receriverId', '==', receriverId)); // Query for matching chat ID

      const querySnapshot = await getDocs(chatQuery);  
     // Check if any documents exist with the chat ID
      return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    };
    

            const [currencyBid , setCurrencyBid] = React.useState(true)
          function toggleCurrencyBid(){
            setCurrencyBid(prev=>!prev)
          }

          const [perTonneBid , setPerTonneBid] = React.useState(false)
          function togglePerTonneBid(){
            setPerTonneBid(prev=>!prev)
          }

          const [bidRate, setBidRate] = React.useState("");
          const [bidLinks, setBidLinks] = React.useState("");
          const [bidTriaxle, setBdTriaxle] = React.useState("");

    
  const [dspMoreInfo , setDspMoreInfo] = React.useState({ ['']: false })
  function toggleDspMoreInfo(itemId){
          setDspMoreInfo((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
  }


let mapThsAll = [...getOneLoad , ...loadsList]


function replaceSpacesWithPercent(url) {
    return url.replace(/ /g, '%20');
}
      
    const rendereIterms =  mapThsAll.map((item)=>{ 




      
      const handleSubmit = async (clickedItem , dbName) => {

        setSpinnerItem(clickedItem);
        const bookingCollection = collection(db, `${dbName}`);
        const userId = auth.currentUser.uid
        try {



          
          let docId = `${userId}${item.typeofLoad}${theRate}${item.userId}`

          let existingChat 
            if(dbName === "bookings" ){

               existingChat = await checkExistiDoc(docId);
            }

           let theRate 
           let thelinksRate
           let thetriaxleRate
           let currencyB = false
           let perTonneB = false

              if(bidDisplay[item.id]){ 

              theRate= bidRate  
              thelinksRate = bidLinks
              thetriaxleRate = bidTriaxle
               currencyB = currencyBid  
               perTonneB = perTonneBid
              }else{

               currencyB = item.currency
                perTonneB = item.perTonne
                theRate = item.ratePerTonne
                thelinksRate = item.links
                thetriaxleRate= item.triaxle
              }
              let submitexpoPushToken = item.expoPushToken ? item.expoPushToken : null



          if(  !existingChat ){

        if(item.isVerified){
        setBidDisplay({ ['']: false });
        setBidRate("")
        setBidLinks("")
        setBdTriaxle("")
        setSpinnerItem(null)      
        navigation.navigate(`bbVerifiedLoad`, {        itemName : item.typeofLoad ,
        fromLocation : item.fromLocation ,
        toLocation : item.toLocation ,
        bookerId : userId ,
        bookerName : username ,
        ownerName: item.companyName ,
        ownerId : item.userId ,
        contact : contactG,
        Accept : null ,
        isVerified : item.isVerified ,
        msgReceiverId : userId ,
        docId : docId,
        rate :  theRate ,
        linksRate :   thelinksRate ,
        triaxleRate : thetriaxleRate ,
        currencyB : currencyB ,
        perTonneB : perTonneB ,
        loadId : item.id ,
        deletionTime :Date.now() + 4 * 24 * 60 * 60 * 1000 ,
        timestamp : serverTimestamp() ,
        dbName : dbName ,
        expoPushToken : submitexpoPushToken,
        sendPushNotification : sendPushNotification ,


      })
              return 
            }else{


      let theRateD

        if(theRate){
          theRateD = `Rate ${theRate} ${perTonneB ?"per tonne":''} `
        }
        else if(thelinksRate && thetriaxleRate){
          theRateD = `Links ${thelinksRate} Triaxle ${thetriaxleRate} ${perTonneB ?"per tonne":""} `
        }else if(thetriaxleRate){
          theRateD = `Triaxle ${thetriaxleRate} ${perTonneB ?"per tonne":""} `
        }else if(thelinksRate){
          theRateD = `Links ${thelinksRate} ${perTonneB ?"per tonne":""} `
        }
      

        let message  =`${item.typeofLoad} ${dbName === "bookings" ? "Booked" : "Bidded"} Rate ${theRateD} `
        let tittle = `From ${item.fromLocation} to ${item.toLocation} `
        if(item.expoPushToken){

          await sendPushNotification(item.expoPushToken, message , tittle,dbName );
        }

        
        const docRef = await addDoc(bookingCollection, {
        itemName : item.typeofLoad ,
        fromLocation : item.fromLocation ,
        toLocation : item.toLocation ,
        bookerId : userId ,
        bookerName : username ,
        ownerName: item.companyName ,
        ownerId : item.userId ,
        contact : contactG,
        Accept : null ,
        isVerified : item.isVerified ,
        msgReceiverId : userId ,
        docId : docId,
        rate :  theRate ,
        linksRate :   thelinksRate ,
        triaxleRate : thetriaxleRate ,
        currencyB : currencyB ,
        perTonneB : perTonneB ,
        loadId : item.id ,
        deletionTime :Date.now() + 5 * 24 * 60 * 60 * 1000 ,
        timestamp : serverTimestamp() ,
      }

      
      );
      
            }
      setBidRate("")
      setBidLinks("")
      setBdTriaxle("")
      setBidDisplay({ ['']: false });
      alert(`${!bidDisplay[item.id] ? "booking": "bidding"} was successfull`)    
        }else {
          alert(`Already ${!bidDisplay[item.id] ? "booked": "bidded"} this Item!`)    

        }
        
          const existingBBDoc = await checkExistixtBBDoc(userId);
        // const existingChat = await checkExistingChat(addChatId);
        let newBiddedDoc = 0
        let newBOOKEDDoc = 0

        dbName === "bookings" ? newBOOKEDDoc = 1  : newBiddedDoc = 1
      // Chat doesn't exist, add it to 'ppleInTouch'
      if(!existingBBDoc){
      await setDoc( doc(db , "newIterms", userId), {
        bookingdocs : newBOOKEDDoc ,
        biddingdocs : newBiddedDoc ,
        timestamp : serverTimestamp() ,
        receriverId : item.userId ,
      }); 
    }
    else{
       
       const docRef = doc(db, 'newIterms', userId);
       await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);

        if (docSnap.exists()) {
            const currentBiddingDocs = docSnap.data().biddingdocs || 0;

            const currentBookingsDocs = docSnap.data().bookingdocs || 0;
            let updatedBiddingDocs = currentBiddingDocs
            let updateBokingsDocs = currentBookingsDocs
            dbName !== "bookings" ?  updatedBiddingDocs = currentBiddingDocs + 1 : updateBokingsDocs = currentBookingsDocs + 1

            transaction.update(docRef, {
                biddingdocs : updatedBiddingDocs,
                bookingdocs :  updateBokingsDocs ,
            });
        }
    });
    }
      
      setSpinnerItem(null)      

    } catch (err) {
      setBookingError(err.toString());
      setSpinnerItem(null)      
    }
  };  

            let theRateM

        if(item.ratePerTonne){
          theRateM = `Rate ${item.ratePerTonne} ${item.perTonne ?"per tonne":''} `
        }else if(item.links && item.triaxle){
          theRateM = `Links ${item.links} Triaxle ${item.triaxle} ${item.perTonneB ?"per tonne":""} `
        }
        else if(item.triaxle){
          theRateM = `Triaxle ${item.triaxle} ${item.perTonneB ?"per tonne":""} `
        }else if(item.links){
          theRateM = `Links ${item.links} ${item.ratePerTonne ?"per tonne":""} `
        }

        const url = `https://transix.net/selectedUserLoads/${item.userId}/${item.companyName}/${item.deletionTime}` 
        const updatedUrl = replaceSpacesWithPercent(url);
        const message =  `${item.companyName}
        Is this Load still available
        ${item.typeofLoad} from ${item.fromLocation} to ${item.toLocation}
        ${theRateM}

        From: ${updatedUrl} `  // Set your desired message here

    let contactMe = ( <View style={{ paddingLeft: 30 }}>

            {auth.currentUser&&<TouchableOpacity   style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#008080" , borderWidth:1 , borderColor :'#008080', justifyContent:'center', marginBottom : 5 , marginTop:6}} >
            <Text style={{color:"#008080"}} >Message now</Text>
            <MaterialIcons name="chat" size={24} color="#008080" />

          </TouchableOpacity>}

            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#25D366" , borderWidth:1 , borderColor :'#25D366', justifyContent:'center', marginBottom:6}} >
            <Text style={{color : "#25D366"}} >WhatsApp </Text> 
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#0074D9" , borderWidth:1 , borderColor :'#0074D9', justifyContent:'center', marginBottom:4}} >
            <Text style={{color:'#0074D9'}} >Phone call</Text>
                <MaterialIcons name="call" size={24} color="#0074D9" />
          </TouchableOpacity>

          </View>)


      let bidNow = (
        <View style={{position:'absolute' , bottom:0, backgroundColor:'white',flex:1 ,padding:7 ,  width:360 ,alignItems:'center'}}>

    {spinnerItem === item ? (
        <ActivityIndicator size={34} />
      ) :    <View >

         {item.ratePerTonne &&  <View style={{flexDirection:'row', alignItems : 'center' ,}} >

        <TouchableOpacity onPress={toggleCurrencyBid}>
            {currencyBid ? <Text style={styles.buttonIsFalse} >USD</Text> :
            <Text style={styles.bttonIsTrue}>Rand </Text>}
          </TouchableOpacity>

        <TextInput
           onChangeText={(text) => setBidRate(text)}
            name="ratePerTonne"
            value={bidRate}
            keyboardType="numeric"
            placeholderTextColor="#6a0c0c"
            style={ {height : 30 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 ,padding:0, paddingLeft : 20 ,width : 180}}
            placeholder="Bid rate here"
          />
          <TouchableOpacity onPress={togglePerTonneBid} >
            {perTonneBid ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
              <Text style={styles.buttonIsFalse}>Per tonne</Text>}
          </TouchableOpacity>
          </View>}


          {item.links|| item.triaxle ?   <View>
                {item.links&& <View style={{flexDirection:'row', alignItems : 'center' ,}} >

        <TouchableOpacity onPress={toggleCurrencyBid}>
            {currencyBid ? <Text style={styles.buttonIsFalse} >USD</Text> :
            <Text style={styles.bttonIsTrue}>Rand </Text>}
          </TouchableOpacity>

        <TextInput
           onChangeText={(text) => setBidLinks (text)}
            name="ratePerTonne"
            value={bidLinks}
            keyboardType="numeric"
            placeholderTextColor="#6a0c0c"
            style={ {height : 30 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 ,padding:0, paddingLeft : 20 ,width : 180}}
            placeholder="Bid Links rate"
          />
          <TouchableOpacity onPress={togglePerTonneBid} >
            {perTonneBid ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
              <Text style={styles.buttonIsFalse}>Per tonne</Text>}
          </TouchableOpacity>
          </View>}
          


 { item.triaxle&& <View style={{flexDirection:'row', alignItems : 'center' ,}} >

        <TouchableOpacity onPress={toggleCurrencyBid}>
            {currencyBid ? <Text style={styles.buttonIsFalse} >USD</Text> :
            <Text style={styles.bttonIsTrue}>Rand </Text>}
          </TouchableOpacity>

        <TextInput
           onChangeText={(text) => setBdTriaxle(text)}
            name="ratePerTonne"
            value={bidTriaxle}
            keyboardType="numeric"
            placeholderTextColor="#6a0c0c"
            style={ {height : 30 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 ,padding:0, paddingLeft : 20 ,width : 180,marginTop:5}}
            placeholder="Bid triaxle rate"
          />
          <TouchableOpacity onPress={togglePerTonneBid} >
            {perTonneBid ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
              <Text style={styles.buttonIsFalse}>Per tonne</Text>}
          </TouchableOpacity>
          </View>}


            </View>:null}


   </View>}


          <View style={{flexDirection:'row' , justifyContent: 'space-evenly'}}>

            <TouchableOpacity onPress={()=>toggleBid(item.id) } style={{ backgroundColor:'#6a0c0c',padding:1 ,paddingLeft :7 , paddingRight:7 ,borderRadius:3,marginRight:12}} > 
              <Text style={{color:'white'}}>Cancel </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>handleSubmit(item , "biddings")} style={{ backgroundColor:'#228B22',padding:1 ,paddingLeft :7 , paddingRight:7 ,borderRadius:3}} >
              <Text style={{color:'white'}}> Send</Text>
            </TouchableOpacity>

          </View>

        </View>
      )



const getFirstLetter = (str) => str?.charAt(0) || '';

// Example usage
const myString = item.companyName;
const firstLetter = getFirstLetter(myString);



  return(
    <View  key={item.id} style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'black', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden', }} >

                          
              { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
                <MaterialIcons name="verified" size={26} color="green" />
              </View>}
        <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 21 , fontWeight:'600'}}  >{item.companyName} </Text>

       {<View style={{ flexDirection:'row',margin:4}} >

         {item.returnLoad &&  <View style={{backgroundColor :'#6a0c0c',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
          <Text style={{color :'white'}} >Return Load</Text>
          </View>}

         {item.roundTrip &&  <View style={{backgroundColor :'#6a0c0c',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
          <Text style={{color :'white'}} >Round Trip</Text>
          </View>}

         {item.fuelAvai &&  <View style={{backgroundColor :'#6a0c0c',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
          <Text style={{color :'white'}} >Fuel</Text>
          </View>}

      </View>}
      <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100}} >Commodity</Text>
        <Text  style={{textOverflow:'ellipsis' }} >:  {item.typeofLoad} </Text>
      </View>

      <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100}} >Route</Text>
        <Text style={{textOverflow:'ellipsis' }} >:  from  {item.fromLocation}  to  {item.toLocation} </Text>
      </View>

      {!item.links && !item.triaxle && <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100,color:'green',fontWeight:'bold',fontSize:16}} >Rate</Text>
        <Text  style={{color:'green',fontWeight:'bold',fontSize:16}} >:  {item.currency ? "USD" : "RAND"} {item.ratePerTonne} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}

       {item.links&&  <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100,color:'green',fontWeight:'bold',fontSize:16}} >Links</Text>
        <Text style={{color:'green',fontWeight:'bold',fontSize:16}} >:  {item.currency ? "USD" : "RAND"} {item.links} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}

       {item.triaxle&& <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100,color:'green',fontWeight:'bold',fontSize:16}} >Triaxle</Text>
        <Text style={{color:'green',fontWeight:'bold',fontSize:16}} >:  {item.currency ? "USD" : "RAND"} {item.triaxle} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}

       {   !contactDisplay[item.id] && <View>

     {!item.isVerified&&  !blockVerifiedU &&!blackLWarning &&  !blockVerifiedUP  && !blackLWarningP && <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100}} >Contact</Text>
      {!item.isVerified&&  <Text style={{textOverflow:'ellipsis' }} >:  {item.contact}</Text>}
      </View>}

      <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width:100}} >Payment Terms</Text>
        <Text  style={{textOverflow:'ellipsis' }} >: {item.paymentTerms}</Text>
      </View>

        { item.requirements&&<View style={{flexDirection :'row', width:245 }} >
        <Text style={{width:100}} >Requirements</Text>
        <Text  style={{textOverflow:'ellipsis' }} >: { item.requirements}</Text>
      </View>}
        {item.activeLoading&& <Text style={{fontSize:17 , color:"#FF8C00" }} >Active Loading.... </Text> }
     { dspMoreInfo[item.id] &&<View>
    {  item.fuelAvai && <View style={{flexDirection :'row' ,marginTop:5, width:245 }} >
        <Text style={{width:100}} >Fuel </Text>
         <Text style={{textOverflow:'ellipsis' }}  >:  {item.fuelAvai} </Text>
      </View>}
      { item.additionalInfo && <View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100}} >Additional info </Text>
       {<Text style={{textOverflow:'ellipsis' }} >:  {item.additionalInfo} </Text>} 
      </View>}


    {  item.alertMsg && <View style={{flexDirection :'row',marginTop:5, width:245 }} >
        <Text style={{width :100 ,backgroundColor:'rgba(220, 20, 60, 0.8)',color:'white' ,textAlign:'center',fontSize:15}} >Alert</Text>
         <Text style={{paddingRight:7 ,backgroundColor:'rgba(220, 20, 60, 0.8)',color:'white' ,fontSize:15,textOverflow:'ellipsis' }} >:  {item.alertMsg} </Text>
      </View>}

      {item.returnLoad && <View style={{marginTop:5, width:245 }} >
        <Text style={{alignSelf:'center',color:"rgba(220, 20, 60, 0.8)",fontSize:16 ,margin:3}} >Return Load</Text>
          { item.returnLoad &&<View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >R Cargo</Text>
       {<Text style={{textOverflow:'ellipsis' }} >:  {item.returnLoad} </Text>} 
      </View>}
          { item.returnRate &&<View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100}} >R Rate</Text>
       {<Text style={{textOverflow:'ellipsis' }} >:  {item.returnRate} </Text>} 
      </View>}
          { item.returnTerms &&<View style={{flexDirection :'row', width:245 }} >
        <Text style={{width :100}} >R Terms</Text>
       {<Text style={{textOverflow:'ellipsis' }} >:  {item.returnTerms} </Text>} 
      </View>}
      </View>}
 </View>}


         {!contactDisplay[item.id] && <TouchableOpacity onPress={()=>toggleDspMoreInfo(item.id) } >
          <Text style={{color :'green',fontWeight:'bold',fontSize:16}} >{  dspMoreInfo[item.id]  ?"See Less": "See more"} </Text>
        </TouchableOpacity>}
        </View> }


        {contactDisplay[item.id] && contactMe}

         {bidDisplay[item.id]&& bidNow}

<View style={{flexDirection:'row' , justifyContent:'space-around'}}>

        {!blockVerifiedUP  && !blackLWarningP && !blockVerifiedU &&!blackLWarning && !item.isVerified&& !bidDisplay[item.id]&&  <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{  width : 120 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, margin:5 }} >
          <Text style={{color:'white'}} > Get In Touch Now</Text>
        </TouchableOpacity>}
        <TouchableOpacity onPress={()=> navigation.navigate('selectedUserLoads', {userId : item.userId , companyNameG : item.companyName }) }   style={{  width : 120 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8,  margin:5 }} >
          <Text style={{color:'white'}}>All {firstLetter}  Loads </Text>
        </TouchableOpacity>
        
</View>



       {  auth.currentUser  ? !bidDisplay[item.id]&& !contactDisplay[item.id]  && !blockVerifiedUP  && !blackLWarningP &&!blockVerifiedU &&!blackLWarning &&<View style={{flexDirection : 'row', justifyContent : 'space-evenly' }} >  
      {bookingError&&<Text>{bookingError}</Text>}
          {spinnerItem === item ? (
        <ActivityIndicator size={34} />
      ) : (
        <TouchableOpacity style={{ width : 90 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#6a0c0c' ,  borderRadius: 8, alignSelf:'center', margin:5 }} onPress={() => handleSubmit(item , "bookings")}>
          <Text style={{color:'white'}} >Book</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={()=>toggleBid(item.id) } style={{ width : 90 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#6a0c0c' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
        <Text style={{color:'white'}} >Bid</Text>
      </TouchableOpacity>

        <TouchableOpacity   style={{ width : 90 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#6a0c0c' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
          <Text style={{color:'white'}} >Message</Text>
        </TouchableOpacity>       
        </View> : 
        <Text style={{color:'red'}}> Sign In to Book Bid and Message </Text>
        }

      </View>     
  )})


  
  
 

    const handleShareApp = async (companyName) => {
              try {
                const message = `I invite you to Transix!

Transix is a tech-driven business enhancing transportation and logistics services, connecting suppliers with demand for truckloads, vehicles, trailers, spare parts etc.

Contact us at +263716325160 with the message "Application" to swiftly receive the application download link.

Explore Application at : https://play.google.com/store/apps/details?id=com.yayapana.Transix
Explore website at : https://transix.net/

Experience the future of transportation and logistics!  `;

                const result = await Share.share({
                  message: message,
                });

                if (result) {
                  if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                      // Shared with activity type of result.activityType
                    } else {
                      // Shared
                    }
                  } else if (result.action === Share.dismissedAction) {
                    // Dismissed
                  }
                } else {
                  // Handle the case where result is undefined or null
                }
              } catch (error) {
                alert(error.message);
              }
            };
    

  return(
    <View>
              
      { userId && <View  style={{flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center'}} >
      
                <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()} >
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
       
                <Text style={{fontSize: 20 , color : 'white'}} > {companyNameG } Loads </Text>

                       </View> }
       


      { location || verfiedLoads ? <View  style={{flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center'}} >
         <TouchableOpacity style={{marginRight: 10}}  onPress={()=>navigation.goBack(  )}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        <Text style={{fontSize: 20 , color : 'white'}} > {location?location:"verfied"  } Loads</Text>
       </View>:null}
       

   {!localLoads &&  <ScrollView style={{padding : 10 , marginTop : 10 , paddingTop : 0}} >
   {!location && !verfiedLoads && <View style={{flexDirection : 'row' , justifyContent : 'space-evenly' }} >
    <TouchableOpacity onPress={toggleLocalLoads} style={styles.buttonStyle} >
      <Text style={{color:'white'}} > Local </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.buttonStyle} onPress={()=> specifyLocation(`International`) }>
      <Text style={{color:'white'}} >International  </Text>
    </TouchableOpacity>

    {userIsVerified && <TouchableOpacity style={styles.buttonStyle} onPress={ ()=>navigation.navigate('selectedUserLoads' , {verfiedLoads : true})  }>
      <Text style={{color:'white'}} >Verified</Text>
    </TouchableOpacity>}
    </View>
}

        {!dspLoadMoreBtn && loadsList.length <= 0 && location&&<Text style={{fontSize:19 ,fontWeight:'bold'}} >{location} Do Not Have Local loads </Text> }
       {!dspLoadMoreBtn && loadsList.length <= 0  && location &&<TouchableOpacity onPress={handleShareApp} >
         <Text style={{fontSize : 20 , textDecorationLine:'underline'}} >Please share or recommend our app for more loads</Text>
       </TouchableOpacity>}

       

        { loadsList.length>0? rendereIterms: <Text>Loads Loading.....</Text> }


          {LoadMoreData && loadsList.length>0 && <Text style={{alignSelf:'center'}} >Loading More Loads....... </Text> } 
          
         {loadsList.length>15 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> loadedData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}
        <View style={{height : 1000}} ></View>
    </ScrollView> }

       {localLoads && <View style={{alignItems : 'center' , paddingTop : 30}}>
        <TouchableOpacity  onPress={()=>specifyLocation('Zimbabwe')} style={styles.buttonStyleCounry}  >
          <Text style={{color:'#6a0c0c'}}>Zimbabwe </Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={()=> specifyLocation('SouthAfrica') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Namibia') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Tanzania') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>specifyLocation ('Mozambique') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Zambia') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Botswana') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Malawi') }style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Malawi </Text>
        </TouchableOpacity>
       </View> }

       
    </View>
  )

}
export default React.memo( DspAllLoads)

const styles = StyleSheet.create({
    buttonStyle : {
        height : 30,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        // paddingLeft : 10,
        // paddingRight : 10 ,
        width : 100 ,
        marginBottom: 10 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10,
        backgroundColor:'#228B22' 
    } ,
    buttonStyleCounry :{
        height : 40,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderWidth:2 ,
        borderColor:"#6a0c0c",
        borderRadius:10
    },
  
    buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
    //  marginLeft : 6
   } , 
    bttonIsTrue:{
    backgroundColor : '#6a0c0c' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' 

    }
});