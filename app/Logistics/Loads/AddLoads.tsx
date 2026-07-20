import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, ToastAndroid, Image, Switch } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { db } from '@/db/fireBaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from "@/context/AuthContext";

import { hp, wp } from "@/constants/common";

import { TruckFormData, TruckTypeProps } from "@/types/types";
import { useThemeColor } from '@/hooks/useThemeColor';

// New extracted components
import { StepIndicator } from '@/components/StepIndicator';
import { LocationSelector } from '@/components/LocationSelector';
import { RateInput } from '@/components/RateInput';
import PaymentTerms, { getDefaultPaymentTerms, PaymentTermsValue } from '@/components/PaymentTerms';

import { usePushNotifications } from "@/Utilities/pushNotification";
import { uploadImage, fetchDocuments } from "@/db/operations";
import { selectManyImages, pickDocumentsOnly } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import { ImagePickerAsset } from "expo-image-picker";
import { ErrorModal } from "@/components/ErrorModal";

import { TruckNeededType } from "@/types/types";
import DateTimePicker from '@react-native-community/datetimepicker';

import CustomerPicker, { Customer } from '@/components/CustomerPicker';

import { SelectLocationProp } from '@/types/types';

// New utilities
import {
  validateLoadForm,
  getDefaultFormState,
  prepareLoadData
} from '@/Utilities/loadUtils';
import { LoadVisibility, submitLoad } from './loadSubmission';
import { TruckRequirementsSection } from './TruckRequirementsSection';
const AddLoadDB = () => {

  const { user, alertBox, currentRole } = useAuth();

  const [assignments, setAssignments] = useState<any[]>([]);

  const [pickupDateTruckId, setPickupDateTruckId] = useState<string | null>(null);
  const [deliveryDateTruckId, setDeliveryDateTruckId] = useState<string | null>(null);


  const [assignmentOrigin, setAssignmentOrigin] =
    useState<SelectLocationProp | null>(null);

  const [assignmentDestination, setAssignmentDestination] =
    useState<SelectLocationProp | null>(null);

  const [assignmentDspFromLocation, setAssignmentDspFromLocation] = useState(false);

  const [assignmentDspToLocation, setAssignmentDspToLocation] = useState(false);

  const [assignmentLocationPicKERdSP, setAssignmentPickLocationOnMap] = useState(false);

  const [assignmentDistance, setAssignmentDistance] = useState("");

  const [assignmentDuration, setAssignmentDuration] = useState("");

  const [assignmentDurationInTraffic, setAssignmentDurationInTraffic] = useState("");
  const [fleetDrivers, setFleetDrivers] = useState<any[]>([]);
  const [driverSearchQueries, setDriverSearchQueries] = useState<{ [truckId: string]: string; }>({});

  const [expandedTruckIds, setExpandedTruckIds] = useState<string[]>([]);
  const [locationAssigmentPick, setLocationAssigmentPick] = useState<{
    truckId: string, type: "pickup" | "delivery"
  } | null>(null)

  const [fleetTrucks, setFleetTrucks] = useState<any[]>([]);
  const [searchedTrucks, setSearchedTrucks] = useState<any[]>([]);
  const [selectedFleetTrucks, setSelectedFleetTrucks] = useState<any[]>([]);
  const [truckSearchQuery, setTruckSearchQuery] = useState('');
  const [loadVisibility, setLoadVisibility] = useState<LoadVisibility>('Private');

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
          setSearchedTrucks(trucksGetResult.data); // Initialize searchedBrokerTrucks with all trucks
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
      if (currentRole && currentRole.accType === 'brokerage') {
        try {
          // Use getDocs to fetch broker assigned trucks directly
          const brokerTrucksQuery = query(collection(db, `brokerages/${currentRole.organizationId}/Trucks`));
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [typeofLoad, setTypeofLoad] = useState(defaultState.typeofLoad);
  const [dspFromLocation, setDspFromLocation] = useState(false);
  const [destination, setDestination] = useState<SelectLocationProp | null>(null);
  const [origin, setOrigin] = useState<SelectLocationProp | null>(null);
  const [locationPicKERdSP, setPickLocationOnMap] = useState(false);
  const [dspToLocation, setDspToLocation] = useState(false);
  const [rate, setRate] = useState(defaultState.rate);
  const [ratePerKm, setRatePerKm] = React.useState(0);
  const [rateexplantion, setRateExplanation] = useState(defaultState.rateexplantion);
  // const [paymentTerms, setPaymentTerms] = useState(defaultState.paymentTerms);

  const [paymentTerms, setPaymentTerms] = useState<PaymentTermsValue>(
    getDefaultPaymentTerms()
  );

  const [requirements, setRequirements] = useState(defaultState.requirements)

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

  const [isReturnLoadEnabled, setIsReturnLoadEnabled] = useState(false);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);

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
    // setPaymentTerms(defaultState.paymentTerms);`
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

      // Use utility function for validation
      let validationErrors = [];
      try {
        const validationTrucksNeeded = currentRole?.accType === 'fleet' && loadVisibility === 'Private'
          ? selectedFleetTrucks
          : currentRole?.accType === 'brokerage' && loadVisibility === 'Private'
            ? selectedBrokerTrucks
            : trucksNeeded;

        validationErrors = validateLoadForm("professional", {
          typeofLoad,
          origin,
          destination,
          rate,
          paymentTerms,
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


        return;
      }


      // Additional validation for new fields
      if ((loadVisibility === "Public" || loadVisibility === "Both") && (!numberOfTrucks || numberOfTrucks.trim() === '')) {
        validationErrors.push('Number of trucks needed is required');
      }
      if (!deliveryDate || deliveryDate.trim() === '') {
        validationErrors.push('Delivery date is required');
      }


      // Additional validation for fleet users - private and both loads need a private truck assignment.


      if ((loadVisibility === 'Public' || loadVisibility === 'Both') && trucksNeeded.length === 0) {
        validationErrors.push('Select at least 1 truck requirement for the public load');
      }

      // Additional validation for broker selection - skip for broker users
      // if (currentRole?.accType !== 'broker' && selectedBrokers.length === 0) {
      //   validationErrors.push('Select at least one broker');
      // }

      // Additional validation for broker private loads
      if (currentRole?.accType === 'brokerage' && loadVisibility === 'Private') {
        if (selectedBrokerTrucks.length === 0) {
          validationErrors.push('Select at least one assigned truck');
        }
      }

        if (validationErrors.length > 0) {
          alert(validationErrors.join("\n"),)
          // alertBox("Missing Load Details", validationErrors.join("\n"), [], "error");

          setIsSubmitting(false)
          return;
        }

      // Show payment confirmation modal
      confirmLoadPaymentAndSubmit()
      return;

    } catch (e) {
      const errorDetails = e instanceof Error ? e.stack : String(e);
      showError(
        "Failed to Submit Load",
        "There was an error submitting your load. Please try again.",
        errorDetails,
        true
      );
      // setIsSubmitting(false);

      console.error(e)
    }

  };



  // Function to handle payment confirmation and proceed with load submission
  const confirmLoadPaymentAndSubmit = async () => {
    setIsSubmitting(true);

    try {

      if (!user || !user.uid) {
        alert("Please wait for user data to load or reopen Add Load.");
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
      }, activeUser, expoPushToken, currentRole);

      await submitLoad({
        currentRole,
        user: activeUser,
        loadVisibility,
        loadData,
        assignments,
        selectedFleetTrucks,
        fleetDrivers,
        selectedBrokerTrucks,
        selectedBrokers,
        numberOfTrucks,
        deliveryDate,
        loadingDate,
        origin,
        destination,
        trucksNeeded,
        typeofLoad,
        rate,
        ratePerKm ,
        selectedModelType,
        selectedCurrency,
        selectedCustomer,
        isTrackingEnabled ,

      });

      ToastAndroid.show('load added successfully.', ToastAndroid.SHORT);
      router.back()
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





  const renderTruckRequirements = (options?: { title?: string; helperText?: string }) => (
    <TruckRequirementsSection
      title={options?.title}
      helperText={options?.helperText}
      trucksNeeded={trucksNeeded}
      removeTruck={removeTruck}
      onAddTruck={pushTruck}
      backgroundLight={backgroundLight}
      selectedTruckType={selectedTruckType}
      setSelectedTruckType={setSelectedTruckType}
      selectedCargoArea={selectedCargoArea}
      setSelectedCargoArea={setSelectedCargoArea}
      selectedTankerType={selectedTankerType}
      setSelectedTankerType={setSelectedTankerType}
      selectedTruckCapacity={selectedTruckCapacity}
      setSelectedTruckCapacity={setSelectedTruckCapacity}
      formDataTruck={formDataTruck}
      setFormDataTruck={setFormDataTruck}
      showCountries={showCountries}
      setShowCountries={setShowCountries}
      operationCountries={operationCountries}
      setOperationCountries={setOperationCountries}
    />
  );





  const [displayedTruckCount, setDisplayedTruckCount] = useState(10);
  const [displayedBrokerTruckCount, setDisplayedBrokerTruckCount] = useState(10);



  const stepKeys = ['basicInfo', 'loadDetails', 'additionalInfo'];
  if (isReturnLoadEnabled) stepKeys.push('returnLoad');
  stepKeys.push('truckReq');

  const stepLabels = ['Basic Info', 'Load Details', 'Additi Info'];
  if (isReturnLoadEnabled) stepLabels.push('Return Load');
  stepLabels.push('Truck Req');

  const currentStepKey = stepKeys[step];


  return (
    <ScreenWrapper fh={false}>

      <Heading page='Create Load' />

      <StepIndicator
        steps={stepLabels}
        currentStep={step}
        onStepPress={setStep}
      />

      <View style={{ flex: 1, position: 'relative',paddingHorizontal:7 }}>

        {/* ============ NEW FIRST STEP: BASIC INFO ============ */}
        {currentStepKey === 'basicInfo' && (
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Basic Load Info
              </ThemedText>
              <Divider />

              <ThemedText>
                Customer (Load Owner / Shipper)<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <CustomerPicker
                userId={user?.uid || ""}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
              />

              {(currentRole?.accType === 'fleet' || currentRole?.accType === 'brokerage') && (
                <View style={{ marginTop: wp(3), marginBottom: wp(2) }}>
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
                        {currentRole?.accType === 'fleet' ? 'Only fleet trucks' : 'Assigned trucks'}
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
                  </View>
                </View>
              )}

              <Divider />

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



              <Divider />


              <TouchableOpacity
                onPress={() => setIsTrackingEnabled(!isTrackingEnabled)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: wp(3),
                  borderRadius: 8,
                  backgroundColor: backgroundLight,
                  borderWidth: 1,
                  borderColor: isTrackingEnabled ? '#2196F3' : '#E0E0E0',
                  marginTop: wp(2),
                }}
              >
                <View style={{ flex: 1, marginRight: wp(2) }}>
                  <ThemedText style={{ fontWeight: '600' }}>
                    Enable Transix Tracking
                  </ThemedText>

                  <ThemedText style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    Your cargo will be trackable live inside the Transix app using our fleet tracking system
                  </ThemedText>
                </View>

                <Switch
                  value={isTrackingEnabled}
                  onValueChange={setIsTrackingEnabled}
                  trackColor={{ false: '#ccc', true: '#2196F3' }}
                />
              </TouchableOpacity>





              <Divider />

              <TouchableOpacity
                onPress={() => setIsReturnLoadEnabled(!isReturnLoadEnabled)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: wp(3),
                  borderRadius: 8,
                  backgroundColor: backgroundLight,
                  borderWidth: 1,
                  borderColor: isReturnLoadEnabled ? '#2196F3' : '#E0E0E0',
                  marginTop: wp(2),
                }}
              >
                <View style={{ flex: 1, marginRight: wp(2) }}>
                  <ThemedText style={{ fontWeight: '600' }}>Return Load?</ThemedText>
                  <ThemedText style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    Turn this on if there's a return load for this trip
                  </ThemedText>
                </View>
                <Switch
                  value={isReturnLoadEnabled}
                  onValueChange={setIsReturnLoadEnabled}
                  trackColor={{ false: '#ccc', true: '#2196F3' }}
                />
              </TouchableOpacity>

            </View>
            <Divider />
            <View style={styles.viewMainDsp}>
              <Button onPress={() => setStep(step + 1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* ============ LOAD DETAILS (Customer + Location removed — now on Basic Info) ============ */}
        {currentStepKey === 'loadDetails' && (
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Load Details
              </ThemedText>
              <Divider />

              <ThemedText>
                Type of Load<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={typeofLoad}
                onChangeText={setTypeofLoad}
              />

              <RateInput
                rate={rate}
                setRate={setRate}
                distance={distance}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                ratePerKm={ratePerKm}
                setRatePerKm={setRatePerKm}
                selectedModelType={selectedModelType}
                setSelectedModelType={setSelectedModelType}
                rateExplanation={rateexplantion}
                setRateExplanation={setRateExplanation}
              />

              <Divider />

              <PaymentTerms value={paymentTerms} onChange={setPaymentTerms} />

            </View>
            <Divider />
            <View style={styles.viewMainDsp}>
              <Button onPress={() => setStep(step - 1)} title="Back" />
              <Button onPress={() => setStep(step + 1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* ============ ADDITIONAL INFO (unchanged) ============ */}
        {currentStepKey === 'additionalInfo' && (
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Additional Info
              </ThemedText>
              <Divider />

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
              <Button onPress={() => setStep(step - 1)} title="Back" />
              <Button onPress={() => setStep(step + 1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
              <View style={{ height: 100 }} />
            </View>
          </ScrollView>
        )}

        {/* ============ RETURN LOAD (only shown when toggle is ON — unchanged content) ============ */}
        {currentStepKey === 'returnLoad' && (
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Return Load
              </ThemedText>
              <Divider />

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
                distance={returnDistance}
                selectedCurrency={selectedReturnCurrency || { id: 1, name: "USD" }}
                setSelectedCurrency={setSelectedReturnCurrency}
                ratePerKm={ratePerKm}
                setRatePerKm={setRatePerKm}
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
              <Button onPress={() => setStep(step - 1)} title="Back" />
              <Button onPress={() => setStep(step + 1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
          </ScrollView>
        )}

        {/* ============ TRUCK REQ (Load Visibility moved out, truck lists now paginated + scrollable) ============ */}
        {currentStepKey === 'truckReq' && (
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                {currentRole?.accType === 'fleet' ? 'Select Fleet Trucks & Drivers' : 'Truck Requirements'}
              </ThemedText>
              <Divider />

              {/* Load Visibility selector now lives on the Basic Info step — nothing else here changed */}

              {currentRole?.accType === 'fleet' && (loadVisibility === 'Private' || loadVisibility === 'Both') ? (
                <>
                  <ThemedText>Search Trucks</ThemedText>
                  <Input
                    value={truckSearchQuery}
                    onChangeText={(text) => {
                      setTruckSearchQuery(text);
                      setDisplayedTruckCount(10); // reset pagination whenever the filter changes
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

                  <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>
                    Available Trucks ({searchedTrucks.length})
                  </ThemedText>

                  <View style={{ maxHeight: hp(48), marginTop: wp(1) }}>


                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      keyboardShouldPersistTaps="always"
                    >
                      {searchedTrucks.slice(0, displayedTruckCount).map((truck, index) => {
                        const truckDrivers = fleetDriversFromTrucks.filter(driver => driver.truckId === truck.id);
                        const defaultDriver = truck.defaultDriver || null;

                        const isTruckSelected = selectedFleetTrucks.some(t => t.id === truck.id);
                        const isExpanded = expandedTruckIds.includes(truck.id);

                        const assignment = assignments.find(a => a.truckId === truck.id);
                        const assignedDriverId = assignment?.driverId;

                        const filteredDrivers = driverSearchQueries[truck.id]?.length > 0
                          ? fleetDrivers.filter(d =>
                            d.fullName?.toLowerCase().includes(driverSearchQueries[truck.id].toLowerCase())
                          )
                          : [];

                        return (
                          <View key={truck.id || index} style={[styles.truckCard, { backgroundColor: backgroundLight }]}>

                            {/* ── Truck header / select ───────────────────────── */}
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => {
                                const exists = selectedFleetTrucks.find(t => t.id === truck.id);
                                if (exists) {
                                  setSelectedFleetTrucks(prev => prev.filter(t => t.id !== truck.id));
                                  setAssignments(prev => prev.filter(a => a.truckId !== truck.id));
                                  setExpandedTruckIds(prev => prev.filter(id => id !== truck.id));
                                } else {
                                  setSelectedFleetTrucks(prev => [...prev, truck]);
                                  setExpandedTruckIds(prev => [...prev, truck.id]);
                                }
                              }}
                              style={[
                                styles.truckHeader,
                                isTruckSelected && styles.truckHeaderSelected,
                              ]}
                            >
                              <View style={[styles.checkbox, isTruckSelected && styles.checkboxSelected]}>
                                {isTruckSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                              </View>

                              <View style={styles.truckIconWrap}>
                                <Ionicons name="bus-outline" size={20} color={accent} />
                              </View>

                              <View style={{ flex: 1 }}>
                                <ThemedText style={styles.truckName}>{truck.truckName}</ThemedText>
                                <ThemedText style={styles.truckMeta}>
                                  {truck.truckType} • {truck.truckCapacity}
                                </ThemedText>
                              </View>

                              {truckDrivers.length > 0 && (
                                <View style={styles.driverCountBadge}>
                                  <Ionicons name="people-outline" size={12} color={accent} />
                                  <ThemedText style={styles.driverCountText}>{truckDrivers.length}</ThemedText>
                                </View>
                              )}

                              <Ionicons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color="#999"
                                style={{ marginLeft: wp(2) }}
                              />
                            </TouchableOpacity>

                            {/* ── Expanded: driver assignment ─────────────────── */}
                            {isExpanded && (
                              <View style={styles.driverSection}>
                                <View style={styles.sectionTitleRow}>
                                  <Ionicons name="person-add-outline" size={15} color={accent} />
                                  <ThemedText style={styles.sectionTitle}>Assign Driver (Optional)</ThemedText>
                                </View>

                                <View style={styles.searchWrap}>
                                  <View style={{ alignItems: "center", justifyContent: "center", height: 48, width: 35, marginBottom: 10, marginLeft: -3 }}>

                                    <Ionicons name="search-outline" size={16} color="#999" style={{ marginRight: wp(2) }} />
                                  </View>
                                  <Input
                                    placeholder="Search driver by name..."
                                    value={driverSearchQueries[truck.id] || ''}
                                    onChangeText={(text) =>
                                      setDriverSearchQueries(prev => ({ ...prev, [truck.id]: text }))
                                    }
                                  // containerStyle={{ flex: 1, borderWidth: 0 }}
                                  />
                                </View>

                                {/* Default driver card */}
                                {defaultDriver && (
                                  <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                      const isSelected = assignedDriverId === defaultDriver.driverId;
                                      if (isSelected) {
                                        setAssignments(prev => prev.filter(a => a.truckId !== truck.id));
                                      } else {
                                        setAssignments(prev => [
                                          ...prev.filter(a => a.truckId !== truck.id),
                                          {
                                            truckId: truck.id,
                                            driverId: defaultDriver.driverId,
                                            driverName: defaultDriver.driverName,
                                            driverPhone: defaultDriver.driverPhone,
                                            profilePhoto: defaultDriver.profilePhoto || null,
                                            pickupDate: loadingDate,
                                            deliveryDate: deliveryDate,
                                            pickupLocation: origin,
                                            deliveryLocation: destination,
                                            isDefault: true,
                                          },
                                        ]);
                                      }
                                    }}
                                    style={[
                                      styles.card,
                                      { marginTop: wp(2) },
                                      assignedDriverId === defaultDriver.driverId && { borderWidth: 2, backgroundColor: 'rgba(33, 150, 243, 0.05)', borderColor: accent },
                                    ]}
                                  >
                                    {defaultDriver.profilePhoto ? (
                                      <Image source={{ uri: defaultDriver.profilePhoto }} style={styles.profileImage} />
                                    ) : (
                                      <Ionicons name="person-circle-outline" size={46} color={accent} />
                                    )}

                                    <View style={{ flex: 1, marginLeft: wp(3) }}>
                                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <ThemedText type="subtitle">{defaultDriver.driverName}</ThemedText>
                                        <View style={styles.defaultBadge}>
                                          <Ionicons name="star" size={9} color="#fff" />
                                          <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                                        </View>
                                      </View>

                                      <View style={styles.infoRow}>
                                        <Ionicons name="call-outline" size={15} color={accent} />
                                        <ThemedText style={styles.infoText}>
                                          {defaultDriver.driverPhone || 'No phone'}
                                        </ThemedText>
                                      </View>
                                    </View>

                                    {assignedDriverId === defaultDriver.driverId && (
                                      <Ionicons name="checkmark-circle" size={24} color={accent} />
                                    )}
                                  </TouchableOpacity>
                                )}

                                {/* Search results */}
                                {driverSearchQueries[truck.id]?.length > 0 && (
                                  <View style={{ marginTop: wp(1) }}>
                                    {filteredDrivers.length === 0 ? (
                                      <ThemedText style={styles.emptyText}>No drivers found</ThemedText>
                                    ) : (
                                      filteredDrivers.map(driver => {
                                        const isSelected = assignedDriverId === driver.driverId;

                                        return (
                                          <TouchableOpacity
                                            key={driver.driverId}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                              if (isSelected) {
                                                setAssignments(prev => prev.filter(a => a.truckId !== truck.id));
                                              } else {
                                                setAssignments(prev => [
                                                  ...prev.filter(a => a.truckId !== truck.id),
                                                  {
                                                    truckId: truck.id,
                                                    driverId: driver.driverId,
                                                    driverName: driver.fullName,
                                                    driverPhone: driver.phoneNumber,
                                                    profilePhoto: driver.profilePhoto || null,
                                                    pickupDate: loadingDate,
                                                    deliveryDate: deliveryDate,
                                                    pickupLocation: origin,
                                                    deliveryLocation: destination,
                                                    isDefault: false,
                                                  },
                                                ]);
                                              }
                                            }}
                                            style={[styles.card, { marginTop: wp(2) }, isSelected && { borderWidth: 2, backgroundColor: 'rgba(33, 150, 243, 0.05)', borderColor: accent }]}
                                          >
                                            {driver.profilePhoto ? (
                                              <Image source={{ uri: driver.profilePhoto }} style={styles.profileImage} />
                                            ) : (
                                              <Ionicons name="person-circle-outline" size={46} color={accent} />
                                            )}

                                            <View style={{ flex: 1, marginLeft: wp(3) }}>
                                              <ThemedText type="subtitle">{driver.fullName}</ThemedText>
                                              <View style={styles.infoRow}>
                                                <Ionicons name="call-outline" size={15} color={accent} />
                                                <ThemedText style={styles.infoText}>
                                                  {driver.phoneNumber || 'No phone'}
                                                </ThemedText>
                                              </View>
                                            </View>

                                            {isSelected && <Ionicons name="checkmark-circle" size={24} color={accent} />}
                                          </TouchableOpacity>
                                        );
                                      })
                                    )}
                                  </View>
                                )}

                                {/* Pickup/delivery details once a driver is assigned */}
                                {assignment && (
                                  <View style={styles.assignmentDetails}>
                                    <LocationSelector
                                      origin={assignment?.pickupLocation || null}
                                      destination={assignment?.deliveryLocation || null}
                                      setOrigin={(location) => {
                                        setAssignments(prev =>
                                          prev.map(a => (a.truckId === truck.id ? { ...a, pickupLocation: location } : a))
                                        );
                                      }}
                                      setDestination={(location) => {
                                        setAssignments(prev =>
                                          prev.map(a => (a.truckId === truck.id ? { ...a, deliveryLocation: location } : a))
                                        );
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
                                      style={styles.dateButton}
                                    >
                                      <Ionicons name="calendar-outline" size={16} color={accent} />
                                      <ThemedText style={styles.dateButtonText}>
                                        {assignment?.pickupDate
                                          ? new Date(assignment.pickupDate).toLocaleDateString()
                                          : 'Select Pickup Date'}
                                      </ThemedText>
                                    </TouchableOpacity>

                                    {pickupDateTruckId === truck.id && (
                                      <DateTimePicker
                                        value={assignment?.pickupDate ? new Date(assignment.pickupDate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                          setPickupDateTruckId(null);
                                          if (selectedDate) {
                                            setAssignments(prev =>
                                              prev.map(a =>
                                                a.truckId === truck.id
                                                  ? { ...a, pickupDate: selectedDate.toISOString() }
                                                  : a
                                              )
                                            );
                                          }
                                        }}
                                      />
                                    )}

                                    <TouchableOpacity
                                      onPress={() => setDeliveryDateTruckId(truck.id)}
                                      style={styles.dateButton}
                                    >
                                      <Ionicons name="calendar-outline" size={16} color={accent} />
                                      <ThemedText style={styles.dateButtonText}>
                                        {assignment?.deliveryDate
                                          ? new Date(assignment.deliveryDate).toLocaleDateString()
                                          : 'Select Delivery Date'}
                                      </ThemedText>
                                    </TouchableOpacity>

                                    {deliveryDateTruckId === truck.id && (
                                      <DateTimePicker
                                        value={assignment?.deliveryDate ? new Date(assignment.deliveryDate) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                          setDeliveryDateTruckId(null);
                                          if (selectedDate) {
                                            setAssignments(prev =>
                                              prev.map(a =>
                                                a.truckId === truck.id
                                                  ? { ...a, deliveryDate: selectedDate.toISOString() }
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
                    </ScrollView>



                  </View>

                  {searchedTrucks.length > displayedTruckCount && (
                    <TouchableOpacity
                      onPress={() => setDisplayedTruckCount(prev => prev + 10)}
                      style={{
                        marginTop: wp(2),
                        padding: wp(2.5),
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: accent,
                        alignItems: 'center',
                      }}
                    >
                      <ThemedText style={{ color: accent, fontWeight: '600' }}>
                        Show More ({searchedTrucks.length - displayedTruckCount} remaining)
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {loadVisibility === 'Both' && (
                    <>
                      <Divider />
                      <ThemedText>
                        Number of Public Trucks Needed<ThemedText color="red">*</ThemedText>
                      </ThemedText>
                      <Input
                        value={numberOfTrucks}
                        onChangeText={setNumberOfTrucks}
                        placeholder='e.g., 1, 2, 5'
                        keyboardType="numeric"
                      />
                      {renderTruckRequirements({ title: 'Public Truck Requirements' })}
                    </>
                  )}
                </>
              ) : currentRole?.accType === 'fleet' && loadVisibility === 'Public' ? (
                <>
                  <ThemedText>
                    Number of Public Trucks Needed<ThemedText color="red">*</ThemedText>
                  </ThemedText>
                  <Input
                    value={numberOfTrucks}
                    onChangeText={setNumberOfTrucks}
                    placeholder='e.g., 1, 2, 5'
                    keyboardType="numeric"
                  />
                  {renderTruckRequirements({ title: 'Public Truck Requirements' })}

                </>
              ) : currentRole?.accType === 'brokerage' && (loadVisibility === 'Private' || loadVisibility === 'Both') ? (
                <>
                  <ThemedText>Search Assigned Trucks</ThemedText>
                  <Input
                    value={brokerTruckSearchQuery}
                    onChangeText={(text) => {
                      setBrokerTruckSearchQuery(text);
                      setDisplayedBrokerTruckCount(10); // reset pagination whenever the filter changes
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

                  <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>
                    Available Assigned Trucks ({searchedBrokerTrucks.length})
                  </ThemedText>
                  <View style={{ maxHeight: hp(48), marginTop: wp(1) }}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator keyboardShouldPersistTaps="always">
                      {searchedBrokerTrucks.slice(0, displayedBrokerTruckCount).map((truck, index) => (
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
                    </ScrollView>
                  </View>

                  {searchedBrokerTrucks.length > displayedBrokerTruckCount && (
                    <TouchableOpacity
                      onPress={() => setDisplayedBrokerTruckCount(prev => prev + 10)}
                      style={{
                        marginTop: wp(2),
                        padding: wp(2.5),
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: accent,
                        alignItems: 'center',
                      }}
                    >
                      <ThemedText style={{ color: accent, fontWeight: '600' }}>
                        Show More ({searchedBrokerTrucks.length - displayedBrokerTruckCount} remaining)
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {loadVisibility === 'Both' && (
                    <>
                      <Divider />
                      <ThemedText>
                        Number of Public Trucks Needed<ThemedText color="red">*</ThemedText>
                      </ThemedText>
                      <Input
                        value={numberOfTrucks}
                        onChangeText={setNumberOfTrucks}
                        placeholder='e.g., 1, 2, 5'
                        keyboardType="numeric"
                      />
                      {renderTruckRequirements({ title: 'Public Truck Requirements' })}
                    </>
                  )}
                </>
              ) : (
                <>
                  <ThemedText>
                    Number of Public Trucks Needed<ThemedText color="red">*</ThemedText>
                  </ThemedText>
                  <Input
                    value={numberOfTrucks}
                    onChangeText={setNumberOfTrucks}
                    placeholder='e.g., 1, 2, 5'
                    keyboardType="numeric"
                  />
                  {renderTruckRequirements()}
                </>
              )}

              <Divider />
              <View style={styles.viewMainDsp}>
                <Button onPress={() => setStep(step - 1)} title="Back" />
                <Button onPress={handleSubmit} title={isSubmitting ? "Submiting..." : "Submit"} disabled={isSubmitting} loading={isSubmitting} colors={{ text: '#0f9d58', bg: '#0f9d5824' }} style={{ borderWidth: 1, borderColor: accent }} />
              </View>
            </View>
            <View style={{ height: 25 }} />
          </ScrollView>
        )}
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

  // infoText: {
  //   fontSize: 16,
  //   fontWeight: "500",
  //   marginBottom: 6,
  // },
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
  }, truckCard: {
    marginVertical: wp(1.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(3.5),
  },
  truckHeaderSelected: {
    backgroundColor: 'rgba(33, 150, 243, 0.06)',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C7CCD1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  truckIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },

  truckName: {
    fontWeight: '700',
    fontSize: 15,
  },
  truckMeta: {
    fontSize: 12,
    color: '#8A8F99',
    marginTop: 2,
  },

  driverCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    paddingHorizontal: wp(2),
    paddingVertical: 3,
    gap: 4,
  },
  driverCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2196F3',
  },

  driverSection: {
    padding: wp(3.5),
    borderTopWidth: 1,
    borderColor: '#EEF0F2',
    // backgroundColor: '#FAFBFC',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(2.5),
    gap: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 13,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
    // borderRadius: 10,
    // paddingHorizontal: wp(3),
    // backgroundColor: '#fff',
    // paddingRight:4 ,
    marginRight: 30,
  },

  cardSelected: {
    // borderColor: accent,
    borderWidth: 2,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },

  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    gap: 3,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },

  emptyText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: wp(3),
  },

  assignmentDetails: {
    marginTop: wp(3),
    gap: wp(2),
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: wp(3),
    // backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 13,
  }, card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
    marginBottom: wp(2),
  },


  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },


  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: wp(1),
  },


  infoText: {
    marginLeft: wp(1.5),
    opacity: 0.65,
    fontSize: 13
  },

});








