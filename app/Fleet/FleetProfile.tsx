import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

interface FleetProfileData {
    name: string;
    description: string;
    rating: number;
    reviewsCount: number;
    onTimePercentage: number;
    countriesServed: string[];
    fleetSize: number;
    truckTypes: string[];
    partnerSizes: string[];
    latestReviews: Array<{ id: string; reviewer: string; rating: number; comment: string; date: string }>;
}

export default function FleetProfile() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const { fleetId } = useLocalSearchParams();
    const [fleet, setFleet] = useState<FleetProfileData>({
        name: 'Fleet Operator',
        description: 'This fleet serves cross-border cargo requirements with reliability, safety, and modern truck capacity.',
        rating: 4.9,
        reviewsCount: 37,
        onTimePercentage: 96,
        countriesServed: ['Zimbabwe', 'Zambia', 'Botswana', 'South Africa'],
        fleetSize: 42,
        truckTypes: ['Flatbed', 'Tanker', 'Reefer', 'Dry Van'],
        partnerSizes: ['Small local importers', 'Regional distributors', 'Large mining firms'],
        latestReviews: [
            {
                id: 'r1',
                reviewer: 'J. Moyo',
                rating: 5,
                comment: 'Always on time and professional communication from start to finish.',
                date: 'Jun 8, 2026'
            },
            {
                id: 'r2',
                reviewer: 'T. Chirwa',
                rating: 4,
                comment: 'Dependable fleet with good coverage across the region.',
                date: 'May 21, 2026'
            }
        ]
    });

    useEffect(() => {
        const loadFleetProfile = async () => {
            try {
                const storedRole = await AsyncStorage.getItem('currentRole');
                const id = fleetId || (storedRole ? JSON.parse(storedRole)?.fleetId : null);
                if (!id) {
                    return;
                }

                const fleetDoc = await getDoc(doc(db, 'fleets', id));
                if (fleetDoc.exists()) {
                    const data = fleetDoc.data() as any;
                    setFleet((prev) => ({
                        ...prev,
                        name: data.name || prev.name,
                        description: data.description || prev.description,
                        rating: data.rating || prev.rating,
                        reviewsCount: data.reviewsCount || prev.reviewsCount,
                        onTimePercentage: data.onTimePercentage || prev.onTimePercentage,
                        countriesServed: data.countriesServed || prev.countriesServed,
                        fleetSize: data.fleetSize || prev.fleetSize,
                        truckTypes: data.truckTypes || prev.truckTypes,
                        partnerSizes: data.partnerSizes || prev.partnerSizes
                    }));
                }
            } catch (error) {
                console.error('Error loading fleet profile:', error);
            }
        };

        loadFleetProfile();
    }, [fleetId]);

    return (
        <ScreenWrapper>
            <Heading page="Fleet Profile" />
            <ScrollView contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(6) }}>
                <View style={[styles.card, { backgroundColor: backgroundLight }]}>
                    <View style={styles.headerRow}>
                        <View>
                            <ThemedText style={[styles.title, { color: text }]}>{fleet.name}</ThemedText>
                            <ThemedText style={[styles.subtitle, { color: icon }]}>Fleet profile summary</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionPill, { backgroundColor: accent + '20' }]}
                            onPress={() => { }}
                        >
                            <Ionicons name="pencil" size={wp(4)} color={accent} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: accent + '10' }]}>
                            <Ionicons name="shield-checkmark" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.badgeText, { color: accent }]}>Verified Fleet</ThemedText>
                        </View>
                    </View>

                    <View style={styles.ratingRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={wp(4)} color="#f2b01e" />
                            <ThemedText style={[styles.ratingText, { color: text }]}>{fleet.rating.toFixed(1)}</ThemedText>
                        </View>
                        <ThemedText style={[styles.reviewText, { color: icon }]}>{fleet.reviewsCount} reviews</ThemedText>
                    </View>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: backgroundLight }]}>
                    <View style={styles.statsCard}>
                        <ThemedText style={[styles.statsLabel, { color: icon }]}>On-Time</ThemedText>
                        <ThemedText style={[styles.statsValue, { color: text }]}>{fleet.onTimePercentage}%</ThemedText>
                    </View>
                    <View style={styles.statsCard}>
                        <ThemedText style={[styles.statsLabel, { color: icon }]}>Countries</ThemedText>
                        <ThemedText style={[styles.statsValue, { color: text }]}>{fleet.countriesServed.length}</ThemedText>
                    </View>
                    <View style={styles.statsCard}>
                        <ThemedText style={[styles.statsLabel, { color: icon }]}>Fleet Size</ThemedText>
                        <ThemedText style={[styles.statsValue, { color: text }]}>{fleet.fleetSize}</ThemedText>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={[styles.sectionTitle, { color: text }]}>About the Fleet</ThemedText>
                    <ThemedText style={[styles.sectionText, { color: icon }]}>{fleet.description}</ThemedText>
                </View>

                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={[styles.sectionTitle, { color: text }]}>Truck Types</ThemedText>
                    <View style={styles.tagRow}>
                        {fleet.truckTypes.map((type) => (
                            <View key={type} style={[styles.tag, { borderColor: accent + '40' }]}>
                                <ThemedText style={[styles.tagText, { color: accent }]}>{type}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={[styles.sectionTitle, { color: text }]}>Countries Served</ThemedText>
                    <View style={styles.chipRow}>
                        {fleet.countriesServed.map((country) => (
                            <View key={country} style={[styles.chip, { backgroundColor: accent + '10' }]}>
                                <ThemedText style={[styles.chipText, { color: accent }]}>{country}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={[styles.sectionTitle, { color: text }]}>Partner Sizes</ThemedText>
                    <View style={styles.chipRow}>
                        {fleet.partnerSizes.map((partner) => (
                            <View key={partner} style={[styles.chip, { backgroundColor: accent + '10' }]}>
                                <ThemedText style={[styles.chipText, { color: accent }]}>{partner}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={[styles.sectionTitle, { color: text }]}>Latest Reviews</ThemedText>
                    {fleet.latestReviews.map((review) => (
                        <View key={review.id} style={[styles.reviewCard, { backgroundColor: background }]}>
                            <View style={styles.reviewHeader}>
                                <ThemedText style={[styles.reviewName, { color: text }]}>{review.reviewer}</ThemedText>
                                <View style={styles.reviewRating}>
                                    <Ionicons name="star" size={wp(3)} color="#f2b01e" />
                                    <ThemedText style={[styles.reviewRatingText, { color: text }]}>{review.rating}</ThemedText>
                                </View>
                            </View>
                            <ThemedText style={[styles.reviewComment, { color: icon }]}>{review.comment}</ThemedText>
                            <ThemedText style={[styles.reviewDate, { color: icon }]}>{review.date}</ThemedText>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: wp(4),
        padding: wp(4),
        marginVertical: wp(3),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    title: {
        fontSize: wp(6),
        fontWeight: 'bold'
    },
    subtitle: {
        marginTop: wp(1),
        fontSize: wp(3),
    },
    actionPill: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeRow: {
        marginTop: wp(4)
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(3)
    },
    badgeText: {
        marginLeft: wp(2),
        fontWeight: '600'
    },
    ratingRow: {
        marginTop: wp(4),
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3)
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(3),
        backgroundColor: '#fef3c7'
    },
    ratingText: {
        marginLeft: wp(2),
        fontWeight: 'bold',
        fontSize: wp(5)
    },
    reviewText: {
        fontSize: wp(3.2),
        fontWeight: '600'
    },
    statsContainer: {
        borderRadius: wp(4),
        padding: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(3)
    },
    statsCard: {
        flex: 1,
        borderRadius: wp(3),
        padding: wp(3),
        marginRight: wp(2),
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    statsLabel: {
        fontSize: wp(3.2),
        marginBottom: wp(2)
    },
    statsValue: {
        fontSize: wp(5),
        fontWeight: 'bold'
    },
    section: {
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: wp(3)
    },
    sectionTitle: {
        fontSize: wp(4.2),
        fontWeight: 'bold',
        marginBottom: wp(3)
    },
    sectionText: {
        lineHeight: hp(2.8)
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tag: {
        borderWidth: 1,
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        marginBottom: wp(2),
        marginRight: wp(2)
    },
    tagText: {
        fontSize: wp(3.2),
        fontWeight: '600'
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    chip: {
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        marginBottom: wp(2),
        marginRight: wp(2)
    },
    chipText: {
        fontSize: wp(3),
        fontWeight: '600'
    },
    reviewCard: {
        borderRadius: wp(3),
        padding: wp(3),
        marginTop: wp(2),
        borderWidth: 1,
        borderColor: '#d1d5db'
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(2)
    },
    reviewName: {
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    reviewRatingText: {
        marginLeft: wp(1),
        fontWeight: '700'
    },
    reviewComment: {
        fontSize: wp(3.2),
        marginBottom: wp(2),
        lineHeight: hp(2.6)
    },
    reviewDate: {
        fontSize: wp(3),
        opacity: 0.8
    }
});
