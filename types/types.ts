import { ImageSourcePropType } from "react-native";

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
    driverLicense: string;
    driverPassport: string;
    driverIntPermit : string;

    id: string;
    imageUrl: string;
    isVerified: boolean;
    locations: string[];

    onwerEmail: string;
    ownerName: string;
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



    truckDetails: {
        truckConfig: string;
        truckSuspension: string;
        truckType: string;
        semiTrailerCapacity: string
        semiTrailerSuspension: string;
        semiTrailerConfig: string;
    },

    // User/seller information
    seller: {
        id: string;
        name: string;
        contact: string;
        isVerified: boolean;
        pushToken?: string; // For notifications
    };

    // Product-specific details (conditional based on category)
    details: {
        // For vehicles
        vehicle?: {
            type: string;
            otherType: string;
            make: string;
            otherMake: string;
            model: string;
            year: number;
            mileage: number;
            engine: string;
            transmission: string;
            fuelType: string;
            horsePower: string;
            truckCapacity: string
            otherTruckConfig: string;
            otherTruckSuspension: string;
        } | null;

        trailers?: {
            otherType: string;
            otherMake: string;
            otherTrailerConfig: string;
            otherTrailerSuspension: string;
        }
    };

    // Transaction details
    transaction: {
        type: 'sell' | 'rent' | 'swap';
        priceNegotiable: boolean;
        deliveryCost?: string;
        swapPreferences?: string;
        deliveryAvailable: boolean;

    };

    // Marketplace visibility
    visibility: {
        featured: boolean;
        promoted: boolean;
        frontPage: boolean;
    };

    // System metadata
    metadata: {
        views: number;
        saves: number;
        status: 'active' | 'sold' | 'expired' | 'removed';
    };

    location: {
        storeCountry: string
        exactLocation: string
        storeCity: string
        productLocation: string
        coordinates: null
    }
}

export type LoadFormData = {
    typeofLoad: string
    rate: string;
    rateexplantion: string;
    fromLocation: string
    toLocation: string
    paymentTerms: string
    requirements: string
    alertMsg: string
    fuelAvai: string
    additionalInfo: string
    links: string
    triaxle: string
    returnRate: string
    returnLoad: string
    returnTerms: string
    loadingDate: string
}
type TruckNeededType = {
    cargoArea: TruckTypeProps | null;
    truckType: { id: number; name: string } | null;
    tankerType: { id: number; name: string } | null;
    capacity: { id: number; name: string } | null;
    operationCountries: string[];
    trailerConfig: { id: number; name: string } | null;
    suspension: { id: number; name: string } | null;
}
export type Load = {
    id: string,
    distance: string,
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
    location: string
    roundTrip: boolean
    isVerified: boolean
    trucksRequired: TruckNeededType[]

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
    trucksRequiredNum:string
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
    contractLocation : string[]
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