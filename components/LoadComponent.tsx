import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Load } from '@/types/types'

const LoadComponent = ({ item = {} as Load }) => {
    console.log(item);

    return (
        <View>
            <Text>LoadComponent</Text>
        </View>
    )
}

export default LoadComponent

const styles = StyleSheet.create({})