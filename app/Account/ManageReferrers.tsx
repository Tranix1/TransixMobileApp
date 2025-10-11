import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { getAllReferrers, searchUsersByEmail, addDocument, deleteDocument, generateUniqueReferrerCode } from '@/db/operations';
import { Colors } from '@/constants/Colors';

interface Referrer {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    referrerCode: string;
    createdAt: any;
    isActive: boolean;
}

const ManageReferrers = () => {
    const [referrers, setReferrers] = useState<Referrer[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalReferrers, setTotalReferrers] = useState(0);

    // Add referrer states
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<any>(null);

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
        } finally {
            setLoading(false);
        }
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

    const createReferrer = async () => {
        if (!foundUser) return;

        try {
            // Generate unique referrer code
            const code = await generateUniqueReferrerCode();

            const referrerData = {
                userId: foundUser.id,
                userEmail: foundUser.email,
                userName: foundUser.displayName || foundUser.email,
                referrerCode: code,
                createdAt: new Date().toISOString(),
                isActive: true
            };

            await addDocument('referrers', referrerData);
            Alert.alert('Success', `Referrer created successfully! Code: ${code}`);

            // Reset form and refresh list
            setSearchEmail('');
            setFoundUser(null);
            setShowAddForm(false);
            await fetchReferrers();
        } catch (error) {
            Alert.alert('Error', 'Failed to create referrer');
            console.error('Create referrer error:', error);
        }
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

    useEffect(() => {
        fetchReferrers();
    }, []);

    const renderReferrerItem = (referrer: Referrer) => (
        <View key={referrer.id} style={[styles.referrerCard, { backgroundColor: background }]}>
            <View style={styles.referrerInfo}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person-add" size={24} color="white" />
                </View>
                <View style={styles.referrerDetails}>
                    <ThemedText type="default" style={styles.referrerName}>
                        {referrer.userName}
                    </ThemedText>
                    <ThemedText type="tiny" color={coolGray}>
                        {referrer.userEmail}
                    </ThemedText>
                    <View style={styles.codeContainer}>
                        <ThemedText type="tiny" color={coolGray}>
                            Code:
                        </ThemedText>
                        <ThemedText type="default" style={styles.referrerCode}>
                            {referrer.referrerCode}
                        </ThemedText>
                    </View>
                    <View style={styles.referrerMeta}>
                        <ThemedText type="tiny" color={coolGray}>
                            ID: {referrer.id.substring(0, 8)}...
                        </ThemedText>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: referrer.isActive ? accent : coolGray }
                        ]}>
                            <ThemedText color="white" type="tiny">
                                {referrer.isActive ? 'Active' : 'Inactive'}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#ff4444' }]}
                onPress={() => deleteReferrer(referrer.id)}
            >
                <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenWrapper>
            <Heading page='Manage Referrers' />
            <ScrollView style={styles.container}>
                {/* Add Referrer Button */}
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: accent }]}
                    onPress={() => setShowAddForm(!showAddForm)}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <ThemedText color="white" type="default" style={styles.addButtonText}>
                        {showAddForm ? 'Cancel' : 'Add New Referrer'}
                    </ThemedText>
                </TouchableOpacity>

                {/* Add Referrer Form */}
                {showAddForm && (
                    <View style={[styles.addForm, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="default" style={styles.formTitle}>Add New Referrer</ThemedText>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: background, color: icon }]}
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

                        {foundUser && (
                            <View style={[styles.foundUserCard, { backgroundColor: background }]}>
                                <View style={styles.userInfo}>
                                    <Ionicons name="person-circle" size={40} color={accent} />
                                    <View style={styles.userDetails}>
                                        <ThemedText type="default" style={styles.userName}>
                                            {foundUser.displayName || 'No Name'}
                                        </ThemedText>
                                        <ThemedText type="tiny" color={coolGray}>
                                            {foundUser.email}
                                        </ThemedText>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.createButton, { backgroundColor: accent }]}
                                    onPress={createReferrer}
                                >
                                    <Ionicons name="add-circle" size={20} color="white" />
                                    <ThemedText color="white" type="default">Create Referrer</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Referrer Count Summary */}
                <View style={[styles.summaryCard, { backgroundColor: backgroundLight }]}>
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
                            onPress={fetchReferrers}
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
                            {referrers.map(renderReferrerItem)}
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
    addForm: {
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    formTitle: {
        marginBottom: wp(3),
        fontWeight: '600',
        textAlign: 'center',
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
    emptyContainer: {
        alignItems: 'center',
        padding: wp(8),
        gap: wp(2),
    },
    emptyText: {
        marginTop: wp(2),
    },
    referrersList: {
        gap: wp(2),
    },
    referrerCard: {
        padding: wp(3),
        borderRadius: wp(2),
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
        color: '#0f9d58',
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
    deleteButton: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ManageReferrers;
