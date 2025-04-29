import React, { useEffect, useState} from 'react';
import { View  , ScrollView, TouchableOpacity , ActivityIndicator , StyleSheet , Linking, Alert , TextInput , Share} from "react-native"
import { auth, db } from '../../components/config/fireBase';
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';

import { useNavigation , } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
// import {useNavigate,useParams} from 'react-router-dom';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { fetchDocuments } from '@/db/operations';
import { Load } from '@/types/types';


import { ThemedText } from '@/components/ThemedText';
// import route from "expo-router"

function DspAllLoads(){
  

// const navigate = useNavigate()

const navigation = useNavigation();
// const {messageData ,username } = route.params
  

//   const deleteLoad = async (id) => {
//   try {
//     const loadsDocRef = doc(db, 'Loads', id);
//     await deleteDoc(loadsDocRef);
//     // Remove the deleted item from loadsList
//     setLoadsList((prevLoadsList) => prevLoadsList.filter(item => item.id !== id));
//   } catch (error) {
//     console.error('Error deleting item:', error);
//   }
// };



  const [localLoads , setLocalLoads]=React.useState(false)

  function toggleLocalLoads(){
    setLocalLoads(prevState => !prevState)
  }


  function specifyLocation(){
    //  navigation.navigate('selectedUserLoads' , {location : loc})  
    setLocalLoads(prev => false)
  }

  
  const [loadsList, setLoadsList] = useState<Load[] |[]>([]);
  
  const [getOneLoad, setgetOneLoad] = useState([]);

    // function getOneItemF(){

    //     const dataQuery = query(collection(db, "Loads"), where("timeStamp", "==", itemKey) , where("userId", "==", userId) );

    //     const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
    //       let loadedData = [];
    //       snapshot.docChanges().forEach((change) => {
    //         if (change.type === 'added' || change.type === 'modified') {
    //           const dataWithId = { id: change.doc.id, ...change.doc.data() };
    //           loadedData.push(dataWithId);
    //         }
    //       });

    //       setgetOneLoad(loadedData);
    //     });
        
    //     // Clean up function to unsubscribe from the listener when the component unmounts
    //     return () => unsubscribe();


    // }



//      const checkAndDeleteExpiredItems = () => {
//   loadsList.forEach((item) => {
//     const deletionTime = item.deletionTime;
//     const timeRemaining = deletionTime - Date.now();
//     if (timeRemaining <= 0) {
//       deleteLoad(item.id);
//     } else {
//       setTimeout(() => {
//         deleteLoad(item.id);
//       }, timeRemaining); // This might not work as expected
//     }
//   });
// };
// setTimeout(() => {
//   checkAndDeleteExpiredItems();
// }, 1000);
    


  const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)

   useEffect(() => {
        LoadTructs();
    }, [])

    const LoadTructs = async () => {

        const maTrucks = await fetchDocuments("Loads");
        if (maTrucks) {

            setLoadsList(maTrucks as Load[])
        }

    }
