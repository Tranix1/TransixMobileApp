import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ToastAndroid, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from "expo-router";
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import UpdateModal from '@/components/UpdateModal';
import HomeContent from '@/components/HomeContent';
import { useAuthState } from '@/hooks/useAuthState';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { usePushNotifications } from '@/Utilities/pushNotification';
import NetInfo from '@react-native-community/netinfo';

function Index() {
    const { user: contextUser } = useAuth();
    const {
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        updateUserProfile
    } = useAuthState();

    const {
        showUpdateModal,
        currentVersion,
        latestVersion,
        isForceUpdate,
        checkForUpdate,
        dismissUpdate
    } = useAppUpdate();

    // Initialize push notifications
    const { expoPushToken, schedulePushNotification } = usePushNotifications();

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

    // Test notification function
    const testNotification = async () => {
        try {
            await schedulePushNotification();
            ToastAndroid.show('Test notification scheduled!', ToastAndroid.SHORT);
        } catch (error) {
            console.error('Error testing notification:', error);
            ToastAndroid.show('Error testing notification', ToastAndroid.SHORT);
        }
    };

    const checkAuth = (theAction?: () => void) => {
        if (!isConnectedInternet) {
            ToastAndroid.show("You are offline. Please check your internet connection.", ToastAndroid.SHORT);
            return;
        }

        if (!isAuthenticated) {
            setDspCreateAcc(true);
            return;
        }

        if (needsProfileSetup) {
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
            <CustomHeader onPressMenu={() => checkAuth()} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <HomeContent onAuthCheck={checkAuth} />
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


