import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { setAppVersion, getAppVersion, setupInitialVersion } from '@/Utilities/versionUtils';
import Input from '@/components/Input';
import Button from '@/components/Button';

const UpdateVersion = () => {
    const [version, setVersion] = useState('1.0.1');
    const [minVersion, setMinVersion] = useState('1.0.0');
    const [updateMessage, setUpdateMessage] = useState('New features and bug fixes available!');
    const [isLoading, setIsLoading] = useState(false);
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState('');

    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');

    useEffect(() => {
        loadCurrentVersion();
    }, []);

    const loadCurrentVersion = async () => {
        try {
            setDebugInfo('Loading current version...');
            const versionData = await getAppVersion();
            setDebugInfo(`Version data: ${JSON.stringify(versionData)}`);

            if (versionData) {
                setCurrentVersion(versionData.version);
                setVersion(versionData.version);
                setMinVersion(versionData.minVersion || versionData.version);
                setUpdateMessage(versionData.updateMessage || '');
                setDebugInfo(`Loaded version: ${versionData.version}`);
            } else {
                setDebugInfo('No version data found');
            }
        } catch (error) {
            console.error('Error loading current version:', error);
            setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleUpdateVersion = async () => {
        if (!version.trim()) {
            Alert.alert('Error', 'Please enter a latest version number');
            return;
        }

        if (!minVersion.trim()) {
            Alert.alert('Error', 'Please enter a minimum supported version number');
            return;
        }

        // minVersion can never be greater than the latest version — that would
        // force everyone to update past a version that doesn't exist yet.
        if (compareGuard(minVersion.trim(), version.trim())) {
            Alert.alert('Error', 'Minimum version cannot be greater than the latest version');
            return;
        }

        setIsLoading(true);
        setDebugInfo('Updating version...');

        try {
            const success = await setAppVersion({
                version: version.trim(),
                minVersion: minVersion.trim(),
                updateMessage: updateMessage.trim(),
                lastUpdated: new Date(),
            });

            setDebugInfo(`Update result: ${success}`);

            if (success) {
                Alert.alert('Success', 'Version updated successfully!');
                setCurrentVersion(version);
                setDebugInfo(`Version updated to: ${version}`);
            } else {
                Alert.alert('Error', 'Failed to update version');
                setDebugInfo('Failed to update version');
            }
        } catch (error) {
            console.error('Error updating version:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', `Failed to update version: ${errorMessage}`);
            setDebugInfo(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetupInitial = async () => {
        setIsLoading(true);
        setDebugInfo('Setting up initial version...');

        try {
            const success = await setupInitialVersion();
            setDebugInfo(`Setup result: ${success}`);

            if (success) {
                Alert.alert('Success', 'Initial version setup complete!');
                loadCurrentVersion();
                setDebugInfo('Initial version setup complete');
            } else {
                Alert.alert('Error', 'Failed to setup initial version');
                setDebugInfo('Failed to setup initial version');
            }
        } catch (error) {
            console.error('Error setting up initial version:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', `Failed to setup initial version: ${errorMessage}`);
            setDebugInfo(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <Heading page='Update Version' />
            <ScrollView style={styles.container}>
                <ThemedText type="title" style={[styles.title, { color: accent }]}>
                    Version Manager
                </ThemedText>

                <ThemedText type="default" style={styles.debugInfo}>
                    Debug: {debugInfo}
                </ThemedText>

                {currentVersion && (
                    <ThemedText type="default" style={styles.currentVersion}>
                        Current DB Version: {currentVersion}
                    </ThemedText>
                )}

                <View style={styles.inputContainer}>
                    <ThemedText type="default" style={styles.label}>
                        Latest Version
                    </ThemedText>
                    <Input
                        value={version}
                        onChangeText={setVersion}
                        placeholder="e.g., 1.2.0"
                        keyboardType="numeric"
                    />
                    <ThemedText type="tiny" style={[styles.hint, { color: coolGray }]}>
                        Users below this (but at or above Minimum Version) see an optional "Update Available" prompt.
                    </ThemedText>
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText type="default" style={styles.label}>
                        Minimum Supported Version
                    </ThemedText>
                    <Input
                        value={minVersion}
                        onChangeText={setMinVersion}
                        placeholder="e.g., 1.0.5"
                        keyboardType="numeric"
                    />
                    <ThemedText type="tiny" style={[styles.hint, { color: coolGray }]}>
                        Users below this version are force-updated and cannot use the app.
                    </ThemedText>
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

                <View style={styles.buttonContainer}>
                    <Button
                        title={isLoading ? 'Updating...' : 'Update Version'}
                        onPress={handleUpdateVersion}
                        disabled={isLoading}
                    />

                    <Button
                        title={isLoading ? 'Setting up...' : 'Setup Initial Version'}
                        onPress={handleSetupInitial}
                        disabled={isLoading}
                        style={{ backgroundColor: '#6c757d' }}
                    />

                    <Button
                        title="Refresh Version"
                        onPress={loadCurrentVersion}
                        style={{ backgroundColor: '#17a2b8' }}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

/**
 * Returns true if `min` is strictly greater than `latest` (invalid config).
 * Inline to avoid a second import for a single comparison; swap for
 * compareVersions from versionCompare.ts if you'd rather share the logic.
 */
function compareGuard(min: string, latest: string): boolean {
    const minParts = min.split('.').map((n) => parseInt(n, 10) || 0);
    const latestParts = latest.split('.').map((n) => parseInt(n, 10) || 0);
    const length = Math.max(minParts.length, latestParts.length);

    for (let i = 0; i < length; i++) {
        const a = minParts[i] ?? 0;
        const b = latestParts[i] ?? 0;
        if (a > b) return true;
        if (a < b) return false;
    }
    return false;
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
    debugInfo: {
        textAlign: 'center',
        marginBottom: wp(2),
        fontStyle: 'italic',
        fontSize: wp(3),
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
    hint: {
        marginTop: wp(1),
    },
    buttonContainer: {
        gap: wp(3),
    },
});

export default UpdateVersion;