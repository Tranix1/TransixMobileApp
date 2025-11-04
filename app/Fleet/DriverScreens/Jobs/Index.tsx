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

interface CargoItem {
    id: string;
    cargoId: string;
    truckId: string;
    truckName: string;
    role: string;
    status: 'pending' | 'active' | 'completed' | 'accepted' | 'rejected';
    assignedAt: string;
    loadData?: any; // Full load data from Cargo collection
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
    console.log("Driver ID:", driverId);
    const [fleetId, setFleetId] = useState<string | null>(null);
    const [assignedCargo, setAssignedCargo] = useState<CargoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed' | 'accepted' | 'rejected'>('active');
    const [expandedCargo, setExpandedCargo] = useState<string | null>(null);
    // Get driver info from AsyncStorage
    useEffect(() => {
        const getDriverInfo = async () => {
            try {
                const storedRole = await AsyncStorage.getItem('currentRole');
                if (storedRole) {
                    const parsedRole = JSON.parse(storedRole);
                    console.log("Parsed Role from AsyncStorage:", parsedRole);
                    if (parsedRole.userRole === 'driver' && parsedRole.driverId) {
                        setDriverId(parsedRole.driverId);
                        setFleetId(parsedRole.fleetId);
                    } else {
                        console.warn("Current role is not 'driver' or missing driverId");
                    }
                }
            } catch (error) {
                console.error("Error fetching driver info:", error);
            }
        };

        getDriverInfo();
    }, []);

