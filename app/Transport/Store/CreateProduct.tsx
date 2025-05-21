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
        { id: 2, name: "Property" },
        { id: 3, name: "Electronics" },
        { id: 4, name: "Furniture" },
        { id: 5, name: "Other" }
    ];

    // Vehicle types
    const vehicleTypes = [
        { id: 1, name: "Sedan" },
        { id: 2, name: "SUV" },
        { id: 3, name: "Truck" },
        { id: 4, name: "Motorcycle" },
        { id: 5, name: "Other" }
    ];

    // Property types
    const propertyTypes = [
        { id: 1, name: "House" },
        { id: 2, name: "Apartment" },
        { id: 3, name: "Land" },
        { id: 4, name: "Commercial" },
        { id: 5, name: "Other" }
    ];

    // Transaction types
    const transactionTypes = [
        { id: 1, name: "Sell" },
        { id: 2, name: "Rent" },
        { id: 3, name: "Swap" }
    ];

    // States
    const [images, setImages] = useState<any[]>([]);
    const [uploadProgress, setUploadProgress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<any>(null);
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
        try {
            // const selectedImages = await selectManyImages();
            // if (selectedImages) {
            //     setImages(selectedImages);
            // }
        } catch (error) {
            ToastAndroid.show("Error selecting images", ToastAndroid.SHORT);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validate required fields
        const requiredFields = [
            !formData.title && "Product title is required",
            !formData.description && "Description is required",
            !formData.price && "Price is required",
            !selectedCategory && "Category is required",
            !selectedTransaction && "Transaction type is required",
            images.length === 0 && "At least one image is required",
            !formData.location && "Location is required"
        ].filter(Boolean);

        if (requiredFields.length > 0) {
            setShowErrors(true);
            ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
            return;
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
                images: uploadedImages,
                category: selectedCategory.name,
                seller: {
                    id: user?.uid || "",
                    name: user?.displayName || "Anonymous",
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
                        <ThemedText type="defaultSemiBold">Vehicle Type</ThemedText>
                        <DropDownItem
                            allData={vehicleTypes}
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
                        <Input
                            placeholder="e.g. Toyota"
                            onChangeText={(text) => handleNestedChange("details", "vehicle", {
                                ...formData.details?.vehicle,
                                make: text
                            })}
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

            case "Property":
                return (
                    <>
                        <ThemedText type="defaultSemiBold">Property Type</ThemedText>
                        <DropDownItem
                            allData={propertyTypes}
                            selectedItem={selectedType}
                            setSelectedItem={setSelectedType}
                            placeholder="Select property type"
                        />

                        <ThemedText type="defaultSemiBold">Bedrooms</ThemedText>
                        <Input
                            placeholder="Number of bedrooms"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "property", {
                                ...formData.details?.property,
                                bedrooms: parseInt(text) || 0
                            })}
                        />

                        <ThemedText type="defaultSemiBold">Bathrooms</ThemedText>
                        <Input
                            placeholder="Number of bathrooms"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "property", {
                                ...formData.details?.property,
                                bathrooms: parseInt(text) || 0
                            })}
                        />

                        <ThemedText type="defaultSemiBold">Square Footage</ThemedText>
                        <Input
                            placeholder="Area in square feet"
                            keyboardType="numeric"
                            onChangeText={(text) => handleNestedChange("details", "property", {
                                ...formData.details?.property,
                                squareFootage: parseInt(text) || 0
                            })}
                        />
                    </>
                );

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
        <ScreenWrapper>
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
                                onPress={handleSelectImages}
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

                    <ThemedText type="defaultSemiBold">Title</ThemedText>
                    <Input
                        placeholder="Product title"
                        value={formData.title}
                        onChangeText={(text) => handleChange("title", text)}
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
                        <View style={{ width: wp(20), marginLeft: wp(2) }}>
                            <ThemedText type="defaultSemiBold">Currency</ThemedText>
                            <DropDownItem
                                allData={[
                                    { id: 1, name: "USD" },
                                    { id: 2, name: "EUR" },
                                    { id: 3, name: "ZAR" }
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