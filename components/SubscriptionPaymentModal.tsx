import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { handleMakePayment } from '@/payments/operations';
import { updateDocument } from '@/db/operations';

interface SubscriptionPaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({ isVisible, onClose, vehicleId }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentUpdate, setPaymentUpdate] = useState('');

  const handlePayment = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    try {
      await handleMakePayment(
        10, // Subscription amount: $10
        'Vehicle Tracking Subscription',
        setPaymentUpdate,
        phoneNumber
      );

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await updateDocument('TrackedVehicles', vehicleId, {
        subscription: {
          status: 'active',
          expiryDate: expiryDate.toISOString(),
        }
      });

      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process payment.');
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modal}>
          <ThemedText type="subtitle">Subscribe for $10/month</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handlePayment}>
            <Text style={styles.buttonText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          {paymentUpdate && <Text>{paymentUpdate}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  closeButtonText: {
    color: '#007bff',
  },
});

export default SubscriptionPaymentModal;