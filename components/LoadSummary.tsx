import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from "@/constants/common";
import { ImagePickerAsset } from 'expo-image-picker';
import { DocumentAsset } from '@/types/types';

interface LoadSummaryProps {
    userType: 'general' | 'professional';
    formData: {
        typeofLoad: string;
        origin?: { description: string } | null;
        destination?: { description: string } | null;
        selectedLoadingDate?: { name: string } | null;
        budget?: string;
        budgetCurrency?: { name: string };
        loadImages?: ImagePickerAsset[];
        selectedAfricanTrucks?: any[];
        rate?: string;
        currency?: string;
        paymentTerms?: string;
        requirements?: string;
        additionalInfo?: string;
        alertMsg?: string;
        fuelAvai?: string;
        returnLoad?: string;
        returnRate?: string;
        returnTerms?: string;
        trucksNeeded?: any[];
        proofOfOrder?: DocumentAsset[];
    };
    isSubmitting: boolean;
    onSubmit: () => void;
}

export const LoadSummary: React.FC<LoadSummaryProps> = ({
    userType,
    formData,
    isSubmitting,
    onSubmit
}) => {
    const backgroundLight = useThemeColor('backgroundLight');
    const accent = useThemeColor('accent');

    const renderGeneralUserSummary = () => (
        <View style={[styles.summaryContainer, { backgroundColor: backgroundLight }]}>
            <ThemedText style={styles.summaryTitle}>Load Summary</ThemedText>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Load Type:</ThemedText>
                <ThemedText>{formData.typeofLoad}</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Route:</ThemedText>
                <ThemedText>{formData.origin?.description} → {formData.destination?.description}</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Loading Date:</ThemedText>
                <ThemedText>{formData.selectedLoadingDate?.name}</ThemedText>
            </View>

            {formData.budget && (
                <View style={styles.summaryItem}>
                    <ThemedText style={styles.summaryLabel}>Budget:</ThemedText>
                    <ThemedText>{formData.budget} {formData.budgetCurrency?.name}</ThemedText>
                </View>
            )}

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Images:</ThemedText>
                <ThemedText>{formData.loadImages?.length || 0} image(s) uploaded</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Selected Truck Types:</ThemedText>
                <ThemedText>{formData.selectedAfricanTrucks?.map(t => t.name).join(', ') || 'None'}</ThemedText>
            </View>
        </View>
    );

    const renderProfessionalUserSummary = () => (
        <View style={[styles.summaryContainer, { backgroundColor: backgroundLight }]}>
            <ThemedText style={styles.summaryTitle}>Load Summary</ThemedText>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Load Type:</ThemedText>
                <ThemedText>{formData.typeofLoad}</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Route:</ThemedText>
                <ThemedText>{formData.origin?.description} → {formData.destination?.description}</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Rate:</ThemedText>
                <ThemedText>{formData.rate} {formData.currency}</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Payment Terms:</ThemedText>
                <ThemedText>{formData.paymentTerms}</ThemedText>
            </View>

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Requirements:</ThemedText>
                <ThemedText>{formData.requirements}</ThemedText>
            </View>

            {formData.returnLoad && (
                <View style={styles.summaryItem}>
                    <ThemedText style={styles.summaryLabel}>Return Load:</ThemedText>
                    <ThemedText>{formData.returnLoad}</ThemedText>
                </View>
            )}

            <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Trucks Required:</ThemedText>
                <ThemedText>{formData.trucksNeeded?.length || 0} truck(s) specified</ThemedText>
            </View>

            {formData.proofOfOrder && formData.proofOfOrder.length > 0 && (
                <View style={styles.summaryItem}>
                    <ThemedText style={styles.summaryLabel}>Proof of Order:</ThemedText>
                    <ThemedText>Document uploaded</ThemedText>
                </View>
            )}
        </View>
    );

    const renderImagePreview = () => {
        if (userType === 'general' && formData.loadImages && formData.loadImages.length > 0) {
            return (
                <View style={styles.imagePreviewContainer}>
                    <ThemedText style={styles.imagePreviewTitle}>Load Images Preview</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {formData.loadImages.map((image, index) => (
                            <View key={index} style={styles.imagePreviewItem}>
                                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                <ThemedText style={styles.imagePreviewLabel}>
                                    Image {index + 1}
                                </ThemedText>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            );
        }
        return null;
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <ThemedText style={styles.title}>
                    {userType === 'general' ? 'Review & Submit' : 'Load Summary'}
                </ThemedText>

                {userType === 'general' ? renderGeneralUserSummary() : renderProfessionalUserSummary()}

                {renderImagePreview()}

                <Button
                    onPress={onSubmit}
                    title={isSubmitting ? "Submitting..." : "Submit Load Request"}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
                    style={[styles.submitButton, { borderColor: accent }]}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: wp(3),
        gap: wp(2),
        borderRadius: 8,
        shadowColor: "#6a0c0c",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
        overflow: "hidden",
    },
    title: {
        alignSelf: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: "#1E90FF"
    },
    summaryContainer: {
        padding: wp(4),
        borderRadius: 12,
        marginBottom: wp(3),
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: wp(2),
    },
    summaryItem: {
        marginBottom: wp(2),
    },
    summaryLabel: {
        fontWeight: 'bold',
    },
    imagePreviewContainer: {
        marginBottom: wp(3),
    },
    imagePreviewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: wp(2),
    },
    imagePreviewItem: {
        marginRight: wp(2),
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    imagePreviewLabel: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        borderWidth: 1,
    },
});
