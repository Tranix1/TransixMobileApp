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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import Input from '@/components/Input';
import { ThemedText } from '@/components/ThemedText';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Brokerage {
    id: string;
    name: string;
    type: 'Local' | 'International' | 'Partner' | string;
    location?: string;
    fleetId: string;
    isDefault: boolean;
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
}

type Mode = 'other' | 'default';

// -----------------------------------------------------------------------------
// Data layer (swap the body of these for real Firestore/API calls)
// -----------------------------------------------------------------------------

async function fetchBrokeragesByFleet(fleetId: string): Promise<Brokerage[]> {
    // TODO: replace with real query, e.g.
    // const snap = await firestore().collection('brokerages').where('fleetId', '==', fleetId).get();
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [
        { id: 'brk_1', name: 'Atlas Freight Partners', type: 'International', location: 'Durban, ZA', fleetId, isDefault: true },
        { id: 'brk_2', name: 'Karoo Logistics', type: 'Local', location: 'Bloemfontein, ZA', fleetId, isDefault: true },
        { id: 'brk_3', name: 'Continental Cargo Co.', type: 'Partner', location: 'Gaborone, BW', fleetId, isDefault: false },
        { id: 'brk_4', name: 'Savanna Route Brokers', type: 'Local', location: 'Harare, ZW', fleetId, isDefault: false },
    ];
}

async function fetchTruckAssignedBrokerageId(truckId: string): Promise<string | null> {
    // TODO: replace with real fetch of this truck's currently assigned "other" brokerage.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return null;
}

async function createBrokerage(fleetId: string, name: string, type: string, isDefault: boolean): Promise<Brokerage> {
    // TODO: replace with real create call.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: `brk_${Date.now()}`, name, type, fleetId, isDefault };
}

async function setBrokerageDefault(fleetId: string, brokerageId: string, isDefault: boolean): Promise<void> {
    // TODO: replace with real update, e.g.
    // firestore().collection('brokerages').doc(brokerageId).update({ isDefault })
    await new Promise((resolve) => setTimeout(resolve, 300));
}

async function saveTruckBrokerage(truckId: string, brokerageId: string): Promise<void> {
    // TODO: replace with real update call, e.g.
    // await firestore().collection('trucks').doc(truckId).update({ brokerageId });
    await new Promise((resolve) => setTimeout(resolve, 500));
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
                            <ThemedText style={[styles.tagText, { color: muted }]}>{brokerage.type}</ThemedText>
                        </View>
                        {!!brokerage.location && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={wp(3.4)} color={muted} />
                                <ThemedText style={[styles.tagText, { color: muted }]}>{brokerage.location}</ThemedText>
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
    onToggle: (next: boolean) => void;
    accent: string;
    backgroundLight: string;
    border: string;
    muted: string;
}

const DefaultToggleRow: React.FC<DefaultToggleRowProps> = ({
    brokerage,
    onToggle,
    accent,
    backgroundLight,
    border,
    muted,
}) => (
    <View
        style={[
            styles.card,
            {
                backgroundColor: backgroundLight,
                borderColor: brokerage.isDefault ? accent : border,
                borderWidth: brokerage.isDefault ? 2 : 1,
            },
        ]}
    >
        <View style={styles.cardLeft}>
            <View style={styles.cardTopRow}>
                <ThemedText type="defaultSemiBold" style={styles.cardName}>
                    {brokerage.name}
                </ThemedText>
                {brokerage.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: accent }]}>
                        <Ionicons name="star" size={wp(3)} color="white" />
                        <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                    </View>
                )}
            </View>
            <View style={styles.tagRow}>
                <View style={[styles.tag, { borderColor: border }]}>
                    <ThemedText style={[styles.tagText, { color: muted }]}>{brokerage.type}</ThemedText>
                </View>
                {!!brokerage.location && (
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={wp(3.4)} color={muted} />
                        <ThemedText style={[styles.tagText, { color: muted }]}>{brokerage.location}</ThemedText>
                    </View>
                )}
            </View>
        </View>

        <Switch
            value={brokerage.isDefault}
            onValueChange={onToggle}
            trackColor={{ false: border, true: accent }}
            thumbColor="white"
        />
    </View>
);

