import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';

import { Contracts } from '@/types/types'
import { ThemedText } from '@/components/ThemedText';

import { router } from "expo-router";
const ViewContractDetails = () => {
    type ContractItem = {
  id: string;
  name: string;
  // add any other fields here
}&Contracts ;
const params = useLocalSearchParams();

const itemString = typeof params.item === 'string' ? params.item : undefined;

const parsedItem = itemString ? (JSON.parse(itemString) as ContractItem) : null;

// console.log(parsedItem?.formData.commodity)

    return (
        <View style={{paddingTop:100}} >
            <Text>Index</Text>
            <ThemedText>Contract All Details</ThemedText>
<TouchableOpacity onPress={()=>router.push("/Logistics/Contracts/BookContract")} >
    <Text>Book contract</Text>
</TouchableOpacity>

        </View>
    )
}

export default ViewContractDetails

const styles = StyleSheet.create({})