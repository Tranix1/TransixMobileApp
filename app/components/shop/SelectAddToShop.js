import React from "react"
import {View , TouchableOpacity , Text ,StyleSheet }from "react-native"

function SelectAddToShop({navigation, route }){
    const {location}= route.params
   const [sellOBuy , setSellOBuy] =React.useState(null)

    function toggleSellOBuy(value){
        setSellOBuy(value)
    }


    return(
        <View style={{alignItems : 'center' , paddingTop : 10}} >
              {sellOBuy === "toBuy"  || sellOBuy === "forSell" ? <View>

             {sellOBuy ==="toBuy" ? <Text>What are you Looking For ? </Text>
              :<Text>What are you selling ? </Text>
               }  

             <TouchableOpacity onPress={()=>navigation.navigate(`AddToShop`, { location :location,specproduct :"vehicles", specproduct : "vehicles" , sellOBuy : sellOBuy,})} style={styles.buttonSelectStyle}>
                <Text style={{color:"white"}}>Add Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonSelectStyle} onPress={()=>navigation.navigate(`AddToShop`, { location: location, specproduct:"trailers" , sellOBuy : sellOBuy,})} >
                <Text style={{color:"white"}}>Add Trailers </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonSelectStyle} onPress={()=>navigation.navigate(`AddToShop`, { location: location , specproduct: "spares", sellOBuy : sellOBuy,})}>
                <Text style={{color:"white"}}>Add Spares </Text>
            </TouchableOpacity>
            </View>

            :null}

              { sellOBuy !== "toBuy" && sellOBuy !== "forSell" ? <View>
                <TouchableOpacity onPress={()=>toggleSellOBuy("forSell")} style={styles.buttonSelectStyle} >
                    <Text style={{color:'white'}} >Click to sell</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>toggleSellOBuy("toBuy")} style={styles.buttonSelectStyle} >
                    <Text style={{color:'white'}}>Click to Buy</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>navigation.navigate(`AddToShop`, { location: location , specproduct: "Sprovider", sellOBuy : null,})} style={styles.buttonSelectStyle} >
                    <Text style={{color:'white'}}>Service Provider</Text>
                </TouchableOpacity>
            </View>:null}
            
        </View>
    )
}
export default React.memo(SelectAddToShop)


const styles = StyleSheet.create({
    buttonStyle : {
        height : 40,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10
    } ,
    buttonSelectStyle :{
        backgroundColor :"#6a0c0c",
        height : 40,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderRadius: 10

    }
});

