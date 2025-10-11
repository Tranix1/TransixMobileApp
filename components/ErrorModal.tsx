import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';

interface ErrorModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    details?: string;
    showDetails?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
    visible,
    onClose,
    title = "Error",
    message,
    details,
    showDetails = false
}) => {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: backgroundLight }]}>
                        <View style={styles.titleContainer}>
                            <Ionicons name="warning" size={wp(6)} color="#ff4444" />
                            <ThemedText style={[styles.title, { color: textColor }]}>
                                {title}
                            </ThemedText>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={wp(5)} color={icon} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <ThemedText style={[styles.message, { color: textColor }]}>
                            {message}
                        </ThemedText>

                        {showDetails && details && (
                            <View style={[styles.detailsContainer, { backgroundColor: backgroundLight }]}>
                                <ThemedText style={[styles.detailsTitle, { color: textColor }]}>
                                    Technical Details:
                                </ThemedText>
                                <ThemedText style={[styles.detailsText, { color: icon }]}>
                                    {details}
                                </ThemedText>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: backgroundLight }]}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.closeActionButton, { backgroundColor: accent }]}
                        >
                            <ThemedText style={styles.closeActionText}>
                                Close
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(4),
    },
    modalContainer: {
        width: '100%',
        maxWidth: wp(90),
        maxHeight: hp(70),
        borderRadius: wp(4),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
        borderBottomWidth: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginLeft: wp(2),
    },
    closeButton: {
        padding: wp(1),
    },
    content: {
        padding: wp(4),
        maxHeight: hp(40),
    },
    message: {
        fontSize: wp(4),
        lineHeight: wp(5.5),
        marginBottom: wp(3),
    },
    detailsContainer: {
        padding: wp(3),
        borderRadius: wp(2),
        marginTop: wp(2),
    },
    detailsTitle: {
        fontSize: wp(3.5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    detailsText: {
        fontSize: wp(3),
        fontFamily: 'monospace',
        lineHeight: wp(4),
    },
    footer: {
        padding: wp(4),
        borderTopWidth: 1,
    },
    closeActionButton: {
        paddingVertical: wp(3),
        paddingHorizontal: wp(6),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    closeActionText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
});
