import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchDocuments } from "@/db/operations";
import { Contracts } from '@/types/types'
import { router } from "expo-router";
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore'
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from "@/constants/common";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import Entypo from '@expo/vector-icons/Entypo';
import { Countries } from "@/types/types";

import { useLocalSearchParams } from 'expo-router'
function LoadsContracts() {


  const { userId, organisationName } = useLocalSearchParams();

  const [selectedCountry, setSelectedCountry] = useState<string[]>([])

  const [contractLoc, setContraLoc] = React.useState(null)
  const [getContracts, setGetContracts] = React.useState<Contracts[]>([])


  const [refreshing, setRefreshing] = useState(false)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const accent = useThemeColor('accent')
  const coolGray = useThemeColor('coolGray')
  const icon = useThemeColor('icon')
  const background = useThemeColor('background')
  const backgroundColor = useThemeColor('backgroundLight')
  const backgroundLight = useThemeColor('backgroundLight')
  const textColor = useThemeColor('text')

  const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)

  const LoadTructs = async () => {
    let filters: any[] = [];
    if (userId) filters.push(where("userId", "==", userId));
    if (selectedCountry.length > 0) filters.push(where("contractLocation", "array-contains-any", selectedCountry));
    const maTrucks = await fetchDocuments("loadsContracts", 10, undefined, filters);


    let trucksToSet: Contracts[] = [];
    if (maTrucks) {




      if (filters.length > 0 && maTrucks.data.length < 0) setFilteredPNotAavaialble(true)


      if (filters.length > 0 && maTrucks.data.length <= 0) setFilteredPNotAavaialble(true)

      // If locationTruckS is true, we need to do the client-side filtering for ALL selected countries
      if (selectedCountry.length > 0) {
        trucksToSet = (maTrucks.data as Contracts[]).filter(truck =>
          selectedCountry.every(country => truck.contractLocation?.includes(country))
        );
      } else {
        // Otherwise, use the data as fetched (which would be filtered only by truck properties)
        trucksToSet = maTrucks.data as Contracts[];
      }


      setGetContracts(trucksToSet);
      setLastVisible(maTrucks.lastVisible)
    }
  }

  useEffect(() => {
    LoadTructs();
  }, [selectedCountry])

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await LoadTructs();
      setRefreshing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMoreLoads = async () => {
    if (loadingMore || !lastVisible) return;

    let filters: any[] = [];
    setLoadingMore(true);
    if (selectedCountry.length > 0) filters.push(where("contractLocation", "array-contains-any", selectedCountry));

    const result = await fetchDocuments('loadsContracts', 10, lastVisible, filters);
    if (result) {
      let newTrucks = result.data as Contracts[];

      // Apply client-side filtering for "must include all selected countries"
      if (selectedCountry.length > 0) {
        newTrucks = newTrucks.filter(truck =>
          selectedCountry.every(country => truck.contractLocation?.includes(country))
        );
      }
      setGetContracts([...getContracts, ...result.data as Contracts[]]);
      setLastVisible(result.lastVisible);
    }
    setLoadingMore(false);
  };

  const renderContractItem = ({ item }: { item: Contracts }) => (
    <View style={{
      marginBottom: wp(3),
      padding: wp(4),
      backgroundColor: background,
      borderWidth: 1,
      borderColor: coolGray,
      borderRadius: wp(4),
      shadowColor: accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), marginBottom: wp(2) }}>
        <View style={{ backgroundColor: accent + '20', borderRadius: wp(2), padding: wp(1.5) }}>
          <Ionicons name='document-text' color={accent} size={wp(4)} />
        </View>
        <ThemedText type='subtitle' color={accent} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
          {item.formDataScnd?.contractDuration || '9 Months'} Contract Available
        </ThemedText>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: wp(2), }}>

        <ThemedText type='default' style={{ color: icon }}>
          Trucks Left: {item.formDataScnd?.trucksRequiredNum || '10'}
        </ThemedText>
        <TouchableOpacity onPress={() => router.push({ pathname: "/Logistics/Trucks/Index", params: { userId: null, organisationName: "UUsername", contractName: "ContractName", contractId: "contractId" } })} style={{ paddingHorizontal: wp(4), paddingVertical: wp(1), backgroundColor: backgroundLight, borderRadius: wp(3), flexDirection: 'row', gap: wp(2), alignItems: 'center' }} >
          <ThemedText color='#fff'> 3 Booked View</ThemedText>
        </TouchableOpacity>
      </View>
      <View
        style={{
          marginBottom: wp(3),
          borderWidth: 1,
          borderColor: coolGray,
          borderRadius: wp(2),
          overflow: 'hidden',
          backgroundColor: backgroundColor,
        }}
      >
        {/* Table Header */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: accent + '10',
            paddingVertical: wp(2),
            paddingHorizontal: wp(2),
          }}
        >
          <ThemedText
            type="defaultSemiBold"
            style={{ flex: 1, color: accent, fontWeight: 'bold', fontSize: wp(3.7) }}
          >
            Commodity
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{ flex: 1, color: accent, fontWeight: 'bold', fontSize: wp(3.7), textAlign: 'right' }}
          >
            Rate
          </ThemedText>
        </View>
        {/* Table Rows */}

        {(['frst', 'scnd', 'thrd', 'forth'] as Array<'frst' | 'scnd' | 'thrd' | 'forth'>).map((key, idx) => {
          const commodityKey = key === 'thrd' ? 'third' : key; // commodity uses 'third'

          const commodity = item.formData.commodity?.[commodityKey];
          const rate = item.formData.rate[key];

          if (!commodity && !rate) return null;
          return (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                backgroundColor: idx % 2 === 0 ? background : backgroundColor,
                paddingVertical: wp(2),
                paddingHorizontal: wp(2),
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: coolGray + '30',
                alignItems: 'center',
              }}
            >
              <ThemedText
                type="default"
                style={{
                  flex: 1,
                  color: icon,
                  fontSize: wp(3.7),
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {commodity ? commodity : <ThemedText type="tiny" style={{ color: coolGray }}>—</ThemedText>}
              </ThemedText>
              <ThemedText
                type="default"
                style={{
                  flex: 1,
                  color: icon,
                  fontSize: wp(3.7),
                  textAlign: 'right',
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {rate ? rate : <ThemedText type="tiny" style={{ color: coolGray }}>—</ThemedText>}
              </ThemedText>
            </View>
          );
        })}
      </View>

{/* {item.contractLocation.length > 0 && <ThemedText>{item.contractLocation?.join (', ')  } </ThemedText>} */}
<View style={{flexDirection:'row'}}>

  <Entypo name="location-pin" size={17} color={icon} style={{marginRight:6}} />
<ThemedText type="subtitle" style={{ marginBottom: wp(4) ,fontSize:16}}>
  {item.contractLocation?.join(', ') || '--'}
</ThemedText>
</View>

      <TouchableOpacity
        style={{
          backgroundColor: '#0f9d5820',
          padding: wp(3),
          borderRadius: wp(2),
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: wp(2)
        }}
        onPress={() =>
          router.push({
            pathname: '/Logistics/Contracts/ViewContractDetails',
            params: {
              ContractItemG: encodeURIComponent(JSON.stringify(item)),
            },
          })
        }
      >
        <ThemedText style={{ color: accent, fontWeight: 'bold' }}>
          View More Info
        </ThemedText>
        <Ionicons name='chevron-forward' color={accent} size={wp(4)} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <Heading page='Contracts' />



      <View style={{ marginVertical: wp(2) }}>


        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: wp(3) }} contentContainerStyle={{
          paddingHorizontal: wp(2),
          gap: wp(2),
        }}>


          {Countries.map(item => {
            const active = selectedCountry.some(x => x === item);

            return (
              <TouchableOpacity
                key={item}
                onPress={() => active ? setSelectedCountry(selectedCountry.filter(x => x !== item)) : setSelectedCountry([...selectedCountry, item])}
                style={{
                  backgroundColor: active ? accent : backgroundLight,
                  borderColor: accent ? accent : coolGray,
                  borderWidth: 1,
                  paddingVertical: wp(0.1),
                  marginLeft: wp(2),
                  borderRadius: wp(2),
                  paddingHorizontal: wp(3),
                  marginRight: wp(1),
                  shadowColor: active ? accent : '#000',
                  shadowOpacity: active ? 0.15 : 0.05,
                  shadowRadius: 4,
                  elevation: active ? 2 : 0,
                }}
              >
                <ThemedText style={{
                  color: active ? 'white' : textColor,
                  fontSize: wp(3.5),
                }} type="defaultSemiBold">{item}</ThemedText>
              </TouchableOpacity>
            );
          })}

        </ScrollView>

      </View>



      <FlatList
        keyExtractor={(item) => item.id.toString()}
        data={getContracts}
        renderItem={renderContractItem}
        contentContainerStyle={{ padding: wp(4) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[accent]}
          />
        }
        onEndReached={loadMoreLoads}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              Contracts Loading…
            </ThemedText>}

            {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              Please Wait
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
              Specified Contract Not Available!
            </ThemedText>}
            {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
              pull to refresh
            </ThemedText>}
          </View>
        }
        ListFooterComponent={
          <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
            {loadingMore ? (
              <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                <ActivityIndicator size="small" color={accent} />
              </View>
            ) : (!lastVisible && getContracts.length > 0) ? (
              <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>
                  No more Contracts to Load
                </ThemedText>
                <Ionicons color={icon} name='alert-circle-outline' size={wp(6)} />
              </View>
            ) : null}
          </View>
        }
      />
    </ScreenWrapper>
  );
}

export default React.memo(LoadsContracts);

const styles = StyleSheet.create({


  emptySubtext: {
    textAlign: 'center',
    marginTop: wp(2)
  }, emptyText: {
    textAlign: 'center'
  }, emptyContainer: {
    minHeight: hp(80),
    justifyContent: 'center'
  },
})