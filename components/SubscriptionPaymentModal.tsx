import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ToastAndroid } from 'react-native';
import { ThemedText } from './ThemedText';
import { BlurView } from 'expo-blur';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';

import { handleEcocashPayment, handleCardPayment, confirmCardPayment } from '../app/Payments/paymentHandlers';
import { creditReferralIfEligible } from '../app/Referrals/referralService';
import { SubscriptionType, SUBSCRIPTION_PRICING, PaymentMethod } from '../constants/subscriptionConfig';
import { addDocument } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';

type SelectedTruck = {
  id: string;
  name?: string;
  numberPlate?: string;
  type?: string;
  capacity?: string;
};

interface SubscriptionPaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCancel?: () => void;
  loadVehicles?: () => void;

  trackingVehicleId?: string;

  selectedTrucks?: SelectedTruck[]


  subscriptionType: SubscriptionType; // 'truck' | 'broker' | 'tracking'
  payerOrganizationId?: string; // needed to resolve referral commissions for some flows
  payerOrganizationName?: string;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isVisible,
  onClose,
  onCancel,

  loadVehicles,
  trackingVehicleId,
  selectedTrucks,
  subscriptionType,
  payerOrganizationId,
  payerOrganizationName,
}) => {
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const iconColorTheme = useThemeColor('icon');

  const { user } = useAuth()

  const pricing = SUBSCRIPTION_PRICING[subscriptionType];
  const isDev = __DEV__;

  const [paymentMethod, setMethod] = useState<PaymentMethod>('ecocash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentUpdate, setPaymentUpdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingCardConfirm, setAwaitingCardConfirm] = useState(false);
  const [cardPollUrl, setCardPollUrl] = useState<string | null>(null);

  const handleCancel = () => {
    if (onCancel) onCancel();
    else onClose();
  };

  const resetState = () => {
    setPhoneNumber('');
    setPaymentUpdate('');
    setAwaitingCardConfirm(false);
    setCardPollUrl(null);
  };



  const finalizeSuccess = async () => {
    setLoading(true);

    try {
      const { updateDocument } = await import('@/db/operations');
      let totalTruckSubscriptions = 0;

      if (subscriptionType === 'tracking' && trackingVehicleId) {
        const now = Date.now();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30);
        const expiresAt = expiryDate.getTime();

        await updateDocument('TrackedVehicles', trackingVehicleId, {
          subscription: {
            active: true,
            expiresAt,
            type: subscriptionType,
          },
          paymentType: 'Subscription',
        });

        await addDocument('subscriptions', {
          type: 'tracking',
          vehicleId: trackingVehicleId,
          userId: user?.uid,
          plan: 'Tracking Monthly',
          amount: 15,
          billedAt: now,
          expiresAt,
          paymentMethod,
          createdAt: now,
        });
      } else if (subscriptionType === 'brokerage') {
        const now = Date.now();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30);
        const expiresAt = expiryDate.getTime();

        await addDocument('subscriptions', {
          type: 'brokerage',
          organizationId: payerOrganizationId,
          userId: user?.uid,
          plan: 'Broker Monthly',
          amount: 15,
          billedAt: now,
          expiresAt,
          paymentMethod,
          createdAt: now,
        });

        await updateDocument('brokerages', payerOrganizationId, {
          subscription: {
            plan: 'Broker Monthly',
            active: true,
            isTrial: false,
            trialEndsAt: null,
            billedAt: now,
            expiresAt,
          },
          updatedAt: now,
        });

        const updatedBrokerages = user?.brokerageDetails?.map((broker: any) => {
          if (broker.organizationId === payerOrganizationId) {
            return {
              ...broker,
              subscription: {
                plan: 'Broker Monthly',
                active: true,
                isTrial: false,
                expiresAt,
              },
            };
          }
          return broker;
        });

        await updateDocument('personalData', user?.uid || '', {
          brokerageDetails: updatedBrokerages,
        });
      } else if (subscriptionType === 'truck') {
        const now = Date.now();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30);
        const expiresAt = expiryDate.getTime();

        if (!selectedTrucks || selectedTrucks.length === 0) {
          throw new Error('No trucks selected');
        }

        totalTruckSubscriptions = selectedTrucks.length;

        for (const truck of selectedTrucks) {
          await updateDocument(`fleets/${payerOrganizationId}/trucks`, truck.id, {
            subscription: {
              active: true,
              type: 'truck',
              expiresAt,
            },
            updatedAt: now,
          });
        }

        await addDocument('subscriptions', {
          type: 'truck',
          organizationId: payerOrganizationId,
          userId: user?.uid,
          selectedTrucks: selectedTrucks.map((truck) => ({
            id: truck.id,
            name: truck.name || null,
            numberPlate: truck.numberPlate || null,
            type: truck.type || null,
            capacity: truck.capacity || null,
          })),
          totalTruckSubscriptions: selectedTrucks.length,
          plan: 'Truck Monthly',
          amount: selectedTrucks.length * 15,
          billedAt: now,
          expiresAt,
          paymentMethod,
          createdAt: now,
        });
      }

      if (payerOrganizationId && payerOrganizationName) {
        await creditReferralIfEligible(payerOrganizationId, payerOrganizationName, subscriptionType, pricing.referralCommission, totalTruckSubscriptions);
      }

      if (loadVehicles) loadVehicles();
      resetState();
      onClose();
    } catch (error) {
      console.error('Error completing subscription success flow:', error);
      Alert.alert('Error', 'An error occurred while completing the subscription.');
    } finally {
      setLoading(false);
    }
  };




  const handleEcocashConfirm = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your Ecocash number');
      return;
    }

    setLoading(true);
    setPaymentUpdate('');

    try {
      const result = await handleEcocashPayment(
        pricing.amount,
        `${pricing.label} - $${pricing.amount}`,
        setPaymentUpdate,
        phoneNumber
      );

      if (result.success) {
        await finalizeSuccess();
      }
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardConfirm = async () => {
    setLoading(true);
    setPaymentUpdate('');

    try {
      const result = await handleCardPayment(
        pricing.amount,
        `${pricing.label} - $${pricing.amount}`,
        setPaymentUpdate
      );

      if (result.success && result.pollUrl) {
        setCardPollUrl(result.pollUrl);
        setAwaitingCardConfirm(true);
      } else if (!result.success) {
        Alert.alert('Error', result.message || 'Could not start card checkout.');
      }
    } catch (error) {
      console.error('Error starting card payment:', error);
      Alert.alert('Error', 'Failed to start card checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIvePaid = async () => {
    if (!cardPollUrl) return;
    setLoading(true);

    try {
      const result = await confirmCardPayment(cardPollUrl, setPaymentUpdate);
      if (result.success) {
        await finalizeSuccess();
      }
    } catch (error) {
      console.error('Error confirming card payment:', error);
      Alert.alert('Error', 'Could not confirm payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <BlurView intensity={10} experimentalBlurMethod="dimezisBlurView" tint="regular" style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: backgroundLight }]}>
                <Ionicons name={pricing.icon as any} size={wp(8)} color={accent} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={wp(5)} color={iconColorTheme} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <ThemedText type="subtitle" style={styles.title}>
              {pricing.label}
            </ThemedText>

            {/* Message */}
            <ThemedText style={styles.message}>
              {`Subscribe to ${pricing.label} for $${pricing.amount}/month`}
            </ThemedText>

            {!loading && !awaitingCardConfirm && (
              <>
                {/* Payment method switch */}
                <View style={[styles.methodSwitch, { backgroundColor: backgroundLight }]}>
                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      paymentMethod === 'ecocash' && { backgroundColor: accent },
                    ]}
                    onPress={() => setMethod('ecocash')}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={wp(4.5)}
                      color={paymentMethod === 'ecocash' ? 'white' : iconColorTheme}
                    />
                    <ThemedText
                      style={[
                        styles.methodText,
                        { color: paymentMethod === 'ecocash' ? 'white' : iconColorTheme },
                      ]}
                    >
                      Ecocash
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      paymentMethod === 'card' && { backgroundColor: accent },
                    ]}
                    onPress={() => setMethod('card')}
                  >
                    <Ionicons
                      name="card-outline"
                      size={wp(4.5)}
                      color={paymentMethod === 'card' ? 'white' : iconColorTheme}
                    />
                    <ThemedText
                      style={[
                        styles.methodText,
                        { color: paymentMethod === 'card' ? 'white' : iconColorTheme },
                      ]}
                    >
                      Visa / Mastercard
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {paymentMethod === 'ecocash' ? (
                  <Input
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter Ecocash phone number"
                    keyboardType="numeric"
                    style={{ height: hp(1) }}
                  />
                ) : (
                  <View style={[styles.cardNotice, { backgroundColor: backgroundLight }]}>
                    <Ionicons name="lock-closed-outline" size={wp(4)} color={iconColorTheme} />
                    <ThemedText style={styles.cardNoticeText}>
                      You'll be taken to a secure checkout page to enter your card details.
                    </ThemedText>
                  </View>
                )}
              </>
            )}

            {/* Actions */}
            {!loading && !awaitingCardConfirm && (
              <>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { borderColor: iconColorTheme }]}
                    onPress={handleCancel}
                  >
                    <ThemedText style={[styles.buttonText, styles.cancelText]}>Cancel</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, { backgroundColor: accent }]}
                    onPress={paymentMethod === 'ecocash' ? handleEcocashConfirm : handleCardConfirm}
                  >
                    <ThemedText style={[styles.buttonText, styles.confirmText]}>
                      {paymentMethod === 'ecocash' ? 'Pay Now' : 'Checkout'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {isDev && (
                  <TouchableOpacity
                    style={[styles.simulateButton, { borderColor: accent }]}
                    onPress={finalizeSuccess}
                  >
                    <ThemedText style={[styles.simulateText, { color: accent }]}>Simulate Payment Success</ThemedText>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Card: waiting for user to finish in browser */}
            {!loading && awaitingCardConfirm && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: iconColorTheme }]}
                  onPress={() => setAwaitingCardConfirm(false)}
                >
                  <ThemedText style={[styles.buttonText, styles.cancelText]}>Back</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, { backgroundColor: accent }]}
                  onPress={handleIvePaid}
                >
                  <ThemedText style={[styles.buttonText, styles.confirmText]}>I've Paid</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={accent} size="small" />
              </View>
            )}

            {paymentUpdate ? (
              <View style={[styles.paymentStatusContainer, { backgroundColor: backgroundLight }]}>
                <ThemedText style={styles.paymentStatusText}>{paymentUpdate}</ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(4),
  },
  modalContent: {
    borderRadius: wp(4),
    padding: wp(6),
    width: wp(85),   // fixed width

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(4),
    position: 'relative',
  },
  iconContainer: {
    padding: wp(3),
    borderRadius: wp(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: wp(1),
  },
  title: {
    fontSize: wp(5),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: wp(2),
  },
  message: {
    fontSize: wp(4),
    textAlign: 'center',
    lineHeight: wp(6),
    marginBottom: wp(4),
    color: '#666',
  },
  methodSwitch: {
    flexDirection: 'row',
    borderRadius: wp(3),
    padding: wp(1),
    marginBottom: wp(4),
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1.5),
    paddingVertical: wp(2.5),
    borderRadius: wp(2.5),
  },
  methodText: {
    fontSize: wp(3.4),
    fontWeight: '600',
  },
  cardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    padding: wp(3),
    borderRadius: wp(2.5),
    marginBottom: wp(2),
  },
  cardNoticeText: {
    flex: 1,
    fontSize: wp(3.3),
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
    marginTop: wp(2),
  },
  simulateButton: {
    marginTop: wp(3),
    borderWidth: 1,
    borderRadius: wp(2),
    paddingVertical: wp(2),
    alignItems: 'center',
  },
  simulateText: {
    fontSize: wp(3.4),
    fontWeight: '600',
  },
  button: {
    flex: 1,
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  buttonText: {
    fontSize: wp(4),
    fontWeight: '600',
  },
  cancelText: {
    color: '#666',
  },
  confirmText: {
    color: 'white',
  },
  loadingRow: {
    alignItems: 'center',
    marginTop: wp(2),
  },
  paymentStatusContainer: {
    marginTop: wp(4),
    padding: wp(4),
    borderRadius: wp(3),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  paymentStatusText: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SubscriptionPaymentModal;
