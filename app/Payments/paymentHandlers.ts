// payments/paymentHandlers.ts
// Ecocash + Card payment flows against Paynow. Card payments use Paynow's
// hosted checkout (redirect) rather than collecting card details in-app,
// which keeps you out of PCI-DSS scope.

const { Paynow } = require('paynow');
import { Linking, ToastAndroid } from 'react-native';

export interface PaymentResult {
  success: boolean;
  message: string;
}

const PAYNOW_ID = '20036';
const PAYNOW_KEY = 'e33d1e4a-26df-4c10-91ab-c29bca24c96f';
const RESULT_URL = 'https://transix.net';
const RETURN_URL = 'https://transix.net';

function makePaynow() {
  const paynow = new Paynow(PAYNOW_ID, PAYNOW_KEY);
  paynow.resultUrl = RESULT_URL;
  paynow.returnUrl = RETURN_URL;
  return paynow;
}

function uniqueReference() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// Shared polling loop used by both payment methods. Resolves once the
// transaction reaches a terminal state, or after a fixed number of polls
// so the UI never hangs forever on a stuck transaction.
function pollUntilSettled(
  paynow: any,
  pollUrl: string,
  setPaymentUpdate: (status: string) => void,
  maxPolls = 20 // ~20 * 8s = ~2.5 min ceiling
): Promise<PaymentResult> {
  return new Promise((resolve) => {
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts += 1;

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Payment polling timed out after 15 seconds')), 15000);
        });

        const pollPromise = (async () => {
          const status = await paynow.pollTransaction(pollUrl);
          console.log('PAYNOW POLL STATUS:', status);
          setPaymentUpdate(`Payment Status: ${status.status}`);

          if (status.status === 'paid') {
            clearInterval(pollInterval);
            setPaymentUpdate('✅ Payment Successful');
            ToastAndroid.show('Payment Complete!', ToastAndroid.SHORT);
            resolve({ success: true, message: 'Payment complete' });
          } else if (status.status === 'cancelled') {
            clearInterval(pollInterval);
            setPaymentUpdate('❌ User Cancelled Payment');
            resolve({ success: false, message: 'User cancelled payment' });
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setPaymentUpdate('❌ Payment Failed (e.g. insufficient balance)');
            resolve({ success: false, message: 'Payment failed (e.g. insufficient balance)' });
          } else if (status.status === 'awaiting delivery' || status.status === 'sent') {
            setPaymentUpdate('⌛ Waiting for confirmation...');
          }
        })();

        await Promise.race([pollPromise, timeoutPromise]);
      } catch (pollError) {
        console.error('Payment polling error:', pollError);
        clearInterval(pollInterval);
        setPaymentUpdate('⚠️ Polling Error.');
        resolve({ success: false, message: 'Polling error' });
      }

      if (attempts >= maxPolls) {
        clearInterval(pollInterval);
        setPaymentUpdate('⚠️ Payment timed out. Please check your Ecocash/card statement.');
        resolve({ success: false, message: 'Polling timed out' });
      }
    }, 8000);
  });
}

/**
 * Ecocash mobile money payment (unchanged behaviour from the original
 * handleMakePayment, just renamed for clarity and reusing pollUntilSettled).
 */
export async function handleEcocashPayment(
  amount: number,
  paymentPurpose: string,
  setPaymentUpdate: (status: string) => void,
  phoneNumber: string
): Promise<PaymentResult> {
  const paynow = makePaynow();
  const payment = paynow.createPayment(`${uniqueReference()}r`, 'kelvinyaya8@gmail.com');
  payment.add(paymentPurpose, amount);

  try {
    setPaymentUpdate('📡 Initiating payment...');
    const response = await paynow.sendMobile(payment, phoneNumber, 'ecocash');

    if (!response.success) {
      setPaymentUpdate(`❌ Error: ${response.error}`);
      return { success: false, message: response.error || 'Payment request failed' };
    }

    setPaymentUpdate('⏳ Payment initiated! Waiting for confirmation...');
    return await pollUntilSettled(paynow, response.pollUrl, setPaymentUpdate);
  } catch (error: any) {
    setPaymentUpdate('Payment Error.');
    return { success: false, message: error.message || 'Payment error' };
  }
}

/**
 * Card payment (Visa/Mastercard) via Paynow's hosted checkout. Opens the
 * secure redirect URL in the device browser, then polls for settlement.
 * Note: since the checkout happens outside the app, prompt the user to
 * return to the app once they've completed payment before polling starts
 * (the modal below already accounts for this with a "I've paid" step).
 */
export async function handleCardPayment(
  amount: number,
  paymentPurpose: string,
  setPaymentUpdate: (status: string) => void
): Promise<PaymentResult & { redirectUrl?: string; pollUrl?: string }> {
  const paynow = makePaynow();
  const payment = paynow.createPayment(`${uniqueReference()}r`, 'kelvinyaya8@gmail.com');
  payment.add(paymentPurpose, amount);

  try {
    setPaymentUpdate('📡 Preparing secure checkout...');
    const response = await paynow.send(payment);

    if (!response.success) {
      setPaymentUpdate(`❌ Error: ${response.error}`);
      return { success: false, message: response.error || 'Payment request failed' };
    }

    const opened = await Linking.canOpenURL(response.redirectUrl);
    if (opened) {
      await Linking.openURL(response.redirectUrl);
    }

    setPaymentUpdate('⏳ Complete payment in the browser, then return to the app...');
    return { success: true, message: 'Redirected to checkout', redirectUrl: response.redirectUrl, pollUrl: response.pollUrl };
  } catch (error: any) {
    setPaymentUpdate('Payment Error.');
    return { success: false, message: error.message || 'Payment error' };
  }
}

/**
 * Call this once the user confirms they've completed the card checkout
 * (e.g. tapping an "I've paid" button after returning from the browser).
 */
export async function confirmCardPayment(
  pollUrl: string,
  setPaymentUpdate: (status: string) => void
): Promise<PaymentResult> {
  const paynow = makePaynow();
  return pollUntilSettled(paynow, pollUrl, setPaymentUpdate);
}
