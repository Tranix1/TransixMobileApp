import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, RefreshControl, Modal, Alert, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, doc, deleteDoc, serverTimestamp, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import AccentRingLoader from '@/components/AccentRingLoader';
import { deleteDocument, updateDocument } from '@/db/operations';
// import ImageViewing from 'react-nativeput';
import Input from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/services/analytics/appAnalytics';
import { incrementMemberCount } from '@/services/analytics/organizationAnalytics';

// Payment method types for a driver
type PaymentType = 'trip' | 'monthly' | 'later' | 'custom';
type PaymentFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';

interface DriverPayment {
    type: PaymentType;
    amount?: number | null;
    currency?: string;
    custom?: { name: string; frequency: PaymentFrequency; notes: string };
}

interface Driver {
    id: string;
    fullName: string;
    phoneNumber: string;
    driverLicenseUrl: string;
    passportUrl: string;
    internationalPermitUrl: string;
    fleetId: string;
    createdAt: string;
    status: string;
    truckId?: string;
    truckName?: string;
    docId?: string;
    driverRole?: 'main' | 'second_main' | 'backup';
    payment?: DriverPayment;
    profilePhoto?: string;
    mainTruck?: {
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    };
    secondMainTruck?: {
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    };
    backupTrucks?: Array<{
        truckId: string;
        truckName: string;
        role: string;
        assignedAt: string;
    }>;
}


interface Driver {
    id: string;
    name: string;
    email: string;
    userId: string
    selfieImage: string
    // Add other properties present in your 'Drivers' collection
}

interface FleetAccess {
    fleetId: string;
    fleetName: string;
    status: 'pending' | 'active' | 'removed';
    invitedAt: any; // Using 'any' for Firestore serverTimestamp
    acceptedAt?: any;
}

interface DriverPaymentDraft {
    type: PaymentType;
    amount: string;
    currency: string;
    customName: string;
    customFrequency: PaymentFrequency;
    customNotes: string;
}

const DEFAULT_PAYMENT_DRAFT: DriverPaymentDraft = {
    type: 'trip',
    amount: '',
    currency: 'USD',
    customName: '',
    customFrequency: 'weekly',
    customNotes: '',
};

const PAYMENT_TYPE_OPTIONS: { key: PaymentType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'trip', label: 'On Trip', icon: 'car-outline' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
    { key: 'later', label: 'Assign Later', icon: 'time-outline' },
    { key: 'custom', label: 'Custom', icon: 'options-outline' },
];

const CURRENCY_OPTIONS = ['USD', 'ZAR', 'ZWG'];

const FREQUENCY_OPTIONS: { key: PaymentFrequency; label: string }[] = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'fortnightly', label: 'Fortnightly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
];

const draftToPayload = (draft: DriverPaymentDraft): DriverPayment => {
    if (draft.type === 'trip') return { type: 'trip' };
    if (draft.type === 'later') return { type: 'later' };

    if (draft.type === 'monthly') {
        return {
            type: 'monthly',
            amount: draft.amount.trim() ? parseFloat(draft.amount) : null,
            currency: draft.currency,
        };
    }

    return {
        type: 'custom',
        amount: draft.amount.trim() ? parseFloat(draft.amount) : null,
        currency: draft.currency,
        custom: {
            name: draft.customName.trim(),
            frequency: draft.customFrequency,
            notes: draft.customNotes.trim(),
        },
    };
};

const payloadToDraft = (payment?: DriverPayment): DriverPaymentDraft => {
    if (!payment) return DEFAULT_PAYMENT_DRAFT;
    return {
        type: payment.type,
        amount: payment.amount != null ? String(payment.amount) : '',
        currency: payment.currency || 'USD',
        customName: payment.custom?.name || '',
        customFrequency: payment.custom?.frequency || 'weekly',
        customNotes: payment.custom?.notes || '',
    };
};

const formatPaymentSummary = (payment?: DriverPayment) => {
    if (!payment) return 'Not set';
    if (payment.type === 'trip') return 'Paid per trip';
    if (payment.type === 'later') return 'Assign later';
    if (payment.type === 'monthly') return `Monthly · ${payment.currency} ${payment.amount ?? '—'}`;
    return `${payment.custom?.name || 'Custom'} · ${payment.currency} ${payment.amount ?? '—'}`;
};

