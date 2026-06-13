import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Modal, ToastAndroid, Image, ActivityIndicator } from "react-native";
import { BlurView } from 'expo-blur';

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { db } from '@/db/fireBaseConfig';
import { collection,query,getDocs ,setDoc,doc,serverTimestamp} from 'firebase/firestore';
import { useAuth } from "@/context/AuthContext";

import { hp, wp } from "@/constants/common";

import { AddTruckDetails } from "@/components/AddTruckDetails";
import { TruckFormData } from "@/types/types";
import { TruckTypeProps } from "@/types/types";
import { useThemeColor } from '@/hooks/useThemeColor';

// New extracted components
import { StepIndicator } from '@/components/StepIndicator';
import { LocationSelector } from '@/components/LocationSelector';
import { RateInput } from '@/components/RateInput';

import { usePushNotifications, notifyLoadApprovalAdmins } from "@/Utilities/pushNotification";
import { uploadImage,addDocumentWithId ,addDocument , fetchDocuments} from "@/db/operations";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/db/fireBaseConfig";
import {  selectManyImages, pickDocumentsOnly } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import { ImagePickerAsset } from "expo-image-picker";
import { ErrorModal } from "@/components/ErrorModal";
import KYCVerificationModal from "@/components/KYCVerificationModal";

import { notifyTrucksByFilters } from "@/Utilities/notifyTruckByFilters";
import { TruckNeededType } from "@/types/types";


import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectLocationProp } from '@/types/types';

