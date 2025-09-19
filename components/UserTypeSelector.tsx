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
                <ThemedText style={styles.title}>
                    How would you like to add your load?
                </ThemedText>

                <TouchableOpacity
                    style={[styles.userTypeButton, { backgroundColor: background }]}
                    onPress={() => setUserType('general')}
                >
                    <Ionicons name="person-outline" size={24} color={accent} />
                    <View style={styles.buttonContent}>
                        <ThemedText style={styles.buttonTitle}>General User</ThemedText>
                        <ThemedText style={styles.buttonSubtitle}>
                            I don't know much about trucks - use AI to help me
                        </ThemedText>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.userTypeButton, { backgroundColor: background }]}
                    onPress={() => setUserType('professional')}
                >
                    <Ionicons name="business-outline" size={24} color={accent} />
                    <View style={styles.buttonContent}>
                        <ThemedText style={styles.buttonTitle}>Professional</ThemedText>
                        <ThemedText style={styles.buttonSubtitle}>
                            I'm a load broker/consignee - I know the details
                        </ThemedText>
                    </View>
                </TouchableOpacity>
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
        padding: wp(4),
        margin: wp(4),
        borderRadius: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: wp(4),
    },
    userTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        marginVertical: wp(2),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonContent: {
        marginLeft: wp(3),
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonSubtitle: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    },
    selectedContainer: {
        padding: wp(4),
        margin: wp(4),
        borderRadius: 12,
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
    },
});
