import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import React from 'react'
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { getDate } from '@/Services/services';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';

const NotifitCard = ({ item, ishorizontal = false }: any) => {
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accentlight');
    return (
        <TouchableHighlight underlayColor={backgroundColor} style={[{ borderRadius: wp(4), marginBottom: wp(2), }, ishorizontal && { maxWidth: wp(94), marginRight: wp(2) }]} onPress={() => console.log('haiwa')}>
            <View style={[{ paddingVertical: wp(2), borderRadius: wp(4), }]}>

                <View style={{ marginLeft: wp(2), flexDirection: 'column' }}>
                    <View style={{ marginLeft: wp(2), flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                        <Ionicons name='alert-circle-outline' />
                        <ThemedText type='subtitle' style={{ fontSize: wp(2.6), color: 'gray' }}>
                            {getDate(new Date().toISOString(), 'D MMMM YYYY')}
                        </ThemedText>
                    </View>
                    <ThemedText type='title' style={{ fontSize: 26 }}>
                        {item.title}
                    </ThemedText>
                    <ThemedText type='tiny' style={{ width: '100%', fontSize: wp(3), lineHeight: wp(5), marginBottom: wp(4) }}>
                        {item.desc}
                    </ThemedText>

                    {item.cover &&
                        <Image
                            style={{ height: hp(35), width: wp(92), borderRadius: wp(3), }}
                            source={item.cover}
                        />
                    }

                </View>

            </View>
        </TouchableHighlight>
    )
}

export default NotifitCard

const styles = StyleSheet.create({})