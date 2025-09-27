import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import Heading from '@/components/Heading';
import ScreenWrapper from '@/components/ScreenWrapper';
import { fetchDocuments } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { where, query, collection, getDocs, limit } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { formatDate } from '@/services/services';
import { router } from 'expo-router';


export default function VerificationIndex() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const border = useThemeColor('border');
    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [userVerification, setUserVerification] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [pendingDetails, setPendingDetails] = useState<any[]>([]);
    const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
    const coolGray = useThemeColor('coolGray')
    const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
    const [truckPersonDetails, setTruckPersonDetails] = useState<any>(null);
    console.log(truckPersonDetails);
    const [truckDetailsLoading, setTruckDetailsLoading] = useState(false);

    const appSections = ['Trucks',
        'Loads',
        'Contracts',
        'Store',
        'Warehouses',
        'Fuel',
        'Truck Stop',
        'GIT',
    ]

    // Function to fetch truck person details
    const fetchTruckPersonDetails = async () => {
        if (!user?.uid) return;

        setTruckDetailsLoading(true);
        try {
            // Method 1: Direct query without timeStamp ordering
            try {
                const q = query(
                    collection(db, 'truckPersonDetails'),
                    where('userId', '==', user.uid),
                    limit(1)
                );

                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const data = { id: doc.id, ...doc.data() };
                    setTruckPersonDetails(data);
                    return;
                }
            } catch (directQueryError) {
                console.log('Direct query failed, trying fetchDocuments:', directQueryError);
            }

            // Method 2: Fallback to fetchDocuments with proper error handling
            try {
                const result = await fetchDocuments(
                    'truckPersonDetails',
                    1,
                    null,
                    [where('userId', '==', user.uid)]
                );

                if (result && result.data && result.data.length > 0) {
                    setTruckPersonDetails(result.data[0]);
                } else {
                    setTruckPersonDetails(null);
                }
            } catch (fetchDocumentsError) {
                console.error('Both query methods failed:', fetchDocumentsError);
                setTruckPersonDetails(null);
            }
        } catch (error) {
            console.error('Error fetching truck person details:', error);
            setTruckPersonDetails(null);
        } finally {
            setTruckDetailsLoading(false);
        }
    };

    // Fetch truck person details when "Trucks" is selected
    useEffect(() => {
        if (selectedVerification === 'Trucks') {
            fetchTruckPersonDetails();
        }
    }, [selectedVerification, user?.uid]);






    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page="Verification Status" />
                <View >
                    <ActivityIndicator size="large" color={accent} />
                    <ThemedText type="defaultSemiBold" >
                        Loading verification status...
                    </ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page="Verification Status" />

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            if (selectedVerification === 'Trucks') {
                                fetchTruckPersonDetails();
                            }
                            setRefreshing(false);
                        }}
                        colors={[accent]}
                    />
                }
            >
                <View style={{ marginVertical: wp(2) }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginVertical: wp(3) }}
                        contentContainerStyle={{
                            paddingHorizontal: wp(2),
                        }}
                    >
                        {appSections.map((item) => {
                            const active = selectedVerification === item; // single selection
                            return (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() =>
                                        setSelectedVerification(active ? null : item) // toggle single item
                                    }
                                    style={{
                                        backgroundColor: active ? accent : backgroundLight,
                                        borderColor: accent ? accent : coolGray,
                                        borderWidth: 1,
                                        paddingVertical: wp(0.1),
                                        marginLeft: wp(2),
                                        borderRadius: wp(2),
                                        paddingHorizontal: wp(3),
                                        marginRight: wp(1),
                                        shadowColor: active ? accent : "#000",
                                        shadowOpacity: active ? 0.15 : 0.05,
                                        shadowRadius: 4,
                                        elevation: active ? 2 : 0,
                                    }}
                                >
                                    <ThemedText
                                        style={{
                                            color: active ? "white" : textColor,
                                            fontSize: wp(3.5),
                                        }}
                                        type="defaultSemiBold"
                                    >
                                        {item}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Truck Person Details Section */}
                {selectedVerification === 'Trucks' && (
                    <View style={{ margin: wp(4), padding: wp(4), backgroundColor: backgroundLight, borderRadius: wp(3), borderWidth: 1, borderColor: border }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(3) }}>
                            <Ionicons name="car" size={wp(6)} color={accent} />
                            <ThemedText type="subtitle" style={{ marginLeft: wp(2), color: textColor }}>
                                Truck Verification Status
                            </ThemedText>
                        </View>

                        {truckDetailsLoading ? (
                            <View style={{ alignItems: 'center', paddingVertical: wp(4) }}>
                                <ActivityIndicator size="large" color={accent} />
                                <ThemedText style={{ marginTop: wp(2), color: textColor }}>
                                    Loading verification details...
                                </ThemedText>
                            </View>
                        ) : truckPersonDetails ? (
                            <View>
                                {/* Account Type */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
                                    <ThemedText style={{ color: textColor, fontSize: wp(4) }}>Account Type:</ThemedText>
                                    <View style={{
                                        backgroundColor: truckPersonDetails.accType === 'owner' ? '#4CAF50' : '#FF9800',
                                        paddingHorizontal: wp(3),
                                        paddingVertical: wp(1),
                                        borderRadius: wp(2)
                                    }}>
                                        <ThemedText style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {truckPersonDetails.accType || 'Unknown'}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Approval Status */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
                                    <ThemedText style={{ color: textColor, fontSize: wp(4) }}>Approval Status:</ThemedText>
                                    <View style={{
                                        backgroundColor: truckPersonDetails.approvalStatus === 'approved' ? '#4CAF50' :
                                            truckPersonDetails.approvalStatus === 'pending' ? '#FF9800' : '#F44336',
                                        paddingHorizontal: wp(3),
                                        paddingVertical: wp(1),
                                        borderRadius: wp(2)
                                    }}>
                                        <ThemedText style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {truckPersonDetails.approvalStatus || 'Not Submitted'}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Created At */}
                                {truckPersonDetails.createdAt && (
                                    <View style={{ marginBottom: wp(2) }}>
                                        <ThemedText style={{ color: textColor, fontSize: wp(3.5) }}>
                                            Created: {formatDate(truckPersonDetails.createdAt)}
                                        </ThemedText>
                                        <ThemedText style={{ color: icon, fontSize: wp(2.5) }}>
                                            Raw: {JSON.stringify(truckPersonDetails.createdAt)}
                                        </ThemedText>
                                    </View>
                                )}

                                {/* Additional Details */}
                                {truckPersonDetails.companyName && (
                                    <View style={{ marginBottom: wp(2) }}>
                                        <ThemedText style={{ color: textColor, fontSize: wp(3.5) }}>
                                            Company: {truckPersonDetails.companyName}
                                        </ThemedText>
                                    </View>
                                )}

                                {truckPersonDetails.submittedAt && (
                                    <View style={{ marginBottom: wp(2) }}>
                                        <ThemedText style={{ color: textColor, fontSize: wp(3.5) }}>
                                            Submitted: {formatDate(truckPersonDetails.submittedAt)}
                                        </ThemedText>
                                    </View>
                                )}

                                {truckPersonDetails.approvedAt && (
                                    <View style={{ marginBottom: wp(2) }}>
                                        <ThemedText style={{ color: textColor, fontSize: wp(3.5) }}>
                                            Approved: {formatDate(truckPersonDetails.approvedAt)}
                                        </ThemedText>
                                    </View>
                                )}

                                {/* View Details Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        router.push({
                                            pathname: '/Account/Verification/TruckDetailsView',
                                            params: { details: JSON.stringify(truckPersonDetails) }
                                        });
                                    }}
                                    style={{
                                        backgroundColor: accent,
                                        paddingVertical: wp(2.5),
                                        paddingHorizontal: wp(4),
                                        borderRadius: wp(2),
                                        alignItems: 'center',
                                        marginTop: wp(3)
                                    }}
                                >
                                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                        View Details
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ alignItems: 'center', paddingVertical: wp(4) }}>
                                <Ionicons name="document-outline" size={wp(8)} color={icon} />
                                <ThemedText style={{ marginTop: wp(2), color: textColor, textAlign: 'center' }}>
                                    No truck verification details found
                                </ThemedText>
                                <ThemedText style={{ marginTop: wp(1), color: icon, textAlign: 'center', fontSize: wp(3) }}>
                                    Please submit your truck verification documents
                                </ThemedText>
                            </View>
                        )}
                    </View>
                )}


                {/* <FlatList
                    data={verificationItems}
                    renderItem={renderVerificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[accent]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View> */}
            </ScrollView>
        </ScreenWrapper>
    );
}
