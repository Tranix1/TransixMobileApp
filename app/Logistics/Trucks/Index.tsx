import { ActivityIndicator, FlatList, Image, ImageSourcePropType, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { hp, wp } from '@/constants/common'
import { ThemedText } from '@/components/ThemedText'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { fetchDocuments } from '@/db/operations'
import { Countries, Truck } from '@/types/types'
import TruckItemComponent from '@/components/TruckItemComponent'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import SwithComponent from '@/components/Switch'
import { BlurView } from 'expo-blur'
import Button from '@/components/Button'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'

const Index = () => {

    const background = useThemeColor('backgroundLight')
    const bg = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')

    const bottomSheetRef = useRef<BottomSheet>(null);

    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);



    const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)

    const [trucks, setTrucks] = useState<Truck[]>([])

    const [selectedCountry, setSelectedCountry] = useState('All')
    const [dspFilterLocal, setDspFilterLocal] = useState(false)

    const [truckTonnage, setTruckTonnage] = useState("All")
    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const LoadTructs = async () => {
        const maTrucks = await fetchDocuments("Trucks");
        if (maTrucks) {
            setTrucks(maTrucks.data as Truck[])
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

        }
    };


    const [showfilter, setShowfilter] = useState(false)

    const truckTypes = [
        { id: 0, name: 'Flat deck', image: require('@/assets/images/Trucks/images (2).jpeg') },
        { id: 1, name: 'Bulk Trailer', image: require('@/assets/images/Trucks/download (1).jpeg') },
        { id: 2, name: 'Low Bed', image: require('@/assets/images/Trucks/H805f1f51529345648d1da9e5fcd6807e2.jpg') },
        { id: 3, name: 'Side Tipper', image: require('@/assets/images/Trucks/images (5).jpeg') },
        { id: 4, name: 'Tautliner', image: require('@/assets/images/Trucks/download (3).jpeg') },
        { id: 5, name: 'Tanker', image: require('@/assets/images/Trucks/images (7).jpeg') },
        { id: 6, name: 'Rigid', image: require('@/assets/images/Trucks/download (4).jpeg') },
        // { id: 7, name: 'All', image: '' },
    ]

    const [filterVerified, setFilterVerified] = useState(false)

    const tonneSizes = [
        '1-3 T',
        '3-6 T',
        '7-10 T',
        '11-13 T',
        '12-15 T',
        '16-20 T',
        '20+ T',
    ]

    const clearFilter = () => {
        setSelectedTruckType(null)
        setTruckTonnage('All')
        setFilterVerified(false)
    }

    const loadMoreTrucks = async () => {

        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        const result = await fetchDocuments('Trucks', 10, lastVisible);
        if (result) {
            setTrucks([...trucks, ...result.data as Truck[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };




    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView>
                <Modal
                    visible={showfilter}
                    animationType="slide"
                    transparent={true}
                    statusBarTranslucent
                    onRequestClose={() => setShowfilter(false)}
                >
                    <BlurView intensity={10} tint='systemMaterialDark' experimentalBlurMethod='dimezisBlurView' style={{ flex: 1, }}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                            <View style={{ width: '95%', backgroundColor: bg, borderRadius: wp(4), padding: wp(4) }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
                                    <ThemedText type="default">Filter Trucks</ThemedText>

                                    <TouchableOpacity onPress={() => setShowfilter(false)}>
                                        <Ionicons name="close" size={wp(5)} color={icon} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginBottom: wp(4), gap: wp(4) }}>



                                    <View style={{ flexDirection: 'row' }}>

                                        <TouchableOpacity onPress={() => {
                                            setSelectedCountry('International');
                                            setDspFilterLocal(false);
                                        }} style={[styles.countryButton, { backgroundColor: background, marginRight: 6 }, selectedCountry === 'International' && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: selectedCountry === 'International' ? 'white' : coolGray }}>International</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            setDspFilterLocal(true); setSelectedCountry('All')
                                        }} style={[styles.countryButton, { backgroundColor: background }, dspFilterLocal && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: dspFilterLocal ? 'white' : coolGray }}>Local </ThemedText>
                                        </TouchableOpacity>
                                    </View>


                                    {dspFilterLocal && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(2), gap: wp(3) }}>
                                        <TouchableOpacity key={'all'} onPress={() => setSelectedCountry('All')} style={[styles.countryButton, { backgroundColor: background }, selectedCountry === 'All' && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: selectedCountry === 'All' ? 'white' : coolGray }}>All </ThemedText>
                                        </TouchableOpacity>
                                        {
                                            Countries.map((item, index) =>
                                                <TouchableOpacity key={index} onPress={() => setSelectedCountry(item)} style={[styles.countryButton, { backgroundColor: background }, selectedCountry === item && styles.countryButtonSelected]} >
                                                    <ThemedText style={{ color: selectedCountry === item ? 'white' : coolGray }}>{item} </ThemedText>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </ScrollView>}



                                    <View style={{ flexDirection: 'row' }}>

                                        <TouchableOpacity onPress={() => {
                                            setSelectedCountry('International');
                                            setDspFilterLocal(false);
                                        }} style={[styles.countryButton, { backgroundColor: background, marginRight: 6 }, selectedCountry === 'International' && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: selectedCountry === 'International' ? 'white' : coolGray }}>Cargo Trucks</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            setDspFilterLocal(true); setSelectedCountry('All')
                                        }} style={[styles.countryButton, { backgroundColor: background }, dspFilterLocal && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: dspFilterLocal ? 'white' : coolGray }}>Tankers </ThemedText>
                                        </TouchableOpacity>
                                    </View>


                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(2), gap: wp(3) }}>
                                        <TouchableOpacity key={'all'} onPress={() => setTruckTonnage('All')} style={[styles.countryButton, { backgroundColor: background }, truckTonnage === 'All' && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: truckTonnage === 'All' ? 'white' : coolGray }}>All </ThemedText>
                                        </TouchableOpacity>
                                        {
                                            tonneSizes.slice().reverse().map((item, index) =>
                                                <TouchableOpacity key={index} onPress={() => setTruckTonnage(item)} style={[styles.countryButton, { backgroundColor: background }, truckTonnage === item && styles.countryButtonSelected]} >
                                                    <ThemedText style={{ color: truckTonnage === item ? 'white' : coolGray }}>{item} </ThemedText>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </ScrollView>

                                    <SwithComponent value={filterVerified} handlePress={() => { setFilterVerified(!filterVerified); }} title='Show Verified' />
                                </View>


                                <Button
                                    onPress={() => {
                                        // clearFilter();
                                        setShowfilter(false);
                                    }}
                                    title='Done Filter'
                                    colors={{ bg: accent + '1c', text: accent }}
                                />
                            </View>
                        </View>
                    </BlurView>

                </Modal>


            </SafeAreaView>
            <View style={[styles.container, { backgroundColor: bg }]}>
                <View style={{
                    backgroundColor: bg,
                    paddingHorizontal: wp(2),
                    paddingVertical: wp(1),
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: wp(1),
                }} >
                    <View>
                        <View style={{}}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                <ThemedText type="title">
                                    Trucks
                                </ThemedText>
                                <Text style={{ fontSize: 13, marginLeft: 5 }}>
                                    {selectedCountry !== "All" && selectedCountry !== "International" ? `Local ${selectedCountry}` : selectedCountry === "International" ? selectedCountry : null}
                                </Text>
                            </View>

                        </View>
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
                    ListHeaderComponent={() => <>
                        <View style={{ marginHorizontal: wp(1), marginBottom: wp(1), }}>

                            <TouchableOpacity onPress={() => setSelectedTruckType(null)}>

                                {selectedTruckType?.name && <ThemedText style={{ alignSelf: 'flex-end' }}>Truck type</ThemedText>}
                            </TouchableOpacity>

                            {!selectedTruckType?.name &&
                                <ScrollView horizontal contentContainerStyle={{ gap: wp(2) }} style={{ marginBottom: 10, marginLeft: 5, marginTop: 7 }}>
                                    {truckTypes.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => {
                                                setSelectedTruckType(item);
                                                console.log('set ,', item);

                                            }}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                padding: wp(2),
                                                paddingRight: wp(4),
                                                marginBottom: wp(2),
                                                backgroundColor: selectedTruckType?.id === item.id ? accent + '14' : background,
                                                borderRadius: wp(4),
                                                height: 57,
                                            }}
                                        >
                                            <Image
                                                style={{ width: wp(19), height: wp(8), borderRadius: wp(2), marginRight: wp(2) }}
                                                source={item.image}
                                            />
                                            <View>
                                                <ThemedText type="subtitle">{item.name}</ThemedText>
                                                <Ionicons style={{ alignSelf: 'flex-end' }} name={selectedTruckType?.id === item.id ? "checkmark-circle" : 'ellipse-outline'} size={wp(4)} color={accent} />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>}






                            {/* {(selectedTruckType || filterVerified || truckTonnage !== 'All') &&
                                <TouchableOpacity onPress={() => setShowfilter(true)} style={{ padding: wp(2), flexDirection: 'row', backgroundColor: background, borderRadius: wp(6), marginBottom: wp(2), position: 'relative' }}>
                                    {selectedTruckType &&
                                        <View style={{ marginRight: wp(2) }}>
                                            <Image style={{ width: wp(20), height: wp(15), borderRadius: wp(4) }} source={selectedTruckType.image} />
                                        </View>
                                    }

                                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                                        {selectedTruckType &&
                                            <ThemedText type='subtitle' style={{ flex: 1 }}>
                                                {selectedTruckType?.name}
                                            </ThemedText>
                                        }
                                        <ScrollView horizontal contentContainerStyle={{ gap: wp(2) }}>
                                            {truckTonnage !== 'All' &&
                                                <View style={[styles.countryButton, { backgroundColor: '#73c8a9' },]} >
                                                    <ThemedText style={{ color: 'white' }}>
                                                        {truckTonnage}
                                                    </ThemedText>
                                                </View>
                                            }
                                            {filterVerified &&
                                                <View style={[styles.countryButton, { backgroundColor: '#73c8a9' },]} >
                                                    <ThemedText style={{ color: 'white' }}>
                                                        Verified Only
                                                    </ThemedText>
                                                </View>
                                            }

                                        </ScrollView>

                                    </View>
                                    <View style={{ overflow: 'hidden', borderRadius: wp(10), position: 'absolute', right: wp(4), top: wp(2) }}>
                                        <TouchableNativeFeedback onPress={() => clearFilter()}>
                                            <View style={{ padding: wp(2) }}>
                                                <Ionicons name={'close'} size={wp(4)} color={icon} />
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                </TouchableOpacity>
                            } */}


                        </View>
                        {showfilter ?
                            <>

                            </>
                            :
                            <View style={{}}>


                            </View>
                        }

                        {/* <View style={{ borderBottomWidth: .5, borderColor: icon, marginTop: wp(4), marginBottom: wp(2) }} /> */}

                    </>}
                    data={trucks}
                    renderItem={({ item }) => (
                        <TruckItemComponent truck={item} />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[accent]}
                        />
                    }
                    ListEmptyComponent={<View style={{ minHeight: hp(80), justifyContent: 'center' }}>

                        <ThemedText type='defaultSemiBold' style={{ textAlign: 'center' }}>
                            No Trucks to Display!
                        </ThemedText>
                    </View>}
                    onEndReached={loadMoreTrucks}
                    onEndReachedThreshold={.5}
                    ListFooterComponent={
                        <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                            {
                                loadingMore ?
                                    <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                        <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                        <ActivityIndicator size="small" color={accent} />
                                    </View>
                                    :
                                    (!lastVisible && trucks.length > 0) ?
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


        </View>
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})