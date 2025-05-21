import { UserInfo, UserMetadata } from "firebase/auth";
import { ImageSourcePropType } from "react-native";

export type TruckTypeProps = {
    id: number, name: string, image: ImageSourcePropType | undefined, description: string | undefined
}
export type TankerTruckProps = {
    id: number, name: string, description: string, products: string[]
}
export type CountrySelectorProps = {
    location: string;
    setLocation: React.Dispatch<React.SetStateAction<string>>;
    intOpLoc: string[];
    setIntOpLoc: React.Dispatch<React.SetStateAction<string[]>>;
    setLocaOpLoc: React.Dispatch<React.SetStateAction<string>>;
    locaOpLoc: string
}

   export type TruckFormData= {
    additionalInfo: string;
    driverPhone: string;
    maxloadCapacity: string;
    truckName: string;
    otherTruckSuspension : string ;
    otherCargoArea : string;
    otherTruckConfig : string;
    otherTankerType : string ;
  }
export type Truck = {

    created_at: string,
    CompanyName : string;
    driverLicense: string;
    driverPassport: string;

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
    truckConfig : string;
    truckSuspensions: string;
    cargoArea: string;
    tankerType : string
    name: string;
    userId: string;
    withDetails: boolean;
}&TruckFormData ;


export type Product = {
    id: string;
    imageUrl: string;
    location: string,
    price: string
}

export type LoadFormData = {
    typeofLoad: string
    ratePerTonne: string
    fromLocation : string
    toLocation:string 
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
}
export type Load = {
    id: string,
    distance: string,
    created_at: string,
    destination: string,
    userId: string;
    companyName: string;
    contact: string;
    deletionTime: number;
    timeStamp?: {
        nanoseconds: number;
        seconds: number;
    };
    currency: string
    activeLoading: boolean
    location: string
    roundTrip: boolean
    isVerified: boolean

} & LoadFormData;

export const Countries = ['Zimbabwe',
    'South Africa',
    'Namibia',
    'Tanzania',
    'Mozambique',
    'Zambia',
    'Botswana',
    'Malawi',
    'Other'
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
    startingDate: string;
    bookingClosingD: string;
    contractRenewal: string;
    manyRoutesOperation: string;
    loadsPerWeek: string;
    alertMsg: string;
    fuelAvai: string;
    additionalInfo: string;
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
        solidFrst: string;
        solidScnd: string;
        triaxleFrst: string;
        triaxlesScnd: string;
        linksFrst: string;
        linksScnd: string;
        superLinkFrst: string;
        superLinkScnd: string;
    };
    returnRate: {
        solidFrst: string;
        solidScnd: string;
        triaxleFrst: string;
        triaxlesScnd: string;
        linksFrst: string;
        linksScnd: string;
        superLinkFrst: string;
        superLinkScnd: string;
    };
    returnCommodity: { frst: string; scnd: string; third: string; forth: string; };
};


export type Contracts = {
    id: string;
    interCountries: string;
    localCountr: string;
    manyRoutesAllocaton: string;
    manyRoutesAssign: string;
    formData: ContractsFormDataType;
    formDataScnd: ContractsFormDataScndType;
    contractId: string;
}