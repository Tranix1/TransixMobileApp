import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText } from './ThemedText'
import { useRouter } from 'expo-router'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'

const Heading = ({ page = 'Page', rightComponent = <></>, overrideBack = null }: { page?: string; rightComponent?: JSX.Element; overrideBack?: (() => void) | null }) => {
    const router = useRouter();
    const icon = useThemeColor('icon');
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), paddingVertical: wp(1), borderColor: icon }}>
                <TouchableHighlight
                    underlayColor={'#7f7f7f1c'}
                    onPress={overrideBack ? overrideBack : () => router.back()}
                    style={{ padding: wp(2.5), marginLeft: wp(2), borderRadius: wp(5) }}
                >
                    <Ionicons name='chevron-back' size={wp(5)} color={icon} />
                </TouchableHighlight>
                <ThemedText style={{ lineHeight: 40 }} type='defaultSemiBold'>{page}</ThemedText>
            </View>
            {rightComponent}
        </View>
    )
}

export default Heading

const styles = StyleSheet.create({})