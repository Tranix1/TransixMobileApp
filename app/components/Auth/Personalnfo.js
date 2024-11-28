import React from "react";
import {Alert, TextInput, TouchableOpacity, View ,  Text,ActivityIndicator}from "react-native"
import {auth , db} from "../config/fireBase"
import { query , doc ,  getDocs,collection,where,setDoc,  } from "firebase/firestore"

import CountryPicker from 'react-native-country-picker-modal';
import inputstyles from "../styles/inputElement";

function PersonalAccInfo({navigation , route}){


  const [errorOccur , setErrorOccur] = React.useState("")
  const [username, setUsername] = React.useState("");

  const [contact, setContact] = React.useState("");
  const [countryCode , setCountryCode] = React.useState(null)

 const [spinnerItem, setSpinnerItem] = React.useState(null);

const handleSubmitData = async (event) => {
     setSpinnerItem(true)
    if(!countryCode){
        Alert.alert("Select country code ")
        setCountryCode(false)
        return
    }else if(!contact){
        Alert.alert("Enter your phone number")
        setCountryCode(false)
        return
    }
    
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
      const usernameValue = username; // Store the username value in a separate variable

      if (usernameValue) { // Check if the username value is defined and not empty
        // Check if username already exists
        const usernamesRef = collection(db, 'personalData'); // Get the usernames collection reference
        const usernameQuery = query(usernamesRef, where('username', '==', usernameValue)); // Create a query to check username

        const querySnapshot = await getDocs(usernameQuery); // Get matching documents, if any

        if (querySnapshot.empty) {
          // Username is not found, add it to the database
          await setDoc(doc(db, 'personalData', userId), { username: usernameValue, contact: `+${countryCode}${contact}` });
          setUsername("");
          setContact("");
           setSpinnerItem(false)
           navigation.navigate('Truckerz')
        } else {
          // Username already exists, handle the situation here
          setErrorOccur('Username already exists!');
               setSpinnerItem(false)
        }
      } else {
        setErrorOccur('Username is undefined or empty!');
             setSpinnerItem(false)
      }
    }
  } catch (err) {
      setErrorOccur(err.toString());
           setSpinnerItem(false)
  }
};





  const [callingCode, setCallingCode] = React.useState('');

const handleCountrySelect = (country) => {
  setCallingCode(country.cca2);
    setCountryCode(country.callingCode);
  };
  
    return(
        <View style={{paddingTop:60 , alignItems:'center' }} > 

            {errorOccur&& <Text>{errorOccur} </Text>}
     {!countryCode&&  <CountryPicker
        countryCode={callingCode}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelect}

      />
        }      
      {countryCode && <Text>{countryCode}</Text>}
          <TextInput
            placeholder="Username"
            type="text"
            value={username}
           onChangeText={(text) => setUsername(text)}
           style={inputstyles.inputElem}
          />
         {spinnerItem && <ActivityIndicator/>}
          <TextInput
            placeholder="contact"
            type="text"
            value={contact}
           onChangeText={(text) => setContact(text)}
            keyboardType="numeric"
           style={inputstyles.inputElem}
          />
        <TouchableOpacity onPress={handleSubmitData} >
            <Text style={{textDecorationLine : 'underline', fontSize : 17}} >Get Started </Text>
        </TouchableOpacity>

        
        </View>

    )
}
export default PersonalAccInfo