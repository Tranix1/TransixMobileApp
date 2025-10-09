import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { selectMultipleImages } from '@/Utilities/photoPickerUtils';
import { ImagePickerAsset } from 'expo-image-picker';
import { TruckStop, SelectLocationProp } from '@/types/types';
import { useAuth } from '@/context/AuthContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { router } from 'expo-router';
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
import { LocationPicker } from '@/components/LocationPicker';
import { addDocument } from '@/db/operations';

const AMENITIES = [
    'Parking', 'Fuel Station', 'Restaurant', 'Rest Area', 'Shower', 'WiFi',
    'ATM', 'Truck Wash', 'Mechanic', 'Tire Service', '24/7 Service'
];

const ENTERTAINMENT = [
    'TV Lounge', 'Pool Table', 'Arcade Games', 'Gym', 'Swimming Pool',
    'Bar', 'Live Music', 'Sports Viewing', 'Internet Cafe', 'Library'
];

export default function AddTruckStop() {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        parkingPrice: '',
        fuelPrice: '',
        foodPrice: '',
        restPrice: '',
        phone: '',
        email: '',
        openTime: '',
        closeTime: '',
        description: '',
    });

    const [location, setLocation] = useState<SelectLocationProp | null>(null);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [selectedEntertainment, setSelectedEntertainment] = useState<string[]>([]);
    const [truckStopImages, setTruckStopImages] = useState<ImagePickerAsset[]>([]);
    const [entertainmentImages, setEntertainmentImages] = useState<ImagePickerAsset[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Location picker states
    const [dspLocation, setDspLocation] = useState(false);
    const [locationPicKERdSP, setPickLocationOnMap] = useState(false);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleTruckStopImageSelection = () => {
        selectMultipleImages((selectedImages) => {
            if (truckStopImages.length + selectedImages.length > 3) {
                Alert.alert('Limit Reached', 'You can only select up to 3 images for truck stop facilities');
                return;
            }
            setTruckStopImages(prev => [...prev, ...selectedImages]);
        });
    };

    const handleEntertainmentImageSelection = () => {
        selectMultipleImages((selectedImages) => {
            if (entertainmentImages.length + selectedImages.length > 3) {
                Alert.alert('Limit Reached', 'You can only select up to 3 images for entertainment');
                return;
            }
            setEntertainmentImages(prev => [...prev, ...selectedImages]);
        });
    };

    const removeTruckStopImage = (index: number) => {
        setTruckStopImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeEntertainmentImage = (index: number) => {
        setEntertainmentImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const toggleEntertainment = (entertainment: string) => {
        setSelectedEntertainment(prev =>
            prev.includes(entertainment)
                ? prev.filter(e => e !== entertainment)
                : [...prev, entertainment]
        );
    };

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Required Fields', 'Please enter truck stop name');
            return;
        }
        if (!location) {
            Alert.alert('Required Fields', 'Please select a location');
            return;
        }

        if (truckStopImages.length === 0) {
            Alert.alert('Images Required', 'Please add at least one truck stop facility image');
            return;
        }

        setLoading(true);

        try {
            const truckStopData = {
                name: formData.name,
                location: location.city || location.description,
                city: location.city,
                country: location.country,
                address: location.description, // Use Google location description as address
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                pricing: {
                    parking: formData.parkingPrice,
                    fuel: formData.fuelPrice,
                    food: formData.foodPrice,
                    rest: formData.restPrice,
                },
                amenities: selectedAmenities,
                entertainment: selectedEntertainment,
                images: [...truckStopImages.map(img => img.uri), ...entertainmentImages.map(img => img.uri)],
                contact: {
                    phone: formData.phone,
                    email: formData.email,
                },
                operatingHours: {
                    open: formData.openTime,
                    close: formData.closeTime,
                    days: selectedDays,
                },
                description: formData.description,
                isVerified: false,
                userId: user?.uid || '',
                addedBy: user?.uid || 'anonymous',
                addedAt: new Date(),
            };

            // Save to Firebase
            const docId = await addDocument('TruckStops', truckStopData);
            console.log('Truck stop saved with ID:', docId);

            Alert.alert('Success', 'Truck stop added successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);
        } catch (error) {
            console.error('Error saving truck stop:', error);
            Alert.alert('Error', 'Failed to save truck stop. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            parkingPrice: '',
            fuelPrice: '',
            foodPrice: '',
            restPrice: '',
            phone: '',
            email: '',
            openTime: '',
            closeTime: '',
            description: '',
        });
        setLocation(null);
        setSelectedAmenities([]);
        setSelectedEntertainment([]);
        setTruckStopImages([]);
        setEntertainmentImages([]);
        setSelectedDays([]);
    };

    return (
        <ScreenWrapper>
            <Heading page='Add Truck Stop' />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Basic Information
                    </ThemedText>

                    <Input
                        value={formData.name}
                        placeholder="Truck Stop Name"
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    />

                    {/* Location Selection */}
                    <TouchableOpacity
                        style={[
                            styles.locationButton,
                            {
                                borderColor: location ? accent : icon + '40',
                                backgroundColor: location ? accent + '10' : backgroundLight
                            }
                        ]}
                        onPress={() => setDspLocation(true)}
                    >
                        <MaterialIcons name="location-on" size={wp(5)} color={location ? accent : icon + '60'} />
                        <View style={styles.locationTextContainer}>
                            <ThemedText style={[styles.locationText, { color: location ? icon : icon + '80' }]}>
                                {location ? location.description : 'Select Location'}
                            </ThemedText>
                            {location && (
                                <ThemedText style={[styles.locationSubText, { color: icon + '60' }]}>
                                    {location.city}, {location.country}
                                </ThemedText>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={wp(4)} color={icon} />
                    </TouchableOpacity>
                </View>

                {/* Pricing Information */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Pricing
                    </ThemedText>

                    <View style={styles.pricingGrid}>
                        <Input
                            value={formData.parkingPrice}
                            placeholder="Parking Price"
                            onChangeText={(text) => setFormData(prev => ({ ...prev, parkingPrice: text }))}
                            style={styles.pricingInput}
                        />
                        <Input
                            value={formData.fuelPrice}
                            placeholder="Fuel Price"
                            onChangeText={(text) => setFormData(prev => ({ ...prev, fuelPrice: text }))}
                            style={styles.pricingInput}
                        />
                        <Input
                            value={formData.foodPrice}
                            placeholder="Food Price"
                            onChangeText={(text) => setFormData(prev => ({ ...prev, foodPrice: text }))}
                            style={styles.pricingInput}
                        />
                        <Input
                            value={formData.restPrice}
                            placeholder="Rest Price"
                            onChangeText={(text) => setFormData(prev => ({ ...prev, restPrice: text }))}
                            style={styles.pricingInput}
                        />
                    </View>
                </View>

                {/* Truck Stop Facility Images */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Truck Stop Facility Images (Max 3)
                    </ThemedText>

                    <View style={styles.imageContainer}>
                        {truckStopImages.map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: image.uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={[styles.removeImageButton, { backgroundColor: accent }]}
                                    onPress={() => removeTruckStopImage(index)}
                                >
                                    <Ionicons name="close" size={wp(4)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {truckStopImages.length < 3 && (
                            <TouchableOpacity
                                style={[styles.addImageButton, { borderColor: accent }]}
                                onPress={handleTruckStopImageSelection}
                            >
                                <Ionicons name="camera" size={wp(6)} color={accent} />
                                <ThemedText style={[styles.addImageText, { color: accent }]}>
                                    Add Image
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Entertainment Images */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Entertainment Images (Max 3)
                    </ThemedText>

                    <View style={styles.imageContainer}>
                        {entertainmentImages.map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: image.uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={[styles.removeImageButton, { backgroundColor: accent }]}
                                    onPress={() => removeEntertainmentImage(index)}
                                >
                                    <Ionicons name="close" size={wp(4)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {entertainmentImages.length < 3 && (
                            <TouchableOpacity
                                style={[styles.addImageButton, { borderColor: accent }]}
                                onPress={handleEntertainmentImageSelection}
                            >
                                <Ionicons name="camera" size={wp(6)} color={accent} />
                                <ThemedText style={[styles.addImageText, { color: accent }]}>
                                    Add Image
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Amenities
                    </ThemedText>

                    <View style={styles.tagsContainer}>
                        {AMENITIES.map((amenity) => (
                            <TouchableOpacity
                                key={amenity}
                                style={[
                                    styles.tag,
                                    {
                                        backgroundColor: selectedAmenities.includes(amenity) ? accent : backgroundLight,
                                        borderColor: accent,
                                    }
                                ]}
                                onPress={() => toggleAmenity(amenity)}
                            >
                                <ThemedText
                                    style={[
                                        styles.tagText,
                                        { color: selectedAmenities.includes(amenity) ? '#fff' : icon }
                                    ]}
                                >
                                    {amenity}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Entertainment */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Entertainment
                    </ThemedText>

                    <View style={styles.tagsContainer}>
                        {ENTERTAINMENT.map((entertainment) => (
                            <TouchableOpacity
                                key={entertainment}
                                style={[
                                    styles.tag,
                                    {
                                        backgroundColor: selectedEntertainment.includes(entertainment) ? accent : backgroundLight,
                                        borderColor: accent,
                                    }
                                ]}
                                onPress={() => toggleEntertainment(entertainment)}
                            >
                                <ThemedText
                                    style={[
                                        styles.tagText,
                                        { color: selectedEntertainment.includes(entertainment) ? '#fff' : icon }
                                    ]}
                                >
                                    {entertainment}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Operating Hours */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Operating Hours
                    </ThemedText>

                    <View style={styles.timeRow}>
                        <View style={styles.timeInputContainer}>
                            <ThemedText style={[styles.timeLabel, { color: icon }]}>Open Time</ThemedText>
                            <Input
                                value={formData.openTime}
                                placeholder="06:00"
                                onChangeText={(text) => setFormData(prev => ({ ...prev, openTime: text }))}
                                style={styles.timeInput}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.timeInputContainer}>
                            <ThemedText style={[styles.timeLabel, { color: icon }]}>Close Time</ThemedText>
                            <Input
                                value={formData.closeTime}
                                placeholder="22:00"
                                onChangeText={(text) => setFormData(prev => ({ ...prev, closeTime: text }))}
                                style={styles.timeInput}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <ThemedText style={[styles.daysTitle, { color: icon }]}>Operating Days</ThemedText>
                    <View style={styles.daysContainer}>
                        {DAYS.slice(0, 4).map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayButton,
                                    {
                                        backgroundColor: selectedDays.includes(day) ? accent : backgroundLight,
                                        borderColor: accent,
                                    }
                                ]}
                                onPress={() => toggleDay(day)}
                            >
                                <ThemedText
                                    style={[
                                        styles.dayText,
                                        { color: selectedDays.includes(day) ? '#fff' : icon }
                                    ]}
                                >
                                    {day.slice(0, 3)}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.daysContainer}>
                        {DAYS.slice(4).map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayButton,
                                    {
                                        backgroundColor: selectedDays.includes(day) ? accent : backgroundLight,
                                        borderColor: accent,
                                    }
                                ]}
                                onPress={() => toggleDay(day)}
                            >
                                <ThemedText
                                    style={[
                                        styles.dayText,
                                        { color: selectedDays.includes(day) ? '#fff' : icon }
                                    ]}
                                >
                                    {day.slice(0, 3)}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Contact Information
                    </ThemedText>

                    <Input
                        value={formData.phone}
                        placeholder="Phone Number"
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                        keyboardType="phone-pad"
                    />

                    <Input
                        value={formData.email}
                        placeholder="Email Address"
                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                        keyboardType="email-address"
                    />
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: accent }]}>
                        Description
                    </ThemedText>

                    <Input
                        value={formData.description}
                        placeholder="Describe your truck stop..."
                        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        multiline
                        style={styles.descriptionInput}
                    />
                </View>

                {/* Submit Button */}
                <View style={styles.submitButtonContainer}>
                    <Button
                        onPress={handleSubmit}
                        title={loading ? "Adding Truck Stop..." : "Add Truck Stop"}
                        colors={{ bg: accent, text: '#fff' }}
                        style={styles.bigSubmitButton}
                        disabled={loading}
                    />
                </View>
            </ScrollView>

            {/* Location Selection Modals */}
            <GooglePlaceAutoCompleteComp
                dspRoute={dspLocation}
                setDspRoute={setDspLocation}
                setRoute={setLocation}
                topic="Select Truck Stop Location"
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
        padding: wp(4),
    },
    section: {
        marginBottom: wp(6),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(3),
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
        marginBottom: wp(3),
        gap: wp(2),
    },
    locationTextContainer: {
        flex: 1,
    },
    locationText: {
        fontSize: wp(4),
        fontWeight: '500',
    },
    locationSubText: {
        fontSize: wp(3),
        marginTop: wp(0.5),
    },
    pricingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    pricingInput: {
        width: '48%',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: wp(25),
        height: wp(20),
        borderRadius: wp(2),
    },
    removeImageButton: {
        position: 'absolute',
        top: -wp(2),
        right: -wp(2),
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImageButton: {
        width: wp(25),
        height: wp(20),
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(1),
    },
    addImageText: {
        fontSize: wp(3),
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    tag: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(5),
        borderWidth: 1,
    },
    tagText: {
        fontSize: wp(3.2),
    },
    timeRow: {
        flexDirection: 'row',
        gap: wp(3),
        marginBottom: wp(3),
    },
    timeInputContainer: {
        flex: 1,
    },
    timeLabel: {
        fontSize: wp(3.5),
        fontWeight: '500',
        marginBottom: wp(1),
    },
    timeInput: {
        flex: 1,
    },
    daysTitle: {
        fontSize: wp(3.5),
        fontWeight: '500',
        marginBottom: wp(2),
        marginTop: wp(2),
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
        marginTop: wp(2),
    },
    dayButton: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(5),
        borderWidth: 1,
    },
    dayText: {
        fontSize: wp(3.2),
    },
    descriptionInput: {
        minHeight: hp(10),
        textAlignVertical: 'top',
    },
    submitButtonContainer: {
        marginTop: wp(6),
        marginBottom: wp(10),
    },
    bigSubmitButton: {
        height: wp(12),
        borderRadius: wp(2),
    },
});
