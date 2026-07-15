import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import { useAuthState } from '@/hooks/useAuthState';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

// ---------- Types ----------

interface TripEntry {
    id: string;
    route: string;
    date: string;
    load: string;
    status: string;
}

interface ReviewEntry {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
}

interface DriverProfileData {
    photoUrl: string;
    fullName: string;
    location: string;
    rating: number;
    reviewsCount: number;
    memberSince: string;
    lastActive: string;

    completedTrips: number;
    activeTrips: number;
    yearsExperience: string;

    onTimeDelivery: number;
    acceptanceRate: number;
    avgResponseTime: string;
    cancellationRate: number;
    safetyRecord: string;
    totalDistance: number;
    trackingStatus: 'Live' | 'Manual' | 'Unavailable';

    licenceClasses: string[];
    endorsements: string[];
    languages: string[];

    recentTrips: TripEntry[];
    latestReviews: ReviewEntry[];
}

const DEFAULT_DRIVER: DriverProfileData = {
    photoUrl: 'https://via.placeholder.com/160?text=Driver',
    fullName: 'David K. Ochieng',
    location: 'Nairobi, Kenya',
    rating: 4.9,
    reviewsCount: 84,
    memberSince: 'Feb 2020',
    lastActive: 'Today',

    completedTrips: 152,
    activeTrips: 1,
    yearsExperience: '7 years',

    onTimeDelivery: 98,
    acceptanceRate: 93,
    avgResponseTime: '6 min',
    cancellationRate: 1,
    safetyRecord: 'No incidents',
    totalDistance: 96400,
    trackingStatus: 'Live',

    licenceClasses: ['Class C', 'Class E'],
    endorsements: ['Hazardous Materials', 'Tanker'],
    languages: ['English', 'Swahili'],

    recentTrips: [
        { id: 't1', route: 'Nairobi → Mombasa', date: 'Jun 3, 2026', load: 'Fuel & Spares', status: 'Delivered' },
        { id: 't2', route: 'Mombasa → Kisumu', date: 'May 26, 2026', load: 'Grain', status: 'Completed' },
        { id: 't3', route: 'Kisumu → Eldoret', date: 'May 20, 2026', load: 'Construction Materials', status: 'Completed' },
    ],
    latestReviews: [
        { id: 'r1', author: 'Fleet Manager', rating: 5, comment: 'Always meets delivery windows and keeps the truck in excellent condition.', date: 'Jun 5, 2026' },
        { id: 'r2', author: 'Operations Lead', rating: 5, comment: 'Great communication, very responsive on long-haul jobs.', date: 'May 29, 2026' },
    ],
};

// ---------- Small reusable pieces ----------

function StatBlock({ label, value, background, valueColor, labelColor }: { label: string; value: string | number; background: string; valueColor: string; labelColor: string }) {
    return (
        <View style={[styles.statBlock, { backgroundColor: background }]}>
            <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
        </View>
    );
}

