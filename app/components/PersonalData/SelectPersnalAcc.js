import React from "react";
import { View , TouchableOpacity , Text , StyleSheet} from "react-native";
import { auth } from "../config/fireBase";

function SelectPersonalAcc({navigation ,isVerified}){
    return(
        <View style={{alignItems : 'center', paddingTop : 60}} >
           <TouchableOpacity onPress={()=>navigation.navigate("personalInfomation") } style={styles.buttonPAcc}>
            <Text style={{color : 'white'}} >Personal Information </Text>
            </TouchableOpacity> 

           <TouchableOpacity onPress={()=>navigation.navigate("peronalAccLoads") } style={styles.buttonStyleIterm} >
            <Text>Manage Loads </Text>
            </TouchableOpacity> 

           <TouchableOpacity  onPress={()=>navigation.navigate('selectedUserTrucks', { userId : auth.currentUser.uid , loadIsVerified: isVerified , CompanyName : "Manage" }) } style={styles.buttonStyleIterm} >
            <Text>Manage Trucks </Text>
            </TouchableOpacity>
             
        </View>
    )
}
export default React.memo(SelectPersonalAcc)


const styles = StyleSheet.create({
    buttonStyleIterm : {
        height : 41,
        width : 200 ,
        justifyContent : 'center' , 
        alignItems : 'center' , 
        borderRadius : 25,
        borderWidth : 2,
        marginBottom : 10
        } ,
        buttonPAcc :{
         height : 41,
        width : 200 ,
        justifyContent : 'center' , 
        alignItems : 'center' , 
        backgroundColor : 'black',
        borderRadius : 25,
        marginBottom : 10
        }
});