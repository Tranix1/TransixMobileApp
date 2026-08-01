import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

interface AppVersionConfig {
    version: string;
    minVersion: string;
    updateMessage: string;
    lastUpdated: Date;
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
        version: '1.0.1', // Latest version
        minVersion: '1.0.0', // Minimum version that can still use the app without a force update
        updateMessage: 'New features and bug fixes available!',
        lastUpdated: new Date(),
    };

    return await setAppVersion(initialVersion);
};

/**
 * Helper function to create version documents for testing
 */
export const createTestVersions = async () => {
    // Example: force-update scenario (currentVersion below minVersion triggers 'force')
    await setAppVersion({
        version: '1.2.0',
        minVersion: '1.1.0',
        updateMessage: 'Critical security update required. Please update immediately.',
        lastUpdated: new Date(),
    });

    // Example: optional-update scenario (currentVersion at/above minVersion but below version)
    await setAppVersion({
        version: '1.0.2',
        minVersion: '1.0.0',
        updateMessage: 'New features and improvements available!',
        lastUpdated: new Date(),
    });
};

// ---------------------------------------------------------------------------
// Version comparison + update-state resolution
// ---------------------------------------------------------------------------

export type UpdateType = 'force' | 'optional' | 'none';

export interface VersionInfo {
    currentVersion: string;
    minVersion: string;
    latestVersion: string;
}

/**
 * Compares two version strings.
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b.
 * Handles version strings of any segment length ("1.2" === "1.2.0").
 */
export function compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map((n) => parseInt(n, 10) || 0);
    const bParts = b.split('.').map((n) => parseInt(n, 10) || 0);
    const length = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < length; i++) {
        const aSeg = aParts[i] ?? 0;
        const bSeg = bParts[i] ?? 0;
        if (aSeg > bSeg) return 1;
        if (aSeg < bSeg) return -1;
    }
    return 0;
}

export const isVersionLessThan = (a: string, b: string): boolean => compareVersions(a, b) < 0;
export const isVersionGreaterOrEqual = (a: string, b: string): boolean => compareVersions(a, b) >= 0;

/**
 * Resolves the update state a user should see given their current version
 * and the app's configured min/latest versions.
 *
 * - currentVersion < minVersion            -> 'force'
 * - minVersion <= currentVersion < latest  -> 'optional'
 * - currentVersion >= latestVersion        -> 'none'
 */
export function getUpdateType({ currentVersion, minVersion, latestVersion }: VersionInfo): UpdateType {
    if (isVersionLessThan(currentVersion, minVersion)) {
        return 'force';
    }
    if (isVersionLessThan(currentVersion, latestVersion)) {
        return 'optional';
    }
    return 'none';
}