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

interface TruckNotificationSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (settings: TruckNotificationSettings) => void;
    initialSettings?: Partial<TruckNotificationSettings>;
}

export interface TruckNotificationSettings {
    notificationsEnabled: boolean;
    notifyRoles: string[];
    minimumRate: number;
}

const DEFAULT_SETTINGS: TruckNotificationSettings = {
    notificationsEnabled: true,
    notifyRoles: ['driver', 'dispatcher'],
    minimumRate: 2,
};

const ROLE_OPTIONS: { key: string; label: string }[] = [
    { key: 'driver', label: 'Driver' },
    { key: 'dispatcher', label: 'Dispatcher' },
    { key: 'fleet_owner', label: 'Fleet Owner' },
];

const TruckNotificationSettingsModal: React.FC<TruckNotificationSettingsModalProps> = ({
    visible,
    onClose,
    onSave,
    initialSettings,
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const backgroundLight = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    const [settings, setSettings] = useState<TruckNotificationSettings>({
        ...DEFAULT_SETTINGS,
        ...initialSettings,
    });

    const update = <K extends keyof TruckNotificationSettings>(key: K, value: TruckNotificationSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const toggleRole = (role: string) => {
        setSettings(prev => ({
            ...prev,
            notifyRoles: prev.notifyRoles.includes(role)
                ? prev.notifyRoles.filter(r => r !== role)
                : [...prev.notifyRoles, role],
        }));
    };

    const resetForm = () => {
        setSettings({ ...DEFAULT_SETTINGS, ...initialSettings });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        onSave({
            notificationsEnabled: settings.notificationsEnabled,
            notifyRoles: settings.notifyRoles,
            minimumRate: settings.minimumRate,
        });
        onClose();
    };

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
                                {/* Section 1: Master toggle */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                                        Enable Notifications
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
                                        {/* Section 2: Roles */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Notify These Roles
                                            </ThemedText>

                                            <View style={styles.roleList}>
                                                {ROLE_OPTIONS.map((role) => {
                                                    const isSelected = settings.notifyRoles.includes(role.key);
                                                    return (
                                                        <TouchableOpacity
                                                            key={role.key}
                                                            style={[
                                                                styles.roleCard,
                                                                {
                                                                    backgroundColor: isSelected ? accent : coolGray,
                                                                },
                                                            ]}
                                                            onPress={() => toggleRole(role.key)}
                                                        >
                                                            <Ionicons
                                                                name={isSelected ? 'checkbox' : 'square-outline'}
                                                                size={wp(5.5)}
                                                                color="white"
                                                            />
                                                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                                                {role.label}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        {/* Section 3: Minimum Rate */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Minimum Rate
                                            </ThemedText>
                                            <View style={styles.fieldRow}>
                                                <ThemedText type="tiny" style={styles.inputLabel}>
                                                    Only notify this truck when the offered rate is at least this amount.
                                                </ThemedText>
                                                <Input
                                                    placeholder="1.70"
                                                    value={String(settings.minimumRate)}
                                                    onChangeText={(v) => update('minimumRate', Number(v) || 0)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}

                                {/* Action Buttons */}
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        onPress={handleClose}
                                        style={[styles.button, styles.cancelButton]}
                                    >
                                        <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Cancel</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        style={[styles.button, styles.saveButton]}
                                    >
                                        <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Save Settings</ThemedText>
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
    roleList: {
        gap: wp(3),
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        gap: wp(3),
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
});

export default TruckNotificationSettingsModal;
