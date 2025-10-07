import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { handleMakePayment } from '@/payments/operations';
import { addDocument } from '@/db/operations';
import ScreenWrapper from '@/components/ScreenWrapper';
import { BlurView } from 'expo-blur'
import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor';
import Input from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/context/AuthContext';
import { TruckStop } from '@/types/types';

interface TruckStopPaymentModalProps {
    isVisible: boolean;
    onClose: () => void;
    truckStop: TruckStop | null;
}

interface TruckStopPurchase {
    id: string;
    serviceItems: Array<{
        serviceType: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    totalAmount: number;
    stationName: string;
    stationId: string;
    purchaseDate: string;
    qrCode: string;
    status: 'pending' | 'completed' | 'cancelled';
    serviceCategory: 'truckstop';
}

const TruckStopPaymentModal: React.FC<TruckStopPaymentModalProps> = ({ isVisible, onClose, truckStop }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentUpdate, setPaymentUpdate] = useState('');
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [selectedServiceItems, setSelectedServiceItems] = useState<Array<{
        serviceType: string;
        quantity: string;
        price: number;
    }>>([]);
    const [showQRCode, setShowQRCode] = useState(false);
    const [purchaseData, setPurchaseData] = useState<TruckStopPurchase | null>(null);

    const { user } = useAuth();
    const accent = useThemeColor("accent");
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');

    // Generate secure random ID for truck stop purchase
    const generateSecureId = () => {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `TRUCKSTOP_${timestamp}_${random}`;
    };

    // Get available services
    const getAvailableServices = () => {
        if (!truckStop || !truckStop.pricing) return [];

        const services = [];

        if (truckStop.pricing.parking) {
            services.push({
                type: 'parking',
                name: 'Parking',
                price: parseFloat(truckStop.pricing.parking.replace(/[^0-9.]/g, '')) || 5.00
            });
        }

        if (truckStop.pricing.food) {
            services.push({
                type: 'food',
                name: 'Food',
                price: parseFloat(truckStop.pricing.food.replace(/[^0-9.]/g, '')) || 10.00
            });
        }

        if (truckStop.pricing.rest) {
            services.push({
                type: 'rest',
                name: 'Rest Area',
                price: parseFloat(truckStop.pricing.rest.replace(/[^0-9.]/g, '')) || 15.00
            });
        }

        // Add default services if none are specified
        if (services.length === 0) {
            services.push(
                { type: 'parking', name: 'Parking', price: 5.00 },
                { type: 'food', name: 'Food', price: 10.00 },
                { type: 'rest', name: 'Rest Area', price: 15.00 }
            );
        }

        return services;
    };

    const availableServices = getAvailableServices();

    const calculateTotal = () => {
        return selectedServiceItems.reduce((total, item) => {
            return total + (item.price * parseFloat(item.quantity || '0'));
        }, 0);
    };

    const addServiceItem = (serviceType: string, price: number) => {
        const existingItem = selectedServiceItems.find(item => item.serviceType === serviceType);
        if (existingItem) {
            setSelectedServiceItems(prev =>
                prev.map(item =>
                    item.serviceType === serviceType
                        ? { ...item, quantity: (parseFloat(item.quantity || '0') + 1).toString() }
                        : item
                )
            );
        } else {
            setSelectedServiceItems(prev => [...prev, { serviceType, quantity: '1', price }]);
        }
    };

