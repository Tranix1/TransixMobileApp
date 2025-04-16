<<<<<<< HEAD
import React, { useState, FC } from "react";
=======
import React, { useState,FC } from "react";
>>>>>>> db28b4b (working functionality on make payment)
import { collection, doc, addDoc, serverTimestamp, } from 'firebase/firestore';

import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";

import inputstyles from "../../../components/styles/inputElement";

import CheckOutMakePayments from "@/components/CheckOutPayment";
import { handleMakePayment } from "@/payments/operations";



function AddLoadContract() {


  //   const { username, contact, isVerified, isBlackListed, blackLWarning, blockVerifiedU, expoPushToken, verifyOngoing } = route.params
  const [error, setError] = React.useState("")

  //   const loadsContract = collection(db, "");
  type FormDataType = {
    commodity: {
      frst: string;
      scnd: string;
      third: string;
      forth: string;
    };
    location: {
      frst: string;
      scnd: string;
      thrd: string;
      forth: string;
      fifth: string;
      sixth: string;
      seventh: string;
    };
    trckRequired: {
      frst: string;
      scnd: string;
      third: string;
      forth: string;
      fifth: string;
    };
    otherRequirements: {
      frst: string;
      scnd: string;
      third: string;
      forth: string;
    };
    rate: {
      solidFrst: string;
      solidScnd: string;
      triaxleFrst: string;
      triaxlesScnd: string;
      linksFrst: string;
      linksScnd: string;
    };
    returnRate: {
      solidFrst: string;
      solidScnd: string;
      triaxleFrst: string;
      triaxlesScnd: string;
      linksFrst: string;
      linksScnd: string;
    };
    returnCommodity: { frst: string; scnd: string; third: string; forth: string; };
  };
  ;

  const [formData, setFormData] = useState<FormDataType>({
    commodity: { frst: "", scnd: "", third: "", forth: "" },
    location: { frst: "", scnd: "", thrd: "", forth: "", fifth: "", sixth: "", seventh: "" },
    trckRequired: { frst: "", scnd: "", third: "", forth: "", fifth: "" },
    otherRequirements: { frst: "", scnd: "", third: "", forth: "" },
    rate: { solidFrst: "", solidScnd: "", triaxleFrst: "", triaxlesScnd: "", linksFrst: "", linksScnd: "" },
    returnRate: { solidFrst: "", solidScnd: "", triaxleFrst: "", triaxlesScnd: "", linksFrst: "", linksScnd: "" },
    returnCommodity: { frst: "", scnd: "", third: "", forth: "" }
  });

  const handleTypedText = (
    text: string,
    field: `${keyof FormDataType}.${string}`
  ) => {
    const [section, subField] = field.split('.') as [keyof FormDataType, string];

    setFormData(prevFormData => ({
      ...prevFormData,
      [section]: {
        ...prevFormData[section],
        [subField]: text,
      }
    }));
  };


  type FormDataScndType = {
    paymentTerms: string;
    returnPaymentTerms: string;
    contractDuration: string;
    startingDate: string;
    bookingClosingD: string;
    contractRenewal: string;
    manyRoutesOperation: string;
    loadsPerWeek: string;
    alertMsg: string;
    fuelAvai: string;
    additionalInfo: string;
  };


  const [formDataScnd, setFormDataScnd] = React.useState<FormDataScndType>({
    paymentTerms: "",
    returnPaymentTerms: "",
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
    fieldName: keyof FormDataScndType
  ) => {
    setFormDataScnd((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };





  const [location, setlocation] = React.useState<string>("")

  const [dspAddLocation, setDspAddLocation] = React.useState<boolean>(false)


  function specifyLocation(loc: string): void {
    setlocation(loc);
    setDspAddLocation(false);
  }







  const [spinnerItem, setSpinnerItem] = React.useState(false);

  const handleSubmit = async () => {

    type FormData = { [key: string]: any }; // Or define specific fields if needed

    const areAllElementsTrueExceptKeys = (obj: FormData, excludedKeys: string[]): boolean => {
      for (const key in obj) {
        if (!excludedKeys.includes(key) && !obj[key]) {
          return false;
        }
      }
      return true;
    };

    const excludedKeys = ["scndTrailerReg", "trailerModel", "additionalInfo"];

    if (!areAllElementsTrueExceptKeys(formData, excludedKeys)) {
      alert("This truck is for verified loads.\n\nAdd all truck details except for Trailer Reg2 if not available.");
      setSpinnerItem(false)
      return;
    }


    const [paymenPageDsp, setPaymentPageDsp] = React.useState<boolean>(false)






<<<<<<< HEAD
=======
        const [paymenPageDsp , setPaymentPageDsp]=React.useState<boolean>(false)
        

        


              
>>>>>>> db28b4b (working functionality on make payment)
    // try {
    //   const docRef = await addDoc("loadsContracts", {
    //     // userId: userId, // Add the user ID to the document
    //     // companyName: username,
    //     // contact: contact,
    //     // expoPushToken: expoPushToken,
    //     timeStamp: serverTimestamp(),
    //     currency: currency,
    //     contractLocation: location,
    //     manyRoutesAllocaton: manyRoutesAllocaton,
    //     manyRoutesAssign: manyRoutesAssign,
    //     formData: formData,
    //     formDataScnd: formDataScnd,
    //     contractId: `co${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ct`,

    //   });

    //   console.log('ayayyayayayayarr')

    // } catch (err) {
    //   setSpinnerItem(false)
    //   setError(err.toString());
    // }
  };


<<<<<<< HEAD
  const [paymentUpdate, setPaymentUpdate] = React.useState<string>("");

  const justConsole = () => {
    console.log("pananaanana");
    handleMakePayment(3, "yaya", setPaymentUpdate);
  };



  console.log("nowww ", paymentUpdate)
=======
 const [paymentUpdate, setPaymentUpdate] = React.useState<string>("");

    const justConsole = () => {
      console.log("pananaanana");
      handleMakePayment(3, "yaya", setPaymentUpdate);
    };



console.log("nowww " , paymentUpdate)
>>>>>>> db28b4b (working functionality on make payment)




















  const [dspCommodity, setDspCommodity] = React.useState(false);

  function toggleDspCommodity() {
    setDspCommodity(prev => !prev);
  }

  const [dspLocation, setDspLocation] = React.useState(false);

  function toggleDspLocation() {
    setDspLocation(prev => !prev);
  }


  const [manyRoutesAllocaton, setManyRoutesAllocation] = React.useState("");

  const [manyRoutesAssign, setManyRoutesAssign] = React.useState("");

  const [nowEnterLoca, setEnterLocs] = React.useState(false)
  function doneEnterThLocs() {
    setEnterLocs(prev => !prev)
  }




  const [dspTruckRequired, setDspTruckRequired] = React.useState(false);

  function toggleDspTruckRequired() {
    setDspTruckRequired(prev => !prev);
  }

  const [dspRate, setDspRate] = React.useState(false);

  function toggleDspRate() {
    setDspRate(prev => !prev);
  }





  const [dspOtherRequirements, setDspOtherRequirements] = React.useState(false);

  function toggleDspOtherRequirements() {
    setDspOtherRequirements(prev => !prev);
  }


  const [dspReturnCommodity, setDspReturnCommodity] = React.useState(false);

  function toggleDspReturnCommodity() {
    setDspReturnCommodity(prev => !prev);
  }

  const [dspReturnRate, setDspReturnRate] = React.useState(false);

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
  };

  const ToggleMLBtn = ({ whatTToggle, theTittle }: ToggleMLBtnProps) => (
    <TouchableOpacity onPress={whatTToggle} style={styles.moreLessIterms}>
      <Text style={{ fontStyle: 'italic' }}>{theTittle}</Text>
    </TouchableOpacity>
  );

  // This is the button to choose a country 
  type SlctCountryBtnProps = {
    selectedLoc: string;
  };

  const SlctCountryBtn = ({ selectedLoc }: SlctCountryBtnProps) => (
    <TouchableOpacity onPress={() => specifyLocation(selectedLoc)} style={styles.buttonStyle}>
      <Text style={{ color: '#6a0c0c' }}>{selectedLoc}</Text>
    </TouchableOpacity>
  );



  return (
    <View style={{ alignItems: 'center', paddingTop: 100 }}>



<<<<<<< HEAD

      <CheckOutMakePayments jsxProp={<View>
        <Text> its $10 to add contract </Text>
      </View>} anyProp="yaya" confirmButon={justConsole} />

      <View style={{ height: 40, position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: "#6a0c0c", paddingBottom: 7, justifyContent: 'space-evenly' }} >
=======
        <CheckOutMakePayments jsxProp={<View>
          <Text> its $10 to add contract </Text>
        </View> } anyProp="yaya"  confirmButon={justConsole}  />

      <View style={{ height: 40, position: 'absolute', top:50, left: 0, right: 0, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: "#6a0c0c", paddingBottom: 7, justifyContent: 'space-evenly' }} >
>>>>>>> db28b4b (working functionality on make payment)
        <TouchableOpacity style={dsoLoadDe ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={dspLoadDet} >
          <Text style={dsoLoadDe ? { color: 'white' } : null} >Load Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dspRturnnLoads ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={toggleDspReturnLoads}>
          <Text style={dspRturnnLoads ? { color: 'white' } : null}>Return Load</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={toggleDspContractD} style={dspContractD ? styles.bttonIsTrue : styles.buttonIsFalse}>
          <Text style={dspContractD ? { color: 'white' } : null}>Contract Details</Text>
        </TouchableOpacity>

      </View>

      {dsoLoadDe && !dspRturnnLoads && !dspContractD && <ScrollView>


        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspLocation && <View style={styles.viewMainDsp} >
          {dspCommodity && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspCommodity && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}


          <TextInput
            value={formData.commodity.frst} placeholder="First Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.frst')} style={inputstyles.addIterms} />

          <TextInput
            value={formData.commodity.scnd} placeholder="Second Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.scnd')} style={inputstyles.addIterms} />

          {!dspCommodity && <ToggleMLBtn whatTToggle={toggleDspCommodity} theTittle="More Than 2 commo" />}

          {dspCommodity && <View>
            <TextInput
              value={formData.commodity.third} placeholder="Third Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.third')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.commodity.forth} placeholder="Fourth Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.forth')} style={inputstyles.addIterms} />

            {dspCommodity && <ToggleMLBtn whatTToggle={toggleDspCommodity} theTittle="Done Adding" />}
            {dspCommodity && (
              <ToggleMLBtn whatTToggle={toggleDspCommodity} theTittle="Done Adding" />
            )}

          </View>}

        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspCommodity && !dspLocation && <View style={styles.viewMainDsp} >


          <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }}>Payment Terms</Text>
          <TextInput
            value={formDataScnd.paymentTerms} placeholder="Payment Terms" onChangeText={(text) => handleTypedTextScnd(text, 'paymentTerms')} style={inputstyles.addIterms} />


        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspCommodity && <View style={styles.viewMainDsp} >

          {dspLocation && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspLocation && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}

          {dspLocation && !nowEnterLoca && (
            <View style={{ padding: 20 }}>
              <Text style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>
                There is more than two location
              </Text>

              <View style={styles.viewSubMainDsp}>
                <Text style={{ marginBottom: 10 }}>How will they operate from routes to:</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  <TouchableOpacity
                    onPress={() => setManyRoutesAssign('All Routes One Stop')}
                    style={{
                      borderColor: 'black',
                      borderWidth: 2,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center', padding: 3,
                    }}
                  >
                    <Text>All Routes One Stop</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setManyRoutesAssign('One Route to another')}
                    style={{
                      borderColor: 'black',
                      borderWidth: 2,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center', padding: 3, marginLeft: 6
                    }}
                  >
                    <Text>Route to Route</Text>
                  </TouchableOpacity>
                </View>

                {manyRoutesAssign === 'All Routes One Stop' && (
                  <TextInput
                    value={formData.location.seventh}
                    placeholder="Sixth Location"
                    onChangeText={(text) => handleTypedText(text, 'location.seventh')}
                    style={[inputstyles.addIterms, { marginBottom: 20 }]}
                  />
                )}
              </View>

              <View style={styles.viewSubMainDsp}>
                <Text style={{ marginBottom: 10 }}>Will the tranporter choose where to go or it will be random?</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  <TouchableOpacity
                    onPress={() => setManyRoutesAllocation('Tranporter Choose')}
                    style={{
                      borderColor: 'black',
                      borderWidth: 2,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center', padding: 3,
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>Tranporter Choose</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setManyRoutesAllocation('Random Allocation')}
                    style={{
                      borderColor: 'black',
                      borderWidth: 2,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center', padding: 3, marginLeft: 6,
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>Random Allocation</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={{ marginBottom: 10 }}>How will the routes work?</Text>
              <TextInput
                value={formDataScnd.manyRoutesOperation}
                placeholder="Routes Operate"
                onChangeText={(text) => handleTypedTextScnd(text, 'manyRoutesOperation')}
                style={[inputstyles.addIterms, { marginBottom: 20 }]}
              />

              {manyRoutesAllocaton && manyRoutesAssign && (
                <TouchableOpacity onPress={doneEnterThLocs} style={{ marginTop: 20 }}>
                  <Text style={{ color: 'blue', fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}


          {!dspLocation && <View>

            <TextInput
              value={formData.location.frst} placeholder={dspLocation ? "First Location" : "From Location"} onChangeText={(text) => handleTypedText(text, 'location.frst')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.location.scnd} placeholder={dspLocation ? "Second Location" : "To Location"} onChangeText={(text) => handleTypedText(text, 'location.scnd')} style={inputstyles.addIterms} />

          </View>}

          {!dspLocation && <ToggleMLBtn whatTToggle={toggleDspLocation} theTittle="If You Have more that 2 locations" />}



          {dspLocation && nowEnterLoca && <View>

            <TextInput
              value={formData.location.frst} placeholder={dspLocation ? "First Location" : "From Location"} onChangeText={(text) => handleTypedText(text, 'location.frst')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.location.scnd} placeholder={dspLocation ? "Second Location" : "To Location"} onChangeText={(text) => handleTypedText(text, 'location.scnd')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.location.thrd} placeholder="Third Location" onChangeText={(text) => handleTypedText(text, 'location.thrd')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.location.forth} placeholder="Fourth Location" onChangeText={(text) => handleTypedText(text, 'location.forth')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.location.fifth} placeholder="Fifth Location" onChangeText={(text) => handleTypedText(text, 'location.fifth')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.location.sixth} placeholder="Sixth Location" onChangeText={(text) => handleTypedText(text, 'location.sixth')} style={inputstyles.addIterms} />

            {dspLocation && <ToggleMLBtn whatTToggle={toggleDspLocation} theTittle="Done Adding Location" />}


          </View>}
        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>

          {dspTruckRequired && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspTruckRequired && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}
          <TextInput
            value={formData.trckRequired.frst} placeholder="First Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.frst')} style={inputstyles.addIterms} />
          <TextInput
            value={formData.trckRequired.scnd} placeholder="Second Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.scnd')} style={inputstyles.addIterms} />



          {!dspTruckRequired && <ToggleMLBtn whatTToggle={toggleDspTruckRequired} theTittle="More than 2 type of trucks reuired" />}


          {dspTruckRequired && <View>
            <TextInput
              value={formData.trckRequired.third} placeholder="Third Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.third')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.trckRequired.forth} placeholder="Fourth Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.forth')} style={inputstyles.addIterms} />

            <TextInput
              value={formData.trckRequired.fifth} placeholder="Fifth Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.fifth')} style={inputstyles.addIterms} />

            {dspTruckRequired && <ToggleMLBtn whatTToggle={toggleDspTruckRequired} theTittle="Done Adding Reuired trucks" />}


          </View>}
        </View>}

        {!dspReturnRate && !dspRate && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>

          {dspOtherRequirements && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspOtherRequirements && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}
          <TextInput
            value={formData.otherRequirements.frst}
            placeholder="First Other Requirement"
            onChangeText={(text) => handleTypedText(text, 'otherRequirements.frst')}
            style={inputstyles.addIterms}
          />
          <TextInput
            value={formData.otherRequirements.scnd}
            placeholder="Second Other Requirement"
            onChangeText={(text) => handleTypedText(text, 'otherRequirements.scnd')}
            style={inputstyles.addIterms}
          />

          {!dspOtherRequirements && <ToggleMLBtn whatTToggle={toggleDspOtherRequirements} theTittle="Done Adding Other Reuirems" />}

          {dspOtherRequirements && <View>


            <TextInput
              value={formData.otherRequirements.third} placeholder="Third Other Requirement" onChangeText={(text) => handleTypedText(text, 'otherRequirements.third')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.otherRequirements.forth} placeholder="Fourth Other Requirement" onChangeText={(text) => handleTypedText(text, 'otherRequirements.forth')} style={inputstyles.addIterms} />

            {dspOtherRequirements && <ToggleMLBtn whatTToggle={toggleDspOtherRequirements} theTittle="Done Adding Other Rei" />}

          </View>}
        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>
          {dspRate && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspRate && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}
          <TextInput
            value={formData.rate.solidFrst} placeholder="Solid First Rate" onChangeText={(text) => handleTypedText(text, 'rate.solidFrst')} style={inputstyles.addIterms} />
          {dspRate && <TextInput
            value={formData.rate.solidScnd} placeholder="Solid Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.solidScnd')} style={inputstyles.addIterms} />}

          <TextInput
            value={formData.rate.triaxleFrst} placeholder="Triaxle First Rate" onChangeText={(text) => handleTypedText(text, 'rate.triaxleFrst')} style={inputstyles.addIterms} />
          {dspRate && <TextInput
            value={formData.rate.triaxlesScnd} placeholder="Triaxle Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.triaxlesScnd')} style={inputstyles.addIterms} />}
          <TextInput
            value={formData.rate.linksFrst} placeholder="Links First Rate" onChangeText={(text) => handleTypedText(text, 'rate.linksFrst')} style={inputstyles.addIterms} />
          {dspRate && <TextInput
            value={formData.rate.linksScnd} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.linksScnd')} style={inputstyles.addIterms} />}


          {!dspRate && <ToggleMLBtn whatTToggle={toggleDspRate} theTittle="More than 2 rates" />}
          {dspRate && <ToggleMLBtn whatTToggle={toggleDspRate} theTittle="Done Rates" />}


        </View>}

      </ScrollView>}

      {dspRturnnLoads && !dspContractD && !dsoLoadDe && <ScrollView>

        {<View style={styles.viewMainDsp} >
          {dspReturnCommodity && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspReturnCommodity && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}
          <TextInput
            value={formData.returnCommodity.frst} placeholder="First Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.frst')} style={inputstyles.addIterms} />
          <TextInput
            value={formData.returnCommodity.scnd} placeholder="Second Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.scnd')} style={inputstyles.addIterms} />
          {!dspReturnCommodity && <ToggleMLBtn whatTToggle={toggleDspReturnCommodity} theTittle=" Return Commo" />}

          {dspReturnCommodity && <View>
            <TextInput
              value={formData.returnCommodity.third} placeholder="Third Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.third')} style={inputstyles.addIterms} />
            <TextInput
              value={formData.returnCommodity.forth} placeholder="Fourth Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.forth')} style={inputstyles.addIterms} />


            {dspReturnCommodity && <ToggleMLBtn whatTToggle={toggleDspReturnCommodity} theTittle="Done Return Commo" />}
          </View>}

        </View>}

        <View style={styles.viewMainDsp} >
          <TextInput
            value={formDataScnd.returnPaymentTerms} placeholder="Return Payment Terms" onChangeText={(text) => handleTypedTextScnd(text, 'returnPaymentTerms')} style={inputstyles.addIterms} />
        </View>

        {<View style={styles.viewMainDsp}>
          {dspReturnRate && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</Text>}
          {!dspReturnRate && <Text style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</Text>}
          <TextInput
            value={formData.returnRate.solidFrst} placeholder="Return Solid First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.solidFrst')}
            style={inputstyles.addIterms}
          />
          {dspReturnRate && <TextInput
            value={formData.returnRate.solidScnd} placeholder="Return Solid Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.solidScnd')} style={inputstyles.addIterms} />}


          <TextInput
            value={formData.returnRate.triaxleFrst} placeholder="Return Triaxle First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.triaxleFrst')} style={inputstyles.addIterms} />
          {dspReturnRate && <TextInput
            value={formData.returnRate.triaxlesScnd} placeholder="Return Triaxle Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.triaxlesScnd')} style={inputstyles.addIterms} />}
          <TextInput
            value={formData.returnRate.linksFrst} placeholder="Return Links First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.linksFrst')} style={inputstyles.addIterms} />
          {dspReturnRate && <TextInput
            value={formData.returnRate.linksScnd} placeholder="Return Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.linkScnd')} style={inputstyles.addIterms} />}

          {!dspReturnRate && <ToggleMLBtn whatTToggle={toggleDspReturnRate} theTittle="Done Return Rate" />}
          {dspReturnRate && <ToggleMLBtn whatTToggle={toggleDspReturnRate} theTittle="Done Return Rate" />}
        </View>}

      </ScrollView>}

      {!dspRturnnLoads && dspContractD && !dsoLoadDe && <ScrollView>
        {!dspAddLocation && <View>

          <TextInput
            value={formDataScnd.fuelAvai} placeholder="Fuel" onChangeText={(text) => handleTypedTextScnd(text, 'fuelAvai')} style={inputstyles.addIterms} />

          <TextInput
            value={formDataScnd.loadsPerWeek} placeholder="Loads Per Week" onChangeText={(text) => handleTypedTextScnd(text, 'loadsPerWeek')} style={inputstyles.addIterms} />


          <TextInput
            value={formDataScnd.contractDuration} placeholder="Contract Duration" onChangeText={(text) => handleTypedTextScnd(text, 'contractDuration')} style={inputstyles.addIterms} />
          <TextInput
            value={formDataScnd.startingDate} placeholder="Starting Date" onChangeText={(text) => handleTypedTextScnd(text, 'startingDate')} style={inputstyles.addIterms} />

          <TextInput
            value={formDataScnd.bookingClosingD} placeholder="Starting Date" onChangeText={(text) => handleTypedTextScnd(text, 'bookingClosingD')} style={inputstyles.addIterms} />

          <TextInput
            value={formDataScnd.contractRenewal} placeholder="Can You Renew Contract for how long" onChangeText={(text) => handleTypedTextScnd(text, 'contractRenewal')} style={inputstyles.addIterms} />


          <TextInput
            value={formDataScnd.alertMsg} placeholder="alertMsg" onChangeText={(text) => handleTypedTextScnd(text, 'alertMsg')} style={inputstyles.addIterms} />
          <TextInput
            value={formDataScnd.additionalInfo} placeholder="Additional Info" onChangeText={(text) => handleTypedTextScnd(text, 'additionalInfo')} style={inputstyles.addIterms} />

        </View>}

        {dspAddLocation && <View style={{ alignSelf: 'center' }} >
          <SlctCountryBtn selectedLoc="International" />
          <SlctCountryBtn selectedLoc="Zimbabwe" />
          <SlctCountryBtn selectedLoc="SouthAfrica" />
          <SlctCountryBtn selectedLoc="Namibia" />
          <SlctCountryBtn selectedLoc="Tanzania" />
          <SlctCountryBtn selectedLoc="Mozambique" />
          <SlctCountryBtn selectedLoc="Zambia" />
          <SlctCountryBtn selectedLoc="Botswana" />
          <SlctCountryBtn selectedLoc="Malawi" />

        </View>}

        <Text>Is the contract International or Local for one country</Text>
        {!dspAddLocation && <TouchableOpacity onPress={() => setDspAddLocation(true)} style={styles.buttonIsFalse}  >
          <Text> {location ? location : "Choose operating Location"} </Text>
        </TouchableOpacity>}

        <TouchableOpacity onPress={handleSubmit} style={{ flex: 1, backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 8 }} >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Done Submit</Text>
        </TouchableOpacity>

      </ScrollView>}

    </View>
  );
}

export default React.memo(AddLoadContract);

const styles = StyleSheet.create({
  viewMainDsp: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 8,
    shadowColor: "#6a0c0c",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    overflow: "hidden",
    width: 320
  },
  viewSubMainDsp: {
    marginBottom: 7,
    padding: 10,
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 8,
    shadowColor: "#6a0c0c",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    overflow: "hidden",
    width: 270
  },
  moreLessIterms: {
    padding: 6, borderWidth: 1, borderColor: 'black', justifyContent: 'center', alignItems: 'center', borderRadius: 5
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

