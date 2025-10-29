// https://www.youtube.com/watch?v=QdU6WxHXSxE&list=PLi97PD1Y9JAVb1y4PX9tFTN9Gb0TSEJGB&index=8
import { StyleSheet, View, } from 'react-native'
import React, { useEffect, useId, useState } from 'react'
import { hp, wp } from '@/constants/common'
import { fetchDocuments } from '@/db/operations'
import { Truck } from '@/types/types'
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore'
import { TruckTypeProps } from '@/types/types'
import { useAuth } from '@/context/AuthContext'
import { useLocalSearchParams } from 'expo-router'
import ScreenWrapper from '@/components/ScreenWrapper'
import { FinalReturnComponent } from '@/components/TrucksHomePage'
import AccentRingLoader from '@/components/AccentRingLoader';
import { useThemeColor } from '@/hooks/useThemeColor';
import { HorizontalTickComponent } from '@/components/SlctHorizonzalTick';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Index = () => {

    const { userId, organisationName, contractName, contractId, capacityG, cargoAreaG, truckTypeG, operationCountriesG } = useLocalSearchParams();

    // const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)

    const [trucks, setTrucks] = useState<Truck[]>([])
    const [tankerType, setTankerType] = React.useState<string>("")
    const [truckCapacity, setTruckCapacity] = useState(capacityG ? `${capacityG}` : "")
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
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);

    const [operationCountries, setOperationCountries] = useState<string[]>(() => {
        if (!operationCountriesG) return [];
        if (Array.isArray(operationCountriesG)) return JSON.parse(operationCountriesG[0]);
        return JSON.parse(operationCountriesG);
    });

    const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)
    const [truckVisibility, setTruckVisibility] = useState<'All' | 'Private' | 'Public'>('Private');
    const [currentRole, setCurrentRole] = useState<any>(null);

    useEffect(() => {
        const getCurrentRole = async () => {
            try {
                const roleData = await AsyncStorage.getItem('currentRole');
                if (roleData) {
                    const parsedRole = JSON.parse(roleData);
                    setCurrentRole(parsedRole);
                }
            } catch (error) {
                console.error('Error getting current role:', error);
            }
        };
        getCurrentRole();
    }, []);

    const LoadTructs = async () => {
        try {
            setIsLoading(true);
            let filters: any[] = [];

            // Apply filters for truck properties first
            if (userId) filters.push(where("userId", "==", userId));
            if (truckCapacity) filters.push(where("truckCapacity", "==", truckCapacity));
            if (truckConfig) filters.push(where("truckConfig", "==", truckConfig));
            if (truckSuspension) filters.push(where("truckSuspension", "==", truckSuspension));
            if (selectedCargoArea) filters.push(where("cargoArea", "==", selectedCargoArea?.name));
            if (tankerType && selectedCargoArea) filters.push(where("tankerType", "==", tankerType))
            // Conditionally add the country filter
            if (operationCountries.length > 0) filters.push(where("locations", "array-contains-any", operationCountries.slice(0, 10)));

                if (truckVisibility === 'Public') {
                    filters.push(where("truckVisibility", "==", "Public"));
                }


            // Only show approved trucks to users (except truck owners viewing their own)
            if (userId) {
                filters.push(where("isApproved", "==", true));
                filters.push(where("approvalStatus", "==", "approved"));
            }

            console.log("Filters applied:", filters);

            // Fetch data from Firestore with the initially applied filters
            let collectionName = contractId ? "ContractRequests" : "Trucks";

            // If user is in fleet mode and viewing private trucks, fetch from fleet subcollection
            if ( currentRole?.accType === 'fleet' && truckVisibility === 'Private') {
                collectionName = `fleets/${currentRole.fleetId}/Trucks`;
            }

            const maTrucks = await fetchDocuments(collectionName, 10, undefined, filters);

            let trucksToSet: Truck[] = [];

            if (maTrucks && maTrucks.data) {
                if (filters.length > 0 && maTrucks.data.length <= 0) setFilteredPNotAavaialble(true)

                // If locationTruckS is true, we need to do the client-side filtering for ALL selected countries
                if (operationCountries.length > 0) {
                    trucksToSet = (maTrucks.data as Truck[]).filter(truck =>
                        operationCountries.every(country => truck.locations?.includes(country))
                    );
                } else {
                    // Otherwise, use the data as fetched (which would be filtered only by truck properties)
                    trucksToSet = maTrucks.data as Truck[];
                }

                // Apply truck visibility filter
                if (truckVisibility !== 'All') {
                    trucksToSet = trucksToSet.filter((truck: any) => truck.truckVisibility === truckVisibility);
                }

                setTrucks(trucksToSet);
                setLastVisible(maTrucks.lastVisible);
            } else {
                // If no data, set empty array
                setTrucks([]);
                setLastVisible(null);
            }
        } catch (error) {
            console.error('Error loading trucks:', error);
        } finally {
            setIsLoading(false);
            setHasLoaded(true);
        }
    };

    useEffect(() => {
        LoadTructs();
    }, [truckCapacity, truckConfig, truckSuspension, operationCountries, selectedCargoArea, userId, truckVisibility])

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            clearFilter()
            await LoadTructs();
            setRefreshing(false);

        } catch (error) {

        }
    };

    const [showfilter, setShowfilter] = useState(false)

    const loadMoreTrucks = async () => {
        if (loadingMore || !lastVisible) return;
        let filters: any[] = [];

        setLoadingMore(true);

        // Apply the same filters as in LoadTructs
        if (userId) filters.push(where("userId", "==", userId));
        if (truckCapacity) filters.push(where("truckCapacity", "==", truckCapacity));
        if (truckConfig) filters.push(where("truckConfig", "==", truckConfig));
        if (truckSuspension) filters.push(where("truckSuspension", "==", truckSuspension));
        if (selectedCargoArea) filters.push(where("cargoArea", "==", selectedCargoArea?.name));
        if (tankerType && selectedCargoArea) filters.push(where("tankerType", "==", tankerType));
        if (operationCountries.length > 0) {
            // Firestore limits to 10 elements in array-contains-any
            filters.push(where("locations", "array-contains-any", operationCountries.slice(0, 10)));
        }

        if (truckVisibility === 'Public') {
            filters.push(where("truckVisibility", "==", "Public"));
        }

        // Only show approved trucks to users (except truck owners viewing their own)
        if (!userId) {
            filters.push(where("isApproved", "==", true));
            filters.push(where("approvalStatus", "==", "approved"));
        }

        // Fetch data from Firestore with the initially applied filters
        let collectionName = contractId ? "ContractRequests" : "Trucks";

        // If user is in fleet mode and viewing private trucks, fetch from fleet subcollection
        if ( currentRole?.accType === 'fleet' && truckVisibility === 'Private') {
            collectionName = `fleets/${currentRole.fleetId}/Trucks`;
        }

        // Fetch with pagination
        const result = await fetchDocuments(collectionName, 10, lastVisible, filters);

        if (result && result.data) {
            let newTrucks = result.data as Truck[];

            // Apply client-side filtering for "must include all selected countries"
            if (operationCountries.length > 0) {
                newTrucks = newTrucks.filter(truck =>
                    operationCountries.every(country => truck.locations?.includes(country))
                );
            }

            // Apply truck visibility filter
            if (truckVisibility !== 'All') {
                newTrucks = newTrucks.filter((truck: any) => truck.truckVisibility === truckVisibility);
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
            {/* Truck Visibility Selector */}
            {currentRole?.role === 'fleet' && currentRole?.accType === 'fleet' && (
                    <HorizontalTickComponent
                        data={[
                            { topic: "Private", value: "Private" },
                            { topic: "Public", value: "Public" }
                        ]}
                        condition={truckVisibility}
                        onSelect={setTruckVisibility}
                    />
            )}

            {(!contractId || !userId || !capacityG) && <View style={{ flex: 1 }}>
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
                    trucks={trucks}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    loadMoreTrucks={loadMoreTrucks}
                    lastVisible={lastVisible}
                    loadingMore={loadingMore}
                    clearFilter={clearFilter}
                    fleetId={currentRole?.accType === 'fleet' ? currentRole.fleetId : undefined}
                    filteredPNotAavaialble={filteredPNotAavaialble}
                />
            </View>}
            {(contractId || userId || capacityG) && <ScreenWrapper >
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
                    filteredPNotAavaialble={filteredPNotAavaialble}
                    isLoading={isLoading}
                    hasLoaded={hasLoaded}
                />
            </ScreenWrapper>}
        </View>
    )
}

export default Index


