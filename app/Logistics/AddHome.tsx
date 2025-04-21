import { StyleSheet, Text, View,TouchableOpacity } from 'react-native'
import React from 'react'
import { ThemedText } from '@/components/ThemedText'
import { router, useFocusEffect } from "expo-router";

const AddHome = () => {
    return (
        <View style={{paddingTop:100}} >
            <Text>Index</Text>

             <TouchableOpacity onPress={()=>router.push("/Logistics/Trucks/AddTrucks")} >
                     <Text>Add Trucks</Text>
                </TouchableOpacity>   
            
            <ThemedText> Add Loads</ThemedText>
            <ThemedText> Add Contracts</ThemedText>
            
        </View>
    )
}

export default AddHome

const styles = StyleSheet.create({})