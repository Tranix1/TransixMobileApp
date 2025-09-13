import React from 'react';
import { View, TouchableNativeFeedback } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CustomHeaderProps {
    onPressMenu: () => void;
}

export default function CustomHeader({ onPressMenu }: CustomHeaderProps) {
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
                <ThemedText type="title">Transix</ThemedText>
                <ThemedText type="tiny">The future of Transport & Logistics</ThemedText>
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