import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image,  StyleSheet, ScrollView,  Modal, ToastAndroid } from "react-native"

import { truckTypes,tankerTypes,trailerConfigurations,truckSuspensions,litresCapacity,tonneSizes,countryCodes } from "@/data/appConstants";


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

import { DropDownItem } from "@/components/DropDown";

function AddTrucks() {

  const icon = useThemeColor('icon')
  const background = useThemeColor('backgroundLight')
  const backG = useThemeColor('background')
  const coolGray = useThemeColor('coolGray')
  // const {truckType ,username ,contact , isVerified,isBlackListed ,blackLWarning,blockVerifiedU , verifiedLoad , fromLocation  , toLocation ,expoPushToken ,verifyOngoing ,truckTonnageG} = route.params

  interface FormData {
    additionalInfo: string;
    trailerType: string;
    driverPhone: string;
    maxloadCapacity: string;
    truckTonnage: string;
    truckName: string;
    otherTruckSuspension : string ;
    otherTruckType : string;
    otherTruckConfig : string;
    otherTankerType : string ;
  }

  const [formData, setFormData] = useState<FormData>({
    additionalInfo: "",
    trailerType: "",
    driverPhone: "",
    maxloadCapacity: "",
    truckTonnage: "",
    truckName: "",
    otherTruckSuspension :"" ,
    otherTruckType : "" ,
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
    console.log("start addd")
    await setDocuments("truckOwnerDetails", { ownerName: ownerNameAddDb, ownerPhoneNum: ownerPhonNumAddDb, ownerEmail: ownerEmailAddDb, })
    console.log("Donee Adding")
  };


  const [dspFrstPageErr, setDspFrstPageErr] = useState<boolean>(false)


  // const [images, setImages] = useState([]);
  const [images, setImages] = useState<ImagePickerAsset[]>([]);


const [selectedTruckType, setSelectedTruckType] = useState<TruckTypeProps | null>(null)
const [selectedTankerType, setSelectedTankerType] = useState<TruckTypeProps | null>(null)
  const [selectedTruckCapacity , setSelectedTruckCapacity] = useState<{ id: number, name: string } | null>(null)


  const [showCountries, setShowCountries] = useState(false);
  const [operationCountries, setOperationCountries] = useState<string[]>([]);

  const [countryCode, setCountryCode] = useState<{ id: number, name: string }>({ id: 0, name: '+263' })
  const [selectedTrailerConfig, setSelectedTrailerConfig] = useState<{ id: number, name: string } | null>()
  const [selectedTruckSuspension, setSelectedTruckSuspension] = useState<{ id: number, name: string } | null>()
  const [ownerdetails, setOwnerdetails] = useState(false)

  
  const [spinnerItem, setSpinnerItem] = useState(false);
  const [addingDocUpdate, setAddingDocUpdate] = useState("")
  const [uploadingImageUpdate, setUploadImageUpdate] = useState("")
  
  const { user } = useAuth();
console.log(uploadingImageUpdate)
console.log(addingDocUpdate)

  const handleSubmit = async () => {


    if (images.length < 4) {
      ToastAndroid.show('Please Add all the required Images before Submiting', ToastAndroid.SHORT)
      return;
    }


    let truckImage, truckBookImage, trailerBookF, trailerBookSc, driverLicense, driverPassport;
    setSpinnerItem(true)

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

    if (!selectedTruckType)
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

    let withDetails = true
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
          truckType: selectedTruckType.name,
          tankerType : selectedTankerType ? selectedTankerType?.name : null ,
          truckCapacity : selectedTruckCapacity?.name ,
          truckConfig : selectedTrailerConfig?.name ,
          truckSuspensions : selectedTruckSuspension?.name ,
          // isVerified : isVerified ,
          withDetails: withDetails,
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

        <ErrorOverlay
          visible={dspFrstPageErr}
          title="Missing important details on Truck Details"
          errors={[
            !formData.trailerType && "Enter Trailer Type",
            !formData.maxloadCapacity && "Enter Maximum Load Capacity",
            !showCountries && "Select were the truck can operate",
            !selectedTruckType?.name && "Select TrucK Type",
            !selectedTruckCapacity && "select trcuk capacity",
            operationCountries.length <=0 && "Select the country or countires the truck can operate",
          ].filter(Boolean) as string[]}
          onClose={() => setDspFrstPageErr(false)}
        />



        <ScrollView>

          <View style={{ backgroundColor: background, paddingHorizontal: wp(4), padding: wp(2), borderRadius: wp(3), marginBottom: wp(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
            <View>
              <ThemedText type="defaultSemiBold">
                {user?.organisation || 'Set Owner Name!'}
              </ThemedText>
              <ThemedText type="tiny">
                {user?.email || 'No Organisation Name!'}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => setOwnerdetails(true)}>
              <FontAwesome6 name="user-gear" size={18} color={icon} />
            </TouchableOpacity>
          </View>


          <Modal visible={ownerdetails} statusBarTranslucent animationType="slide">
            <ScreenWrapper>

            <View style={{ margin: wp(4), marginTop: hp(6) }}>

              <View style={{ gap: wp(2) }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
                  <TouchableOpacity onPress={() => setOwnerdetails(false)}>
                    <AntDesign name="close" color={icon} size={wp(4)} />
                  </TouchableOpacity>
                  <View style={{}}>
                    <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >OWNER DETAILS</ThemedText>
                  </View>
                  <TouchableOpacity>
                  </TouchableOpacity>
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

                <Button onPress={handleUpdateDriverDetails} title="Save" />

              </View>
            </View>
            </ScreenWrapper>

          </Modal>



          <View style={{ alignItems: 'center' }}>
            {images[0]   && <Image source={{ uri: images[0].uri }} style={{ width: wp(90), height: wp(90), marginBottom: 9, borderRadius: wp(4) }} />}
            {!images[0] &&
              <TouchableOpacity onPress={() => selectManyImages(setImages)} style={{ marginBottom: 9, width: wp(90), height: wp(90), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                <Ionicons name="camera" size={wp(40)} color={icon + "4c"} />
                <ThemedText color={icon + "4c"}>Add Image<ThemedText color="red">*</ThemedText></ThemedText>
              </TouchableOpacity>}

          </View>
          <View style={{ gap: wp(2) }}>

            <ThemedText>
              Truck Name<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.truckName}
              placeholder=""
              onChangeText={(text) => handleChange<FormData>(text, 'truckName', setFormData)}
            />

            <ThemedText>
              Cargo Area<ThemedText color="red">*</ThemedText>
            </ThemedText>
          
            <DropDownItem   allData={truckTypes} selectedItem={selectedTruckType} setSelectedItem={setSelectedTruckType} placeholder="Select Truck" />
     {selectedTruckType?.name === 'Other' &&
              <>
                <ThemedText>
                  Other Truck Type<ThemedText color="red">*</ThemedText>
                </ThemedText>
                <Input
                  value={formData.otherTruckType}
                  placeholder="Other Truck Type"
                  onChangeText={(text) => handleChange<FormData>(text, 'otherTruckType', setFormData)}
                />
              </>
            }


               { selectedTruckType?.name ==="Tanker" &&    <ThemedText>
              Tanker Type<ThemedText color="red">*</ThemedText>
            </ThemedText>}

           { selectedTruckType?.name ==="Tanker" &&  <DropDownItem   allData={tankerTypes} selectedItem={selectedTankerType} setSelectedItem={setSelectedTankerType} placeholder="Select Truck" />}

            {(selectedTankerType?.name === 'Other'|| selectedTankerType?.name ==="Specialized Cargo") &&
              <>
                <ThemedText>
                  Other Tanker Type<ThemedText color="red">*</ThemedText>
                </ThemedText>
                <Input
                  value={formData.otherTankerType}
                  placeholder="Other Truck Type"
                  onChangeText={(text) => handleChange<FormData>(text, 'otherTankerType', setFormData)}
                />
              </>
            }



         { selectedTruckType?.name !=="Tanker" &&   <ThemedText>
              Truck Tonnage<ThemedText color="red">*</ThemedText>
            </ThemedText>}
            
        {  selectedTruckType?.name !=="Tanker" &&<DropDownItem   allData={tonneSizes} selectedItem={selectedTruckCapacity} setSelectedItem={setSelectedTruckCapacity} placeholder="Select Tonnage" />}
       

                    { selectedTruckType?.name ==="Tanker" &&    <ThemedText>
              Truck Litres<ThemedText color="red">*</ThemedText>
            </ThemedText>}
            
        {  selectedTruckType?.name ==="Tanker" &&<DropDownItem   allData={litresCapacity} selectedItem={selectedTruckCapacity} setSelectedItem={setSelectedTruckCapacity} placeholder="Select Litres" />}
       
      


            <ThemedText>
              Trailer Configuration<ThemedText color="red">*</ThemedText>
            </ThemedText>
        <DropDownItem   allData={trailerConfigurations} selectedItem={selectedTrailerConfig} setSelectedItem={setSelectedTrailerConfig} placeholder="Select Truck Configuration" />
          

            {
              selectedTrailerConfig?.name === 'Other' &&
              <>
                <ThemedText>
                  Other Trailer Configuration<ThemedText color="red">*</ThemedText>
                </ThemedText>
                <Input
                  value={formData.otherTruckConfig}
                  placeholder="Trailer Config"
                  onChangeText={(text) => handleChange<FormData>(text, 'otherTruckConfig', setFormData)}
                />
              </>
            }
            

      <ThemedText>
              Truck Suspension<ThemedText color="red">*</ThemedText>
            </ThemedText>
        <DropDownItem   allData={truckSuspensions} selectedItem={selectedTruckSuspension} setSelectedItem={setSelectedTruckSuspension} placeholder="Select Truck Suspension"  />
           
            {
              selectedTruckSuspension?.name === 'Other' &&
              <>
                <ThemedText>
                  Other Truck Suspension<ThemedText color="red">*</ThemedText>
                </ThemedText>
                <Input
                  value={formData.otherTruckSuspension}
                  placeholder="Trailer Suspension"
                  onChangeText={(text) => handleChange<FormData>(text, 'otherTruckSuspension', setFormData)}
                />
              </>
            }

            <ThemedText>
              Maximum Load Capacity<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.maxloadCapacity}
              keyboardType="number-pad"
              placeholder="0.0t"
              onChangeText={(text) => handleChange<FormData>(text, 'maxloadCapacity', setFormData)}
            />


            <ThemedText>
              Operation Countries<ThemedText color="red">*</ThemedText>
            </ThemedText>

            <View style={{
              paddingVertical: wp(1),

              gap: wp(1),
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 12,
              paddingHorizontal: 16,
              marginBottom: 16,
            }}>
              <TouchableOpacity onPress={() => setShowCountries(!showCountries)} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <ThemedText style={{ minHeight: hp(5), textAlignVertical: 'center' }}>
                  Select Countrie(s)
                </ThemedText>

                <Ionicons name={showCountries ? 'chevron-up-outline' : "chevron-down"} size={wp(4)} color={icon} />
              </TouchableOpacity>
              {showCountries &&
                <View>
                  <Divider />
                  {Countries.map((item) => {

                    const active = operationCountries.some(x => x === item);

                    return (
                      <TouchableOpacity onPress={() => active ? setOperationCountries(operationCountries.filter(x => x !== item)) : setOperationCountries([...operationCountries, item])} style={{ padding: wp(2), marginVertical: wp(1), flexDirection: 'row', justifyContent: 'space-between' }}>
                        <ThemedText type="subtitle">
                          {item}
                        </ThemedText>

                        <FontAwesome name={active ? 'check-square' : "square-o"} size={wp(5)} color={active ? '#0f9d58' : icon} />
                      </TouchableOpacity>
                    )
                  }
                  )}

                </View>
              }

            </View>


            <ThemedText>
              Additional Information<ThemedText color="red">*</ThemedText>
            </ThemedText>
            <Input
              value={formData.additionalInfo} multiline numberOfLines={8} style={{ verticalAlign: 'top', minHeight: hp(15) }} containerStyles={{}}
              placeholder="Additional Information"
              onChangeText={(text) => handleChange<FormData>(text, 'additionalInfo', setFormData)}
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
              onChangeText={(text) => handleChange<FormData>(cleanNumber(text), 'driverPhone', setFormData)}
              keyboardType="numeric"
            />

            <ThemedText>
              Drivers Passport Image<ThemedText color="red">*</ThemedText>
            </ThemedText>


            {images[1] ?
              <Image source={{ uri: images[1]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
              :
              <TouchableOpacity onPress={() => (images[0] && !images[1]) ? selectManyImages(setImages) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
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
              <TouchableOpacity onPress={() => (images[0] && images[1]) ? selectManyImages(setImages) : ToastAndroid.show('Please add truck image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
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
                <TouchableOpacity onPress={() => (images[0] && images[1] && images[2]) ? selectManyImages(setImages) : ToastAndroid.show('Please add driver id image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Horse Reg Book Image<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }


              <ThemedText>
                Trailer Book Image
              </ThemedText>


              {images[4] ?
                <Image source={{ uri: images[4]?.uri }} style={{ width: wp(92), height: wp(40), marginVertical: 7, borderRadius: wp(4) }} />
                :
                <TouchableOpacity onPress={() => (images[0] && images[1] && images[2] && images[3]) ? selectManyImages(setImages) : ToastAndroid.show('Please add horse reg image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
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
                <TouchableOpacity onPress={() => (images[0] && images[1] && images[2] && images[3] && images[4]) ? selectManyImages(setImages) : ToastAndroid.show('Please add trailer 1 book image first!', ToastAndroid.SHORT)} style={{ marginVertical: 9, height: wp(40), backgroundColor: background, alignItems: 'center', justifyContent: 'center', borderRadius: wp(4) }}>
                  <Ionicons name="camera" size={wp(20)} color={icon + "4c"} />
                  <ThemedText color={icon + "4c"}>Trailer 2 Book Image (optional)<ThemedText color="red">*</ThemedText></ThemedText>
                </TouchableOpacity>
              }
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
  },
});
