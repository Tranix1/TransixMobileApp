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
import SubscriptionPaymentModal from "@/components/SubscriptionPaymentModal";


function BrokerageSelector() {
    const { user, Logout, setupUser, setCurrentRole , currentRole } = useAuth();
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const ownedBrokerages = Array.isArray(user?.brokergePDetails) ? user.brokergePDetails : [];
    const brokerages = ownedBrokerages.length;
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


    const handleBrokerageSelect = async (brokerage: any) => {

        if (!brokerage) return;

        const brokerageRole = {
            role: 'brokerage' as const,
            brokerageId: brokerage.brokerageId,
            companyName: brokerage.name || brokerage.brokerage,

            userRole: brokerage.userRole || 'owner',
            accType: 'brokerage' as const,

            referrerCode: brokerage.referrerCode || null,
            organizationName: brokerage.name,
            organizationId: brokerage.id,
            phone: `${brokerage.countryCode}${brokerage?.organizationPhone}`,
            email: brokerage.organizationEmail,
            location: brokerage?.location,
        };

        (brokerageRole as any);
        await AsyncStorage.setItem('currentRole', JSON.stringify(brokerageRole));
        setCurrentRole(brokerageRole as any)
        router.replace('/');
    };

    if (!user) {
        return (
            <View style={styles.centered}>
                <ThemedText>Loading account details...</ThemedText>
            </View>
        );
    }

    const [showModal, setShowModal] = useState(true)

    return (
        <View style={[, styles.container, { backgroundColor: background }]}>
            <CustomHeader pageTitle="Brokerage Selector" />

            <SubscriptionPaymentModal
                isVisible={showModal}
                onClose={() => setShowModal(false)}
                subscriptionType="brokerage"      // or "broker" / "tracking"
                 payerOrganizationId={currentRole.organizationId || ""}
                 payerOrganizationName = {currentRole.companyName || ""}
            />


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 13, marginTop: hp(4) }}>
                <ThemedText style={styles.sectionHeading}>Brokerages I Own</ThemedText>

                <TouchableOpacity style={styles.createButton} onPress={() => router.push('/brokerage/CreateBrokerage/Index')}>
                    <ThemedText style={styles.createButtonText}>Create New Brokerage</ThemedText>
                </TouchableOpacity>
            </View>


            <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="car-outline" size={24} color={accent} />
                    <ThemedText style={styles.sectionTitle}>Brokerage</ThemedText>
                </View>
                <ThemedText style={[styles.sectionDescription, { fontSize: 12 }]}>
                    {brokerages > 0
                        ? `Access your ${brokerages} fleet${brokerages > 1 ? 's' : ''} - Manage trucks, drivers, and operations`
                        : 'Brokerages found. Create a fleet to start managing trucks and drivers.'
                    }
                </ThemedText>

                {brokerages > 0 ? (
                    <View style={{ marginTop: 12 }}>
                        {ownedBrokerages.map((brokerage: any) => (
                            <TouchableNativeFeedback key={brokerage.organizationId || brokerage.name} onPress={() => handleBrokerageSelect(brokerage)}>
                                <View style={[styles.fleetCard, { backgroundColor: backgroundLight, borderColor: accent + '20' }]}>
                                    <ThemedText style={styles.fleetName}>{brokerage.name || 'Brokerage'}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: icon }}>Role: {brokerage.role || 'owner'}</ThemedText>
                                </View>
                            </TouchableNativeFeedback>
                        ))}
                    </View>
                ) : (
                    <TouchableNativeFeedback onPress={() => router.push('/brokerage/CreateBrokerage/Index')}>
                        <View style={styles.emptyCard}>
                            <ThemedText style={styles.emptyCardText}>Create Brokerage</ThemedText>
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

export default BrokerageSelector;
