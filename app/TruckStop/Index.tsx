import React from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import ScreenWrapper from "@/components/ScreenWrapper"
import Heading from "@/components/Heading"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from '@/hooks/useThemeColor'
import { wp } from '@/constants/common'
import { MaterialIcons } from '@expo/vector-icons'
import { openWhatsApp, getContactMessage } from '@/Utilities/whatsappUtils'

export default function Index() {
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')

    const handleContactUs = () => {
        const message = getContactMessage('truckStop');
        openWhatsApp('+263787884434', message);
    };

    return (
        <ScreenWrapper>
            <Heading page='Truck Stop' />

            {/* How It Works Section */}
            <View style={[styles.howItWorksCard, { backgroundColor: accent + '05', borderColor: accent }]}>
                <View style={styles.howItWorksHeader}>
                    <MaterialIcons name="how-to-reg" size={wp(5)} color={accent} />
                    <ThemedText type="subtitle" style={[styles.howItWorksTitle, { color: accent }]}>
                        How It Works
                    </ThemedText>
                </View>

                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>1</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            Customers view your amenities & prices in our app
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>2</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            They get GPS navigation directly to your stop
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>3</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            Online payment is processed before arrival
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>4</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            Customers arrive, rest, eat, and leave refreshed
                        </ThemedText>
                    </View>

                    <View style={styles.step}>
                        <View style={[styles.stepNumber, { backgroundColor: accent }]}>
                            <ThemedText style={styles.stepNumberText}>5</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: icon }]}>
                            You get paid instantly - no payment delays!
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* Contact Integration Card */}
            <View style={[styles.contactCard, { backgroundColor: accent + '10', borderColor: accent }]}>
                <View style={styles.contactHeader}>
                    <MaterialIcons name="local-parking" size={wp(6)} color={accent} />
                    <ThemedText type="subtitle" style={[styles.contactTitle, { color: accent }]}>
                        Truck Stop Partnership
                    </ThemedText>
                </View>

                <ThemedText style={[styles.contactDescription, { color: icon }]}>
                    If you run a truck stop with rest, food, and services and want to add your location here, contact us to get customers fast!
                </ThemedText>

                <View style={styles.featuresContainer}>
                    <ThemedText style={[styles.featuresTitle, { color: accent }]}>
                        Cool Features for Partners:
                    </ThemedText>
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="location-on" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Live GPS Navigation</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="payment" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Secure Online Payments</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="restaurant" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Food Ordering System</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="hotel" size={wp(4)} color={accent} />
                            <ThemedText style={[styles.featureText, { color: icon }]}>Rest Area Booking</ThemedText>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: accent }]}
                    onPress={handleContactUs}
                >
                    <MaterialIcons name="chat" size={wp(4)} color="#fff" />
                    <ThemedText style={styles.contactButtonText}>Contact Now</ThemedText>
                </TouchableOpacity>
            </View>

            <ThemedText style={[styles.placeholderText, { color: icon }]}>
                Truck stop services will be available soon. Contact us to be among the first partners!
            </ThemedText>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    contactCard: {
        margin: wp(4),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    contactTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    contactDescription: {
        fontSize: wp(3.8),
        lineHeight: wp(5),
        marginBottom: wp(4),
        textAlign: 'center'
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2)
    },
    contactButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    placeholderText: {
        textAlign: 'center',
        fontSize: wp(3.5),
        marginTop: wp(4),
        paddingHorizontal: wp(4)
    },
    howItWorksCard: {
        margin: wp(4),
        marginBottom: wp(2),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    howItWorksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    howItWorksTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    stepsContainer: {
        gap: wp(2)
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3)
    },
    stepNumber: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepNumberText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    stepText: {
        flex: 1,
        fontSize: wp(3.5),
        lineHeight: wp(4.5)
    },
    featuresContainer: {
        marginTop: wp(3),
        marginBottom: wp(3)
    },
    featuresTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(2)
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2)
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        width: '48%',
        paddingVertical: wp(1)
    },
    featureText: {
        fontSize: wp(3.2),
        flex: 1
    }
})