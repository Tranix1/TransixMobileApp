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

// New extracted components
import { UserTypeSelector } from '@/components/UserTypeSelector';
import { StepIndicator } from '@/components/StepIndicator';
import { LocationSelector } from '@/components/LocationSelector';
import { RateInput } from '@/components/RateInput';
import { LoadSummary } from '@/components/LoadSummary';

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
  const [returnLoad, setReturnLoad] = useState(defaultState.returnLoad);
  const [returnRate, setReturnRate] = useState(defaultState.returnRate);
  const [returnTerms, setReturnTerms] = useState(defaultState.returnTerms);

  const [selectedCurrency, setSelectedCurrency] = React.useState(defaultState.selectedCurrency);
  const [selectedReturnCurrency, setSelectedRetrunCurrency] = React.useState(defaultState.selectedRetrunCurrency);
  const [selectedModelType, setSelectedModelType] = React.useState(defaultState.selectedModelType);
  const [selectedReturnModelType, setSelectedReturnModelType] = React.useState(defaultState.selectedReturnModelType);

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
    await askVertexAI(aiQuestion, setAiLoading, setAiAnswer);
  };

  // AI-powered truck type detection from images
  const handleAnalyzeLoadImages = async () => {
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
    const defaultState = getDefaultFormState();
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
    setSelectedRetrunCurrency(defaultState.selectedRetrunCurrency);
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
  };


  const [proofOfOrder, setProofOfOrder] = useState<DocumentAsset[]>([]);
  const [proofOfOrderFileType, setProofOfOrderFileType] = React.useState<('pdf' | 'image')[]>([])

  const [imageUpdate, setUploadImageUpdate] = React.useState("")


  const handleSubmit = async () => {
    setIsSubmitting(true)

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
      trucksNeeded
    });

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
      returnLoad,
      returnRate,
      returnTerms,
      selectedCurrency,
      selectedModelType,
      selectedReturnCurrency,
      selectedReturnModelType,
      budget,
      budgetCurrency,
      selectedLoadingDate,
      loadingDate,
      loadImages,
      selectedAfricanTrucks,
      trucksNeeded,
      proofOfOerSub,
      proofOfOrderFileType,
      loadImagesUrls,
      distance,
      duration,
      durationInTraffic,
      routePolyline,
      bounds
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
      <UserTypeSelector
        userType={userType}
        setUserType={setUserType}
      />

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

              {userType !== 'general'&&<RateInput
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
              <RateInput
                rate={returnRate}
                setRate={setReturnRate}
                selectedCurrency={selectedReturnCurrency}
                setSelectedCurrency={setSelectedRetrunCurrency}
                selectedModelType={selectedReturnModelType}
                setSelectedModelType={setSelectedReturnModelType}
                rateExplanation={returnTerms}
                setRateExplanation={setReturnTerms}
                isReturnRate={true}
              />







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


