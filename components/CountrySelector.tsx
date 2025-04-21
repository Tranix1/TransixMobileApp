// components/CountrySelector.tsx
import React from 'react';
import { TouchableOpacity,View } from 'react-native';
import { ThemedText } from './ThemedText';  // Assuming you have this component
import { SlctCountryBtn } from './SlctCountryBtn';  // Assuming this button is present
import { toggleLocalCountry, toggleInternationalCountry } from '../Utilities/utils';

import Button from './Button';

interface CountrySelectorProps {
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  intOpLoc: string[];
  setIntOpLoc: React.Dispatch<React.SetStateAction<string[]>>;
  setLocaOpLoc: React.Dispatch<React.SetStateAction<string>>;
  setDspAddLocation: React.Dispatch<React.SetStateAction<boolean>>;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  location,
  setLocation,
  intOpLoc,
  setIntOpLoc,
  setLocaOpLoc,
  setDspAddLocation,
}) => {
  return (
    <View>
             {!location && <View >
                <ThemedText>Select How the truck operate</ThemedText>
                <View  style={{flexDirection:'row'}}>    
                {/* Local Selector */}                
                   <Button
                        colors={{ text: '#395a4f', bg: '#395a4f24' }}
                        title='Local'
                        onPress={() => setLocation("Local")}
                    />   
                {/* International Selector */}
                   <Button
                        colors={{ text: '#395a4f', bg: '#395a4f24' }}
                        title='International'
                        onPress={() => setLocation("International")}
                    />   
                    </View>
              </View>}

      {location === "Local" && (
        <>
          <ThemedText>Select The Local Country the contract will be in</ThemedText>
          {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
            <SlctCountryBtn
              key={country}
              selectedLoc={country}
              onPress={() => toggleLocalCountry(country, setLocaOpLoc, setIntOpLoc, setDspAddLocation, setLocation)}
            />
          ))}
        </>
      )}

      {location === "International" && (
        <>
          <ThemedText>Select The International countries the contract will be in</ThemedText>
          {intOpLoc.length > 0 && (
            <ThemedText>Selected: {intOpLoc.join(", ")}</ThemedText>
          )}
          {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
            <SlctCountryBtn
              key={country}
              selectedLoc={country}
              isSelected={intOpLoc.includes(country)}
              onPress={() => toggleInternationalCountry(country, setLocaOpLoc, setIntOpLoc)}
            />
          ))}

          <TouchableOpacity onPress={() => {
            setDspAddLocation(false);
            setLocation("");
          }}>
            <ThemedText>Done</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default CountrySelector;
