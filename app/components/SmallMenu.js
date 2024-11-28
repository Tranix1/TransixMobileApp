import React from "react";
import {View , TouchableOpacity , Text , StyleSheet} from "react-native"
import {query ,collection , where,onSnapshot, updateDoc } from "firebase/firestore"
import  { auth , db,  } from "../components/config/fireBase"

function SmallMenu({navigation , toggleSmallMenu}){

  const [ newItermBooked, setNewBkedIterm] = React.useState(0);
  const [ newItermBidded , setNewBiddedIterm] = React.useState(0);

  // const [ valueOfUpdates , setVlueOfUpdates] = React.useState(null);

      React.useEffect(() => {
        try {
          if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const loadsQuery = query(collection(db, "newIterms"), where("receriverId", "==", userId));

            const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newBokedIterms = data.bookingdocs || 0;   // Assuming isVerified is a boolean field
                const newBiiedIterms = data.biddingdocs || 0;   // Assuming isVerified is a boolean field

                setNewBkedIterm(newBokedIterms);
                setNewBiddedIterm(newBiiedIterms)
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
          }


        } catch (error) {
          console.error(error);
        }
      }, []);

return(
<TouchableOpacity onPress={toggleSmallMenu} style={{position : 'absolute' , right : 0 ,top: 0, height : 10000 , left : 0 ,zIndex : 400 }}  >
        <View style={{position : 'absolute' , right : 0  , borderBlockColor:"#6a0c0c",borderWidth:3 , backgroundColor :'white'  , width : 235 , borderRadius: 13}} >
    <TouchableOpacity  onPress={()=> navigation.navigate('selectPeronalAcc') } style={styles.buttonStyle}>
        <Text>Personal Acc</Text>
    </TouchableOpacity>

    <TouchableOpacity   onPress={()=> navigation.navigate('SlctBookingsAndBiddings') }  style={styles.buttonStyle}>
        <Text>B & B   </Text>
          <View style={{flexDirection:'row'}} > 
        { <Text style={{backgroundColor :'#6a0c0c' , color:'white' , paddingLeft :5, paddingRight:5, marginRight :6 , borderRadius :10 , justifyContent:'center' }} >{newItermBooked} </Text>}
        {  <Text style={{backgroundColor :'rgb(129,201,149)', color:'white' , paddingLeft :5, paddingRight:5, marginRight :6 , borderRadius :10 , justifyContent:'center'  }} > {newItermBidded} </Text> }
         </View>
    </TouchableOpacity>

   


       <TouchableOpacity   onPress={ ()=> navigation.navigate('verifyInfo') }  style={styles.buttonStyle}>
        <Text>Verification</Text>
        </TouchableOpacity>

    <TouchableOpacity   onPress={()=> navigation.navigate('mobileAppSD') }  style={styles.buttonStyle}>
        <Text>Mobile App </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.buttonStyle} onPress={()=> navigation.navigate('updates') }  >
        <Text>Updates</Text>
        {/* <Text>{valueOfUpdates} </Text> */}
    </TouchableOpacity>

    <TouchableOpacity   onPress={()=> navigation.navigate('helpHome') }  style={styles.buttonStyle}>
        <Text> Help </Text>
    </TouchableOpacity>

    </View>
</TouchableOpacity>
)
}
export default React.memo(SmallMenu)

const styles = StyleSheet.create({
    buttonStyle : {
        height : 47,
        justifyContent : 'center' , 
        alignItems : 'center',
    }
});