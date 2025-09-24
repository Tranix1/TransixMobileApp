import React from 'react';
import { View, ScrollView, TouchableOpacity, TouchableHighlight, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { EvilIcons, MaterialCommunityIcons, Ionicons, FontAwesome6, Fontisto } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { router } from 'expo-router';
import HomeItemView from '@/components/HomeItemView';

interface HomeContentProps {
    onAuthCheck: (action?: () => void) => void;
}

export default function HomeContent({ onAuthCheck }: HomeContentProps) {
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const textlight = useThemeColor('textlight');
    const border = useThemeColor('border');

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

                <View style={styles.quickLinksGrid}>
                    <View style={styles.quickLinkItem}>
                        <TouchableHighlight
                            onPress={() => onAuthCheck(() => router.push('/Logistics/Contracts/NewContract'))}
                            underlayColor={'#F480245a'}
                            style={[styles.quickLinkButton, { backgroundColor: '#F4802424' }]}
                        >
                            <Ionicons name="reader" size={wp(5)} color="#e50914" />
                        </TouchableHighlight>
                        <ThemedText type='tiny' style={styles.quickLinkLabel}>
                            Create Contract
                        </ThemedText>
                    </View>

                    <View style={styles.quickLinkItem}>
                        <TouchableHighlight
                            onPress={() => onAuthCheck(() => router.push('/Logistics/Trucks/AddTrucks'))}
                            underlayColor={'#0f9d585a'}
                            style={[styles.quickLinkButton, { backgroundColor: '#0f9d5824' }]}
                        >
                            <Fontisto name="truck" size={wp(5)} color="#0f9d58" />
                        </TouchableHighlight>
                        <ThemedText type='tiny' style={styles.quickLinkLabel}>
                            Add Truck
                        </ThemedText>
                    </View>

                    <View style={styles.quickLinkItem}>
                        <TouchableHighlight
                            onPress={() => onAuthCheck(() => router.push('/Logistics/Loads/AddLoads'))}
                            underlayColor={'#4285f45a'}
                            style={[styles.quickLinkButton, { backgroundColor: '#4285f424' }]}
                        >
                            <FontAwesome6 name="box" size={wp(5)} color="#4285f4" />
                        </TouchableHighlight>
                        <ThemedText type='tiny' style={styles.quickLinkLabel}>
                            Add Load
                        </ThemedText>
                    </View>

                    <View style={styles.quickLinkItem}>
                        <TouchableHighlight
                            onPress={() => onAuthCheck(() => router.push('/Transport/Store/CreateProduct'))}
                            underlayColor={'#F480245a'}
                            style={[styles.quickLinkButton, { backgroundColor: '#F4802424' }]}
                        >
                            <Fontisto name="dollar" size={wp(5)} color="#F48024" />
                        </TouchableHighlight>
                        <ThemedText type='tiny' style={styles.quickLinkLabel}>
                            Sell Products
                        </ThemedText>
                    </View>
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
                            iconElement={<Ionicons name="checkmark-shield" size={wp(4)} color={'#fff'} />}
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
    quickLinksGrid: {
        flexDirection: 'row',
        gap: wp(2),
        justifyContent: 'space-between',
    },
    quickLinkItem: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: wp(2),
        width: wp(16),
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
    },
});


