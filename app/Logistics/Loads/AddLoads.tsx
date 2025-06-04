import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TouchableNativeFeedback } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { router } from "expo-router";
import { addDocument } from "@/db/operations";
import { useAuth } from "@/context/AuthContext";
import { DropDownItem } from "@/components/DropDown";

import { hp, wp } from "@/constants/common";

import { AddTruckDetails } from "@/components/AddTruckDetails";
import { TruckFormData } from "@/types/types";
import { TruckTypeProps } from "@/types/types";


const AddLoadDB = () => {
    const [step, setStep] = useState(0);

    // Form state variables
    const [typeofLoad, setTypeofLoad] = useState("");
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
    const [distance, setDistance] = useState("");
    const [ratePerTonne, setRatePerTonne] = useState("");
    const [paymentTerms, setPaymentTerms] = useState("");
    const [requirements, setRequirements] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [alertMsg, setAlertMsg] = useState("");
    const [fuelAvai, setFuelAvai] = useState("");
    const [returnLoad, setReturnLoad] = useState("");
    const [returnRate, setReturnRate] = useState("");
    const [returnTerms, setReturnTerms] = useState("");

    const [dspAlertMsg, setDspAlertMsg] = useState(false);
    const [dspFuelAvai, setDspFuelAvai] = useState(false);
    const [dspReturnLoad, setDspReturnLoad] = useState(false);

    const [selectedRateType, setSelectedRateType] = React.useState({ id: 1, name: "Solid" })

    // Truck Form Data
    const [formDataTruck, setFormDataTruck] = useState<TruckFormData>({
        additionalInfo: "",
        driverPhone: "",
        maxloadCapacity: "",
        truckName: "",
        otherTruckSuspension: "",
        otherCargoArea: "",
        otherTruckConfig: "",
        otherTankerType: ""
    });

    const toggleDspAlertMsg = () => setDspAlertMsg((prev) => !prev);
    const toggleDspFuelAvai = () => setDspFuelAvai((prev) => !prev);
    const toggleDspReturnLoad = () => setDspReturnLoad((prev) => !prev);

    const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)
    const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(null)
    const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(null)
    const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(null)
    const [showCountries, setShowCountries] = useState(false);
    const [operationCountries, setOperationCountries] = useState<string[]>([]);
    const [selectedTrailerConfig, setSelectedTrailerConfig] = useState<{ id: number, name: string } | null>(null)
    const [selectedTruckSuspension, setSelectedTruckSuspension] = useState<{ id: number, name: string } | null>(null)


    const { user,alertBox } = useAuth();
    const handleSubmit = async () => {
             const MissingDriverDetails= [
          !typeofLoad && "",
          !fromLocation && "",
          !toLocation && "",
          !ratePerTonne && "",
          !paymentTerms && "",
        ]

   if (MissingDriverDetails.length > 0) {
            // setContractDErr(true);
            alertBox("Missing Load Details", MissingDriverDetails.join("\n"), [], "error");
            return;
        }

      


        if (!user) {
            alert("Please Login first");
            return;
        }
        if (!user.organisation) {
            alert("Please edit your account and add Organisation details first, eg:Organisation Name!");
            return;
        }
        const loadData = {
            distance: distance,
            userId: user?.uid,
            companyName: user?.organisation,
            contact: user?.phoneNumber || '',
            created_at: Date.now().toString(),
            isVerified: false,
            typeofLoad,
            destination: toLocation,
            ratePerTonne,
            paymentTerms,
            requirements,
            additionalInfo,
            alertMsg: alertMsg,
            fuelAvai: fuelAvai,
            returnLoad,
            returnRate,
            returnTerms,
            currency: "USD",
            activeLoading: false,
            location: fromLocation,
            roundTrip: false,
            deletionTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
        };

        try {
            // Ensure addDocument is not a React hook or using hooks internally.
            // If it is, refactor addDocument to be a plain async function.
            await addDocument("Loads", loadData);

            console.log("Submitting load data:", loadData);
            alert("Load submitted successfully!");
            router.back()
        } catch (error) {
            console.error("Error submitting load:", error);
            alert("Failed to submit load. Please try again.");
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
                                    backgroundColor: step >= index ? '#0f9d5843' : '#ccc',
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
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
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
                            <ThemedText>
                                From Location<ThemedText color="red">*</ThemedText>
                            </ThemedText>
                            <Input
                                value={fromLocation}
                                onChangeText={setFromLocation}
                            />
                            <ThemedText>
                                To Location<ThemedText color="red">*</ThemedText>
                            </ThemedText>
                            <Input
                                value={toLocation}
                                onChangeText={setToLocation}
                            />
                            <ThemedText>
                                Estimated Distance <ThemedText color="red">*</ThemedText>
                            </ThemedText>
                            <Input
                                placeholder="0km"
                                value={distance}
                                onChangeText={setDistance}
                                keyboardType="numeric"
                            />
                            <ThemedText>
                                Rate <ThemedText color="red">*</ThemedText>
                            </ThemedText>



                            <View style={styles.row}>
                                <View style={{ width: wp(21), marginRight: wp(2) }}>
                                    <ThemedText type="defaultSemiBold">Currency</ThemedText>
                                    <DropDownItem
                                        allData={[
                                            { id: 1, name: "USD" },
                                            { id: 2, name: "RSA" },
                                            { id: 3, name: "ZWG" }
                                        ]}
                                        selectedItem={selectedRateType}
                                        setSelectedItem={setSelectedRateType}
                                        placeholder=""
                                    />
                                </View>
                                <View style={{ flex: 1, }}>
                                    <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>Rate</ThemedText>

                                    <Input
                                        value={ratePerTonne}
                                        keyboardType="numeric"
                                        onChangeText={setRatePerTonne}
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
                                        selectedItem={selectedRateType}
                                        setSelectedItem={setSelectedRateType}
                                        placeholder=""
                                    />
                                </View>
                            </View>




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
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Additional Info
                            </ThemedText>
                            <Divider />
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
                            {dspAlertMsg && (
                                <>
                                    <ThemedText>
                                        Alert Message<ThemedText color="red">*</ThemedText>
                                    </ThemedText>
                                    <Input
                                        value={alertMsg}
                                        onChangeText={setAlertMsg}
                                    />
                                </>
                            )}
                            <Button onPress={toggleDspAlertMsg} title={dspAlertMsg ? "Hide Alert Message" : "Add Alert Message"} />
                            {dspFuelAvai && (
                                <>
                                    <ThemedText>
                                        Fuel Availability<ThemedText color="red">*</ThemedText>
                                    </ThemedText>
                                    <Input
                                        value={fuelAvai}
                                        onChangeText={setFuelAvai}
                                    />
                                </>
                            )}
                            <Button onPress={toggleDspFuelAvai} title={dspFuelAvai ? "Hide Fuel Info" : "Add Fuel Info"} />
                        </View>
                        <Divider />
                        <View style={styles.viewMainDsp}>
                            <Button onPress={() => setStep(0)} title="Back" />
                            <Button onPress={() => setStep(2)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                )}
                {step === 2 && (
                    <ScrollView>
                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
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
                                Return Rate<ThemedText color="red">*</ThemedText>
                            </ThemedText>
                            <Input
                                value={returnRate}
                                keyboardType="numeric"
                                onChangeText={setReturnRate}
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
                            <Button onPress={handleSubmit} title="Submit" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                )}
                {step === 3 && (<ScrollView>
                    <AddTruckDetails
                        selectedTruckType={selectedTruckType}
                        setSelectedTruckType={setSelectedTruckType}
                        selectedCargoArea={selectedCargoArea}
                        setSelectedCargoArea={setSelectedCargoArea}
                        selectedTankerType={selectedTankerType}
                        setSelectedTankerType={setSelectedTankerType}
                        selectedTruckCapacity={selectedTruckCapacity}
                        setSelectedTruckCapacity={setSelectedTruckCapacity}
                        selectedTrailerConfig={selectedTrailerConfig}
                        setSelectedTrailerConfig={setSelectedTrailerConfig}
                        selectedTruckSuspension={selectedTruckSuspension}
                        setSelectedTruckSuspension={setSelectedTruckSuspension}
                        formData={formDataTruck}
                        setFormData={setFormDataTruck}
                        showCountries={showCountries}
                        setShowCountries={setShowCountries}
                        operationCountries={operationCountries}
                        setOperationCountries={setOperationCountries}
                    />
                </ScrollView>)}
            </View>
        </ScreenWrapper>
    );
};

export default AddLoadDB;

const styles = StyleSheet.create({
    viewMainDsp: {
        margin: wp(4),
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
