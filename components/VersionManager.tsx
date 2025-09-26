import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Button from '@/components/Button';
import Input from '@/components/Input';
import SwithComponent from '@/components/Switch';
import { setAppVersion, getAppVersion, setupInitialVersion } from '@/Utilities/versionUtils';
import { wp } from '@/constants/common';

interface VersionManagerProps {
    visible?: boolean;
}

export default function VersionManager({ visible = false }: VersionManagerProps) {
    const [version, setVersion] = useState('1.0.1');
    const [forceUpdate, setForceUpdate] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('New features and bug fixes available!');
    const [isLoading, setIsLoading] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);

    const accent = useThemeColor('accent');
    const background = useThemeColor('background');

    useEffect(() => {
        loadCurrentVersion();
    }, []);

    const loadCurrentVersion = async () => {
        try {
            const versionData = await getAppVersion();
            if (versionData) {
                setCurrentVersion(versionData.version);
                setVersion(versionData.version);
                setForceUpdate(versionData.forceUpdate);
                setUpdateMessage(versionData.updateMessage || '');
            }
        } catch (error) {
            console.error('Error loading current version:', error);
        }
    };

    const handleUpdateVersion = async () => {
        if (!version.trim()) {
            Alert.alert('Error', 'Please enter a version number');
            return;
        }

        setIsLoading(true);
        try {
            const success = await setAppVersion({
                version: version.trim(),
                forceUpdate,
                updateMessage: updateMessage.trim(),
                lastUpdated: new Date(),
            });

            if (success) {
                Alert.alert('Success', 'Version updated successfully!');
                setCurrentVersion(version);
            } else {
                Alert.alert('Error', 'Failed to update version');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update version');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetupInitial = async () => {
        setIsLoading(true);
        try {
            const success = await setupInitialVersion();
            if (success) {
                Alert.alert('Success', 'Initial version setup complete!');
                loadCurrentVersion();
            } else {
                Alert.alert('Error', 'Failed to setup initial version');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to setup initial version');
        } finally {
            setIsLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <ThemedText type="title" style={[styles.title, { color: accent }]}>
                Version Manager
            </ThemedText>

            {currentVersion && (
                <ThemedText type="default" style={styles.currentVersion}>
                    Current DB Version: {currentVersion}
                </ThemedText>
            )}

            <View style={styles.inputContainer}>
                <ThemedText type="default" style={styles.label}>
                    Version Number
                </ThemedText>
                <Input
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
                <Input
                    value={updateMessage}
                    onChangeText={setUpdateMessage}
                    placeholder="Enter update message"
                    multiline
                    numberOfLines={3}
                />
            </View>

            <SwithComponent
                title="Force Update"
                value={forceUpdate}
                handlePress={() => setForceUpdate(!forceUpdate)}
            />

            <View style={styles.buttonContainer}>
                <Button
                    title="Update Version"
                    onPress={handleUpdateVersion}
                    type="red"
                    colors={{ bg: accent }}
                    containerStyles={styles.button}
                />

                <Button
                    title="Setup Initial Version"
                    onPress={handleSetupInitial}
                    type="white"
                    containerStyles={[styles.button, { backgroundColor: '#6c757d' }]}
                />
            </View>
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
    currentVersion: {
        textAlign: 'center',
        marginBottom: wp(4),
        fontStyle: 'italic',
    },
    inputContainer: {
        marginBottom: wp(4),
    },
    label: {
        marginBottom: wp(2),
        fontWeight: '600',
    },
    buttonContainer: {
        gap: wp(3),
    },
    button: {
        paddingVertical: wp(3),
        borderRadius: wp(2),
    },
});
