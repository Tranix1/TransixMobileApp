import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, ToastAndroid, ActivityIndicator } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';

import { countryCodes, } from "@/data/appConstants";


import type { ImagePickerAsset } from 'expo-image-picker';
import { addDocument, getDocById, setDocuments, getUsers } from "@/db/operations";
import { uploadImage } from "@/db/operations";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/db/fireBaseConfig";
import { selectManyImages, handleChange } from "@/Utilities/utils";
import { selectImage, selectImageNoCrop, selectImageWithCrop } from "@/Utilities/imageUtils";
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
import { DocumentUploader } from "@/components/DocumentUploader";

import { usePushNotifications, notifyTruckApprovalAdmins } from "@/Utilities/pushNotification";
import { pickDocument } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import KYCVerificationModal from "@/components/KYCVerificationModal";


function AddTrucks() {

  const { expoPushToken } = usePushNotifications();
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

 

  const [selectedOwnerDocuments, setSelectedOwnerDocumentS] = useState<DocumentAsset[]>([]);
  const [ownerFileType, setOwnerFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([])
  const [ownershipFileType, setOwnerShipFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([])
  const [selectedTruckLease, setSelectedTruckLease] = useState<DocumentAsset[]>([]);
  const [truckLeaseFileType, setTruckLeaseFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([])

  const [selectedBrokerDocuments, setSelectedBrokerDocumentS] = useState<DocumentAsset[]>([]);
  const [brokerFileType, setBrokerFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([])



  const [uploadingOwnerD, setUploadingOwerD] = React.useState(false)



  const [typeOfBroker, setTypeOfBroker] = React.useState("")
  const handleUpdateTckBrokerDetails = async () => {

    setUploadingOwerD(true)
    const missingTruckDetails = [
      !ownerNameAddDb && "Enter Owner Name ",
      !ownerPhonNumAddDb && "Enter Phone Number",
      !ownerEmailAddDb && "Enter Truck Nick Name ",
      !selectedBrokerDocuments[0] && "Pick Id document or imaage",
      !selectedBrokerDocuments[1] && "Pick Proof of Residence",
      typeOfBroker === "Company Broker" && !selectedBrokerDocuments[2] && "Pick Company Registration Certificate",
      typeOfBroker === "Company Broker" && !selectedBrokerDocuments[3] && "Pick Stamped Letter Head / signed",
    ].filter(Boolean);

    if (missingTruckDetails.length > 0) {
      // setContractDErr(true);
      alertBox("Missing Broker Details", missingTruckDetails.join("\n"), [], "error");
      setUploadingOwerD(false)
      setSpinnerItem(false)
      return;
    }

    let brockerId, proofOfResidence, companyRegCertificate, companyLtterHead;

    brockerId = await uploadImage(selectedBrokerDocuments[0], "TruckBroker", setUploadImageUpdate, "National ID");
    proofOfResidence = await uploadImage(selectedBrokerDocuments[1], "TruckBroker", setUploadImageUpdate, "Proof Of Residence");
    if (typeOfBroker === "Company Broker") {

      companyRegCertificate = await uploadImage(selectedBrokerDocuments[2], "TruckBroker", setUploadImageUpdate, "Company Registration Certificate");
      companyLtterHead = await uploadImage(selectedBrokerDocuments[3], "TruckBroker", setUploadImageUpdate, "Company Letter Head");

    }
    await setDocuments("verifiedUsers", {
      userId: user?.uid,
      accType: 'broker',
      typeOfBroker: typeOfBroker,
      brokerName: ownerNameAddDb,
      brokerPhoneNum: ownerPhonNumAddDb,
      brokerEmail: ownerEmailAddDb,
      brockerId: brockerId || null,
      proofOfResidence: proofOfResidence || null,
      companyRegCertificate: companyRegCertificate || null,
      companyLtterHead: companyLtterHead || null,
      brockerIdType: brokerFileType[0] || null,
      proofOfResidenceType: brokerFileType[1] || null,
      companyRegCertificateType: brokerFileType[2] || null,
      companyLtterHeadType: brokerFileType[3] || null,
      createdAt: Date.now().toString(),
      isApproved: false,
      approvalStatus: 'pending',
      // Placeholders for future AI/photo verification
      aiVerificationScore: null,
      photoVerificationStatus: null,
      biometricData: null
    })
    // Modal is now controlled by visible prop

    ToastAndroid.show("Broker Details submitted successfully!", ToastAndroid.SHORT);
  }

  interface TruckOwner {
    docId: string;
    isApproved: boolean;
    accType: 'owner';
  }


  interface userIsVerifiedProps {
    docId: string;
    isApproved: boolean;
    accType: 'professional';
  }
  const [userIsVerified , setUserIsVerified] = useState<userIsVerifiedProps| null> (null);
  const [userIsFleetVerified, setUserIsFleetVerified] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<any>(null);

  
  const [ownerDetailsDsp , setOwnerdetailsDsp] = useState(false);
  const [showUserVerificationModal, setShowUserVerificationModal] = useState(false);
  // Removed broker details - only owner verification needed
  const [loading, setLoading] = useState(true);
  const [dataChecked, setDataChecked] = useState(false); // controls UI entry



  useEffect(() => {
    const fetchAll = async () => {
      // Check current role from AsyncStorage
      try {
        const storedRole = await AsyncStorage.getItem('currentRole');
        if (storedRole) {
          const parsedRole = JSON.parse(storedRole);
          setCurrentRole(parsedRole);
          if (parsedRole.role === 'fleet' && parsedRole.accType === 'fleet') {
            setUserIsFleetVerified(true);
          }
        }
      } catch (error) {
        console.error("Error fetching current role:", error);
      }

      // Check for owner verification in the unified verifiedUsers collection
      const personDetails = await getDocById('verifiedUsers', (data) => {

         if (data && data.accType === 'professional') {
            setUserIsVerified({
              docId: data.id || '',
              isApproved: data.isApproved || false,
              accType: 'professional'
            });
          }

         // Check for fleet verification
         if (data && data.accType === 'fleet' && data.verificationStatus === 'approved') {
            setUserIsFleetVerified(true);
          }
      });

      // Fetch all users for search functionality
      try {
        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }

      setLoading(false);

      // Add a short delay before rendering UI to prevent flicker
      setTimeout(() => {
        setDataChecked(true);
      }, 300); // 300ms feels natural
    };

    fetchAll();
  }, []);

  






  // const [images, setImages] = useState([]);
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const [gitImage, setGitImage] = useState<ImagePickerAsset[]>([]);

  const [truckNumberPlate, setTruckNumberPlate] = useState<ImagePickerAsset[]>([]);
  const [truckThirdPlate, setTruckThirdPlate] = useState<ImagePickerAsset[]>([]);

  const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)
  const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(selectedTruckType?.name === "Super Link" && selectedCargoArea?.name !== "Tanker" ? { id: 7, name: '34T' } : selectedTruckType?.name === "Triaxle" && selectedCargoArea?.name !== "Tanker" ? { id: 5, name: '30T' } : null)

  useEffect(() => {
    if (selectedTruckType?.name === "Super Link" && selectedCargoArea?.name !== "Tanker") {
      setSelectedTruckCapacity({ id: 7, name: '34T' });
    } else if (selectedTruckType?.name === "Triaxle" && selectedCargoArea?.name !== "Tanker") {
      setSelectedTruckCapacity({ id: 5, name: '30T' });
    }
  }, [selectedTruckType, selectedCargoArea]);

  const [showCountries, setShowCountries] = useState(false);
  const [operationCountries, setOperationCountries] = useState<string[]>([]);

  const [countryCode, setCountryCode] = useState<{ id: number, name: string }>({ id: 0, name: '+263' })
const [selectedProofOfOwnerShip, setLease] = useState('');
const [truckType, setTruckType] = useState<'Private' | 'Public'>('Private');
const [loadTypes, setLoadTypes] = useState<string[]>([]);
const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
const [brokerSearchText, setBrokerSearchText] = useState('');
const [driverSearchText, setDriverSearchText] = useState('');
const [allUsers, setAllUsers] = useState<any[]>([]);
const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
const [isSearching, setIsSearching] = useState(false);
const generalLoadOptions = [
 'Food',
 'Electronics',
 'Construction Materials',
 'Furniture',
 'Agricultural Products',
 'Livestock',
 'Textiles',
 'Pharmaceuticals',
 'Machinery',
 'Minerals',
 'Bagged Products',
 'Any'
];

  // Removed broker selection - only Owner allowed


  const [spinnerItem, setSpinnerItem] = useState(false);
  const [uploadingImageUpdate, setUploadImageUpdate] = useState("")

  const { user, alertBox } = useAuth();


  // Function to search users by email with immediate effect
  const searchUsers = (email: string, type: 'broker' | 'driver') => {
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
      alertBox('Error', 'Failed to search users', [], 'error');
    }
  };

  // Function to select a user
  const selectUser = (user: any, type: 'broker' | 'driver') => {
    if (type === 'broker') {
      if (!selectedBrokers.includes(user.email)) {
        setSelectedBrokers([...selectedBrokers, user.email]);
      }
      setBrokerSearchText('');
    } else {
      if (!selectedDrivers.includes(user.email)) {
        setSelectedDrivers([...selectedDrivers, user.email]);
      }
      setDriverSearchText('');
    }
    setSearchedUsers([]);
  };

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
    setImages([]);
    setGitImage([])
    setTruckNumberPlate([])
    setTruckThirdPlate([])
    setSelectedCargoArea(null);
    setSelectedTruckType(null);
    setSelectedTankerType(null);
    setSelectedTruckCapacity(null);
    setShowCountries(false);
    setOperationCountries([]);
    setCountryCode({ id: 0, name: '+263' });
    // New fields
    setLease('');
    setTruckType('Private');
    setLoadTypes([]);
    setSelectedBrokers([]);
    setSelectedDrivers([]);
    setBrokerSearchText('');
    setDriverSearchText('');
    setSearchedUsers([]);
    // Clear truck lease document
    setSelectedTruckLease([]);
    setTruckLeaseFileType([]);
    // Modal is now controlled by visible prop
    // Removed broker selection
    setSpinnerItem(false);
  };

  const handleSubmit = async () => {

    setSpinnerItem(true)
    if ((!userIsVerified || !userIsVerified.isApproved) && !userIsFleetVerified) {
      alert("You must be verified as a professional or fleet owner to add a truck. Please complete the verification process first.")
      setSpinnerItem(false)
      return
    }

    const missingTruckDetails = [
      !formData.truckName && "Enter Truck Nick Name ",
      !selectedTruckType && "Select Truck Type",
      !selectedCargoArea && "Select Truck Cargo Area",
      selectedCargoArea?.name === "Tanker" && !selectedTankerType && "Select Type of Tanker",
      !selectedTruckCapacity && "Select Truck Capacity",
      operationCountries.length <= 0 && "Select the countries where the truck has permits.",
      (!gitImage || gitImage.length === 0) && "Upload GIT Certificate",
      (!truckNumberPlate || truckNumberPlate.length === 0) && "Upload Number Plate image",
      !dataChecked && "Verification status not loaded",
      (!selectedProofOfOwnerShip || selectedProofOfOwnerShip.trim() === '') && (!selectedTruckLease || selectedTruckLease.length === 0) && "Enter Ownership details or upload Ownership document",
      !truckType && "Select Truck Type (Private/Public)",
      loadTypes.length === 0 && "Select at least one load type",
      selectedDrivers.length === 0 && "Assign at least one driver",
      (!selectedTruckLease || selectedTruckLease.length === 0) && "Upload Lease/Ownership Document",
    ].filter(Boolean);

    if (missingTruckDetails.length > 0) {
      // setContractDErr(true);
      alertBox("Missing Truck Details", missingTruckDetails.join("\n"), [], "error");
      setSpinnerItem(false)
      return;
    }






    let truckImage, truckBookImage, trailerBookF, trailerBookSc;


    if (selectedTruckType?.name === "Rigid") {
      if (images.length < 2) { alert("Please select truck image and horse reg book for Rigid."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      truckBookImage = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Truck Book Image");

    } else if (selectedTruckType?.name === "Triaxle") {
      if (images.length < 3) { alert("Please select truck image, horse reg book, and trailer book for Triaxle."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      truckBookImage = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Truck Book Image");
      trailerBookF = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Trailer Book First");

    } else if (selectedTruckType?.name === "Super Link") {
      if (images.length < 4) { alert("Please select truck image, horse reg book, trailer book, and second trailer book for Super Link."); return; }
      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "Truck Image");
      truckBookImage = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Truck Book Image");
      trailerBookF = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "Trailer Book First");
      trailerBookSc = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "Trailer Book Second");
    }

    let subTrckGIT, subTrckNumberPlate, subTrckThrdPlate, subTrckLease

     if (gitImage && gitImage.length > 0) subTrckGIT = await uploadImage(gitImage[0], "Trucks", setUploadImageUpdate, "GIT Certificate");
     if (truckNumberPlate && truckNumberPlate.length > 0) subTrckNumberPlate = await uploadImage(truckNumberPlate[0], "Trucks", setUploadImageUpdate, "Number Plate");
     if (truckThirdPlate && truckThirdPlate.length > 0) subTrckThrdPlate = await uploadImage(truckThirdPlate[0], "Trucks", setUploadImageUpdate, "Third Party Insurance");
     if (selectedTruckLease && selectedTruckLease.length > 0) subTrckLease = await uploadImage(selectedTruckLease[0], "Trucks", setUploadImageUpdate, "Lease/Ownership Document");


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
      // Generate unique truck ID
      const truckId = `TR${Math.floor(100000 + Math.random() * 900000)}`;

      const submitData = {
        userId: user.uid,
        CompanyName: user.organisation,
        contact: user?.phoneNumber || '',
        imageUrl: truckImage,
        truckBookImage: truckBookImage || null,
        trailerBookF: trailerBookF || null,
        trailerBookSc: trailerBookSc || null,

        gitImage: subTrckGIT || null,
        truckNumberPlate: subTrckNumberPlate || null,
        truckThirdPlate: subTrckThrdPlate || null,
        truckLease: subTrckLease || null,
        truckLeaseFileType: truckLeaseFileType[0] || null,

        // Owner verification data - reference the verified user document


        locations: operationCountries,
        truckType: selectedTruckType?.name,
        cargoArea: selectedCargoArea.name,
        tankerType: selectedTankerType ? selectedTankerType?.name : null,
        truckCapacity: selectedTruckCapacity?.name,
        ...formData,
        expoPushToken: expoPushToken || user?.expoPushToken || null,

        // New fields
        selectedProofOfOwnerShip: selectedProofOfOwnerShip,
        truckVisibility: truckType, // Private or Public
        loadTypes: loadTypes,
        brokers: selectedBrokers,
        drivers: selectedDrivers,

        // Referral system
        referrerId: user?.referrerId || null,

        // Approval system
        approvalStatus: 'pending', // pending, approved, rejected
        isApproved: false,
        submittedAt: Date.now().toString(),
        userType: "Owner", // Only Owner allowed

        // Tracker system
        hasTracker: false,
        trackerStatus: 'not_available', // not_available, available, active
        trackerId: null,
        trackerImei: null,
        trackerName: null,

        // Generate unique truck ID
        truckId: truckId ,

        // Associate with fleet if user is a fleet
        fleetId: currentRole?.accType === 'fleet' ? currentRole.fleetId : null,

        accType: currentRole?.accType || 'Individual', // owner, broker, driver, fleet
      }

      let truckDocRef;

      // If user is a fleet and truck is private, add to fleet subcollection only
      if (currentRole?.accType === 'fleet' && truckType === 'Private') {
        truckDocRef = await addDocument(`fleets/${currentRole.fleetId}/Trucks`, submitData);
      }
      // If user is a fleet and truck is public, add to both fleet subcollection and main Trucks collection
      else if ( currentRole?.accType === 'fleet' && truckType === 'Public') {
        // Add to fleet subcollection
        await addDocument(`fleets/${currentRole.fleetId}/Trucks`, submitData);
        // Add to main Trucks collection
        truckDocRef = await addDocument("Trucks", submitData);
      }
      // If not a fleet user, add to main Trucks collection
      else {
        truckDocRef = await addDocument("Trucks", submitData);
      }


      // Notify admins who can approve trucks
      await notifyTruckApprovalAdmins(submitData)

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


          {loading && (
            <ActivityIndicator size="small" color={accent} />
          )}

          {!loading && dataChecked && (
            <View style={{ paddingVertical: wp(2), alignItems: 'center' }}>
              {userIsVerified || userIsFleetVerified ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {(userIsVerified?.isApproved || userIsFleetVerified) ? (
                    <ThemedText style={{ color: "#0f9d58", fontWeight: 'bold', fontSize: 16 }}>
                      Verified {userIsFleetVerified ? '(Fleet)' : '(Professional)'}
                    </ThemedText>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="time" size={wp(4)} color="#ff9800" />
                      <ThemedText style={{ marginLeft: wp(2), color: "#ff9800", fontWeight: 'bold', fontSize: 16 }}>
                        Verification Pending
                      </ThemedText>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowUserVerificationModal(true)}
                  style={{
                    backgroundColor: '#ff4444',
                    paddingHorizontal: wp(4),
                    paddingVertical: wp(2),
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="close-circle" size={wp(4)} color="white" style={{ marginRight: wp(2) }} />
                  <ThemedText style={{ color: "white", fontWeight: 'bold', fontSize: 16 }}>
                    Not Verified - Tap to Verify
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}




{/* User Verification Modal */}
<KYCVerificationModal
  visible={showUserVerificationModal}
  onClose={() => setShowUserVerificationModal(false)}
  typeOfBrokerPersonal={typeOfBroker}
  setTypeOfBrokerPersonal={setTypeOfBroker}
  personalName={ownerNameAddDb}
  setPersonalName={SetOwnerNameAddDb}
  personalPhone={ownerPhonNumAddDb}
  setPersonalPhone={setOwnerPhoneNum}
  personalEmail={ownerEmailAddDb}
  setPersonalEmail={setOwnerEmailAddDb}
  personalCountryCode={countryCode}
  setPersonalCountryCode={setCountryCode}
  selectedBrokerPersonalDocuments={selectedBrokerDocuments}
  setSelectedBrokerPersonalDocuments={setSelectedBrokerDocumentS}
  brokerPersonalFileType={brokerFileType}
  setBrokerPersonalFileType={setBrokerFileType}
  uploadingPersonalD={uploadingOwnerD}
  onSave={handleUpdateTckBrokerDetails}
/>






          <View style={{ alignItems: 'center' }}>
            {images[0] && <Image source={{ uri: images[0].uri }} style={{ width: wp(90), height: wp(90), marginBottom: 9, borderRadius: wp(4) }} />}
            {!images[0] &&
              <TouchableOpacity onPress={() => selectImageWithCrop((image) => setImages([image]))} style={{ marginBottom: 9, width: wp(90), height: wp(90), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(40)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Truck Image<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>}

          </View>

<ThemedText style={{ marginTop: wp(4), fontSize: 16, fontWeight: 'bold',fontStyle:'italic', }}>
  Truck Type
</ThemedText>

<HorizontalTickComponent
  data={[{ topic: "Private", value: "Private" }, { topic: "Public", value: "Public" }]}
  condition={truckType}
  onSelect={setTruckType}
/>
  <ThemedText style={{ fontSize: 12,opacity:0.8  ,fontWeight:'bold',color:truckType==='Private'?"#1E90FF":"#32CD32"}}>
    {truckType === 'Private'
      ? 'Private: Visible only to truck owner and assigned brokers'
      : 'Public: Visible to everyone'
    }
  </ThemedText>


  <View style={{

  borderWidth: 1,
  borderColor: iconColor + '4c',
  borderRadius: wp(3),
  padding: wp(3),
  marginVertical: wp(2),
  backgroundColor: backgroundLight + '20'
}}>
  <ThemedText style={{ fontWeight: 'bold', marginBottom: wp(1) }}>
    Lease/Ownership Document
  </ThemedText>
  <ThemedText style={{ fontSize: 12, opacity: 0.7, marginBottom: wp(3) }}>
    Upload company ownership document or lease agreement (PDF or Image)
  </ThemedText>

  {selectedOwnerDocuments[3] ? (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: accent + '15',
      padding: wp(2),
      borderRadius: wp(2),
      marginBottom: wp(2)
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="document" size={wp(5)} color={accent} style={{ marginRight: wp(2) }} />
        <View>
          <ThemedText style={{ fontWeight: 'bold' }}>Document Uploaded</ThemedText>
          <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
            {selectedOwnerDocuments[3].name || 'Lease Document'}
          </ThemedText>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          const newDocs = [...selectedOwnerDocuments];
          newDocs[3] = undefined as any;
          setSelectedOwnerDocumentS(newDocs);
          const newTypes = [...ownerFileType];
          newTypes[3] = undefined as any;
          setOwnerFileType(newTypes);
        }}
        style={{
          padding: wp(1),
          backgroundColor: 'rgba(255,0,0,0.1)',
          borderRadius: wp(1)
        }}
      >
        <Ionicons name="close" size={wp(4)} color="#ff4444" />
      </TouchableOpacity> 
    </View>
  ) : null}
<TouchableOpacity
  onPress={() => pickDocument(setSelectedTruckLease, setTruckLeaseFileType)}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(3),
    backgroundColor: selectedTruckLease[0] ? accent + '10' : iconColor + '20',
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: selectedTruckLease[0] ? accent : iconColor + '4c',
    borderStyle: 'dashed'
  }}
>
  <Ionicons
    name="cloud-upload"
    size={wp(6)}
    color={selectedTruckLease[0] ? accent : iconColor + '6c'}
    style={{ marginRight: wp(2) }}
  />
  <View>
    <ThemedText style={{
      color: selectedTruckLease[0] ? accent : iconColor + '6c',
      fontWeight: 'bold'
    }}>
      {selectedTruckLease[0] ? 'Change Document' : 'Upload Document'}
    </ThemedText>
    <ThemedText style={{
      fontSize: 12,
      color: iconColor + '6c',
      textAlign: 'center'
    }}>
      PDF or Image
    </ThemedText>
  </View>
</TouchableOpacity>

    <ThemedText style={{
      fontSize: 11,
      color: '#ff9800',
      textAlign: 'center',
      // marginTop: wp(1)
    }}>
      {/* Upload proof of address first */}
    </ThemedText>
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
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >LOAD TYPES</ThemedText>
            </View>

            <ThemedText>
              Select Load Types
            </ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -wp(1) }}>
 {generalLoadOptions.map(type => (
   <TouchableOpacity
     key={type}
     style={{
       flexDirection: 'row',
       alignItems: 'center',
       paddingVertical: wp(2),
       paddingHorizontal: wp(3),
       margin: wp(1),
       borderWidth: 1,
       borderColor: loadTypes.includes(type) ? accent : iconColor,
       borderRadius: wp(2),
       backgroundColor: loadTypes.includes(type) ? accent + '20' : 'transparent'
     }}
     onPress={() => {
       if (type === 'Any') {
         // If "Any" is selected, select all load types
         if (loadTypes.includes('Any')) {
           setLoadTypes([]);
         } else {
           setLoadTypes([...generalLoadOptions]);
         }
       } else {
         // Handle individual selections
         let newLoadTypes;
         if (loadTypes.includes(type)) {
           newLoadTypes = loadTypes.filter(t => t !== type);
           // If "Any" was selected and we're deselecting something, remove "Any" too
           if (loadTypes.includes('Any')) {
             newLoadTypes = newLoadTypes.filter(t => t !== 'Any');
           }
         } else {
           newLoadTypes = [...loadTypes, type];
         }
         setLoadTypes(newLoadTypes);
       }
     }}
   >
     <Ionicons
       name={loadTypes.includes(type) ? "checkbox" : "square-outline"}
       size={wp(4)}
       color={loadTypes.includes(type) ? accent : iconColor}
     />
     <ThemedText style={{ marginLeft: wp(1) }}>{type}</ThemedText>
   </TouchableOpacity>
 ))}
</View>


            <Divider />

            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >BROKER ASSIGNMENT (Optional)</ThemedText>
            </View>

            <ThemedText>
              Search and Select Brokers
            </ThemedText>
            <Input
              placeholder="Search brokers by email or name..."
              value={brokerSearchText}
              onChangeText={(text) => {
                setBrokerSearchText(text);
                searchUsers(text, 'broker');
              }}
            />
            {searchedUsers.length > 0 && (
              <View style={{
                maxHeight: hp(25),
                borderWidth: 1,
                borderColor: iconColor,
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
                        borderBottomColor: iconColor + '30',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onPress={() => selectUser(user, 'broker')}
                    >
                      <View>
                        <ThemedText style={{ fontWeight: 'bold' }}>{user.email}</ThemedText>
                        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                          {user.displayName || 'N/A'} {user.lastName || ''}
                        </ThemedText>
                      </View>
                      <Ionicons name="add-circle" size={wp(5)} color={accent} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {selectedBrokers.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: wp(2) }}>
                {selectedBrokers.map(broker => (
                  <View key={broker} style={{ backgroundColor: accent + '20', padding: wp(1), margin: wp(1), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={{ marginRight: wp(1) }}>{broker}</ThemedText>
                    <TouchableOpacity onPress={() => setSelectedBrokers(selectedBrokers.filter(b => b !== broker))}>
                      <Ionicons name="close" size={wp(3)} color={accent} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Divider />

            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >DRIVER ASSIGNMENT</ThemedText>
            </View>

            <ThemedText>
              Search and Assign Driver
            </ThemedText>
            <Input
              placeholder="Search drivers by email or name..."
              value={driverSearchText}
              onChangeText={(text) => {
                setDriverSearchText(text);
                searchUsers(text, 'driver');
              }}
            />
            {searchedUsers.length > 0 && (
              <View style={{
                maxHeight: hp(25),
                borderWidth: 1,
                borderColor: iconColor,
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
                        borderBottomColor: iconColor + '30',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onPress={() => selectUser(user, 'driver')}
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
            {selectedDrivers.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: wp(2) }}>
                {selectedDrivers.map(driver => (
                  <View key={driver} style={{ backgroundColor: accent + '20', padding: wp(1), margin: wp(1), borderRadius: wp(2), flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={{ marginRight: wp(1) }}>{driver}</ThemedText>
                    <TouchableOpacity onPress={() => setSelectedDrivers(selectedDrivers.filter(d => d !== driver))}>
                      <Ionicons name="close" size={wp(3)} color={accent} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Divider />





            <Divider />

            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >TRUCK DETAILS</ThemedText>
            </View>

            <View style={{ gap: wp(2) }}>

              <ThemedText>
                Horse Reg Book Image
              </ThemedText>
{images[1] && <Image source={{ uri: images[1]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}



{!images[1] && <TouchableOpacity




  onPress={() => {
    images[0] ? selectImageNoCrop((image) => setImages(prev => [prev[0], image, ...prev.slice(2)])) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT)

  }}

  style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
  <ThemedText color={icon + "4c"}>Horse Reg Book Image<ThemedText color="red">*</ThemedText></ThemedText>
</TouchableOpacity>}
{selectedTruckType?.name !== "Rigid" && <View>

  {!images[2] && <ThemedText>
    Trailer Book Image
  </ThemedText>}


  {images[2] && <Image source={{ uri: images[2]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}


  {!images[2] && <TouchableOpacity




    onPress={() => {
      images[1] ? selectImageNoCrop((image) => setImages(prev => [prev[0], prev[1], image, ...prev.slice(3)])) : ToastAndroid.show('Please add horse reg book image first!', ToastAndroid.SHORT)

    }}

    style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
    <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
    <ThemedText color={icon + "4c"}>Trailer Book Image<ThemedText color="red">*</ThemedText></ThemedText>
  </TouchableOpacity>}


  {selectedTruckType?.name === "Super Link" && <ThemedText>
    Trailer 2 Book Image (If Available)
  </ThemedText>}


  {images[3] && <Image source={{ uri: images[3]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />}

  {selectedTruckType?.name === "Super Link" && !images[3] && <TouchableOpacity




    onPress={() => {
      images[2] ? selectImageNoCrop((image) => setImages(prev => [prev[0], prev[1], prev[2], image, ...prev.slice(4)])) : ToastAndroid.show('Please add trailer book image first!', ToastAndroid.SHORT)

    }}

    style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
    <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
    <ThemedText color={icon + "4c"}>Second Trailer Book Image<ThemedText color="red">*</ThemedText></ThemedText>
  </TouchableOpacity>}

</View>}

            </View>



            <Divider />

            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', color: "#1E90FF" }} >ADDITIONAL INFOMATION</ThemedText>
            </View>

            <View style={{ gap: wp(2) }}>





              <ScrollView horizontal style={{ height: 133 }}>

                <View style={{
                  borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                  shadowColor: '#4285f4',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 13, marginLeft: 5, marginRight: 19, borderRadius: 10, marginBottom: 0, padding: 5, width: 146
                }} >

                  {truckNumberPlate[0] && (
                    <Image
                      source={{ uri: truckNumberPlate[0].uri }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                        resizeMode: "cover"
                      }}
                    />
                  )}
                  {!truckNumberPlate[0] && <ThemedText style={{ fontSize: 14.5, textAlign: "center" }}>Number Plate</ThemedText>}
                  {!truckNumberPlate[0] && <TouchableOpacity


                    onPress={() => selectImageWithCrop((image) => setTruckNumberPlate([image]))}

                    style={{ height: wp(27), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                    <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                    <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>Number Plate<ThemedText color="red">*</ThemedText></ThemedText>
                  </TouchableOpacity>}
                </View>

                <View style={{
                  borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                  shadowColor: '#4285f4',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 13, marginRight: 6, borderRadius: 10, marginBottom: 0, padding: 5, width: 146
                }} >

                  {gitImage[0] && (
                    <Image source={{ uri: gitImage[0].uri }} style={{ width: "100%", height: "100%", borderRadius: 10, resizeMode: "cover" }} />)}


                  {!gitImage[0] && <ThemedText style={{ fontSize: 14.5, textAlign: "center" }}>GIT Insurance</ThemedText>}
                  {!gitImage[0] && <TouchableOpacity
                    onPress={() => selectImageNoCrop((image) => setGitImage([image]))}
                    style={{ height: wp(27), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                    <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                    <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>GIT Insuarance<ThemedText color="red">*</ThemedText></ThemedText>
                  </TouchableOpacity>}
                </View>


                <View style={{
                  borderColor: icon + "4c", backgroundColor: background, borderWidth: 0.9,
                  shadowColor: '#4285f4',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 13, marginLeft: 5, marginRight: 19, borderRadius: 10, marginBottom: 0, padding: 5, width: 146
                }} >

                  {truckThirdPlate[0] && (
                    <Image
                      source={{ uri: truckThirdPlate[0].uri }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                        resizeMode: "cover"
                      }}
                    />
                  )}
                  {!truckThirdPlate[0] && <ThemedText style={{ fontSize: 14.5, textAlign: "center" }}>Third Plate</ThemedText>}
                  {!truckThirdPlate[0] && <TouchableOpacity

                    onPress={() => selectImageWithCrop((image) => setTruckThirdPlate([image]))}
                    style={{ height: wp(27), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                    <Ionicons name="camera" size={wp(15)} color={icon + "4c"} />
                    <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>Third Plate<ThemedText color="red">*</ThemedText></ThemedText>
                  </TouchableOpacity>}
                </View>
              </ScrollView>




            </View>


          </View>
          <View style={{ marginVertical: wp(4), marginBottom: hp(8), gap: wp(3) }}>

            <ThemedText type="tiny" style={{ textAlign: 'center' }} color={coolGray}>{spinnerItem && ''} </ThemedText>
            <Button loading={spinnerItem} disabled={spinnerItem} title={spinnerItem ? "Submiting..." : "Submit"} onPress={handleSubmit} />
          </View>
          <View style={{ height: hp(8) }} />
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
