import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { getReferralCodeByUserId } from '@/db/operations';
import { Clipboard } from 'react-native';

interface AdminReferralCodeProps {
    userEmail: string;
    adminName?: string;
}

const AdminReferralCode: React.FC<AdminReferralCodeProps> = ({ userEmail, adminName }) => {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    useEffect(() => {
        loadReferralCode();
    }, [userEmail]);

    // Add a refresh function that can be called externally
    const refreshReferralCode = () => {
        loadReferralCode();
    };

    const loadReferralCode = async () => {
        try {
            setLoading(true);
            const result = await getReferralCodeByUserId(userEmail);

            if (result.exists && result.referrerData) {
                setReferralCode(result.referrerData.referrerCode);
            } else {
                setReferralCode(null);
            }
        } catch (error) {
            console.error('Error loading referral code:', error);
            setReferralCode(null);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = async () => {
        if (referralCode) {
            try {
                await Clipboard.setString(referralCode);
                Alert.alert('Copied!', `Referral code "${referralCode}" copied to clipboard`);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                Alert.alert('Error', 'Failed to copy referral code');
            }
        }
    };

    if (loading) {
        return (
            <TouchableOpacity style={styles.container} activeOpacity={0.7}>
                <ThemedText type="default">Loading...</ThemedText>
            </TouchableOpacity>
        );
    }

    if (!referralCode) {
        return (
            <TouchableOpacity style={styles.container} activeOpacity={0.7}>
                <Ionicons name="person-outline" size={wp(4)} color={accent} style={{ width: wp(6), textAlign: 'center' }} />
                <View style={{ flex: 1 }}>
                    <ThemedText type="default">No referral code assigned</ThemedText>
                </View>
                <View style={[styles.copyButton, { backgroundColor: coolGray, opacity: 0.3 }]}>
                    <Ionicons name="close-outline" size={wp(3.5)} color="white" />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={copyReferralCode}
            activeOpacity={0.7}
        >
            <Ionicons name="person-outline" size={wp(4)} color={accent} style={{ width: wp(6), textAlign: 'center' }} />
            <View style={{ flex: 1 }}>
                <ThemedText type="default">Referral Code: {referralCode}</ThemedText>
            </View>
            <View style={[styles.copyButton, { backgroundColor: accent }]}>
                <Ionicons name="copy-outline" size={wp(3.5)} color="white" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        padding: wp(4),
        flexDirection: 'row',
        gap: wp(3),
        alignItems: 'center',
    },
    copyButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(2.5),
        borderRadius: wp(2),
        minWidth: wp(10),
    },
});

export default AdminReferralCode;
