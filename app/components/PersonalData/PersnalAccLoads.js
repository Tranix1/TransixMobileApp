import React,{useEffect} from "react";

import { View ,Text,Image, TouchableOpacity,ScrollView , StyleSheet , ActivityIndicator } from "react-native";
import { auth, db } from '../config/fireBase'; 
import { collection, onSnapshot,where ,query , doc , deleteDoc} from 'firebase/firestore';
// import AntDesign from '@expo/vector-icons/AntDesign';
   
import AntDesign from '@expo/vector-icons/AntDesign';

function PersonalAccLoads(){


    const [spinnerItem, setSpinnerItem] = React.useState(false);
    const deleteLoad = async (id) => {
      setSpinnerItem(true)
    const loadsDocRef = doc(db, 'Loads' , id);
    await deleteDoc(loadsDocRef);
      setSpinnerItem(false)
  };

 const [loadIterms , setLoadedIterms ]= React.useState([])
  useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const dataQuery = query(collection(db, "Loads"), where("userId", "==", userId));

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          let loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
          setLoadedIterms(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
      }
    } catch (err) {
      console.error(err);
    }
  }, [spinnerItem]); 


   const rendereIterms =  loadIterms.map((item)=>{ 
  return(
    <View  style={{ backgroundColor:  "#DDDDDD", marginBottom : 8, padding :6  }} >
        <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}}> {item.companyName} </Text>
        <Text>Contact : {item.contact}</Text>
        <Text>type of load {item.typeofLoad} </Text>
        <Text>from {item.fromLocation} to {item.toLocation} </Text>
        <Text>Rate {item.ratePerTonne} </Text>
        <Text> payment terms {item.paymentTerms} </Text>
        <Text>Requirements {item.requirements} </Text>
        <Text>additional info {item.additionalInfo} </Text>        

      { spinnerItem &&<ActivityIndicator size={36} />}
            <TouchableOpacity onPress={()=>deleteLoad(item.id)} >
          <AntDesign name="delete" size={24} color="red" />
            </TouchableOpacity>
      </View>     
  )})

  return(<View style={{paddingTop : 10}} > 
    <ScrollView>
      
        {loadIterms.length > 0 ? rendereIterms : <Text>Loading.....</Text> } 
    </ScrollView> 
    </View>
  )
}
export default React.memo(PersonalAccLoads)


