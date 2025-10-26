import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from "@/constants/common";
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
import { LocationPicker } from '@/components/LocationPicker';
import { SelectLocationProp } from '@/types/types';
import { Ionicons } from "@expo/vector-icons";

interface LocationSelectorProps {
    origin: SelectLocationProp | null;
    destination: SelectLocationProp | null;
    setOrigin: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
    setDestination: React.Dispatch<React.SetStateAction<SelectLocationProp | null>>;
    dspFromLocation: boolean;
    setDspFromLocation: React.Dispatch<React.SetStateAction<boolean>>;
    dspToLocation: boolean;
    setDspToLocation: React.Dispatch<React.SetStateAction<boolean>>;
    locationPicKERdSP: boolean;
    setPickLocationOnMap: React.Dispatch<React.SetStateAction<boolean>>;
    distance?: string;
    duration?: string;
    durationInTraffic?: string;
    iconColor?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    origin,
    destination,
    setOrigin,
    setDestination,
    dspFromLocation,
    setDspFromLocation,
    dspToLocation,
    setDspToLocation,
    locationPicKERdSP,
    setPickLocationOnMap,
    distance,
    duration,
    durationInTraffic,
    iconColor
}) => {
    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');

    return (
        <View>
            <ThemedText>
                Origin Location<ThemedText color="red">*</ThemedText>
            </ThemedText>

            {distance && duration && (
                <View style={[styles.routeInfo, { backgroundColor: backgroundLight }]}>
                    <ThemedText style={styles.infoText}>Distance: {distance}</ThemedText>
                    <ThemedText style={styles.infoText}>Duration: {duration}</ThemedText>
                    {durationInTraffic && (
                        <ThemedText style={styles.infoText}>Duration in Traffic: {durationInTraffic}</ThemedText>
                    )}
                </View>
            )}

            <TouchableOpacity
                onPress={() => setDspFromLocation(true)}
                style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
            >
                <View style={styles.locationButtonContent}>
                    <Ionicons
                        name="location"
                        size={20}
                        color={iconColor || accent}
                        style={styles.locationIcon}
                    />
                    <ThemedText
                        style={[
                            styles.locationButtonText,
                            { color: origin ? icon : '#888' }
                        ]}
                    >
                        {origin ? origin?.description : "Select Origin"}
                    </ThemedText>
                </View>
            </TouchableOpacity>

            <GooglePlaceAutoCompleteComp
                dspRoute={dspFromLocation}
                setDspRoute={setDspFromLocation}
                setRoute={setOrigin}
                topic='Load Origin'
                setPickLocationOnMap={setPickLocationOnMap}
            />

            <ThemedText>
                Destination Location<ThemedText color="red">*</ThemedText>
            </ThemedText>

            <TouchableOpacity
                onPress={() => setDspToLocation(true)}
                style={[styles.locationButton, { borderColor: icon, backgroundColor: backgroundLight }]}
            >
                <View style={styles.locationButtonContent}>
                    <Ionicons
                        name="location"
                        size={20}
                        color={iconColor || accent}
                        style={styles.locationIcon}
                    />
                    <ThemedText
                        style={[
                            styles.locationButtonText,
                            { color: destination ? icon : '#888' }
                        ]}
                    >
                        {destination ? destination?.description : "Select Destination"}
                    </ThemedText>
                </View>
            </TouchableOpacity>

            <GooglePlaceAutoCompleteComp
                dspRoute={dspToLocation}
                setDspRoute={setDspToLocation}
                setRoute={setDestination}
                topic="Load Destination"
                setPickLocationOnMap={setPickLocationOnMap}
            />

            {locationPicKERdSP && (
                <LocationPicker
                    pickOriginLocation={origin}
                    setPickOriginLocation={setOrigin}
                    pickDestinationLoc={destination}
                    setPickDestinationLoc={setDestination}
                    setShowMap={setPickLocationOnMap}
                    dspShowMap={locationPicKERdSP}
                    mode="dual"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    locationButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
        width: '100%',
    },
    locationButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
    },
    locationIcon: {
        marginRight: 10,
    },
    locationButtonText: {
        fontSize: 16,
        flex: 1,
        textAlign: 'left',
    },
    routeInfo: {
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    infoText: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 6,
    },
});
