import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { Alert, ToastAndroid } from "react-native";
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { auth } from "@/db/fireBaseConfig";
import { readById, setDocuments, validateReferrerCode } from "@/db/operations";
import { AccountType, CurrentRole, User } from "@/types/types";
import { updateUserTokenInAllCollections } from "@/Utilities/pushNotification";

type AlertType = "default" | "error" | "success" | "laoding" | "destructive";

interface LoginCredentials {
    email: string;
    password: string;
    accountType: AccountType;
}

interface LoginResponse {
    success: boolean;
    message: string;
}

interface SignUpCredentials {
    email: string;
    password: string;
    displayName: string;
    referrerCode?: string;
    accountType?: AccountType;
}

interface UpdateAccountResponse {
    success: boolean;
    error?: string;
    user?: User;
}

interface AuthContextValue {
    signUp: (credentials: SignUpCredentials) => Promise<void>;
    Login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    isSignedIn: boolean;
    user: User | null | undefined;
    setupUser: (userData: User | null) => Promise<void>;
    Logout: () => Promise<boolean>;
    alertBox: (title: string, message: string, buttons?: Alertbutton[], type?: AlertType) => void;
    updateAccount: (credentials: User) => Promise<UpdateAccountResponse>;
    currentRole: CurrentRole;
    setCurrentRole: (role: CurrentRole | AccountType) => Promise<void>;
    isAppReady: boolean;
    updateCurrentUser: (userData: User) => Promise<void>;
    isPersonalDataLoadedFromCache: boolean;
}

const DEFAULT_GENERAL_ROLE: CurrentRole = {
    role: 'general',
    accType: 'tracking',
    userRole: 'tracking',
};

const DEFAULT_FLEET_ROLE: CurrentRole = {
    role: 'fleet',
    fleetId: "",
    companyName: "",
    userRole: "",
    accType: 'fleet',
    driverId: null,
    fleetMainAdminId: null,
    fleetManagerId: null,
    fleetDispatcherId: null,
};

const DEFAULT_BROKER_ROLE: CurrentRole = {
    role: 'brokerage',
    brokerId: "",
    companyName: "",
    userRole: "",
    accType: 'brokerage',
    brokerType: "",
};

const AuthContext = createContext<AuthContextValue>({
    signUp: async () => { },
    Login: async () => ({ success: false, message: "" }),
    isSignedIn: false,
    user: null,
    setupUser: async () => { },
    Logout: async () => false,
    alertBox: () => { },
    updateAccount: async () => ({ success: false }),
    currentRole: DEFAULT_GENERAL_ROLE,
    setCurrentRole: async () => { },
    isAppReady: false,
    updateCurrentUser: async () => { },
    isPersonalDataLoadedFromCache: false,
});

const normalizeAccountType = (roleInput: CurrentRole | AccountType | null | undefined): CurrentRole => {
    if (!roleInput) {
        return DEFAULT_GENERAL_ROLE;
    }

    if (typeof roleInput !== 'string') {
        return roleInput;
    }

    switch (roleInput) {
        case 'tracking':
            return DEFAULT_GENERAL_ROLE;
        case 'general':
            return { ...DEFAULT_GENERAL_ROLE, accType: 'general' };
        case 'fleet':
            return DEFAULT_FLEET_ROLE;
        case 'brokerage':
            return DEFAULT_BROKER_ROLE;
        default:
            return DEFAULT_GENERAL_ROLE;
    }
};

