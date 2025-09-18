import React from "react"
import { View, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { collection, addDoc, } from 'firebase/firestore';
import { db, } from "@/db/fireBaseConfig";

import { handleChange } from "@/Utilities/utils";

import Input from "@/components/Input";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useThemeColor } from '@/hooks/useThemeColor'
import Heading from "@/components/Heading";
import { wp } from "@/constants/common";
import { Ionicons } from "@expo/vector-icons";

function ApplyGit({ }) {
  const backgroundLight = useThemeColor("backgroundLight");
  const accent = useThemeColor("accent");
  const background = useThemeColor("background");
  const [formData, setFormData] = React.useState({
    noOfTrucks: "",
    productsTransported: "",
    valueOProductsRange: "",
    tripNumRangeMonth: "",
    localOSADC: "",

  });


  const [spinnerItem, setSpinnerItem] = React.useState(false);

  const gitCollection = collection(db, "gitCutsomer");
  async function handleSubmit() {
    setSpinnerItem(true)
    try {
      const docRef = await addDoc(gitCollection, {
        ...formData
      });

      setFormData({
        noOfTrucks: "",
        productsTransported: "",
        valueOProductsRange: "",
        tripNumRangeMonth: "",
        localOSADC: "",
      });

    } catch (err) {
      setSpinnerItem(false)
      // setError(err.toString());
    }
  }

  const [dspInfo, setDspInfo] = React.useState(true)
  return (
    <ScreenWrapper>
      <Heading page="Apply Git" />

      <View style={{ margin: wp(4) }} >

        {dspInfo && <View style={{}} >
          <ThemedText style={{ textAlign: 'center', marginBottom: wp(8) }} type="title">Please Note</ThemedText>
          <ThemedText style={{ textAlign: 'center', marginBottom: wp(8) }}>We are a third part providing Insuarance on behalf of the business we list below and by going on you agree to our terms and conditions</ThemedText>
          {/* <View>
            <ThemedText>Agree</ThemedText>
          </View> */}
        </View>}


        <ThemedText style={{ fontWeight: 'bold' }}>
          <Ionicons name="information-circle-outline" size={wp(4)} />
          {'  '}
          Please provide a rough estimate for the following question.</ThemedText>
        <ThemedText style={{ marginTop: 9, fontStyle: 'italic', color: "gray" }}>If possible, include a range (e.g., 10 - 20).</ThemedText>

        <Input
          value={formData.noOfTrucks}
          placeholder="Number of trucks you own"
          onChangeText={(text) => handleChange(text, 'noOfTrucks', setFormData)}
          keyboardType="numeric"
        />

        <Input
          value={formData.productsTransported}
          placeholder="Type of products transported"
          onChangeText={(text) => handleChange(text, 'productsTransported', setFormData)}
        />


        <Input
          value={formData.valueOProductsRange}
          placeholder="Estimated value of products"
          onChangeText={(text) => handleChange(text, 'valueOProductsRange', setFormData)}
        />

        <Input
          value={formData.tripNumRangeMonth}
          placeholder="Number of completed trips per month"
          onChangeText={(text) => handleChange(text, 'tripNumRangeMonth', setFormData)}
        />

        <Input
          value={formData.localOSADC}
          placeholder="Do you operate within the SADC region? (Yes/No)"
          onChangeText={(text) => handleChange(text, 'localOSADC', setFormData)}
        />
        {spinnerItem && <ActivityIndicator size={36} />}
        {!spinnerItem ?
          <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: accent, borderRadius: wp(4), padding: wp(3) }}>
            <ThemedText style={{ color: 'white', textAlign: 'center' }}>submit</ThemedText>
          </TouchableOpacity>
          : <ThemedText style={{ alignSelf: "center", fontStyle: 'italic' }}>Information being submited. Please wait</ThemedText>
        }
      </View>
    </ScreenWrapper>
  )
}
export default React.memo(ApplyGit)