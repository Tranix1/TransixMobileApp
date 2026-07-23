import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, ToastAndroid, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImagePickerAsset } from 'expo-image-picker';
import { addDocument, getDocById, setDocuments, getUsers, fetchDocuments, updateDocument, addDocumentWithId, checkDocumentExists } from "@/db/operations";
import { uploadImage } from "@/db/operations";
import { handleChange } from "@/Utilities/utils";
import { selectImageNoCrop, selectImageWithCrop } from "@/Utilities/imageUtils";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { TruckTypeProps } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import Divider from "@/components/Divider";
import Button from "@/components/Button";
import { TruckFormData } from "@/types/types";
import { AddTruckDetails } from "@/components/AddTruckDetails";
import { HorizontalTickComponent } from "@/components/SlctHorizonzalTick";
import { usePushNotifications, notifyTruckApprovalAdmins, sendUserNotification } from "@/Utilities/pushNotification";
import { pickDocument } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import KYCVerificationModal from "@/components/KYCVerificationModal";
import { db } from "@/db/fireBaseConfig";
import { doc, collection, getDoc, getDocs, query, where, limit, serverTimestamp, writeBatch } from "firebase/firestore";
import { SelectLocationProp } from "@/types/types";
import { PhoneAuthCredential } from "firebase/auth";
import { trackTruckAdded } from '@/services/analytics/appAnalytics';
import { incrementTotalTrucks } from '@/services/analytics/dashboardAnalytics';
import { incrementTruckCount } from '@/services/analytics/organizationAnalytics';

type FleetConfig = {



  notificationsEnabled: boolean;

  truckDefaults: {

    notification: {
      ratePerKm: number;
      roles: string[];
    };

  }


};

// -----------------------------------------------------------------------------
// Default brokerage auto-assignment
// -----------------------------------------------------------------------------

/**
 * Reads the fleet's active default brokerages from
 * fleets/{fleetId}/defaultBrokerages (the fast-lookup mirror kept in sync by
 * the Assign Brokerage screen) and attaches every one of them to a newly
 * created truck, mirroring the same two locations used everywhere else:
 *   - fleets/{fleetId}/trucks/{truckId}/brokerages/{brokerageId}
 *   - brokerages/{brokerageId}/trucks/{truckId}
 *
 * Each assigned brokerage is notified, same as a manual assignment. Never
 * throws — a problem here shouldn't undo a truck that was already created.
 */
