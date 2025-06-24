import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image,  StyleSheet, ScrollView,  Modal, ToastAndroid } from "react-native"

import {countryCodes } from "@/data/appConstants";


import type { ImagePickerAsset } from 'expo-image-picker';
import { addDocument, getDocById, setDocuments } from "@/db/operations";
import { uploadImage } from "@/db/operations";
import { selectManyImages, handleChange } from "@/Utilities/utils";
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { ErrorOverlay } from "@/components/ErrorOverLay";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Countries, Truck, TruckTypeProps } from "@/types/types";
import { AntDesign, Entypo, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor'
import { Dropdown,  } from "react-native-element-dropdown";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import Divider from "@/components/Divider";
import { cleanNumber } from "@/services/services";
import Button from "@/components/Button";

import { TruckFormData } from "@/types/types";

import { AddTruckDetails } from "@/components/AddTruckDetails";
import { HorizontalTickComponent } from "@/components/SlctHorizonzalTick";

function AddTrucks() {

    // Theme colors
  const icon = useThemeColor('icon')
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const iconColor = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');
    const textColor = useThemeColor('text');
  const [formData, setFormData] = useState<TruckFormData>({
    additionalInfo: "",
    driverPhone: "",
    maxloadCapacity: "",
    truckName: "",
    otherTruckSuspension :"" ,
    otherCargoArea : "" ,
    otherTruckConfig : "" ,
    otherTankerType : ""
  });

interface TruckOwner {
  ownerName: string;
  ownerPhoneNum: string;
  ownerEmail: string;
}

// Then use it like this:
const [getOwnerDetails, setOwnerDetails] = useState<TruckOwner | null>(null);
  useEffect(() => {
    getDocById('truckOwnerDetails', setOwnerDetails);
  }, []);


  const [ownerNameAddDb, SetOwnerNameAddDb] = useState('');
  const [ownerEmailAddDb, setOwnerEmailAddDb] = useState('');
  const [ownerPhonNumAddDb, setOwnerPhoneNum] = useState('');

  const handleUpdateDriverDetails = async () => {
    setOwnerdetailsDsp(false) 
    console.log("start addd")
    await setDocuments("truckOwnerDetails", { ownerName: ownerNameAddDb, ownerPhoneNum: ownerPhonNumAddDb, ownerEmail: ownerEmailAddDb, })
    console.log("Donee Adding")
  };


  // const [images, setImages] = useState([]);
  const [images, setImages] = useState<ImagePickerAsset[]>([]);


const [selectedCargoArea, setSelectedCargoArea] = useState<TruckTypeProps | null>(null)
const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string } | null>(null)
const [selectedTankerType, setSelectedTankerType] = useState<{ id: number, name: string } | null>(null)
  const [selectedTruckCapacity , setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(null)


  const [showCountries, setShowCountries] = useState(false);
  const [operationCountries, setOperationCountries] = useState<string[]>([]);

  const [countryCode, setCountryCode] = useState<{ id: number, name: string }>({ id: 0, name: '+263' })
  const [selectedTrailerConfig, setSelectedTrailerConfig] = useState<{ id: number, name: string } | null>(null)
  const [selectedTruckSuspension, setSelectedTruckSuspension] = useState<{ id: number, name: string } | null>(null)

  const [ownerdetailsDsp, setOwnerdetailsDsp] = useState(true)

    const [truckOwnerOBroker , setTuckOwnerOBroker]=React.useState("")
    // if(truckOwnerOBroker==="Owner" &&ownerdetailsDsp ) setOwnerdetailsDsp(true)
  
  const [spinnerItem, setSpinnerItem] = useState(false);
  const [uploadingImageUpdate, setUploadImageUpdate] = useState("")
  
  const { user,alertBox } = useAuth();
console.log(uploadingImageUpdate)

  const handleSubmit = async () => {
      const missingTruckDetails = [
            !formData.truckName && "Enter the payment terms",
            !selectedTruckType && "Enter the payment terms",
            !selectedCargoArea && "Enter loads per week",
             selectedCargoArea?.name==="Tanker" && !selectedTankerType && "Enter contract duration",
            !selectedTruckCapacity && "Enter the starting date",
            !selectedTrailerConfig && "Enter fuel availability details",
            !selectedTruckSuspension && "Enter the booking closing date",
            operationCountries.length <=0  && "Select the country the loads will operate in",
        ].filter(Boolean);

       if (missingTruckDetails.length > 0) {
            // setContractDErr(true);
            alertBox("Missing Truck Details", missingTruckDetails.join("\n"), [], "error");
            return;
        }
        const MissingDriverDetails= [
          !formData.driverPhone && "",
        ]
   if (missingTruckDetails.length > 0) {
            // setContractDErr(true);
            alertBox("Missing Driver Details", MissingDriverDetails.join("\n"), [], "error");
            return;
        }



    if (images.length < 4) {
      ToastAndroid.show('Please Add all the required Images before Submiting', ToastAndroid.SHORT)
      return;
    }


    let truckImage, truckBookImage, trailerBookF, trailerBookSc, driverLicense, driverPassport;
    setSpinnerItem(true)

    if (images.length < 5 && spinnerItem && selectedCargoArea?.name !== "Rigid") {
      alert("Add All reuired images")
      setSpinnerItem(false)
      return
    } else if (images.length > 6 && spinnerItem && selectedCargoArea?.name !== "Rigid") {
      alert("You added too many images click restart addig images")
      setSpinnerItem(false)
      return
    } else if ((images.length === 5 || images.length === 6) && selectedCargoArea?.name !== "Rigid") {

      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, " truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "driver passport");

      truckBookImage = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "truck Book");
      trailerBookF = await uploadImage(images[4], "Trucks", setUploadImageUpdate, "trailer Book");
      trailerBookSc = images.length === 5 ? await uploadImage(images[5], "Trucks", setUploadImageUpdate, "trailer Book sec") : null;


    } else if (images.length === 4 && spinnerItem && selectedCargoArea?.name === "Rigid") {

      truckImage = await uploadImage(images[0], "Trucks", setUploadImageUpdate, "truck Image");
      driverLicense = await uploadImage(images[1], "Trucks", setUploadImageUpdate, "Driver License");
      driverPassport = await uploadImage(images[2], "Trucks", setUploadImageUpdate, "driver passport");

      truckBookImage = await uploadImage(images[3], "Trucks", setUploadImageUpdate, "truck Book");
    }

    if (!selectedCargoArea)
      return alert("Select Truck Type");

    if (!user){

      return alert("Please Login to your account to add a truck");
    }

    setSpinnerItem(true)

  if (!user) {
            alert("Please Login first");
            return;
        }
        if (!user.organisation) {
            alert("Please edit your account and add Organisation details first, eg:Organisation Name!");
            return;
        }

    try {

      const submitData = {
     CompanyName: user.organisation,
     contact: user?.phoneNumber || '',
        imageUrl: truckImage,
        truckBookImage: truckBookImage,
          trailerBookF: trailerBookF,
          trailerBookSc: trailerBookSc,
          driverLicense: driverLicense,
          driverPassport: driverPassport,

          ownerName: getOwnerDetails?.ownerName ,
          onwerEmail: getOwnerDetails?.ownerEmail ,
          ownerPhoneNum: getOwnerDetails?.ownerPhoneNum ,

          locations: operationCountries,
          truckType: selectedTruckType?.name , 
          cargoArea: selectedCargoArea.name,
          tankerType : selectedTankerType ? selectedTankerType?.name : null ,
          truckCapacity : selectedTruckCapacity?.name ,
          truckConfig : selectedTrailerConfig?.name ,
          truckSuspensions : selectedTruckSuspension?.name ,
          ...formData,
        }

        addDocument("Trucks", submitData )

        // setImages([]);
        setSpinnerItem(false)

        ToastAndroid.show('Truck Added successfully', ToastAndroid.SHORT)

      } catch (err) {
        console.error(err);
      }
    };




  return (
    <ScreenWrapper>

      <Heading page='Add Truck' />
     

      <View style={{ paddingHorizontal: wp(4) }} >

                {/* {!uploadingImageUpdate && <View style={{height:25 , backgroundColor:"red",width:180, margin :10, justifyContent:"center",alignItems:"center"   , position:"absolute",top:0,zIndex:100, alignSelf:"center" }} >
            <ThemedText > {uploadingImageUpdate} pana </ThemedText>
          </View>} */}

        <ScrollView>




              <ThemedText>Are You the truck owner or Broker ?</ThemedText>
              <HorizontalTickComponent 
                data={[ {topic:"Owner" , value :"Owner" } , {topic:"Broker" , value :"Broker" }   ]}
                condition={truckOwnerOBroker} 
                 onSelect ={setTuckOwnerOBroker}
              />


          {/* <Modal visible={truckOwnerOBroker} statusBarTranslucent animationType="slide">
            <ScreenWrapper>

            <View style={{ margin: wp(4), marginTop: hp(6) }}>

              <View style={{ gap: wp(2) }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
                  <TouchableOpacity onPress={() => setOwnerdetailsDsp(false)}>
                    <AntDesign name="close" color={icon} size={wp(4)} />
                  </TouchableOpacity>
                    <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >OWNER DETAILS</ThemedText>
                </View>


                <ThemedText>
                  Owner's Name
                </ThemedText>
                <Input
                  placeholder="Owner's Name"
                  value={ownerNameAddDb}
                  onChangeText={(text) => SetOwnerNameAddDb(text)}
                />

                <ThemedText>
                  Owner's Phone Number
                </ThemedText>
                <Input
                  Icon={<>
                    <Dropdown
                      style={[{ width: wp(15) }]}
                      selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
                      data={countryCodes}
                      maxHeight={hp(60)}
                      labelField="name"
                      valueField="name"
                      placeholder="+00"
                      value={countryCode?.name}
                      itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                      activeColor={background}

                      containerStyle={{
                        borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
                        width: wp(45),
                        shadowOffset: {
                          width: 0,
                          height: 9,
                        },
                        shadowOpacity: 0.50,
                        shadowRadius: 12.35,

                        elevation: 19,
                        paddingVertical: wp(1)
                      }}
                      onChange={item => {
                        console.log(item);
                        setCountryCode(item);
                      }}

                      renderLeftIcon={() => <></>}
                      renderRightIcon={() => <Ionicons name="chevron-down" size={wp(4)} color={icon} />}
                      renderItem={((item, selected) =>
                        <>
                          <View style={[styles.item, selected && {}]}>
                            <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                            {selected && (
                              <Ionicons
                                color={icon}
                                name='checkmark-outline'
                                size={wp(5)}
                              />
                            )}
                          </View>
                          <Divider />
                        </>
                      )}

                    />
                    <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
                  </>}
                  value={cleanNumber(ownerPhonNumAddDb)}
                  maxLength={11}
                  placeholder="700 000 000"
                  onChangeText={(text) => setOwnerPhoneNum(cleanNumber(text))}
                  keyboardType="numeric"
                />

                <ThemedText>
                  Owner's Email
                </ThemedText>
                <Input
                  placeholder="Owner Email"
                  value={ownerEmailAddDb}
                  onChangeText={(text) => setOwnerEmailAddDb(text)}
                />

               <ThemedText>Upload: Company Doc Validating Truck Ownership or Lease </ThemedText>     
               <ThemedText type="tiny">Like a certificate of incoperation with same name on books </ThemedText>            

                              
                <Button onPress={handleUpdateDriverDetails} title="Save" />

              </View>
            </View>
            </ScreenWrapper>

          </Modal> */}



          <View style={{ alignItems: 'center' }}>
            {images[0]   && <Image source={{ uri: images[0].uri }} style={{ width: wp(90), height: wp(90), marginBottom: 9, borderRadius: wp(4) }} />}
            {!images[0] &&
              <TouchableOpacity onPress={() => selectManyImages(setImages,true)} style={{ marginBottom: 9, width: wp(90), height: wp(90), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(40)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Truck Image<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>}

          </View>
          <View style={{ gap: wp(2) }}>

            <ThemedText>
              Truck Name<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.truckName}
              placeholder=""
              onChangeText={(text) => handleChange<TruckFormData>(text, 'truckName', setFormData)}
            />

         <AddTruckDetails   
              selectedTruckType ={selectedTruckType}
              setSelectedTruckType={setSelectedTruckType}
              selectedCargoArea ={selectedCargoArea}
              setSelectedCargoArea ={setSelectedCargoArea}
              selectedTankerType={selectedTankerType} 
              setSelectedTankerType={setSelectedTankerType}
              selectedTruckCapacity={selectedTruckCapacity}
              setSelectedTruckCapacity={setSelectedTruckCapacity}
              selectedTrailerConfig={selectedTrailerConfig} 
              setSelectedTrailerConfig = {setSelectedTrailerConfig}
              selectedTruckSuspension={selectedTruckSuspension}
              setSelectedTruckSuspension={setSelectedTruckSuspension} 
              formData={formData}
              setFormData={setFormData}
              showCountries={showCountries} 
              setShowCountries={setShowCountries}
              operationCountries={operationCountries}
              setOperationCountries={setOperationCountries}
         />      


            <ThemedText>
              Additional Information<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.additionalInfo} multiline numberOfLines={8} style={{ verticalAlign: 'top', minHeight: hp(15) }} containerStyles={{}}
              placeholder="Additional Information"
              onChangeText={(text) => handleChange< TruckFormData>(text, 'additionalInfo', setFormData)}
            />


          
            <Divider />


            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >DRIVER DETAILS</ThemedText>
            </View>

        

            <ThemedText>
              Drivers Phone Number<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              Icon={<>
                <Dropdown
                  style={[{ width: wp(15) }]}
                  selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
                  data={countryCodes}
                  maxHeight={hp(60)}
                  labelField="name"
                  valueField="name"
                  placeholder="+00"
                  value={countryCode?.name}
                  itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
                  activeColor={background}

                  containerStyle={{
                    borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
                    width: wp(45),
                    shadowOffset: {
                      width: 0,
                      height: 9,
                    },
                    shadowOpacity: 0.50,
                    shadowRadius: 12.35,

                    elevation: 19,
                    paddingVertical: wp(1)
                  }}
                  onChange={item => {
                    console.log(item);
                    setCountryCode(item);
                  }}

                  renderLeftIcon={() => <></>}
                  renderRightIcon={() => <Entypo name="chevron-thin-down" size={wp(4)} color={icon} />}
                  renderItem={((item, selected) =>
                    <>
                      <View style={[styles.item, selected && {}]}>
                        <ThemedText style={[{ textAlign: 'left', flex: 1 }, selected && { color: '#0f9d58' }]}>{item.name}</ThemedText>
                        {selected && (
                          <Ionicons
                            color={icon}
                            name='checkmark-outline'
                            size={wp(5)}
                          />
                        )}
                      </View>
                      <Divider />
                    </>
                  )}
                />
                <ThemedText style={{ marginHorizontal: wp(4) }}>|</ThemedText>
              </>}
              value={cleanNumber(formData.driverPhone)}
              placeholder="700 000 000"
              onChangeText={(text) => handleChange< TruckFormData>(cleanNumber(text), 'driverPhone', setFormData)}
              keyboardType="numeric"
            />

            <ThemedText>
              Drivers Passport Image<ThemedText color="red">*</ThemedText>
            </ThemedText>


            {images[1] ?
              <Image source={{ uri: images[1]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
              :
              <TouchableOpacity onPress={() => (images[0] && !images[1]) ? selectManyImages(setImages, true) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Drivers Passport<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>
            }


            <ThemedText>
              Drivers ID Image<ThemedText color="red">*</ThemedText>
            </ThemedText>


            {images[2] ?
              <Image source={{ uri: images[2]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
              :
              <TouchableOpacity onPress={() => (images[0] && images[1]) ? selectManyImages(setImages,true) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add ID Passport<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>
            }
            <Divider />

            <View style={{ marginVertical: wp(4) }}>
              <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >TRUCK DETAILS</ThemedText>
            </View>

            <View style={{ gap: wp(2) }}>

              <ThemedText>
                Horse Reg Book Image
              </ThemedText>


              {images[3] ?
                <Image source={{ uri: images[3]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
                :
                <TouchableOpacity onPress={() => (images[0] && images[1] && images[2]) ? selectManyImages(setImages,false) : ToastAndroid.show('Please add driver id image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Horse Reg Book Image<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }

            {selectedTruckType?.name !=="Rigid" &&<View>
              <ThemedText>
                Trailer Book Image
              </ThemedText>


              {images[4] ?
                <Image source={{ uri: images[4]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
                :
                <TouchableOpacity onPress={() => (images[0] && images[1] && images[2] && images[3]) ? selectManyImages(setImages,false) : ToastAndroid.show('Please add horse reg image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Trailer Book Image<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }

              <ThemedText>
                Trailer 2 Book Image (If Available)
              </ThemedText>


              {images[5] ?
                <Image source={{ uri: images[5]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
                :
                <TouchableOpacity onPress={() => (images[0] && images[1] && images[2] && images[3] && images[4]) ? selectManyImages(setImages,false) : ToastAndroid.show('Please add trailer 1 book image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Trailer 2 Book Image (optional)<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }
            </View>}

              </View> 

          </View>
          <View style={{ marginVertical: wp(4), marginBottom: hp(8), gap: wp(3) }}>

            <ThemedText type="tiny" style={{ textAlign: 'center' }} color={coolGray}>{spinnerItem && 'The truck is being added Please wait!'} </ThemedText>
            <Button loading={spinnerItem} title="SUBMIT" onPress={handleSubmit} />
          </View>

        </ScrollView>
      </View>

    </ScreenWrapper>
  );

}


export default AddTrucks;

const styles = StyleSheet.create({
  dropdown: {
    padding: wp(3),
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: wp(4),
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    padding: 17,
    gap: wp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: wp(1),
    marginBottom: 5
  },
  selectedTextStyle: {
    fontSize: 16,
  }
});
