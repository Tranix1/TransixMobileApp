import React,{useState} from "react";
import { storage } from "@/db/fireBaseConfig";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";
import { collection, doc, getDoc, addDoc ,serverTimestamp , onSnapshot , setDoc} from 'firebase/firestore';
import { db,} from "@/db/fireBaseConfig";
import {View,  Text ,TouchableOpacity , Image , ActivityIndicator,StyleSheet, ScrollView,Linking} from "react-native"
import inputstyles from "../../components/styles/inputElement";

import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import CountryPicker from 'react-native-country-picker-modal';
import { CountryCode } from 'react-native-country-picker-modal';
import { Country } from 'react-native-country-picker-modal';


import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import Fontisto from '@expo/vector-icons/Fontisto';

import { toggleLocalCountry,toggleInternationalCountry } from "@/Utilities/utils";

import Input from "@/components/Input";
import CountrySelector from "@/components/CountrySelector";
import ScreenWrapper from "@/components/ScreenWrapper";

function AddTrucks(  ) {

  // const {truckType ,username ,contact , isVerified,isBlackListed ,blackLWarning,blockVerifiedU , verifiedLoad , fromLocation  , toLocation ,expoPushToken ,verifyOngoing ,truckTonnageG} = route.params


  const trucksDB = collection(db, "Trucks");

 interface FormData {
  additionalInfo: string;
  trailerType: string;
  trailerModel: string;
  driverPhone: string;
  maxloadCapacity: string;
}
 
const [formData, setFormData] = React.useState<FormData>({
  additionalInfo: "",
  trailerType: "",
  trailerModel: "",
  driverPhone: "",
  maxloadCapacity: "",
});

  const [countryCodeDriver , setCountryCodeDriver] = React.useState("")
    const [callingCodeDriver, setCallingCodeDriver] = React.useState('');

    

const handleCountrySelectDriver = (country: Country): void => {
  setCallingCodeDriver(country.cca2);
  setCountryCodeDriver(country.callingCode[0] || ''); // Use first calling code, fallback to ''
};


        const [countryCodeTrOwner , setCountryCodeTrOwner] = React.useState("")
    const [callingCodeTrOwner, setCallingCodeTrOwner] = React.useState('');


  
const handleCountrySelectTrOwner = (country: Country): void => {
  setCallingCodeTrOwner(country.cca2);
  setCountryCodeTrOwner(country.callingCode[0]||""); // use first calling code
};





   const [ ownerName , SetOwnerName] = React.useState('');
  const [ onwerEmail , setOwnerEmail] = React.useState('');
  const [ ownerPhoneNum , setOwnerCall] = React.useState('');

// React.useEffect(() => {
//   let unsubscribe: (() => void) | null = null;

//   try {
//     if (auth.currentUser) {
//       const userId = auth.currentUser.uid;
//       const docRef = doc(db, 'truckOwnerDetails', userId);

//       unsubscribe = onSnapshot(docRef, (doc) => {
//         if (doc.exists()) {
//           SetOwnerName(doc.data().ownerName);
//           setOwnerCall(doc.data().ownerPhoneNum);
//           setOwnerEmail(doc.data().ownerEmail);
//         }
//       });
//     }
//   } catch (err) {
//     console.error(err);
//   }

//   return () => {
//     if (unsubscribe) {
//       unsubscribe();
//     }
//   };
// }, []);


  const [ ownerNameAddDb , SetOwnerNameAddDb] = React.useState('');
  const [ ownerEmailAddDb , setOwnerEmailAddDb] = React.useState('');
  const [ ownerPhonNumAddDb , setOwnerPhoneNum] = React.useState('');
  
  const handleUpdateDriverDetails = async () => {
    try {
      // if(auth.currentUser){
      //   const userId = auth.currentUser.uid
      //   // await setDoc(doc(db, 'truckOwnerDetails', userId), { ownerName: ownerNameAddDb, ownerPhoneNum : ownerPhonNumAddDb , ownerEmail :ownerEmailAddDb, username:username });
      //   await setDoc(doc(db, 'truckOwnerDetails', userId), { ownerName: ownerNameAddDb, ownerPhoneNum : ownerPhonNumAddDb , ownerEmail :ownerEmailAddDb,  });
      //   alert("Submitted Truck owner details");

      // }  
  
          } catch (err) {
          alert("errr")
            console.error(err);
            }
    };





  const [localOperation , setLocalLoads]=React.useState(false)

  function chooseOpLoc(){
    setLocalLoads(prevState => !prevState)
  }
   const [location, setLocation] = useState<string>(""); // Track local or international selection
  const [interOpCount, setIntOpCount] = useState<string[]>([]); // Track selected international countries
  const [locaOpLoc, setLocaOpLoc] = useState<string>(""); // Track selected local country
  const [intOpLoc, setIntOpLoc] = useState<string[]>([]); // Track international countries
  const [dspAddLocation, setDspAddLocation] = useState<boolean>(false); // Control visibility of add location

  


console.log(locaOpLoc)
console.log(intOpLoc)







  const [ truckDetails , setTruckDDsp]=React.useState(false)

  function togglrTruckDe(){
    setTruckDDsp(prev=>!prev) 
    setDriverDDsp(false)
  }





  const [driverDetails , setDriverDDsp]=React.useState(false)

  function togglrDriverDe(){
    setTruckDDsp(false)
    setDriverDDsp(prev=>!prev)
  }



  

const handlechange= (value: string | number | boolean, fieldName: string): void => {
  setFormData((prevFormData: FormData) => ({
    ...prevFormData,
    [fieldName]: value,
  }));
};




// const [images, setImages] = useState([]);
const [images, setImages] = useState<ImagePickerAsset[]>([]);

    const selectImage = async () => {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission is required to select an image.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
      });

      if (pickerResult.canceled) {
        return;
      }

      const asset = pickerResult.assets?.[0];
      if (!asset || !asset.uri) {
        alert('No image selected or image URI not found.');
        return;
      }

      let fileSize = asset.fileSize;

      // Fallback to FileSystem if fileSize is undefined
      if (fileSize === undefined) {
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        if (fileInfo.exists && fileInfo.size) {
          fileSize = fileInfo.size;
        } else {
          alert('Could not determine file size. Please try a different image.');
          return;
        }
      }

      if (fileSize && fileSize > 1.5 * 1024 * 1024) {
        alert('The selected image must not be more than 1.5MB.\nAdd a screenshot or compress the image.');
        return;
      }

      setImages(prevImages => [...prevImages, asset]);
      // uploadImageSc(asset); // Optional: Upload logic
    };


