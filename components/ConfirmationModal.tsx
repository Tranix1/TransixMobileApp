import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { BlurView } from 'expo-blur';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  icon?: string;
  iconColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  icon,
  iconColor
}) => {
  const accent = useThemeColor('accent');
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const iconColorTheme = useThemeColor('icon');

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            {/* Header with Icon */}
            <View style={styles.header}>
              {icon && (
                <View style={[styles.iconContainer, { backgroundColor: backgroundLight }]}>
                  <Ionicons
                    name={icon as any}
                    size={wp(8)}
                    color={iconColor || accent}
                  />
                </View>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={wp(5)} color={iconColorTheme} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>

            {/* Message */}
            <ThemedText style={styles.message}>
              {message}
            </ThemedText>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor:iconColorTheme}]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <ThemedText style={[styles.buttonText, styles.cancelText]}>
                  {cancelText}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: accent }]}
                onPress={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <ThemedText style={[styles.buttonText, styles.confirmText]}>
                    {confirmText}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
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
    shadowColor: "#000",
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
    marginBottom: wp(3),
  },
  message: {
    fontSize: wp(4),
    textAlign: 'center',
    lineHeight: wp(6),
    marginBottom: wp(6),
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  button: {
    flex: 1,
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor will be set via props
  },
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
});

export default ConfirmationModal;