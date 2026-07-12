import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import Input from '@/components/Input';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import {
    MaterialCommunityIcons,
    FontAwesome5,
    Ionicons,
} from '@expo/vector-icons';
import { AccountType } from '@/types/types';

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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetPassword, setResetPassword] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<AccountType>('tracking');

    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    const { Login: loginUser } = useAuth();
    const auth = getAuth();

    const handleAccountSelect = (type: AccountType) => setSelectedAccount(type);

    const onsubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await loginUser({ email, password, accountType: selectedAccount });
            if (!res.success) setError(res.message || 'Login failed. Please try again.');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const sendPasswordReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Enter your email address to reset your password');
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetPassword(false);
            Alert.alert('Success', 'A password reset link has been sent to your email.');
        } catch (err: any) {
            setError(err.message);
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

                    {!resetPassword ? (
                        <View>
                            <ThemedText style={styles.label}>Email</ThemedText>
                            <Input
                                containerStyles={styles.input}
                                placeholder="Your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <View style={styles.passwordHeader}>
                                <ThemedText style={styles.label}>Password</ThemedText>
                                <TouchableOpacity onPress={() => setResetPassword(true)} hitSlop={8}>
                                    <ThemedText style={styles.forgotPassword}>Forgot Password?</ThemedText>
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
                        </View>
                    ) : (
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
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                onPress={sendPasswordReset}
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
                                        Reset Password
                                    </ThemedText>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setResetPassword(false)} hitSlop={8}>
                                <ThemedText style={{ textAlign: 'center', color: accent, fontWeight: '600' }}>
                                    Back to Login
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
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
                <View style={{ height: hp(25) }} />
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
    resetText: { marginBottom: hp(2), lineHeight: 22 },
    footerText: { textAlign: 'center', marginTop: hp(1) },
    loginLink: { fontWeight: '700', textDecorationLine: 'underline' },
});