import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Animated, } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { db, auth } from "../../components/config/fireBase";
import { collection, addDoc, } from 'firebase/firestore';

const { Paynow } = require("paynow");

import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
// import ecocashLogo from "../../../assets/images/ECOCASH-logo(1).jpg" // Removed as this path is incorrect.  Handled with require below.
import { useThemeColor } from '@/hooks/useThemeColor'
import Input from "@/components/Input";
import Heading from "@/components/Heading";
import { wp } from "@/constants/common";

interface FormData {
    buzLoc: string;
    phoneNumFrst: string;
    contactEmail: string;
    addressWithProof: string;
}

interface DocumentAsset {
    name: string
    uri: string;
    size: number;
    // Add any other properties here
}

const ApplyVerification = () => {

    const background = useThemeColor("background");
    const [formData, setFormData] = useState<FormData>({
        buzLoc: "",
        phoneNumFrst: "",
        contactEmail: "",
        addressWithProof: "",

    });

    const handleTypedText = (value: string, fieldName: keyof FormData) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: value,
        }));
    };

    const [spinnerItem, setSpinnerItem] = useState<boolean>(false);
    const [selectedDocuments, setSelectedDocumentS] = useState<DocumentAsset[]>([]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'], // allow only PDFs and images
                copyToCacheDirectory: true, // optional: ensures the file is accessible in your app's cache
            });

            if (result.canceled) return;

            const assets = result.assets;
            if (!assets || assets.length === 0) {
                alert('No assets found in the picker result');
                return;
            }

            const firstAsset = assets[assets.length - 1];

            if (!firstAsset.uri) {
                alert('Selected document URI is undefined');
                return;
            }

            if (firstAsset.size !== undefined && firstAsset.size > 0.5 * 1024 * 1024) {
                alert('The selected document must not be more than 0.5MB.');
                return;
            }

            setSelectedDocumentS((prevDocs) => [...prevDocs, firstAsset] as DocumentAsset[]);
        } catch (error) {
            console.error('Error picking document:', error);
            alert('An error occurred while picking the document.');
        }
    };


    const [countryCode, setCountryCode] = useState<string | null>(null);


    const [enterCompDw, setEntCompDe] = useState<boolean>(true);
    const [directorDetails, setDirectorDet] = useState<boolean>(false);
    const [addressWithProof, setAdressWithProof] = useState<boolean>(false);
    const [paymentPage, setPaymentPage] = useState<boolean>(false);


    function goToPersnalInfoF() {
        setEntCompDe(false);
        setDirectorDet(true);
    }
    function secondPage() {
        setDirectorDet(false);
        setAdressWithProof(true);
    }

    function dspPaymentPage() {
        setAdressWithProof(false);
        setPaymentPage(true);
    }


    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number | null>(null);

    const handleSelect = (item: string) => {
        setSelectedItem(item);

        if (item === "1 month") {
            setTotalPrice(5);
        } else if (item === "2 months") {
            setTotalPrice(10);
        } else if (item === "3 months") {
            setTotalPrice(14);
        } else if (item === "6 months") {
            setTotalPrice(27);
        } else if (item === "9 months") {
            setTotalPrice(40);
        } else if (item === "12 months") {
            setTotalPrice(50);
        } else if (item === "2 years") {
            setTotalPrice(90);
        } else if (item === "3 years") {
            setTotalPrice(125);
        } else if (item === "4 years") {
            setTotalPrice(160);
        } else if (item === "5 years") {
            setTotalPrice(200);
        }

    };

    const getItemStyle = (item: string) => {
        if (selectedItem === item) {
            return [styles.item, styles.selected];
        }
        return styles.item;
    };

    const getSelectedStyle = (item: string) => {
        if (selectedItem === item) {
            return styles.selectedItem;
        }
        return null;
    };

    const DiscountView: React.FC<{ ogPrice: string, discPrice: string, remvedPerc: string }> = ({ ogPrice, discPrice, remvedPerc }) => (
        <View style={{ padding: 5 }}>
            <ThemedText style={{ fontSize: 12, fontStyle: 'italic', color: '#333' }}>{ogPrice}</ThemedText>
            <ThemedText style={{ fontSize: 12, fontStyle: 'italic', color: '#333' }}>{discPrice}</ThemedText>
            <ThemedText style={{ fontSize: 12, fontStyle: 'italic', color: '#333' }}>{remvedPerc}</ThemedText>
        </View>
    )

    const [ecocashPhoneNum, setEcocashPhneNum] = useState('');
    const animatedValue = new Animated.Value(100);

    const startAnimation = () => {
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    const gitCollection = collection(db, "verificationDetails");
    async function handleSubmit(pollUrl: string) {
        setSpinnerItem(true)

        const userId = auth.currentUser?.uid;
        try {
            const docRef = await addDoc(gitCollection, {
                userId: userId,
                pollUrl: pollUrl,
            });

            setFormData({
                buzLoc: "",
                phoneNumFrst: "",
                contactEmail: "",
                addressWithProof: "",

            });
            setSpinnerItem(false)

        } catch (err: any) {
            setSpinnerItem(false)
            console.error(err.toString());
        }
    }

    let uniqueRecepipt = Math.floor(100000000000 + Math.random() * 900000000000).toString()
    async function handleSubmission() {
        let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");

        let payment = paynow.createPayment(`${uniqueRecepipt}r`, "kelvinyaya8@gmail.com");

        paynow.resultUrl = "https://transix.net";
        paynow.returnUrl = "https://transix.net";

        payment.add(`verification:${selectedItem}`, totalPrice);

        try {
            let response = await paynow.sendMobile(payment, "0771111111", "ecocash");

            if (response.success) {
                let pollUrl = response.pollUrl;
                console.log("✅ Payment initiated! Polling for status...");

                let pollInterval = setInterval(async () => {
                    try {
                        let status = await paynow.pollTransaction(pollUrl);
                        console.log("🔄 Checking payment status:", status.status);

                        if (status.status === "paid") {
                            console.log("✅ Payment Complete!");
                            handleSubmit(pollUrl)
                            clearInterval(pollInterval);
                        } else if (status.status === "cancelled" || status.status === "failed") {
                            console.log("❌ Payment Failed or Cancelled.");
                            clearInterval(pollInterval);
                        }
                    } catch (pollError) {
                        console.log("⚠️ Polling Error:", pollError);
                        clearInterval(pollInterval);
                    }
                }, 10000);
            } else {
                console.log("❌ Error:", response.error);
            }
        } catch (error) {
            console.log("⚠️ Payment Error:", error);
        }
    }

    const [dspInfo, setDspInfo] = React.useState(true)
    return (
        <ScreenWrapper >

            <Heading page="Apply Verification" />
        {dspInfo && (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: background,
      padding: 20,
      justifyContent: "center",
    }}
  >
    <ThemedText style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
      Get Verified Now
    </ThemedText>

    <ThemedText style={{ fontSize: 14, marginBottom: 20, textAlign: "center" }}>
      Please prepare the following requirements in PDF format.
    </ThemedText>

    <View style={{ marginBottom: 15 }}>
      <ThemedText style={{ fontWeight: "bold", marginBottom: 5 }}>Business Documents</ThemedText>
      <ThemedText>• Certificate of Incorporation</ThemedText>
      <ThemedText>• Board Resolution</ThemedText>
      <ThemedText>• Tax Clearance</ThemedText>
    </View>

    <View style={{ marginBottom: 15 }}>
      <ThemedText style={{ fontWeight: "bold", marginBottom: 5 }}>Authorized Business Director</ThemedText>
      <ThemedText>• National ID or Passport</ThemedText>
      <ThemedText>• Contact email and phone number</ThemedText>
    </View>

    <View style={{ marginBottom: 15 }}>
      <ThemedText style={{ fontWeight: "bold", marginBottom: 5 }}>Business Location</ThemedText>
      <ThemedText>• Proof of Residence</ThemedText>
      <ThemedText>• Full Business Address</ThemedText>
    </View>

    <ThemedText style={{ marginBottom: 20 }}>
      You will need funds for your subscription. You can also claim your first 3 months free.
    </ThemedText>

    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#e74c3c",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        }}
        onPress={() => router.back()}
      >
        <ThemedText style={{ color: "white", fontWeight: "bold" }}>Not Yet</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#27ae60",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 8,
        }}
        onPress={() => setDspInfo(false)}
      >
        <ThemedText style={{ color: "white", fontWeight: "bold" }}>Understood</ThemedText>
      </TouchableOpacity>
    </View>
  </View>
)}


            <View style={{ padding: wp(2), paddingHorizontal: wp(4), backgroundColor: background, borderRadius: wp(20), shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 8, alignSelf: 'center' }} >

                {enterCompDw && <ThemedText style={{ color: 'green', textAlign: 'center' }} >PAGE 1/4</ThemedText>}
                {directorDetails && <ThemedText style={{ color: 'green', textAlign: 'center' }} >PAGE 2/4</ThemedText>}
                {addressWithProof && <ThemedText style={{ color: 'green', textAlign: 'center' }} >PAGE 3/4</ThemedText>}
                {paymentPage && <ThemedText style={{ color: 'green', textAlign: 'center' }} >PAGE 4/4</ThemedText>}
            </View>

            {enterCompDw && <View style={{ margin: 20 }}>

                {selectedDocuments[0] && <ThemedText style={{ color: 'green', fontWeight: 'bold', textAlign: "center", fontSize: 12 }} >certifacete of incoperation</ThemedText>}
                {selectedDocuments[0] && <ThemedText style={{ borderWidth: 1, borderColor: "#6a0c0c", padding: 5, textAlign: 'center', marginBottom: 15 }} >{selectedDocuments[0].name}</ThemedText>}

                {!selectedDocuments[0] && <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignSelf: 'center', marginBottom: 15, width: 200 }} >
                    <ThemedText style={{ backgroundColor: 'white', textAlign: 'center', color: "black" }}>Cerificate of incoperation</ThemedText>
                </TouchableOpacity>}

                {selectedDocuments[1] && <ThemedText style={{ color: 'green', fontWeight: 'bold', textAlign: "center", fontSize: 12 }} >Board Resolution</ThemedText>}
                {selectedDocuments[1] && <ThemedText style={{ borderWidth: 1, borderColor: "#6a0c0c", padding: 5, textAlign: 'center', marginBottom: 15 }}>{selectedDocuments[1].name}</ThemedText>}
                {selectedDocuments[0] && !selectedDocuments[1] && <ThemedText  >CR14, Memorandum of Association, Register of Directors </ThemedText>}
                {selectedDocuments[0] && !selectedDocuments[1] && <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignSelf: 'center', marginBottom: 15, width: 200 }} >
                    <ThemedText style={{ textAlign: 'center', backgroundColor: 'white', color: "black" }} >Board Resolution</ThemedText>
                </TouchableOpacity>}

                {selectedDocuments[2] && <ThemedText style={{ color: 'green', fontWeight: 'bold', textAlign: "center", fontSize: 12 }} >Tax clearance</ThemedText>}
                {selectedDocuments[2] && <ThemedText style={{ borderWidth: 1, borderColor: "#6a0c0c", padding: 5, textAlign: 'center', marginBottom: 15 }}>{selectedDocuments[2].name}</ThemedText>}
                {selectedDocuments[1] && !selectedDocuments[2] && <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignSelf: 'center', marginBottom: 15, width: 200 }} >
                    <ThemedText style={{ backgroundColor: 'white', color: "black" }} >Tax clearance</ThemedText>
                </TouchableOpacity>}



                {selectedDocuments[2] && <Input
                    value={formData.buzLoc}
                    placeholderTextColor="#6a0c0c"
                    placeholder="company adress"
                    onChangeText={(text) => handleTypedText(text, 'buzLoc')}
                />}

                {selectedDocuments.length === 3 && formData.buzLoc && (
                    <TouchableOpacity
                        onPress={goToPersnalInfoF}
                        style={{
                            height: 40,
                            width: 150,
                            backgroundColor: '#1E90FF',
                            borderRadius: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                            alignSelf: 'flex-end'
                        }}
                    >
                        <ThemedText style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</ThemedText>
                    </TouchableOpacity>
                )}
            </View>}


            {directorDetails && <View style={{ margin: 20 }}>
                <View style={{ padding: 10, alignSelf: 'center' }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 }}>
                        Director or Owner Details.
                    </ThemedText>
                    {!selectedDocuments[3] && <ThemedText style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>
                        The ID of a director or owner must match the details in the company documents.
                    </ThemedText>}
                </View>
                {selectedDocuments[3] && <ThemedText style={{ color: 'green', fontWeight: 'bold', textAlign: "center", fontSize: 12 }} >ID owner or director</ThemedText>}
                {selectedDocuments[3] && <ThemedText style={{ borderWidth: 1, borderColor: "#6a0c0c", padding: 5, textAlign: 'center', marginBottom: 20 }}>{selectedDocuments[2].name}</ThemedText>}
                {!selectedDocuments[3] && <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignSelf: 'center', marginBottom: 15, width: 200 }} >
                    <ThemedText style={{ backgroundColor: 'white', textAlign: 'center', color: "black" }} >National Id</ThemedText>
                </TouchableOpacity>}

                {selectedDocuments[3] && <View style={{ alignSelf: 'center' }} >



                    {countryCode && <ThemedText style={{ textAlign: 'center', color: 'green', fontWeight: 'bold', }} >Country Code : {countryCode}</ThemedText>}
                    {formData.phoneNumFrst && !countryCode && <ThemedText>Click select country to choose country code</ThemedText>}
                    <Input
                        value={formData.phoneNumFrst}
                        placeholderTextColor="#6a0c0c"
                        placeholder="phone number"
                        onChangeText={(text) => handleTypedText(text, 'phoneNumFrst')}
                        keyboardType="numeric"
                    />

                    <Input
                        value={formData.contactEmail}
                        placeholderTextColor="#6a0c0c"
                        placeholder="email"
                        onChangeText={(text) => handleTypedText(text, 'contactEmail')}
                    />
                </View>}

                {selectedDocuments[3] && formData.phoneNumFrst && formData.contactEmail && countryCode && <TouchableOpacity
                    onPress={secondPage}
                    style={{
                        height: 40,
                        width: 150,
                        backgroundColor: '#1E90FF',
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                        alignSelf: 'flex-end'
                    }}
                >
                    <ThemedText style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</ThemedText>
                </TouchableOpacity>}

            </View>}

            {spinnerItem && <ActivityIndicator size={36} />}

            {addressWithProof && <View style={{ margin: 20 }}>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 }} >Address and proof for the business or director</ThemedText>

                {selectedDocuments[4] && <ThemedText style={{ color: 'green', fontWeight: 'bold', textAlign: "center", fontSize: 12 }} >proof of res</ThemedText>}
                {selectedDocuments[4] && <ThemedText style={{ borderWidth: 1, borderColor: "#6a0c0c", padding: 5, textAlign: 'center', marginBottom: 20 }}>{selectedDocuments[4].name}</ThemedText>}

                {!selectedDocuments[4] && <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignSelf: 'center', marginBottom: 15, width: 200 }} >
                    <ThemedText style={{ backgroundColor: 'white', textAlign: 'center', color: "black" }} >Proof</ThemedText>
                </TouchableOpacity>}

                <Input
                    value={formData.addressWithProof}
                    placeholderTextColor="#6a0c0c"
                    placeholder="Full adress "
                    onChangeText={(text) => handleTypedText(text, 'addressWithProof')}
                />

                {formData.addressWithProof && selectedDocuments[4] && <TouchableOpacity
                    onPress={dspPaymentPage}
                    style={{
                        height: 40,
                        width: 150,
                        backgroundColor: '#1E90FF',
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                        alignSelf: 'flex-end'
                    }}
                >
                    <ThemedText style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</ThemedText>
                </TouchableOpacity>}

            </View>}

            {paymentPage && <View style={{ margin: 20 }}>
                <View style={{ padding: 15 }}>
                    <ThemedText style={{ fontSize: 20, fontWeight: '600', marginBottom: 10 }}>
                        Proceed to Payment
                    </ThemedText>
                    <ThemedText style={{ fontSize: 16, color: '#555' }}>
                        Select Payment Method
                    </ThemedText>
                </View>

                <ThemedText style={{ fontSize: 21, fontWeight: 'bold', alignSelf: 'center' }}><ThemedText style={{ color: '#2457A0' }}>Eco</ThemedText><ThemedText style={{ color: '#E22428' }}>Cash</ThemedText> </ThemedText>
                {/* <Image source={require("../../../assets/images/ECOCASH-logo(1).jpg")} style={{ width: 170, height: 25, alignSelf: 'center', marginBottom: 8 }} /> */}

                {/* <TouchableOpacity onPress={startAnimation}> */}
                {/* <Animated.View style={{ transform: [{ translateY: animatedValue }] }}> */}
                <Input
                    placeholderTextColor="#6a0c0c"
                    placeholder="phone number"
                    onChangeText={(text) => setEcocashPhneNum(text)}
                    keyboardType="numeric"
                    style={styles.input}
                />
                {/* </Animated.View> */}
                {/* </TouchableOpacity> */}

                <View style={styles.container}>
                    <ThemedText style={styles.heading}>Verification Period</ThemedText>

                    {selectedItem === "1 month" && <DiscountView ogPrice="• Base price: $5.00" discPrice="No discount since it’s the minimum bundle" remvedPerc="" />}
                    {selectedItem === "2 months" && <DiscountView ogPrice="• Base price: $10.00" discPrice="No discount since it’s the minimum bundle" remvedPerc="" />}
                    {selectedItem === "3 months" && <DiscountView ogPrice="• Regular cost: $15.00" discPrice="With a small discount, charge $14.00" remvedPerc="(~6.7% off)" />}
                    {selectedItem === "6 months" && <DiscountView ogPrice="• Regular cost: $30.00" discPrice="• With discount, charge $27.00" remvedPerc="(~10% off)" />}
                    {selectedItem === "9 months" && <DiscountView ogPrice="• Regular cost: $45.00" discPrice="• With discount, charge $40.00" remvedPerc="(~11% off)" />}
                    {selectedItem === "12 months" && <DiscountView ogPrice="• Regular cost: $60.00" discPrice="• With discount, charge $50.00" remvedPerc="(~17% off)" />}
                    {selectedItem === "2 years" && <DiscountView ogPrice="• Regular cost: $5 × 24 = $120.00" discPrice="• With discount, charge $90.00" remvedPerc="(~25% off)" />}
                    {selectedItem === "3 years" && <DiscountView ogPrice="• Regular cost: $5 × 36 = $180.00" discPrice="• With discount, charge $125.00 (roughly)" remvedPerc="~30% off" />}
                    {selectedItem === "4 years" && <DiscountView ogPrice="• Regular cost: $5 × 48 = $240.00" discPrice="• With discount, charge $160.00" remvedPerc="(~33% off)" />}
                    {selectedItem === "5 years" && <DiscountView ogPrice="• Regular cost: $5 × 60 = $300.00" discPrice="• With discount, charge $200.00" remvedPerc="(~33% off)" />}

                    <View style={styles.row}>
                        <View style={styles.column}>
                            <ThemedText style={styles.subHeading}>Months</ThemedText>
                            <TouchableOpacity onPress={() => handleSelect('1 month')}>
                                <ThemedText style={getItemStyle('1 month')}>1 mon</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('2 months')}>
                                <ThemedText style={getItemStyle('2 months')}>2 mon</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('3 months')}>
                                <ThemedText style={getItemStyle('3 months')}>3 mon</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('6 months')}>
                                <ThemedText style={getItemStyle('6 months')}>6 mon</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('9 months')}>
                                <ThemedText style={getItemStyle('9 months')}>9 mon</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('12 months')}>
                                <ThemedText style={getItemStyle('12 months')}>12 mon</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.column}>
                            <ThemedText style={styles.subHeading}>Years</ThemedText>
                            <TouchableOpacity onPress={() => handleSelect('2 years')}>
                                <ThemedText style={[getItemStyle('2 years'), getSelectedStyle('2 years')]}>2 years</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('3 years')}>
                                <ThemedText style={[getItemStyle('3 years'), getSelectedStyle('3 years')]}>3 years</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('4 years')}>
                                <ThemedText style={[getItemStyle('4 years'), getSelectedStyle('4 years')]}>4 years</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSelect('5 years')}>
                                <ThemedText style={[getItemStyle('5 years'), getSelectedStyle('5 years')]}>5 years</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.checkoutButton} onPress={handleSubmission} >
                        <ThemedText style={styles.checkoutButtonText}>Check out {totalPrice} </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>}

            {/* {!spinnerItem ? <TouchableOpacity  onPress={handleSubmit} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',alignSelf:'center' }}>
    <Text style={{color : 'white'}}>submit</Text>
  </TouchableOpacity>
: <Text style={{alignSelf:"center",fontStyle:'italic'}}>Information being submited. Please wait</Text>  
} */}
        </ScreenWrapper>
    )
}
export default React.memo(ApplyVerification)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 35,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    column: {
        marginHorizontal: 10,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    subHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    item: {
        fontSize: 16,
        marginVertical: 5,
        color: '#666',
        textAlign: 'center',
    },
    selected: {
        backgroundColor: '#007bff',
        color: '#fff',
    },
    selectedItem: {
        backgroundColor: '#28a745',
    }, makePayment: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    input: {
        height: 40,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 10,
        borderTopWidth: 0,
        alignSelf: 'center'
    },
    checkoutButton: {
        borderWidth: 2,
        borderColor: '#ff5c5c',
        marginTop: 15,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 220
    },
    checkoutButtonText: {
        color: '#ff5c5c',
        fontWeight: 'bold',
        fontSize: 18,
    },
});