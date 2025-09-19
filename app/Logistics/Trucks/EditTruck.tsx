import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ToastAndroid, Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import { Truck, TruckTypeProps } from '@/types/types';
import { readById, updateDocument } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import Divider from '@/components/Divider';
import { SlctTruckCapacity } from '@/components/SelectTruckCapacity';
import { SpecifyTruckType } from '@/components/SelectTruckType';
import CountrySelector from '@/components/CountrySelector';

// Import utilities
import { organizeImagesByCategory } from '@/Utilities/imageEditingUtils';
import { selectImage } from '@/Utilities/imageUtils';

const EditTruck = () => {
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const coolGray = useThemeColor("coolGray");

    const { truckId } = useLocalSearchParams();
    const { user } = useAuth();

    const [editableTruckData, setEditableTruckData] = useState<Partial<Truck>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageUpdateCount, setImageUpdateCount] = useState(0); // Track image updates for re-rendering

    // State for dropdowns
    const [selectedTruckType, setSelectedTruckType] = useState<TruckTypeProps | null>(null);
    const [truckCapacity, setTruckCapacity] = useState("");
    const [tankerType, setTankerType] = useState("");
    const [operationCountries, setOperationCountries] = useState<string[]>([]);

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
                const truckData = truck as Truck;
                setEditableTruckData(truckData);
                setTruckCapacity(truckData.truckCapacity || "");
                setTankerType(truckData.tankerType || "");
                setOperationCountries(truckData.locations || []);
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

    const handleImagePress = (field: keyof Truck) => {
        selectImage((image) => {
            if (image.uri) {
                console.log(`Updating image for field: ${field}`, image.uri);
                // Update the state with the new image URI and increment update count
                setEditableTruckData(prev => ({
                    ...prev,
                    [field]: image.uri
                }));
                setImageUpdateCount(prev => prev + 1);
            }
        });
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            const updatedData = {
                ...editableTruckData,
                truckCapacity,
                tankerType,
                locations: operationCountries,
                truckType: selectedTruckType?.name || editableTruckData.truckType,
            };
            await updateDocument('Trucks', truckId as string, updatedData);
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
        router.back();
    };

    useEffect(() => {
        getTruckData();
    }, [truckId]);

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>Loading truck data...</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!editableTruckData.id) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>Truck not found</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    if (user?.uid !== editableTruckData.userId) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ThemedText>You don't have permission to edit this truck</ThemedText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Heading
                page="Edit Truck"
                rightComponent={
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleSaveChanges} disabled={saving}>
                            <Ionicons name="checkmark-circle" size={wp(8)} color={accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDiscardChanges}>
                            <Ionicons name="close-circle" size={wp(8)} color={coolGray} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <ThemedText type="title" style={styles.sectionTitle}>Truck Details</ThemedText>
                    <CountrySelector
                        operationCountries={operationCountries}
                        setOperationCountries={setOperationCountries}
                    />
                    <SlctTruckCapacity
                        truckTonnage={truckCapacity}
                        setTruckTonnage={setTruckCapacity}
                        selectedTruckType={selectedTruckType}
                    />
                    <SpecifyTruckType
                        selectedTruckType={selectedTruckType}
                        setSelectedTruckType={setSelectedTruckType}
                        tankerType={tankerType}
                        setTankerType={setTankerType}
                    />
                </View>

                <Divider />

                {Object.entries(organizeImagesByCategory(editableTruckData as Truck)).map(([category, images]) => (
                    images.length > 0 && (
                        <View key={category} style={styles.section}>
                            <ThemedText type="title" style={styles.sectionTitle}>
                                {category.charAt(0).toUpperCase() + category.slice(1)} Images
                            </ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.imageContainer}
                            >
                                {images.map((item) => (
                                    <TouchableOpacity
                                        key={item.field}
                                        onPress={() => handleImagePress(item.field as keyof Truck)}
                                        style={styles.imageWrapper}
                                    >
                                        <Image
                                            key={`${item.field}-${editableTruckData[item.field as keyof Truck]}-${imageUpdateCount}`} // Force re-render with field, URI, and update count
                                            source={{ uri: String(editableTruckData[item.field as keyof Truck] || '') }}
                                            style={styles.image}
                                            onError={() => console.log('Image load error for field:', item.field)}
                                            onLoad={() => console.log('Image loaded successfully for field:', item.field)}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.editIcon}>
                                            <Ionicons name="create-outline" size={wp(4)} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )
                ))}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerActions: { flexDirection: 'row', gap: wp(4), marginRight: wp(4) },
    container: { paddingBottom: hp(6), marginHorizontal: wp(2) },
    section: { marginBottom: wp(6) },
    sectionTitle: { textAlign: 'center', marginVertical: wp(4) },
    imageContainer: { paddingHorizontal: wp(2) },
    imageWrapper: { marginRight: wp(2), position: 'relative' },
    image: { height: wp(40), borderRadius: 10, width: wp(40) },
    editIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: wp(4),
        padding: wp(1.5)
    },
});

export default EditTruck;