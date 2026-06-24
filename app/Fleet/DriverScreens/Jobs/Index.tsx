import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import { useAuthState } from '@/hooks/useAuthState';
import { ThemedText } from '@/components/ThemedText';
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDocuments, updateDocument } from '@/db/operations';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { Alert } from 'react-native';
import { db } from '@/db/fireBaseConfig';
import { query, collection, getDocs, doc, updateDoc, getDoc, where } from 'firebase/firestore';

interface CargoItem {
    id: string;
    cargoId: string;
    truckId: string;
    truckName: string;
    role: string;
    status: 'pending' | 'active' | 'completed' | 'accepted' | 'rejected';
    assignedAt: string;
    loadData?: any; // Full load data from Cargo collection
    createdAt : string ; 
    acceptedAt : string ;
}

function Jobs() {
    const background = useThemeColor("background");
    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");

    const {
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        updateUserProfile
    } = useAuthState();

    const { currentRole } = useAuth();

    const [dspCreateAcc, setDspCreateAcc] = React.useState(false);
    const [dspVerifyAcc, setDspVerifyAcc] = React.useState(false);
    const [dspMenu, setDspMenu] = React.useState(false);

    // Driver-specific state
    const [driverId, setDriverId] = useState<string | null>(null);
    const [assigmentDriver, setAssigmentDriver] = useState<any[]>([]);

    const [fleetId, setFleetId] = useState<string | null>(null);
    const [assignedCargo, setAssignedCargo] = useState<CargoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed' | 'accepted' | 'rejected'>('active');
    const [expandedCargo, setExpandedCargo] = useState<string | null>(null);






    useEffect(() => {
        const fetchAssignedCargo = async () => {
            // Ensure you have both fleetId and the logged-in user's ID
            if (!currentRole.fleetId || !user?.uid) return;

            try {
                setLoading(true);

                // Query: Get all assignments for the fleet where the driver is assigned
                // Note: 'assignedDrivers' is an array of objects. 
                // Firestore supports array-contains if we check the whole object, 
                // but for simplicity, ensure your query targets the collection correctly.
                const q = query(
                    collection(db, `fleets/${currentRole.fleetId}/assignments`),
                    where("driverId", "==", `DRV_${user.uid}`)  // Efficient server-side filter
                );

                const snapshot = await getDocs(q);
                const myAssignments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAssignedCargo(myAssignments as any);


            } catch (error) {
                console.error("Error fetching assigned cargo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedCargo();
    }, [currentRole.fleetId, user?.uid]);


    // 2. Updated Update Function
    const updateCargoStatus = async (cargoId: string, assignmentDocId: string, newStatus: string) => {
        try {
            if (!user?.uid) return;

            // You need to update the specific driver's status inside the array
            // Or maintain a sub-collection structure. 
            // Based on your previous code, let's target the assignment document:
            const docRef = doc(db, `fleets/${currentRole.fleetId}/assignments`, assignmentDocId);

            // Fetch current doc to modify the specific driver in the array
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const updatedDrivers = data.assignedDrivers.map((d: any) =>
                    d.driverId === user.uid ? { ...d, status: newStatus } : d
                );

                await updateDoc(docRef, { assignedDrivers: updatedDrivers });

                // Refresh list
                Alert.alert('Success', `Job status updated to ${newStatus}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update.');
        }
    };


    const getFilteredCargo = () => {
        return assignedCargo.filter(cargo => cargo.status === activeTab);
    };

    const renderCargoItem = (assignmentData: any) => {
        
        return (
            <View
                key={assignmentData.id}
                style={[styles.cargoItem, { backgroundColor: backgroundLight }]}
                
            >
                <View style={styles.cargoHeader}>
                    <ThemedText style={styles.cargoTitle}>
                        {assignmentData?.typeofLoad || 'Load'} - {assignmentData.truckName}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignmentData.status) }]}>
                        <ThemedText style={styles.statusText}>{assignmentData.status.toUpperCase()}</ThemedText>
                    </View>
                </View>

                <View style={styles.cargoDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            {assignmentData?.pickupLocation?.description || 'Origin'} → {assignmentData?.deliveryLocation?.description || 'Destination'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Loading: {assignmentData?.pickupDate ? new Date(assignmentData.pickupDate).toLocaleDateString() : 'TBD'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Delivery: {assignmentData?.deliveryDate ? new Date(assignmentData.deliveryDate).toLocaleDateString() : 'TBD'}
                        </ThemedText>
                    </View>

                    {/* <View style={styles.detailRow}>
                        <Ionicons name="cash" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            {loadData?.rate || 'TBD'} {loadData?.selectedCurrency?.name || 'USD'}
                        </ThemedText>
                    </View> */}

                    {/* <View style={styles.detailRow}>
                        <Ionicons name="person" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Role: {cargo.role === 'main' ? 'Main Driver' :
                                cargo.role === 'second_main' ? 'Second Main Driver' :
                                    'Backup Driver'}
                        </ThemedText>
                    </View> */}

                    {assignmentData?.coordinator &&(
                        <View style={styles.detailRow}>
                            <Ionicons name="call" size={16} color={accent} />
                            <ThemedText style={styles.detailText}>
                                Coordinator: {assignmentData.coordinator.name || 'N/A'}  <ThemedText style={styles.detailText}>
                                - {assignmentData.coordinator.phoneNumber || 'N/A'}
                            </ThemedText>
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Assigned: {assignmentData?.createdAt?.toDate? new Intl.DateTimeFormat('en-GB').format(assignmentData.createdAt.toDate()): "TBD"}
                        </ThemedText>
                    </View>
                </View>

                {/* Expanded Details */}
                {expandedCargo === assignmentData.id && (
                    <View style={styles.expandedDetails}>
                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Load Details</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="cube" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Type: {assignmentData?.typeofLoad || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="list" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Requirements: {assignmentData?.requirements || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="chatbubble" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Additional Info: {assignmentData?.additionalInfo || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="flame" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Fuel & Tolls: {assignmentData?.fuelAvai || 'N/A'}
                                </ThemedText>
                            </View>
                            {assignmentData?.returnLoad && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="return-up-back" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Return Load: {assignmentData.returnLoad}
                                    </ThemedText>
                                </View>
                            )}
                            {assignmentData?.returnRate && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="cash" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Return Rate: {assignmentData.returnRate} {assignmentData?.selectedReturnCurrency?.name || 'USD'}
                                    </ThemedText>
                                </View>
                            )}
                            {assignmentData?.returnTerms && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="document-text" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Return Terms: {assignmentData.returnTerms}
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="person" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Name: {assignmentData?.coordinator?.name || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="business" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Organization: {assignmentData?.coordinator?.id ? 'Fleet Manager' : 'Load Owner'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="call" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Phone: {assignmentData?.coordinator?.phoneNumber || 'N/A'}
                                </ThemedText>
                            </View>
                        </View>


                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Timestamps</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="time" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Created: {assignmentData?.createdAt ? new Date(assignmentData.createdAt).toLocaleString() : 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-add" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Assigned: {new Date(assignmentData.createdAt).toLocaleString()}
                                </ThemedText>
                            </View>
                            {assignmentData.status === 'accepted' && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Accepted: {new Date(assignmentData.acceptedAt).toLocaleString()}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Status Action Buttons */}
                <View style={styles.statusActionButtons}>
                    {assignmentData.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.statusActionButton, { backgroundColor: '#4CAF50' }]}
                                onPress={() => updateCargoStatus(assignmentData.cargoId, assignmentData.id, 'accepted')}
                            >
                                <Ionicons name="checkmark" size={16} color="white" />
                                <ThemedText style={styles.statusActionButtonText}>Accept</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusActionButton, { backgroundColor: '#F44336' }]}
                                onPress={() => updateCargoStatus(assignmentData.cargoId, assignmentData.id, 'rejected')}
                            >
                                <Ionicons name="close" size={16} color="white" />
                                <ThemedText style={styles.statusActionButtonText}>Reject</ThemedText>
                            </TouchableOpacity>
                        </>
                    )}

                    {assignmentData.status === 'accepted' && (
                        <TouchableOpacity
                            style={[styles.statusActionButton, { backgroundColor: '#2196F3' }]}
                            onPress={() => updateCargoStatus(assignmentData.cargoId, assignmentData.id, 'active')}
                        >
                            <Ionicons name="play" size={16} color="white" />
                            <ThemedText style={styles.statusActionButtonText}>Start Job</ThemedText>
                        </TouchableOpacity>
                    )}

                    {assignmentData.status === 'active' && (
                        <TouchableOpacity
                            style={[styles.statusActionButton, { backgroundColor: '#4CAF50' }]}
                            onPress={() => updateCargoStatus(assignmentData.cargoId, assignmentData.id, 'completed')}
                        >
                            <Ionicons name="checkmark-circle" size={16} color="white" />
                            <ThemedText style={styles.statusActionButtonText}>Complete</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Navigation Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#607D8B' }]}
                        onPress={() => {
                            // Navigate to truck details
                            router.push({
                                pathname: '/Logistics/Trucks/TruckDetails',
                                params: { truckId: assignmentData.truckId }
                            });
                        }}
                    >
                        <Ionicons name="car" size={16} color="white" />
                        <ThemedText style={styles.actionButtonText}>View Truck</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                        onPress={() => {
                            // Toggle expanded view for more details
                            setExpandedCargo(expandedCargo === assignmentData.id ? null : assignmentData.id);
                        }}
                    >
                        <Ionicons name={expandedCargo === assignmentData.id ? "chevron-up" : "chevron-down"} size={16} color="white" />
                        <ThemedText style={styles.actionButtonText}>
                            {expandedCargo === assignmentData.id ? 'Less Info' : 'More Info'}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => {
                            // Navigate to map view
                            router.push({
                                pathname: '/Map/ViewLoadRoutes',
                                params: { cargoId: assignmentData.cargoId, driverId: driverId }
                            });
                        }}
                    >
                        <Ionicons name="map" size={16} color="white" />
                        <ThemedText style={styles.actionButtonText}>View on Map</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'completed': return '#2196F3';
            case 'rejected': return '#F44336';
            default: return '#666';
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <CustomHeader pageTitle="Jobs" />

            <View style={styles.content}>
                {/* Status Tabs */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.statusButton, activeTab === 'active' && styles.activeButton]}
                        onPress={() => setActiveTab('active')}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={[styles.buttonText, activeTab === 'active' && styles.activeButtonText]}
                        >
                            Active ({assignedCargo.filter(c => c.status === 'active').length})
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusButton, activeTab === 'pending' && styles.activeButton]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={[styles.buttonText, activeTab === 'pending' && styles.activeButtonText]}
                        >
                            Pending ({assignedCargo.filter(c => c.status === 'pending').length})
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.statusButton, activeTab === 'completed' && styles.activeButton]}
                        onPress={() => setActiveTab('completed')}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={[styles.buttonText, activeTab === 'completed' && styles.activeButtonText]}
                        >
                            Completed ({assignedCargo.filter(c => c.status === 'completed').length})
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Cargo List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={accent} />
                        <ThemedText style={styles.loadingText}>Loading your jobs...</ThemedText>
                    </View>
                ) : (
                    <ScrollView style={styles.cargoList} showsVerticalScrollIndicator={false}>
                        {getFilteredCargo().length > 0 ? (
                            getFilteredCargo().map(renderCargoItem)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={64} color="#ccc" />
                                <ThemedText style={styles.emptyStateText}>
                                    No {activeTab} jobs found
                                </ThemedText>
                                <ThemedText style={styles.emptyStateSubtext}>
                                    {activeTab === 'pending' ? 'New assignments will appear here' :
                                        activeTab === 'active' ? 'Active jobs will be shown here' :
                                            'Completed jobs will appear here'}
                                </ThemedText>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>


        </View>
    );
}

export default Jobs;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        paddingTop: 40,
    },
    statusButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeButton: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    buttonText: {
        fontSize: 14,
    },
    activeButtonText: {
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    cargoList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    cargoItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cargoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cargoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cargoDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    statusActionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        gap: 12,
    },
    statusActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
        minWidth: 100,
    },
    statusActionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    expandedDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    detailSection: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 8,
    },
});