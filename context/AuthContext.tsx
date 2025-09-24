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
});

import { ReactNode } from "react";
import { addDocument, setDocuments, readById } from "@/db/operations";
import { User } from "@/types/types";
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";

export const AuthProvider = ({ children }: { children: ReactNode }) => {


    const [user, setUser] = useState<User | null>(null);
    const [isSignedIn, setIsSignedIN] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const aditional = await readById('personalData', parsedUser.uid)
                setUser({ ...parsedUser, ...aditional });
                setIsSignedIN(true);
            }
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
            await AsyncStorage.setItem('user', JSON.stringify(fullUser))
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
        // displayName: string;
        // organisation: string;
    }

    const signUp = async (credentials: SignUpCredentials): Promise<void> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
            console.log("")
            setIsSignedIN(true);

            const user = userCredential.user;

            await updateProfile(user, {});
            const newUser = await setDocuments("personalData", {
                uid: user.uid,
                email: user.email,
                createdAt: Date.now().toString()
            });

            setIsSignedIN(true);
            await AsyncStorage.setItem('user', JSON.stringify({
                ...user,

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
            router.back();
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

            // 7. Verify the data was saved by reading it back
            const savedData = await readById('personalData', fullUser.uid);
            console.log('Data saved to database:', savedData);

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
        <AuthContext.Provider value={{ signUp, Login, isSignedIn, user, setupUser, Logout, updateAccount, alertBox }}>
            {children}
            {showAlert}
        </AuthContext.Provider>
    );
};

export const useAuth = () => { return useContext(AuthContext) }