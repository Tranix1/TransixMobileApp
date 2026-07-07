import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, TouchableNativeFeedback, ToastAndroid, ScrollView } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import CustomHeader from "@/components/CustomHeader";
import ReferralCodeModal from "@/components/ReferralCodeModal";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { validateReferrerCode, setDocuments } from "@/db/operations";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from "@/constants/common";
import { db } from "@/db/fireBaseConfig";
import { setDoc, doc, updateDoc } from "firebase/firestore";

interface FleetAccess {
    fleetId: string;
    fleetName: string;
    status: 'pending' | 'active' | 'declined' | 'ended';
    invitedAt?: any;
    acceptedAt?: any;
}

function SwitchRoleSelector() {
    const { user, Logout, setupUser, setCurrentRole } = useAuth();
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    const hasReferral = !!user?.referrerId || !!user?.referrerCode;

    useEffect(() => {
        if (user) {
            setShowReferralModal(!hasReferral);
        }
    }, [user, hasReferral]);

    // ---------- shared referral handlers ----------

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

    // ---------- Fleet (owned) ----------

    const ownedFleets = Array.isArray(user?.fleets) ? user.fleets : [];
    const fleetCount = ownedFleets.length;

    const handleFleetSelect = async (fleet: any) => {
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
            baseAdress: fleet?.baseAdressFull,
        };

        await AsyncStorage.setItem('currentRole', JSON.stringify(fleetRole));
        setCurrentRole(fleetRole as any);
        router.replace('/');
    };

    // ---------- Brokerage (owned) ----------

    const ownedBrokerages = Array.isArray(user?.brokergePDetails) ? user.brokergePDetails : [];
    const brokerageCount = ownedBrokerages.length;

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

        await AsyncStorage.setItem('currentRole', JSON.stringify(brokerageRole));
        setCurrentRole(brokerageRole as any);
        router.replace('/');
    };

    // ---------- Driver (fleet connections) ----------

    const uploadedDocuments = [
        user?.driverProfile?.selfieImage,
        user?.driverProfile?.nationalIdUrl,
        user?.driverProfile?.driverLicenseUrl,
        user?.driverProfile?.passportUrl,
        user?.driverProfile?.medicalCertificateUrl,
        user?.driverProfile?.proofOfResidenceUrl,
        user?.driverProfile?.internationalPermitUrl,
    ].filter(Boolean).length;

    const accessibleFleets: FleetAccess[] = user?.accesibleFleets || [];

    const pendingCount = accessibleFleets.filter(fleet => fleet.status === 'pending').length;
    const approvedCount = accessibleFleets.filter(fleet => fleet.status === 'active').length;
    const rejectedCount = accessibleFleets.filter(fleet => fleet.status === 'declined').length;
    const removedCount = accessibleFleets.filter(fleet => fleet.status === 'ended').length;

    const pendingFleets = accessibleFleets.filter(fleet => fleet.status === 'pending');
    const activeFleets = accessibleFleets.filter(fleet => fleet.status === 'active');

    const [fleetFilter, setFleetFilter] = useState<'active' | 'pending' | 'removed'>('pending');

    const filteredFleets =
        fleetFilter === 'active'
            ? activeFleets
            : fleetFilter === 'pending'
            ? pendingFleets
            : accessibleFleets.filter(fleet => fleet.status === 'ended' || fleet.status === 'declined');

    const handleDriverDecision = async (fleet: any, decision: 'active' | 'declined') => {
        try {
            if (user?.uid) {
                const userRef = doc(db, 'personalData', user?.uid);
                const updatedAccessibleFleets = accessibleFleets.map((f: any) =>
                    f.fleetId === fleet.fleetId ? { ...f, status: decision } : f
                );

                await updateDoc(userRef, { accesibleFleets: updatedAccessibleFleets });

                if (decision === 'active') {
                    const driverRef = doc(db, 'fleets', fleet.fleetId, 'Drivers', `DRV_${user?.uid}`);
                    await setDoc(driverRef, {
                        status: 'active',
                        joinedAt: new Date().toISOString(),
                    }, { merge: true });

                    const contactDetails = {
                        userName: user?.displayName,
                        email: user?.email,
                        phoneNumber: user?.phoneNumber,
                        photoUrl: user?.photoURL,
                        userId: user?.uid,
                        userRole: "driver",
                        status: "active",
                    };

                    const contactRef = doc(db, 'fleets', fleet.fleetId, 'Contacts', `DRV_${user?.uid}`);
                    await setDoc(contactRef, contactDetails);
                } else {
                    const driverRef = doc(db, 'fleets', fleet?.fleetId, 'Drivers', `DRV_${user?.uid}`);
                    await setDoc(driverRef, {
                        status: 'declined',
                        joinedAt: new Date().toISOString(),
                    }, { merge: true });
                }

                ToastAndroid.show(`Fleet invitation ${decision} successfully!`, ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Error updating fleet decision:", error);
        }
    };

    if (!user) {
        return (
            <View style={styles.centered}>
                <ThemedText>Loading account details...</ThemedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <CustomHeader pageTitle="Switch Role" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(4) }}>

                {/* ---------------- FLEET SECTION ---------------- */}
                <View style={styles.sectionHeaderRow}>
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
                            : 'No fleets found. Create a fleet to start managing trucks and drivers.'}
                    </ThemedText>

                    {fleetCount > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled
                            style={{ marginTop: 12 }}
                            contentContainerStyle={{ gap: wp(3) }}
                        >
                            {ownedFleets.map((fleet: any) => (
                                <TouchableNativeFeedback key={fleet.fleetId || fleet.companyName} onPress={() => handleFleetSelect(fleet)}>
                                    <View style={[styles.horizontalCard, { backgroundColor: backgroundLight, borderColor: accent + '20' }]}>
                                        <ThemedText style={styles.fleetName}>{fleet.companyName || 'Fleet'}</ThemedText>
                                        <ThemedText style={{ fontSize: 12, color: icon }}>Role: {fleet.role || 'owner'}</ThemedText>
                                    </View>
                                </TouchableNativeFeedback>
                            ))}
                        </ScrollView>
                    ) : (
                        <TouchableNativeFeedback onPress={() => router.push('/Fleet/CreateFleet')}>
                            <View style={styles.emptyCard}>
                                <ThemedText style={styles.emptyCardText}>Create Fleet Account</ThemedText>
                            </View>
                        </TouchableNativeFeedback>
                    )}
                </View>

                {/* ---------------- BROKERAGE SECTION ---------------- */}
                <View style={styles.sectionHeaderRow}>
                    <ThemedText style={styles.sectionHeading}>Brokerages I Own</ThemedText>
                    <TouchableOpacity style={styles.createButton} onPress={() => router.push('/brokerage/CreateBrokerage/Index')}>
                        <ThemedText style={styles.createButtonText}>Create New Brokerage</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="briefcase-outline" size={24} color={accent} />
                        <ThemedText style={styles.sectionTitle}>Brokerage</ThemedText>
                    </View>
                    <ThemedText style={[styles.sectionDescription, { fontSize: 12 }]}>
                        {brokerageCount > 0
                            ? `Access your ${brokerageCount} brokerage${brokerageCount > 1 ? 's' : ''} - Manage loads and carriers`
                            : 'No brokerages found. Create a brokerage to start managing loads and carriers.'}
                    </ThemedText>

                    {brokerageCount > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled
                            style={{ marginTop: 12 }}
                            contentContainerStyle={{ gap: wp(3) }}
                        >
                            {ownedBrokerages.map((brokerage: any) => (
                                <TouchableNativeFeedback key={brokerage.organizationId || brokerage.name} onPress={() => handleBrokerageSelect(brokerage)}>
                                    <View style={[styles.horizontalCard, { backgroundColor: backgroundLight, borderColor: accent + '20' }]}>
                                        <ThemedText style={styles.fleetName}>{brokerage.name || 'Brokerage'}</ThemedText>
                                        <ThemedText style={{ fontSize: 12, color: icon }}>Role: {brokerage.role || 'owner'}</ThemedText>
                                    </View>
                                </TouchableNativeFeedback>
                            ))}
                        </ScrollView>
                    ) : (
                        <TouchableNativeFeedback onPress={() => router.push('/brokerage/CreateBrokerage/Index')}>
                            <View style={styles.emptyCard}>
                                <ThemedText style={styles.emptyCardText}>Create Brokerage</ThemedText>
                            </View>
                        </TouchableNativeFeedback>
                    )}
                </View>

                {/* ---------------- DRIVER SECTION ---------------- */}
                <View style={styles.sectionHeaderRow}>
                    <ThemedText style={styles.sectionHeading}>Driver Profile</ThemedText>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="documents-outline" size={16} color={accent} />
                        <ThemedText style={{ fontSize: 12 }}>
                            <ThemedText color={icon}>{uploadedDocuments}</ThemedText>/7
                        </ThemedText>
                    </View>

                    <TouchableOpacity style={styles.createButton} onPress={() => router.push('/Driver/Add/Index')}>
                        <ThemedText style={styles.createButtonText}>{user.driverProfile ? "Edit Registration" : "Driver Registration"}</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: wp(3), paddingHorizontal: 13 }}>
                    {[
                        { id: 'pending', label: 'Pending', count: pendingCount },
                        { id: 'active', label: 'Active', count: approvedCount },
                        { id: 'removed', label: 'Inactive', count: removedCount + rejectedCount },
                    ].map(item => {
                        const selected = fleetFilter === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setFleetFilter(item.id as any)}
                                style={{
                                    paddingHorizontal: wp(3),
                                    paddingVertical: wp(1.5),
                                    borderRadius: wp(5),
                                    backgroundColor: selected ? accent : backgroundLight,
                                }}
                            >
                                <ThemedText
                                    style={{
                                        color: selected ? '#fff' : icon,
                                        fontSize: wp(3.2),
                                        fontWeight: '600',
                                    }}
                                >
                                    {item.label} {item.count}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {filteredFleets.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled
                        style={{ paddingLeft: 13 }}
                        contentContainerStyle={{ gap: wp(3), paddingRight: 13 }}
                    >
                        {filteredFleets.map((driver) => (
                            <View
                                key={driver.fleetId}
                                style={[
                                    styles.driverCard,
                                    { backgroundColor: background, borderColor: backgroundLight },
                                ]}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => driver.status === 'active' && handleFleetSelect(driver)}
                                        style={{ flex: 1 }}
                                    >
                                        <ThemedText style={{ fontWeight: '700', fontSize: wp(4) }}>
                                            {driver.fleetName}
                                        </ThemedText>
                                        <ThemedText style={{ fontSize: 12, color: icon }}>
                                            Fleet connection
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <View
                                        style={{
                                            backgroundColor:
                                                driver.status === 'pending' ? '#FFF3E0'
                                                : driver.status === 'active' ? '#E8F5E9'
                                                : '#FFEBEE',
                                            paddingHorizontal: wp(2),
                                            paddingVertical: wp(1),
                                            borderRadius: wp(4),
                                        }}
                                    >
                                        <ThemedText
                                            style={{
                                                fontSize: 11,
                                                fontWeight: '700',
                                                color:
                                                    driver.status === 'pending' ? '#EF6C00'
                                                    : driver.status === 'active' ? '#2E7D32'
                                                    : '#C62828',
                                            }}
                                        >
                                            {driver.status.toUpperCase()}
                                        </ThemedText>
                                    </View>
                                </View>

                                {driver.status === 'pending' && (
                                    <View style={{ flexDirection: 'row', gap: wp(2), marginTop: wp(3) }}>
                                        <TouchableOpacity
                                            onPress={() => handleDriverDecision(driver, 'declined')}
                                            style={{
                                                flex: 1,
                                                padding: wp(2),
                                                borderRadius: wp(2),
                                                borderWidth: 1,
                                                borderColor: backgroundLight,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <ThemedText>Decline</ThemedText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleDriverDecision(driver, 'active')}
                                            style={{
                                                flex: 1,
                                                padding: wp(2),
                                                borderRadius: wp(2),
                                                backgroundColor: '#E8F5E9',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <ThemedText style={{ color: '#2E7D32', fontWeight: '700' }}>Accept</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight, marginHorizontal: 13 }]}>
                        <ThemedText style={{ fontSize: 12, color: icon }}>
                            No {fleetFilter} fleet records found.
                        </ThemedText>
                    </View>
                )}

            </ScrollView>

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

const CARD_WIDTH = wp(62);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 13,
        marginTop: hp(3),
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
        fontSize: 14,
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
        marginBottom: 8,
        marginHorizontal: 13,
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
    horizontalCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        width: CARD_WIDTH,
    },
    driverCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        width: CARD_WIDTH,
    },
    fleetName: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
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

export default SwitchRoleSelector;
