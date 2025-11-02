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
import { addDocument, addDocumentWithId, setDocuments, getDocById } from "@/db/operations";
import { db } from '@/db/fireBaseConfig';
import { collection,doc,setDoc } from 'firebase/firestore';
import { useAuth } from "@/context/AuthContext";
import { DropDownItem } from "@/components/DropDown";
import { countryCodes } from "@/data/appConstants";
import { Dropdown } from "react-native-element-dropdown";
import { HorizontalTickComponent } from "@/components/SlctHorizonzalTick";
import { DocumentUploader } from "@/components/DocumentUploader";

import { hp, wp } from "@/constants/common";

import { AddTruckDetails } from "@/components/AddTruckDetails";
import { TruckFormData } from "@/types/types";
import { TruckTypeProps } from "@/types/types";
import { useThemeColor } from '@/hooks/useThemeColor';
import { LoadImageUpload } from '@/components/LoadImageUpload';
import { AIRecommendations } from '@/components/AIRecommendations';
import { LoadingDateSelector } from '@/components/LoadingDateSelector';
import { AfricanTruckSelector } from '@/components/AfricanTruckSelector';

// New extracted components
import { StepIndicator } from '@/components/StepIndicator';
import { LocationSelector } from '@/components/LocationSelector';
import { RateInput } from '@/components/RateInput';
import { LoadSummary } from '@/components/LoadSummary';

import { usePushNotifications, notifyLoadApprovalAdmins } from "@/Utilities/pushNotification";

import { uploadImage } from "@/db/operations";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/db/fireBaseConfig";
import { pickDocument, selectManyImages, pickDocumentsOnly } from "@/Utilities/utils";
import { selectImage, selectImageNoCrop, selectImageWithCrop, takePhoto } from "@/Utilities/imageUtils";
import { DocumentAsset } from "@/types/types";
import { ImagePickerAsset } from "expo-image-picker";
import { ErrorModal } from "@/components/ErrorModal";
import KYCVerificationModal from "@/components/KYCVerificationModal";

import { notifyTrucksByFilters } from "@/Utilities/notifyTruckByFilters";
import { TruckNeededType } from "@/types/types";

// Payment related imports
import { getWalletBalance, hasSufficientBalance, deductFromWallet, addToWallet } from '@/Utilities/walletUtils';
import { processReferralCommission, getUserReferrer } from '@/Utilities/referralUtils';
import ConfirmationModal from '@/components/ConfirmationModal';
import InsufficientFundsModal from '@/components/InsufficientFundsModal';
import { fetchDocuments } from '@/db/operations';
import { where } from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectLocationProp } from '@/types/types';

import { getUsers } from '@/db/operations';
// New utilities
import {
  validateLoadForm,
  prepareLoadData,
  getDefaultFormState,
} from '@/Utilities/loadUtils';
import { analyzeLoadImages } from '@/Utilities/aiAnalysisUtils';
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

// New fields for load requirements
const [numberOfTrucks, setNumberOfTrucks] = useState('');
const [deliveryDate, setDeliveryDate] = useState('');
const [fleetDriversFromTrucks, setFleetDriversFromTrucks] = useState<any[]>([]);
const [userIsVerified , setUserIsVerified] = useState<userIsVerifiedProps| null> (null);

  const [userIsFleetVerified, setUserIsFleetVerified] = useState<boolean>(false);
