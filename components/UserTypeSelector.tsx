import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from "@/constants/common";

interface UserTypeSelectorProps {
    userType: 'general' | 'professional' | null;
    setUserType: (type: 'general' | 'professional' | null) => void;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
    userType,
    setUserType
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');

    if (!userType) {
        return (
            <View style={[styles.container, { backgroundColor: backgroundLight }]}>
                <ThemedText style={styles.title}>Select User Type</ThemedText>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.userTypeButton, { backgroundColor: background }]}
                        onPress={() => setUserType('general')}
                    >
                        <Ionicons name="person-outline" size={20} color={accent} />
                        <ThemedText style={styles.buttonTitle}>General</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.userTypeButton, { backgroundColor: background }]}
                        onPress={() => setUserType('professional')}
                    >
                        <Ionicons name="business-outline" size={20} color={accent} />
                        <ThemedText style={styles.buttonTitle}>Professional</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.selectedContainer, { backgroundColor: backgroundLight }]}>
            <View style={styles.selectedContent}>
                <Ionicons
                    name={userType === 'general' ? "person" : "business"}
                    size={20}
                    color={accent}
                />
                <ThemedText style={styles.selectedText}>
                    {userType === 'general' ? 'General User' : 'Professional User'}
                </ThemedText>
            </View>
            <TouchableOpacity onPress={() => setUserType(null)}>
                <Ionicons name="close-circle" size={20} color={icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: wp(3),
        marginHorizontal: wp(4),
        marginVertical: wp(2),
        borderRadius: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: wp(3),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    userTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(2),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: wp(2),
    },
    selectedContainer: {
        padding: wp(3),
        marginHorizontal: wp(4),
        marginVertical: wp(1),
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectedContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedText: {
        marginLeft: wp(2),
        fontWeight: 'bold',
        fontSize: 14,
    },
});
