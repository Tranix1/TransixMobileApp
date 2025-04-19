import React, { useState, FC } from "react";

import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

import inputstyles from "../../components/styles/inputElement";

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
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { EvilIcons, Ionicons } from "@expo/vector-icons";


function AddLoadContract() {
  const backgroundLight = useThemeColor('backgroundLight')
  const background = useThemeColor('background')
  const iconcolor = useThemeColor('icon')

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
    icon: boolean
  };

  const ToggleMLBtn = ({ whatTToggle, theTittle, icon }: ToggleMLBtnProps) => (
    <TouchableOpacity onPress={whatTToggle} style={[styles.moreLessIterms, { backgroundColor: backgroundLight, flexDirection: 'row', gap: wp(2) }]}>
      <ThemedText type="tiny" style={{}}>{theTittle}</ThemedText>
      <Ionicons name={!icon ? 'chevron-down' : 'chevron-up'} size={wp(4)} color={iconcolor} />
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
    <ScreenWrapper fh={false}>

      <Heading page='Add Contracts' />
      <View style={{ flex: 1 }}>





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






        {dspCheckOutP &&
          <CheckOutMakePayments jsxProp={<View>
            <ThemedText> its $10 to add contract </ThemedText>
          </View>} confirmButon={justConsole} cancelBTN={() => setDspCheckout(false)}
          />}



        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: wp(3) }} >
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

        {dsoLoadDe && !dspRturnnLoads && !dspContractD &&
          <ScrollView contentContainerStyle={{ marginBottom: wp(4) }}>


            <View style={styles.viewMainDsp}>

              <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                Add Commodities
              </ThemedText>

              <Input
                value={formData.commodity.frst} placeholder="First Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.frst')} style={{}} />

              <Input
                value={formData.commodity.scnd} placeholder="Second Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.scnd')} style={{}} />

              {dspCommodity &&
                <View>
                  <Input
                    value={formData.commodity.third} placeholder="Third Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.third')} style={{}} />
                  <Input
                    value={formData.commodity.forth} placeholder="Fourth Commodity" onChangeText={(text) => handleTypedText(text, 'commodity.forth')} style={{}} />

                </View>
              }




              <ToggleMLBtn whatTToggle={toggleDspCommodity} theTittle={dspCommodity ? "Hide" : "Show More"} icon={dspCommodity} />




            </View>

            <Divider />

            <View style={styles.viewMainDsp}>
              <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15, }}>Payment Terms</ThemedText>
              <Input
                value={formDataScnd.paymentTerms} placeholder="Payment Terms" onChangeText={(text) => handleTypedTextScnd(text, 'paymentTerms')} style={{}} />
            </View>

            <Divider />
            <View style={styles.viewMainDsp} >

              {dspLocation &&
                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                  Add all the commodities to be transpoted
                </ThemedText>
              }
              {!dspLocation &&
                <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }}>
                  Add 3 Commodity
                </ThemedText>
              }

              <View>
                <Input
                  value={formData.location.frst} placeholder={dspLocation ? "First Location" : "From Location"} onChangeText={(text) => handleTypedText(text, 'location.frst')} style={{}} />
                <Input
                  value={formData.location.scnd} placeholder={dspLocation ? "Second Location" : "To Location"} onChangeText={(text) => handleTypedText(text, 'location.scnd')} style={{}} />
              </View>

              {dspLocation && !nowEnterLoca && (
                <View style={{ padding: 4, gap: wp(5) }}>
                  <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                    There is more than two location
                  </ThemedText>
                  <View style={[styles.viewSubMainDsp, { backgroundColor: background }]}>
                    <ThemedText style={{ textAlign: 'center' }}>How will they operate from routes?:</ThemedText>

                    <Divider />
                    <View style={{ gap: wp(3), padding: wp(3) }}>
                      <TouchableOpacity
                        onPress={() => setManyRoutesAssign('All Routes One Stop')}
                        style={{
                          justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                        }}
                      >
                        <ThemedText>
                          All Routes One Stop
                        </ThemedText>
                        {manyRoutesAssign === 'All Routes One Stop' ?
                          <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color="black" />
                          :
                          <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color="black" />
                        }
                      </TouchableOpacity>

                      {manyRoutesAssign === 'All Routes One Stop' && (
                        <Input
                          value={formData.location.seventh}
                          placeholder="Sixth Location"
                          onChangeText={(text) => handleTypedText(text, 'location.seventh')}
                          style={[{}]}
                        />
                      )}


                      <TouchableOpacity
                        onPress={() => setManyRoutesAssign('One Route to another')}
                        style={{
                          justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                        }}
                      >
                        <ThemedText>
                          Route to Route
                        </ThemedText>
                        {manyRoutesAssign === 'One Route to another' ?
                          <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color="black" />
                          :
                          <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color="black" />
                        }
                      </TouchableOpacity>


                    </View>


                  </View>

                  <View style={[styles.viewSubMainDsp, { backgroundColor: background }]}>
                    <ThemedText style={{ textAlign: 'center' }}>Will the tranporter choose where to go or it will be random?</ThemedText>


                    <Divider />
                    <View style={{ gap: wp(3), padding: wp(3) }}>

                      <TouchableOpacity
                        onPress={() => setManyRoutesAllocation('Tranporter Choose')}
                        style={{
                          justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                        }}
                      >
                        <ThemedText>
                          Tranporter Choose
                        </ThemedText>
                        {manyRoutesAllocaton === 'Tranporter Choose' ?
                          <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color="black" />
                          :
                          <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color="black" />
                        }
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setManyRoutesAllocation('Random Allocation')}
                        style={{
                          justifyContent: 'space-between', padding: 3, alignContent: 'center', flexDirection: 'row'
                        }}
                      >
                        <ThemedText>
                          Random Allocation
                        </ThemedText>
                        {manyRoutesAllocaton === 'Random Allocation' ?
                          <EvilIcons name="check" size={30} style={{ textAlign: 'center', width: wp(6) }} color="black" />
                          :
                          <Ionicons name="ellipse-outline" style={{ textAlign: 'center', width: wp(6) }} size={24} color="black" />
                        }
                      </TouchableOpacity>


                    </View>
                  </View>

                  <ThemedText style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                    How will the routes work?
                  </ThemedText>
                  <Input
                    value={formDataScnd.manyRoutesOperation}
                    placeholder="Routes Operate"
                    onChangeText={(text) => handleTypedTextScnd(text, 'manyRoutesOperation')}
                  />


                </View>
              )}

              {
                !(dspLocation && nowEnterLoca) &&
                <>
                  <TouchableOpacity onPress={doneEnterThLocs} style={[styles.moreLessIterms, { backgroundColor: backgroundLight, flexDirection: 'row', gap: wp(2) }]}>
                    <ThemedText type="tiny" >Next</ThemedText>
                    {/* <Ionicons name={(manyRoutesAllocaton && manyRoutesAssign) ? 'che6vron-down' : 'chevron-up'} size={wp(4)} color={iconcolor} /> */}
                  </TouchableOpacity>

                </>
              }
              <ToggleMLBtn whatTToggle={toggleDspLocation} theTittle={dspLocation ? 'Collpase' : " If You Have more that 2 locations"} icon={dspLocation} />
              <Divider />




              {dspLocation && nowEnterLoca &&
                <View>

                  <Input
                    value={formData.location.frst} placeholder={dspLocation ? "First Location" : "From Location"} onChangeText={(text) => handleTypedText(text, 'location.frst')} style={{}} />
                  <Input
                    value={formData.location.scnd} placeholder={dspLocation ? "Second Location" : "To Location"} onChangeText={(text) => handleTypedText(text, 'location.scnd')} style={{}} />
                  <Input
                    value={formData.location.thrd} placeholder="Third Location" onChangeText={(text) => handleTypedText(text, 'location.thrd')} style={{}} />
                  <Input
                    value={formData.location.forth} placeholder="Fourth Location" onChangeText={(text) => handleTypedText(text, 'location.forth')} style={{}} />
                  <Input
                    value={formData.location.fifth} placeholder="Fifth Location" onChangeText={(text) => handleTypedText(text, 'location.fifth')} style={{}} />
                  <Input
                    value={formData.location.sixth} placeholder="Sixth Location" onChangeText={(text) => handleTypedText(text, 'location.sixth')} style={{}} />

                  {dspLocation &&
                    <ToggleMLBtn whatTToggle={toggleDspLocation} icon={dspLocation} theTittle="Done Adding Location" />}


                </View>}
            </View>

            <Divider />
            {!dspReturnRate && !dspOtherRequirements && !dspRate && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>

              {dspTruckRequired && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add all the commodities to be transpoted</ThemedText>}
              {!dspTruckRequired && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add 3 Commodity</ThemedText>}
              <Input
                value={formData.trckRequired.frst} placeholder="First Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.frst')} style={{}} />
              <Input
                value={formData.trckRequired.scnd} placeholder="Second Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.scnd')} style={{}} />



              {!dspTruckRequired && <ToggleMLBtn whatTToggle={toggleDspTruckRequired} theTittle="More than 2 type of trucks reuired" />}


              {dspTruckRequired && <View>
                <Input
                  value={formData.trckRequired.third} placeholder="Third Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.third')} style={{}} />
                <Input
                  value={formData.trckRequired.forth} placeholder="Fourth Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.forth')} style={{}} />

                <Input
                  value={formData.trckRequired.fifth} placeholder="Fifth Truck Requirement" onChangeText={(text) => handleTypedText(text, 'trckRequired.fifth')} style={{}} />

                {dspTruckRequired && <ToggleMLBtn whatTToggle={toggleDspTruckRequired} theTittle="Done Adding Reuired trucks" />}


              </View>}
            </View>}

            <Divider />
            {!dspReturnRate && !dspRate && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>

              {dspOtherRequirements && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add all the commodities to be transpoted</ThemedText>}
              {!dspOtherRequirements && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add 3 Commodity</ThemedText>}
              <Input
                value={formData.otherRequirements.frst}
                placeholder="First Other Requirement"
                onChangeText={(text) => handleTypedText(text, 'otherRequirements.frst')}
                style={{}}
              />
              <Input
                value={formData.otherRequirements.scnd}
                placeholder="Second Other Requirement"
                onChangeText={(text) => handleTypedText(text, 'otherRequirements.scnd')}
                style={{}}
              />

              {!dspOtherRequirements && <ToggleMLBtn whatTToggle={toggleDspOtherRequirements} theTittle="Done Adding Other Reuirems" />}

              {dspOtherRequirements && <View>


                <Input
                  value={formData.otherRequirements.third} placeholder="Third Other Requirement" onChangeText={(text) => handleTypedText(text, 'otherRequirements.third')} style={{}} />
                <Input
                  value={formData.otherRequirements.forth} placeholder="Fourth Other Requirement" onChangeText={(text) => handleTypedText(text, 'otherRequirements.forth')} style={{}} />

                {dspOtherRequirements && <ToggleMLBtn whatTToggle={toggleDspOtherRequirements} theTittle="Done Adding Other Rei" />}

              </View>}
            </View>}

            <Divider />
            {!dspReturnRate && !dspOtherRequirements && !dspTruckRequired && !dspLocation && !dspCommodity && <View style={styles.viewMainDsp}>
              {dspRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add all the Rates dor Contract</ThemedText>}
              {!dspRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add 3 Rates</ThemedText>}
              <Input
                value={formData.rate.solidFrst} placeholder="Solid First Rate" onChangeText={(text) => handleTypedText(text, 'rate.solidFrst')} style={{}} />
              {dspRate && <Input
                value={formData.rate.solidScnd} placeholder="Solid Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.solidScnd')} style={{}} />}

              <Input
                value={formData.rate.triaxleFrst} placeholder="Triaxle First Rate" onChangeText={(text) => handleTypedText(text, 'rate.triaxleFrst')} style={{}} />
              {dspRate && <Input
                value={formData.rate.triaxlesScnd} placeholder="Triaxle Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.triaxlesScnd')} style={{}} />}
              <Input
                value={formData.rate.linksFrst} placeholder="Links First Rate" onChangeText={(text) => handleTypedText(text, 'rate.linksFrst')} style={{}} />
              {dspRate && <Input
                value={formData.rate.linksScnd} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.linksScnd')} style={{}} />}

              {<Input
                value={formData.rate.superLinkFrst} placeholder="Super Link Rate" onChangeText={(text) => handleTypedText(text, 'rate.superLinkFrst')} style={{}} />}
              {dspRate && <Input
                value={formData.rate.superLinkScnd} placeholder="Super Link Second Rate" onChangeText={(text) => handleTypedText(text, 'rate.superLinkScnd')} style={{}} />}


              {!dspRate && <ToggleMLBtn whatTToggle={toggleDspRate} theTittle="More than 2 rates" />}
              {dspRate && <ToggleMLBtn whatTToggle={toggleDspRate} theTittle="Done Rates" />}


            </View>}

          </ScrollView>}

        {dspRturnnLoads && !dspContractD && !dsoLoadDe && <ScrollView>

          {<View style={styles.viewMainDsp} >
            {dspReturnCommodity && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add all the commodities to be transpoted</ThemedText>}
            {!dspReturnCommodity && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add 3 Commodity</ThemedText>}
            <Input
              value={formData.returnCommodity.frst} placeholder="First Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.frst')} style={{}} />
            <Input
              value={formData.returnCommodity.scnd} placeholder="Second Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.scnd')} style={{}} />
            {!dspReturnCommodity && <ToggleMLBtn whatTToggle={toggleDspReturnCommodity} theTittle=" Return Commo" />}

            {dspReturnCommodity && <View>
              <Input
                value={formData.returnCommodity.third} placeholder="Third Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.third')} style={{}} />
              <Input
                value={formData.returnCommodity.forth} placeholder="Fourth Commodity" onChangeText={(text) => handleTypedText(text, 'returnCommodity.forth')} style={{}} />


              {dspReturnCommodity && <ToggleMLBtn whatTToggle={toggleDspReturnCommodity} theTittle="Done Return Commo" />}
            </View>}

          </View>}

          <View style={styles.viewMainDsp} >
            <Input
              value={formDataScnd.returnPaymentTerms} placeholder="Return Payment Terms" onChangeText={(text) => handleTypedTextScnd(text, 'returnPaymentTerms')} style={{}} />
          </View>

          {<View style={styles.viewMainDsp}>
            {dspReturnRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add all the rates for return loads</ThemedText>}
            {!dspReturnRate && <ThemedText style={{ color: '#1E90FF', fontWeight: 'bold', fontSize: 15 }} >Add rates for return loads</ThemedText>}
            <Input
              value={formData.returnRate.solidFrst} placeholder="Return Solid First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.solidFrst')}
              style={{}}
            />
            {dspReturnRate && <Input
              value={formData.returnRate.solidScnd} placeholder="Return Solid Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.solidScnd')} style={{}} />}


            <Input
              value={formData.returnRate.triaxleFrst} placeholder="Return Triaxle First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.triaxleFrst')} style={{}} />
            {dspReturnRate && <Input
              value={formData.returnRate.triaxlesScnd} placeholder="Return Triaxle Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.triaxlesScnd')} style={{}} />}
            <Input
              value={formData.returnRate.linksFrst} placeholder="Return Links First Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.linksFrst')} style={{}} />
            {dspReturnRate && <Input
              value={formData.returnRate.linksScnd} placeholder="Return Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.linkScnd')} style={{}} />}
            {<Input
              value={formData.returnRate.superLinkFrst} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.superLinkFrst')} style={{}} />}

            {dspReturnRate && <Input
              value={formData.returnRate.superLinkScnd} placeholder="Links Second Rate" onChangeText={(text) => handleTypedText(text, 'returnRate.superLinkScnd')} style={{}} />}

            {!dspReturnRate && <ToggleMLBtn whatTToggle={toggleDspReturnRate} theTittle="Done Return Rate" />}
            {dspReturnRate && <ToggleMLBtn whatTToggle={toggleDspReturnRate} theTittle="Done Return Rate" />}
          </View>}

        </ScrollView>}

        {!dspRturnnLoads && dspContractD && !dsoLoadDe && <ScrollView>
          {!dspAddLocation && <View style={{ alignItems: 'center' }} >

            <Input
              value={formDataScnd.fuelAvai} placeholder="Fuel" onChangeText={(text) => handleTypedTextScnd(text, 'fuelAvai')} style={{}} />

            <Input
              value={formDataScnd.loadsPerWeek} placeholder="Loads Per Week" onChangeText={(text) => handleTypedTextScnd(text, 'loadsPerWeek')} style={{}} />


            <Input
              value={formDataScnd.contractDuration} placeholder="Contract Duration" onChangeText={(text) => handleTypedTextScnd(text, 'contractDuration')} style={{}} />
            <Input
              value={formDataScnd.startingDate} placeholder="Starting Date" onChangeText={(text) => handleTypedTextScnd(text, 'startingDate')} style={{}} />

            <Input
              value={formDataScnd.bookingClosingD} placeholder="Starting Date" onChangeText={(text) => handleTypedTextScnd(text, 'bookingClosingD')} style={{}} />

            <Input
              value={formDataScnd.contractRenewal} placeholder="Can You Renew Contract for how long" onChangeText={(text) => handleTypedTextScnd(text, 'contractRenewal')} style={{}} />


            <Input
              value={formDataScnd.alertMsg} placeholder="alertMsg" onChangeText={(text) => handleTypedTextScnd(text, 'alertMsg')} style={{}} />
            <Input
              value={formDataScnd.additionalInfo} placeholder="Additional Info" onChangeText={(text) => handleTypedTextScnd(text, 'additionalInfo')} style={{}} />

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
