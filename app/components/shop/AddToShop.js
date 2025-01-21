import React,{useState,useEffect} from "react";
import { storage } from "../config/fireBase";
import { collection, addDoc,onSnapshot ,  query ,where , serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, } from "firebase/storage";
import { db, auth } from "../config/fireBase";
import {View, TextInput , Text ,    TouchableOpacity , Image , ActivityIndicator , StyleSheet , ScrollView,Linking} from "react-native"
import inputstyles from "../styles/inputElement";

import * as ImagePicker from 'expo-image-picker';

import Fontisto from '@expo/vector-icons/Fontisto';
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function AddToShop( {navigation , route} ) {

    const {location , specproduct ,sellOBuy , username ,contact , isVerified,isBlackListed ,blackLWarning ,blockVerifiedU , shopLocation,deliveryR,expoPushToken ,verifyOngoing } = route.params

  const shopDB = collection(db, "Shop");

  const [formData, setFormData] = React.useState({
    productName: "",
    price: null,
    additionalInfo :"" ,
    productLoc :"" ,
    mileage :'' ,
    year :'' ,
    engine : '' , 
    trans :"" ,
     fuel :'',
     swapWith :''
  });

  const [frontMarkting, setFrontMarketing] = useState([]);

let frontMarkert = false
  useEffect(() => {
    try {
        const userId = auth.currentUser.uid;
        // const dataQuery = query(collection(db, "Shop"), where("userId" ,"==", userId) );
      let dataQuery = query(collection(db, "Shop"), where("userId" ,"==", userId), where("frontMarkert" ,"==", true), where("specproduct", "==", specproduct), where("location", "==", location), where("sellOBuy", "==", sellOBuy) );
       
        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

        setFrontMarketing(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);

  if(frontMarkting.length < 4 ){
    frontMarkert = true
  }
  const  handlechange  = (value, fieldName) => {

      if (fieldName === 'price' && isNaN(value)) {
        // Handle the case where the input is not a number for the price field
        alert('Price must be a number.');
        return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };


    const [currency , setCurrency] = React.useState(true)
  function toggleCurrency(){
    setCurrency(prev=>!prev)
  }

    const [sellRent , setSellRent] = React.useState(true)
  function toggleSellRent(value){
    setSellRent(value)
  }

    const [brandNew , setBrandNew] = React.useState(false)
  function toggleBrandNew(){
    setBrandNew(prev=>!prev)
  }


    const [negetiatable , setnegotiatable] = React.useState(false)
  function toggleNegotiatable(){
    setnegotiatable(prev=>!prev)
  }

    const [ swapA , setSwapA] = React.useState(false)
  function toggleSwapA(){
    setSwapA(prev=>!prev)
  }

  let priceRange = null

        if (formData.price < 1500) {
            priceRange= "firstRange"
        } else if (formData.price >= 1500 && formData.price < 2500)  {
            priceRange ="scndRange";
        } else if (formData.price >= 2500 && formData.price < 5000)  {
            priceRange = "thirdRange" ;
        } else if (formData.price >= 5000 && formData.price < 10000)  {
            priceRange = "fouthRange" ;
        } else if (formData.price >= 10000 && formData.price < 25000)  {
            priceRange = "fifthRange" ;
        } else if (formData.price >= 25000 && formData.price < 45000)  {
            priceRange = "sixthRange" ;
        } else if (formData.price >= 45000 && formData.price < 65000)  {
            priceRange = "svthRange"
        } else if (formData.price >= 65000 && formData.price < 80000)  {
            priceRange = "eighthRange"
        } else if (formData.price >= 80000 && formData.price < 100000)  {
            priceRange = "ninthRange"
        } else if (formData.price >= 100000 )  {
            priceRange = "tentRange"
        }

        const [vehiMakeDsp , setvehiMakeDsp] =React.useState(false)
          function toggleVehiMakeDsp(){
            setvehiMakeDsp(prev => !prev)
          }
          const [vehiMake , setVehiMake] = React.useState("")

          function addVehiMake(value){
              setVehiMake(value)
              setvehiMakeDsp(false)
          }


    const [cargoTrcksMake , setCargoTrucksMake] = React.useState(false)
    function toggleCargoTrcksMake(){
      setCargoTrucksMake(prev=>!prev)
      setheavyEquipmentMake(false)
    }

    const [ heavyEquipmentMake , setheavyEquipmentMake] = React.useState(false)
    function toggleHeavyEquipmentMake(){
      setheavyEquipmentMake(prev=>!prev)
      setCargoTrucksMake(false)
    }

  const [vehicleTypeDsp , setVehicleTypeDsp] = React.useState(false)
    function dspVehicleTypeDsp(){
      setVehicleTypeDsp(prev => !prev)
    }

  const [vehicleType , setVehicleType] = React.useState(null)
    function addVehicleType(slctedV){
      setVehicleType(slctedV)
      setVehicleTypeDsp(false)
    }

    const [cargoTrcks , setCargoTrucks] = React.useState(false)
    function toggleCargoTrcks(){
      setCargoTrucks(prev=>!prev)
      setheavyEquipment(false)
    }

    const [ heavyEquipment , setheavyEquipment] = React.useState(false)
    function toggleHeavyEquipment(){
      setheavyEquipment(prev=>!prev)
      setCargoTrucks(false)
    }
    const [ trailerTypeDsp , setTrailerTypeDsp] = React.useState(false)
    function toggleTrailerTypeDsp(){
      setTrailerTypeDsp(prev=>!prev)
    }
    const [ trailerType , setTrailerType] = React.useState(null)
    function addTrailerType(value){
      setTrailerType(value)
      setTrailerTypeDsp(false)
    }


   const [ sProviderDsp , setSproviderDsp] = React.useState(false)
    function toggleSproviderDsp(){
      setSproviderDsp(prev=>!prev)
    }
    const [ sProviderType , setSProviderType] = React.useState(null)
    function addSProviderType(value){
      setSProviderType(value)
      setSproviderDsp(false)
    }

const [images, setImages] = useState([]);

const handleFileInputChange = async () => {
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

if (status !== 'granted') {
    alert('Permission to access camera roll is required!');
    return;
}

let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
    allowsMultipleSelection: true,
});

if (result.assets.length + images.length > 4) {
    setImages([]);
    alert('You can only select up to 4 images.');
    return; // Exit if more than 4 images
}

// Check the file size of each selected image
for (const asset of result.assets) {
    if (asset.fileSize > 1.5 * 1024 * 1024) { // 1.5MB in bytes
        alert('One or more selected images exceed 1.5MB in size.\n Add screenshot or compress the image');
        return;
    }
}

if (!result.cancelled) {
    // Update the state with the selected images correctly using the functional form of setImages
    setImages(prevImages => [...prevImages, ...result.assets]);
}
};



const [spinnerItem, setSpinnerItem] = React.useState(false);
    
 
const handleSubmit = async () => {

    if(isBlackListed ){
        return
      }else if(blackLWarning ){
        alert("Your account is currently under investigation.\n Please contact us for resolution")
        Linking.openURL(`whatsapp://send?phone=+263716326160  &text=${encodeURIComponent(`Good day \nMy Transix account is being investigated whats the issue and how can we resolve it \nMy username is ${username} `)} `)
        return
      }else if(blockVerifiedU){
        alert("Important: You are a blocked verified user.\n Legal action may be taken if necessary. \nContact us immediately.")
        Linking.openURL(`whatsapp://send?phone=+263716326160  &text=${encodeURIComponent(`Good day \n I am a blocked Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)
        return
      }

    if(sellOBuy ==="forSell" || specproduct==="Sprovider" ){

       if(images.length === 0){
        alert("Add at least 4 images")
        return
      }
      }else if(!username){
        alert('add username')
        return
      }
     

      if(specproduct === "vehicles"){

       if(!vehicleType){
        alert("Specify the vehicle type")
        return
      } else if(!vehiMake){
          alert("Specify vehicle make")
          return
        }else if(!formData.price ||!formData.productName  ) {
        alert("Add product name and the price to continue")
        return
        }
      }
       else if(specproduct === "trailers" ){
        if(!trailerType){

          alert('Specify trailer type')
          return
        }
        }
      else if( specproduct !== "Sprovider" ){ 
      if(!formData.productName  || !formData.price  ){
        alert("Add product name and the price to continue")
        return
      }} 
      setSpinnerItem(true)

    
    let imageUrls = [];

    let userId = auth.currentUser.uid

  try {
     for (const asset of images) {
          
      const response = await fetch(asset.uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `Shop/` + new Date().getTime());
        
        // Upload the image
        const snapshot = await uploadBytes(storageRef, blob);

        // Get the download URL
        const imageUrl = await getDownloadURL(storageRef);

        imageUrls.push(imageUrl);
        
        }
      // Add a document to Firestore with image URLs
        const docRef = await addDoc(shopDB, {
            CompanyName: username,
            contact: contact,
            productName: formData.productName,
            swapWith : formData.swapWith ,
            price: formData.price,
            imageUrl: imageUrls,
            userId: userId,
            frontMarkert : frontMarkert,
            additionalInfo: formData.additionalInfo,
            productLoc: formData.productLoc ,
            mileage : formData.mileage ,
            year : formData.year ,
            engine : formData.engine ,
            trans : formData.trans ,
            fuel : formData.fuel ,
            isVerified: isVerified,
            location: location,
            specproduct: specproduct,
            currency: currency,
            shopLocation: shopLocation,
            deliveryR : deliveryR ,
            sellRent: sellRent ,
            sellOBuy :sellOBuy ,
            priceRange : priceRange ,
            vehicleType : vehicleType ,
            brandNew : brandNew ,
            swapA : swapA ,
            negetiatable : negetiatable ,
            vehiMake : vehiMake,
            trailerType : trailerType ,
            sProviderType : sProviderType ,
            expoPushToken : expoPushToken,
            timeStamp : serverTimestamp() ,

        });


       setFormData({
    productName: "",
    price: "",
    additionalInfo :"" ,
    productLoc :"" ,
    mileage :'' ,
    year :'' ,
    engine : '' , 
    trans :"" ,
     fuel :'',
     swapWith :''
      });
      imageUrls = []
      setImages([])
      setSpinnerItem(false)
      setVehiMake(null)
      setVehicleType(null)
      setBrandNew(false)
      setnegotiatable(false)
      setSwapA(false)
      setSProviderType(null)
      setTrailerType(null)
    } catch (error) {
      setSpinnerItem(false)
        console.error('Error uploading images and adding document:', error);
    }
  };

  return (
      <View style={{alignItems :'center', paddingTop : 80}} >
       <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
        {<TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()} >
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> }
        
        <Text style={{fontSize: 20 , color : 'white'}} > Add {specproduct} to Shop  </Text>
       </View>

             {verifyOngoing && !isVerified&&<TouchableOpacity  onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`
I aspire to become verified at the first level on Transix Now!
To make this happen without any delays or uncertainties.

Provide:
- Company Address
- Company Details (e.g., Articles of Association, tax clearance, etc.)
- National ID or Passport must match details in company details

- Verify Address using Utility Bill (electricity, water, internet, gas),
  Lease Agreement, Business Licence, Tax Document.

- The document for Address must be from 3-6 months ago.

There is a $5 monthly subscription fee, and you can choose for how long you want to be verified.

The Future Of Transport And Logistics (Transix)
`)} `)} style={{  marginBottom : 4,  padding :7 ,borderWidth : 3 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 3, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5, margin :10}} >
                          
              {<View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
                <MaterialIcons name="verified" size={29} color="green" />
              </View>}
          <Text style={{alignSelf:'flex-start',fontSize:13 , color:'green',fontStyle:'italic'}} >Ongoing Verification</Text>
          <Text style={{textAlign:'center',fontSize :17,color:"#6a0c0c",fontWeight:'500'}} >
            If You Are Legit
            </Text>
          <Text>Click Here to Verify Your Business and Vehicles</Text>
        </TouchableOpacity>}

        <ScrollView  horizontal  showsHorizontalScrollIndicator={false}  >

   {images.map((image, index) => (

                <Image  source={{ uri: image.uri }} key={index} style={{ width: 200, height: 200, margin: 7 }} />
    )
)
}
          </ScrollView>

         {images.length <4 && sellOBuy!=="toBuy" && <Text>Add @ most 4  Images </Text> }
      {images.length <4 && sellOBuy!=="toBuy" && <Text style={{fontStyle:"italic"}} >Small sized images e.g screenshots for them to load fast </Text>}

     {images.length <4 && sellOBuy!=="toBuy" &&<TouchableOpacity onPress={handleFileInputChange} style={{marginBottom : 12 , marginTop :10}}>
          <Fontisto name="camera" size={30} color="#6a0c0c" />
     </TouchableOpacity>}


    <ScrollView showsVerticalScrollIndicator={false} >

      
        {!vehiMakeDsp && !vehicleTypeDsp && specproduct === "vehicles" && <ScrollView horizontal style={{ width : 240 , flexDirection: 'row' , height:27 , margin :10, marginBottom :19}} >
     <TextInput
          value={formData.mileage}
          placeholder="Mileage"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'mileage')}
          type="text" 
          style={{width : 85 , borderWidth : 1 , borderColor : 'black' , marginRight:8, padding:0 ,paddingLeft:15 } }
        />
          <TextInput
          value={formData.year}
          placeholder="Year"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'year')}
          type="text" 
          style={{width : 85 , borderWidth : 1 , borderColor : 'black' , marginRight:8 ,  padding:0, paddingLeft:15 } }
        />
          <TextInput
          value={formData.engine}
          placeholder="Engine"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'engine')}
          type="text" 
          style={{width : 75 , borderWidth : 1 , borderColor : 'black' , marginRight:8 , padding:0,paddingLeft:15  }}
        />
          <TextInput
          value={formData.trans}
          placeholder="Trans"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'trans')}
          type="text" 
          style={{width : 75 , borderWidth : 1 , borderColor : 'black' , marginRight:8 , padding:0,paddingLeft:15 } }
        />
             <TextInput
          value={formData.fuel}
          placeholder="Fuel"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'fuel')}
          type="text" 
          style={{width : 75 , borderWidth : 1 , borderColor : 'black' , marginRight:8 ,padding:0,paddingLeft:15  } }
        />
          
        </ScrollView>}


             { specproduct !== "Sprovider" &&  <View style={{flexDirection:'row', margin :5,marginBottom :15,alignSelf:'center'}} >
              <TouchableOpacity onPress={toggleBrandNew} style={ brandNew ? { 
     backgroundColor : '#40E0D0' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' }: styles.buttonIsFalse} >
                <Text style={ brandNew ? {color:'white'} :null } >Brand New</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleSwapA} style={  swapA ? {  
     backgroundColor : '#008080' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' } : styles.buttonIsFalse} >
                <Text style={ swapA ? {color:'white'} :null } >Swap</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleNegotiatable} style={ negetiatable ? { 
     backgroundColor : '#25D366' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' } : styles.buttonIsFalse} >

                <Text style={ negetiatable ? {color:'white'} :null } >Negotiable</Text>
              </TouchableOpacity>
            </View>}

        <TextInput
          value={formData.productName}
          placeholder={specproduct === "Sprovider" ? "What Do You offer" : "Product Name" }
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'productName')}
          type="text" 
          style={inputstyles.addIterms }
        />
         {swapA && <TextInput
          value={formData.swapWith}
          placeholder="Swap condtions"
          placeholderTextColor="#6a0c0c"
          onChangeText={(text) => handlechange(text, 'swapWith')}
          type="text" 
          style={inputstyles.addIterms }
        />}
    
   { specproduct !== "Sprovider" && <View style={{flexDirection:'row', alignItems : 'center'}}>   
     <TouchableOpacity onPress={toggleCurrency}>
        {currency ? <Text style={styles.buttonIsFalse} >USD</Text> :
         <Text style={styles.bttonIsTrue}>Rand </Text>}
      </TouchableOpacity>

        <TextInput
          placeholder="Price"
          type="text"
          onChange={handlechange}
          name="toLocation"
          value={formData.price}
          placeholderTextColor="#6a0c0c"
        keyboardType="numeric"
          style={{height : 40 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 , 
   paddingLeft : 20 ,width : 220} }
          onChangeText={(text) => handlechange(text, 'price')}
        />
        
    </View>}

      { spinnerItem &&<ActivityIndicator size={34} />}
       
                
          {!vehicleTypeDsp&& !vehiMakeDsp && <View>
    { specproduct !== "Sprovider" &&    <TextInput 
            value={formData.productLoc}
            placeholderTextColor="#6a0c0c"
            placeholder="Product location"
            onChangeText={(text) => handlechange(text, 'productLoc')}
            type="text"
            style={inputstyles.addIterms }
          />}

          
          <TextInput 
            value={formData.additionalInfo}
            placeholderTextColor="#6a0c0c"
            placeholder="Additional Information"
            onChangeText={(text) => handlechange(text, 'additionalInfo')}
            type="text"
            style={inputstyles.addIterms }
          />

          </View>
          }
          
             {!vehicleTypeDsp && !trailerTypeDsp && specproduct ==="vehicles" || specproduct ==="trailers" ? <View style={{margin : 13,alignSelf:'center'}} >
              <View style={{flexDirection:'row', marginBottom:5}} >
                <TouchableOpacity style={sellRent===true ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={()=>toggleSellRent(true) } >
                  <Text style={sellRent===true ? {color:'white'} : {color:'black'} } > Sell </Text>
                </TouchableOpacity>

                <TouchableOpacity  style={!sellRent ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={()=>toggleSellRent(false) } >
                  <Text style={!sellRent ? {color:'white'} : {color:'black'} } > Rent </Text>
                </TouchableOpacity> 

                <TouchableOpacity  style={sellRent==="R2B" ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={()=>toggleSellRent("R2B") } >
                  <Text style={sellRent==="R2B" ? {color:'white'} : {color:'black'} } > Rent to Buy </Text>
                </TouchableOpacity> 
                </View>
               { <View>
                </View>}

              </View>
              :null}


              { specproduct === "vehicles" &&  <View style={{flexDirection:'row' ,alignSelf:'center'}} >
                 { !vehicleTypeDsp && !vehiMakeDsp && <TouchableOpacity onPress={dspVehicleTypeDsp} style={!vehicleType ? {        
                  backgroundColor :"#6a0c0c",height : 30,justifyContent : 'center' , alignItems : 'center'  ,marginBottom: 15 ,borderRadius: 10 , paddingLeft: 7 , paddingRight  : 7
                    } : {
                  height : 30,justifyContent : 'center' , alignItems : 'center' ,marginBottom: 15 ,borderWidth: 2 ,borderColor:"#6a0c0c" ,borderRadius: 10 , paddingLeft: 7 , paddingRight  : 7
                    } } >
                    <Text style={!vehicleType ? {color :'white'}:null } > {vehicleType ? vehicleType : "vehicle type"}</Text>
                  </TouchableOpacity>}

                 {!vehiMakeDsp && !vehicleTypeDsp &&<TouchableOpacity onPress={toggleVehiMakeDsp} style={!vehiMake ? {        
                  backgroundColor :"#6a0c0c",height : 30,justifyContent : 'center' , alignItems : 'center'  ,marginBottom: 15 ,borderRadius: 10 , paddingLeft: 7 , paddingRight  : 7  , marginLeft:9
                    } : {
                  height : 30,justifyContent : 'center' , alignItems : 'center' ,marginBottom: 15 ,borderWidth: 2 ,borderColor:"#6a0c0c" ,borderRadius: 10 , paddingLeft: 7 , paddingRight  : 7 , marginLeft:5
                    } } >
                    <Text style={!vehiMake ? {color :'white'}:null } > {vehiMake ? vehiMake : "vehicle Make"} </Text>
                  </TouchableOpacity>}

                </View>}

             {specproduct=== "trailers" && <View style={{alignSelf:'center'}} >
                      <TouchableOpacity onPress={toggleTrailerTypeDsp} style={!trailerType ? styles.buttonSelectStyle : styles.buttonStyle } >
                        <Text style={!trailerType ? {color :'white'}:null } >{trailerType ? trailerType  : "Trailer Type" } </Text>
                      </TouchableOpacity>

                     {trailerTypeDsp && <View style={{alignSelf:'center'}} >
                      <TouchableOpacity onPress={()=>addTrailerType("Bulktrailer")} style={styles.buttonStyle} >
                        <Text>Bulk trailer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("SideTipper")}  style={styles.buttonStyle} >
                        <Text>Side Tipper</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("Tautliner")}  style={styles.buttonStyle} >
                        <Text>Tautliner</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("Flatbed")}  style={styles.buttonStyle} >
                        <Text>Flatbed</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("Tanker")}  style={styles.buttonStyle} >
                        <Text>Tanker</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("Refrigerated")} style={styles.buttonStyle}  >
                        <Text>Refrigerated</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("CarHauler")}  style={styles.buttonStyle} >
                        <Text>Car Hauler </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("UtilityTrailer")} style={styles.buttonStyle}  >
                        <Text>Utility Trailer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("Lowboy")} style={styles.buttonStyle}  >
                        <Text>Lowboy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addTrailerType("otherTrailer")}  style={styles.buttonStyle} >
                        <Text>other</Text>
                      </TouchableOpacity>
                        </View>}
                    </View> }



                    {specproduct=== "Sprovider" && <View style={{alignSelf:'center'}} >
                      <TouchableOpacity onPress={toggleSproviderDsp} style={!sProviderType ? styles.buttonSelectStyle : styles.buttonStyle } >
                        <Text style={!sProviderType ? {color :'white'}:null } >{sProviderType ? sProviderType  : "S Provider Type" } </Text>
                      </TouchableOpacity>

                     {sProviderDsp && <View style={{alignSelf:'center'}} >
                        <TouchableOpacity onPress={()=>addSProviderType("AutoMechanic")}  style={styles.buttonStyle} >
                        <Text>Auto Mech</Text>
                      </TouchableOpacity>
                        <TouchableOpacity onPress={()=>addSProviderType("HeavyDutyMechanic")}  style={styles.buttonStyle} >
                        <Text>Heavy Equip Mech</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addSProviderType("MotoMechanic")} style={styles.buttonStyle} >
                        <Text>Moto Mech</Text>
                      </TouchableOpacity>
                        <TouchableOpacity onPress={()=>addSProviderType("AutoTechnician")}  style={styles.buttonStyle} >
                        <Text>Auto Tech</Text>
                      </TouchableOpacity>
                        <TouchableOpacity onPress={()=>addSProviderType("MotoTechnician")}  style={styles.buttonStyle} >
                        <Text>Moto Tech</Text>
                      </TouchableOpacity>
                        <TouchableOpacity onPress={()=>addSProviderType("HeavyEquipmentTechnician")}  style={styles.buttonStyle} >
                        <Text>Heavy Equip Tech</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addSProviderType("Towing")}  style={styles.buttonStyle} >
                        <Text>Towing</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addSProviderType("Warehouse")}  style={styles.buttonStyle} >
                        <Text>Warehouse</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>addSProviderType("other")}  style={styles.buttonStyle} >
                        <Text>other</Text>
                      </TouchableOpacity>
                     
                        </View>}
                    </View> }



                 { vehicleTypeDsp && <View style={{alignSelf:"center"}} >
                 { !heavyEquipment && <TouchableOpacity onPress={toggleCargoTrcks} style={styles.buttonSelectStyle} >
                    <Text style={{color:'white'}} >Cargo Trucks</Text>
                  </TouchableOpacity>}

                 { !cargoTrcks && <TouchableOpacity onPress={toggleHeavyEquipment} style={styles.buttonSelectStyle} >
                    <Text style={{color:'white'}}>Heavy Equipment </Text>
                  </TouchableOpacity>}

                 { heavyEquipment && <View> 
                    <TouchableOpacity onPress={()=>addVehicleType("Tipper")}  style={styles.buttonStyle} >
                      <Text>Tipper</Text>
                    </TouchableOpacity  >
                    <TouchableOpacity  onPress={()=>addVehicleType("Excavator")} style={styles.buttonStyle} >
                      <Text>Excavator</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>addVehicleType("Bulldozer")} style={styles.buttonStyle} >
                      <Text>Bulldozer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>addVehicleType("WheelLoader")}style={styles.buttonStyle}  >
                      <Text>Crane</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>addVehicleType("truckhorse")} style={styles.buttonStyle} >
                      <Text>WheelLoader</Text>
                    </TouchableOpacity>

                    <TouchableOpacity  onPress={()=>addVehicleType("Compactors")}style={styles.buttonStyle}  >
                      <Text>Compactors</Text>
                    </TouchableOpacity>

                    <TouchableOpacity  onPress={()=>addVehicleType("Pavers")}style={styles.buttonStyle}  >
                      <Text>Pavers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>addVehicleType("Graders")} style={styles.buttonStyle} >
                      <Text>Graders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity  onPress={()=>addVehicleType("TrackedLoader")} style={styles.buttonStyle} >
                      <Text>Tracked Loader</Text>
                    </TouchableOpacity>

                    <TouchableOpacity  onPress={()=>addVehicleType("ConcreteMixer")} style={styles.buttonStyle} >
                      <Text>Concrete Mixer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={()=>addVehicleType("otherHeavyB")} style={styles.buttonStyle} >
                      <Text>Other</Text>
                    </TouchableOpacity>
                    
                  </View>}
                 {cargoTrcks && <ScrollView>
                  <TouchableOpacity onPress={()=>addVehicleType("truckhorse")} style={styles.buttonStyle} >
                    <Text>truck horse</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("BoxTrucks")} style={styles.buttonStyle} >
                    <Text>Box Trucks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("FlatbedTrucks")}style={styles.buttonStyle}  >
                    <Text>Flatbed Trucks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("RefrigeratedTrucks")} style={styles.buttonStyle} >
                    <Text>Refrigerated Trucks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("DumpTrucks")} style={styles.buttonStyle} >
                    <Text>Dump Trucks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("TankerTrucks")}style={styles.buttonStyle}  >
                    <Text>Tanker Trucks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={()=>addVehicleType("CurtainsideTrucks")} style={styles.buttonStyle} >
                    <Text>Curtainside Trucks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={()=>addVehicleType("ParcelVans")} style={styles.buttonStyle} >
                    <Text>Parcel Vans</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("otherCargos")} style={styles.buttonStyle} >
                    <Text>Other</Text>
                  </TouchableOpacity>
                  </ScrollView>}

                 {!cargoTrcks&& !heavyEquipment&& <ScrollView>
                  <TouchableOpacity onPress={()=>addVehicleType("Sedans")} style={styles.buttonStyle} >
                    <Text>Sedans</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("SUV")} style={styles.buttonStyle} >
                    <Text>SUV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("Vans")} style={styles.buttonStyle} >
                    <Text>Vans</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("PickupTrucks")} style={styles.buttonStyle} >
                    <Text>Pickup Trucks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("Hatchbacks")} style={styles.buttonStyle} >
                    <Text>Hatchbacks</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("Convertibles")} style={styles.buttonStyle} >
                    <Text>Convertibles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("Crossovers")} style={styles.buttonStyle} >
                    <Text>Crossovers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>addVehicleType("otherVehicles")} style={styles.buttonStyle} >
                    <Text>other</Text>
                  </TouchableOpacity>
                      <View style={{height :300}} >
                      </View>
                  </ScrollView>}

                  </View>}

                  {vehiMakeDsp && <ScrollView style={{alignSelf:'center'}} >
                    {!heavyEquipmentMake && <TouchableOpacity style={styles.buttonSelectStyle} onPress={toggleCargoTrcksMake} >
                      <Text style={{color:'white'}}>Cargo Trucks</Text>
                    </TouchableOpacity>}

                   { !cargoTrcksMake&& <TouchableOpacity  style={styles.buttonSelectStyle} onPress={toggleHeavyEquipmentMake}>
                      <Text style={{color:'white'}} >Heavy Equipment</Text>
                    </TouchableOpacity>}

                    {heavyEquipmentMake && <ScrollView> 
                      <TouchableOpacity style={styles.buttonStyle}  onPress={()=>addVehiMake("heavyCaterpillar") } >
                        <Text>Caterpillar </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle}  onPress={()=>addVehiMake("heavyVolvo") }>
                        <Text>Volvo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle}  onPress={()=>addVehiMake("heavyJohnDeere") }>
                        <Text>John Deere</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyHyundai") } >
                        <Text>Hyundai</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavySany") } >
                        <Text>Sany </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyKobelco") } >
                        <Text>Kobelco </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyXCMG") } >
                        <Text>XCMG</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyBobcat") } >
                        <Text>Bobcat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyHitachi") } >
                        <Text>Hitachi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyManitou") } >
                        <Text>Manitou</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyKubota") } >
                        <Text>Kubota</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("heavyOtherM") } >
                        <Text>Other</Text>
                      </TouchableOpacity>

                      <View style={{height :300}} >
                      </View>
                    </ScrollView>}

                   {cargoTrcksMake && <ScrollView>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoMercedesBenz") }  >
                        <Text>Mercedes-Benz</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoMAN") } >
                        <Text>MAN</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoScania") } >
                        <Text>Scania </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoHowo") } >
                        <Text>Howo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoVolvo") } >
                        <Text>Volvo </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoDAF") } >
                        <Text>DAF </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoIveco") } >
                        <Text>Iveco </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoUD") } >
                        <Text>UD </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoIsuzu") } >
                        <Text>Isuzu </Text>
                      </TouchableOpacity  >
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoMitsubishiFuso") } >
                        <Text>Mitsubishi Fuso</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoHino") } >
                        <Text>Hino</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("cargoOtherM") } >
                        <Text>other</Text>
                      </TouchableOpacity>

                      <View style={{height :300}} >
                      </View>
                    </ScrollView>}

                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Toyota") }  >
                      <Text>Toyota</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("MercedesBenz") }  >
                      <Text>Mercedes-Benz</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("BMW") }  >
                      <Text>BMW</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Honda") }  >
                      <Text>Honda</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("NISSAN") }  >
                      <Text>NISSAN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("MAZDA") }  >
                      <Text>MAZDA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Volkswagen") }  >
                      <Text>Volkswagen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Ford") }  >
                      <Text>Ford</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Isuzu") }  >
                      <Text>Isuzu</Text>
                    </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Chevrolet") }  >
                      <Text>Chevrolet</Text>
                      </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Hyundai") }  >
                        <Text>Hyundai</Text>
                    </TouchableOpacity>
                      <TouchableOpacity  style={styles.buttonStyle} onPress={()=>addVehiMake("Renault") } >
                        <Text>Renault</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Mitsubishi") }  >
                        <Text>Mitsubishi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("Kia") }  >
                        <Text>Kia</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.buttonStyle} onPress={()=>addVehiMake("otherMakes") }  >
                        <Text>other</Text>
                      </TouchableOpacity>
                      <View style={{height :300}} >
                      </View>
                  </ScrollView>}
             {!spinnerItem ?  <TouchableOpacity onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 70 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center', marginTop :6,alignSelf:"center"}} >

        <Text style={{color:'white'}} >submit</Text>

        </TouchableOpacity>
      : <View>
        <Text style={{alignSelf:"center",fontStyle:'italic'}} >The {specproduct} is being added Please wait </Text>  
         <Text style={{alignSelf:"center",fontStyle:'italic'}} >Add Screenshot Images so they can be added fast </Text>           
      </View>
      }
<View style={{height:500}} ></View>
    </ScrollView>
      
      </View>

  );
}


export default React.memo(AddToShop)

const styles = StyleSheet.create({
  
  buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
   } , 
    bttonIsTrue:{
    backgroundColor : '#6a0c0c' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' 
    } ,
       buttonStyle : {
        height : 30,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10
    } ,
    buttonSelectStyle :{
        backgroundColor :"#6a0c0c",
        height : 30,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderRadius: 10

    }
});
