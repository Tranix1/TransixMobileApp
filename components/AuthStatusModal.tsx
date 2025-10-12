import React from 'react';
import { Modal, Pressable, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { router } from 'expo-router';
import { auth } from '@/db/fireBaseConfig';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { ToastAndroid } from 'react-native';
import * as Updates from 'expo-updates';
import { AppState } from 'react-native';

interface AuthStatusModalProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    type: 'create' | 'verify';
}

export default function AuthStatusModal({ visible, onClose, user, type }: AuthStatusModalProps) {
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const background = useThemeColor('background');
    const backgroundColor = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    const handleSendVerification = async () => {
        try {
            await sendEmailVerification(auth.currentUser as any);
            ToastAndroid.show('Verification email sent!', ToastAndroid.SHORT);
            onClose();
        } catch (error) {
            ToastAndroid.show("Failed to send verification email. Try again.", ToastAndroid.SHORT);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            ToastAndroid.show('Signed out successfully.', ToastAndroid.SHORT);
            onClose();
        } catch (error) {
            ToastAndroid.show('Failed to sign out.', ToastAndroid.SHORT);
        }
    };

    const handleRefresh = async () => {
        try {
            // Force reload the app by restarting the entire app
            if (Updates.isEnabled) {
                await Updates.reloadAsync();
            } else {
                // For development mode, we'll use a different approach
                // Close the modal first
                onClose();
                // Then restart the app by reloading the current screen
                setTimeout(() => {
                    router.replace('/');
                }, 100);
            }
        } catch (error) {
            // If Updates fails, try alternative approach
            onClose();
            setTimeout(() => {
                router.replace('/');
            }, 100);
        }
    };

    if (type === 'create') {
        return (
            <Modal statusBarTranslucent visible={visible} animationType='fade' transparent>
                <Pressable onPress={onClose} style={styles.modalOverlay}>
                    <BlurView
                        intensity={10}
                        experimentalBlurMethod='dimezisBlurView'
                        tint='regular'
                        style={styles.blurView}
                    >
                        <View style={[styles.modalContent, { backgroundColor: background }]}>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={wp(4)} color={icon} />
                            </TouchableOpacity>

                            <ThemedText type="title" style={[styles.title, { color: accent }]}>
                                Get Authenticated
                            </ThemedText>

                            <ThemedText type="tiny" style={[styles.description, { color: coolGray }]}>
                                Create an account or sign in to add items, book loads, bid on loads, and access more features.
                            </ThemedText>

                            <TouchableOpacity
                                onPress={() => {
                                    router.push("/Account/Login");
                                    onClose();
                                }}
                                style={[styles.actionButton, { backgroundColor: "#d1f7e9" }]}
                            >
                                <ThemedText style={[styles.buttonText, { color: "#0f9d58" }]}>
                                    Authenticate
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>
        );
    }

    return (
        <Modal statusBarTranslucent visible={visible} animationType='fade' transparent>
            <BlurView
                intensity={10}
                experimentalBlurMethod='dimezisBlurView'
                tint='regular'
                style={styles.blurView}
            >
                <View style={[styles.modalContent, { backgroundColor: background }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={wp(4)} color={icon} />
                    </TouchableOpacity>

                    <ThemedText type="title" style={[styles.title, { color: accent }]}>
                        Verify Your Email
                    </ThemedText>

                    <ThemedText type="default" style={[styles.emailText, { color: icon }]}>
                        {auth.currentUser?.email}
                    </ThemedText>

                    <ThemedText type="tiny" style={[styles.description, { color: coolGray }]}>
                        Please check your inbox or spam folder and click the verification link. Once verified, tap Refresh.
                    </ThemedText>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: "#e0e7ef" }]}
                            onPress={handleSendVerification}
                        >
                            <ThemedText style={[styles.buttonText, { color: accent }]}>
                                New Code
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: "#f8d7da" }]}
                            onPress={handleSignOut}
                        >
                            <ThemedText style={[styles.buttonText, { color: "#e50914" }]}>
                                Sign Out
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleRefresh}
                            style={[styles.actionButton, { backgroundColor: "#d1f7e9" }]}
                        >
                            <ThemedText style={[styles.buttonText, { color: "#0f9d58" }]}>
                                Refresh
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
    },
    blurView: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        flex: 1,
        padding: wp(4),
        alignItems: 'center',
    },
    modalContent: {
        justifyContent: "center",
        alignItems: "center",
        padding: wp(6),
        borderRadius: wp(6),
        margin: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    closeButton: {
        position: "absolute",
        top: wp(2),
        right: wp(2),
        padding: wp(2),
        borderRadius: wp(10),
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    title: {
        marginBottom: wp(2),
        textAlign: "center",
        fontWeight: "bold",
        fontSize: wp(5),
    },
    description: {
        marginBottom: wp(6),
        textAlign: "center",
    },
    emailText: {
        marginBottom: wp(4),
        textAlign: "center",
        fontSize: wp(3.8),
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: wp(3),
    },
    actionButton: {
        paddingVertical: wp(2),
        borderRadius: wp(3),
        alignItems: "center",
        height: 35,
        paddingHorizontal: wp(2),
    },
    buttonText: {
        fontWeight: "bold",
    },
});


