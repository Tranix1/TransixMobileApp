import { ImageSourcePropType } from "react-native";
import { ImagePickerAsset } from "expo-image-picker";

export type TruckTypeProps = {
    id: number, name: string, image: ImageSourcePropType | undefined, description: string | undefined
}
export type TankerTruckProps = {
    id: number, name: string, description: string, products: string[]
}


export type TruckFormData = {
    additionalInfo: string;
    driverPhone: string;
    maxloadCapacity: string;
    truckName: string;
    otherCargoArea: string;
    otherTankerType: string;
}
export type Truck = {

    created_at: string,
    CompanyName: string;
    contact: string;
    driverLicense: string;
    driverPassport: string;
    driverIntPermit: string;
    gitImage: string;
    truckNumberPlate: string;
    truckThirdPlate: string;
    accType: string;

    id: string;
    imageUrl: string;
    isVerified: boolean;
    locations: string[];

    onwerEmail: string;
    ownerPhoneNum: string;
    timeStamp: {
        nanoseconds: number;
        seconds: number;
    };
    trailerBookF: string;
    trailerBookSc: string;
    truckBookImage?: string;
    truckType: string;
    truckCapacity: string;
    truckConfig: string;
    truckSuspensions: string;
    cargoArea: string;
    tankerType: string
    name: string;
    userId: string;
    withDetails: boolean;

    // Approval system fields
    isApproved?: boolean;
    approvalStatus?: 'pending' | 'approved' | 'rejected' | 'edited';
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    approvedBy?: string;
    rejectedBy?: string;
    rejectionReason?: string;
    userType?: 'Owner' | 'Broker';

    // Tracker system
    hasTracker?: boolean;
    expoPushToken?: string;
} & TruckFormData;


export interface Product {
    // Core product information
    productModel: string;
    id?: string; // Adding optional ID for Firebase documents
    productLocation: string;
    description: string;
    deliveryCost: string;
    swapPreferences: string;
    price: any;
    currency: string;
    model: string
    category: string;

    condition: 'new' | 'used';
    images: string[];
    bodyStyle: string;
    bodyMake: string;
    vehicleType: string;

    vehcileFuel: string;
    vehicleTransimission: string;

    createdAt: Date;
    updatedAt: Date | null;
}

export interface TruckStop {
    id?: string;
    name: string;
    location: string;
    city?: string;
    country?: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    pricing: {
        parking: string;
        fuel: string;
        food: string;
        rest: string;
    };
    amenities: string[];
    entertainment: string[];
    images: string[];
    contact: {
        phone: string;
        email: string;
    };
    operatingHours: {
        open: string;
        close: string;
        days: string[];
    };
    description: string;
    rating?: number;
    isVerified: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date | null;
}


export type LoadFormData = {
    typeofLoad: string;
    rate: string;
    rateexplantion: string;
    fromLocation: string;
    toLocation: string;
    paymentTerms: string;
    requirements: string;
    alertMsg: string;
    fuelAvai: string;
    additionalInfo: string;
    links: string;
    triaxle: string;
    returnRate: string;
    returnLoad: string;
    returnTerms: string;
    loadingDate: string;
    loadImages: ImagePickerAsset[];
}
type SelectedOption = { id: number; name: string } | null;

export type TruckNeededType = {
    cargoArea: TruckTypeProps | null;
    truckType: SelectedOption;
    tankerType: SelectedOption;
    capacity: SelectedOption;
    operationCountries: string[];
}
export type Load = {
    id: string,
    distance: string,
    duration: string,
    durationInTraffic: string,
    routePolyline?: string;
    bounds?: any;
    created_at: string,
    destination: string,
    userId: string;
    companyName: string;
    logo: string;
    contact: string;
    deletionTime: number;
    timeStamp?: {
        nanoseconds: number;
        seconds: number;
    };
    currency: string
    model: string
    activeLoading: boolean
    origin: string
    roundTrip: boolean
    isVerified: boolean
    trucksRequired: TruckNeededType[]
    proofOfOrder: string[];
    proofOfOrderType: string[]

    // Load verification system
    loadUserType: 'general' | 'confinee' | 'broker';
    verificationStatus: 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    approvedBy?: string;
    rejectedBy?: string;
    rejectionReason?: string;

    // Approval system (for admin approval)
    approvalStatus?: 'pending' | 'approved' | 'rejected' | 'edited';
    isApproved?: boolean;

    // Verification documents
    idDocument?: string;
    idDocumentType?: 'pdf' | 'image' | 'doc' | 'docx';
    proofOfResidence?: string;
    proofOfResidenceType?: 'pdf' | 'image' | 'doc' | 'docx';
    brokerCertificate?: string;
    brokerCertificateType?: 'pdf' | 'image' | 'doc' | 'docx';

    // Load references (like truck references)
    brokerId?: string;
    brokerName?: string;
    brokerPhone?: string;
    brokerEmail?: string;
    ownerId?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;

    // Coordinate fields for map display
    originCoordinates?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    destinationCoordinates?: {
        latitude: number;
        longitude: number;
        address: string;
    };

} & LoadFormData;

