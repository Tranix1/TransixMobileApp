import React, { useCallback, useRef } from 'react';


import { ActivityIndicator, RefreshControl, StyleSheet, Image, TouchableNativeFeedback, TouchableOpacity, View, Modal, Linking, FlatList } from 'react-native'
import { AntDesign, FontAwesome6, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

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

    setExpandID: (id: string) => void;
    setBottomMode: React.Dispatch<React.SetStateAction<'Bid' | 'Book' | ''>>;
    selectedLoad: Load | null;
    setBidRate: (rate: string) => void;
    bidRate: string;
    deleteMyLoad: (id: string) => void;

    
    userId ?: any;
    organisationName ?: string
    setShowfilter: any
    setShowSheet: any
    bottomMode: any

    submitBidsOBookings: any
    filteredPNotAavaialble : boolean
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
    setExpandID,
    setBottomMode,
    selectedLoad,
    setBidRate,
    bidRate,
    deleteMyLoad,
    setShowfilter,
    setShowSheet,
    bottomMode,
    submitBidsOBookings,
    userId,
    organisationName,
    filteredPNotAavaialble
}) => {
    // Component implementation
    const { user } = useAuth();

    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('background')
    const textColor = useThemeColor('text')


    const bottomSheetRef = useRef<BottomSheet>(null);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop  {...props} opacity={0.05} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    );

        const handleContact = (method: 'whatsapp' | 'call' | 'message') => {
        if (!selectedLoad?.contact) return

        const message = `${selectedLoad.companyName}\nIs this Load Still available\n${selectedLoad.typeofLoad}\nrOUTE: ${selectedLoad.fromLocation} TO ${selectedLoad.toLocation}1nRate ${selectedLoad.model} : ${selectedLoad.currency} ${formatCurrency(selectedLoad.rate)}`

        switch (method) {
            case 'whatsapp':
                Linking.openURL(`whatsapp://send?phone=${selectedLoad.contact}&text=${encodeURIComponent(message)}`)
                break
            case 'call':
                Linking.openURL(`tel:${selectedLoad.contact}`)
                break
            case 'message':
                // Implement your messaging logic
                break
        }
    }

    return (

        <View style={[styles.container, { backgroundColor: background, flex: 1 }]}>
            <View style={{
                backgroundColor: background,
                paddingHorizontal: wp(2),
                paddingVertical: userId ? wp(5) : wp(1),
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: wp(1),
            }} >
                <View>
                    {!userId &&<ThemedText type="title">
                        Loads
                    </ThemedText>}
                   {userId && <ThemedText type='subtitle' >
                        {organisationName}
                    </ThemedText>}
                    {!userId &&<ThemedText type="tiny">Find a Truck for your Load Today</ThemedText>}
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
                ListEmptyComponent={
                 <View style={styles.emptyContainer}>
                           {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                Loads Loading…
                            </ThemedText>}
                            
                           {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                                Please Wait
                            </ThemedText>}
                           {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                               Specified Load Not Available!
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
                                (!lastVisible && Loads.length > 0) ?
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
            {/* Gorhom BottomSheet for details */}
            <BottomSheet
    ref={bottomSheetRef}
    index={-1}
    enableContentPanningGesture={true}
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
                            <View style={{ flexDirection: 'row' }}>

                             

                                  {!selectedLoad?.logo && <FontAwesome name='user-circle' color={coolGray} size={wp(9)} />}
                                {selectedLoad?.logo && <Image
                                    style={{ width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#ddd', }}
                                    source={{ uri: selectedLoad?.logo || 'https://via.placeholder.com/100' }}
                                />}

                                {selectedLoad &&
                                    <ThemedText type="subtitle" style={{marginLeft:20,color:accent}}>{selectedLoad.companyName}</ThemedText>
                                }
                            </View>

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
                                                        {selectedLoad.origin}
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

                                            <ThemedText style={{alignSelf:'center',margin : 8,color:accent,fontWeight:"bold"}}>
                                                 Rate : {selectedLoad.currency} {selectedLoad.rate}  </ThemedText>
                                    
                                    </View>
                                }
                                {
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
                                                        selectedLoad.rate && (
                                                            <View style={{}}>
                                                                <TouchableOpacity  >
                                                                    <ThemedText >
                                                                        Bid Rate
                                                                    </ThemedText>
                                                                </TouchableOpacity>

                                                                <Input
                                                                    onChangeText={(text) => setBidRate(text)}
                                                                    value={bidRate}
                                                                    keyboardType="numeric"
                                                                    placeholderTextColor={coolGray}
                                                                    placeholder="Bid rate"
                                                                />


                                                            </View>
                                                        )
                                                    }

                                                </View>

                                                <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                                    <TouchableOpacity
                                                        onPress={() => setBottomMode('')}
                                                        style={[{ backgroundColor: coolGray, flex: 2, padding: wp(3), borderRadius: wp(4), alignItems: 'center' }]}
                                                    >
                                                        <ThemedText style={{ color: 'white' }}>Cancel</ThemedText>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => submitBidsOBookings("biddings" as 'biddings', selectedLoad as Load)}
                                                        style={[{ backgroundColor: '#0f9d5824', flex: 2, padding: wp(3), borderRadius: wp(4), alignItems: 'center' }]}
                                                    >
                                                        <ThemedText style={{ color: '#0f9d58' }}>Send</ThemedText>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }

                                        {<>
                                            <View>
                                                {/* <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: accent, padding: wp(3), borderRadius: wp(4) }} onPress={() => submitBidsOBookings("bookings" as 'bookings', selectedLoad as Load)} > */}
                                                <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: accent, padding: wp(3), borderRadius: wp(4) }} 
                                                   onPress={() => router.push({
                    pathname: '/MakeOffer/BookBidlCargo',
                        params: { contract: JSON.stringify(selectedLoad) , OperationType : "Book" }
                    })}>
                                                    
                                                    <ThemedText color='white'>
                                                        Book Load
                                                    </ThemedText>
                                                </TouchableOpacity>

                                            </View>
                                            <View>
                                                <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: coolGray, padding: wp(3), borderRadius: wp(4) }} onPress={() => setBottomMode('Bid')}>
                                                    <ThemedText color='white'>
                                                        Bid Load
                                                    </ThemedText>
                                                </TouchableOpacity>

                                            </View>
                                        </>
                                        }
                                        <View>
                                            <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: accent, padding: wp(3), borderRadius: wp(4) }} onPress={() => router.push({pathname:"/Logistics/Loads/Index",params:{userId : selectedLoad.userId}  } )} >
                                                <ThemedText color='white'>
                                                    Loads By {' '}
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
                                        <View style={styles.contactOptions}>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                onPress={() => handleContact('message')}
                                                style={[styles.contactButton, { backgroundColor: coolGray }]}
                                            >
                                                <Ionicons name="chatbubble-ellipses" size={wp(5)} color={'white'} />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Message</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                                                onPress={() => handleContact('whatsapp')}
                                            >
                                                <FontAwesome6 name="whatsapp" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>WhatsApp</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#0074D9' }]}
                                                onPress={() => handleContact('call')}
                                            >
                                                <MaterialIcons name="call" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Call</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#4285f45a' }]}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Copy Link</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#7373735a' }]}
                                            >
                                                <Ionicons name="arrow-redo" size={wp(5)} color="#737373" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Share</ThemedText>
                                        </View>
                                    </View>

                                    :



                                    

  <View style={styles.contactOptions}>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: coolGray }]}
                                            >
                                                <FontAwesome6 name="edit" size={wp(5)} color={'white'} />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Edit</ThemedText>
                                        </View>
                                       
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: 'red' }]}
                                            >
                                                <FontAwesome6 name="trash" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Delete</ThemedText>
                                        </View>
                                         <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                onPress={() => handleContact('whatsapp')}
                                                style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                                            >
                                                <FontAwesome6 name="whatsapp" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>WhatsApp</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#4285f45a' }]}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Copy Link</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#7373735a' }]}
                                            >
                                                <Ionicons name="arrow-redo" size={wp(5)} color="#737373" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Share</ThemedText>
                                        </View>
                                    </View>




                                }

                                {/* Add more fields as needed */}
                            </>
                        )

                            : (
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


