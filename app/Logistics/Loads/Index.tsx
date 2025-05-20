import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Modal, Linking } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { fetchDocuments } from '@/db/operations';
import { Load } from '@/types/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FlatList } from 'react-native';
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import LoadComponent from '@/components/LoadComponent';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Input from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import { router } from 'expo-router';
import { formatCurrency, formatDate } from '@/services/services';

const Index = () => {

    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [Loads, setLoads] = useState<Load[]>([

    ])
    const [showfilter, setShowfilter] = useState(false)
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showSheet, setShowSheet] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [expandId, setExpandID] = useState('');
    const [bidRate, setBidRate] = useState('');
    const [bidLinks, setBidLinks] = useState('');
    const [bidTriaxle, setBidTriaxle] = useState('');
    const [bottomMode, setBottomMode] = useState<'Bid' | 'Book' | ''>('');

    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('background')
    const textColor = useThemeColor('text')
    const LoadTructs = async () => {
        const maLoads = await fetchDocuments("Loads");
        console.log(maLoads);

        if (maLoads.data.length) {
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

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop  {...props} opacity={0.05} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    );


    function toggleCurrencyBid() {
        // setCurrencyBid((prev) => !prev);
    }

    function togglePerTonneBid() {
        // setPerTonneBid((prev) => !prev);
    }



    return (

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
                    <LoadComponent item={item} expandID={expandId} expandId={(s) => setExpandID(s)} ondetailsPress={() => {
                        console.log(item.userId);

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
                index={-1}
                enablePanDownToClose
                onClose={() => { setShowSheet(false); setBottomMode('') }}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: background }}
                containerStyle={{ marginBottom: wp(14) }}
                handleStyle={{ borderTopEndRadius: wp(5), borderTopStartRadius: wp(5) }}
            >
                <BottomSheetView>

                    <View style={{
                        paddingHorizontal: wp(4),
                        paddingVertical: wp(2),

                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
                            {selectedLoad &&
                                <ThemedText type="subtitle">{selectedLoad.companyName}</ThemedText>
                            }
                            <TouchableOpacity
                                onPress={() => bottomSheetRef.current?.close()}
                                style={{ margin: wp(2) }}
                            >
                                <AntDesign name="close" size={wp(4)} color={icon} />
                            </TouchableOpacity>
                        </View>
                        {selectedLoad ? (
                            <>
                                {bottomMode === '' &&
                                    <View style={{ padding: wp(2), borderWidth: .5, borderRadius: wp(6), borderColor: backgroundLight }}>
                                        <View style={[styles.detailRow, { backgroundColor: backgroundLight, paddingHorizontal: wp(2), borderRadius: wp(2) }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>

                                                <View style={{ gap: wp(1), flex: 2, }}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Commodity
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
                                                        {selectedLoad.typeofLoad}
                                                    </ThemedText>
                                                </View>
                                                <View style={{ gap: wp(1), flex: 2, }}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Posted
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
                                                        {formatDate(selectedLoad.created_at)}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.detailRow, { backgroundColor: backgroundLight, paddingHorizontal: wp(2), borderRadius: wp(2) }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>

                                                <View style={{ gap: wp(1), flex: 2, }}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        From
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
                                                        {selectedLoad.location}
                                                    </ThemedText>
                                                </View>
                                                <View style={{ gap: wp(1), flex: 2, }}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        To
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
                                                        {selectedLoad.destination}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>

                                        {selectedLoad.distance && (
                                            <View style={[styles.detailRow, { backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }]}>
                                                <ThemedText type='default' style={{ flex: 2 }}>
                                                    Estimated Distance
                                                </ThemedText>
                                                <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                                                    {selectedLoad.distance} km
                                                </ThemedText>
                                            </View>
                                        )}
                                        {selectedLoad.distance && (
                                            <View style={[styles.detailRow, { backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }]}>
                                                <ThemedText type='default' style={{ flex: 2 }}>
                                                    Rate Per Tonne
                                                </ThemedText>
                                                <ThemedText type='subtitle' style={[{ color: textColor, fontSize: wp(4.5), lineHeight: wp(5), flex: 2 }]}>
                                                    {formatCurrency(selectedLoad.ratePerTonne ? selectedLoad.ratePerTonne : selectedLoad.links ? selectedLoad.links : selectedLoad.triaxle)}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                }
                                {bottomMode === 'Bid' &&
                                    <View style={[{
                                        borderColor: accent, borderWidth: .5, padding: wp(2), borderRadius: wp(6),
                                    }]}>
                                        <View style={{ gap: wp(2) }}>
                                            <ThemedText type='subtitle' color={coolGray} style={{ textAlign: 'center' }}>
                                                Bid
                                            </ThemedText>
                                            {
                                                selectedLoad.ratePerTonne && (
                                                    <View style={{}}>
                                                        <TouchableOpacity onPress={toggleCurrencyBid}>
                                                            <ThemedText >
                                                                Bid Rate ({true ? "USD" : "RAND"})
                                                            </ThemedText>
                                                        </TouchableOpacity>

                                                        <Input
                                                            onChangeText={(text) => setBidRate(text)}
                                                            value={bidRate}
                                                            keyboardType="numeric"
                                                            placeholderTextColor={coolGray}
                                                            placeholder="Bid rate"
                                                        />

                                                        {/* <TouchableOpacity onPress={togglePerTonneBid}>
                                                        <ThemedText >
                                                            Per tonne
                                                        </ThemedText>
                                                    </TouchableOpacity> */}
                                                    </View>
                                                )
                                            }

                                            {(selectedLoad.links || selectedLoad.triaxle) && (
                                                <View>
                                                    {selectedLoad.links && (
                                                        <View style={{}}>
                                                            <TouchableOpacity onPress={toggleCurrencyBid}>
                                                                <ThemedText >
                                                                    Bid Links Rate ({true ? "USD" : "RAND"})
                                                                </ThemedText>
                                                            </TouchableOpacity>

                                                            <Input
                                                                onChangeText={(text) => setBidLinks(text)}
                                                                value={bidLinks}
                                                                keyboardType="numeric"
                                                                placeholderTextColor={coolGray}
                                                                placeholder="Bid Links rate"
                                                            />

                                                            {/* <TouchableOpacity onPress={togglePerTonneBid}>
                                                            <ThemedText >
                                                                Per tonne
                                                            </ThemedText>
                                                        </TouchableOpacity> */}
                                                        </View>
                                                    )}

                                                    {selectedLoad.triaxle && (
                                                        <View style={{}}>
                                                            <TouchableOpacity onPress={toggleCurrencyBid}>
                                                                <ThemedText >
                                                                    Bid triaxle Rate ({true ? "USD" : "RAND"})
                                                                </ThemedText>
                                                            </TouchableOpacity>

                                                            <Input
                                                                onChangeText={(text) => setBidTriaxle(text)}
                                                                value={bidTriaxle}
                                                                keyboardType="numeric"
                                                                placeholderTextColor={coolGray}
                                                                placeholder="Bid triaxle rate"
                                                            />

                                                            {/* <TouchableOpacity
                                                            onPress={togglePerTonneBid}>
                                                            <ThemedText>
                                                                Per tonne
                                                            </ThemedText>
                                                        </TouchableOpacity> */}
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                            <TouchableOpacity
                                                onPress={() => setBottomMode('')}
                                                style={[{ backgroundColor: coolGray, flex: 2, padding: wp(3), borderRadius: wp(4), alignItems: 'center' }]}
                                            >
                                                <ThemedText style={{ color: 'white' }}>Cancel</ThemedText>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                // onPress={() => handleSubmit(item, "biddings" as 'biddings')} { text: '#0f9d58', bg: '#0f9d5824' }
                                                style={[{ backgroundColor: '#0f9d5824', flex: 2, padding: wp(3), borderRadius: wp(4), alignItems: 'center' }]}
                                            >
                                                <ThemedText style={{ color: '#0f9d58' }}>Send</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }

                                {bottomMode === '' &&
                                    <>
                                        <View>
                                            <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: coolGray, padding: wp(3), borderRadius: wp(4) }} onPress={() => setBottomMode('Book')}>
                                                <ThemedText color='white'>
                                                    Book Load
                                                </ThemedText>
                                            </TouchableOpacity>

                                        </View>
                                        <View>
                                            <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: coolGray, padding: wp(3), borderRadius: wp(4) }} onPress={() => setBottomMode('Bid')}>
                                                <ThemedText color='white'>
                                                    Bid
                                                </ThemedText>
                                            </TouchableOpacity>

                                        </View>
                                    </>
                                }
                                <View>
                                    <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: coolGray, padding: wp(3), borderRadius: wp(4) }} onPress={() => router.push('/Account/Login')}>
                                        <ThemedText color='white'>
                                            View Loads By {' '}
                                            <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                                                {selectedLoad.companyName}
                                            </ThemedText>
                                        </ThemedText>
                                        <AntDesign name='arrowright' size={wp(3)} color={'white'} style={{ marginLeft: wp(1) }} />
                                    </TouchableOpacity>

                                </View>



                                <View style={{ paddingVertical: wp(4), flexDirection: 'row', gap: wp(8), marginTop: 'auto' }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <TouchableOpacity style={[{ backgroundColor: coolGray, height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}>
                                            <Ionicons name="chatbubble-ellipses" size={wp(6)} color={'white'} />
                                        </TouchableOpacity>
                                        <ThemedText color={coolGray} style={{}}>Message</ThemedText>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(`whatsapp://send?phone=${selectedLoad.contact}&text=${encodeURIComponent('message')}`)}
                                            style={[{ backgroundColor: '#25D366', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                        >
                                            <FontAwesome6 name="whatsapp" size={wp(6)} color="#fff" />
                                        </TouchableOpacity>
                                        <ThemedText style={{ color: coolGray }}>WhatsApp</ThemedText>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(`tel:${selectedLoad.contact}`)}
                                            style={[{ backgroundColor: '#0074D9', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                        >
                                            <MaterialIcons name="call" size={wp(6)} color="#fff" />
                                        </TouchableOpacity>
                                        <ThemedText style={{ color: coolGray }}>Phone Call</ThemedText>
                                    </View>
                                </View>
                                {/* Add more fields as needed */}
                            </>
                        ) : (
                            <ThemedText>No details available.</ThemedText>
                        )}
                    </View>
                </BottomSheetView >

            </BottomSheet >
        </View >


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
})
