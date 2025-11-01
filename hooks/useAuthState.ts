import { useState, useEffect } from 'react';
import { auth } from '@/db/fireBaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readById } from '@/db/operations';

export interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: any;
    needsProfileSetup: boolean;
    needsEmailVerification: boolean;
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
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
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
                            needsEmailVerification: false,
                            error: null,
                        });
                    }
                    return;
                }

                // User is signed in, check their profile
                let userProfile = null;
                try {
                    // Always fetch fresh profile data to ensure we have the latest
                    console.log('Fetching fresh profile data for:', firebaseUser.uid);
                    const freshProfile = await readById('personalData', firebaseUser.uid);
                    console.log('Fresh profile data from database:', freshProfile);

                    if (freshProfile) {
                        userProfile = freshProfile;
                        // Update cache
                        await AsyncStorage.setItem(`profile_${firebaseUser.uid}`, JSON.stringify(freshProfile));
                    } else {
                        // If no fresh data, try cached data as fallback
                        const cachedProfile = await AsyncStorage.getItem(`profile_${firebaseUser.uid}`);
                        if (cachedProfile) {
                            userProfile = JSON.parse(cachedProfile);
                            console.log('Using cached profile data as fallback:', userProfile);
                        }
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                }

                if (!isMounted) return;

                const fullUser = {
                    ...firebaseUser,
                    ...userProfile,
                };

                // Check if profile setup is needed - only check organisation like AddLoads.tsx
                // If personalData was loaded from cache, don't require profile setup
                const needsProfileSetup = isPersonalDataLoadedFromCache ? false : !fullUser?.organisation;

                // Debug logging
                console.log('Profile check:', {
                    firebaseUser: {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName
                    },
                    userProfile,
                    fullUser: {
                        uid: fullUser.uid,
                        email: fullUser.email,
                        organisation: fullUser.organisation,
                        displayName: fullUser.displayName
                    },
                    needsProfileSetup
                });

                // Check if email verification is needed
                const needsEmailVerification = !firebaseUser.emailVerified;

                setAuthState({
                    isLoading: false,
                    isAuthenticated: true,
                    user: fullUser,
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

            console.log('Syncing with context user:', {
                contextUser: {
                    uid: contextUser.uid,
                    email: contextUser.email,
                    organisation: contextUser.organisation,
                    displayName: contextUser.displayName
                },
                needsProfileSetup,
                isPersonalDataLoadedFromCache
            });

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


