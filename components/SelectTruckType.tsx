import React from "react";
import { View,TouchableOpacity,ScrollView,Image,StyleSheet} from "react-native";
import {  wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'

import {  Ionicons } from '@expo/vector-icons'
import { ThemedText } from "./ThemedText";
import { TruckTypeProps } from "@/types/types";

import { cargoArea,tankerTypes } from "@/data/appConstants";

interface SpecifyTruckTypeProps {

    selectedTruckType: TruckTypeProps | null;
    setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps| null>>;
    tankerType : string
    setTankerType :React.Dispatch<React.SetStateAction<string>>
}
export const SpecifyTruckType:React.FC<SpecifyTruckTypeProps> =({selectedTruckType ,setSelectedTruckType, tankerType,setTankerType})=>{

    const coolGray = useThemeColor('coolGray');
    const background = useThemeColor('backgroundLight')
    const accent = useThemeColor('accent')

     

    return(
        <View>
        

                {selectedTruckType?.name ==="Tanker" &&  <ThemedText>Tanker Type</ThemedText>}
                  {selectedTruckType?.name ==="Tanker" && <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(2),
                    gap: wp(3),
                }}
            >

        {tankerTypes.map((item, index) => (
        <TouchableOpacity
            key={index}
            onPress={() => setTankerType(item.name)}
            style={[
            styles.countryButton,
            { backgroundColor: background },
            tankerType === item.name && styles.countryButtonSelected,
            ]}
        >
            <ThemedText style={{ color: tankerType === item.name ? 'white' : coolGray }}>
            {item.name}
            </ThemedText>
        </TouchableOpacity>
        ))}

            </ScrollView>}


                <ThemedText color="#1E90FF">Cargo area</ThemedText>

                             <ScrollView horizontal contentContainerStyle={{ gap: wp(2) }} style={{}}>
                               { cargoArea.map((item) => (
                                     <TouchableOpacity
                                         key={item.id}
                                         onPress={() => {
                                             setSelectedTruckType(item);
 
                                         }}
                                         style={{
                                             flexDirection: 'row',
                                             alignItems: 'center',
                                             padding: wp(2),
                                             paddingRight: wp(4),
                                             marginBottom: wp(2),
                                             backgroundColor: selectedTruckType?.id === item.id ? accent + '14' : background,   
                                             borderRadius: wp(4),
                                         }}
                                     >
                                         <Image
                                             style={{ width: wp(25), height: wp(15), borderRadius: wp(2), marginRight: wp(2) }}
                                             source={item.image}
                                         />
                                         <View>
                                             <ThemedText type="subtitle">{item.name}</ThemedText>
                                             <Ionicons style={{ alignSelf: 'flex-end' }} name={selectedTruckType?.id === item.id ? "checkmark-circle" : 'ellipse-outline'} size={wp(6)} color={accent} /> 
                                                                                       
                                         </View>
                                     </TouchableOpacity>
                                 ))}
                             </ScrollView>

        
        </View>
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