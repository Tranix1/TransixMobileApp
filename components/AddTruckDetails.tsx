import React, { FC,useEffect } from "react";
import { View, TouchableOpacity } from "react-native"

import { ThemedText } from "./ThemedText";

import { truckType, tonneSizes, litresCapacity, cargoArea, trailerConfigurations, truckSuspensions, tankerTypes } from "@/data/appConstants";

import { DropDownItem } from "./DropDown";
import Input from "./Input";

import { TruckFormData, Countries, TruckTypeProps } from "@/types/types";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

import { handleChange } from "@/Utilities/utils";
import { hp, wp } from "@/constants/common";

import Divider from "./Divider";
import { useThemeColor } from '@/hooks/useThemeColor'

import type { ImagePickerAsset } from 'expo-image-picker';

interface SlctTruckCapacityProps {
    selectedTruckType: { id: number, name: string } | null;
    setSelectedTruckType: React.Dispatch<React.SetStateAction<{ id: number, name: string } | null>> ;
    selectedCargoArea: { id: number, name: string } | null;
    setSelectedCargoArea: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
    selectedTankerType: { id: number, name: string } | null;
    setSelectedTankerType: React.Dispatch<React.SetStateAction<{ id: number, name: string } | null>>;

    selectedTruckCapacity: { id: number, name: string } | null;
    setSelectedTruckCapacity: React.Dispatch<React.SetStateAction<{ id: number, name: string } | null>>;

    // selectedTruckType: TruckTypeProps | null;

    formData: TruckFormData;
    setFormData: React.Dispatch<React.SetStateAction<TruckFormData>>;

    showCountries: boolean
    setShowCountries: React.Dispatch<React.SetStateAction<boolean>>;
    operationCountries: string[];
    setOperationCountries: React.Dispatch<React.SetStateAction<string[]>>;

    setImages?: React.Dispatch<React.SetStateAction<ImagePickerAsset[]>>;
    images?: ImagePickerAsset[];

}

export const AddTruckDetails: FC<SlctTruckCapacityProps> = ({
    selectedTruckType,
    setSelectedTruckType,
    selectedCargoArea,
    setSelectedCargoArea,
    selectedTankerType,
    setSelectedTankerType,
    selectedTruckCapacity,
    setSelectedTruckCapacity,
    formData,
    setFormData,
    showCountries,
    setShowCountries,
    operationCountries,
    setOperationCountries,
    setImages,
    images,
    // selectedTruckType

}) => {
    useEffect(() => {
  if (images && images.length > 2) {
    // setImages?.(prev => prev.slice(0, 2));

  }
}, [images]);


    const icon = useThemeColor('icon')
    return (
        <View>

            <ThemedText>
                Truck Type<ThemedText color="red">*</ThemedText>
            </ThemedText>



<DropDownItem
  allData={truckType}
  selectedItem={selectedTruckType}
  setSelectedItem={setSelectedTruckType}
  placeholder="Select Truck Type"
/>


            <ThemedText>
                Cargo Area<ThemedText color="red">*</ThemedText>
            </ThemedText>

            <DropDownItem allData={cargoArea} selectedItem={selectedCargoArea} setSelectedItem={setSelectedCargoArea} placeholder="Select cargo area" />
            {selectedCargoArea?.name === 'Other' &&
                <>
                    <ThemedText>
                        Other Truck Type<ThemedText color="red">*</ThemedText>
                    </ThemedText>
                    <Input
                        value={formData.otherCargoArea}
                        placeholder="Other Truck Type"
                        onChangeText={(text) => handleChange<TruckFormData>(text, 'otherCargoArea', setFormData)}
                    />
                </>
            }


            {selectedCargoArea?.name === "Tanker" && <ThemedText>
                Tanker Type<ThemedText color="red">*</ThemedText>
            </ThemedText>}

            {selectedCargoArea?.name === "Tanker" && <DropDownItem allData={tankerTypes} selectedItem={selectedTankerType} setSelectedItem={setSelectedTankerType} placeholder="Select Truck" />}

            {(selectedTankerType?.name === 'Other' || selectedTankerType?.name === "Specialized Cargo") &&
                <>
                    <ThemedText>
                        Other Tanker Type<ThemedText color="red">*</ThemedText>
                    </ThemedText>
                    <Input
                        value={formData.otherTankerType}
                        placeholder="Other Truck Type"
                        onChangeText={(text) => handleChange<TruckFormData>(text, 'otherTankerType', setFormData)}
                    />
                </>
            }





            {selectedCargoArea?.name !== "Tanker" && <ThemedText>
                Truck Tonnage<ThemedText color="red">*</ThemedText>
            </ThemedText>}

            {selectedCargoArea?.name !== "Tanker" && <DropDownItem allData={tonneSizes} selectedItem={selectedTruckCapacity} setSelectedItem={setSelectedTruckCapacity} placeholder="Select Tonnage" />}


            {selectedCargoArea?.name === "Tanker" && <ThemedText>
                Truck Litres<ThemedText color="red">*</ThemedText>
            </ThemedText>}

            {selectedCargoArea?.name === "Tanker" &&
                <DropDownItem
                    allData={litresCapacity}
                    selectedItem={selectedTruckCapacity}
                    setSelectedItem={setSelectedTruckCapacity} placeholder="Select Litres"
                />}



            <ThemedText style={{ marginBottom: wp(4) }}>
                {operationCountries?.join(', ') || '--'}
            </ThemedText>

            <ThemedText>
                Permitted countries<ThemedText color="red">*</ThemedText>
            </ThemedText>

            <View style={{
                paddingVertical: wp(1),

                gap: wp(1),
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 12,
                paddingHorizontal: 16,
                marginBottom: 16,
            }}>
                <TouchableOpacity 
                onPress={() => { images && images.length > 0 ? (setImages?.(prev => prev.slice(0, 2)), setShowCountries(!showCountries)) : setShowCountries(!showCountries); }}

                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <ThemedText style={{ minHeight: hp(5), textAlignVertical: 'center' }}>
                        Select Countrie(s)
                    </ThemedText>

                    <Ionicons name={showCountries ? 'chevron-up-outline' : "chevron-down"} size={wp(4)} color={icon} />
                </TouchableOpacity>
                {showCountries &&
                    <View>
                        <Divider />
                        {Countries.map((item) => {

                            const active = operationCountries.some(x => x === item);

                            return (
                                <TouchableOpacity onPress={() => active ? setOperationCountries(operationCountries.filter(x => x !== item)) : setOperationCountries([...operationCountries, item])} style={{ padding: wp(2), marginVertical: wp(1), flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <ThemedText type="subtitle">
                                        {item}
                                    </ThemedText>

                                    <FontAwesome name={active ? 'check-square' : "square-o"} size={wp(5)} color={active ? '#0f9d58' : icon} />
                                </TouchableOpacity>
                            )
                        }
                        )}

                    </View>
                }

            </View>






        </View>
    );
};