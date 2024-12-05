import React from "react"
import {View , TouchableOpacity , Text ,StyleSheet }from "react-native"

function AddIterms({navigation,route}){
    const [truckType , setTruckType] =React.useState(false)

    const {verifiedLoad , fromLocation  , toLocation } = route.params

    

    function toggleSelecTruck(){
        setTruckType(prev =>!prev)
    }
    return(
        <View style={{alignItems : 'center' , paddingTop : 20}} >

          {!truckType&& !verifiedLoad&& <View>
            <TouchableOpacity  onPress={()=> navigation.navigate('addLoadsDB') } style={styles.buttonSelectStyle} >
                <Text style={{color:"white"}}>Add Loads </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSelecTruck} style={styles.buttonSelectStyle}>
                <Text style={{color:"white"}}>Add Trucks</Text>
            </TouchableOpacity>
            </View>}

           { (truckType ||verifiedLoad) &&<View>
                <TouchableOpacity  onPress={()=> navigation.navigate('addTrucksDB', {truckType:'BulkTrailers',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) }  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}>BulkTrailers </Text>
                </TouchableOpacity>

                <TouchableOpacity  onPress={()=> navigation.navigate('addTrucksDB', {truckType:'flatDecks',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) }  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}>flatDecks </Text>
                </TouchableOpacity>
                <TouchableOpacity  onPress={()=> navigation.navigate( 'addTrucksDB', {truckType:'sideTippers',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) }  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}>SideTippers </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=> navigation.navigate('addTrucksDB', {truckType:'LowBeds',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) }  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}> Lowbeds </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=> navigation.navigate('addTrucksDB', {truckType:'tauntliner',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) } style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}> Tautliners </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=> navigation.navigate('addTrucksDB', {truckType:'tanker',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) } style={styles.buttonStyle} >
                    <Text style={{color:"#6a0c0c"}}>Tankers </Text>
                </TouchableOpacity>
               <TouchableOpacity onPress={()=> navigation.navigate('addTrucksDB', {truckType:'Rigid',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) }  style={styles.buttonStyle} >
                    <Text style={{color:"#6a0c0c"}}>Rigids </Text>
                </TouchableOpacity>

               <TouchableOpacity onPress={()=> navigation.navigate('addTrucksDB', {truckType:'other',verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation }) }  style={styles.buttonStyle} >
                    <Text style={{color:"#6a0c0c"}}>Other</Text>
                </TouchableOpacity>

            </View>}
        </View>
    )
}
export default React.memo(AddIterms)


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
