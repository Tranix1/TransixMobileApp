import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import AccentRingLoader from '@/components/AccentRingLoader';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';

interface AppLoadingScreenProps {
    message?: string;
    showProgress?: boolean;
    progress?: number;
}

export default function AppLoadingScreen({
    message = "Loading...",
    showProgress = false,
    progress = 0
}: AppLoadingScreenProps) {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const text = useThemeColor('text');

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <View style={styles.content}>
                <AccentRingLoader color={accent} size={60} dotSize={10} />

                <ThemedText type="subtitle" style={[styles.message, { color: text }]}>
                    {message}
                </ThemedText>

                {showProgress && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: accent + '20' }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        backgroundColor: accent,
                                        width: `${progress}%`
                                    }
                                ]}
                            />
                        </View>
                        <ThemedText type="tiny" style={[styles.progressText, { color: text }]}>
                            {Math.round(progress)}%
                        </ThemedText>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(8),
    },
    message: {
        marginTop: hp(3),
        textAlign: 'center',
        fontSize: wp(4),
    },
    progressContainer: {
        marginTop: hp(4),
        width: wp(60),
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: wp(1),
        borderRadius: wp(0.5),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: wp(0.5),
    },
    progressText: {
        marginTop: hp(1),
        fontSize: wp(3),
    },
});


