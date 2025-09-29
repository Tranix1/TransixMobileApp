import React, { useState } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Pressable,
    StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import Input from './Input';
import Button from './Button';
import { GooglePlaceAutoCompleteComp } from './GooglePlaceAutoComplete';
import { LocationPicker } from './LocationPicker';
import { SelectLocationProp } from '@/types/types';

interface TruckAvailabilityModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (availabilityData: TruckAvailabilityData) => void;
    truckId: string;
}

export interface TruckAvailabilityData {
    loadType: 'city-to-city' | 'local' | 'any-load';
    origin: SelectLocationProp | null;
    destination: SelectLocationProp | null;
    flexibleRouting: boolean;
    localArea: SelectLocationProp | null;
    additionalInfo: string;
    isAvailable: boolean;
    distance: string;
    duration: string;
    durationInTraffic: string;
}

const TruckAvailabilityModal: React.FC<TruckAvailabilityModalProps> = ({
    visible,
    onClose,
    onSave,
    truckId,
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const coolGray = useThemeColor('coolGray');

    const [loadType, setLoadType] = useState<'city-to-city' | 'local' | 'any-load'>('city-to-city');
    const [origin, setOrigin] = useState<SelectLocationProp | null>(null);
    const [destination, setDestination] = useState<SelectLocationProp | null>(null);
    const [flexibleRouting, setFlexibleRouting] = useState(false);
    const [localArea, setLocalArea] = useState<SelectLocationProp | null>(null);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    // Location picker states
    const [dspFromLocation, setDspFromLocation] = useState(false);
    const [dspToLocation, setDspToLocation] = useState(false);
    const [dspLocalArea, setDspLocalArea] = useState(false);
    const [locationPicKERdSP, setPickLocationOnMap] = useState(false);

    // Route calculation states
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [durationInTraffic, setDurationInTraffic] = useState('');

    const apiKey = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";

    // Calculate route when origin and destination are selected
    React.useEffect(() => {
        if (!origin || !destination || loadType === 'local') return;

        async function fetchDirections() {
            try {
                const fromLocation = `${origin?.latitude},${origin?.longitude}`;
                const toLocation = `${destination?.latitude},${destination?.longitude}`;

                const res = await fetch(
                    `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation}&destination=${toLocation}&departure_time=now&key=${apiKey}`
                );
                const data = await res.json();

                if (data.status === "OK" && data.routes.length > 0) {
                    const route = data.routes[0];
                    const leg = route.legs[0];

                    setDistance(leg.distance.text);
                    setDuration(leg.duration.text);

                    if (leg.duration_in_traffic) {
                        setDurationInTraffic(leg.duration_in_traffic.text);
                    }
                } else {
                    console.warn("No route found:", data.status);
                }
            } catch (err) {
                console.error("Directions API error:", err);
            }
        }

        fetchDirections();
    }, [origin, destination, loadType]);

    const handleSave = () => {
        const availabilityData: TruckAvailabilityData = {
            loadType,
            origin: loadType === 'city-to-city' || loadType === 'any-load' ? origin : null,
            destination: loadType === 'city-to-city' || loadType === 'any-load' ? destination : null,
            flexibleRouting: loadType === 'any-load' ? flexibleRouting : false,
            localArea: loadType === 'local' ? localArea : null,
            additionalInfo,
            isAvailable,
            distance: distance || '',
            duration: duration || '',
            durationInTraffic: durationInTraffic || '',
        };

        onSave(availabilityData);
        onClose();
    };

    const resetForm = () => {
        setLoadType('city-to-city');
        setOrigin(null);
        setDestination(null);
        setFlexibleRouting(false);
        setLocalArea(null);
        setAdditionalInfo('');
        setIsAvailable(true);
        setDistance('');
        setDuration('');
        setDurationInTraffic('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const loadTypeOptions = [
        {
            id: 'city-to-city',
            title: 'City to City',
            description: 'Specific route (e.g., Harare to Bulawayo)',
            icon: 'location-outline',
        },
        {
            id: 'local',
            title: 'Local Loads',
            description: 'Within city/region (e.g., Harare only)',
            icon: 'home-outline',
        },
        {
            id: 'any-load',
            title: 'Any Load',
            description: 'Flexible routing with drop-off options',
            icon: 'swap-horizontal-outline',
        },
    ];

    return (
        <Modal transparent statusBarTranslucent visible={visible} animationType="fade">
            <Pressable onPress={handleClose} style={styles.modalOverlay}>
                <BlurView intensity={100} style={styles.blurContainer}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modalContent, { backgroundColor: backgroundLight }]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <ThemedText type="title" style={styles.title}>
                                    Truck Availability
                                </ThemedText>
                                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                    <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                                {/* Availability Toggle */}
                                <View style={styles.section}>
                                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                                        Availability Status
                                    </ThemedText>
                                    <View style={styles.toggleContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleOption,
                                                { backgroundColor: isAvailable ? accent : coolGray },
                                            ]}
                                            onPress={() => setIsAvailable(true)}
                                        >
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={wp(5)}
                                                color="white"
                                            />
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                                Available
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.toggleOption,
                                                { backgroundColor: !isAvailable ? '#FF5252' : coolGray },
                                            ]}
                                            onPress={() => setIsAvailable(false)}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={wp(5)}
                                                color="white"
                                            />
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                                                Not Available
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {isAvailable && (
                                    <>
                                        {/* Load Type Selection */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Load Type Preference
                                            </ThemedText>
                                            <View style={styles.loadTypeContainer}>
                                                {loadTypeOptions.map((option) => (
                                                    <TouchableOpacity
                                                        key={option.id}
                                                        style={[
                                                            styles.loadTypeOption,
                                                            {
                                                                backgroundColor: loadType === option.id ? accent : background,
                                                                borderColor: loadType === option.id ? accent : coolGray,
                                                            },
                                                        ]}
                                                        onPress={() => setLoadType(option.id as any)}
                                                    >
                                                        <Ionicons
                                                            name={option.icon as any}
                                                            size={wp(6)}
                                                            color={loadType === option.id ? 'white' : icon}
                                                        />
                                                        <View style={styles.loadTypeText}>
                                                            <ThemedText
                                                                style={[
                                                                    styles.loadTypeTitle,
                                                                    { color: loadType === option.id ? 'white' : icon },
                                                                ]}
                                                            >
                                                                {option.title}
                                                            </ThemedText>
                                                            <ThemedText
                                                                style={[
                                                                    styles.loadTypeDescription,
                                                                    { color: loadType === option.id ? 'white' : coolGray },
                                                                ]}
                                                            >
                                                                {option.description}
                                                            </ThemedText>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Location Inputs based on Load Type */}
                                        {loadType === 'city-to-city' && (
                                            <View style={styles.section}>
                                                <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                    Route Details
                                                </ThemedText>
                                                <View style={styles.locationContainer}>
                                                    <View style={styles.locationInput}>
                                                        <ThemedText type="tiny" style={styles.inputLabel}>
                                                            From (Origin)
                                                        </ThemedText>
                                                        <TouchableOpacity
                                                            onPress={() => setDspFromLocation(true)}
                                                            style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
                                                        >
                                                            <ThemedText
                                                                style={[
                                                                    styles.locationButtonText,
                                                                    { color: origin ? icon : '#888' }
                                                                ]}
                                                            >
                                                                {origin ? origin?.description : "Select Origin"}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.locationInput}>
                                                        <ThemedText type="tiny" style={styles.inputLabel}>
                                                            To (Destination)
                                                        </ThemedText>
                                                        <TouchableOpacity
                                                            onPress={() => setDspToLocation(true)}
                                                            style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
                                                        >
                                                            <ThemedText
                                                                style={[
                                                                    styles.locationButtonText,
                                                                    { color: destination ? icon : '#888' }
                                                                ]}
                                                            >
                                                                {destination ? destination?.description : "Select Destination"}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* Route Information */}
                                                    {distance && duration && (
                                                        <View style={[styles.routeInfo, { backgroundColor: backgroundLight }]}>
                                                            <ThemedText style={styles.infoText}>Distance: {distance}</ThemedText>
                                                            <ThemedText style={styles.infoText}>Duration: {duration}</ThemedText>
                                                            {durationInTraffic && (
                                                                <ThemedText style={styles.infoText}>Duration in Traffic: {durationInTraffic}</ThemedText>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        )}

                                        {loadType === 'local' && (
                                            <View style={styles.section}>
                                                <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                    Local Area
                                                </ThemedText>
                                                <View style={styles.locationInput}>
                                                    <ThemedText type="tiny" style={styles.inputLabel}>
                                                        Operating Area
                                                    </ThemedText>
                                                    <TouchableOpacity
                                                        onPress={() => setDspLocalArea(true)}
                                                        style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
                                                    >
                                                        <ThemedText
                                                            style={[
                                                                styles.locationButtonText,
                                                                { color: localArea ? icon : '#888' }
                                                            ]}
                                                        >
                                                            {localArea ? localArea?.description : "Select Operating Area"}
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {loadType === 'any-load' && (
                                            <View style={styles.section}>
                                                <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                    Flexible Routing
                                                </ThemedText>
                                                <View style={styles.locationContainer}>
                                                    <View style={styles.locationInput}>
                                                        <ThemedText type="tiny" style={styles.inputLabel}>
                                                            Starting Location
                                                        </ThemedText>
                                                        <TouchableOpacity
                                                            onPress={() => setDspFromLocation(true)}
                                                            style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
                                                        >
                                                            <ThemedText
                                                                style={[
                                                                    styles.locationButtonText,
                                                                    { color: origin ? icon : '#888' }
                                                                ]}
                                                            >
                                                                {origin ? origin?.description : "Select Starting Location"}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.locationInput}>
                                                        <ThemedText type="tiny" style={styles.inputLabel}>
                                                            Preferred Destination
                                                        </ThemedText>
                                                        <TouchableOpacity
                                                            onPress={() => setDspToLocation(true)}
                                                            style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
                                                        >
                                                            <ThemedText
                                                                style={[
                                                                    styles.locationButtonText,
                                                                    { color: destination ? icon : '#888' }
                                                                ]}
                                                            >
                                                                {destination ? destination?.description : "Select Preferred Destination (Optional)"}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* Route Information for any-load */}
                                                    {distance && duration && (
                                                        <View style={[styles.routeInfo, { backgroundColor: backgroundLight }]}>
                                                            <ThemedText style={styles.infoText}>Distance: {distance}</ThemedText>
                                                            <ThemedText style={styles.infoText}>Duration: {duration}</ThemedText>
                                                            {durationInTraffic && (
                                                                <ThemedText style={styles.infoText}>Duration in Traffic: {durationInTraffic}</ThemedText>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={styles.checkboxContainer}>
                                                    <TouchableOpacity
                                                        style={styles.checkbox}
                                                        onPress={() => setFlexibleRouting(!flexibleRouting)}
                                                    >
                                                        <Ionicons
                                                            name={flexibleRouting ? 'checkbox' : 'square-outline'}
                                                            size={wp(5)}
                                                            color={flexibleRouting ? accent : icon}
                                                        />
                                                        <ThemedText style={styles.checkboxText}>
                                                            Accept any load along the way (e.g., drop off in Norton, continue to Bulawayo)
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {/* Additional Information */}
                                        <View style={styles.section}>
                                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                                Additional Information
                                            </ThemedText>
                                            <Input
                                                placeholder="Any special requirements or notes..."
                                                value={additionalInfo}
                                                onChangeText={setAdditionalInfo}
                                                multiline
                                                numberOfLines={3}
                                                style={styles.textArea}
                                            />
                                        </View>
                                    </>
                                )}

                                {/* Action Buttons */}
                                <View style={styles.buttonContainer}>
                                    <Button
                                        title="Cancel"
                                        onPress={handleClose}
                                        style={[styles.button, styles.cancelButton]}
                                        textStyle={styles.cancelButtonText}
                                    />
                                    <Button
                                        title={isAvailable ? "Set Available" : "Set Unavailable"}
                                        onPress={handleSave}
                                        style={[styles.button, styles.saveButton]}
                                        textStyle={styles.saveButtonText}
                                    />
                                </View>
                            </ScrollView>
                        </View>
                    </Pressable>
                </BlurView>
            </Pressable>

            {/* Google Places Autocomplete Components */}
            <GooglePlaceAutoCompleteComp
                dspRoute={dspFromLocation}
                setDspRoute={setDspFromLocation}
                setRoute={setOrigin}
                topic="Select Origin"
                setPickLocationOnMap={setPickLocationOnMap}
            />

            <GooglePlaceAutoCompleteComp
                dspRoute={dspToLocation}
                setDspRoute={setDspToLocation}
                setRoute={setDestination}
                topic="Select Destination"
                setPickLocationOnMap={setPickLocationOnMap}
            />

            <GooglePlaceAutoCompleteComp
                dspRoute={dspLocalArea}
                setDspRoute={setDspLocalArea}
                setRoute={setLocalArea}
                topic="Select Local Area"
                setPickLocationOnMap={setPickLocationOnMap}
            />

            {/* Location Picker Map */}
            {locationPicKERdSP && (
                <LocationPicker
                    pickOriginLocation={origin}
                    setPickOriginLocation={setOrigin}
                    pickDestinationLoc={destination}
                    setPickDestinationLoc={setDestination}
                    setShowMap={setPickLocationOnMap}
                    dspShowMap={locationPicKERdSP}
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: wp(90),
        maxHeight: hp(80),
        borderRadius: wp(4),
        padding: wp(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(4),
    },
    title: {
        textAlign: 'center',
        flex: 1,
    },
    closeButton: {
        padding: wp(1),
    },
    scrollView: {
        maxHeight: hp(60),
    },
    section: {
        marginBottom: wp(4),
    },
    sectionTitle: {
        marginBottom: wp(3),
        fontWeight: 'bold',
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: wp(3),
    },
    toggleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        gap: wp(2),
    },
    loadTypeContainer: {
        gap: wp(3),
    },
    loadTypeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        gap: wp(3),
    },
    loadTypeText: {
        flex: 1,
    },
    loadTypeTitle: {
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    loadTypeDescription: {
        fontSize: wp(3.5),
    },
    locationContainer: {
        gap: wp(3),
    },
    locationInput: {
        gap: wp(1),
    },
    inputLabel: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    checkboxContainer: {
        marginTop: wp(3),
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: wp(2),
    },
    checkboxText: {
        flex: 1,
        lineHeight: wp(4),
    },
    textArea: {
        minHeight: wp(20),
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: wp(4),
    },
    button: {
        flex: 1,
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
    },
    saveButton: {
        backgroundColor: '#007bff',
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    locationButton: {
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderWidth: 1,
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationButtonText: {
        fontSize: wp(4),
    },
    routeInfo: {
        padding: wp(4),
        borderRadius: wp(2),
        marginTop: wp(3),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    infoText: {
        fontSize: wp(3.5),
        fontWeight: "500",
        marginBottom: wp(1),
    },
});

export default TruckAvailabilityModal;
