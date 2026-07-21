import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Image, TouchableNativeFeedback, TouchableOpacity, View, Modal, Linking, FlatList, ToastAndroid } from 'react-native'
import { AntDesign, FontAwesome6, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

import LoadComponent from './LoadComponent';
import { ThemedText } from './ThemedText';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Load } from '@/types/types';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import Input from './Input';

import { formatCurrency, formatDate } from '@/services/services';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { parseCoordinateString, isValidCoordinate, DEFAULT_COORDINATES } from '@/Utilities/coordinateUtils';
import { deleteDocument } from '@/db/operations';
import { Share, Alert } from 'react-native';
import AccentRingLoader from '@/components/AccentRingLoader';
import CustomHeader from './CustomHeader';
import Heading from './Heading';
import ProfileItemComponent from './ProfileItemComponent';

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


    userId?: any;
    organisationName?: string
    setShowfilter: any
    setShowSheet: any
    bottomMode: any

    filteredPNotAavaialble: boolean
    isLoading?: boolean
    error?: string | null
    visibilitySelector?: React.ReactNode;
    loadVisibility: string
    cargoVisibilityG: string
    setExpiredAvailableLods: React.Dispatch<React.SetStateAction<"ALL" | "AVAILABLE" | "EXPIRED">>
    expireAvailableLoads: string
    setSelectedAccountType: React.Dispatch<React.SetStateAction<"ALL" | "BROKERAGE" | "Fleet" | "DRIVER">>
    selectedAccountType: string
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
    setShowfilter,
    setShowSheet,
    bottomMode,
    userId,
    organisationName,
    filteredPNotAavaialble,
    isLoading = false,
    error = null,
    visibilitySelector,
    loadVisibility,
    cargoVisibilityG,
    setExpiredAvailableLods,
    expireAvailableLoads,
    selectedAccountType,
    setSelectedAccountType,
}) => {
    // Component implementation
    const { user } = useAuth();

    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')
    const textColor = useThemeColor('text')


    const bottomSheetRef = useRef<BottomSheet>(null);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop  {...props} opacity={0.05} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    );

    const handleContact = (method: 'whatsapp' | 'call' | 'message') => {

        ToastAndroid.show('Please book or bid this load. Direct contact is not available yet.', ToastAndroid.SHORT);
        return;
        // if (!selectedLoad?.contact) return

        // const message = `${selectedLoad.companyName}\nIs this load still available\n${selectedLoad.typeofLoad}\nrOUTE: ${selectedLoad.origin} TO ${selectedLoad.destination}\nRate : ${selectedLoad.currency} ${selectedLoad.rate} ${selectedLoad.model}`

        // switch (method) {
        //     case 'whatsapp':
        //         Linking.openURL(`whatsapp://send?phone=${selectedLoad.contact}&text=${encodeURIComponent(message)}`)
        //         break
        //     case 'call':
        //         Linking.openURL(`tel:${selectedLoad.contact}`)
        //         break
        //     case 'message':
        //         // Implement your messaging logic
        //         break
        // }
    }

    const handleDeleteLoad = async () => {
        if (!selectedLoad) return;

        Alert.alert(
            'Delete Load',
            'Are you sure you want to delete this load? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDocument('Cargo', selectedLoad.id);
                            ToastAndroid.show('Load deleted successfully', ToastAndroid.SHORT);
                            bottomSheetRef.current?.close();
                            // Refresh the loads list
                            onRefresh();
                        } catch (error) {
                            console.error('Error deleting load:', error);
                            ToastAndroid.show('Failed to delete load', ToastAndroid.SHORT);
                        }
                    }
                }
            ]
        );
    };

    const handleShareLoad = async () => {
        if (!selectedLoad) return;

        try {
            const shareMessage = `${selectedLoad.companyName}
Load: ${selectedLoad.typeofLoad}
Route: ${selectedLoad.origin} → ${selectedLoad.destination}
Rate: ${selectedLoad.currency} ${selectedLoad.rate} ${selectedLoad.model}
Contact: ${selectedLoad.contact}

From Transix - Download the app for more loads: https://play.google.com/store/apps/details?id=com.yayapana.TransixNewVersion`;

            await Share.share({
                message: shareMessage,
                title: 'Load Details'
            });
        } catch (error) {
            console.error('Error sharing load:', error);
            ToastAndroid.show('Failed to share load', ToastAndroid.SHORT);
        }
    };

    const handleCopyLink = () => {
        if (!selectedLoad) return;

        const url = `https://transix.net/selectedUserLoads/${selectedLoad.userId}/${selectedLoad.companyName}/${selectedLoad.deletionTime}`;
        // You can use Clipboard from @react-native-clipboard/clipboard if available
        // For now, we'll just show a toast
        ToastAndroid.show('Link copied to clipboard', ToastAndroid.SHORT);
    };
    let whenIdHeaderName = `${cargoVisibilityG} Loads`

    return (

        <View style={[styles.container, { backgroundColor: background, flex: 1 }]}>
            {/* Visibility Selector */}


            {(cargoVisibilityG === "undefined") ? <CustomHeader pageTitle="Loads" addingNavigate="/Logistics/Loads/AddLoads" filterElement={setShowfilter} /> :
                <View style={{ paddingTop: 20 }}>

                    <Heading page={whenIdHeaderName} />
                </View>
            }

            {visibilitySelector}



            <FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{}}
                data={Loads}




                ListHeaderComponent={
                    <>
                        {loadVisibility === "Public" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    backgroundColor: backgroundLight,
                                    borderRadius: 999,
                                    padding: 3,
                                }}
                            >
                                {[
                                    { key: "ALL", label: "All", color: accent },
                                    { key: "AVAILABLE", label: "Available", color: accent },
                                    { key: "EXPIRED", label: "Expired", color: "#ef4444" },
                                ].map((item) => (
                                    <TouchableOpacity
                                        key={item.key}
                                        activeOpacity={0.8}
                                        onPress={() => setExpiredAvailableLods(item.key as any)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 8,
                                            borderRadius: 999,
                                            backgroundColor:
                                                expireAvailableLoads === item.key
                                                    ? item.color
                                                    : "transparent",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ThemedText
                                            type="tiny"
                                            style={{
                                                fontWeight: "600",
                                                color:
                                                    expireAvailableLoads === item.key
                                                        ? "#fff"
                                                        : item.color,
                                            }}
                                        >
                                            {item.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {loadVisibility === "Network" && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    backgroundColor: background,
                                    borderRadius: 999,
                                    padding: wp(0.5),
                                    borderWidth: 1,
                                    borderColor: backgroundLight,
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                {[
                                    { key: "ALL", label: "All" },
                                    { key: "BROKERAGE", label: "Brokerage" },
                                    { key: "FLEET", label: "Fleet" },
                                    { key: "DRIVER", label: "Driver" },
                                ].map((item) => {

                                    const selected = selectedAccountType === item.key;

                                    return (
                                        <TouchableOpacity
                                            key={item.key}
                                            activeOpacity={0.85}
                                            onPress={() => setSelectedAccountType(item.key as any)}
                                            style={{
                                                flex: 1,
                                                paddingVertical: wp(2),
                                                borderRadius: 999,

                                                backgroundColor: selected
                                                    ? backgroundLight
                                                    : "transparent",

                                                borderWidth: selected ? 1 : 0,
                                                borderColor: selected
                                                    ? accent
                                                    : "transparent",

                                                alignItems: "center",
                                                justifyContent: "center",

                                                shadowColor: selected ? accent : "transparent",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 2,
                                                },
                                                shadowOpacity: selected ? 0.18 : 0,
                                                shadowRadius: 4,
                                                elevation: selected ? 2 : 0,
                                            }}
                                        >

                                            <ThemedText
                                                type="tiny"
                                                style={{
                                                    fontWeight: selected ? "800" : "600",

                                                    color: selected
                                                        ? accent
                                                        : coolGray,

                                                    fontSize: 13,
                                                }}
                                            >
                                                {item.label}
                                            </ThemedText>

                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </>
                }


                renderItem={({ item }) => (

                    <>
                        {loadVisibility === "Network" ?
                            <ProfileItemComponent profile={item as any} />
                            :
                            <LoadComponent item={item} expandID={expandId} expandId={(s) => setExpandID(s)} ondetailsPress={() => {
                                setSelectedLoad(item);
                                setShowSheet(true);
                                setTimeout(() => {
                                    bottomSheetRef.current?.expand();
                                }, 10);
                            }}
                                expireAvailableLoads={expireAvailableLoads}

                            />}
                    </>


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
                        {isLoading ? (
                            <>
                                <AccentRingLoader color={accent} size={32} dotSize={6} />
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    Loading Loads…
                                </ThemedText>
                                <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Please Wait
                                </ThemedText>
                            </>
                        ) : error ? (
                            <>
                                <Ionicons name="alert-circle-outline" size={wp(8)} color="#ef4444" />
                                <ThemedText type='defaultSemiBold' style={[styles.emptyText, { color: '#ef4444' }]}>
                                    {error}
                                </ThemedText>
                                <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Pull to refresh
                                </ThemedText>
                            </>
                        ) : filteredPNotAavaialble ? (
                            <>
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    Specified Load Not Available!
                                </ThemedText>
                                <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Pull to refresh
                                </ThemedText>
                            </>
                        ) : (
                            <>
                                <Ionicons name="cube-outline" size={wp(8)} color={icon} />
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    No Loads Available
                                </ThemedText>


                                {loadVisibility === "Private" && <TouchableOpacity onPress={() => router.push("/Logistics/Loads/AddLoads")} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                                >
                                    <ThemedText style={{ color: '#666' }}>
                                        Create a load to start receiving bids or assignments
                                    </ThemedText>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={accent}
                                        style={{ marginLeft: 4 }}
                                    />
                                </TouchableOpacity>}


                                {loadVisibility === "Public" && <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Check back later
                                </ThemedText>}
                            </>
                        )}
                    </View>
                }
                ListFooterComponent={
                    <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                        {
                            loadingMore ?
                                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                    <AccentRingLoader color={accent} size={20} dotSize={4} />
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
                                    <ThemedText type="subtitle" style={{ marginLeft: 20, color: accent }}>{selectedLoad.companyName}</ThemedText>
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

                                        <ThemedText style={{ alignSelf: 'center', margin: 8, color: accent, fontWeight: "bold" }}>
                                            Rate : {selectedLoad.currency} {selectedLoad.rate} {selectedLoad.model}  </ThemedText>

                                    </View>
                                }
                                {
                                    <>


                                        {<>
                                            <View>
                                                {/* <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: accent, padding: wp(3), borderRadius: wp(4) }} onPress={() => submitBidsOBookings("bookings" as 'bookings', selectedLoad as Load)} > */}
                                                <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: accent, padding: wp(3), borderRadius: wp(4) }}
                                                    onPress={() => router.push({
                                                        pathname: '/MakeOffer/BookBidlCargo',
                                                        params: { contract: JSON.stringify(selectedLoad), OperationType: "Book" }
                                                    })}>

                                                    <ThemedText color='white'>
                                                        Book Load
                                                    </ThemedText>
                                                </TouchableOpacity>

                                            </View>
                                            <View>
                                                <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: coolGray, padding: wp(3), borderRadius: wp(4) }} onPress={() => router.push({
                                                    pathname: '/MakeOffer/BookBidlCargo',
                                                    params: { cargo: JSON.stringify(selectedLoad), OperationType: "Bid" }
                                                })}>
                                                    <ThemedText color='white'>
                                                        Bid Load
                                                    </ThemedText>
                                                </TouchableOpacity>

                                            </View>
                                        </>
                                        }
                                        <View>
                                            <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp(2), alignItems: 'center', gap: wp(2), justifyContent: 'center', backgroundColor: accent, padding: wp(3), borderRadius: wp(4) }} onPress={() => router.push({ pathname: "/Logistics/Loads/Index", params: { userId: selectedLoad.userId } })} >
                                                <ThemedText color='white'>
                                                    Loads By {' '}
                                                    <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                                                        {selectedLoad.companyName}
                                                    </ThemedText>
                                                </ThemedText>
                                                <AntDesign name='arrow-right' size={wp(3)} color={'white'} style={{ marginLeft: wp(1) }} />
                                            </TouchableOpacity>

                                        </View>
                                        <View>

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
                                                onPress={handleCopyLink}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Copy Link</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#7373735a' }]}
                                                onPress={handleShareLoad}
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
                                                onPress={() => router.push({
                                                    pathname: '/Logistics/Loads/AddLoads',
                                                    params: { editLoad: JSON.stringify(selectedLoad) }
                                                })}
                                            >
                                                <FontAwesome6 name="edit" size={wp(5)} color={'white'} />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Edit</ThemedText>
                                        </View>

                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: 'red' }]}
                                                onPress={handleDeleteLoad}
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
                                                onPress={handleCopyLink}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Copy Link</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#7373735a' }]}
                                                onPress={handleShareLoad}
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
    }, emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    }, emptyText: {
        textAlign: 'center'
    }, emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center',
        alignItems: 'center'
    },
})


