import React, { useState } from "react";
import { View, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView, TouchableNativeFeedback } from "react-native"
import inputstyles from "../../components/styles/inputElement";

import type { ImagePickerAsset } from 'expo-image-picker';

import CountryPicker from 'react-native-country-picker-modal';
import { CountryCode } from 'react-native-country-picker-modal';
import { Country } from 'react-native-country-picker-modal';

import { addDocument, getDocById, setDocuments } from "@/db/operations";
import { uploadImage } from "@/db/operations";

import { selectManyImages, handleChange } from "@/Utilities/utils";

import Fontisto from '@expo/vector-icons/Fontisto';

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { ErrorOverlay } from "@/components/ErrorOverLay";
import CountrySelector from "@/components/CountrySelector";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";

import { SpecifyTruckDetails } from "@/components/SpecifyTruckDetails";
import { TruckTypeProps } from "@/types/types";

import { Ionicons } from "@expo/vector-icons";
import { wp } from "@/constants/common";

import { useThemeColor } from '@/hooks/useThemeColor'
function AddTrucks() {

  const icon = useThemeColor('icon')
  const background = useThemeColor('backgroundLight')
  // const {truckType ,username ,contact , isVerified,isBlackListed ,blackLWarning,blockVerifiedU , verifiedLoad , fromLocation  , toLocation ,expoPushToken ,verifyOngoing ,truckTonnageG} = route.params

  interface FormData {
    additionalInfo: string;
    trailerType: string;
    trailerModel: string;
    driverPhone: string;
    maxloadCapacity: string;
  }

  const [formData, setFormData] = React.useState<FormData>({
    additionalInfo: "",
    trailerType: "",
    trailerModel: "",
    driverPhone: "",
    maxloadCapacity: "",
  });

  const [countryCodeDriver, setCountryCodeDriver] = React.useState("")
  const [callingCodeDriver, setCallingCodeDriver] = React.useState('');

  const handleCountrySelectDriver = (country: Country): void => {
    setCallingCodeDriver(country.cca2);
    setCountryCodeDriver(country.callingCode[0] || ''); // Use first calling code, fallback to ''
  };

  const [countryCodeTrOwner, setCountryCodeTrOwner] = React.useState("")
  const [callingCodeTrOwner, setCallingCodeTrOwner] = React.useState('');

  const handleCountrySelectTrOwner = (country: Country): void => {
    setCallingCodeTrOwner(country.cca2);
    setCountryCodeTrOwner(country.callingCode[0] || ""); // use first calling code
  };

  const [ownerName, SetOwnerName] = React.useState('yaya');
  const [onwerEmail, setOwnerEmail] = React.useState('');
  const [ownerPhoneNum, setOwnerCall] = React.useState('');

  const [getOwnerDetails, setOwnerDetails] = React.useState<any>({}); // Better to define an interface/type

  React.useEffect(() => {
    getDocById('truckOwnerDetails', setOwnerDetails);
  }, []);

  console.log(getOwnerDetails?.ownerName, "owner");

  const [ownerNameAddDb, SetOwnerNameAddDb] = React.useState('');
  const [ownerEmailAddDb, setOwnerEmailAddDb] = React.useState('');
  const [ownerPhonNumAddDb, setOwnerPhoneNum] = React.useState('');

  const handleUpdateDriverDetails = async () => {

    await setDocuments("truckOwnerDetails", { ownerName: ownerNameAddDb, ownerPhoneNum: ownerPhonNumAddDb, ownerEmail: ownerEmailAddDb, })
  };

  const [location, setLocation] = useState<string>(""); // Track local or international selection
  const [locaOpLoc, setLocaOpLoc] = useState<string>(""); // Track selected local country
  const [intOpLoc, setIntOpLoc] = useState<string[]>([]); // Track international countries


  const [truckDetails, setTruckDDsp] = React.useState(false)

  function togglrTruckDe() {
    setTruckDDsp(prev => !prev)
    setDriverDDsp(false)
  }


  const [dspFrstPageErr, setDspFrstPageErr] = React.useState<boolean>(false)

  const [driverDetails, setDriverDDsp] = React.useState(false)

  function togglrDriverDe() {
    if (!formData.trailerType || !formData.maxloadCapacity || !location || !selectedTruckType?.name || (!intOpLoc && !locaOpLoc)) {
      setDspFrstPageErr(true)
      return
    }

    setTruckDDsp(false)
    setDriverDDsp(prev => !prev)
  }

  // const [images, setImages] = useState([]);
  const [images, setImages] = useState<ImagePickerAsset[]>([]);



  const [selectedTruckType, setSelectedTruckType] = useState<TruckTypeProps | null>(null)

  const [dspTruckCpacity, setDspTruckCapacity] = React.useState<string>("")
  let [truckCapacity, setTruckCapacity] = React.useState("")

  const [dspSpecTruckDet, setDspSpecTruckDet] = React.useState<boolean>(false)


  const clearFilter = () => {
    setSelectedTruckType(null)
    setTruckCapacity('')
    setLocation("")
    setLocaOpLoc("")
    setIntOpLoc([])
  }


  const [spinnerItem, setSpinnerItem] = React.useState(false);
  const [addingDocUpdate, setAddingDocUpdate] = React.useState("")
  const [uploadingImageUpdate, setUploadImageUpdate] = React.useState("")



  const handleSubmit = async () => {

    setDriverDDsp(false)
    setTruckDDsp(false)

    if (selectedTruckType?.name === "other" && formData.trailerModel) {

      // selectedTruckType?.name = formData.trailerModel
    }

    let truckImage, truckBookImage, trailerBookF, trailerBookSc, driverLicense, driverPassport;


    if (images.length < 5 && spinnerItem && selectedTruckType?.name !== "Rigid") {
      alert("Add All reuired images")
      setSpinnerItem(false)
      return
    } else if (images.length > 6 && spinnerItem && selectedTruckType?.name !== "Rigid") {
      alert("You added too many images click restart addig images")
      setSpinnerItem(false)
      return
    } else if ((images.length === 5 || images.length === 6) && selectedTruckType?.name !== "Rigid") {

      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, " truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "driver passport");

      truckBookImage = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "truck Book");
      trailerBookF = await uploadImage(images[4], "Trucks", setUploadImageUpdate, "trailer Book");
      trailerBookSc = images.length === 5 ? await uploadImage(images[5], "Trucks", setUploadImageUpdate, "trailer Book sec") : null;


    } else if (images.length === 4 && spinnerItem && selectedTruckType?.name === "Rigid") {

      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "driver passport");

      truckBookImage = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "truck Book");
    }

    setSpinnerItem(true)
    let withDetails = true
    try {

      const submitData = {
        // CompanyName : username ,
        // contact : contact ,
        imageUrl: truckImage,

        truckBookImage: truckBookImage,
        trailerBookF: trailerBookF,
        trailerBookSc: trailerBookSc,
        driverLicense: driverLicense,
        driverPassport: driverPassport,

        ownerName: ownerName,
        onwerEmail: onwerEmail,
        ownerPhoneNum: ownerPhoneNum,

        location: location,
        intOpLoc: intOpLoc,
        locaOpLoc: locaOpLoc,

        // userId : userId ,
        truckType: selectedTruckType?.name,
        // isVerified : isVerified ,
        withDetails: withDetails,
        // expoPushToken :expoPushToken , 
        deletionTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
        truckTonnage: truckCapacity,
        ...formData,
      }

      addDocument("Trucks", submitData, setAddingDocUpdate)

      setFormData({
        additionalInfo: "",
        trailerType: "",
        trailerModel: "",
        driverPhone: "",
        maxloadCapacity: ""
      });

      setImages([]);
      setSpinnerItem(false)


    } catch (err) {
      console.error(err);
    }
  };

  console.log(formData.trailerType)

  return (
    <ScreenWrapper>

      <Heading page='Add Trucks' />
      <TouchableOpacity onPress={() => setDspSpecTruckDet(true)} style={{ backgroundColor: "green" }} >
        <ThemedText> Click here Select Truck Details </ThemedText>
      </TouchableOpacity>


      <SpecifyTruckDetails
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

        // Selecting A country and location
        location={location}
        setLocation={setLocation}
        intOpLoc={intOpLoc}
        setIntOpLoc={setIntOpLoc}
        setLocaOpLoc={setLocaOpLoc}
        locaOpLoc={locaOpLoc}
      />

      {/* <CountrySelector
            location={location}
            setLocation={setLocation}
            intOpLoc={intOpLoc}
            setIntOpLoc={setIntOpLoc}
            setLocaOpLoc={setLocaOpLoc}
            setDspAddLocation={setDspAddLocation}
            dspAddLocation={dspAddLocation}
          /> */}

      <View style={{ marginHorizontal: wp(1), marginBottom: wp(1), }} >

        {(selectedTruckType || location || truckCapacity) &&
          <TouchableOpacity onPress={() => setDspSpecTruckDet(true)} style={{ padding: wp(2), flexDirection: 'row', backgroundColor: background, borderRadius: wp(6), marginBottom: wp(2), position: 'relative', }}>
            {selectedTruckType &&
              <View style={{ marginRight: wp(2) }}>
                <Image style={{ width: wp(20), height: wp(15), borderRadius: wp(4) }} source={selectedTruckType.image} />
              </View>
            }

            <View style={{ flex: 1, justifyContent: 'center' }}>
              {selectedTruckType &&
                <ThemedText type='subtitle' style={{ marginBottom: wp(1) }}>
                  {selectedTruckType?.name}
                </ThemedText>
              }
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: wp(2), alignItems: 'center' }}
                style={{ flexGrow: 0 }}
              >
                {truckCapacity &&
                  <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                    <ThemedText style={{ color: 'white' }}>
                      {truckCapacity}
                    </ThemedText>
                  </View>
                }
                {(intOpLoc || locaOpLoc) &&
                  <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                    <ThemedText style={{ color: 'white' }}>
                      {locaOpLoc || intOpLoc}
                    </ThemedText>
                  </View>
                }
              </ScrollView>
            </View>

            <View style={{ overflow: 'hidden', borderRadius: wp(10), position: 'absolute', right: wp(4), top: wp(2) }}>
              <TouchableNativeFeedback onPress={() => clearFilter()}>
                <View style={{ padding: wp(2) }}>
                  <Ionicons name={'close'} size={wp(4)} color={icon} />
                </View>
              </TouchableNativeFeedback>
            </View>
          </TouchableOpacity>

        }


      </View>




      <ThemedText>{addingDocUpdate} </ThemedText>
      <ThemedText>{uploadingImageUpdate} </ThemedText>








      <View style={{ alignItems: 'center', }} >

        <ErrorOverlay
          visible={dspFrstPageErr}
          title="Missing important details on Truck Details"
          errors={[
            !formData.trailerType && "Enter Trailer Type",
            !formData.maxloadCapacity && "Enter Maximum Load Capacity",
            selectedTruckType?.name === "other" && !formData.trailerModel && "Enter Trailer Model",
            !location && "Select were the truck can operate",
            !selectedTruckType?.name &&"Select TrucK Type" ,
            !truckCapacity && "select trcuk capacity" ,
            location && (!intOpLoc || !locaOpLoc) && "Select the country or countires the truck can operate",
          ].filter(Boolean) as string[]}
          onClose={() => setDspFrstPageErr(false)}
        />









        {ownerName && <View style={{ position: 'absolute', alignSelf: 'center', backgroundColor: background, top: 100, zIndex: 500, padding: 20, }} >
            <TouchableOpacity onPress={()=>SetOwnerName("")} >
              <ThemedText> CLick and close here  </ThemedText>
              <ThemedText> Btn avaialble fr dvp will remove it  </ThemedText>
            </TouchableOpacity>


          <Input
            placeholder="Owner Name"
            value={ownerNameAddDb}
            onChangeText={(text) => SetOwnerNameAddDb(text)}
          />

          {countryCodeTrOwner && <ThemedText style={{ textAlign: 'center', color: 'green', fontWeight: 'bold', }} >Country Code : {countryCodeTrOwner}</ThemedText>}
          {!countryCodeTrOwner && <ThemedText>Click select country to choose country code</ThemedText>}

          <Input
            placeholder="Owner Phon num"
            value={ownerPhonNumAddDb}
            onChangeText={(text) => setOwnerPhoneNum(text)}
          />

          <Input
            placeholder="Owner Email"
            value={ownerEmailAddDb}
            onChangeText={(text) => setOwnerEmailAddDb(text)}
          />

          <View style={{ flexDirection: 'row', paddingTop: 10, justifyContent: 'space-evenly' }}>


            <TouchableOpacity onPress={handleUpdateDriverDetails} style={{ backgroundColor: 'green', width: 100, height: 35, borderRadius: 5 }}>
              <ThemedText style={{ color: 'white' }}>Save</ThemedText>
            </TouchableOpacity>

          </View>


        </View>}









        {images[0] && !truckDetails && !driverDetails && <Image source={{ uri: images[0].uri }} style={{ width: 200, height: 200, }} />}
        {!images[0] && <ThemedText>Truck Image</ThemedText>}
        {!images[0] && <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9 }}>
          <Fontisto name="camera" size={30} color="#6a0c0c" />
        </TouchableOpacity>}

        <ScrollView>

          {spinnerItem && <ActivityIndicator size={34} />}

          {!driverDetails && !truckDetails && <View style={{ width: 350, backgroundColor: background, overflow: 'hidden' }}>
            {selectedTruckType?.name === "other" && <Input
              value={formData.trailerModel}
              placeholderTextColor="#6a0c0c"
              placeholder="Trailer Model"
              onChangeText={(text) => handleChange<FormData>(text, 'trailerModel', setFormData)}
            />}

            <Input
              value={formData.trailerType}
              placeholderTextColor="#6a0c0c"
              placeholder="Trailer Config"
              onChangeText={(text) => handleChange<FormData>(text, 'trailerType', setFormData)}
            />

            <Input
              value={formData.maxloadCapacity}
              placeholderTextColor="#6a0c0c"
              placeholder="maximumWheight"
              onChangeText={(text) => handleChange<FormData>(text, 'maxloadCapacity', setFormData)}
            />
            <Input
              value={formData.additionalInfo}
              placeholderTextColor="#6a0c0c"
              placeholder="Additional Information"
              onChangeText={(text) => handleChange<FormData>(text, 'additionalInfo', setFormData)}
            />


            {intOpLoc.length > 0 && (
              <ThemedText style={{ flexWrap: 'wrap', }}>Selected: {intOpLoc.join(", ")}</ThemedText>
            )}

          <TouchableOpacity onPress={togglrDriverDe} style={styles.nextPageBtn} >
            <ThemedText style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</ThemedText>
          </TouchableOpacity>
          </View>}



          {<View>

            <View style={{ alignSelf: 'center' }}>

              {(!images[0] && !formData.trailerType || !formData.maxloadCapacity) && <ThemedText>Fill in all the Information </ThemedText>}
              {(!images[0] && !formData.trailerType || !formData.maxloadCapacity) && <ThemedText>To add truck and driver details </ThemedText>}
            </View>


            {driverDetails && <View style={{ justifyContent: 'center' }} >

              <ThemedText>Driver Details</ThemedText>

              


          {!countryCodeDriver && (
            <View style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              padding: 10,
              backgroundColor: 'green',
              flexDirection: 'row',
              alignItems: 'center' ,
            }}>
              <CountryPicker
                countryCode={callingCodeDriver as CountryCode}
                withCountryNameButton={true}
                withCallingCode={true}
                withFilter={true}
                onSelect={handleCountrySelectDriver}
              />
            </View>
          )}

              {/*  */}
              {countryCodeDriver && <ThemedText style={{ textAlign: 'center', color: 'green', fontWeight: 'bold', }} >Country Code : {countryCodeDriver}</ThemedText>}
              {!countryCodeDriver && <ThemedText>Click select country to choose country code</ThemedText>}
              <Input
                value={formData.driverPhone}
                placeholderTextColor="#6a0c0c"
                placeholder="driverPhone"
                onChangeText={(text) => handleChange<FormData>(text, 'driverPhone', setFormData)}
                keyboardType="numeric"
              />


              {images[1] && !formData.driverPhone && <ThemedText>Dont forget to Enter driver Phone number</ThemedText>}

              {images[1] && <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >DRIVER PASSPORT IMAGE</ThemedText>}
              {images[1] && <Image source={{ uri: images[1].uri }} style={{ width: 200, height: 200, margin: 7 }} />}
              {images[0] && !images[1] && <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9, backgroundColor: '#6a0c0c', height: 30, width: 150, justifyContent: 'center', alignSelf: 'center' }}>
                <ThemedText style={{ backgroundColor: 'white', textAlign: 'center', color: 'black' }} >Driver PASSPORT</ThemedText>

              </TouchableOpacity>}



              {images[2] && <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >DRIVER ID IMAGE</ThemedText>}

              {images[2] && <Image source={{ uri: images[2].uri }} style={{ width: 200, height: 200, margin: 7 }} />}
              {images[0] && images[1] && !images[2] && <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9, backgroundColor: '#6a0c0c', height: 30, width: 150, justifyContent: 'center', alignSelf: 'center' }}>
                <ThemedText style={{ backgroundColor: 'white', textAlign: 'center', color: 'black' }} >Driver Id Image </ThemedText>
              </TouchableOpacity>}

              {images[2] && !formData.driverPhone && <ThemedText>Enter the driver Phone number to continue</ThemedText>}
              {images[2] && formData.driverPhone && <TouchableOpacity onPress={togglrTruckDe} style={styles.nextPageBtn} >
                <ThemedText style={{ fontWeight: "bold", color: 'white', fontSize: 16 }}>Done NEXT PAGE</ThemedText>
              </TouchableOpacity>}

            </View>}

            {images[3] && !truckDetails && !driverDetails && <TouchableOpacity onPress={togglrTruckDe} style={styles.buttonSelectStyle} >
              <ThemedText  >Truck Details</ThemedText>
            </TouchableOpacity>}

            {truckDetails && <View >
              <ThemedText>Truck Details</ThemedText>


              <View style={{ justifyContent: 'center' }} >
                {images[3] && <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >HORSE REG BOOK IMAGE</ThemedText>}
                {images[3] && <Image source={{ uri: images[3].uri }} style={{ width: 200, height: 200, margin: 7 }} />}
                {images[0] && images[1] && images[2] && !images[3] && <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9, backgroundColor: '#6a0c0c', height: 30, width: 150, justifyContent: 'center', alignSelf: 'center' }}>
                  <ThemedText style={{ backgroundColor: 'white', color: 'black' }} >horse Reg Book Image </ThemedText>
                </TouchableOpacity>}



                {images[4] && <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >Trailer Book Image</ThemedText>}
                {images[4] && <Image source={{ uri: images[4].uri }} style={{ width: 200, height: 200, margin: 7 }} />}
                {images[0] && images[1] && images[2] && images[3] && !images[4] && <ThemedText>First Trailer reg</ThemedText>}
                {images[0] && images[1] && images[2] && images[3] && !images[4] && <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9, backgroundColor: '#6a0c0c', height: 30, width: 150, justifyContent: 'center', alignSelf: 'center' }}>
                  <ThemedText style={{ backgroundColor: 'white', color: 'black' }} >Trailer Reg Book</ThemedText>
                </TouchableOpacity>}
              </View>

              <View>

                {images[5] && <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >TRAILER 2 REG BOOK IMAGE</ThemedText>}
                {images[5] && <Image source={{ uri: images[5].uri }} style={{ width: 200, height: 200, margin: 7 }} />}

                {images[0] && images[1] && images[2] && images[3] && images[4] && !images[5] && <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >Add If available or continue to add driver details</ThemedText>}
                {images[4] && !images[5] && <ThemedText>Trailer 2 Reg </ThemedText>}
                {images[0] && images[1] && images[2] && images[3] && images[4] && !images[5] && <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9, backgroundColor: '#6a0c0c', height: 30, width: 150, justifyContent: 'center', alignSelf: 'center' }}>
                  <ThemedText style={{ backgroundColor: 'white', color: 'black' }} >Book Image </ThemedText>
                </TouchableOpacity>}
              </View>


            </View>}






          </View>}






          {/* 
    {!spinnerItem&&!verifiedLoad &&!isVerified?  <TouchableOpacity onPress={handleSubmit} style={{alignSelf :"center", backgroundColor : '#6a0c0c' , width : 100 , height : 30 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center',marginTop:5}} >

        <Text style={{color:'white'}} >submit</Text>

        </TouchableOpacity>:
        <Text style={{alignSelf:"center",fontStyle:'italic'}} >The truck is being added Please wait </Text>
        } */}


          {!spinnerItem ? images.length >= 5 && <TouchableOpacity onPress={handleSubmit} style={{ alignSelf: "center", backgroundColor: '#6a0c0c', width: 100, height: 30, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 5 }} >

            <ThemedText style={{ color: 'white' }} >submit</ThemedText>

          </TouchableOpacity> :
            <ThemedText style={{ alignSelf: "center", fontStyle: 'italic' }} >The truck is being added Please wait </ThemedText>
          }


          <View style={{ height: 300 }} ></View>
        </ScrollView>
      </View>

    </ScreenWrapper>
  );

}


export default AddTrucks;


const styles = StyleSheet.create({
  buttonStyle: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 10,
    alignSelf: 'center'
  },
  buttonSelectStyle: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10

  },
  buttonIsFalse: {
    borderWidth: 1,
    borderColor: '#6a0c0c',
    paddingLeft: 4,
    paddingRight: 4,
    alignSelf: 'center'

    //  marginLeft : 6
  },
  nextPageBtn: {
    height: 35,
    width: 170,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  }, countryButton: {
    padding: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
  },
});
