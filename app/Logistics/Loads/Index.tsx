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

    const { user, currentRole } = useAuth();

    const { userId, cargoId, cargoVisibilityG } = useLocalSearchParams();

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [Loads, setLoads] = useState<Load[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [hasMoreLoads, setHasMoreLoads] = useState(true);
    const [error, setError] = useState<string | null>(null)

    const [showfilter, setShowfilter] = useState(false)
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showSheet, setShowSheet] = useState(false);
    const [expandId, setExpandID] = useState('');
    const [bidRate, setBidRate] = useState('');
    const [currencyBid, setCurrencyBid] = useState('');


    const [bottomMode, setBottomMode] = useState<'Bid' | 'Book' | ''>('');

    const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)
    const [loadVisibility, setLoadVisibility] = useState<'Private' | 'Public' |"Network">('Private');
    const [loadVisibilityBfr, setLoadVisibilityBfr] = useState<'Private' | 'Public' |"Network">('Private');
    
    // const [currentRole, setCurrentRole] = useState<any>(null);
    const [expireAvailableLoads, setExpiredAvailableLods] = React.useState<"ALL" | "AVAILABLE" | "EXPIRED">("ALL")
    const [selectedAccountType, setSelectedAccountType] = React.useState<"ALL" | "BROKERAGE" | "Fleet" | "DRIVER">("ALL")


        
const LoadTructs = async () => {

    const nowTimeStamp = Timestamp.now();

    try {

        setIsLoading(true);
        setError(null);
        setHasMoreLoads(true);
        setLastVisible(null);


        let filters: any[] = [];
        let collectionName: string | null = null;


        if (loadVisibility === "Network") {

            filters = selectedAccountType !== "ALL"
                ? [
                    where("type", "==", selectedAccountType.toLowerCase()),
                    where("verificationStatus", "==", "approved"),
                ]
                : [
                    where("verificationStatus", "==", "approved"),
                ];

            collectionName = "organizationProfiles";


        } else if (cargoId) {


            filters = [
                where("cargoId", "==", cargoId),
            ];


            if (cargoVisibilityG === "PUBLIC") {

                filters.push(
                    where("approvalStatus", "==", "approved")
                );

                collectionName = "Cargo";


            } else {

                if (
                    currentRole?.accType === "fleet" ||
                    currentRole?.accType === "driver"
                ) {

                    collectionName =
                        `fleets/${currentRole.fleetId}/Cargo`;

                } 
                else if (currentRole?.accType === "brokerage") {

                    collectionName =
                        `brokerages/${currentRole.organizationId}/Cargo`;
                }
            }


        } else {


            if (
                currentRole?.accType === "fleet" &&
                loadVisibility === "Private"
            ) {

                collectionName =
                    `fleets/${currentRole.fleetId}/Cargo`;


            } else if (
                currentRole?.accType === "brokerage" &&
                loadVisibility === "Private"
            ) {

                collectionName =
                    `brokerages/${currentRole.organizationId}/Cargo`;


            } else {

                collectionName = "Cargo";


                filters = [
                    where("approvalStatus", "==", "approved"),
                    where("state", "==", "available"),
                    where(
                        "expiresAt",
                        expireAvailableLoads === "EXPIRED" ? "<=" : ">",
                        nowTimeStamp
                    ),
                ];


                if(expireAvailableLoads === "AVAILABLE"){

                    filters.push(
                        where(
                            "organizationId",
                            "==",
                            currentRole.organizationId
                        )
                    );

                }
            }
        }



        if(!collectionName){
            setLoads([]);
            return;
        }



            const result = await fetchDocuments(
                collectionName,
                50,
                undefined,
                filters
            );



        const data = result.data as Load[];



        setLoads(data);


        setLastVisible(result.lastVisible || null);



        // stop pagination if less than 50
        if(!result.lastVisible || data.length < 50){
            setHasMoreLoads(false);
        }


        console.log("Initial loads:", data.length);



    } catch(error){

        console.log(error);

        setError(
            "Failed to load loads. Please try again."
        );


    } finally {

        setIsLoading(false);

    }
};
        useEffect(() => {
            
            LoadTructs();
        }, [loadVisibility, currentRole, expireAvailableLoads ,selectedAccountType])
        

        useEffect(()=>{
            setLoads([])
    setLoadVisibility(loadVisibilityBfr)
        },[loadVisibilityBfr])

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


        if(
            loadingMore ||
            !lastVisible ||
            !hasMoreLoads
        ){
            return;
        }



        try {

            setLoadingMore(true);


            const nowTimeStamp = Timestamp.now();


            let filters:any[] = [];
            let collectionName:string | null = null;



            if(loadVisibility === "Network"){


                filters =
                selectedAccountType !== "ALL"
                ?
                [
                    where("type","==",selectedAccountType),
                    where(
                        "verificationStatus",
                        "==",
                        "approved"
                    )
                ]
                :
                [
                    where(
                        "verificationStatus",
                        "==",
                        "approved"
                    )
                ];


                collectionName =
                    "organizationProfiles";



            } else {


                collectionName = "Cargo";


                filters = [
                    where(
                        "approvalStatus",
                        "==",
                        "approved"
                    ),
                    where(
                        "state",
                        "==",
                        "available"
                    ),
                    where(
                        "expiresAt",
                        ">",
                        nowTimeStamp
                    ),
                ];

            }



            if(!collectionName){
                return;
            }



            const result = await fetchDocuments(
                collectionName,
                50,
                lastVisible,
                filters
            );



            const newData = result.data as Load[];



            if(newData.length === 0){

                setHasMoreLoads(false);
                setLastVisible(null);
                return;

            }



            setLoads(prev => {


                const existingIds = new Set(
                    prev.map(item=>item.cargoId)
                );


                const unique = newData.filter(
                    item=>!existingIds.has(item.cargoId)
                );


                return [
                    ...prev,
                    ...unique
                ];

            });



            setLastVisible(
                result.lastVisible || null
            );



            if(
                !result.lastVisible ||
                newData.length < 50
            ){

                setHasMoreLoads(false);

            }



        } catch(error){

            console.log(
                "Load more error",
                error
            );


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
                                condition={loadVisibilityBfr}
                                onSelect={setLoadVisibilityBfr}

                            /> : null
                    }
                    setExpiredAvailableLods={setExpiredAvailableLods}
                    expireAvailableLoads={expireAvailableLoads}
                    setSelectedAccountType={setSelectedAccountType}
                    selectedAccountType ={selectedAccountType}
                    loadVisibility={loadVisibility}
                    cargoVisibilityG={`${cargoVisibilityG}`}
                />
            </View>
        </GestureHandlerRootView>



    )
}


export default React.memo(Index)

