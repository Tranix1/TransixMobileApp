import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Input from '@/components/Input'
import Button from '@/components/Button'
import CheckBox from '@react-native-community/checkbox';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeContext } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')


    const { Login } = useAuth();

    const onsubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);
        setLoading(true);
        const res = await Login({ email, password });
        setLoading(false);
        if (!res.success) {
            setError(res.message || "Login failed. Please try again.");
        }

    }


    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Image contentFit='contain' source={require('@/assets/trialogo.svg')} style={styles.logo} />

                <ThemedText type='title' style={styles.header}>Login</ThemedText>

                {error && (
                    <ThemedText style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>
                        {error}
                    </ThemedText>
                )}

                <ThemedText style={styles.label}>Email</ThemedText>
                <Input
                    containerStyles={styles.input}
                    placeholder="Your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                />

                <ThemedText style={styles.label}>Password</ThemedText>
                <Input
                    containerStyles={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    isPassword
                    onChangeText={setPassword}
                />




                <TouchableOpacity onPress={() => onsubmit()} style={[styles.signUpButton, { backgroundColor: accent }]} disabled={loading}>
                    <ThemedText color='#fff' type='subtitle'>{loading ? "Loading..." : "Sign up"}</ThemedText>
                </TouchableOpacity>

                <ThemedText type='tiny' color={coolGray} style={styles.dividerText}>Or Register with</ThemedText>

                <View style={styles.socialContainer}>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: backgroundLight }]}><MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
                        <ThemedText>
                            Facebook
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: backgroundLight }]}><MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                        <ThemedText>
                            Google
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText style={styles.footerText}>
                    Do not have an Account?{' '}
                    <TouchableOpacity onPress={() => router.replace('/Account/SignUp')}>
                        <ThemedText style={styles.loginLink}>Sign in</ThemedText>
                    </TouchableOpacity>
                </ThemedText>
            </View>
        </ScreenWrapper>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    logo: {
        width: wp(60),
        height: hp(10),
        alignSelf: 'center',
        marginVertical: hp(8),
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'left',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkboxText: {
        marginLeft: 8,
        fontSize: 14,
        flexShrink: 1,
    },
    signUpButton: {
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 32,
        gap: wp(4)
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        padding: 12,
        borderRadius: 12,
        flex: 1
    },
    footerText: {
        textAlign: 'center',
    },
    loginLink: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
