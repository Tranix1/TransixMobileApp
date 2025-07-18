// components/CountrySelector.tsx
import React from 'react';
import { TouchableOpacity,View,ScrollView,StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';  // Assuming you have this component
import { SlctCountryBtn } from './SlctCountryBtn';  // Assuming this button is present
import { toggleLocalCountry, toggleInternationalCountry } from '../Utilities/utils';
import { AntDesign, Entypo, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";

import Button from './Button';
// import { CountrySelectorProps } from '@/types/types';

import { Countries } from '@/types/types';
import Divider from "@/components/Divider";

import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
 type CountrySelectorProps ={


operationCountries : string[]
setOperationCountries :React.Dispatch<React.SetStateAction<string[] >> ;
}
const CountrySelector: React.FC<CountrySelectorProps> = ({
 

operationCountries ,
setOperationCountries

}) => {

    const text = useThemeColor('text');
   const background = useThemeColor('backgroundLight')
    const bg = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const accent = useThemeColor('accent')
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon')

  return (
    <View>
    <ThemedText color='#1E90FF'>Operating Countries</ThemedText>
  


 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: wp(3) }}>
                                    {Countries.map(item =>{

                              const active = operationCountries.some(x => x === item);
                                      return (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => active ? setOperationCountries(operationCountries.filter(x => x !== item)) : setOperationCountries([...operationCountries, item])}
                                            style={{
                                                backgroundColor: active ? accent : backgroundLight,
                                                margin: 6,
                                                padding: wp(2),
                                                paddingHorizontal: wp(4),
                                                borderRadius: wp(4),
                                            }}
                                        >
                                            <ThemedText color={active ? 'white' : text} type="defaultSemiBold">{item}</ThemedText>
                                        </TouchableOpacity>
                                    )} )}
                                </ScrollView>







    </View>
  );
};

export default CountrySelector;
