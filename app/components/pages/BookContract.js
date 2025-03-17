import React,{useEffect} from "react";
import { View , Text ,TouchableOpacity,ScrollView,Image,StyleSheet } from "react-native";
import { auth ,db} from "../config/fireBase";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";

import { collection,  serverTimestamp ,addDoc, query , where , doc,deleteDoc , runTransaction , setDoc,onSnapshot,getDocs } from 'firebase/firestore';

function BookLContract({navigation,route}){
const {pana } = route.params


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


const [trucksInContract , setTrucksInContract] = React.useState([])
  useEffect(() => {
    try {
        const userId = auth.currentUser.uid
        const dataQuery = query(collection(db, "trucksContracts") );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          setTrucksInContract(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []); 





    const checkExistixtBBDoc = async (trckContractId) => {
      console.log("its running")
    const chatsRef = collection(db, 'trucksContracts'); // Reference to the 'ppleInTouch' collection
    const chatQuery = query(chatsRef, where('trckContractId', '==', trckContractId )); // Query for matching chat ID

      const querySnapshot = await getDocs(chatQuery);  
     // Check if any documents exist with the chat ID
      console.log("its donee")
      return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    };

//
let renderScndtems
let renderElements = bbVerifiedLoadD.map((item)=>{

    async function handleSubmitDetails(){

        const userId = auth.currentUser.uid
          const existingBBDoc = await checkExistixtBBDoc(`${userId}contractId ${item.timeStamp}`);
          if(!existingBBDoc){

console.log('start adding')

      const theCollection = collection(db, "trucksContracts");
        const docRef = await addDoc(theCollection, {
    

        truckInfo : item ,

        trckContractId : `${userId}contractId ${item.timeStamp}` ,
        truckContrSt : true ,
        contractId : 'yayayyayaya' ,
        contractOnwerId : "papapapapapa" ,
        contractName :'banje' ,
        approvedTrck : false
        

        })
console.log('doneee adding')
        
          }else{
            alert("HIIIIIIIIIIIIIIIIIIIIIII")
          }
  
    }
   
    return(
        <TouchableOpacity onPress={handleSubmitDetails} style={{marginBottom:18 , padding:10}}key={item.id} >

         {<Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}

         

 {trucksInContract.map((scndItem) => {
 
 return(
   <View key={scndItem.id}> 
    {(Number(item.timeStamp) === Number(scndItem.truckInfo.timeStamp)) && (
        <Text>Hiiiiiiiiiiiiiiii</Text>
      )}
      </View>
    )}
    
    
    )}



          {renderScndtems}
          <Text>{item.CompanyName} </Text>
          <Text>From {item.fromLocation} To {item.toLocation} </Text>

          <TouchableOpacity onPress={togglrTruckDe} style={styles.buttonSelectStyle} >
            <Text style={{color:'white'}} >Truck Details </Text>
          </TouchableOpacity>
          {truckDetails &&<View> 

          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Trailer Type</Text>
              <Text>:  {item.trailerType}</Text>
            </View>
       

         {item.imageUrl&& <Image source={{uri: item.truckBookImage }} style={{ height : 250 , borderRadius: 10}} />}
         {item.imageUrl&& <Image source={{uri: item.trailerBookF }} style={{ height : 250 , borderRadius: 10}} />}
         {item.imageUrl&& <Image source={{uri: item.trailerBookSc }} style={{ height : 250 , borderRadius: 10}} />}

         
            </View>}

            <TouchableOpacity onPress={togglrDriverDe} style={styles.buttonStyle} >
              <Text>Driver Details</Text>
            </TouchableOpacity>
          {driverDetails &&<View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver Name</Text>
        <Text>:  {item.driverName}</Text>
      </View>

    

         {item.imageUrl&& <Image source={{uri: item.driverLicense }} style={{ height : 250 , borderRadius: 10}} />}
         {item.imageUrl&& <Image source={{uri: item.driverPassport}} style={{ height : 250 , borderRadius: 10}} />}

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
        <Text>:  {item.ownerPhoneNum}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Owner Email</Text>
        <Text>:  {item.onwerEmail}</Text>
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

        <TouchableOpacity onPress={()=>navigation.navigate("selectAddIterms" ,{verifiedLoad:true , } ) } style={{position :'absolute',top: 440 ,right:10 , width : 77 , height : 35 , backgroundColor:'white' , zIndex :200 , borderRadius: 8,flexDirection:'row',justifyContent:'space-around',alignItems:'center'}} >

            <Text style={{fontSize:17}} >Add</Text>
            <MaterialIcons name="verified" size={30} color="green" />
        </TouchableOpacity>


  <View style={{borderWidth : 2 , borderColor : "rgb(129,201,149)" ,  margin :16,padding:5}} >

        <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white',zIndex : 66}} >
                <MaterialIcons name="verified" size={26} color="green" />
            </View>

    
              <View style={{backgroundColor : '#228B22',flexDirection :'row',alignItems:'center',justifyContent:'center'}} >

            <Text style={{color : 'white' , textAlign : 'center' , fontSize : 18,alignSelf:'center'}} >NB Investments</Text>
              </View>
    <Text>9months contract</Text>

         <View style={{flexDirection :'row'}} >
        <Text style={{width :99}} >Nmae</Text>
        <Text  >:  Tobbacoo </Text>
      </View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Country</Text>
        <Text>IN Zimbabwe </Text>
      </View>

      
        <Text>:  Rate : 3.50/KM for distance above 100KM </Text>
        <Text>Rate : 4.50/KM for distance below 100KM</Text>

    



  </View>

<ScrollView>

    {renderElements}
    <View style={{height:500}} >

    </View>
</ScrollView>
    </View>
)
}
export default React.memo(BookLContract)


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
