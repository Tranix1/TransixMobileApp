import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { getUsers } from '@/db/operations';
import { Colors } from '@/constants/Colors';

interface UserManagerProps {
    visible: boolean;
}

interface User {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    createdAt?: any;
    userType?: string;
    isActive?: boolean;
}

export default function UserManager({ visible }: UserManagerProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);

    const background = useThemeColor('background') || Colors.light.background;
    const backgroundLight = useThemeColor('backgroundLight') || Colors.light.backgroundLight;
    const icon = useThemeColor('icon') || Colors.light.icon;
    const accent = useThemeColor('accent') || Colors.light.accent;
    const coolGray = useThemeColor('coolGray') || Colors.light.coolGray;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log('UserManager: Starting to fetch users...');
            const usersData = await getUsers();
            console.log('UserManager: Fetched users data:', usersData);

            if (Array.isArray(usersData)) {
                setUsers(usersData);
                setTotalUsers(usersData.length);
                console.log('UserManager: Set users successfully, count:', usersData.length);
            } else {
                console.log('UserManager: Users data is not an array:', typeof usersData);
                setUsers([]);
                setTotalUsers(0);
            }
        } catch (error) {
            console.error('UserManager: Error fetching users:', error);
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        console.log('UserManager: Refresh triggered');
        setRefreshing(true);
        try {
            await fetchUsers();
        } catch (error) {
            console.error('UserManager: Error during refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchUsers();
        }
    }, [visible]);

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={[styles.userCard, { backgroundColor: background }]}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person" size={24} color="white" />
                </View>
                <View style={styles.userDetails}>
                    <ThemedText type="default" style={styles.userName}>
                        {item.displayName || 'No Name'}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        {item.email}
                    </ThemedText>
                    {item.phoneNumber && (
                        <ThemedText type="tiny" color={coolGray}>
                            {item.phoneNumber}
                        </ThemedText>
                    )}
                    <View style={styles.userMeta}>
                        <ThemedText type="tiny" color={coolGray}>
                            ID: {item.id.substring(0, 8)}...
                        </ThemedText>
                        {item.userType && (
                            <View style={[styles.userTypeBadge, { backgroundColor: accent }]}>
                                <ThemedText color="white" type="tiny">
                                    {item.userType}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );

    if (!visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: backgroundLight }]}>
            <ThemedText type="subtitle" style={styles.title}>User Management</ThemedText>

            {/* User Count Summary */}
            <View style={[styles.summaryCard, { backgroundColor: background }]}>
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

            {/* Users List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <ThemedText type="default" style={styles.sectionTitle}>
                        All Users ({totalUsers})
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.refreshButton, { backgroundColor: accent }]}
                        onPress={onRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? (
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
                        {users.map((user) => (
                            <View key={user.id}>
                                {renderUserItem({ item: user })}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: wp(4),
        borderRadius: wp(4),
        marginVertical: wp(2),
    },
    title: {
        marginBottom: wp(4),
        textAlign: 'center',
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
    listContainer: {
        flex: 1,
        minHeight: 200,
    },
    sectionTitle: {
        marginBottom: wp(3),
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: wp(8),
        gap: wp(2),
    },
    loadingText: {
        marginTop: wp(2),
    },
    listContent: {
        paddingBottom: wp(4),
    },
    userCard: {
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(2),
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
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    refreshButton: {
        padding: wp(2),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: wp(10),
    },
    usersList: {
        flex: 1,
    },
});

