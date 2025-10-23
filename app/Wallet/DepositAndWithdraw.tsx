import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { useAuth } from '@/context/AuthContext';
import { addDocument } from '@/db/operations';

const DepositAndWithdraw = () => {
  const router = useRouter();
  const accent = useThemeColor('accent') || '#007AFF';
  const backgroundLight = useThemeColor('backgroundLight') || '#f5f5f5';
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

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
    try {
      // Create PayNow deposit transaction
      const transactionData = {
        userId: user?.uid,
        type: 'deposit',
        amount: depositAmount,
        paymentMethod: 'PayNow',
        phoneNumber: phoneNumber,
        status: 'pending',
        description: `PayNow deposit of $${depositAmount.toFixed(2)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDocument('WalletTransactions', transactionData);

      Alert.alert(
        'Deposit Initiated',
        'Your PayNow deposit request has been submitted. You will receive a confirmation once processed.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

      setAmount('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Error initiating deposit:', error);
      Alert.alert('Error', 'Failed to initiate deposit. Please try again.');
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

  const renderTab = (tab: 'deposit' | 'withdraw') => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && { backgroundColor: accent }]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && { color: 'white' }]}>
        {tab === 'deposit' ? 'Deposit' : 'Withdraw'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={wp(6)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Deposit & Withdraw</Text>
        </View>

        <View style={styles.tabContainer}>
          {renderTab('deposit')}
          {renderTab('withdraw')}
        </View>

        <View style={[styles.formContainer, { backgroundColor: backgroundLight }]}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (USD)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter PayNow phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: accent }]}
            onPress={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Processing...' : activeTab === 'deposit' ? 'Deposit with PayNow' : 'Request Withdrawal'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={wp(5)} color={accent} />
            <Text style={styles.infoText}>
              {activeTab === 'deposit'
                ? 'Deposits are processed instantly via PayNow. Funds will be available immediately after confirmation.'
                : 'Withdrawals are processed within 1-3 business days. You will receive a confirmation SMS once processed.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: wp(3),
  },
  title: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: wp(4),
    backgroundColor: '#f0f0f0',
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
    fontSize: wp(4),
    fontWeight: '600',
    color: '#333',
    marginBottom: wp(2),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp(2),
    padding: wp(3),
    fontSize: wp(4),
    backgroundColor: 'white',
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
    backgroundColor: '#f8f9fa',
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
});

export default DepositAndWithdraw;