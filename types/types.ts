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
    toLocation: string;
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

export const Countries = [
    'Zimbabwe', 'South Africa', 'Zambia'
    , 'Botswana', 'Namibia', 'Mozambique', 'Angola', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Malawi', 'Lesotho', 'Eswatini', 'Ethiopia', 'Somalia', 'Ghana', 'Nigeria', 'Cameroon', 'Senegal', 'Ivory Coast', 'Mali', 'Chad', 'Sudan', 'South Sudan', 'Liberia', 'Sierra Leone', 'Gambia', 'Guinea', 'Guinea-Bissau', 'Equatorial Guinea', 'Congo', 'Democratic Republic of the Congo', 'Central African Republic', 'Mauritania', 'Niger', 'Togo', 'Benin', 'Burkina Faso', 'Djibouti', 'Eritrea', 'Comoros', 'Seychelles', 'Cape Verde', 'Madagascar', 'Mauritius'
]
export type User = {
    uid: string,
    displayName?: string,
    photoURL?: string,
    phoneNumber?: string,
    email?: string,
    [key: string]: any; // To allow additional properties
}