import {  View, ToastAndroid } from 'react-native'
import React, { useEffect, useState,} from 'react'
import { addDocument, checkDocumentExists, fetchDocuments, runFirestoreTransaction, setDocuments } from '@/db/operations';
import { Load } from '@/types/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { LoadsComponent } from '@/components/LoadHomePage';
import { router, useLocalSearchParams } from 'expo-router'
import { auth } from '@/app/components/config/fireBase';
import { where,serverTimestamp } from 'firebase/firestore';

import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Index = () => {

    const { user } = useAuth();

  const { userId } = useLocalSearchParams();

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [Loads, setLoads] = useState<Load[]>([])

    const [showfilter, setShowfilter] = useState(false)
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showSheet, setShowSheet] = useState(false);
    const [expandId, setExpandID] = useState('');
    const [bidRate, setBidRate] = useState('');
    const [currencyBid, setCurrencyBid] = useState('');


    const [bottomMode, setBottomMode] = useState<'Bid' | 'Book' | ''>('');
    
const [filteredPNotAavaialble ,setFilteredPNotAavaialble ] = React.useState(false)
    const LoadTructs = async () => {
      let filters: any[] = [];
        const maLoads = await fetchDocuments("Cargo");

        if (maLoads.data.length) {

            if(filters.length > 0 && maLoads.data.length < 0 )setFilteredPNotAavaialble(true)
            setLoads(maLoads.data as Load[])
            setLastVisible(maLoads.lastVisible)
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

    const loadMoreLoads = async () => {

        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        const result = await fetchDocuments('Cargo', 10, lastVisible);
        if (result) {
            setLoads([...Loads, ...result.data as Load[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };



 



    return (
                <GestureHandlerRootView style={{ flex: 1,}}>

            <View style={{flex:1}}>

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
            userId ={userId}
            filteredPNotAavaialble={filteredPNotAavaialble}
            />
            </View>
                </GestureHandlerRootView>



    )
}


export default React.memo(Index)


