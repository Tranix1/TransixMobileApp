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
import { addDocument, addDocumentWithId, uploadImage, getUsers, updateDocument, readById, fetchDocuments } from '@/db/operations';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePushNotifications } from '@/Utilities/pushNotification';
import ImageUploadCard from '@/components/ImageUploadCard';
import { takePhoto } from '@/Utilities/imageUtils';
import Button from '@/components/Button';
import { getDriverLevel } from '@/Utilities/DriverLevelVerification';

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
    const [selfieImage , setSelfieImage]= useState<ImagePickerAsset | null>(null);
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

        if (!fullName.trim() || !phoneNumber.trim() || !driverLicense || !passport || !internationalPermit) {
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

            const driverData = {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                selfieImage : selfieImageUrl,
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
                expoPushToken: expoPushToken,
                updatedAt: new Date().toISOString() ,
                driverVerificationTier : driverVerificationTiers,
                email : user?.email
            };

            // Add to Fleet collection under fleetId as subcollection with fixed ID
            await addDocumentWithId(`Drivers`, fixedDriverId, driverData);

            await updateDocument('personalData', user.uid, {
                // fleets: [...existingFleets, newFleetAccess],

                driverProfile: driverData,
                updatedAt: new Date().toISOString()
            });

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
        takePhoto((image) => {setSelfieImage(image);});
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


                   


            </ScrollView>


                        <Button
                        onPress={handleAddDriver}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        title={isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Driver' : 'Add Driver')}
                        colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
                        style={{ height: 44 }}
                    />

            <View style={{height:5}} />
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
        marginTop: 20   ,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});


// const searchUsers = (email: string) => {
//         if (!email.trim()) {
//             setSearchedUsers([]);
//             return;
//         }

//         try {
//             const filteredUsers = allUsers.filter((user) =>
//                 user.email && typeof user.email === 'string' &&
//                 (user.email.toLowerCase().includes(email.toLowerCase()) ||
//                  (user.firstName && user.firstName.toLowerCase().includes(email.toLowerCase())) ||
//                  (user.lastName && user.lastName.toLowerCase().includes(email.toLowerCase())))
//             ).slice(0, 10); // Limit to 10 results for performance
//             setSearchedUsers(filteredUsers);
//         } catch (error) {
//             console.error('Error searching users:', error);
//         }
//     };


//    <>
//                         <ThemedText>Search and Select User<ThemedText color="red">*</ThemedText></ThemedText>
//                         <Input
//                             placeholder="Search users by email or name..."
//                             value={userSearchText}
//                             onChangeText={(text) => {
//                                 setUserSearchText(text);
//                                 searchUsers(text);
//                             }}
//                         />
//                         {searchedUsers.length > 0 && (
//                             <View style={{
//                                 maxHeight: hp(25),
//                                 borderWidth: 1,
//                                 borderColor: icon,
//                                 borderRadius: wp(2),
//                                 marginTop: wp(1),
//                                 backgroundColor: background,
//                                 shadowColor: '#000',
//                                 shadowOffset: { width: 0, height: 2 },
//                                 shadowOpacity: 0.1,
//                                 shadowRadius: 4,
//                                 elevation: 5
//                             }}>
//                                 <ScrollView keyboardShouldPersistTaps="handled">
//                                     {searchedUsers.map(user => (
//                                         <TouchableOpacity
//                                             key={user.id}
//                                             style={{
//                                                 padding: wp(3),
//                                                 borderBottomWidth: 0.5,
//                                                 borderBottomColor: icon + '30',
//                                                 flexDirection: 'row',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'space-between'
//                                             }}
//                                             onPress={() => selectUser(user)}
//                                         >
//                                             <View>
//                                                 <ThemedText style={{ fontWeight: 'bold' }}>{user.email}</ThemedText>
//                                                 <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
//                                                     {user.firstName || 'N/A'} {user.lastName || ''}
//                                                 </ThemedText>
//                                             </View>
//                                             <Ionicons name="add-circle" size={wp(5)} color={accent} />
//                                         </TouchableOpacity>
//                                     ))}
//                                 </ScrollView>
//                             </View>
//                         )}
//                         {selectedUser && (
//                             <View style={{ backgroundColor: accent + '20', padding: wp(2), marginTop: wp(2), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center' }}>
//                                 <ThemedText style={{ marginRight: wp(2) }}>{selectedUser.email}</ThemedText>
//                                 <TouchableOpacity onPress={() => setSelectedUser(null)}>
//                                     <Ionicons name="close" size={wp(4)} color={accent} />
//                                 </TouchableOpacity>
//                             </View>
//                         )}
//                     </>











