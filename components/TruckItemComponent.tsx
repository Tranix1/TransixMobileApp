import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Truck } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { FontAwesome5, FontAwesome6, Fontisto, Ionicons, Octicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const TruckItemComponent = ({ truck = {} as Truck }) => {
    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const textColor = useThemeColor('text')
    const accent = useThemeColor('accent')

    const placeholder = require('@/assets/images/failedimage.jpg')

    return (
        <TouchableOpacity onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { product: JSON.stringify(truck) } })} style={[styles.container, { backgroundColor: background, borderColor: coolGray }]}>
            <Image placeholderContentFit='cover' transition={400} contentFit='cover' placeholder={placeholder} source={{ uri: truck.imageUrl }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type='subtitle' numberOfLines={1} style={[styles.title, { color: textColor, flex: 1 }]}>{truck.CompanyName || 'Unknown Company'}</ThemedText>

                </View>

                <View style={{ flexDirection: 'row', backgroundColor: backgroundLight, padding: wp(2), alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>

                    <Fontisto name="truck" size={wp(4)} style={{ width: wp(6) }} color={icon} />
                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                        {truck.truckType || 'N/A'}
                    </ThemedText>
                </View>
                <View style={{ gap: wp(2) }}>


                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>
                        <FontAwesome5 name="truck-loading" size={wp(3.6)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                            {truck.trailerType || 'N/A'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>

                        <Ionicons name="location-outline" size={wp(4)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                            {truck.fromLocation || 'N/A'}
                        </ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>
                        <FontAwesome6 name="road" size={wp(4)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                            {truck.toLocation || 'N/A'}
                        </ThemedText>
                    </View>



                    {truck.isVerified &&
                        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center', gap: wp(2), borderWidth: .4, padding: wp(1), borderColor: coolGray }}>
                            <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                            <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 13 }]}>
                                Verified
                            </ThemedText>
                        </View>
                    }
                </View>

            </View>
        </TouchableOpacity>
    )
}

export default TruckItemComponent

const styles = StyleSheet.create({
    container: {
        margin: wp(2),
        borderWidth: 0.5,
        borderRadius: wp(6),
        padding: wp(2),
        flexDirection: 'row',
        gap: wp(2),
        shadowColor: '#3535353b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 13
    },
    image: {
        flex: 1,
        width: wp(60),
        height: wp(40),
        borderRadius: wp(4),
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: wp(2),
        gap: wp(1)
    },
    title: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    subtitle: {
        fontSize: wp(4),
        marginBottom: wp(1),
    },
    text: {
        fontSize: wp(3.3),
        marginBottom: wp(0.5),
    },
})