import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Linking, ToastAndroid, ScrollView } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { deleteDocument, fetchDocuments } from '@/db/operations'
import { Product } from '@/types/types'
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { ThemedText } from '@/components/ThemedText'
import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { FlatList } from 'react-native'
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import ProductComponent from '@/components/ProductComponent'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Input from '@/components/Input'
import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router'
import { formatCurrency } from '@/services/services'
import { color } from 'react-native-elements/dist/helpers'
import { SpecifyProductDetails } from '@/components/SpecifyProductInStore'
import { Countries } from '@/data/appConstants'

const StorePage = () => {
    const { user } = useAuth()

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [showFilter, setShowFilter] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [showSheet, setShowSheet] = useState(false)
    const [expandId, setExpandId] = useState('')
    const [bottomMode, setBottomMode] = useState<'Offer' | 'Inquiry' | ''>('')
    const [offerPrice, setOfferPrice] = useState('')

    const bottomSheetRef = useRef<BottomSheet>(null)

    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')
    const textColor = useThemeColor('text')

    const loadProducts = async () => {
        const result = await fetchDocuments("products")
        if (result.data?.length) {
            setProducts(result.data as Product[])
            setLastVisible(result.lastVisible)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [])

    const onRefresh = async () => {
        try {
            setRefreshing(true)
            await loadProducts()
            setRefreshing(false)
        } catch (error) {
            console.error("Refresh error:", error)
        }
    }

    const loadMoreProducts = async () => {
        if (loadingMore || !lastVisible) return
        setLoadingMore(true)
        const result = await fetchDocuments('products', 10, lastVisible)
        if (result) {
            setProducts([...products, ...result.data as Product[]])
            setLastVisible(result.lastVisible)
        }
        setLoadingMore(false)
    }

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.05} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    )

    const deleteMyProduct = async (productId: string) => {
        try {
            const deleting = await deleteDocument('Shop', productId)
            if (deleting) {
                bottomSheetRef.current?.close()
                ToastAndroid.show('Product deleted successfully', ToastAndroid.SHORT)
                onRefresh()
            }
        } catch (error) {
            console.error("Delete error:", error)
        }
    }

    const handleContact = (method: 'whatsapp' | 'call' | 'message') => {
        if (!selectedProduct?.seller.contact) return

        const message = `${selectedProduct.seller.name}\n${selectedProduct.productModel}\n${selectedProduct.description}\nPrice: ${formatCurrency(selectedProduct.price, 0, selectedProduct.currency)}`

        switch (method) {
            case 'whatsapp':
                Linking.openURL(`whatsapp://send?phone=${selectedProduct.seller.contact}&text=${encodeURIComponent(message)}`)
                break
            case 'call':
                Linking.openURL(`tel:${selectedProduct.seller.contact}`)
                break
            case 'message':
                // Implement your messaging logic
                break
        }
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

            <View style={[styles.container, { backgroundColor: background }]}>
                <View style={[styles.header, { backgroundColor: background }]}>
                    <View>
                        <ThemedText type="title">Store</ThemedText>
                        <ThemedText type="tiny">Find products for sale or trade</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: wp(2) }}>
                        <TouchableNativeFeedback onPress={() => setShowFilter(true)}>
                            <View style={styles.filterButton}>
                                <Ionicons name={'filter'} size={wp(4)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>

                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                   {Countries.map((item)=>(
                    <TouchableOpacity key={item.id} >
                        <ThemedText>{item.name} </ThemedText>
                    </TouchableOpacity>
                   )) }
                </ScrollView>
                
                <View style={{flexDirection:"row",justifyContent:"space-evenly"}}>
                    <TouchableOpacity>

                    <ThemedText>Showroom</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity>

                    <ThemedText>Trailers</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity>

                    <ThemedText>Spares </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity>

                    <ThemedText>Service Provider</ThemedText>
                    </TouchableOpacity>
                </View>
                
              


        <SpecifyProductDetails
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        />








                <FlatList
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    data={products}
                    renderItem={({ item }) => (
                        <ProductComponent
                            product={item}
                            expandID={expandId}
                            expandId={(id) => setExpandId(id)}
                            onDetailsPress={() => {
                                setSelectedProduct(item)
                                setShowSheet(true)
                                setTimeout(() => {
                                    bottomSheetRef.current?.expand()
                                }, 10)
                            }}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[accent]}
                        />
                    }
                    onEndReached={loadMoreProducts}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                No Products to Display!
                            </ThemedText>
                            <ThemedText type='tiny' style={styles.emptySubtext}>
                                pull to refresh
                            </ThemedText>
                        </View>
                    }
                    ListFooterComponent={
                        <View style={styles.footer}>
                            {loadingMore ? (
                                <View style={styles.loadingContainer}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                    <ActivityIndicator size="small" color={accent} />
                                </View>
                            ) : (!lastVisible && products?.length > 0) ? (
                                <View style={styles.noMoreContainer}>
                                    <ThemedText type='tiny' style={[styles.noMoreText, { color: icon }]}>
                                        No more products to display
                                    </ThemedText>
                                    <Ionicons color={icon} name='alert-circle-outline' size={wp(6)} />
                                </View>
                            ) : null}
                        </View>
                    }
                />

                {/* Product Details Bottom Sheet */}
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    enableContentPanningGesture={false}
                    enablePanDownToClose
                    onClose={() => { setShowSheet(false); setBottomMode('') }}
                    backdropComponent={renderBackdrop}
                    backgroundStyle={{ backgroundColor: background }}
                    containerStyle={{ paddingBottom: wp(14) }}
                    handleStyle={{ borderTopEndRadius: wp(5), borderTopStartRadius: wp(5) }}
                >
                    <BottomSheetView>
                        <View style={styles.sheetContainer}>
                            <View style={styles.sheetHeader}>
                                {selectedProduct && (
                                    <ThemedText type="subtitle">{selectedProduct.productModel}</ThemedText>
                                )}
                                <TouchableOpacity
                                    onPress={() => bottomSheetRef.current?.close()}
                                    style={styles.closeButton}
                                >
                                    <AntDesign name="close" size={wp(4)} color={icon} />
                                </TouchableOpacity>
                            </View>

                            {selectedProduct ? (
                                <>
                                    {bottomMode === '' && (
                                        <View style={[styles.productDetails, { backgroundColor: backgroundLight }]}>
                                            <View style={styles.detailSection}>


                                                  <View style={styles.detailRow}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Category
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold'>
                                                        {selectedProduct.vehicleType}
                                                    </ThemedText>
                                                </View>
                                                  <View style={styles.detailRow}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Body Style
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold'>
                                                        {selectedProduct.bodyStyle}
                                                    </ThemedText>
                                                </View>


                                         
                                                <View style={styles.detailRow}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Condition
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold'>
                                                        {selectedProduct.condition === 'new' ? 'New' : 'Used'}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.detailRow}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Price
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold'>
                                                        {formatCurrency(selectedProduct.price, 0, selectedProduct.currency)}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.detailRow}>
                                                    <ThemedText type='default' style={{ color: coolGray }}>
                                                        Location
                                                    </ThemedText>
                                                    <ThemedText type='defaultSemiBold'>
                                                        {selectedProduct.location.city}
                                                    </ThemedText>
                                                </View>
                                            </View>

                                            <View style={styles.descriptionContainer}>
                                                <ThemedText type='default' style={{ color: coolGray }}>
                                                    Description
                                                </ThemedText>
                                                <ThemedText type='default' style={styles.descriptionText}>
                                                    {selectedProduct.description}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    )}

                                    {bottomMode === 'Offer' && (
                                        <View style={[styles.offerContainer, { backgroundColor: accent }]}>
                                            <ThemedText type='subtitle' color={coolGray} style={styles.offerTitle}>
                                                Make an Offer
                                            </ThemedText>
                                            <Input
                                                onChangeText={setOfferPrice}
                                                value={offerPrice}
                                                keyboardType="numeric"
                                                placeholderTextColor={coolGray}
                                                placeholder={`Offer price in ${selectedProduct.currency}`}
                                                style={styles.offerInput}
                                            />
                                            <View style={styles.offerActions}>
                                                <TouchableOpacity
                                                    onPress={() => setBottomMode('')}
                                                    style={[styles.actionButton, { backgroundColor: coolGray }]}
                                                >
                                                    <ThemedText style={{ color: 'white' }}>Cancel</ThemedText>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, { backgroundColor: accent }]}
                                                >
                                                    <ThemedText style={{ color: 'white' }}>Submit Offer</ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {selectedProduct.seller.id !== user?.uid && (
                                        <>
                                            {bottomMode === '' && (
                                                <>
                                                    <TouchableOpacity
                                                        style={[styles.primaryAction, { backgroundColor: accent }]}
                                                        onPress={() => setBottomMode('Offer')}
                                                    >
                                                        <ThemedText color='white'>Make an Offer</ThemedText>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.primaryAction, { backgroundColor: coolGray }]}
                                                        onPress={() => setBottomMode('Inquiry')}
                                                    >
                                                        <ThemedText color='white'>Send Inquiry</ThemedText>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </>
                                    )}

                                    <View style={styles.contactOptions}>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                onPress={() => handleContact('message')}
                                                style={[styles.contactButton, { backgroundColor: coolGray }]}
                                            >
                                                <Ionicons name="chatbubble-ellipses" size={wp(5)} color={'white'} />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Message</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                onPress={() => handleContact('whatsapp')}
                                                style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                                            >
                                                <FontAwesome6 name="whatsapp" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>WhatsApp</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                onPress={() => handleContact('call')}
                                                style={[styles.contactButton, { backgroundColor: '#0074D9' }]}
                                            >
                                                <MaterialIcons name="call" size={wp(5)} color="#fff" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Call</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#4285f45a' }]}
                                            >
                                                <Ionicons name="copy" size={wp(5)} color="#4285f4" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Copy Link</ThemedText>
                                        </View>
                                        <View style={styles.contactOption}>
                                            <TouchableOpacity
                                                style={[styles.contactButton, { backgroundColor: '#7373735a' }]}
                                            >
                                                <Ionicons name="arrow-redo" size={wp(5)} color="#737373" />
                                            </TouchableOpacity>
                                            <ThemedText type='tiny'>Share</ThemedText>
                                        </View>
                                    </View>

                                    {selectedProduct.seller.id === user?.uid && (
                                        <BottomSheetScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.ownerActions}
                                        >
                                            <View style={styles.ownerAction}>
                                                <TouchableOpacity
                                                    style={[styles.ownerButton, { backgroundColor: accent }]}
                                                    onPress={() => router.push('/Account/Edit')}
                                                >
                                                    <FontAwesome6 name="edit" size={wp(5)} color={'white'} />
                                                </TouchableOpacity>
                                                <ThemedText type='tiny'>Edit</ThemedText>
                                            </View>
                                            <View style={styles.ownerAction}>
                                                <TouchableOpacity
                                                    onPress={() => deleteMyProduct(selectedProduct.id || '')}
                                                    style={[styles.ownerButton, { backgroundColor: '#ff0000' }]}
                                                >
                                                    <FontAwesome6 name="trash" size={wp(5)} color="#fff" />
                                                </TouchableOpacity>
                                                <ThemedText type='tiny'>Delete</ThemedText>
                                            </View>
                                        </BottomSheetScrollView>
                                    )}
                                </>
                            ) : (
                                <ThemedText>No details available.</ThemedText>
                            )}
                        </View>
                    </BottomSheetView>
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
        paddingVertical: wp(1),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: wp(1),
    },
    filterButton: {
        padding: wp(2),
        borderRadius: wp(10),
        overflow: 'hidden'
    },
    emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center'
    },
    emptyText: {
        textAlign: 'center'
    },
    emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    },
    footer: {
        marginBottom: wp(10),
        marginTop: wp(6)
    },
    loadingContainer: {
        flexDirection: "row",
        gap: wp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    noMoreContainer: {
        gap: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    noMoreText: {
        paddingTop: 0,
        width: wp(90),
        textAlign: 'center'
    },
    sheetContainer: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2),
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4)
    },
    closeButton: {
        margin: wp(2)
    },
    productDetails: {
        padding: wp(2),
        borderWidth: 0.5,
        borderRadius: wp(6),
    },
    detailSection: {
        marginBottom: wp(3)
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(2)
    },
    descriptionContainer: {
        marginTop: wp(3)
    },
    descriptionText: {
        marginTop: wp(1),
        lineHeight: wp(5.5)
    },
    offerContainer: {
        borderWidth: 0.5,
        padding: wp(2),
        borderRadius: wp(6),
    },
    offerTitle: {
        textAlign: 'center',
        marginBottom: wp(2)
    },
    offerInput: {
        marginBottom: wp(3)
    },
    offerActions: {
        flexDirection: 'row',
        gap: wp(2)
    },
    actionButton: {
        flex: 1,
        padding: wp(3),
        borderRadius: wp(4),
        alignItems: 'center'
    },
    primaryAction: {
        marginTop: wp(2),
        padding: wp(3),
        borderRadius: wp(4),
        alignItems: 'center'
    },
    contactOptions: {
        paddingVertical: wp(4),
        flexDirection: 'row',
        gap: wp(5),
        marginTop: 'auto',
        justifyContent: 'space-around'
    },
    contactOption: {
        alignItems: 'center'
    },
    contactButton: {
        height: wp(12),
        width: wp(12),
        borderRadius: wp(90),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(1)
    },
    ownerActions: {
        paddingVertical: wp(4),
        flexDirection: 'row',
        gap: wp(5),
        marginTop: 'auto'
    },
    ownerAction: {
        alignItems: 'center'
    },
    ownerButton: {
        height: wp(12),
        width: wp(12),
        borderRadius: wp(90),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(1)
    }
})

export default StorePage