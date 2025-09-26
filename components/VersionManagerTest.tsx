import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';

interface VersionManagerTestProps {
    visible?: boolean;
}

export default function VersionManagerTest({ visible = false }: VersionManagerTestProps) {
    const [version, setVersion] = useState('1.0.1');
    const [forceUpdate, setForceUpdate] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('New features and bug fixes available!');

    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');

    const handleTest = () => {
        Alert.alert('Test', `Version: ${version}\nForce Update: ${forceUpdate}\nMessage: ${updateMessage}`);
    };

    if (!visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <ThemedText type="title" style={[styles.title, { color: accent }]}>
                Version Manager Test
            </ThemedText>

            <View style={styles.inputContainer}>
                <ThemedText type="default" style={styles.label}>
                    Version Number
                </ThemedText>
                <TextInput
                    style={[styles.input, { borderColor: coolGray }]}
                    value={version}
                    onChangeText={setVersion}
                    placeholder="e.g., 1.0.1"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputContainer}>
                <ThemedText type="default" style={styles.label}>
                    Update Message
                </ThemedText>
                <TextInput
                    style={[styles.input, { borderColor: coolGray }]}
                    value={updateMessage}
                    onChangeText={setUpdateMessage}
                    placeholder="Enter update message"
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.switchContainer}>
                <ThemedText type="default" style={styles.label}>
                    Force Update
                </ThemedText>
                <TouchableOpacity
                    style={[styles.switch, { backgroundColor: forceUpdate ? accent : coolGray }]}
                    onPress={() => setForceUpdate(!forceUpdate)}
                >
                    <View style={[styles.switchThumb, {
                        backgroundColor: 'white',
                        transform: [{ translateX: forceUpdate ? 20 : 0 }]
                    }]} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: accent }]}
                onPress={handleTest}
            >
                <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                    Test Version Manager
                </ThemedText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    title: {
        textAlign: 'center',
        marginBottom: wp(4),
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: wp(4),
    },
    label: {
        marginBottom: wp(2),
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: wp(2),
        padding: wp(3),
        fontSize: wp(4),
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(6),
    },
    switch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },
    button: {
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: wp(4),
    },
});
