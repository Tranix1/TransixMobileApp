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

interface TruckNotificationSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (settings: TruckNotificationSettings) => void;
    truckId: string;
    initialSettings?: Partial<TruckNotificationSettings>;
}

export interface TruckNotificationSettings {
    fuelEfficiency: number;            // km/L
    fuelPrice: number;                 // currency per L
    minimumProfitPercentage: number;   // %

    emptyReturnPercentage: number;     // 0-100, used for conservative notification calc
    loadedReturnPercentage: number;    // 0-100, informational / future use

    additionalDistanceBuffer: number;  // km

    notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: TruckNotificationSettings = {
    fuelEfficiency: 3,
    fuelPrice: 1.7,
    minimumProfitPercentage: 40,
    emptyReturnPercentage: 100,
    loadedReturnPercentage: 50,
    additionalDistanceBuffer: 50,
    notificationsEnabled: true,
};

const TruckNotificationSettingsModal: React.FC<TruckNotificationSettingsModalProps> = ({
    visible,
    onClose,
    onSave,
    truckId,
    initialSettings,
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    const [settings, setSettings] = useState<TruckNotificationSettings>({
        ...DEFAULT_SETTINGS,
        ...initialSettings,
    });

    const update = <K extends keyof TruckNotificationSettings>(key: K, value: TruckNotificationSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setSettings({ ...DEFAULT_SETTINGS, ...initialSettings });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    // Quick preview of what a 500km trip + 30km deadhead would look like with current settings,
    // just so the owner can see the effect of the numbers they're entering.
    const previewTripDistance = 500;
    const previewDeadhead = 30;
    const previewEmptyReturn = (previewTripDistance * settings.emptyReturnPercentage) / 100;
    const previewTotalDistance =
        previewDeadhead + previewTripDistance + previewEmptyReturn + settings.additionalDistanceBuffer;
    const previewFuelUsed = settings.fuelEfficiency > 0 ? previewTotalDistance / settings.fuelEfficiency : 0;
    const previewFuelCost = previewFuelUsed * settings.fuelPrice;

    return (
        <Modal transparent statusBarTranslucent visible={visible} animationType="fade">
            <Pressable onPress={handleClose} style={styles.modalOverlay}>
                <BlurView intensity={100} style={styles.blurContainer}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modalContent, { backgroundColor: backgroundLight }]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <ThemedText type="title" style={styles.title}>
                                    Notification Settings
                                </ThemedText>
                                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                    <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                                {/* Master toggle */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                                        Load Match Notifications
                                    </ThemedText>
                                    <View style={styles.toggleContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleOption,
                                                { backgroundColor: settings.notificationsEnabled ? accent : coolGray },
                                            ]}
                                            onPress={() => update('notificationsEnabled', true)}
                                        >
                                            <Ionicons name="notifications" size={wp(5)} color="white" />
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                                Enabled
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleOption,
                                                { backgroundColor: !settings.notificationsEnabled ? '#FF5252' : coolGray },
                                            ]}
                                            onPress={() => update('notificationsEnabled', false)}
                                        >
                                            <Ionicons name="notifications-off" size={wp(5)} color="white" />
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                                Disabled
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {settings.notificationsEnabled && (
                                    <>
                                        {/* Fuel economics */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Truck Fuel Economics
                                            </ThemedText>

                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Fuel Efficiency (km per liter)
                                                </ThemedText>
                                                <Input
                                                    placeholder="e.g. 3"
                                                    value={String(settings.fuelEfficiency)}
                                                    onChangeText={(v) => update('fuelEfficiency', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Fuel Price (per liter)
                                                </ThemedText>
                                                <Input
                                                    placeholder="e.g. 1.70"
                                                    value={String(settings.fuelPrice)}
                                                    onChangeText={(v) => update('fuelPrice', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Additional Distance Buffer (km)
                                                </ThemedText>
                                                <Input
                                                    placeholder="e.g. 50"
                                                    value={String(settings.additionalDistanceBuffer)}
                                                    onChangeText={(v) => update('additionalDistanceBuffer', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>

                                        {/* Profit threshold */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Minimum Profit Threshold
                                            </ThemedText>
                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Only notify me when profit is at least (%)
                                                </ThemedText>
                                                <Input
                                                    placeholder="e.g. 40"
                                                    value={String(settings.minimumProfitPercentage)}
                                                    onChangeText={(v) => update('minimumProfitPercentage', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>

                                        {/* Return trip assumptions */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Return Trip Assumptions
                                            </ThemedText>
                                            <ThemedText style={styles.helperText}>
                                                Used to estimate fuel cost for the trip back. Empty return is the
                                                conservative figure used for notifications; loaded return is informational
                                                until live tracking is in place.
                                            </ThemedText>

                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Empty Return Coverage (%)
                                                </ThemedText>
                                                <Input
                                                    placeholder="e.g. 100"
                                                    value={String(settings.emptyReturnPercentage)}
                                                    onChangeText={(v) => update('emptyReturnPercentage', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Loaded Return Expectation (%)
                                                </ThemedText>
                                                <Input
                                                    placeholder="e.g. 50"
                                                    value={String(settings.loadedReturnPercentage)}
                                                    onChangeText={(v) => update('loadedReturnPercentage', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>

                                        {/* Live preview */}
                                        <View style={[styles.routeInfo, { backgroundColor: backgroundLight }]}>
                                            <ThemedText style={[styles.infoText, { fontWeight: 'bold' }]}>
                                                Preview (500km trip, 30km deadhead)
                                            </ThemedText>
                                            <ThemedText style={styles.infoText}>
                                                Empty return distance: {previewEmptyReturn.toFixed(0)} km
                                            </ThemedText>
                                            <ThemedText style={styles.infoText}>
                                                Total distance: {previewTotalDistance.toFixed(0)} km
                                            </ThemedText>
                                            <ThemedText style={styles.infoText}>
                                                Estimated fuel cost: {previewFuelCost.toFixed(2)}
                                            </ThemedText>
                                        </View>
                                    </>
                                )}

                                {/* Action Buttons */}
                             

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        onPress={handleClose}
                                        style={[styles.button, styles.cancelButton]}
                                    >
                                        <ThemedText style={{color:"white",fontWeight:"bold"}}>Cancel</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        style={[styles.button, styles.saveButton]}
                                    >
                                        <ThemedText style={{color:"white",fontWeight:"bold"}}>Save Settings</ThemedText>
                                    </TouchableOpacity>
                                </View>



                            </ScrollView>
                        </View>
                    </Pressable>
                </BlurView>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: wp(90),
        maxHeight: hp(80),
        borderRadius: wp(4),
        padding: wp(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    title: {
        textAlign: 'center',
        flex: 1,
    },
    closeButton: {
        padding: wp(1),
    },
    scrollView: {
        maxHeight: hp(60),
    },
    section: {
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(3),
        fontWeight: 'bold',
    },
    helperText: {
        fontSize: wp(3.3),
        opacity: 0.6,
        marginBottom: wp(3),
        lineHeight: wp(4.2),
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: wp(3),
    },
    toggleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        gap: wp(2),
    },
    fieldRow: {
        gap: wp(1),
        marginBottom: wp(3),
    },
    inputLabel: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(4),
    },
    button: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    saveButton: {
        backgroundColor: '#007bff',
    },
    routeInfo: {
        padding: wp(4),
        borderRadius: wp(2),
        marginTop: wp(1),
        marginBottom: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    infoText: {
        fontSize: wp(3.5),
        fontWeight: '500',
        marginBottom: wp(1),
    },
});

export default TruckNotificationSettingsModal;