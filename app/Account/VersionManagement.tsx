import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import VersionManagerDebug from '@/components/VersionManagerDebug';
import VersionManagerTest from '@/components/VersionManagerTest';

const VersionManagement = () => {
    return (
        <ScreenWrapper>
            <Heading page='Version Management' />
            <ScrollView style={styles.container}>
                <VersionManagerDebug visible={true} />
                <VersionManagerTest visible={true} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});

export default VersionManagement;
