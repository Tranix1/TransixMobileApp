import { SelectLocationProp } from '@/types/types';
import { ImagePickerAsset } from 'expo-image-picker';
import { DocumentAsset } from '@/types/types';

// Validation utilities for load forms
export const validateLoadForm = (
    userType: 'general' | 'professional' | null,
    formData: {
        typeofLoad: string;
        origin: SelectLocationProp | null;
        destination: SelectLocationProp | null;
        rate?: string;
        paymentTerms?: string;
        selectedLoadingDate?: { id: number, name: string } | null;
        loadImages?: ImagePickerAsset[];
        selectedAfricanTrucks?: any[];
        trucksNeeded?: any[];
    }
): string[] => {
    if (!userType) return ['Please select user type'];

    const errors: string[] = [];

    // Common validations
    if (!formData.typeofLoad) errors.push('Enter Load to be transported');
    if (!formData.origin) errors.push('Enter source Location');
    if (!formData.destination) errors.push('Enter destination location');

    // User type specific validations
    if (userType === 'general') {
        if (!formData.selectedLoadingDate) errors.push('Select loading date');
        if (!formData.loadImages || formData.loadImages.length === 0) {
            errors.push('Upload images of your load');
        }
        if (!formData.selectedAfricanTrucks || formData.selectedAfricanTrucks.length === 0) {
            errors.push('Select at least 1 truck type');
        }
    } else {
        if (!formData.rate) errors.push('Enter Load Rate');
        if (!formData.paymentTerms) errors.push('Enter Payment Terms');
        if (!formData.trucksNeeded || formData.trucksNeeded.length === 0) {
            errors.push('Select at least 1 truck required');
        }
    }

    return errors;
};

// AI analysis utilities
export const createAIPrompt = (): string => {
    return `You are a logistics expert. Analyze these cargo/load images and determine the most suitable truck type for transportation.
      
      Consider these factors:
      - Size and dimensions of the cargo
      - Weight and density (estimate from appearance)
      - Fragility and handling requirements
      - Special transportation needs (refrigeration, hazardous materials, etc.)
      - Loading/unloading requirements
      
      Based on the images, recommend:
      1. Cargo Area Type (choose exactly one from: Flatbed, Container, Tanker, Refrigerated, Dry Van, Open Top, Side Curtain, Low Loader, Car Carrier, Other)
      2. Truck Type (choose exactly one from: Light Truck, Medium Truck, Heavy Truck, Articulated Truck, Rigid Truck)
      3. Capacity Range (choose exactly one from: 1-5 tons, 5-15 tons, 15-30 tons, 30-50 tons, 50+ tons)
      4. Tanker Type (only if cargo area is Tanker, choose from: Fuel Tanker, Water Tanker, Chemical Tanker, Food Grade Tanker, Other, or use null if not applicable)
      
      IMPORTANT: Respond ONLY with valid JSON in this exact format (no additional text, no markdown formatting):
      {
        "cargoArea": "recommended cargo area",
        "truckType": "recommended truck type", 
        "capacity": "recommended capacity range",
        "tankerType": "recommended tanker type or null",
        "reasoning": "brief explanation of the recommendation"
      }`;
};

// AI response mapping utilities
export const mapAIResponse = (aiResponse: any) => {
    const cargoAreaMap: { [key: string]: any } = {
        "Flatbed": { id: 1, name: "Flatbed", image: undefined, description: "Open flat platform for general cargo" },
        "Container": { id: 2, name: "Container", image: undefined, description: "Standard shipping container transport" },
        "Tanker": { id: 3, name: "Tanker", image: undefined, description: "Liquid transport vehicle" },
        "Refrigerated": { id: 4, name: "Refrigerated", image: undefined, description: "Temperature-controlled transport" },
        "Dry Van": { id: 5, name: "Dry Van", image: undefined, description: "Enclosed dry cargo transport" },
        "Open Top": { id: 6, name: "Open Top", image: undefined, description: "Open-top container transport" },
        "Side Curtain": { id: 7, name: "Side Curtain", image: undefined, description: "Side curtain trailer" },
        "Low Loader": { id: 8, name: "Low Loader", image: undefined, description: "Low platform for heavy equipment" },
        "Car Carrier": { id: 9, name: "Car Carrier", image: undefined, description: "Multi-level vehicle transport" },
        "Other": { id: 10, name: "Other", image: undefined, description: "Specialized transport" }
    };

    const truckTypeMap: { [key: string]: { id: number, name: string } } = {
        "Light Truck": { id: 1, name: "Light Truck" },
        "Medium Truck": { id: 2, name: "Medium Truck" },
        "Heavy Truck": { id: 3, name: "Heavy Truck" },
        "Articulated Truck": { id: 4, name: "Articulated Truck" },
        "Rigid Truck": { id: 5, name: "Rigid Truck" }
    };

    const capacityMap: { [key: string]: { id: number, name: string } } = {
        "1-5 tons": { id: 1, name: "1-5 tons" },
        "5-15 tons": { id: 2, name: "5-15 tons" },
        "15-30 tons": { id: 3, name: "15-30 tons" },
        "30-50 tons": { id: 4, name: "30-50 tons" },
        "50+ tons": { id: 5, name: "50+ tons" }
    };

    const tankerTypeMap: { [key: string]: { id: number, name: string } } = {
        "Fuel Tanker": { id: 1, name: "Fuel Tanker" },
        "Water Tanker": { id: 2, name: "Water Tanker" },
        "Chemical Tanker": { id: 3, name: "Chemical Tanker" },
        "Food Grade Tanker": { id: 4, name: "Food Grade Tanker" },
        "Other": { id: 5, name: "Other" }
    };

    return {
        cargoArea: cargoAreaMap[aiResponse.cargoArea] || cargoAreaMap["Other"],
        truckType: truckTypeMap[aiResponse.truckType] || truckTypeMap["Heavy Truck"],
        capacity: capacityMap[aiResponse.capacity] || capacityMap["15-30 tons"],
        tankerType: aiResponse.tankerType && aiResponse.tankerType !== "null" && aiResponse.tankerType !== null
            ? (tankerTypeMap[aiResponse.tankerType] || tankerTypeMap["Other"])
            : null
    };
};

