import { ThemedText } from "@/components/ThemedText"
import {GoogleMaps} from "expo-maps"
import { Platform ,View,Text} from "react-native"

export default function Map() { 
const cameraPosition ={
    coordinates:{
    latitude: -17.824858,
    longitude: 31.053028
},
zoom : 10
}
    // if(Platform.OS === "android") {
    //     return (
    //         <GoogleMaps.View style={{flex:1}} cameraPosition={cameraPosition}/>
    //     )}else{
    //         return<ThemedText>Map not available</ThemedText>
    //     }
        return(
            <View style={{flex:1}}>

                <Text>Hiiii</Text>
            <GoogleMaps.View style={{flex:1}} cameraPosition={cameraPosition}/>

            </View>
        )
}