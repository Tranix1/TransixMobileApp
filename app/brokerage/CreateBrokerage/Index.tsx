import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import { HorizontalTickComponent } from '@/components/SlctHorizonzalTick';
import { DocumentUploader } from '@/components/DocumentUploader';
import { Dropdown } from 'react-native-element-dropdown';
import { countryCodes } from '@/data/appConstants';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { pickDocument } from '@/Utilities/utils';
import { takePhoto } from '@/Utilities/imageUtils';
import { DocumentAsset } from '@/types/types';
import Heading from '@/components/Heading';
import { useAuth } from '@/context/AuthContext';
import { updateDocument, generateUniqueReferrerCode, checkDocumentExists, addDocumentWithId } from '@/db/operations';
import { uploadImage } from '@/db/operations';
import { setDoc, doc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { addDocument } from '@/db/operations';
import { LocationPicker } from '@/components/LocationPicker';
import { SelectLocationProp } from '@/types/types';
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
import { FontAwesome } from '@expo/vector-icons';
import { Countries } from '@/types/types';
import { router } from 'expo-router';

const CreaterBrokerage = ({ }) => {
  const icon = useThemeColor('icon');
  const background = useThemeColor('background');
  const accent = useThemeColor("accent")
  const { user } = useAuth();

  // Broker verification state
  const [typeOfBroker, setTypeOfBroker] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerEmail, setBrokerEmail] = useState('');

  const [operationCountries, setOperationCountries] = useState<string[]>([]);
  const [showCountries, setShowCountries] = useState(false);

  const [locationFull, setLocationFull] = useState<SelectLocationProp | null>(null);

  const [brokerCountryCode, setBrokerCountryCode] = useState({ id: 0, name: '' });
  const [selectedBrokerDocuments, setSelectedBrokerDocuments] = useState<DocumentAsset[]>([
    user?.idDocument ? { name: 'ID Document', uri: user.idDocument, size: 0, mimeType: user.idDocumentType || 'image/jpeg' } : null,
    user?.proofOfResidence ? { name: 'Proof of Residence', uri: user.proofOfResidence, size: 0, mimeType: user.proofOfResidenceType || 'image/jpeg' } : null,
    user?.selfieDocument ? { name: 'Selfie', uri: user.selfieDocument, size: 0, mimeType: user.selfieDocumentType || 'image/jpeg' } : null,
    null, null
  ].filter(Boolean) as DocumentAsset[]);
  const [brokerFileType, setBrokerFileType] = useState<('pdf' | 'image' | 'doc' | 'docx')[]>([
    user?.idDocumentType || 'image',
    user?.proofOfResidenceType || 'image',
    user?.selfieDocumentType || 'image',
    'pdf', 'pdf'
  ]);
  const [uploadingBrokerD, setUploadingBrokerD] = useState(false);

  const handleBrokerSave = async (brokerData: any) => {
    setUploadingBrokerD(true);


    let errors = [];

    if (!brokerName) errors.push('Brokerage name');
    if (!brokerPhone) errors.push('Brokerage phone');
    if (!locationFull?.description) errors.push('Select your office location');

    if (!typeOfBroker) errors.push("Type of broker`")

    if (errors.length > 0) {
      Alert.alert(
        'Incomplete setup',
        `Please complete: ${errors.join('\n')}`
      );
    setUploadingBrokerD(false);

      return;
    }


    if (selectedBrokerDocuments.length < 3 && typeOfBroker === "Individual Broker") {
      Alert.alert(
        'Verification incomplete',
        'Please upload all required documents to complete verification.'
      );
    setUploadingBrokerD(false);

      return
    }
    if (selectedBrokerDocuments.length < 5 && typeOfBroker === "Company Broker") {
      Alert.alert(
        'Verification incomplete',
        'Please upload all required documents to complete verification.'
      );
    setUploadingBrokerD(false);

      return
    }



    try {
      // Upload documents to Firebase Storage and get URLs
      const uploadPromises = brokerData.selectedBrokerDocuments.map(async (doc: DocumentAsset, index: number) => {
        if (!doc) return null;
        const folderName = 'BrokerVerification';
        const fileName = `${user?.uid}_broker_doc_${index}`;
        return await uploadImage(doc, folderName, () => { }, fileName);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const brokerageId = `BRK_${Date.now()}_${user?.uid}`;

      const code = await generateUniqueReferrerCode();

      // Prepare broker verification data
      const brokerVerificationData = {
        userId: user?.uid,
        organizationId: brokerageId,
        accType: 'brokerage',

        organizationName: brokerName,
        phoneNumber: brokerPhone,
        email: brokerEmail,
        countryCode: brokerCountryCode?.name,
        organizationPhone: brokerPhone,

        location: locationFull,
        operationCountries :operationCountries,

        organizationAdminPhone: user?.phoneNumber,
        organizationAdminEmail: user?.email,
        organizationMainAdminName: user?.displayName,

        typeOfBroker: typeOfBroker,
        documents: {
          nationalId: uploadedUrls[0],
          nationalIdType: brokerData.brokerFileType[0],
          proofOfResidence: uploadedUrls[1],
          proofOfResidenceType: brokerData.brokerFileType[1],
          selfieDocument: uploadedUrls[2],
          selfieDocumentType: brokerData.brokerFileType[2],
          ...(brokerData.typeOfBroker === "Company Broker" && {
            companyRegistrationCertificate: uploadedUrls[3],
            companyRegistrationCertificateType: brokerData.brokerFileType[3],
            companyLetterHead: uploadedUrls[4],
            companyLetterHeadType: brokerData.brokerFileType[4],
          })
        },
        verificationStatus: 'pending',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // Additional scalable fields
        performanceMetrics: {
          totalLoads: 0,
          completedLoads: 0,
          revenue: 0,
          rating: 0
        }
      };

      await addDocument('verifiedUsers', brokerVerificationData);





      // ===============================
      // Check if broker trial was used
      // ===============================

      const trialAlreadyUsed = await checkDocumentExists(
        "subscriptions",
        [
          where("type", "==", "broker"),
          where("userId", "==", user?.uid),
          where("isTrial", "==", true),
        ]
      );

      let subscriptionData;

      const createdAt = Date.now();

      if (!trialAlreadyUsed) {

        // 30 Day Trial
        const trialEndDate = new Date(createdAt);
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const trialEndsAt = trialEndDate.getTime();

        subscriptionData = {
          plan: "Broker Trial",

          active: true,

          isTrial: true,

          trialEndsAt,

          billedAt: null,

          expiresAt: trialEndsAt,
        };


        // Save trial history
        await addDocument("subscriptions", {

          type: "broker",

          brokerageId,

          userId: user?.uid,

          plan: "Broker Trial",

          isTrial: true,

          trialStartedAt: createdAt,

          trialEndsAt,

          billedAt: null,

          expiresAt: trialEndsAt,

          amount: 0,

          createdAt,

        });


      } else {

        // No trial available - subscription required
        const expiresDate = new Date(createdAt);
        expiresDate.setDate(expiresDate.getDate() + 30);

        const expiresAt = expiresDate.getTime();


        subscriptionData = {

          plan: "Broker Monthly",

          active: false,

          isTrial: false,

          trialEndsAt: null,

          billedAt: createdAt,

          expiresAt,

        };

      }


      const brokerCollectionData = {
        name: brokerName,
        organizationPhone: brokerPhone,
        organizationEmail: brokerEmail,

        ownerId: user?.uid,
        id: brokerageId,
        location: locationFull,
        operationCountries:operationCountries,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        brokerType: typeOfBroker,
        defaultFleets: [],

        verificationStatus: "pending",
        organizationId: brokerageId,

        expoPushToken: user?.expoPushToken || null,

        subscription: subscriptionData,
      };





      await setDoc(doc(db, "brokerages", brokerageId), brokerCollectionData);

      // Store in verifiedUsers collection
      const existingAccs = user?.brokerDetails || [];




      const newBroker = {

        name: brokerName,
        organizationPhone: brokerPhone,
        organizationEmail: brokerEmail,

        ownerId: user?.uid,
        id: brokerageId,
        location: locationFull,
        operationCountries:operationCountries,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        brokerType: typeOfBroker,
        defaultFleets: [],

        verificationStatus: "pending",
        organizationId: brokerageId,

        expoPushToken: user?.expoPushToken || null,
        role: "Owner",

        subscription: {
          active: subscriptionData.active,
          plan: subscriptionData.plan,
          expiresAt: subscriptionData.expiresAt,
          isTrial: subscriptionData.isTrial,
        },
      };

      // Update user profile to reflect broker verification status
      await updateDocument('personalData', user?.uid!, {
        brokergeDetails: [...existingAccs, newBroker],
        updatedAt: new Date().toISOString()
      });


      await addDocumentWithId(`organizationProfiles`, brokerageId, {
        organizationId: brokerageId,
        type: "brokerage", // or "fleet"

        name: brokerName,
        profilePhoto: user?.photoURL || null,
        coverPhoto: null,
        description: "",
        ownerId: user?.uid,
        ownerName: user?.displayName || user?.organisation,

        location: locationFull,
        operationCountries:operationCountries,

        verificationStatus: "pending",

        createdAt: Date.now()
      }

      )



      const contactDetails = {
        userName: user?.displayName,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        photoUrl: user?.photoURL,
        userId: user?.uid,
        userRole: "owner",
        status: "active",
      }

      const contactRef = doc(db, 'brokerages', brokerageId, 'Contacts', `OWN_${user?.uid}`);
      await setDoc(contactRef, contactDetails);



      // Close modal and show success
      setUploadingBrokerD(false);
      alert('Broker verification submitted successfully! Your account will be reviewed.');
      router.back()

    } catch (error) {
      console.error('Error saving broker verification:', error);
      setUploadingBrokerD(false);
      alert('Error submitting broker verification. Please try again.');
    }
  };
  // UI STATES
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [dsplocation, setDspDspLocation] = useState(false);

  return (
    <ScreenWrapper>
      <Heading page='Create Brokerage' />

      <View style={{ gap: wp(2), padding:15 }}>

        <ScrollView>

          <ThemedText>Name</ThemedText>
          <Input
            placeholder="Enter your full name"
            value={brokerName}
            onChangeText={setBrokerName}
          />

          <ThemedText>Phone Number</ThemedText>
          <Input
            Icon={<>
              <Dropdown
                style={[{ width: wp(15) }]}
                selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
                data={countryCodes}
                maxHeight={hp(60)}
                labelField="name"
                valueField="name"
                placeholder="+00"
                value={brokerCountryCode?.name}
                itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                activeColor={background}
                containerStyle={{
                  borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
                  width: wp(30),
                  shadowOffset: { width: 0, height: 9 },
                  shadowOpacity: 0.50,
                  shadowRadius: 12.35,
                  elevation: 19,
                  paddingVertical: wp(1)
                }}
                onChange={item => setBrokerCountryCode(item)}
                renderLeftIcon={() => <></>}
                renderRightIcon={() => <Ionicons name="chevron-down" size={wp(4)} color={icon} />}
                renderItem={((item, selected) =>
                  <>
                    <View style={[styles.item, selected && {}]}>
                      <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                      {selected && (
                        <Ionicons color={icon} name='checkmark-outline' size={wp(5)} />
                      )}
                    </View>
                    <Divider />
                  </>
                )}

              />

              <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
            </>}
            value={brokerPhone}
            placeholder="700 000 000"
            keyboardType='numeric'
            onChangeText={setBrokerPhone}
          />

          <ThemedText>Email Address</ThemedText>
          <Input
            placeholder="Enter your email"
            value={brokerEmail}
            onChangeText={setBrokerEmail}
          />

          <ThemedText>Select your office location</ThemedText>

          <TouchableOpacity
            style={[styles.input,]}
            onPress={() => setDspDspLocation(true)}
          >
            <ThemedText>
              {locationFull?.description ||
                'Operating Location'}
            </ThemedText>
          </TouchableOpacity>


          {/* DESTINATION PICKER ONLY */}
          <GooglePlaceAutoCompleteComp
            dspRoute={dsplocation}
            setDspRoute={setDspDspLocation}
            setRoute={setLocationFull}
            topic="Operating Location"
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



          <View style={{marginTop:hp(2), marginBottom:hp(2)}}>

            <ThemedText style={{ marginBottom: wp(2),color:accent}}>
              {operationCountries?.join(', ') || '--'}
            </ThemedText>

            <ThemedText>
              Select the countries where your brokerage operates.
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
          </View>





          <ThemedText>Type of Broker</ThemedText>
          <HorizontalTickComponent
            data={[
              { value: "Individual Broker", topic: "Individual Broker" },
              { value: "Company Broker", topic: "Company Broker" }
            ]}
            condition={typeOfBroker}
            onSelect={setTypeOfBroker}
          />

          <DocumentUploader
            documents={selectedBrokerDocuments[0]}
            title="National ID / Passport"
            subtitle="Upload your National ID or Passport (PDF or Image)"
            buttonTiitle="National ID / Passport"
            onPickDocument={() => {
              pickDocument(setSelectedBrokerDocuments, setBrokerFileType);
            }}
          />

          <DocumentUploader
            documents={selectedBrokerDocuments[1]}
            title="Proof of Residence"
            subtitle="Upload utility bill, lease, or bank statement (PDF or Image)"
            buttonTiitle="Proof of Residence"
            onPickDocument={() => {
              pickDocument(setSelectedBrokerDocuments, setBrokerFileType);
            }}
            disabled={!selectedBrokerDocuments[0]}
            toastMessage="Please upload National ID first"
          />

          <DocumentUploader
            documents={selectedBrokerDocuments[2]}
            title="Live Selfie with ID"
            subtitle="Take a live photo holding your ID (Camera required)"
            buttonTiitle="Take Live Selfie"
            onPickDocument={() => takePhoto((image) => {
              setSelectedBrokerDocuments(prev => [prev[0], prev[1], {
                name: 'selfie.jpg',
                uri: image.uri,
                size: image.fileSize || 0,
                mimeType: image.mimeType || 'image/jpeg'
              }, ...prev.slice(3)]);
              setBrokerFileType(prev => ['image', 'image', ...prev.slice(2)]);
            })}
            disabled={!selectedBrokerDocuments[0] || !selectedBrokerDocuments[1]}
            toastMessage="Upload National ID and proof of residence first"
          />

          {typeOfBroker === "Company Broker" && (
            <>
              <DocumentUploader
                documents={selectedBrokerDocuments[3]}
                title="Company Registration Certificate"
                subtitle="Upload company registration certificate (PDF or Image)"
                buttonTiitle="Company Registration"
                onPickDocument={() => pickDocument(setSelectedBrokerDocuments, setBrokerFileType)}
                disabled={!selectedBrokerDocuments[2]}
                toastMessage="Upload selfie first"
              />

              <DocumentUploader
                documents={selectedBrokerDocuments[4]}
                title="Company Letter Head"
                subtitle="Upload company letter head (PDF or Image)"
                buttonTiitle="Company Letter Head"
                onPickDocument={() => pickDocument(setSelectedBrokerDocuments, setBrokerFileType)}
                disabled={!selectedBrokerDocuments[3]}
                toastMessage="Upload company registration certificate first"
              />
            </>
          )}

          <Button
            onPress={() => handleBrokerSave({
              typeOfBroker,
              brokerName,
              brokerPhone,
              brokerEmail,
              brokerCountryCode,
              selectedBrokerDocuments,
              brokerFileType
            })}
            loading={uploadingBrokerD}
            disabled={uploadingBrokerD}
            title={uploadingBrokerD ? "Saving..." : "Save"}
            colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
            style={{ height: 44 }}
          />

          <View style={{ height: 140 }} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default CreaterBrokerage;


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
  input: {
    marginTop: wp(2),
    padding: wp(3),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp(2),
  },
};
