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
    Modal,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { router } from 'expo-router';
import Input from '@/components/Input';
import { wp, hp } from '@/constants/common';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { addInsuranceFirm, getInsuranceFirms, updateDocument, deleteDocument } from '@/db/operations';
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
    timeStamp?: any;
}

export default function ManageFirms() {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const textLight = useThemeColor('textlight');
    const border = useThemeColor('border');

    // State
    const [firms, setFirms] = useState<InsuranceFirm[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingFirm, setEditingFirm] = useState<InsuranceFirm | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [newSpecialty, setNewSpecialty] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Predefined specialties
    const predefinedSpecialties = [
        'Commercial Vehicle Insurance',
        'Fleet Insurance',
        'Cargo Insurance',
        'Third Party Insurance',
        'Comprehensive Insurance',
        'Heavy Machinery Insurance',
        'Marine Insurance',
        'Aviation Insurance',
        'Property Insurance',
        'Liability Insurance',
    ];

    useEffect(() => {
        loadFirms();
    }, []);

    const loadFirms = async () => {
        try {
            setLoading(true);
            const allFirms = await getInsuranceFirms();
            setFirms(allFirms);
        } catch (error) {
            console.error('Error loading firms:', error);
            ToastAndroid.show('Failed to load insurance firms', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCompanyName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setAddress('');
        setDescription('');
        setLicenseNumber('');
        setSpecialties([]);
        setNewSpecialty('');
        setIsActive(true);
        setEditingFirm(null);
    };

    const handleAddSpecialty = () => {
        if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
            setSpecialties([...specialties, newSpecialty.trim()]);
            setNewSpecialty('');
        }
    };

    const handleRemoveSpecialty = (specialty: string) => {
        setSpecialties(specialties.filter(s => s !== specialty));
    };

    const handleAddPredefinedSpecialty = (specialty: string) => {
        if (!specialties.includes(specialty)) {
            setSpecialties([...specialties, specialty]);
        }
    };

    const validateForm = () => {
        if (!companyName.trim() || !contactPerson.trim() || !email.trim() ||
            !phone.trim() || !address.trim() || !description.trim() ||
            !licenseNumber.trim() || specialties.length === 0) {
            ToastAndroid.show('Please fill in all required fields', ToastAndroid.SHORT);
            return false;
        }
        if (!email.includes('@')) {
            ToastAndroid.show('Please enter a valid email address', ToastAndroid.SHORT);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const firmData = {
                companyName: companyName.trim(),
                contactPerson: contactPerson.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
                description: description.trim(),
                licenseNumber: licenseNumber.trim(),
                specialties,
                isActive,
            };

            if (editingFirm) {
                await updateDocument('insuranceFirms', editingFirm.id, firmData);
                ToastAndroid.show('Insurance firm updated successfully', ToastAndroid.SHORT);
            } else {
                await addInsuranceFirm(firmData);
                ToastAndroid.show('Insurance firm added successfully', ToastAndroid.SHORT);
            }

            setShowAddModal(false);
            resetForm();
            loadFirms();
        } catch (error) {
            console.error('Error saving firm:', error);
            ToastAndroid.show('Failed to save insurance firm', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (firm: InsuranceFirm) => {
        router.push({ pathname: '/Insurance/EditFirm', params: { id: firm.id } });
    };

    const handleDelete = (firm: InsuranceFirm) => {
        Alert.alert(
            'Delete Insurance Firm',
            `Are you sure you want to delete ${firm.companyName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteDocument('insuranceFirms', firm.id);
                            ToastAndroid.show('Insurance firm deleted successfully', ToastAndroid.SHORT);
                            loadFirms();
                        } catch (error) {
                            console.error('Error deleting firm:', error);
                            ToastAndroid.show('Failed to delete insurance firm', ToastAndroid.SHORT);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleActive = async (firm: InsuranceFirm) => {
        try {
            setLoading(true);
            await updateDocument('insuranceFirms', firm.id, { isActive: !firm.isActive });
            ToastAndroid.show(
                `Insurance firm ${!firm.isActive ? 'activated' : 'deactivated'} successfully`,
                ToastAndroid.SHORT
            );
            loadFirms();
        } catch (error) {
            console.error('Error toggling firm status:', error);
            ToastAndroid.show('Failed to update firm status', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFirm = async () => {
        if (!companyName || !email || !phone) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setLoading(true);
            const newFirm: InsuranceFirm = {
                id: Date.now().toString(),
                companyName,
                contactPerson,
                email,
                phone,
                address,
                description,
                specialties,
                licenseNumber,
                isActive,
                timeStamp: new Date().toISOString(),
            };

            await addInsuranceFirm(newFirm);
            setFirms((prev) => [...prev, newFirm]);
            resetForm();
            Alert.alert('Success', 'Insurance firm added successfully!');
        } catch (error) {
            console.error('Error adding firm:', error);
            Alert.alert('Error', 'Failed to add insurance firm.');
        } finally {
            setLoading(false);
        }
    };

    const renderFirmCard = (firm: InsuranceFirm) => (
        <View key={firm.id} style={[styles.firmCard, { backgroundColor: backgroundLight, borderColor: border }]}>
            <View style={styles.firmHeader}>
                <View style={styles.firmInfo}>
                    <Text style={[styles.firmName, { color: text }]}>{firm.companyName}</Text>
                    <Text style={[styles.firmContact, { color: textLight }]}>{firm.contactPerson}</Text>
                </View>
                <View style={styles.firmActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: accent }]}
                        onPress={() => handleEdit(firm)}
                    >
                        <Ionicons name="pencil" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: firm.isActive ? '#f44336' : '#4caf50' }]}
                        onPress={() => handleToggleActive(firm)}
                    >
                        <Ionicons name={firm.isActive ? 'pause' : 'play'} size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#ff9800' }]}
                        onPress={() => handleDelete(firm)}
                    >
                        <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.firmDescription, { color: textLight }]}>{firm.description}</Text>

            <View style={styles.firmDetails}>
                <View style={styles.firmDetailItem}>
                    <Ionicons name="mail" size={16} color={textLight} />
                    <Text style={[styles.firmDetailText, { color: textLight }]}>{firm.email}</Text>
                </View>
                <View style={styles.firmDetailItem}>
                    <Ionicons name="call" size={16} color={textLight} />
                    <Text style={[styles.firmDetailText, { color: textLight }]}>{firm.phone}</Text>
                </View>
                <View style={styles.firmDetailItem}>
                    <Ionicons name="location" size={16} color={textLight} />
                    <Text style={[styles.firmDetailText, { color: textLight }]}>{firm.address}</Text>
                </View>
            </View>

            <View style={styles.specialtiesContainer}>
                {firm.specialties.map((specialty, index) => (
                    <View key={index} style={[styles.specialtyChip, { backgroundColor: accent + '20' }]}>
                        <Text style={[styles.specialtyText, { color: accent }]}>{specialty}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.firmFooter}>
                <Text style={[styles.licenseText, { color: textLight }]}>
                    License: {firm.licenseNumber}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: firm.isActive ? '#4caf50' : '#f44336' }]}>
                    <Text style={styles.statusText}>
                        {firm.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <ScreenWrapper> 
        <View style={[styles.container, { backgroundColor: background }]}>
            <Heading
                page='Manage Insurance Firms'
                rightComponent={
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: accent }]}
                        onPress={() => router.push('/Insurance/AddFirm')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={20} color="white" />
                        <Text style={styles.addButtonText}>Add Firm</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView style={styles.content}>
                {loading && !showAddModal ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={accent} />
                        <Text style={[styles.loadingText, { color: textLight }]}>
                            Loading insurance firms...
                        </Text>
                    </View>
                ) : (
                    <View style={styles.firmsList}>
                        {firms.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="business" size={64} color={textLight} />
                                <Text style={[styles.emptyText, { color: textLight }]}>
                                    No insurance firms found
                                </Text>
                                <Text style={[styles.emptySubtext, { color: textLight }]}>
                                    Add your first insurance firm to get started
                                </Text>
                            </View>
                        ) : (
                            firms.map(renderFirmCard)
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modal removed: Add and Edit now have dedicated pages */}
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(2),
        gap: wp(2),
    },
    addButtonText: {
        color: 'white',
        fontSize: wp(3.5),
        fontWeight: '600',
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
        gap: wp(3),
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: hp(10),
    },
    emptyText: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginTop: wp(3),
    },
    emptySubtext: {
        fontSize: wp(4),
        marginTop: wp(1),
        textAlign: 'center',
    },
    firmCard: {
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
    },
    firmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: wp(2),
    },
    firmInfo: {
        flex: 1,
    },
    firmName: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    firmContact: {
        fontSize: wp(3.5),
    },
    firmActions: {
        flexDirection: 'row',
        gap: wp(2),
    },
    actionButton: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2),
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
        marginBottom: wp(2),
    },
    specialtyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: wp(4),
        gap: wp(1),
    },
    specialtyText: {
        fontSize: wp(3),
        fontWeight: '500',
    },
    firmFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    licenseText: {
        fontSize: wp(3),
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(1),
        borderRadius: wp(4),
    },
    statusText: {
        color: 'white',
        fontSize: wp(3),
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
    },
    closeButton: {
        padding: wp(2),
    },
    modalContent: {
        flex: 1,
        padding: wp(4),
    },
    input: {
        marginBottom: wp(4),
    },
    textArea: {
        height: hp(8),
        textAlignVertical: 'top',
    },
    specialtiesSection: {
        marginBottom: wp(4),
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(3),
    },
    predefinedSpecialties: {
        marginBottom: wp(3),
    },
    subsectionTitle: {
        fontSize: wp(4),
        marginBottom: wp(2),
    },
    predefinedChip: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(2),
        borderRadius: wp(4),
        borderWidth: 1,
        marginRight: wp(2),
    },
    predefinedChipText: {
        fontSize: wp(3.5),
    },
    addSpecialtyContainer: {
        flexDirection: 'row',
        gap: wp(2),
        marginBottom: wp(3),
    },
    specialtyInput: {
        flex: 1,
        marginBottom: 0,
    },
    addSpecialtyButton: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(3),
        borderRadius: wp(2),
    },
    addSpecialtyButtonText: {
        color: 'white',
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    selectedSpecialties: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2),
    },
    modalFooter: {
        flexDirection: 'row',
        gap: wp(3),
        padding: wp(4),
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    button: {
        flex: 1,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    submitButton: {
        // backgroundColor set dynamically
    },
    buttonText: {
        fontSize: wp(4),
        fontWeight: '600',
    },
});
