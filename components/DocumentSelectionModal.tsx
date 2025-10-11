import React from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';

interface Document {
    url: string;
    type: string;
    name?: string;
}

interface DocumentSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    documents: Document[];
    onDocumentSelect: (document: Document) => void;
    title?: string;
    subtitle?: string;
}

const DocumentSelectionModal: React.FC<DocumentSelectionModalProps> = ({
    visible,
    onClose,
    documents,
    onDocumentSelect,
    title = 'Select Document',
    subtitle = 'Choose a document to view:',
}) => {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const textColor = useThemeColor('text');
    const coolGray = useThemeColor('coolGray');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: background }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={[styles.title, { color: textColor }]}>
                            {title}
                        </ThemedText>
                        <ThemedText style={[styles.subtitle, { color: coolGray }]}>
                            {subtitle}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={icon} />
                        </TouchableOpacity>
                    </View>

                    {/* Documents */}
                    <ScrollView style={styles.scrollView}>
                        {documents.map((doc, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.docItem, { backgroundColor: backgroundLight }]}
                                onPress={() => {
                                    onDocumentSelect(doc);
                                    onClose();
                                }}
                            >
                                <Ionicons name="document" size={28} color="#e53e3e" />
                                <View style={styles.docInfo}>
                                    <ThemedText style={[styles.docName, { color: textColor }]}>
                                        Document {index + 1}
                                    </ThemedText>
                                    <ThemedText style={[styles.docType, { color: coolGray }]}>
                                        {doc.type.toUpperCase()}
                                    </ThemedText>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={coolGray} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Cancel Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.cancelBtn, { backgroundColor: coolGray }]}
                            onPress={onClose}
                        >
                            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
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
        padding: 10,
    },
    modal: {
        width: '95%',
        maxWidth: 550,
        maxHeight: '100%',
        minHeight: '52%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        position: 'relative',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    closeBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        padding: 15,
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    docInfo: {
        flex: 1,
        marginLeft: 15,
    },
    docName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    docType: {
        fontSize: 12,
        opacity: 0.7,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    cancelBtn: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DocumentSelectionModal;