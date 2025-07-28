import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, ToastAndroid } from "react-native"

import { countryCodes, } from "@/data/appConstants";


import type { ImagePickerAsset } from 'expo-image-picker';
import { addDocument, getDocById, setDocuments } from "@/db/operations";
import { uploadImage } from "@/db/operations";
import { selectManyImages, handleChange } from "@/Utilities/utils";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { ErrorOverlay } from "@/components/ErrorOverLay";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { TruckTypeProps } from "@/types/types";
import { AntDesign, Entypo, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor'
import { Dropdown, } from "react-native-element-dropdown";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import Divider from "@/components/Divider";
import { cleanNumber } from "@/services/services";
import Button from "@/components/Button";

import { TruckFormData } from "@/types/types";

import { AddTruckDetails } from "@/components/AddTruckDetails";
import { HorizontalTickComponent } from "@/components/SlctHorizonzalTick";

import * as DocumentPicker from 'expo-document-picker';

interface DocumentAsset {
  name: string
  uri: string;
  size: number;
  mimeType?: string; // sometimes contentType instead

  // Add any other properties here
}
function AddTrucks() {

  // Theme colors
  const icon = useThemeColor('icon')
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const iconColor = useThemeColor('icon');
  const accent = useThemeColor('accent');
  const coolGray = useThemeColor('coolGray');
  const textColor = useThemeColor('text');
  const [formData, setFormData] = useState<TruckFormData>({
    additionalInfo: "",
    driverPhone: "",
    maxloadCapacity: "",
    truckName: "",
    otherCargoArea: "",
    otherTankerType: ""
  });


  const [ownerNameAddDb, SetOwnerNameAddDb] = useState('');
  const [ownerEmailAddDb, setOwnerEmailAddDb] = useState('');
  const [ownerPhonNumAddDb, setOwnerPhoneNum] = useState('');
  const [ownershipProof, setOwnershipProof] = React.useState("")

  const [selectedOwnerDocuments, setSelectedOwnerDocumentS] = useState<DocumentAsset[]>([]);




  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // allow only PDFs and images
        copyToCacheDirectory: true, // optional: ensures the file is accessible in your app's cache
      });

      if (result.canceled) return;

      const assets = result.assets;
      if (!assets || assets.length === 0) {
        alert('No assets found in the picker result');
        return;
      }

      const firstAsset = assets[assets.length - 1];

      if (!firstAsset.uri) {
        alert('Selected document URI is undefined');
        return;
      }

      if (firstAsset.size !== undefined && firstAsset.size > 0.5 * 1024 * 1024) {
        alert('The selected document must not be more than 0.5MB.');
        return;
      }

      setSelectedOwnerDocumentS((prevDocs) => [...prevDocs, firstAsset] as DocumentAsset[]);
    } catch (error) {
      console.error('Error picking document:', error);
      alert('An error occurred while picking the document.');
    }
  };







  const [uploadingOwnerD , setUploadingOwerD]=React.useState(false)
  const handleUpdateTOwnerDetails = async () => {
setUploadingOwerD(true)
      const missingTruckDetails = [
        !ownerNameAddDb && "Enter Owner Name ",
      !ownerPhonNumAddDb && "Enter Phone Number",
      !ownerEmailAddDb && "Enter Truck Nick Name ",
      !selectedOwnerDocuments[0] && "Pick Proof of ownership document or imaage ",
      !selectedOwnerDocuments[1] && "Pick Id document or imaage  ",
    ].filter(Boolean);

    if (missingTruckDetails.length > 0) {
      // setContractDErr(true);
      alertBox("Missing Ownership Details", missingTruckDetails.join("\n"), [], "error");
  setUploadingOwerD(false)
      return;
    }
    
    
    let proofOfTruckOwnerhip,directorOwnerId ;
    
    proofOfTruckOwnerhip = await uploadImage(selectedOwnerDocuments[0], "TruckOwnership", setUploadImageUpdate, "Ownership uploading");
    directorOwnerId = await uploadImage(selectedOwnerDocuments[1], "TruckOwnership", setUploadImageUpdate, "ID uploading");
    
    
    await setDocuments("truckOwnerDetails", { ownerName: ownerNameAddDb, ownerPhoneNum: ownerPhonNumAddDb, ownerEmail: ownerEmailAddDb, ownershipProof: proofOfTruckOwnerhip , directorOwnerId:directorOwnerId })
    setOwnerdetailsDsp(false)
    setUploadingOwerD(false)
    ToastAndroid.show("Store Details created successfully!", ToastAndroid.SHORT);
  };

  interface TruckOwner {
    ownerName: string;
    ownerPhoneNum: string;
    ownerEmail: string;
    ownershipProof: string;
  }

  // Then use it like this:
  const [getOwnerDetails, setOwnerDetails] = useState<TruckOwner | null>(null);
  useEffect(() => {
    getDocById('truckOwnerDetails', setOwnerDetails);
  }, []);

  // const [images, setImages] = useState([]);
  const [images, setImages] = useState<ImagePickerAsset[]>([]);


  const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)
  const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(null)


  const [showCountries, setShowCountries] = useState(false);
  const [operationCountries, setOperationCountries] = useState<string[]>([]);

  const [countryCode, setCountryCode] = useState<{ id: number, name: string }>({ id: 0, name: '+263' })

  const [ownerdetailsDsp, setOwnerdetailsDsp] = useState(true)

  const [truckOwnerOBroker, setTuckOwnerOBroker] = React.useState("")
  // if(truckOwnerOBroker==="Owner" && !ownerdetailsDsp ) setOwnerdetailsDsp(true)

  const [spinnerItem, setSpinnerItem] = useState(false);
  const [uploadingImageUpdate, setUploadImageUpdate] = useState("")

  const { user, alertBox } = useAuth();


  // Function to clear all form fields
  const clearFormFields = () => {
    setFormData({
      additionalInfo: "",
      driverPhone: "",
      maxloadCapacity: "",
      truckName: "",
      otherCargoArea: "",
      otherTankerType: ""
    });
    SetOwnerNameAddDb('');
    setOwnerEmailAddDb('');
    setOwnerPhoneNum('');
    setOwnershipProof('');
    setImages([]);
    setSelectedCargoArea(null);
    setSelectedTruckType(null);
    setSelectedTankerType(null);
    setSelectedTruckCapacity(null);
    setShowCountries(false);
    setOperationCountries([]);
    setCountryCode({ id: 0, name: '+263' });
    setOwnerdetailsDsp(true); // Assuming you want this to reset to true
    setTuckOwnerOBroker("");
    setSpinnerItem(false);
  };


  const handleSubmit = async () => {

    setSpinnerItem(true)
    const missingTruckDetails = [
      !formData.truckName && "Enter Truck Nick Name ",
      !selectedTruckType && "Select Truck Type",
      !selectedCargoArea && "Select Truck Cargo Area",
      selectedCargoArea?.name === "Tanker" && !selectedTankerType && "Select Type of Tannker",
      !selectedTruckCapacity && "Select Truck Capacity",
      operationCountries.length <= 0 && "Select the countries where the truck has permits.",
    ].filter(Boolean);

    if (missingTruckDetails.length > 0) {
      // setContractDErr(true);
      alertBox("Missing Truck Details", missingTruckDetails.join("\n"), [], "error");
      return;
    }
    const MissingDriverDetails = [
      !formData.driverPhone && "",
    ]
    if (missingTruckDetails.length > 0) {
      // setContractDErr(true);
      alertBox("Missing Driver Details", MissingDriverDetails.join("\n"), [], "error");
      return;
    }






    let truckImage, truckBookImage, trailerBookF, trailerBookSc, driverLicense, driverPassport, driverIntPermit;


    if (selectedTruckType?.name === "Rigid" && operationCountries.length > 1) {
      if (images.length < 5) { alert("Please select all images for Rigid with multiple countries."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Driver Passport");
      driverIntPermit = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "Driver International Permit");
      truckBookImage = await uploadImage(images[4], "Trucks", setUploadImageUpdate, "Truck Book Image");

    } else if (selectedTruckType?.name === "Rigid" && operationCountries.length === 1) {
      if (images.length < 3) { alert("Please select all images for Rigid with one country."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      truckBookImage = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Truck Book Image");

    } else if (selectedTruckType?.name === "Triaxle" && operationCountries.length > 1) {
      if (images.length < 6) { alert("Please select all images for Triaxle with multiple countries."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Driver Passport");
      driverIntPermit = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "Driver International Permit");
      truckBookImage = await uploadImage(images[4], "Trucks", setUploadImageUpdate, "Truck Book Image");
      trailerBookF = await uploadImage(images[5], "Trucks", setUploadImageUpdate, "Trailer Book First");

    } else if (selectedTruckType?.name === "Triaxle" && operationCountries.length === 1) {
      if (images.length < 4) { alert("Please select all images for Triaxle with one country."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      truckBookImage = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Truck Book Image");
      trailerBookF = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "Trailer Book First");

    } else if (selectedTruckType?.name === "Super Link" && operationCountries.length > 1) {
      if (images.length < 7) { alert("Please select all images for Super Link with multiple countries."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Driver Passport");
      driverIntPermit = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "Driver International Permit");
      truckBookImage = await uploadImage(images[4], "Trucks", setUploadImageUpdate, "Truck Book Image");
      trailerBookF = await uploadImage(images[5], "Trucks", setUploadImageUpdate, "Trailer Book First");
      trailerBookSc = await uploadImage(images[6], "Trucks", setUploadImageUpdate, "Trailer Book Second");

    } else if (selectedTruckType?.name === "Super Link" && operationCountries.length === 1) {
      if (images.length < 5) { alert("Please select all images for Super Link with one country."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      truckBookImage = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Truck Book Image");
      trailerBookF = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "Trailer Book First");
      trailerBookSc = await uploadImage(images[4], "Trucks", setUploadImageUpdate, "Trailer Book Second");
    }


    setUploadImageUpdate("")






    if (!selectedCargoArea)
      return alert("SelectsTruck Type");

    if (!user) {

      return alert("Please Login to your account to add a truck");
    }


    if (!user) {
      alert("Please Login first");
      return;
    }
    if (!user.organisation) {
      alert("Please edit your account and add Organisation details first, eg:Organisation Name!");
      return;
    }

    try {

      const submitData = {
        userId: user.uid,
        CompanyName: user.organisation,
        contact: user?.phoneNumber || '',
        imageUrl: truckImage,
        truckBookImage: truckBookImage || null,
        trailerBookF: trailerBookF || null,
        trailerBookSc: trailerBookSc || null,
        driverLicense: driverLicense || null,
        driverIntPermit: driverIntPermit || null,
        driverPassport: driverPassport || null,

        ownerName: getOwnerDetails?.ownerName,
        onwerEmail: getOwnerDetails?.ownerEmail,
        ownerPhoneNum: getOwnerDetails?.ownerPhoneNum,

        locations: operationCountries,
        truckType: selectedTruckType?.name,
        cargoArea: selectedCargoArea.name,
        tankerType: selectedTankerType ? selectedTankerType?.name : null,
        truckCapacity: selectedTruckCapacity?.name,
        ...formData,
      }

      addDocument("Trucks", submitData)
      clearFormFields()
      ToastAndroid.show('Truck Added successfully', ToastAndroid.SHORT)

    } catch (err) {
      console.error(err);
    } finally {

      setSpinnerItem(false)
    }
  };




  return (
    <ScreenWrapper>

      <Heading page='Add Truck' />


      <View style={{ paddingHorizontal: wp(4) }} >

        {uploadingImageUpdate && spinnerItem && <View style={{ flexDirection: 'row', backgroundColor: backgroundLight, padding: wp(2), alignSelf: "center", borderRadius: wp(4), alignItems: 'center', }} >
          {uploadingImageUpdate !== `Done Adding` && <ThemedText style={{ textAlign: 'center' }} > {uploadingImageUpdate} </ThemedText>}
          {uploadingImageUpdate === `Done Adding` && <ThemedText style={{ textAlign: 'center' }} > Truck is being added Please wait! </ThemedText>}

        </View>}

        <ScrollView>

          <ThemedText>Are You the truck owner or Broker ?</ThemedText>
          <HorizontalTickComponent
            data={[{ topic: "Owner", value: "Owner" }, { topic: "Broker", value: "Broker" }]}
            condition={truckOwnerOBroker}
            onSelect={setTuckOwnerOBroker}
          />

          <Modal visible={ownerdetailsDsp && truckOwnerOBroker === "Owner"} statusBarTranslucent animationType="slide">
            <ScreenWrapper>

              <View style={{ margin: wp(4), marginTop: hp(6) }}>

                <View style={{ gap: wp(2) }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
                    <TouchableOpacity onPress={() => { setOwnerdetailsDsp(true); setTuckOwnerOBroker("") }}>
                      <AntDesign name="close" color={icon} size={wp(4)} />
                    </TouchableOpacity>
                    <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >OWNER DETAILS</ThemedText>
                  </View>
                  <ThemedText>
                    Owner's Name
                  </ThemedText>
                  <Input
                    placeholder="Owner's Name"
                    value={ownerNameAddDb}
                    onChangeText={(text) => SetOwnerNameAddDb(text)}
                  />

                  <ThemedText>
                    Owner's Phone Number
                  </ThemedText>
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
                        value={countryCode?.name}
                        itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                        activeColor={background}

                        containerStyle={{
                          borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
                          width: wp(45),
                          shadowOffset: {
                            width: 0,
                            height: 9,
                          },
                          shadowOpacity: 0.50,
                          shadowRadius: 12.35,

                          elevation: 19,
                          paddingVertical: wp(1)
                        }}
                        onChange={item => {
                          console.log(item);
                          setCountryCode(item);
                        }}

                        renderLeftIcon={() => <></>}
                        renderRightIcon={() => <Ionicons name="chevron-down" size={wp(4)} color={icon} />}
                        renderItem={((item, selected) =>
                          <>
                            <View style={[styles.item, selected && {}]}>
                              <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                              {selected && (
                                <Ionicons
                                  color={icon}
                                  name='checkmark-outline'
                                  size={wp(5)}
                                />
                              )}
                            </View>
                            <Divider />
                          </>
                        )}

                      />
                      <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
                    </>}
                    value={ownerPhonNumAddDb}
                    placeholder="700 000 000"
                    onChangeText={(text) => setOwnerPhoneNum(text)}
                    keyboardType="numeric"
                  />

                  <ThemedText>
                    Owner's Email
                  </ThemedText>
                  <Input
                    placeholder="Owner Email"
                    value={ownerEmailAddDb}
                    onChangeText={(text) => setOwnerEmailAddDb(text)}
                  />


{selectedOwnerDocuments.length > 0 && (
  <View
    style={{
      width: wp(45),
      alignSelf: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: 10,
    }}
  >
    {selectedOwnerDocuments[0].name.toLowerCase().endsWith('.pdf') ? (
      <>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: wp(10),
            backgroundColor: '#e0f2f1',
            borderRadius: 8,
          }}
        >
          <ThemedText
            style={{
              fontSize: 50,
              color: '#004d40',
            }}
          >
            📄
          </ThemedText>
        </View>
        <ThemedText
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 13,
            color: '#004d40',
            fontWeight: '600',
          }}
        >
          {selectedOwnerDocuments[0].name}
        </ThemedText>
      </>
    ) : (
      <>
        <Image
          source={{ uri: selectedOwnerDocuments[0].uri }}
          style={{
            width: '100%',
            height: wp(20),
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
        <ThemedText
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 13,
            color: '#004d40',
            fontWeight: '600',
          }}
        >
          {selectedOwnerDocuments[0].name}
        </ThemedText>
      </>
    )}
  </View>
)}


{!selectedOwnerDocuments[0] &&<View>

                  <ThemedText style={{ fontSize: 13.6 }}>Upload: Company Doc Validating Truck Ownership or Lease </ThemedText>
<ThemedText type="tiny">
  This should show that you (as Owner or Director) or your company owns or leases the truck. Accepted formats: PDF or Image.
</ThemedText>

<TouchableOpacity
  onPress={pickDocument}
  style={{
    backgroundColor: '#004d40',
    height: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    width: 280,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }}
>
  <ThemedText
    style={{
      textAlign: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    }}
  >
    Upload Ownership/Lease Document
  </ThemedText>
</TouchableOpacity>

  </View>}

{selectedOwnerDocuments.length > 0 && (
  <View
    style={{
      width: wp(45),
      alignSelf: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: 10,
    }}
  >
    {selectedOwnerDocuments[0].name.toLowerCase().endsWith('.pdf') ? (
      <>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: wp(10),
            backgroundColor: '#e0f2f1',
            borderRadius: 8,
          }}
        >
          <ThemedText
            style={{
              fontSize: 50,
              color: '#004d40',
            }}
          >
            📄
          </ThemedText>
        </View>
        <ThemedText
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 13,
            color: '#004d40',
            fontWeight: '600',
          }}
        >
          {selectedOwnerDocuments[0].name}
        </ThemedText>
      </>
    ) : (
      <>
        <Image
          source={{ uri: selectedOwnerDocuments[0].uri }}
          style={{
            width: '100%',
            height: wp(20),
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
        <ThemedText
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontSize: 13,
            color: '#004d40',
            fontWeight: '600',
          }}
        >
          {selectedOwnerDocuments[0].name}
        </ThemedText>
      </>
    )}
  </View>
)}




