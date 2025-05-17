import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TouchableNativeFeedback } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import { wp } from "@/constants/common";
import Heading from "@/components/Heading";

const AddLoadDB = () => {
    const [step, setStep] = useState(0);

    // Form state variables
    const [typeofLoad, setTypeofLoad] = useState("");
    const [fromLocation, setFromLocation] = useState("");
    const [toLocation, setToLocation] = useState("");
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

    const toggleDspAlertMsg = () => setDspAlertMsg((prev) => !prev);
    const toggleDspFuelAvai = () => setDspFuelAvai((prev) => !prev);
    const toggleDspReturnLoad = () => setDspReturnLoad((prev) => !prev);

    const handleSubmit = () => {
        // Handle form submission logic
        console.log({
            typeofLoad,
            fromLocation,
            toLocation,
            ratePerTonne,
            paymentTerms,
            requirements,
            additionalInfo,
            alertMsg,
            fuelAvai,
            returnLoad,
            returnRate,
            returnTerms,
        });

        if (!typeofLoad || !fromLocation || !toLocation || !ratePerTonne || !paymentTerms) {
            alert("Please fill in all required fields.");
            return;
        }


        const loadData = {
            distance: distance,
            deletionTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
            isVerified: false,
            typeofLoad,
            destination: toLocation,
            ratePerTonne,
            paymentTerms,
            requirements,
            additionalInfo,
            alertMsg: dspAlertMsg ? alertMsg : 'null',
            fuelAvai: dspFuelAvai ? fuelAvai : 'null',
            returnLoad,
            returnRate,
            returnTerms,
            currency: "USD",
            activeLoading: false,
            location: fromLocation,
            roundTrip: false,
        };

        try {

            addDocument("Loads", loadData, (status) => console.log(`Status: ${status}`))

            console.log("Submitting load data:", loadData);
            alert("Load submitted successfully!");
            router.back();
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
                {['Load Details', 'Additional Info', 'Return Load'].map((stepLabel, index) => (
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
                            <Input value={typeofLoad} placeholder="Type of Load" onChangeText={setTypeofLoad} />
                            <Input value={fromLocation} placeholder="From Location" onChangeText={setFromLocation} />
                            <Input value={toLocation} placeholder="To Location" onChangeText={setToLocation} />
                            <Input value={ratePerTonne} placeholder="Rate Per Tonne" onChangeText={setRatePerTonne} keyboardType="numeric" />
                            <Input value={paymentTerms} placeholder="Payment Terms" onChangeText={setPaymentTerms} />
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
                            <Input value={requirements} placeholder="Requirements" onChangeText={setRequirements} />
                            <Input value={additionalInfo} placeholder="Additional Information" onChangeText={setAdditionalInfo} />
                            {dspAlertMsg && <Input value={alertMsg} placeholder="Alert Message" onChangeText={setAlertMsg} />}
                            <Button onPress={toggleDspAlertMsg} title={dspAlertMsg ? "Hide Alert Message" : "Add Alert Message"} />
                            {dspFuelAvai && <Input value={fuelAvai} placeholder="Fuel Availability" onChangeText={setFuelAvai} />}
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
                            <Input value={returnLoad} placeholder="Return Load" onChangeText={setReturnLoad} />
                            <Input value={returnRate} placeholder="Return Rate" onChangeText={setReturnRate} keyboardType="numeric" />
                            <Input value={returnTerms} placeholder="Return Terms" onChangeText={setReturnTerms} />
                        </View>
                        <Divider />
                        <View style={styles.viewMainDsp}>
                            <Button onPress={() => setStep(1)} title="Back" />
                            <Button onPress={handleSubmit} title="Submit" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                )}
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
});
