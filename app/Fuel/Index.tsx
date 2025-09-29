import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, TouchableNativeFeedback, ActivityIndicator, RefreshControl, StyleSheet, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import Heading from "@/components/Heading";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { openWhatsApp, getContactMessage } from '@/Utilities/whatsappUtils';

interface Device {
    id: string;
    name: string;
    status?: string;
}

export default function Index() {
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')


    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [refreshing, setRefreshing] = useState(false)
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);


    const [filteredPNotAavaialble, setFilteredPNotAavaialble] = React.useState(false)
    const LoadTructs = async () => {
        let filters: any[] = [];
        const maLoads = await fetchDocuments("FuelStations");

        if (maLoads.data.length) {

            if (filters.length > 0 && maLoads.data.length < 0) setFilteredPNotAavaialble(true)
            setDevices(maLoads.data as Device[])
            setLastVisible(maLoads.lastVisible)
        }
    }
    useEffect(() => {
        LoadTructs();
    }, [])

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await LoadTructs();
            setRefreshing(false);

        } catch (error) {

        }
    };

    const loadMoreLoads = async () => {

        if (loadingMore || !lastVisible) return;
        setLoadingMore(true);
        const result = await fetchDocuments('Cargo', 10, lastVisible);
        if (result) {
            setDevices([...devices, ...result.data as Device[]]);
            setLastVisible(result.lastVisible);
        }
        setLoadingMore(false);
    };



    //   if (loading) {
    //     return (
    //       <ScreenWrapper>
    //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //           <ActivityIndicator size="large" />
    //           <ThemedText>Loading devices...</ThemedText>
    //         </View>
    //       </ScreenWrapper>
    //     );
    //   }

    const handleContactUs = () => {
        const message = getContactMessage('fuel');
        openWhatsApp('+263787884434', message);
    };

    return (
        <ScreenWrapper>

            <Heading page='Fuel' />

            {/* How It Works Section */}
            <View style={[styles.howItWorksCard, { backgroundColor: accent + '05', borderColor: accent }]}>
                <View style={styles.howItWorksHeader}>
                    <MaterialIcons name="how-to-reg" size={wp(5)} color={accent} />
                    <ThemedText type="subtitle" style={[styles.howItWorksTitle, { color: accent }]}>
                        How It Works
                    </ThemedText>
                </View>

                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>1</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            Customers view your fuel prices & location in our app
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>2</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            They get GPS navigation directly to your station
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>3</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            Online payment is processed before arrival
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>4</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            Customers arrive, fuel up, and leave hassle-free
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>5</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            You get paid instantly - no waiting for payments!
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* Contact Integration Card */}
            <View style={[styles.contactCard, { backgroundColor: accent + '10', borderColor: accent }]}>
                <View style={styles.contactHeader}>
                    <MaterialIcons name="local-gas-station" size={wp(6)} color={accent} />
                    <ThemedText type="subtitle" style={[styles.contactTitle, { color: accent }]}>
                        Fuel Station Partnership
                    </ThemedText>
                </View>

                <ThemedText style={[styles.contactDescription, { color: icon }]}>
                    If you offer quality fuel at competitive prices and want to add your station here, contact us to get customers fast!
                </ThemedText>

                <View style={styles.featuresContainer}>
                    <ThemedText style={[styles.featuresTitle, { color: accent }]}>
                        Cool Features for Partners:
                    </ThemedText>
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="location-on" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Live GPS Navigation</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="payment" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Secure Online Payments</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="star" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Customer Reviews</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="analytics" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Sales Analytics</ThemedText>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: accent }]}
                    onPress={handleContactUs}
                >
                    <MaterialIcons name="chat" size={wp(4)} color="#fff" />
                    <ThemedText style={styles.contactButtonText}>Contact Now</ThemedText>
                </TouchableOpacity>
            </View>

            <FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{}}
                data={devices}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{
                            padding: 7,
                            marginVertical: 8,
                            marginHorizontal: 16,
                            borderRadius: 8
                        }}

                        onPress={() => router.push({ pathname: "/Map/Index", params: { destinationLati: -17.8252, destinationLongi: 31.0335 } })}
                    >
                        <ThemedText>Chibuku serve station</ThemedText>
                        <ThemedText>Diesel $1.90 per L</ThemedText>
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[accent]}
                    />
                }
                onEndReached={loadMoreLoads}
                onEndReachedThreshold={.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {!filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                            Loads Loading…
                        </ThemedText>}

                        {!filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                            Please Wait
                        </ThemedText>}
                        {filteredPNotAavaialble && <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                            Specified Load Not Available!
                        </ThemedText>}
                        {filteredPNotAavaialble && <ThemedText type='tiny' style={styles.emptySubtext}>
                            pull to refresh
                        </ThemedText>}
                    </View>
                }
                ListFooterComponent={
                    <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
                        {
                            loadingMore ?
                                <View style={{ flexDirection: "row", gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                                    <ThemedText type='tiny' style={{ color: icon }}>Loading More</ThemedText>
                                    <ActivityIndicator size="small" color={accent} />
                                </View>
                                :
                                (!lastVisible && devices.length > 0) ?
                                    <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                        <ThemedText type='tiny' style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>No more Loads to Load
                                        </ThemedText>
                                        <Ionicons color={icon} style={{}} name='alert-circle-outline' size={wp(6)} />

                                    </View>
                                    : null
                        }

                    </View>
                }
            />


        </ScreenWrapper>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: wp(2)
    }, countryButton: {
        padding: wp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(4)

    }, countryButtonSelected: {
        backgroundColor: '#73c8a9'
    }, detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(1),
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
    }, emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    }, emptyText: {
        textAlign: 'center'
    }, emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center'
    },
    contactCard: {
        margin: wp(4),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    contactTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    contactDescription: {
        fontSize: wp(3.8),
        lineHeight: wp(5),
        marginBottom: wp(4),
        textAlign: 'center'
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2)
    },
    contactButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    howItWorksCard: {
        margin: wp(4),
        marginBottom: wp(2),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    howItWorksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    howItWorksTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    stepsContainer: {
        gap: wp(2)
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3)
    },
    stepNumber: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepNumberText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    stepText: {
        flex: 1,
        fontSize: wp(3.5),
        lineHeight: wp(4.5)
    },
    featuresContainer: {
        marginTop: wp(3),
        marginBottom: wp(3)
    },
    featuresTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(2)
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2)
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        width: '48%',
        paddingVertical: wp(1)
    },
    featureText: {
        fontSize: wp(3.2),
        flex: 1
    }
})


