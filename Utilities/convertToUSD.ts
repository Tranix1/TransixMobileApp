import AsyncStorage from "@react-native-async-storage/async-storage";

const EXCHANGE_RATE_KEY = "usd_exchange_rate";
const EXCHANGE_RATE_DATE_KEY = "usd_exchange_rate_date";

async function getZARToUSDRate(): Promise<number> {
    try {
        const today = new Date().toDateString();

        const savedDate = await AsyncStorage.getItem(EXCHANGE_RATE_DATE_KEY);
        const savedRate = await AsyncStorage.getItem(EXCHANGE_RATE_KEY);

        // Use cached rate if it was fetched today
        if (savedDate === today && savedRate) {
            return Number(savedRate);
        }

        // Fetch a fresh rate
        const response = await fetch(
            "https://open.er-api.com/v6/latest/ZAR"
        );

        const data = await response.json();

        const rate = Number(data.rates.USD);

        // Save for the rest of the day
        await AsyncStorage.multiSet([
            [EXCHANGE_RATE_KEY, rate.toString()],
            [EXCHANGE_RATE_DATE_KEY, today],
        ]);

        return rate;
    } catch (error) {
        console.log("Failed to fetch exchange rate:", error);

        // Fallback to last saved rate
        const savedRate = await AsyncStorage.getItem(EXCHANGE_RATE_KEY);

        if (savedRate) {
            return Number(savedRate);
        }

        // Final fallback if nothing is stored
        return 0.055;
    }
}

export async function convertToUSD(
    amount: number,
    currency: string
): Promise<number> {

    if (currency === "USD") {
        return amount;
    }

    if (currency === "ZAR") {
        const rate = await getZARToUSDRate();
        return amount * rate;
    }

    return amount;
}