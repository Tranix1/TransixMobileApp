import React from "react"
import {View , TouchableOpacity , Text ,StyleSheet }from "react-native"

function AddIterms({navigation,route}){
    
    const {verifiedLoad , fromLocation  , toLocation } = route.params
    
    const [truckTypeG , setTruckTypeG] =React.useState("")
    const [truckTypeDsp , setTruckTypeDsp] =React.useState(false)

    const [truckTonnageDsp , setTruckTonnageDap] =React.useState(false)


    function toggleSelecTruck(){
        setTruckTypeDsp(prev =>!prev)
    }
    
    function addTruckType(truckTypeF){
        setTruckTypeG(truckTypeF)
        setTruckTypeDsp(false)
        setTruckTonnageDap(true)
    }



    return(
        <View style={{alignItems : 'center' , paddingTop : 20}} >

          {!truckTypeDsp&& !verifiedLoad&& !truckTonnageDsp&& <View>
            <TouchableOpacity  onPress={()=> navigation.navigate('addLoadsDB') } style={styles.buttonSelectStyle} >
                <Text style={{color:"white"}}>Add Loads </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSelecTruck} style={styles.buttonSelectStyle}>
                <Text style={{color:"white"}}>Add Trucks</Text>
            </TouchableOpacity>
            </View>}

           { (truckTypeDsp ||verifiedLoad) &&<View>
                <TouchableOpacity   style={styles.buttonStyle} onPress={()=>addTruckType("BulkTrailers")} >

                    <Text style={{color:"#6a0c0c"}}>BulkTrailers </Text>
                </TouchableOpacity>

                <TouchableOpacity  onPress={()=>addTruckType("flatDecks")}  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}>flatDecks </Text>
                </TouchableOpacity>
                <TouchableOpacity  onPress={()=>addTruckType("sideTippers")}  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}>SideTippers </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>addTruckType("LowBeds")} style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}> Lowbeds </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>addTruckType("tauntliner")}  style={styles.buttonStyle}>
                    <Text style={{color:"#6a0c0c"}}> Tautliners </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>addTruckType("tanker")}  style={styles.buttonStyle} >
                    <Text style={{color:"#6a0c0c"}}>Tankers </Text>
                </TouchableOpacity>
               <TouchableOpacity onPress={()=>addTruckType("Rigid")}  style={styles.buttonStyle} >
                    <Text style={{color:"#6a0c0c"}}>Rigids </Text>
                </TouchableOpacity>

               <TouchableOpacity onPress={()=>addTruckType("other")}   style={styles.buttonStyle} >
                    <Text style={{color:"#6a0c0c"}}>Other</Text>
                </TouchableOpacity>

            </View>}

              {truckTonnageDsp && <View>
                <Text style={{alignSelf:'center', fontSize:18 , fontWeight:'bold'}} >Truck Tonnage</Text>
                <TouchableOpacity style={styles.buttonStyle}  onPress={()=> navigation.navigate('addTrucksDB', {truckType:truckTypeG,verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation ,truckTonnageG:"1-3 T" }) } >
                    <Text>1-3 T</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonStyle}  onPress={()=> navigation.navigate('addTrucksDB', {truckType:truckTypeG,verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation ,truckTonnageG:"4 - 7 T" }) }>
                    <Text>4 - 7 T</Text>
                </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonStyle}  onPress={()=> navigation.navigate('addTrucksDB', {truckType:truckTypeG,verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation ,truckTonnageG:"8 - 14 T" }) }>
                        <Text>8 - 14 T</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonStyle}  onPress={()=> navigation.navigate('addTrucksDB', {truckType:truckTypeG,verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation ,truckTonnageG:"15 - 25 T" }) } >
                        <Text>15 - 25 T</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonStyle}  onPress={()=> navigation.navigate('addTrucksDB', {truckType:truckTypeG,verifiedLoad:verifiedLoad , fromLocation :fromLocation , toLocation : toLocation ,truckTonnageG:"26 T +++" }) }>
                        <Text>26 T +++ </Text>
                    </TouchableOpacity>
                   


                </View> }



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
