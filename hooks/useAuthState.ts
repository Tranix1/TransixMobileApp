import { useState, useEffect } from 'react';
import auth from "@react-native-firebase/auth";
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readById } from '@/db/operations';

export interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: any;
    needsProfileSetup: boolean;
    needsEmailVerification: boolean;
    needsSignup: boolean; // NEW

    error: string | null;
}

export function useAuthState() {

    const { user: contextUser, isSignedIn, isPersonalDataLoadedFromCache } = useAuth();
    const [authState, setAuthState] = useState<AuthState>({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        needsProfileSetup: false,
        needsEmailVerification: false,
        needsSignup: false, // NEW
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
            if (!isMounted) return;

            try {
                if (!firebaseUser) {
                    // No user signed in
                    if (isMounted) {
                        setAuthState({
                            isLoading: false,
                            isAuthenticated: false,
                            user: null,
                            needsProfileSetup: false,
                            needsSignup: false, // NEW
                            needsEmailVerification: false,
                            error: null,
                        });
                    }
                    return;
                }

                // User is signed in, check their profile
                // User is signed in, check their profile
                let userProfile = null;
                let needsSignup = false;

                try {
                    // Always fetch fresh profile data to ensure we have the latest
                    const freshProfile = await readById("personalData", firebaseUser.uid);

                    // If there is no profile in Firestore, this user still needs signup
                    needsSignup = !freshProfile;

                    if (freshProfile) {
                        userProfile = freshProfile;

                        // Update cache
                        await AsyncStorage.setItem(
                            `profile_${firebaseUser.uid}`,
                            JSON.stringify(freshProfile)
                        );
                    } else {
                        // Try cached profile
                        const cachedProfile = await AsyncStorage.getItem(
                            `profile_${firebaseUser.uid}`
                        );

                        if (cachedProfile) {
                            userProfile = JSON.parse(cachedProfile);

                            console.log(
                                "Using cached profile data as fallback:",
                                userProfile
                            );

                            // Cached profile means signup was already completed
                            needsSignup = false;
                        }
                    }
                } catch (error) {
                    console.error("Error loading user profile:", error);
                }

                if (!isMounted) return;

                const fullUser = {
                    ...firebaseUser,
                    ...userProfile,
                };

                // Check if profile setup is needed
           const needsProfileSetup = !needsSignup && !fullUser?.organisation;

                // Email verification (phone auth doesn't need this)
                const needsEmailVerification = false;

                setAuthState({
                    isLoading: false,
                    isAuthenticated: true,
                    user: fullUser,
                    needsSignup,
                    needsProfileSetup,
                    needsEmailVerification,
                    error: null,
                });
            } catch (error) {
                console.error('Auth state change error:', error);
                if (isMounted) {
                    setAuthState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                    }));
                }
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    // Listen for changes in AuthContext user to sync profile completion status
    useEffect(() => {
        if (contextUser && authState.isAuthenticated) {
            // Update the auth state when context user changes (e.g., after profile update)
            // If personalData was loaded from cache, don't require profile setup
            const needsProfileSetup = isPersonalDataLoadedFromCache ? false : !contextUser?.organisation;


            setAuthState(prev => ({
                ...prev,
                user: contextUser,
                needsProfileSetup,
            }));
        }
    }, [contextUser, authState.isAuthenticated, isPersonalDataLoadedFromCache]);

    const updateUserProfile = async (updatedProfile: any) => {
        if (!authState.user?.uid) return;

        try {
            const mergedProfile = { ...authState.user, ...updatedProfile };

            // Update cache
            await AsyncStorage.setItem(`profile_${authState.user.uid}`, JSON.stringify(mergedProfile));

            // Also update the main user cache
            await AsyncStorage.setItem('user', JSON.stringify(mergedProfile));

            // Update state
            setAuthState(prev => ({
                ...prev,
                user: mergedProfile,
                needsProfileSetup: isPersonalDataLoadedFromCache ? false : !mergedProfile.organisation,
            }));

            console.log('Profile updated:', {
                mergedProfile,
                organisation: mergedProfile.organisation,
                needsProfileSetup: !mergedProfile.organisation
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    return {
        ...authState,
        updateUserProfile,
    };
}


