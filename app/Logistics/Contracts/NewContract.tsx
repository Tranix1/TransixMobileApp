import React, { useState, useEffect } from "react";

import { View, TouchableOpacity, StyleSheet, ScrollView, TouchableNativeFeedback } from "react-native";

import { handleMakePayment } from "@/payments/operations";

import { ContractsFormDataScndType, TruckFormData } from "@/types/types";
import { ContractsFormDataType } from "@/types/types";

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";

import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { EvilIcons, FontAwesome, Ionicons,Feather } from "@expo/vector-icons";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";


import { TruckTypeProps } from "@/types/types";

import { AddTruckDetails } from "@/components/AddTruckDetails";
import CheckOutMakePayments from "@/components/CheckOutPayment";

const NewContract = () => {
    const backgroundLight = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');
    const iconcolor = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const text = useThemeColor('text');
    const textlight = useThemeColor('textlight');



    const [formData, setFormData] = useState<ContractsFormDataType>({
        commodity: { frst: "", scnd: "", third: "", forth: "" },
        location: { frst: "", scnd: "", thrd: "", forth: "", fifth: "", sixth: "", seventh: "" },
        trckRequired: { frst: "", scnd: "", third: "", forth: "", fifth: "" },
        otherRequirements: { frst: "", scnd: "", third: "", forth: "" },
        rate: { frst: "", scnd: "", thrd: "", forth: "", },
        returnRate: { frst: "", scnd: "", thrd: "", forth: "",  },
        returnCommodity: { frst: "", scnd: "", third: "", forth: "" }
    });

    const handleTypedText = (
        text: string,
        field: `${keyof ContractsFormDataType}.${string}`
    ) => {
        const [section, subField] = field.split('.') as [keyof ContractsFormDataType, string];

        setFormData(prevFormData => ({
            ...prevFormData,
            [section]: {
                ...prevFormData[section],
                [subField]: text,
            }
        }));
    };



    const [formDataScnd, setFormDataScnd] = React.useState<ContractsFormDataScndType>({
        paymentTerms: "",
        returnPaymentTerms: "",
        trucksLeft : "",
        contractDuration: "",
        startingDate: "",
        bookingClosingD: "",
        contractRenewal: "",
        manyRoutesOperation: "",
        loadsPerWeek: "",
        alertMsg: "",
        fuelAvai: "",
        additionalInfo: "",
    });

    const handleTypedTextScnd = (
        value: string,
        fieldName: keyof ContractsFormDataScndType
    ) => {
        setFormDataScnd((prevFormData) => ({
            ...prevFormData,
            [fieldName]: value,
        }));
    };

    // Individual useState variables for each input
    const [manyRoutesOperation, setManyRoutesOperation] = useState("");
    const [loadsPerWeek, setLoadsPerWeek] = useState("");
    const [location, setLocation] = useState("");
    const [dspCommodity, setDspCommodity] = useState(false);
    const [dspLocation, setDspLocation] = useState(false);
    const [dspReturnCommodity, setDspReturnCommodity] = useState(false);
    const [dspReturnRate, setDspReturnRate] = useState(false);

    const [step, setStep] = useState(0);






    function toggleDspCommodity() {
        setDspCommodity(prev => !prev);
    }

    function toggleDspLocation() {
        setDspLocation(prev => !prev);
    }

    const [manyRoutesAllocaton, setManyRoutesAllocation] = React.useState("");

    const [manyRoutesAssign, setManyRoutesAssign] = React.useState("");

    const [nowEnterLoca, setEnterLocs] = React.useState(false)
    function doneEnterThLocs() {
        setEnterLocs(prev => !prev)
    }



    function toggleDspReturnCommodity() {
        setDspReturnCommodity(prev => !prev);
    }

    function toggleDspReturnRate() {
        setDspReturnRate(prev => !prev);
    }

    // The button used to  dispaly ore or less info 
    type ToggleMLBtnProps = {
        whatTToggle: (...args: any[]) => void;
        theTittle: string;
        icon: boolean
    };

    const ToggleMLBtn = ({ whatTToggle, theTittle, icon }: ToggleMLBtnProps) => (
        <TouchableOpacity onPress={whatTToggle} style={[styles.moreLessIterms, { backgroundColor: backgroundLight, flexDirection: 'row', gap: wp(2) }]}>
            <ThemedText type="tiny" style={{}}>{theTittle}</ThemedText>
            <Ionicons name={!icon ? 'chevron-down' : 'chevron-up'} size={wp(4)} color={iconcolor} />
        </TouchableOpacity>
    );

    const [interOpCount, setIntOpLoc] = React.useState<string[]>([]);

    const [locaOpCount, setLocaOpLoc] = React.useState<string>("");





    console.log(interOpCount)
    console.log(locaOpCount)

    function toggleLocalCountry(count: string): void {
        setIntOpLoc([])
        setLocaOpLoc(count)
        setLocation("")
    }

    function toggleInternationalCountry(country: string): void {
        setLocaOpLoc("")
        setIntOpLoc(prev => {
            if (prev.includes(country)) {
                return prev.filter(item => item !== country); // remove if already selected
            } else {
                return [...prev, country]; // add if not selected
            }
        });
    }



    const [dspCheckOutP, setDspCheckout] = React.useState<boolean>(false)


    const [formDataTruck, setFormDataTruck] = useState<TruckFormData>({
        additionalInfo: "",
        driverPhone: "",
        maxloadCapacity: "",
        truckName: "",
        otherCargoArea: "",
        otherTankerType: ""
    });



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


    const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)
    const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(null)
    const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(null)
    const [selectedTruckCapacity, setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(null)
    const [showCountriesTruck, setShowCountriesTruck] = useState(false);
    const [operationCountriesTruck, setOperationCountriesTruck] = useState<string[]>([]);
    const [selectedTrailerConfig, setSelectedTrailerConfig] = useState<{ id: number, name: string } | null>(null)
    const [selectedTruckSuspension, setSelectedTruckSuspension] = useState<{ id: number, name: string } | null>(null)

    const [trucksNeeded, setTrucksNeeded] = useState<TruckNeededType[]>([]);


    function pushTruck() {
        const newTruck: TruckNeededType = {
            cargoArea: selectedCargoArea,
            truckType: selectedTruckType,
            tankerType: selectedTankerType,
            capacity: selectedTruckCapacity,
            operationCountries: operationCountriesTruck,
            trailerConfig: selectedTrailerConfig,
            suspension: selectedTruckSuspension,
        };

        setTrucksNeeded(prev => [...prev, newTruck]);

        // Reset all selections to defaults
        setSelectedCargoArea(null);
        setSelectedTruckType(null);
        setSelectedTankerType(null);
        setSelectedTruckCapacity(null);
        setOperationCountriesTruck([]);
        setSelectedTrailerConfig(null);
        setSelectedTruckSuspension(null);
    }
    function removeTruck(indexToRemove: number) {
        setTrucksNeeded(prev => prev.filter((_, index) => index !== indexToRemove));
    }


    const { user, alertBox } = useAuth();

    function toggleDspCheckout() {



        const missingLoadDetails = [
            !formData.commodity.frst && "Enter at least one commodity",
            !formData.location.frst && "Enter the first location",
            !formData.location.scnd && "Enter the second location",
            !formData.trckRequired && "Enter at least one type of truck required",
            !formData.otherRequirements.frst && "Enter at least one requirement",
            !formData.rate.frst && "Enter the solid rate",
        ].filter(Boolean);

        const missingContractDetails = [
            !formDataScnd.paymentTerms && "Enter the payment terms",
            !formDataScnd.loadsPerWeek && "Enter loads per week",
            !formDataScnd.contractDuration && "Enter contract duration",
            !formDataScnd.startingDate && "Enter the starting date",
            !formDataScnd.fuelAvai && "Enter fuel availability details",
            !formDataScnd.bookingClosingD && "Enter the booking closing date",
            (!locaOpCount && interOpCount.length === 0) && "Select the country the loads will operate in",
        ].filter(Boolean);

        // if (missingLoadDetails.length > 0) {
        //     // setLoadDspError(true);
        //     alertBox("Missing Load Details", missingLoadDetails.join("\n"), [], "error");
        //     return;
        // }

        // if (missingContractDetails.length > 0) {
        //     // setContractDErr(true);
        //     alertBox("Missing Contract Details", missingContractDetails.join("\n"), [], "error");
        //     return;
        // }

        setDspCheckout(true);
    }



    const contractData = {
        companyName: user?.organisation,
        contact: user?.phoneNumber || '',
        contractLocation: location,
        interCountries: interOpCount,
        localCountr: locaOpCount,
        manyRoutesAllocaton: manyRoutesAllocaton,
        manyRoutesAssign: manyRoutesAssign,
        formData: formData,
        formDataScnd: formDataScnd,
        contractId: `co${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ct`,
        truckDetails: trucksNeeded
    }

    const [paymentUpdate, setPaymentUpdate] = React.useState<string>("");

    const justConsole = () => {
        console.log("staty")
        handleMakePayment(3, "yaya", setPaymentUpdate, "loadsContracts", contractData);
        console.log("Donee")
    };



    return (
        <ScreenWrapper fh={false}>

            <Heading page='Add Contracts' rightComponent={
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: wp(3) }}>
                    <View>
                        <TouchableNativeFeedback onPress={() => console.log('add to draft')}>
                            <ThemedText style={{ alignSelf: 'flex-start' }}>Add Draft</ThemedText>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            }
            />






   {dspCheckOutP &&
          <CheckOutMakePayments jsxProp={<View
  style={{
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  }}
>
  <ThemedText
    style={{
      color: 'white',
      fontSize: 16,
      marginBottom: 10,
      fontWeight: 'bold',
    }}
  >
    Platform Fees
  </ThemedText>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Add Contract
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }}
    >
      $5
    </ThemedText>
  </View>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Add Load
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }}
    >
      $2
    </ThemedText>
  </View>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Add Truck
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }}
    >
      $8
    </ThemedText>
  </View>

  <View
    style={{
      borderTopWidth: 1,
      borderTopColor: '#555',
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
      Total
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 16, fontWeight: 'bold' }}
    >
      $15
    </ThemedText>
  </View>