    const updateServiceQuantity = (serviceType: string, quantity: string) => {
        setSelectedServiceItems(prev =>
            prev.map(item =>
                item.serviceType === serviceType
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const removeServiceItem = (serviceType: string) => {
        setSelectedServiceItems(prev => prev.filter(item => item.serviceType !== serviceType));
    };

    const savePaymentToDatabase = async (purchase: TruckStopPurchase) => {
        try {
            const paymentData = {
                ...purchase,
                userId: user?.uid,
                userEmail: user?.email,
                paymentMethod: 'ecocash',
                phoneNumber: phoneNumber,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await addDocument('Payments', paymentData);
            console.log('TruckStop payment saved to database successfully');
        } catch (error) {
            console.error('Error saving truck stop payment to database:', error);
        }
    };

    const handlePayment = async () => {
        if (!phoneNumber) {
            setPaymentUpdate("Please enter your phone number.");
            return;
        }

        if (selectedServiceItems.length === 0) {
            setPaymentUpdate("Please add at least one service item.");
            return;
        }

        const hasInvalidQuantity = selectedServiceItems.some(item =>
            !item.quantity || parseFloat(item.quantity) <= 0
        );

        if (hasInvalidQuantity) {
            setPaymentUpdate("Please enter valid quantities for all service items.");
            return;
        }

        setIsLoadingPayment(true);
        setPaymentUpdate("");

        try {
            const totalAmount = calculateTotal();
            const serviceItems = selectedServiceItems.map(item => ({
                serviceType: item.serviceType,
                price: item.price,
                quantity: parseFloat(item.quantity),
                subtotal: item.price * parseFloat(item.quantity)
            }));

            const serviceDescription = serviceItems.map(item =>
                `${item.serviceType} (${item.quantity} units)`
            ).join(', ');

            const result = await handleMakePayment(
                totalAmount,
                `Truck Stop - ${serviceDescription}`,
                setPaymentUpdate,
                phoneNumber
            );

            if (result.success) {
                // Generate purchase data and QR code
                const purchaseId = generateSecureId();
                const purchase: TruckStopPurchase = {
                    id: purchaseId,
                    serviceItems: serviceItems,
                    totalAmount: totalAmount,
                    stationName: truckStop?.name || '',
                    stationId: truckStop?.id || 'unknown',
                    purchaseDate: new Date().toISOString(),
                    qrCode: `TRUCKSTOP_PAYMENT:${purchaseId}:${truckStop?.id || 'unknown'}:${JSON.stringify(serviceItems)}:${totalAmount}`,
                    status: 'completed',
                    serviceCategory: 'truckstop'
                };

                setPurchaseData(purchase);
                setShowQRCode(true);
                setPaymentUpdate("✅ Payment successful! Your QR code is ready.");

                // Save payment to database
                await savePaymentToDatabase(purchase);
            } else {
                setPaymentUpdate(`❌ ${result.message}`);
            }
        } catch (error: any) {
            setPaymentUpdate(error.message || "Failed to process payment.");
        } finally {
            setIsLoadingPayment(false);
        }
    };

    const handleClose = () => {
        setShowQRCode(false);
        setPurchaseData(null);
        setSelectedServiceItems([]);
        setPhoneNumber('');
        setPaymentUpdate('');
        onClose();
    };

    if (!truckStop) return null;

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', flex: 1, padding: wp(4) }}>
                <View style={styles.container}>
                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                        {!showQRCode ? (
                            <>
                                <View style={styles.header}>
                                    <ThemedText type="subtitle">Truck Stop Payment</ThemedText>
                                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={wp(5)} color={icon} />
                                    </TouchableOpacity>
                                </View>

                                <ThemedText type='italic' style={styles.stationName}>{truckStop.name}</ThemedText>

                                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                                    {/* Available Services */}
                                    <View style={styles.section}>
                                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Available Services</ThemedText>
                                        <View style={styles.serviceTypeContainer}>
                                            {availableServices.map((service) => (
                                                <TouchableOpacity
                                                    key={service.type}
                                                    style={[
                                                        styles.serviceTypeButton,
                                                        {
                                                            backgroundColor: backgroundLight,
                                                            borderColor: accent
                                                        }
                                                    ]}
                                                    onPress={() => addServiceItem(service.type, service.price)}
                                                >
                                                    <ThemedText
                                                        style={[
                                                            styles.serviceTypeText,
                                                            { color: icon }
                                                        ]}
                                                    >
                                                        {service.name}
                                                    </ThemedText>
                                                    <ThemedText
                                                        style={[
                                                            styles.servicePriceText,
                                                            { color: accent }
                                                        ]}
                                                    >
                                                        ${service.price}/unit
                                                    </ThemedText>
                                                    <Ionicons name="add" size={wp(4)} color={accent} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Selected Service Items */}
                                    {selectedServiceItems.length > 0 && (
                                        <View style={styles.section}>
                                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Selected Services</ThemedText>
                                            {selectedServiceItems.map((item, index) => (
                                                <View key={index} style={styles.selectedItemContainer}>
                                                    <View style={styles.selectedItemInfo}>
                                                        <ThemedText style={styles.selectedItemName}>
                                                            {availableServices.find(s => s.type === item.serviceType)?.name}
                                                        </ThemedText>
                                                        <ThemedText style={styles.selectedItemPrice}>
                                                            ${item.price}/unit
                                                        </ThemedText>
                                                    </View>
                                                    <View style={styles.quantityContainer}>
                                                        <TouchableOpacity
                                                            style={styles.quantityButton}
                                                            onPress={() => {
                                                                const newQuantity = parseFloat(item.quantity) - 1;
                                                                if (newQuantity <= 0) {
                                                                    removeServiceItem(item.serviceType);
                                                                } else {
                                                                    updateServiceQuantity(item.serviceType, newQuantity.toString());
                                                                }
                                                            }}
                                                        >
                                                            <Ionicons name="remove" size={wp(4)} color={accent} />
                                                        </TouchableOpacity>
                                                        <Input
                                                            value={item.quantity}
                                                            onChangeText={(text) => updateServiceQuantity(item.serviceType, text)}
                                                            keyboardType="numeric"
                                                            style={styles.quantityInput}
                                                            editable={!isLoadingPayment}
                                                        />
                                                        <TouchableOpacity
                                                            style={styles.quantityButton}
                                                            onPress={() => {
                                                                const newQuantity = parseFloat(item.quantity) + 1;
                                                                updateServiceQuantity(item.serviceType, newQuantity.toString());
                                                            }}
                                                        >
                                                            <Ionicons name="add" size={wp(4)} color={accent} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <ThemedText style={styles.subtotalText}>
                                                        ${(item.price * parseFloat(item.quantity)).toFixed(2)}
                                                    </ThemedText>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Total Amount */}
                                    {selectedServiceItems.length > 0 && (
                                        <View style={styles.totalContainer}>
                                            <ThemedText type="defaultSemiBold" style={styles.totalLabel}>Total Amount:</ThemedText>
                                            <ThemedText type="subtitle" style={[styles.totalAmount, { color: accent }]}>
                                                ${calculateTotal().toFixed(2)}
                                            </ThemedText>
                                        </View>
                                    )}

                                    {/* Phone Number */}
                                    <View style={styles.section}>
                                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Phone Number</ThemedText>
                                        <Input
                                            placeholder="Enter your Ecocash number"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                            editable={!isLoadingPayment}
                                        />
                                    </View>

                                    {/* Payment Button */}
                                    <TouchableOpacity
                                        style={[styles.payButton, { backgroundColor: accent }]}
                                        onPress={handlePayment}
                                        disabled={isLoadingPayment}
                                    >
                                        {isLoadingPayment ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
                                        )}
                                    </TouchableOpacity>

                                    {paymentUpdate && (
                                        <ThemedText style={[styles.paymentUpdate, { color: paymentUpdate.includes('✅') ? 'green' : paymentUpdate.includes('❌') ? 'red' : icon }]}>
                                            {paymentUpdate}
                                        </ThemedText>
                                    )}
                                </ScrollView>
                            </>
                        ) : (
                            /* QR Code Display */
                            <View style={styles.qrContainer}>
                                <View style={styles.header}>
                                    <ThemedText type="subtitle">Payment Complete!</ThemedText>
                                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={wp(5)} color={icon} />
                                    </TouchableOpacity>
                                </View>

                                <ThemedText type='italic' style={styles.stationName}>{truckStop.name}</ThemedText>

                                <View style={styles.qrCodeContainer}>
                                    <QRCode
                                        value={purchaseData?.qrCode || ''}
                                        size={wp(60)}
                                        color="black"
                                        backgroundColor="white"
                                    />
                                </View>

                                <View style={styles.purchaseDetails}>
                                    <ThemedText type="defaultSemiBold" style={styles.detailsTitle}>Purchase Details</ThemedText>

                                    {/* Service Items */}
                                    {purchaseData?.serviceItems.map((item, index) => (
                                        <View key={index} style={styles.serviceItemDetail}>
                                            <ThemedText style={styles.serviceItemName}>{item.serviceType}</ThemedText>
                                            <View style={styles.serviceItemRow}>
                                                <ThemedText style={styles.detailLabel}>Quantity:</ThemedText>
                                                <ThemedText style={styles.detailValue}>{item.quantity} units</ThemedText>
                                            </View>
                                            <View style={styles.serviceItemRow}>
                                                <ThemedText style={styles.detailLabel}>Price per Unit:</ThemedText>
                                                <ThemedText style={styles.detailValue}>${item.price}</ThemedText>
                                            </View>
                                            <View style={styles.serviceItemRow}>
                                                <ThemedText style={styles.detailLabel}>Subtotal:</ThemedText>
                                                <ThemedText style={[styles.detailValue, { color: accent, fontWeight: 'bold' }]}>
                                                    ${item.subtotal.toFixed(2)}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    ))}

                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Total Amount:</ThemedText>
                                        <ThemedText style={[styles.detailValue, { color: accent, fontWeight: 'bold', fontSize: wp(4) }]}>
                                            ${purchaseData?.totalAmount.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Purchase ID:</ThemedText>
                                        <ThemedText style={[styles.detailValue, { fontSize: wp(2.5) }]}>{purchaseData?.id}</ThemedText>
                                    </View>
                                </View>

                                <ThemedText style={styles.qrInstructions}>
                                    Show this QR code to the truck stop attendant to access your services.
                                </ThemedText>

                                <TouchableOpacity style={[styles.doneButton, { backgroundColor: accent }]} onPress={handleClose}>
                                    <ThemedText style={styles.doneButtonText}>Done</ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: wp(5),
        borderRadius: wp(3),
        width: '95%',
        maxHeight: hp(90),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    closeButton: {
        padding: wp(1),
    },
    stationName: {
        textAlign: 'center',
        marginBottom: wp(4),
        fontSize: wp(3.5),
    },
    scrollContent: {
        maxHeight: hp(65),
    },
    section: {
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(2),
        fontSize: wp(3.5),
    },
    serviceTypeContainer: {
        gap: wp(2),
    },
    serviceTypeButton: {
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceTypeText: {
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    servicePriceText: {
        fontSize: wp(3.2),
        fontWeight: 'bold',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(3),
        backgroundColor: '#f0f0f0',
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    totalLabel: {
        fontSize: wp(4),
    },
    totalAmount: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    payButton: {
        padding: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        marginTop: wp(2),
    },
    payButtonText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    paymentUpdate: {
        textAlign: 'center',
        marginTop: wp(3),
        fontSize: wp(3.2),
    },
    qrContainer: {
        alignItems: 'center',
        paddingBottom: wp(4),
    },
    qrCodeContainer: {
        padding: wp(4),
        backgroundColor: 'white',
        borderRadius: wp(3),
        marginVertical: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    purchaseDetails: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(4),
    },
    detailsTitle: {
        fontSize: wp(4),
        marginBottom: wp(3),
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(2),
    },
    detailLabel: {
        fontSize: wp(3.2),
        color: '#666',
    },
    detailValue: {
        fontSize: wp(3.2),
        fontWeight: '500',
    },
    selectedItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: wp(3),
        backgroundColor: '#f8f9fa',
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    selectedItemInfo: {
        flex: 1,
    },
    selectedItemName: {
        fontSize: wp(3.5),
        fontWeight: '600',
        marginBottom: wp(1),
    },
    selectedItemPrice: {
        fontSize: wp(3),
        color: '#666',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        marginHorizontal: wp(3),
    },
    quantityButton: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        backgroundColor: '#e9ecef',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityInput: {
        width: wp(12),
        textAlign: 'center',
        fontSize: wp(3.5),
    },
    subtotalText: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        color: '#007AFF',
        minWidth: wp(15),
        textAlign: 'right',
    },
    serviceItemDetail: {
        backgroundColor: '#f8f9fa',
        padding: wp(3),
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    serviceItemName: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        marginBottom: wp(2),
        color: '#007AFF',
    },
    serviceItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(1),
    },
    qrInstructions: {
        textAlign: 'center',
        fontSize: wp(3.2),
        color: '#666',
        marginBottom: wp(4),
        lineHeight: wp(4.5),
    },
    doneButton: {
        padding: wp(4),
        borderRadius: wp(2),
        alignItems: 'center',
        width: '100%',
    },
    doneButtonText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
});

export default TruckStopPaymentModal;
