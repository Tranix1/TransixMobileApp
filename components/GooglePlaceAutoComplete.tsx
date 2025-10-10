import React from 'react';
import { Modal, View, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BlurView } from 'expo-blur';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from "@/constants/common";
import { SelectLocationProp } from '@/types/types';
import { getCurrentLocation } from '@/Utilities/utils';
import * as Location from 'expo-location';

interface GooglePlaceAutoCompleteProps {
    dspRoute: boolean;
    setDspRoute: (val: boolean) => void;
    setRoute: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
    topic: string;
    setPickLocationOnMap: React.Dispatch<React.SetStateAction<boolean>>;
}

export function GooglePlaceAutoCompleteComp({
    dspRoute: dspToLocation,
    setDspRoute: setDspToLocation,
    setRoute: setDestination,
    topic,
    setPickLocationOnMap
}: GooglePlaceAutoCompleteProps) {

    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');

    const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
    const [loadingCurrentLocation, setLoadingCurrentLocation] = React.useState(false);
    const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject | null>(null);

    const modalHeight = isDropdownVisible ? wp(100) : wp(40);

    // Test API key function
    const testApiKey = async () => {
        try {
            console.log('Testing API key...');
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=test&key=AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4`
            );
            const data = await response.json();
            console.log('API test response:', data);
        } catch (error) {
            console.error('API test error:', error);
        }
    };

    // Test API key on component mount
    React.useEffect(() => {
        testApiKey();
    }, []);

    async function reverseGeocode(lat: number, lng: number) {
        try {
            console.log('Starting reverse geocoding for:', lat, lng);
            const apiKey = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
            const res = await fetch(url);
            const data = await res.json();

            console.log('Reverse geocoding response:', data);

            if (data.status !== "OK") throw new Error("Geocoding failed");

            const result = data.results[0];
            console.log('First result:', result);
            console.log('Address components:', result.address_components);

            const countryComponent = result.address_components?.find((c: any) => {
                console.log('Checking country component:', c);
                return c.types?.includes("country");
            });
            const cityComponent = result.address_components?.find((c: any) => {
                console.log('Checking city component:', c);
                return c.types?.includes("locality");
            });

            console.log('Found country component:', countryComponent);
            console.log('Found city component:', cityComponent);

            return {
                description: result.formatted_address || '',
                placeId: result.place_id || '',
                latitude: lat,
                longitude: lng,
                country: countryComponent ? countryComponent.long_name : null,
                city: cityComponent ? cityComponent.long_name : null,
            };
        } catch (err) {
            console.error("Reverse geocoding error:", err);
            return null;
        }
    }

    return (
        <Modal transparent statusBarTranslucent visible={dspToLocation} animationType="fade">
            <View style={styles.overlay}>
                <BlurView intensity={100} style={styles.blurContainer}>

                    {loadingCurrentLocation && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={accent} />
                        </View>
                    )}

                    <View style={styles.innerContainer}>
                        <View style={[styles.modalBox, { backgroundColor: backgroundLight, height: modalHeight }]}>

                            <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: icon, textAlign: 'center' }}>
                                {topic} <ThemedText color="red">*</ThemedText>
                            </ThemedText>

                            <GooglePlacesAutocomplete
                                placeholder="Search"
                                fetchDetails={true}
                                predefinedPlaces={[]}
                                minLength={2}
                                debounce={300}
                                timeout={10000}
                                keepResultsAfterBlur={false}
                                enablePoweredByContainer={false}
                                keyboardShouldPersistTaps="always"
                                onPress={(data, details = null) => {
                                    console.log('Location selected - data:', data);
                                    console.log('Location selected - details:', details);
                                    if (details) {
                                        const countryComponent = details.address_components?.find((c: any) =>
                                            c.types?.includes('country')
                                        );
                                        const cityComponent = details.address_components?.find((c: any) =>
                                            c.types?.includes('locality')
                                        );

                                        console.log('Setting destination with:', {
                                            description: data.description || '',
                                            placeId: data.place_id || '',
                                            latitude: details.geometry?.location?.lat || 0,
                                            longitude: details.geometry?.location?.lng || 0,
                                            country: countryComponent ? countryComponent.long_name : null,
                                            city: cityComponent ? cityComponent.long_name : null,
                                        });

                                        setDestination({
                                            description: data.description || '',
                                            placeId: data.place_id || '',
                                            latitude: details.geometry?.location?.lat || 0,
                                            longitude: details.geometry?.location?.lng || 0,
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
                                textInputProps={{
                                    onFocus: () => {
                                        console.log('GooglePlacesAutocomplete focused');
                                        setIsDropdownVisible(true);
                                    },
                                    onBlur: () => {
                                        console.log('GooglePlacesAutocomplete blurred');
                                        setIsDropdownVisible(false);
                                    },
                                    onChangeText: (text) => {
                                        console.log('Search text changed:', text);
                                    },
                                }}
                                onFail={(error) => {
                                    console.error('GooglePlacesAutocomplete error:', error);
                                    Alert.alert('Search Error', 'Failed to search locations. Please try again.');
                                }}
                                onNotFound={() => {
                                    console.log('No results found');
                                }}
                                styles={{
                                    textInputContainer: { width: '100%' },
                                    textInput: {
                                        height: 44,
                                        borderRadius: 8,
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        fontSize: 15,
                                        borderWidth: 1,
                                        borderColor: icon,
                                    },
                                    listView: { position: 'absolute', top: 45, left: 0, right: 0, backgroundColor: 'white', zIndex: 1000 },
                                    row: { padding: 13, backgroundColor: 'white' },
                                    separator: { height: 0.5, backgroundColor: backgroundLight },
                                    description: { fontWeight: 'bold' },
                                    predefinedPlacesDescription: { color: '#1faadb' },
                                }}
                            />

                            <View style={styles.buttonRow}>
                                {/* Pick on Map Button */}
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setPickLocationOnMap(true);
                                        setIsDropdownVisible(false);
                                        setDspToLocation(false);
                                    }}
                                >
                                    <ThemedText style={styles.buttonText}>Pick On Map</ThemedText>
                                </TouchableOpacity>

                                {/* Current Location Button */}
                                {!currentLocation && (
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={async () => {
                                            try {
                                                setLoadingCurrentLocation(true);

                                                const loc = await getCurrentLocation();
                                                setCurrentLocation(loc);

                                                const destination = await reverseGeocode(
                                                    loc!.coords.latitude,
                                                    loc!.coords.longitude
                                                );

                                                if (destination) {
                                                    setDestination(destination);
                                                    setIsDropdownVisible(false);
                                                    setDspToLocation(false);
                                                }
                                            } catch (err) {
                                                console.error("Location fetch error:", err);
                                            } finally {
                                                setLoadingCurrentLocation(false);
                                            }
                                        }}
                                    >
                                        {loadingCurrentLocation ? (
                                            <ActivityIndicator color={accent} />
                                        ) : (
                                            <ThemedText style={styles.buttonText}>Current Location</ThemedText>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>


                        </View>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    blurContainer: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
    innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalBox: { borderRadius: wp(4), padding: wp(4), width: wp(80), gap: wp(3) },
    loaderContainer: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20, zIndex: 10 },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: hp(2)
    },
    button: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: hp(1.2),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#424242',
        marginTop: hp(2.7),
    },
    buttonText: { fontSize: 15, fontWeight: '600' },

});
