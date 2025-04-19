import React, { useState, FC } from "react";

import { View,  TouchableOpacity, StyleSheet, ScrollView } from "react-native";

import inputstyles from "../../../components/styles/inputElement";

import CheckOutMakePayments from "@/components/CheckOutPayment";
import { ErrorOverlay } from "@/components/ErrorOverLay";
import { handleMakePayment } from "@/payments/operations";

import { ContractsFormDataScndType } from "@/types/types";
import { ContractsFormDataType } from "@/types/types";

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";

import { useThemeColor } from '@/hooks/useThemeColor';
import Heading from '@/components/Heading';
import ScreenWrapper from '@/components/ScreenWrapper';


function AddLoadContract() {
const backgroundLight = useThemeColor('backgroundLight')

  const [formData, setFormData] = useState<ContractsFormDataType>({
    commodity: { frst: "", scnd: "", third: "", forth: "" },
    location: { frst: "", scnd: "", thrd: "", forth: "", fifth: "", sixth: "", seventh: "" },
    trckRequired: { frst: "", scnd: "", third: "", forth: "", fifth: "" },
    otherRequirements: { frst: "", scnd: "", third: "", forth: "" },
    rate: { solidFrst: "", solidScnd: "", triaxleFrst: "", triaxlesScnd: "", linksFrst: "", linksScnd: "", superLinkFrst: "", superLinkScnd: "" },
    returnRate: { solidFrst: "", solidScnd: "", triaxleFrst: "", triaxlesScnd: "", linksFrst: "", linksScnd: "", superLinkFrst: "", superLinkScnd: "" },
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
    <TouchableOpacity onPress={whatTToggle} style={[styles.moreLessIterms,{ backgroundColor: backgroundLight } ]}>
      <ThemedText style={{ fontStyle: 'italic' }}>{theTittle}</ThemedText>
    </TouchableOpacity>
  );



  const [location, setlocation] = React.useState<string>("")

  const [dspAddLocation, setDspAddLocation] = React.useState<boolean>(false)

  // const [interOpCount , setIntOpLoc]=React.useState<object>({})

  function specifyLocation(loc: string): void {
    setlocation(loc);
  }


  const [interOpCount, setIntOpLoc] = React.useState<string[]>([]);

  const [locaOpCount, setLocaOpLoc] = React.useState<string>("");

  console.log(interOpCount)
  console.log(locaOpCount)


  function toggleLocalCountry(count: string): void {
    setIntOpLoc([])
    setLocaOpLoc(count)
    setDspAddLocation(false)
    setlocation("")
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
    // if(formData.commodity.frst )
    if (!formData.commodity.frst || !formDataScnd.paymentTerms || !formData.location.frst || !formData.location.scnd || !formData.trckRequired || !formData.otherRequirements.frst || !formData.rate.solidFrst) {
      setLoadDspError(true)
      return
    } else if (!formDataScnd.loadsPerWeek || !formDataScnd.contractDuration || !formDataScnd.startingDate || !formDataScnd.fuelAvai || !formDataScnd.bookingClosingD || (!locaOpCount && interOpCount.length === 0)) {
      setContractDErr(true)
      return

    }

    setDspCheckout(true)
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
    formData: formData,
    formDataScnd: formDataScnd,
    contractId: `co${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ct`,
  }

  const [paymentUpdate, setPaymentUpdate] = React.useState<string>("");

  const justConsole = () => {

    handleMakePayment(3, "yaya", setPaymentUpdate, "loadsContracts", contractData);
  };



  console.log("payment status", paymentUpdate)



  return (
        <ScreenWrapper>

            <Heading page='Add Contracts' />
    <View style={{ alignItems: 'center', paddingTop: 60 }}>
      




      <ErrorOverlay
        visible={dspLoadDErr}
        title="Missing important details on load"
        errors={[
          !formData.commodity.frst && "Enter at least one commodity",
          !formDataScnd.paymentTerms && "Enter the payment terms",
          !formData.location.frst && "Enter from location or first location",
          !formData.location.scnd && "Enter destination location",
          !formData.trckRequired && "Enter at least one type of truck required",
          !formData.otherRequirements.frst && "Enter at least one requirement",
          !formData.rate.solidFrst && "Enter the solid rate",
        ].filter(Boolean) as string[]}
        onClose={() => setLoadDspError(false)}
      />

      <ErrorOverlay
        visible={dspContrDErro}
        title="Missing important details on contracts"
        errors={[
          !formDataScnd.loadsPerWeek && "Enter loads per week",
          !formDataScnd.contractDuration && "Enter contract duration",
          !formDataScnd.startingDate && "Enter when the contract is starting",
          !formDataScnd.fuelAvai && "Enter if fuel is available and how it's distributed",
          !formDataScnd.bookingClosingD && "Enter booking closing date",
          !locaOpCount && interOpCount.length === 0 && "Select country the loads will operate",
        ].filter(Boolean) as string[]}
        onClose={() => setContractDErr(false)}
      />






      {dspCheckOutP && <CheckOutMakePayments jsxProp={<View>
        <ThemedText> its $10 to add contract </ThemedText>
      </View>} confirmButon={justConsole} cancelBTN={() => setDspCheckout(false)} />}



      <View style={{ height: 40, position: 'absolute', top: 5, left: 0, right: 0, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: "#6a0c0c", justifyContent: 'space-evenly', }} >
        <TouchableOpacity style={dsoLoadDe ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={dspLoadDet} >
          <ThemedText style={dsoLoadDe ? { color: 'white' } : null} >Load Details</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={dspRturnnLoads ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={toggleDspReturnLoads}>
          <ThemedText style={dspRturnnLoads ? { color: 'white' } : null}>Return Load</ThemedText>
        </TouchableOpacity>


        <TouchableOpacity onPress={toggleDspContractD} style={dspContractD ? styles.bttonIsTrue : styles.buttonIsFalse}>
          <ThemedText style={dspContractD ? { color: 'white' } : null}>Contract Details</ThemedText>
        </TouchableOpacity>

      </View>

      {dsoLoadDe && !dspRturnnLoads && !dspContractD && <ScrollView>


        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspLocation && <View style={styles.viewMainDsp} >
          {dspCommodity && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</ThemedText>}
          {!dspCommodity && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</ThemedText>}


          <Input
            value={formData.commodity.frst} placeholder="First Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.frst')} style={inputstyles.addIterms} />

          <Input
            value={formData.commodity.scnd} placeholder="Second Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.scnd')} style={inputstyles.addIterms} />

          {!dspCommodity && <ToggleMLBtn whatTToggle={toggleDspCommodity} theTittle="More Than 2 commo" />}

          {dspCommodity && <View>
            <Input
              value={formData.commodity.third} placeholder="Third Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.third')} style={inputstyles.addIterms} />
            <Input
              value={formData.commodity.forth} placeholder="Fourth Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.forth')} style={inputstyles.addIterms} />


            {dspCommodity && (
              <ToggleMLBtn whatTToggle={toggleDspCommodity} theTittle="Done Adding" />
            )}

          </View>}

        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspCommodity && !dspLocation && <View style={styles.viewMainDsp} >


          <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }}>Payment Terms</ThemedText>
          <Input
            value={formDataScnd.paymentTerms} placeholder="Payment Terms" onChangeText={(text) => handleTypedTextScnd(text, 'paymentTerms')} style={inputstyles.addIterms} />


        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspTruckRequired && !dspCommodity && <View style={styles.viewMainDsp} >

          {dspLocation && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</ThemedText>}
          {!dspLocation && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</ThemedText>}

          {dspLocation && !nowEnterLoca && (
            <View style={{ padding: 20 }}>
              <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>
                There is more than two location
              </ThemedText>

              <View style={styles.viewSubMainDsp}>
                <ThemedText style={{ marginBottom: 10 }}>How will they operate from routes to:</ThemedText>

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
                    <ThemedText>All Routes One Stop</ThemedText>
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
                    <ThemedText>Route to Route</ThemedText>
                  </TouchableOpacity>
                </View>

                {manyRoutesAssign === 'All Routes One Stop' && (
                  <Input
                    value={formData.location.seventh}
                    placeholder="Sixth Location"
                    onChangeText={(text) => handleTypedText(text, 'location.seventh')}
                    style={[inputstyles.addIterms, { marginBottom: 20 }]}
                  />
                )}
              </View>

              <View style={styles.viewSubMainDsp}>
                <ThemedText style={{ marginBottom: 10 }}>Will the tranporter choose where to go or it will be random?</ThemedText>

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
                    <ThemedText style={{ fontSize: 13 }}>Tranporter Choose</ThemedText>
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
                    <ThemedText style={{ fontSize: 13 }}>Random Allocation</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText style={{ marginBottom: 10 }}>How will the routes work?</ThemedText>
              <Input
                value={formDataScnd.manyRoutesOperation}
                placeholder="Routes Operate"
                onChangeText={(text) => handleTypedTextScnd(text, 'manyRoutesOperation')}
                style={[inputstyles.addIterms, { marginBottom: 20 }]}
              />

              {manyRoutesAllocaton && manyRoutesAssign && (
                <TouchableOpacity onPress={doneEnterThLocs} style={{ marginTop: 20 }}>
                  <ThemedText style={{ color: 'blue', fontSize: 16 }}>Done</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}


          {!dspLocation && <View>

            <Input
              value={formData.location.frst} placeholder={dspLocation ? "First Location" : "From Location"} onChangeText={(text) => handleTypedText(text, 'location.frst')} style={inputstyles.addIterms} />
            <Input
              value={formData.location.scnd} placeholder={dspLocation ? "Second Location" : "To Location"} onChangeText={(text) => handleTypedText(text, 'location.scnd')} style={inputstyles.addIterms} />

          </View>}

          {!dspLocation && <ToggleMLBtn whatTToggle={toggleDspLocation} theTittle="If You Have more that 2 locations" />}



          {dspLocation && nowEnterLoca && <View>

            <Input
              value={formData.location.frst} placeholder={dspLocation ? "First Location" : "From Location"} onChangeText={(text) => handleTypedText(text, 'location.frst')} style={inputstyles.addIterms} />
            <Input
              value={formData.location.scnd} placeholder={dspLocation ? "Second Location" : "To Location"} onChangeText={(text) => handleTypedText(text, 'location.scnd')} style={inputstyles.addIterms} />
            <Input
              value={formData.location.thrd} placeholder="Third Location" onChangeText={(text) => handleTypedText(text, 'location.thrd')} style={inputstyles.addIterms} />
            <Input
              value={formData.location.forth} placeholder="Fourth Location" onChangeText={(text) => handleTypedText(text, 'location.forth')} style={inputstyles.addIterms} />
            <Input
              value={formData.location.fifth} placeholder="Fifth Location" onChangeText={(text) => handleTypedText(text, 'location.fifth')} style={inputstyles.addIterms} />
            <Input
              value={formData.location.sixth} placeholder="Sixth Location" onChangeText={(text) => handleTypedText(text, 'location.sixth')} style={inputstyles.addIterms} />

            {dspLocation && <ToggleMLBtn whatTToggle={toggleDspLocation} theTittle="Done Adding Location" />}


          </View>}
        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>

          {dspTruckRequired && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</ThemedText>}
          {!dspTruckRequired && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</ThemedText>}
          <Input
            value={formData.trckRequired.frst} placeholder="First Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.frst')} style={inputstyles.addIterms} />
          <Input
            value={formData.trckRequired.scnd} placeholder="Second Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.scnd')} style={inputstyles.addIterms} />



          {!dspTruckRequired && <ToggleMLBtn whatTToggle={toggleDspTruckRequired} theTittle="More than 2 type of trucks reuired" />}


          {dspTruckRequired && <View>
            <Input
              value={formData.trckRequired.third} placeholder="Third Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.third')} style={inputstyles.addIterms} />
            <Input
              value={formData.trckRequired.forth} placeholder="Fourth Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.forth')} style={inputstyles.addIterms} />

            <Input
              value={formData.trckRequired.fifth} placeholder="Fifth Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.fifth')} style={inputstyles.addIterms} />

            {dspTruckRequired && <ToggleMLBtn whatTToggle={toggleDspTruckRequired} theTittle="Done Adding Reuired trucks" />}


          </View>}
        </View>}

        {!dspReturnRate && !dspRate && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>

          {dspOtherRequirements && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</ThemedText>}
          {!dspOtherRequirements && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</ThemedText>}
          <Input
            value={formData.otherRequirements.frst}
            placeholder="First Other Requirement"
            onChangeText={(text) => handleTypedText(text, 'otherRequirements.frst')}
            style={inputstyles.addIterms}
          />
          <Input
            value={formData.otherRequirements.scnd}
            placeholder="Second Other Requirement"
            onChangeText={(text) => handleTypedText(text, 'otherRequirements.scnd')}
            style={inputstyles.addIterms}
          />

          {!dspOtherRequirements && <ToggleMLBtn whatTToggle={toggleDspOtherRequirements} theTittle="Done Adding Other Reuirems" />}

          {dspOtherRequirements && <View>


            <Input
              value={formData.otherRequirements.third} placeholder="Third Other Requirement" onChangeText={(text) => handleTypedText(text, 'otherRequirements.third')} style={inputstyles.addIterms} />
            <Input
              value={formData.otherRequirements.forth} placeholder="Fourth Other Requirement" onChangeText={(text) => handleTypedText(text, 'otherRequirements.forth')} style={inputstyles.addIterms} />

            {dspOtherRequirements && <ToggleMLBtn whatTToggle={toggleDspOtherRequirements} theTittle="Done Adding Other Rei" />}

          </View>}
        </View>}

        {!dspReturnRate && !dspOtherRequirements && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>
          {dspRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the Rates dor Contract</ThemedText>}
          {!dspRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Rates</ThemedText>}
          <Input
            value={formData.rate.solidFrst} placeholder="Solid First Rate" onChangeText={(text) => handleTypedText(text, 'rate.solidFrst')} style={inputstyles.addIterms} />
          {dspRate && <Input
            value={formData.rate.solidScnd} placeholder="Solid Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.solidScnd')} style={inputstyles.addIterms} />}

          <Input
            value={formData.rate.triaxleFrst} placeholder="Triaxle First Rate" onChangeText={(text) => handleTypedText(text, 'rate.triaxleFrst')} style={inputstyles.addIterms} />
          {dspRate && <Input
            value={formData.rate.triaxlesScnd} placeholder="Triaxle Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.triaxlesScnd')} style={inputstyles.addIterms} />}
          <Input
            value={formData.rate.linksFrst} placeholder="Links First Rate" onChangeText={(text) => handleTypedText(text, 'rate.linksFrst')} style={inputstyles.addIterms} />
          {dspRate && <Input
            value={formData.rate.linksScnd} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.linksScnd')} style={inputstyles.addIterms} />}

          {<Input
            value={formData.rate.superLinkFrst} placeholder="Super Link Rate" onChangeText={(text) => handleTypedText(text, 'rate.superLinkFrst')} style={inputstyles.addIterms} />}
          {dspRate && <Input
            value={formData.rate.superLinkScnd} placeholder="Super Link Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.superLinkScnd')} style={inputstyles.addIterms} />}


          {!dspRate && <ToggleMLBtn whatTToggle={toggleDspRate} theTittle="More than 2 rates" />}
          {dspRate && <ToggleMLBtn whatTToggle={toggleDspRate} theTittle="Done Rates" />}


        </View>}

      </ScrollView>}

      {dspRturnnLoads && !dspContractD && !dsoLoadDe && <ScrollView>

        {<View style={styles.viewMainDsp} >
          {dspReturnCommodity && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the commodities to be transpoted</ThemedText>}
          {!dspReturnCommodity && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add 3 Commodity</ThemedText>}
          <Input
            value={formData.returnCommodity.frst} placeholder="First Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.frst')} style={inputstyles.addIterms} />
          <Input
            value={formData.returnCommodity.scnd} placeholder="Second Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.scnd')} style={inputstyles.addIterms} />
          {!dspReturnCommodity && <ToggleMLBtn whatTToggle={toggleDspReturnCommodity} theTittle=" Return Commo" />}

          {dspReturnCommodity && <View>
            <Input
              value={formData.returnCommodity.third} placeholder="Third Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.third')} style={inputstyles.addIterms} />
            <Input
              value={formData.returnCommodity.forth} placeholder="Fourth Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.forth')} style={inputstyles.addIterms} />


            {dspReturnCommodity && <ToggleMLBtn whatTToggle={toggleDspReturnCommodity} theTittle="Done Return Commo" />}
          </View>}

        </View>}

        <View style={styles.viewMainDsp} >
          <Input
            value={formDataScnd.returnPaymentTerms} placeholder="Return Payment Terms" onChangeText={(text) => handleTypedTextScnd(text, 'returnPaymentTerms')} style={inputstyles.addIterms} />
        </View>

        {<View style={styles.viewMainDsp}>
          {dspReturnRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add all the rates for return loads</ThemedText>}
          {!dspReturnRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }} >Add rates for return loads</ThemedText>}
          <Input
            value={formData.returnRate.solidFrst} placeholder="Return Solid First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.solidFrst')}
            style={inputstyles.addIterms}
          />
          {dspReturnRate && <Input
            value={formData.returnRate.solidScnd} placeholder="Return Solid Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.solidScnd')} style={inputstyles.addIterms} />}


          <Input
            value={formData.returnRate.triaxleFrst} placeholder="Return Triaxle First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.triaxleFrst')} style={inputstyles.addIterms} />
          {dspReturnRate && <Input
            value={formData.returnRate.triaxlesScnd} placeholder="Return Triaxle Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.triaxlesScnd')} style={inputstyles.addIterms} />}
          <Input
            value={formData.returnRate.linksFrst} placeholder="Return Links First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.linksFrst')} style={inputstyles.addIterms} />
          {dspReturnRate && <Input
            value={formData.returnRate.linksScnd} placeholder="Return Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.linkScnd')} style={inputstyles.addIterms} />}
          {<Input
            value={formData.returnRate.superLinkFrst} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.superLinkFrst')} style={inputstyles.addIterms} />}

          {dspReturnRate && <Input
            value={formData.returnRate.superLinkScnd} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.superLinkScnd')} style={inputstyles.addIterms} />}

          {!dspReturnRate && <ToggleMLBtn whatTToggle={toggleDspReturnRate} theTittle="Done Return Rate" />}
          {dspReturnRate && <ToggleMLBtn whatTToggle={toggleDspReturnRate} theTittle="Done Return Rate" />}
        </View>}

      </ScrollView>}

      {!dspRturnnLoads && dspContractD && !dsoLoadDe && <ScrollView>
        {!dspAddLocation && <View style={{ alignItems: 'center' }} >

          <Input
            value={formDataScnd.fuelAvai} placeholder="Fuel" onChangeText={(text) => handleTypedTextScnd(text, 'fuelAvai')} style={inputstyles.addIterms} />

          <Input
            value={formDataScnd.loadsPerWeek} placeholder="Loads Per Week" onChangeText={(text) => handleTypedTextScnd(text, 'loadsPerWeek')} style={inputstyles.addIterms} />


          <Input
            value={formDataScnd.contractDuration} placeholder="Contract Duration" onChangeText={(text) => handleTypedTextScnd(text, 'contractDuration')} style={inputstyles.addIterms} />
          <Input
            value={formDataScnd.startingDate} placeholder="Starting Date" onChangeText={(text) => handleTypedTextScnd(text, 'startingDate')} style={inputstyles.addIterms} />

          <Input
            value={formDataScnd.bookingClosingD} placeholder="Starting Date" onChangeText={(text) => handleTypedTextScnd(text, 'bookingClosingD')} style={inputstyles.addIterms} />

          <Input
            value={formDataScnd.contractRenewal} placeholder="Can You Renew Contract for how long" onChangeText={(text) => handleTypedTextScnd(text, 'contractRenewal')} style={inputstyles.addIterms} />


          <Input
            value={formDataScnd.alertMsg} placeholder="alertMsg" onChangeText={(text) => handleTypedTextScnd(text, 'alertMsg')} style={inputstyles.addIterms} />
          <Input
            value={formDataScnd.additionalInfo} placeholder="Additional Info" onChangeText={(text) => handleTypedTextScnd(text, 'additionalInfo')} style={inputstyles.addIterms} />

        </View>}

        {dspAddLocation && (
          <View style={{ alignSelf: 'center' }}>
            {!location && <View>

              {/* Local Selector */}
              <SlctCountryBtn selectedLoc="Local" onPress={() => specifyLocation("Local")} />

              {/* International Selector */}
              <SlctCountryBtn selectedLoc="International" onPress={() => specifyLocation("International")} />

            </View>}

            {/* Only show countries if International is selected */}
            {location === "Local" && (
              <>
                <ThemedText>Select The Local Country the contract wull be in</ThemedText>
                {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
                  <SlctCountryBtn
                    key={country}
                    selectedLoc={country}
                    onPress={() => toggleLocalCountry(country)}
                  />
                ))}
              </>
            )}


            {location === "International" && (
              <>
                <ThemedText>Select The International countries the contract will be in</ThemedText>


                {location === "International" && interOpCount.length > 0 && (
                  <ThemedText>Selected: {interOpCount.join(", ")}</ThemedText>
                )}
                {["Zimbabwe", "SouthAfrica", "Namibia", "Tanzania", "Mozambique", "Zambia", "Botswana", "Malawi"].map((country) => (
                  <SlctCountryBtn
                    key={country}
                    selectedLoc={country}
                    isSelected={interOpCount.includes(country)}
                    onPress={() => toggleInternationalCountry(country)}
                  />
                ))}

                <TouchableOpacity onPress={() => {
                  setDspAddLocation(false);
                  setlocation("");
                }} >
                  <ThemedText>Donee</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {location === "International" && interOpCount.length > 0 && (
          <ThemedText>Selected International : {interOpCount.join(", ")}</ThemedText>
        )}
        {location === "Local" && locaOpCount && <ThemedText>Local : {locaOpCount} </ThemedText>}

        <ThemedText>Is the contract International or Local for one country</ThemedText>
        {!dspAddLocation && <TouchableOpacity onPress={() => setDspAddLocation(true)} style={styles.buttonIsFalse}  >
          <ThemedText> {location ? "Chnage Opearing location" : "Choose operating Location"} </ThemedText>
        </TouchableOpacity>}

        <TouchableOpacity onPress={toggleDspCheckout} style={{ flex: 1, backgroundColor: '#6a0c0c', height: 40, justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 8 }} >
          <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Done Submit</ThemedText>
        </TouchableOpacity>

      </ScrollView>}

    </View>
        </ScreenWrapper>
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
