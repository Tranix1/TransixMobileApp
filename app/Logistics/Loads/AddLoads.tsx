import React, { useState } from "react";
import { db, auth } from "../../components/config/fireBase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { View, Alert, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, ScrollView } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { LoadFormData } from "@/types/types";

import ScreenWrapper from '@/components/ScreenWrapper';
import Input from "@/components/Input";
import { ThemedText } from "@/components/ThemedText";

interface RouteParams {
isVerified: boolean;
    verifyOngoing: boolean;
}

const AddLoadDB: React.FC<{ route: { params: RouteParams } }> = ({ route }) => {
    const isVerified= true
    const verifyOngoing = true
    
    const [error, setError] = useState<string>("");
    const loadsCollection = collection(db, "Loads");
    const [formData, setFormData] = useState< LoadFormData>({
        typeofLoad: "",
        fromLocation: "",
        toLocation: "",
        ratePerTonne: "",
        paymentTerms: "",
        requirements: "",
        alertMsg: "",
        fuelAvai: "",
        additionalInfo: "",
        links: "",
        triaxle: "",
        returnRate: "",
        returnLoad: "",
        returnTerms: ""
    });

    const [currency, setCurrency] = useState<boolean>(true);
    const toggleCurrency = () => {
        setCurrency(prev => !prev);
    };

    const [trailerConfig, settrailerConfig] = useState<boolean>(false);
    const toggleTrailerConfig = () => {
        settrailerConfig(prev => !prev);
    };

    const [perTonne, setPerTonne] = useState<boolean>(false);
    const togglePerTonne = () => {
        setPerTonne(prev => !prev);
    };

    const [activeLoading, setActiveLoading] = useState<boolean>(false);
    const toggleActiveLoading = () => {
        setActiveLoading(prev => !prev);
    };

    const [location, setlocation] = useState<string>("International");
    const [localLoads, setLocalLoads] = useState<boolean>(false);

    const toggleLocalLoads = () => {
        setLocalLoads(prevState => !prevState);
    };

    const specifyLocation = (loc: string) => {
        setlocation(loc);
        setLocalLoads(false);
    };

    const [alertMsgD, setAlertMsgD] = useState<boolean>(false);
    const toggleAlertMsgD = () => {
        setAlertMsgD(prev => !prev);
    };

    const [fuelAvaD, setfuelAvD] = useState<boolean>(false);
    const toggleFuelMsgD = () => {
        setfuelAvD(prev => !prev);
    };


    const [returnLoadDisplay, setReturnLoadDisplay] = useState<boolean>(false);

    const toggleDspRetunLoad = () => {
        setReturnLoadDisplay(prev => !prev);
    };

    const [roundTrip, setRoundTrip] = useState<boolean>(false);

    const toggleRundTripAlert = () => {
        setRoundTrip(prev => !prev);
    };

    const handleTypedText = (value: string, fieldName: keyof  LoadFormData) => {
        let parsedValue: string | number | null = value;

        if (fieldName === 'ratePerTonne' || fieldName === 'links' || fieldName === 'triaxle' || fieldName === 'returnRate') {
            parsedValue = value === "" ? null : Number(value);
            if (isNaN(parsedValue as number)) {
                parsedValue = value; // Keep as string if NaN
            }
        }

        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: parsedValue,
        }));
    };

    const [spinnerItem, setSpinnerItem] = useState<boolean>(false);

    const handleSubmit = async () => {

      

        if (returnLoadDisplay) {
            if (!formData.returnLoad || !formData.returnRate || !formData.returnTerms) {
                alert("Whats the cargo rate and terms for return load");
                return;
            }
        } else if (alertMsgD && !formData.alertMsg) {
            alert("Alert is On Write the Alert Message");
            return;
        } else if (fuelAvaD && !formData.fuelAvai) {
            alert("You indicated There is Fuel ");
            return;
        }

        if (!formData.typeofLoad || !formData.toLocation || !formData.fromLocation || !formData.paymentTerms) {
            alert('Enter Rate , Commodity,Routes and Payment terms');
            return;
        } else if ((formData.ratePerTonne === null || formData.ratePerTonne === "") && (formData.links === null || formData.links === "") && (formData.triaxle === null || formData.triaxle === "")) {
            alert("Enter the rate");
            return;
        } 

        setSpinnerItem(true);

        const userId = auth.currentUser?.uid;

        setError('');
        try {
            const docRef = await addDoc(loadsCollection, {
                // userId: userId, // Add the user ID to the document
                // companyName: username,
                // contact: contact,
                // expoPushToken: expoPushToken,
                deletionTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
                // timeStamp: serverTimestamp(),
                isVerified: isVerified,
                currency: currency,
                perTonne: perTonne,
                activeLoading: activeLoading,
                location: location,
                roundTrip: roundTrip,
                ...formData
            });

            setFormData({
                typeofLoad: "",
                fromLocation: "",
                toLocation: "",
                ratePerTonne: "",
                paymentTerms: "",
                requirements: "",
                alertMsg: "",
                fuelAvai: "",
                additionalInfo: "",
                links: "",
                triaxle: "",
                returnRate: "",
                returnLoad: "",
                returnTerms: ""
            });
            // setAlertMsgD(false);
            setfuelAvD(false);
            setReturnLoadDisplay(false);
            setRoundTrip(false);
            setSpinnerItem(false);
            setPerTonne(false);
            setActiveLoading(false);
        } catch (err: any) {
            setSpinnerItem(false);
            setError(err.toString());
        }
    };
    return(
        <ScreenWrapper>

        <View style={{paddingHorizontal:20}} >
                {verifyOngoing &&  <TouchableOpacity style={{ marginBottom: 4, padding: 7, borderWidth: 3, borderColor: '#6a0c0c', borderRadius: 8, shadowColor: '#6a0c0c',
                shadowOffset: { width: 3, height: 2 },
                shadowOpacity: 0.7,
                shadowRadius: 5, margin: 10 }}>
                {<View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white', zIndex: 66 }}>
                    <MaterialIcons name="verified" size={29} color="green" />
                </View>}
                <ThemedText style={{ alignSelf: 'flex-start', fontSize: 13, color: 'green', fontStyle: 'italic' }}>Ongoing Verification</ThemedText>
                <ThemedText style={{ textAlign: 'center', fontSize: 17, color: "#6a0c0c", fontWeight: '500' }}>
                    If You Are Legit
                </ThemedText>
                <ThemedText>Click Here to Verify Your Business and Loads</ThemedText>
            </TouchableOpacity>}

                     <Input
                        value={formData.typeofLoad}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Type of Load"
                        onChangeText={(text) => handleTypedText(text, 'typeofLoad')}
                    />

                    <Input
                        value={formData.fromLocation}
                        placeholderTextColor="#6a0c0c"
                        placeholder="From Loacation"
                        onChangeText={(text) => handleTypedText(text, 'fromLocation')}
                    />

                    <Input
                        value={formData.toLocation}
                        placeholderTextColor="#6a0c0c"
                        placeholder="To location"
                        onChangeText={(text) => handleTypedText(text, 'toLocation')}
                    />

      <ScrollView showsVerticalScrollIndicator={false} >

                {!localLoads && <View>

                    <Input
                        value={formData.typeofLoad}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Type of Load"
                        onChangeText={(text) => handleTypedText(text, 'typeofLoad')}
                    />

                    <Input
                        value={formData.fromLocation}
                        placeholderTextColor="#6a0c0c"
                        placeholder="From Loacation"
                        onChangeText={(text) => handleTypedText(text, 'fromLocation')}
                    />

                    <Input
                        value={formData.toLocation}
                        placeholderTextColor="#6a0c0c"
                        placeholder="To location"
                        onChangeText={(text) => handleTypedText(text, 'toLocation')}
                    />







                    {!trailerConfig && <View style={{ flexDirection: 'row', alignItems: 'center',width:250 }}>

                        <View>
                            <TouchableOpacity onPress={toggleCurrency}>
                                {currency ? <ThemedText style={styles.buttonIsFalse} >USD</ThemedText> :
                                    <ThemedText style={styles.bttonIsTrue}>Rand </ThemedText>}
                            </TouchableOpacity>
                        </View>

                        <Input
                            onChangeText={(text) => handleTypedText(text, 'ratePerTonne')}
                            value={formData.ratePerTonne}
                            keyboardType="numeric"
                            placeholderTextColor="#6a0c0c"
                            style={{ height: 40, borderBottomWidth: 2, borderBottomColor: "#6a0c0c", marginBottom: 10, paddingLeft: 20, width: 180 }}
                            placeholder="Enter rate here"
                        />
                        <TouchableOpacity onPress={togglePerTonne} >
                            {perTonne ? <ThemedText style={styles.bttonIsTrue} >Per tonne</ThemedText> :
                                <ThemedText style={styles.buttonIsFalse}>Per tonne</ThemedText>}
                        </TouchableOpacity>
                    </View>}


                    <TouchableOpacity onPress={toggleTrailerConfig} style={trailerConfig ? styles.bttonIsTrue : styles.buttonIsFalse} >
                        <ThemedText style={trailerConfig ? { color: 'white' } : null}  >Trailer config</ThemedText>
                    </TouchableOpacity>




                    {trailerConfig && <View>

                        <View >
                            <ThemedText style={{ fontSize: 19, }} >Links </ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                <View>
                                    <TouchableOpacity onPress={toggleCurrency}>
                                        {currency ? <ThemedText style={styles.buttonIsFalse} >USD</ThemedText> :
                                            <ThemedText style={styles.bttonIsTrue}>Rand </ThemedText>}
                                    </TouchableOpacity>
                                </View>

                                <Input
                                    onChangeText={(text) => handleTypedText(text, 'links')}
                                    value={formData.links}
                                    keyboardType="numeric"
                                    placeholderTextColor="#6a0c0c"
                                    style={{ height: 40, borderBottomWidth: 2, borderBottomColor: "#6a0c0c", marginBottom: 10, paddingLeft: 20, width: 180 }}
                                    placeholder="Enter Links rate"
                                />
                                <TouchableOpacity onPress={togglePerTonne} >
                                    {perTonne ? <ThemedText style={styles.bttonIsTrue} >Per tonne</ThemedText> :
                                        <ThemedText style={styles.buttonIsFalse}>Per tonne</ThemedText>}
                                </TouchableOpacity>
                            </View>
                        </View>


                        <View >
                            <ThemedText style={{ fontSize: 19, }}>Triaxle</ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                <View>
                                    <TouchableOpacity onPress={toggleCurrency}>
                                        {currency ? <ThemedText style={styles.buttonIsFalse} >USD</ThemedText> :
                                            <ThemedText style={styles.bttonIsTrue}>Rand </ThemedText>}
                                    </TouchableOpacity>
                                </View>

                                <Input
                                    onChangeText={(text) => handleTypedText(text, 'triaxle')}
                                    value={formData.triaxle}
                                    keyboardType="numeric"
                                    placeholderTextColor="#6a0c0c"
                                    style={{ height: 40, borderBottomWidth: 2, borderBottomColor: "#6a0c0c", marginBottom: 10, paddingLeft: 20, width: 180 }}
                                    placeholder="Enter triaxle rate"
                                />
                                <TouchableOpacity onPress={togglePerTonne} >
                                    {perTonne ? <ThemedText style={styles.bttonIsTrue} >Per tonne</ThemedText> :
                                        <ThemedText style={styles.buttonIsFalse}>Per tonne</ThemedText>}
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>}







                    {spinnerItem && <ActivityIndicator size={36} />}
                    {error && <ThemedText>{error} retry </ThemedText>}

                    <Input
                        value={formData.paymentTerms}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Payment Terms"
                        onChangeText={(text) => handleTypedText(text, 'paymentTerms')}
                    />
                    <Input
                        value={formData.requirements}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Requirements"
                        onChangeText={(text) => handleTypedText(text, 'requirements')}
                    />

                    <Input
                        value={formData.additionalInfo}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Additional Information"
                        onChangeText={(text) => handleTypedText(text, 'additionalInfo')}
                    />
                    {alertMsgD && <Input
                        value={formData.alertMsg}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Alert Message"
                        onChangeText={(text) => handleTypedText(text, 'alertMsg')}
                    />}
                    {fuelAvaD && <Input
                        value={formData.fuelAvai}
                        placeholderTextColor="#6a0c0c"
                        placeholder="Fuel Availability"
                        onChangeText={(text) => handleTypedText(text, 'fuelAvai')}
                    />}

                    {returnLoadDisplay && <View>

                        <Input
                            value={formData.returnLoad}
                            placeholderTextColor="#6a0c0c"
                            placeholder="Return Load"
                            onChangeText={(text) => handleTypedText(text, 'returnLoad')}
                        />
                        <Input
                            value={formData.returnRate}
                            placeholderTextColor="#6a0c0c"
                            placeholder="Return Rate"
                            onChangeText={(text) => handleTypedText(text, 'returnRate')}
                            keyboardType="numeric"
                        />
                        <Input
                            value={formData.returnTerms}
                            placeholderTextColor="#6a0c0c"
                            placeholder="Return Terms"
                            onChangeText={(text) => handleTypedText(text, 'returnTerms')}
                        />
                    </View>}


                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }} >
                        {<TouchableOpacity onPress={toggleAlertMsgD} style={alertMsgD ? styles.bttonIsTrue : styles.buttonIsFalse} >

                            <ThemedText style={alertMsgD ? { color: 'white' } : null} >Alert </ThemedText>
                        </TouchableOpacity>}

                        {<TouchableOpacity onPress={toggleFuelMsgD} style={fuelAvaD ? styles.bttonIsTrue : styles.buttonIsFalse} >
                            <ThemedText style={fuelAvaD ? { color: 'white' } : null} >Fuel </ThemedText>
                        </TouchableOpacity>}


                        {<TouchableOpacity onPress={toggleDspRetunLoad} style={returnLoadDisplay ? styles.bttonIsTrue : styles.buttonIsFalse} >
                            <ThemedText style={returnLoadDisplay ? { color: 'white' } : null} >Return Load </ThemedText>
                        </TouchableOpacity>}

                        {<TouchableOpacity onPress={toggleRundTripAlert} style={roundTrip ? styles.bttonIsTrue : styles.buttonIsFalse} >
                            <ThemedText style={roundTrip ? { color: 'white' } : null} >Round Trip</ThemedText>
                        </TouchableOpacity>}

                    </View>
                </View>}

                {localLoads && <View style={{ alignSelf: 'center' }} >
                    <TouchableOpacity onPress={() => specifyLocation('Zimbabwe')} style={styles.buttonStyle} >
                        <ThemedText style={{ color: '#6a0c0c' }}>Zimbabwe </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('SouthAfrica')} style={styles.buttonStyle} >
                        <ThemedText style={{ color: '#6a0c0c' }} >  South Africa</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('Namibia')} style={styles.buttonStyle}>
                        <ThemedText style={{ color: '#6a0c0c' }}>Namibia </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('Tanzania')} style={styles.buttonStyle}>
                        <ThemedText style={{ color: '#6a0c0c' }}> Tanzania</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('Mozambique')} style={styles.buttonStyle}>
                        <ThemedText style={{ color: '#6a0c0c' }}>Mozambique </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('Zambia')} style={styles.buttonStyle}>
                        <ThemedText style={{ color: '#6a0c0c' }}> Zambia</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('Botswana')} style={styles.buttonStyle} >
                        <ThemedText style={{ color: '#6a0c0c' }}>Botswana </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => specifyLocation('Malawi')} style={styles.buttonStyle} >
                        <ThemedText style={{ color: '#6a0c0c' }}>Malawi </ThemedText>
                    </TouchableOpacity>

                </View>
                }

                {location !== "International" && <ThemedText>local load for {location} </ThemedText>}
                <View style={{ flexDirection: 'row', marginBottom: 6, justifyContent: 'space-between', width: 200, alignSelf: 'center' }}>

                    <TouchableOpacity onPress={toggleActiveLoading}>
                        {!activeLoading ? <ThemedText style={styles.buttonIsFalse}>Active Loading</ThemedText> :
                            <ThemedText style={styles.bttonIsTrue}>Active Loading </ThemedText>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleLocalLoads} style={{}}>
                        <ThemedText style={styles.buttonIsFalse}>Local loads </ThemedText>
                    </TouchableOpacity>

                </View>
                {!spinnerItem ? <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: '#6a0c0c', width: 80, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                    <ThemedText style={{ color: 'white' }}>submit</ThemedText>
                </TouchableOpacity>
                    : <ThemedText style={{ alignSelf: "center", fontStyle: 'italic' }}>Load is being added Please wait</ThemedText>
                }

                <View style={{ height: 300 }} ></View>
            </ScrollView>





        </View>

        </ScreenWrapper>
    )

};

export default React.memo(AddLoadDB);

const styles = StyleSheet.create({
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
    buttonSelectStyle: {
        backgroundColor: "#6a0c0c",
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        marginBottom: 15,
        borderRadius: 10
    },
    buttonIsFalse: {
        borderWidth: 1,
        borderColor: '#6a0c0c',
        paddingLeft: 4,
        paddingRight: 4,
        alignSelf: 'center'

        //  marginLeft : 6
    },
    bttonIsTrue: {
        backgroundColor: '#6a0c0c',
        paddingLeft: 4,
        paddingRight: 4,
        color: 'white',
        alignSelf: 'center'

    }
});
