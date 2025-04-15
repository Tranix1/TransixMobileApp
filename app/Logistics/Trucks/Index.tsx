import { FlatList, Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { wp } from '@/constants/common'
import { ThemedText } from '@/components/ThemedText'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Ionicons } from '@expo/vector-icons'
import { fetchDocuments } from '@/db/operations'
import { Truck } from '@/types/types'
import TruckItemComponent from '@/components/TruckItemComponent'

const Index = () => {

    const background = useThemeColor('backgroundLight')
    const bg = useThemeColor('background')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')



    const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)
    
    const [trucks, setTrucks] = useState<Truck[] | null>(null)

    useEffect(() => {
        LoadTructs();
    }, [selectedTruckType])

    const LoadTructs = async () => {

        const maTrucks = await fetchDocuments("Trucks");
        if (maTrucks) {
            console.log('trucks', maTrucks);

            setTrucks(maTrucks as Truck[])
        }

    }
    const [showfilter, setShowfilter] = useState(true)

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

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>

            <FlatList
                ListHeaderComponent={() => <>
                    <View style={{ marginHorizontal: wp(4), marginBottom: wp(5), }}>
                        <View style={{ marginLeft: wp(3), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ThemedText type='subtitle'>Filter</ThemedText>
                            <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                <TouchableNativeFeedback onPress={() => setShowfilter(!showfilter)}>
                                    <View style={{ padding: wp(2) }}>
                                        <Ionicons name={showfilter ? 'chevron-up' : 'filter'} size={wp(4)} color={icon} />
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
                    </View>
                    {showfilter ?
                        <>
                            {truckTypes.map((item, key) =>
                                <View key={item.id} style={{ padding: wp(2), flexDirection: 'row', backgroundColor: background, borderRadius: wp(6), marginBottom: wp(2) }}>
                                    <View style={{ width: wp(40), }}>
                                        <Image style={{ width: wp(40), height: wp(20), borderRadius: wp(4) }} source={item.image} />
                                    </View>
                                    <View style={{ paddingLeft: wp(4), paddingTop: wp(2), flex: 1, justifyContent: 'space-between' }}>
                                        <ThemedText type='subtitle'>
                                            {item.name}
                                        </ThemedText>

                                        <View style={{ backgroundColor: accent + '1a', borderRadius: wp(4), overflow: 'hidden' }}>
                                            <TouchableNativeFeedback onPress={() => { setSelectedTruckType(item); setShowfilter(false) }}>
                                                <View style={{ padding: wp(3), alignItems: 'center' }}>
                                                    <ThemedText color={accent} type='defaultSemiBold'>
                                                        Select
                                                        {/* <Ionicons name='arrow-forward' size={wp(5)} /> */}
                                                    </ThemedText>
                                                </View>
                                            </TouchableNativeFeedback>
                                        </View>
                                    </View>
                                </View>
                            )}
                            <View key={'all'} style={{ padding: wp(2), flexDirection: 'row', backgroundColor: background, borderRadius: wp(6), marginBottom: wp(2) }}>

                                <View style={{ backgroundColor: accent + '1a', borderRadius: wp(4), overflow: 'hidden', flex: 1 }}>
                                    <TouchableNativeFeedback>
                                        <View style={{ padding: wp(3), alignItems: 'center' }}>
                                            <ThemedText color={accent} type='defaultSemiBold'>
                                                View All Truck Types

                                            </ThemedText>
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            </View>
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
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: wp(2)
    }
})