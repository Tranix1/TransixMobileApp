import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

interface InsufficientFundsModalProps {
  isVisible: boolean;
  onClose: () => void;
  requiredAmount: number;
  itemType: string;
  itemName?: string;
}

const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  isVisible,
  onClose,
  requiredAmount,
  itemType,
  itemName
}) => {
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');
  const icon = useThemeColor('icon');
  const router = useRouter();

  const handleDeposit = () => {
    onClose();
    router.push('/Wallet/DepositAndWithdraw');
  };

  const getItemDescription = () => {
    switch (itemType.toLowerCase()) {
      case 'tracking':
        return `Vehicle Tracking Subscription${itemName ? ` for ${itemName}` : ''}`;
      case 'fuel':
        return `Fuel Purchase${itemName ? ` at ${itemName}` : ''}`;
      case 'truckstop':
        return `Truck Stop Service${itemName ? ` at ${itemName}` : ''}`;
      case 'load':
        return `Load Payment${itemName ? ` for ${itemName}` : ''}`;
      case 'contract':
        return `Contract Payment${itemName ? ` for ${itemName}` : ''}`;
      case 'warehouse':
        return `Warehouse Storage${itemName ? ` at ${itemName}` : ''}`;
      case 'insurance':
        return `Insurance Payment${itemName ? ` for ${itemName}` : ''}`;
      default:
        return `Payment${itemName ? ` for ${itemName}` : ''}`;
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', flex: 1, padding: wp(4) }}>
        <View style={styles.container}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3CD' }]}>
                <Ionicons name="wallet" size={wp(8)} color="#856404" />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={wp(5)} color={icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <ThemedText type="subtitle" style={[styles.title, { color: '#856404' }]}>
                Insufficient Funds
              </ThemedText>

              <ThemedText style={[styles.message, { color: icon }]}>
                You don't have enough balance to pay for:
              </ThemedText>

              <View style={[styles.itemDetails, { backgroundColor: accent + '10' }]}>
                <ThemedText type="defaultSemiBold" style={[styles.itemType, { color: accent }]}>
                  {getItemDescription()}
                </ThemedText>
                <ThemedText type="subtitle" style={[styles.amount, { color: accent }]}>
                  ${requiredAmount.toFixed(2)}
                </ThemedText>
              </View>

              <ThemedText style={[styles.description, { color: icon }]}>
                Please deposit funds into your wallet to complete this transaction.
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.depositButton, { backgroundColor: accent }]}
                onPress={handleDeposit}
              >
                <Ionicons name="add-circle" size={wp(5)} color="white" />
                <ThemedText style={styles.depositButtonText}>Deposit Funds</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: icon + '40' }]}
                onPress={onClose}
              >
                <ThemedText style={[styles.cancelButtonText, { color: icon }]}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
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
    padding: wp(6),
    borderRadius: wp(4),
    width: '90%',
    maxWidth: wp(85),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: wp(4),
  },
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: wp(1),
  },
  content: {
    alignItems: 'center',
    marginBottom: wp(6),
  },
  title: {
    fontSize: wp(5),
    textAlign: 'center',
    marginBottom: wp(3),
  },
  message: {
    fontSize: wp(3.5),
    textAlign: 'center',
    marginBottom: wp(3),
    lineHeight: wp(5),
  },
  itemDetails: {
    padding: wp(4),
    borderRadius: wp(3),
    alignItems: 'center',
    marginBottom: wp(4),
    width: '100%',
  },
  itemType: {
    fontSize: wp(4),
    textAlign: 'center',
    marginBottom: wp(2),
  },
  amount: {
    fontSize: wp(6),
    fontWeight: 'bold',
  },
  description: {
    fontSize: wp(3.2),
    textAlign: 'center',
    lineHeight: wp(4.5),
  },
  actions: {
    gap: wp(3),
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(4),
    borderRadius: wp(3),
    gap: wp(2),
  },
  depositButtonText: {
    color: 'white',
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    padding: wp(3),
    borderRadius: wp(3),
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
});

export default InsufficientFundsModal;