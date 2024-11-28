import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db, auth } from '../config/fireBase';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import inputstyles from "../styles/inputElement"

function CreateUser({route , navigation}) {

 const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [spinnerItem, setSpinnerItem] = useState(null);

  const sendVerificationCode = async () => {
    setSpinnerItem(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await  
      sendEmailVerification(user); 
        setPassword("")
        setEmail("")
        setSpinnerItem(false)
      Alert.alert('Verification Email Sent', 'Please Verify Your Email To Continue');
      navigation.navigate("addPersnoalInfo")
    } catch (error) {
        setSpinnerItem(false)
      setError(error.message);
    }
  };

  

 

  return (
      <View style={{alignItems:'center' , marginTop: 40}} >
        <Text> </Text>
        <Text>{error} </Text>
        <TextInput
          placeholder="Email"
           onChangeText={(text) => setEmail(text)}
           style={inputstyles.inputElem}
        />
         {spinnerItem && <ActivityIndicator/>}
        <TextInput
          placeholder="Password"
          type="password"
           onChangeText={(text) => setPassword(text)}
           style={inputstyles.inputElem}
        />

           <TouchableOpacity onPress={sendVerificationCode} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 35 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center' , marginBottom : 10}} >
        <Text style={{color : 'white'}}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>navigation.navigate('signInexistAcc')} style={{ height : 35,justifyContent : 'center' , alignItems : 'center' ,width : 80 ,borderWidth: 2 ,borderColor:"#6a0c0c" ,borderRadius: 10}}>
                    <Text style={{color :'#6a0c0c'}}>  Sign In</Text>
        </TouchableOpacity>

    </View>
  );
}

export default CreateUser;