// -----------------------------------------------------------------------------
// Main screen
// -----------------------------------------------------------------------------

const AssignBrokerageScreen: React.FC = () => {
    const params = useLocalSearchParams() as unknown as TruckRouteParams;
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const truckId = params.truckId ?? '';
    const fleetId = params.fleetId ?? 'default_fleet';
    const truckName = params.truckName ?? 'Unnamed Truck';
    const truckType = params.truckType ?? '';
    const cargoArea = params.cargoArea ?? '';
    const capacity = params.capacity ?? '';
    const numberPlate = params.numberPlate ?? '';
    const operatingLocations = parseLocations(params.operaatingLocations);

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
    const [query, setQuery] = useState('');
    const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('Local');
    const [creating, setCreating] = useState(false);

    const listFade = useRef(new Animated.Value(0)).current;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const all = await fetchBrokeragesByFleet(fleetId);
            const assignedId = await fetchTruckAssignedBrokerageId(truckId);
            setBrokerages(all);
            setSelectedOtherId(assignedId);
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
        setShowCreate(false);
        listFade.setValue(0);
        Animated.timing(listFade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    }, [mode, listFade]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const source = mode === 'other' ? brokerages.filter((b) => !b.isDefault) : brokerages;
        if (!q) return source;
        return source.filter((b) => b.name.toLowerCase().includes(q));
    }, [brokerages, query, mode]);

    const selectedOtherBrokerage = useMemo(
        () => brokerages.find((b) => b.id === selectedOtherId) ?? null,
        [brokerages, selectedOtherId]
    );

    const handleToggleDefault = async (brokerage: Brokerage, next: boolean) => {
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
                            await setBrokerageDefault(fleetId, brokerage.id, false);
                            setBrokerages((prev) =>
                                prev.map((b) => (b.id === brokerage.id ? { ...b, isDefault: false } : b))
                            );
                        },
                    },
                ]
            );
            return;
        }
        await setBrokerageDefault(fleetId, brokerage.id, true);
        setBrokerages((prev) => prev.map((b) => (b.id === brokerage.id ? { ...b, isDefault: true } : b)));
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const created = await createBrokerage(fleetId, newName.trim(), newType, mode === 'default');
            setBrokerages((prev) => [created, ...prev]);
            if (mode === 'other') setSelectedOtherId(created.id);
            setShowCreate(false);
            setNewName('');
            setNewType('Local');
        } finally {
            setCreating(false);
        }
    };

    const handleSaveOther = async () => {
        if (!selectedOtherBrokerage) return;
        setSaving(true);
        try {
            await saveTruckBrokerage(truckId, selectedOtherBrokerage.id);
            router.back();
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

                <ModeSwitch mode={mode} onChange={setMode} accent={accent} coolGray={coolGray} />

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
                        value={query}
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
            ) : showCreate ? (
                <View style={styles.createForm}>
                    <ThemedText type="subtitle" style={styles.createFormTitle}>
                        New Brokerage
                    </ThemedText>

                    <View style={styles.fieldRow}>
                        <ThemedText type="tiny" style={styles.inputLabel}>
                            Brokerage name
                        </ThemedText>
                        <Input placeholder="e.g. Atlas Freight Partners" value={newName} onChangeText={setNewName} />
                    </View>

                    <View style={styles.fieldRow}>
                        <ThemedText type="tiny" style={styles.inputLabel}>
                            Type
                        </ThemedText>
                        <View style={styles.typeRow}>
                            {['Local', 'International', 'Partner'].map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setNewType(t)}
                                    style={[
                                        styles.typeChip,
                                        {
                                            backgroundColor: newType === t ? accent : 'transparent',
                                            borderColor: newType === t ? accent : border,
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        style={{
                                            color: newType === t ? 'white' : muted,
                                            fontWeight: '600',
                                            fontSize: wp(3.3),
                                        }}
                                    >
                                        {t}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {mode === 'default' && (
                        <View style={[styles.createDefaultNotice, { borderColor: border }]}>
                            <Ionicons name="star-outline" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.createDefaultNoticeText, { color: muted }]}>
                                This brokerage will be added as a fleet default and auto-assigned to new trucks.
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.createFormButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setShowCreate(false);
                                setNewName('');
                                setNewType('Local');
                            }}
                        >
                            <ThemedText style={styles.buttonTextWhite}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: accent, opacity: newName.trim() && !creating ? 1 : 0.5 },
                            ]}
                            onPress={handleCreate}
                            disabled={!newName.trim() || creating}
                        >
                            {creating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText style={styles.buttonTextWhite}>
                                    {mode === 'other' ? 'Create & Assign' : 'Create & Set Default'}
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.centerFill}>
                    <Ionicons name="business-outline" size={wp(12)} color={muted} />
                    <ThemedText style={[styles.emptyTitle, { color: text }]}>No brokerages found</ThemedText>
                    <ThemedText style={[styles.emptySubtitle, { color: muted }]}>
                        Try a different search, or add one for this fleet.
                    </ThemedText>
                    <TouchableOpacity style={[styles.createButton, { backgroundColor: accent }]} onPress={() => setShowCreate(true)}>
                        <Ionicons name="add" size={wp(4.6)} color="white" />
                        <ThemedText style={styles.createButtonText}>Create New Brokerage</ThemedText>
                    </TouchableOpacity>
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
                                    onToggle={(next) => handleToggleDefault(item, next)}
                                    accent={accent}
                                    backgroundLight={backgroundLight}
                                    border={border}
                                    muted={muted}
                                />
                            )
                        }
                        ListFooterComponent={
                            <TouchableOpacity style={styles.addAnotherRow} onPress={() => setShowCreate(true)}>
                                <Ionicons name="add-circle-outline" size={wp(5)} color={accent} />
                                <ThemedText style={[styles.addAnotherText, { color: accent }]}>
                                    Create New Brokerage
                                </ThemedText>
                            </TouchableOpacity>
                        }
                    />
                </Animated.View>
            )}

            {/* Bottom action bar */}
            {!showCreate && !loading && (
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
                                { backgroundColor: accent, opacity: selectedOtherBrokerage && !saving ? 1 : 0.45 },
                            ]}
                            disabled={!selectedOtherBrokerage || saving}
                            onPress={handleSaveOther}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <ThemedText style={styles.assignButtonText}>
                                    {selectedOtherBrokerage
                                        ? `Assign ${selectedOtherBrokerage.name}`
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
    addAnotherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2),
        paddingVertical: wp(4),
    },
    addAnotherText: {
        fontWeight: '700',
        fontSize: wp(3.6),
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
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        paddingHorizontal: wp(5),
        paddingVertical: wp(3),
        borderRadius: wp(3),
        marginTop: wp(2),
    },
    createButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: wp(3.6),
    },
    createForm: {
        paddingHorizontal: wp(4),
        paddingTop: wp(2),
        gap: wp(2),
    },
    createFormTitle: {
        marginBottom: wp(1),
    },
    fieldRow: {
        gap: wp(1),
        marginBottom: wp(3),
    },
    inputLabel: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    typeRow: {
        flexDirection: 'row',
        gap: wp(2.5),
    },
    typeChip: {
        borderWidth: 1.5,
        borderRadius: wp(3),
        paddingHorizontal: wp(3.5),
        paddingVertical: wp(2),
    },
    createDefaultNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        borderWidth: 1,
        borderRadius: wp(2.5),
        padding: wp(3),
        marginBottom: wp(1),
    },
    createDefaultNoticeText: {
        flex: 1,
        fontSize: wp(3),
        lineHeight: wp(4),
    },
    createFormButtons: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(2),
    },
    button: {
        flex: 1,
        paddingVertical: wp(3.4),
        borderRadius: wp(2.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    buttonTextWhite: {
        color: 'white',
        fontWeight: '700',
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
