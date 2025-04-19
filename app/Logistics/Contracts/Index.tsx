import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'

import { router } from "expo-router";
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';

import { Countries } from '@/types/types';
const Index = () => {

  const [contractLoc, setContraLoc] = React.useState<string>("")
    return (
        //Use screenwrapper and Heading every time you create a new page!!!!!!!!!!!!!
        <ScreenWrapper>

            <Heading page='Contracts' />

            <TouchableOpacity onPress={() => router.push('/Logistics/Contracts/AddContracts/Index')} >
                <ThemedText style={{color:'red'}} >Add Contract</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>router.push("/Logistics/Contracts/ViewContracts/Index") } >
                <ThemedText  > View </ThemedText>
            </TouchableOpacity>


             {Countries.map((country) => (
                <TouchableOpacity
                key={country}
                onPress={() => setContraLoc(country)}
                style={styles.buttonStyle}
                >
                <ThemedText style={styles.buttonText}>{country}</ThemedText>
                </TouchableOpacity>
            ))}

            <TouchableOpacity>
                <ThemedText>Controctor</ThemedText>
            </TouchableOpacity>







        </ScreenWrapper>

    )
}

export default Index

const styles = StyleSheet.create({
      buttonStyle: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#6a0c0c',
    borderRadius: 6,
    backgroundColor: '#fff4f0',
  },
    buttonText: {
    color: '#6a0c0c',
    fontSize: 15,
    fontWeight: '600',
  },
})