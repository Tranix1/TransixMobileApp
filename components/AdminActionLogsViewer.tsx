import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { getAdminActionLogs, getTargetActionLogs, AdminActionLog } from '@/Utilities/adminActionTracker';
import { formatDate } from '@/services/services';

interface AdminActionLogsViewerProps {
    adminId?: string;
    targetType?: string;
    targetId?: string;
    limit?: number;
}

const AdminActionLogsViewer: React.FC<AdminActionLogsViewerProps> = ({
    adminId,
    targetType,
    targetId,
    limit = 50
}) => {
    const [logs, setLogs] = useState<AdminActionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    useEffect(() => {
        loadLogs();
    }, [adminId, targetType, targetId]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            let logsData: AdminActionLog[] = [];

            if (targetType && targetId) {
                logsData = await getTargetActionLogs(targetType, targetId, limit);
            } else {
                logsData = await getAdminActionLogs(adminId, limit);
            }

            setLogs(logsData);
        } catch (error) {
            console.error('Error loading admin action logs:', error);
            Alert.alert('Error', 'Failed to load admin action logs');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLogs();
        setRefreshing(false);
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'approve_truck':
            case 'approve_load':
            case 'approve_user':
                return 'checkmark-circle';
            case 'decline_truck':
            case 'decline_load':
            case 'decline_user':
                return 'close-circle';
            case 'edit_truck':
            case 'edit_user':
            case 'edit_load':
                return 'create';
            case 'delete_truck':
            case 'delete_user':
            case 'delete_load':
                return 'trash';
            case 'assign_user':
                return 'person-add';
            case 'unassign_user':
                return 'person-remove';
            case 'add_admin':
                return 'shield-checkmark';
            case 'remove_admin':
                return 'shield-outline';
            default:
                return 'settings';
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('approve')) return '#4CAF50';
        if (action.includes('decline') || action.includes('delete')) return '#F44336';
        if (action.includes('edit')) return '#FF9800';
        if (action.includes('assign')) return '#2196F3';
        if (action.includes('admin')) return '#9C27B0';
        return accent;
    };

    const formatActionName = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderLogItem = ({ item }: { item: AdminActionLog }) => (
        <View style={[styles.logItem, { backgroundColor: backgroundLight }]}>
            <View style={styles.logHeader}>
                <View style={styles.actionContainer}>
                    <Ionicons
                        name={getActionIcon(item.action) as any}
                        size={wp(4)}
                        color={getActionColor(item.action)}
                    />
                    <View style={styles.actionInfo}>
                        <ThemedText type="defaultSemiBold" numberOfLines={1}>
                            {formatActionName(item.action)}
                        </ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            {item.targetType} • {item.targetName || item.targetId}
                        </ThemedText>
                    </View>
                </View>
                <ThemedText type="tiny" color={coolGray}>
                    {formatDate(item.timestamp)}
                </ThemedText>
            </View>

            <View style={styles.logDetails}>
                <ThemedText type="tiny" color={coolGray} numberOfLines={2}>
                    <ThemedText type="tiny" color={textColor}>Admin: </ThemedText>
                    {item.adminName || item.adminEmail}
                </ThemedText>
                {item.details && (
                    <ThemedText type="tiny" color={coolGray} numberOfLines={2}>
                        <ThemedText type="tiny" color={textColor}>Details: </ThemedText>
                        {item.details}
                    </ThemedText>
                )}
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={wp(15)} color={icon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
                No Admin Actions Found
            </ThemedText>
            <ThemedText type="default" style={styles.emptySubtitle}>
                {adminId ? 'This admin has not performed any actions yet.' : 'No admin actions have been recorded yet.'}
            </ThemedText>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ThemedText type="default">Loading admin actions...</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">
                    Admin Action Logs ({logs.length})
                </ThemedText>
                <TouchableOpacity
                    style={[styles.refreshButton, { borderColor: accent }]}
                    onPress={loadLogs}
                    activeOpacity={0.7}
                >
                    <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                        Refresh
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <FlatList
                data={logs}
                renderItem={renderLogItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
    refreshButton: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2),
        borderRadius: wp(2),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        flexGrow: 1,
    },
    logItem: {
        padding: wp(4),
        marginBottom: wp(3),
        borderRadius: wp(3),
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: wp(2),
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: wp(2),
    },
    actionInfo: {
        marginLeft: wp(3),
        flex: 1,
    },
    logDetails: {
        gap: wp(1),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(8),
    },
    emptyTitle: {
        marginTop: wp(4),
        marginBottom: wp(2),
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: wp(6),
        opacity: 0.7,
    },
});

export default AdminActionLogsViewer;
