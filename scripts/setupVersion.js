// Setup script to initialize the app version in Firestore
// Run this script to set up the initial version document

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
    // Add your Firebase config here
    // You can find this in your Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to set up the initial version
async function setupInitialVersion() {
    try {
        const versionDocRef = doc(db, 'appConfig', 'version');

        await setDoc(versionDocRef, {
            version: '1.0.1', // Set this to your current app version
            forceUpdate: false, // Set to true if you want to force users to update
            updateMessage: 'Welcome to Transix! New features and improvements available.',
            lastUpdated: new Date(),
            minSupportedVersion: '1.0.0', // Minimum version that can still use the app
        });

        console.log('✅ Version document created successfully!');
        console.log('📱 Current version set to: 1.0.1');
        console.log('🔄 Force update: false');
        console.log('💬 Update message: Welcome to Transix! New features and improvements available.');

    } catch (error) {
        console.error('❌ Error setting up version:', error);
    }
}

// Function to update the version
async function updateVersion(newVersion, forceUpdate = false, message = '') {
    try {
        const versionDocRef = doc(db, 'appConfig', 'version');

        await setDoc(versionDocRef, {
            version: newVersion,
            forceUpdate: forceUpdate,
            updateMessage: message || `New version ${newVersion} available with improvements and bug fixes.`,
            lastUpdated: new Date(),
            minSupportedVersion: '1.0.0',
        });

        console.log(`✅ Version updated to: ${newVersion}`);
        console.log(`🔄 Force update: ${forceUpdate}`);
        console.log(`💬 Message: ${message || 'Default message'}`);

    } catch (error) {
        console.error('❌ Error updating version:', error);
    }
}

// Example usage:
// setupInitialVersion();
// updateVersion('1.0.2', false, 'New features and bug fixes!');
// updateVersion('1.1.0', true, 'Critical security update required!');

export { setupInitialVersion, updateVersion };
