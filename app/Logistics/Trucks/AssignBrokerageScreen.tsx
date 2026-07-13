import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Alert,
    ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import Input from '@/components/Input';
import { ThemedText } from '@/components/ThemedText';
import {
    collection,
    getDocs,
    doc,
    query,
    where,
    writeBatch,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { SelectLocationProp } from '@/types/types';
import { sendUserNotification } from '@/Utilities/pushNotification';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Brokerage {
    id: string;
    name: string;
    brokerType: string;
    location?: SelectLocationProp;
    expoPushToken: string;
}

interface TruckRouteParams {
    truckId?: string;
    truckName?: string;
    truckType?: string;
    cargoArea?: string;
    operaatingLocations?: string | string[];
    capacity?: string;
    numberPlate?: string;
    fleetId?: string;
    fleetName?: string;
    imageUrl?: string
    truckAssigments?: any
}

type Mode = 'other' | 'default';

// -----------------------------------------------------------------------------
// Data layer
// -----------------------------------------------------------------------------

/** All brokerages in the system. Nothing here is filtered by fleet. */
async function fetchAllBrokerages(): Promise<Brokerage[]> {
    const snapshot = await getDocs(collection(db, 'brokerages'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Brokerage[];
}

/**
 * Fleet defaults are mirrored in two places, written together in one batch:
 *   - brokerages/{brokerageId}/fleets/{fleetId}   (per-brokerage history)
 *   - fleets/{fleetId}/defaultBrokerages/{brokerageId}  (fast lookup, e.g.
 *     when creating a new truck and auto-attaching the fleet's defaults)
 *
 * Reading defaults for a fleet only ever needs the second one — a single
 * query, no per-brokerage reads, no composite index.
 */
async function fetchDefaultBrokerageIdsForFleet(fleetId: string): Promise<Set<string>> {
    if (!fleetId) return new Set();
    try {
        const q = query(collection(db, 'fleets', fleetId, 'defaultBrokerages'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        const ids = new Set<string>();
        snapshot.forEach((d) => ids.add(d.id));
        return ids;
    } catch (e) {
        console.warn('Could not read default brokerages for fleet', e);
        return new Set();
    }
}

/** Currently active (non-removed) brokerage assigned directly to this truck. */
async function fetchTruckAssignedBrokerageId(fleetId: string, truckId: string): Promise<string | null> {
    if (!fleetId || !truckId) return null;
    try {
        const q = query(
            collection(db, 'fleets', fleetId, 'Trucks', truckId, 'brokerages'),
            where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return snapshot.docs[0].id;
    } catch (e) {
        console.warn('Could not read truck-assigned brokerage', e);
        return null;
    }
}

/** Mark a brokerage as an active default for a fleet (writes both mirrors). */

async function setBrokerageDefaultForFleet(
    brokerageId: string,
    brokerageName: string,
    fleetId: string,
    fleetName: string,
    brokerToken?: string
): Promise<void> {

    try {
        const batch = writeBatch(db);
        const addedAt = new Date().toISOString();

        const brokerageFleetRef = doc(
            db,
            "brokerages",
            brokerageId,
            "fleets",
            fleetId
        );

        batch.set(brokerageFleetRef, {
            fleetId,
            fleetName,
            status: "active",
            addedAt,
        });


        const fleetDefaultRef = doc(
            db,
            "fleets",
            fleetId,
            "defaultBrokerages",
            brokerageId
        );

        batch.set(fleetDefaultRef, {
            brokerageId,
            brokerageName,
            status: "active",
            addedAt,
        });


        await batch.commit();


        ToastAndroid.show(
            "Brokerage added successfully",
            ToastAndroid.SHORT
        );


        if (brokerToken) {
            try {

                await sendUserNotification(
                    brokerToken,
                    "Default Partnership Added 🚛",
                    `${fleetName} added your brokerage as a default partner`,
                    {
                        pathname: "/Brokerage/Fleets",
                        params: {
                            fleetId,
                        },
                    },
                    {
                        type: "default_brokerage_added",
                        fleetId,
                        brokerageId,
                    }
                );

            } catch (error) {

                Alert.alert(
                    "Notification Failed",
                    "Brokerage was added but notification could not be sent."
                );

            }

        } else {

            console.warn(
                "No brokerage push token found"
            );

        }


    } catch (error) {

        ToastAndroid.show(
            "Failed to add brokerage",
            ToastAndroid.SHORT
        );

        throw error;
    }
}
/**
 * Soft-remove a brokerage's default status for a fleet in both mirrors.
 * Docs are kept, never deleted, and stamped with a reason + removedAt.
 */
async function removeBrokerageDefaultForFleet(
    brokerageId: string,
    brokerageName: string,
    fleetId: string,
    fleetName: string,
    reason: string,
    brokerToken?: string
): Promise<void> {

    try {
        const batch = writeBatch(db);
        const removedAt = new Date().toISOString();

        const brokerageFleetRef = doc(
            db,
            "brokerages",
            brokerageId,
            "fleets",
            fleetId
        );

        batch.set(
            brokerageFleetRef,
            {
                fleetId,
                fleetName,
                status: "removed",
                reason,
                removedAt
            },
            { merge: true }
        );


        const fleetDefaultRef = doc(
            db,
            "fleets",
            fleetId,
            "defaultBrokerages",
            brokerageId
        );

        batch.set(
            fleetDefaultRef,
            {
                brokerageId,
                brokerageName,
                status: "removed",
                reason,
                removedAt
            },
            { merge: true }
        );


        await batch.commit();


        ToastAndroid.show(
            "Brokerage removed from defaults",
            ToastAndroid.SHORT
        );


        if (brokerToken) {
            try {
                await sendUserNotification(
                    brokerToken,
                    "Default Partnership Removed",
                    `${fleetName} removed your brokerage as a default partner`,
                    {
                        pathname: "/Brokerage/Fleets",
                    },
                    {
                        type: "default_brokerage_removed",
                        fleetId,
                        brokerageId,
                    }
                );

            } catch (error) {
                Alert.alert(
                    "Notification Failed",
                    "Brokerage was removed but notification could not be sent."
                );
            }

        } else {
            console.warn(
                "No brokerage push token found"
            );
        }


    } catch (error) {

        ToastAndroid.show(
            "Failed to remove brokerage",
            ToastAndroid.SHORT
        );

        throw error;
    }
}

/** Assign a (non-default) brokerage directly to a truck. */
async function assignTruckBrokerage(
    truckId: string,
    brokerageId: string,
    brokerageName: string,
    brokerToken: string,
    fleetId: string,
    fleetName: string,
    truckName: string,
    truckType: string,
    cargoArea: string,
    capacity: string,
    numberPlate: string,
    operatingLocations: string[],
    imageUrl: string,
    truckAssigments: any,
): Promise<void> {
    const batch = writeBatch(db);
    const assignedAt = new Date().toISOString();
 
    
    // fleets/{fleetId}/trucks/{truckId}/brokerages/{brokerageId}
    const truckAssignmentRef = doc(db, 'fleets', fleetId, 'Trucks', truckId, 'brokerages', brokerageId);
    batch.set(truckAssignmentRef, {
        brokerageId,
        brokerageName,
        fleetId,
        fleetName,
        status: 'active',
        assignedAt,
    });

    // brokerages/{brokerageId}/trucks/{truckId}
    const brokerageTruckRef = doc(db, 'brokerages', brokerageId, 'Trucks', truckId);
    batch.set(brokerageTruckRef, {
        brokerageId,
        brokerageName,
        fleetId,
        fleetName,
        truckId,
        truckName,
        truckType,
        cargoArea,
        truckCapacity: capacity,
        numberPlate,
       locations:  operatingLocations,
        status: 'active',
        assignedAt,
        timeStamp: serverTimestamp(),
        imageUrl: imageUrl.replace("/o/Trucks/", "/o/Trucks%2F"),
        accType: "Broker",
        assignments: truckAssigments ,
        approvalStatus :'approved' ,
    });

    await batch.commit();

    ToastAndroid.show(
        "Truck assigned successfully 🚛",
        ToastAndroid.SHORT
    );


    if (brokerToken) {
        await sendUserNotification(
            brokerToken,
            'New Truck Access 🚛',
            `${truckName} has been shared with your brokerage`,
            {
                pathname: '/Brokerage/TruckDetails',
                params: { truckId },
            },
            {
                type: 'truck_access',
                truckId,
                brokerageId,
            }
        );
    } else {
        console.warn('⚠️ No expoPushToken found for brokerage, skipping notification');
    }
}

/**
 * Soft-remove a truck's assignment to a brokerage. Records are kept, never
 * deleted, and stamped with a reason + removedAt.
 */
async function unassignTruckBrokerage(
    fleetId: string,
    truckId: string,
    brokerageId: string,
    reason: string,
    truckName: string,
    brokerToken?: string
): Promise<void> {
    try {
        const batch = writeBatch(db);
        const removedAt = new Date().toISOString();

        const truckAssignmentRef = doc(
            db,
            "fleets",
            fleetId,
            "Trucks",
            truckId,
            "brokerages",
            brokerageId
        );

        batch.set(
            truckAssignmentRef,
            {
                status: "removed",
                reason,
                removedAt,
            },
            { merge: true }
        );


        const brokerageTruckRef = doc(
            db,
            "brokerages",
            brokerageId,
            "Trucks",
            truckId
        );

        batch.set(
            brokerageTruckRef,
            {
                status: "removed",
                reason,
                removedAt,
            },
            { merge: true }
        );


        await batch.commit();


        ToastAndroid.show(
            "Truck access removed",
            ToastAndroid.SHORT
        );


        if (brokerToken) {
            try {
                await sendUserNotification(
                    brokerToken,
                    "Truck Access Removed 🚛",
                    `${truckName} is no longer available in your brokerage`,
                    {
                        pathname: "/Brokerage/Trucks",
                    },
                    {
                        type: "truck_access_removed",
                        truckId,
                        brokerageId,
                    }
                );

            } catch (error) {
                Alert.alert(
                    "Notification Failed",
                    "Access was removed but the brokerage was not notified."
                );
            }
        }

    } catch (error) {
        ToastAndroid.show(
            "Failed to remove truck access",
            ToastAndroid.SHORT
        );

        throw error;
    }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseLocations(value?: string | string[]): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
}

function formatLocation(location?: SelectLocationProp): string {
    if (!location) return '';
    const description = location.description;
    // Ignore plus codes / short Google generated addresses
    const hasPlusCode = /^[A-Z0-9]+\+[A-Z0-9]+/.test(description ?? '');
    if (description && !hasPlusCode) return description;
    return `${location.city}, ${location.country}`;
}

// -----------------------------------------------------------------------------
// Truck confirmation card (2x2 grid, locations shown full width below)
// -----------------------------------------------------------------------------

interface TruckInfoCellProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    muted: string;
    text: string;
}

const TruckInfoCell: React.FC<TruckInfoCellProps> = ({ icon, label, value, muted, text }) => (
    <View style={styles.infoCell}>
        <View style={styles.infoCellHeader}>
            <Ionicons name={icon} size={wp(3.4)} color={muted} />
            <ThemedText style={[styles.infoLabel, { color: muted }]} numberOfLines={1}>
                {label}
            </ThemedText>
        </View>
        <ThemedText style={[styles.infoValue, { color: text }]} numberOfLines={1}>
            {value || '--'}
        </ThemedText>
    </View>
);

interface TruckCardProps {
    truckName: string;
    numberPlate: string;
    truckType: string;
    cargoArea: string;
    capacity: string;
    operatingLocations: string[];
    accent: string;
    backgroundLight: string;
    border: string;
    muted: string;
    text: string;
}

const TruckCard: React.FC<TruckCardProps> = ({
    truckName,
    numberPlate,
    truckType,
    cargoArea,
    capacity,
    operatingLocations,
    accent,
    backgroundLight,
    border,
    muted,
    text,
}) => (
    <View style={[styles.truckCard, { backgroundColor: backgroundLight, borderColor: border }]}>
        <View style={styles.truckCardHeader}>
            <View style={[styles.truckIconWrap, { backgroundColor: accent }]}>
                <Ionicons name="bus-outline" size={wp(5.5)} color="white" />
            </View>
            <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={styles.truckName}>
                    {truckName}
                </ThemedText>
                <ThemedText style={[styles.truckPlate, { color: muted }]}>{numberPlate || '--'}</ThemedText>
            </View>
        </View>

        <View style={styles.infoGridRow}>
            <TruckInfoCell icon="cube-outline" label="Truck type" value={truckType} muted={muted} text={text} />
            <TruckInfoCell icon="layers-outline" label="Cargo area" value={cargoArea} muted={muted} text={text} />
            <TruckInfoCell icon="speedometer-outline" label="Capacity" value={capacity} muted={muted} text={text} />
        </View>

        <View style={[styles.locationsBlock, { borderTopColor: border }]}>
            <View style={styles.locationsHeaderRow}>
                <Ionicons name="map-outline" size={wp(4)} color={muted} />
                <ThemedText style={[styles.infoLabel, { color: muted, marginLeft: wp(1.5) }]}>
                    Operating locations
                </ThemedText>
            </View>
            <View style={styles.locationChipsRow}>
                {operatingLocations.length ? (
                    operatingLocations.map((loc) => (
                        <View key={loc} style={[styles.locationChip, { borderColor: border }]}>
                            <ThemedText style={[styles.locationChipText, { color: text }]}>{loc}</ThemedText>
                        </View>
                    ))
                ) : (
                    <ThemedText style={[styles.infoValue, { color: text }]}>--</ThemedText>
                )}
            </View>
        </View>
    </View>
);

// -----------------------------------------------------------------------------
// Mode switcher
// -----------------------------------------------------------------------------

interface ModeSwitchProps {
    mode: Mode;
    onChange: (mode: Mode) => void;
    accent: string;
    coolGray: string;
}

const ModeSwitch: React.FC<ModeSwitchProps> = ({ mode, onChange, accent, coolGray }) => (
    <View style={[styles.modeSwitch, { backgroundColor: coolGray }]}>
        <TouchableOpacity
            style={[styles.modeOption, mode === 'other' && { backgroundColor: accent }]}
            onPress={() => onChange('other')}
        >
            <Ionicons name="business-outline" size={wp(4)} color={mode === 'other' ? 'white' : accent} />
            <ThemedText style={{ color: mode === 'other' ? 'white' : accent, fontWeight: '700', fontSize: wp(3.3) }}>
                Other Brokers
            </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.modeOption, mode === 'default' && { backgroundColor: accent }]}
            onPress={() => onChange('default')}
        >
            <Ionicons name="star-outline" size={wp(4)} color={mode === 'default' ? 'white' : accent} />
            <ThemedText style={{ color: mode === 'default' ? 'white' : accent, fontWeight: '700', fontSize: wp(3.3) }}>
                Default Brokers
            </ThemedText>
        </TouchableOpacity>
    </View>
);

// -----------------------------------------------------------------------------
// Row: select a single "other" brokerage for this truck
// -----------------------------------------------------------------------------

interface SelectableBrokerageRowProps {
    brokerage: Brokerage;
    selected: boolean;
    onPress: () => void;
    accent: string;
    backgroundLight: string;
    border: string;
    muted: string;
}

const SelectableBrokerageRow: React.FC<SelectableBrokerageRowProps> = ({
    brokerage,
    selected,
    onPress,
    accent,
    backgroundLight,
    border,
    muted,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.card,
                    {
                        backgroundColor: backgroundLight,
                        borderColor: selected ? accent : border,
                        borderWidth: selected ? 2 : 1,
                    },
                ]}
            >
                <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={wp(5.5)}
                    color={selected ? accent : muted}
                    style={{ marginRight: wp(3) }}
                />

                <View style={styles.cardLeft}>
                    <ThemedText type="defaultSemiBold" style={styles.cardName}>
                        {brokerage.name}
                    </ThemedText>
                    <View style={styles.tagRow}>
                        <View style={[styles.tag, { borderColor: border }]}>
                            <ThemedText style={[styles.tagText, { color: muted }]}>{brokerage.brokerType}</ThemedText>
                        </View>
                        {!!brokerage.location && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={wp(3.4)} color={muted} />
                                <ThemedText style={[styles.tagText, { color: muted }]}>
                                    {formatLocation(brokerage.location)}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// -----------------------------------------------------------------------------
// Row: toggle a brokerage's default status for the fleet
// -----------------------------------------------------------------------------

interface DefaultToggleRowProps {
    brokerage: Brokerage;
    isDefault: boolean;
    onToggle: (next: boolean) => void;
    accent: string;
    backgroundLight: string;
    border: string;
    muted: string;
}

const DefaultToggleRow: React.FC<DefaultToggleRowProps> = ({
    brokerage,
    isDefault,
    onToggle,
    accent,
    backgroundLight,
    border,
    muted,
}) => {
    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: backgroundLight,
                    borderColor: isDefault ? accent : border,
                    borderWidth: isDefault ? 2 : 1,
                },
            ]}
        >
            <View style={styles.cardLeft}>
                <View style={styles.cardTopRow}>
                    <ThemedText type="defaultSemiBold" style={styles.cardName}>
                        {brokerage.name}
                    </ThemedText>
                    {isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: accent }]}>
                            <Ionicons name="star" size={wp(3)} color="white" />
                            <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                        </View>
                    )}
                </View>
                <View style={styles.tagRow}>
                    <View style={[styles.tag, { borderColor: border }]}>
                        <ThemedText style={[styles.tagText, { color: muted }]}>{brokerage.brokerType}</ThemedText>
                    </View>
                    {!!brokerage.location && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={wp(3.4)} color={muted} />
                            <ThemedText style={[styles.tagText, { color: muted }]}>
                                {formatLocation(brokerage.location)}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>

            <Switch
                value={isDefault}
                onValueChange={onToggle}
                trackColor={{ false: border, true: accent }}
                thumbColor="white"
            />
        </View>
    );
};

