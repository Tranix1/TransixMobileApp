import React from 'react';
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

interface KYCVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  typeOfBrokerPersonal: string;
  setTypeOfBrokerPersonal: (value: string) => void;
  personalName: string;
  setPersonalName: (value: string) => void;
  personalPhone: string;
  setPersonalPhone: (value: string) => void;
  personalEmail: string;
  setPersonalEmail: (value: string) => void;
  personalCountryCode: { id: number; name: string };
  setPersonalCountryCode: (value: { id: number; name: string }) => void;
  selectedBrokerPersonalDocuments: DocumentAsset[];
  setSelectedBrokerPersonalDocuments: React.Dispatch<React.SetStateAction<DocumentAsset[]>>;
  brokerPersonalFileType: ('pdf' | 'image' | 'doc' | 'docx')[];
  setBrokerPersonalFileType: React.Dispatch<React.SetStateAction<('pdf' | 'image' | 'doc' | 'docx')[]>>;
  uploadingPersonalD: boolean;
  onSave: () => void;
}

const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({
  visible,
  onClose,
  typeOfBrokerPersonal,
  setTypeOfBrokerPersonal,
  personalName,
  setPersonalName,
  personalPhone,
  setPersonalPhone,
  personalEmail,
  setPersonalEmail,
  personalCountryCode,
  setPersonalCountryCode,
  selectedBrokerPersonalDocuments,
  setSelectedBrokerPersonalDocuments,
  brokerPersonalFileType,
  setBrokerPersonalFileType,
  uploadingPersonalD,
  onSave,
}) => {
  const icon = useThemeColor('icon');
  const background = useThemeColor('background');

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

  return (
    <Modal visible={visible} statusBarTranslucent animationType="slide">
      <ScreenWrapper>
        <View style={{ margin: wp(4), marginTop: hp(6) }}>
          <View style={{ gap: wp(2) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" color={icon} size={wp(4)} />
              </TouchableOpacity>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }}>KYC VERIFICATION</ThemedText>
            </View>

            <ScrollView>
              <HorizontalTickComponent
                data={[
                  { topic: "Company", value: "Company" },
                  { topic: "Independent", value: "Independent" }
                ]}
                condition={typeOfBrokerPersonal}
                onSelect={(value: string) => {
                  setTypeOfBrokerPersonal(value);
                }}
              />

              

              <ThemedText>Full Name</ThemedText>
              <Input
                placeholder="Enter your full name"
                value={personalName}
                onChangeText={setPersonalName}
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
                    value={personalCountryCode?.name}
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
                    onChange={item => setPersonalCountryCode(item)}
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
                value={personalPhone}
                placeholder="700 000 000"
                onChangeText={setPersonalPhone}
              />

              <ThemedText>Email Address</ThemedText>
              <Input
                placeholder="Enter your email"
                value={personalEmail}
                onChangeText={setPersonalEmail}
              />
              

              <DocumentUploader
                documents={selectedBrokerPersonalDocuments[0]}
                title="National ID / Passport"
                subtitle="Upload your ID or Passport (PDF or Image)"
                buttonTiitle="National ID / Passport"
                onPickDocument={() => {
                  pickDocument(setSelectedBrokerPersonalDocuments, setBrokerPersonalFileType);
                }}
              />

              <DocumentUploader
                documents={selectedBrokerPersonalDocuments[1]}
                title="Proof of Residence"
                subtitle="Upload utility bill, lease, or bank statement (PDF or Image)"
                buttonTiitle="Proof of Address"
                onPickDocument={() => {
                  pickDocument(setSelectedBrokerPersonalDocuments, setBrokerPersonalFileType);
                }}
                disabled={!selectedBrokerPersonalDocuments[0]}
                toastMessage="Please upload ID first"
              />
<DocumentUploader
                documents={selectedBrokerPersonalDocuments[2]}
                title="Live Selfie with ID"
                subtitle="Take a live photo holding your ID (Camera required)"
                buttonTiitle="Take Live Selfie"
                onPickDocument={() => takePhoto((image) => {
                  setSelectedBrokerPersonalDocuments(prev => [prev[0], prev[1], {
                    name: 'selfie.jpg',
                    uri: image.uri,
                    size: image.fileSize || 0,
                    mimeType: image.mimeType || 'image/jpeg'
                  }, ...prev.slice(3)]);
                  setBrokerPersonalFileType(prev => ['image', 'image', ...prev.slice(2)]);
                })}
                disabled={!selectedBrokerPersonalDocuments[0] || !selectedBrokerPersonalDocuments[1]}
                toastMessage="Upload ID and proof of residence first"
              />
              {typeOfBrokerPersonal === "Company" && (
                <DocumentUploader
                  documents={selectedBrokerPersonalDocuments[3]}
                  title="Company Certificate"
                  subtitle="Upload registration certificate (PDF or Image)"
                  buttonTiitle="Company Registration"
                  onPickDocument={() => pickDocument(setSelectedBrokerPersonalDocuments, setBrokerPersonalFileType)}
                  disabled={!selectedBrokerPersonalDocuments[2]}
                  toastMessage="Upload selfie first"
                />
              )}

              {typeOfBrokerPersonal === "Company" && (
                <DocumentUploader
                  documents={selectedBrokerPersonalDocuments[4]}
                  title="Company Letter"
                  subtitle="Upload signed letterhead or authorization (PDF or Image)"
                  buttonTiitle="Letter Head"
                  onPickDocument={() => pickDocument(setSelectedBrokerPersonalDocuments, setBrokerPersonalFileType)}
                  disabled={!selectedBrokerPersonalDocuments[3]}
                  toastMessage="Upload certificate first"
                />
              )}

              <Button
                onPress={onSave}
                loading={uploadingPersonalD}
                disabled={uploadingPersonalD}
                title={uploadingPersonalD ? "Saving..." : "Save"}
                colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
                style={{ height: 44 }}
              />

              <View style={{ height: 140 }} />
            </ScrollView>
          </View>
        </View>
      </ScreenWrapper>
    </Modal>
  );
};

export default KYCVerificationModal;