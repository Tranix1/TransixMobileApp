import React from "react";
import { TouchableOpacity, View, Modal, SafeAreaView,ScrollView ,StyleSheet} from "react-native";
import CountrySelector from "./CountrySelector";
import { ThemedText } from "./ThemedText";

import { SlctTruckCapacity } from "./SelectTruckCapacity";
import { SpecifyTruckType } from "./SelectTruckType";
import { BlurView } from 'expo-blur'
import Button from "./Button";

import { useThemeColor } from '@/hooks/useThemeColor'
import { Entypo, Ionicons } from '@expo/vector-icons'

import { hp, wp } from '@/constants/common'


import ConfigAdnSuspension from "./ConfigAndSuspension";

type SpecifyProductDetailsProps = {
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;

} 
export const SpecifyProductDetails: React.FC<SpecifyProductDetailsProps> = ({
  showFilter, setShowFilter,   
 
}) => {

  const bg = useThemeColor('background')
  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')
  const background = useThemeColor('backgroundLight');
  const coolGray = useThemeColor('coolGray');
  
  const [selectedCountry , setSelectedCountry]=React.useState<{ id: number; name: string } | null> (null)




  const Countries = [
        { id: 1, name: "Zimbabwe" },
        { id: 2, name: "South Africa" },
        { id: 3, name: "Namibia" },
        { id: 4, name: "Tanzania" },
        { id: 6, name: "Mozambique" },
        { id: 7, name: "Zambia" },
        { id: 8, name: "Malawi" },
        { id: 9, name: "Botswana" },
        { id: 10, name: "Other" },
    ];


      const budgest = [
        { id: 1, name: "Zimbabwe" },
        { id: 2, name: "South Africa" },
        { id: 3, name: "Namibia" },
        { id: 4, name: "Tanzania" },
        { id: 6, name: "Mozambique" },
        { id: 7, name: "Zambia" },
        { id: 8, name: "Malawi" },
        { id: 9, name: "Botswana" },
        { id: 10, name: "Other" },
    ];


type HorizontalPickerProps = {
 title: string;
  // Modify 'items' to expect an array of objects
  items: { id: number; name: string }[];
  selectedItem: { id: number; name: string } | null;
  onSelect: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
};


const HorizontalPicker: React.FC<HorizontalPickerProps> = ({
  title,
  items,
  selectedItem,
  onSelect,
  
}) => {
     return (
        <>
  <ThemedText>{title}</ThemedText>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingHorizontal: wp(2),
      gap: wp(3),
    }}
  >
    {items.map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelect(item)}
        style={[
          styles.countryButton,
          { backgroundColor: background },
          selectedItem?.id === item.id && styles.countryButtonSelected,
        ]}
      >
        <ThemedText
          style={{
            color: selectedItem?.id === item.id ? 'white' : coolGray,
          }}
        >
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    ))}
  </ScrollView>
</>
  );
};

    

  return (
    <SafeAreaView>
      <Modal
        visible={showFilter}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setShowFilter(false)}
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
                <ThemedText>Filter Products</ThemedText>
                <TouchableOpacity onPress={() => setShowFilter(false)}>
                  <Ionicons name="close" size={wp(5)} color={icon} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: wp(4) }}>

              <HorizontalPicker
  title="Country"
  items={Countries}
  selectedItem={selectedCountry}
  onSelect={setSelectedCountry}
/>




            
              <ThemedText>For sell or looking for it</ThemedText>
              

              <HorizontalPicker
  title="Budget"
  items={Countries}
  selectedItem={selectedCountry}
  onSelect={setSelectedCountry}
/>




              <ThemedText>Budget</ThemedText>

   

              <ThemedText>Budget</ThemedText>
                 
              <ThemedText>Transcation Type</ThemedText>
                   
              <ThemedText>Body</ThemedText>
                  
              <ThemedText>Make</ThemedText>
                  
              

                <Button
                  onPress={() => { setShowFilter(false); }}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})