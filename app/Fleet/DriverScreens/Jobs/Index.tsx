import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import { useAuthState } from '@/hooks/useAuthState';
import { ThemedText } from '@/components/ThemedText';
import { router } from "expo-router";

function Jobs() {
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
            <CustomHeader onPressMenu={() => checkAuth()} currentRole={currentRole} />

            <View style={styles.content}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.statusButton}>
                        <ThemedText type="defaultSemiBold" color="text">Active</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statusButton}>
                        <ThemedText type="defaultSemiBold" color="text">Pending</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statusButton}>
                        <ThemedText type="defaultSemiBold" color="text">Completed</ThemedText>
                    </TouchableOpacity>
                </View>
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

export default Jobs;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        paddingTop: 40,
    },
    statusButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
});