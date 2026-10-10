import { Platform } from 'react-native';

/**
 * Native Android navigation bar configuration
 * This uses a different approach to fix the white navigation bar issue
 */

export const configureNativeNavigationBar = async (colorScheme: 'light' | 'dark' | null) => {
    if (Platform.OS !== 'android') {
        return;
    }

    try {
        console.log('Configuring native navigation bar for theme:', colorScheme);

        // Use Expo's public module API. Expo modules are not guaranteed to be
        // exposed through React Native's NativeModules object in release builds.
        const NavigationBar = require('expo-navigation-bar');

        if (colorScheme === 'dark') {
            await NavigationBar.setBackgroundColorAsync('#0f0e11');
            await NavigationBar.setButtonStyleAsync('light');
        } else {
            await NavigationBar.setBackgroundColorAsync('#F9F9F9');
            await NavigationBar.setButtonStyleAsync('dark');
        }
        console.log('Native navigation bar configuration completed');
    } catch (error) {
        console.error('Native navigation bar configuration failed:', error);
    }
};

/**
 * Force navigation bar configuration using a different method
 */
export const forceNavigationBarConfig = async (colorScheme: 'light' | 'dark' | null) => {
    if (Platform.OS !== 'android') {
        return;
    }

    try {
        console.log('Force configuring navigation bar for theme:', colorScheme);

        // Try multiple times with different delays
        const attempts = [0, 100, 300, 500, 1000];

        for (const delay of attempts) {
            setTimeout(async () => {
                try {
                    const NavigationBar = require('expo-navigation-bar');

                    if (colorScheme === 'dark') {
                        await NavigationBar.setBackgroundColorAsync('#0f0e11');
                        await NavigationBar.setButtonStyleAsync('light');
                        console.log(`Force config attempt at ${delay}ms - dark mode`);
                    } else {
                        await NavigationBar.setBackgroundColorAsync('#F9F9F9');
                        await NavigationBar.setButtonStyleAsync('dark');
                        console.log(`Force config attempt at ${delay}ms - light mode`);
                    }
                } catch (error) {
                    console.error(`Force config attempt at ${delay}ms failed:`, error);
                }
            }, delay);
        }
    } catch (error) {
        console.error('Force navigation bar configuration failed:', error);
    }
};
