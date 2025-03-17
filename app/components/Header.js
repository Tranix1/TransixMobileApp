import React from "react";

//Check if user is online or offline 
import NetInfo from '@react-native-community/netinfo';

import { View , Text , TouchableOpacity , } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import SmallMenu from "./SmallMenu";
import { auth } from "./config/fireBase";
import {doc , onSnapshot} from "firebase/firestore"
import { db } from "./config/fireBase";

 function Header ({navigation,checkAuth,smallMenu,dspMenu}){
  


    return(
        <View>
          

             {smallMenu && <SmallMenu  navigation = {navigation} toggleSmallMenu={checkAuth}  /> }

             <View style={{flexDirection : 'row' , height : 54 ,justifyContent : 'space-between' ,  paddingLeft : 15 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , }} >
                <Text style={{color : 'white' , fontSize : 19 , zIndex : 50,}} >Transix</Text>
                <View style={{flexDirection: 'row'}} > 
                    <TouchableOpacity onPress={()=> navigation.navigate('searchElement') } style={{ marginRight : 10 }} >
                          <FontAwesome name="search" size={24} color="white" />
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={{marginLeft : 6}} onPress={currentUser? toggleSmallMenu :()=> navigation.navigate('createUser')  } > */}
                    {dspMenu&&<TouchableOpacity style={{marginLeft : 6}} onPress={checkAuth} >
                    <Ionicons name="ellipsis-vertical" size={24} color="white" />
                    </TouchableOpacity>}
                </View>

             </View>
             <View></View>

        </View>
    )
}
export default React.memo(Header)