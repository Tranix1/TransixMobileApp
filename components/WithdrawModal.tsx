import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { BlurView } from 'expo-blur';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';

// TODO: implement this in your referral service — should hit your backend / DB
// and either debit the balance immediately or create a 'pending' withdrawal record.

import { requestWithdrawal } from '@/Utilities/referralService.additions';

type WithdrawMethod = 'ecocash' | 'bank';

interface WithdrawModalProps {
  isVisible: boolean;
  onClose: () => void;
  availableBalance: number;
  referrerUserId: string;
  onWithdrawSuccess: () => void; // let the parent screen refresh balance/history
}

const MIN_WITHDRAWAL = 5;

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isVisible,
  onClose,
  availableBalance,
  referrerUserId,
  onWithdrawSuccess,
}) => {
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const iconColorTheme = useThemeColor('icon');
  const errorColor =  '#E53935';

  const [method, setMethod] = useState<WithdrawMethod>('ecocash');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState(''); // phone number or bank account
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setAmount('');
    setDestination('');
    setMethod('ecocash');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parsedAmount = parseFloat(amount);
  const amountIsValid =
    !isNaN(parsedAmount) && parsedAmount >= MIN_WITHDRAWAL && parsedAmount <= availableBalance;

  const handleSubmit = async () => {
    if (!amount || isNaN(parsedAmount)) {
      Alert.alert('Error', 'Please enter a withdrawal amount.');
      return;
    }
    if (parsedAmount < MIN_WITHDRAWAL) {
      Alert.alert('Error', `Minimum withdrawal is $${MIN_WITHDRAWAL}.`);
      return;
    }
    if (parsedAmount > availableBalance) {
      Alert.alert('Error', 'Withdrawal amount exceeds your available balance.');
      return;
    }
    if (!destination) {
      Alert.alert('Error', method === 'ecocash' ? 'Please enter your Ecocash number.' : 'Please enter your bank account details.');
      return;
    }

    setLoading(true);
    try {
      const result = await requestWithdrawal(referrerUserId, parsedAmount, method, destination);

      if (result.success) {
        Alert.alert(
          'Withdrawal Requested',
          `Your request for $${parsedAmount.toFixed(2)} is being processed.`,
          [{ text: 'OK', onPress: () => {} }]
        );
        onWithdrawSuccess();
        resetState();
        onClose();
      } else {
        Alert.alert('Error', result.message || 'Could not process withdrawal. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
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
                <Ionicons name="wallet-outline" size={wp(8)} color={accent} />
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={wp(5)} color={iconColorTheme} />
              </TouchableOpacity>
            </View>

            <ThemedText type="subtitle" style={styles.title}>
              Withdraw Earnings
            </ThemedText>

            <ThemedText style={styles.message}>
              {`Available balance: $${availableBalance.toFixed(2)}`}
            </ThemedText>

            {!loading && (
              <>
                {/* Method switch */}
                <View style={[styles.methodSwitch, { backgroundColor: backgroundLight }]}>
                  <TouchableOpacity
                    style={[styles.methodOption, method === 'ecocash' && { backgroundColor: accent }]}
                    onPress={() => setMethod('ecocash')}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={wp(4.5)}
                      color={method === 'ecocash' ? 'white' : iconColorTheme}
                    />
                    <ThemedText style={[styles.methodText, { color: method === 'ecocash' ? 'white' : iconColorTheme }]}>
                      Ecocash
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.methodOption, method === 'bank' && { backgroundColor: accent }]}
                    onPress={() => setMethod('bank')}
                  >
                    <Ionicons
                      name="business-outline"
                      size={wp(4.5)}
                      color={method === 'bank' ? 'white' : iconColorTheme}
                    />
                    <ThemedText style={[styles.methodText, { color: method === 'bank' ? 'white' : iconColorTheme }]}>
                      Bank Transfer
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <Input
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={`Amount (min $${MIN_WITHDRAWAL})`}
                  keyboardType="numeric"
                  style={{ height: hp(1) }}
                />

                <View style={{ height: wp(3) }} />

                <Input
                  value={destination}
                  onChangeText={setDestination}
                  placeholder={method === 'ecocash' ? 'Ecocash phone number' : 'Bank account number'}
                  keyboardType={method === 'ecocash' ? 'numeric' : 'default'}
                  style={{ height: hp(1) }}
                />

                {amount.length > 0 && !amountIsValid && (
                  <ThemedText style={[styles.helperError, { color: errorColor }]}>
                    {parsedAmount > availableBalance
                      ? 'Amount exceeds your available balance.'
                      : `Enter at least $${MIN_WITHDRAWAL}.`}
                  </ThemedText>
                )}
              </>
            )}

            {/* Actions */}
            {!loading && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: iconColorTheme }]}
                  onPress={handleClose}
                >
                  <ThemedText style={[styles.buttonText, styles.cancelText]}>Cancel</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, { backgroundColor: accent, opacity: amountIsValid && destination ? 1 : 0.5 }]}
                  onPress={handleSubmit}
                  disabled={!amountIsValid || !destination}
                >
                  <ThemedText style={[styles.buttonText, styles.confirmText]}>Withdraw</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={accent} size="small" />
              </View>
            )}
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
    width: '90%',
    maxWidth: wp(85),
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
  helperError: {
    fontSize: wp(3.2),
    marginTop: wp(2),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
    marginTop: wp(4),
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
    marginTop: wp(4),
  },
});

export default WithdrawModal;
