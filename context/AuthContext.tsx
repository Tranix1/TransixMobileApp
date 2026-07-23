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
import { addDocumentWithId, generateUniqueReferralCode, getReferralCodeByUserId, readById, setDocuments, validateReferralCode } from "@/db/operations";
import { AccountType, CurrentRole, User } from "@/types/types";
import { updateUserTokenInAllCollections } from "@/Utilities/pushNotification";
import { setDoc } from "firebase/firestore";
import { trackAccountCreated, trackLogin, trackLogout } from "@/services/analytics/appAnalytics";
import { incrementAccountsCreated } from "@/services/analytics/dashboardAnalytics";
import { incrementSignups } from "@/services/analytics/referralAnalytics";

type AlertType = "default" | "error" | "success" | "laoding" | "destructive";

type LoginCredentials = {
    phoneNumber?: string;
    verificationId: string;
    otp: string;
    accountType: AccountType;
};

interface LoginResponse {
    success: boolean;
    message: string;
    currentRole?: {
        userRole: string
        accType: string
    }

}

interface SignUpCredentials {
    phoneNumber: string;
    verificationId: string;
    otp: string;
    displayName: string;
    referrerCode?: string;
    accountType?: AccountType;
    referralValidation: any
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
            const credential = PhoneAuthProvider.credential(
                credentials.verificationId,
                credentials.otp
            );

            const userCredential = await signInWithCredential(
                auth,
                credential
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

            let currentRoleAccType: { userRole: string; accType: string };

            const ownedBrokerages = Array.isArray(fullUser?.brokergeDetails) ? fullUser.brokergeDetails : [];
            const ownedFleets = Array.isArray(fullUser?.fleets) ? fullUser.fleets : [];
            const hasDriverProfile = !!fullUser?.driverDetails;

            if (credentials.accountType === "brokerage" && ownedBrokerages.length > 0) {
                currentRoleAccType = {
                    userRole: "verified",
                    accType: credentials.accountType,
                };
            } else if (credentials.accountType === "fleet" && ownedFleets.length > 0) {
                currentRoleAccType = {
                    userRole: "verified",
                    accType: credentials.accountType,
                };
            } else if (credentials.accountType === "driver" && hasDriverProfile) {
                currentRoleAccType = {
                    userRole: "verified",
                    accType: credentials.accountType,
                };
            } else {
                currentRoleAccType = {
                    userRole: "create_Acc",
                    accType: credentials.accountType,
                };
            }

            await AsyncStorage.setItem('currentRole', JSON.stringify(currentRoleAccType));

            void trackLogin({ userId: firebaseUser.uid, accountType: credentials.accountType, role: currentRoleAccType.userRole }).catch(console.error);

            return {
                success: true,
                message: "Login successful",
                currentRole: currentRoleAccType,
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


            if (credentials.referralValidation?.exists) {


                if (credentials.referralValidation.type === "REFERRER") {

                    referredBy = {

                        userId: credentials.referralValidation.data.userId,
                        name: credentials.referralValidation.data.name,
                        phoneNumber: credentials.referralValidation.data.phoneNumber,
                        referralCode: credentials.referralValidation.data.referralCode,
                        joinedAt: credentials.referralValidation.data.joinedAt,
                    };

                }


                if (credentials.referralValidation.type === "CAMPAIGN") {

                    referredBy = {

                        userId: credentials.referralValidation.data.userId,

                        name: credentials.referralValidation.data.name,
                        phoneNumber: credentials.referralValidation.data.phoneNumber,

                        referralCode: credentials.referralValidation.data.referralCode,

                        campaign:
                            credentials.referralValidation.data.campaign,

                        platform:
                            credentials.referralValidation.data.platform,

                        createdAt:
                            credentials.referralValidation.data.createdAt,
                    };

                }
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

                accountType: credentials.accountType,
                createdAt: Date.now().toString(),
            };

            const saved = await setDocuments(
                "personalData",
                userData
            );
            if (!saved) {
                return {
                    success: false,
                };
            }


            let newRefferalCode = await generateUniqueReferralCode("REFERRER");

            await addDocumentWithId(
                "referrers",
                firebaseUser.uid,
                {
                    userId: firebaseUser.uid,

                    name:
                        credentials.displayName || "Unknown",

                    phoneNumber: firebaseUser.phoneNumber ?? undefined,


                    referralCode: newRefferalCode,

                    createdAt:
                        new Date().toISOString(),

                    isActive: true,
                }
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


            const currentRoleAccType = {
                userRole: "create_Acc",

                accType: credentials.accountType,

            };

            await AsyncStorage.setItem('currentRole', JSON.stringify(currentRoleAccType));

            const analyticsContext = {
                userId: firebaseUser.uid,
                accountType: credentials.accountType,
                referrerId: referredBy?.userId ?? null,
                referralCodeUsed: credentials.referrerCode ?? referredBy?.referralCode ?? null,
                campaign: referredBy?.campaign ?? null,
                platform: referredBy?.platform ?? null,
            };
            void trackAccountCreated(analyticsContext).catch(console.error);
            if (referredBy?.userId) void incrementSignups(referredBy.userId).catch(console.error);



            ToastAndroid.show(
                "Account created successfully!",
                ToastAndroid.SHORT
            );



            return {
                success: true,
                accountRole: { userRole: "create_Acc", accType: credentials.accountType },
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
            const analyticsContext = { userId: user?.uid, accountType: user?.accountType, organizationId: currentRole?.organizationId ?? currentRole?.fleetId ?? null, organizationType: currentRole?.accType ?? null, role: currentRole?.userRole ?? null };
            await signOut(auth);
            void trackLogout(analyticsContext).catch(console.error);
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
