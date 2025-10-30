import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from 'expo-font';
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, AppState } from 'react-native';
import { setupGlobalErrorHandler } from '@/Utilities/globalErrorHandler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { auth } from "@/db/fireBaseConfig";

import { useNotificationRouting } from "@/Utilities/pushNotification";
import { configureNavigationBar, refreshNavigationBar, configureNavigationBarAlternative, debugNavigationBar } from "@/Utilities/navigationBarUtils";
import { configureNativeNavigationBar, forceNavigationBarConfig } from "@/Utilities/nativeNavigationBarUtils";

export default function RootLayout() {
    const router = useRouter();
    const [appIsReady, setAppIsReady] = useState(false);
    const colorScheme = useColorScheme();

    // Setup global error handler
    useEffect(() => {
        setupGlobalErrorHandler();
    }, []);

    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        sfbold: require('../assets/fonts/SFPRODISPLAYBOLD.ttf'),
        sfregular: require('../assets/fonts/SFPRODISPLAYREGULAR.ttf'),
        sfmedium: require('../assets/fonts/SFPRODISPLAYMEDIUM.ttf'),
    });

    // Configure navigation bar based on theme
    useEffect(() => {
        if (loaded) {
            // Debug first
            debugNavigationBar();

            // Try all methods
            configureNavigationBar(colorScheme as 'light' | 'dark' | null);
            configureNativeNavigationBar(colorScheme as 'light' | 'dark' | null);
            forceNavigationBarConfig(colorScheme as 'light' | 'dark' | null);

            // Also try the alternative method
            setTimeout(() => {
                configureNavigationBarAlternative(colorScheme as 'light' | 'dark' | null);
                // Debug after configuration
                setTimeout(() => {
                    debugNavigationBar();
                }, 1000);
            }, 500);
        }
    }, [colorScheme, loaded]);

    // Additional effect to refresh navigation bar when app becomes active
    useEffect(() => {
        const handleAppStateChange = () => {
            if (loaded) {
                refreshNavigationBar(colorScheme as 'light' | 'dark' | null);
            }
        };

        // Refresh navigation bar when app becomes active
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                handleAppStateChange();
            }
        });

        return () => subscription?.remove();
    }, [colorScheme, loaded]);

    useEffect(() => {
        const checkFirstTime = async () => {
            try {
                const firstTime = await AsyncStorage.getItem("firstTime");

                if (!firstTime) {
                    // router.push('/user/welcome');
                }
            } catch (error) {
                console.error("Error checking first time:", error);
            }
        };

        if (loaded) {
            console.log('loaded Fonts ✅');
            checkFirstTime();

            // Don't hide splash screen here anymore - let MainLayout handle it
        }
    }, [loaded]);

    useNotificationRouting();


    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    )
}


const MainLayout = () => {
    const { isSignedIn, setupUser, isAppReady } = useAuth();
    const router = useRouter();


    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User Found >', user.email);
                setupUser(user);
            } else {
                console.log('Currently no user');
                setupUser(null);
            }
        });
    }, []);

    useEffect(() => {
        if (isAppReady) {
            // Hide splash screen after app is ready (user and role loaded)
            SplashScreen.hideAsync().catch(() => {
                // Ignore errors if splash screen is already hidden
            });
        }
    }, [isAppReady]);

    if (!isAppReady) {
        return null; // Show nothing until app is ready
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
};

export { MainLayout };