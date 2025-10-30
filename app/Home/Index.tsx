import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ToastAndroid, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router, useFocusEffect } from "expo-router";
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import UpdateModal from '@/components/UpdateModal';
import GeneralUserContent from '@/components/GeneralUserContent';
import BrokerContent from '@/components/BrokerContent';
import FleetContent from '@/components/FleetContent';
import { useAuthState } from '@/hooks/useAuthState';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Index() {
    const {
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        updateUserProfile
    } = useAuthState();

    const { currentRole, setCurrentRole } = useAuth();

    const {
        showUpdateModal,
        currentVersion,
        latestVersion,
        isForceUpdate,
        checkForUpdate,
        dismissUpdate
    } = useAppUpdate();


    const [dspCreateAcc, setDspCreateAcc] = useState(false);
    const [dspVerifyAcc, setDspVerifyAcc] = useState(false);
    const [dspMenu, setDspMenu] = useState(false);
    const [isConnectedInternet, setIsConnectedInternet] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));


    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnectedInternet(state.isConnected as any);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        // Fade in animation when content is ready
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    // Role is now loaded from context, no need to load from AsyncStorage here


    const checkAuth = (theAction?: () => void) => {
        if (!isConnectedInternet) {
            ToastAndroid.show("You are offline. Please check your internet connection.", ToastAndroid.SHORT);
            return;
        }

        if (!isAuthenticated) {
            setDspCreateAcc(true);
            return;
        }

        // Add debug logging to help diagnose the issue
        console.log('Home checkAuth:', {
            isAuthenticated,
            needsProfileSetup,
            needsEmailVerification,
            user: user ? {
                uid: user.uid,
                email: user.email,
                organisation: user.organisation,
                displayName: user.displayName
            } : null
        });

        if (needsProfileSetup) {
            console.log('Redirecting to profile setup because needsProfileSetup is true');
            router.push({ pathname: '/Account/Profile', params: { operation: 'create' } });
            return;
        }

        if (needsEmailVerification) {
            setDspVerifyAcc(true);
            return;
        }

        // User is authenticated and verified
        if (typeof theAction === 'function') {
            theAction();
        } else {
            setDspMenu(true);
        }
    };


    return (
        <View style={styles.container}>
            <CustomHeader onPressMenu={() => checkAuth()} currentRole={currentRole} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {currentRole === 'general' && (
                    <GeneralUserContent onAuthCheck={checkAuth} />
                )}
                {(currentRole === 'fleet' || (typeof currentRole === 'object' && currentRole.role === 'fleet')) && (
                    <FleetContent onAuthCheck={checkAuth} />
                )}
                {currentRole === 'broker' && (
                    <BrokerContent onAuthCheck={checkAuth} />
                )}
            </Animated.View>

            {/* Authentication Modals */}
            <AuthStatusModal
                visible={dspCreateAcc}
                onClose={() => setDspCreateAcc(false)}
                user={user}
                type="create"
            />

            <AuthStatusModal
                visible={dspVerifyAcc}
                onClose={() => setDspVerifyAcc(false)}
                user={user}
                type="verify"
            />

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />

            {/* Update Modal */}
            <UpdateModal
                visible={showUpdateModal}
                onClose={dismissUpdate}
                currentVersion={currentVersion}
                latestVersion={latestVersion}
                updateUrl="https://play.google.com/store/apps/details?id=com.yayapana.TransixNewVersion"
                isForceUpdate={isForceUpdate}
            />
        </View>
    );
}

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});


