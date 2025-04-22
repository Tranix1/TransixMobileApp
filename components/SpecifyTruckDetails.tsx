import React from "react";
import { TouchableOpacity, View, Modal, SafeAreaView, } from "react-native";
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


type SpecifyTruckDetailsProps  = {
    dspSpecTruckDet: boolean;
    setDspSpecTruckDet: React.Dispatch<React.SetStateAction<boolean>>;
    // Selecting Truck Tonnage
    dspTruckCpacity: string;
    setDspTruckCapacity: React.Dispatch<React.SetStateAction<string>>
    truckCapacity: string;
    setTruckCapacity: React.Dispatch<React.SetStateAction<string>>;

    // Select Truck Details 
    selectedTruckType: TruckTypeProps | null;
    setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps| null>>;


}& CountrySelectorProps;
export const SpecifyTruckDetails: React.FC<SpecifyTruckDetailsProps> = ({
    dspSpecTruckDet, setDspSpecTruckDet, dspTruckCpacity, setDspTruckCapacity, truckCapacity, setTruckCapacity, selectedTruckType, setSelectedTruckType ,  location,
  setLocation,
  intOpLoc,
  setIntOpLoc,
  setLocaOpLoc,
  locaOpLoc ,
}) => {

    const bg = useThemeColor('background')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    return(
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

            <SlctTruckCapacity
              dspTruckCpacity={dspTruckCpacity}
              setDspTruckCapacity={setDspTruckCapacity}
              truckTonnage={truckCapacity}
              setTruckTonnage={setTruckCapacity}
            />
            <SpecifyTruckType
              selectedTruckType={selectedTruckType}
              setSelectedTruckType={setSelectedTruckType}
            />

            {/* You can add more components here, like filters, toggles, etc. */}

            <Button
              onPress={() => {setDspSpecTruckDet(false);}}
              title="Apply Filter"
              colors={{ bg: accent + '1c', text: accent }}
            />
          </View>
        </View>
      </View>
    </BlurView>
  </Modal>
</SafeAreaView>

)}