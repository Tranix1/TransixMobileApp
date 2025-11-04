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

interface BrokerVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  typeOfBroker: string;
  setTypeOfBroker: (value: string) => void;
  brokerName: string;
  setBrokerName: (value: string) => void;
  brokerPhone: string;
  setBrokerPhone: (value: string) => void;
  brokerEmail: string;
  setBrokerEmail: (value: string) => void;
  brokerCountryCode: { id: number; name: string };
  setBrokerCountryCode: (value: { id: number; name: string }) => void;
  selectedBrokerDocuments: DocumentAsset[];
  setSelectedBrokerDocuments: React.Dispatch<React.SetStateAction<DocumentAsset[]>>;
  brokerFileType: ('pdf' | 'image' | 'doc' | 'docx')[];
  setBrokerFileType: React.Dispatch<React.SetStateAction<('pdf' | 'image' | 'doc' | 'docx')[]>>;
  uploadingBrokerD: boolean;
  onSave: (brokerData: {
    typeOfBroker: string;
    brokerName: string;
    brokerPhone: string;
    brokerEmail: string;
    brokerCountryCode: { id: number; name: string };
    selectedBrokerDocuments: DocumentAsset[];
    brokerFileType: ('pdf' | 'image' | 'doc' | 'docx')[];
  }) => void;
}

const BrokerVerificationModal: React.FC<BrokerVerificationModalProps> = ({
  visible,
  onClose,
  typeOfBroker,
  setTypeOfBroker,
  brokerName,
  setBrokerName,
  brokerPhone,
  setBrokerPhone,
  brokerEmail,
  setBrokerEmail,
  brokerCountryCode,
  setBrokerCountryCode,
  selectedBrokerDocuments,
  setSelectedBrokerDocuments,
  brokerFileType,
  setBrokerFileType,
  uploadingBrokerD,
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
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }}>BROKER VERIFICATION</ThemedText>
            </View>

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
                onPress={() => onSave({
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
        </View>
      </ScreenWrapper>
    </Modal>
  );
};

export default BrokerVerificationModal;