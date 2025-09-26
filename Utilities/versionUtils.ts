import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

interface AppVersionConfig {
    version: string;
    forceUpdate: boolean;
    updateMessage?: string;
    lastUpdated: any;
    minSupportedVersion?: string;
}

/**
 * Set the app version configuration in Firestore
 * This should be called from your admin panel or manually when you want to update the version
 */
export const setAppVersion = async (versionConfig: AppVersionConfig) => {
    try {
        const versionDocRef = doc(db, 'appConfig', 'version');
        await setDoc(versionDocRef, {
            ...versionConfig,
            lastUpdated: new Date(),
        });
        console.log('App version updated successfully:', versionConfig);
        return true;
    } catch (error) {
        console.error('Error setting app version:', error);
        return false;
    }
};

/**
 * Get the current app version configuration from Firestore
 */
export const getAppVersion = async (): Promise<AppVersionConfig | null> => {
    try {
        const versionDocRef = doc(db, 'appConfig', 'version');
        const versionDoc = await getDoc(versionDocRef);

        if (versionDoc.exists()) {
            return versionDoc.data() as AppVersionConfig;
        }
        return null;
    } catch (error) {
        console.error('Error getting app version:', error);
        return null;
    }
};

/**
 * Example usage for setting up the initial version
 * Call this function to set up the version document in your database
 */
export const setupInitialVersion = async () => {
    const initialVersion: AppVersionConfig = {
        version: '1.0.1', // Set this to your latest version
        forceUpdate: false, // Set to true if you want to force users to update
        updateMessage: 'New features and bug fixes available!',
        minSupportedVersion: '1.0.0', // Minimum version that can still use the app
    };

    return await setAppVersion(initialVersion);
};

/**
 * Helper function to create version documents for testing
 */
export const createTestVersions = async () => {
    // Example: Force update scenario
    await setAppVersion({
        version: '1.1.0',
        forceUpdate: true,
        updateMessage: 'Critical security update required. Please update immediately.',
        minSupportedVersion: '1.0.0',
    });

    // Example: Optional update scenario
    await setAppVersion({
        version: '1.0.2',
        forceUpdate: false,
        updateMessage: 'New features and improvements available!',
        minSupportedVersion: '1.0.0',
    });
};
