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
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

// ---------- Types ----------

interface LoadEntry {
    id: string;
    from: string;
    to: string;
    status?: 'Posted' | 'Assigned' | 'Expired' | 'Completed';
    date?: string;
}

interface ReviewEntry {
    id: string;
    reviewer: string;
    rating: number;
    comment: string;
    date: string;
}

interface BrokerProfileData {
    logoUrl: string | null;
    name: string;
    location: string;
    rating: number;
    reviewsCount: number;
    memberSince: string;
    lastActive: string;

    publicLoadsPosted: number;
    privateLoadsPosted: number;
    activeLoads: number;
    completedLoads: number;

    loadAcceptanceRate: number;
    avgResponseTime: string;
    replyRate: number;
    cancellationRate: number;
    paymentReputation: string;
    successfulDeliveries: number;
    disputes: number;
    expiredLoads: number;
    avgTimeToAssign: string;

    activePublicLoads: LoadEntry[];
    completedLoadsList: LoadEntry[];
    recentLoads: LoadEntry[];
    latestReviews: ReviewEntry[];
}

const DEFAULT_BROKER: BrokerProfileData = {
    logoUrl: null,
    name: 'Broker Company',
    location: 'Harare, Zimbabwe',
    rating: 4.7,
    reviewsCount: 52,
    memberSince: 'Mar 2022',
    lastActive: 'Today',

    publicLoadsPosted: 128,
    privateLoadsPosted: 34,
    activeLoads: 9,
    completedLoads: 311,

    loadAcceptanceRate: 88,
    avgResponseTime: '9 min',
    replyRate: 94,
    cancellationRate: 3,
    paymentReputation: 'Excellent',
    successfulDeliveries: 305,
    disputes: 2,
    expiredLoads: 6,
    avgTimeToAssign: '3.4 hrs',

    activePublicLoads: [
        { id: 'a1', from: 'Harare', to: 'Beitbridge', status: 'Posted', date: 'Today' },
        { id: 'a2', from: 'Mutare', to: 'Harare', status: 'Assigned', date: 'Yesterday' },
    ],
    completedLoadsList: [
        { id: 'c1', from: 'Bulawayo', to: 'Gweru', status: 'Completed', date: 'Jul 10, 2026' },
        { id: 'c2', from: 'Lusaka', to: 'Harare', status: 'Completed', date: 'Jul 6, 2026' },
    ],
    recentLoads: [
        { id: 'r1', from: 'Harare', to: 'Chirundu', status: 'Posted', date: 'Jul 14, 2026' },
        { id: 'r2', from: 'Kadoma', to: 'Harare', status: 'Expired', date: 'Jul 12, 2026' },
        { id: 'r3', from: 'Harare', to: 'Masvingo', status: 'Assigned', date: 'Jul 11, 2026' },
    ],
    latestReviews: [
        { id: 'rv1', reviewer: 'K. Ndlovu', rating: 5, comment: 'Clear communication and pays on time, every time.', date: 'Jul 5, 2026' },
        { id: 'rv2', reviewer: 'P. Banda', rating: 4, comment: 'Good load volume, occasionally slow to confirm assignment.', date: 'Jun 28, 2026' },
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

function statusColor(status?: LoadEntry['status']) {
    switch (status) {
        case 'Posted': return '#2563eb';
        case 'Assigned': return '#f2b01e';
        case 'Completed': return '#16a34a';
        case 'Expired': return '#9ca3af';
        default: return '#9ca3af';
    }
}

function LoadRow({ load, text, icon }: { load: LoadEntry; text: string; icon: string }) {
    return (
        <View style={styles.loadRow}>
            <View style={styles.loadRowLeft}>
                <Ionicons name="arrow-forward-circle-outline" size={wp(4)} color={statusColor(load.status)} />
                <ThemedText style={[styles.loadText, { color: text }]}> {load.from} → {load.to}</ThemedText>
            </View>
            <View style={styles.loadRowRight}>
                {load.status && (
                    <View style={[styles.statusPill, { backgroundColor: statusColor(load.status) + '18' }]}>
                        <ThemedText style={[styles.statusPillText, { color: statusColor(load.status) }]}>{load.status}</ThemedText>
                    </View>
                )}
                {load.date && <ThemedText style={[styles.loadDate, { color: icon }]}>{load.date}</ThemedText>}
            </View>
        </View>
    );
}

// ---------- Main component ----------

export default function BrokerProfile() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const { organizationId, isOwner } = useLocalSearchParams<{ organizationId?: string; isOwner?: string }>();
    const [broker, setBroker] = useState<BrokerProfileData>(DEFAULT_BROKER);
    const [loading, setLoading] = useState(true);

    const [activeOpen, setActiveOpen] = useState(true);
    const [completedOpen, setCompletedOpen] = useState(false);
    const [recentOpen, setRecentOpen] = useState(false);

    const viewerIsOwner = isOwner === 'true';

    useEffect(() => {
        const loadBrokerProfile = async () => {
            try {
                const storedRole = await AsyncStorage.getItem('currentRole');
                const orgId = organizationId || (storedRole ? JSON.parse(storedRole)?.organizationId : null);
                if (!orgId) {
                    setLoading(false);
                    return;
                }

                // Query the "profiles" collection filtered by organizationId.
                // If brokers and fleets share this collection, add:
                //   where('type', '==', 'broker')
                // If organizationId is your doc ID instead, use getDoc(doc(db, 'profiles', orgId)).
                const profilesQuery = query(
                    collection(db, 'profiles'),
                    where('organizationId', '==', orgId),
                    limit(1)
                );
                const snapshot = await getDocs(profilesQuery);

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data() as any;
                    setBroker((prev) => ({
                        ...prev,
                        logoUrl: data.logoUrl ?? prev.logoUrl,
                        name: data.name || prev.name,
                        location: data.location || prev.location,
                        rating: data.rating ?? prev.rating,
                        reviewsCount: data.reviewsCount ?? prev.reviewsCount,
                        memberSince: data.memberSince || prev.memberSince,
                        lastActive: data.lastActive || prev.lastActive,

                        publicLoadsPosted: data.publicLoadsPosted ?? prev.publicLoadsPosted,
                        privateLoadsPosted: data.privateLoadsPosted ?? prev.privateLoadsPosted,
                        activeLoads: data.activeLoads ?? prev.activeLoads,
                        completedLoads: data.completedLoads ?? prev.completedLoads,

                        loadAcceptanceRate: data.loadAcceptanceRate ?? prev.loadAcceptanceRate,
                        avgResponseTime: data.avgResponseTime || prev.avgResponseTime,
                        replyRate: data.replyRate ?? prev.replyRate,
                        cancellationRate: data.cancellationRate ?? prev.cancellationRate,
                        paymentReputation: data.paymentReputation || prev.paymentReputation,
                        successfulDeliveries: data.successfulDeliveries ?? prev.successfulDeliveries,
                        disputes: data.disputes ?? prev.disputes,
                        expiredLoads: data.expiredLoads ?? prev.expiredLoads,
                        avgTimeToAssign: data.avgTimeToAssign || prev.avgTimeToAssign,

                        activePublicLoads: data.activePublicLoads || prev.activePublicLoads,
                        completedLoadsList: data.completedLoadsList || prev.completedLoadsList,
                        recentLoads: data.recentLoads || prev.recentLoads,
                        latestReviews: data.latestReviews || prev.latestReviews,
                    }));
                }
            } catch (error) {
                console.error('Error loading broker profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBrokerProfile();
    }, [organizationId]);

    return (
        <ScreenWrapper>
            <Heading page="Broker Profile" />

            <ScrollView contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(6) }}>

                {/* ---------- Header ---------- */}
                <View style={[styles.card, { backgroundColor: backgroundLight }]}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            {broker.logoUrl ? (
                                <Image source={{ uri: broker.logoUrl }} style={styles.logo} />
                            ) : (
                                <View style={[styles.logoPlaceholder, { backgroundColor: accent + '15' }]}>
                                    <Ionicons name="briefcase" size={wp(7)} color={accent} />
                                </View>
                            )}
                            <View style={styles.headerText}>
                                <ThemedText style={[styles.title, { color: text }]}>{broker.name}</ThemedText>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={wp(3.5)} color={icon} />
                                    <ThemedText style={[styles.subtitle, { color: icon }]}> {broker.location}</ThemedText>
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
                            <ThemedText style={[styles.ratingText, { color: text }]}>{broker.rating.toFixed(1)}</ThemedText>
                        </View>
                        <ThemedText style={[styles.reviewText, { color: icon }]}>{broker.reviewsCount} reviews</ThemedText>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <ThemedText style={[styles.metaLabel, { color: icon }]}>Member since</ThemedText>
                            <ThemedText style={[styles.metaValue, { color: text }]}>{broker.memberSince}</ThemedText>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaItem}>
                            <ThemedText style={[styles.metaLabel, { color: icon }]}>Last active</ThemedText>
                            <ThemedText style={[styles.metaValue, { color: text }]}>{broker.lastActive}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* ---------- Overview ---------- */}
                <SectionCard title="Overview" background={backgroundLight} textColor={text}>
                    <View style={styles.statsGrid}>
                        <StatBlock label="Public Loads Posted" value={broker.publicLoadsPosted} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Private Loads Posted" value={broker.privateLoadsPosted} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Active Loads" value={broker.activeLoads} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Completed Loads" value={broker.completedLoads} background={background} valueColor={text} iconColor={icon} />
                    </View>
                </SectionCard>

                {/* ---------- Performance ---------- */}
                <SectionCard title="Performance" background={backgroundLight} textColor={text}>
                    <View style={styles.performanceList}>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Load Acceptance Rate</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.loadAcceptanceRate}%</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Avg Response Time</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.avgResponseTime}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Reply Rate</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.replyRate}%</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Cancellation Rate</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.cancellationRate}%</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Payment Reputation</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.paymentReputation}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Successful Deliveries</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.successfulDeliveries}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Disputes</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: broker.disputes > 0 ? '#dc2626' : text }]}>{broker.disputes}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Expired Loads</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.expiredLoads}</ThemedText>
                        </View>
                        <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Avg Time to Assign Truck</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{broker.avgTimeToAssign}</ThemedText>
                        </View>
                    </View>
                </SectionCard>

                {/* ---------- Loads ---------- */}
                <SectionCard title="Loads" background={backgroundLight} textColor={text}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={() => setActiveOpen((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Active Public Loads</ThemedText>
                        <Ionicons name={activeOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {activeOpen && (
                        <View style={styles.dropdownBody}>
                            {broker.activePublicLoads.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>No active public loads.</ThemedText>
                            ) : (
                                broker.activePublicLoads.map((load) => <LoadRow key={load.id} load={load} text={text} icon={icon} />)
                            )}
                        </View>
                    )}

                    <TouchableOpacity style={[styles.dropdownHeader, styles.dropdownHeaderSpaced]} onPress={() => setCompletedOpen((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Completed Loads</ThemedText>
                        <Ionicons name={completedOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {completedOpen && (
                        <View style={styles.dropdownBody}>
                            {broker.completedLoadsList.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>No completed loads yet.</ThemedText>
                            ) : (
                                broker.completedLoadsList.map((load) => <LoadRow key={load.id} load={load} text={text} icon={icon} />)
                            )}
                        </View>
                    )}

                    <TouchableOpacity style={[styles.dropdownHeader, styles.dropdownHeaderSpaced]} onPress={() => setRecentOpen((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Recent Loads</ThemedText>
                        <Ionicons name={recentOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {recentOpen && (
                        <View style={styles.dropdownBody}>
                            {broker.recentLoads.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>No recent activity.</ThemedText>
                            ) : (
                                broker.recentLoads.map((load) => <LoadRow key={load.id} load={load} text={text} icon={icon} />)
                            )}
                        </View>
                    )}
                </SectionCard>

                {/* ---------- Reviews ---------- */}
                <SectionCard title="Reviews" background={backgroundLight} textColor={text}>
                    <View style={styles.reviewsSummary}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={wp(5)} color="#f2b01e" />
                            <ThemedText style={[styles.ratingTextLarge, { color: text }]}>{broker.rating.toFixed(1)}</ThemedText>
                        </View>
                        <ThemedText style={[styles.reviewText, { color: icon }]}>{broker.reviewsCount} reviews</ThemedText>
                    </View>

                    {broker.latestReviews.map((review) => (
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
        backgroundColor: '#374151' ,
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
        width: '47%',
        borderRadius: wp(3),
        paddingVertical: wp(3),
        paddingHorizontal: wp(2),
        alignItems: 'center',
    },
    statValue: {
        fontSize: wp(5.5),
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: wp(2.9),
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: wp(1.8),
    },
    loadRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    loadRowRight: {
        alignItems: 'flex-end',
        gap: wp(1),
    },
    loadText: {
        fontSize: wp(3.4),
    },
    loadDate: {
        fontSize: wp(2.8),
    },
    statusPill: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(0.7),
        borderRadius: wp(2),
    },
    statusPillText: {
        fontSize: wp(2.7),
        fontWeight: '700',
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