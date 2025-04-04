import React,{useState} from "react";
import {View , TouchableOpacity , Text , StyleSheet , ScrollView , TextInput,ActivityIndicator,Animated  } from "react-native"

import { db, auth } from "../config/fireBase";

import * as DocumentPicker from 'expo-document-picker';

import inputstyles from "../styles/inputElement";

import { storage } from "../config/fireBase";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";
import { collection, doc, getDoc, addDoc ,serverTimestamp , onSnapshot , setDoc, runTransaction} from 'firebase/firestore';


import CountryPicker from 'react-native-country-picker-modal';

const { Paynow } = require("paynow");

function ApplyVerification({route}) {
  const {username , contact} = route.params
   const [formData, setFormData] = React.useState({
    buzLoc :"",
    phoneNumFrst :"",
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
  let result = await DocumentPicker.getDocumentAsync();

  if (result.cancelled) {
    return;
  }

  if (result.assets && result.assets.length > 0) {
    const firstAsset = result.assets[result.assets.length - 1]; // Access the last element of the assets array
    if (firstAsset.uri) {
      // Check the file size before setting the document
      if (firstAsset.fileSize > 0.5 * 1024 * 1024) { // 0.5MB in bytes
        alert('The selected document must not be more than 0.5MB.');
        return;
      }

      setSelectedDocumentS(prevDocs => [...prevDocs, firstAsset]);
      // uploadImageSc(firstAsset); // Call uploadImage with the selected asset
    } else {
      alert('Selected document URI is undefined');
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

let certOIncop , memoOAssociation , taxClearance  , NationalId , proofORes  ;


  certOIncop= await uploadImage(selectedDocuments[0]);
  memoOAssociation= await uploadImage(selectedDocuments[1]);
  taxClearance= await uploadImage(selectedDocuments[2]);
  NationalId= await uploadImage(selectedDocuments[3]);
  proofORes= await uploadImage(selectedDocuments[4]);

  const userId = auth.currentUser.uid
  try {
      const docRef = await addDoc(gitCollection, {
        userId: userId, // Add the user ID to the document
        companyName: username,
        contact: contact,
        certOIncop  :certOIncop ,
        memoOAssociation :memoOAssociation ,
        taxClearance :taxClearance ,
        NationalId :NationalId ,
        proofORes :proofORes ,
        buzLoc : formData.buzLoc ,
        phoneNumFrst : `${callingCode}${formData.phoneNumFrst}` ,
        contactEmail : formData.contactEmail ,
        addressWithProof : formData.addressWithProof
      });

      setFormData({
        buzLoc :"",
        phoneNumFrst :"",
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

const [paymentPage , setPaymentPage]=React.useState(false)

      function goToPersnalInfoF(){
      setEntCompDe(false)
      setDirectorDet(true)
      }
      function secondPage() {
        setDirectorDet(false)
        setAdressWithProof(true)
      }

      function dspPaymentPage(){
        setAdressWithProof(false)
        setPaymentPage(true)
      }


      
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const getItemStyle = (item) => {
    if (selectedItem === item) {
      return [styles.item, styles.selected];
    }
    return styles.item;
  };

  const getSelectedStyle = (item) => {
    if (selectedItem === item) {
      return styles.selectedItem;
    }
    return null;
  };
  const [ecocashPhoneNum, setEcocashPhneNum] = useState('');
  const animatedValue = new Animated.Value(100);

  const startAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

function handleMakePayement() {
  let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");
  // Create a new payment inside the function to avoid stale data

  let payment = paynow.createPayment("Invoice 37", "kelvinyaya8@gmail.com");
  
  paynow.resultUrl = "https://transix.net";
  paynow.returnUrl = "https://transix.net";
  // Add items/services
  payment.add("Bananas", 2.5);


  paynow.sendMobile(payment, "0771111111", "ecocash")
    .then(response => {
      if (response.success) {
        let pollUrl = response.pollUrl; // Save this URL to check the payment status
          paynow.pollTransaction(pollUrl)
            .then(status => {

                  if (status.status === "paid") {
                    console.log("✅ Payment Complete!");
                    console.log(pollUrl)
                  } else {
                    console.log("❌ Payment Not Complete. Current status:", status.status);

                  }
            })
      } else {
        console.log("Error:", response.error);
      }
    })
    .catch(err => console.log("Error:", err));
}



return(
    <View style={{alignItems:'center',}} >

  {enterCompDw &&<Text style={{position:"absolute", top :0 , left :5, color :'green',marginTop:8}} >PAGE 1/4</Text>}
  {directorDetails &&<Text style={{position:"absolute", top :3 , left :5, color :'green'}} >PAGE 2/4</Text>}
  {addressWithProof &&<Text style={{position:"absolute", top :3 , left :5, color :'green'}} >PAGE 3/4</Text>}
  {paymentPage &&<Text style={{position:"absolute", top :3 , left :5, color :'green'}} >PAGE 4/4</Text>}

{ enterCompDw&& <View style={{marginTop:20}}>    

{selectedDocuments[0] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center",fontSize:12}} >certifacete of incoperation</Text>}
{selectedDocuments[0] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:15}} >{selectedDocuments[0].name }</Text> }

{!selectedDocuments[0] &&<TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40 , justifyContent:'center' ,alignSelf:'center', marginBottom:15,width:200}} >
  <Text style={{backgroundColor:'white',textAlign:'center'  }}>Cerificate of incoperation</Text>
</TouchableOpacity>}
           
{selectedDocuments[1] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center",fontSize:12}} >Board Resolution</Text>}
{selectedDocuments[1] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:15}}>{selectedDocuments[1].name }</Text> }
  {selectedDocuments[0] &&  !selectedDocuments[1] &&<Text  >CR14, Memorandum of Association, Register of Directors </Text>}
{selectedDocuments[0] && !selectedDocuments[1] &&<TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40, justifyContent:'center' ,alignSelf:'center',marginBottom:15,width:200}} >
<Text style={{textAlign:'center',backgroundColor:'white'}} >Board Resolution</Text>
</TouchableOpacity>}
            
            {selectedDocuments[2] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center",fontSize:12}} >Tax clearance</Text>}
{selectedDocuments[2] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:15}}>{selectedDocuments[2].name }</Text> }
{selectedDocuments[1] && !selectedDocuments[2] && <TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40 , justifyContent:'center' ,alignSelf:'center',marginBottom:15,width:200}} >
 <Text style={{backgroundColor:'white'}} >Tax clearance</Text>           
</TouchableOpacity>}



      {selectedDocuments[2] &&<TextInput 
          value={formData.buzLoc}
          placeholderTextColor="#6a0c0c"
          placeholder="company adress"
          onChangeText={(text) => handleTypedText(text, 'buzLoc')}
          type="text"
          style={inputstyles.addIterms }
        />}

  {selectedDocuments.length === 3 && formData.buzLoc && (
  <TouchableOpacity 
    onPress={goToPersnalInfoF} 
    style={{
      height: 40, 
      width: 150, 
      backgroundColor: '#1E90FF', 
      borderRadius: 8, 
      alignSelf: 'flex-end', 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 4, 
      elevation: 3,
      alignSelf:'flex-end'
    }}
  >
    <Text style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</Text>
  </TouchableOpacity>
)}



    </View>}


    {directorDetails&&<View style={{marginTop:20}}>


      <View style={{ padding: 10 ,alignSelf:'center' }}>
  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 }}>
    Director or Owner Details.
  </Text>
  {!selectedDocuments[3] &&<Text style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>
    The ID of a director or owner must match the details in the company documents.
  </Text>}
