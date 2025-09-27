import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
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
    const [forceUpdate, setForceUpdate] = useState(false);
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
                setForceUpdate(versionData.forceUpdate);
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
            Alert.alert('Error', 'Please enter a version number');
            return;
        }

        setIsLoading(true);
        setDebugInfo('Updating version...');

        try {
            const success = await setAppVersion({
                version: version.trim(),
                forceUpdate,
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
    buttonContainer: {
        gap: wp(3),
    },
});

export default UpdateVersion;
