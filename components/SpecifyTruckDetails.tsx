import React from "react";
import { TouchableOpacity, View, Modal, SafeAreaView,ScrollView } from "react-native";
import CountrySelector from "./CountrySelector";
import { ThemedText } from "./ThemedText";

import { SlctTruckCapacity } from "./SelectTruckCapacity";
import { SpecifyTruckType } from "./SelectTruckType";
import { TruckTypeProps } from "@/types/types";
import { BlurView } from 'expo-blur'
import Button from "./Button";

import { useThemeColor } from '@/hooks/useThemeColor'
import { Entypo, Ionicons } from '@expo/vector-icons'

import { hp, wp } from '@/constants/common'

import { CountrySelectorProps } from '@/types/types';


type SpecifyTruckDetailsProps = {
  dspSpecTruckDet: boolean;
  setDspSpecTruckDet: React.Dispatch<React.SetStateAction<boolean>>;
  // Selecting Truck Tonnage
  dspTruckCpacity: string;
  setDspTruckCapacity: React.Dispatch<React.SetStateAction<string>>
  truckCapacity: string;
  setTruckCapacity: React.Dispatch<React.SetStateAction<string>>;

  // Select Truck Details 
  selectedTruckType: TruckTypeProps | null;
  setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
  otherTruckType: string
  setOtherTruckType: React.Dispatch<React.SetStateAction<string>>

} & CountrySelectorProps;
export const SpecifyTruckDetails: React.FC<SpecifyTruckDetailsProps> = ({
  dspSpecTruckDet, setDspSpecTruckDet, dspTruckCpacity, setDspTruckCapacity, otherTruckType, setOtherTruckType, truckCapacity, setTruckCapacity, selectedTruckType, setSelectedTruckType, location,
  setLocation,
  intOpLoc,
  setIntOpLoc,
  setLocaOpLoc,
  locaOpLoc,
}) => {

  const bg = useThemeColor('background')
  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')




    const [truckConfig , setTruckConfig]=React.useState("")
    const [truckSuspension , setTruckSuspension]=React.useState("")





  return (
    <SafeAreaView>
      <Modal
        visible={dspSpecTruckDet}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setDspSpecTruckDet(false)}
      >
        <BlurView
          intensity={10}
          tint="systemMaterialDark"
          experimentalBlurMethod="dimezisBlurView"
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>
            <View style={{
              width: '95%',
              backgroundColor: bg, // use your themed background
              borderRadius: wp(4),
              padding: wp(4),
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: wp(4)
              }}>
                <ThemedText>Filter Trucks</ThemedText>
                <TouchableOpacity onPress={() => setDspSpecTruckDet(false)}>
                  <Ionicons name="close" size={wp(5)} color={icon} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: wp(4) }}>


                <CountrySelector
                  location={location}
                  setLocation={setLocation}
                  intOpLoc={intOpLoc}
                  setIntOpLoc={setIntOpLoc}
                  setLocaOpLoc={setLocaOpLoc}
                  locaOpLoc={locaOpLoc}
                />


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



                <SlctTruckCapacity
                  dspTruckCpacity={dspTruckCpacity}
                  setDspTruckCapacity={setDspTruckCapacity}
                  truckTonnage={truckCapacity}
                  setTruckTonnage={setTruckCapacity}
                />
                <SpecifyTruckType
                  selectedTruckType={selectedTruckType}
                  setSelectedTruckType={setSelectedTruckType}
                  otherTruckType={otherTruckType}
                  setOtherTruckType={setOtherTruckType}
                />

                {/* You can add more components here, like filters, toggles, etc. */}

                <Button
                  onPress={() => { setDspSpecTruckDet(false); }}
                  title="Apply Filter"
                  colors={{ bg: accent + '1c', text: accent }}
                />
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>

  )
}