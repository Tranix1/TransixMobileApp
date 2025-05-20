import React from "react";
import { View,ScrollView , TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";

function ConfigAdnSuspension(){

    const [truckConfig , setTruckConfig]=React.useState("")
    const [truckSuspension , setTruckSuspension]=React.useState("")
    return(
        <View>
              <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                    Truck Config
                                </ThemedText>                                

                                <ScrollView horizontal >


                                    <TouchableOpacity onPress={()=>setTruckConfig("single Axle ") } style={
                                       truckConfig==="single Axle "?{backgroundColor:"green",margin:6}:{backgroundColor:"red",margin:6}} >
                                    <ThemedText>single Axle </ThemedText>                                    
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity onPress={()=>setTruckConfig("tandem") } style={                                       truckConfig==="tandem"?{backgroundColor:"green",margin:6}:{backgroundColor:"red",margin:6}} >
                                    <ThemedText>tandem</ThemedText>                                    
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity onPress={()=>setTruckConfig("triaxle") } style={                                       truckConfig==="triaxle"?{backgroundColor:"green",margin:6}:{backgroundColor:"red",margin:6}} >
                                    <ThemedText>triaxle</ThemedText>                                    
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity onPress={()=>setTruckConfig("MultiAxle") } style={                                       truckConfig==="MultiAxle"?{backgroundColor:"green",margin:6}:{backgroundColor:'red',margin:6}} >
                                    <ThemedText>MultiAxle</ThemedText>                                                                            
                                    </TouchableOpacity>
                                    
                                </ScrollView>

                                 <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >
                                    Truck Suspension
                                </ThemedText>                                

                                     <ScrollView horizontal >
                                    <TouchableOpacity style={ 
                                        truckSuspension==="Link"?{backgroundColor:"green",margin:6}:{backgroundColor:'red',margin:6}} onPress={()=>setTruckSuspension("Link") } >
                                    <ThemedText>Link</ThemedText>                                    

                                    </TouchableOpacity>

                                    <TouchableOpacity style={
                                        truckSuspension==="Super Link"?{backgroundColor:"green",margin:6}:{backgroundColor:'red',margin:6}} onPress={()=>setTruckSuspension("Super Link") } >
                                    <ThemedText>Super Link</ThemedText>                                    
                                    </TouchableOpacity>

                                    <TouchableOpacity style={
                                        truckSuspension==="Air suspension"?{backgroundColor:"green",margin:6}:{backgroundColor:'red',margin:6}} onPress={()=>setTruckSuspension("Air suspension") } >
                                    <ThemedText>Air suspen</ThemedText>                                    
                                    </TouchableOpacity>

                                    <TouchableOpacity style={ 
                                        truckSuspension==="mechanical steel"?{backgroundColor:"green",margin:6}:{backgroundColor:'red',margin:6}} onPress={()=>setTruckSuspension("mechanical steel") } >
                                        
                                    <ThemedText>mechanical steel</ThemedText>                                    
                                    </TouchableOpacity>
                                    <TouchableOpacity style={
                                        truckSuspension==="Other"?{backgroundColor:"green",margin:6}:{backgroundColor:'red',margin:6}} onPress={()=>setTruckSuspension("Other") } >
                                    <ThemedText>Other</ThemedText>                                    
                                    </TouchableOpacity>
                                </ScrollView>
        </View>
    )
}
export default ConfigAdnSuspension