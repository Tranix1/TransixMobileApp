
import React, { useEffect } from "react";

import { View, Text, TouchableOpacity, ScrollView ,StyleSheet, Image, FlatList } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { fetchDocuments } from "@/db/operations";

import { Contracts } from '@/types/types'

import { router } from "expo-router";

function LoadsContracts({  }) {


  const [contractLoc, setContraLoc] = React.useState(null)
  const [getContracts, setGetContracts] = React.useState<Contracts[] | null>(null)
    

  const [dspLoadMoreBtn, setLoadMoreBtn] = React.useState(true)
  const [LoadMoreData, setLoadMoreData] = React.useState(false)


    const LoadTructs = async () => {

        const maTrucks = await fetchDocuments("loadsContracts");
        
        if (maTrucks) {

            setGetContracts(maTrucks as Contracts[]);

        }

    }
    useEffect(() => {
        LoadTructs();
    }, [])

  console.log(getContracts)
  

  

  return (
    <View style={{ paddingTop: 89, padding: 10 }} >

           

      {<FlatList  data={getContracts}   renderItem={({ item }) => (
                         <View
//   key={item.id}
  style={{
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6a0c0c',
    borderRadius: 12,
    shadowColor: '#6a0c0c',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Android shadow
  }}
>
  <Text
    style={{
      color: '#6a0c0c',
      fontWeight: 'bold',
      fontSize: 22,
      textAlign: 'center',
      marginBottom: 5,
    }}
  >
    9 Months Contract Available
  </Text>
<Text>{item.formDataScnd.contractDuration} </Text>
  <Text
    style={{
      fontStyle: 'italic',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#444',
    }}
  >
    Trucks Left: 10
  </Text>

  <View style={{ marginBottom: 10 }}>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Commodity:</Text> Maize
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Solid Rate:</Text> 12,000 per km
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Links:</Text> 12,000 per km
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Triaxle:</Text> 12,000 per km
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Superlink:</Text> 12,000 per km
    </Text>
  </View>

  <TouchableOpacity
    style={{
      backgroundColor: '#9c2828',
      width: '80%',
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 8,
    }}
    onPress={() =>
  router.push({
    pathname: '/Logistics/Contracts/ViewContractDetails',
    params: {
      item: JSON.stringify(item),
    },
  })
}
    
  >
    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
      View More Info
    </Text>
  </TouchableOpacity>
</View>

                    )} /> }

    </View>
  )
}
export default React.memo(LoadsContracts)


const styles = StyleSheet.create({

});