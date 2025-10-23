import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import { wp, hp } from '@/constants/common';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
    getInsuranceFirms,
    submitInsuranceQuotationRequest,
} from '@/db/operations';
import ScreenWrapper from '@/components/ScreenWrapper';
interface InsuranceFirm {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    specialties: string[];
    licenseNumber: string;
    isActive: boolean;
}

export default function RequestQuote() {
    const { user } = useAuth();
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const textLight = useThemeColor('textlight');
    const border = useThemeColor('border');

    // Form state
    const [applicantName, setApplicantName] = useState('');
    const [applicantEmail, setApplicantEmail] = useState('');
    const [applicantPhone, setApplicantPhone] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [vehicleValue, setVehicleValue] = useState('');
    const [coverageType, setCoverageType] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    // Insurance firms state
    const [insuranceFirms, setInsuranceFirms] = useState<InsuranceFirm[]>([]);
    const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFirms, setLoadingFirms] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Coverage types
    const coverageTypes = [
        'Comprehensive',
        'Third Party',
        'Third Party Fire & Theft',
        'Commercial Vehicle',
        'Fleet Insurance',
        'Cargo Insurance',
    ];

    // Vehicle types
    const vehicleTypes = [
        'Truck',
        'Trailer',
        'Bus',
        'Van',
        'Pickup',
        'Motorcycle',
        'Car',
        'Heavy Machinery',
    ];

    useEffect(() => {
        if (user) {
            setApplicantName(user.displayName || '');
            setApplicantEmail(user.email || '');
        }
    }, [user]);

    const loadInsuranceFirms = async () => {
        try {
            setLoadingFirms(true);
            const firms = await getInsuranceFirms();
            setInsuranceFirms(firms);
        } catch (error) {
            console.error('Error loading insurance firms:', error);
            ToastAndroid.show('Failed to load insurance firms', ToastAndroid.SHORT);
        } finally {
            setLoadingFirms(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            // Validate step 1
            if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim()) {
                ToastAndroid.show('Please fill in all required fields', ToastAndroid.SHORT);
                return;
            }
            if (!applicantEmail.includes('@')) {
                ToastAndroid.show('Please enter a valid email address', ToastAndroid.SHORT);
                return;
            }
            loadInsuranceFirms();
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate step 2
            if (!vehicleType || !vehicleValue || !coverageType) {
                ToastAndroid.show('Please fill in all required fields', ToastAndroid.SHORT);
                return;
            }
            if (isNaN(Number(vehicleValue)) || Number(vehicleValue) <= 0) {
                ToastAndroid.show('Please enter a valid vehicle value', ToastAndroid.SHORT);
                return;
            }
            setCurrentStep(3);
        }
    };

    const handleFirmSelection = (firmId: string) => {
        setSelectedFirmIds(prev => {
            if (prev.includes(firmId)) {
                return prev.filter(id => id !== firmId);
            } else {
                return [...prev, firmId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedFirmIds.length === 0) {
            ToastAndroid.show('Please select at least one insurance firm', ToastAndroid.SHORT);
            return;
        }

        try {
            setLoading(true);
            await submitInsuranceQuotationRequest({
                applicantName: applicantName.trim(),
                applicantEmail: applicantEmail.trim(),
                applicantPhone: applicantPhone.trim(),
                companyName: companyName.trim() || undefined,
                vehicleType,
                vehicleValue: Number(vehicleValue),
                coverageType,
                additionalInfo: additionalInfo.trim() || undefined,
                selectedFirmIds,
                status: 'pending',
            });

            Alert.alert(
                'Request Submitted Successfully',
                'Your insurance quotation request has been submitted. Selected insurance firms will contact you soon.',
                [{ text: 'OK', onPress: () => setCurrentStep(1) }]
            );

            // Reset form
            setApplicantName('');
            setApplicantEmail('');
            setApplicantPhone('');
            setCompanyName('');
            setVehicleType('');
            setVehicleValue('');
            setCoverageType('');
            setAdditionalInfo('');
            setSelectedFirmIds([]);
        } catch (error) {
            console.error('Error submitting request:', error);
            ToastAndroid.show('Failed to submit request. Please try again.', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: text }]}>Personal Information</Text>
            <Text style={[styles.stepSubtitle, { color: textLight }]}>
                Please provide your contact details
            </Text>

            <Input
                placeholder="Full Name *"
                value={applicantName}
                onChangeText={setApplicantName}
                style={styles.input}
            />

            <Input
                placeholder="Email Address *"
                value={applicantEmail}
                onChangeText={setApplicantEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />

            <Input
                placeholder="Phone Number *"
                value={applicantPhone}
                onChangeText={setApplicantPhone}
                keyboardType="phone-pad"
                style={styles.input}
            />

            <Input
                placeholder="Company Name (Optional)"
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: text }]}>Vehicle Information</Text>
            <Text style={[styles.stepSubtitle, { color: textLight }]}>
                Tell us about your vehicle and coverage needs
            </Text>

            <View style={styles.dropdownContainer}>
                <Text style={[styles.label, { color: text }]}>Vehicle Type *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                    {vehicleTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.chip,
                                { borderColor: border },
                                vehicleType === type && { backgroundColor: accent, borderColor: accent }
                            ]}
                            onPress={() => setVehicleType(type)}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: vehicleType === type ? 'white' : text }
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Input
                placeholder="Vehicle Value (USD) *"
                value={vehicleValue}
                onChangeText={setVehicleValue}
                keyboardType="numeric"
                style={styles.input}
            />

            <View style={styles.dropdownContainer}>
                <Text style={[styles.label, { color: text }]}>Coverage Type *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                    {coverageTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.chip,
                                { borderColor: border },
                                coverageType === type && { backgroundColor: accent, borderColor: accent }
                            ]}
                            onPress={() => setCoverageType(type)}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: coverageType === type ? 'white' : text }
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Input
                placeholder="Additional Information (Optional)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
            />
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: text }]}>Select Insurance Firms</Text>
            <Text style={[styles.stepSubtitle, { color: textLight }]}>
                Choose which insurance firms you'd like to receive quotations from
            </Text>

            {loadingFirms ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accent} />
                    <Text style={[styles.loadingText, { color: textLight }]}>
                        Loading insurance firms...
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.firmsList}>
                    {insuranceFirms.map((firm) => (
                        <TouchableOpacity
                            key={firm.id}
                            style={[
                                styles.firmCard,
                                { backgroundColor: backgroundLight, borderColor: border },
                                selectedFirmIds.includes(firm.id) && { borderColor: accent, borderWidth: 2 }
                            ]}
                            onPress={() => handleFirmSelection(firm.id)}
                        >
                            <View style={styles.firmHeader}>
                                <Text style={[styles.firmName, { color: text }]}>
                                    {firm.companyName}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: border },
                                    selectedFirmIds.includes(firm.id) && { backgroundColor: accent, borderColor: accent }
                                ]}>
                                    {selectedFirmIds.includes(firm.id) && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </View>
                            </View>

                            <Text style={[styles.firmDescription, { color: textLight }]}>
                                {firm.description}
                            </Text>

                            <View style={styles.firmDetails}>
                                <View style={styles.firmDetailItem}>
                                    <Ionicons name="person" size={16} color={textLight} />
                                    <Text style={[styles.firmDetailText, { color: textLight }]}>
                                        {firm.contactPerson}
                                    </Text>
                                </View>
                                <View style={styles.firmDetailItem}>
                                    <Ionicons name="call" size={16} color={textLight} />
                                    <Text style={[styles.firmDetailText, { color: textLight }]}>
                                        {firm.phone}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.specialtiesContainer}>
                                {firm.specialties.map((specialty, index) => (
                                    <View key={index} style={[styles.specialtyChip, { backgroundColor: accent + '20' }]}>
                                        <Text style={[styles.specialtyText, { color: accent }]}>
                                            {specialty}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    return (
        <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: background }]}>
            <Heading page='Request Insurance Quote' />

            <ScrollView style={styles.content}>
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    {[1, 2, 3].map((step) => (
                        <View key={step} style={styles.progressStep}>
                            <View style={[
                                styles.progressCircle,
                                { backgroundColor: currentStep >= step ? accent : border }
                            ]}>
                                <Text style={[
                                    styles.progressText,
                                    { color: currentStep >= step ? 'white' : textLight }
                                ]}>
                                    {step}
                                </Text>
                            </View>
                            {step < 3 && (
                                <View style={[
                                    styles.progressLine,
                                    { backgroundColor: currentStep > step ? accent : border }
                                ]} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Step Content */}
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}

                {/* Navigation Buttons */}
                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            onPress={() => setCurrentStep(currentStep - 1)}
                            style={[styles.button, styles.secondaryButton, { borderColor: border }]}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: text }]}>Previous</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={currentStep === 3 ? handleSubmit : handleNext}
                        style={[styles.button, styles.primaryButton, { backgroundColor: accent, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(3), borderRadius: wp(2) }]}
                        activeOpacity={0.7}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={'white'} />
                        ) : (
                            <Text style={[styles.buttonText, { color: 'white' }]}>
                                {currentStep === 3 ? 'Submit Request' : 'Next'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: wp(4),
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(3),
    },
    progressStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressCircle: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    progressLine: {
        width: wp(15),
        height: 2,
        marginHorizontal: wp(2),
    },
    stepContainer: {
        marginBottom: hp(3),
    },
    stepTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    stepSubtitle: {
        fontSize: wp(4),
        marginBottom: hp(2),
    },
    input: {
        marginBottom: hp(2),
    },
    textArea: {
        height: hp(10),
        textAlignVertical: 'top',
    },
    dropdownContainer: {
        marginBottom: hp(2),
    },
    label: {
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: wp(2),
    },
    chipContainer: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2.5),
        borderRadius: wp(6),
        borderWidth: 1,
        marginRight: wp(2),
    },
    chipText: {
        fontSize: wp(3.5),
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: hp(5),
    },
    loadingText: {
        marginTop: wp(3),
        fontSize: wp(4),
    },
    firmsList: {
        maxHeight: hp(40),
    },
    firmCard: {
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        marginBottom: wp(3),
    },
    firmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(2),
    },
    firmName: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        flex: 1,
    },
    checkbox: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(1),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    firmDescription: {
        fontSize: wp(3.5),
        marginBottom: wp(2),
        lineHeight: wp(4.5),
    },
    firmDetails: {
        marginBottom: wp(2),
    },
    firmDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1),
    },
    firmDetailText: {
        fontSize: wp(3.5),
        marginLeft: wp(2),
    },
    specialtiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    specialtyChip: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: wp(4),
    },
    specialtyText: {
        fontSize: wp(3),
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: wp(3),
        marginTop: hp(2),
    },
    button: {
        flex: 1,
    },
    primaryButton: {
        // backgroundColor set dynamically
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        fontSize: wp(4),
        fontWeight: '600',
    },
});
