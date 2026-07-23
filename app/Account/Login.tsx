import React, { useState, useEffect, useRef } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Keyboard,
    ToastAndroid,
} from 'react-native';
import Input from '@/components/Input';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import {
    MaterialCommunityIcons,
    FontAwesome5,
    Ionicons,
    EvilIcons,
} from '@expo/vector-icons';
import { AccountType } from '@/types/types';
import { PhoneAuthProvider } from 'firebase/auth';
import { auth, firebaseConfig } from '@/db/fireBaseConfig';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import PhoneInput from '@/components/PhoneInput';
import { router } from 'expo-router';

const ACCOUNT_TYPES: {
    key: AccountType;
    label: string;
    icon: (color: string) => React.ReactNode;
}[] = [
    { key: 'tracking', label: 'Tracking', icon: (c) => <Ionicons name="location" size={20} color={c} /> },
    { key: 'fleet', label: 'Fleet', icon: (c) => <FontAwesome5 name="truck" size={17} color={c} /> },
    { key: 'driver', label: 'Driver', icon: (c) => <Ionicons name="person" size={20} color={c} /> },
    { key: 'brokerage', label: 'Broker', icon: (c) => <MaterialCommunityIcons name="briefcase-outline" size={20} color={c} /> },
];

const Login = ({ setDspLoginOrSignup }: any) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<AccountType>('tracking');

    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState({ id: 0, name: '' });

    const [verificationId, setVerificationId] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const { Login: loginUser } = useAuth();

    const handleAccountSelect = (type: AccountType) => setSelectedAccount(type);

    const sendPhoneOTP = async () => {
        try {
            const length = phoneNumber.replace(/\D/g, '').length;

            if (!countryCode.name) {
                setError('Select a country code');
                return;
            }

            if (countryCode.name === '+267') {
                if (length !== 8) {
                    setError('Botswana phone number must be 8 digits');
                    return;
                }
            } else {
                if (length !== 9) {
                    setError('Phone number must be 9 digits');
                    return;
                }
            }

            setError(null);
            setLoading(true);

            const provider = new PhoneAuthProvider(auth);

            const id = await provider.verifyPhoneNumber(
                `${countryCode.name}${phoneNumber}`,
                recaptchaVerifier.current!
            );

            setVerificationId(id);
            setOtpSent(true);
            setLoading(false);
        } catch (error: any) {
            console.error(error);
            ToastAndroid.show(
                error?.message || `${error}`,
                ToastAndroid.LONG
            );
            setLoading(false);
        }
    };

