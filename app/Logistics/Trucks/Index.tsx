import { FlatList, Image, ImageSourcePropType, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native'
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

    const [trucks, setTrucks] = useState<Truck[] | null>(null)

    const [selectedCountry, setSelectedCountry] = useState('All')
    const [truckTonnage, setTruckTonnage] = useState("All")

    useEffect(() => {
        LoadTructs();
    }, [selectedTruckType])

    const LoadTructs = async () => {

        const maTrucks = await fetchDocuments("Trucks");
        if (maTrucks) {

            setTrucks(maTrucks as Truck[])
        }

    }
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

    const [filterVerified, setFilterVerified] = useState(true)

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
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(2), gap: wp(3) }}>
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
                                    </ScrollView>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(2), gap: wp(3) }}>
                                        <TouchableOpacity key={'all'} onPress={() => setTruckTonnage('All')} style={[styles.countryButton, { backgroundColor: background }, truckTonnage === 'All' && styles.countryButtonSelected]} >
                                            <ThemedText style={{ color: truckTonnage === 'All' ? 'white' : coolGray }}>All </ThemedText>
                                        </TouchableOpacity>
                                        {
                                            tonneSizes.map((item, index) =>
                                                <TouchableOpacity key={index} onPress={() => setTruckTonnage(item)} style={[styles.countryButton, { backgroundColor: background }, truckTonnage === item && styles.countryButtonSelected]} >
                                                    <ThemedText style={{ color: truckTonnage === item ? 'white' : coolGray }}>{item} </ThemedText>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </ScrollView>

                                    <SwithComponent value={filterVerified} handlePress={() => { setFilterVerified(!filterVerified); }} title='Show Verified' />
                                </View>
                                <ThemedText style={{ marginBottom: wp(2) }}>
                                    Truck Types
                                </ThemedText>
                                <ScrollView horizontal contentContainerStyle={{ gap: wp(2) }} style={{}}>
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
                                            }}
                                        >
                                            <Image
                                                style={{ width: wp(25), height: wp(15), borderRadius: wp(2), marginRight: wp(2) }}
                                                source={item.image}
                                            />
                                            <View>
                                                <ThemedText type="subtitle">{item.name}</ThemedText>
                                                <Ionicons style={{ alignSelf: 'flex-end' }} name={selectedTruckType?.id === item.id ? "checkmark-circle" : 'ellipse-outline'} size={wp(6)} color={accent} />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Button
                                    onPress={() => {
                                        clearFilter();
                                        setShowfilter(false);
                                    }}
                                    title='Clear Filters'
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
                        <ThemedText type="title">Trucks</ThemedText>
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
                            {(selectedTruckType || filterVerified || truckTonnage !== 'All') &&
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
                            }

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(0), gap: wp(3), borderRadius: wp(4) }}>
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
                            </ScrollView>
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