import { getUsers } from '@/db/operations';
// New utilities
import {
  validateLoadForm,
  getDefaultFormState,
  prepareLoadData
} from '@/Utilities/loadUtils';
const AddLoadDB = () => {

    interface userIsVerifiedProps {
    docId: string;
    isApproved: boolean;
    accType: 'professional';
  }
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [fleetManagerId, setFleetManagerId] = useState<string | null>(null);
const [fleetDrivers, setFleetDrivers] = useState<any[]>([]);
const [searchedDrivers, setSearchedDrivers] = useState<any[]>([]);
const [driversLoading, setDriversLoading] = useState(false);
const [fleetTrucks, setFleetTrucks] = useState<any[]>([]);
const [searchedTrucks, setSearchedTrucks] = useState<any[]>([]);
const [selectedFleetTrucks, setSelectedFleetTrucks] = useState<any[]>([]);
const [selectedDrivers, setSelectedDrivers] = useState<any[]>([]);
const [truckSearchQuery, setTruckSearchQuery] = useState('');
const [loadVisibility, setLoadVisibility] = useState<'Private' | 'Public'>('Private');

// Broker search states
const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
const [brokerSearchText, setBrokerSearchText] = useState('');
const [searchedBrokers, setSearchedBrokers] = useState<any[]>([]);

// Broker truck states
const [brokerTrucks, setBrokerTrucks] = useState<any[]>([]);
console.log(brokerTrucks)
const [selectedBrokerTrucks, setSelectedBrokerTrucks] = useState<any[]>([]);
const [brokerTruckSearchQuery, setBrokerTruckSearchQuery] = useState('');
const [searchedBrokerTrucks, setSearchedBrokerTrucks] = useState<any[]>([]);

// New fields for load requirements
const [numberOfTrucks, setNumberOfTrucks] = useState('');
const [deliveryDate, setDeliveryDate] = useState('');
const [fleetDriversFromTrucks, setFleetDriversFromTrucks] = useState<any[]>([]);


 useEffect(() => {
   const fetchAll = async () => {
     // Check current role from AsyncStorage
     try {
       const storedRole = await AsyncStorage.getItem('currentRole');
       if (storedRole) {
         const parsedRole = JSON.parse(storedRole);
         setCurrentRole(parsedRole);
         if (parsedRole.role === 'fleet' && parsedRole.accType === 'fleet') {
           setFleetManagerId(parsedRole.fleetManagerId || parsedRole.userId); // Use fleetManagerId if available, fallback to userId
         }
       }
     } catch (error) {
       console.error("Error fetching current role:", error);
     }


     // Fetch brokers for broker search functionality
     try {
       const brokersResult = await fetchDocuments('brokers', 100);
       if (brokersResult && brokersResult.data && Array.isArray(brokersResult.data)) {
         setSearchedBrokers(brokersResult.data);
       }
     } catch (error) {
       console.error("Error fetching brokers:", error);
     }

     // Fetch broker assigned trucks if user is a broker
     if (currentRole && currentRole.accType === 'broker') {
       try {
         // Use getDocs to fetch broker assigned trucks directly
         const brokerTrucksQuery = query(collection(db, `brokers/${currentRole.brokerId}/trucks`));
         const brokerTrucksSnapshot = await getDocs(brokerTrucksQuery);

         const brokerTrucksData = brokerTrucksSnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
         }));

         setBrokerTrucks(brokerTrucksData);
         setSearchedBrokerTrucks(brokerTrucksData);
       } catch (error) {
         console.error("Error fetching broker trucks:", error);
         setBrokerTrucks([]);
         setSearchedBrokerTrucks([]);
       }
     }

   };

   fetchAll();
 }, []); // Remove userIsFleetVerified dependency to prevent infinite loops






  const { expoPushToken } = usePushNotifications();
  const icon = useThemeColor('icon')
  const accent = useThemeColor('accent')
  const background = useThemeColor('background')
  const backgroundLight = useThemeColor('backgroundLight')
  const coolGray = useThemeColor('coolGray')

  // Initialize form state using utility function
  const defaultState = getDefaultFormState();
  const [step, setStep] = useState(defaultState.step);

  // Form state variables
  const [typeofLoad, setTypeofLoad] = useState(defaultState.typeofLoad);
  const [dspFromLocation, setDspFromLocation] = useState(false);
  const [destination, setDestination] = useState<SelectLocationProp | null>(null);
  const [origin, setOrigin] = useState<SelectLocationProp | null>(null);
  const [locationPicKERdSP, setPickLocationOnMap] = useState(false);
  const [dspToLocation, setDspToLocation] = useState(false);
  const [rate, setRate] = useState(defaultState.rate);
  const [rateexplantion, setRateExplanation] = useState(defaultState.rateexplantion);
  const [paymentTerms, setPaymentTerms] = useState(defaultState.paymentTerms);
  const [requirements, setRequirements] = useState(defaultState.requirements);
  const [loadingDate, setLoadingDate] = useState(defaultState.loadingDate);
  const [additionalInfo, setAdditionalInfo] = useState(defaultState.additionalInfo);
  const [alertMsg, setAlertMsg] = useState(defaultState.alertMsg);
  const [fuelAvai, setFuelAvai] = useState(defaultState.fuelAvai);
  const [returnLoad, setReturnLoad] = useState(defaultState.returnLoad || "");
  const [returnRate, setReturnRate] = useState(defaultState.returnRate || "");
  const [returnTerms, setReturnTerms] = useState(defaultState.returnTerms || "");

  // Return load location states
  const [returnOrigin, setReturnOrigin] = useState<SelectLocationProp | null>(null);
  const [returnDestination, setReturnDestination] = useState<SelectLocationProp | null>(null);
  const [returnDspFromLocation, setReturnDspFromLocation] = useState(false);
  const [returnDspToLocation, setReturnDspToLocation] = useState(false);
  const [returnLocationPicKERdSP, setReturnPickLocationOnMap] = useState(false);
  const [returnDistance, setReturnDistance] = useState("");
  const [returnDuration, setReturnDuration] = useState("");
  const [returnDurationInTraffic, setReturnDurationInTraffic] = useState("");
  const [returnRoutePolyline, setReturnRoutePolyline] = useState("");
  const [returnBounds, setReturnBounds] = useState(null);
  const [hasReturnLoad, setHasReturnLoad] = useState(false);
  const [useDifferentReturnLocation, setUseDifferentReturnLocation] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = React.useState(defaultState.selectedCurrency);
  const [selectedReturnCurrency, setSelectedReturnCurrency] = React.useState(defaultState.selectedReturnCurrency || { id: 1, name: "USD" });
  const [selectedModelType, setSelectedModelType] = React.useState(defaultState.selectedModelType || { id: 1, name: "Solid" });
  const [selectedReturnModelType, setSelectedReturnModelType] = React.useState(defaultState.selectedReturnModelType || { id: 1, name: "Solid" });

  // Truck Form Data
  const [formDataTruck, setFormDataTruck] = useState<TruckFormData>(defaultState.formDataTruck);

  const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(defaultState.selectedCargoArea);
  const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(defaultState.selectedTruckType);
  const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(defaultState.selectedTankerType);
  const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(defaultState.selectedTruckCapacity);
  const [showCountries, setShowCountries] = useState(defaultState.showCountries);
  const [operationCountries, setOperationCountries] = useState<string[]>(defaultState.operationCountries);
  const [trucksNeeded, setTrucksNeeded] = useState<TruckNeededType[]>(defaultState.trucksNeeded);
  
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [durationInTraffic, setDurationInTraffic] = useState("");
  const [routePolyline, setRoutePolyline] = useState("");
  const [bounds, setBounds] = useState(null);

  const apiKey = "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4";

  React.useEffect(() => {
    if (!origin || !destination) return;

    async function fetchDirections() {
      try {
        const fromLocation = `${origin?.latitude},${origin?.longitude}`;
        const toLocation = `${destination?.latitude},${destination?.longitude}`;

        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation}&destination=${toLocation}&departure_time=now&key=${apiKey}`
        );
        const data = await res.json();

        if (data.status === "OK" && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];

          setDistance(leg.distance.text);
          setDuration(leg.duration.text);

          // ԣ� ETA with traffic
          if (leg.duration_in_traffic) {
            setDurationInTraffic(leg.duration_in_traffic.text);
          }

          // ԣ� Encoded polyline
          setRoutePolyline(route.overview_polyline.points);

          // ԣ� Bounds for auto-zoom
          setBounds(route.bounds);
        } else {
          // No route found
        }
      } catch (err) {
        console.error("Directions API error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to get directions";
        showError(
          "Directions Error",
          "Unable to calculate route between locations. Please check your internet connection and try again.",
          err instanceof Error ? err.stack : String(err),
          false
        );
      }
    }

    fetchDirections();
  }, [origin, destination]);

  // Return load directions calculation
  React.useEffect(() => {
    if (!returnOrigin || !returnDestination) return;

    async function fetchReturnDirections() {
      try {
        const fromLocation = `${returnOrigin?.latitude},${returnOrigin?.longitude}`;
        const toLocation = `${returnDestination?.latitude},${returnDestination?.longitude}`;

        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation}&destination=${toLocation}&departure_time=now&key=${apiKey}`
        );
        const data = await res.json();

        if (data.status === "OK" && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];

          setReturnDistance(leg.distance.text);
          setReturnDuration(leg.duration.text);

          // ԣ� ETA with traffic
          if (leg.duration_in_traffic) {
            setReturnDurationInTraffic(leg.duration_in_traffic.text);
          }

          // ԣ� Encoded polyline
          setReturnRoutePolyline(route.overview_polyline.points);

          // ԣ� Bounds for auto-zoom
          setReturnBounds(route.bounds);
        } else {
          // No route found
        }
      } catch (err) {
        console.error("Return Directions API error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to get return directions";
        showError(
          "Return Directions Error",
          "Unable to calculate return route between locations. Please check your internet connection and try again.",
          err instanceof Error ? err.stack : String(err),
          false
        );
      }
    }

    fetchReturnDirections();
  }, [returnOrigin, returnDestination]);


 

  function pushTruck() {
    const newTruck: TruckNeededType = {
      cargoArea: selectedCargoArea,
      truckType: selectedTruckType,
      tankerType: selectedTankerType,
      capacity: selectedTruckCapacity,
      operationCountries: operationCountries,
    };


    if (selectedCargoArea && selectedTruckType && selectedTruckCapacity && operationCountries.length > 0) {
      // Check for duplicates before adding
      const isDuplicate = trucksNeeded.some(existingTruck =>
        existingTruck.cargoArea?.id === selectedCargoArea?.id &&
        existingTruck.truckType?.id === selectedTruckType?.id &&
        existingTruck.capacity?.id === selectedTruckCapacity?.id &&
        existingTruck.tankerType?.id === selectedTankerType?.id &&
        JSON.stringify(existingTruck.operationCountries.sort()) === JSON.stringify(operationCountries.sort())
      );

      if (isDuplicate) {
        ToastAndroid.show('This truck configuration is already added', ToastAndroid.SHORT);
        return;
      }

      setTrucksNeeded(prev => [...prev, newTruck]);

      // Reset all selections to defaults
      setSelectedCargoArea(null);
      setSelectedTruckType(null);
      setSelectedTankerType(null);
      setSelectedTruckCapacity(null);
      setOperationCountries([]);

      // ToastAndroid.show('Truck added successfully', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('Select All Truck Details', ToastAndroid.SHORT);
    }

  }
  function removeTruck(indexToRemove: number) {
    setTrucksNeeded(prev => prev.filter((_, index) => index !== indexToRemove));
  }




  const { user, alertBox } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error modal state
  const [errorTitle, setErrorTitle] = useState("Error");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);


  // Helper function to show error modal
  const showError = (title: string, message: string, details?: string, showDetails: boolean = false) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorDetails(details || "");
    setShowErrorDetails(showDetails);
  };


  // Function to clear all form fields
  const clearFormFields = () => {
    const defaultState = getDefaultFormState();

    // Reset all form fields
    setTypeofLoad(defaultState.typeofLoad);
    setRate(defaultState.rate);
    setRateExplanation(defaultState.rateexplantion);
    setPaymentTerms(defaultState.paymentTerms);
    setRequirements(defaultState.requirements);
    setLoadingDate(defaultState.loadingDate);
    setAdditionalInfo(defaultState.additionalInfo);
    setAlertMsg(defaultState.alertMsg);
    setFuelAvai(defaultState.fuelAvai);
    setReturnLoad(defaultState.returnLoad);
    setReturnRate(defaultState.returnRate);
    setReturnTerms(defaultState.returnTerms);
    setSelectedCurrency(defaultState.selectedCurrency);
    setSelectedReturnCurrency(defaultState.selectedReturnCurrency);
    setSelectedModelType(defaultState.selectedModelType);
    setSelectedReturnModelType(defaultState.selectedReturnModelType);
    setFormDataTruck(defaultState.formDataTruck);
    setSelectedCargoArea(defaultState.selectedCargoArea);
    setSelectedTruckType(defaultState.selectedTruckType);
    setSelectedTankerType(defaultState.selectedTankerType);
    setSelectedTruckCapacity(defaultState.selectedTruckCapacity);
    setShowCountries(defaultState.showCountries);
    setOperationCountries(defaultState.operationCountries);
    setTrucksNeeded(defaultState.trucksNeeded);
    setStep(defaultState.step);

    // Reset new fields
    setNumberOfTrucks('');
    setDeliveryDate('');

    // Reset location fields
    setOrigin(null);
    setDestination(null);
    setDspFromLocation(false);
    setDspToLocation(false);
    setPickLocationOnMap(false);
    setDistance("");
    setDuration("");
    setDurationInTraffic("");
    setRoutePolyline("");
    setBounds(null);

    // Reset return load location fields
    setReturnOrigin(null);
    setReturnDestination(null);
    setReturnDspFromLocation(false);
    setReturnDspToLocation(false);
    setReturnPickLocationOnMap(false);
    setReturnDistance("");
    setReturnDuration("");
    setReturnDurationInTraffic("");
    setReturnRoutePolyline("");
    setReturnBounds(null);
    setHasReturnLoad(false);
    setUseDifferentReturnLocation(false);


    // Reset proof of order fields
    setProofImages([]);
    setProofDocuments([]);
    setProofDocumentTypes([]);

    // Reset broker selection fields
    setSelectedBrokers([]);
    setBrokerSearchText('');
    setSearchedBrokers([]);

  };


  // Separate state for proof images and documents
  const [proofImages, setProofImages] = useState<ImagePickerAsset[]>([]);
  const [proofDocuments, setProofDocuments] = useState<DocumentAsset[]>([]);
  const [proofDocumentTypes, setProofDocumentTypes] = React.useState<('pdf' | 'doc' | 'docx')[]>([]);
  const [uploadImageUpdate, setUploadImageUpdate] = useState("");


    const handleSubmit = async () => {

      try{

      setIsSubmitting(true)

      if (!alertBox) {
      console.error('alertBox not available');
      setIsSubmitting(false);
      return;
    }
  if (!user) {
      alert("Please Login first");
      setIsSubmitting(false);
      router.push('/Account/Login')
      return;
    }


      // Use utility function for validation
      let validationErrors = [];
  try {
    validationErrors = validateLoadForm("professional", {
      typeofLoad,
      origin,
      destination,
      rate,
      paymentTerms,
      trucksNeeded,
      requirements,
      proofOfOrder: [...proofDocuments],
      proofOfOrderFileType: [...proofDocumentTypes],
    }, step);
  } catch (e) {
    const errorDetails = e instanceof Error ? e.stack : String(e);
        showError(
          "Validation Error",
          "Failed to vallidate Form Data",
          errorDetails,
          true
        );
            setIsSubmitting(false);

      
    return;
  }


      // Additional validation for new fields
      if (!numberOfTrucks || numberOfTrucks.trim() === '') {
        validationErrors.push('Number of trucks needed is required');
      }
      if (!deliveryDate || deliveryDate.trim() === '') {
        validationErrors.push('Delivery date is required');
      }


      // Additional validation for fleet users - check if they have selected trucks for private loads
      if (currentRole?.accType === 'fleet' && loadVisibility === 'Private') {
        if (selectedFleetTrucks.length === 0) {
          validationErrors.push('Select at least one truck from your fleet');
        }
        // For private trucks, drivers are optional - fleet manager can assign later
        // Check if selected drivers are actually assigned to selected trucks
        const invalidDrivers = selectedDrivers.filter(driver =>
          !selectedFleetTrucks.some(truck => truck.id === driver.truckId)
        );
        if (invalidDrivers.length > 0) {
          validationErrors.push('Some selected drivers are not assigned to the selected trucks');
        }
      }

      // Additional validation for broker selection - skip for broker users
      // if (currentRole?.accType !== 'broker' && selectedBrokers.length === 0) {
      //   validationErrors.push('Select at least one broker');
      // }

      // Additional validation for broker private loads
      if (currentRole?.accType === 'broker' && loadVisibility === 'Private') {
        if (selectedBrokerTrucks.length === 0) {
          validationErrors.push('Select at least one assigned truck');
        }
      }

     
      if (validationErrors.length > 0) {
        setTimeout(() => {
          alertBox("Missing Load Details", validationErrors.join("\n"), [], "error");
        }, 100);
        setIsSubmitting(false)
        return;
      }

      // Show payment confirmation modal
      confirmLoadPaymentAndSubmit()
      setIsSubmitting(false);
      return;
    
    }catch(e){
      const errorDetails = e instanceof Error ? e.stack : String(e);
        showError(
          "Failed to Submit Load",
          "There was an error submitting your load. Please try again.",
          errorDetails,
          true
        );
            setIsSubmitting(false);

        console.log(e)
      }
    
    };

 

  // Function to handle payment confirmation and proceed with load submission
  const confirmLoadPaymentAndSubmit = async () => {
    setIsSubmitting(true);

  

    try {
      if (!user) {
        alert("Please Login first");
        setIsSubmitting(false)
        router.push('/Account/Login')
        return;
      }
      if (!user || !user.uid) {
  alert("Please wait for user data to load or reopen Add Load.");
  return;
}



      if (!user.organisation) {
        setIsSubmitting(false)
        alert("Please edit your account and add Organisation details first, eg:Organisation Name!");
        return;
      }

      let proofOfOerSub: string[] = []
      let loadImagesUrls: string[] = []

      // Handle different proof types based on user type
        // Upload all proof images for professional users
        if (proofImages && proofImages.length > 0) {
          for (let i = 0; i < proofImages.length; i++) {
            const imageUrl = await uploadImage(proofImages[i], "CargoProof", setUploadImageUpdate, `Proof Image ${i + 1}`);
            if (imageUrl) proofOfOerSub.push(imageUrl);
          }
        }

        // Upload all proof documents for professional users
        if (proofDocuments && proofDocuments.length > 0) {
          for (let i = 0; i < proofDocuments.length; i++) {
            const docUrl = await uploadImage(proofDocuments[i], "CargoProof", setUploadImageUpdate, `Proof Document ${i + 1}`);
            if (docUrl) proofOfOerSub.push(docUrl);
          }
        }

     

      // Use utility function to prepare load data
      const loadData = prepareLoadData("professional", {
        typeofLoad,
        origin,
        destination,
        rate,
        rateexplantion,
        paymentTerms,
        requirements,
        additionalInfo,
        alertMsg,
        fuelAvai,
        returnLoad: returnLoad || "",
        returnRate: returnRate || "",
        returnTerms: returnTerms || "",
        selectedCurrency,
        selectedModelType,
        selectedReturnCurrency: selectedReturnCurrency || { id: 1, name: "USD" },
        selectedReturnModelType: selectedReturnModelType || { id: 1, name: "Solid" },
        loadingDate,
        trucksNeeded,
        proofOfOerSub,
        proofOfOrderFileType: [...(proofImages || []).map(() => 'image' as const), ...(proofDocumentTypes || [])],
        loadImagesUrls,
        distance,
        duration,
        durationInTraffic,
        routePolyline,
        bounds,
       
        // New fields
        numberOfTrucks,
        deliveryDate,
        selectedBrokers,
      }, user, expoPushToken);

     
// Fleet-specific logic: If user is in a fleet and load is private, assign selected trucks and drivers
if (currentRole?.accType === 'fleet' && loadVisibility === 'Private' && selectedFleetTrucks.length > 0) {

const trucks = selectedFleetTrucks;
const drivers = selectedDrivers;

// 1������ Add Cargo to fleet collection and get the auto-generated cargoId
const cargoRefPath = `fleets/${currentRole.fleetId}/Cargo`;

 const docRef = doc(collection(db, `fleets/${currentRole.fleetId}/Cargo`));
const cargoId = docRef.id;

await setDoc(docRef, {

  ...loadData,
  cargoId: cargoId,
  loadVisibility: 'Private',
  cargoStatus: "pending",
  trucks: trucks.map(truck => ({
    truckId: truck.id,
    truckName : truck.truckName,
    truckStatus: "pending",
   drivers: drivers.filter(d => d.truckId === truck.id).map(driver => ({
 driverId: driver.driverId ||null,
 role: driver.role||null,
 fullName: driver.fullName||null,
 phoneNumber: driver.phoneNumber||null,
 status: "pending",
  timeStamp: serverTimestamp(),
 
}))

  }))
});

// 2������ Add load to selected brokers' subcollections
for (const brokerId of selectedBrokers) {
  const brokerLoadData = {
    loadId: cargoId,
    loadStatus: "pending",
    loadVisibility: 'Private',
    truckId: trucks[0]?.id || null, // Primary truck
    truckName: trucks[0]?.truckName || null,
    driverId: drivers[0]?.driverId || null,
    driverName: drivers[0]?.fullName || null,
    origin: origin,
    destination: destination,
    loadingDate: loadingDate,
    deliveryDate: deliveryDate,
    createdAt: new Date(),
    coordinator: {
      id: currentRole.userId,
      name: user.organisation || "",
      phoneNumber: user.phoneNumber || ""
    }
  };

  const brokerLoadDocId = `${cargoId}_${brokerId}`;
  await addDocumentWithId(`brokers/${brokerId}/loads`, brokerLoadDocId, brokerLoadData);
}

  // 2������ Cargo assignments per truck
  for (const truck of trucks) {
    const truckDrivers = drivers.filter(d => d.truckId === truck.id);
    if (truckDrivers.length > 0) {
      const assignmentDocId = `${cargoId}_${truck.id}`;
      await addDocumentWithId(`${cargoRefPath}/${cargoId}/assignments`, assignmentDocId, {
        truckId: truck.id,
        truckName: truck.truckName,
        cargoId: cargoId,
        assignedDrivers: truckDrivers.map(driver => ({
          driverId: driver.driverId,
          role: driver.role,
          fullName: driver.fullName,
          phoneNumber: driver.phoneNumber,
          status: "pending"
        })),
        mainDriver: truckDrivers.find(d => d.role === "main")?.driverId || "",
        status: "pending",
        acceptedBy: null,
        createdAt: new Date() ,
       
      });
    }
  }

  // 3������ Assign cargo to drivers
  for (const driver of drivers) {
    const driverCargoDocId = `${cargoId}_${driver.driverId}_${driver.truckId}_${driver.role}`;
    await addDocumentWithId(`fleets/${currentRole.fleetId}/Drivers/${driver.docId}/cargo`, driverCargoDocId, {
      cargoId: cargoId,
      truckId: driver.truckId,
      truckName: driver.truckName,
      role: driver.role,
      status: "pending",
      assignedAt: new Date(),
      loadingDate ,
      deliveryDate ,
      origin,
      destination,
      loadVisibility: 'Private',
      coordinator: {
        id: currentRole.userId,
        name: user.organisation || "" ,
        phoneNumber : user.phoneNumber || ""
      }
    });
  }

  // 4������ Optional: Truck cargo history
  // for (const truck of trucks) {
  //   console.log("adduing truck sub")

  //   const truckDrivers = drivers.filter(d => d.truckId === truck.truckId);
  //   if (truckDrivers.length > 0) {
  //     await addDocument(`fleets/${currentRole.fleetId}/Trucks/${truck.truckId}/cargoHistory`, {
  //       cargoId,
  //       assignedDriverId: truckDrivers.find(d => d.role === "main")?.driverId || "",
  //       status: "pending",
  //       completedAt: null
  //     });
  //   }
  // }

 

}else if (currentRole?.accType === 'fleet' && loadVisibility === 'Public') {
  // Fleet user with public load


     
  // 1������ Regular Cargo addition to main Cargo collection
} else if(currentRole?.accType === 'broker' && loadVisibility === 'Private') {
  // Broker user with private load - assign to selected trucks
  const trucks = selectedBrokerTrucks;

  // 1������ Add Cargo to broker's subcollection and get the auto-generated cargoId
  const brokerCargoRefPath = `brokers/${currentRole.userId}/loads`;

  const docRef = doc(collection(db, `brokers/${currentRole.userId}/loads`));
  const cargoId = docRef.id;

  await setDoc(docRef, {
    ...loadData,
    cargoId: cargoId,
    loadVisibility: 'Private',
    cargoStatus: "pending",
    trucks: trucks.map(truck => ({
      truckId: truck.truckId,
      truckName: truck.truckName,
      truckStatus: "pending",
      // Note: Brokers don't select drivers - fleet managers handle that
    }))
  });

  // 2������ Add load to fleet manager's brokerLoads subcollection
  // This allows the fleet manager to see which loads brokers have assigned to their trucks
  for (const truck of trucks) {
    const brokerLoadData = {
      loadId: cargoId,
      loadStatus: "pending",
      loadVisibility: 'Private',
      truckId: truck.truckId,
      truckName: truck.truckName,
      brokerId: currentRole.userId,
      brokerName: user.organisation || user.displayName || "Broker",
      origin: origin,
      destination: destination,
      loadingDate: loadingDate,
      deliveryDate: deliveryDate,
      createdAt: new Date(),
      coordinator: {
        id: currentRole.userId,
        name: user.organisation || user.displayName || "Broker",
        phoneNumber: user.phoneNumber || ""
      }
    };

    const brokerLoadDocId = `${cargoId}_${truck.truckId}`;
    await addDocumentWithId(`fleets/${truck.fleetId}/fleetManagers/FLTMGR${truck.fleetId}/brokerLoads`, brokerLoadDocId, brokerLoadData);
  }
}







// // Add load to selected brokers' subcollections for public loads
// for (const brokerId of selectedBrokers) {
//   const brokerLoadData = {
//     loadId: loadData.loadId,
//     loadStatus: "pending",
//     loadVisibility: 'Public',
//     origin: origin,
//     destination: destination,
//     loadingDate: loadingDate,
//     deliveryDate: deliveryDate,
//     createdAt: new Date(),
//     coordinator: {
//       id: user.uid,
//       name: user.organisation || "",
//       phoneNumber: user.phoneNumber || ""
//     }
//   };

//   const brokerLoadDocId = `${loadData.loadId}_${brokerId}`;
//   await addDocumentWithId(`brokers/${brokerId}/loads`, brokerLoadDocId, brokerLoadData);
// }



      // Ensure addDocument is not a React hook or using hooks internally.
      // await addDocument("Cargo", loadData);

      // Notify admins who can approve loads
      // await notifyLoadApprovalAdmins(loadData);

      // if (trucksNeeded && trucksNeeded.length > 0) {
      //   await notifyTrucksByFilters({
      //     trucksNeeded,
      //     loadItem: {
      //       typeofLoad: typeofLoad,
      //       origin: origin?.description || "",
      //       destination: destination?.description || "",
      //       rate: (userType as string) === 'professional' ? rate : (budget || 'Budget to be discussed'),
      //       model: (userType as string) === 'professional' ? (selectedModelType?.name || 'Solid') : 'Solid',
      //       currency: (userType as string) === 'professional' ? (selectedCurrency?.name || 'USD') : (budgetCurrency?.name || 'USD'),
      //     },
      //   });
      // }

      ToastAndroid.show('Trucks notified and load added successfully.', ToastAndroid.SHORT);

      // Clear form and reset to initial state
      // clearFormFields();

    } catch (error) {
      console.error("Error submitting load:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const errorDetails = error instanceof Error ? error.stack : String(error);
      showError(
        "Failed to Submit Load",
        "There was an error submitting your load. Please try again.",
        errorDetails,
        true
      );
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <ScreenWrapper fh={false}>


      <Heading
        page='Create Load'
       
      />

     


            <StepIndicator
              steps={ ['Load Details', 'Additional Info', 'Return Load', 'Truck Req']}
              currentStep={step}
              onStepPress={setStep}
            />

      <View style={{ flex: 1, position: 'relative' }}>
        {step === 0 && (
          <ScrollView keyboardShouldPersistTaps="always" >
            <View style={styles.viewMainDsp}>
            
                <>
                  <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                    Professional Load Details
                  </ThemedText>
                  <Divider />
                  <ThemedText>
                    Type of Load<ThemedText color="red">*</ThemedText>
                  </ThemedText>
                  <Input
                    value={typeofLoad}
                    onChangeText={setTypeofLoad}
                  />
                </>


              {/* Common location fields */}
              <LocationSelector
                origin={origin}
                destination={destination}
                setOrigin={setOrigin}
                setDestination={setDestination}
                dspFromLocation={dspFromLocation}
                setDspFromLocation={setDspFromLocation}
                dspToLocation={dspToLocation}
                setDspToLocation={setDspToLocation}
                locationPicKERdSP={locationPicKERdSP}
                setPickLocationOnMap={setPickLocationOnMap}
                distance={distance}
                duration={duration}
                durationInTraffic={durationInTraffic}
                iconColor={accent}
              />

               <RateInput
                rate={rate}
                setRate={setRate}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                selectedModelType={selectedModelType}
                setSelectedModelType={setSelectedModelType}
                rateExplanation={rateexplantion}
                setRateExplanation={setRateExplanation}
              />


              <Divider />

             
              <ThemedText>
                Payment Terms<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={paymentTerms}
                onChangeText={setPaymentTerms}
                placeholder='e.g., Payment terms, Payment method, Payment schedule'
              />
            </View>
            <Divider />
            <View style={styles.viewMainDsp}>
              <Button onPress={() => setStep(1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
          </ScrollView>
        )}
       
        {step === 1 &&  (
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Additional Info
              </ThemedText>
              <Divider />
<ThemedText>
                Number of Trucks Needed<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={numberOfTrucks}
                onChangeText={setNumberOfTrucks}
                placeholder='e.g., 1, 2, 5'
                keyboardType="numeric"
              />
              <ThemedText>
                Loading date <ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={loadingDate}
                onChangeText={setLoadingDate}
              />

              <ThemedText>
                Delivery Date<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={deliveryDate}
                onChangeText={setDeliveryDate}
                placeholder='e.g., 2024-12-25 or ASAP'
              />


              <ThemedText>
                Requirements<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={requirements}
                onChangeText={setRequirements}
              />
              <ThemedText>
                Additional Information<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                multiline
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
              />

              <ThemedText>
                Alert Message<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={alertMsg}
                onChangeText={setAlertMsg}
              />
              <ThemedText>
                Fuel & Tolls Infomation<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={fuelAvai}
                onChangeText={setFuelAvai}
              />

              {
                ( (proofImages.length > 0 || proofDocuments.length > 0)) ? (
                  <View>
                    <ThemedText style={{ marginBottom: wp(2), fontWeight: 'bold' }}>
                       Proof of Order
                    </ThemedText>

                  
                      <View>
                        <ThemedText style={{ fontSize: 12, color: '#666', marginBottom: wp(2) }}>
                          {(proofImages.length + proofDocuments.length)}/6 files uploaded
                        </ThemedText>

                        {/* Proof Images Section */}
                        {proofImages.length > 0 && (
                          <View style={{ marginBottom: wp(3) }}>
                            <ThemedText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: wp(2), color: '#004d40' }}>
                              Images ({proofImages.length})
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {proofImages.map((image, index) => (
                                <View
                                  key={`img-${index}`}
                                  style={{
                                    width: wp(30),
                                    marginRight: wp(2),
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 8,
                                    padding: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                    position: 'relative',
                                  }}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      setProofImages(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: -5,
                                      right: -5,
                                      backgroundColor: 'white',
                                      borderRadius: 10,
                                      zIndex: 1,
                                    }}
                                  >
                                    <Ionicons name="close-circle" size={20} color="red" />
                                  </TouchableOpacity>

                                  <Image
                                    source={{ uri: image.uri }}
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
                                    Image {index + 1}
                                  </ThemedText>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        {/* Proof Documents Section */}
                        {proofDocuments.length > 0 && (
                          <View style={{ marginBottom: wp(3) }}>
                            <ThemedText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: wp(2), color: '#004d40' }}>
                              Documents ({proofDocuments.length})
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {proofDocuments.map((file, index) => (
                                <View
                                  key={`doc-${index}`}
                                  style={{
                                    width: wp(30),
                                    marginRight: wp(2),
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 8,
                                    padding: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                    position: 'relative',
                                  }}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      setProofDocuments(prev => prev.filter((_, i) => i !== index));
                                      setProofDocumentTypes(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: -5,
                                      right: -5,
                                      backgroundColor: 'white',
                                      borderRadius: 10,
                                      zIndex: 1,
                                    }}
                                  >
                                    <Ionicons name="close-circle" size={20} color="red" />
                                  </TouchableOpacity>

                                  <View
                                    style={{
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      height: wp(20),
                                      backgroundColor: '#e0f2f1',
                                      borderRadius: 8,
                                    }}
                                  >
                                    <Ionicons
                                      name={proofDocumentTypes[index] === 'pdf' ? 'document-text' : 'document'}
                                      size={40}
                                      color="#004d40"
                                    />
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
                                    {file.name}
                                  </ThemedText>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        {/* Add More Files Buttons */}
                        {(proofImages.length + proofDocuments.length) < 6 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: wp(2) }}>
                            <TouchableOpacity
                              onPress={() => selectManyImages(setProofImages, false, 6 - proofDocuments.length, proofImages.length)}
                              style={{
                                backgroundColor: '#1E90FF',
                                height: 45,
                                justifyContent: 'center',
                                paddingHorizontal: 20,
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
                                  fontSize: 12,
                                }}
                              >
                                Add Images
                              </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => pickDocumentsOnly(setProofDocuments, setProofDocumentTypes, 6 - proofImages.length, proofDocuments.length)}
                              style={{
                                backgroundColor: '#004d40',
                                height: 45,
                                justifyContent: 'center',
                                paddingHorizontal: 20,
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
                                  fontSize: 12,
                                }}
                              >
                                Add Documents
                              </ThemedText>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    
                  </View>
                ) : (
                  <View>
                    <ThemedText style={{ fontSize: 13.6, fontWeight: 'bold', textAlign: "center", color: "#1E90FF", }}>
                      Upload: Proof of Load Request
                    </ThemedText>
                    <ThemedText type="tiny">
                      Upload images, PDFs, or Word documents proving this load is real and needs a truck. (Max 6 files)
                    </ThemedText>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: wp(3) }}>
                      <TouchableOpacity
                        onPress={() => selectManyImages(setProofImages, false, 6, proofImages.length)}
                        style={{
                          backgroundColor: '#1E90FF',
                          height: 45,
                          justifyContent: 'center',
                          paddingHorizontal: 20,
                          borderRadius: 8,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="camera" size={16} color="white" style={{ marginRight: 8 }} />
                          <ThemedText
                            style={{
                              textAlign: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: 14,
                            }}
                          >
                            Add Images
                          </ThemedText>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => pickDocumentsOnly(setProofDocuments, setProofDocumentTypes, 6, proofDocuments.length)}
                        style={{
                          backgroundColor: '#004d40',
                          height: 45,
                          justifyContent: 'center',
                          paddingHorizontal: 20,
                          borderRadius: 8,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="document-text" size={16} color="white" style={{ marginRight: 8 }} />
                          <ThemedText
                            style={{
                              textAlign: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: 14,
                            }}
                          >
                            Add Documents
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              }

            </View>
            <Divider />
            <View style={{ paddingVertical: wp(3), gap: wp(2), borderRadius: 8, shadowColor: "#6a0c0c", shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.7, shadowRadius: 5, overflow: "hidden", }}>
              <Button onPress={() => setStep(0)} title="Back" />
              <Button onPress={() => setStep(2)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
          </ScrollView>
        )}
       
        {step === 2 &&  (
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Return Load
              </ThemedText>
              <Divider />


 {/* Return Load Location Selection */}
              <TouchableOpacity style={{ marginTop: wp(3) }} onPress={() => setUseDifferentReturnLocation(!useDifferentReturnLocation)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(2) }}  onTouchEnd={() => setUseDifferentReturnLocation(!useDifferentReturnLocation)}>
                  
                  <View
                   
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: useDifferentReturnLocation ? accent : coolGray,
                      borderRadius: 4,
                      backgroundColor: useDifferentReturnLocation ? accent : 'transparent',
                      marginRight: wp(2),
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {useDifferentReturnLocation && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <ThemedText style={{ flex: 1, fontSize: 14, fontWeight: '600' }}>
                    Use different return load locations
                  </ThemedText>
                </View>

                <ThemedText style={{ fontSize: 12, color: '#666', marginBottom: wp(2) }}>
                  Check this if the return load pickup and delivery locations are different from the main load
                </ThemedText>

                {useDifferentReturnLocation && (
                  <LocationSelector
                    origin={returnOrigin}
                    destination={returnDestination}
                    setOrigin={setReturnOrigin}
                    setDestination={setReturnDestination}
                    dspFromLocation={returnDspFromLocation}
                    setDspFromLocation={setReturnDspFromLocation}
                    dspToLocation={returnDspToLocation}
                    setDspToLocation={setReturnDspToLocation}
                    locationPicKERdSP={returnLocationPicKERdSP}
                    setPickLocationOnMap={setReturnPickLocationOnMap}
                    distance={returnDistance}
                    duration={returnDuration}
                    durationInTraffic={returnDurationInTraffic}
                    iconColor="#2196F3"
                  />
                )}
              </TouchableOpacity>


              <ThemedText>
                Return Load<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={returnLoad || ""}
                onChangeText={(text) => setReturnLoad(text || "")}
                placeholder="Enter return load details"
              />
              <RateInput
                rate={returnRate || ""}
                setRate={(rate) => setReturnRate(rate || "")}
                selectedCurrency={selectedReturnCurrency || { id: 1, name: "USD" }}
                setSelectedCurrency={setSelectedReturnCurrency}
                selectedModelType={selectedReturnModelType || { id: 1, name: "Solid" }}
                setSelectedModelType={setSelectedReturnModelType}
                rateExplanation={returnTerms || ""}
                setRateExplanation={(terms) => setReturnTerms(terms || "")}
                isReturnRate={true}
              />







              <ThemedText>
                Return Terms<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={returnTerms || ""}
                onChangeText={(text) => setReturnTerms(text || "")}
                placeholder="Enter return load terms"
              />

             
            </View>
            <Divider />
            <View style={styles.viewMainDsp}>
              <Button onPress={() => setStep(1)} title="Back" />
              <Button onPress={() => setStep(3)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
          </ScrollView>
        )}
       
        {step === 3 &&  (<ScrollView>
      <View style={styles.viewMainDsp}>
        <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
          {currentRole?.accType === 'fleet' ? 'Select Fleet Trucks & Drivers' : 'Truck Requirements'}
        </ThemedText>
        <Divider />

        {/* Broker Selection Section - Hide for broker users */}
        {currentRole?.accType !== 'broker' && (
          <>
            <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>Select Brokers</ThemedText>
            <Input
              value={brokerSearchText}
              onChangeText={(text) => {
                setBrokerSearchText(text);
                if (text.trim() === '') {
                  setSearchedBrokers(searchedBrokers); // Reset to all brokers
                } else {
                  const filtered = searchedBrokers.filter(broker =>
                    broker.name?.toLowerCase().includes(text.toLowerCase()) ||
                    broker.brokerEmail?.toLowerCase().includes(text.toLowerCase())
                  );
                  setSearchedBrokers(filtered);
                }
              }}
              placeholder="Search brokers by name or email"
            />

            <ThemedText style={{ fontSize: 14, color: '#666', marginTop: wp(1) }}>
              Available Brokers:
            </ThemedText>
            {searchedBrokers.map((broker, index) => (
              <TouchableOpacity
                key={broker.brokerId || index}
                onPress={() => {
                  if (selectedBrokers.includes(broker.brokerId)) {
                    setSelectedBrokers(prev => prev.filter(id => id !== broker.brokerId));
                  } else {
                    setSelectedBrokers(prev => [...prev, broker.brokerId]);
                  }
                }}
                style={{
                  padding: wp(3),
                  marginVertical: wp(1),
                  borderRadius: 8,
                  backgroundColor: backgroundLight,
                  borderWidth: 1,
                  borderColor: selectedBrokers.includes(broker.brokerId) ? accent : '#E0E0E0',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={selectedBrokers.includes(broker.brokerId) ? "checkbox" : "square-outline"}
                    size={20}
                    color={selectedBrokers.includes(broker.brokerId) ? accent : '#666'}
                    style={{ marginRight: wp(2) }}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: '600' }}>{broker.name}</ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666' }}>{broker.brokerEmail}</ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666' }}>{broker.brokerType}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <Divider />
          </>
        )}

            {/* Load Visibility Toggle for Fleet and Broker Users */}
            {(currentRole?.accType === 'fleet' || currentRole?.accType === 'broker') && (
              <View style={{ marginBottom: wp(4) }}>
                <ThemedText style={{ fontWeight: 'bold', marginBottom: wp(2) }}>Load Visibility</ThemedText>
                <View style={{ flexDirection: 'row', gap: wp(2) }}>
                  <TouchableOpacity
                    onPress={() => setLoadVisibility('Private')}
                    style={{
                      flex: 1,
                      padding: wp(3),
                      borderRadius: 8,
                      backgroundColor: loadVisibility === 'Private' ? '#E3F2FD' : backgroundLight,
                      borderWidth: 1,
                      borderColor: loadVisibility === 'Private' ? '#2196F3' : '#E0E0E0',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={loadVisibility === 'Private' ? '#2196F3' : '#666'}
                      style={{ marginBottom: wp(1) }}
                    />
                    <ThemedText style={{
                      fontWeight: loadVisibility === 'Private' ? 'bold' : 'normal',
                      color: loadVisibility === 'Private' ? '#2196F3' : '#666'
                    }}>
                      Private
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: wp(1) }}>
                      {currentRole?.accType === 'fleet' ? 'Only fleet trucks' : 'Only assigned trucks'}
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setLoadVisibility('Public')}
                    style={{
                      flex: 1,
                      padding: wp(3),
                      borderRadius: 8,
                      backgroundColor: loadVisibility === 'Public' ? '#E8F5E8' : backgroundLight,
                      borderWidth: 1,
                      borderColor: loadVisibility === 'Public' ? '#4CAF50' : '#E0E0E0',
                      alignItems: 'center'
                    }}
                  >
                    <Ionicons
                      name="globe"
                      size={20}
                      color={loadVisibility === 'Public' ? '#4CAF50' : '#666'}
                      style={{ marginBottom: wp(1) }}
                    />
                    <ThemedText style={{
                      fontWeight: loadVisibility === 'Public' ? 'bold' : 'normal',
                      color: loadVisibility === 'Public' ? '#4CAF50' : '#666'
                    }}>
                      Public
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: wp(1) }}>
                      All available trucks
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

 
            {currentRole?.accType === 'fleet' && loadVisibility === 'Private' ? (
              // Fleet User: Private load - Select trucks and display their drivers
              <>
                {/* Truck Search */}
                <ThemedText>Search Trucks</ThemedText>
                <Input
                  value={truckSearchQuery}
                  onChangeText={(text) => {
                    setTruckSearchQuery(text);
                    if (text.trim() === '') {
                      setSearchedTrucks(fleetTrucks);
                    } else {
                      const filtered = fleetTrucks.filter(truck =>
                        truck.registrationNumber?.toLowerCase().includes(text.toLowerCase()) ||
                        truck.truckType?.toLowerCase().includes(text.toLowerCase())
                      );
                      setSearchedTrucks(filtered);
                    }
                  }}
                  placeholder="Search by registration or type"
                />

                {/* Available Trucks with Drivers */}
                <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>Available Trucks</ThemedText>
                
                {searchedTrucks.map((truck, index) => {
                  // Get drivers for this truck
            const truckDrivers = fleetDriversFromTrucks.filter(driver => driver.truckId === truck.id);

                  
                  return (
                    <View key={truck.truckId || index} style={{

                      marginVertical: wp(1),
                      borderRadius: 8,
                      backgroundColor: backgroundLight,
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      overflow: 'hidden'
                    }}>
                      {/* Truck Header */}
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedFleetTrucks.find(t => t.id === truck.id)) {
    setSelectedFleetTrucks(prev => prev.filter(t => t.id !== truck.id));
    setSelectedDrivers(prev => prev.filter(d => d.truckId !== truck.id));
  } else {
    setSelectedFleetTrucks(prev => [...prev, {...truck}]);
  }
                        }}
                        style={{
                          padding: wp(3),
                          borderBottomWidth: truckDrivers.length > 0 ? 1 : 0,
                          borderBottomColor: '#E0E0E0',


                          backgroundColor: selectedFleetTrucks.some(t => t.id === truck.id) 
    ? 'rgba(33, 150, 243, 0.1)' // light blue highlight
    : 'transparent',
                          
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                         <Ionicons
  name={selectedFleetTrucks.some(t => t.id === truck.id) ? "checkbox" : "square-outline"}
  size={20}
  color={selectedFleetTrucks.some(t => t.id === truck.id) ? '#2196F3' : '#666'}
  style={{ marginRight: wp(2) }}
/>

                          <View style={{ flex: 1 }}>
                            <ThemedText style={{ fontWeight: '600' }}>{truck.truckName}</ThemedText>
                            <ThemedText style={{ fontSize: 12, color: '#666' }}>{truck.truckType} - {truck.truckCapacity}</ThemedText>
                          </View>
                          {truckDrivers.length > 0 && (
                            <ThemedText style={{ fontSize: 12, color: '#666' }}>
                              {truckDrivers.length} driver{truckDrivers.length !== 1 ? 's' : ''}
                            </ThemedText>
                          )}
                        </View>
                      </TouchableOpacity>

                     

                     {truckDrivers.length > 0 && selectedFleetTrucks.find(t => t.id === truck.id)&& (



                        <View style={{ paddingHorizontal: wp(3), paddingBottom: wp(2) }}>
                          <ThemedText style={{ fontSize: 14, fontWeight: '600', marginTop: wp(2), marginBottom: wp(1) }}>
                            Select Drivers for this Truck:
                          </ThemedText>
                            {truckDrivers.map((driver, driverIndex) => {
                              return(

                              <TouchableOpacity
                                key={`${driver.driverId}-${driver.truckId}-${driver.role}` || driverIndex}
                                onPress={() => {
                                  const driverKey = `${driver.driverId}-${driver.truckId}-${driver.role}`;
                                  const existingDriver = selectedDrivers.find(d =>
                                    `${d.driverId}-${d.truckId}-${d.role}` === driverKey
                                  );

                                  if (existingDriver) {
                                    setSelectedDrivers(prev => prev.filter(d =>
                                      `${d.driverId}-${d.truckId}-${d.role}` !== driverKey
                                    ));
                                  } else {
                                    setSelectedDrivers(prev => [...prev, driver]);
                                  }
                                }}
                                style={{
                                  padding: wp(2),
                                  marginVertical: wp(0.5),
                                  borderRadius: 6,
                                  // backgroundColor: selectedDrivers.find(d => d.driverId === driver.driverId) ? '#E8F5E8' : '#F9F9F9',
                                  borderWidth: 1,
                                  borderColor: selectedDrivers.find(d =>
                                    `${d.driverId}-${d.truckId}-${d.role}` === `${driver.driverId}-${driver.truckId}-${driver.role}`
                                  )
     ? '#4CAF50'
     : '#E0E0E0',
   backgroundColor: selectedDrivers.find(d =>
                                    `${d.driverId}-${d.truckId}-${d.role}` === `${driver.driverId}-${driver.truckId}-${driver.role}`
                                  )
     ? 'rgba(76, 175, 80, 0.15)'
     : 'transparent',

}}


                                
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Ionicons
                                    name={selectedDrivers.find(d =>
                                      `${d.driverId}-${d.truckId}-${d.role}` === `${driver.driverId}-${driver.truckId}-${driver.role}`
                                    ) ? "checkbox" : "square-outline"}
                                    size={16}
                                    color={selectedDrivers.find(d =>
                                      `${d.driverId}-${d.truckId}-${d.role}` === `${driver.driverId}-${driver.truckId}-${driver.role}`
                                    ) ? '#4CAF50' : '#666'}
                                    style={{ marginRight: wp(2) }}
                                  />
                                  <View style={{ flex: 1 }}>
                                    <ThemedText style={{ fontWeight: '500', fontSize: 14 }}>{driver.fullName} </ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: '#666' }}>
                                      {driver.role === 'main' ? 'Main Driver' :
                                      driver.role === 'second_main' ? 'Second Main Driver' :
                                      driver.role === 'backup' ? 'Backup Driver' : driver.role}
                                    </ThemedText>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            )}   )}
                          </View>
                      )  }





                    </View>
                  );
                })}

              </>
            ) : currentRole?.accType === 'fleet' && loadVisibility === 'Public' ? (
              // Fleet User: Public load - Show truck requirements (will be visible to all trucks)
              <>
                <ThemedText style={{ fontSize: 14, color: '#666', marginBottom: wp(2) }}>
                  This public load will be visible to all available trucks in the system.
                </ThemedText>
                {trucksNeeded.map((truck, index) => (
                  <View
                    key={index}
                    style={{
                      position: 'relative',
                      marginBottom: 10,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 8,
                      backgroundColor: backgroundLight
                    }}
                  >

                    {/* Truck Info */}
                    <ThemedText >
                      Truck {index + 1}:    {truck.truckType?.name}
                    </ThemedText>
                    <ThemedText></ThemedText>
                    <ThemedText>{truck.cargoArea?.name}  </ThemedText>
                    <ThemedText>{truck.capacity?.name} </ThemedText>

                    <TouchableOpacity
                      onPress={() => removeTruck(index)}
                      style={{
                        padding: 5,
                        zIndex: 1
                      }}
                    >
                      <Feather name="x" color={'red'} size={wp(4)} />
                    </TouchableOpacity>
                  </View>
                ))}

                <AddTruckDetails
                  selectedTruckType={selectedTruckType}
                  setSelectedTruckType={setSelectedTruckType}
                  selectedCargoArea={selectedCargoArea}
                  setSelectedCargoArea={setSelectedCargoArea}
                  selectedTankerType={selectedTankerType}
                  setSelectedTankerType={setSelectedTankerType}
                  selectedTruckCapacity={selectedTruckCapacity}
                  setSelectedTruckCapacity={setSelectedTruckCapacity}
                  formData={formDataTruck}
                  setFormData={setFormDataTruck}
                  showCountries={showCountries}
                  setShowCountries={setShowCountries}
                  operationCountries={operationCountries}
                  setOperationCountries={setOperationCountries}
                />

                <TouchableOpacity
                  onPress={pushTruck}
                  style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 29,
                    alignSelf: 'flex-start', // makes the button only as wide as needed
                    marginVertical: 10,
                  }}
                >
                  <ThemedText style={{ color: 'gray', fontSize: 14 }}>
                    Select {trucksNeeded.length <= 0 ? "Truck" : "another"}
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : currentRole?.accType === 'broker' && loadVisibility === 'Private' ? (
              // Broker User: Private load - Select assigned trucks (no drivers)
              <>
                {/* Truck Search */}
                <ThemedText>Search Assigned Trucks</ThemedText>
                <Input
                  value={brokerTruckSearchQuery}
                  onChangeText={(text) => {
                    setBrokerTruckSearchQuery(text);
                    if (text.trim() === '') {
                      setSearchedBrokerTrucks(brokerTrucks);
                    } else {
                      const filtered = brokerTrucks.filter(truck =>
                        truck.truckName?.toLowerCase().includes(text.toLowerCase()) ||
                        truck.truckType?.toLowerCase().includes(text.toLowerCase())
                      );
                      setSearchedBrokerTrucks(filtered);
                    }
                  }}
                  placeholder="Search by truck name or type"
                />

                {/* Available Assigned Trucks */}
                <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>Available Assigned Trucks</ThemedText>
                {searchedBrokerTrucks.map((truck, index) => (
                  <TouchableOpacity
                    key={truck.truckId || index}
                    onPress={() => {
                      if (selectedBrokerTrucks.find(t => t.truckId === truck.truckId)) {
                        setSelectedBrokerTrucks(prev => prev.filter(t => t.truckId !== truck.truckId));
                      } else {
                        setSelectedBrokerTrucks(prev => [...prev, truck]);
                      }
                    }}
                    style={{
                      padding: wp(3),
                      marginVertical: wp(1),
                      borderRadius: 8,
                      backgroundColor: backgroundLight,
                      borderWidth: 1,
                      borderColor: selectedBrokerTrucks.some(t => t.truckId === truck.truckId) ? accent : '#E0E0E0',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={selectedBrokerTrucks.some(t => t.truckId === truck.truckId) ? "checkbox" : "square-outline"}
                        size={20}
                        color={selectedBrokerTrucks.some(t => t.truckId === truck.truckId) ? accent : '#666'}
                        style={{ marginRight: wp(2) }}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontWeight: '600' }}>{truck.truckName}</ThemedText>
                        <ThemedText style={{ fontSize: 12, color: '#666' }}>{truck.truckType} - {truck.truckCapacity}</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              // Professional User: Truck requirements
              <>
                {trucksNeeded.map((truck, index) => (
                  <View
                    key={index}
                    style={{
                      position: 'relative',
                      marginBottom: 10,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 8,
                      backgroundColor: backgroundLight
                    }}
                  >

                    {/* Truck Info */}
                    <ThemedText >
                      Truck {index + 1}:    {truck.truckType?.name}
                    </ThemedText>
                    <ThemedText></ThemedText>
                    <ThemedText>{truck.cargoArea?.name}  </ThemedText>
                    <ThemedText>{truck.capacity?.name} </ThemedText>

                    <TouchableOpacity
                      onPress={() => removeTruck(index)}
                      style={{
                        padding: 5,
                        zIndex: 1
                      }}
                    >
                      <Feather name="x" color={'red'} size={wp(4)} />
                    </TouchableOpacity>
                  </View>
                ))}

                <AddTruckDetails
                  selectedTruckType={selectedTruckType}
                  setSelectedTruckType={setSelectedTruckType}
                  selectedCargoArea={selectedCargoArea}
                  setSelectedCargoArea={setSelectedCargoArea}
                  selectedTankerType={selectedTankerType}
                  setSelectedTankerType={setSelectedTankerType}
                  selectedTruckCapacity={selectedTruckCapacity}
                  setSelectedTruckCapacity={setSelectedTruckCapacity}
                  formData={formDataTruck}
                  setFormData={setFormDataTruck}
                  showCountries={showCountries}
                  setShowCountries={setShowCountries}
                  operationCountries={operationCountries}
                  setOperationCountries={setOperationCountries}
                />

                <TouchableOpacity
                  onPress={pushTruck}
                  style={{
                    borderWidth: 1,
                    borderColor: 'gray',
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 29,
                    alignSelf: 'flex-start', // makes the button only as wide as needed
                    marginVertical: 10,
                  }}
                >
                  <ThemedText style={{ color: 'gray', fontSize: 14 }}>
                    Select {trucksNeeded.length <= 0 ? "Truck" : "another"}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            <Divider />
            <View style={styles.viewMainDsp}>
              <Button onPress={() => setStep(2)} title="Back" />
              <Button onPress={handleSubmit} title={isSubmitting ? "Submiting..." : "Submit"} disabled={isSubmitting} loading={isSubmitting} colors={{ text: '#0f9d58', bg: '#0f9d5824' }} style={{ borderWidth: 1, borderColor: accent }} />
            </View>
          </View>

        </ScrollView>)}
      </View>


    

      {/* Professional User Personal Details Modal */}
      {/* <KYCVerificationModal
        visible={showPersonalDetailsModal && selectedPersonalType === 'professional'}
        onClose={() => {
          setShowPersonalDetailsModal(false);
          setSelectedPersonalType(null);
        }}
        typeOfBrokerPersonal={typeOfBrokerPersonal}
        setTypeOfBrokerPersonal={setTypeOfBrokerPersonal}
        personalName={personalName}
        setPersonalName={setPersonalName}
        personalPhone={personalPhone}
        setPersonalPhone={setPersonalPhone}
        personalEmail={personalEmail}
        setPersonalEmail={setPersonalEmail}
        personalCountryCode={personalCountryCode}
        setPersonalCountryCode={setPersonalCountryCode}
        selectedBrokerPersonalDocuments={selectedBrokerPersonalDocuments}
        setSelectedBrokerPersonalDocuments={setSelectedBrokerPersonalDocuments}
        brokerPersonalFileType={brokerPersonalFileType}
        setBrokerPersonalFileType={setBrokerPersonalFileType}
        uploadingPersonalD={uploadingPersonalD}
        onSave={handleUpdateProfessionalDetails}
      /> */}

  
     

    </ScreenWrapper>
  );
};

export default AddLoadDB;

const styles = StyleSheet.create({
  viewMainDsp: {
    paddingVertical: wp(3),
    gap: wp(2),
    borderRadius: 8,
    shadowColor: "#6a0c0c",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    overflow: "hidden",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },

  infoText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  loadImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  aiResultsContainer: {
    padding: wp(4),
    borderRadius: 12,
    marginVertical: wp(2),
  },
  aiResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: wp(1),
  },
  errorContainer: {
    padding: wp(3),
    borderRadius: 8,
    marginVertical: wp(2),
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

