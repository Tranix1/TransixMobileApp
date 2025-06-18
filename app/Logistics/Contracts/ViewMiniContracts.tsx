import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchDocuments } from "@/db/operations";
import { Contracts } from '@/types/types'
import { router } from "expo-router";
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from "@/constants/common";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";

function LoadsContracts() {
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
    setLoadingMore(true);
    const result = await fetchDocuments('loadsContracts', 10, lastVisible);
    if (result) {
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

      <ThemedText type='default' style={{ marginBottom: wp(2), color: icon }}>
        Trucks Left: {item.formDataScnd?.trucksLeft || '10'}
      </ThemedText>

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
        {(['frst', 'scnd', 'third', 'forth'] as Array<'frst' | 'scnd' | 'third' | 'forth'>).map((key, idx) => {
          const commodity = item.formData.commodity?.[key];
          const rate =
            key === 'third'
              ? item.formData.rate.thrd
              : item.formData.rate[key];
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
          <View style={{ minHeight: hp(80), justifyContent: 'center' }}>
            <ThemedText type='defaultSemiBold' style={{ textAlign: 'center' }}>
              No Contracts to Display!
            </ThemedText>
            <ThemedText type='tiny' style={{ textAlign: 'center', marginTop: wp(2) }}>
              pull to refresh
            </ThemedText>
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