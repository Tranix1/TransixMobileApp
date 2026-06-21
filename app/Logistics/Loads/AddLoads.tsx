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
import { collection, query, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
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
import { uploadImage, addDocumentWithId, addDocument, fetchDocuments } from "@/db/operations";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/db/fireBaseConfig";
import { selectManyImages, pickDocumentsOnly } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import { ImagePickerAsset } from "expo-image-picker";
import { ErrorModal } from "@/components/ErrorModal";
import KYCVerificationModal from "@/components/KYCVerificationModal";

import { notifyTrucksByFilters } from "@/Utilities/notifyTruckByFilters";
import { TruckNeededType } from "@/types/types";
import DateTimePicker from '@react-native-community/datetimepicker';


import { SelectLocationProp } from '@/types/types';

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

  const { user, alertBox, currentRole } = useAuth();


  const [fleetManagerId, setFleetManagerId] = useState<string | null>(null);


  const [assignments, setAssignments] = useState<any[]>([]);


  const [pickupDateTruckId, setPickupDateTruckId] = useState<string | null>(null);
  const [deliveryDateTruckId, setDeliveryDateTruckId] = useState<string | null>(null);


  const [assignmentOrigin, setAssignmentOrigin] =
    useState<SelectLocationProp | null>(null);

  const [assignmentDestination, setAssignmentDestination] =
    useState<SelectLocationProp | null>(null);

  const [assignmentDspFromLocation, setAssignmentDspFromLocation] =
    useState(false);

  const [assignmentDspToLocation, setAssignmentDspToLocation] =
    useState(false);

  const [assignmentLocationPicKERdSP, setAssignmentPickLocationOnMap] =
    useState(false);

  const [assignmentDistance, setAssignmentDistance] =
    useState("");

  const [assignmentDuration, setAssignmentDuration] =
    useState("");

  const [assignmentDurationInTraffic, setAssignmentDurationInTraffic] =
    useState("");





  const [showPickupPicker, setShowPickupPicker] = useState(false);


  const [fleetDrivers, setFleetDrivers] = useState<any[]>([]);
  const [searchedDrivers, setSearchedDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<any[]>([]);
  const [driverSearchQueries, setDriverSearchQueries] = useState<{ [truckId: string]: string; }>({});

  const [expandedTruckIds, setExpandedTruckIds] = useState<string[]>([]);
  const [locationAssigmentPick, setLocationAssigmentPick] = useState<{
    truckId: string, type: "pickup" | "delivery"
  } | null>(null)

  const [fleetTrucks, setFleetTrucks] = useState<any[]>([]);
  const [searchedTrucks, setSearchedTrucks] = useState<any[]>([]);
  const [selectedFleetTrucks, setSelectedFleetTrucks] = useState<any[]>([]);

  const [truckSearchQuery, setTruckSearchQuery] = useState('');
  const [loadVisibility, setLoadVisibility] = useState<'Private' | 'Public' | 'Both'>('Private');

  // Broker search states
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [brokerSearchText, setBrokerSearchText] = useState('');
  const [searchedBrokers, setSearchedBrokers] = useState<any[]>([]);

  // Broker truck states
  const [brokerTrucks, setBrokerTrucks] = useState<any[]>([]);
  const [selectedBrokerTrucks, setSelectedBrokerTrucks] = useState<any[]>([]);
  const [brokerTruckSearchQuery, setBrokerTruckSearchQuery] = useState('');
  const [searchedBrokerTrucks, setSearchedBrokerTrucks] = useState<any[]>([]);

  // New fields for load requirements
  const [numberOfTrucks, setNumberOfTrucks] = useState('');
  const [fleetDriversFromTrucks, setFleetDriversFromTrucks] = useState<any[]>([]);


  useEffect(() => {
    const fetchAll = async () => {


      // Fetch trucks for broker search functionality
      try {
        const driversGetResult = await fetchDocuments(`fleets/${currentRole.fleetId}/Drivers`, 100);
        if (driversGetResult && driversGetResult.data && Array.isArray(driversGetResult.data)) {
          setFleetDrivers(driversGetResult.data);
        }
      } catch (error) {
        console.error("Error fetching brokers:", error);
      }

      // Fetch trucks for broker search functionality
      try {
        const trucksGetResult = await fetchDocuments(`fleets/${currentRole.fleetId}/Trucks`, 100);
        if (trucksGetResult && trucksGetResult.data && Array.isArray(trucksGetResult.data)) {
          setFleetTrucks(trucksGetResult.data);
        }
      } catch (error) {
        console.error("Error fetching brokers:", error);
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
  const [requirements, setRequirements] = useState(defaultState.requirements)
  
  ;
const [loadingDate, setLoadingDate] = useState(defaultState.loadingDate);
const [showLoadingDatePicker, setShowLoadingDatePicker] = useState(false)

const [deliveryDate, setDeliveryDate] = useState(defaultState.deliveryDate);
const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

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

    try {

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
        const validationTrucksNeeded = currentRole?.accType === 'fleet' && loadVisibility === 'Private'
          ? selectedFleetTrucks
          : currentRole?.accType === 'broker' && loadVisibility === 'Private'
            ? selectedBrokerTrucks
            : trucksNeeded;

        validationErrors = validateLoadForm("professional", {
          typeofLoad,
          origin,
          destination,
          rate,
          paymentTerms,
          trucksNeeded: validationTrucksNeeded,
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


      // Additional validation for fleet users - private and both loads need a private truck assignment.
      if (currentRole?.accType === 'fleet' && (loadVisibility === 'Private' || loadVisibility === 'Both')) {
        if (selectedFleetTrucks.length === 0) {
          validationErrors.push('Select at least one truck from your fleet');
        }
        const invalidAssignments = assignments.filter(assignment =>
          !selectedFleetTrucks.some(truck => truck.id === assignment.truckId)
        );
        if (invalidAssignments.length > 0) {
          validationErrors.push('Some assignments are not linked to the selected trucks');
        }
      }

      if (currentRole?.accType === 'fleet' && (loadVisibility === 'Public' || loadVisibility === 'Both') && trucksNeeded.length === 0) {
        validationErrors.push('Select at least 1 truck requirement for the public load');
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

    } catch (e) {
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
      const activeUser = user;

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
      }, activeUser, expoPushToken);

      const roleAny = currentRole as any;
      const cargoId = doc(collection(db, "Cargo")).id;
      const fleetId = roleAny?.fleetId || null;
      const brokerId = roleAny?.brokerId || roleAny?.userId || activeUser.uid;
      const coordinator = {
        id: roleAny?.userId || activeUser.uid,
        fleetId,
        name: activeUser.organisation || activeUser.displayName || "",
        phoneNumber: activeUser.phoneNumber || ""
      };
      const assignmentDetails = assignments.map(assignment => {
        const truck = selectedFleetTrucks.find(item => item.id === assignment.truckId);
        const driver = fleetDrivers.find(item => item.driverId === assignment.driverId || item.id === assignment.driverId);

        return {
          cargoId,
          truckId: assignment.truckId || "",
          truckName: truck?.truckName || "",
          registrationNumber: truck?.registrationNumber || "",
          truckType: truck?.truckType || "",
          truckCapacity: truck?.truckCapacity || "",
          driverId: assignment.driverId || null,
          driverDocId: driver?.docId || driver?.id || assignment.driverId || null,
          driverName: assignment.driverName || driver?.fullName || null,
          driverPhone: driver?.phoneNumber || driver?.phone || null,
          role: driver?.role || assignment.role || (assignment.isDefault ? "main" : "assigned"),
          pickupDate: assignment.pickupDate || loadingDate || null,
          deliveryDate: assignment.deliveryDate || deliveryDate || null,
          pickupLocation: assignment.pickupLocation || origin || null,
          deliveryLocation: assignment.deliveryLocation || destination || null,
          isDefault: Boolean(assignment.isDefault),
          status: "pending",
        };
      });
      const fleetTruckSummary = selectedFleetTrucks.map(truck => ({
        truckId: truck.id,
        truckName: truck.truckName || "",
        registrationNumber: truck.registrationNumber || "",
        truckType: truck.truckType || "",
        truckCapacity: truck.truckCapacity || "",
        truckStatus: "pending",
        assignment: assignmentDetails.find(assignment => assignment.truckId === truck.id) || null,
      }));
      const assignmentSummary = assignmentDetails.map(assignment => ({
        truckId: assignment.truckId,
        truckName: assignment.truckName,
        registrationNumber: assignment.registrationNumber,
        truckType: assignment.truckType,
        truckCapacity: assignment.truckCapacity,
        driverId: assignment.driverId,
        driverName: assignment.driverName,
        driverPhone: assignment.driverPhone,
        role: assignment.role,
        pickupDate: assignment.pickupDate,
        deliveryDate: assignment.deliveryDate,
        pickupLocation: assignment.pickupLocation,
        deliveryLocation: assignment.deliveryLocation,
        status: assignment.status,
      }));
      const commonLoadData = {
        ...loadData,
        cargoId,
        loadId: cargoId,
        cargoStatus: "pending",
        numberOfTrucks,
        deliveryDate,
        selectedBrokers,
        coordinator,
        assignmentCount: assignmentSummary.length,
        assignmentSummary,
        timeStamp: serverTimestamp(),
      };
      const writeFleetPrivateLoad = async () => {
        if (!fleetId) return;

        const fleetCargoPath = `fleets/${fleetId}/Cargo`;
        await setDoc(doc(db, fleetCargoPath, cargoId), {
          ...commonLoadData,
          loadVisibility: "Private",
          publicCargoId: loadVisibility === "Both" ? cargoId : null,
          trucks: fleetTruckSummary,
        });

        for (const truck of selectedFleetTrucks) {
          const truckAssignments = assignmentDetails.filter(assignment => assignment.truckId === truck.id);
          const assignmentDocId = `${cargoId}_${truck.id}`;
          const assignmentPayload = {
            cargoId,
            loadId: cargoId,
            fleetId,
            truckId: truck.id,
            truckName: truck.truckName || "",
            registrationNumber: truck.registrationNumber || "",
            assignedDrivers: truckAssignments.map(assignment => ({
              driverId: assignment.driverId,
              driverDocId: assignment.driverDocId,
              role: assignment.role,
              fullName: assignment.driverName,
              phoneNumber: assignment.driverPhone,
              status: "pending",
            })),
            mainDriver: truckAssignments.find(assignment => assignment.role === "main")?.driverId || "",
            pickupDate: truckAssignments[0]?.pickupDate || loadingDate || null,
            deliveryDate: truckAssignments[0]?.deliveryDate || deliveryDate || null,
            pickupLocation: truckAssignments[0]?.pickupLocation || origin || null,
            deliveryLocation: truckAssignments[0]?.deliveryLocation || destination || null,
            status: "pending",
            acceptedBy: null,
            createdAt: new Date(),
            coordinator,
          };

          await addDocumentWithId(`${fleetCargoPath}/${cargoId}/assignments`, assignmentDocId, assignmentPayload);
          await addDocumentWithId(`fleets/${fleetId}/assignments`, assignmentDocId, assignmentPayload);
        }

        for (const assignment of assignmentDetails.filter(item => item.driverDocId)) {
          const driverCargoDocId = `${cargoId}_${assignment.driverId || "driver"}_${assignment.truckId}`;
          await addDocumentWithId(`fleets/${fleetId}/Drivers/${assignment.driverDocId}/cargo`, driverCargoDocId, {
            cargoId,
            loadId: cargoId,
            truckId: assignment.truckId,
            truckName: assignment.truckName,
            role: assignment.role,
            status: "pending",
            assignedAt: new Date(),
            loadingDate,
            pickupDate: assignment.pickupDate,
            deliveryDate: assignment.deliveryDate,
            pickupLocation: assignment.pickupLocation,
            deliveryLocation: assignment.deliveryLocation,
            origin,
            destination,
            loadVisibility: "Private",
            coordinator,
          });
        }

        for (const selectedBrokerId of selectedBrokers) {
          await addDocumentWithId(`brokers/${selectedBrokerId}/loads`, `${cargoId}_${selectedBrokerId}`, {
            loadId: cargoId,
            cargoId,
            loadStatus: "pending",
            loadVisibility: "Private",
            truckId: fleetTruckSummary[0]?.truckId || null,
            truckName: fleetTruckSummary[0]?.truckName || null,
            driverId: assignmentSummary[0]?.driverId || null,
            driverName: assignmentSummary[0]?.driverName || null,
            origin,
            destination,
            loadingDate,
            deliveryDate,
            assignmentSummary,
            createdAt: new Date(),
            coordinator,
          });
        }
      };
      const writePublicLoad = async () => {
        await setDoc(doc(db, "Cargo", cargoId), {
          ...commonLoadData,
          loadVisibility: "Public",
          privateFleetCargoId: currentRole?.accType === "fleet" && loadVisibility === "Both" ? cargoId : null,
          trucks: currentRole?.accType === "fleet" ? fleetTruckSummary : [],
        });
      };
      const writeBrokerPrivateLoad = async () => {
        const trucks = selectedBrokerTrucks;
        await setDoc(doc(db, `brokers/${brokerId}/Cargo`, cargoId), {
          ...commonLoadData,
          loadVisibility: "Private",
          trucks: trucks.map(truck => ({
            truckId: truck.truckId || "",
            truckName: truck.truckName || "",
            truckStatus: "pending",
          })),
        });

        for (const truck of trucks) {
          await addDocumentWithId(`fleets/${truck.fleetId}/fleetManagers/FLTMGR${truck.fleetId}/brokerLoads`, `${cargoId}_${truck.truckId}`, {
            loadId: cargoId,
            cargoId,
            loadStatus: "pending",
            loadVisibility: "Private",
            truckId: truck.truckId,
            truckName: truck.truckName,
            brokerId,
            brokerName: activeUser.organisation || activeUser.displayName || "Broker",
            origin,
            destination,
            loadingDate,
            deliveryDate,
            assignmentSummary,
            createdAt: new Date(),
            coordinator,
          });
        }
      };

      if (currentRole?.accType === "fleet") {
        if (loadVisibility === "Private" || loadVisibility === "Both") {
          await writeFleetPrivateLoad();
        }
        if (loadVisibility === "Public" || loadVisibility === "Both") {
          await writePublicLoad();
          await notifyTrucksByFilters({
            trucksNeeded,
            loadItem: {
              typeofLoad,
              origin: origin?.description || "",
              destination: destination?.description || "",
              rate,
              model: selectedModelType?.name || "Solid",
              currency: selectedCurrency?.name || "USD",
            },
          });
        }
      } else if (currentRole?.accType === "broker" && loadVisibility === "Private") {
        await writeBrokerPrivateLoad();
      } else {
        await writePublicLoad();
        if (trucksNeeded.length > 0) {
          await notifyTrucksByFilters({
            trucksNeeded,
            loadItem: {
              typeofLoad,
              origin: origin?.description || "",
              destination: destination?.description || "",
              rate,
              model: selectedModelType?.name || "Solid",
              currency: selectedCurrency?.name || "USD",
            },
          });
        }
      }

      ToastAndroid.show('Trucks notified and load added successfully.', ToastAndroid.SHORT);
      return;


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
            truckName: truck.truckName,
            truckStatus: "pending",
            drivers: drivers.filter(d => d.truckId === truck.id).map(driver => ({
              driverId: driver.driverId || null,
              role: driver.role || null,
              fullName: driver.fullName || null,
              phoneNumber: driver.phoneNumber || null,
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
              id: roleAny?.userId || activeUser.uid,
              name: activeUser.organisation || "",
              phoneNumber: activeUser.phoneNumber || ""
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
              createdAt: new Date(),

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
            loadingDate,
            deliveryDate,
            origin,
            destination,
            loadVisibility: 'Private',
            coordinator: {
              id: roleAny?.userId || activeUser.uid,
              name: activeUser.organisation || "",
              phoneNumber: activeUser.phoneNumber || ""
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



      } else if (currentRole?.accType === 'fleet' && loadVisibility === 'Public') {
        // Fleet user with public load



        // 1������ Regular Cargo addition to main Cargo collection
      } else if (currentRole?.accType === 'broker' && loadVisibility === 'Private') {
        // Broker user with private load - assign to selected trucks
        const trucks = selectedBrokerTrucks;

        // 1������ Add Cargo to broker's subcollection and get the auto-generated cargoId
        const brokerCargoRefPath = `brokers/${roleAny?.userId || activeUser.uid}/loads`;

        const docRef = doc(collection(db, `brokers/${roleAny?.userId || activeUser.uid}/loads`));
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
            brokerId: roleAny?.userId || activeUser.uid,
            brokerName: activeUser.organisation || activeUser.displayName || "Broker",
            origin: origin,
            destination: destination,
            loadingDate: loadingDate,
            deliveryDate: deliveryDate,
            createdAt: new Date(),
            coordinator: {
              id: roleAny?.userId || activeUser.uid,
              name: activeUser.organisation || activeUser.displayName || "Broker",
              phoneNumber: activeUser.phoneNumber || ""
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
        steps={['Load Details', 'Additional Info', 'Return Load', 'Truck Req']}
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

        {step === 1 && (
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
  Loading date <ThemedText color="red">*</ThemedText>
</ThemedText>

<TouchableOpacity onPress={() => setShowLoadingDatePicker(true)}>
  <Input
    value={
      loadingDate
        ? new Date(loadingDate).toLocaleDateString()
        : ""
    }
    placeholder="Select loading date"
    editable={false}
  />
</TouchableOpacity>


{showLoadingDatePicker && (
  <DateTimePicker
    value={
      loadingDate
        ? new Date(loadingDate)
        : new Date()
    }
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowLoadingDatePicker(false);

      if (selectedDate) {
        setLoadingDate(selectedDate.toISOString());
      }
    }}
  />
)}








<ThemedText>
  Delivery Date <ThemedText color="red">*</ThemedText>
</ThemedText>

<TouchableOpacity onPress={() => setShowDeliveryDatePicker(true)}>
  <Input
    value={
      deliveryDate
        ? new Date(deliveryDate).toLocaleDateString()
        : ""
    }
    placeholder="Select delivery date"
    editable={false}
  />
</TouchableOpacity>


{showDeliveryDatePicker && (
  <DateTimePicker
    value={
      deliveryDate
        ? new Date(deliveryDate)
        : new Date()
    }
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowDeliveryDatePicker(false);

      if (selectedDate) {
        setDeliveryDate(selectedDate.toISOString());
      }
    }}
  />
)}





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
                ((proofImages.length > 0 || proofDocuments.length > 0)) ? (
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

        {step === 2 && (
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Return Load
              </ThemedText>
              <Divider />


              {/* Return Load Location Selection */}
              <TouchableOpacity style={{ marginTop: wp(3) }} onPress={() => setUseDifferentReturnLocation(!useDifferentReturnLocation)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(2) }} onTouchEnd={() => setUseDifferentReturnLocation(!useDifferentReturnLocation)}>

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

        {step === 3 && (<ScrollView>
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

                  {currentRole?.accType === 'fleet' && (
                    <TouchableOpacity
                      onPress={() => setLoadVisibility('Both')}
                      style={{
                        flex: 1,
                        padding: wp(3),
                        borderRadius: 8,
                        backgroundColor: loadVisibility === 'Both' ? '#FFF3E0' : backgroundLight,
                        borderWidth: 1,
                        borderColor: loadVisibility === 'Both' ? '#FB8C00' : '#E0E0E0',
                        alignItems: 'center'
                      }}
                    >
                      <Ionicons
                        name="git-branch"
                        size={20}
                        color={loadVisibility === 'Both' ? '#FB8C00' : '#666'}
                        style={{ marginBottom: wp(1) }}
                      />
                      <ThemedText style={{
                        fontWeight: loadVisibility === 'Both' ? 'bold' : 'normal',
                        color: loadVisibility === 'Both' ? '#FB8C00' : '#666'
                      }}>
                        Both
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: wp(1) }}>
                        Fleet and public
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}


            {currentRole?.accType === 'fleet' && (loadVisibility === 'Private' || loadVisibility === 'Both') ? (
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
                        truck.truckName?.toLowerCase().includes(text.toLowerCase()) ||
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
                  const truckDrivers = fleetDriversFromTrucks.filter(driver => driver.truckId === truck.id)
                  const defaultDriver = fleetDriversFromTrucks.find(driver => driver.truckId === truck.id && (driver.role === 'main' || driver.isDefault));


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

                          const exists = selectedFleetTrucks.find(
                            t => t.id === truck.id
                          );

                          if (exists) {

                            setSelectedFleetTrucks(prev =>
                              prev.filter(t => t.id !== truck.id)
                            );

                            setAssignments(prev =>
                              prev.filter(a => a.truckId !== truck.id)
                            );

                            setExpandedTruckIds(prev => prev.filter(id => id !== truck.id));

                          } else {

                            setSelectedFleetTrucks(prev => [
                              ...prev,
                              truck
                            ]);

                            setExpandedTruckIds(prev => [...prev, truck.id]);
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



                      {expandedTruckIds.includes(truck.id) && (

                        <View style={{
                          padding: wp(3),
                          borderTopWidth: 1,
                          borderColor: '#eee'
                        }}>


                          <ThemedText
                            style={{
                              fontWeight: '700',
                              marginBottom: wp(2)
                            }}
                          >
                            Assign Driver (Optional)
                          </ThemedText>



                          <Input
                            placeholder="Search driver..."
                            value={
                              driverSearchQueries[truck.id] || ''
                            }

                            onChangeText={(text) => {

                              setDriverSearchQueries(prev => ({
                                ...prev,
                                [truck.id]: text
                              }))

                            }}

                          />



                          {/* DEFAULT DRIVER */}

                          {defaultDriver && (

                            <TouchableOpacity

                              onPress={() => {

                                setAssignments(prev => [

                                  ...prev.filter(
                                    a => a.truckId !== truck.id
                                  ),

                                  {
                                    truckId: truck.id,
                                    driverId: defaultDriver.driverId,
                                    driverName: defaultDriver.fullName,

                                    pickupDate: null,
                                    deliveryDate: null,
                                    pickupLocation: "",
                                    deliveryLocation: "",

                                    isDefault: true
                                  }

                                ])

                              }}

                              style={{
                                marginTop: wp(2),
                                padding: wp(2),
                                borderRadius: 8,
                                backgroundColor: 'rgba(33,150,243,0.15)',
                                borderWidth: 1,
                                borderColor: '#2196F3'
                              }}

                            >

                              <ThemedText>
                                ⭐ Default - {defaultDriver.fullName}
                              </ThemedText>

                            </TouchableOpacity>

                          )}




                          {/* SHOW DRIVERS ONLY WHEN SEARCHING */}

                          {driverSearchQueries[truck.id]?.length > 0 &&

                            fleetDrivers
                              .filter(d =>
                                d.fullName
                                  ?.toLowerCase()
                                  .includes(
                                    driverSearchQueries[truck.id]
                                      .toLowerCase()
                                  )
                              )
                              .map(driver => {


                                const selected =
                                  assignments.find(
                                    a =>
                                      a.driverId === driver.driverId &&
                                      a.truckId === truck.id
                                  )



                                return (

                                  <TouchableOpacity

                                    key={driver.driverId}

                                    onPress={() => {


                                      if (selected) {

                                        setAssignments(prev =>
                                          prev.filter(
                                            a => a.driverId !== driver.driverId ||
                                              a.truckId !== truck.id
                                          )
                                        )


                                      } else {


                                        setAssignments(prev => [

                                          ...prev,

                                          {

                                            truckId: truck.id,

                                            driverId: driver.driverId,

                                            driverName: driver.fullName,


                                            pickupDate: null,

                                            deliveryDate: null,

                                            pickupLocation: "",

                                            deliveryLocation: "",


                                            isDefault: false

                                          }

                                        ])


                                      }


                                    }}


                                    style={{
                                      marginTop: wp(1),
                                      padding: wp(2),
                                      borderRadius: 8,
                                      borderWidth: 1,

                                      backgroundColor: selected
                                        ? 'rgba(76,175,80,.15)'
                                        : 'transparent'

                                    }}

                                  >


                                    <View style={{
                                      flexDirection: 'row',
                                      alignItems: 'center'
                                    }}>


                                      <Ionicons

                                        name={
                                          selected
                                            ? 'checkbox'
                                            : 'square-outline'
                                        }
                                        color={selected ? '#4CAF50' : '#ddd'}


                                        size={18}

                                      />


                                      <ThemedText
                                        style={{
                                          marginLeft: wp(2)
                                        }}
                                      >
                                        {driver.fullName}
                                      </ThemedText>


                                    </View>


                                  </TouchableOpacity>


                                )

                              })

                          }


                          {/* Assignment details */}

                          {assignments.some(
                            a => a.truckId === truck.id
                          ) && (

                              <View style={{ marginTop: wp(3) }}>






                                <LocationSelector

                                  origin={assignmentOrigin}

                                  destination={assignmentDestination}

                                  setOrigin={(location) => {

                                    setAssignments(prev =>
                                      prev.map(a =>
                                        a.truckId === locationAssigmentPick?.truckId
                                          ? {
                                            ...a,
                                            pickupLocation: location
                                          }
                                          : a
                                      )
                                    );

                                    setAssignmentOrigin(location);

                                  }}

                                  setDestination={(location) => {

                                    setAssignmentDestination(location);

                                    if (locationAssigmentPick?.truckId) {

                                      setAssignments(prev =>
                                        prev.map(a =>
                                          a.truckId === locationAssigmentPick.truckId
                                            ? {
                                              ...a,
                                              deliveryLocation: location
                                            }
                                            : a
                                        )
                                      );

                                    }

                                  }}

                                  dspFromLocation={assignmentDspFromLocation}
                                  setDspFromLocation={setAssignmentDspFromLocation}

                                  dspToLocation={assignmentDspToLocation}
                                  setDspToLocation={setAssignmentDspToLocation}

                                  locationPicKERdSP={assignmentLocationPicKERdSP}
                                  setPickLocationOnMap={setAssignmentPickLocationOnMap}

                                  distance={assignmentDistance}
                                  duration={assignmentDuration}
                                  durationInTraffic={assignmentDurationInTraffic}

                                  iconColor={accent}
                                />





                                <TouchableOpacity
                                  onPress={() => setPickupDateTruckId(truck.id)}
                                  style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: wp(3),
                                    marginTop: wp(2),
                                  }}
                                >
                                  <ThemedText>
                                    {
                                      assignments.find(a => a.truckId === truck.id)?.pickupDate
                                        ? new Date(
                                          assignments.find(a => a.truckId === truck.id)!.pickupDate!
                                        ).toLocaleDateString()
                                        : 'Select Pickup Date'
                                    }
                                  </ThemedText>
                                </TouchableOpacity>

                                {pickupDateTruckId === truck.id && (
                                  <DateTimePicker
                                    value={
                                      assignments.find(a => a.truckId === truck.id)?.pickupDate
                                        ? new Date(
                                          assignments.find(a => a.truckId === truck.id)!.pickupDate!
                                        )
                                        : new Date()
                                    }
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                      setPickupDateTruckId(null);

                                      if (selectedDate) {
                                        setAssignments(prev =>
                                          prev.map(a =>
                                            a.truckId === truck.id
                                              ? {
                                                ...a,
                                                pickupDate: selectedDate.toISOString(),
                                              }
                                              : a
                                          )
                                        );
                                      }
                                    }}
                                  />
                                )}



                                <TouchableOpacity
                                  onPress={() => setDeliveryDateTruckId(truck.id)}
                                  style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: wp(3),
                                    marginTop: wp(2),
                                  }}
                                >
                                  <ThemedText>
                                    {
                                      assignments.find(a => a.truckId === truck.id)?.deliveryDate
                                        ? new Date(
                                          assignments.find(a => a.truckId === truck.id)!.deliveryDate!
                                        ).toLocaleDateString()
                                        : 'Select Delivery Date'
                                    }
                                  </ThemedText>
                                </TouchableOpacity>

                                {deliveryDateTruckId === truck.id && (
                                  <DateTimePicker
                                    value={
                                      assignments.find(a => a.truckId === truck.id)?.deliveryDate
                                        ? new Date(
                                          assignments.find(a => a.truckId === truck.id)!.deliveryDate!
                                        )
                                        : new Date()
                                    }
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                      setDeliveryDateTruckId(null);

                                      if (selectedDate) {
                                        setAssignments(prev =>
                                          prev.map(a =>
                                            a.truckId === truck.id
                                              ? {
                                                ...a,
                                                deliveryDate: selectedDate.toISOString(),
                                              }
                                              : a
                                          )
                                        );
                                      }
                                    }}
                                  />
                                )}

                              </View>

                            )}

                        </View>

                      )}

                    </View>
                  );
                })}

                {loadVisibility === 'Both' && (
                  <>
                    <Divider />
                    <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>Public Truck Requirements</ThemedText>
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
                        <ThemedText>Truck {index + 1}: {truck.truckType?.name}</ThemedText>
                        <ThemedText>{truck.cargoArea?.name}</ThemedText>
                        <ThemedText>{truck.capacity?.name}</ThemedText>
                        <TouchableOpacity onPress={() => removeTruck(index)} style={{ padding: 5, zIndex: 1 }}>
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
                        alignSelf: 'flex-start',
                        marginVertical: 10,
                      }}
                    >
                      <ThemedText style={{ color: 'gray', fontSize: 14 }}>
                        Select {trucksNeeded.length <= 0 ? "Truck" : "another"}
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                )}

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
            <View style={{height:15}}/>
        </ScrollView>)}
      </View>

    
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

