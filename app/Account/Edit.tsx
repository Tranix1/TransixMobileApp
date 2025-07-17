import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { Countries } from '@/types/types';
import type { ImagePickerAsset } from 'expo-image-picker';
import { selectManyImages } from '@/Utilities/utils';
import { uploadImage } from "@/db/operations";

const Edit = () => {

    const { user, updateAccount } = useAuth();


    const [imagelogo, setLogo] = useState<ImagePickerAsset[]>([]);
    const [imageUpdate, setUploadImageUpdate] = React.useState("")

    const [organisation, setOrganisation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [selectedValue, setSelectedValue] = useState({ value: '', label: '' });

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')


    const countries = Countries.map((item) => ({ value: item, label: item }))

    useEffect(() => {
        if (!user)
            router.back()
        else {
            setOrganisation(user?.organisation || '')
            setPhoneNumber(user?.phoneNumber || '')
            setAddress(user?.address || '')
            setSelectedValue({ value: user.country || '', label: user.country || '' })
        }


    }, [])

    const Submit = async () => {
        const logoImage =  imagelogo[0]  ? await uploadImage(imagelogo[0] , "Trucks", setUploadImageUpdate, "Logo") :null;
        const data = {
            country: selectedValue.value,
            address: address,
            phoneNumber: phoneNumber,
            organisation: organisation,
            photoURL: imagelogo[0]  ?logoImage : user?.photoURL 
        }

        try {
            const update = await updateAccount(data);
            if (update.success) {
                router.back()
            }
        } catch (error) {
            console.error("errror", error)
        }

    }



    return (
        <ScreenWrapper>
            <View style={styles.container}>

                <Heading page='Edit' />
                <ScrollView>


                    <ThemedText style={styles.label}>Organisation Logo</ThemedText>

                    {imagelogo[0] && <Image source={{ uri: imagelogo[0].uri }} style={{ width: wp(40), height: wp(40), margin: 'auto', marginBottom: 9, borderRadius: wp(4) }} />}
                    {!imagelogo[0] && !user?.photoURL &&  <TouchableOpacity
                        style={[styles.input, { height: hp(14), justifyContent: 'center', alignItems: 'center' }]}
                        onPress={() => selectManyImages(setLogo, true)}
                    >
                        <Ionicons name='image-outline' size={wp(8)} color={icon} />
                        <ThemedText style={styles.label}>Click To Add Logo</ThemedText>

                    </TouchableOpacity>}

                        
                        {user?.photoURL &&!imagelogo[0] && <TouchableOpacity style={{justifyContent:"center",alignItems:"center"}} onPress={() => selectManyImages(setLogo, true)}>
                       {<Image source={{ uri: user?.photoURL }} style={{ width: wp(50), height: hp(11.5), margin: 'auto', marginBottom: 9, borderRadius: wp(4) }} />}
                            <ThemedText color={accent} >Edit</ThemedText>
                        </TouchableOpacity>}
                        

                    <ThemedText style={styles.label}>Organisation Name</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Your Organisation"
                        value={organisation}
                        onChangeText={setOrganisation}
                        keyboardType='email-address'
                    />
                    <ThemedText style={styles.label}>Country</ThemedText>
                    <Dropdown
                        style={[styles.dropdown,]}
                        placeholderStyle={[styles.placeholderStyle, { color: backgroundLight }]}
                        selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
                        data={countries}
                        maxHeight={hp(60)}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Country"
                        value={selectedValue.value}
                        itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                        activeColor={backgroundLight}
                        containerStyle={{
                            borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
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
                            setSelectedValue(item);
                        }}

                        renderLeftIcon={() => <></>}
                        renderRightIcon={() => <Entypo name="chevron-thin-down" size={wp(4)} color={icon} />}
                        renderItem={((item) =>
                            <View style={[styles.item, item.value === selectedValue.value && {}]}>
                                <ThemedText style={[{ textAlign: 'left', flex: 1 }, item.value === selectedValue.value && { color: accent }]}>{item.value}</ThemedText>
                                {item.value === selectedValue.value && (
                                    <Ionicons
                                        color={icon}
                                        name='checkmark-outline'
                                        size={wp(5)}
                                    />
                                )}
                            </View>
                        )}

                    />

                    <ThemedText style={styles.label}>Address</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Your Address"
                        value={address}
                        onChangeText={setAddress}
                        keyboardType='email-address'
                    />
                    <ThemedText style={styles.label}>Phone Number</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Your Phone Number "
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType='number-pad'
                    />






                    <TouchableOpacity onPress={() => Submit()} style={[styles.signUpButton, { backgroundColor: accent }]}>
                        <ThemedText color='#fff' type='subtitle'>Save</ThemedText>
                    </TouchableOpacity>


                </ScrollView>

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
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'left',
        marginBottom: 20,
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
});
