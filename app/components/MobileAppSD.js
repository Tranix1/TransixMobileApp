
import React from "react";
import {View , TouchableOpacity , Text , StyleSheet , Linking , Share} from "react-native"

function MobileAppSD(){

     const handleShareLink = async () => {
   
              try {
                const message = `I invite you to Transix!

Transix is a tech-driven business enhancing transportation and logistics services, connecting suppliers with demand for truckloads, vehicles, trailers, and spare parts etc.

Contact us at +263716325160 with the message "Application" to swiftly receive the application download link.

Explore Application at : https://play.google.com/store/apps/details?id=com.yayapana.Transix
Explore website at : https://transix.net/

Experience the future of transportation and logistics!`;

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
            

            <TouchableOpacity style={{marginLeft : 20 , height : 45 ,  justifyContent : 'center'}} onPress={() => Linking.openURL(()=>Linking.openURL("https://play.google.com/store/apps/details?id=com.yayapana.Transix"))} >
                <Text>Update App </Text>
                <Text style={{fontSize:12 , color:"gray"}} >On playStore working perferctly </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginLeft : 20 , height : 45 , justifyContent : 'center'}} onPress={handleShareLink} >
                <Text>Invite a friend </Text>
            </TouchableOpacity>

        </View>
    )
}
export default React.memo(MobileAppSD)