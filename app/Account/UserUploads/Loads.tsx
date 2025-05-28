import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ToastAndroid, FlatList } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { auth, db } from '../../components/config/fireBase'
import { collection, onSnapshot, where, query, doc, deleteDoc } from 'firebase/firestore'
import { AntDesign, FontAwesome6, Ionicons } from '@expo/vector-icons'
import { useThemeColor } from '@/hooks/useThemeColor'
import { hp, wp } from '@/constants/common'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemedText } from '@/components/ThemedText'
import { Load } from '@/types/types'



const PersonalAccLoads = () => {
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [loadItems, setLoadItems] = useState<Load[]>([])
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
    const bottomSheetRef = useRef<BottomSheet>(null)

    const accent = useThemeColor('accent')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')
    const textColor = useThemeColor('text')
    const icon = useThemeColor('icon')

    const fetchLoads = useCallback(async () => {
        try {
            setLoading(true)
            if (auth.currentUser) {
                const userId = auth.currentUser.uid
                const dataQuery = query(collection(db, "Loads"), where("userId", "==", userId))

                const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
                    const loadedData: Load[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Load)).sort((a, b) => parseInt(b.created_at) - parseInt(a.created_at))

                    setLoadItems(loadedData)
                    setLoading(false)
                })

                return () => unsubscribe()
            }
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLoads()
    }, [fetchLoads])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchLoads()
        setRefreshing(false)
    }

    const deleteLoad = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'Loads', id))
            ToastAndroid.show('Load deleted successfully', ToastAndroid.SHORT)
            bottomSheetRef.current?.close()
        } catch (error) {
            console.error("Delete error:", error)
            ToastAndroid.show('Failed to delete load', ToastAndroid.SHORT)
        }
    }

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.05} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    )

    const openDetails = (item: Load) => {
        setSelectedLoad(item)
        bottomSheetRef.current?.expand()
    }

    const renderItem = ({ item }: { item: Load }) => (
        <TouchableOpacity
            style={[styles.loadCard, { backgroundColor: backgroundLight }]}
            onPress={() => openDetails(item)}
        >
            <View style={styles.loadHeader}>
                <ThemedText type="defaultSemiBold">{item.companyName}</ThemedText>
                <View style={styles.loadTypeBadge}>
                    <ThemedText type="tiny" style={{ color: 'white' }}>
                        {item.typeofLoad}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.loadRoute}>
                <Ionicons name="location-outline" size={wp(4)} color={accent} />
                <ThemedText style={styles.routeText}>
                    {item.fromLocation} → {item.toLocation}
                </ThemedText>
            </View>

            <ThemedText type="default" style={styles.rateText}>
                Rate: {item.ratePerTonne} per tonne
            </ThemedText>
        </TouchableOpacity>
    )

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: background }]}>
                <View style={styles.header}>
                    <ThemedText type="title">My Loads</ThemedText>
                    <ThemedText type="tiny">Manage your posted loads</ThemedText>
                </View>

                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={accent} />
                    </View>
                ) : (
                    <FlatList
                        data={loadItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[accent]}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                    No Loads Posted Yet!
                                </ThemedText>
                                <ThemedText type='tiny' style={styles.emptySubtext}>
                                    Pull to refresh
                                </ThemedText>
                            </View>
                        }
                        contentContainerStyle={styles.listContent}
                    />
                )}

                {/* Load Details Bottom Sheet */}
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={['50%', '75%']}
                    enablePanDownToClose
                    onClose={() => setSelectedLoad(null)}
                    backdropComponent={renderBackdrop}
                    backgroundStyle={{ backgroundColor: background }}
                >
                    <BottomSheetScrollView style={styles.sheetContent}>
                        {selectedLoad && (
                            <>
                                <View style={styles.sheetHeader}>
                                    <ThemedText type="subtitle">{selectedLoad.companyName}</ThemedText>
                                    <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
                                        <AntDesign name="close" size={wp(4)} color={icon} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.detailsContainer}>
                                    <View style={styles.detailRow}>
                                        <ThemedText type="default" style={styles.detailLabel}>Load Type:</ThemedText>
                                        <ThemedText type="defaultSemiBold">{selectedLoad.typeofLoad}</ThemedText>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <ThemedText type="default" style={styles.detailLabel}>Route:</ThemedText>
                                        <ThemedText type="defaultSemiBold">
                                            {selectedLoad.fromLocation} → {selectedLoad.toLocation}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <ThemedText type="default" style={styles.detailLabel}>Rate:</ThemedText>
                                        <ThemedText type="defaultSemiBold">
                                            {selectedLoad.ratePerTonne} per tonne
                                        </ThemedText>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <ThemedText type="default" style={styles.detailLabel}>Payment Terms:</ThemedText>
                                        <ThemedText type="defaultSemiBold">{selectedLoad.paymentTerms}</ThemedText>
                                    </View>

                                    {selectedLoad.requirements && (
                                        <View style={styles.detailSection}>
                                            <ThemedText type="default" style={styles.detailLabel}>
                                                Requirements:
                                            </ThemedText>
                                            <ThemedText type="default">{selectedLoad.requirements}</ThemedText>
                                        </View>
                                    )}

                                    {selectedLoad.additionalInfo && (
                                        <View style={styles.detailSection}>
                                            <ThemedText type="default" style={styles.detailLabel}>
                                                Additional Info:
                                            </ThemedText>
                                            <ThemedText type="default">{selectedLoad.additionalInfo}</ThemedText>
                                        </View>
                                    )}

                                    <View style={styles.contactContainer}>
                                        <ThemedText type="default" style={styles.detailLabel}>Contact:</ThemedText>
                                        <ThemedText type="defaultSemiBold">{selectedLoad.contact}</ThemedText>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: '#ff3b30' }]}
                                    onPress={() => deleteLoad(selectedLoad.id)}
                                >
                                    <FontAwesome6 name="trash" size={wp(4)} color="white" />
                                    <ThemedText style={{ color: 'white', marginLeft: wp(2) }}>
                                        Delete Load
                                    </ThemedText>
                                </TouchableOpacity>
                            </>
                        )}
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(2)
    },
    header: {
        paddingHorizontal: wp(2),
        marginBottom: hp(2)
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp(60)
    },
    emptyText: {
        textAlign: 'center',
        marginBottom: hp(1)
    },
    emptySubtext: {
        textAlign: 'center',
        color: '#888'
    },
    listContent: {
        paddingBottom: hp(2)
    },
    loadCard: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: hp(1),
        marginHorizontal: wp(2)
    },
    loadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1)
    },
    loadTypeBadge: {
        backgroundColor: '#6a0c0c',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(10)
    },
    loadRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(0.5)
    },
    routeText: {
        marginLeft: wp(2)
    },
    rateText: {
        marginTop: hp(0.5)
    },
    sheetContent: {
        paddingHorizontal: wp(4)
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2)
    },
    detailsContainer: {
        marginBottom: hp(3)
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1)
    },
    detailSection: {
        marginBottom: hp(1.5)
    },
    detailLabel: {
        color: '#666'
    },
    contactContainer: {
        marginTop: hp(2),
        paddingTop: hp(2),
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        marginTop: hp(2),
        marginBottom: hp(4)
    }
})

export default PersonalAccLoads