const [allUsers, setAllUsers] = useState<any[]>([]);

  const [dataChecked, setDataChecked] = useState(false);

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
            setFleetManagerId(parsedRole.fleetManagerId || parsedRole.userId); // Use fleetManagerId if available, fallback to userId
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

      // Fetch fleet trucks if user is in a fleet
      if (currentRole?.accType === 'fleet') {
        setDriversLoading(true);
        try {
          const trucksResult = await fetchDocuments(`fleets/${currentRole.fleetId}/Trucks`, 100); // Fetch fleet trucks
          if (trucksResult && trucksResult.data && Array.isArray(trucksResult.data)) {
            setFleetTrucks(trucksResult.data);
            setSearchedTrucks(trucksResult.data); // Initialize searched trucks

            // Extract drivers from trucks
           const driversFromTrucks: any[] = [];

trucksResult.data.forEach((truck: any) => {
  const truckId = truck.id; // always use truck.id
  const truckName = truck.truckName || truck.formData?.truckName;

  // Main Driver
  if (truck.mainDriver) {
    driversFromTrucks.push({
      docId: truck.mainDriver.docId || truck.mainDriver.driverId,
      role: 'main',
      truckId,
      truckName,
      fullName: truck.mainDriver.fullName,
      driverId: truck.mainDriver.driverId,
      phoneNumber: truck.mainDriver.phoneNumber,
    });
  }

  // Second Main Driver
  if (truck.secondMainDriver) {
    driversFromTrucks.push({
      docId: truck.secondMainDriver.docId || truck.secondMainDriver.driverId,
      role: 'second_main',
      truckId,
      truckName,
      fullName: truck.secondMainDriver.fullName,
      driverId: truck.secondMainDriver.driverId,
      phoneNumber: truck.secondMainDriver.phoneNumber,
    });
  }

  // Backup Drivers
  if (truck.backupDrivers && Array.isArray(truck.backupDrivers)) {
    truck.backupDrivers.forEach((backupDriver: any) => {
      driversFromTrucks.push({
        docId: backupDriver.docId || backupDriver.driverId,
        role: 'backup',
        truckId,
        truckName,
        fullName: backupDriver.fullName,
        driverId: backupDriver.driverId,
        phoneNumber: backupDriver.phoneNumber,
      });
    });
  }
});

// Remove exact duplicates (driverId + truckId)
const uniqueDrivers = driversFromTrucks.filter((driver, index, self) =>
  index === self.findIndex(d => d.driverId === driver.driverId && d.truckId === driver.truckId)
);

console.log("Drivers from trucks:", uniqueDrivers);
setFleetDriversFromTrucks(uniqueDrivers);

          } else {
            setFleetTrucks([]);
            setSearchedTrucks([]);
            setFleetDriversFromTrucks([]);
          }
        } catch (error) {
          console.error("Error fetching fleet trucks:", error);
          setFleetTrucks([]);
          setSearchedTrucks([]);
          setFleetDriversFromTrucks([]);
        } finally {
          setDriversLoading(false);
        }
      } else {
        setFleetTrucks([]);
        setSearchedTrucks([]);
        setFleetDriversFromTrucks([]);
        setDriversLoading(false);
      }


      // Add a short delay before rendering UI to prevent flicker
      setTimeout(() => {
        setDataChecked(true);
      }, 300); // 300ms feels natural
    };

    fetchAll();
  }, [userIsFleetVerified]);






  const { expoPushToken } = usePushNotifications();
  const icon = useThemeColor('icon')
  const accent = useThemeColor('accent')
  const background = useThemeColor('background')
  const backgroundLight = useThemeColor('backgroundLight')
  const coolGray = useThemeColor('coolGray')

  // Initialize form state using utility function
  const defaultState = getDefaultFormState();
  const [step, setStep] = useState(defaultState.step);
  const [userType, setUserType] = useState<'general' | 'professional' | null>(null);

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

          // ✅ ETA with traffic
          if (leg.duration_in_traffic) {
            setDurationInTraffic(leg.duration_in_traffic.text);
          }

          // ✅ Encoded polyline
          setRoutePolyline(route.overview_polyline.points);

          // ✅ Bounds for auto-zoom
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

          // ✅ ETA with traffic
          if (leg.duration_in_traffic) {
            setReturnDurationInTraffic(leg.duration_in_traffic.text);
          }

          // ✅ Encoded polyline
          setReturnRoutePolyline(route.overview_polyline.points);

          // ✅ Bounds for auto-zoom
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





  // AI loading state
  const [aiLoading, setAiLoading] = useState(false);

  // AI-powered truck detection for general users
  const [aiDetectedTruckType, setAiDetectedTruckType] = useState<{ id: number, name: string } | null>(null);
  const [aiDetectedCargoArea, setAiDetectedCargoArea] = useState<TruckTypeProps | null>(null);
  const [aiDetectedCapacity, setAiDetectedCapacity] = useState<{ id: number, name: string } | null>(null);
  const [aiDetectedTankerType, setAiDetectedTankerType] = useState<{ id: number, name: string } | null>(null);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // General user specific fields
  const [budget, setBudget] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState({ id: 1, name: "USD" });
  const [loadImages, setLoadImages] = useState<ImagePickerAsset[]>([]);
  const [selectedLoadingDate, setSelectedLoadingDate] = useState<{ id: number, name: string } | null>(null);
  const [selectedAfricanTrucks, setSelectedAfricanTrucks] = useState<TruckTypeProps[]>([]);


  // AI-powered truck type detection from images
  const handleAnalyzeLoadImages = async () => {
    try {
      await analyzeLoadImages(
        loadImages,
        setAiLoading,
        setAiAnalysisError,
        setAiAnalysisComplete,
        setAiDetectedCargoArea,
        setAiDetectedTruckType,
        setAiDetectedCapacity,
        setAiDetectedTankerType,
        () => { } // setAiAnswer - not used anymore
      );
    } catch (error) {
      console.error("Error analyzing load images:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const errorDetails = error instanceof Error ? error.stack : String(error);
      showError(
        "AI Analysis Error",
        "Failed to analyze your load images. Please try again.",
        errorDetails,
        true
      );
    }
  };

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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Error");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Payment state
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [showLoadPaymentModal, setShowLoadPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Helper function to show error modal
  const showError = (title: string, message: string, details?: string, showDetails: boolean = false) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorDetails(details || "");
    setShowErrorDetails(showDetails);
    setShowErrorModal(true);
  };

  // Helper function to close error modal
  const closeError = () => {
    setShowErrorModal(false);
    setErrorTitle("Error");
    setErrorMessage("");
    setErrorDetails("");
    setShowErrorDetails(false);
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
    setUploadImageUpdate(defaultState.uploadImageUpdate);

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

    // Reset user type and general user specific fields
    setUserType(null);
    setBudget("");
    setBudgetCurrency({ id: 1, name: "USD" });
    setLoadImages([]);
    setSelectedLoadingDate(null);
    setSelectedAfricanTrucks([]);

    // Reset AI analysis fields
    setAiLoading(false);
    setAiDetectedTruckType(null);
    setAiDetectedCargoArea(null);
    setAiDetectedCapacity(null);
    setAiDetectedTankerType(null);
    setAiAnalysisComplete(false);
    setAiAnalysisError(null);

    // Reset proof of order fields
    setProofImages([]);
    setProofDocuments([]);
    setProofDocumentTypes([]);

    // Reset personal details fields
    setPersonalName('');
    setPersonalPhone('');
    setPersonalEmail('');
    setPersonalCountryCode({ id: 0, name: '+263' });
    setSelectedPersonalDocuments([]);
    setPersonalFileType([]);
    setSelectedBrokerPersonalDocuments([]);
    setBrokerPersonalFileType([]);
    setTypeOfBrokerPersonal('');
    setShowPersonalDetailsModal(false);
    setSelectedPersonalType(null);
  };


  // Separate state for proof images and documents
  const [proofImages, setProofImages] = useState<ImagePickerAsset[]>([]);
  const [proofDocuments, setProofDocuments] = useState<DocumentAsset[]>([]);
  const [proofDocumentTypes, setProofDocumentTypes] = React.useState<('pdf' | 'doc' | 'docx')[]>([]);



  // Cargo Personal Details State (similar to truckPersonDetails)
  interface CargoGeneralUser {
    docId: string;
    isApproved: boolean;
    accType: 'general';
  }

  interface CargoProfessionalUser {
    docId: string;
    isApproved: boolean;
    accType: 'professional';
  }

  const [getGeneralDetails, setGeneralDetails] = useState<CargoGeneralUser | null>(null);
  const [getProfessionalDetails, setProfessionalDetails] = useState<CargoProfessionalUser | null>(null);
  const [cargoDataChecked, setCargoDataChecked] = useState(false);
  const [cargoLoading, setCargoLoading] = useState(true);

  // Modal states for document submission
  const [showPersonalDetailsModal, setShowPersonalDetailsModal] = useState(false);
  const [selectedPersonalType, setSelectedPersonalType] = useState<'general' | 'professional' | null>(null);
  const [showUserTypeDropdown, setShowUserTypeDropdown] = useState(false);

  // Personal details form state
  const [personalName, setPersonalName] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalCountryCode, setPersonalCountryCode] = useState({ id: 0, name: '+263' });


  // Document states for personal details
  const [selectedPersonalDocuments, setSelectedPersonalDocuments] = useState<DocumentAsset[]>([]);
  const [personalFileType, setPersonalFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([]);
  const [selectedBrokerPersonalDocuments, setSelectedBrokerPersonalDocuments] = useState<DocumentAsset[]>([]);
  const [brokerPersonalFileType, setBrokerPersonalFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([]);
  const [typeOfBrokerPersonal, setTypeOfBrokerPersonal] = React.useState("");

  const [uploadingPersonalD, setUploadingPersonalD] = React.useState(false);
  const [isSubmittingPersonal, setIsSubmittingPersonal] = React.useState(false);

  const [imageUpdate, setUploadImageUpdate] = React.useState("")




  // Check for personal details on component mount
  useEffect(() => {
    const fetchPersonalDetails = async () => {
      // Check for both general and professional in the unified collection
      const personDetails = await getDocById('verifiedUsers', (data) => {
        if (data) {
          if (data.accType === 'general') {
            setGeneralDetails({
              docId: data.id || '',
              isApproved: data.isApproved || false,
              accType: 'general'
            });
          } else if (data.accType === 'professional') {
            setProfessionalDetails({
              docId: data.id || '',
              isApproved: data.isApproved || false,
              accType: 'professional'
            });
          }
        }
      });

      setCargoLoading(false);

      // Add a short delay before rendering UI to prevent flicker
      setTimeout(() => {
        setCargoDataChecked(true);
      }, 300);
    };

    fetchPersonalDetails();
  }, []);

  // Show modal immediately when user selects type but doesn't have details
  useEffect(() => {
    if (cargoDataChecked && userType) {
      if ((userType === 'general' && !getGeneralDetails) ||
        (userType === 'professional' && !getProfessionalDetails)) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          setSelectedPersonalType(userType);
          setShowPersonalDetailsModal(true);
        }, 500);
      }
    }
  }, [cargoDataChecked, userType, getGeneralDetails, getProfessionalDetails]);

  // Autofill fields for professional users with existing verified details
  useEffect(() => {
    if (userType === 'professional' && getProfessionalDetails) {
      // In a real implementation, fetch and autofill from verifiedUsers collection
      // For now, show confirmation that verified details will be used
      // Future: setPersonalName(fetchedData.fullName);
      // Future: setPersonalPhone(fetchedData.phoneNumber);
      // Future: setPersonalEmail(fetchedData.email);
      // Future: setPersonalCountryCode({ id: 0, name: fetchedData.countryCode });
      // Future: setTypeOfBrokerPersonal(fetchedData.typeOfBroker);
      // Disable editing of autofilled fields
      ToastAndroid.show('Your verified professional details will be used', ToastAndroid.SHORT);
    }
  }, [userType, getProfessionalDetails]);

  // Handle general user ID + selfie verification
  useEffect(() => {
    if (userType === 'general' && getGeneralDetails) {
      // Show confirmation that verified ID will be used
      ToastAndroid.show('Your verified ID and live selfie will be used', ToastAndroid.SHORT);
      // In a real implementation, show confirmation modal: "Your verified ID will be used"
      // Future: Display confirmation and disable ID upload fields
    }
  }, [userType, getGeneralDetails]);

  // Ensure return currency and model are properly initialized
  useEffect(() => {
    if (!selectedReturnCurrency || !selectedReturnCurrency.name) {
      setSelectedReturnCurrency({ id: 1, name: "USD" });
    }
    if (!selectedReturnModelType || !selectedReturnModelType.name) {
      setSelectedReturnModelType({ id: 1, name: "Solid" });
    }
  }, []);

  // Ensure return load fields are properly initialized
  useEffect(() => {
    if (returnLoad === undefined || returnLoad === null) {
      setReturnLoad("");
    }
    if (returnRate === undefined || returnRate === null) {
      setReturnRate("");
    }
    if (returnTerms === undefined || returnTerms === null) {
      setReturnTerms("");
    }
  }, []);

  // Handle general user personal details submission
  const handleUpdateGeneralDetails = async () => {
    setIsSubmittingPersonal(true);
    try {
      // Basic validation
      if (!personalName || personalName.trim().length < 2) {
        alertBox("Missing Personal Details", "Please enter a valid full name (minimum 2 characters)", [], "error");
        setIsSubmittingPersonal(false);
        return;
      }
      if (!personalPhone || personalPhone.trim().length < 7) {
        alertBox("Missing Personal Details", "Please enter a valid phone number (minimum 7 characters)", [], "error");
        setIsSubmittingPersonal(false);
        return;
      }
      if (!personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail.trim())) {
        alertBox("Missing Personal Details", "Please enter a valid email address", [], "error");
        setIsSubmittingPersonal(false);
        return;
      }
      if (!personalCountryCode || !personalCountryCode.name) {
        alertBox("Missing Personal Details", "Please select a country code", [], "error");
        setIsSubmittingPersonal(false);
        return;
      }
      if (!selectedPersonalDocuments[0] || !personalFileType[0]) {
        alertBox("Missing Personal Details", "Please upload an ID document", [], "error");
        setIsSubmittingPersonal(false);
        return;
      }
      if (!selectedPersonalDocuments[1] || !personalFileType[1]) {
        alertBox("Missing Personal Details", "Please take a live selfie holding your ID using the camera", [], "error");
        setIsSubmittingPersonal(false);
        return;
      }

      let idDocument, selfieDocument;

      idDocument = await uploadImage(selectedPersonalDocuments[0], "CargoPersonal", setUploadImageUpdate, "ID uploading");
      selfieDocument = await uploadImage(selectedPersonalDocuments[1], "CargoPersonal", setUploadImageUpdate, "Selfie uploading");

      const personalDetailsData = {
        userId: user?.uid,
        accType: 'general',
        fullName: personalName,
        phoneNumber: personalPhone,
        email: personalEmail,
        countryCode: personalCountryCode.name,
        idDocument: idDocument || null,
        idDocumentType: personalFileType[0] || null,
        selfieDocument: selfieDocument || null,
        selfieDocumentType: personalFileType[1] || null,
        createdAt: Date.now().toString(),
        isApproved: false,
        approvalStatus: 'pending',
        // Placeholders for future AI/photo verification
        aiVerificationScore: null,
        photoVerificationStatus: null,
        biometricData: null
      };

      await setDocuments("verifiedUsers", personalDetailsData);

      setShowPersonalDetailsModal(false);
      ToastAndroid.show("Personal Details created successfully!", ToastAndroid.SHORT);

      // Refresh the personal details check
      const updatedDetails = await getDocById('verifiedUsers', (data) => {
        if (data && data.accType === 'general') {
          setGeneralDetails({
            docId: data.id || '',
            isApproved: data.isApproved || false,
            accType: 'general'
          });
        }
      });
    } catch (error) {
      console.error("Error saving personal details:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const errorDetails = error instanceof Error ? error.stack : String(error);
      showError(
        "Failed to Save Personal Details",
        "There was an error saving your personal details. Please try again.",
        errorDetails,
        true
      );
    } finally {
      setIsSubmittingPersonal(false);
    }
  };

  // Handle professional user personal details submission
  const handleUpdateProfessionalDetails = async () => {
    setUploadingPersonalD(true);

    try {
      // Basic validation
      if (!personalName || personalName.trim().length < 2) {
        alertBox("Missing Professional Details", "Please enter a valid full name (minimum 2 characters)", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (!personalPhone || personalPhone.trim().length < 7) {
        alertBox("Missing Professional Details", "Please enter a valid phone number (minimum 7 characters)", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (!personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail.trim())) {
        alertBox("Missing Professional Details", "Please enter a valid email address", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (!personalCountryCode || !personalCountryCode.name) {
        alertBox("Missing Professional Details", "Please select a country code", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (!typeOfBrokerPersonal || typeOfBrokerPersonal.trim() === '') {
        alertBox("Missing Professional Details", "Please select broker type", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (!selectedBrokerPersonalDocuments[0] || !brokerPersonalFileType[0]) {
        alertBox("Missing Professional Details", "Please upload National ID Document", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (!selectedBrokerPersonalDocuments[1] || !brokerPersonalFileType[1]) {
        alertBox("Missing Professional Details", "Please upload Proof of Residence Document", [], "error");
        setUploadingPersonalD(false);
        return;
      }
      if (typeOfBrokerPersonal === "Company Broker") {
        if (!selectedBrokerPersonalDocuments[2] || !brokerPersonalFileType[2] ||
          !selectedBrokerPersonalDocuments[3] || !brokerPersonalFileType[3]) {
          alertBox("Missing Professional Details", "Please upload Company Registration Certificate and Letter Head", [], "error");
          setUploadingPersonalD(false);
          return;
        }
      }

      let brokerId, proofOfResidence, companyRegCertificate, companyLetterHead;

      brokerId = await uploadImage(selectedBrokerPersonalDocuments[0], "CargoPersonal", setUploadImageUpdate, "National ID");
      proofOfResidence = await uploadImage(selectedBrokerPersonalDocuments[1], "CargoPersonal", setUploadImageUpdate, "Proof Of Residence");

      if (typeOfBrokerPersonal === "Company Broker") {
        companyRegCertificate = await uploadImage(selectedBrokerPersonalDocuments[2], "CargoPersonal", setUploadImageUpdate, "Company Registration Certificate");
        companyLetterHead = await uploadImage(selectedBrokerPersonalDocuments[3], "CargoPersonal", setUploadImageUpdate, "Company Letter Head");
      }

      const professionalDetailsData = {
        userId: user?.uid,
        accType: 'professional',
        typeOfBroker: typeOfBrokerPersonal,
        fullName: personalName,
        phoneNumber: personalPhone,
        email: personalEmail,
        countryCode: personalCountryCode.name,
        brokerId: brokerId || null,
        proofOfResidence: proofOfResidence || null,
        companyRegCertificate: companyRegCertificate || null,
        companyLetterHead: companyLetterHead || null,
        brokerIdType: brokerPersonalFileType[0] || null,
        proofOfResidenceType: brokerPersonalFileType[1] || null,
        companyRegCertificateType: brokerPersonalFileType[2] || null,
        companyLetterHeadType: brokerPersonalFileType[3] || null,
        createdAt: Date.now().toString(),
        isApproved: false,
        approvalStatus: 'pending',
        // Placeholders for future AI/photo verification
        aiVerificationScore: null,
        photoVerificationStatus: null,
        biometricData: null
      };

      await setDocuments("verifiedUsers", professionalDetailsData);

      setShowPersonalDetailsModal(false);
      ToastAndroid.show("Professional Details submitted successfully!", ToastAndroid.SHORT);

      // Refresh the personal details check
      const updatedDetails = await getDocById('verifiedUsers', (data) => {
        if (data && data.accType === 'professional') {
          setProfessionalDetails({
            docId: data.id || '',
            isApproved: data.isApproved || false,
            accType: 'professional'
          });
        }
      });
    } catch (error) {
      console.error("Error saving professional details:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const errorDetails = error instanceof Error ? error.stack : String(error);
      showError(
        "Failed to Save Professional Details",
        "There was an error saving your professional details. Please try again.",
        errorDetails,
        true
      );
    } finally {
      setUploadingPersonalD(false);
    }
  };

  // Function to check if user has available rewards
  const checkUserRewards = async (userId: string): Promise<number> => {
    try {
      const filters = [
        where("userId", "==", userId),
        where("type", "in", ["reward", "bonus"]),
        where("status", "==", "completed")
      ];
      const result = await fetchDocuments("WalletTransactions", 50, undefined, filters);

      let totalRewards = 0;
      result.data.forEach((transaction: any) => {
        totalRewards += transaction.amount;
      });

      return totalRewards;
    } catch (error) {
      console.error('Error checking user rewards:', error);
      return 0;
    }
  };

  // Function to process load payment
  const processLoadPayment = async (): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      setProcessingPayment(true);

      // Check for available rewards first
      const availableRewards = await checkUserRewards(user.uid);

      if (availableRewards >= 2) {
        // Use rewards to pay
        const deductionSuccess = await deductFromWallet(
          user.uid,
          2,
          'Load posting fee (paid with rewards)',
          'wallet'
        );

        if (!deductionSuccess) {
          alertBox("Payment Failed", "Failed to process payment with rewards. Please try again.", [], "error");
          return false;
        }
      } else {
        // Check wallet balance for $2 payment
        const hasBalance = await hasSufficientBalance(user.uid, 2);

        if (!hasBalance) {
          setShowInsufficientFundsModal(true);
          return false;
        }

        // Deduct $2 from wallet
        const deductionSuccess = await deductFromWallet(
          user.uid,
          2,
          'Load posting fee',
          'wallet'
        );

        if (!deductionSuccess) {
          alertBox("Payment Failed", "Failed to process payment. Please try again.", [], "error");
          return false;
        }
      }

      // Process referral commission (1 to referrer, 1 to company)
      const referrerId = await getUserReferrer(user.uid);
      if (referrerId) {
        // Add $1 to referrer
        await addToWallet(referrerId, 1, 'Referral commission from load posting', 'bonus');
      }

      // Add $1 to company (assuming company has a special wallet ID)
      // For now, we'll log this - you might want to create a special company wallet
      console.log('Company revenue: $1 from load posting');

      return true;
    } catch (error) {
      console.error('Error processing load payment:', error);
      alertBox("Payment Error", "An error occurred while processing payment. Please try again.", [], "error");
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Guard: require user type selection before any further validation
    if (!userType) {
      alertBox("Select User Type", "Please select whether you are a General or Professional user first.", [], "error");
      setShowUserTypeDropdown(true);
      setIsSubmitting(false);
      return;
    }

    // Skip KYC verification for verified fleet users
    if (!userIsFleetVerified) {
      // Comprehensive check if user has submitted personal details
      if (userType === 'general' && !getGeneralDetails) {
        setIsSubmitting(false);
        alertBox("Personal Details Required", "Please submit your personal details first before creating a load. All required fields must be completed.", [], "error");
        return;
      }

      if (userType === 'professional' && !getProfessionalDetails) {
        setIsSubmitting(false);
        alertBox("Professional Details Required", "Please submit your professional details first before creating a load. All required documents must be uploaded.", [], "error");
        return;
      }
    }

    // Additional validation: Check if personal details are approved (optional - can be removed if not needed)
    if (userType === 'general' && getGeneralDetails && !getGeneralDetails.isApproved) {
      // Allow submission but show warning
    }

    if (userType === 'professional' && getProfessionalDetails && !getProfessionalDetails.isApproved) {
      // Allow submission but show warning
    }

    // Use utility function for validation
    const validationErrors = validateLoadForm(userType, {
      typeofLoad,
      origin,
      destination,
      rate,
      paymentTerms,
      selectedLoadingDate,
      loadImages,
      selectedAfricanTrucks,
      trucksNeeded,
      requirements,
      proofOfOrder: [...proofDocuments],
      proofOfOrderFileType: [...proofDocumentTypes],
    }, step);

    // Additional validation for new fields
    if (!numberOfTrucks || numberOfTrucks.trim() === '') {
      validationErrors.push('Number of trucks needed is required');
    }
    if (!deliveryDate || deliveryDate.trim() === '') {
      validationErrors.push('Delivery date is required');
    }

    // Additional validation for professional users - check if they have at least one proof file
    if (userType === 'professional' && proofImages.length === 0 && proofDocuments.length === 0) {
      validationErrors.push('Upload at least one proof of order document or image');
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

    // For private trucks, remove the truck type selection requirement since it's not needed
    if (currentRole?.accType === 'fleet' && loadVisibility === 'Private') {
      // Remove truck type validation for private loads since we're selecting specific trucks
      // The validation will still check for selected trucks above
    }

    if (validationErrors.length > 0) {
      alertBox("Missing Load Details", validationErrors.join("\n"), [], "error");
      setIsSubmitting(false)
      return;
    }

    // Show payment confirmation modal
    console.log("Showing payment modal...");
    setShowLoadPaymentModal(true);
    setIsSubmitting(false);
    return;
  };

  // Function to handle payment confirmation and proceed with load submission
  const confirmLoadPaymentAndSubmit = async () => {
    setShowLoadPaymentModal(false);
    setIsSubmitting(true);

    // Process payment first
    const paymentSuccess = await processLoadPayment();
    if (!paymentSuccess) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (!user) {
        alert("Please Login first");
        setIsSubmitting(false)
        router.push('/Account/Login')
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
      if (userType === 'general') {
        // Upload all load images for general users
        if (loadImages && loadImages.length > 0) {
          for (let i = 0; i < loadImages.length; i++) {
            const imageUrl = await uploadImage(loadImages[i], "LoadImages", setUploadImageUpdate, `Load Image ${i + 1}`);
            if (imageUrl) loadImagesUrls.push(imageUrl);
          }
        }
      } else {
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
      }

      // Convert selected African trucks to trucksNeeded format for general users
      if (userType === 'general' && selectedAfricanTrucks && selectedAfricanTrucks.length > 0) {
        const generalTrucksNeeded = selectedAfricanTrucks.map(truck => ({
          cargoArea: truck,
          truckType: { id: 2, name: "Medium Truck" }, // Default for African trucks
          tankerType: null,
          capacity: { id: 2, name: "5-15 tons" }, // Default capacity
          operationCountries: [origin?.country || 'South Africa', destination?.country || 'South Africa'].filter((v, i, a) => a.indexOf(v) === i),
        }));
        setTrucksNeeded(generalTrucksNeeded);
      }

      // Use utility function to prepare load data
      const loadData = prepareLoadData(userType!, {
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
        budget,
        budgetCurrency,
        selectedLoadingDate,
        loadingDate,
        loadImages,
        selectedAfricanTrucks,
        trucksNeeded,
        proofOfOerSub,
        proofOfOrderFileType: [...(proofImages || []).map(() => 'image' as const), ...(proofDocumentTypes || [])],
        loadImagesUrls,
        distance,
        duration,
        durationInTraffic,
        routePolyline,
        bounds,
        // Personal details reference from verifiedUsers
        personalDetailsDocId: getGeneralDetails?.docId || getProfessionalDetails?.docId || null,
        personalAccTypeIsApproved: getGeneralDetails?.isApproved || getProfessionalDetails?.isApproved || false,
        personalAccType: getGeneralDetails?.accType || getProfessionalDetails?.accType || null,
        // New fields
        numberOfTrucks,
        deliveryDate,
      }, user, expoPushToken);

      // Save payment to Payments collection and WalletHistory
      const paymentId = `LOAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });

      const paymentData = {
        id: paymentId,
        serviceType: 'Load Posting Fee',
        price: 2,
        quantity: 1,
        totalAmount: 2,
        stationName: 'Transix Load Service',
        stationId: 'load-service',
        purchaseDate: currentDate.toISOString(),
        qrCode: `LOAD_PAYMENT:${paymentId}:${user.uid}:load:1:2`,
        status: 'completed',
        serviceCategory: 'load',
        userId: user.uid,
        userEmail: user.email,
        paymentMethod: 'wallet',
        phoneNumber: '',
        createdAt: formattedDate,
        updatedAt: formattedDate,
        timeStamp: formattedDate,
        historyType: 'payment', // Add for WalletHistory
      };

      await addDocumentWithId('Payments', paymentId, paymentData);
      await addDocumentWithId('WalletHistory', paymentId, paymentData); // Also save to WalletHistory

  
// Fleet-specific logic: If user is in a fleet and load is private, assign selected trucks and drivers
if (currentRole?.accType === 'fleet' && loadVisibility === 'Private' && selectedFleetTrucks.length > 0) {

  const trucks = selectedFleetTrucks;
  const drivers = selectedDrivers;

  // 1️⃣ Add Cargo to fleet collection and get the auto-generated cargoId
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
  status: "pending"
}))

    }))
  });

  // 2️⃣ Cargo assignments per truck
  for (const truck of trucks) {
    const truckDrivers = drivers.filter(d => d.truckId === truck.id);
    console.log("Truck:", truck.id, "has drivers:", truckDrivers.length);
    if (truckDrivers.length > 0) {
      const assignmentDocId = `${cargoId}_${truck.id}`;
      console.log("Creating assignment for truck:", truck.id, "with drivers:", truckDrivers.length);
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
        createdAt: new Date()
      });
    }
  }

  // 3️⃣ Assign cargo to drivers
  for (const driver of drivers) {
    const driverCargoDocId = `${cargoId}_${driver.driverId}_${driver.truckId}_${driver.role}`;
    console.log("Assigning cargo to driver:", driver.docId, "for truck:", driver.truckId, "role:", driver.role);
    await addDocumentWithId(`fleets/${currentRole.fleetId}/Drivers/${driver.docId}/cargo`, driverCargoDocId, {
      cargoId: cargoId,
      truckId: driver.truckId,
      truckName: driver.truckName,
      role: driver.role,
      status: "pending",
      assignedAt: new Date()
    });
  }

  // 4️⃣ Optional: Truck cargo history
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

  // 5️⃣ Add to fleet manager's assigned loads
  if (currentRole.userRole === "owner" || currentRole.userRole === "fleetManager") {
    console.log("Adding to fleet manager assigned loads for fleet:", currentRole.fleetId);

    const fleetManagerLoadData = {
      loadId: cargoId,
      loadStatus: "pending",
      loadVisibility: 'Private',
      trucks: trucks.map(truck => ({
        truckId: truck.id,
        truckName: truck.truckName,
        truckStatus: "pending",
        drivers: drivers.filter(d => d.truckId === truck.id).map(driver => ({
          driverId: driver.driverId,
          role: driver.role,
          status: "pending",
          fullName: driver.fullName,
          phoneNumber: driver.phoneNumber,
        }))
      })),
      createdAt: new Date()
    };

    const fleetManagerDocId = `LOAD_${cargoId}`;
    console.log("Fleet manager path:", `fleets/${currentRole.fleetId}/fleetManagers/FLTMGR${currentRole.fleetId}/assignedLoads`);
    await addDocumentWithId(`fleets/${currentRole.fleetId}/fleetManagers/FLTMGR${currentRole.fleetId}/assignedLoads`, fleetManagerDocId, fleetManagerLoadData);
  }

} 




// Regular load submission for non-fleet users or fleet users with public loads
await addDocument("Cargo", {
  ...loadData,
  loadVisibility: 'Public' // All loads are public unless specified as private fleet loads
});










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
        rightComponent={
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={() => setShowUserTypeDropdown(!showUserTypeDropdown)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: userType === 'general' ? '#E3F2FD' : userType === 'professional' ? '#E8F5E8' : '#F5F5F5',
                paddingHorizontal: wp(3),
                paddingVertical: wp(1.5),
                borderRadius: 12,
                borderWidth: 1,
                borderColor: userType === 'general' ? '#2196F3' : userType === 'professional' ? '#4CAF50' : '#CCCCCC',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons
                name={userType === 'general' ? "person" : userType === 'professional' ? "business" : "person-add"}
                size={14}
                color={userType === 'general' ? '#2196F3' : userType === 'professional' ? '#4CAF50' : '#666666'}
                style={{ marginRight: wp(1.5) }}
              />
              <ThemedText style={{
                fontSize: 12,
                fontWeight: '600',
                color: userType === 'general' ? '#2196F3' : userType === 'professional' ? '#4CAF50' : '#666666'
              }}>
                {userType === 'general' ? 'General' : userType === 'professional' ? 'Professional' : 'Select Type'}
              </ThemedText>
              <Ionicons
                name={showUserTypeDropdown ? "chevron-up" : "chevron-down"}
                size={12}
                color={userType === 'general' ? '#2196F3' : userType === 'professional' ? '#4CAF50' : '#666666'}
                style={{ marginLeft: wp(1) }}
              />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showUserTypeDropdown && (
              <View style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: wp(2),
                backgroundColor: background,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
                zIndex: 1000,
                minWidth: wp(45),
                overflow: 'hidden'
              }}>
                <TouchableOpacity
                  onPress={() => {
                    setUserType('general');
                    setShowUserTypeDropdown(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: wp(4),
                    paddingVertical: wp(3.5),
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                    backgroundColor: userType === 'general' ? '#E3F2FD' : 'transparent'
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#2196F3',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: wp(3)
                  }}>
                    <Ionicons name="person" size={18} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 16, color: '#2196F3', fontWeight: '600' }}>
                      General User
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      Use AI to help with truck selection
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setUserType('professional');
                    setShowUserTypeDropdown(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: wp(4),
                    paddingVertical: wp(3.5),
                    backgroundColor: userType === 'professional' ? '#E8F5E8' : 'transparent'
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#4CAF50',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: wp(3)
                  }}>
                    <Ionicons name="business" size={18} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 16, color: '#4CAF50', fontWeight: '600' }}>
                      Professional User
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      I know the truck details and requirements
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

      {/* Overlay to close dropdown when clicking outside */}
      {showUserTypeDropdown && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onPress={() => setShowUserTypeDropdown(false)}
        />
      )}

      {/* Personal Details Status */}
      {cargoLoading && (
        <View style={{ padding: wp(4), alignItems: 'center' }}>
          <ActivityIndicator size="small" color={accent} />
        </View>
      )}

      {!cargoLoading && cargoDataChecked && userType && !userIsFleetVerified && (
        (userType === 'general' && !getGeneralDetails) ||
        (userType === 'professional' && !getProfessionalDetails)
      ) && (
          <View style={{ paddingHorizontal: wp(4), paddingVertical: wp(2) }}>
            <TouchableOpacity
              onPress={() => {
                setSelectedPersonalType(userType);
                setShowPersonalDetailsModal(true);
              }}
              style={{
                backgroundColor: '#0f9d5824',
                paddingVertical: wp(3),
                paddingHorizontal: wp(4),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#0f9d58',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="person-add" size={16} color="#0f9d58" style={{ marginRight: wp(2) }} />
              <ThemedText style={{ color: '#0f9d58', fontWeight: '600' }}>
                Submit {userType === 'general' ? 'Personal' : 'Professional'} Details
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

      {!cargoLoading && cargoDataChecked && userType && (userIsFleetVerified || getGeneralDetails || getProfessionalDetails) && (
        <View style={{ paddingHorizontal: wp(4), paddingVertical: wp(1) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {(userIsFleetVerified || getGeneralDetails?.isApproved || getProfessionalDetails?.isApproved) ? (
              <Ionicons name="checkmark-circle" size={wp(4)} color="#0f9d58" />
            ) : (
              <Ionicons name="time" size={wp(4)} color="#ff9800" />
            )}
            <ThemedText style={{ marginLeft: wp(2), color: (userIsFleetVerified || getGeneralDetails?.isApproved || getProfessionalDetails?.isApproved) ? "#0f9d58" : "#ff9800", fontSize: 14 }}>
              {userIsFleetVerified ? "Fleet User • Verified" : (getGeneralDetails ? "General" : "Professional") + " User • " + ((getGeneralDetails?.isApproved || getProfessionalDetails?.isApproved) ? "Verified" : "Pending Verification")}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Blur overlay when no user type is selected - only covers content area */}
      {!userType && (
        <TouchableOpacity
          onPress={() => setShowUserTypeDropdown(true)}
          style={{
            position: 'absolute',
            top: 58, // Start below the header
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
        >
          <BlurView
            intensity={15}
            tint="dark"
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker overlay for smooth dark effect
            }}
          />
        </TouchableOpacity>
      )}

      {userType && (
        <StepIndicator
          steps={userType === 'general'
            ? ['Load Details', 'Images & AI', 'Truck Selection', 'Review & Submit']
            : ['Load Details', 'Additional Info', 'Return Load', 'Truck Req']
          }
          currentStep={step}
          onStepPress={setStep}
        />
      )}

      <View style={{ flex: 1, position: 'relative' }}>
        {step === 0 && (
          <ScrollView keyboardShouldPersistTaps="always" >
            <View style={styles.viewMainDsp}>
              {userType === 'general' ? (
                // General User Form - Step 0: Load Details
                <>
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
                    placeholder="e.g., Furniture, Electronics, Food items"
                  />

                  <LoadingDateSelector
                    selectedDate={selectedLoadingDate}
                    setSelectedDate={setSelectedLoadingDate}
                  />

                  <ThemedText>
                    Budget (Optional)
                  </ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Input
                      value={budget}
                      onChangeText={setBudget}
                      placeholder="Enter your budget"
                      keyboardType="numeric"
                      style={{ flex: 1, marginRight: wp(2) }}
                    />
                    <DropDownItem
                      allData={[{ id: 1, name: "USD" }, { id: 2, name: "ZAR" }, { id: 3, name: "EUR" }]}
                      selectedItem={budgetCurrency}
                      setSelectedItem={setBudgetCurrency}
                      placeholder="Currency"
                    />
                  </View>
                </>
              ) : (
                // Professional User Form
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
              )}

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

              {userType !== 'general' && <RateInput
                rate={rate}
                setRate={setRate}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                selectedModelType={selectedModelType}
                setSelectedModelType={setSelectedModelType}
                rateExplanation={rateexplantion}
                setRateExplanation={setRateExplanation}
              />}


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
        {step === 1 && userType === 'general' && (
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Images & AI Analysis
              </ThemedText>
              <Divider />

              <LoadImageUpload
                loadImages={loadImages}
                setLoadImages={setLoadImages}
                onAnalyzeImages={handleAnalyzeLoadImages}
                aiLoading={aiLoading}
                aiAnalysisComplete={aiAnalysisComplete}
                aiAnalysisError={aiAnalysisError}
              />

              {aiAnalysisComplete && (
                <AIRecommendations
                  aiDetectedCargoArea={aiDetectedCargoArea}
                  aiDetectedTruckType={aiDetectedTruckType}
                  aiDetectedCapacity={aiDetectedCapacity}
                  aiDetectedTankerType={aiDetectedTankerType}
                  aiAnswer=""
                  onUseRecommendations={() => {
                    setSelectedCargoArea(aiDetectedCargoArea);
                    setSelectedTruckType(aiDetectedTruckType);
                    setSelectedTruckCapacity(aiDetectedCapacity);
                    if (aiDetectedTankerType) {
                      setSelectedTankerType(aiDetectedTankerType);
                    }
                    ToastAndroid.show('AI recommendations applied!', ToastAndroid.SHORT);
                  }}
                  onAnalyzeAgain={() => {
                    setAiAnalysisComplete(false);
                    setAiAnalysisError(null);
                    handleAnalyzeLoadImages();
                  }}
                />
              )}
            </View>
            <Divider />
            <View style={{ paddingVertical: wp(3), gap: wp(2), borderRadius: 8, shadowColor: "#6a0c0c", shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.7, shadowRadius: 5, overflow: "hidden" }}>
              <Button onPress={() => setStep(0)} title="Back" />
              <Button onPress={() => setStep(2)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
          </ScrollView>
        )}
        {step === 1 && (userType as string) === 'professional' && (
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
                (userType === 'general' ? loadImages.length > 0 : (proofImages.length > 0 || proofDocuments.length > 0)) ? (
                  <View>
                    <ThemedText style={{ marginBottom: wp(2), fontWeight: 'bold' }}>
                      {userType === 'general' ? 'Load Images' : 'Proof of Order'}
                    </ThemedText>

                    {userType === 'general' ? (
                      // Show all load images for general users
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {loadImages.map((image, index) => (
                          <View key={index} style={{ marginRight: wp(2) }}>
                            <Image source={{ uri: image.uri }} style={styles.loadImagePreview} />
                            <ThemedText style={{ textAlign: 'center', fontSize: 12, marginTop: 4 }}>
                              Image {index + 1}
                            </ThemedText>
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      // Show proof files for professional users
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
                    )}
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
        {step === 2 && userType === 'general' && (
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Truck Selection
              </ThemedText>
              <Divider />

              <AfricanTruckSelector
                selectedTruckTypes={selectedAfricanTrucks}
                setSelectedTruckTypes={setSelectedAfricanTrucks}
              />

              {selectedAfricanTrucks.length > 0 && (
                <View style={{ marginTop: wp(4) }}>
                  <ThemedText style={{ fontSize: 14, fontWeight: 'bold', marginBottom: wp(2) }}>
                    Selected Truck Types:
                  </ThemedText>
                  {selectedAfricanTrucks.map((truck, index) => (
                    <View key={truck.id} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: wp(2),
                      backgroundColor: backgroundLight,
                      borderRadius: 8,
                      marginBottom: wp(1)
                    }}>
                      <ThemedText style={{ flex: 1, color: accent, fontWeight: '600' }}>
                        {truck.name}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => setSelectedAfricanTrucks(prev => prev.filter(t => t.id !== truck.id))}
                      >
                        <Ionicons name="close-circle" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Divider />
            <View style={{ paddingVertical: wp(3), gap: wp(2), borderRadius: 8, shadowColor: "#6a0c0c", shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.7, shadowRadius: 5, overflow: "hidden" }}>
              <Button onPress={() => setStep(1)} title="Back" />
              <Button onPress={() => setStep(3)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
            </View>
          </ScrollView>
        )}
        {step === 2 && (userType as string) === 'professional' && (
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
        {step === 3 && userType === 'general' && (
          <LoadSummary
            userType={userType}
            formData={{
              typeofLoad,
              origin: origin || undefined,
              destination: destination || undefined,
              selectedLoadingDate: selectedLoadingDate || undefined,
              budget,
              budgetCurrency,
              loadImages,
              selectedAfricanTrucks
            }}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
        {step === 3 && (userType as string) === 'professional' && (<ScrollView>
          <View style={styles.viewMainDsp}>
            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
              {currentRole?.accType === 'fleet' ? 'Select Fleet Trucks & Drivers' : 'Truck Requirements'}
            </ThemedText>
            <Divider />

            {/* Load Visibility Toggle for Fleet Users */}
            {currentRole?.accType === 'fleet' && (
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
                      Only fleet trucks
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
                {console.log(fleetDriversFromTrucks.length)}
                
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

                      {/* Drivers for this truck */}
                                 {/* {console.log(truckDrivers.length)} */}
                                   {/* {console.log(selectedFleetTrucks.length)}       */}

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


      {/* General User Personal Details Modal */}
      <Modal visible={showPersonalDetailsModal && selectedPersonalType === 'general'} statusBarTranslucent animationType="slide">
        <ScreenWrapper>
          <View style={{ margin: wp(4), marginTop: hp(6) }}>
            <View style={{ gap: wp(2) }}>
              <ScrollView>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
                  <TouchableOpacity onPress={() => {
                    setShowPersonalDetailsModal(false);
                    setSelectedPersonalType(null);
                  }}>
                    <AntDesign name="close" color={icon} size={wp(4)} />
                  </TouchableOpacity>
                  <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }}>PERSONAL DETAILS</ThemedText>
                </View>

                <ThemedText>Full Name<ThemedText color="red">*</ThemedText></ThemedText>
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
                  documents={selectedPersonalDocuments[0]}
                  title="ID Document"
                  subtitle="Upload your National ID or Passport (PDF or Image)"
                  buttonTiitle="Upload ID Document"
                  onPickDocument={() => pickDocument(setSelectedPersonalDocuments, setPersonalFileType)}
                />

                <DocumentUploader
                  documents={selectedPersonalDocuments[1]}
                  title="Live Selfie with ID"
                  subtitle="Take a live photo holding your ID (Camera required)"
                  buttonTiitle="Take Live Selfie"
                  onPickDocument={() => takePhoto((image) => {
                    setSelectedPersonalDocuments(prev => [prev[0], {
                      name: 'selfie.jpg',
                      uri: image.uri,
                      size: image.fileSize || 0,
                      mimeType: image.mimeType || 'image/jpeg'
                    }, ...prev.slice(2)]);
                    setPersonalFileType(prev => ['image', ...prev.slice(1)]);
                  })}
                  disabled={!selectedPersonalDocuments[0]}
                  toastMessage="Upload ID document first"
                />

                <Button
                  onPress={handleUpdateGeneralDetails}
                  loading={isSubmittingPersonal}
                  disabled={isSubmittingPersonal}
                  title={isSubmittingPersonal ? "Saving..." : "Save"}
                  colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
                  style={{ height: 44 }}
                />
                <View style={{ height: 100 }} />
              </ScrollView>
            </View>
          </View>
        </ScreenWrapper>
      </Modal>

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

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={closeError}
        title={errorTitle}
        message={errorMessage}
        details={errorDetails}
        showDetails={showErrorDetails}
      />

      {/* Load Payment Confirmation Modal */}
      <ConfirmationModal
        isVisible={showLoadPaymentModal}
        onClose={() => {
          setShowLoadPaymentModal(false);
          setIsSubmitting(false);
        }}
        title="Confirm Load Posting"
        message={`Post this load for $2? ${user ? 'If you have a referrer, they will receive $1 commission.' : ''}`}
        confirmText="Pay & Post Load"
        cancelText="Cancel"
        onConfirm={confirmLoadPaymentAndSubmit}
        icon="cash"
        iconColor={accent}
        isLoading={processingPayment}
      />

      {/* Insufficient Funds Modal */}
      <InsufficientFundsModal
        isVisible={showInsufficientFundsModal}
        onClose={() => setShowInsufficientFundsModal(false)}
        requiredAmount={2}
        itemType="load"
        itemName="Load Posting Fee"
      />
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


