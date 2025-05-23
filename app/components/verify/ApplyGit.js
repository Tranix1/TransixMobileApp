import React from "react"
import {View , TouchableOpacity , Text , StyleSheet , ScrollView , TextInput,ActivityIndicator  } from "react-native"
import { collection, doc, addDoc, serverTimestamp ,} from 'firebase/firestore';
import { db, auth } from "../config/fireBase";

import inputstyles from "../styles/inputElement";
function ApplyGit({username , contact}){
  const [formData, setFormData] = React.useState({
  noOfTrucks:"",
  productsTransported :"",
  valueOProductsRange :"",
  tripNumRangeMonth:"",
  localOSADC:"" ,

  });

    const  handleTypedText  = (value, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

    const [spinnerItem, setSpinnerItem] = React.useState(false);

  const gitCollection = collection(db, "gitCutsomer");
async function handleSubmit(){
      setSpinnerItem(true)
  try {
      const docRef = await addDoc(gitCollection, {
        userId: userId, // Add the user ID to the document
        companyName: username,
        contact: contact,
        ...formData 
      });

      setFormData({
        noOfTrucks:"",
        productsTransported :"",
        valueOProductsRange :"",
        tripNumRangeMonth:"",
        localOSADC:"" ,
      });
   
    } catch (err) {
      setSpinnerItem(false)
      setError(err.toString());
      }
}

return(
    <View style={{alignItems:'center',marginTop:10}} >
    <Text style={{  fontWeight: 'bold', }}>Please provide a rough estimate for the following question.</Text>
    <Text style={{ marginTop:9 , fontStyle:'italic' , color : "gray"}}>If possible, include a range (e.g., 10 - 20).</Text>

        <TextInput 
  value={formData.noOfTrucks}
  placeholderTextColor="#6a0c0c"
  placeholder="Number of trucks you own"
  onChangeText={(text) => handleTypedText(text, 'noOfTrucks')}
  type="text"
  style={inputstyles.addIterms}
  keyboardType="numeric"              
/>

<TextInput 
  value={formData.productsTransported}
  placeholderTextColor="#6a0c0c"
  placeholder="Type of products transported"
  onChangeText={(text) => handleTypedText(text, 'productsTransported')}
  type="text"
  style={inputstyles.addIterms}
/>

{spinnerItem && <ActivityIndicator size={36} />}

<TextInput 
  value={formData.valueOProductsRange}
  placeholderTextColor="#6a0c0c"
  placeholder="Estimated value of products"
  onChangeText={(text) => handleTypedText(text, 'valueOProductsRange')}
  type="text"
  style={inputstyles.addIterms}
/>

<TextInput 
  value={formData.tripNumRangeMonth}
  placeholderTextColor="#6a0c0c"
  placeholder="Number of completed trips per month"
  onChangeText={(text) => handleTypedText(text, 'tripNumRangeMonth')}
  type="text"
  style={inputstyles.addIterms}
/>

<TextInput 
  value={formData.localOSADC}
  placeholderTextColor="#6a0c0c"
  placeholder="Do you operate within the SADC region? (Yes/No)"
  onChangeText={(text) => handleTypedText(text, 'localOSADC')}
  type="text"
  style={inputstyles.addIterms}
/>
          {!spinnerItem ?  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
: <Text style={{alignSelf:"center",fontStyle:'italic'}}>Information being submited. Please wait</Text>  
}
    </View>
)
}
export default React.memo(ApplyGit)