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

import { usePushNotifications, } from "@/Utilities/pushNotification";

import { uploadImage } from "@/db/operations";
import { pickDocument } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";

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
    const MissingDriverDetails = [
      !typeofLoad && "Enter Load to be transported",
      !origin && "Enter source Location",
      !destination && "Enter destination location",
      !rate && "Enter Load Rate ",
      !paymentTerms && "Enter Payment Terms",
      trucksNeeded.length === 0 && "Select at leat 1 truck reqiured",
    ].filter(Boolean);

    if (MissingDriverDetails.length > 0) {
      // setContractDErr(true);
      alertBox("Missing Load Details", MissingDriverDetails.join("\n"), [], "error");
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
    if (proofOfOrder.length > 0) { proofOfOerSub = await uploadImage(proofOfOrder[0], "CargoProof", setUploadImageUpdate, "Company Registration Certificate"); }
    const loadData = {
      userId: user?.uid,
      companyName: user?.organisation,
      contact: user?.phoneNumber || '',
      logo: user.photoURL,
      created_at: Date.now().toString(),
      isVerified: false,
      typeofLoad,
      destination: destination?.description,
      destinationFull: destination,

      origin: origin?.description,
      originFull: origin,
      rate,
      rateexplantion,
      currency: selectedCurrency.name,
      model: selectedModelType.name,
      paymentTerms,
      loadingDate,
      requirements,
      additionalInfo,
      alertMsg: alertMsg,
      fuelAvai: fuelAvai,
      returnLoad,
      returnRate,
      returnModel: selectedReturnModelType.name,
      returnCurrency: selectedReturnCurrency.name,
      returnTerms,
      trucksRequired: trucksNeeded,
      loadId: `Lo${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ad`,
      expoPushToken: expoPushToken || null,
      proofOfOrder: proofOfOerSub || null,
      proofOfOrderType: proofOfOrderFileType[0] || null,

      distance,
      duration,
      durationInTraffic,

      routePolyline,
      bounds,
    };

    try {
      // Ensure addDocument is not a React hook or using hooks internally.
      await addDocument("Cargo", loadData);

      await notifyTrucksByFilters({
        trucksNeeded,
        loadItem: {
          typeofLoad: typeofLoad,
          origin: origin!.description, // <-- Use the correct state variable
          destination: destination!.description, // <-- Use the correct state variable
          rate: rate,
          model: selectedModelType.name,
          currency: selectedCurrency.name,
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


      <Heading page='Create cLoad' rightComponent={
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: wp(3) }}>
          <View>
            <TouchableNativeFeedback onPress={() => console.log('add to draft')}>
              <ThemedText style={{ alignSelf: 'flex-start' }}>Add Draft</ThemedText>
            </TouchableNativeFeedback>
          </View>
        </View>
      } />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp(6), alignItems: 'center' }}>
        {['Load Details', 'Additional Info', 'Return Load', "Truck Req"].map((stepLabel, index) => (
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




      <View style={{ flex: 1 }}>
        {step === 0 && (
          <ScrollView keyboardShouldPersistTaps="always" >
            <View style={styles.viewMainDsp}>
              {/* Vertex AI Q&A */}
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#7B61FF" }}>
                Ask AI (Beta)
              </ThemedText>
              <Input
                placeholder="Ask a simple question about loads..."
                value={aiQuestion}
                onChangeText={setAiQuestion}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button title={aiLoading ? "Asking..." : "Ask AI"} onPress={askVertex} disabled={aiLoading} />
              </View>
              {aiAnswer ? (
                <View style={{ padding: 12, borderRadius: 8, backgroundColor: backgroundLight }}>
                  <ThemedText>{aiAnswer}</ThemedText>
                </View>
              ) : null}

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
        {step === 1 && (
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
                proofOfOrder[0] ? (
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
        {step === 2 && (
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
        {step === 3 && (<ScrollView>
          <View style={styles.viewMainDsp}>
            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', color: "#1E90FF" }}>
              Truck Requirements
            </ThemedText>
            <Divider />

            <ThemedText>GIT Required</ThemedText>
            <Input placeholder="GIT Value" />


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
});


