import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import VersionManagerDebug from '@/components/VersionManagerDebug'
import VersionManagerTest from '@/components/VersionManagerTest';

const Admin = () => {
    const background = useThemeColor('background');

    return (
        <ScreenWrapper>
            <Heading page='Admin Panel' />
            <ScrollView style={styles.container}>
                <VersionManagerDebug visible={true} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
});

export default Admin;