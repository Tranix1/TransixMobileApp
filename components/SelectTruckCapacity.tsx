import React, { useState, FC } from "react";
import { TouchableOpacity, View, ScrollView, StyleSheet, } from "react-native";
import { ThemedText } from "./ThemedText";
import { wp } from '@/constants/common'

import { useThemeColor } from '@/hooks/useThemeColor'

import Button from "./Button";
interface SlctTruckCapacityProps {
    truckTonnage: string;
    setTruckTonnage: React.Dispatch<React.SetStateAction<string>>;
    dspTruckCpacity: string;
   setDspTruckCapacity : React.Dispatch<React.SetStateAction<string>>;
}

export const SlctTruckCapacity: FC<SlctTruckCapacityProps> = ({
    truckTonnage,
    setTruckTonnage,
    dspTruckCpacity,
    setDspTruckCapacity ,
    
}) => {
    const background = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    const litresCapacity = [
        '300L',
        '400L',
        '500L',
        '700L',
        '800L',
        '900L',
    ]
    const [dspTruckTonnage, setDspTrucTonage] = React.useState<boolean>(false)

    const tonneSizes = [
        '1-3 T',
        '3-6 T',
        '7-10 T',
        '11-13 T',
        '12-15 T',
        '16-20 T',
        '20+ T',
    ];

    return (
        <View>
  <ThemedText>Truck Capacity</ThemedText>
   <View style={{flexDirection:'row',marginBottom:8}}>
                                        
                            <TouchableOpacity  onPress={() => setDspTruckCapacity("Tonnage")} style={[styles.countryButton, { backgroundColor: background,marginRight:6 }, dspTruckCpacity === "Tonnage" && styles.countryButtonSelected]} >
                            <ThemedText style={{ color: dspTruckCpacity === "Tonnage" ? 'white' : coolGray }}>Tonnage</ThemedText>
                        </TouchableOpacity>

                                <TouchableOpacity  onPress={()=> setDspTruckCapacity("Litres")} style={[styles.countryButton, { backgroundColor: background }, dspTruckCpacity === "Litres" && styles.countryButtonSelected]} >
                            <ThemedText style={{ color: dspTruckCpacity === "Litres" ? 'white' : coolGray }}>Litres </ThemedText>
                        </TouchableOpacity>
                            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(2),
                    gap: wp(3),
                }}
            >
               


                {dspTruckCpacity==="Tonnage" && tonneSizes.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setTruckTonnage(item)}
                        style={[
                            styles.countryButton,
                            { backgroundColor: background },
                            truckTonnage === item && styles.countryButtonSelected,
                        ]}
                    >
                        <ThemedText style={{ color: truckTonnage === item ? 'white' : coolGray }}>
                            {item}
                        </ThemedText>
                    </TouchableOpacity>
                ))}

                {dspTruckCpacity==="Litres" && litresCapacity.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setTruckTonnage(item)}
                        style={[
                            styles.countryButton,
                            { backgroundColor: background },
                            truckTonnage === item && styles.countryButtonSelected,
                        ]}
                    >
                        <ThemedText style={{ color: truckTonnage === item ? 'white' : coolGray }}>
                            {item}
                        </ThemedText>
                    </TouchableOpacity>
                ))}

            </ScrollView>
        </View>
    );
};
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