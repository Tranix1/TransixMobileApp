import { View, ToastAndroid } from 'react-native'
import React, { useEffect, useState, } from 'react'
import { addDocument, checkDocumentExists, fetchDocuments, runFirestoreTransaction, setDocuments } from '@/db/operations';
import { Load } from '@/types/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { LoadsComponent } from '@/components/LoadHomePage';
import { router, useLocalSearchParams } from 'expo-router'
import { auth } from '@/db/fireBaseConfig';
import { where, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HorizontalTickComponent } from '@/components/SlctHorizonzalTick';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Timestamp } from 'firebase/firestore';


const Index = () => {

    const { user ,currentRole} = useAuth();

    const { userId, cargoId, cargoVisibilityG } = useLocalSearchParams();

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [Loads, setLoads] = useState<Load[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showfilter, setShowfilter] = useState(false)
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showSheet, setShowSheet] = useState(false);
    const [expandId, setExpandID] = useState('');
    const [bidRate, setBidRate] = useState('');
    const [currencyBid, setCurrencyBid] = useState('');


    const [bottomMode, setBottomMode] = useState<'Bid' | 'Book' | ''>('');

    const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)
    const [loadVisibility, setLoadVisibility] = useState<'Private' | 'Public'>('Private');
    // const [currentRole, setCurrentRole] = useState<any>(null);

   

    const LoadTructs = async () => {
        try {
            setIsLoading(true)
            setError(null)


            let filters: any[] = [];
            let collectionName: string | null = null;

            // =============================
            // CARGO ID MODE (EXACT LOAD)
            // =============================
            if (cargoId) {

                if (cargoVisibilityG === 'PUBLIC') {

                    filters = [
                        where("approvalStatus", "==", "approved"),
                        where("cargoId", "==", cargoId),
                    ];
                    // Public cargo always lives here
                    collectionName = "Cargo";

                } else if (cargoVisibilityG === 'PRIVATE') {
                    filters = [
                        where("cargoId", "==", cargoId),
                    ];
                    // Private cargo belongs to owner
                    if (currentRole?.accType === "fleet" || currentRole.accType ==="driver" ) {
                        collectionName = `fleets/${currentRole.fleetId}/Cargo`;

                    } else if (currentRole?.accType === "brokerage") {
                        collectionName = `brokers/${currentRole.brokerId}/Cargo`;
                    }
                }


            }
            // =============================
            // NORMAL LIST MODE
            // =============================
            else {

                if (currentRole?.accType === "fleet" && loadVisibility === "Private") {

                    collectionName = `fleets/${currentRole.fleetId}/Cargo`;



                } else if (
                    currentRole?.accType === "brokerage" &&
                    loadVisibility === "Private"
                ) {
                    collectionName = `brokerages/${currentRole.organizationId}/Cargo`;


                } else {

                    collectionName = "Cargo";

                    filters = [
                        where("approvalStatus", "==", "approved"),
                        where("state", "==", "available"),
                        where("expiresAt", ">", Timestamp.now()),
                    ];
                }
            }


            // Safety
            if (!collectionName) {
                console.log("No cargo source found");
                return [];
            }


            const maLoads = await fetchDocuments(
                collectionName,
                50,
                undefined,
                filters
            );



            if (maLoads.data.length) {
                if (filters.length > 0 && maLoads.data.length < 0) setFilteredPNotAavaialble(true)
                setLoads(maLoads.data as Load[])
                console.log('Loads fetched:', maLoads.data);
                setLastVisible(maLoads.lastVisible)
            } else {
                setLoads([])
                setLastVisible(null)
            }
        } catch (error) {
            console.error('Error loading loads:', error)
            setError('Failed to load loads. Please try again.')
            ToastAndroid.show('Failed to load loads', ToastAndroid.SHORT)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        LoadTructs();
    }, [loadVisibility, currentRole])

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            setError(null);
            await LoadTructs();
        } catch (error) {
            console.error('Error refreshing loads:', error);
            setError('Failed to refresh loads. Please try again.');
            ToastAndroid.show('Failed to refresh loads', ToastAndroid.SHORT);
        } finally {
            setRefreshing(false);
        }
    };

    const loadMoreLoads = async () => {
        if (loadingMore || !lastVisible) return;

        try {
            setLoadingMore(true);
            setError(null);

            let filters: any[] = [];
            let collectionName: string | null = null;


            // Apply same filters as in LoadTructs for pagination
            if (currentRole?.accType === 'fleet' && loadVisibility === 'Private') {
                collectionName = `fleets/${currentRole.fleetId}/Cargo`;

            } else if (currentRole?.accType === 'brokerage' && loadVisibility === 'Private') {
                collectionName = `brokerages/${currentRole.fleetId}/Cargo`;

            } else {
                filters = [
                    where("approvalStatus", "==", "approved"),
                    where("isApproved", "==", true),
                    where("personalAccTypeIsApproved", "==", true)
                ];

                if (loadVisibility === 'Public') {
                    filters.push(where("loadVisibility", "==", "Public"));
                    collectionName = "Cargo"
                }
            }

            if (!collectionName) {
                throw new Error("Collection name is required");
            }

            const result = await fetchDocuments(collectionName, 10, lastVisible, filters);

            if (result) {
                setLoads([...Loads, ...result.data as Load[]]);
                setLastVisible(result.lastVisible);
            }
        } catch (error) {
            console.error('Error loading more loads:', error);
            setError('Failed to load more loads. Please try again.');
            ToastAndroid.show('Failed to load more loads', ToastAndroid.SHORT);
        } finally {
            setLoadingMore(false);
        }
    };


    return (
        <GestureHandlerRootView style={{ flex: 1, }}>

            <View style={{ flex: 1 }}>

                <LoadsComponent
                    Loads={Loads}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    loadMoreLoads={loadMoreLoads}
                    lastVisible={lastVisible}
                    loadingMore={loadingMore}
                    expandId={expandId}
                    setSelectedLoad={setSelectedLoad}
                    setExpandID={setExpandID}
                    setBottomMode={setBottomMode}
                    selectedLoad={selectedLoad}
                    setBidRate={setBidRate}
                    bidRate={bidRate}
                    setShowfilter={setShowfilter}
                    setShowSheet={setShowSheet}
                    bottomMode={bottomMode}
                    organisationName={"Username"}
                    userId={userId}
                    filteredPNotAavaialble={filteredPNotAavaialble}
                    isLoading={isLoading}
                    error={error}
                    visibilitySelector={
                        !cargoVisibilityG ?
                        <HorizontalTickComponent
                            data={[
                                { topic: "Private", value: "Private" },
                                { topic: "Public", value: "Public" },
                                { topic: "Network", value: "Network" },
                            ]}
                            condition={loadVisibility}
                            onSelect={setLoadVisibility}
                        /> : null
                    }
                    loadVisibility={loadVisibility}
                    cargoVisibilityG={`${cargoVisibilityG}`}
                />
            </View>
        </GestureHandlerRootView>



    )
}


export default React.memo(Index)


