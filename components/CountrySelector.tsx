// components/CountrySelector.tsx
import React from 'react';
import { TouchableOpacity,View,ScrollView,StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';  // Assuming you have this component
import { SlctCountryBtn } from './SlctCountryBtn';  // Assuming this button is present
import { toggleLocalCountry, toggleInternationalCountry } from '../Utilities/utils';

import Button from './Button';
import { CountrySelectorProps } from '@/types/types';

import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'

const CountrySelector: React.FC<CountrySelectorProps> = ({
  location,
  setLocation,
  intOpLoc,
  setIntOpLoc,
  setLocaOpLoc,
  locaOpLoc ,

}) => {
      const background = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

  return (
    <View>
          
    <ThemedText>Were can the truck Operat e</ThemedText>

   <View style={{flexDirection:'row',marginBottom:9}}>
                                        
                            <TouchableOpacity  onPress={() => {setLocation("Local")} } style={[styles.countryButton, { backgroundColor: background,marginRight:6 }, location === "Local" && styles.countryButtonSelected]} >
                            <ThemedText style={{ color: location === "Local" ? 'white' : coolGray }}>Local</ThemedText>
                        </TouchableOpacity>

                                <TouchableOpacity  onPress={() => setLocation("International") } style={[styles.countryButton, { backgroundColor: background }, location === "International" && styles.countryButtonSelected]} >
                            <ThemedText style={{ color: location === "International"? 'white' : coolGray }}>International </ThemedText>
                        </TouchableOpacity>
                            </View>


          {intOpLoc.length > 0 && (
            <ThemedText>Selected: {intOpLoc.join(", ")}</ThemedText>
          )}
          {location === "Local" && <ThemedText>Selected {locaOpLoc} </ThemedText>}

    <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: wp(2),
                    gap: wp(3),
                }}
            >
      {location === "Local" &&(
        <>
          {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
            <SlctCountryBtn
              key={country}
              isSelected={locaOpLoc.includes(country)}
              selectedLoc={country}
              onPress={() => toggleLocalCountry(country, setLocaOpLoc, setIntOpLoc,  )}
            />
          ))}
        </>
      )}
      {location === "International" && (
        <>
          {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
            <SlctCountryBtn
              key={country}
              selectedLoc={country}
              isSelected={intOpLoc.includes(country)}
              onPress={() => toggleInternationalCountry(country, setLocaOpLoc, setIntOpLoc)}
            />
          ))}
         
        </>
      )}

 </ScrollView>
    </View>
  );
};

export default CountrySelector;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: wp(2)
    },
     countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, 
    countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})