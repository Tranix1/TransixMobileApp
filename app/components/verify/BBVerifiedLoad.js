import React,{useEffect} from "react";
import { View , Text ,TouchableOpacity,ScrollView,Image,StyleSheet } from "react-native";
import { auth ,db} from "../config/fireBase";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";

import { collection,  serverTimestamp ,addDoc, query , where , doc,deleteDoc , runTransaction , setDoc,onSnapshot,getDocs } from 'firebase/firestore';

function BBVerifiedLoad({navigation,route}){
const {itemName ,fromLocation ,toLocation ,
        bookerId ,
        bookerName ,
        ownerName,
        ownerId  ,
        contact ,
        Accept  ,
        isVerified ,
        msgReceiverId ,
        docId,
        rate ,
        linksRate ,
        triaxleRate ,
        currencyB,
        perTonneB ,
        loadId ,
        deletionTime,
        timestamp,
        dbName,
        expoPushToken,
        sendPushNotification} = route.params


const [bbVerifiedLoadD ,setbbVerifiedLoadD]=React.useState([])


  useEffect(() => {
    try {
        const userId = auth.currentUser.uid
        const dataQuery = query(collection(db, "Trucks"), where("userId" ,"==", userId),where("withDetails","==" ,true ) );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          setbbVerifiedLoadD(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []); 


    const [ truckDetails , setTruckDDsp]=React.useState(false)

  function togglrTruckDe(){
    setTruckDDsp(prev=>!prev) 
    setTruckBuzDDsp(false)
    setDriverDDsp(false)
  }



  const [ truckBuzDe , setTruckBuzDDsp]=React.useState(false)

  function togglrTruckBuzDe(){
    setTruckBuzDDsp(prev=>!prev)
    setDriverDDsp(false)
    setTruckDDsp(false)
  }

  const [driverDetails , setDriverDDsp]=React.useState(false)

  function togglrDriverDe(){
     setTruckBuzDDsp(false)
    setTruckDDsp(false)
    setDriverDDsp(prev=>!prev)
  }


    const deleteItem = async (id , imageUrl) => {

    try {
        const response = await fetch(imageUrl, {
            method: 'DELETE',
        });

        if (response.ok) {
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
            console.log('Document deleted successfully');
        } else {
            console.log('Error deleting image:', response.status);
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
        }
    } catch (error) {
        console.log('Error deleting image:', error);
    } finally {
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
    }
    }

     const checkAndDeleteExpiredItems = () => {
       bbVerifiedLoadD.forEach((item) => {
        
  if (item.withDetails && !item.isVerified ) {
  if (item.deletionTime === undefined) {
    deleteItem(item.id, item.imageUrl);
  } else {
    const deletionTime = item.deletionTime;
    const timeRemaining = deletionTime - Date.now();
    
    if (timeRemaining <= 0) {
      deleteItem(item.id, item.imageUrl);
    } else {
      setTimeout(() => {
        deleteItem(item.id);
      }, timeRemaining); 
    }
  }
}

  });
};
setTimeout(() => {
  checkAndDeleteExpiredItems();
}, 1000);


// This function is checking if user has already an id in add new iterms
// Whe we are counting how many new iterms were boked ot bidded it check wheter to create a new doc or update an exsiting one
   const checkExistixtBBDoc = async (receriverId) => {
    const chatsRef = collection(db, 'newIterms'); // Reference to the 'ppleInTouch' collection
    const chatQuery = query(chatsRef, where('receriverId', '==', receriverId)); // Query for matching chat ID

      const querySnapshot = await getDocs(chatQuery);  
     // Check if any documents exist with the chat ID
      return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    };
// If the id already exisist it create else it update the doc


let renderElements = bbVerifiedLoadD.map((item)=>{

    async function handleSubmitDetails(){
        
        const theCollection = collection(db, dbName);
        const docRef = await addDoc(theCollection, {
        itemName :itemName ,
        fromLocation :fromLocation ,
        toLocation :toLocation ,
        bookerId :bookerId,
        bookerName:bookerName ,
        ownerName :ownerName ,
        ownerId :ownerId ,
        contact :contact ,
        Accept :Accept ,
        isVerified :isVerified,
        msgReceiverId :msgReceiverId ,
        docId :docId ,
        rate :rate ,
        linksRate :linksRate ,
        triaxleRate :triaxleRate,
        currencyB :currencyB,
        perTonneB :perTonneB,
        loadId :loadId,
        deletionTime :deletionTime ,
        timestamp:timestamp ,

        trailerType : item.trailerType,
        horseReg  : item.horseReg,
        trailerReg  : item.trailerReg ,
        scndTrailerReg : item.scndTrailerReg,
        driverName : item.driverName ,
        driverLicense : item.driverLicense,
        driverPassport : item.driverPassport,
        driverPhone : item.driverPhone,

        })

          let theRateD

        if(rate){
          theRateD = `Rate ${rate} ${perTonneB ?"per tonne":''} `
        }
        else if(triaxleRate && linksRate){
          theRateD = `Links ${linksRate} Triaxle ${triaxleRate} ${perTonneB ?"per tonne":""} `
        }else if(triaxleRate){
          theRateD = `Triaxle ${triaxleRate} ${perTonneB ?"per tonne":""} `
        }else if(linksRate){
          theRateD = `Links ${linksRate} ${perTonneB ?"per tonne":""} `
        }

        let message  =`${itemName} ${dbName === "bookings" ? "Booked" : "Bidded"} ${theRateD} `
        let tittle = `From ${item.fromLocation} to ${item.toLocation} `
        if(expoPushToken){

          await sendPushNotification(expoPushToken, message , tittle,dbName );
        }

        // The code below is used to add 1 when a users add to tell the owner how many of his itemrs were booked and how many were bidded
            const existingBBDoc = await checkExistixtBBDoc(bookerId);
        // const existingChat = await checkExistingChat(addChatId);
        let newBiddedDoc = 0
        let newBOOKEDDoc = 0

        dbName === "bookings" ? newBOOKEDDoc = 1  : newBiddedDoc = 1
      // Chat doesn't exist, add it to 'ppleInTouch'
      if(!existingBBDoc){
      await setDoc( doc(db , "newIterms", bookerId), {
        bookingdocs : newBOOKEDDoc ,
        biddingdocs : newBiddedDoc ,
        timestamp : serverTimestamp() ,
        receriverId : ownerId ,
      }); 
    }
    else{
       
       const docRef = doc(db, 'newIterms', bookerId);
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
    // The code to add numbers for new iterms end here

        alert("You Booked A Verified Load");
        navigation.goBack()
    }
   
    return(
        <TouchableOpacity onPress={handleSubmitDetails} style={{marginBottom:18 , padding:10}} >

         {<Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
          <Text>{item.CompanyName} </Text>
          <Text>From {item.fromLocation} To {item.toLocation} </Text>

          <TouchableOpacity onPress={togglrTruckDe} style={styles.buttonSelectStyle} >
            <Text style={{color:'white'}} >Truck Details </Text>
          </TouchableOpacity>
          {truckDetails &&<View> 

          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Horse Reg </Text>
              <Text>:  {item.horseReg}</Text>

            </View>
          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Trailer Type</Text>
              <Text>:  {item.trailerType}</Text>
            </View>

          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Trailer Reg 1</Text>
              <Text>:  {item.trailerReg}</Text>
            </View>

          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Trailer Reg 2</Text>
              <Text>:  {item.scndTrailerReg}</Text>
            </View>
            </View>}

            <TouchableOpacity onPress={togglrDriverDe} style={styles.buttonStyle} >
              <Text>Driver Details</Text>
            </TouchableOpacity>
          {driverDetails &&<View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver Name</Text>
        <Text>:  {item.driverName}</Text>
      </View>

     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver License</Text>
        <Text>:  {item.driverLicense} </Text>
      </View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver pasport</Text>
        <Text>: {item.driverPassport}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver Phone</Text>
        <Text>:  {item.driverPhone}</Text>
      </View>
        </View>}

            <TouchableOpacity onPress={togglrTruckBuzDe} style ={styles.buttonSelectStyle} >
              <Text style={{color:'white',fontSize :17}} >business Details</Text>
            </TouchableOpacity>
           {truckBuzDe && <View>
              
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Owner Phone Number</Text>
        <Text>:  {item.truckOwnerPhone}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Owner WhatsApp</Text>
        <Text>:  {item.truckOwnerWhatsApp}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Business Location</Text>
        <Text>:  {item.businessLoction}</Text>
      </View>
         </View>}

        </TouchableOpacity>
    )
})

return(
    <View>
        <View style={{flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center'}} >

                <TouchableOpacity style={{marginRight: 12}} onPress={() => navigation.goBack()} >
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 

            <Text style={{fontSize: 20 , color : 'white'}} >Pick the truck for the job </Text>
        </View>

        <TouchableOpacity onPress={()=>navigation.navigate("selectAddIterms" ,{verifiedLoad:true , fromLocation :fromLocation , toLocation : toLocation } ) } style={{position :'absolute',top: 440 ,right:10 , width : 77 , height : 35 , backgroundColor:'white' , zIndex :200 , borderRadius: 8,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}} >

            <Text style={{fontSize:17}} >Add</Text>
            <MaterialIcons name="verified" size={30} color="green" />
        </TouchableOpacity>


  <View style={{borderWidth : 2 , borderColor : "rgb(129,201,149)" ,  margin :16,padding:5}} >

       { isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
                <MaterialIcons name="verified" size={26} color="green" />
            </View>}

              <View style={{backgroundColor : '#228B22',flexDirection :'row',alignItems:'center',justifyContent:'center'}} >

            <Text style={{color : 'white' , textAlign : 'center' , fontSize : 18,alignSelf:'center'}} >{ownerName}</Text>
              </View>

         <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >{dbName === "bookings" ?  "Booking" : "Bidding"}</Text>
        <Text  >:  {itemName} </Text>
      </View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Route</Text>
        <Text>:  from  {fromLocation}  to  {toLocation} </Text>
      </View>
        {!linksRate && !triaxleRate && <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Rate</Text>
        <Text>:  {currencyB ? "USD" : "RAND"} {rate} {perTonneB ? "Per tonne" :null} </Text>
      </View>}

    
       {linksRate&&  <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Links</Text>
        <Text>:  {currencyB ? "USD" : "RAND"} {linksRate} {perTonneB ? "Per tonne" :null} </Text>
      </View>}

       {triaxleRate&& <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Triaxle</Text>
        <Text>:  {currencyB ? "USD" : "RAND"} {triaxleRate} {perTonneB ? "Per tonne" :null} </Text>
      </View>}



  </View>

<ScrollView>

    {renderElements}
    <View style={{height:500}} >

    </View>
</ScrollView>
    </View>
)
}
export default React.memo(BBVerifiedLoad)


const styles = StyleSheet.create({
    buttonStyle : {
        height : 35,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginTop: 10 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10
    } ,
    buttonSelectStyle :{
        backgroundColor :"#6a0c0c",
        height : 35,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginTop: 10 ,
        borderRadius: 10

    }
});
