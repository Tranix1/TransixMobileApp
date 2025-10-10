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

        // Try using the native Android approach
        const { NativeModules } = require('react-native');

        if (NativeModules.ExpoNavigationBar) {
            if (colorScheme === 'dark') {
                await NativeModules.ExpoNavigationBar.setBackgroundColorAsync('#0f0e11');
                await NativeModules.ExpoNavigationBar.setButtonStyleAsync('light');
            } else {
                await NativeModules.ExpoNavigationBar.setBackgroundColorAsync('#F9F9F9');
                await NativeModules.ExpoNavigationBar.setButtonStyleAsync('dark');
            }
            console.log('Native navigation bar configuration completed');
        } else {
            console.log('Native ExpoNavigationBar module not available');
        }
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
