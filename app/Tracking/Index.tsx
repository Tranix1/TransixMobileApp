import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, TouchableNativeFeedback,ActivityIndicator,RefreshControl,StyleSheet} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import Heading from "@/components/Heading";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';
import {  Ionicons,  } from '@expo/vector-icons';

interface Device {
  id: string; 
  name: string;
  status?: string;
}

export default function Index() {
        const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')


  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    
const [filteredPNotAavaialble ,setFilteredPNotAavaialble ] = React.useState(false)
    const LoadTructs = async () => {
      let filters: any[] = [];
        const maLoads = await fetchDocuments("TrackedVehicles");

        if (maLoads.data.length) {

            if(filters.length > 0 && maLoads.data.length < 0 )setFilteredPNotAavaialble(true)
            setDevices(maLoads.data as Device[])
            setLastVisible(maLoads.lastVisible)
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

        }
    };

    const loadMoreLoads = async () => {

        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        const result = await fetchDocuments('Cargo', 10, lastVisible);
        if (result) {
            setDevices([...devices, ...result.data as Device[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };



//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//           <ActivityIndicator size="large" />
//           <ThemedText>Loading devices...</ThemedText>
//         </View>
//       </ScreenWrapper>
//     );
//   }

  return (
    <ScreenWrapper>

           <Heading page='Tracking' rightComponent={
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: wp(3) }}>
                  <View>
                    <TouchableNativeFeedback onPress={() => router.push('/Tracking/AddTrackedVehicle')}>
                      <ThemedText style={{ alignSelf: 'flex-start' }}>Add Draft</ThemedText>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              } />
     
<FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{}}
                data={devices}
                renderItem={({ item }) => (
                     <TouchableOpacity
            style={{
              padding: 7,
              marginVertical: 8,
              marginHorizontal: 16,
              borderRadius: 8
            }}
            onPress={() => router.push({ pathname: "/Tracking/Map", params: { deviceId: 93192} })}
          >
            <ThemedText>First Device</ThemedText>
            <ThemedText>Subscirbed</ThemedText>
          </TouchableOpacity>
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
                ListEmptyComponent={
                 <View style={styles.emptyContainer}>
                           {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                Vehicles Loading…
                            </ThemedText>}
                            
                           {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                                Please Wait
                            </ThemedText>}
                           {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                               Specified Vehicle Not Available!
                            </ThemedText>}
                           {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                                pull to refresh
                            </ThemedText>}
                        </View>
                }
                ListFooterComponent={
                    <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                        {
                            loadingMore ?
                                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                    <ActivityIndicator size="small" color={accent} />
                                </View>
                                :
                                (!lastVisible && devices.length > 0) ?
                                    <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                        <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more Loads to Load
                                        </ThemedText>
                                        <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />

                                    </View>
                                    : null
                        }

                    </View>
                }
            />


    </ScreenWrapper>
  );
}


const styles = StyleSheet.create({
    container: {
        padding: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }, detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(1),
    },
      contactOptions: {
        paddingVertical: wp(4),
        flexDirection: 'row',
        gap: wp(5),
        marginTop: 'auto',
        justifyContent: 'space-around'
    },
    contactOption: {
        alignItems: 'center'
    },
    contactButton: {
        height: wp(12),
        width: wp(12),
        borderRadius: wp(90),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(1)
    },
    ownerActions: {
        paddingVertical: wp(4),
        flexDirection: 'row',
        gap: wp(5),
        marginTop: 'auto'
    },    emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    },  emptyText: {
        textAlign: 'center'
    },   emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center'
    },
})


