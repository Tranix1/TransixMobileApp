import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Product } from '@/types/types'

const ProductComponent = ({ Product = {} as Product }) => {
    return (
        <View>
            <Text>ProductComponent</Text>
        </View>
    )
}

export default ProductComponent

const styles = StyleSheet.create({})