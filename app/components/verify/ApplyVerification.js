import React,{useState} from "react";
import {View , TouchableOpacity , Text , StyleSheet , ScrollView , TextInput,ActivityIndicator  } from "react-native"

import { db, auth } from "../config/fireBase";

import * as DocumentPicker from 'expo-document-picker';

import inputstyles from "../styles/inputElement";

import { storage } from "../config/fireBase";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";
import { collection, doc, getDoc, addDoc ,serverTimestamp , onSnapshot , setDoc, runTransaction} from 'firebase/firestore';


import CountryPicker from 'react-native-country-picker-modal';

function ApplyVerification({route}) {
  const {username , contact} = route.params
   const [formData, setFormData] = React.useState({
    buzLoc :"",
    phoneNumFrst :"",
    phoneNumSc :"" ,
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

  const [countryCode , setCountryCode] = React.useState(null)
    const [callingCode, setCallingCode] = React.useState('');

    const handleCountrySelect = (country) => {
      setCallingCode(country.cca2);
        setCountryCode(country.callingCode);
      };


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
        phoneNumFrst :"",
        phoneNumSc :"" ,
        contactEmail :"",
        addressWithProof :"" ,

      });
      setSpinnerItem(false)
   
    } catch (err) {
      setSpinnerItem(false)
      console.error(err.toString());
      }
}


const [enterCompDw , setEntCompDe]= React.useState(true)
const [directorDetails , setDirectorDet]=React.useState(false)
const [addressWithProof , setAdressWithProof]=React.useState(false)

      function goToPersnalInfoF(){
      setEntCompDe(false)
      setDirectorDet(true)
      }


return(
    <View style={{alignItems:'center',marginTop:20}} >


{ enterCompDw&& <View>    

{selectedDocuments[2] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center"}} >certifacete of incoperation</Text>}
{selectedDocuments[0] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:15}} >{selectedDocuments[0].name }</Text> }

{!selectedDocuments[0] &&<TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40 , justifyContent:'center' ,alignSelf:'center', marginBottom:15,width:200}} >
  <Text style={{backgroundColor:'white',textAlign:'center'  }}>Cerificate of incoperation</Text>
</TouchableOpacity>}
           
{selectedDocuments[2] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center"}} >Board Resolution</Text>}
{selectedDocuments[1] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:15}}>{selectedDocuments[1].name }</Text> }
  {selectedDocuments[0] &&  !selectedDocuments[1] &&<Text  >CR14, Memorandum of Association, Register of Directors </Text>}
{selectedDocuments[0] && !selectedDocuments[1] &&<TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40, justifyContent:'center' ,alignSelf:'center',marginBottom:15,width:200}} >
<Text style={{textAlign:'center',backgroundColor:'white'}} >Board Resolution</Text>
</TouchableOpacity>}
            
            {selectedDocuments[2] && <Text>Tax clearance</Text>}
{selectedDocuments[2] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:15}}>{selectedDocuments[2].name }</Text> }
{selectedDocuments[1] && !selectedDocuments[2] && <TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40 , justifyContent:'center' ,alignSelf:'center',marginBottom:15,width:200}} >
 <Text style={{backgroundColor:'white'}} >Tax clearance</Text>           
</TouchableOpacity>}



      <TextInput 
          value={formData.buzLoc}
          placeholderTextColor="#6a0c0c"
          placeholder="company adress"
          onChangeText={(text) => handleTypedText(text, 'buzLoc')}
          type="text"
          style={inputstyles.addIterms }
        />

  { selectedDocuments.length === 3 && formData.buzLoc&& <TouchableOpacity onPress={goToPersnalInfoF} >
    <Text>NEXT PAGE</Text>
  </TouchableOpacity>}


    </View>}


    {directorDetails&&<View>

<Text>Prove business ownership Or represntative</Text>

<Text>The id of a director or owner must match in company documents </Text>
{selectedDocuments[4] && <Text>{selectedDocuments[4].name }</Text> }
    <TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}} >
      <Text>National Id</Text>
    </TouchableOpacity>


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
              value={formData.phoneNumFrst}
              placeholderTextColor="#6a0c0c"
              placeholder="phone number"
              onChangeText={(text) => handleTypedText(text, 'phoneNumFrst')}
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
    </View>}


      { spinnerItem &&<ActivityIndicator size={36} />}

{addressWithProof&&<View>


<Text>Address and proof for the business or director</Text>

{selectedDocuments[5] && <Text>{selectedDocuments[5].name }</Text> }
<TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}} >
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

 </View>}


          {!spinnerItem ?  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
: <Text style={{alignSelf:"center",fontStyle:'italic'}}>Information being submited. Please wait</Text>  
}
    </View>
)  
}
export default React.memo(ApplyVerification)