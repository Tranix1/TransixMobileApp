import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import AdminActionLogsViewer from '@/components/AdminActionLogsViewer';
import { useAuth } from '@/context/AuthContext';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

export default function ActionLogs() {
    const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
    const { user } = useAuth();
    const { isSuperAdmin } = useAdminPermissions();

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    // Check if user is super admin
    if (!isSuperAdmin()) {
        return (
            <ScreenWrapper>
                <Heading page='Access Denied' />
                <View style={styles.container}>
                    <View style={[styles.errorContainer, { backgroundColor: backgroundLight }]}>
                        <Ionicons name="shield-outline" size={wp(15)} color={icon} />
                        <ThemedText type="subtitle" style={styles.errorTitle}>
                            Access Denied
                        </ThemedText>
                        <ThemedText type="default" style={styles.errorMessage}>
                            This feature is only available to super administrators.
                        </ThemedText>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    const toggleViewMode = () => {
        setViewMode(viewMode === 'all' ? 'my' : 'all');
    };

    return (
        <ScreenWrapper>
            <Heading page='Admin Action Logs' />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                { backgroundColor: backgroundLight },
                                viewMode === 'all' && { backgroundColor: accent }
                            ]}
                            onPress={() => setViewMode('all')}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={[
                                    styles.toggleText,
                                    viewMode === 'all' && { color: 'white' }
                                ]}
                            >
                                All Actions
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                { backgroundColor: backgroundLight },
                                viewMode === 'my' && { backgroundColor: accent }
                            ]}
                            onPress={() => setViewMode('my')}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={[
                                    styles.toggleText,
                                    viewMode === 'my' && { color: 'white' }
                                ]}
                            >
                                My Actions
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.infoButton, { borderColor: accent }]}
                        onPress={() => {
                            Alert.alert(
                                'Admin Action Tracking',
                                'This feature tracks all admin actions including:\n\n• Truck approvals/declines\n• User account approvals\n• Load approvals/declines\n• Admin assignments\n• System edits\n\nEach action is logged with the admin\'s email and timestamp for accountability.',
                                [{ text: 'OK' }]
                            );
                        }}
                    >
                        <Ionicons name="information-circle-outline" size={wp(4)} color={accent} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: backgroundLight }]}>
                        <Ionicons name="list-outline" size={wp(5)} color={accent} />
                        <ThemedText type="subtitle">Action Logs</ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            {viewMode === 'all' ? 'All admin actions' : 'Your actions only'}
                        </ThemedText>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: backgroundLight }]}>
                        <Ionicons name="mail-outline" size={wp(5)} color={accent} />
                        <ThemedText type="subtitle">Email Tracking</ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            Admin email recorded
                        </ThemedText>
                    </View>
                </View>

                <AdminActionLogsViewer
                    adminId={viewMode === 'my' ? user?.uid : undefined}
                    limit={100}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: wp(2),
        padding: wp(1),
    },
    toggleButton: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2),
        borderRadius: wp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wp(20),
    },
    toggleText: {
        fontSize: wp(3.5),
    },
    infoButton: {
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: wp(3),
        marginBottom: wp(4),
    },
    statCard: {
        flex: 1,
        padding: wp(4),
        borderRadius: wp(3),
        alignItems: 'center',
        gap: wp(2),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(8),
        borderRadius: wp(3),
    },
    errorTitle: {
        marginTop: wp(4),
        marginBottom: wp(2),
        textAlign: 'center',
    },
    errorMessage: {
        textAlign: 'center',
        opacity: 0.7,
    },
});
