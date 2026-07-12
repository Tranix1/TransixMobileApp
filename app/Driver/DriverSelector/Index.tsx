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
import { setDoc,doc,updateDoc, arrayUnion } from "firebase/firestore";

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



    const accessibleFleets: FleetAccess[] = user?.accesibleFleets || [];


    const pendingCount = accessibleFleets.filter(
        fleet => fleet.status === 'pending'
    ).length;

    const approvedCount = accessibleFleets.filter(
        fleet => fleet.status === 'active'
    ).length;

    const rejectedCount = accessibleFleets.filter(
        fleet => fleet.status === 'declined'
    ).length;

    const removedCount = accessibleFleets.filter(
        fleet => fleet.status === 'ended'
    ).length;

    const driverFleetCount = accessibleFleets.length;


    const pendingFleets = accessibleFleets.filter(
        fleet => fleet.status === "pending"
    );

    const activeFleets = accessibleFleets.filter(
        fleet => fleet.status === "active"
    );


    const [fleetFilter, setFleetFilter] = useState<'active' | 'pending' | 'endedj'>('pending');



const filteredFleets =
    fleetFilter === 'active'
        ? activeFleets
        : fleetFilter === 'pending'
        ? pendingFleets
        : accessibleFleets.filter(
            fleet => fleet.status === 'ended' || fleet.status === 'declined'
          );




    // const handleFleetDecision = async (fleet: any , decision: 'accepted' | 'rejected') => {

    // }

    const handleDriverDecision = async (fleet: any, decision: 'active' | 'declined') => {
    try {
        if(user?.uid){

        // setRefreshing(true); // Assuming you have a loading state

        // 1. Update the user's document
        // We need to find the specific fleet in the array and update its 'accepted' status
        const userRef = doc(db, 'personalData', user?.uid); // Ensure you have the current userId
        const updatedAccessibleFleetss = accessibleFleets.map((f: any) => 
            f.fleetId === fleet.fleetId ? { ...f, status: decision } : f
        );

        await updateDoc(userRef, { accesibleFleets: updatedAccessibleFleetss });


        // 2. Update the Fleet's 'Drivers' sub-collection
        // If accepted, we might want to ensure the driver exists there
        if (decision === 'active') {

            const driverRef = doc(db, 'fleets', fleet.fleetId, 'Drivers', `DRV_${user?.uid}` );
            await setDoc(driverRef, {
                status: 'active',
                joinedAt: new Date().toISOString(),
                // Add any other default fields needed
            }, { merge: true });

           const contactDetails={   
                userName : user?.displayName ,
                email : user?.email ,
                phoneNumber : user?.phoneNumber ,
                photoUrl : user?.photoURL ,
                userId : user?.uid ,    
                userRole : "driver" ,
                status : "active",
            }

            const contactRef = doc(db, 'fleets', fleet.fleetId, 'Contacts', `DRV_${user?.uid}` );
            await setDoc(contactRef, contactDetails);



        } else  {
            // If declined, we remove them from the fleet's active list
            
                const driverRef = doc(db, 'fleets', fleet?.fleetId, 'Drivers', user.uid);

                await setDoc(driverRef, {
                    status: 'declined',
                    joinedAt: new Date().toISOString(),
                    // Add any other default fields needed
                }, { merge: true });

        }

        // Optionally refresh your local state
              ToastAndroid.show( `Fleet invitation ${decision} successfully!`, ToastAndroid.SHORT);
        
        }

    } catch (error) {
        console.error("Error updating fleet decision:", error);
    } finally {
        // setRefreshing(false);
    }
};



    
    const handleDriverSelect = async (fleet: any) => {    
        console.log(fleet.referrerCode,  "The refferal code  ")
        if (!fleet) return;

        const fleetRole = {
            role: 'driver' as const,
            fleetId: fleet.fleetId,
            companyName: fleet.companyName || fleet.fleetName,
            userRole  : fleet.userRole || 'owner',
            accType: 'driver' as const,
            driverId: fleet.driverId || null,

            fleetMainAdminId: fleet.fleetMainAdminId || null,
            fleetManagerId: fleet.fleetManagerId || null,
            fleetDispatcherId: fleet.fleetDispatcherId || null,

            referrerCode : fleet.referrerCode || null ,

            organizationName : fleet.companyName || fleet.fleetName ,
            organizationId : fleet.fleetId ,

            phone : `${fleet.countryCode}${fleet?.organizationPhone}` ,
            email : fleet.organizationEmail ,
            billingAddress : fleet?.billingAddressFull ,
            baseAdress : fleet?.baseAdressFull  
            
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
       <View style={[styles.container, { backgroundColor: background }]}>
    <CustomHeader pageTitle="Driver Selector" />

    {/* Filter tabs */}
    <View style={styles.filterRow}>
        {[
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'active', label: 'Active', count: approvedCount },
            { id: 'removed', label: 'Inactive', count: removedCount + rejectedCount },
        ].map((item) => {
            const selected = fleetFilter === item.id;
            return (
                <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => setFleetFilter(item.id as any)}
                    style={[
                        styles.filterChip,
                        {
                            backgroundColor: selected ? accent : backgroundLight,
                            borderColor: selected ? accent : 'rgba(128,128,128,0.2)',
                        },
                    ]}
                >
                    <ThemedText
                        style={{
                            color: selected ? '#fff' : icon,
                            fontSize: wp(3.2),
                            fontWeight: '600',
                        }}
                    >
                        {item.label}
                    </ThemedText>
                    <View
                        style={[
                            styles.filterCountBadge,
                            { backgroundColor: selected ? 'rgba(255,255,255,0.25)' : 'rgba(128,128,128,0.15)' },
                        ]}
                    >
                        <ThemedText
                            style={{
                                color: selected ? '#fff' : icon,
                                fontSize: wp(2.9),
                                fontWeight: '700',
                            }}
                        >
                            {item.count}
                        </ThemedText>
                    </View>
                </TouchableOpacity>
            );
        })}
    </View>

    {/* Driver profile header */}
    <View style={styles.profileHeader}>
        <View style={{ flex: 1 }}>
            <ThemedText style={styles.sectionHeading}>Driver Profile</ThemedText>

            <View style={styles.docCountRow}>
                <Ionicons name="documents-outline" size={14} color={accent} />
                <ThemedText style={{ fontSize: wp(3), color: icon, marginLeft: 4 }}>
                    <ThemedText style={{ fontSize: wp(3), fontWeight: '700' }} color={icon}>
                        {uploadedDocuments}
                    </ThemedText>
                    /7 documents
                </ThemedText>
            </View>
        </View>

        <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.85}
            onPress={() => router.push('/Driver/Add/Index')}
        >
            <ThemedText style={styles.createButtonText}>
                {user.driverProfile ? 'Edit Registration' : 'Driver Registration'}
            </ThemedText>
        </TouchableOpacity>
    </View>

    {/* Driver / fleet list */}
    {filteredFleets.length > 0 ? (
        <View>
            {filteredFleets.map((driver) => {
                const statusStyle =
                    driver.status === 'pending'
                        ? { bg: '#FFF3E0', text: '#EF6C00' }
                        : driver.status === 'active'
                        ? { bg: '#E8F5E9', text: '#2E7D32' }
                        : { bg: '#FFEBEE', text: '#C62828' };

                return (
                    <View
                        key={driver.fleetId}
                        style={[
                            styles.sectionCard,
                            {
                                backgroundColor: background,
                                borderColor: 'rgba(128,128,128,0.2)',
                                marginBottom: wp(3),
                            },
                        ]}
                    >
                        <View style={styles.cardTopRow}>
                            <TouchableOpacity
                                onPress={() => driver.status === 'active' && handleDriverSelect(driver)}
                                disabled={driver.status !== 'active'}
                                activeOpacity={0.7}
                                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                            >
                                <View style={[styles.fleetIcon, { backgroundColor: `${accent}1A` }]}>
                                    <Ionicons name="business-outline" size={18} color={accent} />
                                </View>

                                <View style={{ flex: 1, marginLeft: wp(2.5) }}>
                                    <ThemedText style={styles.fleetName} numberOfLines={1}>
                                        {driver.fleetName}
                                    </ThemedText>
                                    <ThemedText style={styles.fleetSubtext}>Fleet connection</ThemedText>
                                </View>

                                {driver.status === 'active' && (
                                    <Ionicons name="chevron-forward" size={18} color={icon} style={{ opacity: 0.5 }} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                            <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                                {driver.status.toUpperCase()}
                            </ThemedText>
                        </View>

                        {driver.status === 'pending' && (
                            <View style={styles.decisionRow}>
                                <TouchableOpacity
                                    onPress={() => handleDriverDecision(driver, 'declined')}
                                    activeOpacity={0.8}
                                    style={styles.declineButton}
                                >
                                    <ThemedText style={{ fontWeight: '600', fontSize: wp(3.4) }}>Decline</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDriverDecision(driver, 'active')}
                                    activeOpacity={0.8}
                                    style={styles.acceptButton}
                                >
                                    <Ionicons name="checkmark" size={16} color="#2E7D32" />
                                    <ThemedText style={styles.acceptButtonText}>Accept</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    ) : (
        <View
            style={[
                styles.sectionCard,
                styles.emptyState,
                { backgroundColor: background, borderColor: 'rgba(128,128,128,0.2)' },
            ]}
        >
            <Ionicons name="file-tray-outline" size={26} color={icon} style={{ opacity: 0.4, marginBottom: 6 }} />
            <ThemedText style={{ fontSize: wp(3.2), color: icon }}>
                No {fleetFilter} fleet records found.
            </ThemedText>
        </View>
    )}

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
    filterRow: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: wp(2),
    marginBottom: wp(4),
    paddingHorizontal: wp(3.5),
},
filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: wp(1.8),
    borderRadius: wp(5),
    borderWidth: 1,
    gap: wp(1.5),
},
filterCountBadge: {
    minWidth: wp(5),
    paddingHorizontal: wp(1),
    paddingVertical: 1,
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
},

profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(2.5),
    paddingHorizontal: wp(3.5),
    marginTop: hp(3),
    gap: wp(3),
},
docCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
},

fleetIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
},
cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
fleetName: { fontWeight: '700', fontSize: wp(3.8) },
fleetSubtext: { fontSize: 11.5, color: '#8A8A8E', marginTop: 1 },

statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: wp(2.2),
    paddingVertical: wp(0.9),
    borderRadius: wp(3),
    marginTop: wp(2.5),
},
statusDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 5 },
statusText: { fontSize: 10.5, fontWeight: '700' },

decisionRow: { flexDirection: 'row', gap: wp(2), marginTop: wp(3) },
declineButton: {
    flex: 1,
    padding: wp(2.2),
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    alignItems: 'center',
},
acceptButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    padding: wp(2.2),
    borderRadius: wp(2.5),
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
},
acceptButtonText: { color: '#2E7D32', fontWeight: '700', fontSize: wp(3.4) },

emptyState: { alignItems: 'center', paddingVertical: wp(6) },
});

export default FleetSelector;
