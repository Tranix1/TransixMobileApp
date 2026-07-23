    import React, { useEffect, useState } from 'react';
    import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
    import { ThemedText } from '@/components/ThemedText';
    import ScreenWrapper from '@/components/ScreenWrapper';
    import { useThemeColor } from '@/hooks/useThemeColor';
    import Heading from '@/components/Heading';
    import { Ionicons } from '@expo/vector-icons';
    import { wp, hp } from '@/constants/common';
    import { useLocalSearchParams } from 'expo-router';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { doc, getDoc } from 'firebase/firestore';
    import { db } from '@/db/fireBaseConfig';

    // ---------- Types ----------

    interface TruckTypeEntry {
        type: string;
        count: number;
    }

    interface LoadEntry {
        id: string;
        from: string;
        to: string;
    }

    interface ReviewEntry {
        id: string;
        reviewer: string;
        rating: number;
        comment: string;
        date: string;
    }

    interface FleetProfileData {
        logoUrl: string | null;
        name: string;
        location: string;
        rating: number;
        reviewsCount: number;
        memberSince: string;
        lastActive: string;

        totalTrucks: number;
        availableTrucks: number;
        drivers: number;
        activeTrips: number;
        completedTrips: number;

        onTimeDelivery: number;
        acceptanceRate: number;
        avgResponseTime: string;
        paymentReputation: string;
        cancellationRate: number;
        trackingStatus: 'Live' | 'Manual' | 'Unavailable';
        totalDistance: number;

        truckTypes: TruckTypeEntry[];
        services: string[];
        publicLoads: LoadEntry[];
        privateLoads: LoadEntry[];
        latestReviews: ReviewEntry[];
    }

    const ALL_SERVICES = [
        { key: 'local_transport', label: 'Local Transport' },
        { key: 'cross_border', label: 'Cross Border' },
        { key: 'refrigerated', label: 'Refrigerated' },
        { key: 'container_transport', label: 'Container Transport' },
        { key: 'hazardous_goods', label: 'Hazardous Goods' },
        { key: 'express_delivery', label: 'Express Delivery' },
    ];

    const DEFAULT_FLEET: FleetProfileData = {
        logoUrl: null,
        name: 'Fleet Operator',
        location: 'Harare, Zimbabwe',
        rating: 4.8,
        reviewsCount: 37,
        memberSince: 'Jan 2023',
        lastActive: 'Today',

        totalTrucks: 32,
        availableTrucks: 11,
        drivers: 28,
        activeTrips: 6,
        completedTrips: 412,

        onTimeDelivery: 96,
        acceptanceRate: 91,
        avgResponseTime: '12 min',
        paymentReputation: 'Excellent',
        cancellationRate: 2,
        trackingStatus: 'Live',
        totalDistance: 184200,

        truckTypes: [
            { type: '30 Tonne Sidetipper', count: 13 },
            { type: '34 Tonne Tautliner', count: 8 },
            { type: 'Flatbed', count: 5 },
            { type: 'Lowbed', count: 4 },
            { type: 'Fuel Tanker', count: 2 },
        ],
        services: ['local_transport', 'cross_border', 'container_transport'],
        publicLoads: [
            { id: 'l1', from: 'Harare', to: 'Beitbridge' },
            { id: 'l2', from: 'Lusaka', to: 'Harare' },
            { id: 'l3', from: 'Bulawayo', to: 'Gweru' },
        ],
        privateLoads: [],
        latestReviews: [
            { id: 'r1', reviewer: 'J. Moyo', rating: 5, comment: 'Always on time and professional communication from start to finish.', date: 'Jun 8, 2026' },
            { id: 'r2', reviewer: 'T. Chirwa', rating: 4, comment: 'Dependable fleet with good coverage across the region.', date: 'May 21, 2026' },
        ],
    };

    // ---------- Small reusable pieces ----------

    function StatBlock({ label, value, background, valueColor, iconColor }: { label: string; value: string | number; background: string; valueColor: string; iconColor: string }) {
        return (
            <View style={[styles.statBlock, { backgroundColor: background }]}>
                <ThemedText style={[styles.statValue, { color: valueColor }]}>{value}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: iconColor }]}>{label}</ThemedText>
            </View>
        );
    }

    function SectionCard({ title, children, background, textColor }: { title: string; children: React.ReactNode; background: string; textColor: string }) {
        return (
            <View style={[styles.section, { backgroundColor: background }]}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>{title}</ThemedText>
                {children}
            </View>
        );
    }

    // ---------- Main component ----------

    export default function FleetProfile() {
        const background = useThemeColor('background');
        const backgroundLight = useThemeColor('backgroundLight');
        const text = useThemeColor('text');
        const accent = useThemeColor('accent');
        const icon = useThemeColor('icon');

        const { organizationId, isOwner } = useLocalSearchParams<{ organizationId?: string; isOwner?: string }>();
        const [fleet, setFleet] = useState<FleetProfileData>(DEFAULT_FLEET);
        const [loading, setLoading] = useState(true);
        const [publicLoadsOpen, setPublicLoadsOpen] = useState(true);
        const [privateLoadsOpen, setPrivateLoadsOpen] = useState(false);

        const viewerIsOwner = isOwner === 'true';

        useEffect(() => {
            const loadFleetProfile = async () => {
                try {
                    const storedRole = await AsyncStorage.getItem('currentRole');
                    const orgId = organizationId || (storedRole ? JSON.parse(storedRole)?.organizationId : null);
                    if (!orgId) {
                        setLoading(false);
                        return;
                    }

                    const snapshot = await getDoc(doc(db, 'organizationProfiles', orgId));

                    if (snapshot.exists()) {
                        const data = snapshot.data() as any;
                        setFleet((prev) => ({
                            ...prev,
                            logoUrl: data.logoUrl ?? prev.logoUrl,
                            name: data.name || prev.name,
                            location: data.location?.description || data.location || prev.location,
                            rating: data.rating ?? prev.rating,
                            reviewsCount: data.reviewsCount ?? prev.reviewsCount,
                            memberSince: data.memberSince || prev.memberSince,
                            lastActive: data.lastActive || prev.lastActive,

                            totalTrucks: data.truckCount ?? prev.totalTrucks,
                            availableTrucks: data.availableTrucks ?? prev.availableTrucks,
                            drivers: data.memberCount ?? prev.drivers,
                            activeTrips: data.activeTrips ?? prev.activeTrips,
                            completedTrips: data.completedTrips ?? prev.completedTrips,

                            onTimeDelivery: data.onTimeDelivery ?? prev.onTimeDelivery,
                            acceptanceRate: data.acceptanceRate ?? prev.acceptanceRate,
                            avgResponseTime: data.responseTime ? `${data.responseTime} min` : prev.avgResponseTime,
                            paymentReputation: data.paymentReputation || prev.paymentReputation,
                            cancellationRate: data.cancellationRate ?? prev.cancellationRate,
                            trackingStatus: data.trackingStatus || prev.trackingStatus,
                            totalDistance: data.totalDistance ?? prev.totalDistance,

                            truckTypes: data.truckTypes || prev.truckTypes,
                            services: data.services || prev.services,
                            publicLoads: data.publicLoads || prev.publicLoads,
                            privateLoads: data.privateLoads || prev.privateLoads,
                            latestReviews: data.latestReviews || prev.latestReviews,
                        }));
                    }
                } catch (error) {
                    console.error('Error loading fleet profile:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadFleetProfile();
        }, [organizationId]);

        const trackingColor =
            fleet.trackingStatus === 'Live' ? '#16a34a' : fleet.trackingStatus === 'Manual' ? '#f2b01e' : '#9ca3af';

        return (
            <ScreenWrapper>
                <Heading page="Fleet Profile" />

                <ScrollView contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(6) }}>

                    {/* ---------- Header ---------- */}
                    <View style={[styles.card, { backgroundColor: backgroundLight }]}>
                        <View style={styles.headerRow}>
                            <View style={styles.headerLeft}>
                                {fleet.logoUrl ? (
                                    <Image source={{ uri: fleet.logoUrl }} style={styles.logo} />
                                ) : (
                                    <View style={[styles.logoPlaceholder, { backgroundColor: accent + '15' }]}>
                                        <Ionicons name="business" size={wp(7)} color={accent} />
                                    </View>
                                )}
                                <View style={styles.headerText}>
                                    <ThemedText style={[styles.title, { color: text }]}>{fleet.name}</ThemedText>
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location-outline" size={wp(3.5)} color={icon} />
                                        <ThemedText style={[styles.subtitle, { color: icon }]}> {fleet.location}</ThemedText>
                                    </View>
                                </View>
                            </View>
                            {viewerIsOwner && (
                                <TouchableOpacity style={[styles.actionPill, { backgroundColor: accent + '20' }]} onPress={() => { }}>
                                    <Ionicons name="pencil" size={wp(4)} color={accent} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={wp(4)} color="#f2b01e" />
                                <ThemedText style={[styles.ratingText, { color: text }]}>{fleet.rating.toFixed(1)}</ThemedText>
                            </View>
                            <ThemedText style={[styles.reviewText, { color: icon }]}>{fleet.reviewsCount} reviews</ThemedText>
                        </View>

                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <ThemedText style={[styles.metaLabel, { color: icon }]}>Member since</ThemedText>
                                <ThemedText style={[styles.metaValue, { color: text }]}>{fleet.memberSince}</ThemedText>
                            </View>
                            <View style={styles.metaDivider} />
                            <View style={styles.metaItem}>
                                <ThemedText style={[styles.metaLabel, { color: icon }]}>Last active</ThemedText>
                                <ThemedText style={[styles.metaValue, { color: text }]}>{fleet.lastActive}</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* ---------- Overview ---------- */}
                    <SectionCard title="Overview" background={backgroundLight} textColor={text}>
                        <View style={styles.statsGrid}>
                            <StatBlock label="Total Trucks" value={fleet.totalTrucks} background={background} valueColor={text} iconColor={icon} />
                            <StatBlock label="Available" value={fleet.availableTrucks} background={background} valueColor={text} iconColor={icon} />
                            <StatBlock label="Drivers" value={fleet.drivers} background={background} valueColor={text} iconColor={icon} />
                            <StatBlock label="Active Trips" value={fleet.activeTrips} background={background} valueColor={text} iconColor={icon} />
                            <StatBlock label="Completed" value={fleet.completedTrips} background={background} valueColor={text} iconColor={icon} />
                        </View>
                    </SectionCard>

                    {/* ---------- Fleet Performance ---------- */}
                    <SectionCard title="Fleet Performance" background={backgroundLight} textColor={text}>
                        <View style={styles.performanceList}>
                            <View style={styles.performanceRow}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>On-Time Delivery</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.onTimeDelivery}%</ThemedText>
                            </View>
                            <View style={styles.performanceRow}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Acceptance Rate</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.acceptanceRate}%</ThemedText>
                            </View>
                            <View style={styles.performanceRow}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Avg Response Time</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.avgResponseTime}</ThemedText>
                            </View>
                            <View style={styles.performanceRow}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Payment Reputation</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.paymentReputation}</ThemedText>
                            </View>
                            <View style={styles.performanceRow}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Cancellation Rate</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.cancellationRate}%</ThemedText>
                            </View>
                            <View style={styles.performanceRow}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Tracking Status</ThemedText>
                                <View style={styles.trackingBadge}>
                                    <View style={[styles.trackingDot, { backgroundColor: trackingColor }]} />
                                    <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.trackingStatus}</ThemedText>
                                </View>
                            </View>
                            <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Total Distance</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>{fleet.totalDistance.toLocaleString()} km</ThemedText>
                            </View>
                        </View>
                    </SectionCard>

                    {/* ---------- Truck Types ---------- */}
                    <SectionCard title="Truck Types" background={backgroundLight} textColor={text}>
                        {fleet.truckTypes.map((t) => (
                            <View key={t.type} style={styles.truckTypeRow}>
                                <View style={[styles.truckCountPill, { backgroundColor: accent + '15' }]}>
                                    <ThemedText style={[styles.truckCountText, { color: accent }]}>{t.count}×</ThemedText>
                                </View>
                                <ThemedText style={[styles.truckTypeText, { color: text }]}>{t.type}</ThemedText>
                            </View>
                        ))}
                    </SectionCard>

                    {/* ---------- Services ---------- */}
                    <SectionCard title="Services" background={backgroundLight} textColor={text}>
                        <View style={styles.servicesGrid}>
                            {ALL_SERVICES.map((service) => {
                                const active = fleet.services.includes(service.key);
                                return (
                                    <View
                                        key={service.key}
                                        style={[
                                            styles.serviceItem,
                                            { backgroundColor: active ? accent + '10' : 'transparent', borderColor: active ? accent + '40' : '#e2e8f0' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={active ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={wp(4.2)}
                                            color={active ? accent : icon}
                                        />
                                        <ThemedText style={[styles.serviceText, { color: active ? text : icon }]}>{service.label}</ThemedText>
                                    </View>
                                );
                            })}
                        </View>
                    </SectionCard>

                    {/* ---------- Loads ---------- */}
                    <SectionCard title="Loads" background={backgroundLight} textColor={text}>
                        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setPublicLoadsOpen((v) => !v)}>
                            <ThemedText style={[styles.dropdownTitle, { color: text }]}>Public Loads</ThemedText>
                            <Ionicons name={publicLoadsOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                        </TouchableOpacity>
                        {publicLoadsOpen && (
                            <View style={styles.dropdownBody}>
                                {fleet.publicLoads.length === 0 ? (
                                    <ThemedText style={[styles.emptyText, { color: icon }]}>No public loads listed.</ThemedText>
                                ) : (
                                    fleet.publicLoads.map((load) => (
                                        <View key={load.id} style={styles.loadRow}>
                                            <Ionicons name="arrow-forward-circle-outline" size={wp(4)} color={accent} />
                                            <ThemedText style={[styles.loadText, { color: text }]}> {load.from} → {load.to}</ThemedText>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}

                        {viewerIsOwner && (
                            <>
                                <TouchableOpacity style={[styles.dropdownHeader, styles.dropdownHeaderSpaced]} onPress={() => setPrivateLoadsOpen((v) => !v)}>
                                    <ThemedText style={[styles.dropdownTitle, { color: text }]}>Private Loads</ThemedText>
                                    <Ionicons name={privateLoadsOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                                </TouchableOpacity>
                                {privateLoadsOpen && (
                                    <View style={styles.dropdownBody}>
                                        {fleet.privateLoads.length === 0 ? (
                                            <ThemedText style={[styles.emptyText, { color: icon }]}>No private loads.</ThemedText>
                                        ) : (
                                            fleet.privateLoads.map((load) => (
                                                <View key={load.id} style={styles.loadRow}>
                                                    <Ionicons name="lock-closed-outline" size={wp(3.6)} color={icon} />
                                                    <ThemedText style={[styles.loadText, { color: text }]}> {load.from} → {load.to}</ThemedText>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </SectionCard>

                    {/* ---------- Reviews ---------- */}
                    <SectionCard title="Reviews" background={backgroundLight} textColor={text}>
                        <View style={styles.reviewsSummary}>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={wp(5)} color="#f2b01e" />
                                <ThemedText style={[styles.ratingTextLarge, { color: text }]}>{fleet.rating.toFixed(1)}</ThemedText>
                            </View>
                            <ThemedText style={[styles.reviewText, { color: icon }]}>{fleet.reviewsCount} reviews</ThemedText>
                        </View>

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
                    </SectionCard>
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
            alignItems: 'flex-start',
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        logo: {
            width: wp(14),
            height: wp(14),
            borderRadius: wp(3),
        },
        logoPlaceholder: {
            width: wp(14),
            height: wp(14),
            borderRadius: wp(3),
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerText: {
            marginLeft: wp(3),
            flexShrink: 1,
        },
        title: {
            fontSize: wp(5.2),
            fontWeight: 'bold',
        },
        locationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: wp(1),
        },
        subtitle: {
            fontSize: wp(3.2),
        },
        actionPill: {
            paddingHorizontal: wp(3),
            paddingVertical: wp(2),
            borderRadius: wp(3),
            alignItems: 'center',
            justifyContent: 'center',
        },
        ratingRow: {
            marginTop: wp(4),
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(3),
        },
        ratingBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: wp(3),
            paddingVertical: wp(2),
            borderRadius: wp(3),
            backgroundColor: '#4B5563',
        },
        ratingText: {
            marginLeft: wp(2),
            fontWeight: 'bold',
            fontSize: wp(5),
        },
        ratingTextLarge: {
            marginLeft: wp(2),
            fontWeight: 'bold',
            fontSize: wp(6),
        },
        reviewText: {
            fontSize: wp(3.2),
            fontWeight: '600',
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: wp(4),
            paddingTop: wp(3),
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
        },
        metaItem: {
            flex: 1,
        },
        metaDivider: {
            width: 1,
            height: wp(8),
            backgroundColor: '#e2e8f0',
            marginHorizontal: wp(3),
        },
        metaLabel: {
            fontSize: wp(3),
            marginBottom: wp(1),
        },
        metaValue: {
            fontSize: wp(3.6),
            fontWeight: '600',
        },
        section: {
            borderRadius: wp(4),
            padding: wp(4),
            marginBottom: wp(3),
        },
        sectionTitle: {
            fontSize: wp(4.2),
            fontWeight: 'bold',
            marginBottom: wp(3),
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: wp(2),
        },
        statBlock: {
            width: '31%',
            borderRadius: wp(3),
            paddingVertical: wp(3),
            paddingHorizontal: wp(2),
            alignItems: 'center',
        },
        statValue: {
            fontSize: wp(5),
            fontWeight: 'bold',
        },
        statLabel: {
            fontSize: wp(2.8),
            marginTop: wp(1),
            textAlign: 'center',
        },
        performanceList: {
            marginTop: wp(1),
        },
        performanceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: wp(2.5),
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
        },
        performanceLabel: {
            fontSize: wp(3.4),
        },
        performanceValue: {
            fontSize: wp(3.6),
            fontWeight: '700',
        },
        trackingBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(1.5),
        },
        trackingDot: {
            width: wp(2),
            height: wp(2),
            borderRadius: wp(1),
        },
        truckTypeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: wp(2),
        },
        truckCountPill: {
            borderRadius: wp(2),
            paddingHorizontal: wp(2.5),
            paddingVertical: wp(1),
            marginRight: wp(3),
        },
        truckCountText: {
            fontSize: wp(3.4),
            fontWeight: 'bold',
        },
        truckTypeText: {
            fontSize: wp(3.6),
            fontWeight: '500',
        },
        servicesGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: wp(2),
        },
        serviceItem: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: wp(3),
            paddingHorizontal: wp(3),
            paddingVertical: wp(2),
            gap: wp(1.5),
        },
        serviceText: {
            fontSize: wp(3.2),
            fontWeight: '600',
        },
        dropdownHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: wp(2),
        },
        dropdownHeaderSpaced: {
            marginTop: wp(2),
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            paddingTop: wp(3),
        },
        dropdownTitle: {
            fontSize: wp(3.8),
            fontWeight: '700',
        },
        dropdownBody: {
            paddingBottom: wp(2),
        },
        loadRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: wp(1.5),
        },
        loadText: {
            fontSize: wp(3.4),
        },
        emptyText: {
            fontSize: wp(3.2),
            fontStyle: 'italic',
            paddingVertical: wp(1),
        },
        reviewsSummary: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(3),
            marginBottom: wp(3),
        },
        reviewCard: {
            borderRadius: wp(3),
            padding: wp(3),
            marginTop: wp(2),
            borderWidth: 1,
            borderColor: '#d1d5db',
        },
        reviewHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: wp(2),
        },
        reviewName: {
            fontSize: wp(4),
            fontWeight: 'bold',
        },
        reviewRating: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        reviewRatingText: {
            marginLeft: wp(1),
            fontWeight: '700',
        },
        reviewComment: {
            fontSize: wp(3.2),
            marginBottom: wp(2),
            lineHeight: hp(2.6),
        },
        reviewDate: {
            fontSize: wp(3),
            opacity: 0.8,
        },
    });
