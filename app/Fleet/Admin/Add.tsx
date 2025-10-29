import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '@/constants/common';

export default function AddAdmin() {
    const background = useThemeColor('background');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');

    return (
        <ScreenWrapper>
            <Heading page="Add Admin" />
            <View style={[styles.container, { backgroundColor: background }]}>
                <ThemedText type="title" style={styles.title}>
                    Add New Admin
                </ThemedText>
                <ThemedText style={styles.description}>
                    Form to add a new admin will be implemented here.
                </ThemedText>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: accent }]}>
                    <Ionicons name="add" size={wp(6)} color="white" />
                    <ThemedText style={styles.buttonText}>Add Admin</ThemedText>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 30,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});