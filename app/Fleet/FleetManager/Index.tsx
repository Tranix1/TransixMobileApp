import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import { router } from 'expo-router';

export default function FleetManagerIndex() {
    const background = useThemeColor('background');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');

    return (
        <ScreenWrapper>
            <Heading
                page="Fleet Managers"
                rightComponent={
                    <TouchableOpacity
                        onPress={() => router.push('/Fleet/FleetManager/Add')}
                        style={[styles.addButton, { backgroundColor: accent }]}
                    >
                        <Ionicons name="add" size={wp(5)} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={[styles.container, { backgroundColor: background }]}>
                <ThemedText type="title" style={styles.title}>
                    Fleet Managers List
                </ThemedText>
                <ThemedText style={styles.description}>
                    List of all fleet managers will be displayed here.
                </ThemedText>
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
    },
    addButton: {
        padding: wp(2),
        borderRadius: wp(2),
        marginRight: wp(2),
    },
});