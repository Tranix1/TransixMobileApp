import {  View, ToastAndroid } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { addDocument, checkDocumentExists, deleteDocument, fetchDocuments, runFirestoreTransaction, setDocuments } from '@/db/operations';
import { Load } from '@/types/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import BottomSheet, { BottomSheetBackdrop,  } from '@gorhom/bottom-sheet';
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
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [expandId, setExpandID] = useState('');
    const [bidRate, setBidRate] = useState('');
    const [currencyBid, setCurrencyBid] = useState('');
    const [modelBid, setModelBid] = useState('');


    const [bottomMode, setBottomMode] = useState<'Bid' | 'Book' | ''>('');
    
const [filteredPNotAavaialble ,setFilteredPNotAavaialble ] = React.useState(false)
    const LoadTructs = async () => {
      let filters: any[] = [];
        const maLoads = await fetchDocuments("Loads");

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
        const result = await fetchDocuments('Loads', 10, lastVisible);
        if (result) {
            setLoads([...Loads, ...result.data as Load[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };




 const submitBidsOBookings = async (
    dbName : string
    , item : Load
    
    ) => {

        const userId = auth.currentUser?.uid
        try {
           let theRate= dbName ==="" ? bidRate : item.rate  
            let docId = `${userId}${item.typeofLoad}${theRate}${item.userId}`
           let theCurrency= dbName ==="" ? currencyBid : item.currency
           let theModel = dbName === ""?modelBid : item.model 


          let alreadyBokedLoad 
            if(dbName === "bookings" )alreadyBokedLoad  = await checkDocumentExists("bookings" , [where('docId', '==',docId ) ] );
            
            //   let submitexpoPushToken = item.expoPushToken ? item.expoPushToken : null



          if(  !alreadyBokedLoad ){

        if(item.isVerified){

        router.push({pathname :`/Account/UserUploads/Loads`, params: { 

        loadItem: JSON.stringify(item),
        contact :  user?.phoneNumber ,
        ownerName:user?.organisation ,
        bookerId : userId ,
        Accept : null ,
        msgReceiverId : userId ,
        docId : docId,
        rate :  theRate ,
        currency : theCurrency ,
        model :  theModel ,
        deletionTime :Date.now() + 4 * 24 * 60 * 60 * 1000 ,
        dbName : dbName ,
        // expoPushToken : submitexpoPushToken,
        // sendPushNotification : sendPushNotification ,


      }
    
    } )
              return 
            }else{
    

        let message  =`${item.typeofLoad} ${dbName === "bookings" ? "Booked" : "Bidded"} Rate ${item.rate} `
        let tittle = `From ${item.fromLocation} to ${item.toLocation} `
        // if(item.expoPushToken){

        // //   await sendPushNotification(item.expoPushToken, message , tittle,dbName );
        // }

        
        const docRef = await addDocument(dbName, {
       docId : docId,
       loadItem: item,  
        contact :  user?.phoneNumber ,
        ownerName:user?.organisation ,
        bookerId : userId ,
        Accept : null ,
        msgReceiverId : userId ,
        rate :  theRate ,
        currency : theCurrency ,
        model :  theModel ,
        perTonneB :  theModel ,
        deletionTime :Date.now() + 5 * 24 * 60 * 60 * 1000 ,
      }
      );
            console.log("Donee submitting")
      
            }
     
        // alert(`${!bidDisplay[item.id] ? "booking": "bidding"} was successfull`)    
        }else {
          alert(`Already ${ dbName ==="bookings" ? "booked": "bidded"} this Item!`)    

        }
        
          const existingBBDoc = await checkDocumentExists("newIterms" , [where('receriverId', '==', userId)] );
        // const existingChat = await checkExistingChat(addChatId);
        let newBiddedDoc = 0
        let newBOOKEDDoc = 0

        dbName === "bookings" ? newBOOKEDDoc = 1  : newBiddedDoc = 1
      // Chat doesn't exist, add it to 'ppleInTouch'
      if(!existingBBDoc){
        setDocuments("bidBookingStats" ,{
        bookingdocs : newBOOKEDDoc ,
        biddingdocs : newBiddedDoc ,
        timestamp : serverTimestamp() ,
        receriverId : item.userId ,
        }  )
    
    }
    else{

   await runFirestoreTransaction(`bidBookingStats/${userId}`, (data) => {
    const currentBiddingDocs = data?.biddingdocs || 0;
    const currentBookingsDocs = data?.bookingdocs || 0;

    return {
        biddingdocs: dbName !== "bookings" ? currentBiddingDocs + 1 : currentBiddingDocs,
        bookingdocs: dbName === "bookings" ? currentBookingsDocs + 1 : currentBookingsDocs,
    };
});


    }
      
    //   setSpinnerItem(null)      

    } catch (err) {
    //   setBookingError(err.toString());
    //   setSpinnerItem(null)      
    }
  };  



 
    const deleteMyLoad = async (loadID: string) => {

        try {
            const deleting = await deleteDocument('Loads', loadID)

            if (deleting) {
                bottomSheetRef.current?.close();
                ToastAndroid.show('Successfully Deleted My Load', ToastAndroid.SHORT)
                onRefresh()
            }
        } catch (error) {

        }

    }


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
            deleteMyLoad={deleteMyLoad}
            setShowfilter={setShowfilter}
            setShowSheet={setShowSheet}
            bottomMode={bottomMode}
            submitBidsOBookings={submitBidsOBookings}  
            organisationName={"Username"}
            userId ={userId}
            filteredPNotAavaialble={filteredPNotAavaialble}
            />
            </View>
                </GestureHandlerRootView>



    )
}


export default React.memo(Index)


