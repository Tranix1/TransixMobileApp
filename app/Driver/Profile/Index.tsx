import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { LoadLyfCyleStatsCompent } from '@/components/loadLyfCyleStatsPlbcPro';

// ---------- Types ----------

interface AssignedVehicle {
    regNumber: string;
    type: string;
    fleetName?: string;
}

interface TripRouteEntry {
    id: string;
    from: {
        city: string;
        country: string;
    };
    to: {
        city: string;
        country: string;
    };
    tripsCompleted: number;
}

interface ReviewEntry {
    id: string;
    reviewer: string;
    rating: number;
    comment: string;
    date: string;
}

interface DocumentEntry {
    label: string;
    verified: boolean;
    expiry?: string;
    icon: keyof typeof Ionicons.glyphMap;
}

interface PayoutStats {
    totalEarned: number;
    pendingAmount: number;
    lastPayout: number;
    paymentMethod: string;
    confirmationRate: number;
}

interface DriverProfileData {
    logoUrl: string | null;
    name: string;
    location: string;
    rating: number;
    reviewsCount: number;
    memberSince: string;
    lastActive: string;

    licenseNumber: string;
    licenseClass: string;
    licenseExpiry: string;
    yearsExperience: number;

    assignedVehicle: AssignedVehicle | null;

    tripsCompleted: number;
    activeTrips: number;
    totalDistance: number;

    onTimeDelivery: number;
    acceptanceRate: number;
    avgResponseTime: string;
    cancellationRate: number;
    safetyIncidents: number;
    fleetsWorkedWith: number;

    documents: DocumentEntry[];
    payouts: PayoutStats;
    provenRoutes: TripRouteEntry[];
    latestReviews: ReviewEntry[];
}

