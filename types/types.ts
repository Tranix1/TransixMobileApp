import { UserInfo, UserMetadata } from "firebase/auth";

export type Truck = {

    CompanyName: string,
    additionalInfo: string,
    contact: string,
    fromLocation: string,
    id: string,
    imageUrl: string,
    isVerified: boolean,
    toLocation: string,
    trailerType: string,
    truckType: string,
    userId: string,

}

export const Countries = [
    'Zimbabwe', 'South Africa', 'zambia'
]
export type User = {
    uid: string,
    displayName?: string,
    photoURL?: string,
    phoneNumber?: string,
    email?: string,
    [key: string]: any; // To allow additional properties
}