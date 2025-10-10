import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from 'expo-font';
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { auth } from "@/db/fireBaseConfig";

import { useNotificationRouting } from "@/Utilities/pushNotification";
import { configureNavigationBar } from "@/Utilities/navigationBarUtils";

export default function RootLayout() {
    const router = useRouter();
    const [appIsReady, setAppIsReady] = useState(false);
    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        sfbold: require('../assets/fonts/SFPRODISPLAYBOLD.ttf'),
        sfregular: require('../assets/fonts/SFPRODISPLAYREGULAR.ttf'),
        sfmedium: require('../assets/fonts/SFPRODISPLAYMEDIUM.ttf'),
    });

    // Configure navigation bar based on theme
    useEffect(() => {
        configureNavigationBar(colorScheme);
    }, [colorScheme]);

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

            // Hide splash screen after fonts are loaded
            SplashScreen.hideAsync().catch(() => {
                // Ignore errors if splash screen is already hidden
            });
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
    const { isSignedIn, setupUser } = useAuth();
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

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
};

export { MainLayout };