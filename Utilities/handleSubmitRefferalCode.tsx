import {ToastAndroid} from "react-native";
import { updateDocument } from "@/db/operations";

import { validateReferralCode } from "@/db/operations";

export const handleSubmitReferralCode = async ({
    code,
    user,
    setupUser,
    setReferralCode,
    setShowReferralModal,
    setIsSubmitting,
}: {
    code: any;
    user: any;
    setupUser:  any;
    setReferralCode: (code: string) => void;
    setShowReferralModal: (value: boolean) => void;
    setIsSubmitting: (value: boolean) => void;
}) => {

    if (!code || !code.trim()) {

        ToastAndroid.show(
            "Please enter a referral code.",
            ToastAndroid.SHORT
        );

        return;
    }


    if (!user?.uid) {

        ToastAndroid.show(
            "User not found.",
            ToastAndroid.LONG
        );

        return;
    }


    setIsSubmitting(true);


    try {

        const normalizedCode =
            code.trim().toUpperCase();


        const validation =
            await validateReferralCode(normalizedCode);



        if (
            !validation.exists ||
            !validation.data
        ) {

            ToastAndroid.show(
                "Invalid referral code. Please check and try again.",
                ToastAndroid.LONG
            );

            return;
        }



        let referredBy;



        if (validation.type === "REFERRER") {

            referredBy = {

                userId:
                    validation.data.userId,

                name:
                    validation.data.name,

                phoneNumber:
                    validation.data.phoneNumber,

                referralCode:
                    validation.data.referralCode,

                joinedAt:
                    validation.data.joinedAt,

            };

        }



        if (validation.type === "CAMPAIGN") {

            referredBy = {

                userId:
                    validation.data.userId,

                name:
                    validation.data.name,

                phoneNumber:
                    validation.data.phoneNumber,

                referralCode:
                    validation.data.referralCode,

                campaign:
                    validation.data.campaign,

                platform:
                    validation.data.platform,

                createdAt:
                    validation.data.createdAt,

            };

        }



        await updateDocument(
            "personalData",
            user.uid,
            {
                referredBy
            }
        );



        await setupUser({

            ...user,

            referredBy

        });



        setReferralCode(normalizedCode);


        setShowReferralModal(false);



        ToastAndroid.show(
            "Referral code accepted.",
            ToastAndroid.SHORT
        );



    } catch(error){

        console.error(
            "Referral validation error:",
            error
        );


        ToastAndroid.show(
            "Referral validation failed. Please try again.",
            ToastAndroid.LONG
        );


    } finally {

        setIsSubmitting(false);

    }

};