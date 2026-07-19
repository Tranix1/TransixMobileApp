import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Dropdown, SelectCountry } from 'react-native-element-dropdown';
import { Countries } from '@/types/types';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from "@/db/operations";
import Divider from "@/components/Divider";
import { countryCodes, } from "@/data/appConstants";
import { usePushNotifications } from '@/Utilities/pushNotification';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from "expo-location";
import { MaterialCommunityIcons } from '@expo/vector-icons';

type LocationData = {
    description: string;
    placeId: string;
    latitude: number | null;
    longitude: number | null;
    country: string;
    city: string;
};


const Edit = () => {

    const { operation } = useLocalSearchParams();

    const { user, updateAccount, alertBox, currentRole } = useAuth();
    const { expoPushToken } = usePushNotifications();


    const [imagelogo, setLogo] = useState<ImagePickerAsset | null>(null);

    const [organisation, setOrganisation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [selectedValue, setSelectedValue] = useState({ value: '', label: '' });

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')

    const [countryCode, setCountryCode] = useState<{ id: number, name: string }>({ id: 0, name: '+263' })

    const [location, setLocation] = useState<LocationData> ({
        description: "",
        placeId: "",
        latitude: null,
        longitude: null,
        country: "",
        city: "",
    });
    const [loadingLocation, setLoadingLocation] = useState(false);

    const getCurrentLocation = async () => {
    try {
        setLoadingLocation(true);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            return;
        }

        const current = await Location.getCurrentPositionAsync({});

        const latitude = current.coords.latitude;
        const longitude = current.coords.longitude;

        const address = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        const place = address[0];

        const city = place.city || place.subregion || place.district || "";
        const country = place.country || "";

        setLocation({
            description: `${city}${country ? `, ${country}` : ""}`,
            placeId: "",
            latitude,
            longitude,
            country,
            city,
        });

    } catch (error) {
        console.log("Location error:", error);

    } finally {
        setLoadingLocation(false);
    }
};

    useEffect(() => {
        if (!user) {
            router.back();
            return;
        }

        setOrganisation(user?.organisation || '');
        setPhoneNumber(user?.number || '');
        setCountryCode(user.countryCode || { id: 0, name: '+263' });
        setAddress(user?.address || '');
        setSelectedValue({ value: user.country || '', label: user.country || '' });
    }, [user]);

    const [loading, setLoading] = React.useState(false)

    const selectSingleImage = async () => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (pickerResult.canceled || !pickerResult.assets?.length) {
            return;
        }

        const asset = pickerResult.assets[0];
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
        }

        setLogo(asset);
    };

    const Submit = async () => {

        const MissingDriverDetails = [
            !organisation && "Enter Organisation Name",
            !selectedValue.value && "Select Country Of Operation",
            !address && "Enter Physical Adress ",
            !countryCode.name && "Select Country Code",
            !phoneNumber && "Enter Phone Number",
        ].filter(Boolean);

        if (MissingDriverDetails.length > 0 && operation === "create") {
            // setContractDErr(true);
            alertBox("Missing Profile Details", MissingDriverDetails.join("\n"), [], "error");
            setLoading(false)
            return;
        }


        if (!user) {
            return;
        }

        setLoading(true);

        const logoImage = imagelogo ? await uploadImage(imagelogo, "Profiles", () => { }, "Logo") : null;
        const data = {


            location: location,
            phoneNumber: `${countryCode.name}${phoneNumber}`,
            number: phoneNumber,
            countryCode: countryCode,
            organisation: organisation,
            displayName: organisation,
            photoURL: imagelogo ? logoImage || undefined : user.photoURL,
            uid: user.uid,
            email: user.email,
            expoPushToken: expoPushToken || undefined,
            accountType: currentRole.accType,
            role: currentRole.role,
            roleDetails: currentRole,
            createdAt: user?.createdAt || Date.now().toString(),

        };

        try {
            const update = await updateAccount(data);
            setLoading(false);

            if (update.success) {
                await router.replace('/');
            } else {
                alertBox("Profile Update Failed", update.error || "Unable to save profile.", [], "error");
            }
        } catch (error) {
            setLoading(false);
            alertBox("Profile Update Failed", error instanceof Error ? error.message : "Unable to save profile.", [], "error");
            console.error("errror", error);
        }

    }


    const headerTitle = operation === "create" ? "Create Profile" : "Edit Profile"

    return (
        <ScreenWrapper>
            <Heading page={headerTitle} />

            <View style={styles.container}>

                <View>

                    {imagelogo && <Image source={{ uri: imagelogo.uri }} style={{ width: wp(40), height: wp(40), margin: 'auto', marginBottom: 9, borderRadius: wp(4) }} />}
                    {!imagelogo && !user?.photoURL && <TouchableOpacity
                        style={[styles.input, { height: hp(14), justifyContent: 'center', alignItems: 'center' }]}
                        onPress={selectSingleImage}
                    >
                        <Ionicons name='image-outline' size={wp(8)} color={icon} />
                        <ThemedText style={styles.label}>Click To Add Logo</ThemedText>

                    </TouchableOpacity>}

                    {user?.photoURL && !imagelogo && <TouchableOpacity style={styles.header} onPress={selectSingleImage}>
                        <Image
                            style={styles.avatar}
                            source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
                        />
                        <ThemedText type='subtitle' color={accent}>Edit</ThemedText>
                    </TouchableOpacity>}


                    <ThemedText style={styles.label}>User Name</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Your Organisation"
                        value={organisation}
                        onChangeText={setOrganisation}
                    />

  <ThemedText style={styles.label}>Phone Number</ThemedText>

                    <Input
                        Icon={<>
                            <Dropdown
                                style={[{ width: wp(15) }]}
                                selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
                                data={countryCodes}
                                maxHeight={hp(60)}
                                labelField="name"
                                valueField="name"
                                placeholder="+00"
                                value={countryCode?.name}
                                itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                                activeColor={background}

                                containerStyle={{
                                    borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
                                    width: wp(45),
                                    shadowOffset: {
                                        width: 0,
                                        height: 9,
                                    },
                                    shadowOpacity: 0.50,
                                    shadowRadius: 12.35,

                                    elevation: 19,
                                    paddingVertical: wp(1)
                                }}
                                onChange={item => {
                                    console.log(item);
                                    setCountryCode(item);
                                }}

                                renderLeftIcon={() => <></>}
                                renderRightIcon={() => <Ionicons name="chevron-down" size={wp(4)} color={icon} />}
                                renderItem={((item, selected) =>
                                    <>
                                        <View style={[styles.item, selected && {}]}>
                                            <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                                            {selected && (
                                                <Ionicons
                                                    color={icon}
                                                    name='checkmark-outline'
                                                    size={wp(5)}
                                                />
                                            )}
                                        </View>
                                        <Divider />
                                    </>
                                )}

                            />
                            <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
                        </>}
                        value={phoneNumber}
                        placeholder="700 000 000"
                        onChangeText={(text) => setPhoneNumber(text)}
                        keyboardType="numeric"
                    />








                        {location.city && location.country && (
    
    <View style={[styles.selectedLocation ]}>
    <View style={styles.selectedLocationIcon}>
        <MaterialCommunityIcons
            name="map-marker-check"
            size={22}
            color={accent}
        />
    </View>

    <View style={{ marginLeft: 12 }}>
        <ThemedText style={styles.selectedCity}>
            {location.city}
        </ThemedText>

        <ThemedText style={styles.selectedCountry}>
            {location.country}
        </ThemedText>
    </View>
</View>

)}

<ThemedText style={styles.label} >Where are you based (city/country)? </ThemedText>

                    <TouchableOpacity
                        onPress={getCurrentLocation}
                        style={[styles.locationButton, {borderColor:accent} ]}
                    >
                        
                        <MaterialCommunityIcons
                            name="crosshairs-gps"
                            size={20}
                            color={accent}
                        />

                        <ThemedText style={{ marginLeft: 8 }}>
                            {     loadingLocation
                                ? "Getting location..."
                                : "Use current location"}
                        </ThemedText>
                    </TouchableOpacity>

<ThemedText style={styles.label}>Or search your city</ThemedText>


                    <GooglePlacesAutocomplete
                        placeholder="Search your city"
                        fetchDetails={true}
                        predefinedPlaces={[]}
                        minLength={2}
                        debounce={300}
                        timeout={10000}
                        keepResultsAfterBlur={false}
                        enablePoweredByContainer={false}
                        keyboardShouldPersistTaps="always"

                        onPress={(data, details = null) => {
                            if (!details) return;

                            const components = details.address_components || [];

                            const countryComponent = components.find((c: any) =>
                                c.types?.includes("country")
                            );

                            const cityComponent = components.find((c: any) =>
                                c.types?.includes("locality") ||
                                c.types?.includes("administrative_area_level_2") ||
                                c.types?.includes("sublocality")
                            );

                            setLocation({
                                description: data.description || "",
                                placeId: data.place_id || "",
                                latitude: details.geometry?.location?.lat || null,
                                longitude: details.geometry?.location?.lng || null,
                                country: countryComponent?.long_name || "",
                                city: cityComponent?.long_name || "",
                            });
                        }}

                        query={{
                            key: "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4",
                            language: "en",
                            types: "(cities)",
                        }}

                        textInputProps={{
                            onFocus: () => console.log("focused"),
                        }}

                        onFail={(error) => {
                            console.log("Google Places Error:", error);
                        }}

                        styles={{
                            container: {
                                flex: 0,
                            },
                            textInputContainer: {
                                width: "100%",
                            },
                            textInput: {
                                height: 50,
                                borderRadius: 10,
                                paddingHorizontal: 15,
                                fontSize: 15,
                            },
                            listView: {
                                backgroundColor: "white",
                                borderRadius: 10,
                                marginTop: 5,
                            },
                            row: {
                                padding: 13,
                            },
                        }}
                    />





                  





                    <TouchableOpacity onPress={() => Submit()} style={[styles.signUpButton, { backgroundColor: accent }]} disabled={loading}>
                        <ThemedText color='#fff' type='subtitle'>{loading ? "Saving..." : "Save"} </ThemedText>
                    </TouchableOpacity>

                    <View style={{ height: 300 }}>

                    </View>
                </View>

            </View>
        </ScreenWrapper>
    )
}

