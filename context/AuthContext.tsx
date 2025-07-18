import { auth } from "@/app/components/config/fireBase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile,sendEmailVerification } from "firebase/auth";
import { createContext, ReactElement, useContext, useState } from "react";
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
});

import { ReactNode } from "react";
import { addDocument, setDocuments, readById } from "@/db/operations";
import { User } from "@/types/types";
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";

export const AuthProvider = ({ children }: { children: ReactNode }) => {


    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIN] = useState(false);


    const setupUser = async (userData: any) => {
        if (userData) {
            console.log(user?.organisation)
            const aditional = await readById('personalData', userData.uid)
            setUser({ ...userData, ...aditional })
            setIsSignedIN(true);
            await AsyncStorage.setItem('user', JSON.stringify({
                ...userData,
            }))
            return;
        } else {

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
        message: string;
    }

    const Login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;

                if( auth.currentUser && auth.currentUser.emailVerified ){
                const user = userCredential.user;
                alert('Verification Email Sent \b Please Verify Your Email To Continue');
                    await  sendEmailVerification(user); 
                }

                
            const aditional = await readById('users', user.uid)
            setUser({ uid: user.uid, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber, photoURL: user.photoURL, ...aditional } as User);
            setIsSignedIN(true);
            await AsyncStorage.setItem("user", JSON.stringify({ ...user }));

            router.dismissAll();
            return { success: true, message: 'Login successful' };

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

            return { success: false, message: errorMessage ?? "An unexpected error occurred. Please try again." };
        }
    };


    interface SignUpCredentials {
        email: string;
        password: string;
        displayName: string;
        organisation: string;
    }

    const signUp = async (credentials: SignUpCredentials): Promise<void> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;
              await  sendEmailVerification(user); 

            // Update the user's profile with the display name
            await updateProfile(user, { displayName: credentials.displayName });
            const newUser = await setDocuments("personalData", {
                phoneNumber: null,
                photoURL: null,
                displayName: credentials.displayName,
                organisation: credentials.displayName,
                uid: user.uid,
                email: user.email,
            });

            setUser({ uid: user.uid, email: user.email, displayName: user.displayName, phoneNumber: user.phoneNumber, photoURL: user.photoURL, organisation: user.displayName } as User);

            setIsSignedIN(true);
            router.back();
            await AsyncStorage.setItem('user', JSON.stringify({
                ...user,
                displayName: credentials.displayName
            }));
        } catch (error) {
           ToastAndroid.show(`error logging in , ${error}`, ToastAndroid.LONG)
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
        organization: string;
        photoURL: string | null;
    }

    interface UpdateAccountResponse {
        success: boolean;
        error?: string;
    }

    const updateAccount = async (credentials: User): Promise<UpdateAccountResponse> => {
        try {
            if (!isSignedIn) {
                // router.push('/user/login')
                return { success: false };
            }

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: credentials.organization,
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
                await setDocuments("personalData", {
                    ...credentials,
                });
            }
            setupUser({ ...auth, ...credentials });
            return { success: true };
        } catch (error) {
            console.log("Update Error > ", error);
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
        <AuthContext.Provider value={{ signUp, Login, isSignedIn, user, setupUser, Logout, updateAccount, alertBox }}>
            {children}
            {showAlert}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { return useContext(AuthContext) }