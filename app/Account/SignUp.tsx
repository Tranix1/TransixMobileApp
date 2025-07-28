import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Input from '@/components/Input'
import Button from '@/components/Button'
import CheckBox from '@react-native-community/checkbox';
import { EvilIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeContext } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
    const [fullname, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const coolGray = useThemeColor('coolGray')


    const { signUp } = useAuth();

    const [loading, setLoading] = React.useState(false)
    const onsubmit = () => {
        setLoading(true)
        if (!email || !password) {
            alert('Please fill in all fields');
            setLoading(false)
            return;
        }

        if (!acceptTerms) {
            setLoading(true)
            alert('You must accept the terms and privacy policy');
            setLoading(false)
            return;
        }

        signUp({ displayName: fullname, email, password, })
            .then(() => {
                setLoading(false)
            })
            .catch((error) => {
                alert(`Sign up failed: ${error.message}`);
            });
    }
    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <Image contentFit='contain' source={require('@/assets/trialogo.svg')} style={styles.logo} />

                {loading && <ActivityIndicator color={accent} />}

                <ThemedText type='title' style={styles.header}>Create Account</ThemedText>
               
                <ThemedText style={styles.label}>Email</ThemedText>
                <Input
                    containerStyles={styles.input}
                    placeholder="Your email"
                    value={email}
                    onChangeText={setEmail}
                />

                <ThemedText style={styles.label}>Password</ThemedText>
                <Input
                    containerStyles={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    isPassword
                    onChangeText={setPassword}
                />


                <View style={styles.checkboxContainer}>
                    <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
                        {acceptTerms ?
                            <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={icon} />
                            :
                            <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={icon} />
                        }
                    </TouchableOpacity>
                    <ThemedText style={styles.checkboxText}>I accept the terms and privacy policy</ThemedText>
                </View>


                <TouchableOpacity onPress={() => onsubmit()} style={[styles.signUpButton, { backgroundColor: accent }]} disabled={loading}>
                    <ThemedText color='#fff' type='subtitle'>{loading ? "Loading..." : "Sign up"} </ThemedText>
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

                <TouchableOpacity onPress={() => router.replace('/Account/Login')} disabled={loading} >
                    <ThemedText style={styles.footerText}>
                        Already have an account?
                        <ThemedText style={styles.loginLink}>Log in</ThemedText>
                    </ThemedText>
                </TouchableOpacity>
                <View style={{ height: 70 }}>

                </View>
            </ScrollView>
        </ScreenWrapper>
    )
}

export default Index

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
