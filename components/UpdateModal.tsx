import React from 'react';
import { Modal, Pressable, View, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';

interface UpdateModalProps {
    visible: boolean;
    onClose: () => void;
    currentVersion: string;
    latestVersion: string;
    updateUrl: string;
    isForceUpdate?: boolean;
}

export default function UpdateModal({
    visible,
    onClose,
    currentVersion,
    latestVersion,
    updateUrl,
    isForceUpdate = false
}: UpdateModalProps) {
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');

    const handleUpdate = async () => {
        try {
            const supported = await Linking.canOpenURL(updateUrl);
            if (supported) {
                await Linking.openURL(updateUrl);
            } else {
                Alert.alert('Error', 'Cannot open Play Store. Please update manually.');
            }
        } catch (error) {
            console.error('Error opening Play Store:', error);
            Alert.alert('Error', 'Failed to open Play Store. Please try again.');
        }
    };

    const handleLater = () => {
        if (!isForceUpdate) {
            onClose();
        }
    };

    return (
        <Modal statusBarTranslucent visible={visible} animationType='fade' transparent>
            <Pressable onPress={isForceUpdate ? undefined : onClose} style={styles.modalOverlay}>
                <BlurView
                    intensity={10}
                    experimentalBlurMethod='dimezisBlurView'
                    tint='regular'
                    style={styles.blurView}
                >
                    <View style={[styles.modalContent, { backgroundColor: background }]}>
                        {!isForceUpdate && (
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={wp(4)} color={icon} />
                            </TouchableOpacity>
                        )}

                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="cloud-download-outline"
                                size={wp(12)}
                                color={accent}
                            />
                        </View>

                        <ThemedText type="title" style={[styles.title, { color: accent }]}>
                            {isForceUpdate ? 'Update Required' : 'Update Available'}
                        </ThemedText>

                        <ThemedText type="default" style={[styles.versionText, { color: icon }]}>
                            Current Version: {currentVersion}
                        </ThemedText>

                        <ThemedText type="default" style={[styles.versionText, { color: accent }]}>
                            Latest Version: {latestVersion}
                        </ThemedText>

                        <ThemedText type="tiny" style={[styles.description, { color: coolGray }]}>
                            {isForceUpdate
                                ? 'A new version is available with important updates and bug fixes. Please update to continue using the app.'
                                : 'A new version is available with improvements and new features. Update now to get the best experience.'
                            }
                        </ThemedText>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={handleUpdate}
                                style={[styles.updateButton, { backgroundColor: accent }]}
                            >
                                <Ionicons name="download-outline" size={wp(4)} color="#ffffff" />
                                <ThemedText style={[styles.updateButtonText, { color: "#ffffff" }]}>
                                    Update Now
                                </ThemedText>
                            </TouchableOpacity>

                            {!isForceUpdate && (
                                <TouchableOpacity
                                    onPress={handleLater}
                                    style={[styles.laterButton, { backgroundColor: background, borderColor: accent }]}
                                >
                                    <ThemedText style={[styles.laterButtonText, { color: accent }]}>
                                        Later
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
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
        minWidth: wp(80),
    },
    closeButton: {
        position: "absolute",
        top: wp(2),
        right: wp(2),
        padding: wp(2),
        borderRadius: wp(10),
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    iconContainer: {
        marginBottom: wp(4),
    },
    title: {
        marginBottom: wp(3),
        textAlign: "center",
        fontWeight: "bold",
        fontSize: wp(5),
    },
    versionText: {
        marginBottom: wp(2),
        textAlign: "center",
        fontSize: wp(3.5),
        fontWeight: "600",
    },
    description: {
        marginBottom: wp(6),
        textAlign: "center",
        lineHeight: wp(4),
    },
    buttonContainer: {
        width: "100%",
        gap: wp(3),
    },
    updateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: wp(3),
        borderRadius: wp(3),
        gap: wp(2),
    },
    updateButtonText: {
        fontWeight: "bold",
        fontSize: wp(4),
    },
    laterButton: {
        paddingVertical: wp(3),
        borderRadius: wp(3),
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#e0e7ef',
    },
    laterButtonText: {
        fontWeight: "600",
        fontSize: wp(4),
    },
});
