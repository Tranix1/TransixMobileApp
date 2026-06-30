import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
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
import { updateDocument, generateUniqueReferrerCode } from '@/db/operations';
import { uploadImage } from '@/db/operations';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { addDocument } from '@/db/operations';

const CreaterBrokerage = ({ }) => {
  const icon = useThemeColor('icon');
  const background = useThemeColor('background');
  const { user } = useAuth();

  // Broker verification state
  const [typeOfBroker, setTypeOfBroker] = useState('');
  const [brokerName, setBrokerName] = useState(user?.displayName || '');
  const [brokerPhone, setBrokerPhone] = useState(user?.phoneNumber || '');
  const [brokerEmail, setBrokerEmail] = useState(user?.email || '');
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
        brokerId: brokerageId,
        accType: 'brokerage',
        fullName: brokerData.brokerName,
        phoneNumber: brokerData.brokerPhone,
        email: brokerData.brokerEmail,
        countryCode: brokerData.brokerCountryCode?.name,
        typeOfBroker: brokerData.typeOfBroker,
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
        referrerCode: code,

        // Additional scalable fields
        performanceMetrics: {
          totalLoads: 0,
          completedLoads: 0,
          revenue: 0,
          rating: 0
        }
      };

      await addDocument('verifiedUsers', brokerVerificationData);


      // Create fleet document in fleets collection
      const brokerCollectionData = {
        name: brokerData.brokerName,
        ownerId: user?.uid, // link to verifiedUsers
        brokerId: brokerageId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        brokerType: brokerData.typeOfBroker,
        brokerEmail: brokerData.brokerEmail,
        countryCode: brokerData.brokerCountryCode?.name,
        brokerPhone: brokerData.brokerPhone,
        referrerCode: code,
        
      };

      await setDoc(doc(db, "brokerages", brokerageId), brokerCollectionData);

      // Store in verifiedUsers collection
      const existingAccs = user?.brokerDetails || [];

      const newBroker = {
        brokerageId: brokerageId,
        role: 'owner', // owner for the broker creator
        companyName: brokerData.brokerName,
        brokerType: brokerData.typeOfBroker,
        verificationStatus: "pending",
        referrerCode: code,


      };

      // Update user profile to reflect broker verification status
      await updateDocument('personalData', user?.uid!, {
        brokergePDetails: [...existingAccs, newBroker],
        updatedAt: new Date().toISOString()
      });



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

      const referrerData = {
        accType: "brokerage",
        organisationId: brokerageId, // Use Firebase Auth UID instead of document ID
        organisationEmail: brokerData.brokerEmail,
        organisationName: brokerData.brokerName,
        referrerCode: code,
        createdAt: new Date().toISOString(),
        isActive: true,
        brkOwnerId: user?.uid
      };

      await addDocument('referrers', referrerData);

      // Close modal and show success
      setUploadingBrokerD(false);
      alert('Broker verification submitted successfully! Your account will be reviewed.');

    } catch (error) {
      console.error('Error saving broker verification:', error);
      setUploadingBrokerD(false);
      alert('Error submitting broker verification. Please try again.');
    }
  };



  return (
    <ScreenWrapper>
      <Heading page='Create Brokerage' />

      <View style={{ gap: wp(2) }}>


        <ScrollView>


          <ThemedText>Full Name</ThemedText>
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
            onChangeText={setBrokerPhone}
          />

          <ThemedText>Email Address</ThemedText>
          <Input
            placeholder="Enter your email"
            value={brokerEmail}
            onChangeText={setBrokerEmail}
          />

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
};
