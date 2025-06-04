import { StyleSheet, View, TouchableOpacity, TouchableNativeFeedback } from 'react-native'
import React from 'react'

import { router } from "expo-router";
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';

import { Countries } from '@/types/types';
import { wp } from '@/constants/common';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
const Index = () => {


  const icon = useThemeColor('icon')
  return (
    //Use screenwrapper and Heading every time you create a new page!!!!!!!!!!!!!
    <ScreenWrapper>

      <Heading page='Contracts' rightComponent={

        <View style={{ flexDirection: 'row', marginRight: wp(4) }}>
          <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
            <TouchableNativeFeedback onPress={() => router.push('/Logistics/Contracts/NewContract')} >
              <View style={{ padding: wp(2), justifyContent: 'center' }}>
                <AntDesign name="addfile" color={icon} size={wp(5)} />
              </View>
            </TouchableNativeFeedback>
          </View>

        </View>

      } />



      <TouchableOpacity onPress={() => router.push("/Logistics/Contracts/ViewMiniContracts")} >
        <ThemedText  > View </ThemedText>
      </TouchableOpacity>


      {/* {Countries.map((country) => (
        <TouchableOpacity
          key={country}
          onPress={() => setContraLoc(country)}
          style={styles.buttonStyle}
        >
          <ThemedText style={styles.buttonText}>{country}</ThemedText>
        </TouchableOpacity>
      ))} */}

      {/* <TouchableOpacity>
        <ThemedText>Controctor</ThemedText>
      </TouchableOpacity> */}







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