function SectionCard({ title, meta, children, background, textColor, accent }: { title: string; meta?: string; children: React.ReactNode; background: string; textColor: string; accent?: string }) {
    return (
        <View style={[styles.card, { backgroundColor: background }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
                {meta ? <Text style={[styles.sectionMeta, { color: accent }]}>{meta}</Text> : null}
            </View>
            {children}
        </View>
    );
}

function Chip({ label, background, textColor }: { label: string; background: string; textColor: string }) {
    return (
        <View style={[styles.chip, { backgroundColor: background }]}>
            <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
        </View>
    );
}

// ---------- Main component ----------

function Profile() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');

    const {
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        updateUserProfile
    } = useAuthState();

    const { currentRole } = useAuth();
    const { driverId: driverIdParam } = useLocalSearchParams<{ driverId?: string }>();

    const [dspCreateAcc, setDspCreateAcc] = React.useState(false);
    const [dspVerifyAcc, setDspVerifyAcc] = React.useState(false);
    const [dspMenu, setDspMenu] = React.useState(false);
    const [tripsOpen, setTripsOpen] = React.useState(true);

    const [driver, setDriver] = React.useState<DriverProfileData>(DEFAULT_DRIVER);

    React.useEffect(() => {
        const loadDriverProfile = async () => {
            try {
                const driverId = driverIdParam || user?.uid;
                if (!driverId) return;

                // Query "profiles" collection filtered by driverId.
                // If drivers are stored by doc ID instead, replace with:
                //   const snap = await getDoc(doc(db, 'profiles', driverId));
                const profilesQuery = query(
                    collection(db, 'profiles'),
                    where('driverId', '==', driverId),
                    limit(1)
                );
                const snapshot = await getDocs(profilesQuery);

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data() as any;
                    setDriver((prev) => ({
                        ...prev,
                        photoUrl: data.photoUrl || prev.photoUrl,
                        fullName: data.fullName || user?.displayName || prev.fullName,
                        location: data.location || prev.location,
                        rating: data.rating ?? prev.rating,
                        reviewsCount: data.reviewsCount ?? prev.reviewsCount,
                        memberSince: data.memberSince || prev.memberSince,
                        lastActive: data.lastActive || prev.lastActive,

                        completedTrips: data.completedTrips ?? prev.completedTrips,
                        activeTrips: data.activeTrips ?? prev.activeTrips,
                        yearsExperience: data.yearsExperience || prev.yearsExperience,

                        onTimeDelivery: data.onTimeDelivery ?? prev.onTimeDelivery,
                        acceptanceRate: data.acceptanceRate ?? prev.acceptanceRate,
                        avgResponseTime: data.avgResponseTime || prev.avgResponseTime,
                        cancellationRate: data.cancellationRate ?? prev.cancellationRate,
                        safetyRecord: data.safetyRecord || prev.safetyRecord,
                        totalDistance: data.totalDistance ?? prev.totalDistance,
                        trackingStatus: data.trackingStatus || prev.trackingStatus,

                        licenceClasses: data.licenceClasses || prev.licenceClasses,
                        endorsements: data.endorsements || prev.endorsements,
                        languages: data.languages || prev.languages,

                        recentTrips: data.recentTrips || prev.recentTrips,
                        latestReviews: data.latestReviews || prev.latestReviews,
                    }));
                }
            } catch (error) {
                console.error('Error loading driver profile:', error);
            }
        };

        loadDriverProfile();
    }, [driverIdParam, user]);

    const checkAuth = (theAction?: () => void) => {
        if (!isAuthenticated) {
            setDspCreateAcc(true);
            return;
        }

        if (needsProfileSetup) {
            router.push({ pathname: '/Account/Profile', params: { operation: 'create' } });
            return;
        }

        if (needsEmailVerification) {
            setDspVerifyAcc(true);
            return;
        }

        if (typeof theAction === 'function') {
            theAction();
        } else {
            setDspMenu(true);
        }
    };

    const trackingColor =
        driver.trackingStatus === 'Live' ? '#16a34a' : driver.trackingStatus === 'Manual' ? '#f2b01e' : '#9ca3af';

    return (
        <View style={[styles.wrapper, { backgroundColor: background }]}>
            <CustomHeader  pageTitle="Driver Profile" />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ---------- Header ---------- */}
                <View style={[styles.hero, { backgroundColor: accent + '15' }]}>
                    <View style={styles.heroTop}>
                        <View style={[styles.avatarFrame, { borderColor: accent }]}>
                            <Image source={{ uri: driver.photoUrl }} style={styles.avatar} />
                        </View>
                        <View style={styles.heroText}>
                            <Text style={[styles.name, { color: text }]}>{driver.fullName}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={13} color={icon} />
                                <Text style={[styles.subtitle, { color: icon }]}> {driver.location}</Text>
                            </View>
                            <View style={styles.ratingRow}>
                                <View style={[styles.ratingBadge, { backgroundColor: '#fef3c7' }]}>
                                    <Ionicons name="star" size={13} color="#f2b01e" />
                                    <Text style={[styles.ratingText, { color: text }]}>{driver.rating.toFixed(1)}</Text>
                                </View>
                                <Text style={[styles.reviewText, { color: icon }]}>{driver.reviewsCount} reviews</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Text style={[styles.metaLabel, { color: coolGray }]}>Member since</Text>
                            <Text style={[styles.metaValue, { color: text }]}>{driver.memberSince}</Text>
                        </View>
                        <View style={[styles.metaDivider, { backgroundColor: accent + '30' }]} />
                        <View style={styles.metaItem}>
                            <Text style={[styles.metaLabel, { color: coolGray }]}>Last active</Text>
                            <Text style={[styles.metaValue, { color: text }]}>{driver.lastActive}</Text>
                        </View>
                    </View>
                </View>

                {/* ---------- Overview ---------- */}
                <SectionCard title="Overview" background={backgroundLight} textColor={text}>
                    <View style={styles.statsGrid}>
                        <StatBlock label="Completed Trips" value={driver.completedTrips} background={background} valueColor={text} labelColor={coolGray} />
                        <StatBlock label="Active Trips" value={driver.activeTrips} background={background} valueColor={text} labelColor={coolGray} />
                        <StatBlock label="Experience" value={driver.yearsExperience} background={background} valueColor={text} labelColor={coolGray} />
                    </View>

                    <TouchableOpacity style={styles.dropdownHeader} onPress={() => setTripsOpen((v) => !v)}>
                        <Text style={[styles.dropdownTitle, { color: text }]}>Recent Trips</Text>
                        <Ionicons name={tripsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={icon} />
                    </TouchableOpacity>
                    {tripsOpen && driver.recentTrips.map((trip) => (
                        <View key={trip.id} style={[styles.routeItem, { backgroundColor: background }]}>
                            <View style={styles.routeText}>
                                <Text style={[styles.routeName, { color: text }]}>{trip.route}</Text>
                                <Text style={[styles.routeDetail, { color: coolGray }]}>{trip.date} · {trip.load}</Text>
                            </View>
                            <View style={styles.routeStatus}>
                                <Text style={[styles.routeStatusText, { color: accent }]}>{trip.status}</Text>
                            </View>
                        </View>
                    ))}
                </SectionCard>

                {/* ---------- Performance ---------- */}
                <SectionCard title="Performance" background={backgroundLight} textColor={text}>
                    <View style={styles.performanceList}>
                        <View style={styles.performanceRow}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>On-Time Delivery</Text>
                            <Text style={[styles.performanceValue, { color: text }]}>{driver.onTimeDelivery}%</Text>
                        </View>
                        <View style={styles.performanceRow}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>Acceptance Rate</Text>
                            <Text style={[styles.performanceValue, { color: text }]}>{driver.acceptanceRate}%</Text>
                        </View>
                        <View style={styles.performanceRow}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>Avg Response Time</Text>
                            <Text style={[styles.performanceValue, { color: text }]}>{driver.avgResponseTime}</Text>
                        </View>
                        <View style={styles.performanceRow}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>Cancellation Rate</Text>
                            <Text style={[styles.performanceValue, { color: text }]}>{driver.cancellationRate}%</Text>
                        </View>
                        <View style={styles.performanceRow}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>Safety Record</Text>
                            <Text style={[styles.performanceValue, { color: text }]}>{driver.safetyRecord}</Text>
                        </View>
                        <View style={styles.performanceRow}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>Total Distance</Text>
                            <Text style={[styles.performanceValue, { color: text }]}>{driver.totalDistance.toLocaleString()} km</Text>
                        </View>
                        <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.performanceLabel, { color: coolGray }]}>Tracking Status</Text>
                            <View style={styles.trackingBadge}>
                                <View style={[styles.trackingDot, { backgroundColor: trackingColor }]} />
                                <Text style={[styles.performanceValue, { color: text }]}>{driver.trackingStatus}</Text>
                            </View>
                        </View>
                    </View>
                </SectionCard>

                {/* ---------- Qualifications ---------- */}
                <SectionCard title="Qualifications" background={backgroundLight} textColor={text}>
                    <Text style={[styles.subheading, { color: coolGray }]}>Licence Classes</Text>
                    <View style={styles.chipRow}>
                        {driver.licenceClasses.map((item) => (
                            <Chip key={item} label={item} background={accent + '12'} textColor={accent} />
                        ))}
                    </View>

                    <Text style={[styles.subheading, { color: coolGray, marginTop: 14 }]}>Special Endorsements</Text>
                    <View style={styles.chipRow}>
                        {driver.endorsements.length === 0 ? (
                            <Text style={[styles.emptyText, { color: coolGray }]}>None listed.</Text>
                        ) : (
                            driver.endorsements.map((item) => (
                                <Chip key={item} label={item} background={accent + '12'} textColor={accent} />
                            ))
                        )}
                    </View>

                    <Text style={[styles.subheading, { color: coolGray, marginTop: 14 }]}>Languages Spoken</Text>
                    <View style={styles.chipRow}>
                        {driver.languages.map((item) => (
                            <Chip key={item} label={item} background={'rgba(0,0,0,0.05)'} textColor={text} />
                        ))}
                    </View>
                </SectionCard>

                {/* ---------- Reviews ---------- */}
                <SectionCard title="Reviews" meta={`${driver.rating.toFixed(1)} / 5`} accent={accent} background={backgroundLight} textColor={text}>
                    <View style={styles.reviewsSummary}>
                        <View style={[styles.ratingBadge, { backgroundColor: '#fef3c7' }]}>
                            <Ionicons name="star" size={18} color="#f2b01e" />
                            <Text style={[styles.ratingTextLarge, { color: text }]}>{driver.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={[styles.reviewText, { color: coolGray }]}>{driver.reviewsCount} reviews</Text>
                    </View>

                    {driver.latestReviews.map((review) => (
                        <View key={review.id} style={[styles.commentCard, { backgroundColor: background }]}>
                            <View style={styles.reviewHeaderRow}>
                                <Text style={[styles.commentAuthor, { color: text }]}>{review.author}</Text>
                                <View style={styles.reviewRating}>
                                    <Ionicons name="star" size={11} color="#f2b01e" />
                                    <Text style={[styles.reviewRatingText, { color: text }]}>{review.rating}</Text>
                                </View>
                            </View>
                            <Text style={[styles.commentBody, { color: icon }]}>{review.comment}</Text>
                            <Text style={[styles.reviewDate, { color: coolGray }]}>{review.date}</Text>
                        </View>
                    ))}
                </SectionCard>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: accent }]} onPress={() => {}}>
                        <Text style={styles.actionText}>Message Driver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButtonOutline, { borderColor: accent }]} onPress={() => {}}>
                        <Text style={[styles.actionTextOutline, { color: accent }]}>View Documents</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AuthStatusModal
                visible={dspCreateAcc}
                onClose={() => setDspCreateAcc(false)}
                user={user}
                type="create"
            />

            <AuthStatusModal
                visible={dspVerifyAcc}
                onClose={() => setDspVerifyAcc(false)}
                user={user}
                type="verify"
            />

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />
        </View>
    );
}

