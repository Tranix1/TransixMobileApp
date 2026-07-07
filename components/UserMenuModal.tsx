import React, { useState } from 'react';
import { Modal, Pressable, View, TouchableOpacity, TouchableNativeFeedback, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
// import * as Clipboard from 'expo-clipboard';
import { Clipboard } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { router } from 'expo-router';
import ProfileManager from '@/components/ProfileManager';
import { useAuth } from '@/context/AuthContext';

interface UserMenuModalProps {
    visible: boolean;
    onClose: () => void;
    user: any;
    onProfileUpdate?: (updatedUser: any) => void;
}

type AccType = 'brokerage' | 'fleet' | 'tracking' | 'drivers';

interface MenuItem {
    id: string;
    title: string;
    icon: string;
    iconFamily: any;
    onPress: () => void;
}

export default function UserMenuModal({ visible, onClose, onProfileUpdate }: UserMenuModalProps) {
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const { currentRole, user } = useAuth(); // assumes switchFleet exists for drivers to swap active fleet

    const [activeFleetIndex, setActiveFleetIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    // currentRole.fleets is assumed to be an array of fleets the driver is assigned to,
    // e.g. [{ id, name, logo }, ...]. Adjust to your actual shape.
    const driverFleets = user?.accesibleFleets || [];

    const handleSelectFleet = (index: number, fleetId: string) => {
        setActiveFleetIndex(index);
        // switchFleet?.(fleetId);//
    };

    const referralCode = currentRole?.referrerCode ;

    const handleCopyReferral = async () => {
        
        if (!referralCode) return;
        Clipboard.setString(`${referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    // ---- Role-specific menu builders ----
    const getMenuItems = (accType: AccType): MenuItem[] => {
        switch (accType) {
            case 'brokerage':
                return [
                    {
                        id: 'AddLoads',
                        title: 'Add Load',
                        icon: 'boxes-stacked',
                        iconFamily: FontAwesome6,
                        onPress: () => {
                            router.push('/Logistics/Loads/Index');
                            onClose();
                        },
                    },
                    {
                        id: 'Workspace',
                        title: 'Workspace',
                        icon: 'clipboard-list',
                        iconFamily: FontAwesome6,
                        onPress: () => {
                            router.push('/BooksAndBids/SlctBidsAndBooks');
                            onClose();
                        },
                    },
                    {
                        id: 'Analytics',
                        title: 'Analytics',
                        icon: 'bar-chart',
                        iconFamily: Ionicons,
                        onPress: () => {
                            // router.push('/Analytics/Index');
                            onClose();
                        },
                    },
                    {
                        id: 'Finance',
                        title: 'Finance',
                        icon: 'work-history',
                        iconFamily: MaterialIcons,
                        onPress: () => {
                            router.push('/Wallet/Index');
                            onClose();
                        },
                    },
                ];

            case 'fleet':
                return [
                     
                    {
                        id: 'Drivers',
                        title: 'Drivers',
                        icon: 'people',
                        iconFamily: Ionicons,
                        onPress: () => {
                            router.push({ pathname: '/Fleet/Driver', params: { userId: user?.uid } });
                            onClose();
                        },
                    },
                    {
                        id: 'Workspace',
                        title: 'Workspace',
                        icon: 'clipboard-list',
                        iconFamily: FontAwesome6,
                        onPress: () => {
                            router.push('/BooksAndBids/SlctBidsAndBooks');
                            onClose();
                        },
                    },
                    {
                        id: 'Analytics',
                        title: 'Analytics',
                        icon: 'bar-chart',
                        iconFamily: Ionicons,
                        onPress: () => {
                            // router.push('/Analytics/Index');
                            onClose();
                        },
                    },
                    {
                        id: 'Finance',
                        title: 'Finance',
                        icon: 'work-history',
                        iconFamily: MaterialIcons,
                        onPress: () => {
                            router.push('/Wallet/Index');
                            onClose();
                        },
                    },
                    {
                        id: 'AddTrucks',
                        title: 'Add Truck',
                        icon: 'truck-front',
                        iconFamily: FontAwesome6,
                        onPress: () => {
                            router.push({ pathname: '/Logistics/Trucks/Index', params: { userId: user?.uid } });
                            onClose();
                        },
                    },
                ];

            case 'tracking':
                return [
                    {
                        id: 'MenuTracking',
                        title: 'Menu Tracking',
                        icon: 'location-outline',
                        iconFamily: Ionicons,
                        onPress: () => {
                            router.push('/Tracking/Index');
                            onClose();
                        },
                    },
                    {
                        id: 'Analytics',
                        title: 'Analytics',
                        icon: 'bar-chart',
                        iconFamily: Ionicons,
                        onPress: () => {
                            // router.push('/Analytics/Index');
                            onClose();
                        },
                    },
                ];

            case 'drivers':
                return [
                    {
                        id: 'requests',
                        title: 'My Requests',
                        icon: 'truck-front',
                        iconFamily: FontAwesome6,
                        onPress: () => {
                            router.push('/BooksAndBids/SlctBidsAndBooks');
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
                ];

            default:
                return [];
        }
    };

    const accType = currentRole?.accType as AccType | undefined;
    const menuItems = accType ? getMenuItems(accType) : [];

    // Items common to every role
    const commonItems: MenuItem[] = [
        {
            id: 'switchAcc',
            title: 'Switch Account',
            icon: 'swap-horizontal',
            iconFamily: Ionicons,
            onPress: () => {
                router.push('/Account/SwitchRoleSelector/Index');
                onClose();
            },
        },
        // {
        //     id: 'manageAcc',
        //     title: 'Manage Account',
        //     icon: 'person-circle-outline',
        //     iconFamily: Ionicons,
        //     onPress: () => {
        //         // router.push('/Account/Manage');
        //         onClose();
        //     },
        // },
    ];

    return (
        <Modal onRequestClose={onClose} statusBarTranslucent visible={visible} transparent animationType="fade">
            <Pressable onPress={onClose} style={styles.modalOverlay}>
                <BlurView
                    intensity={10}
                    experimentalBlurMethod="dimezisBlurView"
                    tint="regular"
                    style={styles.blurView}
                >
                    <View style={[styles.modalContent, { backgroundColor: backgroundColor }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={wp(4)} color={icon} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <ThemedText type="defaultSemiBold" color={accent} style={styles.title} numberOfLines={1}>
                                Transix
                            </ThemedText>
                        </View>

                        <View style={styles.content}>
                            <ProfileManager user={user} onProfileUpdate={onProfileUpdate} onClose={onClose} />

                            {/* Driver-only: horizontal scrollable fleet switcher */}
                            {accType === 'drivers' && driverFleets.length > 0 && (
                                <View style={styles.fleetSwitcherWrap}>
                                    <ThemedText type="default" style={styles.fleetSwitcherLabel}>
                                        Driving For
                                    </ThemedText>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.fleetSwitcherContent}
                                    >
                                        {driverFleets.map((fleet: any, index: number) => {
                                            const isActive = index === activeFleetIndex;
                                            return (
                                                <TouchableOpacity
                                                    key={fleet.id}
                                                    onPress={() => handleSelectFleet(index, fleet.id)}
                                                    style={[
                                                        styles.fleetChip,
                                                        { backgroundColor: background },
                                                        isActive && { borderColor: accent, borderWidth: 1.5 },
                                                    ]}
                                                >
                                                    <FontAwesome6 name="truck-front" size={wp(3.5)} color={isActive ? accent : icon} />
                                                    <ThemedText
                                                        type="default"
                                                        color={isActive ? accent : undefined}
                                                        style={styles.fleetChipText}
                                                    >
                                                        {fleet.name}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.menuItems}>
                                {menuItems.map((item, index) => (
                                    <TouchableNativeFeedback key={item.id} onPress={item.onPress}>
                                        <View
                                            style={[
                                                styles.menuItem,
                                                { backgroundColor: background },
                                                index === 0 && styles.firstMenuItem,
                                                index === menuItems.length - 1 && styles.lastMenuItem,
                                            ]}
                                        >
                                            <item.iconFamily
                                                name={item.icon as any}
                                                size={wp(4)}
                                                color={icon}
                                                style={styles.menuIcon}
                                            />
                                            <ThemedText type="default">{item.title}</ThemedText>
                                        </View>
                                    </TouchableNativeFeedback>
                                ))}
                            </View>

                            {/* Referral: tap to copy */}
                                <TouchableNativeFeedback onPress={handleCopyReferral}>
                                    <View style={[styles.referralRow, { backgroundColor: background }]}>
                                        {/* <Ionicons name="gift-outline" size={wp(6)} color={accent}  /> */}
                                                        <Ionicons name="person-outline" size={wp(4)} color={accent} style={styles.menuIcon} />
                                        
                                        <View style={styles.referralTextWrap}>
                                            <ThemedText type="default" style={styles.referralLabel}>
                                                Referral Code
                                            </ThemedText>
                                            <ThemedText type="defaultSemiBold" numberOfLines={1}>
                                                {referralCode}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.referralCopyBtn}>
                                            <Ionicons
                                                name={copied ? 'checkmark' : 'copy-outline'}
                                                size={wp(4)}
                                                color={copied ? accent : icon}
                                            />
                                            <ThemedText type="default" color={copied ? accent : undefined} style={styles.referralCopyText}>
                                                {copied ? 'Copied' : 'Copy'}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                            

                            <View style={styles.menuItems}>
                                {commonItems.map((item, index) => (
                                    <TouchableNativeFeedback key={item.id} onPress={item.onPress}>
                                        <View
                                            style={[
                                                styles.menuItem,
                                                { backgroundColor: background },
                                                index === 0 && styles.firstMenuItem,
                                                index === commonItems.length - 1 && styles.lastMenuItem,
                                            ]}
                                        >
                                            <item.iconFamily
                                                name={item.icon as any}
                                                size={wp(4)}
                                                color={icon}
                                                style={styles.menuIcon}
                                            />
                                            <ThemedText type="default" numberOfLines={1} style={styles.menuItemText}>
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
                                    <ThemedText type="default">Settings</ThemedText>
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
        marginTop: hp(10),
    },
    closeButton: {
        position: 'absolute',
        top: wp(2),
        right: wp(2),
        padding: wp(2),
        borderRadius: wp(10),
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: wp(6),
        fontWeight:"bold"
    },
    content: {
        gap: wp(2),
        marginBottom: wp(2),
    },
    fleetSwitcherWrap: {
        gap: wp(1.5),
        marginBottom: wp(1),
    },
    fleetSwitcherLabel: {
        opacity: 0.6,
        fontSize: wp(3),
    },
    fleetSwitcherContent: {
        gap: wp(2),
        paddingVertical: wp(1),
    },
    fleetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        paddingVertical: wp(2),
        paddingHorizontal: wp(3),
        borderRadius: wp(10),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    fleetChipText: {
        fontSize: wp(3.2),
    },
    menuItems: {
        gap: 4,
    },
    menuItem: {
        padding: wp(4),
        flexDirection: 'row',
        gap: wp(3),
    },
    menuItemText: {
        flexShrink: 1,
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
    referralRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        borderRadius: wp(5),
        gap: wp(3),
    },
    referralTextWrap: {
        flex: 1,
        gap: 2,
    },
    referralLabel: {
        fontSize: wp(2.8),
        opacity: 0.6,
    },
    referralCopyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
        paddingVertical: wp(1.5),
        paddingHorizontal: wp(2.5),
        borderRadius: wp(10),
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    referralCopyText: {
        fontSize: wp(3),
    },
});