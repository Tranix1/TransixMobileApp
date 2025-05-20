import { ActivityIndicator, FlatList, RefreshControl,  StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React, { useEffect,  useState } from 'react'
import { hp, wp } from '@/constants/common'
import { ThemedText } from '@/components/ThemedText'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Ionicons } from '@expo/vector-icons'
import { fetchDocuments } from '@/db/operations'
import { Truck } from '@/types/types'
import TruckItemComponent from '@/components/TruckItemComponent'
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore'

import { TruckTypeProps } from '@/types/types'
import { SpecifyTruckDetails } from '@/components/SpecifyTruckDetails'
const Index = () => {

    const background = useThemeColor('backgroundLight')
    const bg = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')


    // const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)

    const [trucks, setTrucks] = useState<Truck[]>([])

    const [selectedCountry, setSelectedCountry] = useState('All')
    const [dspFilterLocal, setDspFilterLocal] = useState(false)



    const [locationTruckS, setLocationTruckS] = useState<string>(""); // Track local or international selection
    const [locaOpLocTruckS, setLocaOpLocTruckS] = useState<string>(""); // Track selected local country
    const [intOpLocTruckS, setIntOpLocTruckS] = useState<string[]>([]); // Track international countries

    const [otherTruckType, setOtherTruckType] = React.useState<string>("")


    const [dspTruckCpacity, setDspTruckCapacity] = React.useState<string>("")
    const [truckCapacity, setTruckCapacity] = useState("")

    const [selectedTruckType, setSelectedTruckType] = useState<TruckTypeProps | null>(null)


    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);


    const LoadTructs = async () => {        
        let filters 
            
               const maTrucks = await fetchDocuments("Trucks", 10, undefined, filters);

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




            <SpecifyTruckDetails
                dspSpecTruckDet={showfilter}
                setDspSpecTruckDet={setShowfilter}
                // Truck Tonnage
                dspTruckCpacity={dspTruckCpacity}
                setDspTruckCapacity={setDspTruckCapacity}
                truckCapacity={truckCapacity}
                setTruckCapacity={setTruckCapacity}
                // Selecting Truck Type
                selectedTruckType={selectedTruckType}
                setSelectedTruckType={setSelectedTruckType}
                otherTruckType={otherTruckType}
                setOtherTruckType={setOtherTruckType}
                // Selecting A country and location
                location={locationTruckS}
                setLocation={setLocationTruckS}
                intOpLoc={intOpLocTruckS}
                setIntOpLoc={setIntOpLocTruckS}
                setLocaOpLoc={setLocaOpLocTruckS}
                locaOpLoc={locaOpLocTruckS}
            />










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