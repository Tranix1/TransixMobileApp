import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert, // Added Alert for the toast-like notification
    ToastAndroid,
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
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
    const [fullname, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referrerCode, setReferrerCode] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Default account selection
    const [selectedAccount, setSelectedAccount] = useState('tracking');

    const backgroundLight = useThemeColor('backgroundLight');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);

    // Function to handle account selection logic
  
  const handleAccountSelect = (type: string) => {
    //   if (type === 'fleet' || type === 'broker') {
    //       // Trigger the smooth native Android toast
    //       ToastAndroid.show(
    //           'This account type is currently under improvement.', 
    //           ToastAndroid.SHORT
    //       );
          
    //       // Force the selection back to tracking
    //       setSelectedAccount('tracking');
    //   } else {
    // }
    setSelectedAccount(type);
  };
    const onsubmit = async () => {
        if (!email || !password || !fullname) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!acceptTerms) {
            Alert.alert('Error', 'You must accept the terms and privacy policy');
            return;
        }

        try {
            setLoading(true);
            await signUp({
                email,
                password,
                referrerCode,
                // accountType: selectedAccount,
                displayName: fullname,
            });
            setLoading(false);
            
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Sign up failed', error.message);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView
                style={{ flex: 1 }}
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

                    {/* LOADING INDICATOR */}
                    {loading && (
                        <ActivityIndicator
                            color={accent}
                            style={{ marginBottom: hp(2) }}
                        />
                    )}
                    <ThemedText style={styles.label}>Full Name</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Full Name"
                        value={fullname}
                        onChangeText={setFullName}
                        keyboardType='email-address'
                    />

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

                   {selectedAccount === 'fleet' || selectedAccount === 'broker' ? (
                    <View > 
                        <ThemedText style={styles.label}>Referrer Code (Optional)</ThemedText>
                    <Input
                        containerStyles={styles.input}
                        placeholder="Enter referrer code"
                        value={referrerCode}
                        onChangeText={setReferrerCode}
                        autoCapitalize="characters"
                    />

                    </View>  ) : null}


                    {/* TERMS */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
                            {acceptTerms ? (
                                <EvilIcons name="check" size={30} style={styles.checkboxIcon} color={accent} />
                            ) : (
                                <Ionicons name="ellipse-outline" size={24} style={styles.checkboxIcon} color={icon} />
                            )}
                        </TouchableOpacity>
                        <ThemedText style={styles.checkboxText}>
                            I accept the terms and privacy policy
                        </ThemedText>
                    </View>

                    {/* SIGN UP BUTTON */}
                    <TouchableOpacity
                        onPress={onsubmit}
                        style={[styles.signUpButton, { backgroundColor: accent }]}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <ThemedText color='#fff' type='subtitle'>
                            {loading ? "Loading..." : "Create Account"}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* FOOTER */}
                    <TouchableOpacity
                        onPress={() => router.replace('/Account/Login')}
                        disabled={loading}
                    >
                        <ThemedText style={styles.footerText}>
                            Already have an account?{" "}
                            <ThemedText style={styles.loginLink}>Log in</ThemedText>
                        </ThemedText>
                    </TouchableOpacity>

                    <View style={{ height: hp(5) }} />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default Index;

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: wp(6), paddingBottom: hp(3) },
    logo: { width: wp(60), height: hp(10), alignSelf: 'center', marginTop: hp(6), marginBottom: hp(4) },
    headerContainer: { marginBottom: hp(3) },
    header: { fontSize: wp(7), fontWeight: '700' },
    subHeader: { marginTop: hp(0.8), fontSize: wp(3.8), lineHeight: 22 },
    accountContainer: { marginBottom: hp(3) },
    accountTitle: { marginBottom: hp(1.5), fontSize: wp(3.5), fontWeight: '600' },
    accountButtonsWrapper: { flexDirection: 'row', justifyContent: 'space-between', gap: wp(2.5) },
    accountButton: { flex: 1, paddingVertical: hp(1.8), borderRadius: wp(4), alignItems: 'center', justifyContent: 'center', gap: hp(0.7) },
    label: { fontSize: wp(3.6), fontWeight: '600', marginBottom: hp(0.8) },
    input: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: wp(4), paddingHorizontal: wp(4), marginBottom: hp(2) },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(3) },
    checkboxIcon: { textAlign: 'center', width: wp(7) },
    checkboxText: { marginLeft: wp(2), fontSize: wp(3.5), flexShrink: 1 },
    signUpButton: { paddingVertical: hp(2), borderRadius: wp(100), alignItems: 'center', marginBottom: hp(3), elevation: 3 },
    footerText: { textAlign: 'center' },
    loginLink: { fontWeight: '700', textDecorationLine: 'underline' },
});