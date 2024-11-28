import React from "react";
import { db, auth } from "../config/fireBase";
import { collection, doc, getDoc, addDoc, serverTimestamp ,query , where , getDocs} from 'firebase/firestore';

import { View , TextInput , Text, Alert ,TouchableOpacity , ActivityIndicator, StyleSheet} from "react-native";

import inputstyles from "../styles/inputElement";


function VerifyNewUser () {

const [error , setError]= React.useState("")

  const loadsCollection = collection(db, "verifiedUsers");
 
  const [username, setUsername] = React.useState("");
  
  const [verificationState , setverificationState] = React.useState(false)
  const [addedUserId , setAddedUserId] = React.useState('')

    const [spinnerItem, setSpinnerItem] = React.useState(false);
  const handleSubmit = async () => {
   
    try {
      const docRef = await addDoc(loadsCollection, {
        isVerifiedValue : verificationState ,
        deletionTime :Date.now() + 30 * 24 * 60 * 60 * 1000 ,
        timeStamp : serverTimestamp() ,
        userId : addedUserId
    });

    
      setSpinnerItem(false)
    } catch (err) {
      setSpinnerItem(false)
      setError(err.toString());
      }
  };

  return (
    <View   style={{alignItems :'center', paddingTop : 80}}>
       
         <TextInput
            placeholder="Username"
            type="text"
            value={username}
           onChangeText={(text) => setUsername(text)}
           style={inputstyles.inputElem}
          />
        <TouchableOpacity>
          <Text>verify </Text>
        </TouchableOpacity>


      { spinnerItem &&<ActivityIndicator size={36} />}
        {error &&<Text>{error}</Text>}



  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center'}}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>

</View>
  );
}

export default React.memo(VerifyNewUser);