{!selectedOwnerDocuments[1] &&<View>
<ThemedText style={{ fontSize: 13.6 ,alignSelf:"center"}}>
  Upload: Owner or Director’s ID
</ThemedText>
<ThemedText type="tiny">
  The ID must match the name on the company document to verify authenticity. Accepted formats: PDF or Image.
</ThemedText>



<TouchableOpacity
  onPress={pickDocument}
  style={{
    backgroundColor: '#004d40',
    height: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    width: 280,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }}
>
  <ThemedText
    style={{
      textAlign: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    }}
  >
    Upload Owner/Director ID
  </ThemedText>
</TouchableOpacity>
 </View>}



                <Button onPress={handleUpdateTOwnerDetails}  loading={uploadingOwnerD} disabled={uploadingOwnerD} title={uploadingOwnerD ? "Saving..." : "Save"}  colors={{ text: '#0f9d58', bg: '#0f9d5824' }} style={{height:44}} />

                </View>
              </View>
            </ScreenWrapper>

          </Modal>



          <View style={{ alignItems: 'center' }}>
            {images[0] && <Image source={{ uri: images[0].uri }} style={{ width: wp(90), height: wp(90), marginBottom: 9, borderRadius: wp(4) }} />}
            {!images[0] &&
              <TouchableOpacity onPress={() => selectManyImages(setImages, true)} style={{ marginBottom: 9, width: wp(90), height: wp(90), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(40)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Truck Image<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>}

          </View>
          <View style={{ gap: wp(2) }}>

            <ThemedText>
              Truck Nickname<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.truckName}
              placeholder=""
              onChangeText={(text) => handleChange<TruckFormData>(text, 'truckName', setFormData)}
            />

            <AddTruckDetails
              selectedTruckType={selectedTruckType}
              setSelectedTruckType={setSelectedTruckType}
              selectedCargoArea={selectedCargoArea}
              setSelectedCargoArea={setSelectedCargoArea}
              selectedTankerType={selectedTankerType}
              setSelectedTankerType={setSelectedTankerType}
              selectedTruckCapacity={selectedTruckCapacity}
              setSelectedTruckCapacity={setSelectedTruckCapacity}
              formData={formData}
              setFormData={setFormData}
              showCountries={showCountries}
              setShowCountries={setShowCountries}
              operationCountries={operationCountries}
              setOperationCountries={setOperationCountries}
              setImages={images.length > 0 ? setImages : undefined}
              images={images}
            />


            <ThemedText>
              Additional Information<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.additionalInfo} multiline numberOfLines={8} style={{ verticalAlign: 'top', minHeight: hp(15) }} containerStyles={{}}
              placeholder="Additional Information"
              onChangeText={(text) => handleChange<TruckFormData>(text, 'additionalInfo', setFormData)}
            />



            <Divider />


            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >DRIVER DETAILS</ThemedText>
            </View>



            <ThemedText>
              Drivers Phone Number<ThemedText color="red">*</ThemedText>
            </ThemedText>
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
                  value={countryCode?.name}
                  itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                  activeColor={background}

                  containerStyle={{
                    borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
                    width: wp(45),
                    shadowOffset: {
                      width: 0,
                      height: 9,
                    },
                    shadowOpacity: 0.50,
                    shadowRadius: 12.35,

                    elevation: 19,
                    paddingVertical: wp(1)
                  }}
                  onChange={item => {
                    console.log(item);
                    setCountryCode(item);
                  }}

                  renderLeftIcon={() => <></>}
                  renderRightIcon={() => <Entypo name="chevron-thin-down" size={wp(4)} color={icon} />}
                  renderItem={((item, selected) =>
                    <>
                      <View style={[styles.item, selected && {}]}>
                        <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                        {selected && (
                          <Ionicons
                            color={icon}
                            name='checkmark-outline'
                            size={wp(5)}
                          />
                        )}
                      </View>
                      <Divider />
                    </>
                  )}
                />
                <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
              </>}
              value={cleanNumber(formData.driverPhone)}
              placeholder="700 000 000"
              onChangeText={(text) => handleChange<TruckFormData>(cleanNumber(text), 'driverPhone', setFormData)}
              keyboardType="numeric"
            />


            <ThemedText>
              Drivers License<ThemedText color="red">*</ThemedText>
            </ThemedText>


            {images[1] ?
              <Image source={{ uri: images[1]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
              :
              <TouchableOpacity onPress={() => { operationCountries.length > 0 ? (images[0]) ? selectManyImages(setImages, true) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT) : alert("Select operating Countires.") }
              }
                style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Drivers License<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>
            }

            {operationCountries.length > 1 && <>

              <ThemedText>
                Drivers Passport Image<ThemedText color="red">*</ThemedText>
              </ThemedText>


              {images[2] ?
                <Image source={{ uri: images[2]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
                :
                <TouchableOpacity onPress={() => (images[1]) ? selectManyImages(setImages, true) : ToastAndroid.show('Please add yaya image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Add Drivers Passport<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }

              <ThemedText>
                International Driver Permit<ThemedText color="red">*</ThemedText>
              </ThemedText>

              {images[3] ?
                <Image source={{ uri: images[3]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
                :
                <TouchableOpacity onPress={() => (images[2]) ? selectManyImages(setImages, true) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Add International Driver Permit<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }

            </>}


            <Divider />

            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >TRUCK DETAILS</ThemedText>
            </View>

            <View style={{ gap: wp(2) }}>

              <ThemedText>
                Horse Reg Book Image
              </ThemedText>


              {images[4] && operationCountries.length > 1 && <Image source={{ uri: images[4]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}

              {images[2] && operationCountries.length === 1 && <Image source={{ uri: images[2]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}


              {((!images[2] && operationCountries.length === 1) || (operationCountries.length > 1 && !images[4])) && <TouchableOpacity



                onPress={() => {
                  operationCountries.length === 1 ? images[1] ? selectManyImages(setImages, false) : ToastAndroid.show('Please add driver License image first!', ToastAndroid.SHORT)
                    : operationCountries.length > 1 ? images[3] ? selectManyImages(setImages, false) : ToastAndroid.show('Please add driver License , Passport and international permit first!', ToastAndroid.SHORT)
                      : alert("yaya");

                }}

                style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Horse Reg Book Image<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>}


              {selectedTruckType?.name !== "Rigid" && <View>

                <ThemedText>
                  Trailer Book Image
                </ThemedText>


                {images[5] && operationCountries.length > 1 && <Image source={{ uri: images[5]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}

                {images[3] && operationCountries.length === 1 && <Image source={{ uri: images[3]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}


                {((!images[3] && operationCountries.length === 1) || (operationCountries.length > 1 && !images[5])) && <TouchableOpacity



                  onPress={() => {
                    operationCountries.length === 1 ? images[2] ? selectManyImages(setImages, false) : ToastAndroid.show('Please add driver License image first!', ToastAndroid.SHORT)
                      : operationCountries.length > 1 ? images[4] ? selectManyImages(setImages, false) : ToastAndroid.show('Please add driver License , Passport and international permit first!', ToastAndroid.SHORT)
                        : alert("yaya");

                  }}

                  style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Trailer Book Image<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>}


                {selectedTruckType?.name === "Super Link" && <ThemedText>
                  Trailer 2 Book Image (If Available)
                </ThemedText>}


                {images[6] && operationCountries.length > 1 && <Image source={{ uri: images[6]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}

                {images[4] && operationCountries.length === 1 && <Image source={{ uri: images[4]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}


                {((!images[4] && operationCountries.length === 1) || (operationCountries.length > 1 && !images[6])) && <TouchableOpacity



                  onPress={() => {
                    operationCountries.length === 1 ? images[3] ? selectManyImages(setImages, false) : ToastAndroid.show('Please add driver License image first!', ToastAndroid.SHORT)
                      : operationCountries.length > 1 ? images[5] ? selectManyImages(setImages, false) : ToastAndroid.show('Please add driver License , Passport and international permit first!', ToastAndroid.SHORT)
                        : alert("yaya");

                  }}

                  style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Trailer Book Image<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>}

              </View>}

            </View>

          </View>
          <View style={{ marginVertical: wp(4), marginBottom: hp(8), gap: wp(3) }}>

            <ThemedText type="tiny" style={{ textAlign: 'center' }} color={coolGray}>{spinnerItem && ''} </ThemedText>
            <Button loading={spinnerItem} disabled={spinnerItem} title={spinnerItem ? "Submiting..." : "Submit"} onPress={handleSubmit} />
          </View>

        </ScrollView>
      </View>

    </ScreenWrapper>
  );

}


export default AddTrucks;

const styles = StyleSheet.create({
  dropdown: {
    padding: wp(3),
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: wp(4),
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    padding: 17,
    gap: wp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: wp(1),
    marginBottom: 5
  },
  selectedTextStyle: {
    fontSize: 16,
  }
});