</View>      
            {selectedDocuments[3] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center",fontSize:12}} >ID owner or director</Text>}
{selectedDocuments[3] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:20}}>{selectedDocuments[2].name }</Text> }
    {!selectedDocuments[3] &&<TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40 , justifyContent:'center' ,alignSelf:'center',marginBottom:15,width:200}} >
      <Text style={{backgroundColor:'white',textAlign:'center'}} >National Id</Text>
    </TouchableOpacity>}

{selectedDocuments[3] &&<View style={{alignSelf:'center'}} >


   {!countryCode&&  <CountryPicker
        countryCode={callingCode}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelect}
        style={{alignSelf:'centre',marginBottom:8}}
      />
        }    

      {countryCode && <Text style={{textAlign:'center',color:'green',fontWeight:'bold',textAlign:"center",}} >Country Code : {countryCode}</Text>}
        {formData.phoneNumFrst && !countryCode && <Text>Click select country to choose country code</Text> }
        <TextInput 
              value={formData.phoneNumFrst}
              placeholderTextColor="#6a0c0c"
              placeholder="phone number"
              onChangeText={(text) => handleTypedText(text, 'phoneNumFrst')}
              type="text"
              style={inputstyles.addIterms }
              keyboardType="numeric"              
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

  {selectedDocuments[3] &&formData.phoneNumFrst && formData.contactEmail&& countryCode&& <TouchableOpacity 
    onPress={secondPage} 
    style={{
      height: 40, 
      width: 150, 
      backgroundColor: '#1E90FF', 
      borderRadius: 8, 
      alignSelf: 'flex-end', 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 4, 
      elevation: 3,
      alignSelf:'flex-end'
    }}
  >
    <Text style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</Text>
  </TouchableOpacity>}

    </View>}


      { spinnerItem &&<ActivityIndicator size={36} />}

