import React from "react";

import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from "@expo/vector-icons";
function ViewEventsCode({navigation}) {
    return(
        <View style={{paddingTop:100}} >
             <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > SELECKTA BURNOUT  </Text>
       </View>


         <View>
          <Text style={{marginBottom:60 , textAlign:'center',color:'green'}} >VIP TICKET</Text>

              <View style={{ display: "flex", justifyContent: "center", alignItems: "center", color:'green'}}>
            <QRCode value="Hello panashe yaya" size={250}  />
            </View>

        </View>

        </View>
    )
}

export default React.memo(ViewEventsCode)