import React,{useState} from "react";
import { View,TouchableOpacity,ScrollView,Image,} from "react-native";
import {  wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'

import {  Ionicons } from '@expo/vector-icons'
import { ThemedText } from "./ThemedText";
import { TruckTypeProps } from "@/types/types";
import Input from "./Input";

interface SpecifyTruckTypeProps {

    selectedTruckType: TruckTypeProps | null;
    setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps| null>>;
    otherTruckType : string
    setOtherTruckType:React.Dispatch<React.SetStateAction<string>>
}
export const SpecifyTruckType:React.FC<SpecifyTruckTypeProps> =({selectedTruckType ,setSelectedTruckType,otherTruckType ,setOtherTruckType, })=>{

    const background = useThemeColor('backgroundLight')
    const accent = useThemeColor('accent')

      const truckTypes = [
        { id: 0, name: 'Flat deck', image: require('@/assets/images/Trucks/images (2).jpeg') },
        { id: 1, name: 'Bulk Trailer', image: require('@/assets/images/Trucks/download (1).jpeg') },
        { id: 2, name: 'Low Bed', image: require('@/assets/images/Trucks/H805f1f51529345648d1da9e5fcd6807e2.jpg') },
        { id: 3, name: 'Side Tipper', image: require('@/assets/images/Trucks/images (5).jpeg') },
        { id: 4, name: 'Tautliner', image: require('@/assets/images/Trucks/download (3).jpeg') },
        { id: 5, name: 'Tanker', image: require('@/assets/images/Trucks/images (7).jpeg') },
        { id: 6, name: 'Other', image: require('@/assets/images/Trucks/download (4).jpeg') },
        // { id: 7, name: 'All', image: '' },
    ]

    return(
        <View>
                <ThemedText>Load Carrying area</ThemedText>
 
                             <ScrollView horizontal contentContainerStyle={{ gap: wp(2) }} style={{}}>
                               {truckTypes.map((item) => (
                                     <TouchableOpacity
                                         key={item.id}
                                         onPress={() => {
                                             setSelectedTruckType(item);                                            setSelectedTruckType(item);
                                             console.log('set ,', item);
 
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

          {selectedTruckType?.id === 6 &&<View> 
            <ThemedText>Name of Your Load carrying area</ThemedText>
           <Input
            value={otherTruckType}
            placeholder="Enter Other Cargo Body"
            onChangeText={setOtherTruckType}
            />
          </View>}



        </View>
    )
}