{addressWithProof&&<View style={{marginTop:20}}>


<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 }} >Address and proof for the business or director</Text>


{selectedDocuments[4] && <Text style={{color:'green',fontWeight:'bold',textAlign:"center",fontSize:12}} >proof of res</Text>}
{selectedDocuments[4] && <Text style={{borderWidth:1 , borderColor:"#6a0c0c", marginBottom:10,padding:5,textAlign:'center',marginBottom:20}}>{selectedDocuments[4].name }</Text> }

{!selectedDocuments[4]&& <TouchableOpacity onPress={pickDocument} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:40 , justifyContent:'center' ,alignSelf:'center',marginBottom:15,width:200}} >
  <Text style={{backgroundColor:'white',textAlign:'center'}} >Proof</Text>
</TouchableOpacity>}


            <TextInput 
          value={formData.addressWithProof}
          placeholderTextColor="#6a0c0c"
          placeholder="Full adress "
          onChangeText={(text) => handleTypedText(text, 'addressWithProof')}
          type="text"
          style={inputstyles.addIterms }
        />

  {formData.addressWithProof && selectedDocuments[4]&&  <TouchableOpacity 
    onPress={dspPaymentPage} 
    style={{
      height: 40, 
      width: 150, 
      backgroundColor: '#1E90FF', 
      borderRadius: 8, 
      alignSelf: 'flex-end', 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 4, 
      elevation: 3,
      alignSelf:'flex-end'
    }}
  >
    <Text style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</Text>
  </TouchableOpacity>}

 </View>}

 {paymentPage && <View style={{marginTop:20}}>

    <Text style={styles.makePayment}>Make Payment</Text>
      <Text style={styles.methodText}>Method ecocash</Text>
      <Text>
        Eco <Text style={styles.blueText}>Cash</Text>
      </Text>
      <TouchableOpacity onPress={startAnimation}>
        <Animated.View style={{ transform: [{ translateY: animatedValue }] }}>
          <TextInput
            placeholderTextColor="#6a0c0c"
            placeholder="phone number"
            onChangeText={(text) => setEcocashPhneNum(text)}
            keyboardType="numeric"
            style={styles.input}
          />
        </Animated.View>
      </TouchableOpacity>

              
         <View style={styles.container}>
      <Text style={styles.heading}>Verification Period</Text>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.subHeading}>Months</Text>
          <TouchableOpacity onPress={() => handleSelect('1 month')}>
            <Text style={getItemStyle('1 month')}>1 mon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('2 months')}>
            <Text style={getItemStyle('2 months')}>2 mon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('3 months')}>
            <Text style={getItemStyle('3 months')}>3 mon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('6 months')}>
            <Text style={getItemStyle('6 months')}>6 mon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('9 months')}>
            <Text style={getItemStyle('9 months')}>9 mon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('12 months')}>
            <Text style={getItemStyle('12 months')}>12 mon</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <Text style={styles.subHeading}>Years</Text>
          <TouchableOpacity onPress={() => handleSelect('2 years')}>
            <Text style={[getItemStyle('2 years'), getSelectedStyle('2 years')]}>2 years</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('3 years')}>
            <Text style={[getItemStyle('3 years'), getSelectedStyle('3 years')]}>3 years</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('4 years')}>
            <Text style={[getItemStyle('4 years'), getSelectedStyle('4 years')]}>4 years</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelect('5 years')}>
            <Text style={[getItemStyle('5 years'), getSelectedStyle('5 years')]}>5 years</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>

            
  </View>}
          {/* {!spinnerItem ? <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
: <Text style={{alignSelf:"center",fontStyle:'italic'}}>Information being submited. Please wait</Text>  
} */}
    </View>
)  
}
export default React.memo(ApplyVerification)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  column: {
    marginHorizontal: 10,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  item: {
    fontSize: 16,
    marginVertical: 5,
    color: '#666',
    textAlign: 'center',
  },
  selected: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  selectedItem: {
    backgroundColor: '#28a745',
  }, makePayment: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  methodText: {
    marginBottom: 10,
  },
  blueText: {
    color: 'blue',
  },
  input: {
    height: 40,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
});