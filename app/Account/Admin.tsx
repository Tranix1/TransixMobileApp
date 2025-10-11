import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, getUsersByReferrerId } from '@/db/operations';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { router } from 'expo-router';

interface User {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    userType?: string;
    isActive?: boolean;
}

const Admin = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);

    const { user } = useAuth();
    const { isSuperAdmin } = useAdminPermissions();
    const background = useThemeColor('background') || Colors.light.background;
    const backgroundLight = useThemeColor('backgroundLight') || Colors.light.backgroundLight;
    const icon = useThemeColor('icon') || Colors.light.icon;
    const accent = useThemeColor('accent') || Colors.light.accent;
    const coolGray = useThemeColor('coolGray') || Colors.light.coolGray;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let usersData;

            if (isSuperAdmin()) {
                // Super admin can see all users
                usersData = await getUsers();
            } else if (user?.uid) {
                // Non-super admin can only see users they referred
                usersData = await getUsersByReferrerId(user.uid);
            } else {
                usersData = [];
            }

            if (Array.isArray(usersData)) {
                setUsers(usersData);
                setTotalUsers(usersData.length);
            } else {
                setUsers([]);
                setTotalUsers(0);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const renderUserItem = (user: User) => (
        <View key={user.id} style={[styles.userCard, { backgroundColor: background }]}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person" size={24} color="white" />
                </View>
                <View style={styles.userDetails}>
                    <ThemedText type="default" style={styles.userName}>
                        {user.displayName || 'No Name'}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        {user.email}
                    </ThemedText>
                    {user.phoneNumber && (
                        <ThemedText type="tiny" color={coolGray}>
                            {user.phoneNumber}
                        </ThemedText>
                    )}
                    <View style={styles.userMeta}>
                        <ThemedText type="tiny" color={coolGray}>
                            ID: {user.id.substring(0, 8)}...
                        </ThemedText>
                        {user.userType && (
                            <View style={[styles.userTypeBadge, { backgroundColor: accent }]}>
                                <ThemedText color="white" type="tiny">
                                    {user.userType}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <ScreenWrapper>
            <Heading page={isSuperAdmin() ? 'Admin Panel - All Users' : 'Admin Panel - Your Referred Users'} />
            <ScrollView style={styles.container}>
                {/* User Count Summary */}
                <View style={[styles.summaryCard, { backgroundColor: backgroundLight }]}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="people" size={24} color={accent} />
                        <ThemedText type="title" style={styles.summaryNumber}>
                            {totalUsers}
                        </ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            Total Users
                        </ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                        <Ionicons name="checkmark-circle" size={24} color={accent} />
                        <ThemedText type="title" style={styles.summaryNumber}>
                            {users.filter(user => user.isActive !== false).length}
                        </ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            Active Users
                        </ThemedText>
                    </View>
                </View>

                {/* Approval Actions */}
                <View style={[styles.approvalCard, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.approvalTitle}>
                        Load Management
                    </ThemedText>
                    <View style={styles.approvalButtons}>
                        <TouchableOpacity
                            style={[styles.approvalButton, { backgroundColor: accent }]}
                            onPress={() => router.push('/Account/Admin/ApproveLoads')}
                        >
                            <Ionicons name="cube-outline" size={24} color="white" />
                            <ThemedText style={styles.approvalButtonText}>
                                Approve Loads
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.approvalButton, { backgroundColor: accent }]}
                            onPress={() => router.push('/Account/Admin/ApproveLoadsAccounts')}
                        >
                            <Ionicons name="people-outline" size={24} color="white" />
                            <ThemedText style={styles.approvalButtonText}>
                                Approve Accounts
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Users List */}
                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <ThemedText type="default" style={styles.sectionTitle}>
                            {isSuperAdmin() ? `All Users (${totalUsers})` : `Your Referred Users (${totalUsers})`}
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.refreshButton, { backgroundColor: accent }]}
                            onPress={fetchUsers}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name="refresh" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={accent} />
                            <ThemedText type="default" color={coolGray} style={styles.loadingText}>
                                Loading users...
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.usersList}>
                            {users.map(renderUserItem)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(4),
    },
    summaryItem: {
        alignItems: 'center',
        gap: wp(1),
    },
    summaryNumber: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    approvalCard: {
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(4),
    },
    approvalTitle: {
        marginBottom: wp(3),
        color: '#1E90FF',
    },
    approvalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    approvalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        gap: wp(2),
    },
    approvalButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: wp(3.5),
    },
    listContainer: {
        flex: 1,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    sectionTitle: {
        fontWeight: '600',
    },
    refreshButton: {
        padding: wp(2),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: wp(10),
    },
    loadingContainer: {
        alignItems: 'center',
        padding: wp(8),
        gap: wp(2),
    },
    loadingText: {
        marginTop: wp(2),
    },
    usersList: {
        gap: wp(2),
    },
    userCard: {
        padding: wp(3),
        borderRadius: wp(2),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    avatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(1),
    },
    userTypeBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(1),
    },
});

export default Admin;