import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { TruckStop } from '@/types/types';

interface TruckStopCardProps {
    truckStop: TruckStop;
    onPress?: () => void;
    onImagePress?: (images: string[], index: number) => void;
    onPaymentPress?: (truckStop: TruckStop) => void;
}

export const TruckStopCard: React.FC<TruckStopCardProps> = ({
    truckStop,
    onPress,
    onImagePress,
    onPaymentPress,
}) => {
    const [showAllDetails, setShowAllDetails] = useState(false);
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const backgroundLight = useThemeColor('backgroundLight');

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <MaterialIcons
                    key={i}
                    name={i <= rating ? 'star' : 'star-border'}
                    size={wp(3.5)}
                    color={i <= rating ? '#FFD700' : icon}
                />
            );
        }
        return stars;
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: backgroundLight, borderColor: accent }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Images Gallery */}
            {truckStop.images && truckStop.images.length > 0 && (
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageScrollContent}
                    >
                        {truckStop.images.slice(0, 3).map((imageUri, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => onImagePress?.(truckStop.images, index)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <ThemedText type="subtitle" style={[styles.title, { color: accent }]}>
                        {truckStop.name}
                    </ThemedText>
                    <View style={styles.locationContainer}>
                        <MaterialIcons name="location-on" size={wp(3.5)} color={icon} />
                        <ThemedText style={[styles.location, { color: icon }]}>
                            {truckStop.location}
                        </ThemedText>
                    </View>
                </View>

                {truckStop.rating && (
                    <View style={styles.ratingContainer}>
                        <View style={styles.stars}>
                            {renderStars(truckStop.rating)}
                        </View>
                        <ThemedText style={[styles.ratingText, { color: icon }]}>
                            {truckStop.rating.toFixed(1)}
                        </ThemedText>
                    </View>
                )}
            </View>

            {/* Basic Pricing Information - Always Show */}
            <View style={styles.pricingContainer}>
                <ThemedText type="defaultSemiBold" style={[styles.pricingTitle, { color: accent }]}>
                    Pricing
                </ThemedText>
                <View style={styles.pricingGrid}>
                    {truckStop.pricing.parking && (
                        <View style={[styles.pricingItem, { backgroundColor: icon + '10' }]}>
                            <MaterialIcons name="local-parking" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.pricingText, { color: icon }]}>
                                {truckStop.pricing.parking}
                            </ThemedText>
                        </View>
                    )}
                    {truckStop.pricing.fuel && (
                        <View style={[styles.pricingItem, { backgroundColor: icon + '10' }]}>
                            <MaterialIcons name="local-gas-station" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.pricingText, { color: icon }]}>
                                {truckStop.pricing.fuel}
                            </ThemedText>
                        </View>
                    )}
                    {showAllDetails && truckStop.pricing.food && (
                        <View style={[styles.pricingItem, { backgroundColor: icon + '10' }]}>
                            <MaterialIcons name="restaurant" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.pricingText, { color: icon }]}>
                                {truckStop.pricing.food}
                            </ThemedText>
                        </View>
                    )}
                    {showAllDetails && truckStop.pricing.rest && (
                        <View style={[styles.pricingItem, { backgroundColor: icon + '10' }]}>
                            <MaterialIcons name="hotel" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.pricingText, { color: icon }]}>
                                {truckStop.pricing.rest}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>

            {/* Amenities */}
            {truckStop.amenities && truckStop.amenities.length > 0 && (
                <View style={styles.amenitiesContainer}>
                    <ThemedText type="defaultSemiBold" style={[styles.amenitiesTitle, { color: accent }]}>
                        Amenities
                    </ThemedText>
                    <View style={styles.amenitiesGrid}>
                        {truckStop.amenities.slice(0, showAllDetails ? 6 : 3).map((amenity, index) => (
                            <View key={index} style={[styles.amenityTag, { backgroundColor: accent + '20' }]}>
                                <ThemedText style={[styles.amenityText, { color: accent }]}>
                                    {amenity}
                                </ThemedText>
                            </View>
                        ))}
                        {!showAllDetails && truckStop.amenities.length > 3 && (
                            <View style={[styles.amenityTag, { backgroundColor: icon + '20' }]}>
                                <ThemedText style={[styles.amenityText, { color: icon }]}>
                                    +{truckStop.amenities.length - 3} more
                                </ThemedText>
                            </View>
                        )}
                        {showAllDetails && truckStop.amenities.length > 6 && (
                            <View style={[styles.amenityTag, { backgroundColor: icon + '20' }]}>
                                <ThemedText style={[styles.amenityText, { color: icon }]}>
                                    +{truckStop.amenities.length - 6} more
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Entertainment - Only show when expanded */}
            {showAllDetails && truckStop.entertainment && truckStop.entertainment.length > 0 && (
                <View style={styles.entertainmentContainer}>
                    <ThemedText type="defaultSemiBold" style={[styles.entertainmentTitle, { color: accent }]}>
                        Entertainment
                    </ThemedText>
                    <View style={styles.entertainmentGrid}>
                        {truckStop.entertainment.slice(0, 4).map((entertainment, index) => (
                            <View key={index} style={[styles.entertainmentTag, { backgroundColor: accent + '20' }]}>
                                <ThemedText style={[styles.entertainmentText, { color: accent }]}>
                                    {entertainment}
                                </ThemedText>
                            </View>
                        ))}
                        {truckStop.entertainment.length > 4 && (
                            <View style={[styles.entertainmentTag, { backgroundColor: icon + '20' }]}>
                                <ThemedText style={[styles.entertainmentText, { color: icon }]}>
                                    +{truckStop.entertainment.length - 4} more
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Operating Hours - Only show when expanded */}
            {showAllDetails && truckStop.operatingHours && (
                <View style={styles.hoursContainer}>
                    <View style={styles.hoursRow}>
                        <MaterialIcons name="schedule" size={wp(4)} color={accent} />
                        <ThemedText style={[styles.hoursText, { color: icon }]}>
                            {truckStop.operatingHours.open} - {truckStop.operatingHours.close}
                        </ThemedText>
                    </View>
                    {truckStop.operatingHours.days && truckStop.operatingHours.days.length > 0 && (
                        <ThemedText style={[styles.daysText, { color: icon }]}>
                            {truckStop.operatingHours.days.join(', ')}
                        </ThemedText>
                    )}
                </View>
            )}

            {/* Contact Information - Only show when expanded */}
            {showAllDetails && truckStop.contact && (
                <View style={styles.contactContainer}>
                    <View style={styles.contactRow}>
                        <MaterialIcons name="phone" size={wp(4)} color={accent} />
                        <ThemedText style={[styles.contactText, { color: icon }]}>
                            {truckStop.contact.phone}
                        </ThemedText>
                    </View>
                    {truckStop.contact.email && (
                        <View style={styles.contactRow}>
                            <MaterialIcons name="email" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.contactText, { color: icon }]}>
                                {truckStop.contact.email}
                            </ThemedText>
                        </View>
                    )}
                </View>
            )}

            {/* Description - Only show when expanded */}
            {showAllDetails && truckStop.description && (
                <View style={styles.descriptionContainer}>
                    <ThemedText style={[styles.description, { color: icon }]} numberOfLines={3}>
                        {truckStop.description}
                    </ThemedText>
                </View>
            )}

            {/* Show More/Less Button */}
            <TouchableOpacity
                style={[styles.showMoreButton, { borderColor: accent }]}
                onPress={() => setShowAllDetails(!showAllDetails)}
            >
                <ThemedText style={[styles.showMoreText, { color: accent }]}>
                    {showAllDetails ? 'Show Less' : 'Show More'}
                </ThemedText>
                <Ionicons
                    name={showAllDetails ? 'chevron-up' : 'chevron-down'}
                    size={wp(4)}
                    color={accent}
                />
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={[styles.paymentButton, { backgroundColor: accent }]}
                    onPress={() => onPaymentPress?.(truckStop)}
                >
                    <Ionicons name="card" size={wp(4)} color="white" />
                    <ThemedText style={styles.actionButtonText}>Pay for Services</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.directionsButton, { borderColor: accent }]}>
                    <MaterialIcons name="directions" size={wp(4)} color={accent} />
                    <ThemedText style={[styles.directionsButtonText, { color: accent }]}>Directions</ThemedText>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: wp(2),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        marginBottom: wp(3),
    },
    imageScrollContent: {
        gap: wp(2),
    },
    image: {
        width: wp(25),
        height: wp(20),
        borderRadius: wp(2),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: wp(3),
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
    },
    location: {
        fontSize: wp(3.5),
    },
    ratingContainer: {
        alignItems: 'center',
    },
    stars: {
        flexDirection: 'row',
        marginBottom: wp(1),
    },
    ratingText: {
        fontSize: wp(3),
    },
    pricingContainer: {
        marginBottom: wp(3),
    },
    pricingTitle: {
        fontSize: wp(4),
        marginBottom: wp(2),
    },
    pricingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    pricingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1),
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(2),
    },
    pricingText: {
        fontSize: wp(3.2),
    },
    amenitiesContainer: {
        marginBottom: wp(3),
    },
    amenitiesTitle: {
        fontSize: wp(4),
        marginBottom: wp(2),
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    amenityTag: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(3),
    },
    amenityText: {
        fontSize: wp(3),
    },
    entertainmentContainer: {
        marginBottom: wp(3),
    },
    entertainmentTitle: {
        fontSize: wp(4),
        marginBottom: wp(2),
    },
    entertainmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    entertainmentTag: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(3),
    },
    entertainmentText: {
        fontSize: wp(3),
    },
    hoursContainer: {
        marginBottom: wp(3),
    },
    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        marginBottom: wp(1),
    },
    hoursText: {
        fontSize: wp(3.5),
    },
    daysText: {
        fontSize: wp(3),
        marginLeft: wp(6),
    },
    contactContainer: {
        marginBottom: wp(3),
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        marginBottom: wp(1),
    },
    contactText: {
        fontSize: wp(3.5),
    },
    descriptionContainer: {
        marginBottom: wp(3),
    },
    description: {
        fontSize: wp(3.5),
        lineHeight: wp(4.5),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: wp(2),
        marginTop: wp(3),
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2),
    },
    directionsButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        borderWidth: 1,
        gap: wp(2),
    },
    actionButtonText: {
        color: '#fff',
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    directionsButtonText: {
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2.5),
        paddingHorizontal: wp(4),
        borderWidth: 1,
        borderRadius: wp(2),
        marginVertical: wp(2),
    },
    showMoreText: {
        fontSize: wp(3.5),
        fontWeight: '600',
        marginRight: wp(2),
    },
});
