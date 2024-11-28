import React,{useEffect} from "react";
import { View , Text , ScrollView } from 'react-native';

import { auth, db,  } from "../config/fireBase";
import {onSnapshot , collection,  doc, runTransaction,  } from "firebase/firestore"

function Updates(){


// Assuming userId is the unique identifier for each user
const userId = auth.currentUser.uid
const docRef = doc(db, 'newItems', 'changeOneByOne');

runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);

    if (docSnap.exists()) {
        const userData = docSnap.data().users || {};

        // Get the current count for the user, default to 0 if not set
        const currentUserCount = userData[userId] || 0;

        // Set the count to 0 for the current user
        userData[userId] = 0;

        transaction.update(docRef, {
            users: userData
        });
    }
});


  const updatesDB= collection(db, "updates");

  const [updates , setUpdates]=React.useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(updatesDB, (querySnapshot) => {
      let filteredData = [];

      querySnapshot.forEach((doc) => {
        filteredData.push({
          id: doc.id,
          ...doc.data()
        });
      });
     
          filteredData = filteredData.sort((a, b) => b.timeStamp - a.timeStamp);

      setUpdates(filteredData);
    });

    return () => {
      unsubscribe(); // Unsubscribe the listener when the component unmounts
    };
  }, []); 

const rendereIterms = updates.map((item)=>{ 
return (

        <View>

            <View>

               {item.imageUrl&& <Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
            
                <Text> {item.detailOfUpdate}</Text>
                <Text style={{fontSize:12 , fontStyle:'italic' , color:'green'}} >Date {item.currentDateTime} @ {item.currentTime}  </Text>
            </View>
        </View>
)
})

    return(
      <View style={{paddingTop:10}} > 
            

           <ScrollView style={{padding : 10 }}>
         {updates.length > 0 ? rendereIterms   : <Text>updates Loading.........</Text>}
         <View style={{height : 550}} >
           </View>
        </ScrollView>
         </View>
    )

}
export default React.memo(Updates)