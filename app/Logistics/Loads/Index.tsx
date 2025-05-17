import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Modal } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { fetchDocuments } from '@/db/operations';
import { Load } from '@/types/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadComponent from '@/components/LoadComponent';
import BottomSheet from '@gorhom/bottom-sheet';

const Index = () => {

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [Loads, setLoads] = useState<Load[]>([])
    const [showfilter, setShowfilter] = useState(false)
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showSheet, setShowSheet] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('background')
    const LoadTructs = async () => {
        const maLoads = await fetchDocuments("Loads");
        console.log(maLoads);

        if (maLoads) {
            setLoads(maLoads.data as Load[])
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
        const result = await fetchDocuments('Loads', 10, lastVisible);
        if (result) {
            setLoads([...Loads, ...result.data as Load[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };
    return (
        <View style={{}} >
            <View style={[styles.container, { backgroundColor: background }]}>
                <View style={{
                    backgroundColor: background,
                    paddingHorizontal: wp(2),
                    paddingVertical: wp(1),
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: wp(1),
                }} >
                    <View>
                        <ThemedText type="title">
                            Loads
                        </ThemedText>
                        <ThemedText type="tiny">Find a Truck for your Load Today</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: wp(2) }}>

                        <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                            <TouchableNativeFeedback onPress={() => setShowfilter(true)}>
                                <View style={{ padding: wp(2) }}>
                                    <Ionicons name={'filter'} size={wp(4)} color={icon} />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </View>

                <FlatList
                    keyExtractor={(item) => item.id.toString()}

                    data={Loads}
                    renderItem={({ item }) => (
                        <LoadComponent item={item} ondetailsPress={() => {
                            setSelectedLoad(item);
                            setShowSheet(true);
                            setTimeout(() => {
                                bottomSheetRef.current?.expand();
                            }, 10);
                        }} />
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
                                    (!lastVisible && Loads.length > 0) ?
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
                {/* Gorhom BottomSheet for details */}
                <BottomSheet
                    ref={bottomSheetRef}
                    index={1}
                    snapPoints={['55%', '80%']}
                    enablePanDownToClose
                    onClose={() => setShowSheet(false)}
                    style={{ backgroundColor: '#fff' }}
                >
                    <View style={{
                        paddingHorizontal: wp(4),
                        paddingVertical: wp(2),
                        flex: 1,
                    }}>
                        <TouchableOpacity
                            onPress={() => bottomSheetRef.current?.close()}
                            style={{ alignSelf: 'flex-end', marginBottom: wp(2) }}
                        >
                            <Ionicons name="close" size={wp(7)} color="#333" />
                        </TouchableOpacity>
                        {selectedLoad ? (
                            <>
                                <ThemedText type="title">{selectedLoad.typeofLoad}</ThemedText>
                                <ThemedText>From: {selectedLoad.location || selectedLoad.location}</ThemedText>
                                <ThemedText>To: {selectedLoad.destination || selectedLoad.destination}</ThemedText>
                                <ThemedText>Rate: {selectedLoad.ratePerTonne}</ThemedText>
                                <ThemedText>Payment Terms: {selectedLoad.paymentTerms}</ThemedText>
                                <ThemedText>Requirements: {selectedLoad.requirements}</ThemedText>
                                <ThemedText>Additional Info: {selectedLoad.additionalInfo}</ThemedText>
                                {/* Add more fields as needed */}
                            </>
                        ) : (
                            <ThemedText>No details available.</ThemedText>
                        )}
                    </View>
                </BottomSheet>
            </View>
        </View>
    )
}

//   {rendereIterms}
//   {!dspLoadMoreBtn && loadsList.length <= 0 && location&&<ThemedText style={{fontSize:19 ,fontWeight:'bold'}} >Do Not Have Local loads </ThemedText> }
//  {!dspLoadMoreBtn && loadsList.length <= 0  && location &&<TouchableOpacity onPress={handleShareApp} >
//    <ThemedText style={{fontSize : 20 , textDecorationLine:'underline'}} >Please share or recommend our app for more loads</ThemedText>
//  </TouchableOpacity>}





// </ScrollView> }

{/* {localLoads && <View style={{alignItems : 'center' , paddingTop : 30}}>
        <TouchableOpacity  onPress={()=>specifyLocation('Zimbabwe')} style={styles.buttonStyleCounry}  >
          <Text style={{color:'#6a0c0c'}}>Zimbabwe </Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={()=> specifyLocation('SouthAfrica') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Namibia') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Tanzania') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>specifyLocation ('Mozambique') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Zambia') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Botswana') } style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> specifyLocation('Malawi') }style={styles.buttonStyleCounry} >
            <Text style={{color:'#6a0c0c'}}>Malawi </Text>
        </TouchableOpacity>
       </View> } */}


//     </View>
//   )

// }
export default React.memo(Index)

const styles = StyleSheet.create({
    container: {
        margin: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})
