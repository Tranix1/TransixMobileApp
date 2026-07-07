import React, { useState } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Pressable,
    StyleSheet,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import Input from './Input';
import Button from './Button';
import { GooglePlaceAutoCompleteComp } from './GooglePlaceAutoComplete';
import { LocationPicker } from './LocationPicker';
import { SelectLocationProp } from '@/types/types';

interface TruckAvailabilityModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: TruckAvailabilityData) => void;
}

export interface TruckAvailabilityData {
    status: 'AVAILABLE' | 'OFFLINE';

    offlineReason?: 'MAINTENANCE' | 'CONTRACTED' | 'PARKED' | 'SUSPENDED';

    currentLocation: SelectLocationProp | null; // ALWAYS from tracker

    destination: SelectLocationProp | null;

    matchType: 'SAME_DESTINATION' | 'ALONG_ROUTE' | 'NEARBY';

    additionalInfo: string;

    updatedAt?: any;
}

const TruckAvailabilityModal: React.FC<TruckAvailabilityModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const backgroundLight = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    // STATUS
    const [status, setStatus] = useState<'AVAILABLE' | 'OFFLINE'>('AVAILABLE');

    // OFFLINE REASON
    const [offlineReason, setOfflineReason] =
        useState<'MAINTENANCE' | 'CONTRACTED' | 'PARKED' | 'SUSPENDED' | null>(null);

    // DESTINATION
    const [destination, setDestination] = useState<SelectLocationProp | null>(null);

    // MATCH TYPE
    const [matchType, setMatchType] =
        useState<'SAME_DESTINATION' | 'ALONG_ROUTE' | 'NEARBY'>('ALONG_ROUTE');

    const [additionalInfo, setAdditionalInfo] = useState('');

    // UI STATES
        const [dspDestination, setDspDestination] = useState(false);
        const [showMapPicker, setShowMapPicker] = useState(false);

    const handleSave = () => {
        const data: TruckAvailabilityData = {
            status,

            offlineReason: status === 'OFFLINE' ? offlineReason || 'PARKED' : undefined,

            currentLocation: null, // 🔥 ALWAYS FROM TRACKER (backend injects)

            destination,

            matchType,

            additionalInfo,
        };

        onSave(data);
        onClose();
    };

    const reset = () => {
        setStatus('AVAILABLE');
        setOfflineReason(null);
        setDestination(null);
        setMatchType('ALONG_ROUTE');
        setAdditionalInfo('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <Pressable style={styles.overlay} onPress={handleClose}>
                <BlurView intensity={90} style={styles.blur}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modal, { backgroundColor: backgroundLight }]}>
                            
                            {/* HEADER */}
                            <View style={styles.header}>
                                <ThemedText type="title">Truck Availability</ThemedText>

                                <TouchableOpacity onPress={handleClose}>
                                    <Ionicons name="close-circle" size={28} color={icon} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView>

                                {/* STATUS */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle">Status</ThemedText>

                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            style={[
                                                styles.btn,
                                                { backgroundColor: status === 'AVAILABLE' ? accent : coolGray },
                                            ]}
                                            onPress={() => setStatus('AVAILABLE')}
                                        >
                                            <ThemedText style={styles.btnText}>Available</ThemedText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.btn,
                                                { backgroundColor: status === 'OFFLINE' ? '#ff5252' : coolGray },
                                            ]}
                                            onPress={() => setStatus('OFFLINE')}
                                        >
                                            <ThemedText style={styles.btnText}>Offline</ThemedText>
                                        </TouchableOpacity>
                                    </View>

                                    {/* OFFLINE REASON */}
                                    {status === 'OFFLINE' && (
                                        <View style={{ marginTop: wp(3) }}>
                                            <ThemedText type="tiny">Reason for Offline</ThemedText>

                                            {['MAINTENANCE', 'CONTRACTED', 'PARKED', 'SUSPENDED'].map(
                                                (r) => (
                                                    <TouchableOpacity
                                                        key={r}
                                                        onPress={() => setOfflineReason(r as any)}
                                                        style={styles.radioRow}
                                                    >
                                                        <Ionicons
                                                            name={
                                                                offlineReason === r
                                                                    ? 'radio-button-on'
                                                                    : 'radio-button-off'
                                                            }
                                                            size={18}
                                                            color={accent}
                                                        />
                                                        <ThemedText style={{ marginLeft: 8 }}>
                                                            {r}
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                )
                                            )}
                                        </View>
                                    )}
                                </View>

                                  {status === 'AVAILABLE' && <View>        
                                {/* LOCATION (TRACKER ONLY) */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle">
                                        Current Location
                                    </ThemedText>

                                    <ThemedText style={{ color: coolGray }}>
                                        📍 Automatically tracked via GPS (not editable)
                                    </ThemedText>
                                </View>

                                {/* DESTINATION */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle">
                                        Next Destination (Optional)
                                    </ThemedText>

                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setDspDestination(true)}
                                    >
                                        <ThemedText>
                                            {destination?.description ||
                                                'Select destination'}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>

                                {/* MATCH TYPE */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle">Match Loads</ThemedText>

                                    {['SAME_DESTINATION', 'ALONG_ROUTE', 'NEARBY'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setMatchType(type as any)}
                                            style={styles.radioRow}
                                        >
                                            <Ionicons
                                                name={
                                                    matchType === type
                                                        ? 'radio-button-on'
                                                        : 'radio-button-off'
                                                }
                                                size={18}
                                                color={accent}
                                            />
                                            <ThemedText style={{ marginLeft: 8 }}>
                                                {type.replaceAll('_', ' ')}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                </View>}

                                {/* NOTES */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle">Notes</ThemedText>

                                    <Input
                                        placeholder="Optional notes..."
                                        value={additionalInfo}
                                        onChangeText={setAdditionalInfo}
                                        multiline
                                    />
                                </View>

                                <Button title="Save Availability" onPress={handleSave} />
                            </ScrollView>
                        </View>
                    </Pressable>
                </BlurView>
            </Pressable>

                    {/* DESTINATION PICKER ONLY */}
                    <GooglePlaceAutoCompleteComp
                        dspRoute={dspDestination}
                        setDspRoute={setDspDestination}
                        setRoute={setDestination}
                        topic="Select Destination"
                        setPickLocationOnMap={setShowMapPicker}
                    />

                    {showMapPicker && (
                        <LocationPicker
                            pickOriginLocation={null}
                            setPickOriginLocation={() => {}}
                            pickDestinationLoc={destination}
                            setPickDestinationLoc={setDestination}
                            setShowMap={setShowMapPicker}
                            dspShowMap={showMapPicker}
                            mode="single"
                        />
                    )}
        </Modal>
    );
};

export default TruckAvailabilityModal;
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    blur: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modal: {
        width: wp(92),
        maxHeight: hp(85),
        borderRadius: wp(4),
        padding: wp(4),
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4),
    },

    section: {
        marginBottom: wp(5),
    },

    row: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(2),
    },

    btn: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnText: {
        color: 'white',
        fontWeight: '600',
    },

        input: {
            marginTop: wp(2),
            padding: wp(3),
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: wp(2),
        },

    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(2),
        paddingVertical: wp(1),
    },
});
