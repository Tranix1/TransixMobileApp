import React from "react"
import {View , TouchableOpacity ,  StyleSheet , ScrollView , ActivityIndicator  } from "react-native"
import { collection,  addDoc, } from 'firebase/firestore';
import { db, } from "../../components/config/fireBase";

import { handleChange } from "@/Utilities/utils";

import Input from "@/components/Input";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useThemeColor } from '@/hooks/useThemeColor'

function ApplyGit({}){
        const background = useThemeColor("background");
  const [formData, setFormData] = React.useState({
  noOfTrucks:"",
  productsTransported :"",
  valueOProductsRange :"",
  tripNumRangeMonth:"",
  localOSADC:"" ,

  });

  
    const [spinnerItem, setSpinnerItem] = React.useState(false);

  const gitCollection = collection(db, "gitCutsomer");
async function handleSubmit(){
      setSpinnerItem(true)
  try {
      const docRef = await addDoc(gitCollection, {
        ...formData 
      });

      setFormData({
        noOfTrucks:"",
        productsTransported :"",
        valueOProductsRange :"",
        tripNumRangeMonth:"",
        localOSADC:"" ,
      });
   
    } catch (err) {
      setSpinnerItem(false)
      // setError(err.toString());
      }
}

    const [dspInfo , setDspInfo]=React.useState(true)
return(
  <ScreenWrapper>

    <View style={{alignItems:'center',marginTop:10}} >

           {dspInfo && <View  style={{position:"absolute", top:0 , left:0 , right:0 , bottom:0 , zIndex:10 , backgroundColor:background}} >
    <ThemedText>Please Note</ThemedText>
    <ThemedText>We are a third part providing Insuarance on behalf of the business we list below and by going on u agree to our terms and conditions</ThemedText>
    <View>
      <ThemedText>Agree</ThemedText>
    </View>
  </View>}


    <ThemedText style={{  fontWeight: 'bold', }}>Please provide a rough estimate for the following question.</ThemedText>
    <ThemedText style={{ marginTop:9 , fontStyle:'italic' , color : "gray"}}>If possible, include a range (e.g., 10 - 20).</ThemedText>

        <Input 
  value={formData.noOfTrucks}
  placeholderTextColor="#6a0c0c"
  placeholder="Number of trucks you own"
  onChangeText={(text) => handleChange(text, 'noOfTrucks',setFormData)}
  keyboardType="numeric"              
/>

<Input 
  value={formData.productsTransported}
  placeholderTextColor="#6a0c0c"
  placeholder="Type of products transported"
  onChangeText={(text) => handleChange(text, 'productsTransported',setFormData)}
/>

{spinnerItem && <ActivityIndicator size={36} />}

<Input 
  value={formData.valueOProductsRange}
  placeholderTextColor="#6a0c0c"
  placeholder="Estimated value of products"
  onChangeText={(text) => handleChange(text, 'valueOProductsRange',setFormData)}
/>

<Input 
  value={formData.tripNumRangeMonth}
  placeholderTextColor="#6a0c0c"
  placeholder="Number of completed trips per month"
  onChangeText={(text) =>handleChange (text, 'tripNumRangeMonth',setFormData)}
/>

<Input 
  value={formData.localOSADC}
  placeholderTextColor="#6a0c0c"
  placeholder="Do you operate within the SADC region? (Yes/No)"
  onChangeText={(text) =>handleChange (text, 'localOSADC',setFormData)}
/>
          {!spinnerItem ?  <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <ThemedText style={{color : 'white'}}>submit</ThemedText>
  </TouchableOpacity>
: <ThemedText style={{alignSelf:"center",fontStyle:'italic'}}>Information being submited. Please wait</ThemedText>  
}
    </View>
  </ScreenWrapper>
)
}
export default React.memo(ApplyGit)