console.log(loadsList)

    
  





     
    interface DisplayStateID {
      [itemId: string]: boolean;
    }

    const [contactDisplay, setContactDisplay] = useState<DisplayStateID>({ '': false });

    const toggleContact = (itemId: string) => {
      setContactDisplay((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
    };
    
    const [bidDisplay, setBidDisplay] = React.useState<DisplayStateID>({ ['']: false });
    const toggleBid = (itemId:string) => {
      setBidDisplay((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
    };


    const [spinnerItem, setSpinnerItem] = React.useState(null);
    const [ bookingError , setBookingError] =React.useState("")
    // const checkExistiDoc = async (docId) => {
    // const chatsRef = collection(db, 'bookings'); // Reference to the 'ppleInTouch' collection
    // const chatQuery = query(chatsRef, where('docId', '==',docId )); // Query for matching chat ID

    //   const querySnapshot = await getDocs(chatQuery);  
    //  // Check if any documents exist with the chat ID
    //   return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    // };

    // const checkExistixtBBDoc = async (receriverId) => {
    // const chatsRef = collection(db, 'newIterms'); // Reference to the 'ppleInTouch' collection
    // const chatQuery = query(chatsRef, where('receriverId', '==', receriverId)); // Query for matching chat ID

    //   const querySnapshot = await getDocs(chatQuery);  
    //  // Check if any documents exist with the chat ID
    //   return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    // };
    

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


// let mapThsAll = [...getOneLoad , ...loadsList]

// This is used to fi the url when to send it to person sson to remove spaces
function replaceSpacesWithPercent(url:string) {
    return url.replace(/ /g, '%20');
}
      
    const rendereIterms =  loadsList.map((item)=>{ 

console.log(item.companyName +"papapap")


      
//       const handleSubmit = async (clickedItem , dbName) => {

//         setSpinnerItem(clickedItem);
//         const bookingCollection = collection(db, `${dbName}`);
//         const userId = auth.currentUser.uid
//         try {



          
//           let docId = `${userId}${item.typeofLoad}${theRate}${item.userId}`

//           let existingChat 
//             if(dbName === "bookings" ){

//                existingChat = await checkExistiDoc(docId);
//             }

//            let theRate 
//            let thelinksRate
//            let thetriaxleRate
//            let currencyB = false
//            let perTonneB = false

//               if(bidDisplay[item.id]){ 

//               theRate= bidRate  
//               thelinksRate = bidLinks
//               thetriaxleRate = bidTriaxle
//                currencyB = currencyBid  
//                perTonneB = perTonneBid
//               }else{

//                currencyB = item.currency
//                 perTonneB = item.perTonne
//                 theRate = item.ratePerTonne
//                 thelinksRate = item.links
//                 thetriaxleRate= item.triaxle
//               }
//               let submitexpoPushToken = item.expoPushToken ? item.expoPushToken : null



//           if(  !existingChat ){

//         if(item.isVerified){
//         setBidDisplay({ ['']: false });
//         setBidRate("")
//         setBidLinks("")
//         setBdTriaxle("")
//         setSpinnerItem(null)      
//         navigation.navigate(`bbVerifiedLoad`, {        itemName : item.typeofLoad ,
//         fromLocation : item.fromLocation ,
//         toLocation : item.toLocation ,
//         bookerId : userId ,
//         bookerName : username ,
//         ownerName: item.companyName ,
//         ownerId : item.userId ,
//         contact : contactG,
//         Accept : null ,
//         isVerified : item.isVerified ,
//         msgReceiverId : userId ,
//         docId : docId,
//         rate :  theRate ,
//         linksRate :   thelinksRate ,
//         triaxleRate : thetriaxleRate ,
//         currencyB : currencyB ,
//         perTonneB : perTonneB ,
//         loadId : item.id ,
//         deletionTime :Date.now() + 4 * 24 * 60 * 60 * 1000 ,
//         timestamp : serverTimestamp() ,
//         dbName : dbName ,
//         expoPushToken : submitexpoPushToken,
//         sendPushNotification : sendPushNotification ,


//       })
//               return 
//             }else{


//       let theRateD

//         if(theRate){
//           theRateD = `Rate ${theRate} ${perTonneB ?"per tonne":''} `
//         }
//         else if(thelinksRate && thetriaxleRate){
//           theRateD = `Links ${thelinksRate} Triaxle ${thetriaxleRate} ${perTonneB ?"per tonne":""} `
//         }else if(thetriaxleRate){
//           theRateD = `Triaxle ${thetriaxleRate} ${perTonneB ?"per tonne":""} `
//         }else if(thelinksRate){
//           theRateD = `Links ${thelinksRate} ${perTonneB ?"per tonne":""} `
//         }
      

//         let message  =`${item.typeofLoad} ${dbName === "bookings" ? "Booked" : "Bidded"} Rate ${theRateD} `
//         let tittle = `From ${item.fromLocation} to ${item.toLocation} `
//         if(item.expoPushToken){

//           await sendPushNotification(item.expoPushToken, message , tittle,dbName );
//         }

        
//         const docRef = await addDoc(bookingCollection, {
//         itemName : item.typeofLoad ,
//         fromLocation : item.fromLocation ,
//         toLocation : item.toLocation ,
//         bookerId : userId ,
//         bookerName : username ,
//         ownerName: item.companyName ,
//         ownerId : item.userId ,
//         contact : contactG,
//         Accept : null ,
//         isVerified : item.isVerified ,
//         msgReceiverId : userId ,
//         docId : docId,
//         rate :  theRate ,
//         linksRate :   thelinksRate ,
//         triaxleRate : thetriaxleRate ,
//         currencyB : currencyB ,
//         perTonneB : perTonneB ,
//         loadId : item.id ,
//         deletionTime :Date.now() + 5 * 24 * 60 * 60 * 1000 ,
//         timestamp : serverTimestamp() ,
//       }

      
//       );
      
//             }
//       setBidRate("")
//       setBidLinks("")
//       setBdTriaxle("")
//       setBidDisplay({ ['']: false });
//       alert(`${!bidDisplay[item.id] ? "booking": "bidding"} was successfull`)    
//         }else {
//           alert(`Already ${!bidDisplay[item.id] ? "booked": "bidded"} this Item!`)    

//         }
        
//           const existingBBDoc = await checkExistixtBBDoc(userId);
//         // const existingChat = await checkExistingChat(addChatId);
//         let newBiddedDoc = 0
//         let newBOOKEDDoc = 0

//         dbName === "bookings" ? newBOOKEDDoc = 1  : newBiddedDoc = 1
//       // Chat doesn't exist, add it to 'ppleInTouch'
//       if(!existingBBDoc){
//       await setDoc( doc(db , "newIterms", userId), {
//         bookingdocs : newBOOKEDDoc ,
//         biddingdocs : newBiddedDoc ,
//         timestamp : serverTimestamp() ,
//         receriverId : item.userId ,
//       }); 
//     }
//     else{
       
//        const docRef = doc(db, 'newIterms', userId);
//        await runTransaction(db, async (transaction) => {
//         const docSnap = await transaction.get(docRef);

//         if (docSnap.exists()) {
//             const currentBiddingDocs = docSnap.data().biddingdocs || 0;

//             const currentBookingsDocs = docSnap.data().bookingdocs || 0;
//             let updatedBiddingDocs = currentBiddingDocs
//             let updateBokingsDocs = currentBookingsDocs
//             dbName !== "bookings" ?  updatedBiddingDocs = currentBiddingDocs + 1 : updateBokingsDocs = currentBookingsDocs + 1

//             transaction.update(docRef, {
//                 biddingdocs : updatedBiddingDocs,
//                 bookingdocs :  updateBokingsDocs ,
//             });
//         }
//     });
//     }
      
//       setSpinnerItem(null)      

//     } catch (err) {
//       setBookingError(err.toString());
//       setSpinnerItem(null)      
//     }
//   };  




            let theRateM

        if(item.ratePerTonne){
          theRateM = `Rate ${item.ratePerTonne} ${item.perTonne ?"per tonne":''} `
        }else if(item.links && item.triaxle){
          theRateM = `Links ${item.links} Triaxle ${item.triaxle} ${item.ratePerTonne ?"per tonne":""} `
        }
        else if(item.triaxle){
          theRateM = `Triaxle ${item.triaxle} ${item.ratePerTonne ?"per tonne":""} `
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

            {auth.currentUser&&<TouchableOpacity   style={{height : 30 ,  flexDirection:'row', alignItems :'center',borderWidth:1 , borderColor :'#008080', justifyContent:'center', marginBottom : 5 , marginTop:6}} >
            <ThemedText style={{color:"#008080"}} >Message now</ThemedText>
            <MaterialIcons name="chat" size={24} color="#008080" />

          </TouchableOpacity>}

            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center', borderWidth:1 , borderColor :'#25D366', justifyContent:'center', marginBottom:6}} >
            <ThemedText style={{color : "#25D366"}} >WhatsApp </ThemedText> 
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center', borderWidth:1 , borderColor :'#0074D9', justifyContent:'center', marginBottom:4}} >
            <ThemedText style={{color:'#0074D9'}} >Phone call</ThemedText>
                <MaterialIcons name="call" size={24} color="#0074D9" />
          </TouchableOpacity>

          </View>)


//       let bidNow = (
//         <View style={{position:'absolute' , bottom:0, backgroundColor:'white',flex:1 ,padding:7 ,  width:360 ,alignItems:'center'}}>

//     {spinnerItem === item ? (
//         <ActivityIndicator size={34} />
//       ) :    <View >

//          {item.ratePerTonne &&  <View style={{flexDirection:'row', alignItems : 'center' ,}} >

//         <TouchableOpacity onPress={toggleCurrencyBid}>
//             {currencyBid ? <Text style={styles.buttonIsFalse} >USD</Text> :
//             <Text style={styles.bttonIsTrue}>Rand </Text>}
//           </TouchableOpacity>

//         <TextInput
//            onChangeText={(text) => setBidRate(text)}
//             // name="ratePerTonne"
//             value={bidRate}
//             keyboardType="numeric"
//             placeholderTextColor="#6a0c0c"
//             style={ {height : 30 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 ,padding:0, paddingLeft : 20 ,width : 180}}
//             placeholder="Bid rate here"
//           />
//           <TouchableOpacity onPress={togglePerTonneBid} >
//             {perTonneBid ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
//               <Text style={styles.buttonIsFalse}>Per tonne</Text>}
//           </TouchableOpacity>
//           </View>}


//           {item.links|| item.triaxle ?   <View>
//                 {item.links&& <View style={{flexDirection:'row', alignItems : 'center' ,}} >

//         <TouchableOpacity onPress={toggleCurrencyBid}>
//             {currencyBid ? <Text style={styles.buttonIsFalse} >USD</Text> :
//             <Text style={styles.bttonIsTrue}>Rand </Text>}
//           </TouchableOpacity>

//         <TextInput
//            onChangeText={(text) => setBidLinks (text)}
//             name="ratePerTonne"
//             value={bidLinks}
//             keyboardType="numeric"
//             placeholderTextColor="#6a0c0c"
//             style={ {height : 30 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 ,padding:0, paddingLeft : 20 ,width : 180}}
//             placeholder="Bid Links rate"
//           />
//           <TouchableOpacity onPress={togglePerTonneBid} >
//             {perTonneBid ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
//               <Text style={styles.buttonIsFalse}>Per tonne</Text>}
//           </TouchableOpacity>
//           </View>}
          


//  { item.triaxle&& <View style={{flexDirection:'row', alignItems : 'center' ,}} >

//         <TouchableOpacity onPress={toggleCurrencyBid}>
//             {currencyBid ? <Text style={styles.buttonIsFalse} >USD</Text> :
//             <Text style={styles.bttonIsTrue}>Rand </Text>}
//           </TouchableOpacity>

//         <TextInput
//            onChangeText={(text) => setBdTriaxle(text)}
//             // name="ratePerTonne"
//             value={bidTriaxle}
//             keyboardType="numeric"
//             placeholderTextColor="#6a0c0c"
//             style={ {height : 30 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 ,padding:0, paddingLeft : 20 ,width : 180,marginTop:5}}
//             placeholder="Bid triaxle rate"
//           />
//           <TouchableOpacity onPress={togglePerTonneBid} >
//             {perTonneBid ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
//               <Text style={styles.buttonIsFalse}>Per tonne</Text>}
//           </TouchableOpacity>
//           </View>}


//             </View>:null}


//    </View>}


//           {/* <View style={{flexDirection:'row' , justifyContent: 'space-evenly'}}>

//             <TouchableOpacity onPress={()=>toggleBid(item.id) } style={{ backgroundColor:'#6a0c0c',padding:1 ,paddingLeft :7 , paddingRight:7 ,borderRadius:3,marginRight:12}} > 
//               <Text style={{color:'white'}}>Cancel </Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={()=>handleSubmit(item , "biddings")} style={{ backgroundColor:'#228B22',padding:1 ,paddingLeft :7 , paddingRight:7 ,borderRadius:3}} >
//               <Text style={{color:'white'}}> Send</Text>
//             </TouchableOpacity>

//           </View> */}

//         </View>
//       )


const getFirstLetter = (str: string | null | undefined): string => str?.charAt(0) || '';
// const getFirstLetter = (str) => str?.charAt(0) || '';

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
        <ThemedText style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' , fontWeight:'600'}}  >{item.companyName} </ThemedText>

       {<View style={{ flexDirection:'row',margin:4}} >

         {item.returnLoad &&  <View style={{backgroundColor :'#6a0c0c',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
          <ThemedText style={{color :'white'}} >Return Load</ThemedText>
          </View>}

         {item.roundTrip &&  <View style={{backgroundColor :'#6a0c0c',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
          <ThemedText style={{color :'white'}} >Round Trip</ThemedText>
          </View>}

         {item.fuelAvai &&  <View style={{backgroundColor :'#6a0c0c',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
          <ThemedText style={{color :'white'}} >Fuel</ThemedText>
          </View>}

      </View>}
      <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100}} >Commodity</ThemedText>
        <ThemedText  style={{textOverflow:'ellipsis' }} >:  {item.typeofLoad} </ThemedText>
      </View>

      <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100}} >Route</ThemedText>
        <ThemedText style={{textOverflow:'ellipsis' }} >:  from  {item.fromLocation}  to  {item.toLocation} </ThemedText>
      </View>

      {!item.links && !item.triaxle && <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100,color:'green',fontWeight:'bold',fontSize:16}} >Rate</ThemedText>
        <ThemedText  style={{color:'green',fontWeight:'bold',fontSize:16}} >:  {item.currency ? "USD" : "RAND"} {item.ratePerTonne} {item.perTonne ? "Per tonne" :null} </ThemedText>
      </View>}

       {item.links&&  <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100,color:'green',fontWeight:'bold',fontSize:16}} >Links</ThemedText>
        <ThemedText style={{color:'green',fontWeight:'bold',fontSize:16}} >:  {item.currency ? "USD" : "RAND"} {item.links} {item.perTonne ? "Per tonne" :null} </ThemedText>
      </View>}

       {item.triaxle&& <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100,color:'green',fontWeight:'bold',fontSize:16}} >Triaxle</ThemedText>
        <ThemedText style={{color:'green',fontWeight:'bold',fontSize:16}} >:  {item.currency ? "USD" : "RAND"} {item.triaxle} {item.perTonne ? "Per tonne" :null} </ThemedText>
      </View>}








       {    <View>

     {<View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100}} >Contact</ThemedText>
      {!item.isVerified&&  <ThemedText style={{textOverflow:'ellipsis' }} >:  {item.contact}</ThemedText>}
      </View>}

      <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width:100}} >Payment Terms</ThemedText>
        <ThemedText  style={{textOverflow:'ellipsis' }} >: {item.paymentTerms}</ThemedText>
      </View>

        { item.requirements&&<View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width:100}} >Requirements</ThemedText>
        <ThemedText  style={{textOverflow:'ellipsis' }} >: { item.requirements}</ThemedText>
      </View>}
        {item.activeLoading&& <ThemedText style={{fontSize:17 , color:"#FF8C00" }} >Active Loading.... </ThemedText> }




     { <View>
    {  item.fuelAvai && <View style={{flexDirection :'row' ,marginTop:5, width:245 }} >
        <ThemedText style={{width:100}} >Fuel </ThemedText>
         <ThemedText style={{textOverflow:'ellipsis' }}  >:  {item.fuelAvai} </ThemedText>
      </View>}
      { item.additionalInfo && <View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100}} >Additional info </ThemedText>
       {<ThemedText style={{textOverflow:'ellipsis' }} >:  {item.additionalInfo} </ThemedText>} 
      </View>}


    {  item.alertMsg && <View style={{flexDirection :'row',marginTop:5, width:245 }} >
        <ThemedText style={{width :100 ,backgroundColor:'rgba(220, 20, 60, 0.8)',color:'white' ,textAlign:'center',fontSize:15}} >Alert</ThemedText>
         <ThemedText style={{paddingRight:7 ,backgroundColor:'rgba(220, 20, 60, 0.8)',color:'white' ,fontSize:15,textOverflow:'ellipsis' }} >:  {item.alertMsg} </ThemedText>
      </View>}

      {item.returnLoad && <View style={{marginTop:5, width:245 }} >
        <ThemedText style={{alignSelf:'center',color:"rgba(220, 20, 60, 0.8)",fontSize:16 ,margin:3}} >Return Load</ThemedText>
          { item.returnLoad &&<View style={{flexDirection :'row'}} >
        <ThemedText style={{width :100}} >R Cargo</ThemedText>
       {<ThemedText style={{textOverflow:'ellipsis' }} >:  {item.returnLoad} </ThemedText>} 
      </View>}
          { item.returnRate &&<View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100}} >R Rate</ThemedText>
       {<ThemedText style={{textOverflow:'ellipsis' }} >:  {item.returnRate} </ThemedText>} 
      </View>}
          { item.returnTerms &&<View style={{flexDirection :'row', width:245 }} >
        <ThemedText style={{width :100}} >R Terms</ThemedText>
       {<ThemedText style={{textOverflow:'ellipsis' }} >:  {item.returnTerms} </ThemedText>} 
      </View>}
      </View>}
 </View>}


         {!contactDisplay[item.id] && <TouchableOpacity onPress={()=>toggleDspMoreInfo(item.id) } >
          <ThemedText style={{color :'green',fontWeight:'bold',fontSize:16}} >{  dspMoreInfo[item.id]  ?"See Less": "See more"} </ThemedText>
        </TouchableOpacity>}
        </View> }


        {contactDisplay[item.id] && contactMe}

         {/* {bidDisplay[item.id]&& bidNow} */}

