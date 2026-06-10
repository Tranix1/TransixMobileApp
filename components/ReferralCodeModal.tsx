import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';

interface ReferralCodeModalProps {
    visible: boolean;
    initialCode?: string;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (code: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onRefresh: () => Promise<void>;
}

export default function ReferralCodeModal({
    visible,
    initialCode,
    isSubmitting,
    onClose,
    onSubmit,
    onLogout,
    onRefresh,
}: ReferralCodeModalProps) {
    const [code, setCode] = useState(initialCode || '');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    useEffect(() => {
        setCode(initialCode || '');
    }, [initialCode, visible]);

    const handleSubmit = async () => {
        if (!code.trim()) {
            ToastAndroid.show('Please enter a referral code.', ToastAndroid.SHORT);
            return;
        }

        await onSubmit(code.trim().toUpperCase());
    };

    return (
        <Modal statusBarTranslucent visible={visible} animationType="fade" transparent>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <BlurView intensity={10} experimentalBlurMethod="dimezisBlurView" tint="regular" style={styles.blurView}>
                    <Pressable onPress={() => { }} style={[styles.modalContent, { backgroundColor: background }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={wp(4)} color={icon} />
                        </TouchableOpacity>
                        <ThemedText type="title" style={[styles.title, { color: accent }]}>Referral Code Required</ThemedText>
                        <ThemedText type="tiny" style={[styles.description, { color: coolGray }]}>You must provide a valid referral code to access fleet features. Enter it below or choose another action.</ThemedText>
                        <Input
                            containerStyles={styles.input}
                            placeholder="Enter referral code"
                            value={code}
                            onChangeText={setCode}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            style={[styles.actionButton, { backgroundColor: accent }]}
                        >
                            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>Submit</ThemedText>
                        </TouchableOpacity>
                        <View style={styles.bottomButtons}>
                            <TouchableOpacity onPress={onRefresh} style={[styles.smallButton, { backgroundColor: backgroundLight }]}>
                                <ThemedText style={[styles.buttonText, { color: accent }]}>Refresh</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onLogout} style={[styles.smallButton, { backgroundColor: '#f8d7da' }]}>
                                <ThemedText style={[styles.buttonText, { color: '#e50914' }]}>Logout</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </BlurView>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
    },
    blurView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    modalContent: {
        width: '100%',
        borderRadius: wp(5),
        padding: wp(5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 12,
    },
    closeButton: {
        position: 'absolute',
        top: wp(3),
        right: wp(3),
        padding: wp(2),
        borderRadius: wp(10),
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        fontWeight: 'bold',
        fontSize: wp(5),
        textAlign: 'center',
        marginBottom: wp(3),
    },
    description: {
        textAlign: 'center',
        marginBottom: wp(4),
    },
    input: {
        marginBottom: wp(4),
    },
    actionButton: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        marginBottom: wp(3),
    },
    buttonText: {
        fontWeight: 'bold',
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallButton: {
        flex: 1,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        marginHorizontal: wp(1),
    },
});
