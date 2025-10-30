import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { Image } from 'expo-image'
import { useAuth } from '@/context/AuthContext'
import { router } from 'expo-router'
import { cleanNumber, formatDate, formatNumber } from '@/services/services'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from '@/components/ThemedText'
import Divider from '@/components/Divider'
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import Heading from '@/components/Heading'
import AppLoadingScreen from '@/components/AppLoadingScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FleetVerificationModal from '@/components/FleetVerificationModal'
import { DocumentAsset } from '@/types/types'
import { addDocument, uploadImage, updateDocument } from '@/db/operations'
import { setDoc,doc } from 'firebase/firestore'
import { db } from '@/db/fireBaseConfig'
const Index = () => {

    const { user } = useAuth();

    const [currentRole, setCurrentRole] = useState<'general' | 'fleet' | 'broker'>('general');
    const [showFleetVerification, setShowFleetVerification] = useState(false);

    // Fleet verification state
    const [typeOfFleet, setTypeOfFleet] = useState('');
    const [fleetName, setFleetName] = useState(user?.organisation || '');
    const [fleetPhone, setFleetPhone] = useState(user?.phoneNumber || '');
    const [fleetEmail, setFleetEmail] = useState(user?.email || '');
    const [fleetCountryCode, setFleetCountryCode] = useState({ id: 0, name: '' });
    const [selectedFleetDocuments, setSelectedFleetDocuments] = useState<DocumentAsset[]>([
        user?.idDocument ? { name: 'ID Document', uri: user.idDocument, size: 0, mimeType: user.idDocumentType || 'image/jpeg' } : null,
        user?.proofOfResidence ? { name: 'Proof of Residence', uri: user.proofOfResidence, size: 0, mimeType: user.proofOfResidenceType || 'image/jpeg' } : null,
        user?.selfieDocument ? { name: 'Selfie', uri: user.selfieDocument, size: 0, mimeType: user.selfieDocumentType || 'image/jpeg' } : null,
        null, null
    ].filter(Boolean) as DocumentAsset[]);
    const [fleetFileType, setFleetFileType] = useState<('pdf' | 'image' | 'doc' | 'docx')[]>([
        user?.idDocumentType || 'image',
        user?.proofOfResidenceType || 'image',
        user?.selfieDocumentType || 'image',
        'pdf', 'pdf'
    ]);
    const [uploadingFleetD, setUploadingFleetD] = useState(false);

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')

    useEffect(() => {

        if (!user) {
            router.push('/Account/Login')
            return
        }
        console.log(user.photoURL);


    }, [user])

    const handleFleetSave = async (fleetData: any) => {
        setUploadingFleetD(true);
        try {
            // Generate unique fleet ID
            const fleetId = `FLT_${Date.now()}_${user?.uid}`;

            // Upload documents to Firebase Storage and get URLs
            const uploadPromises = fleetData.selectedFleetDocuments.map(async (doc: DocumentAsset, index: number) => {
                if (!doc) return null;
                const folderName = 'FleetVerification';
                const fileName = `${user?.uid}_${fleetId}_doc_${index}`;
                return await uploadImage(doc, folderName, () => {}, fileName);
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // Prepare fleet verification data
            const fleetVerificationData = {
                fleetId,
                userId: user?.uid,
                accType: 'fleet',
                companyName: fleetData.fleetName,
                fleetMainAdminName: user?.displayName,
                fleetMainAdminPhone: fleetData.fleetPhone,
                fleetMainAdminEmail: fleetData.fleetEmail,
                countryCode: fleetData.fleetCountryCode?.name,
                typeOfFleet: fleetData.typeOfFleet,
                documents: {
                    fleetMainAdminId: uploadedUrls[0],
                    fleetMainAdminIdType: fleetData.fleetFileType[0],
                    proofOfResidence: uploadedUrls[1],
                    proofOfResidenceType: fleetData.fleetFileType[1],
                    selfieDocument: uploadedUrls[2],
                    selfieDocumentType: fleetData.fleetFileType[2],
                    companyCertificate: uploadedUrls[3],
                    companyCertificateType: fleetData.fleetFileType[3],
                    truckRegistrationBook: uploadedUrls[4],
                    truckRegistrationBookType: fleetData.fleetFileType[4],
                },
                verificationStatus: 'pending',
                submittedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Additional scalable fields
                fleetSize: 0,
                activeTrucks: [],
                drivers: [],
                routes: [],
                contracts: [],
                performanceMetrics: {
                    totalLoads: 0,
                    completedLoads: 0,
                    revenue: 0,
                    rating: 0
                }
            };

            // Store in verifiedUsers collection
            await addDocument('verifiedUsers', fleetVerificationData);

            // Create fleet document in fleets collection
            const fleetCollectionData = {
                name: fleetData.fleetName,
                ownerId: user?.uid, // link to verifiedUsers
                fleetId: fleetId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // jobs will be a subcollection, so we don't initialize it here
            };
            
            await setDoc(doc(db, "fleets", fleetId), fleetCollectionData);


            // Update user profile to reflect fleet verification status
            const existingFleets = user?.fleets || [];
            const newFleetAccess = {
                fleetId: fleetId,
                role: 'owner', // owner for the fleet creator
                companyName: fleetData.fleetName
            };

            await updateDocument('personalData', user?.uid!, {
                fleetVerified: true,
                fleets: [...existingFleets, newFleetAccess],
                updatedAt: new Date().toISOString()
            });

            // Close modal and show success
            setShowFleetVerification(false);
            setUploadingFleetD(false);
            alert('Fleet verification submitted successfully! Your account will be reviewed.');

        } catch (error) {
            console.error('Error saving fleet verification:', error);
            setUploadingFleetD(false);
            alert('Error submitting fleet verification. Please try again.');
        }
    };

    const { setCurrentRole: setGlobalCurrentRole } = useAuth();

    const switchRole = async (role: 'general' | 'fleet' | 'broker') => {

        setCurrentRole(role);
        setGlobalCurrentRole(role);
        // Store the selected role in AsyncStorage
        await AsyncStorage.setItem('currentRole', role);
        router.back() // Role selected and stored, user can navigate to Home manually to see the update
    };

    if (!user) {
        return <AppLoadingScreen message="Loading account details..." />;
    }

    return (
        <ScreenWrapper>
            <Heading page='My Account' rightComponent={

                <View style={{ flexDirection: 'row', marginRight: wp(2) }}>
                    <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                        <TouchableNativeFeedback onPress={() => router.push('/Account/Profile')}>
                            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                <Ionicons name='settings-outline' color={icon} size={wp(4)} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                </View>

            } />
            <ScrollView style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image
                        style={styles.avatar}
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
                    />
                    <ThemedText type='title'>{user?.organisation || 'Anonymous User'}</ThemedText>
                    <ThemedText type='tiny' color={icon}>{user?.email || 'No Email Provided'}</ThemedText>
                </View>

                {/* User Details Section */}
                <View style={[styles.card, { backgroundColor: background, borderColor: backgroundLight }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: wp(2) }}>
                        <ThemedText style={styles.cardTitle}>Details</ThemedText>
                        <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                            <TouchableNativeFeedback onPress={() => router.push('/Account/Profile')}>
                                <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                    <AntDesign name='edit' color={icon} size={wp(4)} />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                    <Divider />
                    <View style={styles.cardContent}>
                        <DetailRow label="Phone Number" value={user?.phoneNumber || 'N/A'} />
                        <DetailRow label="Country" value={user?.country || 'N/A'} />
                        <DetailRow label="Address" value={user?.address || 'N/A'} />
                        <DetailRow label="Organization" value={user?.organisation || 'N/A'} />
                        <DetailRow label="Created At" value={formatDate(user?.createdAt || "N/A")} />
                    </View>
                </View>

                {/* Account Sections */}
                <View style={styles.sectionsContainer}>
                    {/* General User Section */}
                    <TouchableNativeFeedback onPress={() => switchRole('general')}>
                        <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="person-outline" size={wp(6)} color={accent} />
                                <ThemedText style={styles.sectionTitle}>General User</ThemedText>
                            </View>
                            <ThemedText style={styles.sectionDescription}>
                                Switch to General User role - Access all features and services
                            </ThemedText>
                        </View>
                    </TouchableNativeFeedback>

                    {/* Fleet Manager Section */}
                    <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="car-outline" size={wp(6)} color={accent} />
                            <ThemedText style={styles.sectionTitle}>Fleet</ThemedText>
                        </View>
                        <ThemedText style={[styles.sectionDescription, { fontSize: 12 }]}>
                            {user?.fleets && user.fleets.length > 0
                                ? `Access your ${user.fleets.length} fleet${user.fleets.length > 1 ? 's' : ''} - Manage trucks, drivers, and operations`
                                : 'Switch to Fleet role - Manage your trucks, drivers, and fleet operations'
                            }
                        </ThemedText>
                        {user?.fleets && user.fleets.length > 0 ? (
                            <View style={{ marginTop: wp(3) }}>
                                {user.fleets.map((fleet: any, index: number) => (
                                    <TouchableNativeFeedback
                                        key={fleet.fleetId}
                                        onPress={() => {
                                            const fleetRole = {
                                                role: 'fleet' as const,
                                                fleetId: fleet.fleetId,
                                                companyName: fleet.companyName,
                                                userRole: fleet.role,
                                                accType: 'fleet' as const
                                            };
                                            setCurrentRole('fleet');
                                            setGlobalCurrentRole(fleetRole);
                                            AsyncStorage.setItem('currentRole', JSON.stringify(fleetRole));
                                            router.back();
                                        }}
                                    >
                                        <View style={{
                                            backgroundColor: backgroundLight,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            marginBottom: wp(2),
                                            borderWidth: 1,
                                            borderColor: accent + '20'
                                        }}>
                                            <ThemedText style={{ fontWeight: 'bold', fontSize: 14, color: accent }}>
                                                {fleet.companyName}
                                            </ThemedText>
                                            <ThemedText style={{ fontSize: 12, color: icon, marginTop: wp(1) }}>
                                                Role: {fleet.role}
                                            </ThemedText>
                                        </View>
                                    </TouchableNativeFeedback>
                                ))}
                            </View>
                        ) : (
                            <TouchableNativeFeedback onPress={() => setShowFleetVerification(true)}>
                                <View style={{
                                    backgroundColor: accent + '10',
                                    borderRadius: wp(2),
                                    padding: wp(3),
                                    marginTop: wp(3),
                                    alignItems: 'center'
                                }}>
                                    <ThemedText style={{ color: accent, fontWeight: 'bold' }}>
                                        Create Fleet Account
                                    </ThemedText>
                                </View>
                            </TouchableNativeFeedback>
                        )}
                    </View>

                    {/* Broker Section */}
                    <TouchableNativeFeedback onPress={() => switchRole('broker')}>
                        <View style={[styles.sectionCard, { backgroundColor: background, borderColor: backgroundLight }]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="briefcase-outline" size={wp(6)} color={accent} />
                                <ThemedText style={styles.sectionTitle}>Broker</ThemedText>
                            </View>
                            <ThemedText style={styles.sectionDescription}>
                                Switch to Broker role - Manage loads, contracts, and brokerage services
                            </ThemedText>
                        </View>
                    </TouchableNativeFeedback>
                </View>

            </ScrollView>

            {/* Fleet Verification Modal */}
            <FleetVerificationModal
                visible={showFleetVerification}
                onClose={() => setShowFleetVerification(false)}
                typeOfFleet={typeOfFleet}
                setTypeOfFleet={setTypeOfFleet}
                fleetName={fleetName}
                setFleetName={setFleetName}
                fleetPhone={fleetPhone}
                setFleetPhone={setFleetPhone}
                fleetEmail={fleetEmail}
                setFleetEmail={setFleetEmail}
                fleetCountryCode={fleetCountryCode}
                setFleetCountryCode={setFleetCountryCode}
                selectedFleetDocuments={selectedFleetDocuments}
                setSelectedFleetDocuments={setSelectedFleetDocuments}
                fleetFileType={fleetFileType}
                setFleetFileType={setFleetFileType}
                uploadingFleetD={uploadingFleetD}
                onSave={handleFleetSave}
            />
        </ScreenWrapper>
    )
}
const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
        <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
);
export default Index


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    email: {
        fontSize: 16,
        marginTop: 4,
    },
    card: {
        borderRadius: wp(4),
        paddingHorizontal: 16,
        paddingBottom: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 12,
        shadowColor: '#2f2f2f69',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 40,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardContent: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 16,
    },
    additionalInfo: {
        fontSize: 14,
    },
    sectionsContainer: {
        gap: wp(3),
    },
    sectionCard: {
        borderRadius: wp(4),
        padding: wp(4),
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#2f2f2f69',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        marginBottom: wp(2),
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionDescription: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
});