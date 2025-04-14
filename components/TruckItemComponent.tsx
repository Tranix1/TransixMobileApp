import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Truck } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { Octicons } from '@expo/vector-icons'

const TruckItemComponent = ({ truck = {} as Truck }) => {
    const backgroundLight = useThemeColor('backgroundLight')
    const coolGray = useThemeColor('coolGray')
    const textColor = useThemeColor('text')
    const accent = useThemeColor('accent')

    const placeholder = require('@/assets/images/failedimage.jpg')

    return (
        <View style={[styles.container, { backgroundColor: backgroundLight, borderColor: coolGray }]}>
            <Image transition={400} contentFit='cover' placeholder={placeholder} source={{ uri: truck.imageUrl }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type='subtitle' style={[styles.title, { color: textColor, flex: 1 }]}>{truck.CompanyName || 'Unknown Company'}</ThemedText>
                    {truck.isVerified &&
                        <Octicons name='verified' size={wp(5)} color={accent} />
                    }
                </View>
                <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray }]}>
                    Truck Type: {truck.truckType || 'N/A'}
                </ThemedText>
                <ThemedText numberOfLines={1} style={[styles.text, { color: textColor }]}>
                    Trailer Type: {truck.trailerType || 'N/A'}
                </ThemedText>
                <ThemedText numberOfLines={1} style={[styles.text, { color: textColor }]}>
                    From: {truck.fromLocation || 'N/A'}
                </ThemedText>
                <ThemedText numberOfLines={1} style={[styles.text, { color: textColor }]}>
                    To: {truck.toLocation || 'N/A'}
                </ThemedText>



            </View>
        </View>
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