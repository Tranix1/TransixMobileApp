import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/Button';
import { hp, wp } from '@/constants/common';

export default function TransportIndex() {
    return (
        <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>
                Transport
            </ThemedText>

            <ThemedText type="default" style={styles.subtitle}>
                Manage your transport services
            </ThemedText>

            <View style={styles.buttonContainer}>
                <Button
                    title="Go to Store"
                    onPress={() => router.push('/Transport/Store')}
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: hp(2),
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: hp(4),
        textAlign: 'center',
        opacity: 0.7,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
    button: {
        marginVertical: hp(1),
    },
});
