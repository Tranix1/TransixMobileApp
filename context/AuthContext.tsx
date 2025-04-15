import { auth } from "@/app/components/config/fireBase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, UserInfo, UserMetadata } from "firebase/auth";
import { createContext, useContext, useState } from "react";
import { ToastAndroid } from "react-native";



const AuthContext = createContext({
    signUp: async (credentials: any) => { },
    Login: async (credentials: any) => ({ success: false }),
    isSignedIn: false,
    user: null as User | null,
    setupUser: async (userData: any) => { },
    Logout: async () => false,
    updateAccount: async (credentials: any) => ({ success: false }),
});

import { ReactNode } from "react";
import { addDocument, AddUser, readById } from "@/db/operations";
import { User } from "@/types/types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {


    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIN] = useState(false);


    const setupUser = async (userData: any) => {
        if (userData) {
            const aditional = await readById('users', userData.uid)
            setUser({ ...userData, ...aditional })
            setIsSignedIN(true);
            await AsyncStorage.setItem('user', JSON.stringify({
                ...userData,
            }))
            return;
        } else {
            console.log('logouuuuuuuuuuuuuuuut');

            setUser(null)
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
        message?: string;
    }

    const Login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;

            const aditional = await readById('users', user.uid)
            setUser({ uid: user.uid, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber, photoURL: user.photoURL, ...aditional } as User);
            setIsSignedIN(true);
            await AsyncStorage.setItem("user", JSON.stringify({ ...user }));

            router.back();
            return { success: true };

        } catch (error: any) {
            const errorCode = error.message.match(/\(([^)]+)\)/)?.[1];
            console.log(error);
            console.log(errorCode);

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

            return { success: false, message: errorMessage };
        }
    };


    interface SignUpCredentials {
        email: string;
        password: string;
        displayName: string;
    }

    const signUp = async (credentials: SignUpCredentials): Promise<void> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;

            // Update the user's profile with the display name
            await updateProfile(user, { displayName: credentials.displayName });
            const newUser = await AddUser(user.uid, {
                phoneNumber: null,
                photoURL: null,
                displayName: credentials.displayName,
                uid: user.uid,
                email: user.email,
            });

            setUser({ uid: user.uid, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber, photoURL: user.photoURL, } as User);

            setIsSignedIN(true);
            router.back();
            await AsyncStorage.setItem('user', JSON.stringify({
                ...user,
                displayName: credentials.displayName
            }));
        } catch (error) {
            console.log('error logging in ', error);
        }
    };

    const Logout = async () => {
        try {
            await signOut(auth);
            setupUser(null);
            ToastAndroid.show('logout successful', ToastAndroid.SHORT)
            return true; // Returns true if successful
        } catch (error) {
            ToastAndroid.show('logout unsuccessful', ToastAndroid.SHORT)
            console.error("Error during logout:", error);
            return false; // Returns false on failure
        }
    };




    interface UpdateAccountCredentials {
        displayName: string;
        photoURL: string | null;
    }

    interface UpdateAccountResponse {
        success: boolean;
        error?: string;
    }

    const updateAccount = async (credentials: UpdateAccountCredentials): Promise<UpdateAccountResponse> => {
        try {
            if (!isSignedIn) {
                // router.push('/user/login')
                return { success: false };
            }

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: credentials.displayName,
                    photoURL: credentials.photoURL,
                }).then(() => {
                    console.log('Updated User >> ', credentials);
                }).catch((error) => {
                    throw new Error(error);
                });
            } else {
                throw new Error("No authenticated user found.");
            }

            if (user) {
                await AddUser(user.uid, {
                    ...credentials,
                });
            }

            router.back();
            return { success: true };
        } catch (error) {
            console.log("Update Error > ", error);
            return { error: (error as Error).message, success: false };
        }
    };



    return (
        <AuthContext.Provider value={{ signUp, Login, isSignedIn, user, setupUser, Logout, updateAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { return useContext(AuthContext) }