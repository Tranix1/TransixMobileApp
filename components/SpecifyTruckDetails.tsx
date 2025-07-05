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
import {  Ionicons } from '@expo/vector-icons'

import { hp, wp } from '@/constants/common'


import ConfigAdnSuspension from "./ConfigAndSuspension";

type SpecifyTruckDetailsProps = {
  dspSpecTruckDet: boolean;
  setDspSpecTruckDet: React.Dispatch<React.SetStateAction<boolean>>;
  // Selecting Truck Tonnage
  truckCapacity: string;
  setTruckCapacity: React.Dispatch<React.SetStateAction<string>>;

  // Select Truck Details 
  selectedTruckType: TruckTypeProps | null;
  setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
  tankerType: string
  setTankerType: React.Dispatch<React.SetStateAction<string>>

truckConfig: string ;
setTruckConfig :React.Dispatch<React.SetStateAction<string>>;
truckSuspension : string ;
setTruckSuspension :React.Dispatch<React.SetStateAction<string>> ;

operationCountries : string[]
setOperationCountries :React.Dispatch<React.SetStateAction<string[] >> ;
} 
export const SpecifyTruckDetails: React.FC<SpecifyTruckDetailsProps> = ({
  dspSpecTruckDet, setDspSpecTruckDet,   tankerType,  setTankerType, truckCapacity, setTruckCapacity, selectedTruckType, setSelectedTruckType,

operationCountries,
setOperationCountries ,
 truckConfig ,
 setTruckConfig ,
truckSuspension ,
setTruckSuspension ,
}) => {

  const bg = useThemeColor('background')
  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')


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
                operationCountries = {operationCountries}
              setOperationCountries={setOperationCountries}
                />


                <ConfigAdnSuspension  truckConfig={truckConfig} setTruckConfig={setTruckConfig} truckSuspension={truckSuspension} setTruckSuspension={setTruckSuspension} />

                <SlctTruckCapacity
                  truckTonnage={truckCapacity}
                  setTruckTonnage={setTruckCapacity}

                  selectedTruckType={selectedTruckType}
                />

                <SpecifyTruckType
                  selectedTruckType={selectedTruckType}
                  setSelectedTruckType={setSelectedTruckType}
                  tankerType={tankerType}
                  setTankerType={setTankerType}
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