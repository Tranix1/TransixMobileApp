import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { getAllReferrers, deleteDocument, searchUsersByEmail, addDocument } from '@/db/operations';
import { Colors } from '@/constants/Colors';

interface ReferrerManagementProps {
    visible: boolean;
}

interface Referrer {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    referrerCode: string;
    createdAt: any;
    isActive: boolean;
}

export default function ReferrerManagement({ visible }: ReferrerManagementProps) {
    const [referrers, setReferrers] = useState<Referrer[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [totalReferrers, setTotalReferrers] = useState(0);

    // User search states
    const [searchEmail, setSearchEmail] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<any>(null);
    const [showSearch, setShowSearch] = useState(false);

    const background = useThemeColor('background') || Colors.light.background;
    const backgroundLight = useThemeColor('backgroundLight') || Colors.light.backgroundLight;
    const icon = useThemeColor('icon') || Colors.light.icon;
    const accent = useThemeColor('accent') || Colors.light.accent;
    const coolGray = useThemeColor('coolGray') || Colors.light.coolGray;

    const fetchReferrers = async () => {
        setLoading(true);
        try {
            const referrersData = await getAllReferrers();
            if (Array.isArray(referrersData)) {
                setReferrers(referrersData);
                setTotalReferrers(referrersData.length);
            } else {
                setReferrers([]);
                setTotalReferrers(0);
            }
        } catch (error) {
            console.error('Error fetching referrers:', error);
            setReferrers([]);
            setTotalReferrers(0);
            Alert.alert('Error', 'Failed to fetch referrers');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchReferrers();
        setRefreshing(false);
    };

    const searchUser = async () => {
        if (!searchEmail.trim()) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }

        setSearching(true);
        try {
            const users = await searchUsersByEmail(searchEmail.trim());
            if (users.length > 0) {
                setFoundUser(users[0]);
            } else {
                Alert.alert('User Not Found', 'No user found with this email address');
                setFoundUser(null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to search for user');
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const createReferrerCode = async () => {
        if (!foundUser) return;

        try {
            // Generate a short referrer code (6 characters)
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Create referrer document
            const referrerData = {
                userId: foundUser.uid, // Use Firebase Auth UID instead of document ID
                userEmail: foundUser.email,
                userName: foundUser.displayName || foundUser.email,
                referrerCode: code,
                createdAt: new Date().toISOString(),
                isActive: true
            };

            await addDocument('referrers', referrerData);
            Alert.alert('Success', 'Referrer code created successfully!');

            // Reset search and refresh referrers list
            setSearchEmail('');
            setFoundUser(null);
            await fetchReferrers();
        } catch (error) {
            Alert.alert('Error', 'Failed to create referrer code');
            console.error('Create referrer error:', error);
        }
    };

    const resetSearch = () => {
        setSearchEmail('');
        setFoundUser(null);
        setShowSearch(false);
    };

    const deleteReferrer = async (referrerId: string) => {
        Alert.alert(
            'Delete Referrer',
            'Are you sure you want to delete this referrer?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDocument('referrers', referrerId);
                            await fetchReferrers();
                            Alert.alert('Success', 'Referrer deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete referrer');
                        }
                    }
                }
            ]
        );
    };

    const toggleReferrerStatus = async (referrerId: string, currentStatus: boolean) => {
        try {
            // This would require an update function - for now just show alert
            Alert.alert('Info', 'Referrer status toggle functionality would be implemented here');
        } catch (error) {
            Alert.alert('Error', 'Failed to update referrer status');
        }
    };

    useEffect(() => {
        if (visible) {
            fetchReferrers();
        }
    }, [visible]);

    const renderReferrerItem = ({ item }: { item: Referrer }) => (
        <View style={[styles.referrerCard, { backgroundColor: background }]}>
            <View style={styles.referrerInfo}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person-add" size={24} color="white" />
                </View>
                <View style={styles.referrerDetails}>
                    <ThemedText type="default" style={styles.referrerName}>
                        {item.userName}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        {item.userEmail}
                    </ThemedText>
                    <View style={styles.codeContainer}>
                        <ThemedText type="tiny" color={coolGray}>
                            Code:
                        </ThemedText>
                        <ThemedText type="default" style={styles.referrerCode}>
                            {item.referrerCode}
                        </ThemedText>
                    </View>
                    <View style={styles.referrerMeta}>
                        <ThemedText type="tiny" color={coolGray}>
                            ID: {item.id.substring(0, 8)}...
                        </ThemedText>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.isActive ? accent : coolGray }
                        ]}>
                            <ThemedText color="white" type="tiny">
                                {item.isActive ? 'Active' : 'Inactive'}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: accent }]}
                    onPress={() => toggleReferrerStatus(item.id, item.isActive)}
                >
                    <Ionicons name={item.isActive ? "pause" : "play"} size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
                    onPress={() => deleteReferrer(item.id)}
                >
                    <Ionicons name="trash" size={16} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: backgroundLight }]}>
            <ThemedText type="subtitle" style={styles.title}>Referrer Management</ThemedText>

            {/* Add Referrer Button */}
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: accent }]}
                onPress={() => setShowSearch(!showSearch)}
            >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText color="white" type="default" style={styles.addButtonText}>
                    {showSearch ? 'Cancel' : 'Add New Referrer'}
                </ThemedText>
            </TouchableOpacity>

            {/* User Search Section */}
            {showSearch && (
                <View style={[styles.searchSection, { backgroundColor: background }]}>
                    <ThemedText type="default" style={styles.sectionTitle}>Search User to Add as Referrer</ThemedText>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={[styles.input, { backgroundColor: backgroundLight, color: icon }]}
                            placeholder="Enter user email"
                            placeholderTextColor={coolGray}
                            value={searchEmail}
                            onChangeText={setSearchEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.searchButton, { backgroundColor: accent }]}
                            onPress={searchUser}
                            disabled={searching}
                        >
                            {searching ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name="search" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Found User Section */}
                    {foundUser && (
                        <View style={[styles.foundUserCard, { backgroundColor: backgroundLight }]}>
                            <View style={styles.userInfo}>
                                <Ionicons name="person-circle" size={40} color={accent} />
                                <View style={styles.userDetails}>
                                    <ThemedText type="default" style={styles.userName}>
                                        {foundUser.displayName || 'No Name'}
                                    </ThemedText>
                                    <ThemedText type="tiny" color={coolGray}>
                                        {foundUser.email}
                                    </ThemedText>
                                    <ThemedText type="tiny" color={coolGray}>
                                        ID: {foundUser.id.substring(0, 8)}...
                                    </ThemedText>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.createButton, { backgroundColor: accent }]}
                                onPress={createReferrerCode}
                            >
                                <Ionicons name="add-circle" size={20} color="white" />
                                <ThemedText color="white" type="default">Create Referrer</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Reset Button */}
                    <TouchableOpacity
                        style={[styles.resetButton, { backgroundColor: coolGray }]}
                        onPress={resetSearch}
                    >
                        <Ionicons name="refresh" size={20} color="white" />
                        <ThemedText color="white" type="default">Reset</ThemedText>
                    </TouchableOpacity>
                </View>
            )}

            {/* Referrer Count Summary */}
            <View style={[styles.summaryCard, { backgroundColor: background }]}>
                <View style={styles.summaryItem}>
                    <Ionicons name="people" size={24} color={accent} />
                    <ThemedText type="title" style={styles.summaryNumber}>
                        {totalReferrers}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        Total Referrers
                    </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                    <Ionicons name="checkmark-circle" size={24} color={accent} />
                    <ThemedText type="title" style={styles.summaryNumber}>
                        {referrers.filter(ref => ref.isActive).length}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        Active Referrers
                    </ThemedText>
                </View>
            </View>

            {/* Referrers List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <ThemedText type="default" style={styles.sectionTitle}>
                        All Referrers ({totalReferrers})
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
                            Loading referrers...
                        </ThemedText>
                    </View>
                ) : referrers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={coolGray} />
                        <ThemedText type="default" color={coolGray} style={styles.emptyText}>
                            No referrers found
                        </ThemedText>
                    </View>
                ) : (
                    <View style={styles.referrersList}>
                        {referrers.map((referrer) => (
                            <View key={referrer.id}>
                                {renderReferrerItem({ item: referrer })}
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
    emptyContainer: {
        alignItems: 'center',
        padding: wp(8),
        gap: wp(2),
    },
    emptyText: {
        marginTop: wp(2),
    },
    listContent: {
        paddingBottom: wp(4),
    },
    referrerCard: {
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    referrerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        flex: 1,
    },
    avatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    referrerDetails: {
        flex: 1,
    },
    referrerName: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
        marginVertical: wp(1),
    },
    referrerCode: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: accent,
    },
    referrerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(1),
    },
    statusBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(1),
    },
    actionButtons: {
        flexDirection: 'row',
        gap: wp(1),
    },
    actionButton: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(3),
        gap: wp(2),
    },
    addButtonText: {
        fontWeight: '600',
    },
    searchSection: {
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    sectionTitle: {
        marginBottom: wp(3),
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: wp(2),
        marginBottom: wp(3),
    },
    input: {
        flex: 1,
        padding: wp(3),
        borderRadius: wp(2),
        fontSize: 16,
    },
    searchButton: {
        padding: wp(3),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: wp(12),
    },
    foundUserCard: {
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        marginBottom: wp(3),
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2),
        padding: wp(3),
        borderRadius: wp(2),
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2),
        padding: wp(3),
        borderRadius: wp(2),
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
    referrersList: {
        flex: 1,
    },
});

