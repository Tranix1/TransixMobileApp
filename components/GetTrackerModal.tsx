    import React from 'react';
    import { Modal, Pressable, View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
    import { BlurView } from 'expo-blur';
    import { Ionicons, FontAwesome } from '@expo/vector-icons';
    import { ThemedText } from '@/components/ThemedText';
    import { useThemeColor } from '@/hooks/useThemeColor';
    import { hp, wp } from '@/constants/common';
    import { ToastAndroid } from 'react-native';

    interface GetTrackerModalProps {
        visible: boolean;
        onClose: () => void;
        truckPlate?: string; // optional, prefills the WhatsApp message with the truck's plate
    }

    // Change this to your actual Transix WhatsApp business number (international format, no + or spaces)
    const TRANSIX_WHATSAPP_NUMBER = '263716325160';

    export default function GetTrackerModal({ visible, onClose, truckPlate }: GetTrackerModalProps) {
        const accent = useThemeColor('accent');
        const icon = useThemeColor('icon');
        const background = useThemeColor('background');
        const backgroundColor = useThemeColor('backgroundLight');
        const coolGray = useThemeColor('coolGray');

        const handleWhatsApp = async () => {
            const message = truckPlate
                ? `Hi Transix, I need a tracker for my truck (${truckPlate}). Please assist me with pricing and installation.`
                : `Hi Transix, I need a tracker for my truck. Please assist me with pricing and installation.`;

            const url = `https://wa.me/${TRANSIX_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            try {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                    onClose();
                    await Linking.openURL(url);
                } else {
                    ToastAndroid.show('WhatsApp is not installed on this device.', ToastAndroid.SHORT);
                }
            } catch (error) {
                ToastAndroid.show('Could not open WhatsApp. Please try again.', ToastAndroid.SHORT);
            }
        };

        return (
            <Modal statusBarTranslucent visible={visible} animationType="fade" transparent>
                <Pressable onPress={onClose} style={styles.modalOverlay}>
                    <BlurView
                        intensity={10}
                        experimentalBlurMethod="dimezisBlurView"
                        tint="regular"
                        style={styles.blurView}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <View style={[styles.modalContent, { backgroundColor: background }]}>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={wp(4)} color={icon} />
                                </TouchableOpacity>

                                <View style={[styles.iconCircle, { backgroundColor: '#d1f7e9' }]}>
                                    <Ionicons name="location" size={wp(7)} color="#0f9d58" />
                                    
                                </View>

                                <ThemedText type="title" style={[styles.title, { color: accent }]}>
                                    Unlock Live Tracking
                                </ThemedText>

                                <ThemedText type="tiny" style={[styles.description, { color: coolGray }]}>
                                   Install a Transix tracker and monitor your truck location, trips, and operations in real time.
                                </ThemedText>

                                {/* Pricing breakdown */}
                                <View style={[styles.pricingBox, { backgroundColor: backgroundColor }]}>
                                    <View style={styles.pricingRow}>
                                        <View style={styles.pricingLabelRow}>
                                            <Ionicons name="hardware-chip-outline" size={wp(4)} color={accent} />
                                            <ThemedText type="tiny" style={[styles.pricingLabel, { color: icon }]}>
                                                Tracker device
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="tiny" style={[styles.pricingValue, { color: accent,fontWeight:"bold" }]}>
                                            $40
                                        </ThemedText>
                                    </View>

                                    <View style={styles.pricingRow}>
                                        <View style={styles.pricingLabelRow}>
                                            <Ionicons name="build-outline" size={wp(4)} color={accent} />
                                            <ThemedText type="tiny" style={[styles.pricingLabel, { color: icon }]}>
                                                Installation (Harare)
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="tiny" style={[styles.pricingValue, { color: accent,fontWeight:"bold" }]}>
                                            $20
                                        </ThemedText>
                                    </View>

                                    <View style={styles.pricingRow}>
                                        <View style={styles.pricingLabelRow}>
                                            <Ionicons name="sync-outline" size={wp(4)} color={accent} />
                                            <ThemedText type="tiny" style={[styles.pricingLabel, { color: icon }]}>
                                                Transix service

                                            </ThemedText>
                                        </View>
                                        <ThemedText type="tiny" style={[styles.pricingValue, { color: accent ,fontWeight:"bold"}]}>
                                            $15
                                        </ThemedText>
                                    </View>

                                    <ThemedText type="tiny" style={[styles.pricingNote, { color: coolGray }]}>
                                       Includes live tracking, load management, truck management and finance tools.
                                    </ThemedText>
                                </View>

                                <View style={[styles.trustBox, { backgroundColor: backgroundColor }]}>
    <View style={styles.trustRow}>
        <Ionicons name="shield-checkmark-outline" size={wp(4)} color={accent} />
        <ThemedText type="tiny" style={[styles.trustText, { color: icon }]}>
            Secure GPS tracking
        </ThemedText>
    </View>

    <View style={styles.trustRow}>
        <Ionicons name="person-remove-outline" size={wp(4)} color={accent} />
        <ThemedText type="tiny" style={[styles.trustText, { color: icon }]}>
            No driver credentials required
        </ThemedText>
    </View>

    <View style={styles.trustRow}>
        <Ionicons name="globe-outline" size={wp(4)} color={accent} />
        <ThemedText type="tiny" style={[styles.trustText, { color: icon }]}>
            Works across Zimbabwe
        </ThemedText>
    </View>
</View>

                                <ThemedText type="tiny" style={[styles.locationNote, { color: coolGray }]}>
                                    Outside Harare (within Zim): installation fee + transport cost.{'\n'}
                                    Outside Zimbabwe: chat with us to arrange delivery and installation.
                                </ThemedText>

                                <TouchableOpacity
                                    onPress={handleWhatsApp}
                                    style={[styles.actionButton, { backgroundColor: '#25D366' }]}
                                >
                                    <FontAwesome name="whatsapp" size={wp(4.5)} color="#fff" style={{ marginRight: wp(2) }} />
                                    <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
                                        Get My Tracker
                                    </ThemedText>
                                </TouchableOpacity>

                                
                            </View>
                        </Pressable>
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
            justifyContent: 'center',
            flex: 1,
            padding: wp(4),
            alignItems: 'center',
        },
        modalContent: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: wp(6),
            borderRadius: wp(6),
            margin: wp(4),
            maxWidth: wp(90),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 10,
        },
        closeButton: {
            position: 'absolute',
            top: wp(2),
            right: wp(2),
            padding: wp(2),
            borderRadius: wp(10),
            backgroundColor: 'rgba(0,0,0,0.1)',
            zIndex: 1,
        },
        iconCircle: {
            width: wp(14),
            height: wp(14),
            borderRadius: wp(7),
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: wp(3),
            marginTop: wp(2),
        },
        title: {
            marginBottom: wp(2),
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: wp(5),
        },
        description: {
            marginBottom: wp(4),
            textAlign: 'center',
            lineHeight: wp(4.8),
        },
        pricingBox: {
            width: '100%',
            borderRadius: wp(4),
            padding: wp(4),
            marginBottom: wp(3),
        },
        pricingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: wp(2),
        },
        pricingLabelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: wp(2),
        },
        pricingLabel: {
            marginLeft: wp(1.5),
        },
        pricingValue: {
            fontWeight: 'bold',
                fontSize: wp(4),

        },
        pricingNote: {
            marginTop: wp(1),
            lineHeight: wp(4),
        },
        locationNote: {
            textAlign: 'center',
            marginBottom: wp(4),
            lineHeight: wp(4.2),
        },
        actionButton: {
            flexDirection: 'row',
            paddingVertical: wp(3),
            paddingHorizontal: wp(6),
            borderRadius: wp(3),
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
        },
        buttonText: {
            fontWeight: 'bold',
        },
        redirectNote: {
            marginTop: wp(2),
            textAlign: 'center',
        },
        signature: {
            marginTop: wp(3),
            textAlign: 'center',
            fontStyle: 'italic',
        },trustBox: {
    width: '100%',
    borderRadius: wp(3),
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    marginBottom: wp(3),
},

trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(2),
},

trustText: {
    marginLeft: wp(2.5),
    fontSize: wp(3.2),
},
    });
