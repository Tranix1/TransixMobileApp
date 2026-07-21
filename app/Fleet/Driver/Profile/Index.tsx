import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

// ---------- Types ----------

interface TripEntry {
    id: string;
    from: string;
    to: string;
    cargo?: string;
    distanceKm?: number;
    status: string;
    date: string;
}

interface MonthlyPayment {
    month: string; // e.g. "July"
    trips: number;
    paid: number;
    outstanding: number;
}

interface IncidentEntry {
    id: string;
    title: string;
    description?: string;
    date: string;
    severity?: 'low' | 'medium' | 'high';
}

interface DriverDocItem {
    label: string;
    uri: string;
    fileType?: string;
}

interface DriverProfileData {
    driverId: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
    profilePhoto: string | null;
    status: string; // e.g. "active" | "pending" | "inactive"

    // Performance
    rating: number;
    tripsCompleted: number;
    distanceDrivenKm: number;

    // Fleet history
    joinedFleet: string;
    revenueGenerated: number;
    onTimeDelivery: number; // %
    fuelPerformance: string;
    incidentsCount: number;

    recentTrips: TripEntry[];
    monthlyPayments: MonthlyPayment[];
    documents: DriverDocItem[];
    incidents: IncidentEntry[];
}

const DEFAULT_DRIVER: DriverProfileData = {
    driverId: '',
    fullName: 'Driver',
    phoneNumber: undefined,
    email: undefined,
    profilePhoto: null,
    status: 'active',

    rating: 0,
    tripsCompleted: 0,
    distanceDrivenKm: 0,

    joinedFleet: '--',
    revenueGenerated: 0,
    onTimeDelivery: 0,
    fuelPerformance: '--',
    incidentsCount: 0,

    // Not written to Firestore yet — left empty until that data exists.
    recentTrips: [],
    monthlyPayments: [],
    documents: [],
    incidents: [],
};