export default Edit

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    logo: {
        width: wp(60),
        height: hp(10),
        alignSelf: 'center',
        marginVertical: hp(8),
    }, avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#ddd',
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'left',
        marginBottom: 20,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkboxText: {
        marginLeft: 8,
        fontSize: 14,
        flexShrink: 1,
    },
    signUpButton: {
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        marginBottom: 24,
        marginTop:10
    },
    dividerText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 32,
        gap: wp(4)
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        padding: 12,
        borderRadius: 12,
        flex: 1
    },
    footerText: {
        textAlign: 'center',
    },
    loginLink: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    }, dropdown: {
        padding: wp(3),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    icon: {
        marginRight: 5,
    },
    item: {
        padding: 17,
        gap: wp(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: wp(1)
    },
    textItem: {
        flex: 1,
        fontSize: 16,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        marginRight: wp(2)
    }, 
    
   locationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.03)",
},

locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
},

locationTitle: {
    fontWeight: "600",
    fontSize: 15,
},

locationSubtitle: {
    marginTop: 3,
    fontSize: 12,
    opacity: 0.6,
},
    selectedLocation: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    backgroundColor: "rgba(0, 150, 136, 0.26)",
    marginBottom:7 ,
},

selectedLocationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 150, 136, 0.15)",
},

selectedCity: {
    fontWeight: "700",
    fontSize: 15,
},

selectedCountry: {
    marginTop: 3,
    opacity: 0.65,
    fontSize: 13,
},
});
