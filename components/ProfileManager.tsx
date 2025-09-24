import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, TouchableNativeFeedback, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readById } from '@/db/operations';

interface ProfileManagerProps {
    user: any;
    onProfileUpdate?: (updatedUser: any) => void;
}

export default function ProfileManager({ user, onProfileUpdate }: ProfileManagerProps) {
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');
    const border = useThemeColor('border');

    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Try to get cached profile data first
            const cachedProfile = await AsyncStorage.getItem(`profile_${user.uid}`);
            if (cachedProfile) {
                const parsedProfile = JSON.parse(cachedProfile);
                setProfileData(parsedProfile);
                onProfileUpdate?.(parsedProfile);
            }

            // Fetch fresh data from database
            const freshProfile = await readById('personalData', user.uid);
            if (freshProfile) {
                setProfileData(freshProfile);
                onProfileUpdate?.(freshProfile);

                // Update cache
                await AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(freshProfile));
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfileCache = async (updatedData: any) => {
        if (!user?.uid) return;

        try {
            const mergedData = { ...profileData, ...updatedData };
            setProfileData(mergedData);
            onProfileUpdate?.(mergedData);

            // Update cache
            await AsyncStorage.setItem(`profile_${user.uid}`, JSON.stringify(mergedData));
        } catch (error) {
            console.error('Error updating profile cache:', error);
        }
    };

    const handleProfilePress = () => {
        router.push('/Account/Profile');
    };

    const handleManageAccountPress = () => {
        router.push('/Account/Index');
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText type="tiny" color={coolGray}>
                        Loading profile...
                    </ThemedText>
                </View>
            </View>
        );
    }

    const displayUser = profileData || user;

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <View style={styles.profileSection}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        {!displayUser?.photoURL ? (
                            <FontAwesome name='user-circle' color={coolGray} size={wp(10)} />
                        ) : (
                            <Image
                                style={styles.avatar}
                                source={{ uri: displayUser?.photoURL || 'https://via.placeholder.com/100' }}
                            />
                        )}
                    </View>

                    <View style={styles.userDetails}>
                        <ThemedText type='subtitle'>
                            {displayUser?.organisation || displayUser?.displayName || 'No name'}
                        </ThemedText>
                        <ThemedText type='tiny' color={coolGray}>
                            {displayUser?.email}
                        </ThemedText>
                    </View>

                    {!displayUser?.organisation && (
                        <TouchableNativeFeedback onPress={handleProfilePress}>
                            <View style={styles.alertIcon}>
                                <Ionicons name='alert-circle-outline' color={icon} size={wp(6)} />
                            </View>
                        </TouchableNativeFeedback>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.manageButton, { borderColor: border }]}
                    onPress={handleManageAccountPress}
                >
                    <Ionicons name="manage-accounts" size={wp(5)} color={accent} />
                    <ThemedText>Manage Account</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: wp(4),
        borderRadius: wp(5),
    },
    loadingContainer: {
        padding: wp(4),
        alignItems: 'center',
    },
    profileSection: {
        gap: wp(4),
    },
    profileInfo: {
        flexDirection: 'row',
        padding: wp(2),
        gap: wp(2),
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: wp(2),
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
    },
    userDetails: {
        flex: 1,
    },
    alertIcon: {
        overflow: 'hidden',
        borderRadius: wp(10),
        alignSelf: 'flex-end',
        padding: wp(2),
        justifyContent: 'center',
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        justifyContent: 'center',
        borderWidth: 1,
        padding: wp(3),
        borderRadius: wp(4),
    },
});


