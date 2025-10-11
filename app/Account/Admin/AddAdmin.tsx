import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useAuth } from '@/context/AuthContext';
import { wp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, getUsersByReferrerId } from '@/db/operations';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import Button from '@/components/Button';

interface User {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    userType?: string;
    isActive?: boolean;
}

interface AdminRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

const ADMIN_ROLES: AdminRole[] = [
    {
        id: 'approve_trucks',
        name: 'Approve Trucks',
        description: 'Can approve pending truck registrations',
        permissions: ['approve_trucks']
    },
    {
        id: 'add_tracking_agent',
        name: 'Add Tracking Agent',
        description: 'Can add users as tracking agents',
        permissions: ['add_tracking_agent']
    },
    {
        id: 'add_service_station_owner',
        name: 'Add Service Station Owner',
        description: 'Can add users as service station owners',
        permissions: ['add_service_station_owner']
    },
    {
        id: 'add_truck_stop_owner',
        name: 'Add Truck Stop Owner',
        description: 'Can add users as truck stop owners',
        permissions: ['add_truck_stop_owner']
    },
    {
        id: 'approve_loads',
        name: 'Approve Loads',
        description: 'Can approve pending load requests',
        permissions: ['approve_loads']
    },
    {
        id: 'approve_truck_accounts',
        name: 'Approve Truck Accounts',
        description: 'Can approve truck personal details',
        permissions: ['approve_truck_accounts']
    },
    {
        id: 'approve_loads_accounts',
        name: 'Approve Loads Accounts',
        description: 'Can approve load account details',
        permissions: ['approve_loads_accounts']
    }
];

