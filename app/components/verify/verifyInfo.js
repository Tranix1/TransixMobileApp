import React from "react";
import {View , TouchableOpacity , Text , Linking} from "react-native"

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
function VerifyInfo(){
    return(
        <View style={{paddingTop : 11 , alignItems :'center'}} >
        
            <Text style={{lineHeight:21.5 , color:'#9c2828' , fontWeight:'bold',fontSize:21}} >At Transix, verification occurs across multiple stages. </Text>


            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`
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
`)} `)} style={{  marginBottom : 10,  padding :7 ,borderWidth : 2 , borderColor:'black', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5}} >

                <Text  style={{lineHeight:21.5 , color:'#32CD32' , fontWeight:'bold',fontSize:19 , marginBottom: 8  }} > Get first stage verification Now  </Text>

      {  <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
         <MaterialIcons name="verified" size={26} color="green" />
      </View>}

                <Text style={{lineHeight:21.5 ,fontWeight:'bold',fontSize:14.5 , marginBottom: 8 }} >Unlock Growth with Heart: Provide your location, company details, and join us with a 
                <Text style={{color:'green'}} > $5 monthly subscription.</Text> Let's journey together towards success. </Text>

                <Text style={{lineHeight:21.5 ,fontWeight:'bold', fontSize:14.5 , marginBottom: 8 }} > If the $5 subscription isn't for you, 
                <Text style={{color:'green'}} > refer three businesses  </Text> for verification and watch your company thrive alongside them for two free months</Text>

                <Text style={{lineHeight:21.5 ,fontWeight:'bold',marginTop:6}} > Benefits: "Safeguard communities by reducing unauthorized firms, boost job opportunities, and ensure swift emergency response with clear firm identification."</Text>
            </TouchableOpacity>
  <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`
I am determined to achieve second-level verification for my insurance GIT on Transix Now!
To make this happen without any delays or uncertainties.

- You must be Verified at First level

The Future Of Transport And Logistics (Transix)
`)} `)} style={{  marginBottom : 10,  padding :7 ,borderWidth : 2 , borderColor:'black', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5}} >

    <Text style={{lineHeight:21.5 , color:'#0074D9' , fontWeight:'bold',fontSize:19 , marginBottom: 8  }} >Get Second Stage Verification Now</Text>
    <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
        <FontAwesome6 name="shield" size={24} color="#0074D9" />
    </View>

    <Text style={{lineHeight:21.5 , color:'#6495ED' , fontWeight:'470',fontSize:19 , marginBottom: 8,fontStyle:'italic'  }}>Secure your business with us</Text>
    <Text style={{lineHeight:21.5 ,fontWeight:'bold',fontSize:14.5 , marginBottom: 8 }}>- Get Goods in Transit (GIT) Coverage Now ,Mitigate risks and protect your assets</Text>

    <Text style={{lineHeight:21.5 ,fontWeight:'bold',marginTop:6 }}>- Ensure Trust: Certain loads require Goods in Transit (GIT) insurance for transportation</Text>
    <Text style={{lineHeight:21.5 ,fontWeight:'bold',marginTop:6}}>- Safeguard your business against unforeseen events Join us for reliable transportation services!</Text>

    <Text style={{color:'#2196F3',fontWeight:'bold'}}>Take the Next Step Towards Secure and Reliable Transportation!</Text>

</TouchableOpacity>

        </View>
    )
}
export default React.memo(VerifyInfo)