<View style={{flexDirection:'row' , justifyContent:'space-around'}}>

        { <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{  width : 120 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, margin:5 }} >
          <ThemedText style={{color:'white'}} > Get In Touch Now</ThemedText>
        </TouchableOpacity>}
        <TouchableOpacity    style={{  width : 120 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8,  margin:5 }} >
          <ThemedText style={{color:'white'}}>All {firstLetter}  Loads </ThemedText>
        </TouchableOpacity>
        
</View>



     { !contactDisplay[item.id] && (
  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }} >

    {bookingError && <ThemedText>{bookingError}</ThemedText>}
    {spinnerItem === item ? (
      <ActivityIndicator size={34} />
    ) : (
      <TouchableOpacity
        style={{
          width: 90,
          height: 30,
          alignItems: "center",
          justifyContent: 'center',
          backgroundColor: '#6a0c0c',
          borderRadius: 8,
          alignSelf: 'center',
          margin: 5
        }}
        /* onPress={() => handleSubmit(item , "bookings")} */
      >
        <ThemedText style={{ color: 'white' }} >Book</ThemedText>
      </TouchableOpacity>
    )}

    <TouchableOpacity
      onPress={() => toggleBid(item.id)}
      style={{
        width: 90,
        height: 30,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#6a0c0c',
        borderRadius: 8,
        alignSelf: 'center',
        margin: 5
      }}
    >
      <ThemedText style={{ color: 'white' }} >Bid</ThemedText>
    </TouchableOpacity>

    <TouchableOpacity
      style={{
        width: 90,
        height: 30,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#6a0c0c',
        borderRadius: 8,
        alignSelf: 'center',
        margin: 5
      }}
    >
      <ThemedText style={{ color: 'white' }} >Message</ThemedText>
    </TouchableOpacity>
  </View>
)}








      </View>     

  )})


  
  
 

    const handleShareApp = async () => {
//               try {
//                 const message = `I invite you to Transix!

// Transix is a tech-driven business enhancing transportation and logistics services, connecting suppliers with demand for truckloads, vehicles, trailers, spare parts etc.

// Contact us at +263716325160 with the message "Application" to swiftly receive the application download link.

// Explore Application at : https://play.google.com/store/apps/details?id=com.yayapana.Transix
// Explore website at : https://transix.net/

// Experience the future of transportation and logistics!  `;

//                 const result = await Share.share({
//                   message: message,
//                 });

//                 if (result) {
//                   if (result.action === Share.sharedAction) {
//                     if (result.activityType) {
//                       // Shared with activity type of result.activityType
//                     } else {
//                       // Shared
//                     }
//                   } else if (result.action === Share.dismissedAction) {
//                     // Dismissed
//                   }
//                 } else {
//                   // Handle the case where result is undefined or null
//                 }
//               } catch (error) {
//                 alert(error.message);
//               }
            };
    

  return(
    <View>
              
   
       

   {<ScrollView style={{padding : 10 , marginTop : 10 , paddingTop : 0}} >
   {  <View style={{flexDirection : 'row' , justifyContent : 'space-evenly' }} >
    <TouchableOpacity onPress={toggleLocalLoads} style={styles.buttonStyle} >
      <ThemedText style={{color:'white'}} > Local </ThemedText>
    </TouchableOpacity>

    <TouchableOpacity style={styles.buttonStyle}  >
      <ThemedText style={{color:'white'}} >International  </ThemedText>
    </TouchableOpacity>

    {/* {userIsVerified && <TouchableOpacity style={styles.buttonStyle} onPress={ ()=>navigation.navigate('selectedUserLoads' , {verfiedLoads : true})  }>
      <Text style={{color:'white'}} >Verified</Text>
    </TouchableOpacity>} */}
    </View>
}

        {rendereIterms}
        {!dspLoadMoreBtn && loadsList.length <= 0 && location&&<ThemedText style={{fontSize:19 ,fontWeight:'bold'}} >Do Not Have Local loads </ThemedText> }
       {!dspLoadMoreBtn && loadsList.length <= 0  && location &&<TouchableOpacity onPress={handleShareApp} >
         <ThemedText style={{fontSize : 20 , textDecorationLine:'underline'}} >Please share or recommend our app for more loads</ThemedText>
       </TouchableOpacity>}

       

          
       
    </ScrollView> }

       {/* {localLoads && <View style={{alignItems : 'center' , paddingTop : 30}}>
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
       </View> } */}

       
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



