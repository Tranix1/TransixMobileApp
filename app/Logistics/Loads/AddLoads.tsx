import 'react-native-get-random-values';
import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TouchableNativeFeedback, Modal, ToastAndroid, Image, Pressable } from "react-native";
import { BlurView } from 'expo-blur';

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { addDocument, setDocuments } from "@/db/operations";
import { useAuth } from "@/context/AuthContext";
import { DropDownItem } from "@/components/DropDown";

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

import { usePushNotifications, } from "@/Utilities/pushNotification";

import { uploadImage } from "@/db/operations";
import { pickDocument, selectManyImages } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";
import { ImagePickerAsset } from "expo-image-picker";

import { notifyTrucksByFilters } from "@/Utilities/notifyTruckByFilters";
import { TruckNeededType } from "@/types/types";

import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SelectLocationProp } from '@/types/types';
import { GooglePlaceAutoCompleteComp } from '@/components/GooglePlaceAutoComplete';
import { LocationPicker } from '@/components/LocationPicker';
import { model } from '@/db/fireBaseConfig';
const AddLoadDB = () => {


  const { expoPushToken } = usePushNotifications();
  const icon = useThemeColor('icon')
  const accent = useThemeColor('accent')
  const background = useThemeColor('background')
  const backgroundLight = useThemeColor('backgroundLight')

  const [step, setStep] = useState(0);

  // User type selection
  const [userType, setUserType] = useState<'general' | 'professional' | null>(null);

  // Form state variables
  const [typeofLoad, setTypeofLoad] = useState("");
  const [dspFromLocation, setDspFromLocation] = useState(false);
  const [toLocation, setToLocation] = useState("");

  const [destination, setDestination] = useState<SelectLocationProp | null>(null);
  const [origin, setOrigin] = useState<SelectLocationProp | null>(null);

  const [locationPicKERdSP, setPickLocationOnMap] = useState(false);

  const [dspToLocation, setDspToLocation] = useState(false);
  const [rate, setRate] = useState("");
  const [rateexplantion, setRateExplanation] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loadingDate, setLoadingDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [fuelAvai, setFuelAvai] = useState("");
  const [returnLoad, setReturnLoad] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [returnTerms, setReturnTerms] = useState("");


  const [selectedCurrency, setSelectedCurrency] = React.useState({ id: 1, name: "USD" })
  const [selectedReturnCurrency, setSelectedRetrunCurrency] = React.useState({ id: selectedCurrency.id, name: selectedCurrency.name })

  const [selectedModelType, setSelectedModelType] = React.useState({ id: 1, name: "Solid" })

  const [selectedReturnModelType, setSelectedReturnModelType] = React.useState({ id: selectedModelType.id, name: selectedModelType.name })

  // Truck Form Data
  const [formDataTruck, setFormDataTruck] = useState<TruckFormData>({
    additionalInfo: "",
    driverPhone: "",
    maxloadCapacity: "",
    truckName: "",
    otherCargoArea: "",
    otherTankerType: ""
  });


  const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)
  const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(null)
  const [showCountries, setShowCountries] = useState(false);
  const [operationCountries, setOperationCountries] = useState<string[]>([]);
  const [trucksNeeded, setTrucksNeeded] = useState<TruckNeededType[]>([]);
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
          console.warn("No route found:", data.status);
        }
      } catch (err) {
        console.error("Directions API error:", err);
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
    if (!aiQuestion.trim()) return;
    try {
      setAiLoading(true);
      setAiAnswer("");
      console.log('[VertexAI] Sending prompt:', aiQuestion);
      const result: any = await (model as any).generateContent(aiQuestion);
      console.log('[VertexAI] Raw response:', result);
      const text = typeof result?.response?.text === 'function'
        ? result.response.text()
        : (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "");
      setAiAnswer(text || "(no response)");
    } catch (e: any) {
      console.error('[VertexAI] Error while generating content:', e);
      setAiAnswer(e?.message || 'Failed to get response');
    } finally {
      setAiLoading(false);
    }
  };

  // AI-powered truck type detection from images
  const analyzeLoadImages = async () => {
    if (loadImages.length === 0) {
      setAiAnalysisError("Please add images of your load first");
      return;
    }

    try {
      setAiLoading(true);
      setAiAnalysisError(null);

      // Convert images to base64 for AI analysis
      const imagePromises = loadImages.map(async (image) => {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      // Create AI prompt for truck type detection
      const prompt = `You are a logistics expert. Analyze these cargo/load images and determine the most suitable truck type for transportation.
      
      Consider these factors:
      - Size and dimensions of the cargo
      - Weight and density (estimate from appearance)
      - Fragility and handling requirements
      - Special transportation needs (refrigeration, hazardous materials, etc.)
      - Loading/unloading requirements
      
      Based on the images, recommend:
      1. Cargo Area Type (choose exactly one from: Flatbed, Container, Tanker, Refrigerated, Dry Van, Open Top, Side Curtain, Low Loader, Car Carrier, Other)
      2. Truck Type (choose exactly one from: Light Truck, Medium Truck, Heavy Truck, Articulated Truck, Rigid Truck)
      3. Capacity Range (choose exactly one from: 1-5 tons, 5-15 tons, 15-30 tons, 30-50 tons, 50+ tons)
      4. Tanker Type (only if cargo area is Tanker, choose from: Fuel Tanker, Water Tanker, Chemical Tanker, Food Grade Tanker, Other, or use null if not applicable)
      
      IMPORTANT: Respond ONLY with valid JSON in this exact format (no additional text, no markdown formatting):
      {
        "cargoArea": "recommended cargo area",
        "truckType": "recommended truck type", 
        "capacity": "recommended capacity range",
        "tankerType": "recommended tanker type or null",
        "reasoning": "brief explanation of the recommendation"
      }`;

      const result: any = await (model as any).generateContent([
        { text: prompt },
        ...base64Images.map(img => ({ inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] } }))
      ]);

      const responseText = typeof result?.response?.text === 'function'
        ? result.response.text()
        : (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "");

      // Parse AI response with error handling
      let aiResponse;
      try {
        // Clean the response text to extract JSON
        const cleanedResponse = responseText.replace(/```json\n?|```\n?/g, '').trim();
        aiResponse = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.log('Raw AI response:', responseText);
        
        // Try to extract JSON from the response using regex
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            aiResponse = JSON.parse(jsonMatch[0]);
          } catch (regexParseError) {
            throw new Error('AI response is not in valid JSON format. Please try again with clearer images.');
          }
        } else {
          throw new Error('AI response does not contain valid JSON. Please try again with clearer images.');
        }
      }

      // Map AI recommendations to app data structures
      const cargoAreaMap: { [key: string]: TruckTypeProps } = {
        "Flatbed": { id: 1, name: "Flatbed", image: undefined, description: "Open flat platform for general cargo" },
        "Container": { id: 2, name: "Container", image: undefined, description: "Standard shipping container transport" },
        "Tanker": { id: 3, name: "Tanker", image: undefined, description: "Liquid transport vehicle" },
        "Refrigerated": { id: 4, name: "Refrigerated", image: undefined, description: "Temperature-controlled transport" },
        "Dry Van": { id: 5, name: "Dry Van", image: undefined, description: "Enclosed dry cargo transport" },
        "Open Top": { id: 6, name: "Open Top", image: undefined, description: "Open-top container transport" },
        "Side Curtain": { id: 7, name: "Side Curtain", image: undefined, description: "Side curtain trailer" },
        "Low Loader": { id: 8, name: "Low Loader", image: undefined, description: "Low platform for heavy equipment" },
        "Car Carrier": { id: 9, name: "Car Carrier", image: undefined, description: "Multi-level vehicle transport" },
        "Other": { id: 10, name: "Other", image: undefined, description: "Specialized transport" }
      };

      const truckTypeMap: { [key: string]: { id: number, name: string } } = {
        "Light Truck": { id: 1, name: "Light Truck" },
        "Medium Truck": { id: 2, name: "Medium Truck" },
        "Heavy Truck": { id: 3, name: "Heavy Truck" },
        "Articulated Truck": { id: 4, name: "Articulated Truck" },
        "Rigid Truck": { id: 5, name: "Rigid Truck" }
      };

      const capacityMap: { [key: string]: { id: number, name: string } } = {
        "1-5 tons": { id: 1, name: "1-5 tons" },
        "5-15 tons": { id: 2, name: "5-15 tons" },
        "15-30 tons": { id: 3, name: "15-30 tons" },
        "30-50 tons": { id: 4, name: "30-50 tons" },
        "50+ tons": { id: 5, name: "50+ tons" }
      };

      const tankerTypeMap: { [key: string]: { id: number, name: string } } = {
        "Fuel Tanker": { id: 1, name: "Fuel Tanker" },
        "Water Tanker": { id: 2, name: "Water Tanker" },
        "Chemical Tanker": { id: 3, name: "Chemical Tanker" },
        "Food Grade Tanker": { id: 4, name: "Food Grade Tanker" },
        "Other": { id: 5, name: "Other" }
      };

      // Validate AI response structure
      if (!aiResponse.cargoArea || !aiResponse.truckType || !aiResponse.capacity) {
        throw new Error('AI response is missing required fields. Please try again.');
      }

      // Set detected values with fallbacks
      const detectedCargoArea = cargoAreaMap[aiResponse.cargoArea] || cargoAreaMap["Other"];
      const detectedTruckType = truckTypeMap[aiResponse.truckType] || truckTypeMap["Heavy Truck"];
      const detectedCapacity = capacityMap[aiResponse.capacity] || capacityMap["15-30 tons"];
      
      setAiDetectedCargoArea(detectedCargoArea);
      setAiDetectedTruckType(detectedTruckType);
      setAiDetectedCapacity(detectedCapacity);

      // Handle tanker type if applicable
      if (aiResponse.tankerType && aiResponse.tankerType !== "null" && aiResponse.tankerType !== null) {
        const detectedTankerType = tankerTypeMap[aiResponse.tankerType] || tankerTypeMap["Other"];
        setAiDetectedTankerType(detectedTankerType);
      } else {
        setAiDetectedTankerType(null);
      }

      setAiAnalysisComplete(true);
      ToastAndroid.show('AI analysis complete! Review the recommendations below.', ToastAndroid.SHORT);
      
      // Store AI reasoning for display
      setAiAnswer(aiResponse.reasoning || 'AI analysis completed successfully.');
      
      // Log successful analysis for debugging
      console.log('AI Analysis Results:', {
        cargoArea: detectedCargoArea.name,
        truckType: detectedTruckType.name,
        capacity: detectedCapacity.name,
        tankerType: aiResponse.tankerType,
        reasoning: aiResponse.reasoning
      });

    } catch (error: any) {
      console.error('AI analysis error:', error);
      setAiAnalysisError(error.message || 'Failed to analyze images');
    } finally {
      setAiLoading(false);
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

      setTrucksNeeded(prev => [...prev, newTruck]);

      // Reset all selections to defaults
      setSelectedCargoArea(null);
      setSelectedTruckType(null);
      setSelectedTankerType(null);
      setSelectedTruckCapacity(null);
      setOperationCountries([]);
    } else {

      ToastAndroid.show('Select All Truck Details', ToastAndroid.SHORT)
    }

  }
  function removeTruck(indexToRemove: number) {
    setTrucksNeeded(prev => prev.filter((_, index) => index !== indexToRemove));
  }




  const { user, alertBox } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);





  // Function to clear all form fields
  const clearFormFields = () => {
    setTypeofLoad("");
    setToLocation("");
    setRate("");
    setRateExplanation("");
    setPaymentTerms("");
    setRequirements("");
    setLoadingDate("");
    setAdditionalInfo("");
    setAlertMsg("");
    setFuelAvai("");
    setReturnLoad("");
    setReturnRate("");
    setReturnTerms("");
    setSelectedCurrency({ id: 1, name: "USD" });
    setSelectedRetrunCurrency({ id: 1, name: "USD" });
    setSelectedModelType({ id: 1, name: "Solid" });
    setSelectedReturnModelType({ id: 1, name: "Solid" });
    setFormDataTruck({
      additionalInfo: "",
      driverPhone: "",
      maxloadCapacity: "",
      truckName: "",
      otherCargoArea: "",
      otherTankerType: ""
    });
    setSelectedCargoArea(null);
    setSelectedTruckType(null);
    setSelectedTankerType(null);
    setSelectedTruckCapacity(null);
    setShowCountries(false);
    setOperationCountries([]);
    setTrucksNeeded([]); // Clear the array of added trucks
    setStep(0); // Reset the step if you have a multi-step form
    setUploadImageUpdate("")
  };


  const [proofOfOrder, setProofOfOrder] = useState<DocumentAsset[]>([]);
  const [proofOfOrderFileType, setProofOfOrderFileType] = React.useState<('pdf' | 'image')[]>([])

  const [imageUpdate, setUploadImageUpdate] = React.useState("")


  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Different validation based on user type
    const MissingDriverDetails = userType === 'general' ? [
      !typeofLoad && "Enter Load to be transported",
      !origin && "Enter source Location",
      !destination && "Enter destination location",
      !selectedLoadingDate && "Select loading date",
      loadImages.length === 0 && "Upload images of your load",
      selectedAfricanTrucks.length === 0 && "Select at least 1 truck type",
    ] : [
      !typeofLoad && "Enter Load to be transported",
      !origin && "Enter source Location",
      !destination && "Enter destination location",
      !rate && "Enter Load Rate ",
      !paymentTerms && "Enter Payment Terms",
      trucksNeeded.length === 0 && "Select at least 1 truck required",
    ];

    const filteredMissing = MissingDriverDetails.filter(Boolean);

    if (filteredMissing.length > 0) {
      alertBox("Missing Load Details", filteredMissing.join("\n"), [], "error");
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

    let proofOfOerSub
    let loadImagesUrls = []

    // Handle different proof types based on user type
    if (userType === 'general') {
      // Upload all load images for general users
      for (let i = 0; i < loadImages.length; i++) {
        const imageUrl = await uploadImage(loadImages[i], "LoadImages", setUploadImageUpdate, `Load Image ${i + 1}`);
        if (imageUrl) loadImagesUrls.push(imageUrl);
      }
    } else {
      // Upload proof of order for professional users
      if (proofOfOrder.length > 0) {
        proofOfOerSub = await uploadImage(proofOfOrder[0], "CargoProof", setUploadImageUpdate, "Company Registration Certificate");
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

    const loadData = {
      userId: user?.uid,
      companyName: user?.organisation,
      contact: user?.phoneNumber || '',
      logo: user.photoURL,
      created_at: Date.now().toString(),
      isVerified: false,
      userType: userType,
      typeofLoad,
      destination: destination?.description,
      destinationFull: destination,
      origin: origin?.description,
      originFull: origin,

      // Professional user fields
      rate: (userType as string) === 'professional' ? (rate || '') : (budget || ''),
      rateexplantion: (userType as string) === 'professional' ? (rateexplantion || '') : '',
      currency: (userType as string) === 'professional' ? (selectedCurrency?.name || 'USD') : (budgetCurrency?.name || 'USD'),
      model: (userType as string) === 'professional' ? (selectedModelType?.name || 'Solid') : 'Solid',
      paymentTerms: (userType as string) === 'professional' ? (paymentTerms || 'To be discussed') : 'To be discussed',

      // General user fields
      budget: userType === 'general' ? (budget || '') : '',
      budgetCurrency: userType === 'general' ? (budgetCurrency?.name || 'USD') : '',
      loadingDate: userType === 'general' ? (selectedLoadingDate?.name || '') : (loadingDate || ''),

      // Common fields
      requirements: (userType as string) === 'professional' ? (requirements || 'Standard requirements') : 'General cargo transport',
      additionalInfo: (userType as string) === 'professional' ? (additionalInfo || '') : 'Load posted by general user with AI assistance',
      alertMsg: (userType as string) === 'professional' ? (alertMsg || '') : '',
      fuelAvai: (userType as string) === 'professional' ? (fuelAvai || '') : '',
      returnLoad: (userType as string) === 'professional' ? (returnLoad || '') : '',
      returnRate: (userType as string) === 'professional' ? (returnRate || '') : '',
      returnModel: (userType as string) === 'professional' ? (selectedReturnModelType?.name || '') : '',
      returnCurrency: (userType as string) === 'professional' ? (selectedReturnCurrency?.name || '') : '',
      returnTerms: (userType as string) === 'professional' ? (returnTerms || '') : '',
      trucksRequired: userType === 'general' ? (selectedAfricanTrucks.length > 0 ? selectedAfricanTrucks.map(truck => ({
        cargoArea: truck,
        truckType: { id: 2, name: "Medium Truck" },
        tankerType: null,
        capacity: { id: 2, name: "5-15 tons" },
        operationCountries: [origin?.country || 'South Africa', destination?.country || 'South Africa'].filter((v, i, a) => a.indexOf(v) === i),
      })) : []) : trucksNeeded,
      loadId: `Lo${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ad`,
      expoPushToken: expoPushToken || null,

      // Different proof handling
      proofOfOrder: (userType as string) === 'professional' ? (proofOfOerSub || null) : null,
      proofOfOrderType: (userType as string) === 'professional' ? (proofOfOrderFileType[0] || null) : null,
      loadImages: userType === 'general' ? (loadImagesUrls || []) : [],

      distance: distance || 0,
      duration: duration || 0,
      durationInTraffic: durationInTraffic || 0,
      routePolyline: routePolyline || '',
      bounds: bounds || null,
    };

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


    } catch (error) {
      console.error("Error submitting load:", error);
      alert("Failed to submit load. Please try again.");
    } finally {

      setIsSubmitting(false)
    }
  };



  return (
    <ScreenWrapper fh={false}>


      <Heading page='Create Load' rightComponent={
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: wp(3) }}>
          <View>
            <TouchableNativeFeedback onPress={() => console.log('add to draft')}>
              <ThemedText style={{ alignSelf: 'flex-start' }}>Add Draft</ThemedText>
            </TouchableNativeFeedback>
          </View>
        </View>
      } />

      {/* User Type Selection */}
      {!userType && (
        <View style={{ padding: wp(4), backgroundColor: backgroundLight, margin: wp(4), borderRadius: 12 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: wp(4) }}>
            How would you like to add your load?
          </ThemedText>

          <TouchableOpacity
            style={[styles.userTypeButton, { backgroundColor: background }]}
            onPress={() => setUserType('general')}
          >
            <Ionicons name="person-outline" size={24} color={accent} />
            <View style={{ marginLeft: wp(3) }}>
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>General User</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                I don't know much about trucks - use AI to help me
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.userTypeButton, { backgroundColor: background }]}
            onPress={() => setUserType('professional')}
          >
            <Ionicons name="business-outline" size={24} color={accent} />
            <View style={{ marginLeft: wp(3) }}>
              <ThemedText style={{ fontSize: 16, fontWeight: 'bold' }}>Professional</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                I'm a load broker/consignee - I know the details
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {userType && (
        <View style={{ padding: wp(4), backgroundColor: backgroundLight, margin: wp(4), borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={userType === 'general' ? "person" : "business"}
              size={20}
              color={accent}
            />
            <ThemedText style={{ marginLeft: wp(2), fontWeight: 'bold' }}>
              {userType === 'general' ? 'General User' : 'Professional User'}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => setUserType(null)}>
            <Ionicons name="close-circle" size={20} color={icon} />
          </TouchableOpacity>
        </View>
      )}

      {userType && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp(6), alignItems: 'center' }}>
          {userType === 'general' 
            ? ['Load Details', 'Images & AI', 'Truck Selection', 'Review & Submit'].map((stepLabel, index) => (
            <View key={index} style={{ alignItems: 'center', flexDirection: 'row', flex: index > 0 ? 1 : 0 }}>
              {index > 0 && (
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: wp(40),
                    borderColor: step >= index ? '#0f9d58' : '#ccc',
                    marginHorizontal: wp(2),
                    flex: 1,
                    marginBottom: wp(5),
                  }}
                />
              )}
              <TouchableOpacity onPress={() => setStep(index)} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: wp(8),
                    height: wp(8),
                    borderRadius: wp(4),
                    backgroundColor: step >= index ? accent : '#ccc',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: wp(1),
                  }}
                >
                  {step > index ? (
                    <Ionicons name="checkmark" size={wp(4)} color={'white'} />
                  ) : (
                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{index}</ThemedText>
                  )}
                </View>
                <ThemedText
                  type="tiny"
                  style={{
                    maxWidth: wp(12),
                    textAlign: 'center',
                    color: step >= index ? '#0f9d58' : '#ccc',
                    fontWeight: step >= index ? 'bold' : 'normal',
                  }}
                >
                  {stepLabel}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))
            : ['Load Details', 'Additional Info', 'Return Load', "Truck Req"].map((stepLabel, index) => (
            <View key={index} style={{ alignItems: 'center', flexDirection: 'row', flex: index > 0 ? 1 : 0 }}>
              {index > 0 && (
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: wp(40),
                    borderColor: step >= index ? '#0f9d58' : '#ccc',
                    marginHorizontal: wp(2),
                    flex: 1,
                    marginBottom: wp(5),
                  }}
                />
              )}
              <TouchableOpacity onPress={() => setStep(index)} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: wp(8),
                    height: wp(8),
                    borderRadius: wp(4),
                    backgroundColor: step >= index ? accent : '#ccc',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: wp(1),
                  }}
                >
                  {step > index ? (
                    <Ionicons name="checkmark" size={wp(4)} color={'white'} />
                  ) : (
                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{index}</ThemedText>
                  )}
                </View>
                <ThemedText
                  type="tiny"
                  style={{
                    maxWidth: wp(12),
                    textAlign: 'center',
                    color: step >= index ? '#0f9d58' : '#ccc',
                    fontWeight: step >= index ? 'bold' : 'normal',
                  }}
                >
                  {stepLabel}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
              <ThemedText>
                Origin Location<ThemedText color="red">*</ThemedText>
              </ThemedText>


              {distance && duration && (
                <View style={{ padding: 16, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, backgroundColor: backgroundLight }}>
                  <ThemedText style={styles.infoText}>Distance: {distance}</ThemedText>
                  <ThemedText style={styles.infoText}>Duration: {duration}</ThemedText>
                  {durationInTraffic && (
                    <ThemedText style={styles.infoText}>Duration in Traffic: {durationInTraffic}</ThemedText>
                  )}
                </View>
              )}


              <TouchableOpacity
                onPress={() => setDspFromLocation(true)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: icon,       // use your color variable
                  borderRadius: 8,
                  backgroundColor: backgroundLight,  // optional
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: wp(5),
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 16,
                    color: origin ? icon : '#888', // grey placeholder if no destination
                  }}
                >
                  {origin ? origin?.description : "Select Origin"}
                </ThemedText>
              </TouchableOpacity>





              <GooglePlaceAutoCompleteComp dspRoute={dspFromLocation} setDspRoute={setDspFromLocation} setRoute={setOrigin} topic='Load Origin' setPickLocationOnMap={setPickLocationOnMap} />

              <TouchableOpacity
                onPress={() => setDspToLocation(true)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: icon,       // use your color variable
                  borderRadius: 8,
                  backgroundColor: backgroundLight,  // optional
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: wp(5),
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 16,
                    color: destination ? icon : '#888', // grey placeholder if no destination
                  }}
                >
                  {destination ? destination?.description : "Select Destination"}
                </ThemedText>
              </TouchableOpacity>


              <GooglePlaceAutoCompleteComp dspRoute={dspToLocation} setDspRoute={setDspToLocation} setRoute={setDestination} topic="Load Destination" setPickLocationOnMap={setPickLocationOnMap} />


              {locationPicKERdSP && (
                <LocationPicker
                  pickOriginLocation={origin}
                  setPickOriginLocation={setOrigin}

                  pickDestinationLoc={destination}
                  setPickDestinationLoc={setDestination}
                  setShowMap={setPickLocationOnMap}

                  dspShowMap={locationPicKERdSP}
                />)}


              <ThemedText>
                To Location<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={toLocation}
                onChangeText={setToLocation}
              />

              <ThemedText>
                Rate <ThemedText color="red">*</ThemedText>
              </ThemedText>



              <View style={styles.row}>
                <View style={{ width: wp(27.5), marginRight: wp(2) }}>
                  <ThemedText type="defaultSemiBold">Currency</ThemedText>
                  <DropDownItem
                    allData={[
                      { id: 1, name: "USD" },
                      { id: 2, name: "RSA" },
                      { id: 3, name: "ZWG" }
                    ]}
                    selectedItem={selectedCurrency}
                    setSelectedItem={setSelectedCurrency}
                    placeholder=""
                  />
                </View>
                <View style={{ flex: 1, }}>
                  <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>Rate</ThemedText>

                  <Input
                    value={rate}
                    onChangeText={setRate}
                    style={{ height: 45.5 }}
                  />
                </View>
                <View style={{ width: wp(28), marginLeft: wp(2) }}>
                  <ThemedText type="defaultSemiBold">Model</ThemedText>
                  <DropDownItem
                    allData={[
                      { id: 1, name: "Solid" },
                      { id: 2, name: "/ Tonne" },
                      { id: 3, name: "/ KM" }
                    ]}
                    selectedItem={selectedModelType}
                    setSelectedItem={setSelectedModelType}
                    placeholder=""
                  />
                </View>
              </View>
              <ThemedText>
                Explain rate<ThemedText style={{ fontStyle: "italic" }}> like link and triaxle rate</ThemedText>
              </ThemedText>

              <Input
                placeholder="explain rate if neccesary"
                value={rateexplantion}
                onChangeText={setRateExplanation}
                style={{ height: 45.5 }}
              />



              <ThemedText>
                Payment Terms<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={paymentTerms}
                onChangeText={setPaymentTerms}
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
                onAnalyzeImages={analyzeLoadImages}
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
                    analyzeLoadImages();
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
                (userType === 'general' ? loadImages.length > 0 : proofOfOrder[0]) ? (
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
                      // Show proof of order for professional users
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
                        {proofOfOrder[0].name.toLowerCase().endsWith('.pdf') ? (
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
                              {proofOfOrder[0].name}
                            </ThemedText>
                          </>
                        ) : (
                          <>
                            <Image
                              source={{ uri: proofOfOrder[0].uri }}
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
                              {proofOfOrder[0].name}
                            </ThemedText>
                          </>
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
                      Upload an image or PDF proving this load is real and needs a truck.
                    </ThemedText>


                    <TouchableOpacity
                      onPress={() => pickDocument(setProofOfOrder, setProofOfOrderFileType)}
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
                        Upload Proof of Order
                      </ThemedText>
                    </TouchableOpacity>
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
                value={returnLoad}
                onChangeText={setReturnLoad}
              />
              <ThemedText>
                Rate<ThemedText color="red">*</ThemedText>
              </ThemedText>


              <View style={styles.row}>
                <View style={{ width: wp(27.5), marginRight: wp(2) }}>
                  <ThemedText type="defaultSemiBold">Currency</ThemedText>
                  <DropDownItem
                    allData={[
                      { id: 1, name: "USD" },
                      { id: 2, name: "RSA" },
                      { id: 3, name: "ZWG" }
                    ]}
                    selectedItem={selectedReturnCurrency}
                    setSelectedItem={setSelectedRetrunCurrency}
                    placeholder=""
                  />
                </View>
                <View style={{ flex: 1, }}>
                  <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>Return Rate</ThemedText>

                  <Input
                    value={returnRate}
                    onChangeText={setReturnRate}
                    style={{ height: 45 }}
                  />
                </View>
                <View style={{ width: wp(28), marginLeft: wp(2) }}>
                  <ThemedText type="defaultSemiBold">Model</ThemedText>
                  <DropDownItem
                    allData={[
                      { id: 1, name: "Solid" },
                      { id: 2, name: "/ Tonne" },
                      { id: 3, name: "/ KM" }
                    ]}
                    selectedItem={selectedReturnModelType}
                    setSelectedItem={setSelectedReturnModelType}
                    placeholder=""
                  />
                </View>
              </View>







              <ThemedText>
                Return Terms<ThemedText color="red">*</ThemedText>
              </ThemedText>
              <Input
                value={returnTerms}
                onChangeText={setReturnTerms}
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
          <ScrollView>
            <View style={styles.viewMainDsp}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
                Review & Submit
              </ThemedText>
              <Divider />

              <View style={{ backgroundColor: backgroundLight, padding: wp(4), borderRadius: 12, marginBottom: wp(3) }}>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: wp(2) }}>Load Summary</ThemedText>
                
                <View style={{ marginBottom: wp(2) }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>Load Type:</ThemedText>
                  <ThemedText>{typeofLoad}</ThemedText>
                </View>

                <View style={{ marginBottom: wp(2) }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>Route:</ThemedText>
                  <ThemedText>{origin?.description} → {destination?.description}</ThemedText>
                </View>

                <View style={{ marginBottom: wp(2) }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>Loading Date:</ThemedText>
                  <ThemedText>{selectedLoadingDate?.name}</ThemedText>
                </View>

                {budget && (
                  <View style={{ marginBottom: wp(2) }}>
                    <ThemedText style={{ fontWeight: 'bold' }}>Budget:</ThemedText>
                    <ThemedText>{budget} {budgetCurrency.name}</ThemedText>
                  </View>
                )}

                <View style={{ marginBottom: wp(2) }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>Images:</ThemedText>
                  <ThemedText>{loadImages.length} image(s) uploaded</ThemedText>
                </View>

                <View style={{ marginBottom: wp(2) }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>Selected Truck Types:</ThemedText>
                  <ThemedText>{selectedAfricanTrucks.map(t => t.name).join(', ')}</ThemedText>
                </View>
              </View>

              <Button 
                onPress={handleSubmit} 
                title={isSubmitting ? "Submitting..." : "Submit Load Request"} 
                disabled={isSubmitting} 
                loading={isSubmitting} 
                colors={{ text: '#0f9d58', bg: '#0f9d5824' }} 
                style={{ borderWidth: 1, borderColor: accent }} 
              />
            </View>
          </ScrollView>
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
});


