import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import Heading from '@/components/Heading';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import QRCode from 'react-native-qrcode-svg';

interface Payment {
    id: string;
    serviceType?: string;
    fuelType?: string;
    price?: number;
    quantity?: number;
    totalAmount: number;
    stationName: string;
    stationId: string;
    purchaseDate: string;
    qrCode: string;
    status: 'pending' | 'completed' | 'cancelled';
    serviceCategory?: 'fuel' | 'truckstop' | 'tracking' | 'git' | 'warehouse' | 'loads' | 'trucks' | 'contracts';
    userId: string;
    userEmail?: string;
    paymentMethod: string;
    phoneNumber: string;

    // New multi-item support
    fuelItems?: Array<{
        fuelType: string;
        fuelName: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    serviceItems?: Array<{
        serviceType: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    isMultiPayment?: boolean;

    // Route details for navigation
    routeDetails?: {
        destinationLatitude: number;
        destinationLongitude: number;
        destinationName: string;
        distance?: string;
        duration?: string;
        durationInTraffic?: string;
        routePolyline?: string;
        bounds?: any;
    };

    createdAt: Date;
    updatedAt: Date;
}

export default function PaymentHistory() {
    const accent = useThemeColor('accent') || '#007AFF';
    const icon = useThemeColor('icon') || '#333';
    const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
    const { user } = useAuth();
    const router = useRouter();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    const loadPayments = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const filters = [where("userId", "==", user.uid)];
            const result = await fetchDocuments("Payments", 20, undefined, filters);

            if (result.data.length) {
                console.log('Loaded payments:', result.data);
                setPayments(result.data as Payment[]);
                setLastVisible(result.lastVisible);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            Alert.alert('Error', 'Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [user]);

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await loadPayments();
        } catch (error) {
            console.error('Error refreshing payments:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const loadMorePayments = async () => {
        if (loadingMore || !lastVisible || !user) return;

        setLoadingMore(true);
        try {
            const filters = [where("userId", "==", user.uid)];
            const result = await fetchDocuments('Payments', 20, lastVisible, filters);
            if (result) {
                setPayments([...payments, ...result.data as Payment[]]);
                setLastVisible(result.lastVisible);
            }
        } catch (error) {
            console.error('Error loading more payments:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleNavigateToMap = (payment: Payment) => {
        console.log('PaymentHistory: Navigation button pressed for payment:', payment.id);
        console.log('PaymentHistory: Route details:', payment.routeDetails);
        if (payment.routeDetails) {
            const destinationType = payment.serviceCategory === 'fuel' ? 'Fuel Station' : 'Truck Stop';
            router.push({
                pathname: "/Map/Index",
                params: {
                    destinationLati: payment.routeDetails.destinationLatitude.toString(),
                    destinationLongi: payment.routeDetails.destinationLongitude.toString(),
                    destinationName: payment.routeDetails.destinationName,
                    destinationType: destinationType
                }
            });
        } else {
            console.log('PaymentHistory: No route details available for payment:', payment.id);
        }
    };

    const getServiceIcon = (payment: Payment) => {
        switch (payment.serviceCategory) {
            case 'fuel':
                return <Ionicons name="car" size={wp(5)} color="#FF6B35" />;
            case 'truckstop':
                return <Ionicons name="restaurant" size={wp(5)} color="#4ECDC4" />;
            case 'tracking':
                return <Ionicons name="location" size={wp(5)} color="#9C27B0" />;
            case 'git':
                return <Ionicons name="shield-checkmark" size={wp(5)} color="#FF9800" />;
            case 'warehouse':
                return <Ionicons name="storefront" size={wp(5)} color="#795548" />;
            case 'loads':
                return <Ionicons name="cube" size={wp(5)} color="#607D8B" />;
            case 'trucks':
                return <Ionicons name="car-sport" size={wp(5)} color="#3F51B5" />;
            case 'contracts':
                return <Ionicons name="document-text" size={wp(5)} color="#E91E63" />;
            default:
                // Fallback for old data or missing serviceCategory
                if (payment.serviceType === 'fuel' || payment.fuelType) {
                    return <Ionicons name="car" size={wp(5)} color="#FF6B35" />;
                } else if (payment.serviceType) {
                    return <Ionicons name="restaurant" size={wp(5)} color="#4ECDC4" />;
                }
                return <Ionicons name="card" size={wp(5)} color="#45B7D1" />;
        }
    };

    const getServiceColor = (payment: Payment) => {
        switch (payment.serviceCategory) {
            case 'fuel':
                return '#FF6B35'; // Orange for fuel
            case 'truckstop':
                return '#4ECDC4'; // Teal for truck stop
            case 'tracking':
                return '#9C27B0'; // Purple for tracking
            case 'git':
                return '#FF9800'; // Orange for GIT insurance
            case 'warehouse':
                return '#795548'; // Brown for warehouse
            case 'loads':
                return '#607D8B'; // Blue-grey for loads
            case 'trucks':
                return '#3F51B5'; // Indigo for trucks
            case 'contracts':
                return '#E91E63'; // Pink for contracts
            default:
                // Fallback for old data or missing serviceCategory
                if (payment.serviceType === 'fuel' || payment.fuelType) {
                    return '#FF6B35'; // Orange for fuel
                } else if (payment.serviceType) {
                    return '#4ECDC4'; // Teal for other services
                }
                return '#45B7D1'; // Blue for other services
        }
    };

    const getServiceBackgroundColor = (payment: Payment) => {
        // Use theme background with subtle color tint
        if (payment.serviceCategory === 'fuel') {
            return backgroundLight; // Use theme background
        } else if (payment.serviceCategory === 'truckstop') {
            return backgroundLight; // Use theme background
        }
        return backgroundLight; // Use theme background
    };

    const getServiceName = (payment: Payment) => {
        // Handle multi-item payments
        if (payment.isMultiPayment) {
            if (payment.serviceCategory === 'fuel' && payment.fuelItems && payment.fuelItems.length > 0) {
                const fuelNames = payment.fuelItems.map(item => item.fuelName).join(', ');
                return `Fuel: ${fuelNames}`;
            } else if (payment.serviceCategory === 'truckstop' && payment.serviceItems && payment.serviceItems.length > 0) {
                const serviceNames = payment.serviceItems.map(item => item.serviceType).join(', ');
                return `Truck Stop: ${serviceNames}`;
            }
        }

        // Handle single item payments
        switch (payment.serviceCategory) {
            case 'fuel':
                return payment.fuelType || 'Fuel';
            case 'truckstop':
                return payment.serviceType || 'Truck Stop Service';
            case 'tracking':
                return 'Vehicle Tracking Service';
            case 'git':
                return 'GIT Insurance';
            case 'warehouse':
                return 'Warehouse Storage';
            case 'loads':
                return 'Load Management';
            case 'trucks':
                return 'Truck Services';
            case 'contracts':
                return 'Contract Services';
            default:
                // Fallback for old data or missing serviceCategory
                if (payment.serviceType === 'fuel' || payment.fuelType) {
                    return payment.fuelType || 'Fuel';
                } else if (payment.serviceType) {
                    return payment.serviceType;
                }
                return 'Service';
        }
    };

    const showQRCode = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowQRModal(true);
    };

    const renderPaymentItem = ({ item }: { item: Payment }) => {
        console.log('Rendering payment item:', {
            id: item.id,
            serviceCategory: item.serviceCategory,
            isMultiPayment: item.isMultiPayment,
            fuelItems: item.fuelItems,
            serviceItems: item.serviceItems,
            paymentMethod: item.paymentMethod,
            stationName: item.stationName,
            totalAmount: item.totalAmount
        });
        const serviceColor = getServiceColor(item);
        const serviceBackgroundColor = getServiceBackgroundColor(item);

        return (
            <View style={[styles.paymentCard, {
                borderColor: serviceColor + '30',
                backgroundColor: serviceBackgroundColor,
                borderLeftWidth: 4,
                borderLeftColor: serviceColor
            }]}>
                <View style={styles.paymentHeader}>
                    <View style={[styles.serviceIconContainer, { backgroundColor: serviceColor + '20' }]}>
                        {getServiceIcon(item)}
                    </View>
                    <View style={styles.paymentInfo}>
                        <ThemedText type="defaultSemiBold" style={[styles.stationName, { color: serviceColor }]}>
                            {item.stationName}
                        </ThemedText>
                        <ThemedText type="tiny" style={[styles.serviceName, { color: serviceColor }]}>
                            {getServiceName(item)}
                        </ThemedText>
                        <ThemedText type="tiny" style={[styles.paymentDate, { color: icon }]}>
                            {formatDate(item.purchaseDate)}
                        </ThemedText>
                    </View>
                    <View style={styles.paymentAmount}>
                        <ThemedText type="subtitle" style={[styles.amount, { color: serviceColor }]}>
                            ${item.totalAmount.toFixed(2)}
                        </ThemedText>
                        <View style={[styles.statusBadge, {
                            backgroundColor: item.status === 'completed' ? '#4CAF50' :
                                item.status === 'pending' ? '#FF9800' : '#F44336'
                        }]}>
                            <ThemedText style={styles.statusText}>
                                {item.status.toUpperCase()}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.paymentDetails}>
                    {/* Payment Method */}
                    <View style={styles.detailRow}>
                        <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>Payment Method:</ThemedText>
                        <ThemedText type="tiny" style={styles.detailValue}>
                            {item.paymentMethod?.toUpperCase() || 'ECOCASH'}
                        </ThemedText>
                    </View>

                    {/* Multi-item display */}
                    {(item.isMultiPayment || (item.fuelItems && item.fuelItems.length > 0) || (item.serviceItems && item.serviceItems.length > 0)) && (
                        <>
                            {item.serviceCategory === 'fuel' && item.fuelItems && item.fuelItems.length > 0 && (
                                <View style={styles.multiItemContainer}>
                                    <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>
                                        Fuel Items:
                                    </ThemedText>
                                    {item.fuelItems.map((fuelItem, index) => (
                                        <View key={index} style={styles.itemDetail}>
                                            <ThemedText type="tiny" style={styles.detailValue}>
                                                {fuelItem.fuelName}: {fuelItem.quantity}L @ ${fuelItem.price.toFixed(2)} = ${fuelItem.subtotal.toFixed(2)}
                                            </ThemedText>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {item.serviceCategory === 'truckstop' && item.serviceItems && item.serviceItems.length > 0 && (
                                <View style={styles.multiItemContainer}>
                                    <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>
                                        Services:
                                    </ThemedText>
                                    {item.serviceItems.map((serviceItem, index) => (
                                        <View key={index} style={styles.itemDetail}>
                                            <ThemedText type="tiny" style={styles.detailValue}>
                                                {serviceItem.serviceType}: {serviceItem.quantity} units @ ${serviceItem.price.toFixed(2)} = ${serviceItem.subtotal.toFixed(2)}
                                            </ThemedText>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}

                    {/* Single item display - fallback for old data */}
                    {!item.isMultiPayment && !item.fuelItems && !item.serviceItems && (
                        <>
                            <View style={styles.detailRow}>
                                <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>Quantity:</ThemedText>
                                <ThemedText type="tiny" style={styles.detailValue}>
                                    {item.quantity || 0} {item.serviceCategory === 'fuel' ? 'L' : 'units'}
                                </ThemedText>
                            </View>
                            <View style={styles.detailRow}>
                                <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>Price per unit:</ThemedText>
                                <ThemedText type="tiny" style={styles.detailValue}>${item.price || 0}</ThemedText>
                            </View>
                        </>
                    )}

                    <View style={styles.detailRow}>
                        <ThemedText type="tiny" style={[styles.detailLabel, { color: serviceColor }]}>Payment ID:</ThemedText>
                        <ThemedText type="tiny" style={[styles.detailValue, { fontSize: wp(2.2) }]}>
                            {item.id}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.qrButton, { backgroundColor: serviceColor }]}
                        onPress={() => showQRCode(item)}
                    >
                        <Ionicons name="qr-code" size={wp(4)} color="white" />
                        <ThemedText style={styles.qrButtonText}>View QR Code</ThemedText>
                    </TouchableOpacity>

                    {/* Navigation button for fuel and truck stop payments with route details */}
                    {(item.serviceCategory === 'fuel' || item.serviceCategory === 'truckstop') && item.routeDetails && (
                        <TouchableOpacity
                            style={[styles.navigateButton, {
                                backgroundColor: backgroundLight,
                                borderColor: serviceColor
                            }]}
                            onPress={() => {
                                console.log('PaymentHistory: Button pressed for payment:', item.id);
                                console.log('PaymentHistory: Service category:', item.serviceCategory);
                                console.log('PaymentHistory: Has route details:', !!item.routeDetails);
                                handleNavigateToMap(item);
                            }}
                        >
                            <Ionicons name="navigate" size={wp(4)} color={serviceColor} />
                            <ThemedText style={[styles.navigateButtonText, { color: serviceColor }]}>
                                Get Directions
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Heading page='Payment History' />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accent} />
                    <ThemedText style={styles.loadingText}>Loading payment history...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading page='Payment History' />

            <FlatList
                data={payments}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[accent]}
                    />
                }
                onEndReached={loadMorePayments}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={wp(15)} color={icon} />
                        <ThemedText type="defaultSemiBold" style={styles.emptyText}>
                            No Payment History
                        </ThemedText>
                        <ThemedText type="tiny" style={styles.emptySubtext}>
                            Your payment history will appear here
                        </ThemedText>
                    </View>
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="small" color={accent} />
                            <ThemedText type="tiny" style={styles.loadingMoreText}>
                                Loading more payments...
                            </ThemedText>
                        </View>
                    ) : null
                }
            />

            {/* QR Code Modal */}
            {showQRModal && selectedPayment && (
                <View style={styles.qrModalOverlay}>
                    <View style={[styles.qrModal, {
                        backgroundColor: getServiceBackgroundColor(selectedPayment),
                        borderColor: getServiceColor(selectedPayment) + '30',
                        borderWidth: 2
                    }]}>
                        <View style={styles.qrModalHeader}>
                            <ThemedText type="subtitle" style={{ color: getServiceColor(selectedPayment) }}>
                                QR Code
                            </ThemedText>
                            <TouchableOpacity onPress={() => setShowQRModal(false)}>
                                <Ionicons name="close" size={wp(5)} color={icon} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.qrCodeContainer, {
                            borderColor: getServiceColor(selectedPayment) + '20',
                            backgroundColor: backgroundLight
                        }]}>
                            <QRCode
                                value={selectedPayment.qrCode}
                                size={wp(60)}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>

                        <View style={styles.qrDetails}>
                            <ThemedText type="defaultSemiBold" style={[styles.qrStationName, { color: getServiceColor(selectedPayment) }]}>
                                {selectedPayment.stationName}
                            </ThemedText>
                            <ThemedText type="tiny" style={[styles.qrServiceName, { color: getServiceColor(selectedPayment) }]}>
                                {getServiceName(selectedPayment)}
                            </ThemedText>
                            <ThemedText type="tiny" style={[styles.qrAmount, { color: getServiceColor(selectedPayment) }]}>
                                ${selectedPayment.totalAmount.toFixed(2)}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: wp(4),
    },
    loadingText: {
        fontSize: wp(4),
        color: '#666',
    },
    paymentCard: {
        marginVertical: wp(2),
        marginHorizontal: wp(4),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    serviceIconContainer: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },
    paymentInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: wp(4.2),
        marginBottom: wp(1),
    },
    serviceName: {
        fontSize: wp(3.2),
        marginBottom: wp(0.5),
    },
    paymentDate: {
        fontSize: wp(2.8),
    },
    paymentAmount: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    statusBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(1.5),
    },
    statusText: {
        color: 'white',
        fontSize: wp(2.5),
        fontWeight: 'bold',
    },
    paymentDetails: {
        marginBottom: wp(3),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(1),
    },
    detailLabel: {
        fontSize: wp(3),
        color: '#666',
    },
    detailValue: {
        fontSize: wp(3),
        fontWeight: '500',
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2),
    },
    qrButtonText: {
        color: 'white',
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: wp(20),
        gap: wp(4),
    },
    emptyText: {
        fontSize: wp(4.5),
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: wp(3.5),
        textAlign: 'center',
        color: '#666',
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(4),
        gap: wp(2),
    },
    loadingMoreText: {
        color: '#666',
    },
    qrModalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    qrModal: {
        width: '100%',
        maxWidth: wp(90),
        padding: wp(5),
        borderRadius: wp(3),
        alignItems: 'center',
    },
    qrModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: wp(4),
    },
    qrCodeContainer: {
        padding: wp(4),
        borderRadius: wp(3),
        marginBottom: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    qrDetails: {
        alignItems: 'center',
        gap: wp(1),
    },
    qrStationName: {
        fontSize: wp(4),
        textAlign: 'center',
    },
    qrServiceName: {
        fontSize: wp(3.2),
        color: '#666',
        textAlign: 'center',
    },
    qrAmount: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    multiItemContainer: {
        marginBottom: wp(2),
        padding: wp(2),
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: wp(1.5),
    },
    itemDetail: {
        marginLeft: wp(2),
        marginTop: wp(1),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: wp(2),
        marginTop: wp(2),
    },
    navigateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        borderWidth: 2,
        gap: wp(2),
    },
    navigateButtonText: {
        fontSize: wp(3.5),
        fontWeight: '600',
    },
});
