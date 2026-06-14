import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, TouchableNativeFeedback, ToastAndroid } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import CustomHeader from "@/components/CustomHeader";
import ReferralCodeModal from "@/components/ReferralCodeModal";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { validateReferrerCode, setDocuments } from "@/db/operations";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { hp } from "@/constants/common";

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
    const hasReferral = !!user?.referrerId || !!user?.referrerCode;

    useEffect(() => {
        if (user) {
            setShowReferralModal(!hasReferral);
        }
    }, [user, hasReferral]);

    const handleSubmitReferralCode = async (code: string) => {
        if (!code || !code.trim()) {
            ToastAndroid.show('Please enter a referral code.', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            const normalizedCode = code.trim().toUpperCase();
            const validation = await validateReferrerCode(normalizedCode);

            if (!validation.exists || !validation.referrerId) {
                ToastAndroid.show('Invalid referral code. Please check and try again.', ToastAndroid.LONG);
                return;
            }

            const saved = await setDocuments('personalData', { referrerId: validation.referrerId });
            if (!saved) {
                ToastAndroid.show('Unable to save referral code. Please try again.', ToastAndroid.LONG);
                return;
            }

            if (user) {
                await setupUser({ ...user, referrerId: validation.referrerId });
            }

            setReferralCode(normalizedCode);
            setShowReferralModal(false);
            ToastAndroid.show('Referral code accepted.', ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show('Referral validation failed. Please try again.', ToastAndroid.LONG);
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


    const uploadedDocuments = [
    user?.driverProfile?.selfieImage,
    user?.driverProfile?.nationalIdUrl,
    user?.driverProfile?.driverLicenseUrl,
    user?.driverProfile?.passportUrl,
    user?.driverProfile?.medicalCertificateUrl,
    user?.driverProfile?.proofOfResidenceUrl,
    user?.driverProfile?.internationalPermitUrl,
].filter(Boolean).length;

    const handleFleetSelect = async (fleet: any) => {
        if (!fleet) return;

        const fleetRole = {
            role: 'fleet' as const,
            fleetId: fleet.fleetId,
            companyName: fleet.companyName,
            userRole: fleet.role || 'owner',
            accType: 'fleet' as const,
            driverId: fleet.driverId || null,
            fleetMainAdminId: fleet.fleetMainAdminId || null,
            fleetManagerId: fleet.fleetManagerId || null,
            fleetDispatcherId: fleet.fleetDispatcherId || null,
        };

        setCurrentRole(fleetRole);
        await AsyncStorage.setItem('currentRole', JSON.stringify(fleetRole));
        await router.replace('/');
    };

    if (!user) {
        return (
            <View style={styles.centered}>
                <ThemedText>Loading account details...</ThemedText>
            </View>
        );
    }

    return (
        <View style={[,styles.container, { backgroundColor: background }]}>
            <CustomHeader pageTitle="Fleet Selector"  />

          

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 ,paddingHorizontal: 13, marginTop:hp(4)}}>
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
                        : 'No fleets found. Create a fleet to start managing trucks and drivers.'
                    }
                </ThemedText>

                {fleetCount > 0 ? (
                    <View style={{ marginTop: 12 }}>
                        {ownedFleets.map((fleet: any) => (
                            <TouchableNativeFeedback key={fleet.fleetId || fleet.companyName} onPress={() => handleFleetSelect(fleet)}>
                                <View style={[styles.fleetCard, { backgroundColor: backgroundLight, borderColor: accent + '20' }]}>
                                    <ThemedText style={styles.fleetName}>{fleet.companyName || 'Fleet'}</ThemedText>
                                    <ThemedText style={styles.fleetRole}>Role: {fleet.role || 'owner'}</ThemedText>
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

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 ,paddingHorizontal: 13, marginTop:hp(4)}} >
            <ThemedText style={styles.sectionHeading} >Driver Profile</ThemedText>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Ionicons name="documents-outline" size={16} color={accent} />
                    <ThemedText> <ThemedText color={icon} >{uploadedDocuments}</ThemedText>/7</ThemedText>
                </View>

                <TouchableOpacity style={styles.createButton} onPress={() => router.push('/Driver/Add/Index')}>
                <ThemedText style={styles.createButtonText}>{user.driverProfile ? "Edit Registration" : "Driver Registration"}</ThemedText>
            </TouchableOpacity>
                </View>
            <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}> 
                <ThemedText style={[styles.sectionDescription, { fontSize: 12 }]}>No fleet driving assignments are currently available.</ThemedText>
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