// Form data preparation utilities
export const prepareLoadData = (
    userType: 'general' | 'professional',
    formData: any,
    user: any,
    expoPushToken: string | null
) => {
    return {
        userId: user?.uid,
        companyName: user?.organisation,
        contact: user?.phoneNumber || '',
        logo: user.photoURL,
        created_at: Date.now().toString(),
        isVerified: false,
        userType: userType,
        typeofLoad: formData.typeofLoad,
        destination: formData.destination?.description,
        destinationFull: formData.destination,
        destinationCoordinates: formData.destination ? {
            latitude: formData.destination.latitude,
            longitude: formData.destination.longitude,
            address: formData.destination.description
        } : null,
        origin: formData.origin?.description,
        originFull: formData.origin,
        originCoordinates: formData.origin ? {
            latitude: formData.origin.latitude,
            longitude: formData.origin.longitude,
            address: formData.origin.description
        } : null,

        // Professional user fields
        rate: userType === 'professional' ? (formData.rate || '') : (formData.budget || ''),
        rateexplantion: userType === 'professional' ? (formData.rateexplantion || '') : '',
        currency: userType === 'professional' ? (formData.selectedCurrency?.name || 'USD') : (formData.budgetCurrency?.name || 'USD'),
        model: userType === 'professional' ? (formData.selectedModelType?.name || 'Solid') : 'Solid',
        paymentTerms: userType === 'professional' ? (formData.paymentTerms || 'To be discussed') : 'To be discussed',

        // General user fields
        budget: userType === 'general' ? (formData.budget || '') : '',
        budgetCurrency: userType === 'general' ? (formData.budgetCurrency?.name || 'USD') : '',
        loadingDate: userType === 'general' ? (formData.selectedLoadingDate?.name || '') : (formData.loadingDate || ''),

        // Common fields
        requirements: userType === 'professional' ? (formData.requirements || 'Standard requirements') : 'General cargo transport',
        additionalInfo: userType === 'professional' ? (formData.additionalInfo || '') : 'Load posted by general user with AI assistance',
        alertMsg: userType === 'professional' ? (formData.alertMsg || '') : '',
        fuelAvai: userType === 'professional' ? (formData.fuelAvai || '') : '',
        returnLoad: userType === 'professional' ? (formData.returnLoad || '') : '',
        returnRate: userType === 'professional' ? (formData.returnRate || '') : '',
        returnModel: userType === 'professional' ? (formData.selectedReturnModelType?.name || '') : '',
        returnCurrency: userType === 'professional' ? (formData.selectedReturnCurrency?.name || '') : '',
        returnTerms: userType === 'professional' ? (formData.returnTerms || '') : '',
        trucksRequired: userType === 'general'
            ? (formData.selectedAfricanTrucks?.length > 0
                ? formData.selectedAfricanTrucks.map((truck: any) => ({
                    cargoArea: truck.name || truck,
                    truckType: "Medium Truck",
                    tankerType: null,
                    capacity: "5-15 tons",
                    operationCountries: [formData.origin?.country || 'South Africa', formData.destination?.country || 'South Africa']
                }))
                : [])
            : (formData.trucksNeeded || []),
        loadId: `Lo${Math.floor(100000000000 + Math.random() * 900000000000).toString()}ad`,
        expoPushToken: expoPushToken || null,

        // Different proof handling
        proofOfOrder: userType === 'professional' ? (formData.proofOfOerSub || null) : null,
        proofOfOrderType: userType === 'professional' ? (formData.proofOfOrderFileType?.[0] || null) : null,
        loadImages: userType === 'general' ? (formData.loadImagesUrls || []) : [],

        distance: formData.distance || 0,
        duration: formData.duration || 0,
        durationInTraffic: formData.durationInTraffic || 0,
        routePolyline: formData.routePolyline || '',
        bounds: formData.bounds || null,
    };
};

// Clear form utilities
export const getDefaultFormState = () => ({
    typeofLoad: "",
    toLocation: "",
    rate: "",
    rateexplantion: "",
    paymentTerms: "",
    requirements: "",
    loadingDate: "",
    additionalInfo: "",
    alertMsg: "",
    fuelAvai: "",
    returnLoad: "",
    returnRate: "",
    returnTerms: "",
    selectedCurrency: { id: 1, name: "USD" },
    selectedRetrunCurrency: { id: 1, name: "USD" },
    selectedModelType: { id: 1, name: "Solid" },
    selectedReturnModelType: { id: 1, name: "Solid" },
    formDataTruck: {
        additionalInfo: "",
        driverPhone: "",
        maxloadCapacity: "",
        truckName: "",
        otherCargoArea: "",
        otherTankerType: ""
    },
    selectedCargoArea: null,
    selectedTruckType: null,
    selectedTankerType: null,
    selectedTruckCapacity: null,
    showCountries: false,
    operationCountries: [],
    trucksNeeded: [],
    step: 0,
    uploadImageUpdate: ""
});

// Currency options
export const CURRENCY_OPTIONS = [
    { id: 1, name: "USD" },
    { id: 2, name: "RSA" },
    { id: 3, name: "ZWG" }
];

// Model options
export const MODEL_OPTIONS = [
    { id: 1, name: "Solid" },
    { id: 2, name: "/ Tonne" },
    { id: 3, name: "/ KM" }
];
