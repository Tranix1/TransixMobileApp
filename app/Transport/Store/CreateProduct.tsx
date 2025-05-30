import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ToastAndroid,
    TouchableNativeFeedback,
    Modal
} from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import Input from '@/components/Input';
import { ErrorOverlay } from '@/components/ErrorOverLay';
import Heading from '@/components/Heading';
import ScreenWrapper from '@/components/ScreenWrapper';
import { hp, wp } from "@/constants/common";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import Divider from "@/components/Divider";
import Button from "@/components/Button";
import { uploadImage, addDocument } from "@/db/operations";
import { selectManyImages } from "@/Utilities/utils";
import { formatCurrency } from "@/services/services";
import { Product } from "@/types/types";
import { DropDownItem } from "@/components/DropDown";
import { router } from "expo-router";
import { getDownloadURL, ref, uploadBytes, } from "firebase/storage";
import { storage } from "@/db/fireBaseConfig";

import type { ImagePickerAsset } from 'expo-image-picker';
const CreateProduct = () => {
    // Theme colors
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const iconColor = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');
    const textColor = useThemeColor('text');

    // Product categories
    const productCategories = [
        { id: 1, name: "Vehicle" },
        { id: 2, name: "Trailers" },
        { id: 3, name: "Container" },
        { id: 4, name: "Spares" },
        { id: 5, name: "Service Provider" },
        { id: 6, name: "Other" }
    ];

    // Vehicle types
    const smallVehicleTypes = [
        { id: 1, name: "Sedan" },
        { id: 3, name: "SUV" },
        { id: 4, name: "Vans" },
        { id: 5, name: "Pickup Trucks" },
        { id: 6, name: "Hatchbeacks" },
        { id: 7, name: "Convetibles" },
        { id: 8, name: "Crissovers" },
        { id: 9, name: "Other" }
    ];


    const heavyEupementType = [

        { id: 1, name: "Tipper" },
        { id: 2, name: "Excavator" },
        { id: 3, name: "Bulldozer" },
        { id: 4, name: "Compactors" },
        { id: 5, name: "Graders" },
        { id: 6, name: "ConcreteMixer" },
        { id: 7, name: "TrackedLoader" },
        { id: 8, name: "Pavers" },
        { id: 9, name: "otherHeavyB" },
    ]
    const cargoVehiType = [

        { id: 1, name: "ParcelVans" },
        { id: 2, name: "BoxTrucks" },
        { id: 3, name: "FlatbedTrucks" },
        { id: 4, name: "RefrigeratedTrucks" },
        { id: 5, name: "TankerTrucks" },
        { id: 6, name: "CurtainsideTrucks" },
        { id: 7, name: "otherCargos" },
        { id: 8, name: "otherCargos" },
    ]


    const smallVehicleMake = [
        { id: 1, name: "Toyota" },
        { id: 2, name: "MercedesBenz" },
        { id: 3, name: "BMW" },
        { id: 4, name: "Honda" },
        { id: 5, name: "NISSAN" },
        { id: 6, name: "MAZDA" },
        { id: 7, name: "Volkswagen" },
        { id: 8, name: "Ford" },
        { id: 9, name: "Isuzu" },
        { id: 10, name: "Chevrolet" },
        { id: 11, name: "Hyundai" },
        { id: 12, name: "Renault" },
        { id: 13, name: "Mitsubishi" },
        { id: 14, name: "Kia" },
        { id: 15, name: "otherMakes" },
    ]
    const cargoTruckMake = [

        { id: 1, name: "cargoMercedesBenz" },
        { id: 2, name: "cargoMAN" },
        { id: 3, name: "cargoScania" },
        { id: 4, name: "cargoHowo" },
        { id: 5, name: "cargoVolvo" },
        { id: 6, name: "cargoDAF" },
        { id: 7, name: "cargoIveco" },
        { id: 8, name: "cargoUD" },
        { id: 9, name: "cargoIsuzu" },
        { id: 10, name: "cargoMitsubishiFuso" },
        { id: 11, name: "cargoHino" },
    ]
    const heavyEupementMake = [

        { id: 1, name: "heavyCaterpillar" },
        { id: 2, name: "heavyVolvo" },
        { id: 3, name: "heavyJohnDeere" },
        { id: 4, name: "heavyHyundai" },
        { id: 5, name: "heavySany" },
        { id: 6, name: "heavyKobelco" },
        { id: 7, name: "heavyXCMG" },
        { id: 8, name: "heavyBobcat" },
        { id: 9, name: "heavyHitachi" },
        { id: 10, name: "heavyManitou" },
        { id: 11, name: "heavyKubota" },
        { id: 12, name: "heavyOtherM" },
    ]




    // Cargo Area Types
    const cargoAreaTypes = [

        { id: 1, name: "Bulktrailer" },
        { id: 1, name: "SideTipper" },
        { id: 1, name: "Tautliner" },
        { id: 1, name: "Flatbed" },
        { id: 1, name: "Tanker" },
        { id: 1, name: "Refrigerated" },
        { id: 1, name: "CarHauler" },
        { id: 1, name: "UtilityTrailer" },
        { id: 1, name: "Lowboy" },
        { id: 1, name: "otherTrailer" },
    ]

    // Types of service providers
    const serviceProivderType = [

        { id: 1, name: "AutoMechanic" },
        { id: 1, name: "HeavyDutyMechanic" },
        { id: 1, name: "MotoMechanic" },
        { id: 1, name: "AutoTechnician" },
        { id: 1, name: "MotoTechnician" },
        { id: 1, name: "HeavyEquipmentTechnician" },
        { id: 1, name: "Warehouse" },
        { id: 1, name: "other" },
    ]

    // Transaction types
    const transactionTypes = [
        { id: 1, name: "Sell" },
        { id: 2, name: "Rent" },
        { id: 4, name: "Hire" },
        { id: 5, name: "Swap" },
    ];






    // States
    const [vehicleType, setVehicleType] = React.useState("smallVehicle")
    const [vehicleMake, setVehicleMake] = React.useState("smallVehicle")
    const [images, setImages] = useState<ImagePickerAsset[]>([]);

    if (images.length > 4) {
        setImages([]);
        alert('You can only select up to 4 images.');
        return; // Exit if more than 4 images
    }

    const [uploadProgress, setUploadProgress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [selectedMake, setSelectedMake] = useState<any>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

    // Form data
    const [formData, setFormData] = useState<Partial<Product>>({
        title: "",
        description: "",
        price: 0,
        currency: "USD",
        condition: "used",
        transaction: {
            type: "sell",
            priceNegotiable: false,
            deliveryAvailable: false,
            deliveryCost: 0,
            swapPreferences: ""
        },
        details: {
            vehicle: null,
            property: null,
            general: null
        },
        location: {
            address: "",
            city: "",
            coordinates: null
        }
    });

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

    // Handle image selection
    const handleSelectImages = async () => {

    };


    // Handle form submission
    const handleSubmit = async () => {
        // Validate required fields
        // const requiredFields = [
        //     !formData.title && "Product title is required",
        //     !formData.description && "Description is required",
        //     !formData.price && "Price is required",
        //     !selectedCategory && "Category is required",
        //     !selectedTransaction && "Transaction type is required",
        //     images.length === 0 && "At least one image is required",
        //     !formData.location && "Location is required"
        // ].filter(Boolean);

        // if (requiredFields.length > 0) {
        //     setShowErrors(true);
        //     ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
        //     return;
        // }



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

            // Prepare product data
            const productData = {
                ...formData,
                images: imageUrls,
                category: selectedCategory.name,
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
                updatedAt: new Date().toISOString()
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


                        <TouchableOpacity onPress={() => setVehicleType("smallVehicle")} >
                            <ThemedText>Small vehicle</ThemedText>
                        </TouchableOpacity>
                        <View style={{ flexDirection: "row" }} >


                            <TouchableOpacity onPress={() => setVehicleType("heavyEquipment")}>
                                <ThemedText>Heavy Equipment </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setVehicleType("cargoTrucks")}>
                                <ThemedText>Cargo Trucks</ThemedText>
                            </TouchableOpacity>
                        </View>


                        {vehicleType === "cargoTrucks" && <View>
                            <ThemedText> Truck Type</ThemedText>
                            <DropDownItem
                                allData={[{ id: 1, name: "semi Truck" }, { id: 2, name: "rigid" }]}
                                selectedItem={selectedType}
                                setSelectedItem={setSelectedType}
                                placeholder="Select vehicle type"
                            />
                        </View>}


                        <ThemedText type="defaultSemiBold">  {vehicleType !== "cargoTrucks" ? "Vehicle Type" : "Cargo Area"}  </ThemedText>
                        <DropDownItem
                            allData={vehicleType === "smallVehicle" ? smallVehicleTypes : vehicleType === "cargoTrucks" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />

                        {selectedType?.name === "Other" && (
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
                            allData={vehicleType === "smallVehicle" ? smallVehicleMake : vehicleType === "cargoTrucks" ? cargoTruckMake : heavyEupementMake}
                            selectedItem={selectedMake}
                            setSelectedItem={setSelectedMake}
                            placeholder="Select vehicle Make"
                        />

                        <ThemedText type="defaultSemiBold">Model</ThemedText>
                        <Input
                            placeholder="e.g. Camry"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                model: text
                            })}
                        />

                        <ThemedText type="defaultSemiBold">Year</ThemedText>
                        <Input
                            placeholder="e.g. 2020"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                year: parseInt(text) || 0
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
                    </>
                );


            case "Trailer":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Trailer Type</ThemedText>
                        <DropDownItem
                            allData={vehicleType === "smallVehicle" ? smallVehicleTypes : vehicleType === "cargoTrucks" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                    </>
                )
            case "Container":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Vehicle Type</ThemedText>
                        <DropDownItem
                            allData={vehicleType === "smallVehicle" ? smallVehicleTypes : vehicleType === "cargoTrucks" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                    </>
                )
            case "Service Provider":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Vehicle Type</ThemedText>
                        <DropDownItem
                            allData={vehicleType === "smallVehicle" ? smallVehicleTypes : vehicleType === "cargoTrucks" ? cargoVehiType : heavyEupementType}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select vehicle type"
                        />
                    </>
                )


            default:
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Brand</ThemedText>
                        <Input
                            placeholder="Product brand"
                            onChangeText={(text) => handleNestedChange("details", "general", {
                                ...formData.details?.general,
                                brand: text
                            })}
                        />

                        <ThemedText type="defaultSemiBold">Model</ThemedText>
                        <Input
                            placeholder="Product model"
                            onChangeText={(text) => handleNestedChange("details", "general", {
                                ...formData.details?.general,
                                model: text
                            })}
                        />

                        <ThemedText type="defaultSemiBold">Color</ThemedText>
                        <Input
                            placeholder="Product color"
                            onChangeText={(text) => handleNestedChange("details", "general", {
                                ...formData.details?.general,
                                color: text
                            })}
                        />
                    </>
                );
        }
    };

    return (
        <ScreenWrapper fh={false}>
            <Heading page="Create Product" />

            <ErrorOverlay
                visible={showErrors}
                title="Missing Required Fields"
                errors={[
                    !formData.title && "Product title is required",
                    !formData.description && "Description is required",
                    !formData.price && "Price is required",
                    !selectedCategory && "Category is required",
                    !selectedTransaction && "Transaction type is required",
                    images.length === 0 && "At least one image is required",
                    !formData.location && "Location is required"
                ].filter(Boolean) as string[]}
                onClose={() => setShowErrors(false)}
            />

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
                </View>

                {/* Basic Information */}
                <View style={[styles.section, { backgroundColor: backgroundLight, }]}>
                    <ThemedText type="subtitle">Basic Information</ThemedText>
                    <Divider />

                    <ThemedText type="defaultSemiBold">Product Name</ThemedText>
                    <Input
                        placeholder="Product Name"
                        value={formData.title}
                        onChangeText={(text) => handleChange("title", text)}
                    />

                    {/* <ThemedText type="defaultSemiBold">Product Location</ThemedText>
                    <Input
                        placeholder="Location"
                        value={formData.location?.address}
                        onChangeText={(text) => handleChange("location.address", text)}
                    /> */}
                    <ThemedText type="defaultSemiBold">Description</ThemedText>
                    <Input
                        placeholder="Detailed description"
                        multiline
                        numberOfLines={4}
                        value={formData.description}
                        onChangeText={(text) => handleChange("description", text)}
                        style={styles.textArea}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">Price</ThemedText>
                            <Input
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={formData.price?.toString()}
                                onChangeText={(text) => handleChange("price", parseFloat(text) || 0)}
                            />
                        </View>
                        <View style={{ width: wp(30), marginLeft: wp(2) }}>
                            <ThemedText type="defaultSemiBold">Currency</ThemedText>
                            <DropDownItem
                                allData={[
                                    { id: 1, name: "USD" },
                                    { id: 2, name: "RSA" },
                                    { id: 3, name: "ZWG" }
                                ]}
                                selectedItem={{ name: formData.currency }}
                                setSelectedItem={(item: any) => handleChange("currency", item.name)}
                                placeholder="Currency"
                            />
                        </View>
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
                    <Divider />

                    <ThemedText type="defaultSemiBold">Transaction Type</ThemedText>
                    <DropDownItem
                        allData={transactionTypes}
                        selectedItem={selectedTransaction}
                        setSelectedItem={setSelectedTransaction}
                        placeholder="Transaction type"
                    />

                    {selectedTransaction && (
                        <>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[
                                        styles.checkbox,
                                        formData.transaction?.priceNegotiable && styles.checkboxSelected
                                    ]}
                                    onPress={() => handleNestedChange(
                                        "transaction",
                                        "priceNegotiable",
                                        !formData.transaction?.priceNegotiable
                                    )}
                                >
                                    <Ionicons
                                        name={formData.transaction?.priceNegotiable ? "checkbox" : "square-outline"}
                                        size={wp(5)}
                                        color={formData.transaction?.priceNegotiable ? accent : iconColor}
                                    />
                                    <ThemedText style={{ marginLeft: wp(2) }}>Price Negotiable</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.checkbox,
                                        formData.transaction?.deliveryAvailable && styles.checkboxSelected
                                    ]}
                                    onPress={() => handleNestedChange(
                                        "transaction",
                                        "deliveryAvailable",
                                        !formData.transaction?.deliveryAvailable
                                    )}
                                >
                                    <Ionicons
                                        name={formData.transaction?.deliveryAvailable ? "checkbox" : "square-outline"}
                                        size={wp(5)}
                                        color={formData.transaction?.deliveryAvailable ? accent : iconColor}
                                    />
                                    <ThemedText style={{ marginLeft: wp(2) }}>Delivery Available</ThemedText>
                                </TouchableOpacity>
                            </View>

                            {formData.transaction?.deliveryAvailable && (
                                <Input
                                    placeholder="Delivery cost"
                                    keyboardType="numeric"
                                    value={formData.transaction?.deliveryCost?.toString()}
                                    onChangeText={(text) => handleNestedChange(
                                        "transaction",
                                        "deliveryCost",
                                        parseFloat(text) || 0
                                    )}
                                />
                            )}

                            {selectedTransaction.name === "Swap" && (
                                <Input
                                    placeholder="Swap preferences"
                                    value={formData.transaction?.swapPreferences}
                                    onChangeText={(text) => handleNestedChange(
                                        "transaction",
                                        "swapPreferences",
                                        text
                                    )}
                                />
                            )}
                        </>
                    )}
                </View>

                {/* Location Details */}
                <View style={[styles.section, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle">Location Details</ThemedText>
                    <Divider />

                    <ThemedText type="defaultSemiBold">City</ThemedText>
                    <Input
                        placeholder="City"
                        value={formData.location?.city}
                        onChangeText={(text) => handleNestedChange("location", "city", text)}
                    />

                    <ThemedText type="defaultSemiBold">Address</ThemedText>
                    <Input
                        placeholder="Street address"
                        value={formData.location?.address}
                        onChangeText={(text) => handleNestedChange("location", "address", text)}
                    />

                    <TouchableOpacity
                        style={styles.countriesButton}
                        onPress={() => setLocationModalVisible(true)}
                    >
                        <ThemedText>
                            {selectedCountries.length > 0
                                ? `Selected: ${selectedCountries.join(", ")}`
                                : "Select countries where available"}
                        </ThemedText>
                        <Ionicons name="chevron-forward" size={wp(4)} color={iconColor} />
                    </TouchableOpacity>
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

            {/* Countries Modal */}
            <Modal
                visible={locationModalVisible}
                animationType="slide"
                transparent={false}
            >
                <ScreenWrapper>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                            <Ionicons name="arrow-back" size={wp(6)} color={iconColor} />
                        </TouchableOpacity>
                        <ThemedText type="subtitle">Select Countries</ThemedText>
                        <View style={{ width: wp(6) }} />
                    </View>

                    <ScrollView style={styles.countriesList}>
                        {["Zimbabwe", "South Africa", "Namibia", "Botswana", "Zambia", "Mozambique", "Malawi", "Tanzania"].map((country) => (
                            <TouchableOpacity
                                key={country}
                                style={styles.countryItem}
                                onPress={() => {
                                    if (selectedCountries.includes(country)) {
                                        setSelectedCountries(selectedCountries.filter(c => c !== country));
                                    } else {
                                        setSelectedCountries([...selectedCountries, country]);
                                    }
                                }}
                            >
                                <ThemedText>{country}</ThemedText>
                                {selectedCountries.includes(country) ? (
                                    <Ionicons name="checkbox" size={wp(5)} color={accent} />
                                ) : (
                                    <Ionicons name="square-outline" size={wp(5)} color={iconColor} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Button
                            title="Done"
                            onPress={() => setLocationModalVisible(false)}
                        />
                    </View>
                </ScreenWrapper>
            </Modal>
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
    countriesButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp(3),
        borderRadius: wp(2),
        marginTop: hp(1),
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
    countriesList: {
        padding: wp(4),
    },
    countryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
    },
    modalFooter: {
        padding: wp(4),
        borderTopWidth: 1,
    },
});

export default CreateProduct;