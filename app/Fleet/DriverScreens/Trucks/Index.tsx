import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import { useAuthState } from '@/hooks/useAuthState';
import { router } from "expo-router";

function Trucks() {
    const background = useThemeColor("background");

    const {
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        updateUserProfile
    } = useAuthState();

    const { currentRole } = useAuth();

    const [dspCreateAcc, setDspCreateAcc] = React.useState(false);
    const [dspVerifyAcc, setDspVerifyAcc] = React.useState(false);
    const [dspMenu, setDspMenu] = React.useState(false);

    const checkAuth = (theAction?: () => void) => {
        if (!isAuthenticated) {
            setDspCreateAcc(true);
            return;
        }

        if (needsProfileSetup) {
            router.push({ pathname: '/Account/Profile', params: { operation: 'create' } });
            return;
        }

        if (needsEmailVerification) {
            setDspVerifyAcc(true);
            return;
        }

        // User is authenticated and verified
        if (typeof theAction === 'function') {
            theAction();
        } else {
            setDspMenu(true);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <CustomHeader onPressMenu={() => checkAuth()} currentRole={currentRole} pageTitle="Trucks" />

            <View style={styles.content}>
                <Text>Trucks</Text>
            </View>

            {/* Authentication Modals */}
            <AuthStatusModal
                visible={dspCreateAcc}
                onClose={() => setDspCreateAcc(false)}
                user={user}
                type="create"
            />

            <AuthStatusModal
                visible={dspVerifyAcc}
                onClose={() => setDspVerifyAcc(false)}
                user={user}
                type="verify"
            />

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />
        </View>
    );
}

export default Trucks;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});