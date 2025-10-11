import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { searchUsersByEmail, addDocument } from '@/db/operations';

interface ReferrerManagerProps {
    visible: boolean;
}

export default function ReferrerManager({ visible }: ReferrerManagerProps) {
    const [searchEmail, setSearchEmail] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<any>(null);
    const [referrerCode, setReferrerCode] = useState('');
    const [creating, setCreating] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

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
                setReferrerCode('');
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

        setCreating(true);
        try {
            // Generate a short referrer code (6 characters)
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Create referrer document
            const referrerData = {
                userId: foundUser.uid, //Use Firebase Auth UID instead of document ID
                userEmail: foundUser.email,
                userName: foundUser.displayName || foundUser.email,
                referrerCode: code,
                createdAt: new Date().toISOString(),
                isActive: true
            };

            await addDocument('referrers', referrerData);
            setReferrerCode(code);
            Alert.alert('Success', 'Referrer code created successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create referrer code');
            console.error('Create referrer error:', error);
        } finally {
            setCreating(false);
        }
    };

    const copyReferrerCode = async () => {
        if (referrerCode) {
            Clipboard.setString(referrerCode);
            Alert.alert('Copied', 'Referrer code copied to clipboard!');
        }
    };

    const resetForm = () => {
        setSearchEmail('');
        setFoundUser(null);
        setReferrerCode('');
    };

    if (!visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: backgroundLight }]}>
            <ThemedText type="subtitle" style={styles.title}>Create Referrer Code</ThemedText>

            {/* Search Section */}
            <View style={styles.section}>
                <ThemedText type="default" style={styles.sectionTitle}>Search User</ThemedText>
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
            </View>

            {/* Found User Section */}
            {foundUser && (
                <View style={styles.section}>
                    <ThemedText type="default" style={styles.sectionTitle}>User Found</ThemedText>
                    <View style={[styles.userCard, { backgroundColor: background }]}>
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
                                    ID: {foundUser.id}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Referrer Code Section */}
            {foundUser && (
                <View style={styles.section}>
                    <ThemedText type="default" style={styles.sectionTitle}>Referrer Code</ThemedText>
                    {referrerCode ? (
                        <View style={[styles.codeContainer, { backgroundColor: background }]}>
                            <ThemedText type="title" style={styles.codeText}>
                                {referrerCode}
                            </ThemedText>
                            <TouchableOpacity
                                style={[styles.copyButton, { backgroundColor: accent }]}
                                onPress={copyReferrerCode}
                            >
                                <Ionicons name="copy" size={20} color="white" />
                                <ThemedText color="white" type="tiny">Copy</ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: accent }]}
                            onPress={createReferrerCode}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="add-circle" size={20} color="white" />
                                    <ThemedText color="white" type="default">Create Referrer Code</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Reset Button */}
            <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: coolGray }]}
                onPress={resetForm}
            >
                <Ionicons name="refresh" size={20} color="white" />
                <ThemedText color="white" type="default">Reset</ThemedText>
            </TouchableOpacity>
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
    section: {
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(2),
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: wp(2),
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
    userCard: {
        padding: wp(3),
        borderRadius: wp(2),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: wp(4),
        borderRadius: wp(2),
    },
    codeText: {
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        padding: wp(2),
        borderRadius: wp(2),
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
});
