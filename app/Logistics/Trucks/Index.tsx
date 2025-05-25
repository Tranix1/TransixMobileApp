import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
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
import { cargoArea } from '@/data/appConstants'
const Index = () => {

    const background = useThemeColor('backgroundLight')
    const bg = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')


    // const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)

    const [trucks, setTrucks] = useState<Truck[]>([])

    const [selectedCountry, setSelectedCountry] = useState('All')

    const [locationTruckS, setLocationTruckS] = useState<string>(""); // Track local or international selection

    const [tankerType, setTankerType] = React.useState<string>("")


    const [dspTruckCpacity, setDspTruckCapacity] = React.useState<string>("")
    const [truckCapacity, setTruckCapacity] = useState("")


    const [truckConfig, setTruckConfig] = React.useState("")
    const [truckSuspension, setTruckSuspension] = React.useState("")

    const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)


    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);


    const [operationCountries, setOperationCountries] = useState<string[]>([]);



    const LoadTructs = async () => {
        let filters: any[] = [];

        // Apply filters for truck properties first

        if (truckCapacity) filters.push(where("truckCapacity", "==", truckCapacity));
        if (truckConfig) filters.push(where("truckConfig", "==", truckConfig));
        if (truckSuspension) filters.push(where("truckSuspensions", "==", truckSuspension));
        if (selectedCargoArea) filters.push(where("cargoArea", "==", selectedCargoArea?.name));
        if (tankerType && selectedCargoArea) filters.push(where("tankerType", "==", tankerType))
        // Conditionally add the country filter
        if (operationCountries.length > 0) filters.push(where("locations", "array-contains-any", operationCountries));

        // Fetch data from Firestore with the initially applied filters
        const maTrucks = await fetchDocuments("Trucks", 10, undefined, filters);

        let trucksToSet: Truck[] = [];

        if (maTrucks && maTrucks.data) {
            // If locationTruckS is true, we need to do the client-side filtering for ALL selected countries
            if (operationCountries.length > 0) {
                trucksToSet = (maTrucks.data as Truck[]).filter(truck =>
                    operationCountries.every(country => truck.locations?.includes(country))
                );
            } else {
                // Otherwise, use the data as fetched (which would be filtered only by truck properties)
                trucksToSet = maTrucks.data as Truck[];
            }

            setTrucks(trucksToSet);
            setLastVisible(maTrucks.lastVisible);
        }
    };





    useEffect(() => {
        LoadTructs();
    }, [truckCapacity, truckConfig, truckSuspension, operationCountries,selectedCargoArea])

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

        let filters: any[] = [];

        // Apply the same filters as in LoadTructs
        if (truckCapacity) filters.push(where("truckCapacity", "==", truckCapacity));
        if (truckConfig) filters.push(where("truckConfig", "==", truckConfig));
        if (truckSuspension) filters.push(where("truckSuspensions", "==", truckSuspension));
        if (selectedCargoArea) filters.push(where("cargoArea", "==", selectedCargoArea?.name));
        if (tankerType && selectedCargoArea) filters.push(where("tankerType", "==", tankerType));
        if (operationCountries.length > 0) {
            // Firestore limits to 10 elements in array-contains-any
            filters.push(where("locations", "array-contains-any", operationCountries.slice(0, 10)));
        }

        // Fetch with pagination
        const result = await fetchDocuments('Trucks', 10, lastVisible, filters);

        if (result && result.data) {
            let newTrucks = result.data as Truck[];

            // Apply client-side filtering for "must include all selected countries"
            if (operationCountries.length > 0) {
                newTrucks = newTrucks.filter(truck =>
                    operationCountries.every(country => truck.locations?.includes(country))
                );
            }

            setTrucks(prev => [...prev, ...newTrucks]);
            setLastVisible(result.lastVisible);
        }

        setLoadingMore(false);
    };

    function clearFilter() {
        setOperationCountries([])
        setTruckConfig("")
        setTruckCapacity("")
        setTruckSuspension("")
        setSelectedCargoArea(null)
    }

    return (
        <View style={{ flex: 1 }}>




            <SpecifyTruckDetails
                dspSpecTruckDet={showfilter}
                setDspSpecTruckDet={setShowfilter}
                // Truck Tonnage
                truckCapacity={truckCapacity}
                setTruckCapacity={setTruckCapacity}
                // Selecting Truck Type
                selectedTruckType={selectedCargoArea}
                setSelectedTruckType={setSelectedCargoArea}
                tankerType={tankerType}
                setTankerType={setTankerType}
                // Selecting A country and location
                operationCountries={operationCountries}
                setOperationCountries={setOperationCountries}
                // Truck Config and suspension
                truckConfig={truckConfig}
                setTruckConfig={setTruckConfig}
                truckSuspension={truckSuspension}
                setTruckSuspension={setTruckSuspension}

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










                            {(selectedCargoArea || truckSuspension || truckConfig || operationCountries.length>0 ||truckCapacity) && (
                                <TouchableOpacity
                                    onPress={() =>{ 
                                        clearFilter()
                                        setShowfilter(true)
                                    }}
                                    style={{
                                        padding: wp(2),
                                        flexDirection: 'row',
                                        backgroundColor: background,
                                        borderRadius: wp(6),
                                        marginBottom: wp(2),
                                        position: 'relative',
                                        alignItems: 'center',
                                    }}
                                >
                                    {selectedCargoArea?.image && (
                                        <View style={{ marginRight: wp(2) }}>
                                            <Image
                                                source={selectedCargoArea.image}
                                                style={{
                                                    width: wp(20),
                                                    height: wp(15),
                                                    borderRadius: wp(4),
                                                    resizeMode: 'cover',
                                                }}
                                            />
                                        </View>
                                    )}

                                    <View style={{ flex: 1 }}>
                                        {selectedCargoArea?.name && (
                                            <ThemedText type="subtitle" style={{ marginBottom: wp(1) }}>
                                                {selectedCargoArea.name}
                                            </ThemedText>
                                        )}

                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ gap: wp(2) }}
                                        >
                                            {truckCapacity && (
                                                <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                                                    <ThemedText style={{ color: 'white' }}>
                                                        { truckCapacity}
                                                    </ThemedText>
                                                </View>
                                            )}
                                                 {truckConfig&& (
                                                <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                                                    <ThemedText style={{ color: 'white' }}>
                                                        {truckConfig}
                                                    </ThemedText>
                                                </View>
                                            )}
                                                 {truckSuspension && (
                                                <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                                                    <ThemedText style={{ color: 'white' }}>
                                                        {truckSuspension}
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </ScrollView>
                                        <ThemedText style={{textAlign:"center"}} >
                                            
                                    {operationCountries?.map(item => item + ', ') || 'N/A'}
                                        </ThemedText>
                                    </View>

                                    <View
                                        style={{
                                            overflow: 'hidden',
                                            borderRadius: wp(10),
                                            position: 'absolute',
                                            right: wp(2),
                                            top: wp(2)
                                        }}
                                    >
                                        <TouchableNativeFeedback onPress={clearFilter}>
                                            <View style={{ padding: wp(2) }}>
                                                <Ionicons name="close" size={wp(4)} color={icon} />
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                </TouchableOpacity>
                            )}



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
        padding: wp(1),
        paddingHorizontal: wp(3),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})