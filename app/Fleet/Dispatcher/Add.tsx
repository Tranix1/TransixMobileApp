import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import Input from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import { addDocument } from '@/db/operations';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dispatcher specific permissions
const DISPATCHER_PERMISSIONS = [
    { id: 'create_loads', name: 'Create Loads', description: 'Can create new load requests' },
    { id: 'assign_trucks_drivers', name: 'Assign Trucks/Drivers', description: 'Can assign trucks and drivers to loads' },
    { id: 'view_linked_trucks_drivers', name: 'View Linked Trucks/Drivers', description: 'Can view trucks and drivers linked to them' },
    { id: 'track_vehicles', name: 'Track Vehicles', description: 'Can track vehicle locations' },
    { id: 'modify_load_details_before_accepted', name: 'Modify Load Details', description: 'Can modify load details before acceptance' }
];

export default function AddDispatcher() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const { user } = useAuth();

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentFleet, setCurrentFleet] = useState<any>(null);

    useEffect(() => {
        const getCurrentFleet = async () => {
            try {
                const fleetData = await AsyncStorage.getItem('currentRole');
                if (fleetData) {
                    const parsedFleet = JSON.parse(fleetData);
                    setCurrentFleet(parsedFleet);
                }
            } catch (error) {
                console.error('Error getting current fleet:', error);
            }
        };

        getCurrentFleet();
    }, []);

    const togglePermission = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleAddDispatcher = async () => {
        if (!user?.uid) {
            ToastAndroid.show('User not authenticated', ToastAndroid.SHORT);
            return;
        }

        if (!currentFleet?.fleetId) {
            ToastAndroid.show('No fleet selected', ToastAndroid.SHORT);
            return;
        }

        if (!fullName.trim() || !phoneNumber.trim() || selectedPermissions.length === 0) {
            ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            // Create dispatcher data
            const dispatcherData = {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                permissions: selectedPermissions,
                fleetId: currentFleet.fleetId,
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            // Add to Fleet collection under fleetId as subcollection
            const dispatcherId = await addDocument(`fleets/${currentFleet.fleetId}/Dispatchers`, dispatcherData);

            if (dispatcherId) {
                ToastAndroid.show('Dispatcher added successfully', ToastAndroid.SHORT);
                router.back();
            } else {
                ToastAndroid.show('Failed to add dispatcher', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error adding dispatcher:', error);
            ToastAndroid.show('Error adding dispatcher', ToastAndroid.SHORT);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScreenWrapper>
            <Heading page="Add Dispatcher" />
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: background }]}>
                <ThemedText type="title" style={styles.title}>
                    Add New Dispatcher
                </ThemedText>
                <ThemedText style={styles.description}>
                    Enter dispatcher details and select permissions.
                </ThemedText>

                <ThemedText>Full Name<ThemedText color="red">*</ThemedText></ThemedText>
                <Input
                    placeholder="Enter dispatcher's full name"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <ThemedText>Phone Number<ThemedText color="red">*</ThemedText></ThemedText>
                <Input
                    placeholder="Enter dispatcher's phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />

                <ThemedText>Permissions<ThemedText color="red">*</ThemedText></ThemedText>
                <View style={styles.permissionsContainer}>
                    {DISPATCHER_PERMISSIONS.map((permission) => (
                        <TouchableOpacity
                            key={permission.id}
                            style={[
                                styles.permissionItem,
                                { backgroundColor: backgroundLight },
                                selectedPermissions.includes(permission.id) && { backgroundColor: accent + '20' }
                            ]}
                            onPress={() => togglePermission(permission.id)}
                        >
                            <Ionicons
                                name={selectedPermissions.includes(permission.id) ? "checkbox" : "square-outline"}
                                size={wp(5)}
                                color={selectedPermissions.includes(permission.id) ? accent : icon}
                            />
                            <View style={styles.permissionText}>
                                <ThemedText style={styles.permissionName}>{permission.name}</ThemedText>
                                <ThemedText style={styles.permissionDesc}>{permission.description}</ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: accent }]}
                    onPress={handleAddDispatcher}
                    disabled={isSubmitting}
                >
                    <Ionicons name="add" size={wp(6)} color="white" />
                    <ThemedText style={styles.buttonText}>
                        {isSubmitting ? 'Adding...' : 'Add Dispatcher'}
                    </ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 30,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    permissionsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    permissionText: {
        flex: 1,
        marginLeft: 10,
    },
    permissionName: {
        fontSize: 16,
        fontWeight: '600',
    },
    permissionDesc: {
        fontSize: 14,
        opacity: 0.7,
    },
});