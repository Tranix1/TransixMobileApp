import React from 'react';
import { View, TouchableNativeFeedback } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CustomHeaderProps {
    onPressMenu: () => void;
    currentRole?: 'general' | 'fleet' | 'broker' | {
        role: 'fleet';
        fleetId: string;
        companyName: string;
        userRole: string;
        accType: string;
    };
}

export default function CustomHeader({ onPressMenu, currentRole }: CustomHeaderProps) {
    const background = useThemeColor("background");
    const icon = useThemeColor('icon');

    return (
        <View
            style={{
                backgroundColor: background,
                paddingHorizontal: wp(2),
                paddingVertical: wp(1),
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: wp(1),
            }}
        >
            <View>
                {typeof currentRole === 'object' && currentRole.role === 'fleet' ? (
                    <>
                        <ThemedText type="title">{currentRole.companyName}</ThemedText>
                        <ThemedText type="tiny">{currentRole.accType}: {currentRole.userRole}</ThemedText>
                    </>
                ) : (
                    <>
                        <ThemedText type="title">Transix</ThemedText>
                        <ThemedText type="tiny">The future of Transport & Logistics</ThemedText>
                        {currentRole && (
                            <ThemedText type="tiny" style={{ fontWeight: 'bold' }}>
                                Role: {currentRole === 'general' ? 'General User' : currentRole === 'fleet' ? 'Fleet Manager' : 'Broker'}
                            </ThemedText>
                        )}
                    </>
                )}
            </View>
            <View style={{ flexDirection: 'row', gap: wp(2) }}>
                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                    <TouchableNativeFeedback onPress={onPressMenu}>
                        <View style={{ padding: wp(2) }}>
                            <Ionicons name='reorder-three' size={wp(6)} color={icon} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>
    );
}