import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, getUsersByReferrerId, addDocument, fetchDocuments } from '@/db/operations';
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

interface Reward {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    rewardType: string;
    totalTokens: number;
    availableTokens: number;
    usedTokens: number;
    description: string;
    createdAt: string;
    expiryDate: string;
    createdBy: string;
    status: string;
    type: string;
}

const AdminRewards = () => {
    const [activeTab, setActiveTab] = useState<'rewarded' | 'reward'>('rewarded');
    const [rewardedUsers, setRewardedUsers] = useState<Reward[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRewardType, setSelectedRewardType] = useState<string>('');
    const [tokens, setTokens] = useState('');
    const [expiryDate, setExpiryDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 14); // 2 weeks default
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const { isSuperAdmin } = useAdminPermissions();
    const background = useThemeColor('background') || Colors.light.background;
    const backgroundLight = useThemeColor('backgroundLight') || Colors.light.backgroundLight;
    const icon = useThemeColor('icon') || Colors.light.icon;
    const accent = useThemeColor('accent') || Colors.light.accent;
    const coolGray = useThemeColor('coolGray') || Colors.light.coolGray;

    const rewardOptions = ['loadPosting', 'tracking'];

    const fetchRewardedUsers = async () => {
        setLoading(true);
        try {
            // Fetch rewards from database
            const result = await fetchDocuments('rewards', 100);
            if (result && result.data && Array.isArray(result.data)) {
                setRewardedUsers(result.data as Reward[]);
            }
        } catch (error) {
            console.error('Error fetching rewarded users:', error);
            Alert.alert('Error', 'Failed to load rewarded users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            let usersData: any[];
            if (isSuperAdmin()) {
                usersData = await getUsers();
            } else if (user?.uid) {
                usersData = await getUsersByReferrerId(user.uid);
            } else {
                usersData = [];
            }

            if (Array.isArray(usersData)) {
                setUsers(usersData);
                setFilteredUsers(usersData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchRewardedUsers();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.userType?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const handleRewardUser = async () => {
        if (!selectedUser || !selectedRewardType || !tokens.trim() || !expiryDate) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const tokenAmount = parseInt(tokens);
        if (isNaN(tokenAmount) || tokenAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid number of tokens');
            return;
        }

        const selectedExpiryDate = new Date(expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedExpiryDate < today) {
            Alert.alert('Error', 'Expiry date cannot be in the past');
            return;
        }

        setSubmitting(true);
        try {
            const rewardData = {
                userId: selectedUser.id,
                userName: selectedUser.displayName || 'Unknown',
                userEmail: selectedUser.email,
                rewardType: selectedRewardType,
                totalTokens: tokenAmount,
                availableTokens: tokenAmount,
                usedTokens: 0,
                description: `${selectedRewardType} Reward`,
                createdAt: new Date().toISOString(),
                expiryDate: new Date(expiryDate).toISOString(),
                createdBy: user?.uid || 'admin',
                status: 'completed',
                type: 'reward'
            };

            await addDocument('rewards', rewardData);

            // Also add to wallet transactions
            await addDocument('walletTransactions', {
                userId: selectedUser.id,
                type: 'reward',
                amount: tokenAmount,
                description: `${selectedRewardType} Reward`,
                status: 'completed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: selectedRewardType
            });

            Alert.alert('Success', 'Reward granted successfully!');
            setSelectedUser(null);
            setSelectedRewardType('');
            setTokens('');
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 14);
            setExpiryDate(defaultExpiry.toISOString().split('T')[0]);
            fetchRewardedUsers();
        } catch (error) {
            console.error('Error granting reward:', error);
            Alert.alert('Error', 'Failed to grant reward');
        } finally {
            setSubmitting(false);
        }
    };

    const renderRewardedUsers = () => (
        <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Rewarded Users ({rewardedUsers.length})
            </ThemedText>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accent} />
                    <ThemedText type="default" color={coolGray}>
                        Loading rewarded users...
                    </ThemedText>
                </View>
            ) : rewardedUsers.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: backgroundLight }]}>
                    <Ionicons name="gift-outline" size={48} color={coolGray} />
                    <ThemedText type="default" color={coolGray}>
                        No users have been rewarded yet
                    </ThemedText>
                </View>
            ) : (
                <ScrollView style={styles.listContainer}>
                    {rewardedUsers.map((reward) => (
                        <View key={reward.id} style={[styles.rewardCard, { backgroundColor: background }]}>
                            <View style={styles.rewardHeader}>
                                <Ionicons name="gift" size={24} color={accent} />
                                <View style={styles.rewardInfo}>
                                    <ThemedText type="default" style={styles.rewardUser}>
                                        {reward.userName}
                                    </ThemedText>
                                    <ThemedText type="tiny" color={coolGray}>
                                        {reward.userEmail}
                                    </ThemedText>
                                    <ThemedText type="tiny" color={coolGray}>
                                        {reward.rewardType} - {reward.totalTokens} tokens
                                    </ThemedText>
                                    <ThemedText type="tiny" color={coolGray}>
                                        Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                                    </ThemedText>
                                    <ThemedText type="tiny" color={coolGray}>
                                        {new Date(reward.createdAt).toLocaleDateString()}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    const renderRewardUser = () => (
        <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Reward a User
            </ThemedText>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: backgroundLight }]}>
                <Ionicons name="search" size={20} color={coolGray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, email, or user type..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={coolGray}
                />
            </View>

            {/* User Selection */}
            <ScrollView style={styles.userList}>
                {filteredUsers.map((user) => (
                    <TouchableOpacity
                        key={user.id}
                        style={[
                            styles.userCard,
                            { backgroundColor: background },
                            selectedUser?.id === user.id && { borderColor: accent, borderWidth: 2 }
                        ]}
                        onPress={() => setSelectedUser(user)}
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
                                {user.userType && (
                                    <View style={[styles.userTypeBadge, { backgroundColor: accent }]}>
                                        <ThemedText color="white" type="tiny">
                                            {user.userType}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                            {selectedUser?.id === user.id && (
                                <Ionicons name="checkmark-circle" size={24} color={accent} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Reward Form */}
            {selectedUser && (
                <View style={[styles.rewardForm, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="default" style={styles.formTitle}>
                        Reward: {selectedUser.displayName || selectedUser.email}
                    </ThemedText>

                    <View style={styles.rewardTypeContainer}>
                        <ThemedText type="default" style={styles.rewardTypeLabel}>
                            Select Reward Type:
                        </ThemedText>
                        <View style={styles.rewardTypeOptions}>
                            {rewardOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.rewardTypeButton,
                                        { backgroundColor: background },
                                        selectedRewardType === option && { backgroundColor: accent }
                                    ]}
                                    onPress={() => setSelectedRewardType(option)}
                                >
                                    <ThemedText
                                        style={[
                                            styles.rewardTypeButtonText,
                                            selectedRewardType === option && { color: 'white' }
                                        ]}
                                    >
                                        {option}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TextInput
                        style={[styles.input, { backgroundColor: background, color: icon }]}
                        placeholder="Number of tokens"
                        placeholderTextColor={coolGray}
                        value={tokens}
                        onChangeText={setTokens}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={[styles.input, { backgroundColor: background, color: icon }]}
                        placeholder="Expiry date (YYYY-MM-DD)"
                        placeholderTextColor={coolGray}
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: accent }]}
                        onPress={handleRewardUser}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Ionicons name="gift" size={20} color="white" />
                                <ThemedText style={styles.submitButtonText}>
                                    Grant Reward
                                </ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <ScreenWrapper>
            <Heading page="Admin Rewards" />

            {/* Tab Navigation */}
            <View style={[styles.tabContainer, { backgroundColor: backgroundLight }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'rewarded' && { backgroundColor: accent }]}
                    onPress={() => setActiveTab('rewarded')}
                >
                    <ThemedText
                        style={[styles.tabText, activeTab === 'rewarded' && { color: 'white' }]}
                    >
                        Rewarded Users
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reward' && { backgroundColor: accent }]}
                    onPress={() => setActiveTab('reward')}
                >
                    <ThemedText
                        style={[styles.tabText, activeTab === 'reward' && { color: 'white' }]}
                    >
                        Reward a User
                    </ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}>
                {activeTab === 'rewarded' ? renderRewardedUsers() : renderRewardUser()}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: wp(4),
        marginTop: wp(2),
        borderRadius: wp(2),
        padding: wp(1),
    },
    tab: {
        flex: 1,
        padding: wp(3),
        alignItems: 'center',
        borderRadius: wp(2),
    },
    tabText: {
        fontWeight: '600',
    },
    section: {
        flex: 1,
    },
    sectionTitle: {
        marginBottom: wp(3),
        color: '#1E90FF',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: wp(8),
        gap: wp(2),
    },
    emptyContainer: {
        alignItems: 'center',
        padding: wp(8),
        borderRadius: wp(2),
        gap: wp(2),
    },
    listContainer: {
        maxHeight: wp(150),
    },
    rewardCard: {
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    rewardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    rewardInfo: {
        flex: 1,
    },
    rewardUser: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(3),
        gap: wp(2),
    },
    searchInput: {
        flex: 1,
        fontSize: wp(4),
    },
    userList: {
        maxHeight: wp(100),
        marginBottom: wp(3),
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
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
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
    userTypeBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(1),
        alignSelf: 'flex-start',
        marginTop: wp(1),
    },
    rewardForm: {
        padding: wp(4),
        borderRadius: wp(2),
    },
    formTitle: {
        fontWeight: '600',
        marginBottom: wp(3),
    },
    input: {
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(3),
        fontSize: wp(4),
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        gap: wp(2),
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: wp(4),
    },
    rewardTypeContainer: {
        marginBottom: wp(3),
    },
    rewardTypeLabel: {
        fontWeight: '600',
        marginBottom: wp(2),
    },
    rewardTypeOptions: {
        flexDirection: 'row',
        gap: wp(2),
    },
    rewardTypeButton: {
        flex: 1,
        padding: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    rewardTypeButtonText: {
        fontWeight: '600',
    },
});

export default AdminRewards;