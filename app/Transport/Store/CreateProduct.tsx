import React, { useState, } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ToastAndroid,
    Modal,
} from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import { ErrorOverlay } from '@/components/ErrorOverLay';
import Heading from '@/components/Heading';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from "@/constants/common";
import { Ionicons,AntDesign,FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import Divider from "@/components/Divider";
import Button from "@/components/Button";
import { uploadImage, addDocument, getDocById, setDocuments } from "@/db/operations";
import { selectManyImages } from "@/Utilities/utils";
import { Product } from "@/types/types";
import { DropDownItem } from "@/components/DropDown";
import { router } from "expo-router";
import { getDownloadURL, ref, uploadBytes, } from "firebase/storage";
import { storage } from "@/db/fireBaseConfig";

import type { ImagePickerAsset } from 'expo-image-picker';

import { productCategories  , smallVehicleMake , smallVehicleTypes , heavyEupementMake, heavyEupementType , cargoTruckMake,cargoVehiType , serviceProivderType,transactionTypes,containerType , containerMake,trailerType,trailerMake,sparesType, Countries } from "@/data/appConstants";

import { truckSuspensions, trailerConfigurations as truckConfigurations } from "@/data/appConstants";




const CreateProduct = () => {
    // Theme colors
  const icon = useThemeColor('icon')
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const iconColor = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');
    const textColor = useThemeColor('text');




    // States
    const [vehicleType, setVehicleType] = React.useState<{ id: number; name: string } | null>(null);

    const [images, setImages] = useState<ImagePickerAsset[]>([]);

    if (images.length > 5) {
        setImages([]);
        alert('You can only select up to 5 images.');
        return; // Exit if more than 4 images
    }

    const [uploadProgress, setUploadProgress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [buyOSelling , setBuyOselling]=React.useState("")

    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [selectedTruckSuspension, setSrlectedTruckSuspension] = React.useState<{ id: number; name: string } | null> (null)
    const [selectedTruckConfig, setSelectedTruckConfig] = React.useState<{ id: number; name: string } | null>(null)
    const [selectedSemiTrailerSuspension, setSlctedSemiTrailerSuspension] = React.useState<{ id: number; name: string } | null>(null)
    const [selectedSemiTrailerConfig, setSelectedSemiTrailerConfig] = React.useState<{ id: number; name: string } | null>(null)
    const [selectedTruckCapacity, setSelectedTruckCapacity] = React.useState<{ id: number; name: string } | null>(null)
    const [selectedTruckType, setSelectedTruckType] = useState<{ id: number; name: string } | null>(null);
    const [selectedMake, setSelectedMake] = useState<any>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [selectedSparePartName, setSelectedSparePartName] = React.useState("")

    const [priceNegotiable, setPriceNegotiable] = React.useState(false)
    function togglePriceNegotiable() {
        setPriceNegotiable(prev => !prev)
    }
    const [deliveryAvailable, setDeliveryAvailable] = React.useState(false)
    function toggleDeliveryAvailable() {
        setDeliveryAvailable(prev => !prev)
    }

    const [vehicleTransimission, setVehicleTransission] = React.useState("")
    const [vehcileFuel, setVehicleFuel] = React.useState("")





    // Form data
    const [formData, setFormData] = useState<Partial<Product>>({
        productLocation: "",
        description: "",
        price: null,
        currency: "USD",
        model: "USD",
        condition: "used",
        deliveryCost: "",
        swapPreferences: "",
        details: {
            vehicle: null,
        },

    });





    console.log(formData.details?.vehicle?.otherType)

    const { user } = useAuth();

    // Handle form field changes
    const handleChange = (field: keyof Product, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle nested field changes
    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                // ...prev[parent as keyof Product],
                [field]: value
            }
        }));
    };



    // Handle form submission
    const handleSubmit = async () => {


        let imageUrls = [];
        for (const asset of images) {

            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `Shop/` + new Date().getTime());

            // Upload the image
            const snapshot = await uploadBytes(storageRef, blob);

            // Get the download URL
            const imageUrl = await getDownloadURL(storageRef);

            imageUrls.push(imageUrl);

        }

        setIsSubmitting(true);
        try {
            // Upload images
            const uploadedImages = await Promise.all(
                images.map(async (image) => {
                    const uri = await uploadImage(
                        image,
                        "products",
                        setUploadProgress,
                        `Uploading image ${images.indexOf(image) + 1} of ${images.length}`
                    );
                    return uri;
                })
            );


              let priceRange = null
                if(formData.price){

        if (formData.price < 1500) {
            priceRange= "0 - 1.5k"
        } else if (formData.price >= 1500 && formData.price < 2500)  {
            priceRange ="1.5 - 2.5";
        } else if (formData.price >= 2500 && formData.price < 5000)  {
            priceRange = "2.5k - 5k" ;
        } else if (formData.price >= 5000 && formData.price < 10000)  {
            priceRange = "5k - 10k" ;
        } else if (formData.price >= 10000 && formData.price < 25000)  {
            priceRange = "10k - 25k" ;
        } else if (formData.price >= 25000 && formData.price < 45000)  {
            priceRange = "25k - 45k" ;
        } else if (formData.price >= 45000 && formData.price < 65000)  {
            priceRange = "45k - 65k"
        } else if (formData.price >= 65000 && formData.price < 80000)  {
            priceRange = "65k - 100k"
        } else if (formData.price >= 80000 && formData.price < 100000)  {
            priceRange = "80k - 100k"
        } else if (formData.price >= 100000 )  {
            priceRange = "100k +++"
        }
                }

            // Prepare product data
            const productData = {

                ...formData,
                
                transaction: {
                    type: selectedTransaction?.name,
                    priceRange : priceRange ,
                    priceNegotiable: priceNegotiable,
                    deliveryAvailable: deliveryAvailable,
                    deliveryCost: formData.deliveryCost,
                    swapPreferences: formData.swapPreferences
                },
              
                location: {
                    address: "",
                    city: "",
                    coordinates: null
                },
                truckDetails: {
                    truckConfig: selectedTruckConfig?.name||null ,
                    truckSuspension: selectedTruckSuspension?.name ||null,
                    truckCapacity : selectedTruckCapacity?.name ||null ,
                    truckType: selectedTruckType?.name||null,
                },
                
                vehicleTransimission: vehicleTransimission ,
                vehcileFuel : vehcileFuel ,
                images: imageUrls,

                bodyStyle: selectedType.name,
                bodyMake: selectedMake.name,
                category: selectedCategory.name,

                vehicleType: vehicleType?.name      ,

                selectedSparePartName: selectedSparePartName,

                seller: {
                    id: user?.uid || "",
                    name: user?.organisation || "Anonymous",
                    contact: user?.phoneNumber || "",
                    isVerified: false
                },
                visibility: {
                    featured: false,
                    promoted: false,
                    frontPage: false
                },
                metadata: {
                    views: 0,
                    saves: 0,
                    status: "active"
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),

            };

            // Add product to database
            await addDocument("products", productData);

            ToastAndroid.show("Product created successfully!", ToastAndroid.SHORT);
            router.back();
        } catch (error) {
            console.error("Error creating product:", error);
            ToastAndroid.show("Failed to create product", ToastAndroid.SHORT);
        } finally {
            setIsSubmitting(false);
        }
    };



    // Render category-specific fields
    const renderCategoryFields = () => {
        switch (selectedCategory?.name) {
            case "Vehicle":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Vehicle Category</ThemedText>


                        <DropDownItem
                            allData={[
                                { id: 1, name: "small vehicle" },
                                { id: 2, name: "cargo vehicle" },
                                { id: 3, name: "heavy Equip" }
                            ]}
                            selectedItem={vehicleType}
                            setSelectedItem={setVehicleType}
                            placeholder="Select vehicle type"
                        />


                        {vehicleType?.name === "cargo vehicle" && <View>
                            <ThemedText> Truck Type</ThemedText>
                            <DropDownItem
                                allData={[{ id: 1, name: "semi Truck" }, { id: 2, name: "rigid" }, { id: 3, name: "Truck Horse" }]}
                                selectedItem={selectedTruckType}
                                setSelectedItem={setSelectedTruckType}
                                placeholder="Select Truck type"
                            />
                        </View>}



                        {selectedTruckType?.name !== "semi Truck" && selectedTruckType?.name !== "Truck Horse" && <View>

                            <ThemedText type="defaultSemiBold">  {vehicleType?.name !== "cargo vehicle" ? "Vehicle Type" : "Cargo Area"}  </ThemedText>
                            <DropDownItem
                                allData={
                                    vehicleType?.name === "small vehicle" ? smallVehicleTypes : vehicleType?.name === "cargo vehicle" ? cargoVehiType : heavyEupementType}
                                selectedItem={selectedType}
                                setSelectedItem={setSelectedType}
                                placeholder="Select vehicle type"
                            />


                            {["(Other) Small Veh. Type", "(Other) Cargo Veh. Type", "(Other) Heavy Equip. Type"].includes(selectedType?.name) && (
                                <Input
                                    placeholder="Specify  type"
                                    onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                        ...formData.details?.vehicle,
                                        otherType: text
                                    })}
                                />
                            )}
                        </View>}


                        <ThemedText type="defaultSemiBold">Make</ThemedText>
                        <DropDownItem
                            allData={vehicleType?.name === "small vehicle" ? smallVehicleMake : vehicleType?.name === "cargo vehicle" ? cargoTruckMake : heavyEupementMake}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedMake}
                            placeholder="Select vehicle Make"
                        />

                        {["(Other) Small Veh. Make", "(Other) Cargo Veh. Make", "(Other) Heavy Equip. Make"].includes(selectedMake?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    otherMake: text
                                })}
                            />
                        )}

                        {vehicleType?.name === "cargo vehicle" && <View>


                            <ThemedText>Config</ThemedText>
                            <DropDownItem
                                allData={truckConfigurations}
                                selectedItem={selectedTruckConfig}
                                setSelectedItem={setSelectedTruckConfig}
                                placeholder="Select Truck Config"
                            />

                            {selectedTruckConfig?.name === "Other" && (
                                <Input
                                    placeholder="Specify vehicle Config"
                                    onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                        ...formData.details?.vehicle,
                                        otherTruckConfig: text
                                    })}
                                />
                            )}

                            <ThemedText>Suspension</ThemedText>

                            <DropDownItem
                                allData={truckSuspensions}
                                selectedItem={selectedTruckSuspension}
                                setSelectedItem={setSrlectedTruckSuspension}
                                placeholder="Select Truck Suspension"
                            />

                            {selectedTruckSuspension?.name === "Other" && (
                                <Input
                                    placeholder="Specify vehicle Suspension"
                                    onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                        ...formData.details?.vehicle,
                                        otherTruckSuspension: text
                                    })}
                                />
                            )}


                        </View>}


                        <ThemedText type="defaultSemiBold">Model</ThemedText>
                        <Input
                            placeholder="e.g. Camry"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                model: text
                            })}
                        />

                        {(selectedTruckType?.name === "semi Truck" || selectedTruckType?.name === "Truck Horse") && <View>
                            <ThemedText type="defaultSemiBold">Horse Power</ThemedText>
                            <Input
                                placeholder="e.g. 50000"
                                keyboardType="numeric"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    horsePower: parseInt(text) || 0
                                })}
                            />
                        </View>}



                        <ThemedText type="defaultSemiBold">Year</ThemedText>
                        <Input
                            placeholder="e.g. 2020"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                year: parseInt(text) || 0
                            })}
                        />

                                <ThemedText type="defaultSemiBold">Engine</ThemedText>
                        <Input
                            placeholder="e.g. Camry"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                engine: text
                            })}
                        />    




                        <ThemedText type="defaultSemiBold">Mileage (km)</ThemedText>
                        <Input
                            placeholder="e.g. 50000"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                mileage: parseInt(text) || 0
                            })}
                        />




                        <Divider />



                        <ThemedText type="defaultSemiBold">Transmission</ThemedText>



                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehicleTransimission === "(Auto)" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleTransission("(Auto)")}
                            >
                                <Ionicons
                                    name={vehicleTransimission === "(Auto)" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehicleTransimission === "(Auto)" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>(Auto)</ThemedText>
                            </TouchableOpacity>


                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehicleTransimission === "Manual" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleTransission("Manual")}
                            >
                                <Ionicons
                                    name={vehicleTransimission === "Manual" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehicleTransimission === "Manual" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>Manual</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehicleTransimission === "semi_Auto" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleTransission("semi_Auto")}
                            >
                                <Ionicons
                                    name={vehicleTransimission === "semi_Auto" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehicleTransimission === "semi_Auto" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2), fontSize: 15 }}  >semi_Auto</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehicleTransimission === "other" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleTransission("other")}
                            >
                                <Ionicons
                                    name={vehicleTransimission === "other" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehicleTransimission === "other" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>other</ThemedText>
                            </TouchableOpacity>
                        </View>




                        {vehicleTransimission === "other" && <Input
                            placeholder="e.g. 50000"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                transmission: parseInt(text)|| 0
                            })}
                        />}


                        <Divider />


                        <ThemedText type="defaultSemiBold">Fuel Type</ThemedText>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehcileFuel === "Petrol" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleFuel("Petrol")}
                            >
                                <Ionicons
                                    name={vehcileFuel === "Petrol" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehcileFuel === "Petrol" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>Petrol</ThemedText>
                            </TouchableOpacity>


                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehcileFuel === "Diesel" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleFuel("Diesel")}
                            >
                                <Ionicons
                                    name={vehcileFuel === "Diesel" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehcileFuel === "Diesel" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>Diesel</ThemedText>
                            </TouchableOpacity>


                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehcileFuel === "Hybrid" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleFuel("Hybrid")}
                            >
                                <Ionicons
                                    name={vehcileFuel === "Hybrid" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehcileFuel === "Hybrid" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>Hybrid</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    vehcileFuel === "other" && styles.checkboxSelected
                                ]}
                                onPress={() => setVehicleFuel("other")}
                            >
                                <Ionicons
                                    name={vehcileFuel === "other" ? "checkbox" : "square-outline"}
                                    size={wp(5)}
                                    color={vehcileFuel === "other" ? accent : iconColor}
                                />
                                <ThemedText style={{ marginLeft: wp(2) }}>other</ThemedText>
                            </TouchableOpacity>
                        </View>






                        {vehcileFuel === "other" && <Input
                            placeholder="e.g. 50000"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                fuelType: parseInt(text) || 0
                            })}
                        />}





                      {selectedTruckType?.name ==="semi Truck" &&  <View>
                        <ThemedText>Trailer Details</ThemedText>

                           <ThemedText type="defaultSemiBold">Capacity (Tonnage) </ThemedText>
                           <Input
                            placeholder="Truck capacity"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                truckCapacity: text
                            })}
                        />    

                        <TouchableOpacity>
                        <ThemedText>Same As Truck </ThemedText>
                        </TouchableOpacity>

                            <ThemedText>Config</ThemedText>
                            <DropDownItem
                                allData={truckConfigurations}
                                selectedItem={selectedSemiTrailerConfig}
                                setSelectedItem={setSelectedSemiTrailerConfig}
                                placeholder="Select Truck Config"
                            />

                            {selectedTruckConfig?.name === "Other" && (
                                <Input
                                    placeholder="Specify vehicle Config"
                                    onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                        ...formData.details?.vehicle,
                                        otherTruckConfig: text
                                    })}
                                />
                            )}

                            <ThemedText>Suspension</ThemedText>

                            <DropDownItem
                                allData={truckSuspensions}
                                selectedItem={selectedSemiTrailerSuspension}
                                setSelectedItem={setSlctedSemiTrailerSuspension}
                                placeholder="Select Truck Suspension"
                            />

                            {selectedTruckSuspension?.name === "Other" && (
                                <Input
                                    placeholder="Specify vehicle Suspension"
                                    onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                        ...formData.details?.vehicle,
                                        otherTruckSuspension: text
                                    })}
                                />
                            )}


                        </View>}         


                    </>
                );


            case "Trailers":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Trailer Type</ThemedText>
                        <DropDownItem
                            allData={trailerType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select Trailer type"
                        />
                        {["(Other) Trailer. Type"].includes(selectedType?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.trailers,
                                    otherType: text
                                })}
                            />
                        )}


                        <ThemedText type="defaultSemiBold">Trailer Type</ThemedText>

                        <DropDownItem
                            allData={trailerMake}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedMake}
                            placeholder="Select vehicle type"
                        />


                        {["(Other) Trailer. Make"].includes(selectedMake?.name) && (
                            <Input
                                placeholder="Specify Traler Make"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.trailers,
                                    otherMakea: text
                                })}
                            />
                        )}

                        <ThemedText>Config</ThemedText>
                        <DropDownItem
                            allData={truckConfigurations}
                            selectedItem={selectedTruckConfig}
                            setSelectedItem={setSelectedTruckConfig}
                            placeholder="Select Truck Config"
                        />

                        {selectedTruckConfig?.name === "Other" && (
                            <Input
                                placeholder="Specify Trailer Config"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.trailers,
                                    otherTrailerConfig: text
                                })}
                            />
                        )}

                        <ThemedText>Suspension</ThemedText>

                        <DropDownItem
                            allData={truckSuspensions}
                            selectedItem={selectedTruckSuspension}
                            setSelectedItem={setSrlectedTruckSuspension}
                            placeholder="Select Truck Suspension"
                        />

                        {selectedTruckSuspension?.name === "Other" && (
                            <Input
                                placeholder="Specify Trailer Suspension"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.trailers,
                                    otherTrailerSuspension: text
                                })}
                            />
                        )}





                    </>
                )
            case "Container":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Vehicle Type</ThemedText>
                        <DropDownItem
                            allData={containerType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                        {["(Other) Container. Type"].includes(selectedMake?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    type: text
                                })}
                            />
                        )}
                        <DropDownItem
                            allData={containerMake}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                        {["(Other) Container. Make"].includes(selectedMake?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    type: text
                                })}
                            />
                        )}
                    </>
                )
            case "Service Provider":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Servuce Provider</ThemedText>
                        <DropDownItem
                            allData={serviceProivderType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                        <DropDownItem
                            allData={vehicleType?.name === "smallVehicle" ? smallVehicleTypes : vehicleType?.name === "cargoTrucks" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedMake}
                            placeholder="Select vehicle type"
                        />

                    </>
                )
            case "Spares":
                return (
                    <>


                        <ThemedText type="defaultSemiBold">Spare Part category</ThemedText>
                        <DropDownItem
                            allData={[
                                { id: 1, name: "small vehicle" },
                                { id: 1, name: "cargo vehicle" },
                                { id: 1, name: "heavy Equip" }
                            ]}
                            selectedItem={vehicleType}
                            setSelectedItem={setVehicleType}
                            placeholder="Select vehicle type"
                        />

                        <ThemedText type="defaultSemiBold">Spare Part Type</ThemedText>
                        <DropDownItem
                            allData={sparesType}
                            selectedItem={selectedSparePartName}
                            setSelectedItem={setSelectedSparePartName}
                            placeholder="Select vehicle type"
                        />


                        {vehicleType?.name === "cargoTrucks" && <View>
                            <ThemedText> Truck Type</ThemedText>
                            <DropDownItem
                                allData={[{ id: 1, name: "semi Truck" }, { id: 2, name: "rigid" }]}
                                selectedItem={selectedType}
                                setSelectedItem={setSelectedType}
                                placeholder="Select vehicle type"
                            />
                        </View>}



                          {selectedTruckType?.name !=="semi Truck" && selectedTruckType?.name !=="semi Truck" &&  <View>
                        <ThemedText type="defaultSemiBold">  {vehicleType?.name !== "cargoTrucks" ? "Vehicle Type" : "Cargo Area"}  </ThemedText>
                        <DropDownItem
                            allData={vehicleType?.name === "small vehicle" ? smallVehicleTypes : vehicleType?.name === "cargo vehicle" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                          </View> } 



                        {["(Other) Small Veh. Type", "(Other) Cargo Veh. Type", "(Other) Heavy Equip. Type"].includes(selectedType?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    type: text
                                })}
                            />
                        )}



                        <ThemedText type="defaultSemiBold">Make</ThemedText>
                        <DropDownItem
                            allData={vehicleType?.name === "small vehicle" ? smallVehicleMake : vehicleType?.name === "cargo vehicle" ? cargoTruckMake : heavyEupementMake}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedMake}
                            placeholder="Select vehicle Make"
                        />

                        {["(Other) Small Veh. Make", "(Other) Cargo Veh. Make", "(Other) Heavy Equip. Make"].includes(selectedMake?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    type: text
                                })}
                            />
                        )}






                        <ThemedText type="defaultSemiBold">  {vehicleType?.name !== "cargoTrucks" ? "Vehicle Type" : "Cargo Area"}  </ThemedText>
                        <DropDownItem
                            allData={vehicleType?.name === "smallVehicle" ? smallVehicleTypes : vehicleType?.name === "cargoTrucks" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />

                        {["(Other) Small Veh. Type", "(Other) Cargo Veh. Type", "(Other) Heavy Equip. Type"].includes(selectedType?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    type: text
                                })}
                            />
                        )}



                        <ThemedText type="defaultSemiBold">Make</ThemedText>
                        <DropDownItem
                            allData={vehicleType?.name === "smallVehicle" ? smallVehicleMake : vehicleType?.name === "cargoTrucks" ? cargoTruckMake : heavyEupementMake}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedMake}
                            placeholder="Select vehicle Make"
                        />

                        {["(Other) Small Veh. Make", "(Other) Cargo Veh. Make", "(Other) Heavy Equip. Make"].includes(selectedMake?.name) && (
                            <Input
                                placeholder="Specify vehicle type"
                                onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                    ...formData.details?.vehicle,
                                    type: text
                                })}
                            />
                        )}

                    </>
                )


        }
    };






  const [storedetails, setStoredetails] = useState(false)

  const [selectedStoreCountry, setSelectedStoreCountry] = useState<{ id: number; name: string } | null>(null);

  const [storeNamedDb, setStoreName] = useState('');
  const [storeLocationAddDb, SetStoreLocationAddDb] = useState('');
  const [ownerEmailAddDb, setStoreEmailAddDb] = useState('');
  const [storePhonNumAddDb, setOwnerPhoneNum] = useState('');

  const handleUpdateStoreDetails = async () => {
    console.log("start addd")
    await setDocuments("storeDetails", { storeNamedDb: storeNamedDb, storePhoneNum: storePhonNumAddDb, ownerEmail: ownerEmailAddDb,  exactLocation : storeLocationAddDb,storeCountry : selectedStoreCountry?.name })
    console.log("Donee Adding")
  };


