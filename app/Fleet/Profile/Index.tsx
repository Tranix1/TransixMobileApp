import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { LoadLyfCyleStatsCompent } from '@/components/loadLyfCyleStatsPlbcPro';
import { LoadLyfCyleStatsCompentSec } from '@/components/LoadLyfCyleStatsCompentSec';

// ---------- Types ----------

interface TruckTypeEntry {
    type: string;
    count: number;
}

interface LoadEntry {
    posted: number;
    assigned: number;
    inTransit: number;
    completed: number;

}

interface ProvenRoutesType {
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

interface PayoutStats {
    driverCreated: number;
    driverConfirmed: number;

    brokerCreated: number;
    brokerConfirmed: number;

    lastPayout: number;
    confirmationRate: number;
}``
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

    loadsPosted: number


    totalTrucks: number;
    availableTrucks: number;
    trackedTrucks: number;
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
    publicLoads: LoadEntry;
    privateLoads: LoadEntry

    payouts: PayoutStats,
    latestReviews: ReviewEntry[];

    driversWorkedWith: number

    provenRoutes: ProvenRoutesType[]
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

    loadsPosted: 0,
    totalTrucks: 32,
    availableTrucks: 11,
    trackedTrucks: 0,

    activeTrips: 6,
    completedTrips: 412,



    onTimeDelivery: 96,
    acceptanceRate: 91,
    avgResponseTime: '12 min',
    paymentReputation: 'Excellent',
    cancellationRate: 2,
    trackingStatus: 'Live',
    totalDistance: 184200,
    driversWorkedWith: 0,
    truckTypes: [
        { type: '30 Tonne Sidetipper', count: 13 },
        { type: '34 Tonne Tautliner', count: 8 },
        { type: 'Flatbed', count: 5 },
        { type: 'Lowbed', count: 4 },
        { type: 'Fuel Tanker', count: 2 },
    ],
    services: ['local_transport', 'cross_border', 'container_transport'],

    latestReviews: [
        { id: 'r1', reviewer: 'J. Moyo', rating: 5, comment: 'Always on time and professional communication from start to finish.', date: 'Jun 8, 2026' },
        { id: 'r2', reviewer: 'T. Chirwa', rating: 4, comment: 'Dependable fleet with good coverage across the region.', date: 'May 21, 2026' },
        { id: 'r2', reviewer: 'T. Chirwa', rating: 6, comment: 'Dependable fleet with good coverage across the region.', date: 'May 21, 2026' },
        { id: 'r2', reviewer: 'T. Chirwa', rating: 7, comment: 'Dependable fleet with good coverage across the region.', date: 'May 21, 2026' },
        { id: 'r2', reviewer: 'T. Chirwa', rating: 8, comment: 'Dependable fleet with good coverage across the region.', date: 'May 21, 2026' },

    ],

    publicLoads: {
        posted: 0,
        assigned: 0,
        inTransit: 0,
        completed: 0,
    },

    privateLoads: {
        posted: 0,
        assigned: 0,
        inTransit: 0,
        completed: 0,
    },

    payouts: {
        driverCreated: 0,
        driverConfirmed: 0,
        brokerCreated: 0,
        brokerConfirmed: 0,
        lastPayout: 0,
        confirmationRate: 0,
    },
    provenRoutes: [
        {
            id: "l1",
            from: {
                city: "Harare",
                country: "Zimbabwe"
            },
            to: {
                city: "Beitbridge",
                country: "Zimbabwe"
            },
            tripsCompleted: 15
        },
        {
            id: "l2",
            from: {
                city: "Lusaka",
                country: "Zambia"
            },
            to: {
                city: "Harare",
                country: "Zimbabwe"
            },
            tripsCompleted: 8
        }
    ]
};






type LoadStatsType = "public" | "private";

interface LoadStatItem {
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
    type: LoadStatsType;
}


const createLoadStats = (
    loadType: "public" | "private",
    analytics: FleetProfileData
): LoadStatItem[] => {

    const loads =
        loadType === "public"
            ? analytics.publicLoads ?? {}
            : analytics.privateLoads ?? {};


    return [
        {
            title: "Loads Posted",
            value: loads.posted ?? 0,
            icon: "add-circle-outline",
            type: loadType,
        },
        {
            title: "Loads Assigned",
            value: loads.assigned ?? 0,
            icon: "git-merge-outline",
            type: loadType,
        },
        {
            title: "Loads In Transit",
            value: loads.inTransit ?? 0,
            icon: "car-outline",
            type: loadType,
        },
        {
            title: "Loads Completed",
            value: loads.completed ?? 0,
            icon: "checkmark-circle-outline",
            type: loadType,
        },
    ];
};


