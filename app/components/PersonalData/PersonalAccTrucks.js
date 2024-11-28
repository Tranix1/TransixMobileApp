import React,{useEffect} from "react";
import { View ,Text,Image , ScrollView , TouchableOpacity , ActivityIndicator} from "react-native";
import { auth, db } from '../config/fireBase'; 
import { collection, onSnapshot,where ,query , doc , deleteDoc} from 'firebase/firestore';
// import defaultImage from "../images/logo.jpg"

import AntDesign from '@expo/vector-icons/AntDesign';
function PersonalAccTrucks(){

    const [spinnerItem, setSpinnerItem] = React.useState(false);
    const deleteLoad = async (id) => {

      setSpinnerItem(true)
    const loadsDocRef = doc(db, 'Trucks' , id);
    await deleteDoc(loadsDocRef);
      setSpinnerItem(false)
  };

//     const deleteLoad = async (id) => {
//     const loadsDocRef = doc(db, 'Loads' , id);
//     await deleteDoc(loadsDocRef);
//     } 
//     const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/{YOUR_STORAGE_BUCKET}/o/{IMAGE_PATH}';

// fetch(imageUrl, {
//   method: 'DELETE',
// })
//   .then(response => {
//     if (response.ok) {
//       console.log('Image deleted successfully');
//     } else {
//       console.error('Error deleting image:', response.status);
//     }
//   })
//   .catch(error => {
//     console.error('Error deleting image:', error);
//   });

    const [loadIterms , setLoadedIterms ]= React.useState([])
  useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const dataQuery = query(collection(db, "Trucks"), where("userId", "==", userId));

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          setLoadedIterms(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
      }
    } catch (err) {
      console.error(err);
    }
  }, []); 

      const rendereIterms = loadIterms.map((item)=>{
    return(
    <View style={{padding: 8}} >
            {item.imageUrl&& <Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
          {/* {!item.imageUrl && <Image source={defaultImage} style={{ height: 200, borderRadius: 10 , width : 368}} />} */}
    <Text className="truck-name">{item.CompanyName} </Text>
      <Text className="location"> From {item.fromLocation} to {item.toLocation} </Text>
      <Text>contact {item.contact}</Text>

      { spinnerItem &&<ActivityIndicator size={36} />}
       <TouchableOpacity onPress={()=>deleteLoad(item.id)} >
          <AntDesign name="delete" size={24} color="red" />

        </TouchableOpacity> 
    </View>
    )
  })
  return(
  <View style={{paddingTop : 10}} > 
      
    <ScrollView>
        {loadIterms.length > 0 ? rendereIterms: <Text>Loading...... </Text> }
    </ScrollView> 
    </View>
  )
}
export default PersonalAccTrucks