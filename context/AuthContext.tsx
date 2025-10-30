import { auth } from "@/db/fireBaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification } from "firebase/auth";
import { createContext, ReactElement, useContext, useState, useEffect } from "react";
import { ToastAndroid } from "react-native";



const AuthContext = createContext({
    signUp: async (credentials: any) => { },
    Login: async (credentials: any) => ({ success: false, message: "" }),
    isSignedIn: false,
    user: null as User | null,
    setupUser: async (userData: any) => { },
    Logout: async () => false,
    alertBox: (title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) => { },
    updateAccount: async (credentials: any) => ({ success: false }),
    currentRole: 'general' as 'general' | 'fleet' | 'broker' | { role: 'fleet'; fleetId: string; companyName: string; userRole: string; accType: string; },
    setCurrentRole: (role: 'general' | 'fleet' | 'broker' | { role: 'fleet'; fleetId: string; companyName: string; userRole: string; accType: string; }) => { },
    isAppReady: false,
    updateCurrentUser: async (userData: User) => { },
});

import { ReactNode } from "react";
import { addDocument, setDocuments, readById, validateReferrer, validateReferrerCode } from "@/db/operations";
import { User } from "@/types/types";
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { updateUserTokenInAllCollections } from "@/Utilities/pushNotification";

