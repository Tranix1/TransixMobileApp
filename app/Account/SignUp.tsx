import React, { useState, useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert, Keyboard,
    ToastAndroid
} from 'react-native';
import Input from '@/components/Input';
import {
    EvilIcons,
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { AccountType } from '@/types/types';
import { router } from 'expo-router';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/db/fireBaseConfig';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRef } from "react";
import { firebaseConfig } from '@/db/fireBaseConfig';

import PhoneInput from '@/components/PhoneInput';
import { validateReferralCode } from '@/db/operations';


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

const Index = ({ setDspLoginOrSignup, setIsSigningUp }: any) => {
    const [fullname, setFullName] = useState('');
    const [referrerCode, setReferrerCode] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<AccountType>('tracking');
    const [loading, setLoading] = useState(false);

    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState({ id: 0, name: '' });

    const [verificationId, setVerificationId] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [referralValidation, setReferralValidation] = useState<any>(null);



    const recaptchaVerifier =
        useRef<FirebaseRecaptchaVerifierModal>(null);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
        });

        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const { signUp, } = useAuth();

    const handleAccountSelect = (type: AccountType) => setSelectedAccount(type);

    // const verificationId = await provider.verifyPhoneNumber(
    //     phoneNumber,
    // );



    const sendPhoneOTP = async () => {

        try {
            const length = phoneNumber.replace(/\D/g, "").length;

            if (!countryCode.name) {
                setError("Select a country code");
                return;
            }

            if (countryCode.name === "+267") {
                if (length !== 8) {
                    setError("Botswana phone number must be 8 digits");
                    return;
                }
            } else {
                if (length !== 9) {
                    setError("Phone number must be 9 digits");
                    return;
                }
            }

            if (selectedAccount !== "tracking" && !referrerCode) {
                setError("Referral code is required");
                return
            }

              if (!acceptTerms) {
            setError("You must accept the terms and privacy policy");
            return;
        }

            if (selectedAccount !== "tracking" && referrerCode) {
                const normalizedCode = referrerCode.trim().toUpperCase();

                const validation = await validateReferralCode(normalizedCode);

                if (!validation.exists) {
                    setError("Invalid referral code");
                    return;
                }

                setReferralValidation(validation);
            }

            setLoading(true)

            const provider = new PhoneAuthProvider(auth);

            const id = await provider.verifyPhoneNumber(
                `${countryCode.name}${phoneNumber}`,
                recaptchaVerifier.current!
            );

            setVerificationId(id);
            setOtpSent(true);
            setLoading(false)

        } catch (error: any) {
            console.error(error)
            ToastAndroid.show(
                error?.message || `${error}`,
                ToastAndroid.LONG
            );
            setLoading(false)

            return {
                success: false,
            };
        }
    };



    // const verifyOTP = async () => {
    //     try {

    //         const credential = PhoneAuthProvider.credential(
    //             verificationId,
    //             otp
    //         );

    //         const userCredential = await signInWithCredential(
    //             auth,
    //             credential
    //         );

    //         ToastAndroid.show(
    //             `Created ${userCredential.user.uid}`,
    //             ToastAndroid.LONG
    //         );

    //     } catch (error: any) {
    //         ToastAndroid.show(
    //             error?.message || `${error}`,
    //             ToastAndroid.LONG
    //         );
    //     }
    // };






    const onsubmit = async () => {
        if (!phoneNumber || !fullname) {
            setError("Please fill in all fields");
            return;
        }

      

        setError(null);

   

        try {
            setLoading(true);
            setIsSigningUp(true);

            const result = await signUp({
                phoneNumber:`${countryCode.name}${phoneNumber}` ,
                verificationId,
                otp,
                referrerCode,
                accountType: selectedAccount,
                displayName: fullname,
                referralValidation
            });

            if (result.success) {
                if (selectedAccount === "fleet") {
                    router.replace("/Fleet/CreateFleet");

                } else if (selectedAccount === "brokerage") {

                    router.replace("/brokerage/CreateBrokerage/Index");

                } else if (selectedAccount === "driver") {
                    router.replace("/Driver/Add/Index");

                }else{
                    router.push("/")
                }

            }

        } catch (err: any) {
            setError(err.message || "Signup failed. Please try again.");

        } finally {
            setLoading(false);
            setIsSigningUp(false);
        }
    };


    return (
        <ScreenWrapper>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* LOGO */}
                    <Image
                        contentFit="contain"
                        source={require('@/assets/trialogo.svg')}
                        style={styles.logo}
                    />

                    {/* HEADER */}
                    <View style={styles.headerContainer}>
                        <ThemedText type="title" style={styles.header}>
                            Create Account
                        </ThemedText>
                        <ThemedText style={styles.subHeader} color={coolGray}>
                            Join Transix and access smart transport solutions
                        </ThemedText>
                    </View>

                    {/* ACCOUNT SELECTION */}
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


                    <ThemedText style={styles.label}>Full Name</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Full Name"
                        value={fullname}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        editable={!otpSent}

                    />

                    <ThemedText style={styles.label}>Phone Number</ThemedText>

                    <PhoneInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        countryCode={countryCode}
                        setCountryCode={setCountryCode}
                        editable={otpSent}

                    />


                    {selectedAccount !== 'tracking' && (
                        <View>
                            <ThemedText style={styles.label}>Referral Code </ThemedText>
                            <Input
                                containerStyles={styles.input}
                                placeholder="Enter referrer code"
                                value={referrerCode}
                                onChangeText={setReferrerCode}
                                autoCapitalize="characters"
                                editable={!otpSent}

                            />
                        </View>
                    )}
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

                    {/* TERMS */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        activeOpacity={0.7}
                        onPress={() => setAcceptTerms(!acceptTerms)}
                    >
                        {acceptTerms ? (
                            <EvilIcons name="check" size={30} style={styles.checkboxIcon} color={accent} />
                        ) : (
                            <Ionicons name="ellipse-outline" size={24} style={styles.checkboxIcon} color={icon} />
                        )}
                        <ThemedText style={styles.checkboxText}>
                            I accept the terms and privacy policy
                        </ThemedText>
                    </TouchableOpacity>





                    {!otpSent && (
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
                    )}



                    {/* SIGN UP BUTTON */}
                    {otpSent && <TouchableOpacity
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
                                Create Account
                            </ThemedText>
                        )}
                    </TouchableOpacity>}

                    {/* FOOTER */}
                    <TouchableOpacity
                        onPress={() => setDspLoginOrSignup(true)}
                        disabled={loading}
                    >
                        <ThemedText style={styles.footerText}>
                            Already have an account?{' '}
                            <ThemedText style={styles.loginLink}>Log in</ThemedText>
                        </ThemedText>
                    </TouchableOpacity>

                    {!keyboardVisible && (
                        <View style={{ height: hp(18) }} />
                    )}
                    {keyboardVisible && (
                        <View style={{ height: hp(50) }} />
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default Index;

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: wp(4), paddingBottom: hp(3) },
    logo: { width: wp(60), height: hp(10), alignSelf: 'center', marginBottom: hp(2) },
    headerContainer: { marginBottom: hp(2) },
    header: { fontSize: wp(7), fontWeight: '700' },
    subHeader: { marginTop: hp(0.8), fontSize: wp(3.8), lineHeight: 22 },

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
        // borderColor: 'frgba(128,128,128,0.3)',
        borderRadius: wp(4),
        paddingHorizontal: wp(4),
        marginBottom: hp(2),
    },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(3) },
    checkboxIcon: { textAlign: 'center', width: wp(7) },
    checkboxText: { marginLeft: wp(2), fontSize: wp(3.5), flexShrink: 1 },

    signUpButton: {
        paddingVertical: hp(2),
        borderRadius: wp(100),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3),
        elevation: 3,
    },
    footerText: { textAlign: 'center' },
    loginLink: { fontWeight: '700', textDecorationLine: 'underline' },
    otpButton: {
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(4),

    },
});