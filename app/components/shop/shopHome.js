import React from "react";
import { View , Text  , TouchableOpacity , StyleSheet} from "react-native";

function ShopHome({navigation}){

return(
    <View style={{alignItems :'center', paddingTop : 30}}>

 
        <TouchableOpacity onPress={()=> navigation.navigate('DspShop'  , {location:"Zimbabwe" ,specproduct: "vehicles" ,sellOBuy:"forSell" }) } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}> Zimbabwe</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop',{ location :"SouthAfrica" , specproduct :"vehicles",sellOBuy:"forSell" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}>  South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop', {location:"Namibia" , specproduct :"vehicles",sellOBuy:"forSell" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop', { location :"Tanzania" , specproduct: "vehicles",sellOBuy:"forSell" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop',{location: "Mozambique" , specproduct: "vehicles",sellOBuy:"forSell" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop', {location: "Zambia", specproduct :"vehicles",sellOBuy:"forSell" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop', {location: "Botswana" ,specproduct: "vehicles",sellOBuy:"forSell" }) } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('DspShop', {location: "Malawi" , specproduct: "vehicles",sellOBuy:"forSell" }) }style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Malawi </Text>
        </TouchableOpacity>

    </View>
)
}
export default React.memo(ShopHome)


const styles = StyleSheet.create({
    buttonStyle : {
        height : 40,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 3
    } ,
  
});