export const Countries = ['Zimbabwe',
    'South Africa',
    'DRC',
    'Mozambique',
    'Namibia',
    'Tanzania',
    'Zambia',
    'Botswana',
    'Malawi',
    'Angola',
]
export type User = {
    uid: string,
    createdAt: number | string; // required

    displayName?: string,
    photoURL?: string,
    phoneNumber?: string,
    email?: string,
    emailVerified?: boolean,
    organisation?: string,
    country?: string,
    address?: string,
    referrerId?: string, // ID of the user who referred this user
    [key: string]: any; // To allow additional properties
}


// contractsTypes.ts
export type ContractsFormDataScndType = {
    paymentTerms: string;
    returnPaymentTerms: string;
    contractDuration: string;
    trucksLeft: string;
    startingDate: string;
    bookingClosingD: string;
    contractRenewal: string;
    manyRoutesOperation: string;
    loadsPerWeek: string;
    alertMsg: string;
    fuelAvai: string;
    additionalInfo: string;
    trucksRequiredNum: string
}

export type ContractsFormDataType = {
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
        frst: string;
        scnd: string;
        thrd: string;
        forth: string;
    };
    returnRate: {
        frst: string;
        scnd: string;
        thrd: string;
        forth: string;
    };
    returnCommodity: { frst: string; scnd: string; third: string; forth: string; };
};


export type Contracts = {
    id: string;
    manyRoutesAllocaton: string;
    manyRoutesAssign: string;
    formData: ContractsFormDataType;
    formDataScnd: ContractsFormDataScndType;
    contractId: string;
    contractName: string
    userId: string
    contractLocation: string[]
}



export type SpecifyTruckDetailsProps = {
    dspSpecTruckDet: boolean;
    setDspSpecTruckDet: React.Dispatch<React.SetStateAction<boolean>>;
    // Selecting Truck Tonnage
    truckCapacity: string;
    setTruckCapacity: React.Dispatch<React.SetStateAction<string>>;

    // Select Truck Details 
    selectedTruckType: TruckTypeProps | null;
    setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
    tankerType: string
    setTankerType: React.Dispatch<React.SetStateAction<string>>

    truckConfig: string;
    setTruckConfig: React.Dispatch<React.SetStateAction<string>>;
    truckSuspension: string;
    setTruckSuspension: React.Dispatch<React.SetStateAction<string>>;

    operationCountries: string[]
    setOperationCountries: React.Dispatch<React.SetStateAction<string[]>>;
}

export type DocumentAsset = {
    name: string
    uri: string;
    size: number;
    mimeType?: string; // sometimes contentType instead

    // Add any other properties here
}

export type ProofFileType = 'pdf' | 'image' | 'doc' | 'docx';

export type SelectLocationProp = {

    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    country: string | null;
    city: string | null;

}

export interface FuelItem {
    fuelType: string;
    fuelName: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface FuelPurchase {
    id: string;
    fuelItems: FuelItem[];
    totalAmount: number;
    stationName: string;
    stationId: string;
    purchaseDate: string;
    qrCode: string;
    status: 'pending' | 'completed' | 'cancelled';
    serviceType: 'fuel';
    isMultiPayment: boolean;
    // Route details for navigation
    routeDetails?: {
        destinationLatitude: number;
        destinationLongitude: number;
        destinationName: string;
        distance?: string;
        duration?: string;
        durationInTraffic?: string;
        routePolyline?: string;
        bounds?: any;
    };
}