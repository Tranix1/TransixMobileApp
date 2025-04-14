import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useFonts } from 'expo-font';
import { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";


export default function RootLayout() {
    const router = useRouter();
    const [appIsReady, setAppIsReady] = useState(false);


    // const [loaded] = useFonts({
    //     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    //     Thin: require('../assets/fonts/Poppins/Poppins-Thin.ttf'),
    //     Light: require('../assets/fonts/Poppins/Poppins-Light.ttf'),
    //     Italic: require('../assets/fonts/Poppins/Poppins-Italic.ttf'),
    //     Regular: require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    //     Medium: require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
    //     SemiBold: require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    //     Bold: require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    //     ExtraBold: require('../assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    // });

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

            SplashScreen.hide();
        }



    }, []);


    return (
        <MainLayout />
    )
}


const MainLayout = () => {
    // const { isSignedIn, setupUser } = useAuth();
    const router = useRouter();


    useEffect(() => {
        // onAuthStateChanged(auth, (user) => {
        //     if (user) {
        //         console.log('User Found >', user.email);
        //         setupUser(user);
        //     } else {
        //         console.log('Currently no user');
        //         setupUser(null);
        //     }
        // });
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
};

export { MainLayout };