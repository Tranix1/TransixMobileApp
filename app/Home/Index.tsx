import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ToastAndroid, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from "expo-router";
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AppLoadingScreen from '@/components/AppLoadingScreen';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import HomeContent from '@/components/HomeContent';
import { useAuthState } from '@/hooks/useAuthState';
import NetInfo from '@react-native-community/netinfo';

function Index() {
    const { user: contextUser } = useAuth();
    const {
        isLoading,
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        error,
        updateUserProfile
    } = useAuthState();

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
        if (!isLoading) {
            // Fade in animation when content is ready
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading]);

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

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <AppLoadingScreen
                message="Initializing Transix..."
                showProgress={true}
                progress={75}
            />
        );
    }

    // Show error state if there's an authentication error
    if (error) {
        return (
            <AppLoadingScreen
                message="Something went wrong. Please try again."
            />
        );
    }

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


