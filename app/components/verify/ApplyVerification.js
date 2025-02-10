import React,{useState} from "react";
import {View , TouchableOpacity , Text , StyleSheet , ScrollView , TextInput,ActivityIndicator  } from "react-native"

import { collection, doc, addDoc, serverTimestamp ,} from 'firebase/firestore';
import { db, auth } from "../config/fireBase";

import * as DocumentPicker from 'expo-document-picker';

import inputstyles from "../styles/inputElement";

function ApplyVerification(params) {
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


 const [selectedDocument, setSelectedDocumentS] = useState(null);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

    if (result.cancelled) {
      return
    }

  if (result.assets && result.assets.length > 0) {
          const firstAsset = result.assets[0];
          if (firstAsset.uri) {
            // Check the file size before setting the image
            if (firstAsset.fileSize > 1.5 * 1024 * 1024) { // 1.5MB in bytes
              alert('The selected Document must not be more than 1.5MB.');
              return;
            }

            setSelectedDocumentS(prevDocs => [...prevDocs, firstAsset]);
            // uploadImageSc(firstAsset); // Call uploadImage with the selected asset
          } else {
            alert('Selected image URI is undefined');
          }
        } else {
          alert('No assets found in the picker result');
        }

  }


  const gitCollection = collection(db, "gitCutsomer");
async function handleSubmit(){
      setSpinnerItem(true)


  const uploadImage = async (image) => {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `Trucks/` + new Date().getTime() );
    
    const snapshot = await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);
    
    return imageUrl;
}

let certOIncop  ;


  certOIncop= await uploadImage(images[0]);

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
    <View style={{alignItems:'center'}} >
<TouchableOpacity onPress={pickDocument}>
  <Text>pickDocument</Text>
</TouchableOpacity>

 {selectedDocument && (
        <View>
          <Text>Selected PDF document:</Text>
          <Text>{selectedDocument.name}</Text>
        </View>
      )}

  <View>    


<TouchableOpacity onPress={pickDocument}>
  <Text>Cerificate of incoperation</Text>
</TouchableOpacity>
           

<TouchableOpacity onPress={pickDocument}>
  <Text>memorendum of Association</Text>
</TouchableOpacity>
            
 <Text>Tax clearance</Text>           
<TouchableOpacity onPress={pickDocument}>
  <Text>pickDocument</Text>
</TouchableOpacity>
          
 <Text>Business profile</Text> 
 <Text>Add buz profile if available</Text>      
<TouchableOpacity onPress={pickDocument}>
  <Text>pickDocument</Text>
</TouchableOpacity>

    </View>


    <View>


    <TouchableOpacity onPress={pickDocument}>
      <Text>National Id</Text>
    </TouchableOpacity>

        <TextInput 
              value={formData.productsTransported}
              placeholderTextColor="#6a0c0c"
              placeholder="national id"
              onChangeText={(text) => handleTypedText(text, 'productsTransported')}
              type="text"
              style={inputstyles.addIterms }
            />
        <TextInput 
              value={formData.productsTransported}
              placeholderTextColor="#6a0c0c"
              placeholder="phone number"
              onChangeText={(text) => handleTypedText(text, 'productsTransported')}
              type="text"
              style={inputstyles.addIterms }
            />

         <TextInput 
              value={formData.productsTransported}
              placeholderTextColor="#6a0c0c"
              placeholder="phone number"
              onChangeText={(text) => handleTypedText(text, 'productsTransported')}
              type="text"
              style={inputstyles.addIterms }
            />
    </View>


<View>
<TouchableOpacity onPress={pickDocument}>
  <Text>pickDocument</Text>
</TouchableOpacity>
      { spinnerItem &&<ActivityIndicator size={36} />}
            <TextInput 
          value={formData.valueOProductsRange}
          placeholderTextColor="#6a0c0c"
          placeholder="company adress"
          onChangeText={(text) => handleTypedText(text, 'valueOProductsRange')}
          type="text"
          style={inputstyles.addIterms }
        />



<TouchableOpacity onPress={pickDocument}>
  <Text>Proof of res of business or any of the directors</Text>
</TouchableOpacity>


<Text>Proof </Text>
            <TextInput 
          value={formData.localOSADC}
          placeholderTextColor="#6a0c0c"
          placeholder="adress verification"
          onChangeText={(text) => handleTypedText(text, 'localOSADC')}
          type="text"
          style={inputstyles.addIterms }
        />

 </View>


          {!spinnerItem ?  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
: <Text style={{alignSelf:"center",fontStyle:'italic'}}>Information being submited. Please wait</Text>  
}
    </View>
)  
}
export default React.memo(ApplyVerification)