import React, { useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TouchableHighlight, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native';
import { EvilIcons, MaterialCommunityIcons, Ionicons, FontAwesome6, Fontisto } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { router } from 'expo-router';
import HomeItemView from '@/components/HomeItemView';
import { useAuth } from '@/context/AuthContext';

interface HomeContentProps {
    onAuthCheck: (action?: () => void) => void;
}

export default function HomeContent({ onAuthCheck }: HomeContentProps) {
    const { user } = useAuth();
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const textlight = useThemeColor('textlight');
    const border = useThemeColor('border');

    // Quick Links state
    const [currentQuickLinkIndex, setCurrentQuickLinkIndex] = useState(0);
    const quickLinksScrollRef = useRef<ScrollView>(null);
    const screenWidth = Dimensions.get('window').width;
    const [loadsCount, setLoadsCount] = useState(0);

    // Quick Links data (8 items total)
    const quickLinksData = [
        {
            id: 1,
            title: 'Create Contract',
            icon: <Ionicons name="reader" size={wp(5)} color="#e50914" />,
            bgColor: '#F4802424',
            underlayColor: '#F480245a',
            onPress: () => onAuthCheck(() => router.push('/Logistics/Contracts/NewContract'))
        },
        {
            id: 2,
            title: 'Add Truck',
            icon: <Fontisto name="truck" size={wp(5)} color="#0f9d58" />,
            bgColor: '#0f9d5824',
            underlayColor: '#0f9d585a',
            onPress: () => onAuthCheck(() => router.push('/Logistics/Trucks/AddTrucks'))
        },
        {
            id: 3,
            title: 'Add Load',
            icon: <FontAwesome6 name="box" size={wp(5)} color="#4285f4" />,
            bgColor: '#4285f424',
            underlayColor: '#4285f45a',
            onPress: () => onAuthCheck(() => router.push('/Logistics/Loads/AddLoads'))
        },
        {
            id: 4,
            title: 'Sell Products',
            icon: <Fontisto name="dollar" size={wp(5)} color="#F48024" />,
            bgColor: '#F4802424',
            underlayColor: '#F480245a',
            onPress: () => onAuthCheck(() => router.push('/Transport/Store/CreateProduct'))
        },
        {
            id: 5,
            title: 'Truck Status',
            icon: <Fontisto name="truck" size={wp(5)} color="#0f9d58" />,
            bgColor: '#0f9d5824',
            underlayColor: '#0f9d585a',
            onPress: () => onAuthCheck(() => router.push({
                pathname: '/Logistics/Trucks/Index',
                params: { userId: user?.uid || '' }
            }))
        },
        {
            id: 6,
            title: 'Owner Status',
            icon: <MaterialCommunityIcons name="account-check" size={wp(5)} color="#4285f4" />,
            bgColor: '#4285f424',
            underlayColor: '#4285f45a',
            onPress: () => onAuthCheck(() => router.push('/Account/Verification/Index'))
        },
        {
            id: 7,
            title: 'My Loads',
            icon: <FontAwesome6 name="box" size={wp(5)} color="#F48024" />,
            bgColor: '#F4802424',
            underlayColor: '#F480245a',
            onPress: () => onAuthCheck(() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dspRoute: "My Loads" } }))
        },
        {
            id: 8,
            title: 'Courier Requests',
            icon: <MaterialCommunityIcons name="truck-delivery" size={wp(5)} color="#e06eb5" />,
            bgColor: '#e06eb524',
            underlayColor: '#e06eb55a',
            onPress: () => onAuthCheck(() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dspRoute: "Requested Loads" } }))
        }
    ];


    const theData = [
        {
            id: 1,
            topic: 'Long-Term Contracts',
            description: 'Secure long-term contracts with trusted partners to ensure consistency, reduce risk, and grow your business steadily.',
            btnTitle: 'Open Contracts',
        },
        {
            id: 2,
            topic: 'Tracking',
            description: 'Track your trucks and cargo live on the app. Improve safety, monitor routes, and keep customers updated anytime.',
            btnTitle: 'View Tracking',
        },
        {
            id: 3,
            topic: 'Fuel',
            description: 'Find nearby fuel stations with the best prices. Enjoy discounts and get quick directions to save time and money.',
            btnTitle: 'Get Fuel',
        },
        {
            id: 4,
            topic: 'Truck Stop',
            description: 'Locate safe and comfortable truck stops on your journey. Rest, refresh, refuel, and access facilities conveniently.',
            btnTitle: 'Visit Truck Stop',
        },
        {
            id: 5,
            topic: 'GIT (Goods in Transit Insurance)',
            description: 'Protect your trucks and cargo while on the road. Get insurance that covers theft, accidents, and damages during transit.',
            btnTitle: 'Get GIT',
        },
        {
            id: 6,
            topic: "Warehouse",
            description: 'Find secure, affordable warehouses near your routes. Store your goods safely with easy directions and discounted rates for members.',
            btnTitle: "Check Warehouses"
        },
        {
            id: 7,
            topic: 'Verification',
            description: 'Verify your business today to build trust with customers, access exclusive deals, and boost your company\'s reputation easily.',
            btnTitle: 'Get Verified',
        },
    ];

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TouchableOpacity
                    onPress={() => router.push("/Search/Index")}
                    style={[styles.searchBar, { backgroundColor: backgroundColor, borderColor: border }]}
                >
                    <EvilIcons name='search' size={wp(6)} color={icon} />
                    <ThemedText color={textlight}>Search..</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Quick Links */}
            <View style={[styles.quickLinksContainer, { borderColor: border, backgroundColor: background }]}>
                <View style={styles.quickLinksHeader}>
                    <MaterialCommunityIcons name="lightning-bolt-circle" size={wp(4)} color={icon} />
                    <ThemedText type='subtitle' style={styles.quickLinksTitle}>
                        Quick Links
                    </ThemedText>
                </View>

                {/* Quick Links - Two Pages */}
                <ScrollView
                    ref={quickLinksScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickLinksScrollView}
                    onMomentumScrollEnd={(event) => {
                        const pageWidth = screenWidth - wp(2); // Full width minus container padding
                        const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
                        setCurrentQuickLinkIndex(index);
                    }}
                >
                    {/* Page 1 - Original 4 items */}
                    <View style={[styles.quickLinksPage, { width: 325 }]}>
                        <View style={styles.quickLinksGrid}>
                            {quickLinksData.slice(0, 4).map((item) => (
                                <View key={item.id} style={styles.quickLinkItem}>
                                    <TouchableHighlight
                                        onPress={item.onPress}
                                        underlayColor={item.underlayColor}
                                        style={[styles.quickLinkButton, { backgroundColor: item.bgColor }]}
                                    >
                                        {item.icon}
                                    </TouchableHighlight>
                                    <View style={styles.labelContainer}>
                                        <ThemedText type='tiny' style={styles.quickLinkLabel} numberOfLines={2}>
                                            {item.title}
                                        </ThemedText>
                                        {item.id === 7 && loadsCount > 0 && (
                                            <View style={[styles.badge, { backgroundColor: accent }]}>
                                                <ThemedText type='tiny' style={styles.badgeText}>
                                                    {loadsCount}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Page 2 - Status 4 items */}
                    <View style={[styles.quickLinksPage, { width: screenWidth - wp(10) }]}>
                        <View style={styles.quickLinksGrid}>
                            {quickLinksData.slice(4, 8).map((item) => (
                                <View key={item.id} style={styles.quickLinkItem}>
                                    <TouchableHighlight
                                        onPress={item.onPress}
                                        underlayColor={item.underlayColor}
                                        style={[styles.quickLinkButton, { backgroundColor: item.bgColor }]}
                                    >
                                        {item.icon}
                                    </TouchableHighlight>
                                    <View style={styles.labelContainer}>
                                        <ThemedText type='tiny' style={styles.quickLinkLabel} numberOfLines={2}>
                                            {item.title}
                                        </ThemedText>
                                        {item.id === 7 && loadsCount > 0 && (
                                            <View style={[styles.badge, { backgroundColor: accent }]}>
                                                <ThemedText type='tiny' style={styles.badgeText}>
                                                    {loadsCount}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {/* Page Indicators */}
                <View style={styles.pageIndicators}>
                    {Array.from({ length: Math.ceil(quickLinksData.length / 4) }, (_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                {
                                    backgroundColor: index === currentQuickLinkIndex ? accent : border,
                                    width: index === currentQuickLinkIndex ? wp(6) : wp(2),
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Feature Items */}
            {theData.map((item) => (
                <View key={item.id}>
                    {item.id === 1 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor="#4285f4"
                            icon="#333"
                            iconElement={<FontAwesome6 name="file-contract" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#4285f424"
                            isAvaialble={true}
                            btnPressValue={() => router.push('/Logistics/Contracts/ViewMiniContracts')}
                        />
                    )}

                    {item.id === 2 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor="#6bacbf"
                            icon="#333"
                            iconElement={<MaterialCommunityIcons name="satellite-uplink" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#6bacbf24"
                            isAvaialble={true}
                            btnPressValue={() => onAuthCheck(() => router.push("/Tracking/Index"))}
                        />
                    )}

                    {item.id === 3 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor="#fb9274"
                            icon="#333"
                            iconElement={<MaterialCommunityIcons name="fuel" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#fb927424"
                            isAvaialble={true}
                            btnPressValue={() => router.push("/Fuel/Index")}
                        />
                    )}

                    {item.id === 4 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor="#bada5f"
                            icon="#333"
                            iconElement={<MaterialCommunityIcons name="coffee" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#bada5f24"
                            isAvaialble={true}
                            btnPressValue={() => router.push("/TruckStop/Index")}
                        />
                    )}

                    {item.id === 5 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor='#f4c542'
                            icon="#333"
                            iconElement={<MaterialCommunityIcons name="shield-check" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#f4c54224"
                            isAvaialble={true}
                            btnPressValue={() => router.push("/Compliances/GITInsuarance/Index")}
                        />
                    )}

                    {item.id === 6 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor='#e06eb5'
                            icon="#333"
                            iconElement={<MaterialCommunityIcons name="warehouse" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#e06eb524"
                            isAvaialble={true}
                            btnPressValue={() => router.push("/Warehouse/Index")}
                        />
                    )}

                    {item.id === 7 && (
                        <HomeItemView
                            topic={item.topic}
                            description={item.description}
                            mainColor='#f47c42'
                            icon="#333"
                            iconElement={<Ionicons name="shield-checkmark" size={wp(4)} color={'#fff'} />}
                            buttonTitle={item.btnTitle}
                            btnBackground="#f47c4224"
                            isAvaialble={true}
                            btnPressValue={() => router.push("/Account/Verification/ApplyVerification")}
                        />
                    )}
                </View>
            ))}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        marginVertical: wp(4),
        marginHorizontal: wp(2),
    },
    searchContainer: {
        margin: wp(4),
        marginTop: 0,
    },
    searchBar: {
        borderRadius: wp(8),
        padding: wp(3),
        flexDirection: 'row',
        gap: wp(2),
        borderWidth: 1,
    },
    quickLinksContainer: {
        padding: wp(4),
        gap: wp(2),
        marginBottom: wp(4),
        borderWidth: 0.5,
        borderRadius: 8,
        shadowColor: "#0f9d58",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
        elevation: 6,
    },
    quickLinksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    quickLinksTitle: {
        fontWeight: 'bold',
        fontSize: wp(3.5),
    },
    quickLinksScrollView: {
        flex: 1,
    },
    quickLinksPage: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLinksGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    quickLinkItem: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: wp(2),
        flex: 1,
    },
    quickLinkButton: {
        justifyContent: 'center',
        width: wp(14),
        alignItems: 'center',
        height: wp(14),
        borderRadius: wp(60),
    },
    quickLinkLabel: {
        textAlign: 'center',
        fontSize: wp(2.8),
        lineHeight: wp(3.5),
        flexWrap: 'wrap',
    },
    labelContainer: {
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -wp(2),
        right: -wp(2),
        minWidth: wp(4),
        height: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(1),
    },
    badgeText: {
        color: 'white',
        fontSize: wp(2.2),
        fontWeight: 'bold',
    },
    pageIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: wp(2),
        marginTop: wp(2),
    },
    indicator: {
        height: wp(2),
        borderRadius: wp(1),
    },
});


