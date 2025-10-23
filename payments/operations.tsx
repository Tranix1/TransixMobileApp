
const { Paynow } = require("paynow");
import { ToastAndroid } from "react-native";

export async function handleMakePayment(
  amount: number,
  paymentPurpose: string,
  setPaymentUpdate: (status: string) => void,
  phoneNumber: string
): Promise<{ success: boolean; message: string }> {
  let uniqueReceipt = Math.floor(100000000000 + Math.random() * 900000000000).toString();

  let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");
  let payment = paynow.createPayment(`${uniqueReceipt}r`, "kelvinyaya8@gmail.com");

  paynow.resultUrl = "https://transix.net";
  paynow.returnUrl = "https://transix.net";

  payment.add(paymentPurpose, amount);

  try {
    setPaymentUpdate("📡 Initiating payment...");
    let response = await paynow.sendMobile(payment, phoneNumber, "ecocash");

    if (!response.success) {
      setPaymentUpdate(`❌ Error: ${response.error}`);
      return { success: false, message: response.error || "Payment request failed" };
    }

    setPaymentUpdate("⏳ Payment initiated! Waiting for confirmation...");
    let pollUrl = response.pollUrl;

    return await new Promise((resolve) => {
      let pollInterval = setInterval(async () => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Payment polling timed out after 15 seconds'));
            }, 15000);
          });

          const pollPromise = async () => {
            let status = await paynow.pollTransaction(pollUrl);
            console.log("PAYNOW POLL STATUS:", status); // 🔎 debug log
            setPaymentUpdate(`Payment Status: ${status.status}`);

            if (status.status === "paid") {
              clearInterval(pollInterval);
              setPaymentUpdate("✅ Payment Successful");
              ToastAndroid.show("Payment Complete!", ToastAndroid.SHORT);
              resolve({ success: true, message: "Payment complete" });

            } else if (status.status === "cancelled") {
              clearInterval(pollInterval);
              setPaymentUpdate("❌ User Cancelled Payment");
              resolve({ success: false, message: "User cancelled payment" });

            } else if (status.status === "failed") {
              clearInterval(pollInterval);
              setPaymentUpdate("❌ Payment Failed (e.g. insufficient balance)");
              resolve({ success: false, message: "Payment failed (e.g. insufficient balance)" });

            }
            // Delayed success → keep polling until resolved
            else if (status.status === "awaiting delivery" || status.status === "sent") {
              setPaymentUpdate("⌛ Waiting for Ecocash confirmation...");
            }
          };

          await Promise.race([pollPromise(), timeoutPromise]);

        } catch (pollError) {
          console.error('Payment polling error:', pollError);
          clearInterval(pollInterval);
          setPaymentUpdate("⚠️ Polling Error.");
          resolve({ success: false, message: "Polling error" });
        }
      }, 8000); // poll every 8s
    });
  } catch (error: any) {
    setPaymentUpdate("Payment Error.");
    return { success: false, message: error.message || "Payment error" };
  }
}