let [truckType , setTrcuckType]=React.useState("")
let [truckTonnageG , setTruckTonnageG]=React.useState("")



  

    const [spinnerItem, setSpinnerItem] = React.useState(false);
 
  const handleSubmit = async () => {
    setDriverDDsp(false)
    setTruckDDsp(false)

      setSpinnerItem(true)


      
      

       
        

       if (truckType==="other" &&formData.trailerModel  ){

          truckType = formData.trailerModel
        }else if(truckType==="other" && !formData.trailerModel  ) {

          alert("Enter The Trailer Type You Have");
          setSpinnerItem(false)
          return
        }


        // if (verifiedLoad || isVerified) {
       const areAllElementsTrueExceptKeys = (
  obj: Record<string, any>,
  excludedKeys: string[]
): boolean => {
  for (const [key, value] of Object.entries(obj)) {
    if (!excludedKeys.includes(key) && !value) {
      return false;
    }
  }
  return true;
};

const excludedKeys = ["scndTrailerReg", "trailerModel", "additionalInfo"];

if (!areAllElementsTrueExceptKeys(formData, excludedKeys)) {
  alert(
    "This truck is for verified loads.\n\nAdd all truck details except for Trailer Reg2 if not available."
  );
  setSpinnerItem(false);
  return;
}
    // }




    let truckImage , truckBookImage , trailerBookF , trailerBookSc, driverLicense , driverPassport ;
    
    const uploadImage = async (image: { uri: string }) => {
  try {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const fileName = `Trucks/${Date.now()}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);

    return imageUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
};

if( images.length <5 && spinnerItem && truckType !== "Rigid") {
    alert("Add All reuired images")
    setSpinnerItem(false)
    return
  }else if(images.length >6 && spinnerItem && truckType !== "Rigid"){
    alert("You added too many images click restart addig images")
    setSpinnerItem(false)
    return
  }else if((images.length ===5||images.length ===6 ) &&  truckType !== "Rigid" ){

  truckImage= await uploadImage(images[0]);
  driverLicense  = await uploadImage(images[1]);
  driverPassport = await uploadImage(images[2]);

  truckBookImage = await uploadImage(images[3]);
  trailerBookF   = await uploadImage(images[4]);
  trailerBookSc = images.length === 5 ? await uploadImage(images[5]) : null ;


  }else if(images.length ===4&& spinnerItem && truckType === "Rigid" ){

  truckImage= await uploadImage(images[0]);
  driverLicense  = await uploadImage(images[1]);
  driverPassport = await uploadImage(images[2]);

  truckBookImage = await uploadImage(images[3]);

  } 
  //  else if(images.length === 1 ){

  //   truckImage= await uploadImage(images[0]);
  // }

      setSpinnerItem(true)
        let withDetails = true
        // verifiedLoad||isVerified ? withDetails = true : withDetails = false 


    // let userId = auth.currentUser.uid
    try {
      const docRef = await addDoc(trucksDB, {
        // CompanyName : username ,
        // contact : contact ,
        imageUrl: truckImage,

        truckBookImage :truckBookImage ,
        trailerBookF :trailerBookF , 
        trailerBookSc :trailerBookSc, 
        driverLicense:driverLicense ,
        driverPassport :driverPassport ,

        ownerName :ownerName ,
        onwerEmail: onwerEmail , 
        ownerPhoneNum :ownerPhoneNum ,

        // userId : userId ,
        truckType : truckType ,
        // isVerified : isVerified ,
        withDetails : withDetails ,
        // expoPushToken :expoPushToken , 
        deletionTime :Date.now() + 2 * 24 * 60 * 60 * 1000 ,
        timeStamp : serverTimestamp() ,
        // location : location ,
        truckTonnage : truckTonnageG ,
        ...formData ,       
      });

    //    setFormData({
    // additionalInfo :"" ,
    // trailerType : '',

    // driverPhone :"",

    // maxloadCapacity :""

    //   });

      setImages([]);
      setSpinnerItem(false)
      // if(verifiedLoad){
      // navigation.goBack()
      // navigation.goBack()
      // }

    } catch (err) {
      console.error(err);
    }
  };



  
  return (
      
      <View style={{alignItems :'center', paddingTop : 100 , }} >

  


     {/* { !ownerName && <View style={{position:'absolute' , alignSelf:'center' , backgroundColor:'white' , top : 100 ,  zIndex:500,padding:20}} >


               <Input
                     placeholder="Owner Name"
                     value={ownerNameAddDb}
                     onChangeText={(text) => SetOwnerNameAddDb(text)}
                     style={inputstyles.inputElem}            
                  />

                       {!countryCodeTrOwner&&  <CountryPicker
        countryCode={callingCodeTrOwner as CountryCode}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelectTrOwner}
      />
        }      
      {countryCodeTrOwner && <Text style={{textAlign:'center',color:'green',fontWeight:'bold',}} >Country Code : {countryCodeTrOwner}</Text>}
        { !countryCodeTrOwner && <Text>Click select country to choose country code</Text> }

               <Input
                     placeholder="Owner Phon num"
                     value={ownerPhonNumAddDb}
                     onChangeText={(text) => setOwnerPhoneNum(text)}
                     style={inputstyles.inputElem}            
                  />

               <Input
                     placeholder="Owner Email"
                     value={ownerEmailAddDb}
                     onChangeText={(text) => setOwnerEmailAddDb(text)}
                     style={inputstyles.inputElem}            
                  />
               
        <View style={{flexDirection : 'row', paddingTop : 10 , justifyContent : 'space-evenly'}}>
        
          
          <TouchableOpacity onPress={handleUpdateDriverDetails} style={{backgroundColor:'green',width:100 , height:35 , borderRadius:5}}>
            <Text style={{color : 'white'}}>Save</Text>
          </TouchableOpacity>
            
        </View>
               </View>} */}



   

     {images[0] &&!truckDetails&& !driverDetails&& <Image source={{ uri: images[0].uri }} style={{ width: 200, height: 200 }} />}
        { !images[0]  && <Text>Truck Image</Text>}
     {!images[0]  && <TouchableOpacity onPress={selectImage } style={{marginBottom : 9}}>
          <Fontisto name="camera" size={30} color="#6a0c0c" />
     </TouchableOpacity>}

      <ScrollView> 
       
      { spinnerItem &&<ActivityIndicator size={34} />}

  { !localOperation && !driverDetails && !truckDetails&&  <View>
         {truckType ==="other" && <Input 
            value={formData.trailerModel}
            placeholderTextColor="#6a0c0c"
            placeholder="Trailer Model"
            onChangeText={(text) => handlechange(text, 'trailerModel')}
          style={inputstyles.addIterms }
          />}
         
          <Input 
            value={formData.trailerType}
            placeholderTextColor="#6a0c0c"
            placeholder="Trailer Config"
            onChangeText={(text) => handlechange(text, 'trailerType')}
          style={inputstyles.addIterms }
          />

          <Input 
            value={formData.maxloadCapacity}
            placeholderTextColor="#6a0c0c"
            placeholder="maximumWheight"
            onChangeText={(text) => handlechange(text, 'maxloadCapacity')}
          style={inputstyles.addIterms }
          />
          <Input 
            value={formData.additionalInfo}
            placeholderTextColor="#6a0c0c"
            placeholder="Additional Information"
            onChangeText={(text) => handlechange(text, 'additionalInfo')}
            style={inputstyles.addIterms }
            />


          </View>}

      

        <CountrySelector
        location={location}
        setLocation={setLocation}
        intOpLoc={intOpLoc}
        setIntOpLoc={setIntOpLoc}
        setLocaOpLoc={setLocaOpLoc}
        setDspAddLocation={setDspAddLocation}
      />






{!localOperation ? <View> 

{!location && formData.trailerType&&formData.maxloadCapacity&&<Text>Click Operating location and choose were truck operate</Text>}

       {images[0] &&  !driverDetails&&!truckDetails&&location && formData.trailerType&&formData.maxloadCapacity&&<TouchableOpacity onPress={togglrDriverDe} style={styles.buttonSelectStyle} >
          <Text>Driver Details</Text>
        </TouchableOpacity>
        }

        <View style={{alignSelf:'center'}}>

{(!images[0] && !formData.trailerType||!formData.maxloadCapacity)&&<Text>Fill in all the Information </Text>}
{(!images[0] &&   !formData.trailerType||!formData.maxloadCapacity)&&<Text>To add truck and driver details </Text>}
        </View>


      {driverDetails && <View style={{justifyContent:'center'}} >

          <Text>Driver Details</Text>

           {!countryCodeDriver&&  <CountryPicker
        countryCode={callingCodeDriver as CountryCode}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelectDriver}
      />
        }      
      {countryCodeDriver && <Text style={{textAlign:'center',color:'green',fontWeight:'bold',}} >Country Code : {countryCodeDriver}</Text>}
        {!countryCodeDriver && <Text>Click select country to choose country code</Text> }
          <Input 
            value={formData.driverPhone}
            placeholderTextColor="#6a0c0c"
            placeholder="driverPhone"
            onChangeText={(text) => handlechange(text, 'driverPhone')}
          style={inputstyles.addIterms }
          />

       
    {images[1]&&!formData.driverPhone&&<Text>Dont forget to Enter driver Phone number</Text> }

      {images[1] &&<Text style={{alignSelf:'center',fontWeight:'bold'}} >DRIVER PASSPORT IMAGE</Text>}
     {images[1] && <Image source={{ uri: images[1].uri }} style={{ width: 200, height: 200, margin:7 }} />}
     {images[0]   && !images[1] &&<TouchableOpacity onPress={selectImage} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <Text style={{backgroundColor:'white',textAlign:'center'  }} >Driver PASSPORT</Text>
     </TouchableOpacity>}
         


      {images[2] &&<Text style={{alignSelf:'center',fontWeight:'bold'}} >DRIVER ID IMAGE</Text>}

     {images[2] && <Image source={{ uri: images[2].uri }} style={{ width: 200, height: 200 , margin:7}} />}
     {images[0] && images[1] && !images[2]   &&<TouchableOpacity onPress={selectImage} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <Text style={{backgroundColor:'white',textAlign:'center'  }} >Driver Id Image </Text>
     </TouchableOpacity>}
          
{images[2]&&!formData.driverPhone&&<Text>Enter the driver Phone number to continue</Text> }
      {images[2]&&formData.driverPhone&& <TouchableOpacity onPress={togglrTruckDe} style={{      height: 35, 
      width: 120, 
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
      }} >
    <Text style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</Text>
      </TouchableOpacity>}

      </View>}




    {images[3] && !truckDetails &&!driverDetails&&<TouchableOpacity onPress={togglrTruckDe} style={styles.buttonSelectStyle} >
      <Text  >Truck Details</Text>
    </TouchableOpacity>}

      {truckDetails && <View >
        <Text>Truck Details</Text>


  <View style={{justifyContent:'center'}} > 
      {images[3] &&<Text style={{alignSelf:'center',fontWeight:'bold'}} >HORSE REG BOOK IMAGE</Text>}
     {images[3] && <Image source={{ uri: images[3].uri }} style={{ width: 200, height: 200 , margin:7 }} />}
     {images[0] && images[1] && images[2] && !images[3] && <TouchableOpacity onPress={selectImage} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <Text style={{backgroundColor:'white'  }} >horse Reg Book Image </Text>
     </TouchableOpacity>}
          
          

      {images[4] &&<Text style={{alignSelf:'center',fontWeight:'bold'}} >Trailer Book Image</Text>}
     {images[4] && <Image source={{ uri: images[4].uri }} style={{ width: 200, height: 200, margin:7 }} />}
        {images[0] && images[1] && images[2] && images[3] && !images[4] &&  <Text>First Trailer reg</Text>}
     {images[0] && images[1] && images[2] && images[3] && !images[4] &&  <TouchableOpacity onPress={selectImage } style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <Text style={{backgroundColor:'white'  }} >Trailer Reg Book</Text>
     </TouchableOpacity>}
       </View>   

<View>

      {images[5] &&<Text style={{alignSelf:'center',fontWeight:'bold'}} >TRAILER 2 REG BOOK IMAGE</Text>}
     {images[5] && <Image source={{ uri: images[5].uri }} style={{ width: 200, height: 200,margin:7 }} />}

      {images[0] && images[1] && images[2]&& images[3]  && images[4]&& !images[5]  && <Text style={{alignSelf:'center',fontWeight:'bold'}} >Add If available or continue to add driver details</Text>}
      {images[4]&& !images[5]  &&<Text>Trailer 2 Reg </Text>}
     {images[0] && images[1] && images[2]&& images[3]  && images[4]&& !images[5]  &&<TouchableOpacity onPress={selectImage} style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <Text style={{backgroundColor:'white'  }} >Book Image </Text>
     </TouchableOpacity>}
</View>
         

      </View>}






 </View>:null}






  
{/* 
    {!spinnerItem&&!verifiedLoad &&!isVerified?  <TouchableOpacity onPress={handleSubmit} style={{alignSelf :"center", backgroundColor : '#6a0c0c' , width : 100 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',marginTop:5}} >

        <Text style={{color:'white'}} >submit</Text>

        </TouchableOpacity>:
        <Text style={{alignSelf:"center",fontStyle:'italic'}} >The truck is being added Please wait </Text>
        } */}


    {!spinnerItem? images.length>=5&& <TouchableOpacity onPress={handleSubmit} style={{alignSelf :"center", backgroundColor : '#6a0c0c' , width : 100 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',marginTop:5}} >

        <Text style={{color:'white'}} >submit</Text>

        </TouchableOpacity>:
        <Text style={{alignSelf:"center",fontStyle:'italic'}} >The truck is being added Please wait </Text>
        }


        <View style={{height:300}} ></View>
            </ScrollView>
      </View>

  );







}


export default AddTrucks;


const styles = StyleSheet.create({
    buttonStyle : {
        height : 35,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginTop: 10 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10 ,
        alignSelf:'center'
    } ,
    buttonSelectStyle :{
        height : 30,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 200 ,
        marginTop: 10 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10 ,
        alignSelf:'center',
        marginBottom:10

    },
      buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
     alignSelf:'center'

    //  marginLeft : 6
   } ,
});
