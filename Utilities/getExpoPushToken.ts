import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

export const getExpoPushToken = async (
    userId: string
): Promise<string | null> => {
    try {

        const { status } = await Notifications.getPermissionsAsync();

        let finalStatus = status;

        if (status !== "granted") {
            const permission =
                await Notifications.requestPermissionsAsync();

            finalStatus = permission.status;
        }


        if (finalStatus !== "granted") {
            console.log("Notification permission denied");
            return null;
        }


        const projectId =
            Constants.easConfig?.projectId ??
            Constants.expoConfig?.extra?.eas?.projectId;


        if (!projectId) {
            console.log("Missing Expo project ID");
            return null;
        }


        const response =
            await Notifications.getExpoPushTokenAsync({
                projectId,
            });


        const expoPushToken = response.data;


        await updateDoc(
            doc(db, "personalData", userId),
            {
                expoPushToken,
                pushTokenUpdatedAt: Date.now(),
            }
        );


        console.log(
            "Expo Push Token Updated:",
            expoPushToken
        );


        return expoPushToken;


    } catch (error) {

        console.error(
            "Failed getting Expo push token:",
            error
        );

        return null;
    }
};