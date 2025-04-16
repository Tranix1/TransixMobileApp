import { StyleSheet, Text, View ,TouchableOpacity } from 'react-native'
import React from 'react'

import { router } from "expo-router";

const Index = () => {
    return (
        <View style={{paddingTop:100}} >

            <Text>Contracts Page</Text>

            <TouchableOpacity onPress={() => router.push('/Logistics/Contracts/AddContracts/Index')} >
                <Text>Add Contract</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text> View </Text>
            </TouchableOpacity>
            
            <TouchableOpacity>
                <Text>Controctor</Text>
            </TouchableOpacity>

        </View>
    )
}

export default Index

const styles = StyleSheet.create({})