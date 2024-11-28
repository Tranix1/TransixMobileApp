import React from "react";
import { View , Text , TouchableOpacity , StyleSheet} from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

function SelectOneTruckType({navigation}){
    return(
        <View style={{alignItems : 'center' , paddingTop : 20}} >


            <View  style={{flexDirection : 'row'}}>
            <TouchableOpacity onPress={()=> navigation.navigate('dspOneTrckType', {truckType:'BulkTrailers'})  } style={styles.selectTruck}>

                <Text>BulkTrailer</Text>
                <FontAwesome5 name="truck" size={28} color="black" />
                </TouchableOpacity>


                <TouchableOpacity onPress={()=> navigation.navigate('dspOneTrckType', {truckType:'LowBeds'}) } style={styles.selectTruck}>
                    <Text>LowBed</Text>
                <FontAwesome5 name="truck" size={28} color="black" />
                </TouchableOpacity>

            </View>
            <View  style={{flexDirection : 'row'}}>
                <TouchableOpacity onPress={()=> navigation.navigate( 'dspOneTrckType', {truckType:'sideTippers'}) } style={styles.selectTruck}>
                <Text>Side Tipper</Text>
                <FontAwesome5 name="truck" size={28} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={()=> navigation.navigate('dspOneTrckType', {truckType:'tauntliner'}) }style={styles.selectTruck} >
                <Text> Tautliner </Text>
                <FontAwesome5 name="truck" size={28} color="black" />
                </TouchableOpacity>
            </View>

            <View style={{flexDirection : 'row'}} >

                <TouchableOpacity onPress={()=> navigation.navigate('dspOneTrckType', {truckType:'tanker'}) } style={styles.selectTruck}>
                <Text>Tanker</Text>
                <FontAwesome5 name="truck" size={28} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> navigation.navigate('dspOneTrckType', {truckType:'Rigid'}) } style={styles.selectTruck}>
                <Text>Rigid</Text>
                <FontAwesome5 name="truck" size={28} color="black" />
                </TouchableOpacity>
            </View>

        </View>
    )
}
export default SelectOneTruckType


const styles = StyleSheet.create({
    selectTruck : {
        justifyContent : 'center' , 
        alignItems : 'center' ,
        height : 60 ,
        width : 135 , 
        borderWidth : 1 , 
        borderColor : 'black',
        padding : 5 ,
        margin : 10
        
    }
});