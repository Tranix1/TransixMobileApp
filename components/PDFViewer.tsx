import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { BlurView } from 'expo-blur';

interface PDFViewerProps {
    visible: boolean;
    onClose: () => void;
    pdfUrl: string;
    title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ visible, onClose, pdfUrl, title = "PDF Document" }) => {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');

    const handleOpenInBrowser = () => {
        Linking.openURL(pdfUrl).catch(() => {
            Alert.alert('Error', 'Could not open PDF in browser');
        });
    };

    const handleDownload = () => {
        // For now, just open in browser
        // In a real app, you might want to implement actual downloading
        handleOpenInBrowser();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} style={styles.container}>
                <View style={[styles.modalContent, { backgroundColor: background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText type="subtitle" style={{ color: textColor, flex: 1 }}>
                            {title}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={wp(5)} color={icon} />
                        </TouchableOpacity>
                    </View>

                    {/* PDF Preview Placeholder */}
                    <View style={[styles.pdfPreview, { backgroundColor: backgroundLight }]}>
                        <Ionicons name="document-text" size={wp(20)} color={accent} />
                        <ThemedText style={{ color: textColor, marginTop: wp(2), textAlign: 'center' }}>
                            PDF Document
                        </ThemedText>
                        <ThemedText type="tiny" style={{ color: icon, marginTop: wp(1), textAlign: 'center' }}>
                            Tap "Open in Browser" to view the full document
                        </ThemedText>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={handleOpenInBrowser}
                            style={[styles.actionButton, { backgroundColor: accent }]}
                        >
                            <Ionicons name="open-outline" size={wp(4)} color="white" />
                            <ThemedText style={{ color: 'white', marginLeft: wp(2), fontWeight: 'bold' }}>
                                Open in Browser
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDownload}
                            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        >
                            <Ionicons name="download-outline" size={wp(4)} color="white" />
                            <ThemedText style={{ color: 'white', marginLeft: wp(2), fontWeight: 'bold' }}>
                                Download
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* URL Display */}
                    <View style={styles.urlContainer}>
                        <ThemedText type="tiny" style={{ color: icon, textAlign: 'center' }}>
                            {pdfUrl}
                        </ThemedText>
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
        width: wp(90),
        maxHeight: hp(80),
        borderRadius: wp(4),
        padding: wp(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    closeButton: {
        padding: wp(1),
    },
    pdfPreview: {
        height: hp(40),
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: wp(4),
    },
    actions: {
        gap: wp(3),
        marginBottom: wp(3),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(4),
        borderRadius: wp(3),
    },
    urlContainer: {
        padding: wp(2),
        backgroundColor: '#f5f5f5',
        borderRadius: wp(2),
    },
});

export default PDFViewer;
