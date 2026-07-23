import React, { useState } from 'react';
import { Alert, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import { DocumentUploader } from '@/components/DocumentUploader';
import { Dropdown } from 'react-native-element-dropdown';
import { countryCodes } from '@/data/appConstants';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { pickDocument } from '@/Utilities/utils';
import { takePhoto } from '@/Utilities/imageUtils';
import { DocumentAsset } from '@/types/types';
import { useAuth } from '@/context/AuthContext';
import { addDocument, uploadImage, updateDocument, generateUniqueReferralCode, addDocumentWithId } from '@/db/operations';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import CustomHeader from '@/components/CustomHeader';
import Heading from '@/components/Heading';
import { LocationSelector } from '@/components/LocationSelector';
import { SelectLocationProp } from '@/types/types';
import { FontAwesome } from '@expo/vector-icons';
import { Countries } from '@/types/types';
import { trackEvent } from '@/services/analytics/appAnalytics';
import { incrementAccountsCreated } from '@/services/analytics/dashboardAnalytics';

const CreateFleet = () => {
    const router = useRouter();
    const { user, setCurrentRole, setupUser ,  currentRole } = useAuth();
    const [typeOfFleet, setTypeOfFleet] = useState('');
    const [fleetName, setFleetName] = useState('');
    const [fleetPhone, setFleetPhone] = useState('');
    const [fleetEmail, setFleetEmail] = useState('');
    const [fleetCountryCode, setFleetCountryCode] = useState({ id: 0, name: '' });
    const [selectedFleetDocuments, setSelectedFleetDocuments] = useState<DocumentAsset[]>([]);
    const [fleetFileType, setFleetFileType] = useState<('pdf' | 'image' | 'doc' | 'docx')[]>([]);
    const [uploadingFleetD, setUploadingFleetD] = useState(false);

    const [operationCountries, setOperationCountries] = useState<string[]>([]);
    const [showCountries, setShowCountries] = useState(false);


    const [baseAdress, setBaseAdress] = useState<SelectLocationProp | null>(null);
    const [billingAddress, setbillingAddress] = useState<SelectLocationProp | null>(null);


    const [dspFromLocation, setDspFromLocation] = useState(false);
    const [locationPicKERdSP, setPickLocationOnMap] = useState(false);
    const [dspToLocation, setDspToLocation] = useState(false);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [durationInTraffic, setDurationInTraffic] = useState("");

    const icon = useThemeColor('icon');
    const background = useThemeColor('background');
    const accent = useThemeColor("accent")

    const styles = {
        selectedTextStyle: {
            fontSize: 16,
        },
        item: {
            padding: 17,
            gap: wp(2),
            flexDirection: 'row' as const,
            justifyContent: 'space-between' as const,
            alignItems: 'center' as const,
            borderRadius: wp(1),
            marginBottom: 5,
        },
    };

    const handleFleetSave = async (fleetData: {
        typeOfFleet: string;
        fleetName: string;
        fleetPhone: string;
        fleetEmail: string;
        fleetCountryCode: { id: number; name: string };
        selectedFleetDocuments: DocumentAsset[];
        fleetFileType: ('pdf' | 'image' | 'doc' | 'docx')[];
    }) => {
        if (!user) {
            Alert.alert('Unable to save fleet', 'You must be signed in to submit fleet verification.');

            return;
        }

        let errors = [];

        if (!fleetName) errors.push('Fleet name');
        if (!fleetPhone) errors.push('Fleet phone');
        if (!billingAddress?.description) errors.push('Billing address');
        if (!baseAdress?.description) errors.push('Base location');
        if (operationCountries.length <= 0) errors.push('Select countries fleet operates');

        if (errors.length > 0) {
            Alert.alert(
                'Incomplete setup',
                `Please complete: ${errors.join(', ')}`
            );
            return;
        }


        if (fleetData.selectedFleetDocuments.length < 4) {
            Alert.alert(
                'Verification incomplete',
                'Please upload all required documents to complete verification.'
            );
            return
        }

        setUploadingFleetD(true);
        try {
            const fleetId = `FLT_${Date.now()}_${user.uid}`;

            const uploadPromises = fleetData.selectedFleetDocuments.map(async (docItem: DocumentAsset, index: number) => {
                if (!docItem) return null;
                const folderName = 'FleetVerification';
                const fileName = `${user.uid}_${fleetId}_doc_${index}`;
                return await uploadImage(docItem, folderName, () => { }, fileName);
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            const fleetVerificationData = {
                organizationId: fleetId,
                userId: user.uid,
                accType: 'fleet',
                organizationName: fleetData.fleetName,

                organizationEmail: fleetData.fleetEmail,
                organizationPhone:    fleetData.fleetPhone && fleetCountryCode.name ?
                `${fleetCountryCode.name}${fleetData.fleetPhone}`: user.phoneNumber  ,

                fleetMainAdminName: user.displayName,
                organizationAdminPhone: user.phoneNumber,

                countryCode: fleetData.fleetCountryCode?.name,
                typeOfFleet: fleetData.typeOfFleet,

                billingAddress: billingAddress?.description,
                billingAddressFull: billingAddress,

                baseAdress: baseAdress?.description,
                baseAdressFull: baseAdress,
                operationCountries:operationCountries,
                location: billingAddress || baseAdress,

                documents: {
                    fleetMainAdminId: uploadedUrls[0],
                    fleetMainAdminIdType: fleetData.fleetFileType[0],
                    proofOfResidence: uploadedUrls[1],
                    proofOfResidenceType: fleetData.fleetFileType[1],
                    selfieDocument: uploadedUrls[2],
                    selfieDocumentType: fleetData.fleetFileType[2],
                    companyCertificate: uploadedUrls[3],
                    companyCertificateType: fleetData.fleetFileType[3],
                    truckRegistrationBook: uploadedUrls[4],
                    // truckRegistrationBookType: fleetData.fleetFileType[4],
                },
                verificationStatus: 'pending',
                submittedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),

            };
            await addDocumentWithId('verifiedUsers',fleetId ,fleetVerificationData);



            const fleetCollectionData = {
                name: fleetData.fleetName,
                organizationPhone: fleetData.fleetPhone,
                organizationEmail: fleetData.fleetEmail,
                operationCountries:operationCountries,

                countryCode: fleetData.fleetCountryCode?.name,
                typeOfFleet: fleetData.typeOfFleet,
                billingAddress: billingAddress?.description,
                billingAddressFull: billingAddress,

                baseAdress: billingAddress?.description,
                baseAdressFull: billingAddress,
                location: billingAddress || baseAdress,

                ownerId: user.uid,
                fleetId,
                organizationId: fleetId,

                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'fleets', fleetId), fleetCollectionData);

            const existingFleets = user.fleets || [];
            const newFleetAccess = {
                fleetId,
                role: 'owner',
                companyName: fleetData.fleetName,
                countryCode: fleetData.fleetCountryCode?.name,
                organizationPhone: fleetData.fleetPhone,
                organizationEmail: fleetData.fleetEmail,

                typeOfFleet: fleetData.typeOfFleet,

                operationCountries:operationCountries,

                billingAddress: billingAddress?.description,
                billingAddressFull: billingAddress,

                baseAdress: baseAdress?.description,
                baseAdressFull: baseAdress,
                location: billingAddress || baseAdress,


            };

            await updateDocument('personalData', user.uid, {
                fleetVerified: true,
                fleets: [...existingFleets, newFleetAccess],
                updatedAt: new Date().toISOString(),
                verificationStatus: "pending"
            });

            const updatedUser = {
                ...user,
                fleetVerified: true,
                fleets: [...existingFleets, newFleetAccess],
                updatedAt: new Date().toISOString(),
            };
            await setupUser(updatedUser);






            await addDocumentWithId(`organizationProfiles`, fleetId, {
                organizationId: fleetId,
                type: "fleet", // or "fleet"

                name: fleetData.fleetName,
                profilePhoto: user.photoURL || null,
                coverPhoto: null,
                description: "",
                ownerId: user.uid,
                ownerName: user.displayName || user.organisation,

                location: billingAddress || baseAdress,
                operationCountries:operationCountries,

                verificationStatus: "pending",

                createdAt: Date.now() ,
            }

            )


            const contactDetails = {
                userName: user?.displayName,
                phoneNumber: user?.phoneNumber,
                photoUrl: user?.photoURL,
                userId: user?.uid,
                userRole: "owner",
                status: "active",
            }

            const contactRef = doc(db, 'fleets', fleetId, 'Contacts', `OWN_${user?.uid}`);
            await setDoc(contactRef, contactDetails);



            // const fleetRole = {
            //     role: 'fleet' as const,
            //     fleetId,
            //     companyName: fleetData.fleetName,
            //     userRole: 'owner',
            //     accType: 'fleet' as const,
            //     driverId: null,
            //     fleetMainAdminId: null,
            //     fleetManagerId: null,
            //     fleetDispatcherId: null,
            // };


            await addDocumentWithId(`fleets/${fleetId}/settings`, "config", {
                defaultRatePerKm: 2,

                notifications: {
                    loadAssigned: true,
                    loadAccepted: true,
                    loadCompleted: true,
                    rateUpdated: true
                }
            })

            void trackEvent({ eventName: "fleet_created", userId: user.uid, organizationId: fleetId, organizationProfileId: fleetId, organizationType: "fleet", role: "owner", accountType: "fleet", country: fleetData.fleetCountryCode?.name, metadata: { typeOfFleet: fleetData.typeOfFleet } }).catch(console.error);
            // Creates the derived dashboard document without changing its counters.
            void incrementAccountsCreated("fleet", fleetId, 0).catch(console.error);





            await setCurrentRole("fleet");

            Alert.alert('Fleet saved', 'Your fleet request has been submitted.');
            await router.replace('/');
        } catch (error) {
            console.error('Error saving fleet verification:', error);
            Alert.alert('Error submitting fleet verification', 'Please try again.');
        } finally {
            setUploadingFleetD(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: background,  }} >

        <View style={{paddingTop:currentRole.userRole==="create_Acc"?0: 36}}>

            <Heading page="Create Fleet" />
        </View>

            <View style={{ margin: hp(3) }}>

                <ScrollView>
                    <ThemedText>Company/Business Name</ThemedText>
                    <Input
                        placeholder="Enter company/business name"
                        value={fleetName}
                        onChangeText={setFleetName}
                    />
                    
                    <ThemedText>Fleet Phone Number</ThemedText>
                    <Input
                        Icon={
                            <>
                                <Dropdown
                                    style={[{ width: wp(15) }]}
                                    selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
                                    data={countryCodes}
                                    maxHeight={hp(60)}
                                    labelField="name"
                                    valueField="name"
                                    placeholder="+00"
                                    value={fleetCountryCode?.name}
                                    itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                                    activeColor={background}
                                    containerStyle={{
                                        borderRadius: wp(3),
                                        backgroundColor: background,
                                        borderWidth: 0,
                                        shadowColor: '#000',
                                        width: wp(30),
                                        shadowOffset: { width: 0, height: 9 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 12.35,
                                        elevation: 19,
                                        paddingVertical: wp(1),
                                    }}
                                    onChange={item => setFleetCountryCode(item)}
                                    renderLeftIcon={() => <></>}
                                    renderRightIcon={() => <Ionicons name="chevron-down" size={wp(4)} color={icon} />}
                                    renderItem={(item, selected) => (
                                        <>
                                            <View style={[styles.item, selected && {}]}>
                                                <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                                                {selected && <Ionicons color={icon} name="checkmark-outline" size={wp(5)} />}
                                            </View>
                                            <Divider />
                                        </>
                                    )}
                                />
                                <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
                            </>
                        }
                        value={fleetPhone}
                        placeholder="700 000 000"
                        onChangeText={setFleetPhone}
                        keyboardType='numeric'
                    />

                    


                    <LocationSelector
                        origin={billingAddress}
                        destination={baseAdress}
                        setOrigin={setbillingAddress}
                        setDestination={setBaseAdress}
                        dspFromLocation={dspFromLocation}
                        setDspFromLocation={setDspFromLocation}
                        dspToLocation={dspToLocation}
                        setDspToLocation={setDspToLocation}
                        locationPicKERdSP={locationPicKERdSP}
                        setPickLocationOnMap={setPickLocationOnMap}
                        distance={distance}
                        duration={duration}
                        durationInTraffic={durationInTraffic}
                        iconColor={'#004d40'}
                        frstInputtTopic="Billing address"
                        secondInputTopic="Base location"
                    />


                    <>

                        <ThemedText style={{ marginBottom: wp(2),color:accent,marginTop: wp(3) }}>
                            {operationCountries?.join(', ') || '--'}
                        </ThemedText>

                        <ThemedText>
                            Select the countries where your Fleet operates.<ThemedText color="red">*</ThemedText>
                        </ThemedText>

                        <View style={{
                            paddingVertical: wp(1),

                            gap: wp(1),
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            marginBottom: 16,
                        }}>
                            <TouchableOpacity
                                onPress={() => { setShowCountries(!showCountries); }}

                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                <ThemedText style={{ minHeight: hp(5), textAlignVertical: 'center' }}>
                                    Select Countrie(s)
                                </ThemedText>

                                <Ionicons name={showCountries ? 'chevron-up-outline' : "chevron-down"} size={wp(4)} color={icon} />
                            </TouchableOpacity>
                            {showCountries &&
                                <View>
                                    <Divider />
                                    {Countries.map((item) => {

                                        const active = operationCountries.some(x => x === item);

                                        return (
                                            <TouchableOpacity onPress={() => active ? setOperationCountries(operationCountries.filter(x => x !== item)) : setOperationCountries([...operationCountries, item])} style={{ padding: wp(2), marginVertical: wp(1), flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <ThemedText type="subtitle">
                                                    {item}
                                                </ThemedText>

                                                <FontAwesome name={active ? 'check-square' : "square-o"} size={wp(5)} color={active ? '#0f9d58' : icon} />
                                            </TouchableOpacity>
                                        )
                                    }
                                    )}

                                </View>
                            }

                        </View>
                    </>





                    <DocumentUploader
                        documents={selectedFleetDocuments[0]}
                        title="Fleet Main Admin ID / Passport"
                        subtitle="Upload fleet main admin ID or Passport (PDF or Image)"
                        buttonTiitle="Fleet Main Admin ID / Passport"
                        onPickDocument={() => {
                            pickDocument(setSelectedFleetDocuments, setFleetFileType);
                        }}
                    />

                    <DocumentUploader
                        documents={selectedFleetDocuments[1]}
                        title="Fleet Main Admin Proof of Residence"
                        subtitle="Upload fleet main admin utility bill, lease, or bank statement (PDF or Image)"
                        buttonTiitle="Fleet Proof of Address"
                        onPickDocument={() => {
                            pickDocument(setSelectedFleetDocuments, setFleetFileType);
                        }}
                        disabled={!selectedFleetDocuments[0]}
                        toastMessage="Please upload fleet main admin ID first"
                    />

                    <DocumentUploader
                        documents={selectedFleetDocuments[2]}
                        title="Fleet Main Admin Live Selfie with ID"
                        subtitle="Take a live photo holding fleet main admin ID (Camera required)"
                        buttonTiitle="Take Live Selfie"
                        onPickDocument={() =>
                            takePhoto(image => {
                                setSelectedFleetDocuments(prev => [
                                    prev[0],
                                    prev[1],
                                    {
                                        name: 'selfie.jpg',
                                        uri: image.uri,
                                        size: image.fileSize || 0,
                                        mimeType: image.mimeType || 'image/jpeg',
                                    },
                                    ...prev.slice(3),
                                ]);
                                setFleetFileType(prev => ['image', 'image', ...prev.slice(2)]);
                            })
                        }
                        disabled={!selectedFleetDocuments[0] || !selectedFleetDocuments[1]}
                        toastMessage="Upload fleet main admin ID and proof of residence first"
                    />

                    <DocumentUploader
                        documents={selectedFleetDocuments[3]}
                        title="Company Certificate"
                        subtitle="Upload company registration certificate (PDF or Image)"
                        buttonTiitle="Company Registration"
                        onPickDocument={() => pickDocument(setSelectedFleetDocuments, setFleetFileType)}
                        disabled={!selectedFleetDocuments[2]}
                        toastMessage="Upload fleet selfie first"
                    />

                    <DocumentUploader
                        documents={selectedFleetDocuments[4]}
                        title="One Truck Book Registered to Same Company"
                        subtitle="Upload one truck registration book registered to the same company (PDF or Image)"
                        buttonTiitle="Truck Registration Book"
                        onPickDocument={() => pickDocument(setSelectedFleetDocuments, setFleetFileType)}
                        disabled={!selectedFleetDocuments[3]}
                        toastMessage="Upload company certificate first"
                    />

                    <Button
                        onPress={() =>
                            handleFleetSave({
                                typeOfFleet,
                                fleetName,
                                fleetPhone,
                                fleetEmail,
                                fleetCountryCode,
                                selectedFleetDocuments,
                                fleetFileType,
                            })
                        }
                        loading={uploadingFleetD}
                        disabled={uploadingFleetD}
                        title={uploadingFleetD ? 'Saving...' : 'Save'}
                        colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
                        style={{ height: 44 }}
                    />

                    <View style={{ height: 140 }} />
                </ScrollView>
            </View>
        </View>
    );
};

export default CreateFleet;
