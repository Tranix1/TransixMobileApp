import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { FontAwesome5, Fontisto, Octicons, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export type SelectLocationProp = {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    country: string | null;
    city: string | null;
}

type ProfileAccType = "fleet" | "brokerage" | "driver";

interface BusinessProfile {
    id: string;
    name: string;
    ownerName: string;
    profilePhoto?: string;
    location?: {
        city: string;
        country: string;
    };
    type: ProfileAccType;
    verificationStatus: string;
   operationCountries ?: string[]
}


const ProfileItemComponent = ({ profile = {} as BusinessProfile }: { profile?: BusinessProfile }) => {

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const textColor = useThemeColor('text')
    const shadowColor = useThemeColor('text')
    const placeholder = require('@/assets/images/failedimage.jpg')
const MAX_COUNTRY_PILLS = 1;

const countries = profile.operationCountries || [];

const visibleCountries = countries.slice(0, MAX_COUNTRY_PILLS);

const remainingCount = Math.max(
    countries.length - visibleCountries.length,
    0
);
    const accTypeColors: Record<ProfileAccType, { color: string; bg: string }> = {
        fleet: { color: '#0f9d58', bg: '#0f9d5824' },
        brokerage: { color: '#9b59b6', bg: '#9b59b624' },
        driver: { color: '#2b7de9', bg: '#2b7de924' },
    };

    const accTypeStyle = profile.type ? accTypeColors[profile.type] : { color: textColor, bg: backgroundLight }

    const locationLabel = [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || 'N/A'


    function haandlePressProfile (){
        if(profile.type ==="brokerage"){
            router.push("/brokerage/Profile/Index")
        }else if(profile.type ==="fleet"){
            router.push("/Fleet/Profile/Index")

        }else if(profile.type==="driver"){
            router.push("/Driver/Profile/Index")
        }
    }

    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={haandlePressProfile}
            style={[
                styles.container,
                {
                    backgroundColor: background,
                    borderColor: backgroundLight,
                    shadowColor: shadowColor,
                }
            ]}
        >
            {/* Accent bar signals account type at a glance */}
            <View style={[styles.accentBar, { backgroundColor: accTypeStyle.color }]} />

            <Image
                placeholderContentFit='cover'
                transition={400}
                contentFit='cover'
                placeholder={placeholder}
                source={{ uri: profile.profilePhoto }}
                style={styles.image}
            />

            <View style={styles.detailsContainer}>

                <View style={{ justifyContent: 'space-between' }}>
                    <ThemedText type='subtitle' numberOfLines={1} style={[styles.title, { color: textColor, flex: 1 }]}>
                        {profile.name || 'Unnamed Organization'}
                    </ThemedText>
                    {profile.ownerName ? (
                        <ThemedText numberOfLines={1} type='tiny' style={{ color: coolGray, fontSize: 12.5, marginTop: -wp(0.5) }}>
                            {profile.ownerName}
                        </ThemedText>
                    ) : null}
                </View>

                <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: wp(3),
                        paddingVertical: wp(1),
                        borderRadius: wp(4),
                        backgroundColor: accTypeStyle.bg,
                        gap: wp(1.2),
                    }}>
                        <FontAwesome5
                            name={profile.type === 'driver' ? 'user-alt' : profile.type === 'brokerage' ? 'handshake' : 'building'}
                            size={wp(3.2)}
                            color={accTypeStyle.color}
                        />
                        <ThemedText numberOfLines={1} type='tiny' style={{ fontSize: 13, fontWeight: 'bold', color: accTypeStyle.color, textTransform: 'capitalize' }}>
                            {profile.type || 'N/A'}
                        </ThemedText>
                    </View>
                </View>

                <View style={{ gap: wp(3), paddingHorizontal: wp(2), marginTop: wp(1) }}>

                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center' }}>
                        <Ionicons name="location-outline" size={wp(4)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={{ fontSize: 15, flexShrink: 1 }}>
                            {locationLabel}
                        </ThemedText>
                    </View>

              <View 
    style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: wp(1.5) 
    }}
>
    <Fontisto 
        name="world-o" 
        size={wp(3.6)} 
        style={{ width: wp(6) }} 
        color={icon} 
    />

    {visibleCountries.length > 0 ? (
        <>
            {visibleCountries.map((country, idx) => (
                <View
                    key={`${country}-${idx}`}
                    style={{
                        backgroundColor: backgroundLight,
                        paddingHorizontal: wp(2),
                        paddingVertical: wp(0.8),
                        borderRadius: wp(3),
                    }}
                >
                    <ThemedText
                        numberOfLines={1}
                        type="tiny"
                        style={{ fontSize: 12 }}
                    >
                        {country}
                    </ThemedText>
                </View>
            ))}

            {remainingCount > 0 && (
                <View
                    style={{
                        backgroundColor: accTypeStyle.bg,
                        borderWidth: 1,
                        borderColor: `${accTypeStyle.color}40`,
                        paddingHorizontal: wp(2),
                        paddingVertical: wp(0.8),
                        borderRadius: wp(3),
                    }}
                >
                    <ThemedText
                        numberOfLines={1}
                        type="tiny"
                        style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: accTypeStyle.color
                        }}
                    >
                        +{remainingCount}
                    </ThemedText>
                </View>
            )}
        </>
    ) : (
        <ThemedText
            numberOfLines={1}
            type="tiny"
            style={{ fontSize: 15 }}
        >
            N/A
        </ThemedText>
    )}
</View>
                    
                </View>

            </View>

            {profile.verificationStatus === 'approved' &&
                <View style={[styles.verifiedBadge, { backgroundColor: background, shadowColor: shadowColor }]}>
                    <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                        Verified
                    </ThemedText>
                </View>
            }
        </TouchableOpacity>
    )
}

export default ProfileItemComponent

const styles = StyleSheet.create({
    container: {
        margin: wp(2),
        borderWidth: 0.5,
        borderRadius: wp(6),
        padding: wp(2),
        paddingLeft: 0,
        flexDirection: 'row',
        gap: wp(2),
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },
    accentBar: {
        width: 4,
        borderTopLeftRadius: wp(6),
        borderBottomLeftRadius: wp(6),
    },
    image: {
        flex: 1,
        width: wp(60),
        height: wp(40),
        borderRadius: wp(4),
        marginLeft: wp(1),
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: wp(2),
        gap: wp(1)
    },
    title: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: wp(4),
        marginBottom: wp(1),
    },
    text: {
        fontSize: wp(3.3),
        marginBottom: wp(0.5),
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        borderRadius: wp(4),
        alignItems: 'center',
        gap: wp(1),
        padding: wp(1),
        position: 'absolute',
        left: wp(5),
        top: wp(4),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
})