type PayoutStatItem = {
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
};


const createPayoutStats = (payouts: any): PayoutStatItem[] => {

    return [
        {
            title: "Driver Payouts Created",
            value: payouts.driverCreated ?? 0,
            icon: "wallet-outline",
        },
        {
            title: "Driver Payouts Confirmed",
            value: payouts.driverConfirmed ?? 0,
            icon: "checkmark-circle-outline",
        },
        {
            title: "Broker/Partner Payouts Created",
            value: payouts.brokerCreated ?? 0,
            icon: "business-outline",
        },
        {
            title: "Broker/Partner Payouts Confirmed",
            value: payouts.brokerConfirmed ?? 0,
            icon: "shield-checkmark-outline",
        },
        {
            title: "Last Payout",
            value: payouts.lastPayout ?? "$0",
            icon: "time-outline",
        },
        {
            title: "Payment Confirmation Rate",
            value: payouts.confirmationRate ?? "0%",
            icon: "stats-chart-outline",
        },
    ];

};



type StatItem = {
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
};

const createPublicProfileStats = (fleet: any): StatItem[] => {


    const publicLoads = fleet.publicLoads ?? {};
    const privateLoads = fleet.privateLoads ?? {};
    const payouts = fleet.payouts ?? {};


    const driverPaymentRate =
        payouts.driverCreated > 0
            ? Math.round(
                (payouts.driverConfirmed / payouts.driverCreated) * 100
            )
            : 0;


    const partnerPaymentRate =
        payouts.brokerCreated > 0
            ? Math.round(
                (payouts.brokerConfirmed / payouts.brokerCreated) * 100
            )
            : 0;


    return [
        {
            title: "Loads Posted",
            value:
                (publicLoads.posted ?? 0) +
                (privateLoads.posted ?? 0),
            icon: "cloud-upload-outline",
        },

        {
            title: "Loads Completed",
            value:
                (publicLoads.completed ?? 0) +
                (privateLoads.completed ?? 0),
            icon: "checkmark-circle-outline",
        },

        {
            title: "Active Trips",
            value:
                (publicLoads.inTransit ?? 0) +
                (privateLoads.inTransit ?? 0),
            icon: "car-outline",
        },

        {
            title: "Total Trucks",
            value: fleet.totalTrucks ?? 0,
            icon: "bus-outline",
        },

        {
            title: "Available Trucks",
            value: fleet.availableTrucks ?? 0,
            icon: "checkmark-done-circle-outline",
        },

        {
            title: "Cargo Owners Worked With",
            value: fleet.cargoOwnersWorkedWith ?? 0,
            icon: "business-outline",
        },

        {
            title: "Drivers Worked With",
            value: fleet.driversWorkedWith ?? 0,
            icon: "people-outline",
        },

        {
            title: "Driver Payment Rate",
            value: `${driverPaymentRate}%`,
            icon: "wallet-outline",
        },

        {
            title: "Partner Payment Rate",
            value: `${partnerPaymentRate}%`,
            icon: "people-outline",

        },
    ];
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

    const [refreshing, setRefreshing] = useState(false)

    const [publicLoadsOpen, setPublicLoadsOpen] = useState(true);
    const [privateLoadsOpen, setPrivateLoadsOpen] = useState(false);
    const [provenRoutesOpen, setProvenRoutes] = useState(true);

    const viewerIsOwner = isOwner === 'true';

    const loadFleetProfile = async () => {
        try {
            setRefreshing(true);

            const orgId = organizationId;

            if (!orgId) {
                return;
            }

            const profileRef = doc(db, "organizationProfiles", orgId);

            const [profileSnap, routesSnap] = await Promise.all([
                getDoc(profileRef),
                getDocs(
                    query(
                        collection(
                            db,
                            "organizationProfiles",
                            orgId,
                            "provenRoutes"
                        ),
                        orderBy("createdAt", "desc")
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
                    assignmentId: route.assignmentId,
                    createdAt: route.createdAt,
                };
            }) as any;

            const memberSince = data.timeStamp
                ? (() => {
                    const date = data.timeStamp.toDate();
                    return `${date.getDate()} ${date.toLocaleString(
                        "default",
                        { month: "long" }
                    )} ${date.getFullYear()}`;
                })()
                : "";

            setFleet((prev) => ({
                ...prev,

                logoUrl: data.logoUrl ?? prev.logoUrl,
                name: data.name ?? prev.name,
                location:
                    data.location?.description ||
                    data.location ||
                    prev.location,

                rating: data.rating ?? prev.rating,
                reviewsCount: data.reviewsCount ?? prev.reviewsCount,
                memberSince: memberSince || prev.memberSince,
                lastActive: data.lastActive ?? prev.lastActive,

                loadsPosted: data.loadsPosted ?? prev.loadsPosted,

                totalTrucks: data.truckCount ?? prev.totalTrucks,
                availableTrucks:
                    data.availableTrucks ?? prev.availableTrucks,
                trackedTrucks:
                    data.trackedTrucks ?? prev.trackedTrucks,

                activeTrips: data.activeTrips ?? prev.activeTrips,
                completedTrips:
                    data.completedTrips ?? prev.completedTrips,

                onTimeDelivery:
                    data.onTimeDelivery ?? prev.onTimeDelivery,

                acceptanceRate:
                    data.acceptanceRate ?? prev.acceptanceRate,

                avgResponseTime: data.responseTime
                    ? `${data.responseTime} min`
                    : prev.avgResponseTime,

                paymentReputation:
                    data.paymentReputation ?? prev.paymentReputation,

                cancellationRate:
                    data.cancellationRate ?? prev.cancellationRate,

                trackingStatus:
                    data.trackingStatus ?? prev.trackingStatus,

                totalDistance:
                    data.totalDistance ?? prev.totalDistance,

                truckTypes: data.truckTypes ?? prev.truckTypes,

                // loaded from subcollection
                provenRoutes,

                publicLoads: data.publicLoads ?? prev.publicLoads,
                privateLoads: data.privateLoads ?? prev.privateLoads,

                payouts: data.payouts ?? prev.payouts,

                driversWorkedWith:
                    data.driversWorkedWith ?? prev.driversWorkedWith,

                latestReviews:
                    data.latestReviews ?? prev.latestReviews,

                services: data.services ?? prev.services,
            }));
        } catch (error) {
            console.error("Error loading fleet profile:", error);
        } finally {
            setRefreshing(false);
        }
    };


    useEffect(() => {

        loadFleetProfile();
    }, [organizationId]);


    const publicLodsCycleStats = createLoadStats("public", fleet);

    const privateLoadCycleStats = createLoadStats("private", fleet);
    const payoutStats = createPayoutStats(fleet.payouts);

    const publicProfileStats = createPublicProfileStats(fleet);



    const driverPaymentRate =
        fleet.payouts.driverCreated > 0
            ? Math.round(
                (fleet.payouts.driverConfirmed / fleet.payouts.driverCreated) * 100
            )
            : 0;


    const partnerPaymentRate =
        fleet.payouts.brokerCreated > 0
            ? Math.round(
                (fleet.payouts.brokerConfirmed / fleet.payouts.brokerCreated) * 100
            )
            : 0;

    const [showAllReviews, setShowAllReviews] = useState(false);

    const visibleReviews = showAllReviews
        ? fleet?.latestReviews
        : fleet?.latestReviews.slice(0, 3);


    const trackingColor =
        fleet.trackingStatus === 'Live' ? '#16a34a' : fleet.trackingStatus === 'Manual' ? '#f2b01e' : '#9ca3af';

    return (
        <ScreenWrapper>
            <Heading page="Fleet Profile" />

            <ScrollView contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(6) }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadFleetProfile}
                        colors={[accent]}
                        tintColor={accent}
                    />
                }

            >


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

                        <StatBlock label="Loads Posted" value={
                            (fleet?.publicLoads?.posted ?? 0) +
                            (fleet?.privateLoads?.posted ?? 0)

                        } background={background} valueColor={text} iconColor={icon} />


                        <StatBlock label="Loads Completed" value={
                            (fleet?.publicLoads?.completed ?? 0) +
                            (fleet?.privateLoads?.completed ?? 0)}
                            background={background} valueColor={text} iconColor={icon} />


                        <StatBlock label="Active Trips" value={
                            (fleet?.publicLoads?.inTransit ?? 0) +
                            (fleet?.privateLoads?.inTransit ?? 0)
                        } background={background} valueColor={text} iconColor={icon} />


                        <StatBlock label="Total Truck" value={fleet?.totalTrucks} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Available Trucks" value={fleet?.availableTrucks} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Tracked Trucks" value={fleet?.trackedTrucks} background={background} valueColor={text} iconColor={icon} />

                    </View>
                </SectionCard>





                {/* ---------- Fleet Performance ---------- */}
                <SectionCard title="Fleet Performance" background={backgroundLight} textColor={text}>
                    <View style={styles.performanceList}>


                        {/* TRUST */}
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Driver Payment Rate
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {driverPaymentRate}%
                            </ThemedText>
                        </View>


                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Partner Payment Rate
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {partnerPaymentRate}%
                            </ThemedText>
                        </View>



                        {/* PERFORMANCE */}
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                On-Time Delivery
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {fleet.onTimeDelivery}%
                            </ThemedText>
                        </View>


                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Acceptance Rate
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {fleet.acceptanceRate}%
                            </ThemedText>
                        </View>


                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Avg Response Time
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {fleet.avgResponseTime}
                            </ThemedText>
                        </View>



                        {/* RISK */}
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Cancellation Rate
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {fleet.cancellationRate}%
                            </ThemedText>
                        </View>



                        {/* EXPERIENCE */}
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Drivers Worked With
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {fleet.driversWorkedWith}
                            </ThemedText>
                        </View>


                        <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>
                                Total Distance
                            </ThemedText>

                            <ThemedText style={[styles.performanceValue, { color: text }]}>
                                {fleet.totalDistance.toLocaleString()} km
                            </ThemedText>
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
                {/* <SectionCard title="Services" background={backgroundLight} textColor={text}>
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
                </SectionCard> */}

                {/* ---------- Loads ---------- */}
                <SectionCard title="Business Reputation" background={backgroundLight} textColor={text}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            gap: wp(1)
                        }}
                    >

                        {/* LOADS CARD */}
                        <View style={{ width: wp(60) }}>

                            <SectionCard
                                title="Loads"
                                background={backgroundLight}
                                textColor={text}
                            >

                                <TouchableOpacity
                                    style={styles.dropdownHeader}
                                    onPress={() => setPublicLoadsOpen(v => !v)}
                                >
                                    <ThemedText style={[styles.dropdownTitle, { color: text }]}>
                                        Public Loads
                                    </ThemedText>

                                    <Ionicons
                                        name={publicLoadsOpen ? "chevron-up" : "chevron-down"}
                                        size={wp(4.5)}
                                        color={icon}
                                    />
                                </TouchableOpacity>


                                {publicLoadsOpen && publicLodsCycleStats.map(item => (
                                    <LoadLyfCyleStatsCompent
                                        key={item.title}
                                        {...item}
                                        textColor={text}
                                        accent={accent}
                                    />
                                ))}



                                <TouchableOpacity
                                    style={[
                                        styles.dropdownHeader,
                                        styles.dropdownHeaderSpaced
                                    ]}
                                    onPress={() => setPrivateLoadsOpen(v => !v)}
                                >

                                    <ThemedText style={[styles.dropdownTitle, { color: text }]}>
                                        Private Loads
                                    </ThemedText>


                                    <Ionicons
                                        name={privateLoadsOpen ? "chevron-up" : "chevron-down"}
                                        size={wp(4.5)}
                                        color={icon}
                                    />

                                </TouchableOpacity>


                                {privateLoadsOpen && privateLoadCycleStats.map(item => (
                                    <LoadLyfCyleStatsCompent
                                        key={item.title}
                                        {...item}
                                        textColor={text}
                                        accent={accent}
                                    />
                                ))}

                            </SectionCard>

                        </View>




                        {/* PAYOUT CARD */}
                        <View style={{ width: wp(70) }}>

                            <SectionCard
                                title="Payouts"
                                background={backgroundLight}
                                textColor={text}
                            >

                                {payoutStats.map(item => (
                                    <LoadLyfCyleStatsCompent
                                        key={item.title}
                                        {...item}
                                        textColor={text}
                                        accent={accent}
                                    />
                                ))}

                            </SectionCard>

                        </View>


                    </ScrollView>
                    <ThemedText style={{ textAlign: "center", color: icon }}>
                        Swipe to view more →
                    </ThemedText>
                </SectionCard>


                {/* ---------- Loads ---------- */}
                <SectionCard title="Proven Routes" background={backgroundLight} textColor={text}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={() => setProvenRoutes((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Proven Routes</ThemedText>
                        <Ionicons name={provenRoutesOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {provenRoutesOpen && (
                        <View style={styles.dropdownBody}>


                            {fleet.provenRoutes.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>
                                    No proven routes yet.
                                </ThemedText>
                            ) : (
                                fleet.provenRoutes.map((route) => (
                                    <View key={route.id} style={styles.loadRow}>
                                        <Ionicons
                                            name="arrow-forward-circle-outline"
                                            size={wp(4)}
                                            color={accent}
                                        />

                                        <ThemedText
                                            style={[
                                                styles.loadText,
                                                { color: text }
                                            ]}
                                        >
                                            {route.from.city}, {route.from.country}
                                            {" → "}
                                            {route.to.city}, {route.to.country}
                                            {" • "}
                                            {route.tripsCompleted} trips
                                        </ThemedText>
                                    </View>
                                ))
                            )}


                        </View>
                    )}


                </SectionCard>






                {/* ---------- Reviews ---------- */}
                <SectionCard
                    title="Reviews"
                    background={backgroundLight}
                    textColor={text}
                >

                    <View style={styles.reviewsSummary}>

                        <View style={styles.ratingBadge}>

                            <Ionicons
                                name="star"
                                size={wp(5)}
                                color="#f2b01e"
                            />

                            <ThemedText
                                style={[
                                    styles.ratingTextLarge,
                                    { color: text }
                                ]}
                            >
                                {fleet.rating.toFixed(1)}
                            </ThemedText>

                        </View>


                        <ThemedText
                            style={[
                                styles.reviewText,
                                { color: icon }
                            ]}
                        >
                            {fleet.reviewsCount} reviews
                        </ThemedText>

                    </View>




                    {visibleReviews.map((review) => (

                        <View
                            key={review.id}
                            style={[
                                styles.reviewCard,
                                {
                                    backgroundColor: background
                                }
                            ]}
                        >

                            <View style={styles.reviewHeader}>


                                <ThemedText
                                    style={[
                                        styles.reviewName,
                                        { color: text }
                                    ]}
                                >
                                    {review.reviewer}
                                </ThemedText>



                                <View style={styles.reviewRating}>

                                    <Ionicons
                                        name="star"
                                        size={wp(3)}
                                        color="#f2b01e"
                                    />

                                    <ThemedText
                                        style={[
                                            styles.reviewRatingText,
                                            { color: text }
                                        ]}
                                    >
                                        {review.rating}
                                    </ThemedText>

                                </View>


                            </View>




                            <ThemedText
                                style={[
                                    styles.reviewComment,
                                    { color: icon }
                                ]}
                            >
                                {review.comment}
                            </ThemedText>



                            <ThemedText
                                style={[
                                    styles.reviewDate,
                                    { color: icon }
                                ]}
                            >
                                {review.date}
                            </ThemedText>



                        </View>


                    ))}





                    {
                        fleet.latestReviews.length > 3 && (

                            <TouchableOpacity
                                style={styles.reviewButton}
                                onPress={() => setShowAllReviews(v => !v)}
                            >

                                <ThemedText
                                    style={[
                                        styles.buttonText,
                                        {
                                            color: accent
                                        }
                                    ]}
                                >
                                    {
                                        showAllReviews
                                            ? "Show Less Reviews"
                                            : "View All Reviews"
                                    }

                                </ThemedText>


                                <Ionicons
                                    name={
                                        showAllReviews
                                            ? "chevron-up"
                                            : "chevron-down"
                                    }
                                    size={wp(4)}
                                    color={accent}
                                />


                            </TouchableOpacity>

                        )
                    }


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
    reviewButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: wp(2),
        paddingVertical: wp(3),
    },


    buttonText: {
        fontWeight: "700",
        fontSize: wp(3.5),
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
    }, dashboardRow: {
        flexDirection: "row",
        gap: 12,
    },


    loadsSection: {
        flex: 1.4,
    },


    payoutSection: {
        flex: 1,
    },
});
