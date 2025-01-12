import React from "react"; 
import { View , Text ,  TouchableOpacity , Linking,Image} from 'react-native';

import defaultImage from '../images/TRANSIX.jpg'

// import { Facebook, WhatsApp, Email ,LinkedIn } from '@mui/icons-material';

import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
function HelpHome(){
    const [dspHelpcenter , setHelpCntre] = React.useState(false)
    function toggleHC(){
        setHelpCntre(prev => !prev)
        setSoftInfo(false)
    }

    const [softInfo , setSoftInfo] = React.useState(false)
    function toggleSI(){
        setSoftInfo(prev => !prev)
        setHelpCntre(false)
    }
    return(
    <View style={{paddingTop: 10}} >

        <View>
        {!softInfo && <TouchableOpacity onPress={toggleHC} style={{marginLeft : 20 , height : 40 ,  justifyContent : 'center'}}>
            <Text>Help centre </Text>
            <Text style={{fontSize:12 , color:"gray"}} >Get help , contact us </Text>
        </TouchableOpacity>}

       { !dspHelpcenter && <TouchableOpacity onPress={toggleSI} style={{marginLeft : 20 , height : 40 ,  justifyContent : 'center'}} >
            <Text>Software info </Text>
        </TouchableOpacity>}
         </View>

        {dspHelpcenter && <View style={{alignItems:'center',}} >
            <View style={{width : 390 , backgroundColor:'#D3D3D3', marginBottom:10 , padding:10 , }} >
            <Text style={{lineHeight:21.5 , fontWeight:'bold',fontSize:15,color:'#6a0c0c'}} > Your gateway to the future of logistics is here! Our innovative software solutions are tailor-made to fulfill your every need.</Text>
            <Text style={{lineHeight:21.5 , fontWeight:'bold',fontSize:15,color:'#6a0c0c'}} >From finding loads to securing trucks, selling products to discovering work opportunities in your area, our cutting-edge technologies are designed to streamline and enhance your logistics experience</Text>
             </View>

            <View style={{width : 390 , backgroundColor:'#D3D3D3', marginBottom:10 , padding:10 , }}>
            <Text style={{lineHeight:21.5,fontWeight:'bold',fontSize:15 ,color:'green'}}>We believe in a seamless tomorrow, where efficiency and convenience meet your demands. Contact us today to embark on a journey towards a smarter logistics world</Text>
            <Text style={{lineHeight:21.5 ,fontWeight:'bold',fontSize:15,color:'green'}} >We're here to transform the way you navigate the industry. Reach out now and let's revolutionize logistics together!</Text>
            </View>
            
                <Text>
                    For immediate help, please contact us via our social platforms. 
                    </Text> 

                    <View style={{flexDirection:'row' , justifyContent:"space-evenly", alignItems:'center'}} >
                    <TouchableOpacity onPress={()=>Linking.openURL('mailto:truckerz2023@gmail.com')} >
                     <Text style={{color :'#0000FF'}} >
                        email  
                     <Fontisto name="email" size={24} color="#0000FF" />

                        </Text> 
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160`)} >
                       <Text style={{color:"#25D366"}} >WhatsApp 
                       <FontAwesome name="whatsapp" size={24} color="#25D366" />
                         </Text> 
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>Linking.openURL('https://www.facebook.com/TruckerzWeb/') } >
                   <Text style={{color:"#1877F2"}} > facebook
                    <AntDesign name="facebook-square" size={24} color="#1877F2" />
                        </Text> 
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>Linking.openURL('https://www.linkedin.com/in/truckerz-undefined-1277172a7/') } >
                      <Text style={{color:'#0A66C2'}}> linkedIn 
                      <AntDesign name="linkedin-square" size={24} color="#0A66C2" />
                       </Text>

                    </TouchableOpacity>

                    </View>
               <Text>
                We are here to assist you promptly! 
                </Text>                  
                  
            
        </View> }

        {softInfo && <View  style={{alignItems : 'center'}}>

            <Text style={{fontWeight :'bold', fontSize:17}} > Transix </Text>
            <Text> We the future for transport and logistics </Text>

           <Image source={defaultImage} style={{ height : 97 , borderRadius : 10 , width: 160, margin :6}} />
            <Text style={{fontStyle:'italic'}} > From 2023 - 2025 </Text>
            <Text style={{fontStyle:'italic'}} > Parent company © ARMAMENT VENTURES </Text>
        </View> }

    </View> )
}
export default React.memo(HelpHome)
