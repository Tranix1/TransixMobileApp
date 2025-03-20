import React,{useState} from "react";
import { storage } from "../config/fireBase";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";
import { collection, doc, getDoc, addDoc ,serverTimestamp , onSnapshot , setDoc} from 'firebase/firestore';
import { db, auth } from "../config/fireBase";
import {View, TextInput , Text ,    TouchableOpacity , Image , ActivityIndicator,StyleSheet, ScrollView,Linking} from "react-native"
import inputstyles from "../styles/inputElement";

import * as ImagePicker from 'expo-image-picker';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import Fontisto from '@expo/vector-icons/Fontisto';

function DBTrucksAdd( {navigation ,route} ) {

  const {truckType ,username ,contact , isVerified,isBlackListed ,blackLWarning,blockVerifiedU , verifiedLoad , fromLocation  , toLocation ,expoPushToken ,verifyOngoing ,truckTonnageG} = route.params


  const trucksDB = collection(db, "Trucks");

  const [formData, setFormData] = React.useState({
    fromLocation: verifiedLoad ? fromLocation : "",
    toLocation: verifiedLoad ? toLocation : "",
    additionalInfo :"" ,
    trailerType : '',
    trailerModel :"" ,
      
    driverPhone :"",

  });

  const [countryCodeDriver , setCountryCodeDriver] = React.useState(null)
    const [callingCodeDriver, setCallingCodeDriver] = React.useState('');

    const handleCountrySelectDriver = (country) => {
      setCallingCodeDriver(country.cca2);
        setCountryCodeDriver(country.callingCode);
      };

        const [countryCodeTrOwner , setCountryCodeTrOwner] = React.useState(null)
    const [callingCodeTrOwner, setCallingCodeTrOwne] = React.useState('');

    const handleCountrySelectTrOwner = (country) => {
      setCallingCodeTrOwne(country.cca2);
        setCountryCodeTrOwner(country.callingCode);
      };




   const [ ownerName , SetOwnerName] = React.useState('');
  const [ onwerEmail , setOwnerEmail] = React.useState('');
  const [ ownerPhoneNum , setOwnerCall] = React.useState('');

       React.useEffect(() => {
  let unsubscribe;

  try {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'truckOwnerDetails', userId);

      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          SetOwnerName(doc.data().ownerName);
          setOwnerCall(doc.data().ownerPhoneNum);
          setOwnerEmail(doc.data().ownerEmail);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [username]);

  const [ ownerNameAddDb , SetOwnerNameAddDb] = React.useState('');
  const [ ownerEmailAddDb , setOwnerEmailAddDb] = React.useState('');
  const [ ownerPhonNumAddDb , setOwnerPhoneNum] = React.useState('');
  
  const handleUpdateDriverDetails = async () => {
    try {
      if(auth.currentUser){
        const userId = auth.currentUser.uid
        await setDoc(doc(db, 'truckOwnerDetails', userId), { ownerName: ownerNameAddDb, ownerPhoneNum : ownerPhonNumAddDb , ownerEmail :ownerEmailAddDb, username:username });
        alert("Submitted Truck owner details");

      }  
  
          } catch (err) {
          alert("errr")
            console.error(err);
            }
    };





  const [location , setlocation] =   React.useState("")
  const [localOperation , setLocalLoads]=React.useState(false)

  function chooseOpLoc(){
    setLocalLoads(prevState => !prevState)
  }
    function specifyLocation(loc){
    setlocation(loc)
    setLocalLoads(false)
  }
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


       React.useEffect(() => {
 
if(images.length >= 5 && images){

    setTruckDDsp(false)
    setDriverDDsp(false)
}
}, [images]);

  const  handlechange  = (value, fieldName) => {
         
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };





const [images, setImages] = useState([]);
  
     const selectImage = async () => {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
           alert('The selected image must not be more than 1.5MB.\n Add screenshot or compress the image');
          return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync();

        if (pickerResult.cancelled === true) {
          return;
        }

        // Check if assets array exists and has at least one element
        if (pickerResult.assets && pickerResult.assets.length > 0) {
          const firstAsset = pickerResult.assets[0];
          if (firstAsset.uri) {
            // Check the file size before setting the image
            if (firstAsset.fileSize > 1.5 * 1024 * 1024) { // 1.5MB in bytes
              alert('The selected image must not be more than 1.5MB.');
              return;
            }

            setImages(prevImages => [...prevImages, firstAsset]);
            // uploadImageSc(firstAsset); // Call uploadImage with the selected asset
          } else {
            alert('Selected image URI is undefined');
          }
        } else {
          alert('No assets found in the picker result');
        }
         
  };





  

    const [spinnerItem, setSpinnerItem] = React.useState(false);
 
  const handleSubmit = async () => {
    setDriverDDsp(false)
    setTruckDDsp(false)

      setSpinnerItem(true)


      
      if(!location){
        alert("Choose were the truck operate \n Click the Button below named operating location")
        setSpinnerItem(false)
        return
      }

               
        if(!formData.fromLocation || !formData.toLocation){
          alert("Add The location the truck is needing \n Like from location and to location");
          setSpinnerItem(false)
          return
        }
        

       if (truckType==="other" &&formData.trailerModel  ){

          truckType = formData.trailerModel
        }else if(truckType==="other" && !formData.trailerModel  ) {

          alert("Enter The Trailer Type You Have");
          setSpinnerItem(false)
          return
        }


        if (verifiedLoad || isVerified) {
        const areAllElementsTrueExceptKeys = (obj, excludedKeys) => {
            for (const key in obj) {
                if (!excludedKeys.includes(key) && !obj[key]) {
                    return false;
                }
            }
            return true;
        };

        const excludedKeys = ["scndTrailerReg", "trailerModel","additionalInfo"];

        if (verifiedLoad && !areAllElementsTrueExceptKeys(formData, excludedKeys)) {
            alert("This truck is for verified loads.\n\nAdd all truck details except for Trailer Reg2 if not available.");
            setSpinnerItem(false)
            return;
        }
    }




    let truckImage , truckBookImage , trailerBookF , trailerBookSc, driverLicense , driverPassport ;
    
    const uploadImage = async (image) => {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `Trucks/` + new Date().getTime() );
    
    const snapshot = await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);
    
    return imageUrl;
}


if(isVerified && images.length <5 && spinnerItem && truckType !== "Rigid") {
    alert("Add All reuired images")
    setSpinnerItem(false)
    return
  }else if(isVerified && images.length >6 && spinnerItem && truckType !== "Rigid"){
    alert("You added too many images click restart addig images")
    setSpinnerItem(false)
    return
  }else if(isVerified && (images.length ===5||images.length ===6 ) &&  truckType !== "Rigid" ){

  truckImage= await uploadImage(images[0]);
  driverLicense  = await uploadImage(images[1]);
  driverPassport = await uploadImage(images[2]);

  truckBookImage = await uploadImage(images[3]);
  trailerBookF   = await uploadImage(images[4]);
  trailerBookSc = images.length === 4 ? await uploadImage(images[5]) : null ;
  

  }else if(isVerified && images.length ===4&& spinnerItem && truckType === "Rigid" ){

  truckImage= await uploadImage(images[0]);
  driverLicense  = await uploadImage(images[1]);
  driverPassport = await uploadImage(images[2]);

  truckBookImage = await uploadImage(images[3]);

  }  else if(!isVerified && images.length === 1 ){

    truckImage= await uploadImage(images[0]);
  }else{
    alert("Please add truck image")
    setSpinnerItem(false)
    return
  }


      setSpinnerItem(true)
        let withDetails 
        verifiedLoad||isVerified ? withDetails = true : withDetails = false 


    let userId = auth.currentUser.uid
    try {
      const docRef = await addDoc(trucksDB, {
        CompanyName : username ,
        contact : contact ,
        imageUrl: truckImage,

        truckBookImage :truckBookImage ,
        trailerBookF :trailerBookF , 
        trailerBookSc :trailerBookSc, 
        driverLicense:driverLicense ,
        driverPassport :driverPassport ,

        ownerName :ownerName ,
        onwerEmail: onwerEmail , 
        ownerPhoneNum :ownerPhoneNum ,

        userId : userId ,
        truckType : truckType ,
        isVerified : isVerified ,
        withDetails : withDetails ,
        expoPushToken :expoPushToken , 
        deletionTime :Date.now() + 2 * 24 * 60 * 60 * 1000 ,
        timeStamp : serverTimestamp() ,
        location : location ,
        truckTonnage : truckTonnageG ,
        ...formData ,       
      });

       setFormData({
    fromLocation:"",
    toLocation:  "",
    additionalInfo :"" ,
    trailerType : '',

    driverPhone :"",

    maximumWheight :""

      });
      setImages([]);
      setSpinnerItem(false)
      if(verifiedLoad){
      navigation.goBack()
      navigation.goBack()
      }

    } catch (err) {
      console.error(err);
    }
  };
  return (
      
      <View style={{alignItems :'center', paddingTop : 85}} >

   <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > Add {truckType}   </Text>
       </View>


     {isVerified && !ownerName && <View style={{position:'absolute' , alignSelf:'center' , backgroundColor:'white' , top : 100 ,  zIndex:500,padding:20}} >


               <TextInput
                     placeholder="Owner Name"
                     type="text"
                     value={ownerNameAddDb}
                     onChangeText={(text) => SetOwnerNameAddDb(text)}
                     style={inputstyles.inputElem}            
                  />

                       {!countryCodeTrOwner&&  <CountryPicker
        countryCode={callingCodeTrOwner}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelectTrOwner}
        style={{alignSelf:'centre',marginBottom:8}}
      />
        }      
      {countryCodeTrOwner && <Text style={{textAlign:'center',color:'green',fontWeight:'bold',textAlign:"center",}} >Country Code : {countryCodeTrOwner}</Text>}
        { !countryCodeTrOwner && <Text>Click select country to choose country code</Text> }

               <TextInput
                     placeholder="Owner Phon num"
                     type="text"
                     value={ownerPhonNumAddDb}
                     onChangeText={(text) => setOwnerPhoneNum(text)}
                     style={inputstyles.inputElem}            
                  />

               <TextInput
                     placeholder="Owner Email"
                     type="text"
                     value={ownerEmailAddDb}
                     onChangeText={(text) => setOwnerEmailAddDb(text)}
                     style={inputstyles.inputElem}            
                  />
               
        <View style={{flexDirection : 'row', paddingTop : 10 , justifyContent : 'space-evenly'}}>
        
          
          <TouchableOpacity onPress={handleUpdateDriverDetails} style={{backgroundColor:'green',width:100 , height:35 , borderRadius:5}}>
            <Text style={{color : 'white'}}>Save</Text>
          </TouchableOpacity>
            
        </View>
               </View>}






        {verifyOngoing && !isVerified&&<TouchableOpacity  onPress={() => Linking.openURL(``)}  style={{  marginBottom : 4,  padding :7 ,borderWidth : 3 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 3, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5, margin :10}} >
              {<View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
                <MaterialIcons name="verified" size={29} color="green" />
              </View>}


          <Text style={{alignSelf:'flex-start',fontSize:13 , color:'green',fontStyle:'italic'}} >Ongoing Verification</Text>
        {!verifiedLoad&&<Text style={{textAlign:'center',fontSize :17,color:"#6a0c0c",fontWeight:'500'}} > Your Business is not verified </Text>}
        {!verifiedLoad&&<Text style={{}} > If You Are Legit Click Here </Text>}

        {verifiedLoad&&<Text style={{textAlign:'center',fontSize :17,color:"#6a0c0c",fontWeight:'500'}} > You Want A verified Load</Text>}
        {verifiedLoad&& <Text style={{}}>Your truck details will be deleted in 2 days. Be verified to prevent deletion.</Text>}
      </TouchableOpacity>
      }

      


     {images[0] &&!truckDetails&& !driverDetails&& <Image source={{ uri: images[0].uri }} style={{ width: 200, height: 200 }} />}
        { !images[0]  && <Text>Truck Image</Text>}
     {!images[0]  && <TouchableOpacity onPress={selectImage } style={{marginBottom : 9}}>
          <Fontisto name="camera" size={30} color="#6a0c0c" />
     </TouchableOpacity>}

      <ScrollView> 
        {!truckDetails && !driverDetails&&<View> 

        <TextInput
          value={formData.fromLocation}
          placeholder="from location"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'fromLocation')}
          type="text" 
          style={inputstyles.addIterms }
        />

        <TextInput
          placeholder="to location"
          type="text"
          name="toLocation"
          value={formData.toLocation}
          placeholderTextColor="#6a0c0c"
          style={inputstyles.addIterms }
          onChangeText={(text) => handlechange(text, 'toLocation')}
        />

        
        </View>}
      { spinnerItem &&<ActivityIndicator size={34} />}

  { !localOperation && !driverDetails && !truckDetails&&  <View>
         {truckType ==="other" && <TextInput 
            value={formData.trailerModel}
            placeholderTextColor="#6a0c0c"
            placeholder="Trailer Model"
            onChangeText={(text) => handlechange(text, 'trailerModel')}
            type="text"
          style={inputstyles.addIterms }
          />}
         
          <TextInput 
            value={formData.trailerType}
            placeholderTextColor="#6a0c0c"
            placeholder="Trailer Config"
            onChangeText={(text) => handlechange(text, 'trailerType')}
            type="text"
          style={inputstyles.addIterms }
          />

          <TextInput 
            value={formData.maximumWheight}
            placeholderTextColor="#6a0c0c"
            placeholder="maximumWheight"
            onChangeText={(text) => handlechange(text, 'maximumWheight')}
            type="text"
          style={inputstyles.addIterms }
          />
          <TextInput 
            value={formData.additionalInfo}
            placeholderTextColor="#6a0c0c"
            placeholder="Additional Information"
            onChangeText={(text) => handlechange(text, 'additionalInfo')}
            type="text"
            style={inputstyles.addIterms }
            />


          </View>}

        {!truckDetails && !driverDetails&&<TouchableOpacity onPress={chooseOpLoc} style={{}}>
          {!location? <Text style={styles.buttonIsFalse}>Operating Location</Text>:
          <Text style={styles.buttonIsFalse}>{location}</Text>

        }
        </TouchableOpacity>             }