const onsubmit = async () => {
    if (!phoneNumber || !otp) {
        setError('Please fill in all fields');
        return;
    }

    setError(null);
    setLoading(true);

    try {
        const res = await loginUser({
            phoneNumber: `${countryCode.name}${phoneNumber}`,
            verificationId,
            otp,
            accountType: selectedAccount,
        });

        if (!res.success) {
            setError(res.message || 'Login failed. Please try again.');
            return;
        }

        

        if (res.currentRole?.userRole === "create_Acc") {
            if(res.currentRole.accType ==="fleet"){
                router.push("/Fleet/CreateFleet")
            }else if(res.currentRole.accType ==="brokerage"){
                router.push("/brokerage/CreateBrokerage/Index")
            }else if (res.currentRole.accType ==="driver"){
                router.push("/Driver/Add/Index")
            }else{
                router.push("/")
            }

            
        } else {
            router.replace('/');
        }
    } catch (err: any) {
        setError(err.message || 'Login failed. Please try again.');
    } finally {
        setLoading(false);
    }
};

    return (
        <ScreenWrapper>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Image
                        contentFit="contain"
                        source={require('@/assets/trialogo.svg')}
                        style={styles.logo}
                    />

                    <View style={styles.headerContainer}>
                        <ThemedText type="title" style={styles.header}>
                            Welcome Back
                        </ThemedText>
                        <ThemedText style={styles.subHeader} color={coolGray}>
                            Login to continue using Transix
                        </ThemedText>
                    </View>

                    {/* Account type selector */}
                    <View style={styles.accountContainer}>
                        <ThemedText style={styles.accountTitle} color={coolGray}>
                            Select Account Type
                        </ThemedText>

                        <View style={styles.accountGrid}>
                            {ACCOUNT_TYPES.map(({ key, label, icon: renderIcon }) => {
                                const selected = selectedAccount === key;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        activeOpacity={0.85}
                                        onPress={() => handleAccountSelect(key)}
                                        style={[
                                            styles.accountButton,
                                            {
                                                backgroundColor: selected ? accent : backgroundLight,
                                                borderColor: selected ? accent : 'rgba(128,128,128,0.25)',
                                                shadowOpacity: selected ? 0.15 : 0,
                                                elevation: selected ? 3 : 0,
                                            },
                                        ]}
                                    >
                                        {renderIcon(selected ? '#fff' : icon)}
                                        <ThemedText
                                            style={[
                                                styles.accountButtonLabel,
                                            ]}
                                        >
                                            {label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {error && (
                        <View style={styles.errorBanner}>
                            <Ionicons name="alert-circle" size={16} color="#D32F2F" style={{ marginRight: 6 }} />
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                        </View>
                    )}

                    <FirebaseRecaptchaVerifierModal
                        ref={recaptchaVerifier}
                        firebaseConfig={firebaseConfig}
                    />

                    <ThemedText style={styles.label}>Phone Number</ThemedText>

                    <PhoneInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        countryCode={countryCode}
                        setCountryCode={setCountryCode}
                        editable={otpSent}
                    />

                    {otpSent && (
                        <>
                            <ThemedText style={styles.label}>OTP Code</ThemedText>

                            <Input
                                placeholder="Enter OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                containerStyles={styles.input}
                            />
                        </>
                    )}

                    {!otpSent ? (
                        <TouchableOpacity
                            onPress={sendPhoneOTP}
                            disabled={loading}
                            activeOpacity={0.85}
                            style={[
                                styles.otpButton,
                                {
                                    borderColor: accent,
                                    opacity: loading ? 0.6 : 1,
                                },
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText color="#fff" type="subtitle">
                                    Send OTP
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={onsubmit}
                            style={[
                                styles.signUpButton,
                                { backgroundColor: accent, opacity: loading ? 0.6 : 1 },
                            ]}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText color="#fff" type="subtitle">
                                    Login
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}

                    {otpSent && (
                        <TouchableOpacity
                            onPress={() => {
                                setOtpSent(false);
                                setOtp('');
                                setVerificationId('');
                            }}
                            disabled={loading}
                            hitSlop={8}
                        >
                            <ThemedText style={{ textAlign: 'center', color: accent, fontWeight: '600', marginBottom: hp(2) }}>
                                Change phone number
                            </ThemedText>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={{ marginTop: hp(2) }}
                        onPress={() => setDspLoginOrSignup(false)}
                    >
                        <ThemedText style={styles.footerText}>
                            Do not have an Account?{' '}
                            <ThemedText style={styles.loginLink}>Sign Up</ThemedText>
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {!keyboardVisible && (
                    <View style={{ height: hp(8) }} />
                )}
                {keyboardVisible && (
                    <View style={{ height: hp(45) }} />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: wp(4), paddingBottom: hp(3) },
    logo: { width: wp(60), height: hp(10), alignSelf: 'center', marginTop: hp(2), marginBottom: hp(4) },
    headerContainer: { marginBottom: hp(3) },
    header: { fontSize: wp(7), fontWeight: '700' },
    subHeader: { marginTop: hp(0.8), fontSize: wp(3.8) },

    accountContainer: { marginBottom: hp(3) },
    accountTitle: { marginBottom: hp(1.5), fontSize: wp(3.5), fontWeight: '600' },
    accountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: hp(1.2),
    },
    accountButton: {
        width: '48.5%',
        flexDirection: 'row',
        paddingVertical: hp(1.6),
        borderRadius: wp(3.5),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    accountButtonLabel: { fontSize: wp(3.5) },

    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDECEA',
        borderRadius: wp(2.5),
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        marginBottom: hp(2),
    },
    errorText: { color: '#D32F2F', fontSize: wp(3.4), flex: 1 },

    label: { fontSize: wp(3.6), fontWeight: '600', marginBottom: hp(0.8) },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.3)',
        borderRadius: wp(4),
        paddingHorizontal: wp(4),
        marginBottom: hp(2),
    },
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgotPassword: { color: '#007AFF', fontWeight: '500' },
    signUpButton: {
        paddingVertical: hp(2),
        borderRadius: wp(100),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(1),
        marginBottom: hp(2),
        elevation: 3,
    },
    otpButton: {
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(2),
    },
    resetText: { marginBottom: hp(2), lineHeight: 22 },
    footerText: { textAlign: 'center', marginTop: hp(1) },
    loginLink: { fontWeight: '700', textDecorationLine: 'underline' },
});
