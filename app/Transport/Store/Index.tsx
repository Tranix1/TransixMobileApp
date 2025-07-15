import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, Linking, ToastAndroid, ScrollView } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { deleteDocument, fetchDocuments } from '@/db/operations'
import { Product } from '@/types/types'
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore'
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
import { useLocalSearchParams } from 'expo-router'

const StorePage = () => {
    const { user } = useAuth()

    const { userId, } = useLocalSearchParams();

    const productCategorys = [
        { id: 0, name: "Vehicle" },
        { id: 1, name: "Trailers" },
        { id: 2, name: "Container" },
        { id: 3, name: "Spares" },
        { id: 4, name: "Service Provider" },
    ]

    // const [selectedProductCatgory, setSelectedCategory] = useState(productCategorys[0]);

    // console.log(selectedProductCatgory , "categ")
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
    const [selectedCountry, setSelectedCountry] = useState<{
        id: number;
        name: string;
    } | null>(Countries[0] ?? null)


    const bottomSheetRef = useRef<BottomSheet>(null)

    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')
    const textColor = useThemeColor('text')



    const [buyOSelling, setBuyOselling] = React.useState("")
    const [selectedProdCategry, setSelectedProdctCategory] = React.useState<{ id: number; name: string } | any>(productCategorys[0])

    const [selectedVehiType, setSelectedVehiType] = React.useState<{ id: number; name: string } | null>(null)
    const [selectedBudget, setSelectedBudget] = React.useState<{ id: number; name: string } | null>(null)
    const [selectedTransType, setSelectedTransType] = React.useState<{ id: number; name: string } | null>(null)
    const [slectedBodyType, setSelectedBodyType] = React.useState<{ id: number; name: string } | null>(null)
    const [slectedMake, setSelectedMake] = React.useState<{ id: number; name: string } | null>(null)


   function clearFilter() {
        // Resetting states to their initial values or null
        setSelectedProduct(null);
        setBuyOselling("");
        setSelectedProdctCategory(productCategorys[0]); // Reset to initial default
        setSelectedVehiType(null);
        setSelectedBudget(null);
        setSelectedTransType(null);
        setSelectedBodyType(null);
        setSelectedMake(null);
        setSelectedCountry(Countries[0]); // Reset to initial default
    }

const [filteredPNotAavaialble ,setFilteredPNotAavaialble ] = React.useState(false)

    const loadProducts = async () => {

        let filters: any[] = [];
        

        if (userId) filters.push(where("userId", "==", userId));

        if (selectedCountry) filters.push(where("location.storeCountry", "==", selectedCountry?.name));
        if (selectedProdCategry) filters.push(where("category", "==", selectedProdCategry?.name));

        if (buyOSelling) filters.push(where("transaction.LookingOSelling", "==", buyOSelling));

        // Small Vehicle , cargo or heavy euip
        if (selectedVehiType) filters.push(where("vehicleType", "==", selectedVehiType.name));

        if (selectedBudget) filters.push(where("priceRange", "==", selectedBudget.name));

        if (selectedTransType) filters.push(where("vehicleTransimission", "==", selectedTransType.name));

        if (slectedBodyType) filters.push(where("bodyStyle", "==", slectedBodyType.name));

        if (slectedMake) filters.push(where("bodyMake", "==", slectedMake.name));

        const result = await fetchDocuments("products", 10, undefined, filters);

        if (result.data) {
                if(filters.length > 0 && result.data.length <= 0 ) setFilteredPNotAavaialble(true)
            
            setProducts(result.data as Product[])
            setLastVisible(result.lastVisible)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [userId , selectedCountry,selectedProdCategry , buyOSelling,selectedVehiType,selectedBudget,selectedTransType,slectedBodyType,slectedMake])

    const onRefresh = async () => {
        try 
        {clearFilter()
        setRefreshing(true)
            await loadProducts()
            setRefreshing(false)
        } catch (error) {
            console.error("Refresh error:", error)
        }
    }

    const loadMoreProducts = async () => {

        let filters: any[] = [];

      if (userId) filters.push(where("userId", "==", userId));

        if (selectedCountry) filters.push(where("location.storeCountry", "==", selectedCountry?.name));
        if (selectedProdCategry) filters.push(where("category", "==", selectedProdCategry?.name));

        if (buyOSelling) filters.push(where("transaction.LookingOSelling", "==", buyOSelling));

        // Small Vehicle , cargo or heavy euip
        if (selectedVehiType) filters.push(where("vehicleType", "==", selectedVehiType.name));

        if (selectedBudget) filters.push(where("priceRange", "==", selectedBudget.name));

        if (selectedTransType) filters.push(where("vehicleTransimission", "==", selectedTransType.name));

        if (slectedBodyType) filters.push(where("bodyStyle", "==", slectedBodyType.name));

        if (slectedMake) filters.push(where("bodyMake", "==", slectedMake.name));

        if (loadingMore || !lastVisible) return
        setLoadingMore(true)
        const result = await fetchDocuments('products', 10, lastVisible, filters);
        if (result) {
            setProducts(prevProducts => [...prevProducts, ...result.data as Product[]])

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

                <View style={{ marginVertical: wp(2) }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: wp(2),
                            gap: wp(2),
                        }}
                    >
                        {Countries.map((item) => {
                            const isSelected = item.id === selectedCountry?.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setSelectedCountry(item);
                                        // Optionally filter products here or trigger a filter function
                                    }}
                                    style={{
                                        backgroundColor: isSelected ? accent : backgroundLight,
                                        borderColor: isSelected ? accent : coolGray,
                                        borderWidth: 1,


                                        paddingVertical: wp(0.1),
                                        marginLeft: wp(2),
                                        borderRadius: wp(2),
                                        paddingHorizontal: wp(3),


                                        marginRight: wp(1),
                                        shadowColor: isSelected ? accent : '#000',
                                        shadowOpacity: isSelected ? 0.15 : 0.05,
                                        shadowRadius: 4,
                                        elevation: isSelected ? 2 : 0,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: isSelected ? 'white' : textColor,
                                            fontSize: wp(3.5),
                                        }}
                                    >
                                        {item.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>


                <View style={{ marginVertical: wp(2) }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: wp(2),
                            gap: wp(2),
                        }}
                    >
                        {productCategorys.map((tab, idx) => {
                            return (
                                <TouchableOpacity
                                    key={tab.id}
                                    onPress={() => setSelectedProdctCategory(tab)}
                                    style={{
                                        paddingVertical: wp(0.1),
                                        marginLeft: wp(2),
                                        borderRadius: wp(2),
                                        paddingHorizontal: wp(3),
                                        backgroundColor: selectedProdCategry.id === tab.id ? accent : backgroundLight,
                                        borderWidth: 1,
                                        borderColor: selectedProdCategry.id === tab.id ? accent : coolGray,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: selectedProdCategry.id === tab.id ? 'white' : textColor,
                                            fontSize: wp(3.5),
                                        }}
                                    >
                                        {tab.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>




                <SpecifyProductDetails
                    showFilter={showFilter}
                    setShowFilter={setShowFilter}
                    buyOSelling={buyOSelling}
                    setBuyOselling={setBuyOselling}
                    selectedProdCategry={selectedProdCategry}
                    setSelectedProdctCategory={setSelectedProdctCategory}
                    selectedVehiType={selectedVehiType}
                    setSelectedVehiType={setSelectedVehiType}
                    selectedBudget={selectedBudget}
                    setSelectedBudget={setSelectedBudget}
                    selectedTransType={selectedTransType}
                    setSelectedTransType={setSelectedTransType}
                    slectedBodyType={slectedBodyType}
                    setSelectedBodyType={setSelectedBodyType}
                    slectedMake={slectedMake}
                    setSelectedMake={setSelectedMake}
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
                           {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                Products Loading…
                            </ThemedText>}
                            
                           {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                                Please Wait
                            </ThemedText>}
                           {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                               Specified Product Not Available!
                            </ThemedText>}
                           {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                                pull to refresh
                            </ThemedText>}
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
                    enableContentPanningGesture={true}
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
                                        <View style={[styles.productDetails, { backgroundColor: backgroundLight, padding: 0 }]}>
                                            <View
                                                style={{
                                                    borderRadius: wp(1),
                                                    overflow: 'hidden',
                                                    borderColor: coolGray,
                                                }}
                                            >
                                                {/* Table Header */}
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        backgroundColor: accent,
                                                        paddingVertical: wp(2),
                                                        paddingHorizontal: wp(3),
                                                    }}
                                                >
                                                    <ThemedText
                                                        type="defaultSemiBold"
                                                        style={{
                                                            flex: 1,
                                                            color: 'white',
                                                            fontSize: wp(3.5),
                                                        }}
                                                    >
                                                        Attribute
                                                    </ThemedText>
                                                    <ThemedText
                                                        type="defaultSemiBold"
                                                        style={{
                                                            flex: 1,
                                                            color: 'white',
                                                            fontSize: wp(3.5),
                                                            textAlign: 'right',
                                                        }}
                                                    >
                                                        Value
                                                    </ThemedText>
                                                </View>
                                                {/* Table Rows */}
                                                {[
                                                    {
                                                        label: 'Category',
                                                        value: selectedProduct.vehicleType,
                                                    },
                                                    {
                                                        label: 'Body Style',
                                                        value: selectedProduct.bodyStyle,
                                                    },
                                                    {
                                                        label: 'Condition',
                                                        value: selectedProduct.condition === 'new' ? 'New' : 'Used',
                                                    },
                                                    {
                                                        label: 'Price',
                                                        value: formatCurrency(selectedProduct.price, 0, selectedProduct.currency),
                                                    },
                                                    {
                                                        label: 'Location',
                                                        value: selectedProduct.location.productLocation,
                                                    },
                                                ].map((row, idx, arr) => (
                                                    <View
                                                        key={row.label}
                                                        style={{
                                                            flexDirection: 'row',
                                                            backgroundColor: idx % 2 === 0 ? backgroundLight : background,
                                                            paddingVertical: wp(2),
                                                            paddingHorizontal: wp(3),
                                                            borderBottomWidth: idx === arr.length - 1 ? 0 : 0.5,
                                                            borderColor: coolGray,
                                                        }}
                                                    >
                                                        <ThemedText
                                                            type="default"
                                                            style={{
                                                                flex: 1,
                                                                fontSize: wp(3.5),
                                                            }}
                                                        >
                                                            {row.label}
                                                        </ThemedText>
                                                        <ThemedText
                                                            type="defaultSemiBold"
                                                            style={{
                                                                flex: 1,
                                                                textAlign: 'right',
                                                                fontSize: wp(3.5),
                                                                color: textColor,
                                                            }}
                                                        >
                                                            {row.value}
                                                        </ThemedText>
                                                    </View>
                                                ))}
                                            </View>
                                            <View style={[styles.descriptionContainer, { marginTop: wp(4) }]}>
                                                <ThemedText type="defaultSemiBold" style={{ color: accent, marginBottom: wp(1) }}>
                                                    Description
                                                </ThemedText>
                                                <ThemedText type="default" style={styles.descriptionText}>
                                                    {selectedProduct.description}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    )}


                                    {bottomMode === 'Offer' && (<View style={[{
                                        borderColor: accent, borderWidth: .5, padding: wp(2), borderRadius: wp(6),
                                    }]}>
                                        <View style={{ gap: wp(2) }}>
                                            <ThemedText type='subtitle' color={coolGray} style={{ textAlign: 'center' }}>
                                                Make an Offer
                                            </ThemedText>
                                               

                                                <Input
                                                    onChangeText={setOfferPrice}
                                                    value={offerPrice}
                                                    keyboardType="numeric"
                                                    placeholderTextColor={coolGray}
                                                    placeholder={`Offer price in ${selectedProduct.currency}`}
                                                />



                                        </View>

                                        <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                            <TouchableOpacity
                                                onPress={() => setBottomMode('')}
                                                style={[{ backgroundColor: coolGray, flex: 2, padding: wp(3), borderRadius: wp(4), alignItems: 'center' }]}
                                            >
                                                <ThemedText style={{ color: 'white' }}>Cancel</ThemedText>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[{ backgroundColor: '#0f9d5824', flex: 2, padding: wp(3), borderRadius: wp(4), alignItems: 'center' }]}
                                            >
                                                <ThemedText style={{ color: '#0f9d58' }}>Send</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>)}







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
                                                <TouchableOpacity
                                                    style={[styles.primaryAction, { backgroundColor: accent }]}
                                                    onPress={() => setBottomMode('Offer')}
                                                >
                                                    <ThemedText color='white'>View <ThemedText style={{ textDecorationLine: "underline" }} >{selectedProduct.seller.name}</ThemedText> Store </ThemedText>
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
        marginVertical: wp(1),
        margin: wp(3)
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