import React, { FC } from "react";
import { TouchableOpacity, View, ScrollView, StyleSheet, } from "react-native";
import { ThemedText } from "./ThemedText";
import { wp } from '@/constants/common'

import { useThemeColor } from '@/hooks/useThemeColor'
import { TruckTypeProps } from "@/types/types";
interface SlctTruckCapacityProps {
    truckTonnage: string;
    setTruckTonnage: React.Dispatch<React.SetStateAction<string>>;
    selectedTruckType: TruckTypeProps | null;
}

export const SlctTruckCapacity: FC<SlctTruckCapacityProps> = ({
    truckTonnage,
    setTruckTonnage,
    selectedTruckType

}) => {
    const background = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');
    const accent = useThemeColor('accent')

    const litresCapacity = [
        '300L',
        '400L',
        '500L',
        '700L',
        '800L',
        '900L',
    ]

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
            <ThemedText color="#1E90FF">Truck Capacity {selectedTruckType?.name === "Tanker" ? "Litres":"Tonnage" } </ThemedText>
       

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(2),
                    gap: wp(3),
                }}
            >

        {(selectedTruckType?.name === "Tanker" ? litresCapacity : tonneSizes).map((item, index) => (
        <TouchableOpacity
            key={index}
            onPress={() => setTruckTonnage(item)}
            style={[
            styles.countryButton,
            { backgroundColor: background },
            truckTonnage === item && {backgroundColor: accent} ,
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

    }, 
})