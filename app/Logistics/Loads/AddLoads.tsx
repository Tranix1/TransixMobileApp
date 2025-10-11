import 'react-native-get-random-values';
import React, { useState, useEffect, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TouchableNativeFeedback, Modal, ToastAndroid, Image, Pressable, ActivityIndicator } from "react-native";
import { BlurView } from 'expo-blur';

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { addDocument, setDocuments, getDocById } from "@/db/operations";
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LoadImageUpload } from '@/components/LoadImageUpload';
import { AIRecommendations } from '@/components/AIRecommendations';
import { LoadingDateSelector } from '@/components/LoadingDateSelector';
import { AfricanTruckSelector } from '@/components/AfricanTruckSelector';

// New extracted components
import { UserTypeSelector } from '@/components/UserTypeSelector';
import { StepIndicator } from '@/components/StepIndicator';
import { LocationSelector } from '@/components/LocationSelector';
import { RateInput } from '@/components/RateInput';
import { LoadSummary } from '@/components/LoadSummary';

import { usePushNotifications, } from "@/Utilities/pushNotification";

import { uploadImage } from "@/db/operations";
import { pickDocument, selectManyImages, pickDocumentsOnly } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import { ImagePickerAsset } from "expo-image-picker";
import { ErrorModal } from "@/components/ErrorModal";

import { notifyTrucksByFilters } from "@/Utilities/notifyTruckByFilters";
import { TruckNeededType } from "@/types/types";

import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SelectLocationProp } from '@/types/types';
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
import { LocationPicker } from '@/components/LocationPicker';

