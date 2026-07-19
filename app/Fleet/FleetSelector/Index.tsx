import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, TouchableNativeFeedback, ToastAndroid } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import CustomHeader from "@/components/CustomHeader";
import ReferralCodeModal from "@/components/ReferralCodeModal";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { validateReferrerCode, setDocuments, updateDocument } from "@/db/operations";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from "@/constants/common";
import { db } from "@/db/fireBaseConfig";
import { setDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";

interface FleetAccess {
    fleetId: string;
    fleetName: string;
    status: 'pending' | 'active' | 'declined' | 'ended';
    invitedAt?: any;
    acceptedAt?: any;
}

function FleetSelector() {
    const { user, Logout, setupUser, setCurrentRole } = useAuth();
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const ownedFleets = Array.isArray(user?.fleets) ? user.fleets : [];
    const fleetCount = ownedFleets.length;
    const hasReferral = !!user?.referredBy?.userId;

    useEffect(() => {
        if (user) {
            setShowReferralModal(!hasReferral);
        }
    }, [user, hasReferral]);




    const handleSubmitReferralCode = async (code: string) => {
        if (!code || !code.trim()) {
            ToastAndroid.show(
                "Please enter a referral code.",
                ToastAndroid.SHORT
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const normalizedCode = code.trim().toUpperCase();

            const validation = await validateReferrerCode(normalizedCode);

            if (!validation.exists || !validation.referrerId || !validation.referrerData) {
                ToastAndroid.show(
                    "Invalid referral code. Please check and try again.",
                    ToastAndroid.LONG
                );
                return;
            }

            await updateDocument(
                "personalData",
                user?.uid || "",
                {
                    referredBy: validation.referrerData
                }
            );

            if (user) {
                await setupUser({
                    ...user,
                    referredBy: validation.referrerData
                });
            }

            setReferralCode(normalizedCode);
            setShowReferralModal(false);

            ToastAndroid.show(
                "Referral code accepted.",
                ToastAndroid.SHORT
            );

        } catch (error) {
            console.error(
                "Referral validation error:",
                error
            );

            ToastAndroid.show(
                "Referral validation failed. Please try again.",
                ToastAndroid.LONG
            );

        } finally {
            setIsSubmitting(false);
        }
    };




    const handleRefresh = async () => {
        if (user) {
            await setupUser(user);
            ToastAndroid.show('Referral status refreshed.', ToastAndroid.SHORT);
        }
    };

    const handleLogout = async () => {
        await Logout();
    };



    const handleFleetSelect = async (fleet: any) => {
        console.log(fleet.referrerCode, "The refferal code  ")
        if (!fleet) return;

        const fleetRole = {
            role: 'fleet' as const,
            fleetId: fleet.fleetId,
            companyName: fleet.companyName || fleet.fleetName,
            userRole: fleet.userRole || 'owner',
            accType: 'fleet' as const,
            driverId: fleet.driverId || null,

            fleetMainAdminId: fleet.fleetMainAdminId || null,
            fleetManagerId: fleet.fleetManagerId || null,
            fleetDispatcherId: fleet.fleetDispatcherId || null,

            referrerCode: fleet.referrerCode || null,

            organizationName: fleet.companyName || fleet.fleetName,
            organizationId: fleet.fleetId,

            phone: `${fleet.countryCode}${fleet?.organizationPhone}`,
            email: fleet.organizationEmail,
            billingAddress: fleet?.billingAddressFull,
            baseAdress: fleet?.baseAdressFull

        };

        (fleetRole as any);
        await AsyncStorage.setItem('currentRole', JSON.stringify(fleetRole));
        setCurrentRole(fleetRole as any)
        router.replace('/');
    };

    if (!user) {
        return (
            <View style={styles.centered}>
                <ThemedText>Loading account details...</ThemedText>
            </View>
        );
    }

    return (
        <View style={[, styles.container, { backgroundColor: background }]}>
            <CustomHeader pageTitle="Fleet Selector" />



            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 13, marginTop: hp(4) }}>
                <ThemedText style={styles.sectionHeading}>Fleets I Own</ThemedText>

                <TouchableOpacity style={styles.createButton} onPress={() => router.push('/Fleet/CreateFleet')}>
                    <ThemedText style={styles.createButtonText}>Create New Fleet</ThemedText>
                </TouchableOpacity>
            </View>


            <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="car-outline" size={24} color={accent} />
                    <ThemedText style={styles.sectionTitle}>Fleet</ThemedText>
                </View>
                <ThemedText style={[styles.sectionDescription, { fontSize: 12 }]}>
                    {fleetCount > 0
                        ? `Access your ${fleetCount} fleet${fleetCount > 1 ? 's' : ''} - Manage trucks, drivers, and operations`
                        : 'Fleets found. Create a fleet to start managing trucks and drivers.'
                    }
                </ThemedText>

                {fleetCount > 0 ? (
                    <View style={{ marginTop: 12 }}>
                        {ownedFleets.map((fleet: any) => (
                            <TouchableNativeFeedback key={fleet.fleetId || fleet.companyName} onPress={() => handleFleetSelect(fleet)}>
                                <View style={[styles.fleetCard, { backgroundColor: backgroundLight, borderColor: accent + '20' }]}>
                                    <ThemedText style={styles.fleetName}>{fleet.companyName || 'Fleet'}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: icon }}>Role: {fleet.role || 'owner'}</ThemedText>
                                </View>
                            </TouchableNativeFeedback>
                        ))}
                    </View>
                ) : (
                    <TouchableNativeFeedback onPress={() => router.push('/Fleet/CreateFleet')}>
                        <View style={styles.emptyCard}>
                            <ThemedText style={styles.emptyCardText}>Create Fleet Account</ThemedText>
                        </View>
                    </TouchableNativeFeedback>
                )}
            </View>





            <ReferralCodeModal
                visible={showReferralModal}
                initialCode={referralCode}
                isSubmitting={isSubmitting}
                onClose={() => setShowReferralModal(!hasReferral)}
                onSubmit={handleSubmitReferralCode}
                onLogout={handleLogout}
                onRefresh={handleRefresh}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: 16,
        paddingTop: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    createButton: {
        borderRadius: 8,
        backgroundColor: '#0f9d5824',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 7,
    },
    createButtonText: {
        color: '#0f9d58',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionHeading: {
        fontSize: 18,
        fontFamily: 'sfregular',
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionDescription: {
        color: '#666',
        marginBottom: 12,
    },
    fleetCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    fleetName: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    fleetRole: {
        fontSize: 12,
        color: '#444',
    },
    emptyCard: {
        backgroundColor: '#0f9d5824',
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
        alignItems: 'center',
    },
    emptyCardText: {
        color: '#0f9d58',
        fontWeight: '700',
    },
});

export default FleetSelector;
