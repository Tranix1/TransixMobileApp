import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Linking, TouchableHighlight } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Product } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { AntDesign, Feather, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { formatCurrency } from '@/services/services'
import Divider from './Divider'
import FormatedText from './FormatedText'

const ProductComponent = ({ product = {} as Product, expandID = '', expandId = (id: string) => { }, onDetailsPress = () => { } }) => {
    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const textColor = useThemeColor('text')
    const accent = useThemeColor('accent')

    const [expand, setExpand] = useState(false)
    const [loadingImage, setLoadingImage] = useState(true)

    useEffect(() => {
        if (expandID === product.id) {
            setExpand(true)
        } else {
            setExpand(false)
        }
    }, [expandID])

    const toggleExpand = () => {
        setExpand(!expand)
        if (!expand) {
            expandId(product.id || '')
        } else {
            expandId('')
        }
    }

    const handleContact = (method: 'whatsapp' | 'call' | 'message') => {
        if (!product.seller.contact) return

        const message = `${product.seller.name}\n${product.title}\n${product.description}\nPrice: ${formatCurrency(product.price, 0, product.currency)}`

        switch (method) {
            case 'whatsapp':
                Linking.openURL(`whatsapp://send?phone=${product.seller.contact}&text=${encodeURIComponent(message)}`)
                break
            case 'call':
                Linking.openURL(`tel:${product.seller.contact}`)
                break
            case 'message':
                // Implement your messaging logic
                break
        }
    }

    const renderVehicleDetails = () => (
        <View style={styles.detailSection}>
            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Model:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.make} {product.details.vehicle?.model}
                </ThemedText>
            </View>

            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Year:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.year}
                </ThemedText>
            </View>

             <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Engine:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.engine}
                </ThemedText>
            </View>

            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Mileage:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.mileage} km
                </ThemedText>
            </View>

           <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Fuel:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.vehcileFuel}
                </ThemedText>
            </View>

            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Transmission:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.vehicleTransimission}
                </ThemedText>
            </View>


        {product.vehicleType==="cargo vehicle"  &&  <View>

            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Type:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.truckDetails?.truckType}
                </ThemedText>

            </View>


            {product.truckDetails?.truckType ==="rigid"&& <View>

               <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Cargo Area:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.bodyStyle}
                </ThemedText>
            </View>

            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Capacity:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.truckCapacity}
                </ThemedText>
            </View>
                </View>}  


           { product.truckDetails?.truckType !=="rigid"&&<View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Horse Power:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.horsePower}
                </ThemedText>
            </View>}


            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Suspension:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.truckDetails.truckSuspension}
                </ThemedText>
            </View>

            <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Config:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.truckDetails.truckConfig}
                </ThemedText>
            </View>


            </View>}


           { product.truckDetails?.truckType ==="semi Truck"&&<View>

                <ThemedText>Trailer Details</ThemedText> 
                   <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Cargo Area:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.bodyStyle}
                </ThemedText>
            </View>
                  <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Capacity:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.details.vehicle?.truckCapacity}
                </ThemedText>
            </View>
                <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Suspension:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.truckDetails.truckSuspension}
                </ThemedText>
            </View>
                <View style={styles.detailRow}>
                <ThemedText type='default' style={{ flex: 1 }}>Config:</ThemedText>
                <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                    {product.truckDetails.truckConfig}
                </ThemedText>
            </View>
               
            </View>}

        </View>
    )

  

    return (
        <View
            style={[styles.container, { backgroundColor: background }]}
            // activeOpacity={0.8}
        >
            {/* Header with seller info and options */}
            <View style={styles.header}>
                <View style={styles.sellerInfo}>
                    {product?.seller?.isVerified && (
                        <FontAwesome5 name="check-circle" size={wp(4)} color="#4eb3de" style={styles.verifiedIcon} />
                    )}
                    <ThemedText type='subtitle' style={styles.sellerName}>
                        {product?.seller?.name}
                    </ThemedText>
                </View>

                <TouchableHighlight
                    underlayColor={backgroundLight}
                    onPress={onDetailsPress}
                    style={styles.optionsButton}
                >
                    <Ionicons name='ellipsis-vertical' size={wp(4)} color={icon} />
                </TouchableHighlight>
            </View>

            {/* Product Image */}
            <View style={styles.imageContainer}>
                {loadingImage && (
                    <ActivityIndicator size="large" color={accent} style={styles.loadingIndicator} />
                )}
                <Image
                    source={{ uri: product.images[0] }}
                    style={styles.productImage}
                    onLoadEnd={() => setLoadingImage(false)}
                    contentFit="cover"
                    transition={300}
                />
            </View>

            {/* Product Title and Price */}
            <View style={styles.titleRow}>
                <ThemedText type='subtitle' style={styles.productTitle}>
                    {product.title}
                </ThemedText>
                <ThemedText type='subtitle' style={{ color: accent }}>
                    {formatCurrency(product.price, 0, product.currency)}
                </ThemedText>
            </View>

            {/* Condition and Category */}
            <View style={styles.tagsContainer}>
                <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                    <ThemedText type='tiny'>
                        {product.condition === 'new' ? 'New' : 'Used'}
                    </ThemedText>
                </View>
               { product.category!=="Vehicle" && <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                    <ThemedText type='tiny'>
                        {product.category}
                    </ThemedText>
                </View>}
                 {product.category==="Vehicle" &&  <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                    <ThemedText type='tiny'>
                        {product.vehicleType}
                    </ThemedText>
                </View>}
                  <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                    <ThemedText type='tiny'>
                        {product.bodyStyle}
                    </ThemedText>
                </View>
                  <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
                    <ThemedText type='tiny' >
                        {product.bodyMake}
                    </ThemedText>
                </View>
               
            </View>

            {/* Location */}
            <View style={styles.detailRow}>
                <Feather name="map-pin" size={wp(4)} style={styles.icon} color={icon} />
                <ThemedText type='default'>
                    {product.location.city}
                </ThemedText>
            </View>

            {/* Transaction Type */}
            <View style={styles.detailRow}>
                <FontAwesome5 name="exchange-alt" size={wp(4)} style={styles.icon} color={icon} />
                <ThemedText type='default'>
                    {product.transaction.type }
                </ThemedText>
                {product.transaction.swapPreferences && (
                    <ThemedText type='default' style={{ marginLeft: wp(2) }}>
                        ({product.transaction.swapPreferences})
                    </ThemedText>
                )}
            </View>

            {/* Expandable Details */}
            {expand && (
                <View style={styles.expandedContent}>
                    {/* Description */}
                    <ThemedText type='default' style={styles.description}>
                        {product.description}
                    </ThemedText>

                    {/* Category-specific details */}
                    {product.category === 'Vehicle' && renderVehicleDetails()}
                    {/* {product.category !== 'vehicle' && renderGeneralDetails()} */}

                    {/* Transaction Details */}
                    <View style={styles.detailSection}>
                        <View style={styles.detailRow}>
                            <ThemedText type='default' style={{ flex: 1 }}>Negotiable:</ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                                {product.transaction.priceNegotiable ? 'Yes' : 'No'}
                            </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                            <ThemedText type='default' style={{ flex: 1 }}>Delivery:</ThemedText>
                            <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                                {product.transaction.deliveryAvailable ?
                                    `Available (${formatCurrency(product.transaction.deliveryCost || 0, 0, product.currency)})` :
                                    'Not Available'}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Contact Options */}
                    <View style={styles.contactOptions}>
                        <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                            onPress={() => handleContact('whatsapp')}
                        >
                            <FontAwesome6 name="whatsapp" size={wp(5)} color="white" />
                            <ThemedText style={{ color: 'white', marginLeft: wp(2) }}>WhatsApp</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: '#007AFF' }]}
                            onPress={() => handleContact('call')}
                        >
                            <MaterialIcons name="call" size={wp(5)} color="white" />
                            <ThemedText style={{ color: 'white', marginLeft: wp(2) }}>Call</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Expand/Collapse Button */}
            <TouchableOpacity
                style={styles.expandButton}
                onPress={toggleExpand}
            >
                <Feather
                    name={expand ? 'chevron-up' : 'chevron-down'}
                    size={wp(5)}
                    color={icon}
                />
            </TouchableOpacity>
        </View>
    )
}

