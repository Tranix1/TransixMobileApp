import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from 'expo-font';
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { auth } from "./components/config/fireBase";

import { useNotificationRouting } from "@/Utilities/pushNotification"; 

export default function RootLayout() {
    const router = useRouter();
    const [appIsReady, setAppIsReady] = useState(false);


    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        sfbold: require('../assets/fonts/SFPRODISPLAYBOLD.ttf'),
        sfregular: require('../assets/fonts/SFPRODISPLAYREGULAR.ttf'),
        sfmedium: require('../assets/fonts/SFPRODISPLAYMEDIUM.ttf'),
    });

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
        if (true) {
            console.log('loaded Fonts ✅');
            checkFirstTime();

            SplashScreen.hideAsync();
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