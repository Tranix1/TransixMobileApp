import { FlatList, Image, ImageSourcePropType, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { hp, wp } from '@/constants/common'
import { ThemedText } from '@/components/ThemedText'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Ionicons } from '@expo/vector-icons'
import { fetchDocuments } from '@/db/operations'
import { Countries, Truck } from '@/types/types'
import TruckItemComponent from '@/components/TruckItemComponent'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

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
    const [truckTonnage, setTruckTonnage] = useState("")

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

    const tonneSizes = [
        '1-3 T',
        '3-6 T',
        '7-10 T',
        '11-13 T',
        '12-15 T',
        '16-20 T',
        '20+ T',
    ]




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
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ width: '95%', backgroundColor: bg, borderRadius: wp(4), padding: wp(4) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
                                <ThemedText type="subtitle">Filter Trucks</ThemedText>
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
                            </View>
                            <ThemedText>
                                Truck Types
                            </ThemedText>
                            <ScrollView horizontal contentContainerStyle={{ gap: wp(2) }} style={{}}>
                                {truckTypes.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => {
                                            setSelectedTruckType(item);
                                            // setShowfilter(false);
                                        }}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: wp(2),
                                            marginBottom: wp(2),
                                            backgroundColor: selectedTruckType?.id === item.id ? accent + '1a' : background,
                                            borderRadius: wp(4),
                                        }}
                                    >
                                        <Image
                                            style={{ width: wp(25), height: wp(15), borderRadius: wp(2), marginRight: wp(2) }}
                                            source={item.image}
                                        />
                                        <View>
                                            <ThemedText type="subtitle">{item.name}</ThemedText>
                                            <Ionicons name={selectedTruckType?.id === item.id ? "checkmark-circle" : 'ellipse-outline'} size={wp(4)} color={accent} />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedTruckType(null);
                                    setShowfilter(false);
                                }}
                                style={{
                                    marginTop: wp(4),
                                    padding: wp(3),
                                    backgroundColor: accent,
                                    borderRadius: wp(4),
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText color="white" type="defaultSemiBold">
                                    Clear Filters
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
            <View style={[styles.container, { backgroundColor: bg }]}>

                <FlatList
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={() => <>
                        <View style={{ marginHorizontal: wp(4), marginBottom: wp(5), }}>
                            <View style={{ marginLeft: wp(3), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <ThemedText type='subtitle'>Filter</ThemedText>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => setShowfilter(true)}>
                                        <View style={{ padding: wp(2) }}>
                                            <Ionicons name={'filter'} size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            </View>
                            {selectedTruckType &&
                                <View style={{ padding: wp(2), flexDirection: 'row', backgroundColor: background, borderRadius: wp(6), marginBottom: wp(2), position: 'relative' }}>
                                    <View style={{}}>
                                        <Image style={{ width: wp(20), height: wp(15), borderRadius: wp(4) }} source={selectedTruckType.image} />
                                    </View>
                                    <View style={{ paddingLeft: wp(4), paddingTop: wp(2), flex: 1, justifyContent: 'space-between' }}>
                                        <ThemedText type='subtitle'>
                                            {selectedTruckType?.name}
                                        </ThemedText>
                                        <ScrollView horizontal>
                                            <View style={[styles.countryButton, { backgroundColor: '#73c8a9' },]} >
                                                <ThemedText style={{ color: 'white' }}>
                                                    {truckTonnage}
                                                </ThemedText>
                                            </View>

                                        </ScrollView>

                                    </View>
                                    <View style={{ overflow: 'hidden', borderRadius: wp(10), position: 'absolute', right: wp(4), top: wp(2) }}>
                                        <TouchableNativeFeedback onPress={() => setSelectedTruckType(null)}>
                                            <View style={{ padding: wp(2) }}>
                                                <Ionicons name={'close'} size={wp(4)} color={icon} />
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                </View>
                            }
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