const paymentTypeIcon = (type?: PaymentType): keyof typeof Ionicons.glyphMap => {
    if (type === 'monthly') return 'calendar-outline';
    if (type === 'later') return 'time-outline';
    if (type === 'custom') return 'options-outline';
    return 'car-outline';
};

const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
    return initials || '?';
};

// Reusable pill-style selector used inside both the add-driver flow and the payment editor
const PaymentTypeSelector = ({
    value,
    onChange,
    accent,
    icon,
    text,
    background,
}: {
    value: PaymentType;
    onChange: (t: PaymentType) => void;
    accent: string;
    icon: string;
    text: string;
    background: string;
}) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PAYMENT_TYPE_OPTIONS.map(opt => {
            const active = value === opt.key;
            return (
                <TouchableOpacity
                    key={opt.key}
                    onPress={() => onChange(opt.key)}
                    activeOpacity={0.7}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: active ? accent : icon + '55',
                        backgroundColor: active ? accent : background,
                    }}
                >
                    <Ionicons name={opt.icon} size={14} color={active ? '#fff' : icon} />
                    <ThemedText style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : text }}>
                        {opt.label}
                    </ThemedText>
                </TouchableOpacity>
            );
        })}
    </View>
);

const CurrencyRow = ({
    value,
    onChange,
    accent,
    icon,
    text,
    background,
}: {
    value: string;
    onChange: (c: string) => void;
    accent: string;
    icon: string;
    text: string;
    background: string;
}) => (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {CURRENCY_OPTIONS.map(c => {
            const active = value === c;
            return (
                <TouchableOpacity
                    key={c}
                    onPress={() => onChange(c)}
                    activeOpacity={0.7}
                    style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: active ? accent : icon + '55',
                        backgroundColor: active ? accent : background,
                    }}
                >
                    <ThemedText style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : text }}>{c}</ThemedText>
                </TouchableOpacity>
            );
        })}
    </View>
);

const FrequencyRow = ({
    value,
    onChange,
    accent,
    icon,
    text,
    background,
}: {
    value: PaymentFrequency;
    onChange: (f: PaymentFrequency) => void;
    accent: string;
    icon: string;
    text: string;
    background: string;
}) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {FREQUENCY_OPTIONS.map(f => {
            const active = value === f.key;
            return (
                <TouchableOpacity
                    key={f.key}
                    onPress={() => onChange(f.key)}
                    activeOpacity={0.7}
                    style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: active ? accent : icon + '55',
                        backgroundColor: active ? accent : background,
                    }}
                >
                    <ThemedText style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : text }}>{f.label}</ThemedText>
                </TouchableOpacity>
            );
        })}
    </View>
);

// Shared fields shown for monthly / custom payment drafts
const PaymentDetailFields = ({
    draft,
    onPatch,
    accent,
    icon,
    text,
    background,
}: {
    draft: DriverPaymentDraft;
    onPatch: (patch: Partial<DriverPaymentDraft>) => void;
    accent: string;
    icon: string;
    text: string;
    background: string;
}) => {
    if (draft.type === 'trip') {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <Ionicons name="information-circle-outline" size={14} color={icon} />
                <ThemedText style={{ fontSize: 12, color: icon, fontStyle: 'italic' }}>
                    Paid per completed trip based on assignment rate.
                </ThemedText>
            </View>
        );
    }

    if (draft.type === 'later') {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <Ionicons name="information-circle-outline" size={14} color={icon} />
                <ThemedText style={{ fontSize: 12, color: icon, fontStyle: 'italic' }}>
                    Payment method can be assigned later.
                </ThemedText>
            </View>
        );
    }

    if (draft.type === 'monthly') {
        return (
            <View style={{ marginTop: 10 }}>
                <ThemedText style={{ fontSize: 12, color: icon, marginBottom: 4 }}>Amount</ThemedText>
                <Input
                    placeholder="e.g. 500"
                    keyboardType="numeric"
                    value={draft.amount}
                    onChangeText={(v) => onPatch({ amount: v })}
                />
                <ThemedText style={{ fontSize: 12, color: icon, marginTop: 8, marginBottom: 2 }}>Currency</ThemedText>
                <CurrencyRow value={draft.currency} onChange={(c) => onPatch({ currency: c })} accent={accent} icon={icon} text={text} background={background} />
            </View>
        );
    }

    // custom
    return (
        <View style={{ marginTop: 10 }}>
            <ThemedText style={{ fontSize: 12, color: icon, marginBottom: 4 }}>Model name</ThemedText>
            <Input
                placeholder="e.g. Weekly Salary"
                value={draft.customName}
                onChangeText={(v) => onPatch({ customName: v })}
            />
            <ThemedText style={{ fontSize: 12, color: icon, marginTop: 8, marginBottom: 4 }}>Amount</ThemedText>
            <Input
                placeholder="e.g. 320"
                keyboardType="numeric"
                value={draft.amount}
                onChangeText={(v) => onPatch({ amount: v })}
            />
            <ThemedText style={{ fontSize: 12, color: icon, marginTop: 8, marginBottom: 2 }}>Currency</ThemedText>
            <CurrencyRow value={draft.currency} onChange={(c) => onPatch({ currency: c })} accent={accent} icon={icon} text={text} background={background} />
            <ThemedText style={{ fontSize: 12, color: icon, marginTop: 8, marginBottom: 2 }}>Frequency</ThemedText>
            <FrequencyRow value={draft.customFrequency} onChange={(f) => onPatch({ customFrequency: f })} accent={accent} icon={icon} text={text} background={background} />
            <ThemedText style={{ fontSize: 12, color: icon, marginTop: 8, marginBottom: 4 }}>Notes</ThemedText>
            <Input
                placeholder="e.g. Paid every Friday"
                value={draft.customNotes}
                onChangeText={(v) => onPatch({ customNotes: v })}
            />
        </View>
    );
};