export const AuthProvider = ({ children }: { children: ReactNode }) => {


    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIN] = useState(false);
    const [currentRole, setCurrentRole] = useState<'general' | 'fleet' | 'broker' | { role: 'fleet'; fleetId: string; companyName: string; userRole: string; accType: string; }>('general');
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            const currentUser = await AsyncStorage.getItem('currentUser');
            const storedRole = await AsyncStorage.getItem('currentRole');

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const cachedPersonalData = await AsyncStorage.getItem(`personalData_${parsedUser.uid}`);
                let personalData;
                if (cachedPersonalData) {
                    personalData = JSON.parse(cachedPersonalData);
                } else {
                    personalData = await readById('personalData', parsedUser.uid);
                    await AsyncStorage.setItem(`personalData_${parsedUser.uid}`, JSON.stringify(personalData));
                }
                setUser({ ...parsedUser, ...personalData });
                setIsSignedIN(true);
            }

            // Also load currentUser if available
            if (currentUser) {
                const parsedCurrentUser = JSON.parse(currentUser);
                // Update user state with currentUser if it's more recent
                if (!storedUser || JSON.parse(storedUser).uid !== parsedCurrentUser.uid) {
                    setUser(parsedCurrentUser);
                    setIsSignedIN(true);
                }
            }

            if (storedRole) {
                try {
                    const parsedRole = JSON.parse(storedRole);
                    if (typeof parsedRole === 'object' && parsedRole.role === 'fleet') {
                        setCurrentRole(parsedRole);
                    } else {
                        setCurrentRole(parsedRole as 'general' | 'fleet' | 'broker');
                    }
                } catch (error) {
                    setCurrentRole(storedRole as 'general' | 'fleet' | 'broker');
                }
            }

            setIsAppReady(true);
        };

        loadUser();
    }, []);


    const setupUser = async (userData: any) => {
        if (userData) {
            console.log(user?.organisation)
            const aditional = await readById('personalData', userData.uid)
            const fullUser = { ...userData, ...aditional };
            setUser(fullUser)
            setIsSignedIN(true);
            await AsyncStorage.setItem('user', JSON.stringify(userData))
            await AsyncStorage.setItem(`personalData_${userData.uid}`, JSON.stringify(aditional))

            // Update expoPushToken in ALL collections for this user
            if (fullUser.expoPushToken) {
                await updateUserTokenInAllCollections(fullUser.uid, fullUser.expoPushToken);
            }

            return;
        } else {
            console.log("here")
            // setUser(null)
            setIsSignedIN(false);
            await AsyncStorage.removeItem('user')
            return;
        }
    }

    // const initUser = async () => {
    //     const getuser = await AsyncStorage.getItem('user');
    //     if (getuser) {
    //         setUser(JSON.parse(getuser))
    //         setIsSignedIN(true);
    //     }
    // }

    // initUser()

    interface LoginCredentials {
        email: string;
        password: string;
    }

    interface LoginResponse {
        success: boolean;
        message: string;
    }

    const Login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;

            if (auth.currentUser && !auth.currentUser.emailVerified) {
                const user = userCredential.user;
                await sendEmailVerification(user);
                alert('Verification Email Sent \b Please Verify Your Email To Continue');
            }


            const aditional = await readById('users', user.uid)
            const fullUser = { uid: user.uid, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber, photoURL: user.photoURL, ...aditional };
            setUser(fullUser as User);
            setIsSignedIN(true);
            await AsyncStorage.setItem("user", JSON.stringify(fullUser));

            // Also store current user details for persistence
            await AsyncStorage.setItem("currentUser", JSON.stringify(fullUser));

            router.dismissAll();
            return { success: true, message: 'Login successful' };

        } catch (error: any) {
            const errorCode = error.message.match(/\(([^)]+)\)/)?.[1];
            console.log(error);
            let errorMessage = "An unexpected error occurred. Please try again.";

            if (errorCode) {
                switch (errorCode) {
                    case "auth/network-request-failed":
                        errorMessage = "Network request failed";
                        break;
                    case "auth/invalid-email":
                        errorMessage = "Invalid email format.";
                        break;
                    case "auth/user-not-found":
                        errorMessage = "No account found with this email.";
                        break;
                    case "auth/wrong-password":
                        errorMessage = "Incorrect password. Please try again.";
                        break;
                    case "auth/user-disabled":
                        errorMessage = "This account has been disabled.";
                        break;
                    case "auth/too-many-requests":
                        errorMessage = "Too many failed attempts. Try again later.";
                        break;
                    case "auth/invalid-credentials":
                        errorMessage = "Password and Email are not recognised";
                        break;
                    default:
                        errorMessage = 'Password and Email are not recognised';
                }
            }

            return { success: false, message: errorMessage ?? "An unexpected error occurred. Please try again." };
        }
    };


    interface SignUpCredentials {
        email: string;
        password: string;
        displayName: string;
        referrerCode?: string;
        // displayName: string;
        // organisation: string;
    }

    const signUp = async (credentials: SignUpCredentials): Promise<void> => {
        try {
            // Validate referrer code if provided
            let referrerId = null;
            if (credentials.referrerCode && credentials.referrerCode.trim() !== '') {
                const referrerValidation = await validateReferrerCode(credentials.referrerCode);
                if (!referrerValidation.exists) {
                    ToastAndroid.show('Invalid referrer code. Please check the code or leave it blank.', ToastAndroid.LONG);
                    return;
                }
                referrerId = referrerValidation.referrerId;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            console.log("")
            setIsSignedIN(true);

            const user = userCredential.user;

            await updateProfile(user, {});
            const newUser = await setDocuments("personalData", {
                uid: user.uid,
                email: user.email,
                displayName: credentials.displayName,
                referrerId: referrerId,
                createdAt: Date.now().toString()
            });

            setIsSignedIN(true);
            await AsyncStorage.setItem('user', JSON.stringify({
                ...user,
                displayName: credentials.displayName,
                referrerId: referrerId,
            }));
            ToastAndroid.show('Account created successfully!', ToastAndroid.SHORT);

            router.push({ pathname: '/Account/Profile', params: { operation: 'create' }, });
        } catch (error) {
            ToastAndroid.show(`${error}`, ToastAndroid.LONG)
        }
    };

    const Logout = async () => {
        try {
            await signOut(auth);
            // Clear all AsyncStorage items
            await AsyncStorage.clear();
            // Reset role to general
            setCurrentRole('general');
            setUser(null);
            setIsSignedIN(false);
            setIsAppReady(true); // Set to true so app can proceed
            router.dismissAll(); // Use dismissAll instead of back to go to root
            ToastAndroid.show('logout successful', ToastAndroid.SHORT)
            return true; // Returns true if successful
        } catch (error) {
            ToastAndroid.show('logout unsuccessful', ToastAndroid.SHORT)
            console.error("Error during logout:", error);
            return false; // Returns false on failure
        }
    };

    // Function to update current user details in AsyncStorage
    const updateCurrentUser = async (userData: User) => {
        try {
            await AsyncStorage.setItem("currentUser", JSON.stringify(userData));
            console.log('Current user updated in AsyncStorage');
        } catch (error) {
            console.error('Error updating current user:', error);
        }
    };




    interface UpdateAccountCredentials {
        organization: string;
        photoURL: string | null;
    }

    interface UpdateAccountResponse {
        success: boolean;
        error?: string;
    }

    const updateAccount = async (credentials: User): Promise<UpdateAccountResponse> => {
        try {
            const currentUser = auth.currentUser;

            if (!isSignedIn || !currentUser) {
                return { success: false, error: "User not signed in." };
            }

            // 1. Update Firebase profile
            await updateProfile(currentUser, {
                displayName: credentials.organisation || credentials.displayName || "",
                photoURL: credentials.photoURL || null,
            });

            // 2. Send verification email
            if (!currentUser.emailVerified) {
                await sendEmailVerification(currentUser);
                alert("📧 Verification Email Sent. Please check your inbox.");
            }

            // 3. Combine user data
            const fullUser: User = {
                ...credentials,
                displayName: credentials.organisation,
                expoPushToken: credentials.expoPushToken || undefined,
            };

            // 4. Save to Firestore (or your DB)
            console.log('Saving to database:', fullUser);
            await setDocuments("personalData", fullUser);

            // 5. Set locally
            await AsyncStorage.setItem("user", JSON.stringify(fullUser));
            setUser(fullUser);
            setIsSignedIN(true);

            // 6. Also update the profile cache
            await AsyncStorage.setItem(`profile_${fullUser.uid}`, JSON.stringify(fullUser));

            // 7. Update the personalData cache
            await AsyncStorage.setItem(`personalData_${fullUser.uid}`, JSON.stringify(fullUser));

            // 7. Verify the data was saved by reading it back
            const savedData = await readById('personalData', fullUser.uid);
            console.log('Data saved to database:', savedData);

            // 8. Force a small delay to ensure state propagation
            await new Promise(resolve => setTimeout(resolve, 100));

            return { success: true };
        } catch (error) {
            console.log("Update Error >", error);
            return { error: (error as Error).message, success: false };
        }
    };

    const [showAlert, setshowAlert] = useState<ReactElement | null>(null);
    function alertBox(title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) {
        setshowAlert(
            <AlertComponent
                visible
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onBackPress={() => setshowAlert(null)}
            />
        )

    }

    return (
        <AuthContext.Provider value={{ signUp, Login, isSignedIn, user, setupUser, Logout, updateAccount, alertBox, currentRole, setCurrentRole, isAppReady, updateCurrentUser }}>
            {children}
            {showAlert}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { return useContext(AuthContext) }