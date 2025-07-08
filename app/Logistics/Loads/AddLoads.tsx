import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, TouchableNativeFeedback, Modal, ToastAndroid } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
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
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const AddLoadDB = () => {
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

    const [dspAlertMsg, setDspAlertMsg] = useState(false);
    const [dspFuelAvai, setDspFuelAvai] = useState(false);
    const [dspReturnLoad, setDspReturnLoad] = useState(false);

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

    type SelectedOption = { id: number; name: string } | null;
    interface TruckNeededType {
        cargoArea: TruckTypeProps | null;
        truckType: SelectedOption;
        tankerType: SelectedOption;
        capacity: SelectedOption;
        operationCountries: string[];
        trailerConfig: SelectedOption;
        suspension: SelectedOption;
    }
    const [trucksNeeded, setTrucksNeeded] = useState<TruckNeededType[]>([]);

    const [dspAfterSubmitMoadal, setAfterSubmitModal] = React.useState(false)

    function pushTruck() {
        const newTruck: TruckNeededType = {
            cargoArea: selectedCargoArea,
            truckType: selectedTruckType,
            tankerType: selectedTankerType,
            capacity: selectedTruckCapacity,
            operationCountries: operationCountries,
            trailerConfig: selectedTrailerConfig,
            suspension: selectedTruckSuspension,
        };

        setTrucksNeeded(prev => [...prev, newTruck]);

        // Reset all selections to defaults
        setSelectedCargoArea(null);
        setSelectedTruckType(null);
        setSelectedTankerType(null);
        setSelectedTruckCapacity(null);
        setOperationCountries([]);
        setSelectedTrailerConfig(null);
        setSelectedTruckSuspension(null);
    }
    function removeTruck(indexToRemove: number) {
        setTrucksNeeded(prev => prev.filter((_, index) => index !== indexToRemove));
    }




    const { user, alertBox } = useAuth();
    const handleSubmit = async () => {

        const MissingDriverDetails = [
            !typeofLoad && "Enter Load to be transported",
            !fromLocation && "Enter source Location",
            !toLocation && "Enter destination location",
            !rate && "Enter Load Rate ",
            !paymentTerms && "Enter Payment Terms",
        ].filter(Boolean);

        // if (MissingDriverDetails.length > 0) {
        //     // setContractDErr(true);
        //     alertBox("Missing Load Details", MissingDriverDetails.join("\n"), [], "error");
        //     return;
        // }



        if (!user) {
            alert("Please Login first");
            router.push('/Account/Login')
            return;
        }
        if (!user.organisation) {
            alert("Please edit your account and add Organisation details first, eg:Organisation Name!");
            return;
        }
        const loadData = {
            userId: user?.uid,
            companyName: user?.organisation,
            contact: user?.phoneNumber || '',
            logo: user.photoURL,
            created_at: Date.now().toString(),
            isVerified: false,
            typeofLoad,
            destination: toLocation,
            location: fromLocation,
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
            deletionTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
        };

        try {
            // Ensure addDocument is not a React hook or using hooks internally.
            // If it is, refactor addDocument to be a plain async function.
            await addDocument("Loads", loadData);

            ToastAndroid.show('Load Added successfully', ToastAndroid.SHORT)
            setAfterSubmitModal(true)


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




            <Modal visible={dspAfterSubmitMoadal} statusBarTranslucent animationType="slide">
                <ScreenWrapper>

                    <View style={{ margin: wp(4), }}>

                        <View style={{ gap: wp(2) }} >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: wp(4) }}>
                                <TouchableOpacity style={{
                                    position: 'absolute',
                                    left: wp(4),
                                    padding: wp(2),
                                }} onPress={() => setAfterSubmitModal(false)}>
                                    <AntDesign name="close" color={icon} size={wp(4)} />
                                </TouchableOpacity>
                                <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', textAlign: 'center' }} >Next Step</ThemedText>
                            </View>


                            <ThemedText style={{ textAlign: 'center' }}>
                                Load submitted successfully! Your load has been added and is now pending review. You can view the trucks you selected below or add another load if needed.
                            </ThemedText>


                            {trucksNeeded.map((item,index) => (
                                <View style={{
                                    position: 'relative',
                                    marginBottom: 10,
                                    padding: 14,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: 8,
                                    backgroundColor: backgroundLight
                                }} key={index} >
                                    <ThemedText>{item.truckType?.name} </ThemedText>
                                    <ThemedText>{item.cargoArea?.name}</ThemedText>
                                    <ThemedText>{item.capacity?.name} </ThemedText>

                                    <TouchableOpacity onPress={() =>
                                      {  router.push({
                                            pathname: "/Logistics/Trucks/Index",
                                            params: {
                                                organisationName: "Available Trucks",
                                                truckTypeG: item.truckType?.name,
                                                cargoAreaG: JSON.stringify( item.cargoArea) ,
                                                capacityG: item.capacity?.name,
                                                operationCountriesG: JSON.stringify( item.operationCountries),

                                            },
                                        });
                                        setAfterSubmitModal(false) } } >

                                        <MaterialIcons name="forward" size={24} color={icon} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={{ flexDirection: "row", gap: wp(3), marginTop: wp(4) }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#fff",
                                        borderWidth: 1,
                                        borderColor: "#0f9d58",

                                        borderRadius: 6,
                                        paddingVertical: wp(2),
                                        alignItems: "center",
                                    }}
                                    onPress={() => router.back()}

                                >
                                    <ThemedText style={{ color: "#0f9d58", fontWeight: "bold" }}>Go Back</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#0f9d58",
                                        borderRadius: 6,
                                        paddingVertical: wp(2),
                                        alignItems: "center",
                                    }}
                                    onPress={() => {
                                        setAfterSubmitModal(false);
                                        setStep(3);
                                    }}
                                >
                                    <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>Add Another</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScreenWrapper>

            </Modal>




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
                                        keyboardType="numeric"
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
                                        Fuel & Tolls Infomation<ThemedText color="red">*</ThemedText>
                                    </ThemedText>
                                    <Input
                                        value={fuelAvai}
                                        onChangeText={setFuelAvai}
                                    />
                                </>
                            )}
                            <Button onPress={toggleDspFuelAvai} title={dspFuelAvai ? "Hide Fuel & Tolls Info" : "Add Fuel & Tolls Info"} />
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
                                        keyboardType="numeric"
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
                            <Button onPress={handleSubmit} title="Submit" colors={{ text: '#0f9d58', bg: '#0f9d58a3' }} />
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
