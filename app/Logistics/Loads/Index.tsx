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

import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Index = () => {

    const { user } = useAuth();

    const { userId } = useLocalSearchParams();

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
    const LoadTructs = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Filter for approved loads from approved accounts only
            const filters = [
                where("approvalStatus", "==", "approved"),
                where("isApproved", "==", true),
                where("personalAccTypeIsApproved", "==", true)
            ];
            const maLoads = await fetchDocuments("Cargo", 50, undefined, filters);

            if (maLoads.data.length) {
                if (filters.length > 0 && maLoads.data.length < 0) setFilteredPNotAavaialble(true)
                setLoads(maLoads.data as Load[])
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
    }, [])

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
            // Apply same approval filters for pagination
            const filters = [
                where("approvalStatus", "==", "approved"),
                where("isApproved", "==", true),
                where("personalAccTypeIsApproved", "==", true)
            ];
            const result = await fetchDocuments('Cargo', 10, lastVisible, filters);
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
                />
            </View>
        </GestureHandlerRootView>



    )
}


export default React.memo(Index)


