// https://www.youtube.com/watch?v=QdU6WxHXSxE&list=PLi97PD1Y9JAVb1y4PX9tFTN9Gb0TSEJGB&index=8
import { StyleSheet, View, } from 'react-native'
import React, { useEffect, useId, useState } from 'react'
import { hp, wp } from '@/constants/common'
import { fetchDocuments } from '@/db/operations'
import {  Truck } from '@/types/types'
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore'

import { TruckTypeProps } from '@/types/types'
import { useAuth } from '@/context/AuthContext'
import { useLocalSearchParams } from 'expo-router'
import ScreenWrapper from '@/components/ScreenWrapper'
import { FinalReturnComponent } from '@/components/TrucksHomePage'
const Index = () => {


    const { userId, organisationName, contractName, contractId,capacityG,cargoAreaG,truckTypeG,operationCountriesG  } = useLocalSearchParams();

    // const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)

    const [trucks, setTrucks] = useState<Truck[]>([])

    const [tankerType, setTankerType] = React.useState<string>( "")


    const [truckCapacity, setTruckCapacity] = useState( capacityG? `${capacityG}` :  "")


    const [truckConfig, setTruckConfig] = React.useState("")
    const [truckSuspension, setTruckSuspension] = React.useState("")


    const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(() => {
  if (!cargoAreaG) return null;
  const value = Array.isArray(cargoAreaG) ? cargoAreaG[0] : cargoAreaG;
  return JSON.parse(value);
});

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);


    const [operationCountries, setOperationCountries] = useState<string[]>(() => {
    if (!operationCountriesG) return [];
    if (Array.isArray(operationCountriesG)) return JSON.parse(operationCountriesG[0]);
    return JSON.parse(operationCountriesG);
    });


    const LoadTructs = async () => {
        let filters: any[] = [];

        // Apply filters for truck properties first

        if (userId) filters.push(where("userId", "==", userId));
        if (truckCapacity) filters.push(where("truckCapacity", "==", truckCapacity));
        if (selectedCargoArea) filters.push(where("cargoArea", "==", selectedCargoArea?.name));
        if (tankerType && selectedCargoArea) filters.push(where("tankerType", "==", tankerType))
        // Conditionally add the country filter
        if (operationCountries.length > 0) filters.push(where("locations", "array-contains-any", operationCountries));

        // Fetch data from Firestore with the initially applied filters
        const maTrucks = await fetchDocuments(contractId ? "ContractRequests" : "Trucks", 10, undefined, filters);

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
    }, [truckCapacity, truckConfig, truckSuspension, operationCountries, selectedCargoArea, userId])

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
        if (userId) filters.push(where("userId", "==", userId));
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

            {(!contractId || !userId||!capacityG ) && <View style={{ flex: 1 }}>
                <FinalReturnComponent
                    // ... pass all props
                    showfilter={showfilter}
                    setShowfilter={setShowfilter}
                    truckCapacity={truckCapacity}
                    setTruckCapacity={setTruckCapacity}
                    selectedCargoArea={selectedCargoArea}
                    setSelectedTruckType={setSelectedCargoArea}
                    tankerType={tankerType}
                    setTankerType={setTankerType}
                    operationCountries={operationCountries}
                    setOperationCountries={setOperationCountries}
                    truckConfig={truckConfig}
                    setTruckConfig={setTruckConfig}
                    truckSuspension={truckSuspension}
                    setTruckSuspension={setTruckSuspension}
                    trucks={trucks}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    loadMoreTrucks={loadMoreTrucks}
                    lastVisible={lastVisible}
                    loadingMore={loadingMore}
                    clearFilter={clearFilter}

                />
            </View>}
            {(contractId || userId||capacityG ) && <ScreenWrapper >
                <FinalReturnComponent
                    // ... pass all props
                    showfilter={showfilter}
                    setShowfilter={setShowfilter}
                    truckCapacity={truckCapacity}
                    setTruckCapacity={setTruckCapacity}
                    selectedCargoArea={selectedCargoArea}
                    setSelectedTruckType={setSelectedCargoArea}
                    tankerType={tankerType}
                    setTankerType={setTankerType}
                    operationCountries={operationCountries}
                    setOperationCountries={setOperationCountries}
                    truckConfig={truckConfig}
                    setTruckConfig={setTruckConfig}
                    truckSuspension={truckSuspension}
                    setTruckSuspension={setTruckSuspension}
                    userId={`${userId}`}
                    organisationName={`${organisationName}`}
                    trucks={contractId ? trucks : trucks}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    loadMoreTrucks={loadMoreTrucks}
                    lastVisible={lastVisible}
                    loadingMore={loadingMore}
                    clearFilter={clearFilter}
                    contractName={`${contractName}`}
                    contractId={`${contractId}`}

                />
            </ScreenWrapper>}
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