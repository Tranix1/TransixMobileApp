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

interface FuelStation {
    id: string;
    name: string;
    location: {
        description: string;
        latitude: number;
        longitude: number;
        city: string | null;
        country: string | null;
    };
    fuelTypes: {
        diesel: { price: string; available: boolean };
        petrol: { price: string; available: boolean };
        other: { name: string; price: string; available: boolean };
    };
    contactNumber: string;
    operatingHours: string;
    amenities: string[];
    description: string;
    addedBy: string;
    addedAt: Date;
}

interface FuelPaymentModalProps {
    isVisible: boolean;
    onClose: () => void;
    fuelStation: FuelStation | null;
}

interface FuelPurchase {
    id: string;
    fuelType: string;
    price: number;
    quantity: number;
    totalAmount: number;
    stationName: string;
    stationId: string;
    purchaseDate: string;
    qrCode: string;
    status: 'pending' | 'completed' | 'cancelled';
    serviceType: 'fuel';
}

const FuelPaymentModal: React.FC<FuelPaymentModalProps> = ({ isVisible, onClose, fuelStation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentUpdate, setPaymentUpdate] = useState('');
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [selectedFuelType, setSelectedFuelType] = useState<string>('');
    const [quantity, setQuantity] = useState('1');
    const [showQRCode, setShowQRCode] = useState(false);
    const [purchaseData, setPurchaseData] = useState<FuelPurchase | null>(null);

    const { user } = useAuth();
    const accent = useThemeColor("accent");
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');

    // Generate secure random ID for fuel purchase
    const generateSecureId = () => {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `FUEL_${timestamp}_${random}`;
    };

    // Get available fuel types
    const getAvailableFuelTypes = () => {
        if (!fuelStation) return [];

        return Object.entries(fuelStation.fuelTypes)
            .filter(([_, fuel]) => fuel.available)
            .map(([type, fuel]) => ({
                type,
                name: type === 'other' ? (fuel as any).name || 'Other' : type.charAt(0).toUpperCase() + type.slice(1),
                price: parseFloat(fuel.price)
            }));
    };

    const availableFuelTypes = getAvailableFuelTypes();

    const calculateTotal = () => {
        if (!selectedFuelType || !quantity) return 0;
        const fuelType = availableFuelTypes.find(f => f.type === selectedFuelType);
        if (!fuelType) return 0;
        return fuelType.price * parseFloat(quantity);
    };

    const savePaymentToDatabase = async (purchase: FuelPurchase) => {
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
            console.log('Payment saved to database successfully');
        } catch (error) {
            console.error('Error saving payment to database:', error);
        }
    };

    const handlePayment = async () => {
        if (!phoneNumber) {
            setPaymentUpdate("Please enter your phone number.");
            return;
        }

        if (!selectedFuelType) {
            setPaymentUpdate("Please select a fuel type.");
            return;
        }

        if (!quantity || parseFloat(quantity) <= 0) {
            setPaymentUpdate("Please enter a valid quantity.");
            return;
        }

        setIsLoadingPayment(true);
        setPaymentUpdate("");

        try {
            const totalAmount = calculateTotal();
            const fuelType = availableFuelTypes.find(f => f.type === selectedFuelType);

            if (!fuelType) {
                setPaymentUpdate("Invalid fuel type selected.");
                return;
            }

            const result = await handleMakePayment(
                totalAmount,
                `Fuel Purchase - ${fuelType.name} (${quantity}L)`,
                setPaymentUpdate,
                phoneNumber
            );

            if (result.success) {
                // Generate purchase data and QR code
                const purchaseId = generateSecureId();
                const purchase: FuelPurchase = {
                    id: purchaseId,
                    fuelType: fuelType.name,
                    price: fuelType.price,
                    quantity: parseFloat(quantity),
                    totalAmount: totalAmount,
                    stationName: fuelStation?.name || '',
                    stationId: fuelStation?.id || '',
                    purchaseDate: new Date().toISOString(),
                    qrCode: `FUEL_PAYMENT:${purchaseId}:${fuelStation?.id}:${fuelType.type}:${quantity}:${totalAmount}`,
                    status: 'completed',
                    serviceType: 'fuel'
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
        setSelectedFuelType('');
        setQuantity('1');
        setPhoneNumber('');
        setPaymentUpdate('');
        onClose();
    };

    if (!fuelStation) return null;

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', flex: 1, padding: wp(4) }}>
                <View style={styles.container}>
                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                        {!showQRCode ? (
                            <>
                                <View style={styles.header}>
                                    <ThemedText type="subtitle">Fuel Payment</ThemedText>
                                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={wp(5)} color={icon} />
                                    </TouchableOpacity>
                                </View>

                                <ThemedText type='italic' style={styles.stationName}>{fuelStation.name}</ThemedText>

                                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                                    {/* Fuel Type Selection */}
                                    <View style={styles.section}>
                                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Select Fuel Type</ThemedText>
                                        <View style={styles.fuelTypeContainer}>
                                            {availableFuelTypes.map((fuel) => (
                                                <TouchableOpacity
                                                    key={fuel.type}
                                                    style={[
                                                        styles.fuelTypeButton,
                                                        {
                                                            backgroundColor: selectedFuelType === fuel.type ? accent + '20' : backgroundLight,
                                                            borderColor: selectedFuelType === fuel.type ? accent : 'transparent'
                                                        }
                                                    ]}
                                                    onPress={() => setSelectedFuelType(fuel.type)}
                                                >
                                                    <ThemedText
                                                        style={[
                                                            styles.fuelTypeText,
                                                            { color: selectedFuelType === fuel.type ? accent : icon }
                                                        ]}
                                                    >
                                                        {fuel.name}
                                                    </ThemedText>
                                                    <ThemedText
                                                        style={[
                                                            styles.fuelPriceText,
                                                            { color: selectedFuelType === fuel.type ? accent : icon }
                                                        ]}
                                                    >
                                                        ${fuel.price}/L
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Quantity Input */}
                                    <View style={styles.section}>
                                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Quantity (Liters)</ThemedText>
                                        <Input
                                            placeholder="Enter quantity"
                                            value={quantity}
                                            onChangeText={setQuantity}
                                            keyboardType="numeric"
                                            editable={!isLoadingPayment}
                                        />
                                    </View>

                                    {/* Total Amount */}
                                    {selectedFuelType && quantity && (
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

                                <ThemedText type='italic' style={styles.stationName}>{fuelStation.name}</ThemedText>

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
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Fuel Type:</ThemedText>
                                        <ThemedText style={styles.detailValue}>{purchaseData?.fuelType}</ThemedText>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Quantity:</ThemedText>
                                        <ThemedText style={styles.detailValue}>{purchaseData?.quantity}L</ThemedText>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Price per Liter:</ThemedText>
                                        <ThemedText style={styles.detailValue}>${purchaseData?.price}</ThemedText>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Total Amount:</ThemedText>
                                        <ThemedText style={[styles.detailValue, { color: accent, fontWeight: 'bold' }]}>
                                            ${purchaseData?.totalAmount.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <ThemedText style={styles.detailLabel}>Purchase ID:</ThemedText>
                                        <ThemedText style={[styles.detailValue, { fontSize: wp(2.5) }]}>{purchaseData?.id}</ThemedText>
                                    </View>
                                </View>

                                <ThemedText style={styles.qrInstructions}>
                                    Show this QR code to the fuel station attendant to complete your purchase.
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
        maxHeight: hp(85),
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
        maxHeight: hp(60),
    },
    section: {
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(2),
        fontSize: wp(3.5),
    },
    fuelTypeContainer: {
        gap: wp(2),
    },
    fuelTypeButton: {
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fuelTypeText: {
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    fuelPriceText: {
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

export default FuelPaymentModal;