const DEFAULT_DRIVER: DriverProfileData = {
    logoUrl: null,
    name: 'Driver',
    location: 'Harare, Zimbabwe',
    rating: 4.8,
    reviewsCount: 24,
    memberSince: 'Jan 2023',
    lastActive: 'Today',

    licenseNumber: '—',
    licenseClass: 'Class 2',
    licenseExpiry: '—',
    yearsExperience: 5,

    assignedVehicle: null,

    tripsCompleted: 0,
    activeTrips: 0,
    totalDistance: 0,

    onTimeDelivery: 95,
    acceptanceRate: 90,
    avgResponseTime: '10 min',
    cancellationRate: 2,
    safetyIncidents: 0,
    fleetsWorkedWith: 0,

    documents: [
        { label: 'Driver\'s License', verified: false, icon: 'card-outline' },
        { label: 'National ID', verified: false, icon: 'id-card-outline' },
        { label: 'Defensive Driving Cert', verified: false, icon: 'shield-checkmark-outline' },
        { label: 'Medical Certificate', verified: false, icon: 'medkit-outline' },
    ],

    payouts: {
        totalEarned: 0,
        pendingAmount: 0,
        lastPayout: 0,
        paymentMethod: 'Not set',
        confirmationRate: 0,
    },

    provenRoutes: [],
    latestReviews: [],
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

export default function DriverProfile() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const { driverId, isOwner } = useLocalSearchParams<{ driverId?: string; isOwner?: string }>();
    const [driver, setDriver] = useState<DriverProfileData>(DEFAULT_DRIVER);
    const [refreshing, setRefreshing] = useState(false);

    const [documentsOpen, setDocumentsOpen] = useState(true);
    const [provenRoutesOpen, setProvenRoutesOpen] = useState(true);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const viewerIsOwner = isOwner === 'true';

    const loadDriverProfile = async () => {
        try {
            setRefreshing(true);

            if (!driverId) {
                return;
            }

            const profileRef = doc(db, 'profiles', driverId);

            const [profileSnap, routesSnap] = await Promise.all([
                getDoc(profileRef),
                getDocs(
                    query(
                        collection(db, 'profiles', driverId, 'provenRoutes'),
                        orderBy('createdAt', 'desc')
                    )
                ),
            ]);

            if (!profileSnap.exists()) {
                return;
            }

            const data = profileSnap.data() as any;

            const provenRoutes = routesSnap.docs.map((routeDoc) => {
                const route = routeDoc.data();
                return {
                    id: routeDoc.id,
                    from: route.from,
                    to: route.to,
                    tripsCompleted: route.tripsCompleted ?? 0,
                };
            }) as TripRouteEntry[];

            const memberSince = data.timeStamp
                ? (() => {
                    const date = data.timeStamp.toDate();
                    return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                })()
                : '';

            setDriver((prev) => ({
                ...prev,

                logoUrl: data.profilePhoto ?? prev.logoUrl,
                name: data.name ?? prev.name,
                location: data.location?.description || data.location || prev.location,

                rating: data.rating ?? prev.rating,
                reviewsCount: data.reviewsCount ?? prev.reviewsCount,
                memberSince: memberSince || prev.memberSince,
                lastActive: data.lastActive ?? prev.lastActive,

                licenseNumber: data.licenseNumber ?? prev.licenseNumber,
                licenseClass: data.licenseClass ?? prev.licenseClass,
                licenseExpiry: data.licenseExpiry ?? prev.licenseExpiry,
                yearsExperience: data.yearsExperience ?? prev.yearsExperience,

                assignedVehicle: data.assignedVehicle ?? prev.assignedVehicle,

                tripsCompleted: data.tripsCompleted ?? prev.tripsCompleted,
                activeTrips: data.activeTrips ?? prev.activeTrips,
                totalDistance: data.totalDistance ?? prev.totalDistance,

                onTimeDelivery: data.onTimeDelivery ?? prev.onTimeDelivery,
                acceptanceRate: data.acceptanceRate ?? prev.acceptanceRate,
                avgResponseTime: data.responseTime ? `${data.responseTime} min` : prev.avgResponseTime,
                cancellationRate: data.cancellationRate ?? prev.cancellationRate,
                safetyIncidents: data.safetyIncidents ?? prev.safetyIncidents,
                fleetsWorkedWith: data.fleetsWorkedWith ?? prev.fleetsWorkedWith,

                documents: data.documents ?? prev.documents,
                payouts: data.payouts ?? prev.payouts,

                provenRoutes,
                latestReviews: data.latestReviews ?? prev.latestReviews,
            }));
        } catch (error) {
            console.error('Error loading driver profile:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDriverProfile();
    }, [driverId]);

    const visibleReviews = showAllReviews ? driver.latestReviews : driver.latestReviews.slice(0, 3);
    const verifiedDocsCount = driver.documents.filter((d) => d.verified).length;

    return (
        <ScreenWrapper>
            <Heading page="Driver Profile" />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(6) }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadDriverProfile}
                        colors={[accent]}
                        tintColor={accent}
                    />
                }
            >
                {/* ---------- Header ---------- */}
                <View style={[styles.card, { backgroundColor: backgroundLight }]}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            {driver.logoUrl ? (
                                <Image source={{ uri: driver.logoUrl }} style={styles.logo} />
                            ) : (
                                <View style={[styles.logoPlaceholder, { backgroundColor: accent + '15' }]}>
                                    <Ionicons name="person" size={wp(7)} color={accent} />
                                </View>
                            )}
                            <View style={styles.headerText}>
                                <ThemedText style={[styles.title, { color: text }]}>{driver.name}</ThemedText>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={wp(3.5)} color={icon} />
                                    <ThemedText style={[styles.subtitle, { color: icon }]}> {driver.location}</ThemedText>
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
                            <ThemedText style={[styles.ratingText, { color: text }]}>{driver.rating.toFixed(1)}</ThemedText>
                        </View>
                        <ThemedText style={[styles.reviewText, { color: icon }]}>{driver.reviewsCount} reviews</ThemedText>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <ThemedText style={[styles.metaLabel, { color: icon }]}>Member since</ThemedText>
                            <ThemedText style={[styles.metaValue, { color: text }]}>{driver.memberSince}</ThemedText>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaItem}>
                            <ThemedText style={[styles.metaLabel, { color: icon }]}>Last active</ThemedText>
                            <ThemedText style={[styles.metaValue, { color: text }]}>{driver.lastActive}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* ---------- Overview ---------- */}
                <SectionCard title="Overview" background={backgroundLight} textColor={text}>
                    <View style={styles.statsGrid}>
                        <StatBlock label="Trips Completed" value={driver.tripsCompleted} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Active Trips" value={driver.activeTrips} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Total Distance" value={`${driver.totalDistance.toLocaleString()} km`} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Years Experience" value={driver.yearsExperience} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="License Class" value={driver.licenseClass} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Fleets Worked With" value={driver.fleetsWorkedWith} background={background} valueColor={text} iconColor={icon} />
                    </View>
                </SectionCard>

                {/* ---------- License & Vehicle ---------- */}
                <SectionCard title="License & Vehicle" background={backgroundLight} textColor={text}>
                    <View style={styles.performanceList}>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>License Number</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.licenseNumber}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>License Expiry</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.licenseExpiry}</ThemedText>
                        </View>
                        <View style={[styles.performanceRow, { borderBottomWidth: driver.assignedVehicle ? 1 : 0 }]}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Assigned Vehicle</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {driver.assignedVehicle ? driver.assignedVehicle.regNumber : 'Unassigned'}
                            </ThemedText>
                        </View>
                        {driver.assignedVehicle && (
                            <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                                <ThemedText style={[styles.performanceLabel, { color: icon }]}>Vehicle Type</ThemedText>
                                <ThemedText style={[styles.performanceValue, { color: text }]}>
                                    {driver.assignedVehicle.type}{driver.assignedVehicle.fleetName ? ` • ${driver.assignedVehicle.fleetName}` : ''}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </SectionCard>

                {/* ---------- Driving Performance ---------- */}
                <SectionCard title="Driving Performance" background={backgroundLight} textColor={text}>
                    <View style={styles.performanceList}>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>On-Time Delivery</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.onTimeDelivery}%</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Acceptance Rate</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.acceptanceRate}%</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Avg Response Time</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.avgResponseTime}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Cancellation Rate</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.cancellationRate}%</ThemedText>
                        </View>
                        <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Safety Incidents</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: driver.safetyIncidents > 0 ? '#dc2626' : text }]}>
                                {driver.safetyIncidents}
                            </ThemedText>
                        </View>
                    </View>
                </SectionCard>

                {/* ---------- Documents (conditional, owner-only) ---------- */}
                {viewerIsOwner && (
                    <SectionCard title="Documents" background={backgroundLight} textColor={text}>
                        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setDocumentsOpen((v) => !v)}>
                            <ThemedText style={[styles.dropdownTitle, { color: text }]}>
                                {verifiedDocsCount}/{driver.documents.length} Verified
                            </ThemedText>
                            <Ionicons name={documentsOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                        </TouchableOpacity>

                        {documentsOpen && (
                            <View style={styles.dropdownBody}>
                                {driver.documents.map((docItem) => (
                                    <View key={docItem.label} style={styles.documentRow}>
                                        <View style={styles.documentLeft}>
                                            <Ionicons name={docItem.icon} size={wp(4.5)} color={docItem.verified ? '#16a34a' : icon} />
                                            <ThemedText style={[styles.documentLabel, { color: text }]}> {docItem.label}</ThemedText>
                                        </View>
                                        <View style={styles.documentRight}>
                                            {docItem.expiry && (
                                                <ThemedText style={[styles.documentExpiry, { color: icon }]}>{docItem.expiry}</ThemedText>
                                            )}
                                            <View
                                                style={[
                                                    styles.docStatusPill,
                                                    { backgroundColor: (docItem.verified ? '#16a34a' : '#9ca3af') + '18' },
                                                ]}
                                            >
                                                <ThemedText
                                                    style={[
                                                        styles.docStatusText,
                                                        { color: docItem.verified ? '#16a34a' : '#9ca3af' },
                                                    ]}
                                                >
                                                    {docItem.verified ? 'Verified' : 'Pending'}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </SectionCard>
                )}

                {/* ---------- Payouts (owner-only) ---------- */}
                {viewerIsOwner && (
                    <SectionCard title="Payouts" background={backgroundLight} textColor={text}>
                        <LoadLyfCyleStatsCompent
                            title="Total Earned"
                            value={`$${driver.payouts.totalEarned.toLocaleString()}`}
                            icon="wallet-outline"
                            textColor={text}
                            accent={accent}
                        />
                        <LoadLyfCyleStatsCompent
                            title="Pending Amount"
                            value={`$${driver.payouts.pendingAmount.toLocaleString()}`}
                            icon="time-outline"
                            textColor={text}
                            accent={accent}
                        />
                        <LoadLyfCyleStatsCompent
                            title="Last Payout"
                            value={`$${driver.payouts.lastPayout.toLocaleString()}`}
                            icon="checkmark-circle-outline"
                            textColor={text}
                            accent={accent}
                        />
                        <LoadLyfCyleStatsCompent
                            title="Payment Method"
                            value={driver.payouts.paymentMethod}
                            icon="card-outline"
                            textColor={text}
                            accent={accent}
                        />
                        <LoadLyfCyleStatsCompent
                            title="Confirmation Rate"
                            value={`${driver.payouts.confirmationRate}%`}
                            icon="stats-chart-outline"
                            textColor={text}
                            accent={accent}
                        />
                    </SectionCard>
                )}

                {/* ---------- Proven Routes ---------- */}
                <SectionCard title="Proven Routes" background={backgroundLight} textColor={text}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={() => setProvenRoutesOpen((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Routes Driven</ThemedText>
                        <Ionicons name={provenRoutesOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {provenRoutesOpen && (
                        <View style={styles.dropdownBody}>
                            {driver.provenRoutes.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>No proven routes yet.</ThemedText>
                            ) : (
                                driver.provenRoutes.map((route) => (
                                    <View key={route.id} style={styles.loadRow}>
                                        <Ionicons name="arrow-forward-circle-outline" size={wp(4)} color={accent} />
                                        <ThemedText style={[styles.loadText, { color: text }]}>
                                            {' '}
                                            {route.from.city}, {route.from.country} → {route.to.city}, {route.to.country} • {route.tripsCompleted} trips
                                        </ThemedText>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </SectionCard>

                {/* ---------- Reviews ---------- */}
                <SectionCard title="Reviews" background={backgroundLight} textColor={text}>
                    <View style={styles.reviewsSummary}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={wp(5)} color="#f2b01e" />
                            <ThemedText style={[styles.ratingTextLarge, { color: text }]}>{driver.rating.toFixed(1)}</ThemedText>
                        </View>
                        <ThemedText style={[styles.reviewText, { color: icon }]}>{driver.reviewsCount} reviews</ThemedText>
                    </View>

                    {visibleReviews.length === 0 ? (
                        <ThemedText style={[styles.emptyText, { color: icon }]}>No reviews yet.</ThemedText>
                    ) : (
                        visibleReviews.map((review) => (
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
                        ))
                    )}

                    {driver.latestReviews.length > 3 && (
                        <TouchableOpacity style={styles.reviewButton} onPress={() => setShowAllReviews((v) => !v)}>
                            <ThemedText style={[styles.buttonText, { color: accent }]}>
                                {showAllReviews ? 'Show Less Reviews' : 'View All Reviews'}
                            </ThemedText>
                            <Ionicons name={showAllReviews ? 'chevron-up' : 'chevron-down'} size={wp(4)} color={accent} />
                        </TouchableOpacity>
                    )}
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
    documentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: wp(2),
    },
    documentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    documentLabel: {
        fontSize: wp(3.4),
        fontWeight: '500',
    },
    documentRight: {
        alignItems: 'flex-end',
        gap: wp(1),
    },
    documentExpiry: {
        fontSize: wp(2.7),
    },
    docStatusPill: {
        paddingHorizontal: wp(2.2),
        paddingVertical: wp(0.7),
        borderRadius: wp(2),
    },
    docStatusText: {
        fontSize: wp(2.7),
        fontWeight: '700',
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
    reviewButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: wp(2),
        paddingVertical: wp(3),
    },
    buttonText: {
        fontWeight: '700',
        fontSize: wp(3.5),
    },
});