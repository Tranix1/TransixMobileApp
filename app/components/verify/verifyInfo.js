import React from "react";
import {View , TouchableOpacity , Text , Linking} from "react-native"

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

- Verify Address using Utility Bill (electricity, water, internet, gas), Lease Agreement, Business Licence, Tax Document.
- The document for Address must be from 3-6 months ago and also if you are the owner of the company or part of the team mentioned on docs, your private equity can be used for the address or the document address must have your company name on it.

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

        </View>
    )
}
export default React.memo(VerifyInfo)