import React, { useState, FC, useEffect } from "react";

import { View, TouchableOpacity, StyleSheet, ScrollView, TouchableNativeFeedback } from "react-native";

import CheckOutMakePayments from "@/components/CheckOutPayment";
import { ErrorOverlay } from "@/components/ErrorOverLay";
import { handleMakePayment } from "@/payments/operations";

import { ContractsFormDataScndType, TankerTruckProps } from "@/types/types";
import { ContractsFormDataType } from "@/types/types";

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";

import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import ScreenWrapper from '@/components/ScreenWrapper';
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { CheckBox } from 'react-native-elements';


import { SpecifyTruckDetails } from "@/components/SpecifyTruckDetails";
import { TruckTypeProps } from "@/types/types";
import CountrySelector from "@/components/CountrySelector";
import { SlctTruckCapacity } from "@/components/SelectTruckCapacity";
import { SpecifyTruckType } from "@/components/SelectTruckType";
import { Image } from "expo-image";

const NewContract = () => {
    const backgroundLight = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');
    const iconcolor = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const text = useThemeColor('text');
    const textlight = useThemeColor('textlight');

    // Individual useState variables for each input
    const [commodityFirst, setCommodityFirst] = useState("");
    const [commoditySecond, setCommoditySecond] = useState("");
    const [commodityThird, setCommodityThird] = useState("");
    const [commodityFourth, setCommodityFourth] = useState("");

    const [locationFirst, setLocationFirst] = useState("");
    const [locationSecond, setLocationSecond] = useState("");
    const [locationThird, setLocationThird] = useState("");
    const [locationFourth, setLocationFourth] = useState("");
    const [locationFifth, setLocationFifth] = useState("");
    const [locationSixth, setLocationSixth] = useState("");
    const [locationSeventh, setLocationSeventh] = useState("");

    const [truckRequirementFirst, setTruckRequirementFirst] = useState("");
    const [truckRequirementSecond, setTruckRequirementSecond] = useState("");
    const [truckRequirementThird, setTruckRequirementThird] = useState("");
    const [truckRequirementFourth, setTruckRequirementFourth] = useState("");
    const [truckRequirementFifth, setTruckRequirementFifth] = useState("");

    const [otherRequirementFirst, setOtherRequirementFirst] = useState("");
    const [otherRequirementSecond, setOtherRequirementSecond] = useState("");
    const [otherRequirementThird, setOtherRequirementThird] = useState("");
    const [otherRequirementFourth, setOtherRequirementFourth] = useState("");

    const [rateSolidFirst, setRateSolidFirst] = useState("");
    const [rateSolidSecond, setRateSolidSecond] = useState("");
    const [rateTriaxleFirst, setRateTriaxleFirst] = useState("");
    const [rateTriaxleSecond, setRateTriaxleSecond] = useState("");
    const [rateLinksFirst, setRateLinksFirst] = useState("");
    const [rateLinksSecond, setRateLinksSecond] = useState("");
    const [rateSuperLinkFirst, setRateSuperLinkFirst] = useState("");
    const [rateSuperLinkSecond, setRateSuperLinkSecond] = useState("");

    const [returnCommodityFirst, setReturnCommodityFirst] = useState("");
    const [returnCommoditySecond, setReturnCommoditySecond] = useState("");
    const [returnCommodityThird, setReturnCommodityThird] = useState("");
    const [returnCommodityFourth, setReturnCommodityFourth] = useState("");

    const [returnRateSolidFirst, setReturnRateSolidFirst] = useState("");
    const [returnRateSolidSecond, setReturnRateSolidSecond] = useState("");
    const [returnRateTriaxleFirst, setReturnRateTriaxleFirst] = useState("");
    const [returnRateTriaxleSecond, setReturnRateTriaxleSecond] = useState("");
    const [returnRateLinksFirst, setReturnRateLinksFirst] = useState("");
    const [returnRateLinksSecond, setReturnRateLinksSecond] = useState("");
    const [returnRateSuperLinkFirst, setReturnRateSuperLinkFirst] = useState("");
    const [returnRateSuperLinkSecond, setReturnRateSuperLinkSecond] = useState("");

    const [paymentTerms, setPaymentTerms] = useState("");
    const [returnPaymentTerms, setReturnPaymentTerms] = useState("");
    const [contractDuration, setContractDuration] = useState("");
    const [startingDate, setStartingDate] = useState("");
    const [bookingClosingDate, setBookingClosingDate] = useState("");
    const [contractRenewal, setContractRenewal] = useState("");
    const [manyRoutesOperation, setManyRoutesOperation] = useState("");
    const [loadsPerWeek, setLoadsPerWeek] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [fuelAvailability, setFuelAvailability] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");

    const [location, setLocation] = useState("");
    const [localCountry, setLocalCountry] = useState("");
    const [internationalCountries, setInternationalCountries] = useState<string[]>([]);

    const [dspCommodity, setDspCommodity] = useState(false);
    const [dspLocation, setDspLocation] = useState(false);
    const [dspTruckRequired, setDspTruckRequired] = useState(false);
    const [dspRate, setDspRate] = useState(false);
    const [dspOtherRequirements, setDspOtherRequirements] = useState(false);
    const [dspReturnCommodity, setDspReturnCommodity] = useState(false);
    const [dspReturnRate, setDspReturnRate] = useState(false);

    const [step, setStep] = useState(0);

    const litresCapacity = [
        '300L',
        '400L',
        '500L',
        '700L',
        '800L',
        '900L',
    ]

    const tonneSizes = [
        '1-3 T',
        '3-6 T',
        '7-10 T',
        '11-13 T',
        '12-15 T',
        '16-20 T',
        '20+ T',
    ];
    const truckTypes = [
        { id: 0, name: 'Flat deck', description: 'Ideal for transporting oversized or heavy loads.', image: require('@/assets/images/Trucks/images (2).jpeg') },
        { id: 1, name: 'Bulk Trailer', description: 'Used for carrying bulk materials like grains or minerals.', image: require('@/assets/images/Trucks/download (1).jpeg') },
        { id: 2, name: 'Dropside', description: 'Truck with removable sides, perfect for transporting heavy and oversized goods.', image: require('@/assets/images/Trucks/8-ton-drop-side-truck.jpg') },
        { id: 3, name: 'Side Tipper', description: 'Suitable for unloading materials like sand or gravel.', image: require('@/assets/images/Trucks/images (5).jpeg') },
        { id: 4, name: 'Tautliner', description: 'Versatile truck with curtains for easy loading and unloading.', image: require('@/assets/images/Trucks/download (3).jpeg') },

        { id: 5, name: 'Box', description: 'Enclosed truck ideal for transporting packaged goods, furniture, and electronics.', image: require('@/assets/images/Trucks/download (8).jpeg') },

        { id: 6, name: 'Low Bed', description: 'Designed for transporting heavy machinery and equipment.', image: require('@/assets/images/Trucks/H805f1f51529345648d1da9e5fcd6807e2.jpg') },

        { id: 7, name: 'Refrigerated', description: 'Temperature-controlled truck used for transporting perishable goods like food and medicine.', image: require('@/assets/images/Trucks/download (7).jpeg') },

        { id: 8, name: 'Tanker', description: 'Used for transporting liquids like fuel or chemicals.', image: require('@/assets/images/Trucks/images (7).jpeg') },

        { id: 9, name: 'Other', description: 'Custom or specialized truck types designed for unique transport needs.', image: require('@/assets/images/Trucks/download (4).jpeg') },

        // { id: 7, name: 'All', image: '' },
    ]


    const tankerTypes = [
        {
            id: 0,
            name: "Oil Tankers",
            description: "Carry oil or its products.",
            products: ["Crude oil", "Gasoline", "Diesel", "Jet fuel"]
        },
        {
            id: 1,
            name: "Chemical Tankers",
            description: "Transport various liquid chemicals in bulk.",
            products: ["Acids", "Vegetable oils", "Ethylene glycol", "Methanol"]
        },
        {
            id: 2,
            name: "Gas Carriers",
            description: "Transport liquefied gases at very low temperatures or under high pressure.",
            products: ["Liquefied Natural Gas (LNG)", "Liquefied Petroleum Gas (LPG)", "Propane", "Butane"]
        },
        {
            id: 3,
            name: "Food-Grade Tankers",
            description: "Transporting liquid food products.",
            products: ["Milk", "Juice", "Wine", "Edible oils"]
        },
        {
            id: 4,
            name: "Specialized Cargo Tankers",
            description: "Tankers built for specific, unique liquid cargoes.",
            products: ["Bitumen", "Slurry", "Molten sulfur", "Hydrogen"]
        }
    ];






















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

    function toggleDspTruckRequired() {
        setDspTruckRequired(prev => !prev);
    }

    function toggleDspRate() {
        setDspRate(prev => !prev);
    }

    function toggleDspOtherRequirements() {
        setDspOtherRequirements(prev => !prev);
    }

    function toggleDspReturnCommodity() {
        setDspReturnCommodity(prev => !prev);
    }

    function toggleDspReturnRate() {
        setDspReturnRate(prev => !prev);
    }

    const [dspRturnnLoads, setDspReturnLoads] = React.useState(false);

    function toggleDspReturnLoads() {
        setDspReturnLoads(true);
        setDspContractD(false);
        setDspLoadDe(false)
    }

    const [dspContractD, setDspContractD] = React.useState(false);

    function toggleDspContractD() {
        setDspContractD(true);
        setDspReturnLoads(false);
        setDspLoadDe(false)
    }

    const [dsoLoadDe, setDspLoadDe] = React.useState(true)
    function dspLoadDet() {
        setDspLoadDe(true)
        setDspContractD(false);
        setDspReturnLoads(false);
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

    const [dspAddLocation, setDspAddLocation] = React.useState<boolean>(false)

    const [interOpCount, setIntOpLoc] = React.useState<string[]>([]);

    const [locaOpCount, setLocaOpLoc] = React.useState<string>("");

    console.log(interOpCount)
    console.log(locaOpCount)

    function toggleLocalCountry(count: string): void {
        setIntOpLoc([])
        setLocaOpLoc(count)
        setDspAddLocation(false)
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

    // This is the button to choose a country 
    type SlctCountryBtnProps = {
        selectedLoc: string;
        onPress: () => void;
        isSelected?: boolean;
    };

    const SlctCountryBtn = ({ selectedLoc, onPress, isSelected }: SlctCountryBtnProps) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.buttonStyle,
                { backgroundColor: isSelected ? '#6a0c0c' : '#eee' },
            ]}
        >
            <ThemedText style={{ color: isSelected ? 'white' : '#6a0c0c' }}>{selectedLoc}</ThemedText>
        </TouchableOpacity>
    );

    const [dspCheckOutP, setDspCheckout] = React.useState<boolean>(false)

    const [dspLoadDErr, setLoadDspError] = React.useState<boolean>(false)
    const [dspContrDErro, setContractDErr] = React.useState<boolean>(false)

    function toggleDspCheckout() {
        const formData = {
            commodity: { frst: commodityFirst },
            location: { frst: locationFirst, scnd: locationSecond },
            trckRequired: truckRequirementFirst,
            otherRequirements: { frst: otherRequirementFirst },
            rate: { solidFrst: rateSolidFirst }
        };

        const formDataScnd = {
            paymentTerms,
            loadsPerWeek,
            contractDuration,
            startingDate,
            fuelAvai: fuelAvailability,
            bookingClosingD: bookingClosingDate
        };

        const missingLoadDetails = [
            !formData.commodity.frst && "Enter at least one commodity",
            !formData.location.frst && "Enter the first location",
            !formData.location.scnd && "Enter the second location",
            !formData.trckRequired && "Enter at least one type of truck required",
            !formData.otherRequirements.frst && "Enter at least one requirement",
            !formData.rate.solidFrst && "Enter the solid rate",
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

        if (missingLoadDetails.length > 0) {
            // setLoadDspError(true);
            alertBox("Missing Load Details", missingLoadDetails.join("\n"), [], "error");
            return;
        }

        if (missingContractDetails.length > 0) {
            // setContractDErr(true);
            alertBox("Missing Contract Details", missingContractDetails.join("\n"), [], "error");
            return;
        }

        setDspCheckout(true);
    }

    const contractData = {
        // userId: userId, // Add the user ID to the document
        // companyName: username,
        // contact: contact,
        // expoPushToken: expoPushToken,
        // currency: currency, 
        contractLocation: location,
        interCountries: interOpCount,
        localCountr: locaOpCount,
        manyRoutesAllocaton: manyRoutesAllocaton,
        manyRoutesAssign: manyRoutesAssign,
        formData: {
            commodity: { frst: commodityFirst },
            location: { frst: locationFirst, scnd: locationSecond },
            trckRequired: truckRequirementFirst,
            otherRequirements: { frst: otherRequirementFirst },
            rate: { solidFrst: rateSolidFirst }
        },
        formDataScnd: {
            paymentTerms,
            loadsPerWeek,
            contractDuration,
            startingDate,
            fuelAvai: fuelAvailability,
            bookingClosingD: bookingClosingDate
        },
        contractId: `co${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ct`,
    }

    const [paymentUpdate, setPaymentUpdate] = React.useState<string>("");

    const justConsole = () => {

        handleMakePayment(3, "yaya", setPaymentUpdate, "loadsContracts", contractData);
    };



    useEffect(() => {

    }, [])


    const { alertBox } = useAuth();


    const [locationTruckS, setLocationTruckS] = useState<string>(""); // Track local or international selection
    const [locaOpLocTruckS, setLocaOpLocTruckS] = useState<string>(""); // Track selected local country
    const [intOpLocTruckS, setIntOpLocTruckS] = useState<string[]>([]); // Track international countries



    const [selectedTruckType, setSelectedTruckType] = useState<TruckTypeProps | null>(null)

    const [otherTruckType, setOtherTruckType] = React.useState<string>("")

    const [typeOfTanker, setTypeOfTanker] = React.useState<TankerTruckProps | null>(null)
console.log(typeOfTanker)


    const [truckConfig, setTruckConfig] = React.useState("")
    const [truckSuspension, setTruckSuspension] = React.useState("")

    const [otherTruckSuspension, setOtherTruckSuspension] = React.useState("")

    const [dspTruckCpacity, setDspTruckCapacity] = React.useState<string>("")
    const [truckCapacity, setTruckCapacity] = useState("")

    const [dspSpecTruckDet, setDspSpecTruckDet] = React.useState<boolean>(false)




    console.log(selectedTruckType)

    const clearFilter = () => {
        setSelectedTruckType(null)
        setTruckCapacity('')
        setLocation("")
        setLocaOpLoc("")
        setIntOpLoc([])
    }







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




            {/* <TouchableOpacity onPress={() => setDspSpecTruckDet(true)} style={{ backgroundColor: "green" }} >
                <ThemedText> Click here Select Truck Details </ThemedText>
            </TouchableOpacity> */}

            {/* <SpecifyTruckDetails
                dspSpecTruckDet={dspSpecTruckDet}
                setDspSpecTruckDet={setDspSpecTruckDet}
                // Truck Tonnage
                dspTruckCpacity={dspTruckCpacity}
                setDspTruckCapacity={setDspTruckCapacity}
                truckCapacity={truckCapacity}
                setTruckCapacity={setTruckCapacity}
                // Selecting Truck Type
                selectedTruckType={selectedTruckType}
                setSelectedTruckType={setSelectedTruckType}
                otherTruckType={otherTruckType}
                setOtherTruckType={setOtherTruckType}
                // Selecting A country and location
                location={locationTruckS}
                setLocation={setLocationTruckS}
                intOpLoc={intOpLocTruckS}
                setIntOpLoc={setIntOpLocTruckS}
                setLocaOpLoc={setLocaOpLocTruckS}
                locaOpLoc={locaOpLocTruckS}
            /> */}












            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: wp(6), alignItems: 'center' }}>
                {['Truck Details', 'Load Details', 'Return Load', 'Contract Details'].map((stepLabel, index) => (
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
                    <ScrollView>

                        <View></View>

                        <View style={{ padding: 4, gap: wp(5), marginTop: wp(4) }}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Truck Details
                            </ThemedText>

                            <Divider />

                            <View style={styles.viewMainDsp}>
                                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                                    Where Truck Operates
                                </ThemedText>
                                <View style={{ gap: wp(3), padding: wp(3), backgroundColor: backgroundLight, borderRadius: wp(4) }}>
                                    <TouchableNativeFeedback onPress={() => setLocation('international')}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
                                                International
                                            </ThemedText>
                                            <CheckBox
                                                checked={location === 'international'}
                                                onPress={() => setLocation('international')}
                                                uncheckedIcon={<Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />}
                                                checkedIcon={<EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />}
                                                containerStyle={{ padding: 0 }}
                                            />
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback onPress={() => setLocation('local')}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
                                                Local
                                            </ThemedText>
                                            <CheckBox
                                                checked={location === 'local'}
                                                onPress={() => setLocation('local')}
                                                uncheckedIcon={<Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />}
                                                checkedIcon={<EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />}

                                                containerStyle={{ padding: 0 }}
                                            />
                                        </View>
                                    </TouchableNativeFeedback>

                                </View>








                                <Divider />


                              

                                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, marginTop: wp(4) }}>
                                    Truck Config
                                </ThemedText>

                                <ScrollView horizontal style={{ marginVertical: wp(3) }}>
                                    {["single Axle ", "tandem", "triaxle", "MultiAxle"].map(config => (
                                        <TouchableOpacity
                                            key={config}
                                            onPress={() => setTruckConfig(config)}
                                            style={{
                                                backgroundColor: truckConfig === config ? "green" : "red",
                                                margin: 6,
                                                padding: wp(2),
                                                borderRadius: wp(2),
                                            }}
                                        >
                                            <ThemedText>{config}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                              

                                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, marginTop: wp(4) }}>
                                    Truck Suspension
                                </ThemedText>

                                <ScrollView horizontal style={{ marginVertical: wp(3) }}>
                                    {["Link", "Super Link", "Air suspension", "mechanical steel", "Other"].map(suspension => (
                                        <TouchableOpacity
                                            key={suspension}
                                            onPress={() => setTruckSuspension(suspension)}
                                            style={{
                                                backgroundColor: truckSuspension === suspension ? "green" : "red",
                                                margin: 6,
                                                padding: wp(2),
                                                borderRadius: wp(2),
                                            }}
                                        >
                                            <ThemedText>{suspension}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {truckSuspension === "Other" && (
                                    <View style={{ marginTop: wp(2) }}>
                                        <Input
                                            value={otherTruckSuspension}
                                            placeholder="Specify Suspension Type"
                                            onChangeText={setOtherTruckSuspension}
                                        />
                                    </View>
                                )}

                                <Divider />













                                <Divider />

                                <ThemedText type="defaultSemiBold" style={{ textAlign: 'center', marginVertical: wp(4) }}>
                                    Select Truck Type
                                </ThemedText>

                                <View style={{ gap: wp(3), padding: wp(3), backgroundColor: backgroundLight, borderRadius: wp(4) }}>
                                    {truckTypes.map((truck, index) =>
                                        <>
                                            <TouchableNativeFeedback key={index} onPress={() => setSelectedTruckType(truck)}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(3) }}>
                                                    <Image source={truck.image} style={{ height: wp(25), width: wp(35), borderRadius: wp(2) }} />
                                                    <View style={{ flex: 1 }}>
                                                        <ThemedText type="subtitle" style={{ flex: 1, textDecorationLine: 'underline' }}>
                                                            {truck.name}
                                                        </ThemedText>
                                                        <ThemedText type="default" style={{ flex: 1 }}>
                                                            {truck.description}
                                                        </ThemedText>
                                                    </View>
                                                    <CheckBox
                                                        containerStyle={{ padding: wp(0), marginHorizontal: 0 }}
                                                        checked={selectedTruckType?.id === truck.id}
                                                        onPress={() => setSelectedTruckType(truck)}
                                                        uncheckedIcon={<Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />}
                                                        checkedIcon={<EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />}
                                                    />
                                                </View>
                                            </TouchableNativeFeedback>
                                            {truckTypes.length > index + 1 &&
                                                <Divider style={{ marginVertical: wp(0) }} />
                                            }
                                        </>
                                    )}
                                </View>


                                {selectedTruckType?.name === "Other" && <View>
                                    <ThemedText>Name of the other loading area</ThemedText>
                                    <Input
                                        value={otherTruckType}
                                        placeholder="Enter name of loading area"
                                        onChangeText={setOtherTruckType}
                                        style={{}}
                                    />
                                </View>}




                                {selectedTruckType?.name === "Tanker" && <View>
                                    {tankerTypes.map((truck, index) => (
                                        <TouchableNativeFeedback key={truck.id} onPress={() => setTypeOfTanker(truck)} >
                                            <View style={{ margin: 9,backgroundColor:"green" }} >
                                                <ThemedText  >{truck.name}</ThemedText>
                                                <ThemedText >{truck.description}</ThemedText>
                                                {truck.products && truck.products.length > 0 && (
                                                    <ThemedText >Products: {truck.products.join(', ')}</ThemedText>
                                                )}

                                            </View>
                                        </TouchableNativeFeedback>
                                    ))}
                                </View>}
                                <Divider />




                                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, marginBottom: wp(3) }}>
                                    Truck Capacity
                                </ThemedText>



                                {selectedTruckType?.name !== "Tanker" && <ThemedText type="defaultSemiBold" style={{ textAlign: 'center', marginVertical: wp(4) }}>
                                    Select Tonnage
                                </ThemedText>}
                                {selectedTruckType?.name !== "Tanker" && <View style={{ gap: wp(3), padding: wp(3), backgroundColor: backgroundLight, borderRadius: wp(4) }}>
                                    {tonneSizes.map((tonnesize, index) =>
                                        <>
                                            <TouchableNativeFeedback key={index} onPress={() => setTruckCapacity(tonnesize)}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
                                                        {tonnesize}
                                                    </ThemedText>
                                                    <CheckBox
                                                        containerStyle={{ padding: wp(1) }}
                                                        checked={truckCapacity === tonnesize}
                                                        onPress={() => setTruckCapacity(tonnesize)}
                                                        uncheckedIcon={<Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />}
                                                        checkedIcon={<EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />}
                                                    />
                                                </View>
                                            </TouchableNativeFeedback>
                                            {tonneSizes.length > index + 1 &&
                                                <Divider style={{ marginVertical: wp(0) }} />
                                            }
                                        </>
                                    )}


                                </View>}





                                {selectedTruckType?.name === "Tanker" && <ThemedText type="defaultSemiBold" style={{ textAlign: 'center', marginVertical: wp(4) }}>
                                    Select Litres
                                </ThemedText>}
                                {selectedTruckType?.name === "Tanker" && <View style={{ gap: wp(3), padding: wp(3), backgroundColor: backgroundLight, borderRadius: wp(4) }}>
                                    {litresCapacity.map((litres, index) =>
                                        <View key={index}>
                                            <TouchableNativeFeedback onPress={() => setDspTruckCapacity(litres)}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>
                                                        {litres}
                                                    </ThemedText>
                                                    <CheckBox
                                                        containerStyle={{ padding: wp(1) }}
                                                        checked={dspTruckCpacity === litres}
                                                        onPress={() => setDspTruckCapacity(litres)}
                                                        uncheckedIcon={<Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color={iconcolor} />}
                                                        checkedIcon={<EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color={iconcolor} />}
                                                    />
                                                </View>
                                            </TouchableNativeFeedback>
                                            {litresCapacity.length > index + 1 &&
                                                <Divider style={{ marginVertical: wp(0) }} />
                                            }
                                        </View>
                                    )}


                                </View>}





                            </View>
                            {/* <View style={styles.viewMainDsp}> */}
                            {/* <CountrySelector
                                location={location}
                                setLocation={setLocation}
                                intOpLoc={interOpCount}
                                setIntOpLoc={setIntOpLoc}
                                setLocaOpLoc={setLocaOpLoc}
                                locaOpLoc={locaOpCount}
                            /> */}

                            {/* <SlctTruckCapacity
                                dspTruckCpacity={dspTruckCpacity}
                                setDspTruckCapacity={setDspTruckCapacity}
                                truckTonnage={truckCapacity}
                                setTruckTonnage={setTruckCapacity}
                            /> */}
                            {/* <SpecifyTruckType
                                selectedTruckType={selectedTruckType}
                                setSelectedTruckType={setSelectedTruckType}
                                otherTruckType={otherTruckType}
                                setOtherTruckType={setOtherTruckType}
                            /> */}

                        </View>
                        <Divider />

                        <View style={styles.viewMainDsp}>
                            <Button onPress={() => setStep(step + 1)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                }
                {step === 1 &&
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
                                value={commodityFirst}
                                placeholder="First Commodity"
                                onChangeText={setCommodityFirst}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Second Commodity
                            </ThemedText>
                            <Input
                                value={commoditySecond}
                                placeholder="Second Commodity"
                                onChangeText={setCommoditySecond}
                                style={{}}
                            />

                            {dspCommodity && (
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Commodity
                                    </ThemedText>
                                    <Input
                                        value={commodityThird}
                                        placeholder="Third Commodity"
                                        onChangeText={setCommodityThird}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Commodity
                                    </ThemedText>
                                    <Input
                                        value={commodityFourth}
                                        placeholder="Fourth Commodity"
                                        onChangeText={setCommodityFourth}
                                        style={{}}
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
                                Payment
                            </ThemedText>
                            <ThemedText type="defaultSemiBold">
                                Payment Terms
                            </ThemedText>
                            <Input
                                value={paymentTerms}
                                placeholder="Payment Terms"
                                onChangeText={setPaymentTerms}
                                style={{}}
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
                                    value={locationFirst}
                                    placeholder={"First Location"}
                                    onChangeText={setLocationFirst}
                                    style={{}}
                                />
                                <ThemedText type="defaultSemiBold">
                                    Second Location
                                </ThemedText>
                                <Input
                                    value={locationSecond}
                                    placeholder={"Second Location"}
                                    onChangeText={setLocationSecond}
                                    style={{}}
                                />
                            </View>
                            {nowEnterLoca &&
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Location
                                    </ThemedText>
                                    <Input
                                        value={locationThird}
                                        placeholder={"Third Location"}
                                        onChangeText={setLocationThird}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Location
                                    </ThemedText>
                                    <Input
                                        value={locationFourth}
                                        placeholder={"Fourth Location"}
                                        onChangeText={setLocationFourth}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fifth Location
                                    </ThemedText>
                                    <Input
                                        value={locationFifth}
                                        placeholder={"Fifth Location"}
                                        onChangeText={setLocationFifth}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        FifSixthth Location
                                    </ThemedText>
                                    <Input
                                        value={locationSixth}
                                        placeholder={"Sixth Location"}
                                        onChangeText={setLocationSixth}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Seventh Location
                                    </ThemedText>
                                    <Input
                                        value={locationSeventh}
                                        placeholder={"Seventh Location"}
                                        onChangeText={setLocationSeventh}
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
                                                    value={locationSeventh}
                                                    placeholder="Seventh Location"
                                                    onChangeText={setLocationSeventh}
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
                            <Button onPress={() => setStep(0)} title="Back" />
                            <Button onPress={() => setStep(2)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                }
                {step === 2 &&
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
                                value={returnCommodityFirst}
                                placeholder="First Commodity"
                                onChangeText={setReturnCommodityFirst}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Second Commodity
                            </ThemedText>
                            <Input
                                value={returnCommoditySecond}
                                placeholder="Second Commodity"
                                onChangeText={setReturnCommoditySecond}
                                style={{}}
                            />

                            {dspReturnCommodity && (
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        Third Commodity
                                    </ThemedText>
                                    <Input
                                        value={returnCommodityThird}
                                        placeholder="Third Commodity"
                                        onChangeText={setReturnCommodityThird}
                                        style={{}}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        Fourth Commodity
                                    </ThemedText>
                                    <Input
                                        value={returnCommodityFourth}
                                        placeholder="Fourth Commodity"
                                        onChangeText={setReturnCommodityFourth}
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
                                value={returnPaymentTerms}
                                placeholder="Return Payment Terms"
                                onChangeText={setReturnPaymentTerms}
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
                                Return Solid First Rate
                            </ThemedText>
                            <Input
                                value={returnRateSolidFirst}
                                placeholder="Return Solid First Rate"
                                onChangeText={setReturnRateSolidFirst}
                                style={{}}
                            />
                            {dspReturnRate && (
                                <>
                                    <ThemedText type="defaultSemiBold">
                                        Return Solid Second Rate
                                    </ThemedText>
                                    <Input
                                        value={returnRateSolidSecond}
                                        placeholder="Return Solid Second Rate"
                                        onChangeText={setReturnRateSolidSecond}
                                        style={{}}
                                    />
                                </>
                            )}
                            <ThemedText type="defaultSemiBold">
                                Return Triaxle First Rate
                            </ThemedText>
                            <Input
                                value={returnRateTriaxleFirst}
                                placeholder="Return Triaxle First Rate"
                                onChangeText={setReturnRateTriaxleFirst}
                                style={{}}
                            />
                            {dspReturnRate && (
                                <>
                                    <ThemedText type="defaultSemiBold">
                                        Return Triaxle Second Rate
                                    </ThemedText>
                                    <Input
                                        value={returnRateTriaxleSecond}
                                        placeholder="Return Triaxle Second Rate"
                                        onChangeText={setReturnRateTriaxleSecond}
                                        style={{}}
                                    />
                                </>
                            )}
                            <ThemedText type="defaultSemiBold">
                                Return Links First Rate
                            </ThemedText>
                            <Input
                                value={returnRateLinksFirst}
                                placeholder="Return Links First Rate"
                                onChangeText={setReturnRateLinksFirst}
                                style={{}}
                            />
                            {dspReturnRate && (
                                <>
                                    <ThemedText type="defaultSemiBold">
                                        Return Links Second Rate
                                    </ThemedText>
                                    <Input
                                        value={returnRateLinksSecond}
                                        placeholder="Return Links Second Rate"
                                        onChangeText={setReturnRateLinksSecond}
                                        style={{}}
                                    />
                                </>

                            )}
                            <ThemedText type="defaultSemiBold">
                                Return Super Link First Rate
                            </ThemedText>
                            <Input
                                value={returnRateSuperLinkFirst}
                                placeholder="Return Super Link First Rate"
                                onChangeText={setReturnRateSuperLinkFirst}
                                style={{}}
                            />
                            {dspReturnRate && (
                                <>
                                    <ThemedText type="defaultSemiBold">
                                        Return Super Link Second Rate
                                    </ThemedText>
                                    <Input
                                        value={returnRateSuperLinkSecond}
                                        placeholder="Return Super Link Second Rate"
                                        onChangeText={setReturnRateSuperLinkSecond}
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
                            <Button onPress={() => setStep(1)} title="Back" />
                            <Button onPress={() => setStep(3)} title="Next" colors={{ text: '#0f9d58', bg: '#0f9d5824' }} />
                        </View>
                    </ScrollView>
                }
                {step === 3 &&
                    <ScrollView>

                        <View style={{ padding: 4, gap: wp(5), marginVertical: wp(4) }}>
                            <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                Contract Details
                            </ThemedText>
                        </View>

                        <Divider />
                        <View style={styles.viewMainDsp}>
                            <ThemedText type="defaultSemiBold">
                                Fuel
                            </ThemedText>
                            <Input
                                value={fuelAvailability}
                                placeholder="Fuel"
                                onChangeText={setFuelAvailability}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Loads Per Week
                            </ThemedText>
                            <Input
                                value={loadsPerWeek}
                                placeholder="Loads Per Week"
                                onChangeText={setLoadsPerWeek}
                                style={{}}
                            />
                            <ThemedText type="defaultSemiBold">
                                Contract Duration
                            </ThemedText>
                            <Input
                                value={contractDuration}
                                placeholder="Contract Duration"
                                onChangeText={setContractDuration}
                                style={{}}
                            />


                            <ThemedText type="defaultSemiBold">
                                Starting Date
                            </ThemedText>
                            <Input
                                value={startingDate}
                                placeholder="Starting Date"
                                onChangeText={setStartingDate}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Booking Closing Date
                            </ThemedText>
                            <Input
                                value={bookingClosingDate}
                                placeholder="Booking Closing Date"
                                onChangeText={setBookingClosingDate}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Can You Renew Contract for how long
                            </ThemedText>
                            <Input
                                value={contractRenewal}
                                placeholder="Can You Renew Contract for how long"
                                onChangeText={setContractRenewal}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Alert Message
                            </ThemedText>
                            <Input
                                value={alertMessage}
                                placeholder="Alert Message"
                                onChangeText={setAlertMessage}
                                style={{}}
                            />

                            <ThemedText type="defaultSemiBold">
                                Additional Info
                            </ThemedText>
                            <Input
                                value={additionalInfo}
                                placeholder="Additional Info"
                                onChangeText={setAdditionalInfo}
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
                                                {internationalCountries.length > 0 && (
                                                    <ThemedText>Selected: {internationalCountries.join(", ")}</ThemedText>
                                                )}
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
                        </View>

                        <Divider />
                        <View style={styles.viewMainDsp}>
                            <Button onPress={toggleDspCheckout} title="Submit" />
                        </View>
                    </ScrollView>
                }
            </View>


            <ErrorOverlay
                visible={dspLoadDErr}
                title="Missing important details on load"
                errors={[
                    !commodityFirst && "Enter at least one commodity",
                    // !formDataScnd.paymentTerms && "Enter the payment terms",
                    // !formData.location.frst && "Enter from location or first location",
                    // !formData.location.scnd && "Enter destination location",
                    // !formData.trckRequired && "Enter at least one type of truck required",
                    // !formData.otherRequirements.frst && "Enter at least one requirement",
                    // !formData.rate.solidFrst && "Enter the solid rate",
                ].filter(Boolean) as string[]}
                onClose={() => setLoadDspError(false)}
            />

            <ErrorOverlay
                visible={dspContrDErro}
                title="Missing important details on contracts"
                errors={[
                    !loadsPerWeek && "Enter loads per week",
                    !contractDuration && "Enter contract duration",
                    !startingDate && "Enter when the contract is starting",
                    !fuelAvailability && "Enter if fuel is available and how it's distributed",
                    !bookingClosingDate && "Enter booking closing date",
                    !locaOpCount && interOpCount.length === 0 && "Select country the loads will operate",
                ].filter(Boolean) as string[]}
                onClose={() => setContractDErr(false)}
            />

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
