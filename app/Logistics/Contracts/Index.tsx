import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

import { router } from "expo-router";
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';

const Index = () => {
    return (
        //Use screenwrapper and Heading every time you create a new page!!!!!!!!!!!!!
        <ScreenWrapper>

            <Heading page='Contracts' />

            <TouchableOpacity onPress={() => router.push('/Logistics/Contracts/AddContracts/Index')} >
                <Text>Add Contract</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text> View </Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>Controctor</Text>
            </TouchableOpacity>

        </ScreenWrapper>

    )
}

export default Index

const styles = StyleSheet.create({})