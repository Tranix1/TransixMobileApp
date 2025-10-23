import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ToastAndroid } from 'react-native';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { addInsuranceFirm } from '@/db/operations';
import { router } from 'expo-router';

export default function AddFirm() {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const text = useThemeColor('text');
    const textLight = useThemeColor('textlight');
    const border = useThemeColor('border');

    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [specialties, setSpecialties] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!companyName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !address.trim() || !description.trim() || !licenseNumber.trim()) {
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
            const specialtiesArray = specialties.split(',').map(s => s.trim()).filter(Boolean);
            await addInsuranceFirm({
                companyName: companyName.trim(),
                contactPerson: contactPerson.trim(),
                email: email.trim(),
                phone: phone.trim(),
                address: address.trim(),
                description: description.trim(),
                licenseNumber: licenseNumber.trim(),
                specialties: specialtiesArray,
                isActive: true,
            });
            ToastAndroid.show('Insurance firm added successfully', ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            ToastAndroid.show('Failed to add firm', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            <Heading page='Add Insurance Firm' />
            <ScrollView style={styles.content}>
                <Input placeholder='Company Name *' value={companyName} onChangeText={setCompanyName} style={styles.input} />
                <Input placeholder='Contact Person *' value={contactPerson} onChangeText={setContactPerson} style={styles.input} />
                <Input placeholder='Email Address *' value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' style={styles.input} />
                <Input placeholder='Phone Number *' value={phone} onChangeText={setPhone} keyboardType='phone-pad' style={styles.input} />
                <Input placeholder='Address *' value={address} onChangeText={setAddress} style={styles.input} />
                <Input placeholder='License Number *' value={licenseNumber} onChangeText={setLicenseNumber} style={styles.input} />
                <Input placeholder='Description *' value={description} onChangeText={setDescription} multiline numberOfLines={3} style={[styles.input, styles.textArea]} />
                <Input placeholder='Specialties (comma separated) *' value={specialties} onChangeText={setSpecialties} style={styles.input} />

                <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.7} style={[styles.submitButton, { backgroundColor: accent }]}>
                    {loading ? <ActivityIndicator color={'white'} /> : <Text style={styles.submitText}>Add Firm</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: wp(4) },
    input: { marginBottom: wp(4) },
    textArea: { height: hp(10), textAlignVertical: 'top' },
    submitButton: { paddingVertical: wp(3), borderRadius: wp(2), alignItems: 'center' },
    submitText: { color: 'white', fontWeight: '600', fontSize: wp(4) },
});