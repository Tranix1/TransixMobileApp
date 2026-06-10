import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert, // Added Alert
    ToastAndroid 
} from 'react-native';
import Input from '@/components/Input';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import {
    MaterialCommunityIcons,
    FontAwesome5,
    Ionicons
} from '@expo/vector-icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState(false); // Fixed typo

    // Default Selected Account
    const [selectedAccount, setSelectedAccount] = useState('tracking');

    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    const { Login: loginUser } = useAuth();
    const auth = getAuth();

    // Unified account selection handler
    // const handleAccountSelect = (type: string) => {
    //     if (type === 'fleet' || type === 'broker') {
    //         Alert.alert(
    //             "Coming Soon",
    //             "The Fleet and Broker modules are currently being optimized. Please use the Tracking account for now.",
    //             [{ text: "OK", onPress: () => setSelectedAccount('tracking') }]
    //         );
    //     } else {
    //         setSelectedAccount(type);
    //     }
    // };



// ... inside your component

const handleAccountSelect = (type: string) => {
    setSelectedAccount(type);
};

    const onsubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setError(null);
        setLoading(true);

        const res = await loginUser({
            email,
            password,
            accountType: selectedAccount
        });

        if(selectedAccount === 'fleet' ) {
            router.replace('/Account/FleetSelector');
        } else {
            
        }

        setLoading(false);

        if (!res.success) {
            setError(res.message || "Login failed. Please try again.");
        }
    };

    const sendPasswordReset = async () => {
        if (email) {
            setLoading(true);
            try {
                await sendPasswordResetEmail(auth, email);
                setLoading(false);
                setResetPassword(false);
                Alert.alert('Success', 'A password reset link has been sent to your email.');
            } catch (err: any) {
                setLoading(false);
                setError(err.message);
            }
        } else {
            Alert.alert("Error", "Enter your email address to reset your password");
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* LOGO */}
                    <Image
                        contentFit='contain'
                        source={require('@/assets/trialogo.svg')}
                        style={styles.logo}
                    />

                    {/* HEADER */}
                    <View style={styles.headerContainer}>
                        <ThemedText type='title' style={styles.header}>
                            Welcome Back
                        </ThemedText>
                        <ThemedText style={styles.subHeader} color={coolGray}>
                            Login to continue using Transix
                        </ThemedText>
                    </View>

                    {/* ACCOUNT SELECTOR */}
                    <View style={styles.accountContainer}>
                        <ThemedText style={styles.accountTitle} color={coolGray}>
                            Select Account Type
                        </ThemedText>

                        <View style={styles.accountButtonsWrapper}>
                            {/* TRACKING */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => handleAccountSelect('tracking')}
                                style={[
                                    styles.accountButton,
                                    { backgroundColor: selectedAccount === 'tracking' ? accent : backgroundLight }
                                ]}
                            >
                                <Ionicons
                                    name="location"
                                    size={22}
                                    color={selectedAccount === 'tracking' ? '#fff' : icon}
                                />
                                <ThemedText style={{ color: selectedAccount === 'tracking' ? '#fff' : undefined }}>
                                    Tracking
                                </ThemedText>
                            </TouchableOpacity>

                            {/* FLEET */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => handleAccountSelect('fleet')}
                                style={[
                                    styles.accountButton,
                                    { backgroundColor: selectedAccount === 'fleet' ? accent : backgroundLight }
                                ]}
                            >
                                <FontAwesome5
                                    name="truck"
                                    size={18}
                                    color={selectedAccount === 'fleet' ? '#fff' : icon}
                                />
                                <ThemedText style={{ color: selectedAccount === 'fleet' ? '#fff' : undefined }}>
                                    Fleet
                                </ThemedText>
                            </TouchableOpacity>

                            {/* BROKER */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => handleAccountSelect('broker')}
                                style={[
                                    styles.accountButton,
                                    { backgroundColor: selectedAccount === 'broker' ? accent : backgroundLight }
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="briefcase-outline"
                                    size={22}
                                    color={selectedAccount === 'broker' ? '#fff' : icon}
                                />
                                <ThemedText style={{ color: selectedAccount === 'broker' ? '#fff' : undefined }}>
                                    Broker
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading && (
                        <ActivityIndicator color={accent} style={{ marginBottom: 15 }} />
                    )}

                    {error && (
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                    )}

                    {/* LOGIN FORM */}
                    {!resetPassword ? (
                        <View>
                            <ThemedText style={styles.label}>Email</ThemedText>
                            <Input
                                containerStyles={styles.input}
                                placeholder="Your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType='email-address'
                            />

                            <View style={styles.passwordHeader}>
                                <ThemedText style={styles.label}>Password</ThemedText>
                                <TouchableOpacity onPress={() => setResetPassword(true)}>
                                    <ThemedText style={styles.forgotPassword}>
                                        Forgot Password?
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            <Input
                                containerStyles={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                isPassword
                                onChangeText={setPassword}
                            />

                            <TouchableOpacity
                                onPress={onsubmit}
                                style={[styles.signUpButton, { backgroundColor: accent }]}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <ThemedText color='#fff' type='subtitle'>
                                    {loading ? "Loading..." : "Login"}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* RESET PASSWORD VIEW */
                        <View>
                            <ThemedText style={styles.resetText} color={coolGray}>
                                Enter a valid email to receive a password reset link.
                            </ThemedText>

                            <ThemedText style={styles.label}>Email</ThemedText>
                            <Input
                                containerStyles={styles.input}
                                placeholder="Your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType='email-address'
                            />

                            <TouchableOpacity
                                onPress={sendPasswordReset}
                                style={[styles.signUpButton, { backgroundColor: accent }]}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <ThemedText color='#fff' type='subtitle'>
                                    {loading ? "Loading..." : "Reset Password"}
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setResetPassword(false)}>
                                <ThemedText style={{ textAlign: 'center', color: accent, fontWeight: '600' }}>
                                    Back to Login
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* FOOTER */}
                    <TouchableOpacity
                        style={{ marginTop: hp(2) }}
                        onPress={() => router.replace('/Account/SignUp')}
                    >
                        <ThemedText style={styles.footerText}>
                            Do not have an Account?{" "}
                            <ThemedText style={styles.loginLink}>Sign Up</ThemedText>
                        </ThemedText>
                    </TouchableOpacity>
                </View>
                <View style={{ height: hp(25) }} /> 
            </ScrollView>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: wp(6), paddingBottom: hp(5) },
    logo: { width: wp(60), height: hp(10), alignSelf: 'center', marginTop: hp(6), marginBottom: hp(4) },
    headerContainer: { marginBottom: hp(3) },
    header: { fontSize: wp(7), fontWeight: '700' },
    subHeader: { marginTop: hp(0.8), fontSize: wp(3.8) },
    accountContainer: { marginBottom: hp(3) },
    accountTitle: { marginBottom: hp(1.5), fontSize: wp(3.5), fontWeight: '600' },
    accountButtonsWrapper: { flexDirection: 'row', justifyContent: 'space-between', gap: wp(2.5) },
    accountButton: { flex: 1, paddingVertical: hp(1.8), borderRadius: wp(4), alignItems: 'center', justifyContent: 'center', gap: hp(0.7) },
    errorText: { color: 'red', marginBottom: hp(2), textAlign: 'center' },
    label: { fontSize: wp(3.6), fontWeight: '600', marginBottom: hp(0.8) },
    input: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: wp(4), paddingHorizontal: wp(4), marginBottom: hp(2) },
    passwordHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
    forgotPassword: { color: '#007AFF', fontWeight: '500' },
    signUpButton: { paddingVertical: hp(2), borderRadius: wp(100), alignItems: 'center', marginTop: hp(1), marginBottom: hp(2), elevation: 3 },
    resetText: { marginBottom: hp(2), lineHeight: 22 },
    footerText: { textAlign: 'center', marginTop: hp(1) },
    loginLink: { fontWeight: '700', textDecorationLine: 'underline' },
});





