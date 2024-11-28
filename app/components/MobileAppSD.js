
import React from "react";
import {View , TouchableOpacity , Text , StyleSheet , Linking , Share} from "react-native"

function MobileAppSD(){

     const handleShareLink = async () => {
    try {
      const url = `https://www.truckerz.net/`; // Replace this with the URL you want to share
      const message = `Increase your logistics efficiency with Truckerz! Join me by clicking this link to access a wide range of services tailored to your needs. : Website ${url}`;

      const result = await Share.share({
        message: message,
      });

      if (result) {
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Shared with activity type of result.activityType
          } else {
            // Shared
          }
        } else if (result.action === Share.dismissedAction) {
          // Dismissed
        }
      } else {
        // Handle the case where result is undefined or null
      }
    } catch (error) {
      alert(error.message);
    }
  };
    return(
        <View style={{paddingTop: 15}} >
            

            <TouchableOpacity style={{marginLeft : 20 , height : 45 ,  justifyContent : 'center'}} onPress={() => Linking.openURL(`tel:0787884434`)} >
                <Text>Update App </Text>
                <Text style={{fontSize:12 , color:"gray"}} >Now yet on playStore its still apk but working perferctly </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginLeft : 20 , height : 45 , justifyContent : 'center'}} onPress={handleShareLink} >
                <Text>Invite a friend </Text>
            </TouchableOpacity>

        </View>
    )
}
export default React.memo(MobileAppSD)