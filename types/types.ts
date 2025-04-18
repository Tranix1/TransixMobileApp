import { UserInfo, UserMetadata } from "firebase/auth";

export type Truck = {

    CompanyName: string;
    additionalInfo: string;
    contact: string;
    deletionTime: number;
    driverLicense: string;
    driverPassport: string;
    driverPhone: string;
    expoPushToken: string;
    fromLocation: string;
    id: string;
    imageUrl: string;
    isVerified: boolean;
    location: string;
    maximumWheight: string;
    onwerEmail: string;
    ownerName: string;
    ownerPhoneNum: string;
    timeStamp: {
        nanoseconds: number;
        seconds: number;
    };
    trailerBookF: string;
    trailerBookSc: string | null;
    trailerModel: string;
    trailerType: string;
    truckBookImage: string;
    truckTonnage: string;
    truckType: string;
    userId: string;
    withDetails: boolean;
};

// export const Countries = [
//     'Zimbabwe', 'South Africa', 'Zambia'
//     , 'Botswana', 'Namibia', 'Mozambique', 'Angola', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Malawi', 'Lesotho', 'Eswatini', 'Ethiopia', 'Somalia', 'Ghana', 'Nigeria', 'Cameroon', 'Senegal', 'Ivory Coast', 'Mali', 'Chad', 'Sudan', 'South Sudan', 'Liberia', 'Sierra Leone', 'Gambia', 'Guinea', 'Guinea-Bissau', 'Equatorial Guinea', 'Congo', 'Democratic Republic of the Congo', 'Central African Republic', 'Mauritania', 'Niger', 'Togo', 'Benin', 'Burkina Faso', 'Djibouti', 'Eritrea', 'Comoros', 'Seychelles', 'Cape Verde', 'Madagascar', 'Mauritius'
// ]

export const Countries = ['Zimbabwe',
    'South Africa',
    'Namibia',
    'Tanzania',
    'Mozambique',
    'Zambia',
    'Botswana',
    'Malawi'
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