import { where } from 'firebase/firestore';
import { fetchDocuments } from '@/db/operations';
import { sendPushNotification } from './pushNotification';
import { ToastAndroid, Platform, Alert } from 'react-native';
import { TruckNeededType } from '@/types/types';


type Truck = {
  expoPushToken?: string;
  locations?: string[];
};

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
}

export const  notifyTrucksByFilters = async ({
  trucksNeeded,
  contractId,
   loadItem,
}: {
  trucksNeeded: TruckNeededType[];
  contractId?: string;
   loadItem: {
    typeofLoad: string;
    origin: string;
    destination: string;
    rate: string;
    model?: string;
    currency: string;
  };
}) => {
    
  for (let i = 0; i < trucksNeeded.length; i++) {
    const need = trucksNeeded[i];
    const { cargoArea, truckType, tankerType, capacity, operationCountries } = need;

    showToast(`Now notifying: ${truckType?.name || "-"}, ${cargoArea?.name || "-"}, ${capacity?.name || "-"}`);

    let filters: any[] = [];

    if (truckType) filters.push(where("truckType", "==", truckType?.name));
    if (cargoArea) filters.push(where("cargoArea", "==", cargoArea?.name));
    if (tankerType) filters.push(where("tankerType", "==", tankerType?.name));
    if (capacity) filters.push(where("truckCapacity", "==", capacity?.name));
    if (capacity) filters.push(where("truckCapacity", "==", capacity?.name));
    filters.push(where("isApproved", "==", true));
    filters.push(where("approvalStatus", "==", "approved")) ;

    const truckResult = await fetchDocuments("Trucks", 50, undefined, filters);

    let matchingTrucks: Truck[] = [];

    if (truckResult && truckResult.data) {
      const trucksFetched = truckResult.data as Truck[];

      matchingTrucks = operationCountries.length > 0
        ? trucksFetched.filter(truck =>
            operationCountries.every(c => truck.locations?.includes(c))
          )
        : trucksFetched;
    }

    if (matchingTrucks.length === 0) {
      showToast(`No trucks found for Truck: ${truckType?.name}, ${cargoArea?.name}, ${capacity?.name}`);
      continue;
    }


const message = `${truckType?.name}, ${capacity?.name} , ${cargoArea?.name}  matched a load.\nLoad: ${loadItem.typeofLoad}, From ${loadItem.origin} to ${loadItem.destination}, Rate: ${loadItem.currency} ${loadItem.rate} (${loadItem.model}).\n\nTap to view more info , book, or bid.`;


    for (let truck of matchingTrucks) {
      if (truck.expoPushToken) {
        await sendPushNotification(
          truck.expoPushToken,
          `New Truck Request`,
          message,
          {
            pathname: '/BooksAndBids/ViewBidsAndBooks',
            params: {
              dbName: "bookings",
              dspRoute: "Booked by Carriers",
              contractId: contractId || null,
            }
          }
        );
      }
    }
  }

};
