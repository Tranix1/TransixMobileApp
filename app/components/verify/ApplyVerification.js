import React,{useState} from "react";
import {View , TouchableOpacity , Text , StyleSheet , ScrollView , TextInput,ActivityIndicator  } from "react-native"

import { db, auth } from "../config/fireBase";

import * as DocumentPicker from 'expo-document-picker';

import inputstyles from "../styles/inputElement";

import { storage } from "../config/fireBase";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";
import { collection, doc, getDoc, addDoc ,serverTimestamp , onSnapshot , setDoc, runTransaction} from 'firebase/firestore';
function ApplyVerification({route}) {
  const {username , contact} = route.params
   const [formData, setFormData] = React.useState({
    buzLoc :"",
    phoneNumCalls :"",
    phoneNumApp :"" ,
    contactEmail :"",
    addressWithProof :"" ,

  });

    const  handleTypedText  = (value, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

    const [spinnerItem, setSpinnerItem] = React.useState(false);


 const [selectedDocuments, setSelectedDocumentS] = useState([]);

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


  const gitCollection = collection(db, "verifactionDetails");
async function handleSubmit(){
      setSpinnerItem(true)


  const uploadImage = async (image) => {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `verifactionDetails/` + new Date().getTime() );
    
    const snapshot = await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);
    
    return imageUrl;
}

let certOIncop , memoOAssociation , taxClearance , buzProfile , NationalId , proofORes  ;


  certOIncop= await uploadImage(selectedDocuments[0]);
  memoOAssociation= await uploadImage(selectedDocuments[1]);
  taxClearance= await uploadImage(selectedDocuments[2]);
  buzProfile= await uploadImage(selectedDocuments[3]);
  NationalId= await uploadImage(selectedDocuments[4]);
  proofORes= await uploadImage(selectedDocuments[5]);

  const userId = auth.currentUser.uid
  try {
      const docRef = await addDoc(gitCollection, {
        userId: userId, // Add the user ID to the document
        companyName: username,
        contact: contact,
        certOIncop  :certOIncop ,
        memoOAssociation :memoOAssociation ,
        taxClearance :taxClearance ,
        buzProfile :buzProfile,
        NationalId :NationalId ,
        proofORes :proofORes ,
        ...formData 
      });

      setFormData({
        buzLoc :"",
        phoneNumCalls :"",
        phoneNumApp :"" ,
        contactEmail :"",
        addressWithProof :"" ,

      });
      setSpinnerItem(false)
      alert("doneee")
   
    } catch (err) {
      setSpinnerItem(false)
      console.error(err.toString());
      }
}


return(
    <View style={{alignItems:'center'}} >




  <View>    

{selectedDocuments[0] && <Text>{selectedDocuments[0].name }</Text> }
<TouchableOpacity onPress={pickDocument}>
  <Text>Cerificate of incoperation</Text>
</TouchableOpacity>
           

{selectedDocuments[1] && <Text>{selectedDocuments[1].name }</Text> }
<TouchableOpacity onPress={pickDocument}>
  <Text>memorendum of Association</Text>
</TouchableOpacity>
            
{selectedDocuments[2] && <Text>{selectedDocuments[2].name }</Text> }
<TouchableOpacity onPress={pickDocument}>
 <Text>Tax clearance</Text>           
</TouchableOpacity>


{selectedDocuments[3] && <Text>{selectedDocuments[3].name }</Text> }
 <Text>Add buz profile if available</Text>      
<TouchableOpacity onPress={pickDocument}>
  <Text>pickDocument</Text>
 <Text>Business profile</Text> 
</TouchableOpacity>

            <TextInput 
          value={formData.buzLoc}
          placeholderTextColor="#6a0c0c"
          placeholder="company adress"
          onChangeText={(text) => handleTypedText(text, 'buzLoc')}
          type="text"
          style={inputstyles.addIterms }
        />
    </View>


    <View>


{selectedDocuments[4] && <Text>{selectedDocuments[4].name }</Text> }
    <TouchableOpacity onPress={pickDocument}>
      <Text>National Id</Text>
    </TouchableOpacity>

        
        <TextInput 
              value={formData.phoneNumCalls}
              placeholderTextColor="#6a0c0c"
              placeholder="phone number"
              onChangeText={(text) => handleTypedText(text, 'phoneNumCalls')}
              type="text"
              style={inputstyles.addIterms }
            />

         <TextInput 
              value={formData.phoneNumApp}
              placeholderTextColor="#6a0c0c"
              placeholder="WhtsApp tag"
              onChangeText={(text) => handleTypedText(text, 'phoneNumApp')}
              type="text"
              style={inputstyles.addIterms }
            />
              <TextInput 
              value={formData.contactEmail}
              placeholderTextColor="#6a0c0c"
              placeholder="email"
              onChangeText={(text) => handleTypedText(text, 'contactEmail')}
              type="text"
              style={inputstyles.addIterms }
            />
    </View>


<View>

      { spinnerItem &&<ActivityIndicator size={36} />}



{selectedDocuments[5] && <Text>{selectedDocuments[5].name }</Text> }
<TouchableOpacity onPress={pickDocument}>
  <Text>Proof of res of business or any of the directors</Text>
</TouchableOpacity>


<Text>Proof </Text>
            <TextInput 
          value={formData.addressWithProof}
          placeholderTextColor="#6a0c0c"
          placeholder="adress verification"
          onChangeText={(text) => handleTypedText(text, 'addressWithProof')}
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