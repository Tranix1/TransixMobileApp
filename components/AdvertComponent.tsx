import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { advert, user } from '@/types/types';
import { readById } from '@/firebase/dbActions';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { getDate } from '@/Services/services';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';

const AdvertComponent = ({ item = {} as advert, ondetailsPress = () => { } }) => {

    const background = useThemeColor('background')
    const backgroundColor = useThemeColor('backgroundLight')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')

    const [postOwner, setPostUser] = useState<user>();
    const getowenerdata = async () => {
        const owner = await readById('users', item.userID)
        if (owner) {
            setPostUser({ uid: owner.id, ...owner } as user)
        }
    }

    useEffect(() => {
        if (item && item.userID) {
            getowenerdata()
        } else {
            console.log('not valid data');
        }
    }, [])

    const openLink = () => {
        console.log('Opening Link');

    }

    return (
        <TouchableNativeFeedback disabled={item.link ? false : true} onPress={() => openLink()}>

            <View style={{ backgroundColor, borderRadius: wp(4), overflow: 'hidden' }}>
                <ScrollView pagingEnabled horizontal style={{ width: wp(96), height: hp(30), }}>
                    {item.images?.map((image: any, index: number) =>
                        <View style={{ height: hp(30), width: wp(96) }}>
                            {/* <ActivityIndicator /> */}
                            {/* <Image key={index} source={require('@/assets/images/prod/many.jpg')} style={{ height: wp(20), flex: 1 }} /> */}
                            <Image key={index} contentFit='cover' source={image} style={{ height: hp(30), width: '100%' }} />
                        </View>
                    )}
                </ScrollView>
                <View style={{ padding: wp(2), }}>

                    <ThemedText numberOfLines={4} type='subtitle'>
                        {item.description}
                    </ThemedText>
                </View>
                <View style={{ padding: wp(2), flexDirection: 'row', justifyContent: 'space-between', }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>


                        <View style={{}}>
                            {/* <Ionicons name='person-circle' size={wp(8)} color={'#838383a3'} /> */}
                            {postOwner?.photoURL ?
                                <View style={{ width: wp(6), height: wp(6), backgroundColor: background, borderRadius: wp(8), alignItems: 'center', justifyContent: 'center' }}>
                                    <Image
                                        style={{ width: wp(6), height: wp(6), borderRadius: wp(100), borderWidth: wp(.4), borderColor: 'gray' }}
                                        source={{ uri: postOwner?.photoURL }}

                                    />
                                </View>
                                :
                                <View style={{ width: wp(10), height: wp(10), backgroundColor: background, borderRadius: wp(5), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='title' style={{ fontSize: wp(5), color: 'gray' }}>
                                        {postOwner?.displayName?.slice(0, 1) || ''}
                                    </ThemedText>
                                </View>
                            }


                        </View>
                        <View style={{ margin: wp(1), gap: wp(3), flexDirection: 'row', alignItems: 'center' }}>
                            <ThemedText style={{ fontSize: wp(3.4), paddingTop: 0 }} type='default'>
                                {postOwner?.displayName || ''}
                            </ThemedText>
                            <ThemedText type='tiny' style={{ color: icon }}>
                                {getDate(item.created_at)}
                            </ThemedText>

                        </View>
                    </View>

                    <View style={{ overflow: 'hidden', borderRadius: wp(2.4) }}>

                        <TouchableNativeFeedback onPress={() => ondetailsPress()}>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2), padding: wp(2), minWidth: wp(8) }}>
                                <Ionicons name='ellipsis-vertical' size={wp(5)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>
        </TouchableNativeFeedback>

    )
}

export default AdvertComponent

const styles = StyleSheet.create({})