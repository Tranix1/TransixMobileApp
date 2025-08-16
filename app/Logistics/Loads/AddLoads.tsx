import 'react-native-get-random-values';
import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TouchableNativeFeedback, Modal, ToastAndroid,Image } from "react-native";
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

import { usePushNotifications,} from "@/Utilities/pushNotification";

import { uploadImage } from "@/db/operations";
import { pickDocument } from "@/Utilities/utils";
import { DocumentAsset } from "@/types/types";

import { notifyTrucksByFilters } from "@/Utilities/notifyTruckByFilters";
import { TruckNeededType } from "@/types/types";

import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


const AddLoadDB = () => {
const googleMapsApiKey = Constants.expoConfig?.extra?.Development_Key_Google_Cloud;
console.log("Google Maps API Key:", googleMapsApiKey);







    const { expoPushToken } = usePushNotifications();
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')

    const [step, setStep] = useState(0);

    // Form state variables
    const [typeofLoad, setTypeofLoad] = useState("");
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
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


const address = "Harare";
fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${fromLocation}&destination=${toLocation}&key=AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4`)
  .then(res => res.json())
  .then(data => {
    console.log("heyy u good", data);

    // Check if the request was successful and a route was found
    if (data.status === "OK" && data.routes.length > 0) {
      const distance = data.routes[0].legs[0].distance.text;
      const duration = data.routes[0].legs[0].duration.text;
      
      console.log(`Distance: ${distance}`);
      console.log(`Duration: ${duration}`);
    } else {
      console.log("No route found or API error.");
    }
  })
  .catch(error => console.error("API call failed:", error));

    function pushTruck() {
        const newTruck: TruckNeededType = {
            cargoArea: selectedCargoArea,
            truckType: selectedTruckType,
            tankerType: selectedTankerType,
            capacity: selectedTruckCapacity,
            operationCountries: operationCountries,
        };


          if(selectedCargoArea && selectedTruckType && selectedTruckCapacity && operationCountries.length > 0 ){

            setTrucksNeeded(prev => [...prev, newTruck]);   
       
        // Reset all selections to defaults
        setSelectedCargoArea(null);
        setSelectedTruckType(null);
        setSelectedTankerType(null);
        setSelectedTruckCapacity(null);
        setOperationCountries([]);
        }else{

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
        setFromLocation("");
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


    const [proofOfOrder , setProofOfOrder]=useState<DocumentAsset[]>([]);
        const [proofOfOrderFileType , setProofOfOrderFileType ] =React.useState<('pdf' | 'image')[]>([])

    const [imageUpdate, setUploadImageUpdate] = React.useState("")






    const handleSubmit = async () => {
            setIsSubmitting(true)
        const MissingDriverDetails = [
            !typeofLoad && "Enter Load to be transported",
            !fromLocation && "Enter source Location",
            !toLocation && "Enter destination location",
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
        if(proofOfOrder.length >0){  proofOfOerSub = await uploadImage(proofOfOrder[0], "TruckBroker", setUploadImageUpdate, "Company Registration Certificate");}
        const loadData = {
            userId: user?.uid,
            companyName: user?.organisation,
            contact: user?.phoneNumber || '',
            logo: user.photoURL,
            created_at: Date.now().toString() ,
            isVerified: false,
            typeofLoad,
            destination: toLocation,
            origin: fromLocation,
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
            expoPushToken :expoPushToken ||null ,
            proofOfOrder : proofOfOerSub ,
            proofOfOrderType :  proofOfOrderFileType[0] ||null ,
        };

        try {
            // Ensure addDocument is not a React hook or using hooks internally.
            await addDocument("Cargo", loadData);

           await notifyTrucksByFilters({
  trucksNeeded,
loadItem: {
    typeofLoad: typeofLoad,
    origin: fromLocation, // <-- Use the correct state variable
    destination: toLocation, // <-- Use the correct state variable
    rate: rate,
    model: selectedModelType.name,
    currency: selectedCurrency.name,
  },
});


ToastAndroid.show('Trucks notified and load added successfully.', ToastAndroid.SHORT);


        } catch (error) {
            console.error("Error submitting load:", error);
            alert("Failed to submit load. Please try again.");
        }finally{

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
                    <ScrollView>
                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold',color:"#1E90FF" }}>
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


                            {/* <ThemedText>
                                From Location<ThemedText color="red">*</ThemedText>
                            </ThemedText>
                            <Input
                                value={fromLocation}
                                onChangeText={setFromLocation}
                            /> */}





  <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: background }}>
      <ThemedText>
        From Location<ThemedText color="red">*</ThemedText>
      </ThemedText>
      <GooglePlacesAutocomplete
        placeholder='Search'
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log(data, details);
          setFromLocation(data.description);
        }}
        query={{
          key: "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4",
          language: 'en',
        }}
        styles={{
          textInputContainer: {
            width: '100%',
          },
          textInput: {
            height: 44,
            borderRadius: 5,
            paddingVertical: 5,
            paddingHorizontal: 10,
            fontSize: 15,
            borderWidth: 1,
            borderColor: icon,
          },
          listView: {
            position: 'absolute',
            top: 45, // Adjust this to control the dropdown's vertical position
            left: 0,
            right: 0,
            backgroundColor: 'white',
            zIndex: 1000,
          },
          row: {
            padding: 13,
            backgroundColor: 'white',
          },
          separator: {
            height: 0.5,
            backgroundColor: backgroundLight,
          },
          description: {
            fontWeight: 'bold',
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
      />
    </View>




<View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: background }}>
      <ThemedText>
        From Location<ThemedText color="red">*</ThemedText>
      </ThemedText>
      <GooglePlacesAutocomplete
        placeholder='Search'
        fetchDetails={true}
        onPress={(data, details = null) => {
          console.log(data, details);
          setToLocation(data.description);
        }}
        query={{
          key: "AIzaSyDt9eSrTVt24TVG0nxR4b6VY_eGZyHD4M4",
          language: 'en',
        }}
        styles={{
          textInputContainer: {
            width: '100%',
          },
          textInput: {
            height: 44,
            borderRadius: 5,
            paddingVertical: 5,
            paddingHorizontal: 10,
            fontSize: 15,
            borderWidth: 1,
            borderColor: icon,
          },
          listView: {
            position: 'absolute',
            top: 45, // Adjust this to control the dropdown's vertical position
            left: 0,
            right: 0,
            backgroundColor: 'white',
            zIndex: 1000,
          },
          row: {
            padding: 13,
            backgroundColor: 'white',
          },
          separator: {
            height: 0.5,
            backgroundColor: backgroundLight,
          },
          description: {
            fontWeight: 'bold',
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
      />
    </View>



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
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold',color:"#1E90FF" }}>
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
    
<ThemedText style={{ fontSize: 13.6, fontWeight: 'bold',textAlign:"center",color:"#1E90FF" , }}>
  Upload: Proof of Load Request
</ThemedText>
<ThemedText type="tiny">
  Upload an image or PDF proving this load is real and needs a truck.
</ThemedText>


      <TouchableOpacity
        onPress={() => pickDocument(setProofOfOrder,setProofOfOrderFileType)}
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
                        <View style={{ paddingVertical: wp(3),gap: wp(2),borderRadius: 8,shadowColor: "#6a0c0c",shadowOffset: { width: 1, height: 2 },shadowOpacity: 0.7,shadowRadius: 5,overflow: "hidden",}}>
                            <Button onPress={() => setStep(0)} title="Back" />
                            <Button onPress={() => setStep(2)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                )}
                {step === 2 && (
                    <ScrollView>
                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' ,color:"#1E90FF"}}>
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
                        <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold',color:"#1E90FF" }}>
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
                            <Button onPress={handleSubmit} title={isSubmitting ? "Submiting..." : "Submit"} disabled={isSubmitting}loading={isSubmitting} colors={{  text: '#0f9d58', bg: '#0f9d5824'  }} style={{borderWidth:1 , borderColor:accent}}     />
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
});
