import React from "react";
import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image } from "react-native";

import QRCode from 'react-native-qrcode-svg';
function Events(params) {
 return(
    <View>
        
  <QRCode value="Your data here" />
    </View>
 )   
}
export default React.memo(Events)