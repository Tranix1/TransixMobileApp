
const { Paynow } = require("paynow");
import { addDocument } from "@/db/operations";
import { ToastAndroid } from "react-native";


export async function handleMakePayment(
  ammount: number,
  paymentPurpose: string,
   setPaymentUpdate: (status: string) => void,
  dbName: string,
  dbData: object
) {

  let uniqueRecepipt = Math.floor(100000000000 + Math.random() * 900000000000).toString()


  let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");

  let payment = paynow.createPayment(`${uniqueRecepipt}r`, "kelvinyaya8@gmail.com");

  paynow.resultUrl = "https://transix.net";
  paynow.returnUrl = "https://transix.net";

  // Add items/services
  payment.add(paymentPurpose, ammount);

  try {
     setPaymentUpdate("🔃 Initiating payment...");
    let response = await paynow.sendMobile(payment, "0771111111", "ecocash");

    if (response.success) {
      let pollUrl = response.pollUrl;
       setPaymentUpdate("✅ Payment initiated! Polling...");

      let pollInterval = setInterval(async () => {
        try {
          let status = await paynow.pollTransaction(pollUrl);
          setPaymentUpdate(`🔄payment Status: ${status.status}`);

          if (status.status === "paid") {
            ToastAndroid.show("✅ Payment Complete!", ToastAndroid.SHORT)
            setPaymentUpdate("Adding Contract")
            await addDocument(dbName, { ...dbData, pollUrl: pollUrl }, )
            setPaymentUpdate("Done Adding Contract")
            clearInterval(pollInterval);
          } else if (status.status === "cancelled" || status.status === "failed") {
             setPaymentUpdate("❌ Payment Failed or Cancelled.");
            clearInterval(pollInterval);
          }
        } catch (pollError) {
           setPaymentUpdate("⚠️ Polling Error.");
          clearInterval(pollInterval);
        }
      }, 10000);
    } else {
       setPaymentUpdate(`❌ Error: ${response.error}`);
    }
  } catch (error) {
     setPaymentUpdate("⚠️ Payment Error.");
  }
}