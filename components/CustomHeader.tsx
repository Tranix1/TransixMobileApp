import React from 'react';
import { View, TouchableNativeFeedback } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons, EvilIcons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

interface CustomHeaderProps {
    onPressMenu: () => void;
    currentRole?: 'general' | 'fleet' | 'broker' | {
        role: 'fleet';
        fleetId: string;
        companyName: string;
        userRole: string;
        accType: string;
    } | {
        role: 'broker';
        brokerId: string;
        companyName: string;
        userRole: string;
        accType: string;
    } 
    pageTitle?: string;
}

export default function CustomHeader({ onPressMenu, currentRole, pageTitle }: CustomHeaderProps) {
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
                {pageTitle ? (
                    <>
                        <ThemedText type="title">{pageTitle}</ThemedText>
                        {typeof currentRole === 'object' && currentRole.role === 'fleet' && (
                            <ThemedText type="tiny">{currentRole.companyName}</ThemedText>
                        )}
                    </>
                ) : typeof currentRole === 'object' && (currentRole.role === 'fleet'||currentRole.role === 'broker' ) ? (
                    <>
                        <ThemedText type="title">{currentRole.companyName}</ThemedText>
                        <ThemedText type="tiny">{currentRole.accType}: {currentRole.userRole}</ThemedText>
                    </>
                ) 
                
                : (
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {typeof currentRole === 'object' && currentRole.role === 'fleet' && currentRole.userRole === 'owner' && (
                    <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                        <TouchableNativeFeedback onPress={() => router.push("/Search/Index")}>
                            <View style={{ padding: wp(2) }}>
                                <EvilIcons name='search' size={wp(7)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                )}
                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                    <TouchableNativeFeedback onPress={onPressMenu}>
                        <View style={{ padding: wp(2) }}>
                            <Ionicons name='reorder-three' size={wp(7)} color={icon} />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        </View>
    );
}