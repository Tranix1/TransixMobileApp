      
const { Paynow } = require("paynow");
      


    export async function handleMakePayment(
  ammount: number,
  paymentPurpose: string,
  onStatusUpdate: (status: string) => void
) {

    let uniqueRecepipt = Math.floor(100000000000 + Math.random() * 900000000000).toString() 


  let paynow = new Paynow("20036", "e33d1e4a-26df-4c10-91ab-c29bca24c96f");

  let payment = paynow.createPayment( `${uniqueRecepipt}r`, "kelvinyaya8@gmail.com");

  paynow.resultUrl = "https://transix.net";
  paynow.returnUrl = "https://transix.net";

  // Add items/services
  payment.add(paymentPurpose , ammount );

  try {
    onStatusUpdate("🔃 Initiating payment...");
    let response = await paynow.sendMobile(payment, "0771111111", "ecocash");

    if (response.success) {
      let pollUrl = response.pollUrl;
      onStatusUpdate("✅ Payment initiated! Polling...");

      let pollInterval = setInterval(async () => {
        try {
          let status = await paynow.pollTransaction(pollUrl);
          onStatusUpdate(`🔄 Status: ${status.status}`);

          if (status.status === "paid") {
            onStatusUpdate("✅ Payment Complete!");
            clearInterval(pollInterval);
          } else if (status.status === "cancelled" || status.status === "failed") {
            onStatusUpdate("❌ Payment Failed or Cancelled.");
            clearInterval(pollInterval);
          }
        } catch (pollError) {
          onStatusUpdate("⚠️ Polling Error.");
          clearInterval(pollInterval);
        }
      }, 10000);
    } else {
      onStatusUpdate(`❌ Error: ${response.error}`);
    }
  } catch (error) {
    onStatusUpdate("⚠️ Payment Error.");
  }
}