import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/services/services';
import { approveLoad, rejectLoad, getDocById } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import { Load } from '@/types/types';

interface PersonalDetails {
    id: string;
    userId: string;
    accType: 'general' | 'professional';
    fullName: string;
    phoneNumber: string;
    email: string;
    countryCode: string;
    idDocument?: string;
    idDocumentType?: string;
    proofOfResidence?: string;
    proofOfResidenceType?: string;
    brokerId?: string;
    brokerIdType?: string;
    companyRegCertificate?: string;
    companyRegCertificateType?: string;
    companyLetterHead?: string;
    companyLetterHeadType?: string;
    typeOfBroker?: string;
    createdAt: string;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
}

const LoadDetailsView = () => {
    const { loadId, details } = useLocalSearchParams();
    const [loadDetails, setLoadDetails] = useState<Load | null>(null);
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const { user } = useAuth();

    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const textColor = useThemeColor('text');
    const accent = useThemeColor('accent');

    useEffect(() => {
        if (details) {
            try {
                const parsedDetails = JSON.parse(details as string);
                setLoadDetails(parsedDetails);

                // Fetch personal details if available
                if (parsedDetails.personalDetailsDocId) {
                    fetchPersonalDetails(parsedDetails.personalDetailsDocId);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error parsing load details:', error);
                Alert.alert('Error', 'Failed to load load details');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [details]);

    const fetchPersonalDetails = async (personalDetailsDocId: string) => {
        try {
            const personalData = await getDocById('cargoPersonalDetails', (data) => {
                if (data && data.id === personalDetailsDocId) {
                    setPersonalDetails(data as PersonalDetails);
                }
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching personal details:', error);
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!loadDetails || !user) return;

        // Check if personal details are approved
        if (personalDetails && !personalDetails.isApproved) {
            Alert.alert(
                'Personal Details Not Approved',
                'This user\'s personal details are not yet approved. Please approve their personal details first before approving the load.',
                [{ text: 'OK' }]
            );
            return;
        }

        Alert.alert(
            'Approve Load',
            'Are you sure you want to approve this load?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            await approveLoad(loadDetails.id, user.uid);

                            Alert.alert('Success', 'Load approved successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error approving load:', error);
                            Alert.alert('Error', 'Failed to approve load');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async () => {
        if (!loadDetails || !user) return;

        Alert.prompt(
            'Reject Load',
            'Please provide a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async (rejectionReason) => {
                        if (!rejectionReason || rejectionReason.trim() === '') {
                            Alert.alert('Error', 'Please provide a rejection reason');
                            return;
                        }

                        setProcessing(true);
                        try {
                            await rejectLoad(loadDetails.id, user.uid, rejectionReason.trim());

                            Alert.alert('Success', 'Load rejected successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error rejecting load:', error);
                            Alert.alert('Error', 'Failed to reject load');
                        } finally {
                            setProcessing(false);
                        }
                    }
                }
            ],
            'plain-text',
            ''
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#F48024';
            case 'approved':
                return '#4CAF50';
            case 'rejected':
                return '#F44336';
            case 'edited':
                return '#2196F3';
            default:
                return accent;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return 'time-outline';
            case 'approved':
                return 'checkmark-circle-outline';
            case 'rejected':
                return 'close-circle-outline';
            case 'edited':
                return 'create-outline';
            default:
                return 'help-circle-outline';
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Load Details' />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accent} />
                    <ThemedText style={{ marginTop: wp(4) }}>Loading load details...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!loadDetails) {
        return (
            <ScreenWrapper>
                <Heading page='Load Details' />
                <View style={styles.errorContainer}>
                    <ThemedText>Load details not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Load Details' />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Status Header */}
                <View style={[styles.statusHeader, { backgroundColor: backgroundLight }]}>
                    <View style={styles.statusInfo}>
                        <Ionicons
                            name={getStatusIcon(loadDetails.approvalStatus)}
                            size={wp(6)}
                            color={getStatusColor(loadDetails.approvalStatus)}
                        />
                        <View style={styles.statusTextContainer}>
                            <ThemedText type="subtitle">
                                {loadDetails.approvalStatus.charAt(0).toUpperCase() + loadDetails.approvalStatus.slice(1)}
                            </ThemedText>
                            <ThemedText type="tiny" style={{ color: icon }}>
                                Submitted: {formatDate(loadDetails.submittedAt || loadDetails.createdAt)}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Load Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Load Information</ThemedText>

                    <View style={styles.detailRow}>
                        <Ionicons name="cube-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Load Type</ThemedText>
                            <ThemedText>{loadDetails.typeofLoad}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Route</ThemedText>
                            <ThemedText>{loadDetails.origin} → {loadDetails.destination}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Loading Date</ThemedText>
                            <ThemedText>{loadDetails.loadingDate || 'Not specified'}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Rate</ThemedText>
                            <ThemedText>{loadDetails.rate} {loadDetails.currency} / {loadDetails.model}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="card-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Payment Terms</ThemedText>
                            <ThemedText>{loadDetails.paymentTerms}</ThemedText>
                        </View>
                    </View>

                    {loadDetails.distance && (
                        <View style={styles.detailRow}>
                            <Ionicons name="speedometer-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Distance & Duration</ThemedText>
                                <ThemedText>{loadDetails.distance} • {loadDetails.duration}</ThemedText>
                            </View>
                        </View>
                    )}
                </View>

                {/* Company Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Company Information</ThemedText>

                    <View style={styles.detailRow}>
                        <Ionicons name="business-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Company</ThemedText>
                            <ThemedText>{loadDetails.companyName}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={wp(4)} color={icon} />
                        <View style={styles.detailContent}>
                            <ThemedText type="tiny" style={{ color: icon }}>Contact</ThemedText>
                            <ThemedText>{loadDetails.contact}</ThemedText>
                        </View>
                    </View>

                    {loadDetails.personalAccType && (
                        <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Account Type</ThemedText>
                                <ThemedText>
                                    {loadDetails.personalAccType}
                                    {loadDetails.personalAccTypeIsApproved ? ' (Approved)' : ' (Pending)'}
                                </ThemedText>
                            </View>
                        </View>
                    )}
                </View>

                {/* Personal Details Section */}
                {personalDetails && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Personal Details</ThemedText>

                        <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Full Name</ThemedText>
                                <ThemedText>{personalDetails.fullName}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="call-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Phone</ThemedText>
                                <ThemedText>{personalDetails.countryCode} {personalDetails.phoneNumber}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="mail-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Email</ThemedText>
                                <ThemedText>{personalDetails.email}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="shield-checkmark-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Account Type</ThemedText>
                                <ThemedText>
                                    {personalDetails.accType.charAt(0).toUpperCase() + personalDetails.accType.slice(1)}
                                    {personalDetails.isApproved ? ' (Approved)' : ' (Pending)'}
                                </ThemedText>
                            </View>
                        </View>

                        {personalDetails.typeOfBroker && (
                            <View style={styles.detailRow}>
                                <Ionicons name="briefcase-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Broker Type</ThemedText>
                                    <ThemedText>{personalDetails.typeOfBroker}</ThemedText>
                                </View>
                            </View>
                        )}

                        {/* Document Status */}
                        <View style={styles.detailRow}>
                            <Ionicons name="document-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Documents</ThemedText>
                                <ThemedText>
                                    {(personalDetails.idDocument || personalDetails.brokerId) ? '✓ ID Document' : '✗ ID Document'}
                                    {personalDetails.accType === 'professional' && (
                                        <>
                                            {'\n'}
                                            {personalDetails.proofOfResidence ? '✓ Proof of Residence' : '✗ Proof of Residence'}
                                            {personalDetails.typeOfBroker === 'Company Broker' && (
                                                <>
                                                    {'\n'}
                                                    {personalDetails.companyRegCertificate ? '✓ Company Certificate' : '✗ Company Certificate'}
                                                    {'\n'}
                                                    {personalDetails.companyLetterHead ? '✓ Company Letter Head' : '✗ Company Letter Head'}
                                                </>
                                            )}
                                        </>
                                    )}
                                </ThemedText>
                            </View>
                        </View>

                        {/* Personal Details Approval Status */}
                        <View style={styles.detailRow}>
                            <Ionicons
                                name={personalDetails.isApproved ? "checkmark-circle" : "time-outline"}
                                size={wp(4)}
                                color={personalDetails.isApproved ? "#4CAF50" : "#FF9800"}
                            />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Personal Details Status</ThemedText>
                                <ThemedText style={{
                                    color: personalDetails.isApproved ? "#4CAF50" : "#FF9800",
                                    fontWeight: 'bold'
                                }}>
                                    {personalDetails.isApproved ? 'Approved' : 'Pending Approval'}
                                </ThemedText>
                            </View>
                        </View>

                        {/* Link to Personal Details Approval */}
                        {!personalDetails.isApproved && (
                            <TouchableOpacity
                                style={[styles.linkButton, { backgroundColor: backgroundLight, borderColor: accent }]}
                                onPress={() => {
                                    // Navigate to personal details approval page
                                    router.push({
                                        pathname: '/Account/Admin/LoadAccountDetailsView',
                                        params: {
                                            accountId: personalDetails.id,
                                            details: JSON.stringify(personalDetails)
                                        }
                                    });
                                }}
                            >
                                <Ionicons name="eye-outline" size={wp(4)} color={accent} />
                                <ThemedText style={{ color: accent, marginLeft: wp(2), fontWeight: '600' }}>
                                    Review Personal Details
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Additional Details */}
                {(loadDetails.requirements || loadDetails.additionalInfo || loadDetails.alertMsg || loadDetails.fuelAvai) && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Additional Details</ThemedText>

                        {loadDetails.requirements && (
                            <View style={styles.detailRow}>
                                <Ionicons name="list-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Requirements</ThemedText>
                                    <ThemedText>{loadDetails.requirements}</ThemedText>
                                </View>
                            </View>
                        )}

                        {loadDetails.additionalInfo && (
                            <View style={styles.detailRow}>
                                <Ionicons name="information-circle-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Additional Info</ThemedText>
                                    <ThemedText>{loadDetails.additionalInfo}</ThemedText>
                                </View>
                            </View>
                        )}

                        {loadDetails.alertMsg && (
                            <View style={styles.detailRow}>
                                <Ionicons name="alert-circle-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Alert Message</ThemedText>
                                    <ThemedText>{loadDetails.alertMsg}</ThemedText>
                                </View>
                            </View>
                        )}

                        {loadDetails.fuelAvai && (
                            <View style={styles.detailRow}>
                                <Ionicons name="car-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Fuel & Tolls</ThemedText>
                                    <ThemedText>{loadDetails.fuelAvai}</ThemedText>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Return Load */}
                {loadDetails.returnLoad && loadDetails.returnLoad !== 'No return load' && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Return Load</ThemedText>

                        <View style={styles.detailRow}>
                            <Ionicons name="return-up-back-outline" size={wp(4)} color={icon} />
                            <View style={styles.detailContent}>
                                <ThemedText type="tiny" style={{ color: icon }}>Return Load</ThemedText>
                                <ThemedText>{loadDetails.returnLoad}</ThemedText>
                            </View>
                        </View>

                        {loadDetails.returnRate && (
                            <View style={styles.detailRow}>
                                <Ionicons name="cash-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Return Rate</ThemedText>
                                    <ThemedText>{loadDetails.returnRate} {loadDetails.currency}</ThemedText>
                                </View>
                            </View>
                        )}

                        {loadDetails.returnTerms && (
                            <View style={styles.detailRow}>
                                <Ionicons name="document-text-outline" size={wp(4)} color={icon} />
                                <View style={styles.detailContent}>
                                    <ThemedText type="tiny" style={{ color: icon }}>Return Terms</ThemedText>
                                    <ThemedText>{loadDetails.returnTerms}</ThemedText>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Truck Requirements */}
                {loadDetails.trucksRequired && loadDetails.trucksRequired.length > 0 && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Truck Requirements</ThemedText>

                        {loadDetails.trucksRequired.map((truck, index) => (
                            <View key={index} style={styles.truckItem}>
                                <ThemedText type="tiny" style={{ color: icon }}>Truck {index + 1}</ThemedText>
                                <ThemedText>
                                    {truck.cargoArea?.name || truck.cargoArea} • {truck.truckType?.name || truck.truckType} • {truck.capacity?.name || truck.capacity}
                                </ThemedText>
                                {truck.operationCountries && truck.operationCountries.length > 0 && (
                                    <ThemedText type="tiny" style={{ color: icon }}>
                                        Countries: {truck.operationCountries.join(', ')}
                                    </ThemedText>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Proof of Order */}
                {loadDetails.proofOfOrder && loadDetails.proofOfOrder.length > 0 && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Proof of Order</ThemedText>
                        <ThemedText type="tiny" style={{ color: icon }}>
                            {loadDetails.proofOfOrder.length} file(s) uploaded
                        </ThemedText>
                    </View>
                )}

                {/* Load Images */}
                {loadDetails.loadImages && loadDetails.loadImages.length > 0 && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Load Images</ThemedText>
                        <ThemedText type="tiny" style={{ color: icon }}>
                            {loadDetails.loadImages.length} image(s) uploaded
                        </ThemedText>
                    </View>
                )}

                {/* Action Buttons */}
                {loadDetails.approvalStatus === 'pending' && (
                    <View style={styles.actionButtonsContainer}>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.customButton,
                                    styles.rejectButton,
                                    { marginRight: wp(2) },
                                    processing && styles.disabledButton
                                ]}
                                onPress={handleReject}
                                disabled={processing}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close-circle" size={wp(4)} color="#FFFFFF" style={{ marginRight: wp(2) }} />
                                <ThemedText style={[styles.buttonText, styles.rejectButtonText]}>
                                    Reject
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.customButton,
                                    personalDetails && !personalDetails.isApproved ? styles.warningButton : styles.approveButton,
                                    { marginLeft: wp(2) },
                                    (processing || (personalDetails && !personalDetails.isApproved)) && styles.disabledButton
                                ]}
                                onPress={handleApprove}
                                disabled={processing || (personalDetails && !personalDetails.isApproved)}
                                activeOpacity={0.7}
                            >
                                {processing ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <ThemedText style={[styles.buttonText, { color: '#FFFFFF', marginLeft: wp(2) }]}>
                                            Approving...
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={wp(4)}
                                            color="#FFFFFF"
                                            style={{ marginRight: wp(2) }}
                                        />
                                        <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                            {personalDetails && !personalDetails.isApproved ? "Approve (Personal Details Required)" : "Approve"}
                                        </ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    statusHeader: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusTextContainer: {
        marginLeft: wp(3),
        flex: 1,
    },
    section: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(3),
        color: '#1E90FF',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: wp(3),
    },
    detailContent: {
        flex: 1,
        marginLeft: wp(3),
    },
    truckItem: {
        padding: wp(3),
        backgroundColor: '#f9f9f9',
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    actionButtonsContainer: {
        marginTop: wp(6),
        marginBottom: wp(8),
        paddingHorizontal: wp(2),
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    actionButton: {
        flex: 1,
    },
    customButton: {
        flex: 1,
        paddingVertical: wp(4),
        paddingHorizontal: wp(4),
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: wp(14),
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    warningButton: {
        backgroundColor: '#FF9800',
    },
    rejectButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: wp(4),
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        fontWeight: '700',
        fontSize: wp(4),
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        marginTop: wp(2),
        borderRadius: 8,
        borderWidth: 1,
    },
});

export default LoadDetailsView;
