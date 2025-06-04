
import React from "react";
import {View , TouchableOpacity , Text , StyleSheet , Linking , Share} from "react-native"
import {doc  ,query ,collection , onSnapshot} from "firebase/firestore"
import { db } from "./config/fireBase";

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


      const [downloadPlayStore , setDownloadOnPlaystore]=React.useState(false)
      const [downloadApkLink , setDownloadApkLink]=React.useState(false)
      
          React.useEffect(() => {
        try {
            const loadsQuery = query(collection(db, "updateEveryone"));
            const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();


                const newAppUpdateApkLink = data.newAppUpdateApkLink
                const newAppUpdatePlystore = data.switchToPlayStoreLink

                    
                    if(newAppUpdateApkLink){

                      setDownloadApkLink(newAppUpdateApkLink)
                    }else if(newAppUpdatePlystore){
                         setDownloadOnPlaystore(newAppUpdatePlystore)
                    }

                  
                                        
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
        } catch (error) {
          console.error(error);
        }
      }, []);


    return(
        <View style={{paddingTop: 15}} >
            

              <TouchableOpacity style={{marginLeft : 20 , height : 45 ,  justifyContent : 'center'}} onPress={()=>Linking.openURL(`${downloadApkLink ? downloadApkLink : downloadPlayStore }`)} >
                <Text>Download Android App </Text>
                {
                  downloadApkLink ?<Text style={{fontSize:12 , color:"gray"}} > Not yet on playStore its still apk but working perferctly </Text>:
                  
                <Text style={{fontSize:12 , color:"gray"}} >On playStore working perferctly </Text>
                }
            </TouchableOpacity>

            <TouchableOpacity style={{marginLeft : 20 , height : 45 , justifyContent : 'center'}} onPress={handleShareLink} >
                <Text>Invite a friend </Text>
            </TouchableOpacity>

        </View>
    )
}
export default React.memo(MobileAppSD)