const getFirebaseErrorMessage = (error: any) => {
    const errorCode = error?.message?.match(/\(([^)]+)\)/)?.[1];

    switch (errorCode) {
        case "auth/network-request-failed":
            return "Network request failed";
        case "auth/invalid-email":
            return "Invalid email format.";
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Incorrect password. Please try again.";
        case "auth/user-disabled":
            return "This account has been disabled.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Try again later.";
        case "auth/invalid-credentials":
            return "Password and Email are not recognised";
        case "auth/email-already-in-use":
            return "An account already exists with this email.";
        case "auth/weak-password":
            return "Password should be at least 6 characters.";
        case "auth/operation-not-allowed":
            return "This sign-in method is not enabled.";
        default:
            return error?.message || "An unexpected error occurred. Please try again.";
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [isSignedIn, setIsSignedIN] = useState(false);
    const [currentRole, setCurrentRoleState] = useState<CurrentRole>(DEFAULT_GENERAL_ROLE);
    const [isAppReady, setIsAppReady] = useState(false);
    const [isPersonalDataLoadedFromCache, setIsPersonalDataLoadedFromCache] = useState(false);
    const [showAlert, setshowAlert] = useState<ReactElement | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const currentUser = await AsyncStorage.getItem('currentUser');
                const storedRole = await AsyncStorage.getItem('currentRole');
                const rawUser = currentUser || storedUser;

                if (rawUser) {
                    const parsedUser = JSON.parse(rawUser);
                    const cachedPersonalData = await AsyncStorage.getItem(`personalData_${parsedUser.uid}`);
                    let personalData: any = {};

                    if (cachedPersonalData) {
                        personalData = JSON.parse(cachedPersonalData);
                        setIsPersonalDataLoadedFromCache(true);
                    } else {
                        personalData = await readById('personalData', parsedUser.uid) || {};
                        await AsyncStorage.setItem(`personalData_${parsedUser.uid}`, JSON.stringify(personalData));
                        setIsPersonalDataLoadedFromCache(false);
                    }

                    const fullUser = { ...parsedUser, ...personalData };
                    setUser(fullUser);
                    setIsSignedIN(true);
                    await AsyncStorage.setItem('user', JSON.stringify(fullUser));
                    await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser));
                }

                if (storedRole) {
                    try {
                        setCurrentRoleState(normalizeAccountType(JSON.parse(storedRole) as CurrentRole | AccountType));
                    } catch {
                        setCurrentRoleState(normalizeAccountType(storedRole as AccountType));
                    }
                } else {
                    setCurrentRoleState(DEFAULT_GENERAL_ROLE);
                }
            } catch (error) {
                console.error('Error loading user from cache:', error);
            } finally {
                setIsAppReady(true);
            }
        };

        loadUser();
    }, []);

    const saveCurrentRole = async (roleInput: CurrentRole | AccountType) => {
        const normalizedRole = normalizeAccountType(roleInput);
        setCurrentRoleState(normalizedRole);

        try {
            await AsyncStorage.setItem('currentRole', JSON.stringify(normalizedRole));
        } catch (error) {
            console.error('Error saving current role:', error);
        }
    };

    const setupUser = async (userData: User | null) => {
        if (userData) {
            const additional = await readById('personalData', userData.uid) || {};
            const fullUser = { ...userData, ...additional };

            setUser(fullUser);
            setIsSignedIN(true);
            setIsAppReady(true);
            await AsyncStorage.setItem('user', JSON.stringify(fullUser));
            await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser));
            await AsyncStorage.setItem(`personalData_${userData.uid}`, JSON.stringify(additional));

            if (fullUser.expoPushToken) {
                await updateUserTokenInAllCollections(fullUser.uid, fullUser.expoPushToken);
            }

            return;
        }

        setUser(null);
        setIsSignedIN(false);
        setIsAppReady(true);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('currentUser');
    };

    const Login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            setUser(undefined);

            const firebaseUser = userCredential.user;

            if (auth.currentUser && !auth.currentUser.emailVerified) {
                await sendEmailVerification(firebaseUser);
                Alert.alert(
                    "Verification Email Sent",
                    "Please verify your email to continue."
                );
            }

            const personalData = await readById('personalData', firebaseUser.uid) || {};
            const fullUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email ?? undefined,
                displayName: firebaseUser.displayName ?? undefined,
                phoneNumber: firebaseUser.phoneNumber ?? undefined,
                photoURL: firebaseUser.photoURL ?? undefined,
                ...personalData,
            };

            setUser(fullUser);
            console.log(fullUser)
            setIsSignedIN(true);
            setIsAppReady(true);
            await AsyncStorage.setItem('user', JSON.stringify(fullUser));
            await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser));
            await AsyncStorage.setItem(`personalData_${firebaseUser.uid}`, JSON.stringify(personalData));
            await saveCurrentRole(credentials.accountType);
            await router.replace('/');

            return {
                success: true,
                message: "Login successful",
            };
        } catch (error) {
            console.log(error);

            return {
                success: false,
                message: getFirebaseErrorMessage(error),
            };
        }
    };

    const signUp = async (credentials: SignUpCredentials): Promise<void> => {
        try {
            let referrerId: string | null = null;

            if (credentials.referrerCode && credentials.referrerCode.trim() !== '') {
                const referrerValidation = await validateReferrerCode(credentials.referrerCode.trim().toUpperCase());

                if (!referrerValidation.exists) {
                    ToastAndroid.show('Invalid referrer code. Please check the code or leave it blank.', ToastAndroid.LONG);
                    return;
                }

                referrerId = referrerValidation.referrerId;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            const firebaseUser = userCredential.user;
            const accountRole = normalizeAccountType(credentials.accountType || 'tracking');

            await updateProfile(firebaseUser, {
                displayName: credentials.displayName,
            });

            const userData: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email ?? undefined,
                displayName: credentials.displayName,
                referrerId: referrerId || undefined,
                accountType: accountRole.accType,
                role: accountRole.role,
                createdAt: Date.now().toString(),
            };

            const saved = await setDocuments("personalData", userData);

            if (!saved) {
                ToastAndroid.show('Unable to create profile. Please try again.', ToastAndroid.LONG);
                return;
            }

            const fullUser = { ...userData };

            setUser(fullUser);
            setIsSignedIN(true);
            setIsAppReady(true);
            await AsyncStorage.setItem('user', JSON.stringify(fullUser));
            await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser));
            await AsyncStorage.setItem(`personalData_${firebaseUser.uid}`, JSON.stringify(userData));
            await saveCurrentRole(accountRole);

            await sendEmailVerification(firebaseUser).catch(() => { });

            ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);
            await router.replace({
                pathname: '/Account/Profile',
                params: { operation: 'create', accountType: accountRole.accType },
            });
        } catch (error) {
            console.error('Sign up failed:', error);
            ToastAndroid.show(getFirebaseErrorMessage(error), ToastAndroid.LONG);
        }
    };

    const Logout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.clear();
            setCurrentRoleState(DEFAULT_GENERAL_ROLE);
            setUser(null);
            setIsSignedIN(false);
            setIsAppReady(true);
            await router.replace('/');
            ToastAndroid.show('logout successful', ToastAndroid.SHORT);
            return true;
        } catch (error) {
            ToastAndroid.show('logout unsuccessful', ToastAndroid.SHORT);
            console.error("Error during logout:", error);
            return false;
        }
    };

    const updateCurrentUser = async (userData: User) => {
        try {
            await AsyncStorage.setItem("currentUser", JSON.stringify(userData));
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            console.log('Current user updated in AsyncStorage');
        } catch (error) {
            console.error('Error updating current user:', error);
        }
    };

    const updateAccount = async (credentials: User): Promise<UpdateAccountResponse> => {
        try {
            const currentUser = auth.currentUser;

            if (!isSignedIn || !currentUser || !credentials.uid) {
                return { success: false, error: "User not signed in." };
            }

            await updateProfile(currentUser, {
                displayName: credentials.organisation || credentials.displayName || "",
                photoURL: credentials.photoURL || null,
            });

            if (!currentUser.emailVerified) {
                await sendEmailVerification(currentUser).catch(() => { });
                    ToastAndroid.show('Verification Email Sent. Please check your inbox.', ToastAndroid.LONG);

            }

            const fullUser: User = {
                ...credentials,
                displayName: credentials.organisation || credentials.displayName || "",
                accountType: currentRole.accType,
                role: currentRole.role,
                expoPushToken: credentials.expoPushToken || "",
            };

            await setDocuments("personalData", fullUser);
            await AsyncStorage.setItem("user", JSON.stringify(fullUser));
            await AsyncStorage.setItem("currentUser", JSON.stringify(fullUser));
            await AsyncStorage.setItem(`profile_${fullUser.uid}`, JSON.stringify(fullUser));
            await AsyncStorage.setItem(`personalData_${fullUser.uid}`, JSON.stringify(fullUser));

            setUser(fullUser);
            setIsSignedIN(true);
            setIsAppReady(true);

            if (fullUser.expoPushToken) {
                await updateUserTokenInAllCollections(fullUser.uid, fullUser.expoPushToken);
            }
            return { success: true, user: fullUser };
        } catch (error) {
            console.log("Update Error >", error);
            return { error: (error as Error).message, success: false };
        }
    };

    function alertBox(title: string, message: string, buttons?: Alertbutton[], type?: AlertType) {
        setshowAlert(
            <AlertComponent
                visible
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onBackPress={() => setshowAlert(null)}
            />
        );
    }

    return (
        <AuthContext.Provider value={{
            signUp,
            Login,
            isSignedIn,
            user,
            setupUser,
            Logout,
            updateAccount,
            alertBox,
            currentRole,
            setCurrentRole: saveCurrentRole,
            isAppReady,
            updateCurrentUser,
            isPersonalDataLoadedFromCache,
        }}>
            {children}
            {showAlert}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export type { AlertType, AuthContextValue, LoginCredentials, LoginResponse, SignUpCredentials };