async function assignDefaultBrokeragesToTruck(
  fleetId: string,
  fleetName: string,
  truckId: string,
  truckName: string,
  truckType: string,
  cargoArea: string,
  capacity: string,
  numberPlate: string,
  operatingLocations: string[]
): Promise<void> {
  try {
    const defaultsSnap = await getDocs(
      query(collection(db, "fleets", fleetId, "defaultBrokerages"), where("status", "==", "active"))
    );

    if (defaultsSnap.empty) return;

    // We need each brokerage's push token to notify them, which isn't
    // stored on the default-mirror doc, so fetch the brokerage docs too.
    const brokerageSnaps = await Promise.all(
      defaultsSnap.docs.map((d) => getDoc(doc(db, "brokerages", d.id)))
    );

    const assignedAt = new Date().toISOString();
    const batch = writeBatch(db);

    defaultsSnap.docs.forEach((defaultDoc, index) => {
      const brokerageId = defaultDoc.id;
      const brokerageName = defaultDoc.data()?.brokerageName ?? "";
      const brokerageSnap = brokerageSnaps[index];
      const expoPushToken = brokerageSnap.exists() ? (brokerageSnap.data()?.expoPushToken as string | undefined) : undefined;

      const truckAssignmentRef = doc(db, "fleets", fleetId, "trucks", truckId, "brokerages", brokerageId);
      batch.set(truckAssignmentRef, {
        brokerageId,
        brokerageName,
        fleetId,
        fleetName,
        status: "active",
        source: "default",
        assignedAt,
      });

      const brokerageTruckRef = doc(db, "brokerages", brokerageId, "trucks", truckId);
      batch.set(brokerageTruckRef, {
        brokerageId,
        brokerageName,
        fleetId,
        fleetName,
        truckId,
        truckName,
        truckType,
        cargoArea,
        capacity,
        numberPlate,
        operatingLocations,
        status: "active",
        source: "default",
        assignedAt,
      });

      if (expoPushToken) {
        sendUserNotification(
          expoPushToken,
          "New Truck Access 🚛",
          `${truckName} has been shared with your brokerage`,
          {
            pathname: "/Brokerage/TruckDetails",
            params: { truckId },
          },
          {
            type: "truck_access",
            truckId,
            brokerageId,
          }
        ).catch((e) => console.warn(`Failed to notify default brokerage ${brokerageId}`, e));
      } else {
        alert(`⚠️ No expoPushToken found for default brokerage ${brokerageId}, skipping notification`);
      }
    });

    await batch.commit();
  } catch (e) {
    // A truck was already successfully created at this point — don't let a
    // default-brokerage hiccup surface as a failure to the user.
    console.warn("Could not auto-assign default brokerages to new truck", e);
  }
}








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
    otherTankerType: "",
    numberPlate: "",
  });

  const [selectedOwnerDocuments, setSelectedOwnerDocumentS] = useState<DocumentAsset[]>([]);
  const [ownerFileType, setOwnerFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([])
  const [selectedTruckLease, setSelectedTruckLease] = useState<DocumentAsset[]>([]);
  const [truckLeaseFileType, setTruckLeaseFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([])

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

  const [selectedProofOfOwnerShip, setLease] = useState('');
  const [truckType, setTruckType] = useState<'Private' | 'Public'>('Private');


  const [spinnerItem, setSpinnerItem] = useState(false);
  const [uploadingImageUpdate, setUploadImageUpdate] = useState("")

  const { user, alertBox, currentRole } = useAuth();


  const [fleetConfig, setFleetConfig] = useState<FleetConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const snap = await getDoc(
        doc(db, `fleets/${currentRole.fleetId}/settings/config`)
      );

      const data = snap.exists() ? snap.data() : null;

      setFleetConfig(data as any);
    };

    if (currentRole?.fleetId) {
      loadConfig();
    }
  }, [currentRole?.fleetId]);




  // Function to clear all form fields
  const clearFormFields = () => {
    setFormData({
      additionalInfo: "",
      driverPhone: "",
      maxloadCapacity: "",
      truckName: "",
      otherCargoArea: "",
      otherTankerType: "",
      numberPlate: "",
    });
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
    // New fields
    setLease('');
    setTruckType('Private');
    // Clear truck lease document
    setSelectedTruckLease([]);
    setTruckLeaseFileType([]);
    // Modal is now controlled by visible prop
    // Removed broker selection
    setSpinnerItem(false);
  };

  const handleSubmit = async () => {

    setSpinnerItem(true)
    if (!currentRole.fleetId) {
      alert("You must be verified as a professional or fleet owner to add a truck. Please complete the verification process first.")
      setSpinnerItem(false)
      return
    }

    const missingTruckDetails = [
      !formData.truckName && "Enter Truck Nick Name ",
      !formData.numberPlate && "Enter Truck Nick Name ",
      !selectedTruckType && "Select Truck Type",
      !selectedCargoArea && "Select Truck Cargo Area",
      selectedCargoArea?.name === "Tanker" && !selectedTankerType && "Select Type of Tanker",
      !selectedTruckCapacity && "Select Truck Capacity",
      operationCountries.length <= 0 && "Select the countries where the truck has permits.",
      // (!gitImage || gitImage.length === 0) && "Upload GIT Certificate",
      (!truckNumberPlate || truckNumberPlate.length === 0) && "Upload Number Plate image",
      !truckType && "Select Truck Type (Private/Public)",
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

    const trialStartAt = Date.now();

    const trialEndAt = new Date(trialStartAt);
    trialEndAt.setDate(trialEndAt.getDate() + 30);



    try {

      // Generate unique truck ID
      const trucksRefPath = `fleets/${currentRole.fleetId}/Trucks`;
      const docRef = doc(collection(db, trucksRefPath));
      const truckId = docRef.id;



      const trialAlreadyUsed = await checkDocumentExists(
        "subscriptions",
        [
          where("type", "==", "truck"),
          where("numberPlate", "==", formData.numberPlate),
          where("isTrial", "==", true),
        ]
      );


      let subscriptionData;


      if (!trialAlreadyUsed) {

        const trialStartAt = Date.now();

        const trialEndDate = new Date(trialStartAt);
        trialEndDate.setDate(
          trialEndDate.getDate() + 30
        );

        const trialEndAt = trialEndDate.getTime();


        subscriptionData = {

          status: "trial",

          trialDays: 30,

          trialStartAt,

          trialEndAt,

          nextBillingAt: trialEndAt,

        };


        // Save trial history
        await addDocument("subscriptions", {

          type: "truck",

          truckId,

          numberPlate: formData.numberPlate,

          userId: user.uid,

          trialStartAt,

          trialEndAt,

          createdAt: Date.now(),
          lastPaymentAt: null


        });


      } else {


        subscriptionData = {


          trialDays: 0,

          trialStartAt: null,

          trialEndAt: null,

          nextBillingAt: null,
          lastPaymentAt: null


        };

      }





      const submitData = {
        CompanyName: currentRole.companyName || user.displayName,
        fleetId: currentRole?.accType === 'fleet' ? currentRole.fleetId : null,

        userId: user.uid,

        userContact: user?.phoneNumber || '',

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

        truckDispatchProfile: {
          notificationSettings: {
            notificationsEnabled: fleetConfig?.notificationsEnabled || false,
            notifyRoles: fleetConfig?.truckDefaults?.notification?.roles || [],
            minRatePerKm: fleetConfig?.truckDefaults?.notification?.ratePerKm || null,
          },
          availabilityData: {
            status: "AVAILABLE",
            matchingState: {
              type: "NEARBY",
              lastMatchedAt: "",
              activeLoadId: "",
              lastSeenAvailableAt: "",
            }

          },
        },

        // Associate with fleet if user is a fleet
        organizationDetails: {
          id: currentRole.organizationId || currentRole.fleetId || null,
          name: currentRole.companyName || user?.organisation,
          phone: currentRole.phone || null,
          billingAddress: currentRole.billingAddress || null,
          baseAdress: currentRole.baseAdress || null,
          accType: currentRole?.accType,
          location: currentRole.billingAddress || currentRole.baseAdress || null
        },

        subscription: subscriptionData,

        accType: currentRole?.accType || 'Individual', // owner, broker, driver, fleet
        timeStamp: serverTimestamp(),

      }

      await addDocumentWithId(`fleets/${currentRole.fleetId}/Trucks`, truckId, submitData);

      await addDocumentWithId("truckMarketplaceProfile", truckId, {
        truckId: truckId,


        locations: operationCountries,
        truckType: selectedTruckType?.name,
        cargoArea: selectedCargoArea.name,
        truckCapacity: selectedTruckCapacity?.name,
        tankerType: selectedTankerType ? selectedTankerType?.name : null,

        notificationSettings: {
          notificationsEnabled: fleetConfig?.notificationsEnabled || false,
          notifyRoles: fleetConfig?.truckDefaults?.notification?.roles || [],
          minRatePerKm: fleetConfig?.truckDefaults?.notification?.ratePerKm || null,
          assignments: {
            dispatcher: {
              id: user.uid,
              name: user.displayName,
              phoneNumber : user.phoneNumber ,
              organizationId : currentRole?.organizationId || currentRole?.fleetId ||null
            }
          },
        },
        availabilityData: {
          status: "AVAILABLE",
          matchingState: {
            type: "NEARBY",

          }

        },

      })


 const analyticsOrganizationId = currentRole?.organizationId || currentRole?.fleetId;
      if (analyticsOrganizationId) {
        void trackTruckAdded({ userId: user?.uid, organizationId: analyticsOrganizationId, organizationProfileId: analyticsOrganizationId, organizationType: 'fleet', role: currentRole?.userRole, accountType: currentRole?.accType, metadata: { truckId :truckId} }).catch(console.error);
        void incrementTotalTrucks('fleet', analyticsOrganizationId).catch(console.error);
        void incrementTruckCount(analyticsOrganizationId).catch(console.error);
      }
      // Auto-attach the fleet's active default brokerages to this new
      // truck and notify them — mirrors the manual "Other Brokers" flow.
      await assignDefaultBrokeragesToTruck(
        currentRole.fleetId,
        currentRole.companyName || user.displayName || "",
        truckId,
        formData.truckName,
        selectedTruckType?.name || "",
        selectedCargoArea.name,
        selectedTruckCapacity?.name || "",
        formData.numberPlate,
        operationCountries
      );

      clearFormFields()
      ToastAndroid.show("Truck Added successfully", ToastAndroid.SHORT);

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

          <View style={{ alignItems: 'center' }}>
            {images[0] && <Image source={{ uri: images[0].uri }} style={{ width: wp(90), height: wp(90), marginBottom: 9, borderRadius: wp(4) }} />}
            {!images[0] &&
              <TouchableOpacity onPress={() => selectImageWithCrop((image) => setImages([image]))} style={{ marginBottom: 9, width: wp(90), height: wp(90), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(40)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Truck Image<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>}

          </View>



          <ThemedText style={{ marginTop: wp(4), fontSize: 16, fontWeight: 'bold', fontStyle: 'italic', }}>
            Truck Details
          </ThemedText>

          {currentRole.accType === "driver" && <View style={{

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
          </View>}

          <View style={{ gap: wp(2) }}>

            <ThemedText>
              Truck Nickname<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.truckName}
              placeholder=""
              onChangeText={(text) => handleChange<TruckFormData>(text, 'truckName', setFormData)}
            />

            <ThemedText>
              Number Plate<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.numberPlate}
              placeholder=""
              onChangeText={(text) => handleChange<TruckFormData>(text, 'numberPlate', setFormData)}
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
                    <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>GIT Insuarance</ThemedText>
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
                    <ThemedText style={{ fontSize: 13.5, fontWeight: "bold" }} color={icon + "4c"}>Third Plate</ThemedText>
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
     
