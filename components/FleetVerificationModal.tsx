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

interface FleetVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  typeOfFleet: string;
  setTypeOfFleet: (value: string) => void;
  fleetName: string;
  setFleetName: (value: string) => void;
  fleetPhone: string;
  setFleetPhone: (value: string) => void;
  fleetEmail: string;
  setFleetEmail: (value: string) => void;
  fleetCountryCode: { id: number; name: string };
  setFleetCountryCode: (value: { id: number; name: string }) => void;
  selectedFleetDocuments: DocumentAsset[];
  setSelectedFleetDocuments: React.Dispatch<React.SetStateAction<DocumentAsset[]>>;
  fleetFileType: ('pdf' | 'image' | 'doc' | 'docx')[];
  setFleetFileType: React.Dispatch<React.SetStateAction<('pdf' | 'image' | 'doc' | 'docx')[]>>;
  uploadingFleetD: boolean;
  onSave: (fleetData: {
    typeOfFleet: string;
    fleetName: string;
    fleetPhone: string;
    fleetEmail: string;
    fleetCountryCode: { id: number; name: string };
    selectedFleetDocuments: DocumentAsset[];
    fleetFileType: ('pdf' | 'image' | 'doc' | 'docx')[];
  }) => void;
}

const FleetVerificationModal: React.FC<FleetVerificationModalProps> = ({
  visible,
  onClose,
  typeOfFleet,
  setTypeOfFleet,
  fleetName,
  setFleetName,
  fleetPhone,
  setFleetPhone,
  fleetEmail,
  setFleetEmail,
  fleetCountryCode,
  setFleetCountryCode,
  selectedFleetDocuments,
  setSelectedFleetDocuments,
  fleetFileType,
  setFleetFileType,
  uploadingFleetD,
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
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }}>FLEET VERIFICATION</ThemedText>
            </View>

            <ScrollView>
             

              

              <ThemedText>Company/Business Name</ThemedText>
              <Input
                placeholder="Enter company/business name"
                value={fleetName}
                onChangeText={setFleetName}
              />

              <ThemedText>Fleet Main Admin Phone Number</ThemedText>
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
                    value={fleetCountryCode?.name}
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
                    onChange={item => setFleetCountryCode(item)}
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
                value={fleetPhone}
                placeholder="700 000 000"
                onChangeText={setFleetPhone}
              />

              <ThemedText>Fleet Main Admin Email Address</ThemedText>
              <Input
                placeholder="Enter fleet owner email"
                value={fleetEmail}
                onChangeText={setFleetEmail}
              />
              

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
                buttonTiitle="Take Fleet Live Selfie"
                onPickDocument={() => takePhoto((image) => {
                  setSelectedFleetDocuments(prev => [prev[0], prev[1], {
                    name: 'selfie.jpg',
                    uri: image.uri,
                    size: image.fileSize || 0,
                    mimeType: image.mimeType || 'image/jpeg'
                  }, ...prev.slice(3)]);
                  setFleetFileType(prev => ['image', 'image', ...prev.slice(2)]);
                })}
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
                onPress={() => onSave({
                  typeOfFleet,
                  fleetName,
                  fleetPhone,
                  fleetEmail,
                  fleetCountryCode,
                  selectedFleetDocuments,
                  fleetFileType
                })}
                loading={uploadingFleetD}
                disabled={uploadingFleetD}
                title={uploadingFleetD ? "Saving..." : "Save"}
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

export default FleetVerificationModal;