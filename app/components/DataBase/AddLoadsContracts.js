import React , {useState} from "react";
import { db, auth } from "../config/fireBase";
import { collection, doc, addDoc, serverTimestamp ,} from 'firebase/firestore';

import { View , TextInput , Text, Alert ,TouchableOpacity , ActivityIndicator, StyleSheet,Linking, ScrollView} from "react-native";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import inputstyles from "../styles/inputElement";

function AddLoadContract ({route}) {


const {username ,contact , isVerified,isBlackListed ,blackLWarning ,blockVerifiedU,expoPushToken,verifyOngoing } = route.params
const [error , setError]= React.useState("")

  const loadsContract = collection(db, "loadsContracts");
    const [formData, setFormData] = useState({
    commodity: {
      frst: "",
      scnd: "",
      third: "",
    },
    location: {
      frst: "",
      scnd: "",
      thrd: "",
      forth: "",
      fifth: "",
      sixth: ""
    },
    trckRequired: {
      frst: "",
      scnd: "",
      third: "",
      forth: "",
      fifth: ""
    },
    otherRequirements: {
      frst: "",
      scnd: "",
      third: "",
      forth: ""
    },
    rate: {
      solidFrst: "",
      solidScnd: "",
      triaxleFrst: "",
      triaxlesScnd: "",
      linksFrst: "",
      linksScnd: ""
    },
    returnRate: {
      solidFrst: "",
      solidScnd: "",
      triaxleFrst: "",
      triaxlesScnd: "",
      linksFrst: "",
      linksScnd: ""
    }
  });



  const [formDataScnd, setFormDataScnd] = React.useState({
   
    paymentTerms: "",
    returnPaymentTerms: "",
    alertMsg:"",
    fuelAvai :"",
    additionalInfo: "",
   
  });

    const  handleTypedTextScnd  = (value, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };






    const [currency , setCurrency] = React.useState(true)
  function toggleCurrency(){
    setCurrency(prev=>!prev)
  }


    const [ trailerConfig , settrailerConfig] = React.useState(false)
  function toggleTrailerConfig(){
    settrailerConfig(prev=>!prev)
  }

  const [perTonne , setPerTonne] = React.useState(false)
  function togglePerTonne(){
    setPerTonne(prev=>!prev)
  }
  
  const [ activeLoading , setActiveLoading] = React.useState(false)
  function toggleActiveLoading(){
    setActiveLoading(prev=>!prev)
  }

  const [location , setlocation] =   React.useState("International")
  const [localLoads , setLocalLoads]=React.useState(false)

  function toggleLocalLoads(){
    setLocalLoads(prevState => !prevState)
  }

  function specifyLocation(loc){
    setlocation(loc)
    setLocalLoads(prev => false)
  }

  const [alertMsgD , setAlertMsgD] = React.useState(false)
  const [fuelAvaD , setfuelAvD] = React.useState(false)

  function toggleAlertMsgD(){
    setAlertMsgD(prev => !prev)
  }

  function toggleFuelMsgD(){
    setfuelAvD(prev => !prev)
  }


  const [returnLoad , setReturnLoad] = React.useState(false)

  function toggleDspRetunLoad(){
    setReturnLoad(prev => !prev)
  }

  const [roundTrip , setRoundTrip] = React.useState(false)

  function toggleRundTripAlert(){
    setRoundTrip(prev => !prev)
  }

   const handleTypedText = (text, field) => {
    const [section, subField] = field.split('.');
    setFormData(prevFormData => ({
      ...prevFormData,
      [section]: {
        ...prevFormData[section],
        [subField]: text
      }
    }));
  };
  
    const [spinnerItem, setSpinnerItem] = React.useState(false);
    
  const handleSubmit = async () => {

  if(isBlackListed ){
        return
      }else if(blackLWarning ){
        alert("Your account is currently under investigation.\n Please contact us for resolution")
        Linking.openURL(`whatsapp://send?phone=+263716326160  &text=${encodeURIComponent(`Good day \nMy Transix account is being investigated whats the issue and how can we resolve it \nMy username is ${username}`)} `)
        return
      }else if(blockVerifiedU){
        alert("Important: You are a blocked verified user.\n Legal action may be taken if necessary. \nContact us immediately.")
        Linking.openURL(`whatsapp://send?phone=+263716326160  &text=${encodeURIComponent(`Good day \n I am a blocked Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)
        return
      }

      if(returnLoad ){
        if(!formData.returnLoad || !formData.returnRate || !formData.returnTerms){
          alert("Whats the cargo rate and terms for return load")
          return
        }
      }else  if(alertMsgD && !formData.alertMsg ){
        alert("Alert is On Write the Alert Message")
        return
      }else if(fuelAvaD && !formData.fuelAvai){
        alert("You indicated There is Fuel ")
        return
      }

     if(!formData.typeofLoad || !formData.toLocation || !formData.fromLocation || !formData.paymentTerms){
        alert('Enter Rate , Commodity,Routes and Payment terms' )
        return
      }else if(!formData.ratePerTonne && !formData.links && !formData.triaxle ){
        alert("Enter the rate")
        return
      } else if(!username){
        alert('Create an accont' )
        return
      }
      setSpinnerItem(true)

      const userId = auth.currentUser.uid
    
      setError('')
    try {
      const docRef = await addDoc(loadsContract, {
        userId: userId, // Add the user ID to the document
        companyName: username,
        contact: contact,
        expoPushToken :expoPushToken ,
        timeStamp : serverTimestamp() ,
        currency : currency ,
        perTonne : perTonne , 
        activeLoading : activeLoading ,
        location : location ,
        roundTrip : roundTrip ,
        ...formData  ,
        ...formDataScnd ,
        startingDate : '' ,
        bookingClosingD : '',
        contractId : `co${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ct` ,

      });

      setFormData({
    typeofLoad: "",
    fromLocation: "",
    toLocation: "",
    ratePerTonne: "",
    additionalInfo: "",
    links :"" ,
    triaxle :"",
    paymentTerms: "",
    requirements: "",
    fuelAvai :"",
    alertMsg :""
      });
      setAlertMsgD(false)
      setfuelAvD(false)
      setReturnLoad(false)
      setRoundTrip(false)
      setSpinnerItem(false)
      setPerTonne(false)
      setActiveLoading(false)
    } catch (err) {
      setSpinnerItem(false)
      setError(err.toString());
      }
  };





const [dspCommodity, setDspCommodity] = React.useState(false);

function toggleDspCommodity(params) {
  setDspCommodity(prev=> !prev);
}

const [dspLocation, setDspLocation] = React.useState(false);

function toggleDspLocation(params) {
  setDspLocation(prev=> !prev);
}

const [dspTruckRequired, setDspTruckRequired] = React.useState(false);

function toggleDspTruckRequired(params) {
  setDspTruckRequired(prev=> !prev);
}

const [dspRate, setDspRate] = React.useState(false);

function toggleDspRate(params) {
  setDspRate(prev=> !prev);
}





const [dspOtherRequirements, setDspOtherRequirements] = React.useState(false);

function toggleDspOtherRequirements(params) {
  setDspOtherRequirements(prev=> !prev);
}

const [dspReturnRate, setDspReturnRate] = React.useState(false);

function toggleDspReturnRate(params) {
  setDspReturnRate(prev=> !prev);
}















  return (
    <View   style={{alignItems :'center', paddingTop:55}}>
        {verifyOngoing && !isVerified&&<TouchableOpacity  style={{  marginBottom : 4,  padding :7 ,borderWidth : 3 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
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
          <Text>Click Here to Verify Your Business and Loads</Text>
        </TouchableOpacity>}

<View style={{height:40 , position:'absolute' , top: 0  , left : 0 , right:0 , flexDirection:'row'}}>
  <TouchableOpacity style={styles.buttonIsFalse} >
    <Text>Load Details</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.buttonIsFalse} >
    <Text>Fuel</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.buttonIsFalse} >
    <Text>Return Load</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.buttonIsFalse}>
    <Text>Loads/week</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.buttonIsFalse}>
    <Text>NB Msg</Text>
  </TouchableOpacity>