export default function DriverIndex() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');

    const { driverId } = useLocalSearchParams();
    const { currentRole } = useAuth();
    const currentFleet = currentRole


    const [drivers, setFleetDrivers] = useState<Driver[]>([]);
    const [loadinFleetDrivers, setLoadingFleetDrivers] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);


    const onRefresh = async () => {
        try {
            setRefreshing(true);
            if (currentFleet?.fleetId) {
                await fetchDrivers();
            }
        } catch (error) {
            console.error('Error refreshing drivers:', error);
        } finally {
            setRefreshing(false);
        }
    };




    const fetchDrivers = async () => {
        // 1. Add a guard clause
        if (!currentRole || !currentRole.fleetId) {
            console.warn("Fleet ID is missing, skipping fetch.");
            return;
        }
        setLoadingFleetDrivers(true)

        try {
            // Now TypeScript knows fleetId is definitely a string
            const driversRef = collection(db, 'fleets', currentRole.fleetId, 'Drivers');
            const q = query(driversRef);
            const querySnapshot = await getDocs(q);

            const driversData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Driver[];

            setFleetDrivers(driversData);
            setLoadingFleetDrivers(false)

        } catch (error) {
            console.error('Error fetching drivers:', error);
            setLoadingFleetDrivers(false)

        } finally {
            setLoadingFleetDrivers(false)

        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);


    // ---- Payment editor for an already-added fleet driver ----
    const [editingPaymentDriver, setEditingPaymentDriver] = useState<Driver | null>(null);
    const [editDraft, setEditDraft] = useState<DriverPaymentDraft>(DEFAULT_PAYMENT_DRAFT);
    const [savingPayment, setSavingPayment] = useState(false);

    const openPaymentEditor = (item: Driver) => {
        setEditDraft(payloadToDraft(item.payment));
        setEditingPaymentDriver(item);
    };

    const patchEditDraft = (patch: Partial<DriverPaymentDraft>) => {
        setEditDraft(prev => ({ ...prev, ...patch }));
    };

    const saveDriverPayment = async () => {
        if (!editingPaymentDriver || !currentFleet?.fleetId) return;

        if (editDraft.type === 'monthly' && !editDraft.amount.trim()) {
            Alert.alert('Missing amount', 'Enter the monthly salary amount.');
            return;
        }
        if (editDraft.type === 'custom' && (!editDraft.customName.trim() || !editDraft.amount.trim())) {
            Alert.alert('Missing details', 'Enter the custom payment name and amount.');
            return;
        }

        const payload = draftToPayload(editDraft);

        setSavingPayment(true);
        try {
            await updateDocument(`fleets/${currentFleet.fleetId}/Drivers`, editingPaymentDriver.id, {
                payment: payload,
                updatedAt: new Date().toISOString(),
            });

            setFleetDrivers(prev =>
                prev.map(d => (d.id === editingPaymentDriver.id ? { ...d, payment: payload } : d))
            );
            setEditingPaymentDriver(null);
        } catch (error) {
            console.error('Error updating driver payment:', error);
            Alert.alert('Error', 'Failed to update payment method');
        } finally {
            setSavingPayment(false);
        }
    };


    const renderDriverItem = ({ item }: { item: Driver }) => {
        const isActive = item.status === 'active';

        return (
            <View style={[styles.driverCard, { backgroundColor: backgroundLight, borderColor: icon + '20' }]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                        if (item.status !== "active") {
                            ToastAndroid.show(
                                "Waiting for the driver to accept your invitation.",
                                ToastAndroid.SHORT
                            );
                            return;
                        }

                        router.push({
                            pathname: "/Fleet/Driver/DriverDetails",
                            params: {
                                driverId: item.id,
                                fleetId: currentFleet?.fleetId,
                            },
                        });
                    }}
                    style={styles.driverInfo}
                >
                    {item.profilePhoto ? (
                        <Image source={{ uri: item.profilePhoto }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarFallback, { backgroundColor: accent + '1f' }]}>
                            <ThemedText style={[styles.avatarInitials, { color: accent }]}>
                                {getInitials(item.fullName)}
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.driverDetails}>
                        <ThemedText style={styles.driverName} numberOfLines={1}>{item.fullName}</ThemedText>

                        <View style={styles.driverPhoneRow}>
                            <Ionicons name="call-outline" size={12} color={icon} />
                            <ThemedText style={[styles.driverPhone, { color: icon }]}>{item.phoneNumber}</ThemedText>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#0f9d5817' : '#ff6b3517' }]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#0f9d58' : '#ff6b35' }]} />
                        <ThemedText style={[styles.driverStatus, { color: isActive ? '#0f9d58' : '#ff6b35' }]}>
                            {item.status?.toUpperCase()}
                        </ThemedText>
                    </View>
                </TouchableOpacity>

                <View style={[styles.paymentRow, { borderTopColor: icon + '20' }]}>
                    <View style={styles.paymentInfo}>
                        <View style={[styles.paymentIconWrap, { backgroundColor: accent + '17' }]}>
                            <Ionicons name={paymentTypeIcon(item.payment?.type)} size={14} color={accent} />
                        </View>
                        <View>
                            <ThemedText style={{ fontSize: 11, color: icon }}>Payment</ThemedText>
                            <ThemedText style={styles.paymentSummary} numberOfLines={1}>
                                {formatPaymentSummary(item.payment)}
                            </ThemedText>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => openPaymentEditor(item)}
                        activeOpacity={0.7}
                        style={[styles.changeButton, { borderColor: accent }]}
                    >
                        <Ionicons name={item.payment ? 'pencil-outline' : 'add-circle-outline'} size={13} color={accent} />
                        <ThemedText style={[styles.changeButtonText, { color: accent }]}>
                            {item.payment ? 'Change' : 'Set payment'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };




    const handleDeleteDriver = () => {
        Alert.alert(
            "Delete Driver",
            `Are you sure you want to delete ${selectedDriver?.fullName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (selectedDriver && currentFleet) {
                            try {
                                await deleteDocument(`fleets/${currentFleet.fleetId}/Drivers`, selectedDriver.id);
                                setSelectedDriver(null);
                                // Refresh the list
                                // await fetchDrivers();
                            } catch (error) {
                                console.error('Error deleting driver:', error);
                                Alert.alert('Error', 'Failed to delete driver');
                            }
                        }
                    }
                }
            ]
        );
    };


    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddTracker, setShowAddDriver] = useState(false);

    // States
    const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
    const [searchedDrivers, setSearchedDrivers] = useState<Driver[]>([]);
    const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
    const [driverSearchQuery, setDriverSearchQuery] = useState('');
    const [loadingAllDrivers, setLoadingAllDrivers] = useState(true);

    // Payment method chosen per selected driver, keyed by driver.id.
    // A draft is created the moment a driver is selected in the list below.
    const [driverPayments, setDriverPayments] = useState<Record<string, DriverPaymentDraft>>({});

    const getPaymentDraft = (id: string) => driverPayments[id] || DEFAULT_PAYMENT_DRAFT;

    const updatePaymentDraft = (id: string, patch: Partial<DriverPaymentDraft>) => {
        setDriverPayments(prev => ({
            ...prev,
            [id]: { ...(prev[id] || DEFAULT_PAYMENT_DRAFT), ...patch },
        }));
    };

    // Converts a driver's payment draft into the persisted payment shape
    const buildPaymentPayload = (id: string) => draftToPayload(getPaymentDraft(id));

    // Fetch drivers once — this is the full pool the search box filters
    // against locally, so it's loaded up front and shown in full by
    // default (before any search text is typed).
    useEffect(() => {
        const fetchAllDrivers = async () => {
            setLoadingAllDrivers(true);
            try {
                const querySnapshot = await getDocs(collection(db, "Drivers"));
                const driversData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Driver[];
                setAllDrivers(driversData);
                setSearchedDrivers(driversData);
            } catch (error) {
                console.error('Error fetching all drivers:', error);
            } finally {
                setLoadingAllDrivers(false);
            }
        };
        fetchAllDrivers();
    }, []);



    const handleSearch = (text: string) => {
        setDriverSearchQuery(text);

        const searchText = text.trim().toLowerCase();

        // Input cleared — show everyone again, not an empty list.
        if (!searchText) {
            setSearchedDrivers(allDrivers);
            return;
        }

        // Some text entered — show only what matches, never the full list.
        const filtered = allDrivers.filter(driver =>
            driver.fullName?.toLowerCase().includes(searchText) ||
            driver.email?.toLowerCase().includes(searchText)
        );

        setSearchedDrivers(filtered);
    };

    const handleAddDrivers = async () => {
        if (selectedDrivers.length === 0) return;

        // Validate each selected driver's payment draft before submitting
        for (const driver of selectedDrivers) {
            const draft = getPaymentDraft(driver.id);
            if (draft.type === 'monthly' && !draft.amount.trim()) {
                Alert.alert('Missing amount', `Enter the monthly salary amount for ${driver.fullName}.`);
                return;
            }
            if (draft.type === 'custom' && (!draft.customName.trim() || !draft.amount.trim())) {
                Alert.alert('Missing details', `Enter the custom payment name and amount for ${driver.fullName}.`);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const fleetUpdate = {
                fleetId: currentRole.fleetId,
                fleetName: currentRole.companyName,
                status: "pending",
                invitedAt: Date.now(),
                role: "fleet",
                userRole: "driver"
            };

            // Update each selected driver
            await Promise.all(selectedDrivers.map(async (driver) => {
                await updateDocument('personalData', driver.userId, {
                    accesibleFleets: arrayUnion({ ...fleetUpdate, driverId: `DRV_${driver?.userId}` }), // Use arrayUnion to avoid overwriting existing data
                    updatedAt: serverTimestamp(),

                });

                if (!currentRole.fleetId) return
                const driverRef = doc(db, 'fleets', currentRole.fleetId, 'Drivers', `DRV_${driver.userId}`);
                await setDoc(driverRef, { ...fleetUpdate, driverId: `DRV_${driver?.userId}`, 
                 driverUserId:driver?.userId,   fullName: driver.fullName, phoneNumber: driver.phoneNumber, driverEmail: driver.email, timeStamp: serverTimestamp(), profilePhoto: driver.selfieImage, payment: buildPaymentPayload(driver.id), });

            }));

            const analyticsOrganizationId = currentRole?.organizationId || currentRole?.fleetId;
            if (analyticsOrganizationId) {
                for (const driver of selectedDrivers) {
                    void trackEvent({ eventName: 'driver_added', userId: driver.userId, organizationId: analyticsOrganizationId, organizationProfileId: analyticsOrganizationId, organizationType: 'fleet', role: 'driver', accountType: 'driver', metadata: { driverId: driver.userId } }).catch(console.error);
                }
                void incrementMemberCount(analyticsOrganizationId, selectedDrivers.length).catch(console.error);
            }


            fetchDrivers()
            setShowAddDriver(false);
            setSelectedDrivers([]); // Clear selection
            setDriverPayments({}); // Clear payment drafts
            setDriverSearchQuery('');
            setSearchedDrivers(allDrivers);
        } catch (e) {
            console.error("Error updating drivers:", e);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <ScreenWrapper>

            <Modal visible={showAddTracker} transparent animationType="slide">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    paddingHorizontal: wp(4)
                }}>
                    <View style={{
                        backgroundColor: background,
                        borderRadius: 12,
                        padding: wp(4)
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>Add Driver</ThemedText>
                            <TouchableOpacity onPress={() => setShowAddDriver(false)}>
                                <Ionicons name="close" size={24} color={accent} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={{ marginBottom: wp(1) }}>Driver Name</ThemedText>
                        <Input
                            placeholder="Search by name or email"
                            onChangeText={handleSearch}
                            value={driverSearchQuery}
                            style={{ marginBottom: wp(3) }}
                        />

                        <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>Available Drivers</ThemedText>


                        <FlatList
                            data={searchedDrivers}
                            keyExtractor={(item) => item.id}
                            keyboardShouldPersistTaps="handled"
                            style={{ maxHeight: hp(45) }}
                            renderItem={({ item }) => {
                                const isSelected = selectedDrivers.some(
                                    d => d.id === item.id
                                );
                                const payment = getPaymentDraft(item.id);

                                return (
                                    <View style={{ marginVertical: 4 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedDrivers(prev =>
                                                    isSelected
                                                        ? prev.filter(d => d.id !== item.id)
                                                        : [...prev, item]
                                                );
                                                // Start a fresh payment draft the moment a driver is selected
                                                if (!isSelected && !driverPayments[item.id]) {
                                                    updatePaymentDraft(item.id, {});
                                                }
                                            }}
                                            style={{
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: isSelected ? accent : icon,
                                                borderTopLeftRadius: 8,
                                                borderTopRightRadius: 8,
                                                borderBottomLeftRadius: isSelected ? 0 : 8,
                                                borderBottomRightRadius: isSelected ? 0 : 8,
                                                borderBottomWidth: isSelected ? 0 : 1,
                                                backgroundColor: isSelected
                                                    ? backgroundLight
                                                    : background,
                                            }}
                                        >
                                            <ThemedText>{item.fullName}</ThemedText>
                                            <ThemedText style={{ fontSize: 12 }}>
                                                {item.email}
                                            </ThemedText>
                                        </TouchableOpacity>

                                        {isSelected && (
                                            <View style={{
                                                borderWidth: 1,
                                                borderTopWidth: 0,
                                                borderColor: accent,
                                                borderBottomLeftRadius: 8,
                                                borderBottomRightRadius: 8,
                                                padding: 10,
                                                backgroundColor: background,
                                            }}>
                                                <ThemedText style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                                                    Payment Method
                                                </ThemedText>

                                                <PaymentTypeSelector
                                                    value={payment.type}
                                                    onChange={(t) => updatePaymentDraft(item.id, { type: t })}
                                                    accent={accent}
                                                    icon={icon}
                                                    text={text}
                                                    background={background}
                                                />

                                                <PaymentDetailFields
                                                    draft={payment}
                                                    onPatch={(patch) => updatePaymentDraft(item.id, patch)}
                                                    accent={accent}
                                                    icon={icon}
                                                    text={text}
                                                    background={background}
                                                />
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                            ListEmptyComponent={
                                loadingAllDrivers ? (
                                    <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                                        Loading drivers…
                                    </ThemedText>
                                ) : driverSearchQuery.trim() ? (
                                    <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                                        No drivers found with "{driverSearchQuery.trim()}"
                                    </ThemedText>
                                ) : (
                                    <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                                        No drivers available
                                    </ThemedText>
                                )
                            }
                        />


                        <TouchableOpacity
                            disabled={isSubmitting || selectedDrivers.length === 0}
                            onPress={handleAddDrivers}
                            style={{
                                marginTop: wp(4),
                                padding: wp(3),
                                backgroundColor: selectedDrivers.length === 0 ? '#ccc' : accent,
                                borderRadius: 8,
                                alignItems: 'center'
                            }}
                        >
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                                {isSubmitting ? "Submitting..." : `Submit (${selectedDrivers.length})`}
                            </ThemedText>
                        </TouchableOpacity>



                    </View>
                </View>
            </Modal>


            {/* Edit payment method for a driver already added to the fleet */}
            <Modal visible={!!editingPaymentDriver} transparent animationType="slide">
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    paddingHorizontal: wp(4)
                }}>
                    <View style={{
                        backgroundColor: background,
                        borderRadius: 14,
                        padding: wp(4),
                        maxHeight: hp(85),
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(2) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="wallet-outline" size={18} color={accent} />
                                <ThemedText style={{ fontSize: 17, fontWeight: 'bold' }}>Payment method</ThemedText>
                            </View>
                            <TouchableOpacity onPress={() => setEditingPaymentDriver(null)}>
                                <Ionicons name="close" size={22} color={accent} />
                            </TouchableOpacity>
                        </View>

                        {editingPaymentDriver && (
                            <ThemedText style={{ fontSize: 13, color: icon, marginBottom: wp(3) }}>
                                {editingPaymentDriver.fullName}
                            </ThemedText>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <PaymentTypeSelector
                                value={editDraft.type}
                                onChange={(t) => patchEditDraft({ type: t })}
                                accent={accent}
                                icon={icon}
                                text={text}
                                background={backgroundLight}
                            />

                            <PaymentDetailFields
                                draft={editDraft}
                                onPatch={patchEditDraft}
                                accent={accent}
                                icon={icon}
                                text={text}
                                background={backgroundLight}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            disabled={savingPayment}
                            onPress={saveDriverPayment}
                            style={{
                                marginTop: wp(4),
                                padding: wp(3),
                                backgroundColor: accent,
                                borderRadius: 8,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 6,
                                opacity: savingPayment ? 0.7 : 1,
                            }}
                        >
                            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                                {savingPayment ? 'Saving...' : 'Save payment method'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>




            <Heading
                page="Drivers"
                rightComponent={
                    <TouchableOpacity
                        onPress={() => setShowAddDriver(true)}
                        style={[styles.addButton, { backgroundColor: accent }]}
                    >
                        <Ionicons name="add" size={wp(5)} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={[styles.container, { backgroundColor: background }]}>


                <FlatList
                    data={drivers}
                    renderItem={renderDriverItem}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[accent]}
                        />
                    }

                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            {
                                loadinFleetDrivers ? (
                                    <>
                                        <AccentRingLoader color={accent} size={32} dotSize={6} />
                                        <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                            Drivers Loading ....
                                        </ThemedText>
                                        <ThemedText type='tiny' style={styles.emptySubtext}>
                                            Please Wait
                                        </ThemedText>
                                    </>
                                ) :
                                    refreshing ? (
                                        <>
                                            <AccentRingLoader color={accent} size={32} dotSize={6} />
                                            <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                                Refreshing Drivers…
                                            </ThemedText>
                                            <ThemedText type='tiny' style={styles.emptySubtext}>
                                                Please Wait
                                            </ThemedText>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="people-outline" size={wp(16)} color={icon} style={{ alignSelf: "center" }} />

                                            <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                                                No Drivers Available
                                            </ThemedText>


                                            <TouchableOpacity onPress={() => setShowAddDriver(true)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                                            >
                                                <ThemedText style={{ color: '#666' }}>
                                                    Assign a driver to assign trucks and loads.
                                                </ThemedText>

                                                <Ionicons
                                                    name="chevron-forward"
                                                    size={16}
                                                    color={accent}
                                                    style={{ marginLeft: 4 }}
                                                />
                                            </TouchableOpacity>

                                        </>
                                    )}
                        </View>
                    }

                />

            </View>


        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
    },
    addButton: {
        padding: wp(2),
        borderRadius: wp(2),
        marginRight: wp(4),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingBottom: wp(4),
    },
    driverCard: {
        borderRadius: wp(3.5),
        borderWidth: 1,
        padding: wp(3.5),
        marginBottom: wp(3),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarImage: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
    },
    avatarFallback: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: wp(4),
        fontWeight: '700',
    },
    driverDetails: {
        flex: 1,
        marginLeft: wp(3),
    },
    driverName: {
        fontSize: wp(4.2),
        fontWeight: '700',
        marginBottom: 3,
    },
    driverPhoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    driverPhone: {
        fontSize: wp(3.3),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    driverStatus: {
        fontSize: wp(2.7),
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: wp(3),
        paddingTop: wp(3),
        borderTopWidth: 1,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        marginRight: wp(2),
    },
    paymentIconWrap: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(2.5),
    },
    paymentSummary: {
        fontSize: wp(3.4),
        fontWeight: '600',
    },
    changeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    changeButtonText: {
        fontSize: wp(3),
        fontWeight: '700',
    },
    emptyContainer: {
        minHeight: hp(80),
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center'
    },
    emptySubtext: {
        textAlign: 'center',
        marginTop: wp(2)
    },
});
