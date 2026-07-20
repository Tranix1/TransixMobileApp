import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp } from '@/constants/common';
import Input from '@/components/Input';
import { selectImage } from '@/Utilities/imageUtils';
import { ImagePickerAsset } from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { addDocument, addDocumentWithId, uploadImage, getUsers, updateDocument, readById, fetchDocuments, generateUniqueReferrerCode } from '@/db/operations';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePushNotifications } from '@/Utilities/pushNotification';
import ImageUploadCard from '@/components/ImageUploadCard';
import { takePhoto } from '@/Utilities/imageUtils';
import Button from '@/components/Button';
import { getDriverLevel } from '@/Utilities/DriverLevelVerification';
import { SelectLocationProp } from '@/types/types';
import { LocationPicker, } from '@/components/LocationPicker';
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
export default function AddDriver() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const { user } = useAuth();
    const { driverId, editMode } = useLocalSearchParams();

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [locationFull, setLocationFull] = useState<SelectLocationProp | null>(null);



    const [selfieImage, setSelfieImage] = useState<ImagePickerAsset | null>(null);
    const [driverLicense, setDriverLicense] = useState<ImagePickerAsset | null>(null);
    const [nationalId, setNationalId] = useState<ImagePickerAsset | null>(null);
    const [passport, setPassport] = useState<ImagePickerAsset | null>(null);
    const [internationalPermit, setInternationalPermit] = useState<ImagePickerAsset | null>(null);
    const [medicalCertificate, setMedicalCertificate] = useState<ImagePickerAsset | null>(null);
    const [proofOfResidence, setProofOfResidence] = useState<ImagePickerAsset | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingDriver, setExistingDriver] = useState<any>(null);


    const { expoPushToken } = usePushNotifications();

    const handleAddDriver = async () => {

        if (!user?.uid) {
            ToastAndroid.show('User not authenticated', ToastAndroid.SHORT);
            return;
        }

        if (!fullName.trim() || !phoneNumber.trim() || !driverLicense || !selfieImage || !nationalId) {
            ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {

            const selfieImageUrl = await uploadImage(selfieImage as any, "Selfies", () => { }, "Uploading selfie");

            if (!selfieImageUrl) {
                ToastAndroid.show('Failed to upload selfie', ToastAndroid.SHORT);
            }

            // Upload the driver's license image
            const licenseUrl = await uploadImage(driverLicense, "DriverLicenses", () => { }, "Uploading driver's license");

            if (!licenseUrl) {
                ToastAndroid.show('Failed to upload driver license', ToastAndroid.SHORT);
                return;
            }
            const nationalIdUrl = await uploadImage(nationalId as any, "NationalIds", () => { }, "Uploading national ID");

            if (!nationalIdUrl) {
                ToastAndroid.show('Failed to upload driver license', ToastAndroid.SHORT);
                return;
            }

            // Upload the passport image
            const passportUrl = passport ? await uploadImage(passport, "DriverPassports", () => { }, "Uploading passport") : null;

            // Upload the international permit image
            const permitUrl = internationalPermit ? await uploadImage(internationalPermit, "DriverPermits", () => { }, "Uploading international permit") : null;

            const medicalCertUrl = medicalCertificate ? await uploadImage(medicalCertificate, "MedicalCertificates", () => { }, "Uploading medical certificate") : null;

            const proofOfResidenceUrl = proofOfResidence ? await uploadImage(proofOfResidence, "ProofOfResidences", () => { }, "Uploading proof of residence") : null;

            const driverVerificationTiers = getDriverLevel({
                nationalIdUrl,
                driverLicenseUrl: licenseUrl,
                proofOfResidenceUrl,
                medicalCertificateUrl: medicalCertUrl,
                passportUrl,
                internationalPermitUrl: permitUrl,
            });


            // Create driver data
            const fixedDriverId = `DRV_${user.uid}`;

            const driverVerificationData = {
                organizationId: fixedDriverId,
                userId: user.uid,
                accType: 'driver',
                organizationName: fullName,

                organizationPhone: phoneNumber,

                fleetMainAdminName: user.displayName,
                organizationAdminPhone: user.phoneNumber,
                organizationAdminEmail: user.email,

                driverVerificcationTier: driverVerificationTiers,


                location: locationFull,

                documents: {
                    selfieImage: selfieImageUrl,
                    nationalIdUrl: nationalIdUrl,
                    driverLicenseUrl: licenseUrl,
                    passportUrl: passportUrl,
                    medicalCertificateUrl: medicalCertUrl,
                    proofOfResidenceUrl: proofOfResidenceUrl,
                    internationalPermitUrl: permitUrl,
                    // truckRegistrationBookType: fleetData.fleetFileType[4],
                },
                verificationStatus: 'pending',
                submittedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),


            };

            await addDocumentWithId('verifiedUsers', fixedDriverId, driverVerificationData);


            const driverData = {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),

                selfieImage: selfieImageUrl,
                nationalIdUrl: nationalIdUrl,
                driverLicenseUrl: licenseUrl,
                passportUrl: passportUrl,
                medicalCertificateUrl: medicalCertUrl,
                proofOfResidenceUrl: proofOfResidenceUrl,
                internationalPermitUrl: permitUrl,
                userId: user.uid,

                docId: fixedDriverId, // Will be set after document creation
                createdAt: new Date().toISOString(),
                status: 'active',
                expoPushToken: expoPushToken || user?.expoPushToken,
                updatedAt: new Date().toISOString(),
                driverVerificcationTier: driverVerificationTiers,
                email: user?.email,
                location: locationFull,

            };

            // Add to Fleet collection under fleetId as subcollection with fixed ID
            await addDocumentWithId(`Drivers`, fixedDriverId, driverData);

            await updateDocument('personalData', user.uid, {
                // fleets: [...existingFleets, newFleetAccess],

                driverProfile: driverData,
                updatedAt: new Date().toISOString()
            });


            await addDocumentWithId(`organizationProfiles`, fixedDriverId, {
                    organizationId: fixedDriverId,
                    type: "driver", // or "fleet"
            
                    name: fullName.trim(),
                    profilePhoto: user?.photoURL || null,
                    coverPhoto: null,
                    description: "",
                    ownerId: user?.uid,
                    ownerName: user?.displayName || user?.organisation,
            
                    location: locationFull,
            
                    verificationStatus: "pending",
            
                    createdAt: Date.now()
                  }
            
                  )
            


            ToastAndroid.show('Driver added successfully', ToastAndroid.SHORT);
            router.back();


        } catch (error) {
            console.error('Error adding driver:', error);
            ToastAndroid.show('Error adding driver', ToastAndroid.SHORT);
        } finally {
            setIsSubmitting(false);
        }
    };




    const handleUpdateDriver = async () => {
        if (!user?.uid) {
            ToastAndroid.show('User not authenticated', ToastAndroid.SHORT);
            return;
        }

        if (!fullName.trim() || !phoneNumber.trim()) {
            ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            let licenseUrl = existingDriver.driverLicenseUrl;
            let passportUrl = existingDriver.passportUrl;
            let permitUrl = existingDriver.internationalPermitUrl;

            // Upload new images if provided
            if (driverLicense) {
                licenseUrl = await uploadImage(driverLicense, "DriverLicenses", () => { }, "Uploading driver's license");
            }
            if (passport) {
                passportUrl = await uploadImage(passport, "DriverPassports", () => { }, "Uploading passport");
            }
            if (internationalPermit) {
                permitUrl = await uploadImage(internationalPermit, "DriverPermits", () => { }, "Uploading international permit");
            }

            if (!licenseUrl || !passportUrl || !permitUrl) {
                ToastAndroid.show('Failed to upload some documents', ToastAndroid.SHORT);
                return;
            }

            // Update driver data
            const updateData = {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                driverLicenseUrl: licenseUrl,
                passportUrl: passportUrl,
                internationalPermitUrl: permitUrl,
                updatedAt: new Date().toISOString()
            };

            await updateDocument(`/Drivers`, existingDriver.id, updateData);

            ToastAndroid.show('Driver updated successfully', ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.error('Error updating driver:', error);
            ToastAndroid.show('Error updating driver', ToastAndroid.SHORT);
        } finally {
            setIsSubmitting(false);
        }
    };



    const [showMapPicker, setShowMapPicker] = useState(false);
    const [dsplocation, setDspDspLocation] = useState(false);


    return (
        <ScreenWrapper>
            <Heading page={isEditMode ? "Edit Driver" : "Add Driver"} />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: background }]}>

                <ThemedText style={styles.description}>
                    {isEditMode ? "Update driver information and re-upload documents if needed." : "Enter details and upload required documents."}
                </ThemedText>

                <ThemedText>Full Name<ThemedText color="red">*</ThemedText></ThemedText>
                <Input
                    placeholder="Enter driver's full name"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <ThemedText>Phone Number<ThemedText color="red">*</ThemedText></ThemedText>
                <Input
                    placeholder="Enter driver's phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />

             

                <ThemedText>Home Location <ThemedText color="red">*</ThemedText></ThemedText>


                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setDspDspLocation(true)}
                >
                    <ThemedText>
                        {locationFull?.description ||
                            'Select Home Location'}
                    </ThemedText>
                </TouchableOpacity>


                {/* DESTINATION PICKER ONLY */}
                <GooglePlaceAutoCompleteComp
                    dspRoute={dsplocation}
                    setDspRoute={setDspDspLocation}
                    setRoute={setLocationFull}
                    topic="Select Destination"
                    setPickLocationOnMap={setShowMapPicker}
                />

                {showMapPicker && (
                    <LocationPicker
                        pickOriginLocation={null}
                        setPickOriginLocation={() => { }}
                        pickDestinationLoc={locationFull}
                        setPickDestinationLoc={setLocationFull}
                        setShowMap={setShowMapPicker}
                        dspShowMap={showMapPicker}
                        mode="single"
                    />
                )}





                <View>
                    <ThemedText>Driver's Image<ThemedText color="red">*</ThemedText></ThemedText>
                    <View style={{
                        borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                        shadowColor: '#4285f4',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 13, borderRadius: 10, marginBottom: 0, padding: 5, width: wp(92), height: wp(50), alignSelf: 'center'
                    }}>
                        {selfieImage && (
                            <Image source={{ uri: selfieImage.uri }} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                        )}
                        {selfieImage && (
                            <TouchableOpacity
                                onPress={() => setDriverLicense(null)}
                                style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    backgroundColor: 'white',
                                    borderRadius: 10,
                                }}
                            >
                                <Ionicons name="close-circle" size={20} color="red" />
                            </TouchableOpacity>
                        )}
                        {!selfieImage && <ThemedText style={{ fontSize: 14.5, textAlign: "center", marginTop: wp(10) }}>Driver's Image</ThemedText>}



                        {!selfieImage && <TouchableOpacity
                            onPress={() => {
                                takePhoto((image) => { setSelfieImage(image); });
                            }}
                            style={{
                                height: wp(27),
                                backgroundColor: background,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: wp(4)
                            }}
                        >
                            <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                            <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>
                                Take Photo<ThemedText color="red">*</ThemedText>
                            </ThemedText>
                        </TouchableOpacity>}



                    </View>
                    {selfieImage && (
                        <ThemedText style={{ fontSize: wp(2.5), color: icon, textAlign: 'center', marginTop: wp(1) }}>
                            Selfie uploaded successfully
                        </ThemedText>
                    )}
                </View>



                <ScrollView horizontal style={{ height: 133, marginTop: wp(4) }}>

                    <ImageUploadCard
                        image={driverLicense}
                        setImage={setDriverLicense}
                        selectImage={selectImage}
                        label="Driver's License"
                        successMessage="License uploaded successfully"
                    />

                    <ImageUploadCard
                        image={nationalId}
                        setImage={setNationalId}
                        selectImage={selectImage}
                        label="National ID"
                        successMessage="ID uploaded successfully"
                    />



                </ScrollView>


                <ScrollView horizontal style={{ height: 133, marginTop: wp(4) }}>


                    <ImageUploadCard
                        image={passport}
                        setImage={setPassport}
                        selectImage={selectImage}
                        label="Passport"
                        successMessage="Passport uploaded successfully"
                    />



                    <ImageUploadCard
                        image={internationalPermit}
                        setImage={setInternationalPermit}
                        selectImage={selectImage}
                        label="International Permit"
                        successMessage="Permit uploaded successfully"
                    />
                    <ImageUploadCard
                        image={medicalCertificate}
                        setImage={setMedicalCertificate}
                        selectImage={selectImage}
                        label="Medical Certificate"
                        successMessage="Medic Certificate uploaded successfully"
                    />
                    <ImageUploadCard
                        image={proofOfResidence}
                        setImage={setProofOfResidence}
                        selectImage={selectImage}
                        label="Proof of Residence"
                        successMessage="Proof uploaded successfully"
                    />



                </ScrollView>



                <Button
                    onPress={handleAddDriver}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    title={isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Driver' : 'Add Driver')}
                    colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
                    style={{ height: 44, width: 200, margin: 8, borderRadius: 5 }}
                />

                <View style={{ height: 74, }} />

            </ScrollView>



        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 30,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        marginTop: wp(2),
        padding: wp(3),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: wp(2),
        width:wp(90) ,
        marginBottom:hp(3)
    },
});