</View>  } 
          confirmButon={justConsole} 
          cancelBTN={() => setDspCheckout(false) }
          />}




            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp(6), alignItems: 'center', marginBottom: wp(2) }}>
                {['Load Details', 'Return\nLoad', 'Contract Details', 'Truck Req',].map((stepLabel, index) => (
                    <View key={index} style={{ alignItems: 'center', flexDirection: 'row', flex: index > 0 ? 1 : 0, }}>
                        {index > 0 && (
                            <View
                                style={{
                                    borderWidth: 1,
                                    borderRadius: wp(40),
                                    borderColor: step >= index ? '#0f9d58' : '#ccc',
                                    marginHorizontal: wp(2),
                                    flex: 1,
                                    marginBottom: wp(5)
                                }}
                            />
                        )}
                        <TouchableOpacity onPress={() => setStep(index)} style={{ alignItems: 'center', }}>
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
                                {step > index ?
                                    <Ionicons name="checkmark" size={wp(4)} color={'white'} />
                                    :
                                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{index}</ThemedText>
                                }
                            </View>
                            <ThemedText
                                type="tiny"
                                style={{
                                    maxWidth: wp(12), textAlign: 'center',
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
                {step === 0 &&
                    <ScrollView contentContainerStyle={{ marginBottom: wp(4) }}>
                        <View style={{ padding: 4, gap: wp(5), marginVertical: wp(4) }}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Load Details
                            </ThemedText>
                        </View>

                        <Divider />

                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                Add Commodities
                            </ThemedText>
                            <ThemedText type="defaultSemiBold">
                                First Commodity
                            </ThemedText>
                            <Input
                                value={formData.commodity.frst}
                                placeholder="First Commodity"
                                onChangeText={(text) => handleTypedText(text, 'commodity.frst')}

                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Second Commodity
                            </ThemedText>
                            <Input
                                value={formData.commodity.scnd}
                                placeholder="Second Commodity"
                                onChangeText={(text) => handleTypedText(text, 'commodity.scnd')}
                                style={{}}
                            />

                            {dspCommodity && (
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Commodity
                                    </ThemedText>
                                    <Input
                                        value={formData.commodity.third}
                                        placeholder="Third Commodity"
                                        onChangeText={(text) => handleTypedText(text, 'commodity.third')}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Commodity
                                    </ThemedText>
                                    <Input
                                        value={formData.commodity.forth}
                                        placeholder="Fourth Commodity"
                                        onChangeText={(text) => handleTypedText(text, 'commodity.forth')}
                                    />
                                </View>
                            )}

                            <ToggleMLBtn
                                whatTToggle={toggleDspCommodity}
                                theTittle={dspCommodity ? "Hide" : "Show More"}
                                icon={dspCommodity}
                            />
                        </View>


                        <Divider />

                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                Add locations to be transported
                            </ThemedText>

                            <View>
                                <ThemedText type="defaultSemiBold">
                                    First Location
                                </ThemedText>
                                <Input
                                    value={formData.location.frst}
                                    placeholder={"First Location"}
                                    onChangeText={(text) => handleTypedText(text, 'location.frst')}
                                    style={{}}
                                />
                                <ThemedText type="defaultSemiBold">
                                    Second Location
                                </ThemedText>
                                <Input
                                    value={formData.location.scnd}
                                    placeholder={"Second Location"}
                                    onChangeText={(text) => handleTypedText(text, 'location.scnd')}
                                    style={{}}
                                />
                            </View>
                            {nowEnterLoca &&
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Location
                                    </ThemedText>
                                    <Input
                                        value={formData.location.thrd}
                                        placeholder={"Third Location"}
                                        onChangeText={(text) => handleTypedText(text, 'location.thrd')}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Location
                                    </ThemedText>
                                    <Input
                                        value={formData.location.forth}
                                        placeholder={"Fourth Location"}
                                        onChangeText={(text) => handleTypedText(text, 'location.forth')}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fifth Location
                                    </ThemedText>
                                    <Input
                                        value={formData.location.fifth}
                                        placeholder={"Fifth Location"}
                                        onChangeText={(text) => handleTypedText(text, 'location.fifth')}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        FifSixthth Location
                                    </ThemedText>
                                    <Input
                                        value={formData.location.sixth}
                                        placeholder={"Sixth Location"}
                                        onChangeText={(text) => handleTypedText(text, 'location.sixth')}
                                        style={{}}
                                    />


                                </View>
                            }

                            {dspLocation && !nowEnterLoca && (
                                <View style={{ padding: 4, gap: wp(5) }}>
                                    <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                        There are more than two locations
                                    </ThemedText>
                                    <View style={[styles.viewSubMainDsp, { backgroundColor: background }]}>
                                        <ThemedText style={{ textAlign: 'center' }}>How will they operate from routes?</ThemedText>

                                        <Divider />
                                        <View style={{ gap: wp(3), padding: wp(3) }}>
                                            <TouchableOpacity
                                                onPress={() => setManyRoutesAssign('All Routes One Stop')}
                                                style={{
                                                    justifyContent: 'space-between',
                                                    padding: 3,
                                                    alignContent: 'center',
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <ThemedText>All Routes One Stop</ThemedText>
                                                {manyRoutesAssign === 'All Routes One Stop' ? (
                                                    <EvilIcons
                                                        name="check"
                                                        size={30}
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        color={iconcolor}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name="ellipse-outline"
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        size={24}
                                                        color={iconcolor}
                                                    />
                                                )}
                                            </TouchableOpacity>

                                            {manyRoutesAssign === 'All Routes One Stop' && (
                                                <Input
                                                    value={formData.location.seventh}
                                                    placeholder="Destination Location"
                                                    onChangeText={(text) => handleTypedText(text, 'location.seventh')}
                                                    style={{}}
                                                />
                                            )}

                                            <TouchableOpacity
                                                onPress={() => setManyRoutesAssign('One Route to another')}
                                                style={{
                                                    justifyContent: 'space-between',
                                                    padding: 3,
                                                    alignContent: 'center',
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <ThemedText>Route to Route</ThemedText>
                                                {manyRoutesAssign === 'One Route to another' ? (
                                                    <EvilIcons
                                                        name="check"
                                                        size={30}
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        color={iconcolor}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name="ellipse-outline"
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        size={24}
                                                        color={iconcolor}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={[styles.viewSubMainDsp, { backgroundColor: background }]}>
                                        <ThemedText style={{ textAlign: 'center' }}>
                                            Will the transporter choose where to go, or will it be random?
                                        </ThemedText>

                                        <Divider />
                                        <View style={{ gap: wp(3), padding: wp(3) }}>
                                            <TouchableOpacity
                                                onPress={() => setManyRoutesAllocation('Transporter Choose')}
                                                style={{
                                                    justifyContent: 'space-between',
                                                    padding: 3,
                                                    alignContent: 'center',
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <ThemedText>Transporter Choose</ThemedText>
                                                {manyRoutesAllocaton === 'Transporter Choose' ? (
                                                    <EvilIcons
                                                        name="check"
                                                        size={30}
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        color={iconcolor}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name="ellipse-outline"
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        size={24}
                                                        color={iconcolor}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setManyRoutesAllocation('Random Allocation')}
                                                style={{
                                                    justifyContent: 'space-between',
                                                    padding: 3,
                                                    alignContent: 'center',
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <ThemedText>Random Allocation</ThemedText>
                                                {manyRoutesAllocaton === 'Random Allocation' ? (
                                                    <EvilIcons
                                                        name="check"
                                                        size={30}
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        color={iconcolor}
                                                    />
                                                ) : (
                                                    <Ionicons
                                                        name="ellipse-outline"
                                                        style={{ textAlign: 'center', width: wp(6) }}
                                                        size={24}
                                                        color={iconcolor}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                        How will the routes work?
                                    </ThemedText>
                                    <Input
                                        value={manyRoutesOperation}
                                        placeholder="Routes Operate"
                                        onChangeText={setManyRoutesOperation}
                                        style={{}}
                                    />
                                </View>
                            )}

                            {(dspLocation) && (
                                <TouchableOpacity
                                    onPress={doneEnterThLocs}
                                    style={[
                                        styles.moreLessIterms,
                                        { backgroundColor: backgroundLight, flexDirection: 'row', gap: wp(2) },
                                    ]}
                                >
                                    <ThemedText type="tiny">{nowEnterLoca ? 'Edit' : 'Done'}</ThemedText>
                                </TouchableOpacity>
                            )}

                            <ToggleMLBtn
                                whatTToggle={toggleDspLocation}
                                theTittle={dspLocation ? 'Collapse' : 'If You Have More Than 2 Locations'}
                                icon={dspLocation}
                            />
                        </View>

                        <Divider />


                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                Add Rate
                            </ThemedText>
                            <ThemedText type="defaultSemiBold">
                                First Rate
                            </ThemedText>
                            <Input
                                value={formData.rate.frst}
                                placeholder="First Rate"
                                onChangeText={(text) => handleTypedText(text, 'rate.frst')}

                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Second Rate
                            </ThemedText>
                            <Input
                                value={formData.rate.scnd}
                                placeholder="Second Rate"
                                onChangeText={(text) => handleTypedText(text, 'rate.scnd')}
                                style={{}}
                            />

                            {dspCommodity && (
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Commodity
                                    </ThemedText>
                                    <Input
                                        value={formData.rate.thrd}
                                        placeholder="Third Commodity"
                                        onChangeText={(text) => handleTypedText(text, 'rate.thrd')}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Rate
                                    </ThemedText>
                                    <Input
                                        value={formData.rate.forth}
                                        placeholder="Fourth Commodity"
                                        onChangeText={(text) => handleTypedText(text, 'rate.forth')}
                                    />
                                </View>
                            )}

                            <ToggleMLBtn
                                whatTToggle={toggleDspCommodity}
                                theTittle={dspCommodity ? "Hide" : "Show More"}
                                icon={dspCommodity}
                            />
                        </View>


                        <Divider />




                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                Add Requirements
                            </ThemedText>
                            <ThemedText type="defaultSemiBold">
                                First Requirements
                            </ThemedText>
                            <Input
                                value={formData.otherRequirements.frst}
                                placeholder="First Requirements"
                                onChangeText={(text) => handleTypedText(text, 'otherRequirements.frst')}

                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Second Requirements
                            </ThemedText>
                            <Input
                                value={formData.otherRequirements.scnd}
                                placeholder="Second Requirements"
                                onChangeText={(text) => handleTypedText(text, 'otherRequirements.scnd')}
                                style={{}}
                            />

                            {dspCommodity && (
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Requirements
                                    </ThemedText>
                                    <Input
                                        value={formData.otherRequirements.third}
                                        placeholder="Third Requirements"
                                        onChangeText={(text) => handleTypedText(text, 'otherRequirements.third')}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Requirements
                                    </ThemedText>
                                    <Input
                                        value={formData.otherRequirements.forth}
                                        placeholder="Fourth Requirements"
                                        onChangeText={(text) => handleTypedText(text, 'otherRequirements.forth')}
                                    />
                                </View>
                            )}

                            <ToggleMLBtn
                                whatTToggle={toggleDspCommodity}
                                theTittle={dspCommodity ? "Hide" : "Show More"}
                                icon={dspCommodity}
                            />
                        </View>

                        <Divider />

                        <View style={styles.viewMainDsp}>
                            <Button onPress={() => setStep(1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                }
                {step === 1 &&
                    <ScrollView>

                        <View style={{ padding: 4, gap: wp(5), marginVertical: wp(4) }}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Return Load
                            </ThemedText>
                        </View>

                        <Divider />


                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>Commodities to be transported</ThemedText>
                            <ThemedText type="defaultSemiBold">
                                First Commodity
                            </ThemedText>
                            <Input
                                value={formData.returnCommodity.frst}
                                placeholder="First Commodity"
                                onChangeText={(text) => handleTypedText(text, 'returnCommodity.frst')}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Second Commodity
                            </ThemedText>
                            <Input
                                value={formData.returnCommodity.scnd}
                                placeholder="Second Commodity"
                                onChangeText={(text) => handleTypedText(text, 'returnCommodity.scnd')}
                                style={{}}
                            />

                            {dspReturnCommodity && (
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Commodity
                                    </ThemedText>
                                    <Input
                                        value={formData.returnCommodity.third}
                                        placeholder="Third Commodity"
                                        onChangeText={(text) => handleTypedText(text, 'returnCommodity.third')}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Commodity
                                    </ThemedText>
                                    <Input
                                        value={formData.returnCommodity.forth}
                                        placeholder="Fourth Commodity"
                                        onChangeText={(text) => handleTypedText(text, 'returnCommodity.forth')}
                                        style={{}}
                                    />
                                </View>
                            )}
                            <ToggleMLBtn
                                icon={dspReturnCommodity}
                                whatTToggle={toggleDspReturnCommodity}
                                theTittle={dspReturnCommodity ? 'Collapse' : 'More'}
                            />
                        </View>
                        <Divider />

                        <View style={styles.viewMainDsp}>
                            <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>Payment Terms</ThemedText>
                            <ThemedText type="defaultSemiBold">
                                Return Payment Terms
                            </ThemedText>
                            <Input
                                value={formDataScnd.returnPaymentTerms}
                                placeholder="Return Payment Terms"
                                onChangeText={(text) => handleTypedTextScnd(text, 'returnPaymentTerms')}
                                style={{}}
                            />
                        </View>
                        <Divider />

                        <View style={styles.viewMainDsp}>
                            {dspReturnRate && (
                                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                    Add all the rates for return loads
                                </ThemedText>
                            )}
                            {!dspReturnRate && (
                                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                    Add rates for return loads
                                </ThemedText>
                            )}
                            <ThemedText type="defaultSemiBold">
                                Return First Rate
                            </ThemedText>
                            <Input
                                value={formData.returnRate.frst}
                                placeholder="Return Solid First Rate"
                                onChangeText={(text) => handleTypedText(text, 'returnRate.frst')}
                                style={{}}
                            />
                            {dspReturnRate && (
                                <>
                                    <ThemedText type="defaultSemiBold">
                                        Return Second Rate
                                    </ThemedText>
                                    <Input
                                        value={formData.returnRate.scnd}
                                        placeholder="Return Solid Second Rate"
                                        onChangeText={(text) => handleTypedText(text, 'returnRate.scnd')}
                                        style={{}}
                                    />
                                </>
                            )}
                            <ThemedText type="defaultSemiBold">
                                Return First Rate
                            </ThemedText>
                            <Input
                                value={formData.returnRate.thrd}
                                placeholder="Return Triaxle First Rate"
                                onChangeText={(text) => handleTypedText(text, 'returnRate.thrd')}
                                style={{}}
                            />
                            {dspReturnRate && (
                                <>
                                    <ThemedText type="defaultSemiBold">
                                        Return Second Rate
                                    </ThemedText>
                                    <Input
                                        value={formData.returnRate.forth}
                                        placeholder="Return Triaxle Second Rate"
                                        onChangeText={(text) => handleTypedText(text, 'returnRate.forth')}
                                        style={{}}
                                    />
                                </>
                            )}



                            <ToggleMLBtn
                                whatTToggle={toggleDspReturnRate}
                                theTittle={dspReturnRate ? 'Collapse' : 'More'}
                                icon={dspReturnRate}
                            />
                        </View>
                        <Divider />

                        <View style={styles.viewMainDsp}>
                            <Button onPress={() => setStep(0)} title="Back" />
                            <Button onPress={() => setStep(2)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                }
                {step === 2 &&
                    <ScrollView>

                        <View >
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Contract Details
                            </ThemedText>
                        </View>

                        <Divider />




                        <View style={styles.viewMainDsp}>
                            <ThemedText type="defaultSemiBold" >
                                Payment Terms
                            </ThemedText>
                            <Input
                                value={formDataScnd.paymentTerms}
                                placeholder="Payment Terms"
                                onChangeText={(text) => handleTypedTextScnd(text, 'paymentTerms')}
                                style={{}}
                            />
                            <Divider />
                            <ThemedText type="defaultSemiBold">
                                Fuel
                            </ThemedText>
                            <Input
                                value={formDataScnd.fuelAvai}
                                placeholder="Fuel"
                                onChangeText={(text) => handleTypedTextScnd(text, 'fuelAvai')}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Loads Per Week
                            </ThemedText>
                            <Input
                                value={formDataScnd.loadsPerWeek}
                                placeholder="Loads Per Week"
                                onChangeText={(text) => handleTypedTextScnd(text, 'loadsPerWeek')}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Contract Duration
                            </ThemedText>
                            <Input
                                value={formDataScnd.contractDuration}
                                placeholder="Contract Duration"
                                onChangeText={(text) => handleTypedTextScnd(text, 'contractDuration')}
                                style={{}}
                            />


                            <ThemedText type="defaultSemiBold">
                                Starting Date
                            </ThemedText>
                            <Input
                                value={formDataScnd.startingDate}
                                placeholder="Starting Date"
                                onChangeText={(text) => handleTypedTextScnd(text, 'startingDate')}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Booking Closing Date
                            </ThemedText>
                            <Input
                                value={formDataScnd.bookingClosingD}
                                placeholder="Booking Closing Date"
                                onChangeText={(text) => handleTypedTextScnd(text, 'bookingClosingD')}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Can You Renew Contract for how long
                            </ThemedText>
                            <Input
                                value={formDataScnd.contractRenewal}
                                placeholder="Can You Renew Contract for how long"
                                onChangeText={(text) => handleTypedTextScnd(text, 'contractRenewal')}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Alert Message
                            </ThemedText>
                            <Input
                                value={formDataScnd.alertMsg}
                                placeholder="Alert Message"
                                onChangeText={(text) => handleTypedTextScnd(text, 'alertMsg')}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Additional Info
                            </ThemedText>
                            <Input
                                value={formDataScnd.additionalInfo}
                                placeholder="Additional Info"
                                onChangeText={(text) => handleTypedTextScnd(text, 'additionalInfo')}
                                style={{}}
                            />

                        </View>

                        <View style={{ padding: wp(4) }}>
                            <View style={[styles.viewSubMainDsp, { backgroundColor: background }]}>



                                <ThemedText type="defaultSemiBold" style={{ textAlign: 'center' }}>
                                    Is the contract International or Local for one country</ThemedText>

                                <Divider />
                                <View style={{ gap: wp(3), padding: wp(3) }}>
                                    <TouchableOpacity
                                        onPress={() => setLocation("Local")}
                                        style={{
                                            justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                                        }}
                                    >
                                        <ThemedText>
                                            Local
                                        </ThemedText>
                                        {location === "Local" ?
                                            <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />
                                            :
                                            <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />
                                        }
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setLocation("International")}
                                        style={{
                                            justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                                        }}
                                    >
                                        <ThemedText>
                                            International
                                        </ThemedText>
                                        {location === "International" ?
                                            <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />
                                            :
                                            <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />
                                        }
                                    </TouchableOpacity>
                                </View>
                                {location &&
                                    <View style={[styles.viewSubMainDsp, { backgroundColor: backgroundLight, borderWidth: 0, borderRadius: wp(2), elevation: 0, gap: wp(3) }]}>
                                        {location === "Local" && (
                                            <>
                                                <ThemedText type="defaultSemiBold" style={{ textAlign: 'center' }}>
                                                    Select Your Local Country
                                                </ThemedText>
                                                <Divider />
                                                {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
                                                    <TouchableOpacity
                                                        key={country}
                                                        onPress={() => toggleLocalCountry(country)}
                                                        style={{
                                                            justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                                                        }}
                                                    >
                                                        <ThemedText>
                                                            {country}
                                                        </ThemedText>
                                                        {locaOpCount === country ?
                                                            <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />
                                                            :
                                                            <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />
                                                        }
                                                    </TouchableOpacity>
                                                ))}
                                            </>
                                        )}

                                        {location === "International" && (
                                            <>
                                                <ThemedText type="defaultSemiBold" style={{ textAlign: 'center' }}>
                                                    Select International Countries
                                                </ThemedText>
                                                <Divider />

                                                {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
                                                    <TouchableOpacity
                                                        key={country}
                                                        onPress={() => toggleInternationalCountry(country)}
                                                        style={{
                                                            justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                                                        }}
                                                    >
                                                        <ThemedText>
                                                            {country}
                                                        </ThemedText>
                                                        {interOpCount.includes(country) ?
                                                            <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />
                                                            :
                                                            <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />
                                                        }
                                                    </TouchableOpacity>
                                                ))}
                                            </>
                                        )}
                                    </View>
                                }

                            </View>
                            <View style={styles.viewMainDsp}>
                                <Button onPress={() => setStep(1)} title="Back" />
                                <Button onPress={() => setStep(3)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                            </View>
                        </View>

                    </ScrollView>
                }

                {step === 3 &&
                    <ScrollView>

                        <View></View>

                        <View style={{ padding: 4, gap: wp(5), marginTop: wp(4) }}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Truck Required
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
                                showCountries={showCountriesTruck}
                                setShowCountries={setShowCountriesTruck}
                                operationCountries={operationCountriesTruck}
                                setOperationCountries={setOperationCountriesTruck}
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



                        </View>

                        <Divider />
                        <View style={styles.viewMainDsp}>
                            <Button onPress={toggleDspCheckout} title="Submit" />
                        </View>
                    </ScrollView>
                }
            </View>






        </ScreenWrapper >

    )
}

export default NewContract

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
    viewSubMainDsp: {
        padding: 10,
        borderWidth: 1,
        borderColor: "ccc",
        borderRadius: wp(4),
        shadowColor: '#2f2f2f69',
        shadowOpacity: 0.7,
        shadowRadius: 5,
        elevation: 10,
        gap: wp(2)
    },
    moreLessIterms: {
        padding: wp(2), justifyContent: 'center', alignItems: 'center', borderRadius: 5
    },
    buttonIsFalse: {
        borderWidth: 1,
        borderColor: '#6a0c0c',
        paddingLeft: 6,
        paddingRight: 6,
        alignSelf: 'center',

        marginLeft: 6
    },
    bttonIsTrue: {
        backgroundColor: '#6a0c0c',
        paddingLeft: 4,
        paddingRight: 4,
        color: 'white',
        alignSelf: 'center'

    },
    buttonStyle: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: "#6a0c0c",
        borderRadius: 10
    },
});
