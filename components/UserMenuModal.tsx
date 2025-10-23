import React from 'react';
import { Modal, Pressable, View, TouchableOpacity, TouchableNativeFeedback, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { router } from 'expo-router';
import ProfileManager from '@/components/ProfileManager';

interface UserMenuModalProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    onProfileUpdate?: (updatedUser: any) => void;
}

export default function UserMenuModal({ visible, onClose, user, onProfileUpdate }: UserMenuModalProps) {
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');

    const menuItems = [
        {
            id: 'requests',
            title: 'My Requests',
            icon: 'truck-front',
            iconFamily: FontAwesome6,
            onPress: () => {
                router.push("/BooksAndBids/SlctBidsAndBooks");
                onClose();
            },
        },
        {
            id: 'contracts',
            title: 'My Contracts',
            icon: 'reader',
            iconFamily: Ionicons,
            onPress: () => {
                router.push("/Logistics/Contracts/ViewMiniContracts");
                onClose();
            },
        },
        {
            id: 'trucks',
            title: 'Manage My Trucks',
            icon: 'truck-front',
            iconFamily: FontAwesome6,
            onPress: () => {
                router.push({ pathname: '/Logistics/Trucks/Index', params: { userId: user?.uid } });
                onClose();
            },
        },
        {
            id: 'loads',
            title: 'Manage My Loads',
            icon: 'boxes-stacked',
            iconFamily: FontAwesome6,
            onPress: () => {
                router.push({ pathname: '/Logistics/Loads/Index', params: { userId: user?.uid } });
                onClose();
            },
        },
        {
            id: 'payments',
            title: 'My Payments History',
            icon: 'work-history',
            iconFamily: MaterialIcons,
            onPress: () => {
                router.push('/Wallet/Index');
                onClose();
            },
        },
        {
            id: 'shop',
            title: 'Manage My Shop',
            icon: 'shop',
            iconFamily: FontAwesome6,
            onPress: () => {
                // TODO: Implement shop management
                onClose();
            },
        },
    ];

    return (
        <Modal onRequestClose={onClose} statusBarTranslucent visible={visible} transparent animationType='fade'>
            <Pressable onPress={onClose} style={styles.modalOverlay}>
                <BlurView
                    intensity={10}
                    experimentalBlurMethod='dimezisBlurView'
                    tint='regular'
                    style={styles.blurView}
                >
                    <View style={[styles.modalContent, { backgroundColor: backgroundColor }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={wp(4)} color={icon} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <ThemedText type='title' color={accent} style={styles.title}>
                                Transix
                            </ThemedText>
                        </View>

                        <View style={styles.content}>
                            <ProfileManager user={user} onProfileUpdate={onProfileUpdate} />

                            <View style={styles.menuItems}>
                                {menuItems.map((item, index) => (
                                    <TouchableNativeFeedback
                                        key={item.id}
                                        onPress={item.onPress}
                                    >
                                        <View style={[
                                            styles.menuItem,
                                            { backgroundColor: background },
                                            index === 0 && styles.firstMenuItem,
                                            index === menuItems.length - 1 && styles.lastMenuItem,
                                        ]}>
                                            <item.iconFamily
                                                name={item.icon as any}
                                                size={wp(4)}
                                                color={icon}
                                                style={styles.menuIcon}
                                            />
                                            <ThemedText type='default'>
                                                {item.title}
                                            </ThemedText>
                                        </View>
                                    </TouchableNativeFeedback>
                                ))}
                            </View>

                            <TouchableNativeFeedback
                                onPress={() => {
                                    router.push('/Account/Settings');
                                    onClose();
                                }}
                            >
                                <View style={styles.settingsItem}>
                                    <Ionicons name="settings-outline" size={wp(4)} color={icon} style={styles.menuIcon} />
                                    <ThemedText type='default'>
                                        Settings
                                    </ThemedText>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </BlurView>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
    },
    blurView: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        flex: 1,
        padding: wp(4),
    },
    modalContent: {
        padding: wp(4),
        elevation: 12,
        shadowColor: '#0c0c0c69',
        borderRadius: wp(6),
        marginTop: hp(15),
    },
    closeButton: {
        position: "absolute",
        top: wp(2),
        right: wp(2),
        padding: wp(2),
        borderRadius: wp(10),
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    content: {
        gap: wp(2),
        marginBottom: wp(2),
    },
    menuItems: {
        gap: 4,
    },
    menuItem: {
        padding: wp(4),
        flexDirection: 'row',
        gap: wp(3),
    },
    firstMenuItem: {
        borderTopRightRadius: wp(5),
        borderTopLeftRadius: wp(5),
    },
    lastMenuItem: {
        borderBottomRightRadius: wp(5),
        borderBottomLeftRadius: wp(5),
    },
    menuIcon: {
        width: wp(6),
        textAlign: 'center',
    },
    settingsItem: {
        paddingHorizontal: wp(4),
        flexDirection: 'row',
        gap: wp(3),
        paddingVertical: wp(4),
    },
});


