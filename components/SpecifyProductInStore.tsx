import React from "react";
import { TouchableOpacity, View, Modal, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import CountrySelector from "./CountrySelector";
import { ThemedText } from "./ThemedText";

import { SlctTruckCapacity } from "./SelectTruckCapacity";
import { SpecifyTruckType } from "./SelectTruckType";
import { BlurView } from 'expo-blur'
import Button from "./Button";

import { useThemeColor } from '@/hooks/useThemeColor'
import { Entypo, Ionicons } from '@expo/vector-icons'

import { hp, wp } from '@/constants/common'

import { productCategories, smallVehicleMake, smallVehicleTypes, heavyEupementMake, heavyEupementType, cargoTruckMake, cargoVehiType, serviceProivderType, transactionTypes, containerType, containerMake, trailerType, trailerMake, sparesType, cargoArea } from "@/data/appConstants";


type SpecifyProductDetailsProps = {
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
  buyOSelling: string
  setBuyOselling: React.Dispatch<React.SetStateAction<string>>;
  selectedProdCategry: { id: number; name: string } | any
  setSelectedProdctCategory: React.Dispatch<React.SetStateAction<{ id: number; name: string } | any>>;
  selectedVehiType: { id: number; name: string } | null
  setSelectedVehiType: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  selectedBudget: { id: number; name: string } | null
  setSelectedBudget: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  selectedTransType: { id: number; name: string } | null
  setSelectedTransType: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  slectedBodyType: { id: number; name: string } | null
  setSelectedBodyType: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  slectedMake: { id: number; name: string } | null
  setSelectedMake: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;

}
export const SpecifyProductDetails: React.FC<SpecifyProductDetailsProps> = ({
  showFilter, setShowFilter,

  buyOSelling, setBuyOselling, selectedProdCategry, setSelectedProdctCategory, selectedVehiType,
  setSelectedVehiType, selectedBudget,setSelectedBudget , selectedTransType , setSelectedTransType , slectedBodyType ,
    setSelectedBodyType, slectedMake, setSelectedMake 
}) => {

  const bg = useThemeColor('background')
  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')
  const background = useThemeColor('backgroundLight');
  const coolGray = useThemeColor('coolGray');
  const backgroundLight = useThemeColor('backgroundLight');
  const iconColor = useThemeColor('icon');
  const textColor = useThemeColor('text');




  const budgest = [
    { id: 1, name: "0 - 1.5k" },
    { id: 2, name: "1.5 - 2.5" },
    { id: 3, name: "2.5k - 5k" },
    { id: 4, name: "5k - 10k" },
    { id: 6, name: "10k - 25k" },
    { id: 7, name: "25k - 45k" },
    { id: 8, name: "45k - 65k" },
    { id: 9, name: "65k - 100k" },
    { id: 10, name: "80k - 100k" },
    { id: 11, name: "100k +++" },
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
                selectedItem?.id === item.id && {backgroundColor:accent} ,
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
                  title="Product Category"
                  items={productCategories}
                  selectedItem={selectedProdCategry}
                  onSelect={setSelectedProdctCategory}
                />

                {selectedProdCategry?.name == "Vehicle" && <HorizontalPicker
                  title="Vehicle Type"
                  items={[{ id: 1, name: "small vehicle" }, { id: 2, name: "cargo vehicle" }, { id: 3, name: "heavy Equip" }]}
                  selectedItem={selectedVehiType}
                  onSelect={setSelectedVehiType}
                />}




                <ThemedText style={{ color: '#1E90FF' }}>For sell or looking for it</ThemedText>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      buyOSelling && styles.checkboxSelected
                    ]}
                    onPress={() => setBuyOselling("buyRequests")}
                  >
                    <Ionicons
                      name={buyOSelling == "buyRequests" ? "checkbox" : "square-outline"}
                      size={wp(5)}
                      color={buyOSelling === "buyRequests" ? accent : iconColor}
                    />
                    <ThemedText style={{ marginLeft: wp(2) }}>Buy Requests</ThemedText>
                  </TouchableOpacity>


                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      buyOSelling && styles.checkboxSelected
                    ]}
                    onPress={() => setBuyOselling("sellOffers")}
                  >
                    <Ionicons
                      name={buyOSelling === "sellOffers" ? "checkbox" : "square-outline"}
                      size={wp(5)}
                      color={buyOSelling == "sellOffers" ? accent : iconColor}
                    />
                    <ThemedText style={{ marginLeft: wp(2) }}>Sell Offers</ThemedText>
                  </TouchableOpacity>
                </View>



                <HorizontalPicker
                  title="Budget"
                  items={budgest}
                  selectedItem={selectedBudget}
                  onSelect={setSelectedBudget}
                />

                <HorizontalPicker
                  title="Transcation Type "
                  items={transactionTypes}
                  selectedItem={selectedTransType}
                  onSelect={setSelectedTransType}
                />


                {selectedProdCategry?.name === "Vehicle" && selectedVehiType && <View>
                  <HorizontalPicker
                    title="Body "
                    items={selectedVehiType?.name === "small vehicle" ? smallVehicleTypes : selectedVehiType?.name === "cargo vehicle" ? cargoVehiType : heavyEupementType}
                    selectedItem={slectedBodyType}
                    onSelect={setSelectedBodyType}
                  />

                  <HorizontalPicker
                    title="Make"
                    items={selectedVehiType?.name === "small vehicle" ? smallVehicleMake : selectedVehiType?.name === "cargo vehicle" ? cargoTruckMake : heavyEupementMake}
                    selectedItem={slectedMake}
                    onSelect={setSelectedMake}
                  />

                </View>}

                {["Trailers", "Container"].includes(selectedProdCategry?.name) && <View>

                  <HorizontalPicker
                    title="Body "
                    items={selectedProdCategry?.name === "Trailers" ? trailerType : containerType}
                    selectedItem={slectedBodyType}
                    onSelect={setSelectedBodyType}
                  />

                  <HorizontalPicker
                    title="Make"
                    items={selectedProdCategry?.name === "Trailers" ? trailerMake : containerMake}
                    selectedItem={slectedMake}
                    onSelect={setSelectedMake}
                  />
                </View>}




                <Button
                  onPress={() => { setShowFilter(false); }}
                  title="Apply Filter"
                  colors={{ bg: accent + '1c', text: accent }}
                  style={{height:45}}
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

  },  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  }, checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  checkboxSelected: {
    // Add any selected styles if needed
  },
})