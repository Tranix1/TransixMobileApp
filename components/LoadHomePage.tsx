import React from 'react';


import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Modal, Linking,FlatList } from 'react-native'
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';

import LoadComponent from './LoadComponent';
import { ThemedText } from './ThemedText';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Load } from '@/types/types';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import Input from './Input';

import { formatCurrency, formatDate } from '@/services/services';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface LoadsComponentProps {
  Loads: Load[];
  refreshing: boolean;
  onRefresh: () => void;
  loadMoreLoads: () => void;
  lastVisible: unknown; // Replace with specific type if known
  loadingMore: boolean;
  expandId: string;
  setSelectedLoad: (load: Load | null) => void;

  bottomSheetRef: React.RefObject<any>; // Replace `any` with specific ref type if available
  setExpandID: (id: string) => void;
  showSheet: boolean;
   setBottomMode: React.Dispatch<React.SetStateAction<'Bid' | 'Book' | ''>>;
  selectedLoad: Load | null;
  formatCurrency: (value: number | string) => string;
  toggleCurrencyBid: () => void;
  setBidRate: (rate: string) => void;
  bidRate: string;
  setBidLinks: (links: string) => void;
  bidLinks: string;
  setBidTriaxle: (value: string) => void;
  bidTriaxle: string;
  deleteMyLoad: (id: string) => void;

renderBackdrop:any;
setShowfilter:any
setShowSheet:any
bottomMode:any
}


export const LoadsComponent: React.FC<LoadsComponentProps> = ({
  Loads,
  refreshing,
  onRefresh,
  loadMoreLoads,
  lastVisible,
  loadingMore,
  expandId,
  setSelectedLoad,
  bottomSheetRef,
  setExpandID,
  showSheet,
  setBottomMode,
  selectedLoad,
  formatCurrency,
  toggleCurrencyBid,
  setBidRate,
  bidRate,
  setBidLinks,
  bidLinks,
  setBidTriaxle,
  bidTriaxle,
  deleteMyLoad,
renderBackdrop ,
setShowfilter,
setShowSheet,
bottomMode
}) => {
  // Component implementation
  const { user } = useAuth();
  
  const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('background')
    const textColor = useThemeColor('text')

    return (

        <View style={[styles.container, { backgroundColor: background, flex: 1 }]}>
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
                contentContainerStyle={{}}
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
                enableContentPanningGesture={false}
                enablePanDownToClose
                onClose={() => { setShowSheet(false); setBottomMode('') }}
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: background }}
                containerStyle={{ paddingBottom: wp(14) }}
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
                                {selectedLoad.userId !== user?.uid &&
                                    <>
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
                                    </>
                                }


                                {selectedLoad.userId !== user?.uid ?
                                    <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: wp(4), flexDirection: 'row', gap: wp(5), marginTop: 'auto' }}>
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
                                        <View style={{ alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(`tel:${selectedLoad.contact}`)}
                                                style={[{ backgroundColor: '#4285f45a', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText style={{ color: coolGray }}>Copy Link</ThemedText>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(`tel:${selectedLoad.contact}`)}
                                                style={[{ backgroundColor: '#7373735a', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                            >
                                                <Ionicons name="arrow-redo" size={wp(5)} color="#737373" />
                                            </TouchableOpacity>
                                            <ThemedText style={{ color: coolGray }}>Share</ThemedText>
                                        </View>
                                        </BottomSheetScrollView> 
                                    :
                                    <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: wp(4), flexDirection: 'row', gap: wp(5), marginTop: 'auto' }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <TouchableOpacity style={[{ backgroundColor: coolGray, height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}>
                                                <FontAwesome6 name="edit" size={wp(5)} color={'white'} />
                                            </TouchableOpacity>
                                            <ThemedText color={coolGray} style={{}}>Edit Load</ThemedText>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={() => deleteMyLoad(selectedLoad.id)}
                                                style={[{ backgroundColor: '#ff0000', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                            >
                                                <FontAwesome6 name="trash" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText style={{ color: coolGray }}>Delete Load</ThemedText>
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
                                                style={[{ backgroundColor: '#4285f45a', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText style={{ color: coolGray }}>Copy Link</ThemedText>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(`tel:${selectedLoad.contact}`)}
                                                style={[{ backgroundColor: '#7373735a', height: wp(12), borderRadius: wp(90), alignItems: 'center', justifyContent: 'center', width: wp(12) }]}
                                            >
                                                <Ionicons name="arrow-redo" size={wp(5)} color="#737373" />
                                            </TouchableOpacity>
                                            <ThemedText style={{ color: coolGray }}>Share</ThemedText>
                                        </View>

                                    </BottomSheetScrollView>
                                }

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