const [storeDetails, setStoreDetails] = useState(null);
  React.useEffect(() => {
    getDocById('storeDetails', setStoreDetails);
  }, []);





    return (
        <ScreenWrapper fh={false}>
            <Heading page="Create Product" />

  <View style={{ backgroundColor: background, paddingHorizontal: wp(4), padding: wp(2), borderRadius: wp(3), marginBottom: wp(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
            <View>
              <ThemedText type="defaultSemiBold">
                {user?.organisation || 'Set Owner Name!'}
              </ThemedText>
              <ThemedText type="tiny">
                {user?.email || 'No Organisation Name!'}
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => setStoredetails(true)}>
              <FontAwesome6 name="user-gear" size={18} color={icon} />
            </TouchableOpacity>
          </View>







   <Modal visible={storedetails} statusBarTranslucent animationType="slide">
            <ScreenWrapper>

            <View style={{ margin: wp(4), marginTop: hp(6) }}>

              <View style={{ gap: wp(2) }} >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(4) }}>
                  <TouchableOpacity onPress={() => setStoredetails(false)}>
                    <AntDesign name="close" color={icon} size={wp(4)} />
                  </TouchableOpacity>
                    <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold' }} >STORE DETAILS</ThemedText>
                </View>
                <ThemedText>
                  Store Name
                </ThemedText>
                <Input
                  placeholder="Store Name"
                  value={storeNamedDb}
                  onChangeText={(text) => setStoreName(text)}
                />

        
                <ThemedText>
                  Store Location
                </ThemedText>

        
                <ThemedText>
                  Country
                </ThemedText>
                    <DropDownItem
                        allData={Countries}
                        selectedItem={selectedStoreCountry}
                        setSelectedItem={setSelectedStoreCountry}
                        placeholder="Store Country"
                    />
        
                <ThemedText>
                  Exacact Location
                </ThemedText>
                <Input
                  placeholder="Owner's Name"
                  value={storeLocationAddDb}
                  onChangeText={(text) => SetStoreLocationAddDb(text)}
                />
          



                <ThemedText>
                  Store Phone Number
                </ThemedText>
        
                <ThemedText>
                  Store Email
                </ThemedText>
                <Input
                  placeholder="Owner Email"
                  value={ownerEmailAddDb}
                  onChangeText={(text) => setStoreEmailAddDb(text)}
                />

                <Button onPress={handleUpdateStoreDetails} title="Save" />

              </View>
            </View>
            </ScreenWrapper>

          </Modal>




        

            <ScrollView contentContainerStyle={styles.container}>
                {/* Product Images */}
                <View style={styles.imageSection}>
                    <ThemedText type="defaultSemiBold">Product Images (Max 5)</ThemedText>
                    <View style={styles.imageContainer}>
                        {images.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {images.map((image, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <ExpoImage
                                            source={{ uri: image.uri }}
                                            style={styles.image}
                                            contentFit="cover"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => setImages(images.filter((_, i) => i !== index))}
                                        >
                                            <Ionicons name="close" size={wp(4)} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={() => selectManyImages(setImages, true, true)}
                            >
                                <Ionicons name="camera" size={wp(10)} color={iconColor} />
                                <ThemedText>Add Images</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>

                   {images.length > 0 && <TouchableOpacity onPress={() => selectManyImages(setImages, true, true)}>
                        <ThemedText>Add {5 - images.length} left </ThemedText>
                    </TouchableOpacity>}
                </View>

                {/* Basic Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight, }]}>
                    <ThemedText type="subtitle">Basic Information</ThemedText>
                    <Divider />

               
           <ThemedText >Are you selling or looking?</ThemedText>

    <View style={styles.row}>
                        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                buyOSelling && styles.checkboxSelected
                            ]}
                            onPress={()=>setBuyOselling("sellOffers")}
                        >
                            <Ionicons
                                name={buyOSelling=="sellOffers" ? "checkbox" : "square-outline"}
                                size={wp(5)}
                                color={buyOSelling==="sellOffers" ? accent : iconColor}
                            />
                            <ThemedText style={{ marginLeft: wp(2) }}>Selling</ThemedText>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                buyOSelling && styles.checkboxSelected
                            ]}
                            onPress={()=>setBuyOselling("buyRequests")}
                        >
                            <Ionicons
                                name={buyOSelling==="buyRequests" ? "checkbox" : "square-outline"}
                                size={wp(5)}
                                color={buyOSelling=="buyRequests" ? accent : iconColor}
                            />
                            <ThemedText style={{ marginLeft: wp(2) }}>Looking</ThemedText>
                        </TouchableOpacity>
                    </View>




                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">Condition</ThemedText>
                            <DropDownItem
                                allData={[
                                    { id: 1, name: "new" },
                                    { id: 2, name: "used" }
                                ]}
                                selectedItem={{ name: formData.condition }}
                                setSelectedItem={(item: any) => handleChange("condition", item.name)}
                                placeholder="Condition"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: wp(2) }}>
                            <ThemedText type="defaultSemiBold">Category</ThemedText>
                            <DropDownItem
                                allData={productCategories}
                                selectedItem={selectedCategory}
                                setSelectedItem={setSelectedCategory}
                                placeholder="Category"
                            />
                        </View>
                    </View>
                </View>

                {/* Category Specific Details */}
                {selectedCategory && (
                    <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                        <ThemedText type="subtitle">{selectedCategory.name} Details</ThemedText>
                        <Divider />
                        {renderCategoryFields()}
                    </View>
                )}

                {/* Transaction Details */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle">Transaction Details</ThemedText>


                    <ThemedText type="defaultSemiBold">Transaction Type</ThemedText>
                    <DropDownItem
                        allData={transactionTypes}
                        selectedItem={selectedTransaction}
                        setSelectedItem={setSelectedTransaction}
                        placeholder="Transaction type"
                    />

                    <View style={[styles.row, { height: 68 }]}>

                        <View style={{ width: wp(21), marginRight: wp(2) }}>
                            <ThemedText type="defaultSemiBold">Currency</ThemedText>
                            <DropDownItem
                                allData={[
                                    { id: 1, name: "USD" },
                                    { id: 2, name: "RSA" },
                                    { id: 3, name: "ZWG" }
                                ]}
                                selectedItem={{ name: formData.currency }}
                                setSelectedItem={(item: any) => handleChange("currency", item.name)}
                                placeholder=""
                            />
                        </View>

                        <View style={{ flex: 1 }}>

                            <ThemedText type="defaultSemiBold">Price</ThemedText>
                            <Input
                                placeholder="ammont"
                                keyboardType="numeric"
                                value={formData.price?.toString()}
                                onChangeText={(text) => handleChange("price", text)}
                            />
                        </View>
                        {["Rent", "Hire"].includes(selectedTransaction?.name) && <View style={{ width: wp(27), marginLeft: wp(2) }}>
                            <ThemedText type="defaultSemiBold">Model</ThemedText>
                            <DropDownItem
                                allData={[
                                    { id: 1, name: "/hour" },
                                    { id: 2, name: "/day" },
                                    { id: 3, name: "/week" },
                                    { id: 3, name: "/month" },
                                    { id: 3, name: "/year" }
                                ]}
                                selectedItem={{ name: formData.model }}
                                setSelectedItem={(item: any) => handleChange("model", item.name)}
                                placeholder=""
                            />
                        </View>}
                    </View>




                    <Divider />


                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                priceNegotiable && styles.checkboxSelected
                            ]}
                            onPress={togglePriceNegotiable}
                        >
                            <Ionicons
                                name={priceNegotiable ? "checkbox" : "square-outline"}
                                size={wp(5)}
                                color={priceNegotiable ? accent : iconColor}
                            />
                            <ThemedText style={{ marginLeft: wp(2) }}>Price Negotiable</ThemedText>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                deliveryAvailable && styles.checkboxSelected
                            ]}
                            onPress={toggleDeliveryAvailable}
                        >
                            <Ionicons
                                name={deliveryAvailable ? "checkbox" : "square-outline"}
                                size={wp(5)}
                                color={deliveryAvailable ? accent : iconColor}
                            />
                            <ThemedText style={{ marginLeft: wp(2) }}>Delivery Available</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {deliveryAvailable && (
                        <Input
                            placeholder="Delivery cost"
                            keyboardType="numeric"
                            value={formData.deliveryCost}
                            onChangeText={(text) => handleChange("deliveryCost", text)}
                        />
                    )}

                    {selectedTransaction?.name === "Swap" && (
                        <Input
                            placeholder="Swap preferences"
                            value={formData.swapPreferences}
                            onChangeText={(text) => handleChange("swapPreferences", text)}
                        />
                    )}




                </View>

                     <View style={[styles.section, { backgroundColor: backgroundLight }]} >
                    <Divider />

                      <ThemedText type="defaultSemiBold">Product Location</ThemedText>

                             <Input
                                placeholder="Product Location"
                                value={formData.productLocation}
                                onChangeText={(text) => handleChange("productLocation", text)}
                            />


                      <ThemedText type="defaultSemiBold">Description</ThemedText>
                    <Input
                        placeholder="Detailed description"
                        multiline
                        numberOfLines={4}
                        value={formData.description}
                        onChangeText={(text) => handleChange("description", text)}
                        style={styles.textArea}
                    />
                    <Divider />

                        </View>   
                {/* Submit Button */}
                <View style={styles.submitButton}>
                    <Button
                        title={isSubmitting ? "Creating..." : "Create Product"}
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    />
                    {uploadProgress && (
                        <ThemedText type="tiny" style={{ textAlign: 'center', marginTop: wp(2) }}>
                            {uploadProgress}
                        </ThemedText>
                    )}
                </View>
            </ScrollView>



        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: wp(4),
        paddingBottom: hp(10),
    },
    section: {
        marginBottom: hp(2),

        borderRadius: wp(3),
        padding: wp(4),
    },
    imageSection: {
        marginBottom: hp(2),
    },
    imageContainer: {
        marginTop: wp(2),
        minHeight: wp(30),
        borderRadius: wp(3),
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageButton: {
        padding: wp(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: wp(30),
        height: wp(30),
        margin: wp(1),
        borderRadius: wp(2),
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: wp(1),
        right: wp(1),
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: wp(10),
        width: wp(5),
        height: wp(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    textArea: {
        minHeight: hp(10),
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1),
    },
    checkboxSelected: {
        // Add any selected styles if needed
    },
  
    submitButton: {
        marginTop: hp(2),
        marginBottom: hp(4),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(4),
        borderBottomWidth: 1,
    },
  
    modalFooter: {
        padding: wp(4),
        borderTopWidth: 1,
    },
});

export default CreateProduct;