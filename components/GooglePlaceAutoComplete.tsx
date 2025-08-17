import React from 'react';
import { Modal, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BlurView } from 'expo-blur';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from "@/constants/common";
import { SelectLocationProp } from '@/types/types';
interface GooglePlaceAutoCompleteProps {
    dspRoute: boolean;
    setDspRoute: (val: boolean) => void;
    setRoute :React.Dispatch<React.SetStateAction<SelectLocationProp |null>>;
}

export  function GooglePlaceAutoCompleteComp({
    dspRoute: dspToLocation,
    setDspRoute: setDspToLocation,
    setRoute: setDestination,
}: GooglePlaceAutoCompleteProps) {

 const icon = useThemeColor('icon')
  const backgroundLight = useThemeColor('backgroundLight')


  const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
    
    // Dynamic height based on dropdown visibility
    const modalHeight = isDropdownVisible ? wp(100) : wp(40); 

    return (
        <Modal transparent statusBarTranslucent visible={dspToLocation} animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <BlurView intensity={100} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View
                            style={{
                                backgroundColor: backgroundLight,
                                borderRadius: wp(4),
                                padding: wp(4),
                                width: wp(80),
                                gap: wp(3),
                                height: modalHeight,
                            }}
                        >
                            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: icon, textAlign: 'center' }}>
                                To Location<ThemedText color="red">*</ThemedText>
                            </ThemedText>
                            <GooglePlacesAutocomplete
                                placeholder="Search"
                                fetchDetails={true}
                                onPress={(data, details = null) => {
                                    if (details) {
                                        const countryComponent = details.address_components.find((component: any) =>
                                            component.types.includes('country')
                                        );
                                        const cityComponent = details.address_components.find((component: any) =>
                                            component.types.includes('locality')
                                        );

                                        setDestination({
                                            description: data.description,
                                            placeId: data.place_id,
                                            latitude: details.geometry.location.lat,
                                            longitude: details.geometry.location.lng,
                                            country: countryComponent ? countryComponent.long_name : null,
                                            city: cityComponent ? cityComponent.long_name : null,
                                        });
                                    }
                                    setIsDropdownVisible(false);
                                    setDspToLocation(false);
                                }}
                                query={{
                                    key: "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4",
                                    language: 'en',
                                }}
                                enablePoweredByContainer={false}
                                keyboardShouldPersistTaps="always"
                                textInputProps={{
                                    onFocus: () => setIsDropdownVisible(true),
                                    onBlur: () => setIsDropdownVisible(false),
                                }}
                                styles={{
                                    textInputContainer: {
                                        width: '100%',
                                    },
                                    textInput: {
                                        height: 44,
                                        borderRadius: 5,
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        fontSize: 15,
                                        borderWidth: 1,
                                        borderColor: icon,
                                    },
                                    listView: {
                                        position: 'absolute',
                                        top: 45,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'white',
                                        zIndex: 1000,
                                    },
                                    row: {
                                        padding: 13,
                                        backgroundColor: 'white',
                                    },
                                    separator: {
                                        height: 0.5,
                                        backgroundColor: backgroundLight,
                                    },
                                    description: {
                                        fontWeight: 'bold',
                                    },
                                    predefinedPlacesDescription: {
                                        color: '#1faadb',
                                    },
                                }}
                            />
                        </View>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
}
