import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { addDocument } from "@/db/operations";
import { useAuth } from "@/context/AuthContext";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
import { LocationPicker } from '@/components/LocationPicker';
import { SelectLocationProp } from '@/types/types';

interface FuelStationData {
    name: string;
    location: SelectLocationProp | null;
    fuelTypes: {
        diesel: { price: string; available: boolean };
        petrol: { price: string; available: boolean };
        premium: { price: string; available: boolean };
    };
    contactNumber: string;
    operatingHours: string;
    amenities: string[];
    description: string;
    addedBy: string;
    addedAt: Date;
    referrerId: string | null;
}

export default function AddFuel() {
    const { user } = useAuth();
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');

    // Form state
    const [name, setName] = useState('');
    const [location, setLocation] = useState<SelectLocationProp | null>(null);
    const [contactNumber, setContactNumber] = useState('');
    const [operatingHours, setOperatingHours] = useState('');
    const [description, setDescription] = useState('');

    // Fuel types and prices
    const [dieselPrice, setDieselPrice] = useState('');
    const [dieselAvailable, setDieselAvailable] = useState(true);
    const [petrolPrice, setPetrolPrice] = useState('');
    const [petrolAvailable, setPetrolAvailable] = useState(true);
    const [premiumPrice, setPremiumPrice] = useState('');
    const [premiumAvailable, setPremiumAvailable] = useState(true);

    // Amenities
    const [amenities, setAmenities] = useState<string[]>([]);
    const availableAmenities = [
        'Restroom', 'ATM', 'Car Wash', 'Air Pump', 'Snacks', 'Coffee', 'WiFi', 'Parking'
    ];

    // Location picker states
    const [dspLocation, setDspLocation] = useState(false);
    const [locationPicKERdSP, setPickLocationOnMap] = useState(false);

    // Loading state
    const [loading, setLoading] = useState(false);

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter fuel station name');
            return;
        }
        if (!location) {
            Alert.alert('Error', 'Please select fuel station location');
            return;
        }
        if (!contactNumber.trim()) {
            Alert.alert('Error', 'Please enter contact number');
            return;
        }

        setLoading(true);
        try {
            const fuelStationData: FuelStationData = {
                name: name.trim(),
                location,
                fuelTypes: {
                    diesel: { price: dieselPrice, available: dieselAvailable },
                    petrol: { price: petrolPrice, available: petrolAvailable },
                    premium: { price: premiumPrice, available: premiumAvailable }
                },
                contactNumber: contactNumber.trim(),
                operatingHours: operatingHours.trim(),
                amenities,
                description: description.trim(),
                addedBy: user?.uid || 'anonymous',
                addedAt: new Date(),
                // Referral system
                referrerId: user?.referrerId || null
            };

            await addDocument('FuelStations', fuelStationData);
            Alert.alert('Success', 'Fuel station added successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error adding fuel station:', error);
            Alert.alert('Error', 'Failed to add fuel station. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <Heading page="Add Fuel Station" />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Station Name */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>
                        Station Name <ThemedText color="red">*</ThemedText>
                    </ThemedText>
                    <Input
                        placeholder="Enter fuel station name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                </View>

                {/* Location Selection */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>
                        Location <ThemedText color="red">*</ThemedText>
                    </ThemedText>
                    <TouchableOpacity
                        onPress={() => setDspLocation(true)}
                        style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
                    >
                        <ThemedText
                            style={[
                                styles.locationButtonText,
                                { color: location ? icon : '#888' }
                            ]}
                        >
                            {location ? location.description : "Select Location"}
                        </ThemedText>
                        <Ionicons name="location-outline" size={wp(5)} color={accent} />
                    </TouchableOpacity>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>
                        Contact Number <ThemedText color="red">*</ThemedText>
                    </ThemedText>
                    <Input
                        placeholder="Enter contact number"
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.label}>Operating Hours</ThemedText>
                    <Input
                        placeholder="e.g., 24/7 or 6:00 AM - 10:00 PM"
                        value={operatingHours}
                        onChangeText={setOperatingHours}
                        style={styles.input}
                    />
                </View>

                <Divider style={styles.divider} />

                {/* Fuel Types and Prices */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Fuel Types & Prices</ThemedText>

                    {/* Diesel */}
                    <View style={styles.fuelTypeContainer}>
                        <View style={styles.fuelTypeHeader}>
                            <View style={styles.fuelTypeInfo}>
                                <Ionicons name="flash" size={wp(5)} color={accent} />
                                <ThemedText style={styles.fuelTypeName}>Diesel</ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDieselAvailable(!dieselAvailable)}
                                style={[
                                    styles.availabilityToggle,
                                    { backgroundColor: dieselAvailable ? accent : '#ccc' }
                                ]}
                            >
                                <ThemedText style={styles.availabilityText}>
                                    {dieselAvailable ? 'Available' : 'Unavailable'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                        {dieselAvailable && (
                            <Input
                                placeholder="Price per liter (e.g., $1.90)"
                                value={dieselPrice}
                                onChangeText={setDieselPrice}
                                keyboardType="decimal-pad"
                                style={styles.priceInput}
                            />
                        )}
                    </View>

                    {/* Petrol */}
                    <View style={styles.fuelTypeContainer}>
                        <View style={styles.fuelTypeHeader}>
                            <View style={styles.fuelTypeInfo}>
                                <Ionicons name="flash" size={wp(5)} color={accent} />
                                <ThemedText style={styles.fuelTypeName}>Petrol</ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setPetrolAvailable(!petrolAvailable)}
                                style={[
                                    styles.availabilityToggle,
                                    { backgroundColor: petrolAvailable ? accent : '#ccc' }
                                ]}
                            >
                                <ThemedText style={styles.availabilityText}>
                                    {petrolAvailable ? 'Available' : 'Unavailable'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                        {petrolAvailable && (
                            <Input
                                placeholder="Price per liter (e.g., $1.85)"
                                value={petrolPrice}
                                onChangeText={setPetrolPrice}
                                keyboardType="decimal-pad"
                                style={styles.priceInput}
                            />
                        )}
                    </View>

                    {/* Premium */}
                    <View style={styles.fuelTypeContainer}>
                        <View style={styles.fuelTypeHeader}>
                            <View style={styles.fuelTypeInfo}>
                                <Ionicons name="flash" size={wp(5)} color={accent} />
                                <ThemedText style={styles.fuelTypeName}>Premium</ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setPremiumAvailable(!premiumAvailable)}
                                style={[
                                    styles.availabilityToggle,
                                    { backgroundColor: premiumAvailable ? accent : '#ccc' }
                                ]}
                            >
                                <ThemedText style={styles.availabilityText}>
                                    {premiumAvailable ? 'Available' : 'Unavailable'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                        {premiumAvailable && (
                            <Input
                                placeholder="Price per liter (e.g., $2.10)"
                                value={premiumPrice}
                                onChangeText={setPremiumPrice}
                                keyboardType="decimal-pad"
                                style={styles.priceInput}
                            />
                        )}
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Amenities */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
                    <View style={styles.amenitiesGrid}>
                        {availableAmenities.map((amenity) => (
                            <TouchableOpacity
                                key={amenity}
                                onPress={() => toggleAmenity(amenity)}
                                style={[
                                    styles.amenityChip,
                                    {
                                        backgroundColor: amenities.includes(amenity) ? accent + '20' : backgroundLight,
                                        borderColor: amenities.includes(amenity) ? accent : icon + '30'
                                    }
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.amenityText,
                                        { color: amenities.includes(amenity) ? accent : icon }
                                    ]}
                                >
                                    {amenity}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* Description */}
                <View style={styles.section}>
                    <ThemedText style={styles.label}>Description</ThemedText>
                    <Input
                        placeholder="Additional information about the fuel station"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={[styles.input, styles.textArea]}
                    />
                </View>

                {/* Submit Button */}
                <View style={styles.submitContainer}>
                    <Button
                        title={loading ? "Adding..." : "Add Fuel Station"}
                        onPress={handleSubmit}
                        loading={loading}
                        style={[styles.submitButton, { backgroundColor: accent }]}
                    />
                </View>
            </ScrollView>

            {/* Location Selection Modals */}
                <GooglePlaceAutoCompleteComp
                    dspRoute={dspLocation}
                    setDspRoute={setDspLocation}
                    setRoute={setLocation}
                    topic="Select Fuel Station Location"
                    setPickLocationOnMap={setPickLocationOnMap}
                />

            {locationPicKERdSP && (
                    <LocationPicker
                        pickOriginLocation={location}
                        setPickOriginLocation={setLocation}
                        setShowMap={setPickLocationOnMap}
                        dspShowMap={locationPicKERdSP}
                        mode="single"
                    />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    section: {
        marginBottom: wp(4),
    },
    label: {
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: wp(2),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(3),
        color: '#333',
    },
    input: {
        marginBottom: wp(2),
    },
    textArea: {
        height: wp(20),
        textAlignVertical: 'top',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderWidth: 1,
        borderRadius: wp(2),
        marginBottom: wp(2),
    },
    locationButtonText: {
        flex: 1,
        fontSize: wp(4),
    },
    fuelTypeContainer: {
        marginBottom: wp(4),
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    fuelTypeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: wp(2),
    },
    fuelTypeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    fuelTypeName: {
        fontSize: wp(4),
        fontWeight: '600',
    },
    availabilityToggle: {
        paddingVertical: wp(1.5),
        paddingHorizontal: wp(3),
        borderRadius: wp(1.5),
    },
    availabilityText: {
        color: 'white',
        fontSize: wp(3.2),
        fontWeight: '600',
    },
    priceInput: {
        marginTop: wp(2),
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    amenityChip: {
        paddingVertical: wp(2),
        paddingHorizontal: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
    },
    amenityText: {
        fontSize: wp(3.5),
        fontWeight: '500',
    },
    divider: {
        marginVertical: wp(3),
    },
    submitContainer: {
        marginTop: wp(4),
        marginBottom: wp(6),
    },
    submitButton: {
        paddingVertical: wp(3),
        borderRadius: wp(2),
    },
});
