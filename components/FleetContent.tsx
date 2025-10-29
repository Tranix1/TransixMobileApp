import React from 'react';
import { View, ScrollView, TouchableOpacity, TouchableHighlight, StyleSheet } from 'react-native';
import { EvilIcons, MaterialCommunityIcons, Ionicons, FontAwesome6, Fontisto } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

interface FleetContentProps {
    onAuthCheck: (action?: () => void) => void;
}

export default function FleetContent({ onAuthCheck }: FleetContentProps) {
    const { user } = useAuth();
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const textlight = useThemeColor('textlight');
    const border = useThemeColor('border');

    // Fleet Management Sections
    const fleetSections = [
        {
            id: 1,
            title: 'Operations',
            description: 'Manage daily fleet operations',
            items: [
                {
                    id: 1,
                    title: 'Create Contract',
                    icon: <Ionicons name="reader" size={wp(6)} color="#e50914" />,
                    bgColor: '#F4802424',
                    underlayColor: '#F480245a',
                    onPress: () => onAuthCheck(() => router.push('/Logistics/Contracts/NewContract'))
                },
                {
                    id: 2,
                    title: 'Add Truck',
                    icon: <Fontisto name="truck" size={wp(6)} color="#0f9d58" />,
                    bgColor: '#0f9d5824',
                    underlayColor: '#0f9d585a',
                    onPress: () => onAuthCheck(() => router.push('/Logistics/Trucks/AddTrucks'))
                },
                {
                    id: 3,
                    title: 'Add Load',
                    icon: <FontAwesome6 name="box" size={wp(6)} color="#4285f4" />,
                    bgColor: '#4285f424',
                    underlayColor: '#4285f45a',
                    onPress: () => onAuthCheck(() => router.push('/Logistics/Loads/AddLoads'))
                },
                {
                    id: 4,
                    title: 'Truck Status',
                    icon: <Fontisto name="truck" size={wp(6)} color="#0f9d58" />,
                    bgColor: '#0f9d5824',
                    underlayColor: '#0f9d585a',
                    onPress: () => onAuthCheck(() => router.push({
                        pathname: '/Logistics/Trucks/Index',
                        params: { userId: user?.uid || '' }
                    }))
                }
            ]
        },
        {
            id: 2,
            title: 'Management',
            description: 'Oversee fleet performance and compliance',
            items: [
                {
                    id: 5,
                    title: 'Owner Status',
                    icon: <MaterialCommunityIcons name="account-check" size={wp(6)} color="#4285f4" />,
                    bgColor: '#4285f424',
                    underlayColor: '#4285f45a',
                    onPress: () => onAuthCheck(() => router.push('/Account/Verification/Index'))
                },
                {
                    id: 6,
                    title: 'My Loads',
                    icon: <FontAwesome6 name="box" size={wp(6)} color="#F48024" />,
                    bgColor: '#F4802424',
                    underlayColor: '#F480245a',
                    onPress: () => onAuthCheck(() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dspRoute: "My Loads" } }))
                },
                {
                    id: 7,
                    title: 'Courier Requests',
                    icon: <MaterialCommunityIcons name="truck-delivery" size={wp(6)} color="#e06eb5" />,
                    bgColor: '#e06eb524',
                    underlayColor: '#e06eb55a',
                    onPress: () => onAuthCheck(() => router.push({ pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dspRoute: "Requested Loads" } }))
                }
            ]
        },
        {
            id: 3,
            title: 'Roles & Personnel',
            description: 'Manage fleet roles and team members',
            items: [
                {
                    id: 8,
                    title: 'Driver',
                    icon: <Fontisto name="truck" size={wp(6)} color="#FF6B35" />,
                    bgColor: '#FF6B3524',
                    underlayColor: '#FF6B355a',
                    onPress: () => onAuthCheck(() => router.push('/Fleet/Driver/Index'))
                },
                {
                    id: 9,
                    title: 'Admin',
                    icon: <Ionicons name="shield-checkmark" size={wp(6)} color="#8E44AD" />,
                    bgColor: '#8E44AD24',
                    underlayColor: '#8E44AD5a',
                    onPress: () => onAuthCheck(() => router.push('/Fleet/Admin'))
                },
                {
                    id: 10,
                    title: 'Dispatcher',
                    icon: <MaterialCommunityIcons name="truck-delivery" size={wp(6)} color="#E74C3C" />,
                    bgColor: '#E74C3C24',
                    underlayColor: '#E74C3C5a',
                    onPress: () => onAuthCheck(() => router.push('/Fleet/Dispatcher'))
                },
                {
                    id: 11,
                    title: 'Fleet Manager',
                    icon: <Ionicons name="business" size={wp(6)} color="#3498DB" />,
                    bgColor: '#3498DB24',
                    underlayColor: '#3498DB5a',
                    onPress: () => onAuthCheck(() => router.push('/Fleet/FleetManager'))
                }
            ]
        },
        {
            id: 4,
            title: 'Financial',
            description: 'Manage fleet finances and earnings',
            items: [
                {
                    id: 12,
                    title: 'Funds',
                    icon: <Ionicons name="add-circle" size={wp(6)} color="#F1C40F" />,
                    bgColor: '#F1C40F24',
                    underlayColor: '#F1C40F5a',
                    onPress: () => onAuthCheck(() => router.push('/Wallet/DepositAndWithdraw'))
                },
                {
                    id: 13,
                    title: 'History',
                    icon: <Ionicons name="time" size={wp(6)} color="#1ABC9C" />,
                    bgColor: '#1ABC9C24',
                    underlayColor: '#1ABC9C5a',
                    onPress: () => onAuthCheck(() => router.push('/Wallet/WalletHistory'))
                },
                {
                    id: 14,
                    title: 'Rewards',
                    icon: <Ionicons name="gift" size={wp(6)} color="#E67E22" />,
                    bgColor: '#E67E2224',
                    underlayColor: '#E67E225a',
                    onPress: () => onAuthCheck(() => router.push('/Wallet/RewardsAndBonuses'))
                },
                {
                    id: 15,
                    title: 'Ambassador',
                    icon: <Ionicons name="people" size={wp(6)} color="#2ECC71" />,
                    bgColor: '#2ECC7124',
                    underlayColor: '#2ECC715a',
                    onPress: () => onAuthCheck(() => router.push('/Wallet/AmbassodorEarnings'))
                }
            ]
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

            {/* Fleet Management Sections */}
            {fleetSections.map((section) => (
                <View key={section.id} style={[styles.sectionContainer, { backgroundColor: background, borderColor: border }]}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="truck-cargo-container" size={wp(5)} color={accent} />
                        <View style={styles.sectionTitleContainer}>
                            <ThemedText type='subtitle' style={styles.sectionTitle}>
                                {section.title}
                            </ThemedText>
                            <ThemedText type='tiny' style={[styles.sectionDescription, { color: textlight }]}>
                                {section.description}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.sectionGrid}>
                        {section.items.map((item) => (
                            <TouchableHighlight
                                key={item.id}
                                onPress={item.onPress}
                                underlayColor={item.underlayColor}
                                style={[styles.sectionItem, { backgroundColor: item.bgColor }]}
                            >
                                <View style={styles.itemContent}>
                                    {item.icon}
                                    <ThemedText type='tiny' style={styles.itemLabel} numberOfLines={2}>
                                        {item.title}
                                    </ThemedText>
                                </View>
                            </TouchableHighlight>
                        ))}
                    </View>
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
    sectionContainer: {
        padding: wp(4),
        gap: wp(3),
        marginBottom: wp(4),
        borderWidth: 0.5,
        borderRadius: 12,
        shadowColor: "#0f9d58",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
        elevation: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        marginBottom: wp(2),
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: wp(4),
        marginBottom: wp(1),
    },
    sectionDescription: {
        fontSize: wp(3),
        opacity: 0.8,
    },
    sectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    sectionItem: {
        width: wp(18),
        height: wp(18),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp(3),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(1),
    },
    itemLabel: {
        textAlign: 'center',
        fontSize: wp(2.8),
        fontWeight: '600',
        marginTop: wp(1),
    },
});