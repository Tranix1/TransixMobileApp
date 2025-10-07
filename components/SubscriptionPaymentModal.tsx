import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { handleMakePayment } from '@/payments/operations';
import { updateDocument, addDocument } from '@/db/operations';
import ScreenWrapper from './ScreenWrapper';
import { BlurView } from 'expo-blur'
import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor';
import Input from './Input';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionPaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
}


const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({ isVisible, onClose, vehicleId, vehicleName }) => {

  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentUpdate, setPaymentUpdate] = useState('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const { user } = useAuth();
  const accent = useThemeColor("accent");
  const background = useThemeColor('background')

  // Generate secure random ID for tracking payment
  const generateSecureId = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TRACKING_${timestamp}_${random}`;
  };

  const saveTrackingPaymentToDatabase = async () => {
    try {
      const paymentId = generateSecureId();
      const paymentData = {
        id: paymentId,
        serviceType: 'Vehicle Tracking Subscription',
        price: 10,
        quantity: 1,
        totalAmount: 10,
        stationName: 'Transix Tracking Service',
        stationId: 'tracking-service',
        purchaseDate: new Date().toISOString(),
        qrCode: `TRACKING_PAYMENT:${paymentId}:${vehicleId}:subscription:1:10`,
        status: 'completed',
        serviceCategory: 'tracking',
        userId: user?.uid,
        userEmail: user?.email,
        paymentMethod: 'ecocash',
        phoneNumber: phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDocument('Payments', paymentData);
      console.log('Tracking payment saved to database successfully');
    } catch (error) {
      console.error('Error saving tracking payment to database:', error);
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      setPaymentUpdate("Please enter your phone number.");
      return;
    }

    setIsLoadingPayment(true);
    setPaymentUpdate("");

    try {
      const result = await handleMakePayment(
        10, // Subscription amount: $10
        "Vehicle Tracking Subscription",
        setPaymentUpdate,
        phoneNumber
      );

      if (result.success) {
        // ✅ Only update DB if payment is successful
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        try {
          await updateDocument("TrackedVehicles", vehicleId, {
            subscription: {
              status: "active",
              expiryDate: expiryDate.toISOString(),
            },
            paymentType: "Subscription",
          });

          // Save payment to Payments collection
          await saveTrackingPaymentToDatabase();

          setPaymentUpdate("✅ Payment successful! Vehicle upgraded to subscription.");
          setTimeout(() => onClose(), 2000);
        } catch (updateError: any) {
          console.error("Error updating vehicle subscription:", updateError);
          setPaymentUpdate("⚠️ Payment successful but failed to update vehicle. Please contact support.");
        }
      } else {
        setPaymentUpdate(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setPaymentUpdate(error.message || "Failed to process payment.");
    } finally {
      setIsLoadingPayment(false);
    }
  };


  return (
    <Modal visible={isVisible} transparent animationType="slide" >

      <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', flex: 1, padding: wp(4), }}>
        <View style={styles.container}>
          <View style={{
            backgroundColor: background,
            padding: 20,
            borderRadius: 10,
            width: '80%',
          }}>
            <ThemedText type="subtitle">Subscribe for $10/month</ThemedText>
            <ThemedText type='italic' style={{ marginTop: wp(0.5), alignSelf: "center" }} >{vehicleName}</ThemedText>
            <Input
              // style={{ marginVertical: 10, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10 }}
              placeholder="Enter your Ecocash number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!isLoadingPayment} // ✅ replaces disabled

            />
            <TouchableOpacity style={{
              backgroundColor: accent,
              padding: 10,
              borderRadius: 5,
              alignItems: 'center',
            }} onPress={handlePayment} disabled={isLoadingPayment}>
              <Text style={styles.buttonText}>Pay Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} >
              <Text style={{ color: accent }}>Close</Text>
            </TouchableOpacity>
            {paymentUpdate && <ThemedText style={{ marginTop: 10, textAlign: 'center' }}>{paymentUpdate}</ThemedText>}
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
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },

});

export default SubscriptionPaymentModal;