{(verifiedLoad || isVerified)&&!localOperation ? <View> 

{!location && formData.fromLocation&&formData.toLocation&&formData.trailerType&&formData.maximumWheight&&<Text>Click Operating location and choose were truck operate</Text>}

       {images[0] &&  !driverDetails&&!truckDetails&&location && formData.fromLocation&&formData.toLocation&&formData.trailerType&&formData.maximumWheight&&<TouchableOpacity onPress={togglrDriverDe} style={styles.buttonSelectStyle} >
          <Text>Driver Details</Text>
        </TouchableOpacity>
        }

        <View style={{alignSelf:'center'}}>

{(!images[0] && !formData.fromLocation||!formData.toLocation||!formData.trailerType||!formData.maximumWheight)&&<Text>Fill in all the Information </Text>}
{(!images[0] && !formData.fromLocation||!formData.toLocation||!formData.trailerType||!formData.maximumWheight)&&<Text>To add truck and driver details </Text>}
        </View>


      {driverDetails && <View style={{justifyContent:'center'}} >

          <Text>Driver Details</Text>

           {!countryCodeDriver&&  <CountryPicker
        countryCode={callingCodeDriver}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelectDriver}
        style={{alignSelf:'centre',marginBottom:8}}
      />
        }      
      {countryCodeDriver && <Text style={{textAlign:'center',color:'green',fontWeight:'bold',textAlign:"center",}} >Country Code : {countryCodeDriver}</Text>}
        {formData.phoneNumFrst && !countryCodeDriver && <Text>Click select country to choose country code</Text> }
          <TextInput 
            value={formData.driverPhone}
            placeholderTextColor="#6a0c0c"
            placeholder="driverPhone"
            onChangeText={(text) => handlechange(text, 'driverPhone')}
            type="text"
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
      alignSelf:'flex-end'}} >
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



        {localOperation && <View style={{alignSelf:'center'}} >
           <TouchableOpacity onPress={()=>specifyLocation('International')} style={styles.buttonStyle} > 
            <Text style={{color:'#6a0c0c'}}>International</Text>
          </TouchableOpacity>
                <Text style={{alignSelf:'center', fontSize:18 , fontWeight:'bold'}} >local operators</Text>
          <TouchableOpacity onPress={()=>specifyLocation('Zimbabwe')} style={styles.buttonStyle} > 
            <Text style={{color:'#6a0c0c'}}>Zimbabwe </Text>
          </TouchableOpacity>

            <TouchableOpacity onPress={()=> specifyLocation('SouthAfrica') } style={styles.buttonStyle} >
                  <Text style={{color:'#6a0c0c'}} >  South Africa</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Namibia') } style={styles.buttonStyle}>
                  <Text style={{color:'#6a0c0c'}}>Namibia </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Tanzania') } style={styles.buttonStyle}>
                  <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>specifyLocation ('Mozambique') } style={styles.buttonStyle}>
                  <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Zambia') } style={styles.buttonStyle}>
                  <Text style={{color:'#6a0c0c'}}> Zambia</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Botswana') } style={styles.buttonStyle} >
                  <Text style={{color:'#6a0c0c'}}>Botswana </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Malawi') }style={styles.buttonStyle} >
                  <Text style={{color:'#6a0c0c'}}>Malawi </Text>
              </TouchableOpacity>

        </View>
        }



  
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


export default DBTrucksAdd;


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