export default Profile;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 32,
    },
    hero: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,
        overflow: 'hidden',
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatarFrame: {
        width: 92,
        height: 92,
        borderRadius: 24,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#ffffff',
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 20,
    },
    heroText: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 13,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    ratingText: {
        marginLeft: 5,
        fontWeight: '700',
        fontSize: 14,
    },
    ratingTextLarge: {
        marginLeft: 6,
        fontWeight: '700',
        fontSize: 20,
    },
    reviewText: {
        fontSize: 12,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
    metaItem: {
        flex: 1,
    },
    metaDivider: {
        width: 1,
        height: 30,
        marginHorizontal: 14,
    },
    metaLabel: {
        fontSize: 11,
        marginBottom: 3,
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    statBlock: {
        flexGrow: 1,
        flexBasis: '30%',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 17,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },
    card: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionMeta: {
        fontSize: 12,
        fontWeight: '700',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
        marginTop: 4,
    },
    dropdownTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    routeItem: {
        borderRadius: 18,
        padding: 16,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    routeText: {
        flex: 1,
        paddingRight: 12,
    },
    routeName: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 5,
    },
    routeDetail: {
        fontSize: 12,
    },
    routeStatus: {
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    routeStatusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    performanceList: {
        marginTop: 2,
    },
    performanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    performanceLabel: {
        fontSize: 13,
    },
    performanceValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    trackingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trackingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    subheading: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    reviewsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    commentCard: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '700',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewRatingText: {
        marginLeft: 3,
        fontWeight: '700',
        fontSize: 12,
    },
    commentBody: {
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 6,
    },
    reviewDate: {
        fontSize: 11,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    actionButtonOutline: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginLeft: 10,
        backgroundColor: 'transparent',
    },
    actionText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '700',
    },
    actionTextOutline: {
        fontSize: 14,
        fontWeight: '700',
    }
});