import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

/**
 * Configure the Android navigation bar to match the app's theme
 * This fixes the white button issue that appears in Expo v54
 */
export const configureNavigationBar = async (colorScheme: 'light' | 'dark' | null) => {
    if (Platform.OS !== 'android') {
        return; // Only configure on Android
    }

    try {
        if (colorScheme === 'dark') {
            await NavigationBar.setBackgroundColorAsync('#0f0e11');
            await NavigationBar.setButtonStyleAsync('light');
        } else {
            await NavigationBar.setBackgroundColorAsync('#F9F9F9');
            await NavigationBar.setButtonStyleAsync('dark');
        }
    } catch (error) {
        console.log('Navigation bar configuration failed:', error);
    }
};