    // Fetch assigned cargo for the driver
    useEffect(() => {
        const fetchAssignedCargo = async () => {
            if (!driverId || !fleetId) return;

            try {
                setLoading(true);
                // Fetch cargo assignments for this driver
                const assignmentsResult = await fetchDocuments(`fleets/${fleetId}/Drivers/${driverId}/cargo`, 100);

                if (assignmentsResult && assignmentsResult.data && Array.isArray(assignmentsResult.data)) {
                    const cargoItems: CargoItem[] = [];

                    for (const assignment of assignmentsResult.data) {
                         // Fetch the full load data from the correct collection based on loadVisibility
                         try {
                             let loadData;
                             if (assignment.loadVisibility === 'Private') {
                                 // Fetch from fleet-specific Cargo collection
                                 loadData = await fetchDocuments(`fleets/${fleetId}/Cargo`, 1, undefined, [
                                     { field: 'cargoId', operator: '==', value: assignment.cargoId }
                                 ]);
                             } else {
                                 // Fetch from public Cargo collection
                                 loadData = await fetchDocuments('Cargo', 1, undefined, [
                                     { field: 'cargoId', operator: '==', value: assignment.cargoId }
                                 ]);
                             }

                             const fullLoadData = loadData.data && loadData.data.length > 0 ? loadData.data[0] : null;

                            cargoItems.push({
                                id: assignment.id,
                                cargoId: assignment.cargoId,
                                truckId: assignment.truckId,
                                truckName: assignment.truckName,
                                role: assignment.role,
                                status: assignment.status || 'pending',
                                assignedAt: assignment.assignedAt,
                                loadData: fullLoadData
                            });
                        } catch (error) {
                            console.error(`Error fetching load data for cargo ${assignment.cargoId}:`, error);
                            // Still add the assignment even if load data fails
                            cargoItems.push({
                                id: assignment.id,
                                cargoId: assignment.cargoId,
                                truckId: assignment.truckId,
                                truckName: assignment.truckName,
                                role: assignment.role,
                                status: assignment.status || 'pending',
                                assignedAt: assignment.assignedAt,
                                loadData: null
                            });
                        }
                    }

                    setAssignedCargo(cargoItems);
                }
            } catch (error) {
                console.error("Error fetching assigned cargo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedCargo();
    }, [driverId, fleetId]);

    const checkAuth = (theAction?: () => void) => {
        if (!isAuthenticated) {
            setDspCreateAcc(true);
            return;
        }

        if (needsProfileSetup) {
            router.push({ pathname: '/Account/Profile', params: { operation: 'create' } });
            return;
        }

        if (needsEmailVerification) {
            setDspVerifyAcc(true);
            return;
        }

        // User is authenticated and verified
        if (typeof theAction === 'function') {
            theAction();
        } else {
            setDspMenu(true);
        }
    };

    const getFilteredCargo = () => {
        return assignedCargo.filter(cargo => cargo.status === activeTab);
    };

    const renderCargoItem = (cargo: CargoItem) => {
        const loadData = cargo.loadData;
        return (
            <TouchableOpacity
                key={cargo.id}
                style={[styles.cargoItem, { backgroundColor: backgroundLight }]}
                onPress={() => {
                    // Navigate to cargo details or tracking
                    router.push({
                        pathname: '/Map/ViewLoadRoutes',
                        params: { cargoId: cargo.cargoId, driverId: driverId }
                    });
                }}
            >
                <View style={styles.cargoHeader}>
                    <ThemedText style={styles.cargoTitle}>
                        {loadData?.typeofLoad || 'Load'} - {cargo.truckName}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cargo.status) }]}>
                        <ThemedText style={styles.statusText}>{cargo.status.toUpperCase()}</ThemedText>
                    </View>
                </View>

                <View style={styles.cargoDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            {loadData?.origin?.description || 'Origin'} → {loadData?.destination?.description || 'Destination'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Loading: {loadData?.loadingDate ? new Date(loadData.loadingDate).toLocaleDateString() : 'TBD'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Delivery: {loadData?.deliveryDate ? new Date(loadData.deliveryDate).toLocaleDateString() : 'TBD'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="cash" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            {loadData?.rate || 'TBD'} {loadData?.selectedCurrency?.name || 'USD'}
                        </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="person" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Role: {cargo.role === 'main' ? 'Main Driver' :
                                   cargo.role === 'second_main' ? 'Second Main Driver' :
                                   'Backup Driver'}
                        </ThemedText>
                    </View>

                    {loadData?.coordinator && (
                        <View style={styles.detailRow}>
                            <Ionicons name="call" size={16} color={accent} />
                            <ThemedText style={styles.detailText}>
                                Coordinator: {loadData.coordinator.name || 'N/A'}
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Assigned: {new Date(cargo.assignedAt).toLocaleDateString()}
                        </ThemedText>
                    </View>
                </View>

                {/* Expanded Details */}
                {expandedCargo === cargo.id && (
                    <View style={styles.expandedDetails}>
                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Load Details</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="cube" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Type: {loadData?.typeofLoad || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="list" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Requirements: {loadData?.requirements || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="chatbubble" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Additional Info: {loadData?.additionalInfo || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="flame" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Fuel & Tolls: {loadData?.fuelAvai || 'N/A'}
                                </ThemedText>
                            </View>
                            {loadData?.returnLoad && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="return-up-back" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Return Load: {loadData.returnLoad}
                                    </ThemedText>
                                </View>
                            )}
                            {loadData?.returnRate && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="cash" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Return Rate: {loadData.returnRate} {loadData?.selectedReturnCurrency?.name || 'USD'}
                                    </ThemedText>
                                </View>
                            )}
                            {loadData?.returnTerms && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="document-text" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Return Terms: {loadData.returnTerms}
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Coordinator Information</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="person" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Name: {loadData?.coordinator?.name || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="business" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Organization: {loadData?.coordinator?.id ? 'Fleet Manager' : 'Load Owner'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="call" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Phone: {loadData?.coordinator?.phoneNumber || 'N/A'}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Payment & Terms</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="cash" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Rate: {loadData?.rate || 'TBD'} {loadData?.selectedCurrency?.name || 'USD'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="document-text" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Payment Terms: {loadData?.paymentTerms || 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="shield-checkmark" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Fuel & Tolls: {loadData?.fuelAvai || 'N/A'}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailSection}>
                            <ThemedText style={styles.sectionTitle}>Timestamps</ThemedText>
                            <View style={styles.detailRow}>
                                <Ionicons name="time" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Created: {loadData?.createdAt ? new Date(loadData.createdAt).toLocaleString() : 'N/A'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-add" size={16} color="#2196F3" />
                                <ThemedText style={styles.detailText}>
                                    Assigned: {new Date(cargo.assignedAt).toLocaleString()}
                                </ThemedText>
                            </View>
                            {cargo.status === 'accepted' && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
                                    <ThemedText style={styles.detailText}>
                                        Accepted: {new Date(cargo.assignedAt).toLocaleString()}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Status Action Buttons */}
                <View style={styles.statusActionButtons}>
                    {cargo.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.statusActionButton, { backgroundColor: '#4CAF50' }]}
                                onPress={() => updateCargoStatus(cargo.cargoId, cargo.id, 'accepted')}
                            >
                                <Ionicons name="checkmark" size={16} color="white" />
                                <ThemedText style={styles.statusActionButtonText}>Accept</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusActionButton, { backgroundColor: '#F44336' }]}
                                onPress={() => updateCargoStatus(cargo.cargoId, cargo.id, 'rejected')}
                            >
                                <Ionicons name="close" size={16} color="white" />
                                <ThemedText style={styles.statusActionButtonText}>Reject</ThemedText>
                            </TouchableOpacity>
                        </>
                    )}

                    {cargo.status === 'accepted' && (
                        <TouchableOpacity
                            style={[styles.statusActionButton, { backgroundColor: '#2196F3' }]}
                            onPress={() => updateCargoStatus(cargo.cargoId, cargo.id, 'active')}
                        >
                            <Ionicons name="play" size={16} color="white" />
                            <ThemedText style={styles.statusActionButtonText}>Start Job</ThemedText>
                        </TouchableOpacity>
                    )}

                    {cargo.status === 'active' && (
                        <TouchableOpacity
                            style={[styles.statusActionButton, { backgroundColor: '#4CAF50' }]}
                            onPress={() => updateCargoStatus(cargo.cargoId, cargo.id, 'completed')}
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
                                params: { truckId: cargo.truckId }
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
                            setExpandedCargo(expandedCargo === cargo.id ? null : cargo.id);
                        }}
                    >
                        <Ionicons name={expandedCargo === cargo.id ? "chevron-up" : "chevron-down"} size={16} color="white" />
                        <ThemedText style={styles.actionButtonText}>
                            {expandedCargo === cargo.id ? 'Less Info' : 'More Info'}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => {
                            // Navigate to map view
                            router.push({
                                pathname: '/Map/ViewLoadRoutes',
                                params: { cargoId: cargo.cargoId, driverId: driverId }
                            });
                        }}
                    >
                        <Ionicons name="map" size={16} color="white" />
                        <ThemedText style={styles.actionButtonText}>View on Map</ThemedText>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
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

    const updateCargoStatus = async (cargoId: string, driverId: string, newStatus: 'active' | 'completed' | 'rejected' | 'accepted') => {
        try {
            // Update the driver's cargo assignment status
            const updateData = {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                ...(newStatus === 'accepted' && { acceptedAt: new Date().toISOString() }),
                ...(newStatus === 'completed' && { completedAt: new Date().toISOString() }),
                ...(newStatus === 'rejected' && { rejectedAt: new Date().toISOString() }),
            };

            await updateDocument(`fleets/${fleetId}/Drivers/${driverId}/cargo`, cargoId, updateData);

            // If accepting a pending job, also update the assignment status
            if (newStatus === 'accepted') {
                // Find the assignment in the cargo collection
                const assignmentsResult = await fetchDocuments(`fleets/${fleetId}/Cargo/${cargoId}/assignments`, 10);
                if (assignmentsResult.data) {
                    const driverAssignment = assignmentsResult.data.find((assignment: any) =>
                        assignment.assignedDrivers?.some((driver: any) => driver.driverId === driverId)
                    );

                    if (driverAssignment) {
                        // Update the specific driver's status in the assignment
                        const updatedDrivers = driverAssignment.assignedDrivers.map((driver: any) => {
                            if (driver.driverId === driverId) {
                                return { ...driver, status: 'accepted' };
                            }
                            return driver;
                        });

                        await updateDocument(`fleets/${fleetId}/Cargo/${cargoId}/assignments`, driverAssignment.id, {
                            assignedDrivers: updatedDrivers,
                            status: 'accepted',
                            acceptedBy: driverId,
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
            }

            // Refresh the data
            if (driverId && fleetId) {
                const assignmentsResult = await fetchDocuments(`fleets/${fleetId}/Drivers/${driverId}/cargo`, 100);
                if (assignmentsResult && assignmentsResult.data && Array.isArray(assignmentsResult.data)) {
                    const cargoItems: CargoItem[] = [];

                    for (const assignment of assignmentsResult.data) {
                         try {
                             let loadData;
                             if (assignment.loadVisibility === 'Private') {
                                 // Fetch from fleet-specific Cargo collection
                                 loadData = await fetchDocuments(`fleets/${fleetId}/Cargo`, 1, undefined, [
                                     { field: 'cargoId', operator: '==', value: assignment.cargoId }
                                 ]);
                             } else {
                                 // Fetch from public Cargo collection
                                 loadData = await fetchDocuments('Cargo', 1, undefined, [
                                     { field: 'cargoId', operator: '==', value: assignment.cargoId }
                                 ]);
                             }

                             const fullLoadData = loadData.data && loadData.data.length > 0 ? loadData.data[0] : null;

                            cargoItems.push({
                                id: assignment.id,
                                cargoId: assignment.cargoId,
                                truckId: assignment.truckId,
                                truckName: assignment.truckName,
                                role: assignment.role,
                                status: assignment.status || 'pending',
                                assignedAt: assignment.assignedAt,
                                loadData: fullLoadData
                            });
                        } catch (error) {
                            console.error(`Error fetching load data for cargo ${assignment.cargoId}:`, error);
                            cargoItems.push({
                                id: assignment.id,
                                cargoId: assignment.cargoId,
                                truckId: assignment.truckId,
                                truckName: assignment.truckName,
                                role: assignment.role,
                                status: assignment.status || 'pending',
                                assignedAt: assignment.assignedAt,
                                loadData: null
                            });
                        }
                    }

                    setAssignedCargo(cargoItems);
                }
            }

            Alert.alert('Success', `Job status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating cargo status:', error);
            Alert.alert('Error', 'Failed to update job status. Please try again.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <CustomHeader onPressMenu={() => checkAuth()} currentRole={currentRole} />

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

            {/* Authentication Modals */}
            <AuthStatusModal
                visible={dspCreateAcc}
                onClose={() => setDspCreateAcc(false)}
                user={user}
                type="create"
            />

            <AuthStatusModal
                visible={dspVerifyAcc}
                onClose={() => setDspVerifyAcc(false)}
                user={user}
                type="verify"
            />

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />
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