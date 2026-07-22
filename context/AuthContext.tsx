import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    createUserWithEmailAndPassword,
    PhoneAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { Alert, ToastAndroid } from "react-native";
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { auth } from "@/db/fireBaseConfig";
import { addDocumentWithId, generateUniqueReferrerCode, getReferralCodeByUserId, readById, setDocuments, validateReferrerCode } from "@/db/operations";
import { AccountType, CurrentRole, User } from "@/types/types";
import { updateUserTokenInAllCollections } from "@/Utilities/pushNotification";
import { setDoc } from "firebase/firestore";

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
    phoneNumber: string;
    verificationId: string;
    otp: string;
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
    signUp: (credentials: SignUpCredentials) => Promise<{ success: boolean; accountRole?: any }>;
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
const DEFAULT_Driver_ROLE: CurrentRole = {
    role: 'driver',
    fleetId: "",
    userRole: "",
    accType: 'driver',
    driverId: "",
    driverName: ""
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
    signUp: async () => { return { success: false, }; },
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

        case 'driver':
            return DEFAULT_Driver_ROLE

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

    const signUp = async (credentials: SignUpCredentials): Promise<{ success: boolean; accountRole?: any }> => {
        try {
            let referredBy: User["referredBy"] | undefined;

            if (credentials.referrerCode?.trim()) {
                const validation = await validateReferrerCode(
                    credentials.referrerCode.trim().toUpperCase()
                );

                if (!validation.exists || !validation.referrerData) {
                    ToastAndroid.show(
                        "Invalid referral code. Please check the code or leave it blank.",
                        ToastAndroid.LONG
                    );
                    return {
                        success: false,
                    };
                }

                referredBy = validation.referrerData;
            }

            const credential = PhoneAuthProvider.credential(
                credentials.verificationId,
                credentials.otp
            );

            const userCredential = await signInWithCredential(
                auth,
                credential
            );

            const firebaseUser = userCredential.user;

            const accountRole = normalizeAccountType(
                credentials.accountType || "tracking"
            );

            await updateProfile(firebaseUser, {
                displayName: credentials.displayName,
            });

            const userData: User = {

                uid: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber ?? undefined,
                displayName: credentials.displayName,

                ...(referredBy && {
                    referredBy
                }),

                accountType: accountRole.accType,
                role: accountRole.role,
                createdAt: Date.now().toString(),
            };

            const saved = await setDocuments(
                "personalData",
                userData
            );

            if (!saved) {
                ToastAndroid.show(
                    "Unable to create profile. Please try again.",
                    ToastAndroid.LONG
                );
                return {
                    success: false,
                };
            }

            setUser(userData);
            setIsSignedIN(true);
            setIsAppReady(true);

            await AsyncStorage.setItem(
                "user",
                JSON.stringify(userData)
            );

            await AsyncStorage.setItem(
                "currentUser",
                JSON.stringify(userData)
            );

            await AsyncStorage.setItem(
                `personalData_${firebaseUser.uid}`,
                JSON.stringify(userData)
            );

            await saveCurrentRole(accountRole);


            ToastAndroid.show(
                "Account created successfully!",
                ToastAndroid.SHORT
            );



            return {
                success: true,
                accountRole,
            };

        } catch (error) {
            console.error("Sign up failed:", error);

            ToastAndroid.show(
                getFirebaseErrorMessage(error),
                ToastAndroid.LONG
            );

            return {
                success: false
            };
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

    const updateAccount = async (
        credentials: User
    ): Promise<UpdateAccountResponse> => {
        try {
            const currentUser = auth.currentUser;

            if (!isSignedIn || !currentUser || !credentials.uid) {
                return {
                    success: false,
                    error: "User not signed in.",
                };
            }

            await updateProfile(currentUser, {
                displayName:
                    credentials.organisation ||
                    credentials.displayName ||
                    "",
                photoURL: credentials.photoURL || null,
            });

          

            // Get existing user data
            const existingUser = await readById(
                "personalData",
                credentials.uid
            ) as Partial<User> | null;


            // Keep existing referral code
            let referralCode =
                existingUser?.referralCode ||
                user?.referralCode;


            // Create referral profile only once
            if (!referralCode) {

                referralCode = await generateUniqueReferrerCode();

                await addDocumentWithId(
                    "referrers",
                    credentials.uid,
                    {
                        userId: credentials.uid,

                        name:
                            credentials.displayName ||
                            credentials.displayName ||
                            "Unknown",

                        email:
                            credentials.email ||
                            currentUser.email ||
                            "",

                        referralCode,

                        createdAt:
                            new Date().toISOString(),

                        isActive: true,
                    }
                );
            }


            const fullUser: User = {
                ...(existingUser as User),
                ...credentials,

                uid: credentials.uid,

                displayName:
                    credentials.organisation ||
                    credentials.displayName ||
                    "",

                accountType: currentRole.accType,

                role: currentRole.role,

                expoPushToken:
                    credentials.expoPushToken ||
                    existingUser?.expoPushToken ||
                    "",

                referralCode,

                // Preserve referral object from signup
                ...(existingUser?.referredBy || user?.referredBy
                    ? {
                        referredBy:
                            existingUser?.referredBy ||
                            user?.referredBy
                    }
                    : {}),
            };


            // Remove undefined values before Firebase
            const cleanUser = Object.fromEntries(
                Object.entries(fullUser)
                    .filter(([_, value]) => value !== undefined)
            ) as User;


            await setDocuments(
                "personalData",
                cleanUser
            );


            await AsyncStorage.setItem(
                "user",
                JSON.stringify(cleanUser)
            );

            await AsyncStorage.setItem(
                "currentUser",
                JSON.stringify(cleanUser)
            );

            await AsyncStorage.setItem(
                `profile_${cleanUser.uid}`,
                JSON.stringify(cleanUser)
            );

            await AsyncStorage.setItem(
                `personalData_${cleanUser.uid}`,
                JSON.stringify(cleanUser)
            );


            setUser(cleanUser);

            setIsSignedIN(true);

            setIsAppReady(true);


            if (cleanUser.expoPushToken) {

                await updateUserTokenInAllCollections(
                    cleanUser.uid,
                    cleanUser.expoPushToken
                );

            }


            return {
                success: true,
                user: cleanUser,
            };


        } catch (error) {

            console.log(
                "Update Error >",
                error
            );

            return {
                success: false,
                error: (error as Error).message,
            };
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
