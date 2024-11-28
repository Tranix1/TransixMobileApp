import React from "react";
import { View,TouchableOpacity ,  Text  } from "react-native";
import { onSnapshot  , query ,collection,where } from "firebase/firestore"
import { auth ,db} from "../config/fireBase";

import { useNavigation } from '@react-navigation/native';

function SelectChat(){

  const navigation = useNavigation();


  const [ppleInTouch , setPpleInTouch] =React.useState([])
React.useEffect(() => {
  try {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const whenSendingMsg = query(collection(db, "ppleInTouch"), where("msgSenderId", "==", userId));
      const whenReceiving = query(collection(db, "ppleInTouch"), where("msgReceiverId", "==", userId));

      let sendedMsgs = [];
      const unsubscribe1 = onSnapshot(whenSendingMsg, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const dataWithId = { id: doc.id, ...doc.data() };
          sendedMsgs.push(dataWithId);
        });

         sendedMsgs = [ ...sendedMsgs];

      });

      const unsubscribe2 = onSnapshot(whenReceiving, (querySnapshot) => {
        const reacevedMsg = [];
        querySnapshot.forEach((doc) => {
          const dataWithId = { id: doc.id, ...doc.data() };
          reacevedMsg.push(dataWithId);
        });

        const combineBoth = [...reacevedMsg, ...sendedMsgs];
        setPpleInTouch(combineBoth);
      });

      return () => {
        unsubscribe1(); // Clean up the listener when the component unmounts
        unsubscribe2(); // Clean up the listener when the component unmounts
      };
    }
  } catch (error) {
    console.error(error);
  }
  return () => {
    unsubscribe(); // Clean up the listeners when the component unmounts
  };
}, []);


  let _ppleInTouch = ppleInTouch.map((item)=>{
    const userId = auth.currentUser.uid

    if(item.msgSenderId === userId){
    return(
      <TouchableOpacity  key={item.id} style={{height : 30  , alignItems : 'center' , margin : 10}} onPress={()=>navigation.navigate('message', {gchatId :item.chatId , receiverName : item.receiverName , senderName : item.senderName})}>
        <Text>{item.receiverName} </Text>
      </TouchableOpacity>
    )
    }else{
      return(
        <TouchableOpacity onPress={()=>navigation.navigate('message', {gchatId :item.chatId , receiverName : item.receiverName , senderName : item.senderName})} key={item.id}>
          <Text>{item.senderName} </Text>
        </TouchableOpacity>
      )
    }
  } )

return(<View style={{padding : 10}} >
  <TouchableOpacity onPress={()=>navigation.navigate('mainGroup') } style={{borderBlockColor : "#6a0c0c" , width : 300 , borderWidth : 2, marginTop :10 ,  height : 40  ,justifyContent : 'center' , alignItems:'center'}} >
    <Text>Main Group </Text>
  </TouchableOpacity>
  {_ppleInTouch}
</View>

)
}
export default React.memo(SelectChat)