// ---------- Small reusable pieces (mirrors FleetProfile) ----------

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

    const { fleetId, driverId } = useLocalSearchParams<{ fleetId?: string; driverId?: string }>();
    const [driver, setDriver] = useState<DriverProfileData>(DEFAULT_DRIVER);
    const [loading, setLoading] = useState(true);
    const [documentsOpen, setDocumentsOpen] = useState(true);
    const [incidentsOpen, setIncidentsOpen] = useState(false);

    useEffect(() => {
        const loadDriverProfile = async () => {
            try {
                if (!fleetId || !driverId) {
                    setLoading(false);
                    return;
                }

                // Driver docs live at fleets/{fleetId}/Drivers/{driverId} (driverId is `DRV_${userId}`)
                const driverRef = doc(db, 'fleets', fleetId as string, 'Drivers', driverId as string);
                const snap = await getDoc(driverRef);

                if (snap.exists()) {
                    const data = snap.data() as any;
                    setDriver((prev) => ({
                        ...prev,
                        driverId: data.driverId || (driverId as string),
                        fullName: data.fullName || prev.fullName,
                        phoneNumber: data.phoneNumber ?? prev.phoneNumber,
                        email: data.email ?? prev.email,
                        profilePhoto: data.profilePhoto ?? prev.profilePhoto,
                        status: data.status || prev.status,

                        // Not populated by handleAddDrivers yet — read here too so the
                        // profile picks them up automatically once they're added.
                        rating: data.rating ?? prev.rating,
                        tripsCompleted: data.tripsCompleted ?? prev.tripsCompleted,
                        distanceDrivenKm: data.distanceDrivenKm ?? prev.distanceDrivenKm,

                        joinedFleet: data.joinedFleet || prev.joinedFleet,
                        revenueGenerated: data.revenueGenerated ?? prev.revenueGenerated,
                        onTimeDelivery: data.onTimeDelivery ?? prev.onTimeDelivery,
                        fuelPerformance: data.fuelPerformance || prev.fuelPerformance,
                        incidentsCount: data.incidentsCount ?? prev.incidentsCount,

                        recentTrips: data.recentTrips || prev.recentTrips,
                        monthlyPayments: data.monthlyPayments || prev.monthlyPayments,
                        documents: data.documents || prev.documents,
                        incidents: data.incidents || prev.incidents,
                    }));
                }
            } catch (error) {
                console.error('Error loading driver profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDriverProfile();
    }, [fleetId, driverId]);

    const statusLabel = driver.status
        ? driver.status.charAt(0).toUpperCase() + driver.status.slice(1) + ' Driver'
        : 'Driver';

    const statusColor = driver.status === 'active' ? '#16a34a' : driver.status === 'pending' ? '#f2b01e' : icon;

    return (
        <ScreenWrapper>
            <Heading page="Driver Details" />

            <ScrollView contentContainerStyle={{ paddingHorizontal: wp(4), paddingBottom: hp(6) }}>

                {/* ---------- Header ---------- */}
                <View style={[styles.card, styles.headerCard, { backgroundColor: backgroundLight }]}>
                    {driver.profilePhoto ? (
                        <Image source={{ uri: driver.profilePhoto }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: accent + '15' }]}>
                            <Ionicons name="person" size={wp(10)} color={accent} />
                        </View>
                    )}
                    <ThemedText style={[styles.driverName, { color: text }]}>{driver.fullName}</ThemedText>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <ThemedText style={[styles.statusText, { color: statusColor }]}>{statusLabel}</ThemedText>
                    </View>
                </View>

                {/* ---------- Performance ---------- */}
                <SectionCard title="Performance" background={backgroundLight} textColor={text}>
                    <View style={styles.statsGrid}>
                        <StatBlock label="Trips Completed" value={driver.tripsCompleted} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Distance" value={`${driver.distanceDrivenKm.toLocaleString()}km`} background={background} valueColor={text} iconColor={icon} />
                        <StatBlock label="Rating" value={driver.rating.toFixed(1)} background={background} valueColor={text} iconColor={icon} />
                    </View>
                </SectionCard>

                {/* ---------- Driver Payments ---------- */}
                <SectionCard title="Driver Payments" background={backgroundLight} textColor={text}>
                    {driver.monthlyPayments.length === 0 ? (
                        <ThemedText style={[styles.emptyText, { color: icon }]}>No payment records yet.</ThemedText>
                    ) : (
                        driver.monthlyPayments.map((mp, index) => (
                            <View key={mp.month} style={styles.performanceList}>
                                <ThemedText style={[styles.paymentMonth, { color: text }]}>{mp.month}:</ThemedText>
                                <View style={styles.performanceRow}>
                                    <ThemedText style={[styles.performanceLabel, { color: icon }]}>Trips</ThemedText>
                                    <ThemedText style={[styles.performanceValue, { color: text }]}>{mp.trips}</ThemedText>
                                </View>
                                <View style={styles.performanceRow}>
                                    <ThemedText style={[styles.performanceLabel, { color: icon }]}>Paid</ThemedText>
                                    <ThemedText style={[styles.performanceValue, { color: text }]}>${mp.paid.toLocaleString()}</ThemedText>
                                </View>
                                <View style={[styles.performanceRow, index === driver.monthlyPayments.length - 1 && { borderBottomWidth: 0 }]}>
                                    <ThemedText style={[styles.performanceLabel, { color: icon }]}>Outstanding</ThemedText>
                                    <ThemedText style={[styles.performanceValue, { color: text }]}>${mp.outstanding.toLocaleString()}</ThemedText>
                                </View>
                            </View>
                        ))
                    )}
                </SectionCard>

                {/* ---------- Recent Trips ---------- */}
                <SectionCard title="Recent Trips" background={backgroundLight} textColor={text}>
                    {driver.recentTrips.length === 0 ? (
                        <ThemedText style={[styles.emptyText, { color: icon }]}>No trips recorded yet.</ThemedText>
                    ) : (
                        driver.recentTrips.map((trip) => (
                            <View key={trip.id} style={[styles.tripCard, { backgroundColor: background }]}>
                                <View style={styles.tripHeaderRow}>
                                    <Ionicons name="arrow-forward-circle-outline" size={wp(4.5)} color={accent} />
                                    <ThemedText style={[styles.tripRoute, { color: text }]}> {trip.from} → {trip.to}</ThemedText>
                                </View>
                                {trip.cargo && <ThemedText style={[styles.tripDetail, { color: icon }]}>Cargo: {trip.cargo}</ThemedText>}
                                {typeof trip.distanceKm === 'number' && <ThemedText style={[styles.tripDetail, { color: icon }]}>Distance: {trip.distanceKm}km</ThemedText>}
                                <ThemedText style={[styles.tripDetail, { color: icon }]}>Status: {trip.status}</ThemedText>
                                <ThemedText style={[styles.tripDetail, { color: icon }]}>Date: {trip.date}</ThemedText>
                            </View>
                        ))
                    )}
                </SectionCard>

                {/* ---------- Fleet History ---------- */}
                <SectionCard title="Fleet History" background={backgroundLight} textColor={text}>
                    <View style={styles.performanceList}>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Joined Fleet</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.joinedFleet}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Trips Completed</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.tripsCompleted}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Distance Driven</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.distanceDrivenKm.toLocaleString()} km</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Revenue Generated</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>${driver.revenueGenerated.toLocaleString()}</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>On-time Delivery</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.onTimeDelivery}%</ThemedText>
                        </View>
                        <View style={styles.performanceRow}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Fuel Performance</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.fuelPerformance}</ThemedText>
                        </View>
                        <View style={[styles.performanceRow, { borderBottomWidth: 0 }]}>
                            <ThemedText style={[styles.performanceLabel, { color: icon }]}>Incidents</ThemedText>
                            <ThemedText style={[styles.performanceValue, { color: text }]}>{driver.incidentsCount}</ThemedText>
                        </View>
                    </View>
                </SectionCard>

                {/* ---------- Documents ---------- */}
                <SectionCard title="Documents" background={backgroundLight} textColor={text}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={() => setDocumentsOpen((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Uploaded Documents</ThemedText>
                        <Ionicons name={documentsOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {documentsOpen && (
                        <View style={styles.dropdownBody}>
                            {driver.documents.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>No documents uploaded yet.</ThemedText>
                            ) : (
                                <View style={styles.docsGrid}>
                                    {driver.documents.map((docItem, index) => (
                                        <View key={`${docItem.label}-${index}`} style={[styles.docTile, { backgroundColor: background }]}>
                                            <MaterialCommunityIcons name="file-document-outline" size={wp(8)} color={accent} />
                                            <ThemedText style={[styles.docLabel, { color: text }]} numberOfLines={2}>{docItem.label}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </SectionCard>

                {/* ---------- Incidents ---------- */}
                <SectionCard title="Incidents" background={backgroundLight} textColor={text}>
                    <TouchableOpacity style={styles.dropdownHeader} onPress={() => setIncidentsOpen((v) => !v)}>
                        <ThemedText style={[styles.dropdownTitle, { color: text }]}>Incident History</ThemedText>
                        <Ionicons name={incidentsOpen ? 'chevron-up' : 'chevron-down'} size={wp(4.5)} color={icon} />
                    </TouchableOpacity>
                    {incidentsOpen && (
                        <View style={styles.dropdownBody}>
                            {driver.incidents.length === 0 ? (
                                <ThemedText style={[styles.emptyText, { color: icon }]}>No incidents recorded.</ThemedText>
                            ) : (
                                driver.incidents.map((incident) => (
                                    <View key={incident.id} style={[styles.tripCard, { backgroundColor: background }]}>
                                        <View style={styles.tripHeaderRow}>
                                            <Ionicons name="warning-outline" size={wp(4.5)} color={incident.severity === 'high' ? '#ff6b6b' : '#f2b01e'} />
                                            <ThemedText style={[styles.tripRoute, { color: text }]}> {incident.title}</ThemedText>
                                        </View>
                                        {incident.description && <ThemedText style={[styles.tripDetail, { color: icon }]}>{incident.description}</ThemedText>}
                                        <ThemedText style={[styles.tripDetail, { color: icon }]}>Date: {incident.date}</ThemedText>
                                    </View>
                                ))
                            )}
                        </View>
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
    headerCard: {
        alignItems: 'center',
    },
    avatar: {
        width: wp(24),
        height: wp(24),
        borderRadius: wp(12),
    },
    avatarPlaceholder: {
        width: wp(24),
        height: wp(24),
        borderRadius: wp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    driverName: {
        fontSize: wp(5.5),
        fontWeight: 'bold',
        marginTop: wp(3),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        marginTop: wp(1.5),
    },
    statusDot: {
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
    },
    statusText: {
        fontSize: wp(3.4),
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
    paymentMonth: {
        fontSize: wp(3.8),
        fontWeight: '700',
        marginTop: wp(1),
    },
    tripCard: {
        borderRadius: wp(3),
        padding: wp(3),
        marginBottom: wp(2.5),
    },
    tripHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1.5),
    },
    tripRoute: {
        fontSize: wp(3.8),
        fontWeight: '700',
    },
    tripDetail: {
        fontSize: wp(3.2),
        marginTop: wp(0.5),
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: wp(2),
    },
    dropdownTitle: {
        fontSize: wp(3.8),
        fontWeight: '700',
    },
    dropdownBody: {
        paddingBottom: wp(2),
    },
    docsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(3),
    },
    docTile: {
        width: '46%',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#e2e8f0',
        borderRadius: wp(3),
        paddingVertical: wp(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    docLabel: {
        fontSize: wp(3.2),
        marginTop: wp(2),
        textAlign: 'center',
    },
    emptyText: {
        fontSize: wp(3.2),
        fontStyle: 'italic',
        paddingVertical: wp(1),
    },
});
