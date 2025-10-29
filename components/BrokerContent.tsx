import React, { useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, TouchableHighlight, StyleSheet, Dimensions } from 'react-native';
import { EvilIcons, MaterialCommunityIcons, Ionicons, FontAwesome6, Fontisto } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

interface BrokerContentProps {
    onAuthCheck: (action?: () => void) => void;
}

export default function BrokerContent({ onAuthCheck }: BrokerContentProps) {
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

    // Section titles
    const sectionTitles = ['Add & Create', 'Manage & Status', 'Wallet'];

    // Quick Links data (8 items total - removed Add Truck, Sell Products, Truck Status, Courier Requests)
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
            id: 3,
            title: 'Add Load',
            icon: <FontAwesome6 name="box" size={wp(5)} color="#4285f4" />,
            bgColor: '#4285f424',
            underlayColor: '#4285f45a',
            onPress: () => onAuthCheck(() => router.push('/Logistics/Loads/AddLoads'))
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
            id: 9,
            title: 'Funds',
            icon: <Ionicons name="add-circle" size={wp(5)} color="#F1C40F" />,
            bgColor: '#F1C40F24',
            underlayColor: '#F1C40F5a',
            onPress: () => onAuthCheck(() => router.push('/Wallet/DepositAndWithdraw'))
        },
        {
            id: 10,
            title: 'History',
            icon: <Ionicons name="time" size={wp(5)} color="#1ABC9C" />,
            bgColor: '#1ABC9C24',
            underlayColor: '#1ABC9C5a',
            onPress: () => onAuthCheck(() => router.push('/Wallet/WalletHistory'))
        },
        {
            id: 11,
            title: 'Rewards ',
            icon: <Ionicons name="gift" size={wp(5)} color="#E67E22" />,
            bgColor: '#E67E2224',
            underlayColor: '#E67E225a',
            onPress: () => onAuthCheck(() => router.push('/Wallet/RewardsAndBonuses'))
        },
        {
            id: 12,
            title: 'Ambassador',
            icon: <Ionicons name="people" size={wp(5)} color="#2ECC71" />,
            bgColor: '#2ECC7124',
            underlayColor: '#2ECC715a',
            onPress: () => onAuthCheck(() => router.push('/Wallet/AmbassodorEarnings'))
        }
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
                        {sectionTitles[currentQuickLinkIndex] || 'Quick Links'}
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
                    {/* Page 1 - Add & Create 2 items */}
                    <View style={[styles.quickLinksPage, { width: 325 }]}>
                        <View style={styles.quickLinksGrid}>
                            {quickLinksData.slice(0, 2).map((item) => (
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

                    {/* Page 2 - Manage & Status 2 items */}
                    <View style={[styles.quickLinksPage, { width: screenWidth - wp(10) }]}>
                        <View style={styles.quickLinksGrid}>
                            {quickLinksData.slice(2, 4).map((item) => (
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

                    {/* Page 3 - Wallet 4 items */}
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