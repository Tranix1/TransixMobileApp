import React from "react";
import { View,ScrollView , TouchableOpacity,StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor';

type ConfigAdnSuspensionProps ={

truckConfig: string ;
setTruckConfig :React.Dispatch<React.SetStateAction<string>>;
truckSuspension : string ;
setTruckSuspension :React.Dispatch<React.SetStateAction<string>>;
}
const  ConfigAdnSuspension: React.FC<ConfigAdnSuspensionProps>= ({truckConfig , setTruckConfig , truckSuspension , setTruckSuspension})=>{
    const accent = useThemeColor('accent');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    return(
        <View>
              <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                    Truck Config
                                </ThemedText>                                

                               <ScrollView showsHorizontalScrollIndicator={false} horizontal style={{ marginVertical: wp(3) }}>
                                    {["single Axle ", "tandem", "triaxle", "MultiAxle"].map(config => (
                                        <TouchableOpacity
                                            key={config}
                                            onPress={() => setTruckConfig(config)}
                                            style={{
                                                backgroundColor: truckConfig === config ? accent : backgroundLight,
                                                margin: 6,
                                                padding: wp(2),
                                                paddingHorizontal: wp(4),
                                                borderRadius: wp(4),
                                            }}
                                        >
                                            <ThemedText type="defaultSemiBold" color={truckConfig === config ? 'white' : text}>{config}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                                               

                                   <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, marginTop: wp(4) }}>
                                    Truck Suspension
                                </ThemedText>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: wp(3) }}>
                                    {["Link", "Super Link", "Air suspension", "mechanical steel", "Other"].map(suspension => (
                                        <TouchableOpacity
                                            key={suspension}
                                            onPress={() => setTruckSuspension(suspension)}
                                            style={{
                                                backgroundColor: truckSuspension === suspension ? accent : backgroundLight,
                                                margin: 6,
                                                padding: wp(2),
                                                paddingHorizontal: wp(4),
                                                borderRadius: wp(4),
                                            }}
                                        >
                                            <ThemedText color={truckSuspension === suspension ? 'white' : text} type="defaultSemiBold">{suspension}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
        </View>
    )
}
export default ConfigAdnSuspension

const styles = StyleSheet.create({
  
     countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, 
    countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})