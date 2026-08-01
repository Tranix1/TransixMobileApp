import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import Constants from 'expo-constants';
import { getUpdateType, UpdateType } from '@/Utilities/versionUtils';

interface AppVersion {
    version: string;
    minVersion: string;
    updateMessage?: string;
    lastUpdated: any;
}

interface UseAppUpdateReturn {
    showUpdateModal: boolean;
    currentVersion: string;
    latestVersion: string;
    updateType: UpdateType;
    isLoading: boolean;
    error: string | null;
    checkForUpdate: () => Promise<void>;
    dismissUpdate: () => void;
}

export const useAppUpdate = (): UseAppUpdateReturn => {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentVersion, setCurrentVersion] = useState('');
    const [latestVersion, setLatestVersion] = useState('');
    const [updateType, setUpdateType] = useState<UpdateType>('none');
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
            const dbLatestVersion = versionData.version;
            const dbMinVersion = versionData.minVersion || dbLatestVersion;

            setLatestVersion(dbLatestVersion);

            const resolvedType = getUpdateType({
                currentVersion,
                minVersion: dbMinVersion,
                latestVersion: dbLatestVersion,
            });

            setUpdateType(resolvedType);
            setShowUpdateModal(resolvedType !== 'none');

        } catch (error) {
            console.error('Error checking for app update:', error);
            setError('Failed to check for updates');
        } finally {
            setIsLoading(false);
        }
    };

    const dismissUpdate = () => {
        // Force updates cannot be dismissed.
        if (updateType !== 'force') {
            setShowUpdateModal(false);
        }
    };

    return {
        showUpdateModal,
        currentVersion,
        latestVersion,
        updateType,
        isLoading,
        error,
        checkForUpdate,
        dismissUpdate,
    };
};