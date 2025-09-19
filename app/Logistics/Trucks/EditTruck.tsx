import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ToastAndroid, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { wp,hp } from '@/constants/common';
import { Truck } from '@/types/types';
import { readById, updateDocument } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import Divider from '@/components/Divider';
import Button from '@/components/Button';


// Import utilities
import { organizeImagesByCategory, getImageFieldLabel } from '@/Utilities/imageEditingUtils';
import { selectImage } from '@/Utilities/imageUtils';

const EditTruck = () => {
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const background = useThemeColor("background");
    const backgroundLight = useThemeColor("backgroundLight");
    const coolGray = useThemeColor("coolGray");

    const { truckId } = useLocalSearchParams();
    const { user } = useAuth();

    const [truckData, setTruckData] = useState<Truck>({} as Truck);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Image editing state - simplified
    const [editingField, setEditingField] = useState<string | null>(null);

    const getTruckData = async () => {
        try {
            setLoading(true);
            if (!truckId) {
                Alert.alert('Error', 'No truck ID provided');
                router.back();
                return;
            }

            const truck = await readById('Trucks', truckId as string);
            if (truck) {
                setTruckData(truck as Truck);
            } else {
                Alert.alert('Error', 'Truck not found');
                router.back();
            }
        } catch (error) {
            console.error('Error fetching truck data:', error);
            Alert.alert('Error', 'Failed to load truck data');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleImagePress = (field: string) => {
        setEditingField(field);
        selectImage((image) => {
            // Update the truck data with new image
            setTruckData(prev => ({ ...prev, [field]: image.uri }));
            setEditingField(null);
            ToastAndroid.show('Image updated successfully', ToastAndroid.SHORT);
        });
    };

    const handleEditPress = (field: string) => {
        handleImagePress(field);
    };

    const handleConfirmEdit = () => {
        // Not used in simplified version
    };

    const handleCancelEdit = () => {
        setEditingField(null);
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            await updateDocument('Trucks', truckData.id, truckData);
            ToastAndroid.show('Truck updated successfully', ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.error('Error updating truck:', error);
            ToastAndroid.show('Failed to update truck', ToastAndroid.SHORT);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        Alert.alert(
            'Discard Changes',
            'Are you sure you want to discard all changes?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => router.back() }
            ]
        );
    };

    useEffect(() => {
        getTruckData();
    }, []);

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>Loading truck data...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!truckData.id) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>Truck not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    // Check if user is owner
    if (user?.uid !== truckData.userId) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>You don't have permission to edit this truck</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    // Organize images by category
    const imageCategories = organizeImagesByCategory(truckData);

    return (
        <ScreenWrapper>
            <Heading
                page="Edit Truck Images"
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        <TouchableOpacity onPress={handleDiscardChanges}>
                            <Ionicons name="close" size={wp(6)} color={icon} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                contentContainerStyle={{ paddingBottom: hp(6), marginHorizontal: wp(2) }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ marginBottom: wp(4) }}>
                    <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: wp(2) }}>
                        Tap and hold any image to replace it
                    </ThemedText>
                    <ThemedText type="tiny" style={{ textAlign: 'center', color: coolGray }}>
                        Images will be uploaded immediately when you confirm the change
                    </ThemedText>
                </View>

                {/* Truck Details Images */}
                {imageCategories.truck.length > 0 && (
                    <View style={{ marginBottom: wp(6) }}>
                        <ThemedText type="title" style={{
                            textAlign: 'center',
                            marginVertical: wp(4),
                            color: accent
                        }}>
                            Truck Details
                        </ThemedText>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: wp(2) }}
                        >
                            {imageCategories.truck.map((item, index) => (
                                <TouchableOpacity
                                    key={item.field}
                                    onPress={() => handleImagePress(item.field)}
                                    style={{ marginRight: wp(2), position: 'relative' }}
                                >
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={{
                                            height: wp(80),
                                            borderRadius: 10,
                                            width: wp(80),
                                            opacity: editingField === item.field ? 0.7 : 1
                                        }}
                                    />
                                    <View style={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        borderRadius: wp(4),
                                        padding: wp(1.5)
                                    }}>
                                        <Ionicons name="create-outline" size={wp(4)} color="white" />
                                    </View>
                                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1) }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Driver Details Images */}
                {imageCategories.driver.length > 0 && (
                    <View style={{ marginBottom: wp(6) }}>
                        <ThemedText type="title" style={{
                            textAlign: 'center',
                            marginVertical: wp(4),
                            color: accent
                        }}>
                            Driver Details
                        </ThemedText>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: wp(2) }}
                        >
                            {imageCategories.driver.map((item, index) => (
                                <TouchableOpacity
                                    key={item.field}
                                    onPress={() => handleImagePress(item.field)}
                                    style={{ marginRight: wp(2), position: 'relative' }}
                                >
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={{
                                            height: wp(80),
                                            borderRadius: 10,
                                            width: wp(80),
                                            opacity: editingField === item.field ? 0.7 : 1
                                        }}
                                    />
                                    <View style={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        borderRadius: wp(4),
                                        padding: wp(1.5)
                                    }}>
                                        <Ionicons name="create-outline" size={wp(4)} color="white" />
                                    </View>
                                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1) }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Additional Details Images */}
                {imageCategories.additional.length > 0 && (
                    <View style={{ marginBottom: wp(6) }}>
                        <ThemedText type="title" style={{
                            textAlign: 'center',
                            marginVertical: wp(4),
                            color: accent
                        }}>
                            Additional Details
                        </ThemedText>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: wp(2) }}
                        >
                            {imageCategories.additional.map((item, index) => (
                                <TouchableOpacity
                                    key={item.field}
                                    onPress={() => handleImagePress(item.field)}
                                    style={{ marginRight: wp(2), position: 'relative' }}
                                >
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={{
                                            height: wp(80),
                                            borderRadius: 10,
                                            width: wp(80),
                                            opacity: editingField === item.field ? 0.7 : 1
                                        }}
                                    />
                                    <View style={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                        borderRadius: wp(4),
                                        padding: wp(1.5)
                                    }}>
                                        <Ionicons name="create-outline" size={wp(4)} color="white" />
                                    </View>
                                    <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(1) }}>
                                        {item.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={{
                    flexDirection: 'row',
                    gap: wp(4),
                    marginTop: wp(6),
                    paddingHorizontal: wp(4)
                }}>
                    <Button
                        title="Discard Changes"
                        onPress={handleDiscardChanges}
                        style={{
                            flex: 1,
                            backgroundColor: coolGray,
                            borderWidth: 1,
                            borderColor: icon
                        }}
                        textStyle={{ color: icon }}
                    />
                    <Button
                        title={saving ? "Saving..." : "Save Changes"}
                        onPress={handleSaveChanges}
                        disabled={saving}
                        style={{ flex: 1 }}
                    />
                </View>

                {/* Instructions */}
                <View style={{
                    backgroundColor: backgroundLight,
                    padding: wp(4),
                    borderRadius: wp(4),
                    marginTop: wp(4),
                    marginHorizontal: wp(2)
                }}>
                    <ThemedText type="subtitle" style={{ marginBottom: wp(2) }}>
                        How to edit images:
                    </ThemedText>
                    <ThemedText type="tiny" style={{ marginBottom: wp(1) }}>
                        1. Tap and hold any image to start editing
                    </ThemedText>
                    <ThemedText type="tiny" style={{ marginBottom: wp(1) }}>
                        2. Select a new image from your gallery
                    </ThemedText>
                    <ThemedText type="tiny" style={{ marginBottom: wp(1) }}>
                        3. Tap the checkmark to confirm the change
                    </ThemedText>
                    <ThemedText type="tiny" style={{ marginBottom: wp(1) }}>
                        4. The image will be uploaded immediately
                    </ThemedText>
                    <ThemedText type="tiny">
                        5. Tap the X to cancel editing
                    </ThemedText>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default EditTruck;