const AddAdmin = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const { user } = useAuth();
    const { isSuperAdmin } = useAdminPermissions();
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = users.filter(user =>
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [searchQuery, users]);

    const loadUsers = async () => {
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
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setSearchQuery(user.email);
        setFilteredUsers([]);
    };

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSaveAdmin = async () => {
        if (!selectedUser) {
            Alert.alert('Error', 'Please select a user');
            return;
        }

        if (selectedRoles.length === 0) {
            Alert.alert('Error', 'Please select at least one admin role');
            return;
        }

        setSaving(true);
        try {
            const adminData = {
                userId: selectedUser.id,
                email: selectedUser.email,
                displayName: selectedUser.displayName,
                roles: selectedRoles,
                permissions: ADMIN_ROLES
                    .filter(role => selectedRoles.includes(role.id))
                    .flatMap(role => role.permissions),
                createdAt: new Date().toISOString(),
                isActive: true
            };

            await setDoc(doc(db, 'adminRoles', selectedUser.id), adminData);

            Alert.alert('Success', 'Admin roles assigned successfully', [
                {
                    text: 'OK', onPress: () => {
                        setSelectedUser(null);
                        setSelectedRoles([]);
                        setSearchQuery('');
                    }
                }
            ]);
        } catch (error) {
            console.error('Error saving admin:', error);
            Alert.alert('Error', 'Failed to assign admin roles');
        } finally {
            setSaving(false);
        }
    };

    const renderUserItem = (user: User) => (
        <TouchableOpacity
            key={user.id}
            style={[styles.userItem, { backgroundColor: backgroundLight }]}
            onPress={() => handleUserSelect(user)}
        >
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person" size={20} color="white" />
                </View>
                <View style={styles.userDetails}>
                    <ThemedText type="default" style={styles.userName}>
                        {user.displayName || 'No Name'}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        {user.email}
                    </ThemedText>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={icon} />
        </TouchableOpacity>
    );

    const renderRoleItem = (role: AdminRole) => (
        <TouchableOpacity
            key={role.id}
            style={[
                styles.roleItem,
                {
                    backgroundColor: backgroundLight,
                    borderColor: selectedRoles.includes(role.id) ? accent : 'transparent',
                    borderWidth: selectedRoles.includes(role.id) ? 2 : 1,
                }
            ]}
            onPress={() => handleRoleToggle(role.id)}
        >
            <View style={styles.roleInfo}>
                <ThemedText type="default" style={styles.roleName}>
                    {role.name}
                </ThemedText>
                <ThemedText type="tiny" color={coolGray} style={styles.roleDescription}>
                    {role.description}
                </ThemedText>
            </View>
            <View style={[
                styles.roleToggle,
                {
                    backgroundColor: selectedRoles.includes(role.id) ? accent : icon + '20',
                    borderColor: selectedRoles.includes(role.id) ? accent : icon + '40',
                }
            ]}>
                <Ionicons
                    name={selectedRoles.includes(role.id) ? "checkmark" : "add"}
                    size={16}
                    color={selectedRoles.includes(role.id) ? "white" : icon}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <Heading page='Add Admin' />
            <ScrollView style={styles.container}>
                {/* User Search Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        Select User
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray} style={styles.sectionDescription}>
                        {isSuperAdmin()
                            ? "Search and select any user to assign admin roles"
                            : "Search and select from users you have referred"
                        }
                    </ThemedText>

                    <View style={[styles.searchContainer, { backgroundColor: backgroundLight }]}>
                        <Ionicons name="search" size={20} color={icon} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: icon }]}
                            placeholder={isSuperAdmin()
                                ? "Search by email or name..."
                                : "Search your referred users..."
                            }
                            placeholderTextColor={coolGray}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {selectedUser && (
                        <View style={[styles.selectedUser, { backgroundColor: accent }]}>
                            <View style={styles.selectedUserInfo}>
                                <Ionicons name="person" size={20} color="white" />
                                <View style={styles.selectedUserDetails}>
                                    <ThemedText color="white" type="default" style={styles.selectedUserName}>
                                        {selectedUser.displayName || 'No Name'}
                                    </ThemedText>
                                    <ThemedText color="white" type="tiny" style={styles.selectedUserEmail}>
                                        {selectedUser.email}
                                    </ThemedText>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {searchQuery && filteredUsers.length > 0 && (
                        <View style={styles.usersList}>
                            {filteredUsers.map(renderUserItem)}
                        </View>
                    )}

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={accent} />
                            <ThemedText type="tiny" color={coolGray} style={styles.loadingText}>
                                Loading users...
                            </ThemedText>
                        </View>
                    )}

                    {!loading && users.length === 0 && !isSuperAdmin() && (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="people-outline" size={wp(12)} color={icon} />
                            <ThemedText type="default" style={styles.emptyStateTitle}>
                                No Referred Users
                            </ThemedText>
                            <ThemedText type="tiny" color={coolGray} style={styles.emptyStateDescription}>
                                You haven't referred any users yet. Share your referrer code to get started!
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Role Selection Section */}
                {selectedUser && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Assign Admin Roles
                        </ThemedText>
                        <ThemedText type="tiny" color={coolGray} style={styles.sectionDescription}>
                            Tap on the roles you want to assign to {selectedUser.displayName || selectedUser.email}
                        </ThemedText>

                        <View style={styles.rolesList}>
                            {ADMIN_ROLES.map(renderRoleItem)}
                        </View>

                        {selectedRoles.length > 0 && (
                            <View style={[styles.selectedRolesInfo, { backgroundColor: accent + '20', borderColor: accent }]}>
                                <Ionicons name="checkmark-circle" size={16} color={accent} />
                                <ThemedText type="tiny" color={accent} style={styles.selectedRolesText}>
                                    {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                                </ThemedText>
                            </View>
                        )}
                    </View>
                )}

                {/* Save Button */}
                {selectedUser && selectedRoles.length > 0 && (
                    <View style={styles.saveSection}>
                        <Button
                            title={saving ? "Assigning Roles..." : "Assign Admin Roles"}
                            onPress={handleSaveAdmin}
                            disabled={saving}
                            style={styles.saveButton}
                        />
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    section: {
        marginBottom: wp(6),
    },
    sectionTitle: {
        marginBottom: wp(2),
        fontWeight: '600',
    },
    sectionDescription: {
        marginBottom: wp(4),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    searchIcon: {
        marginRight: wp(3),
    },
    searchInput: {
        flex: 1,
        fontSize: wp(4),
    },
    selectedUser: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    selectedUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedUserDetails: {
        marginLeft: wp(3),
        flex: 1,
    },
    selectedUserName: {
        fontWeight: '600',
    },
    selectedUserEmail: {
        opacity: 0.8,
    },
    usersList: {
        maxHeight: wp(60),
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    rolesList: {
        gap: wp(2),
    },
    roleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(2),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    roleInfo: {
        flex: 1,
        marginRight: wp(3),
    },
    roleName: {
        fontWeight: '600',
        marginBottom: wp(1),
        fontSize: wp(4),
    },
    roleDescription: {
        lineHeight: wp(4),
        fontSize: wp(3.5),
    },
    roleToggle: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    selectedRolesInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
        marginTop: wp(3),
    },
    selectedRolesText: {
        marginLeft: wp(2),
        fontWeight: '600',
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: wp(8),
        marginTop: wp(4),
    },
    emptyStateTitle: {
        marginTop: wp(3),
        marginBottom: wp(2),
        textAlign: 'center',
        fontWeight: '600',
    },
    emptyStateDescription: {
        textAlign: 'center',
        lineHeight: wp(4),
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(4),
    },
    loadingText: {
        marginLeft: wp(2),
    },
    saveSection: {
        marginTop: wp(4),
    },
    saveButton: {
        marginBottom: wp(4),
    },
});

export default AddAdmin;
