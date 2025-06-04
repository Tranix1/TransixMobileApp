import { StyleSheet, Text, View, ViewProps } from 'react-native'
import React from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'
import { wp } from '@/constants/common'

const Divider = ({ style, ...rest }: ViewProps) => {
    const icon = useThemeColor('icon')

    return (
        <View {...rest} style={[{ backgroundColor: icon + '4d', height: wp(.15), marginVertical: wp(.8), flex: 1, }, style]}></View>
    )
}

export default Divider

const styles = StyleSheet.create({})