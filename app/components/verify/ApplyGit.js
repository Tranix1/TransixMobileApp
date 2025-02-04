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
    <View>
            <TextInput 
          value={formData.noOfTrucks}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Load"
          onChangeText={(text) => handleTypedText(text, 'noOfTrucks')}
          type="text"
          style={inputstyles.addIterms }
        />
    <TextInput 
          value={formData.productsTransported}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Load"
          onChangeText={(text) => handleTypedText(text, 'productsTransported')}
          type="text"
          style={inputstyles.addIterms }
        />
      { spinnerItem &&<ActivityIndicator size={36} />}
            <TextInput 
          value={formData.valueOProductsRange}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Load"
          onChangeText={(text) => handleTypedText(text, 'valueOProductsRange')}
          type="text"
          style={inputstyles.addIterms }
        />
            <TextInput 
          value={formData.tripNumRangeMonth}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Load"
          onChangeText={(text) => handleTypedText(text, 'tripNumRangeMonth')}
          type="text"
          style={inputstyles.addIterms }
        />
            <TextInput 
          value={formData.localOSADC}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Load"
          onChangeText={(text) => handleTypedText(text, 'localOSADC')}
          type="text"
          style={inputstyles.addIterms }
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