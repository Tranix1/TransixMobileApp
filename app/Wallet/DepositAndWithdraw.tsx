import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import BalanceDisplay from '@/components/BalanceDisplay';
import Input from '@/components/Input';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { useAuth } from '@/context/AuthContext';
import { addDocument } from '@/db/operations';
import { handleMakePayment } from '@/payments/operations';
import { addToWallet } from '@/Utilities/walletUtils';

const DepositAndWithdraw = () => {
  const router = useRouter();
  const accent = useThemeColor('accent') || '#007AFF';
  const backgroundLight = useThemeColor('backgroundLight') ;
  const background = useThemeColor('background') ;
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [paymentUpdate, setPaymentUpdate] = useState('');

  const handleDeposit = async () => {
    if (!amount || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    setPaymentUpdate('');

    try {
      const result = await handleMakePayment(
        depositAmount,
        `Wallet Deposit - $${depositAmount.toFixed(2)}`,
        setPaymentUpdate,
        phoneNumber
      );

      if (result.success) {
        // Add funds to wallet
        if (user?.uid) {
          await addToWallet(user.uid, depositAmount, `PayNow deposit of $${depositAmount.toFixed(2)}`);
        }

        Alert.alert(
          'Deposit Successful',
          `$${depositAmount.toFixed(2)} has been added to your wallet.`,
          [{ text: 'OK', onPress: () => {} }]
        );

        setAmount('');
        setPhoneNumber('');
        setPaymentUpdate('');
      } else {
        Alert.alert('Deposit Failed', result.message);
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      Alert.alert('Error', 'Failed to process deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Create withdrawal transaction
      const transactionData = {
        userId: user?.uid,
        type: 'withdrawal',
        amount: withdrawAmount,
        paymentMethod: 'PayNow',
        phoneNumber: phoneNumber,
        status: 'pending',
        description: `PayNow withdrawal of $${withdrawAmount.toFixed(2)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDocument('WalletTransactions', transactionData);

      Alert.alert(
        'Withdrawal Requested',
        'Your withdrawal request has been submitted. Processing may take 1-3 business days.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

      setAmount('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      Alert.alert('Error', 'Failed to request withdrawal. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScreenWrapper>
      <Heading page="Deposit & Withdraw" rightComponent={<BalanceDisplay />} />
      <ScrollView style={styles.container}>

        <View style={[styles.tabContainer, { backgroundColor: backgroundLight }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'deposit' && { backgroundColor: accent }]}
            onPress={() => setActiveTab('deposit')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'deposit' && { color: 'white' }]}>
              Deposit
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'withdraw' && { backgroundColor: accent }]}
            onPress={() => setActiveTab('withdraw')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'withdraw' && { color: 'white' }]}>
              Withdraw
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.formContainer, { backgroundColor: backgroundLight }]}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Amount (USD)</ThemedText>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Phone Number</ThemedText>
            <Input
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter PayNow phone number"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: accent }]}
            onPress={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
            disabled={loading}
          >
            <ThemedText style={styles.submitButtonText}>
              {loading ? 'Processing...' : activeTab === 'deposit' ? 'Deposit with PayNow' : 'Request Withdrawal'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {paymentUpdate ? (
          <View style={[styles.paymentStatusContainer, { backgroundColor: backgroundLight }]}>
            <ThemedText style={styles.paymentStatusText}>{paymentUpdate}</ThemedText>
          </View>
        ) : null}

        <View style={[styles.infoContainer, { backgroundColor: backgroundLight }]}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={wp(5)} color={accent} />
            <ThemedText style={styles.infoText}>
              {activeTab === 'deposit'
                ? 'Deposits are processed instantly via PayNow. Funds will be available immediately after confirmation.'
                : 'Withdrawals are processed within 1-3 business days. You will receive a confirmation SMS once processed.'
              }
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: wp(4),
    // backgroundColor: '#f0f0f0',
    borderRadius: wp(2),
    padding: wp(1),
  },
  tab: {
    flex: 1,
    paddingVertical: wp(3),
    alignItems: 'center',
    borderRadius: wp(2),
  },
  tabText: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#666',
  },
  formContainer: {
    margin: wp(4),
    padding: wp(4),
    borderRadius: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: wp(4),
  },
  label: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#666',
    // color: '#333',
    marginBottom: wp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp(2),
    padding: wp(3),
    fontSize: wp(4),
    // backgroundColor: background,
    color: '#333',
  },
  submitButton: {
    padding: wp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    marginTop: wp(2),
  },
  submitButtonText: {
    color: 'white',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  infoContainer: {
    margin: wp(4),
    padding: wp(4),
    // backgroundColor: '#f8f9fa',
    borderRadius: wp(3),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: wp(3.5),
    color: '#666',
    marginLeft: wp(2),
    lineHeight: wp(5),
  },
  paymentStatusContainer: {
    margin: wp(4),
    padding: wp(4),
    // backgroundColor: '#f8f9fa',
    borderRadius: wp(3),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  paymentStatusText: {
    fontSize: wp(4),
    // color: '#333',
    color: '#666',

    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DepositAndWithdraw;