export default ProductComponent

const styles = StyleSheet.create({
    container: {
        margin: wp(2),
        borderRadius: wp(4),
        padding: wp(4),
        shadowColor: '#3535353b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(3)
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    verifiedIcon: {
        marginRight: wp(2)
    },
    sellerName: {
        fontSize: wp(4.5)
    },
    optionsButton: {
        padding: wp(1),
        borderRadius: wp(90)
    },
    imageContainer: {
        height: wp(50),
        borderRadius: wp(3),
        overflow: 'hidden',
        marginBottom: wp(3),
        backgroundColor: '#f5f5f5'
    },
    productImage: {
        width: '100%',
        height: '100%'
    },
    loadingIndicator: {
        position: 'absolute',
        alignSelf: 'center',
        top: '40%'
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(2)
    },
    productTitle: {
        flex: 1,
        fontSize: wp(4.5)
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: wp(2),
        marginBottom: wp(3)
    },
    tag: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: wp(4)
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(2)
    },
    icon: {
        marginRight: wp(2),
        width: wp(5)
    },
    expandedContent: {
        marginTop: wp(3)
    },
    description: {
        marginBottom: wp(3),
        lineHeight: wp(5)
    },
    detailSection: {
        marginBottom: wp(3)
    },
    contactOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: wp(3)
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2.5),
        borderRadius: wp(2),
        marginHorizontal: wp(1)
    },
    expandButton: {
        alignItems: 'center',
        marginTop: wp(2)
    }
})