</View>

    <ScrollView >

       {   <View>









{ !dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspLocation && <View style={{      marginBottom: 15,
      padding: 10,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 320}} >
        {dspCommodity && <Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add all the commodities to be transpoted</Text>}
          {!dspCommodity &&<Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add 3 Commodity</Text>}
        <TextInput
          value={formData.commodity.frst}
          placeholder="First Commodity"
          onChangeText={(text) => handleTypedText(text, 'commodity.frst')}
          style={inputstyles.addIterms }
        />
        <TextInput
          value={formData.commodity.scnd}
          placeholder="Second Commodity"
          onChangeText={(text) => handleTypedText(text, 'commodity.scnd')}
          style={inputstyles.addIterms }
          />

          {!dspCommodity&&<TouchableOpacity onPress={toggleDspCommodity} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5,marginTop:6}} >
          <Text style={{fontStyle:'italic'}} >If u have more than 2 commoditys</Text>

          </TouchableOpacity>}
     { dspCommodity &&  <View>
        <TextInput
          value={formData.commodity.third}
          placeholder="Third Commodity"
          onChangeText={(text) => handleTypedText(text, 'commodity.third')}
          style={inputstyles.addIterms }
        />
        <TextInput
          value={formData.commodity.forth}
          placeholder="Fourth Commodity"
          onChangeText={(text) => handleTypedText(text, 'commodity.forth')}
          style={inputstyles.addIterms }
        />
 <TouchableOpacity onPress={toggleDspCommodity} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}} >
  <Text style={{fontStyle:'italic'}}>Done Adding commodities</Text>
 </TouchableOpacity>
 </View>}



      </View>}










     
      
      { !dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired &&  !dspCommodity &&  <View style={{      marginBottom: 15,
      padding: 10,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 320}} >
        
        {dspLocation && <Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add all the commodities to be transpoted</Text>}
          {!dspLocation &&<Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add 3 Commodity</Text>}
        <TextInput
          value={formData.location.frst}
          placeholder="First Location"
          onChangeText={(text) => handleTypedText(text, 'location.frst')}
          style={inputstyles.addIterms }
        />
        <TextInput
          value={formData.location.scnd}
          placeholder="Second Location"
          onChangeText={(text) => handleTypedText(text, 'location.scnd')}
          style={inputstyles.addIterms }
        />

          {!dspLocation&&<TouchableOpacity onPress={toggleDspLocation} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>If u have more than 2 commoditys</Text>

          </TouchableOpacity>}

     {dspLocation && <View>
      

        <TextInput
          value={formData.location.thrd}
          placeholder="Third Location"
          onChangeText={(text) => handleTypedText(text, 'location.thrd')}
          style={inputstyles.addIterms }
        />
        <TextInput
          value={formData.location.forth}
          placeholder="Fourth Location"
          onChangeText={(text) => handleTypedText(text, 'location.forth')}
          style={inputstyles.addIterms }
        />
        <TextInput
          value={formData.location.fifth}
          placeholder="Fifth Location"
          onChangeText={(text) => handleTypedText(text, 'location.fifth')}
          style={inputstyles.addIterms }
        />
        <TextInput
          value={formData.location.sixth}
          placeholder="Sixth Location"
          onChangeText={(text) => handleTypedText(text, 'location.sixth')}
          style={inputstyles.addIterms }
        />
  {dspLocation&&<TouchableOpacity onPress={toggleDspLocation} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>Done Adiing Location</Text>

          </TouchableOpacity>}
      </View>}
      </View>}









     {  !dspReturnRate && !dspOtherRequirements && !dspRate &&  !dspLocation && !dspCommodity && <View style={{      marginBottom: 15,
      padding: 10,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 320}}>

        {dspTruckRequired && <Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add all the commodities to be transpoted</Text>}
          {!dspTruckRequired &&<Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add 3 Commodity</Text>}
      <TextInput
        value={formData.trckRequired.frst}
        placeholder="First Truck Requirement"
        onChangeText={(text) => handleTypedText(text, 'trckRequired.frst')}
        style={inputstyles.addIterms }
      />
      <TextInput
        value={formData.trckRequired.scnd}
        placeholder="Second Truck Requirement"
        onChangeText={(text) => handleTypedText(text, 'trckRequired.scnd')}
        style={inputstyles.addIterms }
      />
  {!dspTruckRequired&&<TouchableOpacity onPress={toggleDspTruckRequired} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>If more than 2 truck types required</Text>

          </TouchableOpacity>}

      {dspTruckRequired &&<View> 
      <TextInput
        value={formData.trckRequired.third}
        placeholder="Third Truck Requirement"
        onChangeText={(text) => handleTypedText(text, 'trckRequired.third')}
        style={inputstyles.addIterms }
      />
      <TextInput
        value={formData.trckRequired.forth}
        placeholder="Fourth Truck Requirement"
        onChangeText={(text) => handleTypedText(text, 'trckRequired.forth')}
        style={inputstyles.addIterms }
      />
      <TextInput
        value={formData.trckRequired.fifth}
        placeholder="Fifth Truck Requirement"
        onChangeText={(text) => handleTypedText(text, 'trckRequired.fifth')}
        style={inputstyles.addIterms }
      />
        {dspTruckRequired&&<TouchableOpacity onPress={toggleDspTruckRequired} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>Done Adiing Required Trucks</Text>

          </TouchableOpacity>}
      </View>}
    </View>}
    









    { !dspReturnRate &&  !dspRate && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={{      marginBottom: 15,
      padding: 10,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 320}}>

        {dspOtherRequirements&& <Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add all the commodities to be transpoted</Text>}
          {!dspOtherRequirements &&<Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add 3 Commodity</Text>}
      <TextInput
        value={formData.otherRequirements.frst}
        placeholder="First Other Requirement"
        onChangeText={(text) => handleTypedText(text, 'otherRequirements.frst')}
        style={inputstyles.addIterms }
      />
      <TextInput
        value={formData.otherRequirements.scnd}
        placeholder="Second Other Requirement"
        onChangeText={(text) => handleTypedText(text, 'otherRequirements.scnd')}
        style={inputstyles.addIterms }
      />
  {!dspOtherRequirements&&<TouchableOpacity onPress={toggleDspOtherRequirements} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>

          <Text style={{fontStyle:'italic'}}>Geral Requirements </Text>

          </TouchableOpacity>}
      {dspOtherRequirements&&<View>


      <TextInput
        value={formData.otherRequirements.third}
        placeholder="Third Other Requirement"
        onChangeText={(text) => handleTypedText(text, 'otherRequirements.third')}
        style={inputstyles.addIterms }
      />
      <TextInput
        value={formData.otherRequirements.forth}
        placeholder="Fourth Other Requirement"
        onChangeText={(text) => handleTypedText(text, 'otherRequirements.forth')}
        style={inputstyles.addIterms }
      />
        {dspOtherRequirements&&<TouchableOpacity onPress={toggleDspOtherRequirements} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>Done General Requirements</Text>

          </TouchableOpacity>}
      </View>}
    </View>}









  {  !dspReturnRate && !dspOtherRequirements &&  !dspTruckRequired && !dspLocation && !dspCommodity && <View style={{      marginBottom: 15,
      padding: 10,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 320}}>
        {dspRate&& <Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add all the commodities to be transpoted</Text>}
          {!dspRate &&<Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add 3 Commodity</Text>}
  <TextInput
    value={formData.rate.solidFrst}
    placeholder="Solid First Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.solidFrst')}
    style={inputstyles.addIterms }
  />
 {dspRate &&  <TextInput
    value={formData.rate.solidScnd}
    placeholder="Solid Second Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.solidScnd')}
    style={inputstyles.addIterms }
  />}

  <TextInput
    value={formData.rate.triaxleFrst}
    placeholder="Triaxle First Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.triaxleFrst')}
    style={inputstyles.addIterms }
  />
 {dspRate &&  <TextInput
    value={formData.rate.triaxlesScnd}
    placeholder="Triaxle Second Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.triaxlesScnd')}
    style={inputstyles.addIterms }
  />}
  <TextInput
    value={formData.rate.linksFrst}
    placeholder="Links First Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.linksFrst')}
    style={inputstyles.addIterms }
  />
 {dspRate &&  <TextInput
    value={formData.rate.linksScnd}
    placeholder="Links Second Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.linksScnd')}
    style={inputstyles.addIterms }
  />}


    {!dspRate&&<TouchableOpacity onPress={toggleDspRate} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>More than 2 rates </Text>

          </TouchableOpacity>}

    {dspRate&&<TouchableOpacity onPress={toggleDspRate} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>Done Adding Rates</Text>

          </TouchableOpacity>}


</View>}









   { !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={{      marginBottom: 15,
      padding: 10,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 320}}>
        {dspReturnRate&& <Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add all the commodities to be transpoted</Text>}
          {!dspReturnRate &&<Text style={{color:'#1E90FF' , fontWeight:'bold' , fontSize:15, alignSelf:'center'}} >Add 3 Commodity</Text>}
  <TextInput
    value={formData.returnRate.solidFrst}
    placeholder="Return Solid First Rate"
    onChangeText={(text) => handleTypedText(text, 'returnRate.solidFrst')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.returnRate.solidScnd}
    placeholder="Return Solid Second Rate"
    onChangeText={(text) => handleTypedText(text, 'returnRate.solidScnd')}
    style={inputstyles.addIterms }
  />
   {!dspReturnRate&&<TouchableOpacity onPress={toggleDspReturnRate} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>More than 2 rates </Text>

          </TouchableOpacity>}
 { dspReturnRate&&<View>


  <TextInput
    value={formData.returnRate.triaxleFrst}
    placeholder="Return Triaxle First Rate"
    onChangeText={(text) => handleTypedText(text, 'returnRate.triaxleFrst')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.returnRate.triaxlesScnd}
    placeholder="Return Triaxle Second Rate"
    onChangeText={(text) => handleTypedText(text, 'returnRate.triaxlesScnd')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.returnRate.linksFrst}
    placeholder="Return Links First Rate"
    onChangeText={(text) => handleTypedText(text, 'returnRate.linksFrst')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.returnRate.linkScnd}
    placeholder="Return Links Second Rate"
    onChangeText={(text) => handleTypedText(text, 'returnRate.linkScnd')}
    style={inputstyles.addIterms }
  />
  {dspOtherRequirements&&<TouchableOpacity onPress={toggleDspReturnRate} style={{padding:6 , borderWidth:1 , borderColor:'black',justifyContent:'center',alignItems:'center',borderRadius:5}}>
          <Text style={{fontStyle:'italic'}}>Done Adding Return Rate</Text>

          </TouchableOpacity>}
  </View>}

</View>}












  </View>
  }


    </ScrollView>
</View>
  );
}

export default React.memo(AddLoadContract);

const styles = StyleSheet.create({

  buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :6 , 
     paddingRight:6 ,
     alignSelf:'center' ,

     marginLeft : 6
   } , 
    bttonIsTrue:{
    backgroundColor : '#6a0c0c' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' ,
     alignSelf:'center'

    }
});