// {/* Truck Search and Selection */}
// <ThemedText>Search and Assign Truck<ThemedText color="red">*</ThemedText></ThemedText>
// <Input
//     placeholder="Search trucks by name..."
//     value={truckSearchText}
//     onChangeText={(text) => {
//         setTruckSearchText(text);
//         searchTrucks(text);
//     }}
// />
// {searchedTrucks.length > 0 && (
//     <View style={{
//         maxHeight: hp(30), // Fixed height for truck selection
//         width: '100%',
//         borderWidth: 1,
//         borderColor: icon,
//         borderRadius: wp(2),
//         marginTop: wp(1),
//         backgroundColor: background,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 5
//     }}>
//         <ScrollView keyboardShouldPersistTaps="handled">
//             {searchedTrucks.map(truck => (
//                 <TouchableOpacity
//                     key={truck.id}
//                     style={{
//                         padding: wp(3),
//                         borderBottomWidth: 0.5,
//                         borderBottomColor: icon + '30',
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         justifyContent: 'space-between',
//                     }}
//                     onPress={() => selectTruck(truck)}
//                 >
//                     <View>
//                         <ThemedText style={{ fontWeight: 'bold' }}>{truck.truckName}</ThemedText>
//                         <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
//                             {truck.truckType} - {truck.truckCapacity}
//                         </ThemedText>
//                     </View>
//                     <Ionicons name="add-circle" size={wp(5)} color={accent} />
//                 </TouchableOpacity>
//             ))}
//         </ScrollView>
//     </View>
// )}
// {selectedTruck && (
//     <View style={{ marginTop: wp(2),width:wp(70) }}>
//         <ThemedText>Driver Role for {selectedTruck.truckName}<ThemedText color="red">*</ThemedText></ThemedText>
//         <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(2) }}>
//             {[
//                 { key: 'main', label: 'Main Driver', desc: 'Primary driver' },
//                 { key: 'second_main', label: 'Second Main', desc: 'Secondary primary' },
//                 { key: 'backup', label: 'Backup Driver', desc: 'Backup driver' }
//             ].map((role) => (
//                 <TouchableOpacity
//                     key={role.key}
//                     onPress={() => setDriverRole(role.key as 'main' | 'second_main' | 'backup')}
//                     style={{
//                         flex: 1,
//                         // padding: wp(3),
//                         borderRadius: wp(2),
//                         borderWidth: 2,
//                         borderColor: driverRole === role.key ? accent : icon + '40',
//                         backgroundColor: driverRole === role.key ? accent + '10' : 'transparent',
//                         alignItems: 'center'
//                     }}
//                 >
//                     <ThemedText style={{
//                         fontWeight: driverRole === role.key ? 'bold' : 'normal',
//                         color: driverRole === role.key ? accent : text,
//                         fontSize: wp(3)
//                     }}>
//                         {role.label}
//                     </ThemedText>
//                     <ThemedText style={{
//                         fontSize: wp(2.5),
//                         color: icon,
//                         marginTop: wp(0.5)
//                     }}>
//                         {role.desc}
//                     </ThemedText>
//                 </TouchableOpacity>
//             ))}
//         </View>
//         <View style={{ backgroundColor: accent + '20', padding: wp(2), marginTop: wp(2), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//             <View style={{ flex: 1 }}>
//                 <ThemedText style={{ fontWeight: 'bold' }}>{selectedTruck.truckName}</ThemedText>
//                 <ThemedText style={{ fontSize: wp(2.5), color: icon, marginTop: wp(0.5) }}>
//                     Role: {driverRole === 'main' ? 'Main Driver' : driverRole === 'second_main' ? 'Second Main' : 'Backup Driver'}
//                 </ThemedText>
//                 <ThemedText style={{ fontSize: wp(2.5), color: icon, marginTop: wp(0.5) }}>
//                     Type: {selectedTruck.truckType} - Capacity: {selectedTruck.truckCapacity}
//                 </ThemedText>
//             </View>
//             <TouchableOpacity onPress={() => {
//                 setSelectedTruck(null);
//                 setDriverRole('backup');
//             }}>
//                 <Ionicons name="close" size={wp(4)} color={accent} />
//             </TouchableOpacity>
//         </View>
//     </View>
// )}





//              // Function to search users by email with immediate effect
// const searchUsers = (email: string) => {
//     if (!email.trim()) {
//         setSearchedUsers([]);
//         return;
//     }

//     try {
//         const filteredUsers = allUsers.filter((user) =>
//             user.email && typeof user.email === 'string' &&
//             (user.email.toLowerCase().includes(email.toLowerCase()) ||
//              (user.firstName && user.firstName.toLowerCase().includes(email.toLowerCase())) ||
//              (user.lastName && user.lastName.toLowerCase().includes(email.toLowerCase())))
//         ).slice(0, 10); // Limit to 10 results for performance
//         setSearchedUsers(filteredUsers);
//     } catch (error) {
//         console.error('Error searching users:', error);
//     }
// };

// // Function to select a user
// const selectUser = (user: any) => {
//     setSelectedUser(user);
//     setUserSearchText('');
//     setSearchedUsers([]);
// };

// // Function to search trucks by name
// const searchTrucks = (truckName: string) => {
//     if (!truckName.trim()) {
//         setSearchedTrucks([]);
//         return;
//     }

//     try {
//         const filteredTrucks = allTrucks.filter((truck) =>
//             truck.truckName && typeof truck.truckName === 'string' &&
//             truck.truckName.toLowerCase().includes(truckName.toLowerCase())
//         ).slice(0, 10); // Limit to 10 results for performance
//         setSearchedTrucks(filteredTrucks);
//     } catch (error) {
//         console.error('Error searching trucks:', error);
//     }
// };

// // Function to select a truck
// const selectTruck = (truck: any) => {
//     setSelectedTruck(truck);
//     setTruckSearchText('');
//     setSearchedTrucks([]);
// };

// mainTruck :{
//                 truckId: selectedTruck.id,
//                 truckName: selectedTruck.truckName,
//                 driverRole: driverRole,

//             },



//    driverId: driverId,
//                 fullName: fullName.trim(),
//                 userId: selectedUser.uid,
//                 email: selectedUser.email,
//                 phoneNumber: phoneNumber.trim(),
//                 truckId: selectedTruck.id,
//                 truckName: selectedTruck.truckName,
//                 docId: driverId,
//                 assignedAt: new Date().toISOString()