// -----------------------------------------------------------------------------
// Main screen
// -----------------------------------------------------------------------------

const AssignBrokerageScreen: React.FC = () => {
    const params = useLocalSearchParams() as unknown as TruckRouteParams;
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const fleetId = params.fleetId ?? 'default_fleet';
    const fleetName = params.fleetName ?? 'default_Fleet';
    const truckId = params.truckId ?? '';
    const truckName = params.truckName ?? 'Unnamed Truck';
    const truckType = params.truckType ?? '';
    const cargoArea = params.cargoArea ?? '';
    const capacity = params.capacity ?? '';
    const numberPlate = params.numberPlate ?? '';
    const operatingLocations = parseLocations(params.operaatingLocations);
    const imageUrl = params.imageUrl || ""
    const truckAssigments = params.truckAssigments || {}


   

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');
    const text = useThemeColor('text');

    const border = coolGray;
    const muted = icon;

    const [mode, setMode] = useState<Mode>('other');
    const [loading, setLoading] = useState(true);
    const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
    const [defaultBrokerageIds, setDefaultBrokerageIds] = useState<Set<string>>(new Set());

    const [query_, setQuery] = useState('');

    // The brokerage currently persisted as this truck's "other" assignment.
    const [assignedOtherId, setAssignedOtherId] = useState<string | null>(null);
    // The brokerage the user has selected in the UI (may differ until saved).
    const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);

    const listFade = useRef(new Animated.Value(0)).current;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch the brokerage list first — everything else depends on
            // knowing which ids to check, and we don't want a failure in
            // the default/assignment lookups to hide brokerages that did
            // load successfully.
            const all = await fetchAllBrokerages();
            setBrokerages(all);

            const [defaultIds, assignedId] = await Promise.all([
                fetchDefaultBrokerageIdsForFleet(fleetId),
                fetchTruckAssignedBrokerageId(fleetId, truckId),
            ]);
            setDefaultBrokerageIds(defaultIds);
            setAssignedOtherId(assignedId);
            setSelectedOtherId(assignedId);
        } catch (e) {
            console.error('Failed to load brokerages', e);
            Alert.alert('Error', 'Could not load brokerages. Please try again.');
        } finally {
            setLoading(false);
            Animated.timing(listFade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
        }
    }, [fleetId, truckId, listFade]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        // Reset transient UI state and re-fade the list whenever the tab changes.
        setQuery('');
        listFade.setValue(0);
        Animated.timing(listFade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    }, [mode, listFade]);

    const filtered = useMemo(() => {
        const q = query_.trim().toLowerCase();
        const source =
            mode === 'other' ? brokerages.filter((b) => !defaultBrokerageIds.has(b.id)) : brokerages;
        if (!q) return source;
        return source.filter((b) => b.name.toLowerCase().includes(q));
    }, [brokerages, query_, mode, defaultBrokerageIds]);

    const selectedOtherBrokerage = useMemo(
        () => brokerages.find((b) => b.id === selectedOtherId) ?? null,
        [brokerages, selectedOtherId]
    );

    const hasUnsavedOtherChange = selectedOtherId !== assignedOtherId;

    // ---- Default (fleet-wide) toggling ----------------------------------

    const handleToggleDefault = (brokerage: Brokerage, next: boolean) => {
        if (!next) {
            Alert.alert(
                'Remove default brokerage',
                `Remove "${brokerage.name}" from the fleet's default brokerages? It will no longer be auto-added to new trucks.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                            const previous = defaultBrokerageIds;
                            const nextIds = new Set(previous);
                            nextIds.delete(brokerage.id);
                            setDefaultBrokerageIds(nextIds);
                            try {
                                await removeBrokerageDefaultForFleet(
                                    brokerage.id,
                                    brokerage.name,
                                    fleetId,
                                    fleetName,
                                    'Manually removed by fleet manager',
                                    selectedOtherBrokerage?.expoPushToken
                                );
                            } catch (e) {
                                setDefaultBrokerageIds(previous);
                                Alert.alert('Error', 'Could not remove default brokerage. Please try again.');
                            }
                        },
                    },
                ]
            );
            return;
        }

        const previous = defaultBrokerageIds;
        const nextIds = new Set(previous);
        nextIds.add(brokerage.id);
        setDefaultBrokerageIds(nextIds);
        setBrokerageDefaultForFleet(brokerage.id, brokerage.name, fleetId, fleetName ,selectedOtherBrokerage?.expoPushToken).catch(() => {
            setDefaultBrokerageIds(previous);
            Alert.alert('Error', 'Could not set default brokerage. Please try again.');
        });
    };

    // ---- Truck ("other") assignment --------------------------------------

    const handleSaveOther = async () => {

        if (!hasUnsavedOtherChange) {
            router.back();
            return;
        }

        setSaving(true);
        try {
            // Was there a previous assignment being replaced or cleared?
            if (assignedOtherId) {
                const reason = selectedOtherId
                    ? 'Reassigned to a different brokerage'
                    : 'Removed from truck by fleet manager';

                await unassignTruckBrokerage(
                    fleetId,
                    truckId,
                    assignedOtherId,
                    reason,
                    truckName,
                    selectedOtherBrokerage?.expoPushToken
                );
            }

            if (selectedOtherBrokerage) {
                await assignTruckBrokerage(
                    truckId,
                    selectedOtherBrokerage.id,
                    selectedOtherBrokerage.name,
                    selectedOtherBrokerage.expoPushToken,
                    fleetId,
                    fleetName,
                    truckName,
                    truckType,
                    cargoArea,
                    capacity,
                    numberPlate,
                    operatingLocations,
                    imageUrl,
                    truckAssigments,
                );
            }

            router.back();
        } catch (e) {
            Alert.alert('Error', 'Could not save brokerage assignment. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + wp(2) }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-back" size={wp(6)} color={text} />
                    </TouchableOpacity>
                    <View style={styles.headerTextGroup}>
                        <ThemedText type="title" style={styles.headerTitle}>
                            Assign Brokerage
                        </ThemedText>
                        <ThemedText style={[styles.headerSubtitle, { color: muted }]}>
                            {mode === 'other' ? 'Select a brokerage for this truck' : 'Manage fleet default brokerages'}
                        </ThemedText>
                    </View>
                    <View style={styles.backButton} />
                </View>

                <ModeSwitch mode={mode} onChange={setMode} accent={accent} coolGray={backgroundLight} />

                {mode === 'other' && (
                    <TruckCard
                        truckName={truckName}
                        numberPlate={numberPlate}
                        truckType={truckType}
                        cargoArea={cargoArea}
                        capacity={capacity}
                        operatingLocations={operatingLocations}
                        accent={accent}
                        backgroundLight={backgroundLight}
                        border={border}
                        muted={muted}
                        text={text}
                    />
                )}

                {/* Search */}
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={wp(4.6)} color={muted} style={styles.searchIcon} />
                    <Input
                        placeholder={
                            mode === 'other' ? 'Search brokerage by name…' : 'Search brokerages to set as default…'
                        }
                        value={query_}
                        onChangeText={setQuery}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            {/* Body */}
            {loading ? (
                <View style={styles.centerFill}>
                    <ActivityIndicator size="large" color={accent} />
                    <ThemedText style={[styles.loadingText, { color: muted }]}>Loading brokerages…</ThemedText>
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.centerFill}>
                    <Ionicons name="business-outline" size={wp(12)} color={muted} />
                    <ThemedText style={[styles.emptyTitle, { color: text }]}>No brokerages found</ThemedText>
                    <ThemedText style={[styles.emptySubtitle, { color: muted }]}>
                        Try a different search.
                    </ThemedText>
                </View>
            ) : (
                <Animated.View style={{ flex: 1, opacity: listFade }}>
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) =>
                            mode === 'other' ? (
                                <SelectableBrokerageRow
                                    brokerage={item}
                                    selected={item.id === selectedOtherId}
                                    onPress={() => setSelectedOtherId((prev) => (prev === item.id ? null : item.id))}
                                    accent={accent}
                                    backgroundLight={backgroundLight}
                                    border={border}
                                    muted={muted}
                                />
                            ) : (
                                <DefaultToggleRow
                                    brokerage={item}
                                    isDefault={defaultBrokerageIds.has(item.id)}
                                    onToggle={(next) => handleToggleDefault(item, next)}
                                    accent={accent}
                                    backgroundLight={backgroundLight}
                                    border={border}
                                    muted={muted}
                                />
                            )
                        }
                    />
                </Animated.View>
            )}

            {/* Bottom action bar */}
            {!loading && (
                <View
                    style={[
                        styles.bottomBar,
                        { backgroundColor: backgroundLight, paddingBottom: insets.bottom + wp(3), borderTopColor: border },
                    ]}
                >
                    {mode === 'other' ? (
                        <TouchableOpacity
                            style={[
                                styles.assignButton,
                                { backgroundColor: accent, opacity: !saving && hasUnsavedOtherChange ? 1 : 0.45 },
                            ]}
                            disabled={!hasUnsavedOtherChange || saving}
                            onPress={handleSaveOther}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText style={styles.assignButtonText}>
                                    {selectedOtherBrokerage
                                        ? `Assign ${selectedOtherBrokerage.name}`
                                        : assignedOtherId
                                            ? 'Remove Assignment'
                                            : 'Assign Brokerage'}
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.assignButton, { backgroundColor: accent }]} onPress={() => router.back()}>
                            <ThemedText style={styles.assignButtonText}>Done</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        paddingHorizontal: wp(4),
        paddingBottom: wp(3),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    backButton: {
        width: wp(9),
        height: wp(9),
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTextGroup: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: wp(3.3),
        marginTop: wp(0.5),
        textAlign: 'center',
    },
    modeSwitch: {
        flexDirection: 'row',
        borderRadius: wp(3),
        padding: wp(1),
        marginBottom: wp(3),
        gap: wp(1),
    },
    modeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(1.5),
        paddingVertical: wp(2.4),
        borderRadius: wp(2.5),
    },
    truckCard: {
        borderWidth: 1,
        borderRadius: wp(3),
        padding: wp(3),
        marginBottom: wp(2.5),
    },
    truckCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(2.5),
        gap: wp(2.5),
    },
    truckIconWrap: {
        width: wp(8.5),
        height: wp(8.5),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    truckName: {
        fontSize: wp(3.8),
    },
    truckPlate: {
        fontSize: wp(2.9),
        marginTop: wp(0.3),
        fontWeight: '600',
    },
    infoGridRow: {
        flexDirection: 'row',
        gap: wp(2),
        marginBottom: wp(2),
    },
    infoCell: {
        flex: 1,
        gap: wp(0.5),
    },
    infoCellHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
    },
    infoLabel: {
        fontSize: wp(2.5),
        flexShrink: 1,
    },
    infoValue: {
        fontSize: wp(3.1),
        fontWeight: '600',
    },
    locationsBlock: {
        borderTopWidth: 1,
        paddingTop: wp(2),
        marginTop: wp(0.5),
    },
    locationsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1.5),
    },
    locationChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(1.5),
    },
    locationChip: {
        borderWidth: 1,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(2.2),
        paddingVertical: wp(0.7),
    },
    locationChipText: {
        fontSize: wp(2.8),
        fontWeight: '600',
    },
    searchWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: wp(3.5),
        zIndex: 1,
    },
    searchInput: {
        paddingLeft: wp(10),
    },
    listContent: {
        paddingHorizontal: wp(4),
        paddingTop: wp(1),
        paddingBottom: hp(12),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: wp(3.5),
        padding: wp(4),
        marginBottom: wp(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardLeft: {
        flex: 1,
        gap: wp(1.5),
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardName: {
        fontSize: wp(4.1),
        flexShrink: 1,
        marginRight: wp(2),
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
        paddingHorizontal: wp(2.2),
        paddingVertical: wp(0.8),
        borderRadius: wp(4),
    },
    defaultBadgeText: {
        color: 'white',
        fontSize: wp(2.8),
        fontWeight: '700',
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2.5),
        flexWrap: 'wrap',
    },
    tag: {
        borderWidth: 1,
        borderRadius: wp(3),
        paddingHorizontal: wp(2.4),
        paddingVertical: wp(0.8),
    },
    tagText: {
        fontSize: wp(3),
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
    },
    centerFill: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(8),
        gap: wp(2),
    },
    loadingText: {
        fontSize: wp(3.4),
        marginTop: wp(1),
    },
    emptyTitle: {
        fontSize: wp(4.4),
        fontWeight: '700',
        marginTop: wp(2),
    },
    emptySubtitle: {
        fontSize: wp(3.3),
        textAlign: 'center',
        marginBottom: wp(2),
    },
    bottomBar: {
        borderTopWidth: 1,
        paddingHorizontal: wp(4),
        paddingTop: wp(3),
    },
    assignButton: {
        paddingVertical: wp(4),
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
    },
    assignButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: wp(4),
    },
});

export default AssignBrokerageScreen;
