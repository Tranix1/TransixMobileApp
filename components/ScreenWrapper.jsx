import { TouchableOpacity, View, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hp, wp } from '@/constants/common';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

const ScreenWrapper = ({ children, fh = true, ishome = false, showError = () => { } }) => {
    const { top } = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');
    const [isConnected, setIsConnected] = useState(true);
    const [showStatus, setShowStatus] = useState(false);
    const [showerror, setShowError] = useState(false);


    useEffect(() => {
        // Subscribe to network state updates
        if (!ishome) return;
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setShowStatus(!(isConnected && state.isConnected)); // Show the status when the network state changes

            if (state.isConnected) {
                // Hide the status after 4 seconds if connected
            }
            const timer = setTimeout(() => {
                setShowStatus(false);
            }, 4000);

            return () => clearTimeout(timer); // Cleanup the timer
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


    useEffect(() => {
        if (showerror) {
            const timer = setTimeout(() => {
                setShowError(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showerror])

    const setError = () => {
        setShowError(true);
    }

    const paddingTop = top > 0 ? top + 0 : 30;

    return (
        <View style={[{ flex: 1, paddingTop, backgroundColor: background }, fh && { minHeight: hp(100) }]}>
            {(showStatus && ishome) && (
                <View
                    style={{
                        backgroundColor: isConnected ? '#81C784' : coolGray,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: wp(2),
                        padding: wp(2),
                    }}
                >
                    <Ionicons
                        name={isConnected ? 'cloud' : 'cloud-strike'}
                        size={wp(4)}
                        color="#fff"
                    />
                    <ThemedText type="tiny" style={{ color: '#fff' }}>
                        {isConnected ? 'Internet Restored' : 'No Internet Access'}
                    </ThemedText>
                </View>
            )}
            <StatusBar backgroundColor={showStatus && (isConnected ? '#81C784' : coolGray)} />
            {children}
            {showerror &&
                <View style={{
                    position: 'absolute', borderRadius: wp(4), padding: wp(3),
                    flexDirection: 'row',
                    gap: wp(2),
                    backgroundColor: backgroundLight,
                    bottom: hp(8), width: wp(90),
                    marginHorizontal: wp(5), elevation: 3,
                    shadowOpacity: .3, shadowRadius: 7,
                    shadowColor: icon + '4c',
                    paddingVertical: wp(4)
                }}>
                    <Ionicons name='warning-outline' size={wp(5)} color={icon} />
                    <ThemedText style={{ flex: 1, paddingTop: 0 }}>
                        Error fetching document:
                    </ThemedText>
                    <TouchableOpacity onPress={() => setShowError(false)} style={{ padding: wp(1) }}>
                        <Ionicons name='close' size={wp(4)} color={icon} />
                    </TouchableOpacity>
                </View>
            }

        </View>
    );
};

export default ScreenWrapper;