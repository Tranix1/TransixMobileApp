import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchDocuments } from '@/db/operations';
import { Product } from '@/types/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { hp, wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import ProductComponent from '@/components/ProductComponent';
import { RefreshControl } from 'react-native';

const Index = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [Loads, setLoads] = useState<Product[]>([])
    const [showfilter, setShowfilter] = useState(false)

    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')
    const LoadTructs = async () => {
        const maLoads = await fetchDocuments("Shop");
        console.log(maLoads);

        if (maLoads) {
            setLoads(maLoads.data as Product[])
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

    const loadMore = async () => {

        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        const result = await fetchDocuments('Shop', 10, lastVisible);
        if (result) {
            setLoads([...Loads, ...result.data as Product[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <View style={{
                backgroundColor: background,
                paddingHorizontal: wp(2),
                paddingVertical: wp(1),
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: wp(1),
            }} >
                <View>
                    <ThemedText type="title">
                        Store
                    </ThemedText>
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

                data={Loads}
                renderItem={({ item }) => (
                    <ProductComponent Product={item} />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[accent]}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={.5}
                ListEmptyComponent={<View style={{ minHeight: hp(80), justifyContent: 'center' }}>

                    <ThemedText type='defaultSemiBold' style={{ textAlign: 'center' }}>
                        No Products to Display!
                    </ThemedText>
                    <ThemedText type='tiny' style={{ textAlign: 'center', marginTop: wp(2) }}>
                        pull to refresh
                    </ThemedText>
                </View>}
                ListFooterComponent={
                    <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                        {
                            loadingMore ?
                                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                    <ActivityIndicator size="small" color={accent} />
                                </View>
                                :
                                (!lastVisible && Loads.length > 0) ?
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
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        margin: wp(2),
        flex: 1
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }
})