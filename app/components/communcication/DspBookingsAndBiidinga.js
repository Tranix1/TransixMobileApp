import React,{useEffect} from "react";
import { View,TouchableOpacity , Text, StyleSheet,ScrollView,Linking } from "react-native";
import { onSnapshot ,  query ,doc , collection,where ,updateDoc , deleteDoc ,runTransaction,orderBy,limit,getDocs,startAfter} from "firebase/firestore"
import { auth , db } from "../config/fireBase";

import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
// import {useNavigate,useParams} from 'react-router-dom';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
function BookingsandBiddings({navigation , route}){

    const {dspRoute , dbName} = route.params

  

  const [ newItermBooked, setNewBkedIterm] = React.useState(0);
  const [ newItermBidded , setNewBiddedIterm] = React.useState(0);

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
      }, [dspRoute]);


      if(dspRoute === "yourBiddedItems" ||dspRoute === "yourBookedItems"){
       const userId = auth.currentUser.uid
       const docRef = doc(db, 'newIterms', userId);
       runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);

        if (docSnap.exists()) {
            const currentBiddingDocs = docSnap.data().biddingdocs || 0;

            const currentBookingsDocs = docSnap.data().bookingdocs || 0;
            let updatedBiddingDocs = currentBiddingDocs
            let updateBokingsDocs = currentBookingsDocs
            
            if (dspRoute === "yourBiddedItems") {
                updatedBiddingDocs = 0;
            } else if (dspRoute === "yourBookedItems") {
                updateBokingsDocs = 0;
            }

            transaction.update(docRef, {
                biddingdocs : updatedBiddingDocs,
                bookingdocs :  updateBokingsDocs ,
            });
        }
    });
      }

  const [getAllIterms , setAllIterms]=React.useState([])
     
  const deleteLoad = async (id) => {
  try {
    const loadsDocRef = doc(db, `${dbName}`, id);
    await deleteDoc(loadsDocRef);
    setAllIterms((prevLoadsList) => prevLoadsList.filter(item => item.id !== id));
  } catch (error) {
    console.error('Error deleting item:', error);
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
    const orderByF = "timestamp";
    const orderByField = orderBy(orderByF, 'desc'); // Order by timestamp in descending order

    const pagination = loadMore && getAllIterms.length > 0 ? [startAfter(getAllIterms[getAllIterms.length - 1][orderByF])] : [];
    const userId = auth.currentUser.uid
    // const dataQuery = query(collection(db, `biddings`), orderByField, ...pagination, limit(15) );
    let dataQuery
      if(dspRoute === "yourBookedItems" || dspRoute === "yourBiddedItems" ){
        dataQuery = query(collection(db, `${dbName}`), orderByField , ...pagination, limit(15) ,where ("ownerId", "==", userId ) );

      }else{

        dataQuery = query(collection(db, `${dbName}`), orderByField , ...pagination, limit(15) ,where ("bookerId", "==", userId ) );
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
    setAllIterms(loadMore ? [...getAllIterms , ...loadedData] : loadedData);
    loadMore ? setLoadMoreData(false) : null;

  }catch(err){
    console.error(err)
  }
  }
  
  
  useEffect(() => {
    loadedData();
  }, [dspRoute]);
  












  const loadTaken = async (loadid ,bbId) => {
    if(bbId && !loadid){

    const bbDocRef = doc(db, `${dbName}`, bbId);
      await deleteDoc(bbDocRef);
        
    }else{

    const bbDocRef = doc(db, `${dbName}`, bbId);
      await deleteDoc(bbDocRef);
        const loadsDocRef = doc(db, 'Loads', loadid);
        await deleteDoc(loadsDocRef);
    }
    loadedData()
};

  // React.useEffect(() => {
  //   getAlltermsF()
  //   },[dspRoute]);

    const toggleAcceptOrDeny = async (dbNameMin , id ,decision , contact ,message ) => {
      try {
        if (decision === "Accept") {
          const docRef = doc(db, `${dbNameMin}`, id);
          await updateDoc(docRef, { Accept : true ,  });
          if(message){

            Linking.openURL(`whatsapp://send?phone=${contact}&text=${encodeURIComponent(message)}`)
          }
        }else{
          const docRef = doc(db, `${dbNameMin}`, id);
          await updateDoc(docRef, { Accept : false ,  });
          alert("Username denied the offer!");
        }
      } catch (err) {
        console.error(err);
      }

  }

    const [contactDisplay, setContactDisplay] = React.useState({ ['']: false });
    const toggleContact = (itemId) => {
      setContactDisplay((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
    };




let whnBookBiddAload = getAllIterms.map((item) => {
  const userId = auth.currentUser.uid;
  const message =  ` ${item.ownerName} \n Is this Load still available   ${item.itemName} from  ${item.fromLocation} to ${item.toLocation} \nRate  ${item.linksrate || item.triaxlerate ? item.triaxlerate &&`triaxle ${item.triaxlerate } ` + item.linksrate&&`links for ${item.linksrate}` : `${item.ratepertonne}` } ${item.pertonne ?"per tonne" : ''}\nfrom https://transix.net/selectedUserLoads/${item.userId}/${item.id} ` ; // Set your desired message here
    let contactMe = ( <View style={{ paddingLeft: 30 }}>

         <TouchableOpacity  onPress={()=>navigate(`/message/${item.userId}/${item.CompanyName} `)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#008080" , borderWidth:1 , borderColor :'#008080', justifyContent:'center', marginBottom : 5 , marginTop:6}} >
            <Text style={{color:"#008080"}} >Message now</Text>
            <MaterialIcons name="chat" size={24} color="#008080" />

          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#40E0D0" , borderWidth:1 , borderColor :'#40E0D0', justifyContent:'center', marginBottom:4}} >
            <Text style={{color:'#40E0D0'}} >Phone call</Text>
                <MaterialIcons name="call" size={24} color="#0074D9" />

          </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#25D366" , borderWidth:1 , borderColor :'#25D366', justifyContent:'center'}} >
            <Text style={{color : "#25D366"}} >WhatsApp </Text> 
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>

          </View>)
  if (item.bookerId === userId) {
    return (
      <View style={{ backgroundColor: '#DDDDDD', marginBottom: 15, width : 350 , padding :7}}>

            { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
            <MaterialIcons name="verified" size={26} color="green" />
            </View>}

            
        <Text style={{color:'#5a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}} >{item.ownerName} </Text>

         <View style={{flexDirection :'row'}} >
        <Text style={{width :59}} >{dbName === "bookings" ?  "Booked" : "Bidded"}</Text>
        <Text>:  {item.itemName} </Text>
      </View>

        {item.rate&& <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Rate</Text>
        <Text>:  {item.currency ? "USD" : "RAND"} {item.rate} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}

    
       {item.linksRate&&  <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Links</Text>
        <Text>:  {item.currency ? "USD" : "RAND"} {item.linksRate} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}

       {item.triaxleRate&& <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Triaxle</Text>
        <Text>:  {item.currency ? "USD" : "RAND"} {item.triaxleRate} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}


  <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Route</Text>
        <Text>:  from  {item.fromLocation}  to  {item.toLocation} </Text>
      </View>
          
      <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Decision</Text>
        <Text>: {item.Accept === null ? "Pending" : item.Accept === true ? "Accepted" : item.Accept === false ? "Denied" : "Unknown"}</Text>
      </View>

        {contactDisplay[item.id] && contactMe}
        {item.Accept &&  <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{ width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
          <Text style={{ color:'white'}} > Get In Touch Now</Text>
        </TouchableOpacity>}

          <TouchableOpacity onPress={()=>loadTaken(  null ,   item.id ) } style={{backgroundColor :'red' , width : 100 , alignItems :'center' , borderRadius :50 , position :'absolute', right :7 , bottom :7}}>
            <Text style={{color:'white'}} > Not intrested </Text>
          </TouchableOpacity>
      </View>
    );
  }

  return null; // Return null for other items
});




 let whenMyLoadBookBidd = getAllIterms.map((item)=>{
const userId = auth.currentUser.uid;

         let theRateD

        if(item.rate){
          theRateD = `Rate ${item.rate} ${item.perTonne ?"per tonne":''} `
        }
        else if(item.triaxleRate && item.linksRate){
          theRateD = `Links ${item.linksRate} Triaxle ${item.triaxleRate} ${item.perTonneB ?"per tonne":""} `
        }else if(item.triaxleRate){
          theRateD = `Triaxle ${item.triaxleRate} ${item.perTonneB ?"per tonne":""} `
        }else if(item.linksRate){
          theRateD = `Links ${item.linksRate} ${item.perTonneB ?"per tonne":""} `
        }

  const message =  `${item.ownerName}
Is this Load still available
${item.itemName} from ${item.fromLocation} to ${item.toLocation}
${theRateD}

From: https://transix.net/selectedUserLoads/${item.userId}/${item.id}` ; // Set your desired message here

  const messageV =  `${item.ownerName}
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

From: https://transix.net/selectedUserLoads/${item.userId}/${item.id} ` ;

   let messageSend = item.isVerified ? messageV : message 
  
  let contactMe = ( <View style={{ paddingLeft: 30 ,marginBottom:30}}>
  <TouchableOpacity  onPress={()=>navigate(`/message/${item.userId}/${item.CompanyName} `)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#008080" , borderWidth:1 , borderColor :'#008080', justifyContent:'center', marginBottom : 5 , marginTop:6}} >
            <Text style={{color:"#008080"}} >Message now</Text>
            <MaterialIcons name="chat" size={24} color="#008080" />
          </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(messageSend)}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#25D366" , borderWidth:1 , borderColor :'#25D366', justifyContent:'center', marginBottom:6}} >
            <Text style={{color : "#25D366"}} >WhatsApp </Text> 
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#0074D9" , borderWidth:1 , borderColor :'#0074D9', justifyContent:'center', marginBottom:4}} >
            <Text style={{color:'#0074D9'}} >Phone call</Text>
                <MaterialIcons name="call" size={24} color="#0074D9" />
          </TouchableOpacity>

          </View>)
          let dbToBechanged 
          dbName === "bookings" ?  dbToBechanged = "bookings" : dbToBechanged = "biddings"

if(item.ownerId === userId ){ 
return (<View style={{ backgroundColor: '#DDDDDD', marginBottom: 15, width : 350 , padding :7}} key = {item.id}>


            { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
            <MaterialIcons name="verified" size={26} color="green" />
            </View>}

            <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}}  >{item.bookerName} </Text>


 <View style={{flexDirection :'row',marginBottom:6}} >
        <Text style={{width :85 ,fontStyle:'italic',fontSize:16}} >Commodity</Text>
        <Text style={{fontSize:17}} >: {item.itemName} was {dbName === "bookings" ?  "Booked" : "Bidded"} </Text>
      </View>

        {item.rate&& <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Rate</Text>
        <Text>:  {item.currencyB ? "USD" : "RAND"} {item.rate} {item.perTonneB ? "Per tonne" :null} </Text>
      </View>}

       {item.linksRate&&  <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Links</Text>
        <Text>:  {item.currency ? "USD" : "RAND"} {item.linksRate} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}

       {item.triaxleRate&& <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Triaxle</Text>
        <Text>:  {item.currency ? "USD" : "RAND"} {item.triaxleRate} {item.perTonne ? "Per tonne" :null} </Text>
      </View>}
    


  <View style={{flexDirection :'row'}} >
        <Text style={{width :75}} >Route</Text>
        <Text>:  from  {item.fromLocation}  to  {item.toLocation} </Text>
      </View>

                 <View style={{flexDirection:'row' , margin :4}} >      
           <TouchableOpacity onPress={()=> toggleAcceptOrDeny( dbToBechanged , item.id  , "Accept",item.contact, messageSend)} style={styles.bttonIsTrue} >
            <Text style={{color:'white'}} >Accept </Text>
          </TouchableOpacity>
          
           <TouchableOpacity onPress={()=> toggleAcceptOrDeny( dbToBechanged , item.id  , "Deny")} style={styles.buttonIsFalse}>
            <Text  >Deny </Text>
          </TouchableOpacity>
            </View>

      <View style={{flexDirection:'row', marginBottom : 25 , height : 30 , alignSelf:'center' , marginTop : 6,  }} >
          <TouchableOpacity onPress={()=>navigation.navigate('selectedUserTrucks', { userId : item.bookerId , loadIsVerified: item.isVerified , CompanyName : item.bookerName })}style={{    width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#6a0c0c' ,  alignSelf:'center', margin:5  }} >
          <Text style={{fontSize:17,color:'white' }} >Bookers trucks</Text>

          </TouchableOpacity>

        <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{    width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  alignSelf:'center', margin:5 }} >
          <Text style={{color:'white'}} > Get In Touch</Text>
        </TouchableOpacity>
        </View>

        {contactDisplay[item.id] && contactMe}

          <TouchableOpacity onPress={()=>loadTaken(  item.loadId ,  item.id ) } style={{backgroundColor :'red' , width : 100 , alignItems :'center' , borderRadius :50 , position :'absolute', right :7 , bottom :7}}>
            <Text style={{color:'white'}} > Load Taken </Text>
          </TouchableOpacity>
      </View>  ) 
 
} 
})



  return(
    <View style={{paddingTop:80 , alignItems:'center'}}>     

       <View style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack() }>
            {/* <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  /> */}
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > {dspRoute? dspRoute : "Bookings and Biddings"} </Text>
         </View>
    <View style={{flexDirection:'row', alignItems : 'center'  , justifyContent:'center'}}>
          <View style={{marginRight:7}} >

                    { !dspRoute&&<TouchableOpacity onPress={()=>navigate('/bookingsandBiddings/bookings/yourBookedItems') } style={styles.slctView}>
                        <Text>Your booked Items</Text>
        {  <Text style={{backgroundColor :'#6a0c0c' , color:'white' , paddingLeft :5, paddingRight:5, marginRight :6 , borderRadius :10 , justifyContent:'center' }} >{newItermBooked} </Text>}
                      </TouchableOpacity>}
                  { !dspRoute &&<TouchableOpacity onPress={()=>navigate('/bookingsandBiddings/bookings/itemsYouBooked') } style={styles.slctView}>
                        <Text>Items you booked</Text>
                      </TouchableOpacity>}
          </View>

<View>

          { !dspRoute&& <TouchableOpacity onPress={()=>navigate('/bookingsandBiddings/biddings/yourBiddedItems') } style={styles.slctView}>
              <Text>Your Bidded Items</Text>
        { <Text style={{backgroundColor :'rgb(129,201,149)', color:'white' , paddingLeft :5, paddingRight:5, marginRight :6 , borderRadius :10 , justifyContent:'center'  }} > {newItermBidded} </Text> }
            </TouchableOpacity>}
        { !dspRoute&&<TouchableOpacity onPress={()=>navigate('/bookingsandBiddings/biddings/itermsYouBidded') } style={styles.slctView}>
              <Text>Items you Bidded</Text>
            </TouchableOpacity>}
 </View>
  </View> 
  
            {dspRoute=== "itermsYouBidded" && <ScrollView>
              {whnBookBiddAload}
          {getAllIterms.length>15 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> loadedData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}
        <View style={{height : 200}} ></View>
            </ScrollView> }

            
            {dspRoute=== "yourBiddedItems" && <ScrollView> 
              {whenMyLoadBookBidd}
                 {getAllIterms.length>15 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> loadedData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}
        <View style={{height : 200}} ></View>
              </ScrollView>}
              
            {dspRoute=== "itemsYouBooked" && <ScrollView>
              {whnBookBiddAload}
                 {getAllIterms.length>15 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> loadedData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}
        <View style={{height : 200}} ></View>
            </ScrollView> }
            
            {dspRoute===  "yourBookedItems" && <ScrollView> 
              {whenMyLoadBookBidd}
                 {getAllIterms.length>15 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> loadedData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}
        <View style={{height : 200}} ></View>
              </ScrollView>}

    </View>
  )
}
export default React.memo(BookingsandBiddings)

const styles = StyleSheet.create({
 slctView : {
  height : 45 ,
  width : 200 ,
  borderColor : "#6a0c0c" ,
  borderWidth : 1 ,
  justifyContent : 'center',
  alignItems : 'center' ,
  marginBottom : 10
 } ,  buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
    //  marginLeft : 6
   } , 
    bttonIsTrue:{
    backgroundColor : 'green' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' 

    }
});



