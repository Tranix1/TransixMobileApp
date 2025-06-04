
import React, { useEffect, useState } from "react";

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, FlatList, RefreshControl, ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { fetchDocuments } from "@/db/operations";

import { Contracts } from '@/types/types'

import { router } from "expo-router";

import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'


import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from "@/constants/common";
import ScreenWrapper from "@/components/ScreenWrapper";
function LoadsContracts({ }) {


  const [contractLoc, setContraLoc] = React.useState(null)
  const [getContracts, setGetContracts] = React.useState<Contracts[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showfilter, setShowfilter] = useState(false)



  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')
  const background = useThemeColor('background')



  const LoadTructs = async () => {

    const maTrucks = await fetchDocuments("loadsContracts", 10, lastVisible);

    if (maTrucks) {

      setGetContracts(maTrucks.data as Contracts[]);

      setLastVisible(maTrucks.lastVisible)
    }

  }
  useEffect(() => {
    LoadTructs();
  }, [])

  console.log(getContracts)

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await LoadTructs();
      setRefreshing(false);

    } catch (error) {

    }
  };

  const loadMoreLoads = async () => {

    if (loadingMore || !lastVisible) return;
    setLoadingMore(true);
    const result = await fetchDocuments('loadsContracts', 10, lastVisible);
    if (result) {
      setGetContracts([...getContracts, ...result.data as Contracts[]]);
      setLastVisible(result.lastVisible);
    }
    setLoadingMore(false);
  };

  return (
    <ScreenWrapper>

    <View style={{ paddingTop: 89, padding: 10 }} >
      <Text>hiiii</Text>


 


      <FlatList
        keyExtractor={(item) => item.id.toString()}

        data={getContracts}
        renderItem={({ item }) => (
          // <LoadComponent item={item} />
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
            <TouchableOpacity>

            </TouchableOpacity>
            {/* <Text>{item.formDataScnd.contractDuration} </Text> */}
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

              <TouchableOpacity onPress={()=>router.push( {pathname :"/Logistics/Trucks/Index", params :{ userId: null , organisationName:"UUsername",contractName :"ContractName",contractId:"contractId"  }} )}>
                <Text>Booked 10 View</Text>
              </TouchableOpacity>

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
                    itemG: encodeURIComponent(JSON.stringify(item)), // key is "itemG"
                  },
                })
              }

            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                View More Info
              </Text>
            </TouchableOpacity>
          </View>

        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreLoads}
        onEndReachedThreshold={.5}
        ListEmptyComponent={<View style={{ minHeight: hp(80), justifyContent: 'center' }}>

          <ThemedText type='defaultSemiBold' style={{ textAlign: 'center' }}>
            No Loads to Display!
          </ThemedText>
          <ThemedText type='tiny' style={{ textAlign: 'center', marginTop: wp(2) }}>
            pull to refresh
          </ThemedText>
        </View>}
        ListFooterComponent={
          <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
            {
              loadingMore ?
                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                  <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                  <ActivityIndicator size="small" color={accent} />
                </View>
                :
                (!lastVisible && getContracts.length > 0) ?
                  <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more Trucks to Load
                    </ThemedText>
                    <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />

                  </View>
                  : null
            }

          </View>
        }
        />






    </View>
</ScreenWrapper>
  )
}
export default React.memo(LoadsContracts)


const styles = StyleSheet.create({

});