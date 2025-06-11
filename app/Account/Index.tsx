import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React, { useEffect } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { Image } from 'expo-image'
import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router'
import { cleanNumber, formatDate, formatNumber } from '@/services/services'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/components/ThemedText'
import Divider from '@/components/Divider'
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import Heading from '@/components/Heading'

const Index = () => {

    const { user } = useAuth();


    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')

    useEffect(() => {

        if (!user) {
            router.push('/Account/Login')
            return
        }
        console.log(user.photoURL);


    }, [])

    return (
        <ScreenWrapper>
            <Heading page='My Account' rightComponent={

                <View style={{ flexDirection: 'row', marginRight: wp(2) }}>
                    <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                        <TouchableNativeFeedback onPress={() => router.push('/Account/Edit')}>
                            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                <Ionicons name='settings-outline' color={icon} size={wp(4)} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                </View>

            } />
            <ScrollView style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image
                        style={styles.avatar}
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
                    />
                    <ThemedText type='title'>{user?.organisation || 'Anonymous User'}</ThemedText>
                    <ThemedText type='tiny' color={icon}>{user?.email || 'No Email Provided'}</ThemedText>
                </View>

                {/* User Details Section */}
                <View style={[styles.card, { backgroundColor: background, borderColor: backgroundLight }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: wp(2) }}>
                        <ThemedText style={styles.cardTitle}>Details</ThemedText>
                        <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                            <TouchableNativeFeedback onPress={() => router.push('/Account/Edit')}>
                                <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                    <AntDesign name='edit' color={icon} size={wp(4)} />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                    <Divider />
                    <View style={styles.cardContent}>
                        <DetailRow label="Phone Number" value={cleanNumber(user?.phoneNumber || 'N/A')} />
                        <DetailRow label="Country" value={user?.country || 'N/A'} />
                        <DetailRow label="Address" value={user?.address || 'N/A'} />
                        <DetailRow label="Organization" value={user?.organisation || 'N/A'} />
                        <DetailRow label="Created At" value={formatDate(user?.createdAt || "N/A")} />
                    </View>
                </View>




                {/* {user &&
                    Object.keys(user)
                        .filter((key) => !['uid', 'created_At', 'displayName', 'photoURL', 'phoneNumber', 'email', 'emailVerified', 'organization', 'country', 'address'].includes(key))
                        .map((key) => (
                            <View key={key} style={styles.card}>
                                <Text style={styles.cardTitle}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                                <View style={styles.cardContent}>
                                    <Text style={styles.additionalInfo}>{String(user?.[key])}</Text>
                                </View>
                            </View>
                        ))
                } */}


               

            </ScrollView>
        </ScreenWrapper>
    )
}
const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
);
export default Index


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    email: {
        fontSize: 16,
        marginTop: 4,
    },
    card: {
        borderRadius: wp(4),
        paddingHorizontal: 16,
        paddingBottom: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 12,
        shadowColor: '#2f2f2f69',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardContent: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 16,
    },
    additionalInfo: {
        fontSize: 14,
    },
});