// New utilities
import {
  validateLoadForm,
  prepareLoadData,
  getDefaultFormState,
  CURRENCY_OPTIONS,
  MODEL_OPTIONS
} from '@/Utilities/loadUtils';
import { analyzeLoadImages, askVertexAI } from '@/Utilities/aiAnalysisUtils';
const AddLoadDB = () => {


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





  // Vertex AI quick Q&A state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
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

  const askVertex = async () => {
    try {
      await askVertexAI(aiQuestion, setAiLoading, setAiAnswer);
    } catch (error) {
      console.error("Error asking Vertex AI:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const errorDetails = error instanceof Error ? error.stack : String(error);
      showError(
        "AI Question Error", 
        "Failed to get AI response. Please try again.", 
        errorDetails, 
        true
      );
    }
  };

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
        setAiAnswer
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

    // Reset user type and general user specific fields
    setUserType(null);
    setBudget("");
    setBudgetCurrency({ id: 1, name: "USD" });
    setLoadImages([]);
    setSelectedLoadingDate(null);
    setSelectedAfricanTrucks([]);

    // Reset AI analysis fields
    setAiQuestion("");
    setAiAnswer("");
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

    // Reset verification document fields
    setIdDocument(null);
    setIdDocumentType(null);
    setProofOfResidence(null);
    setProofOfResidenceType(null);
    setBrokerCertificate(null);
    setBrokerCertificateType(null);

    // Reset load user type and references
    setLoadUserType('general');
    setBrokerId('');
    setBrokerName('');
    setBrokerPhone('');
    setBrokerEmail('');
    setOwnerId('');
    setOwnerName('');
    setOwnerPhone('');
    setOwnerEmail('');

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

    // Clear validation errors
    clearPersonalValidationErrors();
  };


  // Separate state for proof images and documents
  const [proofImages, setProofImages] = useState<ImagePickerAsset[]>([]);
  const [proofDocuments, setProofDocuments] = useState<DocumentAsset[]>([]);
  const [proofDocumentTypes, setProofDocumentTypes] = React.useState<('pdf' | 'doc' | 'docx')[]>([]);

  // Verification document state
  const [idDocument, setIdDocument] = useState<DocumentAsset | null>(null);
  const [idDocumentType, setIdDocumentType] = useState<'pdf' | 'image' | 'doc' | 'docx' | null>(null);
  const [proofOfResidence, setProofOfResidence] = useState<DocumentAsset | null>(null);
  const [proofOfResidenceType, setProofOfResidenceType] = useState<'pdf' | 'image' | 'doc' | 'docx' | null>(null);
  const [brokerCertificate, setBrokerCertificate] = useState<DocumentAsset | null>(null);
  const [brokerCertificateType, setBrokerCertificateType] = useState<'pdf' | 'image' | 'doc' | 'docx' | null>(null);

  // Load user type and references
  const [loadUserType, setLoadUserType] = useState<'general' | 'confinee' | 'broker'>('general');
  const [brokerId, setBrokerId] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerEmail, setBrokerEmail] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

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

  // Personal details form state
  const [personalName, setPersonalName] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalCountryCode, setPersonalCountryCode] = useState({ id: 0, name: '+263' });

  // Validation states for real-time feedback
  const [personalNameError, setPersonalNameError] = useState('');
  const [personalPhoneError, setPersonalPhoneError] = useState('');
  const [personalEmailError, setPersonalEmailError] = useState('');
  const [personalCountryCodeError, setPersonalCountryCodeError] = useState('');
  const [personalDocumentError, setPersonalDocumentError] = useState('');

  // Document states for personal details
  const [selectedPersonalDocuments, setSelectedPersonalDocuments] = useState<DocumentAsset[]>([]);
  const [personalFileType, setPersonalFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([]);
  const [selectedBrokerPersonalDocuments, setSelectedBrokerPersonalDocuments] = useState<DocumentAsset[]>([]);
  const [brokerPersonalFileType, setBrokerPersonalFileType] = React.useState<('pdf' | 'image' | 'doc' | 'docx')[]>([]);
  const [typeOfBrokerPersonal, setTypeOfBrokerPersonal] = React.useState("");

  const [uploadingPersonalD, setUploadingPersonalD] = React.useState(false);
  const [isSubmittingPersonal, setIsSubmittingPersonal] = React.useState(false);

  const [imageUpdate, setUploadImageUpdate] = React.useState("")

  // Real-time validation functions
  const validatePersonalName = (name: string) => {
    if (!name || name.trim() === '') {
      setPersonalNameError('Enter valid full name');
      return false;
    } else if (name.trim().length < 2) {
      setPersonalNameError('Enter valid full name (minimum 2 characters)');
      return false;
    } else {
      setPersonalNameError('');
      return true;
    }
  };

  const validatePersonalPhone = (phone: string) => {
    if (!phone || phone.trim() === '') {
      setPersonalPhoneError('Enter valid phone number');
      return false;
    } else if (phone.trim().length < 7) {
      setPersonalPhoneError('Enter valid phone number (minimum 7 characters)');
      return false;
    } else {
      setPersonalPhoneError('');
      return true;
    }
  };

  const validatePersonalEmail = (email: string) => {
    if (!email || email.trim() === '') {
      setPersonalEmailError('Enter valid email address');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setPersonalEmailError('Enter valid email address (must contain @ and domain)');
      return false;
    } else {
      setPersonalEmailError('');
      return true;
    }
  };

  const validatePersonalCountryCode = (countryCode: any) => {
    if (!countryCode || !countryCode.name) {
      setPersonalCountryCodeError('Select country code');
      return false;
    } else {
      setPersonalCountryCodeError('');
      return true;
    }
  };

  const validatePersonalDocument = (documents: DocumentAsset[], fileTypes: any[]) => {
    if (!documents[0]) {
      setPersonalDocumentError('Upload ID Document');
      return false;
    } else if (!fileTypes[0]) {
      setPersonalDocumentError('Upload ID Document');
      return false;
    } else {
      setPersonalDocumentError('');
      return true;
    }
  };

  // Clear validation errors when modal opens/closes
  const clearPersonalValidationErrors = () => {
    setPersonalNameError('');
    setPersonalPhoneError('');
    setPersonalEmailError('');
    setPersonalCountryCodeError('');
    setPersonalDocumentError('');
  };

  // Validation functions that don't trigger state updates (for use in useMemo)
  const validateName = (name: string) => {
    const isValid = name && name.trim() !== '' && name.trim().length >= 2;
    return isValid;
  };

  const validatePhone = (phone: string) => {
    const trimmed = phone?.trim() || '';
    // More lenient phone validation - allow letters for international formats
    const isValid = phone && trimmed !== '' && trimmed.length >= 7;
    return isValid;
  };

  const validateEmail = (email: string) => {
    const trimmed = email?.trim() || '';
    const isValid = email && trimmed !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    return isValid;
  };

  const validateCountryCode = (countryCode: any) => {
    const isValid = !!(countryCode && countryCode.name);
    return isValid;
  };

  const validateDocument = (documents: DocumentAsset[], fileTypes: any[]) => {
    const isValid = documents[0] && fileTypes[0];
    return isValid;
  };

  // Memoized validation results to prevent infinite re-renders
  const isGeneralPersonalDetailsValid = useMemo(() => {
    const nameValid = validateName(personalName);
    const phoneValid = validatePhone(personalPhone);
    const emailValid = validateEmail(personalEmail);
    const countryCodeValid = validateCountryCode(personalCountryCode);
    const documentValid = validateDocument(selectedPersonalDocuments, personalFileType);

    const isValid = nameValid && phoneValid && emailValid && countryCodeValid && documentValid;
    return isValid;
  }, [personalName, personalPhone, personalEmail, personalCountryCode, selectedPersonalDocuments, personalFileType]);

  const isProfessionalPersonalDetailsValid = useMemo(() => {
    const nameValid = validateName(personalName);
    const phoneValid = validatePhone(personalPhone);
    const emailValid = validateEmail(personalEmail);
    const countryCodeValid = validateCountryCode(personalCountryCode);

    // Check broker type selection
    if (!typeOfBrokerPersonal || typeOfBrokerPersonal.trim() === '') {
      return false;
    }

    // Check required documents
    const idDocValid = !!(selectedBrokerPersonalDocuments[0] && brokerPersonalFileType[0]);
    const residenceDocValid = !!(selectedBrokerPersonalDocuments[1] && brokerPersonalFileType[1]);

    let companyDocsValid = true;
    if (typeOfBrokerPersonal === "Company Broker") {
      companyDocsValid = !!(selectedBrokerPersonalDocuments[2] && brokerPersonalFileType[2]) &&
        !!(selectedBrokerPersonalDocuments[3] && brokerPersonalFileType[3]);
    }

    const isValid = nameValid && phoneValid && emailValid && countryCodeValid && idDocValid && residenceDocValid && companyDocsValid;
    return isValid;
  }, [personalName, personalPhone, personalEmail, personalCountryCode, typeOfBrokerPersonal, selectedBrokerPersonalDocuments, brokerPersonalFileType]);


  // Check for personal details on component mount
  useEffect(() => {
    const fetchPersonalDetails = async () => {
      // Check for both general and professional in the unified collection
      const personDetails = await getDocById('cargoPersonalDetails', (data) => {
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
      // Use comprehensive validation function with error state updates
      const nameValid = validatePersonalName(personalName);
      const phoneValid = validatePersonalPhone(personalPhone);
      const emailValid = validatePersonalEmail(personalEmail);
      const countryCodeValid = validatePersonalCountryCode(personalCountryCode);
      const documentValid = validatePersonalDocument(selectedPersonalDocuments, personalFileType);

      // Create specific error messages for general user
      const missingFields = [];
      if (!nameValid) missingFields.push("Enter valid full name (minimum 2 characters)");
      if (!phoneValid) missingFields.push("Enter valid phone number (minimum 7 characters)");
      if (!emailValid) missingFields.push("Enter valid email address (must contain @ and domain)");
      if (!countryCodeValid) missingFields.push("Select country code");
      if (!documentValid) missingFields.push("Upload ID Document");

      if (missingFields.length > 0) {
        alertBox("Missing Personal Details", `Please complete: ${missingFields.join(", ")}`, [], "error");
        setIsSubmittingPersonal(false);
        return;
      }

      let idDocument;

      idDocument = await uploadImage(selectedPersonalDocuments[0], "CargoPersonal", setUploadImageUpdate, "ID uploading");

      const personalDetailsData = {
        userId: user?.uid,
        accType: 'general',
        fullName: personalName,
        phoneNumber: personalPhone,
        email: personalEmail,
        countryCode: personalCountryCode.name,
        idDocument: idDocument || null,
        idDocumentType: personalFileType[0] || null,
        createdAt: Date.now().toString(),
        isApproved: false,
        approvalStatus: 'pending'
      };

      await setDocuments("cargoPersonalDetails", personalDetailsData);

      setShowPersonalDetailsModal(false);
      ToastAndroid.show("Personal Details created successfully!", ToastAndroid.SHORT);

      // Refresh the personal details check
      const updatedDetails = await getDocById('cargoPersonalDetails', (data) => {
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

    // Use comprehensive validation function with error state updates
    const nameValid = validatePersonalName(personalName);
    const phoneValid = validatePersonalPhone(personalPhone);
    const emailValid = validatePersonalEmail(personalEmail);
    const countryCodeValid = validatePersonalCountryCode(personalCountryCode);

    // Check broker type selection
    if (!typeOfBrokerPersonal || typeOfBrokerPersonal.trim() === '') {
      alertBox("Missing or Invalid Professional Details", "Please select broker type and complete all required fields before submitting.", [], "error");
      setUploadingPersonalD(false);
      return;
    }

    // Check required documents
    const idDocValid = !!(selectedBrokerPersonalDocuments[0] && brokerPersonalFileType[0]);
    const residenceDocValid = !!(selectedBrokerPersonalDocuments[1] && brokerPersonalFileType[1]);

    let companyDocsValid = true;
    if (typeOfBrokerPersonal === "Company Broker") {
      companyDocsValid = !!(selectedBrokerPersonalDocuments[2] && brokerPersonalFileType[2]) &&
        !!(selectedBrokerPersonalDocuments[3] && brokerPersonalFileType[3]);
    }

    // Create specific error messages for debugging
    const missingFields = [];
    if (!nameValid) missingFields.push("Enter valid full name (minimum 2 characters)");
    if (!phoneValid) missingFields.push("Enter valid phone number (minimum 7 characters)");
    if (!emailValid) missingFields.push("Enter valid email address (must contain @ and domain)");
    if (!countryCodeValid) missingFields.push("Select country code");
    if (!idDocValid) missingFields.push("Upload National ID Document");
    if (!residenceDocValid) missingFields.push("Upload Proof of Residence Document");
    if (!companyDocsValid && typeOfBrokerPersonal === "Company Broker") {
      missingFields.push("Upload Company Registration Certificate and Letter Head");
    }

    if (missingFields.length > 0) {
      alertBox("Missing Professional Details", `Please complete: ${missingFields.join(", ")}`, [], "error");
      setUploadingPersonalD(false);
      return;
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
      approvalStatus: 'pending'
    };

    await setDocuments("cargoPersonalDetails", professionalDetailsData);

    setShowPersonalDetailsModal(false);
    ToastAndroid.show("Professional Details submitted successfully!", ToastAndroid.SHORT);

    // Refresh the personal details check
    const updatedDetails = await getDocById('cargoPersonalDetails', (data) => {
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

  const handleSubmit = async () => {
    setIsSubmitting(true)

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

    // Additional validation for professional users - check if they have at least one proof file
    if (userType === 'professional' && proofImages.length === 0 && proofDocuments.length === 0) {
      validationErrors.push('Upload at least one proof of order document or image');
    }

    if (validationErrors.length > 0) {
      alertBox("Missing Load Details", validationErrors.join("\n"), [], "error");
      setIsSubmitting(false)
      return;
    }



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
      for (let i = 0; i < loadImages.length; i++) {
        const imageUrl = await uploadImage(loadImages[i], "LoadImages", setUploadImageUpdate, `Load Image ${i + 1}`);
        if (imageUrl) loadImagesUrls.push(imageUrl);
      }
    } else {
      // Upload all proof images for professional users
      for (let i = 0; i < proofImages.length; i++) {
        const imageUrl = await uploadImage(proofImages[i], "CargoProof", setUploadImageUpdate, `Proof Image ${i + 1}`);
        if (imageUrl) proofOfOerSub.push(imageUrl);
      }

      // Upload all proof documents for professional users
      for (let i = 0; i < proofDocuments.length; i++) {
        const docUrl = await uploadImage(proofDocuments[i], "CargoProof", setUploadImageUpdate, `Proof Document ${i + 1}`);
        if (docUrl) proofOfOerSub.push(docUrl);
      }
    }

    // Convert selected African trucks to trucksNeeded format for general users
    if (userType === 'general' && selectedAfricanTrucks.length > 0) {
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
      proofOfOrderFileType: [...proofImages.map(() => 'image' as const), ...proofDocumentTypes],
      loadImagesUrls,
      distance,
      duration,
      durationInTraffic,
      routePolyline,
      bounds,
      // Personal details reference
      personalDetailsDocId: getGeneralDetails?.docId || getProfessionalDetails?.docId || null,
      personalAccTypeIsApproved: getGeneralDetails?.isApproved || getProfessionalDetails?.isApproved || false,
      personalAccType: getGeneralDetails?.accType || getProfessionalDetails?.accType || null,
    }, user, expoPushToken);


    try {
      // Ensure addDocument is not a React hook or using hooks internally.
      await addDocument("Cargo", loadData);

      await notifyTrucksByFilters({
        trucksNeeded,
        loadItem: {
          typeofLoad: typeofLoad,
          origin: origin!.description,
          destination: destination!.description,
          rate: (userType as string) === 'professional' ? rate : (budget || 'Budget to be discussed'),
          model: (userType as string) === 'professional' ? selectedModelType.name : 'Solid',
          currency: (userType as string) === 'professional' ? selectedCurrency.name : budgetCurrency.name,
        },
      });


      ToastAndroid.show('Trucks notified and load added successfully.', ToastAndroid.SHORT);

      // Clear form and reset to initial state
      clearFormFields();



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


      <Heading page='Create Load' rightComponent={
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: wp(3) }}>
          <View>
            <TouchableNativeFeedback onPress={() => {}}>
              <ThemedText style={{ alignSelf: 'flex-start' }}>Add Draft</ThemedText>
            </TouchableNativeFeedback>
          </View>
        </View>
      } />

      {/* User Type Selection */}
      <UserTypeSelector
        userType={userType}
        setUserType={setUserType}
      />

      {/* Personal Details Status */}
      {cargoLoading && (
        <View style={{ padding: wp(4), alignItems: 'center' }}>
          <ActivityIndicator size="small" color={accent} />
        </View>
      )}

      {!cargoLoading && cargoDataChecked && userType && (
        (userType === 'general' && !getGeneralDetails) ||
        (userType === 'professional' && !getProfessionalDetails)
      ) && (
          <View style={{ padding: wp(4) }}>
            <ThemedText style={{ textAlign: 'center', marginBottom: wp(2) }}>
              Please submit your personal details to continue
            </ThemedText>
            <Button
              onPress={() => {
                setSelectedPersonalType(userType);
                setShowPersonalDetailsModal(true);
              }}
              title={`Submit ${userType === 'general' ? 'Personal' : 'Professional'} Details`}
              colors={{ text: '#0f9d58', bg: '#0f9d5824' }}
            />
          </View>
        )}

      {!cargoLoading && cargoDataChecked && userType && (getGeneralDetails || getProfessionalDetails) && (
        <View style={{ padding: wp(4) }}>
          <ThemedText style={{ textAlign: "center", color: accent }}>
            Creating load as {getGeneralDetails ? "General" : "Professional"} User
          </ThemedText>
          <ThemedText style={{ textAlign: "center", fontSize: 12, color: coolGray }}>
            Status: {(getGeneralDetails?.isApproved || getProfessionalDetails?.isApproved) ? "Approved" : "Pending Approval"}
          </ThemedText>
        </View>
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




      <View style={{ flex: 1 }}>
        {step === 0 && userType && (
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
                  aiAnswer={aiAnswer}
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
                Loading date <ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={loadingDate}
                onChangeText={setLoadingDate}
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
                                    width: wp(45),
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
                                    width: wp(45),
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
                              onPress={() => selectManyImages(setProofImages, false, 6 - proofDocuments.length)}
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
                              onPress={() => pickDocumentsOnly(setProofDocuments, setProofDocumentTypes, 6 - proofImages.length)}
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
                        onPress={() => selectManyImages(setProofImages, false, 6)}
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
                        onPress={() => pickDocumentsOnly(setProofDocuments, setProofDocumentTypes, 6)}
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
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Return Load
              </ThemedText>
              <Divider />
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
              Truck Requirements
            </ThemedText>
            <Divider />


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
                    clearPersonalValidationErrors();
                  }}>
                    <AntDesign name="close" color={icon} size={wp(4)} />
                  </TouchableOpacity>
                  <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }}>PERSONAL DETAILS</ThemedText>
                </View>

                <ThemedText>Full Name<ThemedText color="red">*</ThemedText></ThemedText>
                <Input
                  placeholder="Enter your full name"
                  value={personalName}
                  onChangeText={(text) => {
                    setPersonalName(text);
                    validatePersonalName(text);
                  }}
                  style={personalNameError ? { borderColor: 'red', borderWidth: 1 } : {}}
                />
                {personalNameError ? (
                  <ThemedText style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    {personalNameError}
                  </ThemedText>
                ) : null}

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
                        width: wp(45),
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

                <Button
                  onPress={handleUpdateGeneralDetails}
                  loading={isSubmittingPersonal}
                  disabled={isSubmittingPersonal || !isGeneralPersonalDetailsValid}
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
      <Modal visible={showPersonalDetailsModal && selectedPersonalType === 'professional'} statusBarTranslucent animationType="slide">
        <ScreenWrapper>
          <View style={{ margin: wp(4), marginTop: hp(6) }}>
            <View style={{ gap: wp(2) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
                <TouchableOpacity onPress={() => {
                  setShowPersonalDetailsModal(false);
                  setSelectedPersonalType(null);
                  clearPersonalValidationErrors();
                }}>
                  <AntDesign name="close" color={icon} size={wp(4)} />
                </TouchableOpacity>
                <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }}>PROFESSIONAL DETAILS</ThemedText>
              </View>

              <ScrollView>
                <HorizontalTickComponent
                  data={[
                    { topic: "Company Broker", value: "Company Broker" },
                    { topic: "Independent Broker", value: "Independent Broker" }
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
                        width: wp(45),
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

                {typeOfBrokerPersonal === "Company Broker" && (
                  <DocumentUploader
                    documents={selectedBrokerPersonalDocuments[2]}
                    title="Company Certificate"
                    subtitle="Upload registration certificate (PDF or Image)"
                    buttonTiitle="Company Registration"
                    onPickDocument={() => pickDocument(setSelectedBrokerPersonalDocuments, setBrokerPersonalFileType)}
                    disabled={!selectedBrokerPersonalDocuments[1]}
                    toastMessage="Upload address proof first"
                  />
                )}

                {typeOfBrokerPersonal === "Company Broker" && (
                  <DocumentUploader
                    documents={selectedBrokerPersonalDocuments[3]}
                    title="Company Letter"
                    subtitle="Upload signed letterhead or authorization (PDF or Image)"
                    buttonTiitle="Letter Head"
                    onPickDocument={() => pickDocument(setSelectedBrokerPersonalDocuments, setBrokerPersonalFileType)}
                    disabled={!selectedBrokerPersonalDocuments[2]}
                    toastMessage="Upload certificate first"
                  />
                )}

                <Button
                  onPress={handleUpdateProfessionalDetails}
                  loading={uploadingPersonalD}
                  disabled={uploadingPersonalD || !isProfessionalPersonalDetailsValid}
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

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={closeError}
        title={errorTitle}
        message={errorMessage}
        details={errorDetails}
        showDetails={showErrorDetails}
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
  userTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    marginVertical: wp(2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
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


