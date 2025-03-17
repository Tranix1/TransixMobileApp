import React from "react";
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
  setDspCommodity(true);
}

const [dspLocation, setDspLocation] = React.useState(false);

function toggleDspLocation(params) {
  setDspLocation(true);
}

const [dspTruckRequired, setDspTruckRequired] = React.useState(false);

function toggleDspTruckRequired(params) {
  setDspTruckRequired(true);
}

const [dspRate, setDspRate] = React.useState(false);

function toggleDspRate(params) {
  setDspRate(true);
}





const [dspOtherRequirements, setDspOtherRequirements] = React.useState(false);

function toggleDspOtherRequirements(params) {
  setDspOtherRequirements(true);
}

const [dspReturnRate, setDspReturnRate] = React.useState(false);

function toggleDspReturnRate(params) {
  setDspReturnRate(true);
}



  return (
    <View   style={{alignItems :'center', }}>
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
          <Text>Click Here to Verify Your Business and Loads</Text>
        </TouchableOpacity>}
    <ScrollView showsVerticalScrollIndicator={false} >

       { !localLoads &&   <View>









{<View style={dspCommodity ?{position:'absolute', top :0 , bottom:0 , left:0 , right : 0 , backgroundColor:'white'}:null } >
        {dspCommodity && <Text>Add all the commodities to be transpoted</Text>}

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

          {!dspCommodity&&<TouchableOpacity onPress={toggleDspCommodity} >
          <Text>If u have more than 2 commoditys</Text>

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
 </View>}

 <TouchableOpacity onPress={toggleDspCommodity}>
  <Text>Done Adding commodities</Text>
 </TouchableOpacity>


      </View>}










     
      
      {dspLocation && <View>
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
      </View>}









     {dspTruckRequired && <View>
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
    </View>}
    









    {dspOtherRequirements&&<View>
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
    </View>}









  {dspRate && <View>
  <TextInput
    value={formData.rate.solidFrst}
    placeholder="Solid First Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.solidFrst')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.rate.solidScnd}
    placeholder="Solid Second Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.solidScnd')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.rate.triaxleFrst}
    placeholder="Triaxle First Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.triaxleFrst')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.rate.triaxlesScnd}
    placeholder="Triaxle Second Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.triaxlesScnd')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.rate.linksFrst}
    placeholder="Links First Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.linksFrst')}
    style={inputstyles.addIterms }
  />
  <TextInput
    value={formData.rate.linksScnd}
    placeholder="Links Second Rate"
    onChangeText={(text) => handleTypedText(text, 'rate.linksScnd')}
    style={inputstyles.addIterms }
  />
</View>}









   {dspReturnRate&&<View>
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
</View>}














  {!trailerConfig && <View style={{flexDirection:'row', alignItems : 'center'}}>

    <View>   
     <TouchableOpacity onPress={toggleCurrency}>
        {currency ? <Text style={styles.buttonIsFalse} >USD</Text> :
         <Text style={styles.bttonIsTrue}>Rand </Text>}
      </TouchableOpacity>
    </View>

    <TextInput
        onChangeText={(text) => handleTypedText(text, 'ratePerTonne')}
        name="ratePerTonne"
        value={formData.ratePerTonne}
        keyboardType="numeric"
        placeholderTextColor="#6a0c0c"
        style={ {   height : 40 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 , paddingLeft : 20 ,width : 180}}
        placeholder="Enter rate here"
      />
      <TouchableOpacity onPress={togglePerTonne} >
         {perTonne ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
          <Text style={styles.buttonIsFalse}>Per tonne</Text>}
      </TouchableOpacity>
   </View>}


<TouchableOpacity onPress={toggleTrailerConfig} style={ trailerConfig ? styles.bttonIsTrue : styles.buttonIsFalse} >
  <Text style={ trailerConfig ? {color:'white'} :null }  >Trailer config</Text>
</TouchableOpacity>




{trailerConfig && <View>

  <View >
    <Text style={{fontSize:19 ,}} >Links </Text>
        <View style={{flexDirection:'row', alignItems : 'center'}} >
    <View>   
     <TouchableOpacity onPress={toggleCurrency}>
        {currency ? <Text style={styles.buttonIsFalse} >USD</Text> :
         <Text style={styles.bttonIsTrue}>Rand </Text>}
      </TouchableOpacity>
    </View>

    <TextInput
        onChangeText={(text) => handleTypedText(text, 'links')}
        name="links"
        value={formData.links}
        keyboardType="numeric"
        placeholderTextColor="#6a0c0c"
        style={ {   height : 40 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 , paddingLeft : 20 ,width : 180}}
        placeholder="Enter Links rate"
      />
      <TouchableOpacity onPress={togglePerTonne} >
         {perTonne ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
          <Text style={styles.buttonIsFalse}>Per tonne</Text>}
      </TouchableOpacity>
   </View>
 </View>


  <View >
    <Text style={{fontSize:19 , }}>Triaxle</Text>
        <View style={{flexDirection:'row', alignItems : 'center'}} > 
    <View>   
     <TouchableOpacity onPress={toggleCurrency}>
        {currency ? <Text style={styles.buttonIsFalse} >USD</Text> :
         <Text style={styles.bttonIsTrue}>Rand </Text>}
      </TouchableOpacity>
    </View>

    <TextInput
        onChangeText={(text) => handleTypedText(text, 'triaxle')}
        name="triaxle"
        value={formData.triaxle}
        keyboardType="numeric"
        placeholderTextColor="#6a0c0c"
        style={ {   height : 40 , borderBottomWidth: 2 , borderBottomColor : "#6a0c0c" ,marginBottom : 10 , paddingLeft : 20 ,width : 180}}
        placeholder="Enter triaxle rate"
      />
      <TouchableOpacity onPress={togglePerTonne} >
         {perTonne ? <Text style={styles.bttonIsTrue} >Per tonne</Text> : 
          <Text style={styles.buttonIsFalse}>Per tonne</Text>}
      </TouchableOpacity>
   </View>
   </View>

</View>}







      { spinnerItem &&<ActivityIndicator size={36} />}
        {error &&<Text>{error} retry </Text>}

  <TextInput
    value={formDataScnd.paymentTerms}
    placeholderTextColor="#6a0c0c"
    placeholder="Payment Terms"
    onChangeText={(text) => handleTypedTextScnd(text, 'paymentTerms')}
    type="text"
    style={inputstyles.addIterms }
  />
  <TextInput
     value={formDataScnd.requirements}
    placeholderTextColor="#6a0c0c"
    placeholder="Requirements"
    onChangeText={(text) => handleTypedTextScnd(text, 'requirements')}
    type="text"
    style={inputstyles.addIterms }
  />

  <TextInput 
    value={formDataScnd.additionalInfo}
    placeholderTextColor="#6a0c0c"
    placeholder="Additional Information"
    onChangeText={(text) => handleTypedTextScnd(text, 'additionalInfo')}
    type="text"
    style={inputstyles.addIterms }
  />
    {alertMsgD && <TextInput
     value={formDataScnd.alertMsg}
    placeholderTextColor="#6a0c0c"
    placeholder="Alert Message"
    onChangeText={(text) => handleTypedTextScnd(text, 'alertMsg')}
    type="text"
    style={inputstyles.addIterms }
  />}
   {fuelAvaD && <TextInput
     value={formDataScnd.fuelAvai}
    placeholderTextColor="#6a0c0c"
    placeholder="Fuel Availability"
    onChangeText={(text) => handleTypedTextScnd(text, 'fuelAvai')}
    type="text"
    style={inputstyles.addIterms }
  />}

      {returnLoad && <View>

        <TextInput 
          value={formData.returnLoad}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Load"
          onChangeText={(text) => handleTypedText(text, 'returnLoad')}
          type="text"
          style={inputstyles.addIterms }
        />
        <TextInput 
          value={formData.returnRate}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Rate"
          onChangeText={(text) => handleTypedText(text, 'returnRate')}
          style={inputstyles.addIterms }
        keyboardType="numeric"
        />
        <TextInput 
          value={formData.returnTerms}
          placeholderTextColor="#6a0c0c"
          placeholder="Return Terms"
          onChangeText={(text) => handleTypedText(text, 'returnTerms')}
          type="text"
          style={inputstyles.addIterms }
        />
      </View>}


  <View style={{flexDirection:'row' , justifyContent :'space-around',marginBottom:20}} > 
    {<TouchableOpacity onPress={toggleAlertMsgD} style={alertMsgD ? styles.bttonIsTrue : styles.buttonIsFalse} >

      <Text style={alertMsgD ? {color:'white'} : null} >Alert </Text>
    </TouchableOpacity>}

   {<TouchableOpacity onPress={toggleFuelMsgD} style={fuelAvaD ? styles.bttonIsTrue : styles.buttonIsFalse} >
      <Text style={fuelAvaD ? {color:'white'} : null} >Fuel </Text>
    </TouchableOpacity>}


   {<TouchableOpacity onPress={toggleDspRetunLoad} style={returnLoad ? styles.bttonIsTrue : styles.buttonIsFalse} >
      <Text style={returnLoad ? {color:'white'} : null} >Return Load </Text>
    </TouchableOpacity>}
          

   {<TouchableOpacity onPress={toggleRundTripAlert} style={roundTrip ? styles.bttonIsTrue : styles.buttonIsFalse} >
      <Text style={roundTrip ? {color:'white'} : null} >Round Trip</Text>
    </TouchableOpacity>}

 </View>
   </View>}
   
  {localLoads && <View style={{alignSelf:'center'}} >
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

{location !== "International"&& <Text>local load for {location} </Text>}
<View style={{flexDirection : 'row' , marginBottom: 6   , justifyContent:'space-between' , width : 200,alignSelf:'center'}}> 

  <TouchableOpacity onPress={toggleActiveLoading}>
    {!activeLoading ? <Text style={styles.buttonIsFalse}>Active Loading</Text>:
     <Text style={styles.bttonIsTrue}>Active Loading </Text> }
  </TouchableOpacity>

<TouchableOpacity onPress={toggleLocalLoads} style={{}}>
  <Text style={styles.buttonIsFalse}>Local loads </Text>
</TouchableOpacity>

</View>
  {!spinnerItem ?  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
: <Text style={{alignSelf:"center",fontStyle:'italic'}}>Load is being added Please wait</Text>  
}
 
  <View style={{height:300}} ></View>
    </ScrollView>
</View>
  );
}

export default React.memo(AddLoadContract);

const styles = StyleSheet.create({
    buttonStyle : {
        height : 40,
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
        height : 40,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderRadius: 10
    }  ,
  buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
     alignSelf:'center'

    //  marginLeft : 6
   } , 
    bttonIsTrue:{
    backgroundColor : '#6a0c0c' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' ,
     alignSelf:'center'

    }
});
