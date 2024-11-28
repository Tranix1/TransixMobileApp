import React from "react";
import { db, auth } from "../config/fireBase";
import { collection, doc, addDoc, serverTimestamp ,} from 'firebase/firestore';

import { View , TextInput , Text, Alert ,TouchableOpacity , ActivityIndicator, StyleSheet,Linking, ScrollView} from "react-native";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import inputstyles from "../styles/inputElement";

function AddLoadDB ({route}) {


const {username ,contact , isVerified,isBlackListed ,blackLWarning ,blockVerifiedU,expoPushToken,verifyOngoing } = route.params
const [error , setError]= React.useState("")

  const loadsCollection = collection(db, "Loads");
  const [formData, setFormData] = React.useState({
    typeofLoad: "",
    fromLocation: "",
    toLocation: "",
    ratePerTonne: null,
    paymentTerms: "",
    requirements: "",
    alertMsg:"",
    fuelAvai :"",
    additionalInfo: "",
    links :null ,
    triaxle :null
  });

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

  const  handleTypedText  = (value, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
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

      if(alertMsgD && !formData.alertMsg ){
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
      const docRef = await addDoc(loadsCollection, {
        userId: userId, // Add the user ID to the document
        companyName: username,
        contact: contact,
        expoPushToken :expoPushToken ,
        deletionTime :Date.now() + 3 * 24 * 60 * 60 * 1000 ,
        timeStamp : serverTimestamp() ,
        isVerified : isVerified ,
        currency : currency ,
        perTonne : perTonne , 
        activeLoading : activeLoading ,
        location : location ,
        ...formData 
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
      setSpinnerItem(false)
      setPerTonne(false)
      setActiveLoading(false)
    } catch (err) {
      setSpinnerItem(false)
      setError(err.toString());
      }
  };

  return (
    <View   style={{alignItems :'center', }}>
        {verifyOngoing && !isVerified&&<TouchableOpacity  onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`
I aspire to become verified at the first level on Transix Now!
To make this happen without any delays or uncertainties.

Provide:
- Company Address
- Company Details (e.g., Articles of Association, tax clearance, etc.)
- National ID or Passport must match details in company details

- Verify Address using Utility Bill (electricity, water, internet, gas), Lease Agreement, Business Licence, Tax Document.
- The document for Address must be from 3-6 months ago and also if you are the owner of the company or part of the team mentioned on docs, your private equity can be used for the address or the document address must have your company name on it.

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

  <TextInput
    value={formData.typeofLoad}
    placeholderTextColor="#6a0c0c"
    placeholder="Type of Load"
    onChangeText={(text) => handleTypedText(text, 'typeofLoad')}
    type="text"
    style={inputstyles.addIterms }
  />

  <TextInput 
    value={formData.fromLocation}
    placeholderTextColor="#6a0c0c"
    placeholder="From Loacation"
    onChangeText={(text) => handleTypedText(text, 'fromLocation')}
    type="text"
    style={inputstyles.addIterms }
  />

  <TextInput
    value={formData.toLocation}
    placeholderTextColor="#6a0c0c"
    placeholder="To location"
    onChangeText={(text) => handleTypedText(text, 'toLocation')}
    type="text"
    style={inputstyles.addIterms }
  />







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
    value={formData.paymentTerms}
    placeholderTextColor="#6a0c0c"
    placeholder="Payment Terms"
    onChangeText={(text) => handleTypedText(text, 'paymentTerms')}
    type="text"
    style={inputstyles.addIterms }
  />
  <TextInput
     value={formData.requirements}
    placeholderTextColor="#6a0c0c"
    placeholder="Requirements"
    onChangeText={(text) => handleTypedText(text, 'requirements')}
    type="text"
    style={inputstyles.addIterms }
  />

  <TextInput 
    value={formData.additionalInfo}
    placeholderTextColor="#6a0c0c"
    placeholder="Additional Information"
    onChangeText={(text) => handleTypedText(text, 'additionalInfo')}
    type="text"
    style={inputstyles.addIterms }
  />
    {alertMsgD && <TextInput
     value={formData.alertMsg}
    placeholderTextColor="#6a0c0c"
    placeholder="Alert Message"
    onChangeText={(text) => handleTypedText(text, 'alertMsg')}
    type="text"
    style={inputstyles.addIterms }
  />}
   {fuelAvaD && <TextInput
     value={formData.fuelAvai}
    placeholderTextColor="#6a0c0c"
    placeholder="Fuel Availability"
    onChangeText={(text) => handleTypedText(text, 'fuelAvai')}
    type="text"
    style={inputstyles.addIterms }
  />}



  <View style={{flexDirection:'row' , justifyContent :'space-around',marginBottom:20}} > 
    {<TouchableOpacity onPress={toggleAlertMsgD} style={alertMsgD ? styles.bttonIsTrue : styles.buttonIsFalse} >

      <Text style={alertMsgD ? {color:'white'} : null} >Alert </Text>
    </TouchableOpacity>}

   {<TouchableOpacity onPress={toggleFuelMsgD} style={fuelAvaD ? styles.bttonIsTrue : styles.buttonIsFalse} >
      <Text style={fuelAvaD ? {color:'white'} : null} >Fuel </Text>
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
  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
  <View style={{}} ></View>
    </ScrollView>
</View>
  );
}

export default React.memo(AddLoadDB);

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
