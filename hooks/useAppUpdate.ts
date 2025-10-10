import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import Constants from 'expo-constants';

interface AppVersion {
    version: string;
    forceUpdate: boolean;
    updateMessage?: string;
    lastUpdated: any;
}

interface UseAppUpdateReturn {
    showUpdateModal: boolean;
    currentVersion: string;
    latestVersion: string;
    isForceUpdate: boolean;
    isLoading: boolean;
    error: string | null;
    checkForUpdate: () => Promise<void>;
    dismissUpdate: () => void;
}

export const useAppUpdate = (): UseAppUpdateReturn => {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentVersion, setCurrentVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    const [isForceUpdate, setIsForceUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get current app version
    useEffect(() => {
        const version = Constants.expoConfig?.version || '1.0.1';
        setCurrentVersion(version);
    }, []);

    const checkForUpdate = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch app version info from Firestore
            const versionDocRef = doc(db, 'appConfig', 'version');
            const versionDoc = await getDoc(versionDocRef);

            if (!versionDoc.exists()) {
                console.log('No version document found in database');
                setIsLoading(false);
                return;
            }

            const versionData = versionDoc.data() as AppVersion;
            const dbVersion = versionData.version;
            const forceUpdate = versionData.forceUpdate || false;

            setLatestVersion(dbVersion);
            setIsForceUpdate(forceUpdate);

            // Compare versions
            if (isVersionLower(currentVersion, dbVersion)) {
                setShowUpdateModal(true);
            }

        } catch (error) {
            console.error('Error checking for app update:', error);
            setError('Failed to check for updates');
        } finally {
            setIsLoading(false);
        }
    };

    const dismissUpdate = () => {
        setShowUpdateModal(false);
    };

    return {
        showUpdateModal,
        currentVersion,
        latestVersion,
        isForceUpdate,
        isLoading,
        error,
        checkForUpdate,
        dismissUpdate,
    };
};

// Helper function to compare version strings
const isVersionLower = (current: string, latest: string): boolean => {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    // Ensure both arrays have the same length
    const maxLength = Math.max(currentParts.length, latestParts.length);

    for (let i = 0; i < maxLength; i++) {
        const currentPart = currentParts[i] || 0;
        const latestPart = latestParts[i] || 0;

        if (currentPart < latestPart) {
            return true;
        } else if (currentPart > latestPart) {
            return false;
        }
    }

    return false; // Versions are equal
};
