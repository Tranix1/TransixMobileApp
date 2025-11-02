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
    const [driverLicense, setDriverLicense] = useState<ImagePickerAsset | null>(null);
    const [passport, setPassport] = useState<ImagePickerAsset | null>(null);
    const [internationalPermit, setInternationalPermit] = useState<ImagePickerAsset | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentFleet, setCurrentFleet] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userSearchText, setUserSearchText] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingDriver, setExistingDriver] = useState<any>(null);

    // Truck search and selection
    const [truckSearchText, setTruckSearchText] = useState('');
    const [searchedTrucks, setSearchedTrucks] = useState<any[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<any>(null);
    const [allTrucks, setAllTrucks] = useState<any[]>([]);
    const [driverRole, setDriverRole] = useState<'main' | 'second_main' | 'backup'>('backup');

    // Driver search and selection
    const [driverSearchText, setDriverSearchText] = useState('');
    const [searchedDrivers, setSearchedDrivers] = useState<any[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const [allDrivers, setAllDrivers] = useState<any[]>([]);

    useEffect(() => {
        const initializeComponent = async () => {
            let parsedFleet: any = null;

            try {
                const fleetData = await AsyncStorage.getItem('currentRole');
                if (fleetData) {
                    parsedFleet = JSON.parse(fleetData);
                    setCurrentFleet(parsedFleet);

                    // Check if we're in edit mode
                    if (editMode === "true" && driverId) {
                        setIsEditMode(true);
                        await loadDriverForEdit(parsedFleet.fleetId, driverId as string);
                    }
                }
            } catch (error) {
                console.error('Error getting current fleet:', error);
            }

            // Fetch all users for search functionality
            try {
                const fetchedUsers = await getUsers();
                setAllUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }

            // Fetch all fleet trucks for search functionality
            if (parsedFleet?.fleetId) {
                try {
                    const trucksResult = await fetchDocuments(`fleets/${parsedFleet.fleetId}/Trucks`, 50);
                    if (trucksResult && trucksResult.data) {
                        setAllTrucks(trucksResult.data);
                    }
                } catch (error) {
                    console.error("Error fetching trucks:", error);
                }
            }
        };

        initializeComponent();
    }, [editMode, driverId]);

    const loadDriverForEdit = async (fleetId: string, driverId: string) => {
        try {
            const driverData = await readById(`fleets/${fleetId}/Drivers`, driverId);
            if (driverData && typeof driverData === 'object') {
                setExistingDriver(driverData);
                setFullName((driverData as any).fullName || '');
                setPhoneNumber((driverData as any).phoneNumber || '');
                // Note: We can't load images back from URLs, user will need to re-upload if editing
            }
        } catch (error) {
            console.error('Error loading driver for edit:', error);
            ToastAndroid.show('Error loading driver data', ToastAndroid.SHORT);
        }
    };

    // Function to search users by email with immediate effect
    const searchUsers = (email: string) => {
        if (!email.trim()) {
            setSearchedUsers([]);
            return;
        }

        try {
            const filteredUsers = allUsers.filter((user) =>
                user.email && typeof user.email === 'string' &&
                (user.email.toLowerCase().includes(email.toLowerCase()) ||
                 (user.firstName && user.firstName.toLowerCase().includes(email.toLowerCase())) ||
                 (user.lastName && user.lastName.toLowerCase().includes(email.toLowerCase())))
            ).slice(0, 10); // Limit to 10 results for performance
            setSearchedUsers(filteredUsers);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    // Function to select a user
    const selectUser = (user: any) => {
        setSelectedUser(user);
        setUserSearchText('');
        setSearchedUsers([]);
    };

    // Function to search trucks by name
    const searchTrucks = (truckName: string) => {
        if (!truckName.trim()) {
            setSearchedTrucks([]);
            return;
        }

        try {
            const filteredTrucks = allTrucks.filter((truck) =>
                truck.truckName && typeof truck.truckName === 'string' &&
                truck.truckName.toLowerCase().includes(truckName.toLowerCase())
            ).slice(0, 10); // Limit to 10 results for performance
            setSearchedTrucks(filteredTrucks);
        } catch (error) {
            console.error('Error searching trucks:', error);
        }
    };

    // Function to select a truck
    const selectTruck = (truck: any) => {
        setSelectedTruck(truck);
        setTruckSearchText('');
        setSearchedTrucks([]);
    };

    const handleAddDriver = async () => {
        if (isEditMode) {
            return handleUpdateDriver();
        }
        if (!user?.uid) {
            ToastAndroid.show('User not authenticated', ToastAndroid.SHORT);
            return;
        }

        if (!currentFleet?.fleetId) {
            ToastAndroid.show('No fleet selected', ToastAndroid.SHORT);
            return;
        }

        if (!selectedUser) {
            ToastAndroid.show('Please select a user to assign as driver', ToastAndroid.SHORT);
            return;
        }

        if (!selectedTruck) {
            ToastAndroid.show('Please select a truck to assign the driver to', ToastAndroid.SHORT);
            return;
        }

        // Check if driver is already assigned as main to another truck
        if (driverRole === 'main') {
            const existingMainAssignment = allTrucks.find(truck =>
                truck.mainDriver?.userId === selectedUser.uid && truck.id !== selectedTruck.id
            );
            if (existingMainAssignment) {
                ToastAndroid.show('This driver is already assigned as Main Driver to another truck', ToastAndroid.SHORT);
                return;
            }
        }

        // Check if truck already has a main driver
        if (driverRole === 'main' && selectedTruck.mainDriver) {
            ToastAndroid.show('This truck already has a Main Driver assigned', ToastAndroid.SHORT);
            return;
        }

        // Check if truck already has a second main driver
        if (driverRole === 'second_main' && selectedTruck.secondMainDriver) {
            ToastAndroid.show('This truck already has a Second Main Driver assigned', ToastAndroid.SHORT);
            return;
        }

        // Check driver's truck limit (max 4 trucks)
        const driverTruckCount = allTrucks.reduce((count, truck) => {
            const hasDriver = truck.mainDriver?.userId === selectedUser.uid ||
                             truck.secondMainDriver?.userId === selectedUser.uid ||
                             (truck.backupDrivers || []).some((backup: any) => backup.userId === selectedUser.uid);
            return hasDriver ? count + 1 : count;
        }, 0);

        if (driverTruckCount >= 4) {
            ToastAndroid.show('This driver is already assigned to 4 trucks (maximum limit)', ToastAndroid.SHORT);
            return;
        }

        if (!fullName.trim() || !phoneNumber.trim() || !driverLicense || !passport || !internationalPermit) {
            ToastAndroid.show('Please fill all required fields', ToastAndroid.SHORT);
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload the driver's license image
            const licenseUrl = await uploadImage(driverLicense, "DriverLicenses", () => {}, "Uploading driver's license");

            if (!licenseUrl) {
                ToastAndroid.show('Failed to upload driver license', ToastAndroid.SHORT);
                return;
            }

            // Upload the passport image
            const passportUrl = await uploadImage(passport, "DriverPassports", () => {}, "Uploading passport");

            if (!passportUrl) {
                ToastAndroid.show('Failed to upload passport', ToastAndroid.SHORT);
                return;
            }

            // Upload the international permit image
            const permitUrl = await uploadImage(internationalPermit, "DriverPermits", () => {}, "Uploading international permit");

            if (!permitUrl) {
                ToastAndroid.show('Failed to upload international permit', ToastAndroid.SHORT);
                return;
            }

            // Create driver data
            const fixedDriverId = `DRV_${selectedUser.uid}_${currentFleet.fleetId}`;

            const driverData = {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                driverLicenseUrl: licenseUrl,
                passportUrl: passportUrl,
                internationalPermitUrl: permitUrl,
                fleetId: currentFleet.fleetId,
                userId: selectedUser.uid,
                mainTruck :{
                    truckId: selectedTruck.id,
                    truckName: selectedTruck.truckName,
                    driverRole: driverRole,

                },
                docId: fixedDriverId, // Will be set after document creation
                createdAt: new Date().toISOString(),
                status: 'active'
            };

            // Add to Fleet collection under fleetId as subcollection with fixed ID
            const driverId = await addDocumentWithId(`fleets/${currentFleet.fleetId}/Drivers`, fixedDriverId, driverData);

           
            if (driverId) {
                // Update the selected user's personalData with fleet access
                const existingFleets = selectedUser?.fleets || [];
                const newFleetAccess = {
                    fleetId: currentFleet.fleetId,
                    role: 'driver',
                    companyName: currentFleet.companyName,
                    accepted: false // User needs to accept the role
                };

                await updateDocument('personalData', selectedUser.uid, {
                    fleets: [...existingFleets, newFleetAccess],
                    updatedAt: new Date().toISOString()
                });

                // Update the selected truck's driver assignments based on role
                const updateData: any = {
                    updatedAt: new Date().toISOString()
                };

                const driverInfo = {
                    driverId: driverId,
                    fullName: fullName.trim(),
                    userId: selectedUser.uid,
                    email: selectedUser.email,
                    phoneNumber: phoneNumber.trim(),
                    truckId: selectedTruck.id,
                    truckName: selectedTruck.truckName,
                    docId: driverId,
                    assignedAt: new Date().toISOString()
                };

                if (driverRole === 'main') {
                    updateData.mainDriver = driverInfo;
                } else if (driverRole === 'second_main') {
                    updateData.secondMainDriver = driverInfo;
                } else {
                    // backup driver
                    const existingBackupDrivers = selectedTruck.backupDrivers || [];
                    updateData.backupDrivers = [...existingBackupDrivers, driverInfo];
                }

                await updateDocument(`fleets/${currentFleet.fleetId}/Trucks`, selectedTruck.id, updateData);

                ToastAndroid.show('Driver added successfully', ToastAndroid.SHORT);
                router.back();
            } else {
                ToastAndroid.show('Failed to add driver', ToastAndroid.SHORT);
            }
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

        if (!currentFleet?.fleetId || !existingDriver?.id) {
            ToastAndroid.show('Driver data not available', ToastAndroid.SHORT);
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
                licenseUrl = await uploadImage(driverLicense, "DriverLicenses", () => {}, "Uploading driver's license");
            }
            if (passport) {
                passportUrl = await uploadImage(passport, "DriverPassports", () => {}, "Uploading passport");
            }
            if (internationalPermit) {
                permitUrl = await uploadImage(internationalPermit, "DriverPermits", () => {}, "Uploading international permit");
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

            await updateDocument(`fleets/${currentFleet.fleetId}/Drivers`, existingDriver.id, updateData);

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
                    {isEditMode ? "Update driver information and re-upload documents if needed." : "Enter driver details and upload required documents."}
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

                {!isEditMode && (
                    <>
                        <ThemedText>Search and Select User<ThemedText color="red">*</ThemedText></ThemedText>
                        <Input
                            placeholder="Search users by email or name..."
                            value={userSearchText}
                            onChangeText={(text) => {
                                setUserSearchText(text);
                                searchUsers(text);
                            }}
                        />
                        {searchedUsers.length > 0 && (
                            <View style={{
                                maxHeight: hp(25),
                                borderWidth: 1,
                                borderColor: icon,
                                borderRadius: wp(2),
                                marginTop: wp(1),
                                backgroundColor: background,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 5
                            }}>
                                <ScrollView keyboardShouldPersistTaps="handled">
                                    {searchedUsers.map(user => (
                                        <TouchableOpacity
                                            key={user.id}
                                            style={{
                                                padding: wp(3),
                                                borderBottomWidth: 0.5,
                                                borderBottomColor: icon + '30',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                            onPress={() => selectUser(user)}
                                        >
                                            <View>
                                                <ThemedText style={{ fontWeight: 'bold' }}>{user.email}</ThemedText>
                                                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                                    {user.firstName || 'N/A'} {user.lastName || ''}
                                                </ThemedText>
                                            </View>
                                            <Ionicons name="add-circle" size={wp(5)} color={accent} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                        {selectedUser && (
                            <View style={{ backgroundColor: accent + '20', padding: wp(2), marginTop: wp(2), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center' }}>
                                <ThemedText style={{ marginRight: wp(2) }}>{selectedUser.email}</ThemedText>
                                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                    <Ionicons name="close" size={wp(4)} color={accent} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* Truck Search and Selection */}
                <ThemedText>Search and Assign Truck<ThemedText color="red">*</ThemedText></ThemedText>
                <Input
                    placeholder="Search trucks by name..."
                    value={truckSearchText}
                    onChangeText={(text) => {
                        setTruckSearchText(text);
                        searchTrucks(text);
                    }}
                />
                {searchedTrucks.length > 0 && (
                    <View style={{
                        maxHeight: hp(30), // Fixed height for truck selection
                        width: '100%',
                        borderWidth: 1,
                        borderColor: icon,
                        borderRadius: wp(2),
                        marginTop: wp(1),
                        backgroundColor: background,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5
                    }}>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {searchedTrucks.map(truck => (
                                <TouchableOpacity
                                    key={truck.id}
                                    style={{
                                        padding: wp(3),
                                        borderBottomWidth: 0.5,
                                        borderBottomColor: icon + '30',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                    onPress={() => selectTruck(truck)}
                                >
                                    <View>
                                        <ThemedText style={{ fontWeight: 'bold' }}>{truck.truckName}</ThemedText>
                                        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                                            {truck.truckType} - {truck.truckCapacity}
                                        </ThemedText>
                                    </View>
                                    <Ionicons name="add-circle" size={wp(5)} color={accent} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {selectedTruck && (
                    <View style={{ marginTop: wp(2),width:wp(70) }}>
                        <ThemedText>Driver Role for {selectedTruck.truckName}<ThemedText color="red">*</ThemedText></ThemedText>
                        <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(2) }}>
                            {[
                                { key: 'main', label: 'Main Driver', desc: 'Primary driver' },
                                { key: 'second_main', label: 'Second Main', desc: 'Secondary primary' },
                                { key: 'backup', label: 'Backup Driver', desc: 'Backup driver' }
                            ].map((role) => (
                                <TouchableOpacity
                                    key={role.key}
                                    onPress={() => setDriverRole(role.key as 'main' | 'second_main' | 'backup')}
                                    style={{
                                        flex: 1,
                                        // padding: wp(3),
                                        borderRadius: wp(2),
                                        borderWidth: 2,
                                        borderColor: driverRole === role.key ? accent : icon + '40',
                                        backgroundColor: driverRole === role.key ? accent + '10' : 'transparent',
                                        alignItems: 'center'
                                    }}
                                >
                                    <ThemedText style={{
                                        fontWeight: driverRole === role.key ? 'bold' : 'normal',
                                        color: driverRole === role.key ? accent : text,
                                        fontSize: wp(3)
                                    }}>
                                        {role.label}
                                    </ThemedText>
                                    <ThemedText style={{
                                        fontSize: wp(2.5),
                                        color: icon,
                                        marginTop: wp(0.5)
                                    }}>
                                        {role.desc}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ backgroundColor: accent + '20', padding: wp(2), marginTop: wp(2), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText style={{ fontWeight: 'bold' }}>{selectedTruck.truckName}</ThemedText>
                                <ThemedText style={{ fontSize: wp(2.5), color: icon, marginTop: wp(0.5) }}>
                                    Role: {driverRole === 'main' ? 'Main Driver' : driverRole === 'second_main' ? 'Second Main' : 'Backup Driver'}
                                </ThemedText>
                                <ThemedText style={{ fontSize: wp(2.5), color: icon, marginTop: wp(0.5) }}>
                                    Type: {selectedTruck.truckType} - Capacity: {selectedTruck.truckCapacity}
                                </ThemedText>
                            </View>
                            <TouchableOpacity onPress={() => {
                                setSelectedTruck(null);
                                setDriverRole('backup');
                            }}>
                                <Ionicons name="close" size={wp(4)} color={accent} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View>
                    <ThemedText>Driver's License<ThemedText color="red">*</ThemedText></ThemedText>
                    <View style={{
                        borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                        shadowColor: '#4285f4',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 13, borderRadius: 10, marginBottom: 0, padding: 5, width: wp(92), height: wp(50), alignSelf: 'center'
                    }}>
                        {driverLicense && (
                            <Image source={{ uri: driverLicense.uri }} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                        )}
                        {driverLicense && (
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
                        {!driverLicense && <ThemedText style={{ fontSize: 14.5, textAlign: "center", marginTop: wp(10) }}>Driver's License</ThemedText>}
                        {!driverLicense && <TouchableOpacity
                            onPress={() => selectImage((image) => setDriverLicense(image))}
                            style={{ height: wp(27), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                            <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                            <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>Take Photo<ThemedText color="red">*</ThemedText></ThemedText>
                        </TouchableOpacity>}
                    </View>
                    {driverLicense && (
                        <ThemedText style={{ fontSize: wp(2.5), color: icon, textAlign: 'center', marginTop: wp(1) }}>
                            License uploaded successfully
                        </ThemedText>
                    )}
                </View>

                <ScrollView horizontal style={{ height: 133, marginTop: wp(4) }}>
                    <View style={{
                        borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                        shadowColor: '#4285f4',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 13, marginLeft: 5, marginRight: 19, borderRadius: 10, marginBottom: 0, padding: 5, width: 146
                    }}>
                        {passport && (
                            <Image source={{ uri: passport.uri }} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                        )}
                        {passport && (
                            <TouchableOpacity
                                onPress={() => setPassport(null)}
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
                        {!passport && <ThemedText style={{ fontSize: 14.5, textAlign: "center" }}>Passport</ThemedText>}
                        {!passport && <TouchableOpacity
                            onPress={() => selectImage((image) => setPassport(image))}
                            style={{ height: wp(27), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                            <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                            <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>Take Photo<ThemedText color="red">*</ThemedText></ThemedText>
                        </TouchableOpacity>}
                    </View>

                    <View style={{
                        borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                        shadowColor: '#4285f4',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 13, marginRight: 6, borderRadius: 10, marginBottom: 0, padding: 5, width: 146
                    }}>
                        {internationalPermit && (
                            <Image source={{ uri: internationalPermit.uri }} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />
                        )}
                        {internationalPermit && (
                            <TouchableOpacity
                                onPress={() => setInternationalPermit(null)}
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
                       {!internationalPermit && <ThemedText style={{ fontSize: 14.5, textAlign: "center" }}>International Permit</ThemedText>}
                       {!internationalPermit && <TouchableOpacity
                           onPress={() => selectImage((image) => setInternationalPermit(image))}
                           style={{ height: wp(27), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                           <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                           <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>Take Photo<ThemedText color="red">*</ThemedText></ThemedText>
                       </TouchableOpacity>}
                   </View>

                   {passport && (
                       <ThemedText style={{ fontSize: wp(2.5), color: icon, textAlign: 'center', marginTop: wp(1) }}>
                           Passport uploaded successfully
                       </ThemedText>
                   )}
                   {internationalPermit && (
                       <ThemedText style={{ fontSize: wp(2.5), color: icon, textAlign: 'center', marginTop: wp(1) }}>
                           International Permit uploaded successfully
                       </ThemedText>
                   )}
               </ScrollView>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: accent }]}
                    onPress={handleAddDriver}
                    disabled={isSubmitting}
                >
                    <Ionicons name="add" size={wp(6)} color="white" />
                    <ThemedText style={styles.buttonText}>
                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Driver' : 'Add Driver')}
                    </ThemedText>
                </TouchableOpacity>
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
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
