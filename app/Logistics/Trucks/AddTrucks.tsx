import React,{useState} from "react";
import {View,TouchableOpacity , Image , ActivityIndicator,StyleSheet, ScrollView,Linking} from "react-native"
import inputstyles from "../../components/styles/inputElement";

import type { ImagePickerAsset } from 'expo-image-picker';

import CountryPicker from 'react-native-country-picker-modal';
import { CountryCode } from 'react-native-country-picker-modal';
import { Country } from 'react-native-country-picker-modal';

import { addDocument, getDocById } from "@/db/operations";
import { uploadImage } from "@/db/operations";

import { selectManyImages } from "@/Utilities/utils";

import Fontisto from '@expo/vector-icons/Fontisto';
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import CountrySelector from "@/components/CountrySelector";
import ScreenWrapper from "@/components/ScreenWrapper";


function AddTrucks(  ) {

  // const {truckType ,username ,contact , isVerified,isBlackListed ,blackLWarning,blockVerifiedU , verifiedLoad , fromLocation  , toLocation ,expoPushToken ,verifyOngoing ,truckTonnageG} = route.params



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

  const [getOwnerDetails, setOwnerDetails] = React.useState<any>({}); // Better to define an interface/type

React.useEffect(() => {
  getDocById('truckOwnerDetails' , setOwnerDetails);
}, []);

console.log(getOwnerDetails?.ownerName, "owner");


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





  
   const [location, setLocation] = useState<string>(""); // Track local or international selection
  const [locaOpLoc, setLocaOpLoc] = useState<string>(""); // Track selected local country
  const [intOpLoc, setIntOpLoc] = useState<string[]>([]); // Track international countries
  const [dspAddLocation, setDspAddLocation] = useState<boolean>(false); // Control visibility of add location

  


console.log(locaOpLoc)
console.log(intOpLoc)
console.log(location)







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


let [truckType , setTrcuckType]=React.useState("")
let [truckTonnageG , setTruckTonnageG]=React.useState("")



  

    const [spinnerItem, setSpinnerItem] = React.useState(false);
    const [addingDocUpdate , setAddingDocUpdate]=React.useState("")
    const [uploadingImageUpdate , setUploadImageUpdate]=React.useState("")
 
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
   

if( images.length <5 && spinnerItem && truckType !== "Rigid") {
    alert("Add All reuired images")
    setSpinnerItem(false)
    return
  }else if(images.length >6 && spinnerItem && truckType !== "Rigid"){
    alert("You added too many images click restart addig images")
    setSpinnerItem(false)
    return
  }else if((images.length ===5||images.length ===6 ) &&  truckType !== "Rigid" ){

  truckImage= await uploadImage(images[0],"Trucks",setUploadImageUpdate," truck Image");
  driverLicense  = await uploadImage(images[1],"Trucks",setUploadImageUpdate,"Driver License" ) ;
  driverPassport = await uploadImage(images[2],"Trucks",setUploadImageUpdate , "driver passport");

  truckBookImage = await uploadImage(images[3],"Trucks",setUploadImageUpdate,"truck Book");
  trailerBookF   = await uploadImage(images[4],"Trucks",setUploadImageUpdate,"trailer Book");
  trailerBookSc = images.length === 5 ? await uploadImage(images[5],"Trucks",setUploadImageUpdate,"trailer Book sec") : null ;


  }else if(images.length ===4&& spinnerItem && truckType === "Rigid" ){

   truckImage= await uploadImage(images[0],"Trucks",setUploadImageUpdate,"truck Image");
  driverLicense  = await uploadImage(images[1],"Trucks",setUploadImageUpdate,"Driver License" ) ;
  driverPassport = await uploadImage(images[2],"Trucks",setUploadImageUpdate , "driver passport");

  truckBookImage = await uploadImage(images[3],"Trucks",setUploadImageUpdate,"truck Book");
  } 
  //  else if(images.length === 1 ){

  //   truckImage= await uploadImage(images[0]);
  // }

      setSpinnerItem(true)
        let withDetails = true
        // verifiedLoad||isVerified ? withDetails = true : withDetails = false 


    // let userId = auth.currentUser.uid
    try {
     
    // let userId = auth.currentUser.uid




     const submitData = {
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

        location :location ,
        intOpLoc:intOpLoc ,
        locaOpLoc : locaOpLoc ,

        // userId : userId ,
        truckType : truckType ,
        // isVerified : isVerified ,
        withDetails : withDetails ,
        // expoPushToken :expoPushToken , 
        deletionTime :Date.now() + 2 * 24 * 60 * 60 * 1000 ,
        truckTonnage : truckTonnageG ,
        ...formData ,       
      }



            addDocument("Trucks" , submitData , setAddingDocUpdate )


        setFormData({
        additionalInfo: "",
        trailerType: "",
        trailerModel: "", 
        driverPhone: "",
        maxloadCapacity: ""
      });


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
      <ScreenWrapper>

      <View style={{alignItems :'center', paddingTop : 100  }} >

  


     {!ownerName && <View style={{position:'absolute' , alignSelf:'center' , backgroundColor:"red" , top : 100 ,  zIndex:500,padding:20}} >


               <Input
                     placeholder="Owner Name"
                     value={ownerNameAddDb}
                     onChangeText={(text) => SetOwnerNameAddDb(text)}
                     style={inputstyles.inputElem}            
                  />

                
      {countryCodeTrOwner && <ThemedText style={{textAlign:'center',color:'green',fontWeight:'bold',}} >Country Code : {countryCodeTrOwner}</ThemedText>}
        { !countryCodeTrOwner && <ThemedText>Click select country to choose country code</ThemedText> }

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
            <ThemedText style={{color : 'white'}}>Save</ThemedText>
          </TouchableOpacity>
            
        </View>

        
               </View>}



   

   

     {images[0] &&!truckDetails&& !driverDetails&& <Image source={{ uri: images[0].uri }} style={{ width: 200, height: 200, }} />}
        { !images[0]  && <ThemedText>Truck Image</ThemedText>}
     {!images[0]  && <TouchableOpacity  onPress={() => selectManyImages(setImages) }  style={{marginBottom : 9}}>
          <Fontisto name="camera" size={30} color="#6a0c0c" />
     </TouchableOpacity>}

      <ScrollView> 
       
      { spinnerItem &&<ActivityIndicator size={34} />}

  { !dspAddLocation && !driverDetails && !truckDetails&&  <View  style={{width:350,backgroundColor:'red',overflow:'hidden'}}>
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


        {intOpLoc.length > 0 &&  (
            <ThemedText style={{ flexWrap: 'wrap',}}>Selected: {intOpLoc.join(", ")}</ThemedText>
          )}
          {locaOpLoc&&<ThemedText style={{ flexWrap: 'wrap',}} >selected {locaOpLoc} </ThemedText> }
          </View>}


        <CountrySelector
        location={location}
        setLocation={setLocation}
        intOpLoc={intOpLoc}
        setIntOpLoc={setIntOpLoc}
        setLocaOpLoc={setLocaOpLoc}
        setDspAddLocation={setDspAddLocation}
        dspAddLocation={dspAddLocation}
      />
          

{  <View> 



       {images[0] &&  !driverDetails&&!truckDetails && formData.trailerType&&formData.maxloadCapacity&&<TouchableOpacity onPress={togglrDriverDe} style={styles.buttonSelectStyle} >
          <ThemedText  >Driver Details</ThemedText>
        </TouchableOpacity>
        }

        <View style={{alignSelf:'center'}}>

{(!images[0] && !formData.trailerType||!formData.maxloadCapacity)&&<ThemedText>Fill in all the Information </ThemedText>}
{(!images[0] &&   !formData.trailerType||!formData.maxloadCapacity)&&<ThemedText>To add truck and driver details </ThemedText>}
        </View>


      {driverDetails && <View style={{justifyContent:'center'}} >

          <ThemedText>Driver Details</ThemedText>

           {!countryCodeDriver&&  <CountryPicker
        countryCode={callingCodeDriver as CountryCode}
        withCountryNameButton={true}
        withCallingCode={true}
        withFilter={true}
        onSelect={handleCountrySelectDriver}
      />
        }      
      {countryCodeDriver && <ThemedText style={{textAlign:'center',color:'green',fontWeight:'bold',}} >Country Code : {countryCodeDriver}</ThemedText>}
        {!countryCodeDriver && <ThemedText>Click select country to choose country code</ThemedText> }
          <Input 
            value={formData.driverPhone}
            placeholderTextColor="#6a0c0c"
            placeholder="driverPhone"
            onChangeText={(text) => handlechange(text, 'driverPhone')}
          style={inputstyles.addIterms }
          />

       
    {images[1]&&!formData.driverPhone&&<ThemedText>Dont forget to Enter driver Phone number</ThemedText> }

      {images[1] &&<ThemedText style={{alignSelf:'center',fontWeight:'bold'}} >DRIVER PASSPORT IMAGE</ThemedText>}
     {images[1] && <Image source={{ uri: images[1].uri }} style={{ width: 200, height: 200, margin:7 }} />}
     {images[0]   && !images[1] &&<TouchableOpacity onPress={() => selectManyImages(setImages) } style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <ThemedText style={{backgroundColor:'white',textAlign:'center',color:'black'  }} >Driver PASSPORT</ThemedText>

     </TouchableOpacity>}
         


      {images[2] &&<ThemedText style={{alignSelf:'center',fontWeight:'bold'}} >DRIVER ID IMAGE</ThemedText>}

     {images[2] && <Image source={{ uri: images[2].uri }} style={{ width: 200, height: 200 , margin:7}} />}
     {images[0] && images[1] && !images[2]   &&<TouchableOpacity onPress={() => selectManyImages(setImages) } style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <ThemedText style={{backgroundColor:'white',textAlign:'center',color:'black'   }} >Driver Id Image </ThemedText>
     </TouchableOpacity>}
          
{images[2]&&!formData.driverPhone&&<ThemedText>Enter the driver Phone number to continue</ThemedText> }
      {images[2]&&formData.driverPhone&& <TouchableOpacity onPress={togglrTruckDe} style={{      height: 35, 
      width: 170, 
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
    <ThemedText style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</ThemedText>
      </TouchableOpacity>}

      </View>}




    {images[3] && !truckDetails &&!driverDetails&&<TouchableOpacity onPress={togglrTruckDe} style={styles.buttonSelectStyle} >
      <ThemedText  >Truck Details</ThemedText>
    </TouchableOpacity>}

      {truckDetails && <View >
        <ThemedText>Truck Details</ThemedText>


  <View style={{justifyContent:'center'}} > 
      {images[3] &&<ThemedText style={{alignSelf:'center',fontWeight:'bold'}} >HORSE REG BOOK IMAGE</ThemedText>}
     {images[3] && <Image source={{ uri: images[3].uri }} style={{ width: 200, height: 200 , margin:7 }} />}
     {images[0] && images[1] && images[2] && !images[3] && <TouchableOpacity onPress={() => selectManyImages(setImages) } style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <ThemedText style={{backgroundColor:'white',color:'black'   }} >horse Reg Book Image </ThemedText>
     </TouchableOpacity>}
          
          

      {images[4] &&<ThemedText style={{alignSelf:'center',fontWeight:'bold'}} >Trailer Book Image</ThemedText>}
     {images[4] && <Image source={{ uri: images[4].uri }} style={{ width: 200, height: 200, margin:7 }} />}
        {images[0] && images[1] && images[2] && images[3] && !images[4] &&  <ThemedText>First Trailer reg</ThemedText>}
     {images[0] && images[1] && images[2] && images[3] && !images[4] &&  <TouchableOpacity onPress={() => selectManyImages(setImages)  } style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <ThemedText style={{backgroundColor:'white',color:'black'   }} >Trailer Reg Book</ThemedText>
     </TouchableOpacity>}
       </View>   

<View>

      {images[5] &&<ThemedText style={{alignSelf:'center',fontWeight:'bold'}} >TRAILER 2 REG BOOK IMAGE</ThemedText>}
     {images[5] && <Image source={{ uri: images[5].uri }} style={{ width: 200, height: 200,margin:7 }} />}

      {images[0] && images[1] && images[2]&& images[3]  && images[4]&& !images[5]  && <ThemedText style={{alignSelf:'center',fontWeight:'bold'}} >Add If available or continue to add driver details</ThemedText>}
      {images[4]&& !images[5]  &&<ThemedText>Trailer 2 Reg </ThemedText>}
     {images[0] && images[1] && images[2]&& images[3]  && images[4]&& !images[5]  &&<TouchableOpacity onPress={() => selectManyImages(setImages) } style={{marginBottom : 9 , backgroundColor:'#6a0c0c',height:30,width:150 , justifyContent:'center' ,alignSelf:'center'}}>
        <ThemedText style={{backgroundColor:'white' ,color:'black'  }} >Book Image </ThemedText>
     </TouchableOpacity>}
</View>
         

      </View>}






 </View>}






  
{/* 
    {!spinnerItem&&!verifiedLoad &&!isVerified?  <TouchableOpacity onPress={handleSubmit} style={{alignSelf :"center", backgroundColor : '#6a0c0c' , width : 100 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',marginTop:5}} >

        <Text style={{color:'white'}} >submit</Text>

        </TouchableOpacity>:
        <Text style={{alignSelf:"center",fontStyle:'italic'}} >The truck is being added Please wait </Text>
        } */}


    {!spinnerItem? images.length>=5&& <TouchableOpacity onPress={handleSubmit} style={{alignSelf :"center", backgroundColor : '#6a0c0c' , width : 100 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',marginTop:5}} >

        <ThemedText style={{color:'white'}} >submit</ThemedText>

        </TouchableOpacity>:
        <ThemedText style={{alignSelf:"center",fontStyle:'italic'}} >The truck is being added Please wait </ThemedText>
        }


        <View style={{height:300}} ></View>
            </ScrollView>
      </View>

      </ScreenWrapper>
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
