import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { Truck, User } from '@/types/types';

interface TruckDetailsHeaderProps {
    truckData: Truck;
    postOwner?: User;
    isSaved: boolean;
    onToggleSave: () => void;
    onManagePress: () => void;
    isOwner: boolean;
    refreshing: boolean;
}

export const TruckDetailsHeader: React.FC<TruckDetailsHeaderProps> = ({
    truckData,
    postOwner,
    isSaved,
    onToggleSave,
    onManagePress,
    isOwner,
    refreshing
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');

    const placeholder = require('@/assets/images/failedimage.jpg');

    const handleCall = () => {
        if (truckData.contact) {
            Linking.openURL(`tel:${truckData.contact}`);
        }
    };

    const handleSMS = () => {
        if (truckData.contact) {
            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your truck "${truckData.CompanyName}".\n`;
            Linking.openURL(`sms:${truckData.contact}?body=${encodeURIComponent(message)}`);
        }
    };

    const handleWhatsApp = () => {
        if (truckData.contact) {
            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your truck "${truckData.CompanyName}".\n`;
            Linking.openURL(`https://wa.me/${truckData.contact}?text=${encodeURIComponent(message)}`);
        }
    };

    return (
        <View style={{ marginHorizontal: wp(2) }}>
            {/* Main truck image */}
            <View style={{ alignItems: 'center', borderRadius: 2, flex: 1, marginBottom: wp(2) }}>
                <Image
                    source={truckData.imageUrl}
                    style={{
                        width: wp(96),
                        height: wp(95),
                        borderRadius: wp(4),
                        marginVertical: wp(2),
                    }}
                    placeholderContentFit='cover'
                    transition={400}
                    contentFit='cover'
                    placeholder={placeholder}
                />
            </View>

            {/* Action buttons */}
            <View style={{ padding: wp(4), borderRadius: wp(4), backgroundColor: backgroundLight }}>
                <View style={{ flexDirection: 'row', gap: wp(6), justifyContent: 'center' }}>
                    {truckData.contact && (
                        <>
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableOpacity onPress={handleCall}>
                                        <View style={{
                                            width: wp(10),
                                            height: wp(10),
                                            backgroundColor: background,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: wp(10)
                                        }}>
                                            <Ionicons name='call-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Call
                                </ThemedText>
                            </View>

                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableOpacity onPress={handleSMS}>
                                        <View style={{
                                            width: wp(10),
                                            height: wp(10),
                                            backgroundColor: background,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: wp(10)
                                        }}>
                                            <Ionicons name='chatbox-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    SMS
                                </ThemedText>
                            </View>

                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableOpacity onPress={handleWhatsApp}>
                                        <View style={{
                                            width: wp(10),
                                            height: wp(10),
                                            backgroundColor: background,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: wp(10)
                                        }}>
                                            <Ionicons name='logo-whatsapp' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    WhatsApp
                                </ThemedText>
                            </View>
                        </>
                    )}

                    <View style={{ alignItems: 'center', gap: wp(1) }}>
                        <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                            <TouchableOpacity onPress={onToggleSave}>
                                <View
                                    style={{
                                        width: wp(10),
                                        height: wp(10),
                                        backgroundColor: background,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: wp(10),
                                    }}
                                >
                                    <Ionicons
                                        name={isSaved ? 'heart' : 'heart-outline'}
                                        size={wp(5)}
                                        color={isSaved ? '#FFAB91' : icon}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                            {isSaved ? 'Saved' : 'Save'}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </View>
    );
};
