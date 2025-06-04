import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Modal, Linking, ScrollView, ToastAndroid } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { deleteDocument, fetchDocuments } from '@/db/operations';
import { Load } from '@/types/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FlatList } from 'react-native';
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import LoadComponent from '@/components/LoadComponent';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Input from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import { formatCurrency, formatDate } from '@/services/services';
import { LoadsComponent } from '@/components/LoadHomePage';
import { useLocalSearchParams } from 'expo-router'

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
    const [bidLinks, setBidLinks] = useState('');
    const [bidTriaxle, setBidTriaxle] = useState('');
    const [bottomMode, setBottomMode] = useState<'Bid' | 'Book' | ''>('');

    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('background')
    const textColor = useThemeColor('text')
    const LoadTructs = async () => {
        const maLoads = await fetchDocuments("Loads");
        console.log(maLoads);

        if (maLoads.data.length) {
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

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop  {...props} opacity={0.05} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    );


    function toggleCurrencyBid() {
        // setCurrencyBid((prev) => !prev);
    }

    function togglePerTonneBid() {
        // setPerTonneBid((prev) => !prev);
    }

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
        <View style={{flex:1}}>
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
            bottomSheetRef={bottomSheetRef}
            setExpandID={setExpandID}
            showSheet={showSheet}
            setBottomMode={setBottomMode}
            selectedLoad={selectedLoad}
            formatCurrency={formatCurrency}
            toggleCurrencyBid={toggleCurrencyBid}
            setBidRate={setBidRate}
            bidRate={bidRate}
            setBidLinks={setBidLinks}
            bidLinks={bidLinks}
            setBidTriaxle={setBidTriaxle}
            bidTriaxle={bidTriaxle}
            deleteMyLoad={deleteMyLoad}
            renderBackdrop={renderBackdrop} 
            setShowfilter={setShowfilter}
            setShowSheet={setShowSheet}
            bottomMode={bottomMode}
            
            />
            </View>

</View>

    )
}


export default React.memo(Index)

const styles = StyleSheet.create({
    container: {
        padding: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }, detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(1),
    },
})
