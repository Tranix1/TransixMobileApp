import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { DropDownItem } from "@/components/DropDown";
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from "@/constants/common";
import { CURRENCY_OPTIONS, MODEL_OPTIONS } from '@/Utilities/loadUtils';
import { calculateRatePerKm } from '@/Utilities/calculateRatePerKm';
import { convertToUSD } from '@/Utilities/convertToUSD';

interface RateInputProps {
    rate: string;
    setRate: (rate: string) => void;
    distance: string;
    selectedCurrency: { id: number, name: string };
    setSelectedCurrency: (currency: { id: number, name: string }) => void;
    ratePerKm : number
    setRatePerKm :(rate: number) => void;
    selectedModelType: { id: number, name: string };
    setSelectedModelType: (model: { id: number, name: string }) => void;
    rateExplanation: string;
    setRateExplanation: (explanation: string) => void;
    isReturnRate?: boolean;
    // Support both naming conventions for backward compatibility
    returnCurrency?: { id: number, name: string };
    setReturnCurrency?: (currency: { id: number, name: string }) => void;
    returnModelType?: { id: number, name: string };
    setReturnModelType?: (model: { id: number, name: string }) => void;
    // New naming convention used in AddLoads
    selectedReturnCurrency?: { id: number, name: string };
    setSelectedReturnCurrency?: (currency: { id: number, name: string }) => void;
    selectedReturnModelType?: { id: number, name: string };
    setSelectedReturnModelType?: (model: { id: number, name: string }) => void;
}

export const RateInput: React.FC<RateInputProps> = ({
    rate,
    setRate,
    distance,
    selectedCurrency,
    setSelectedCurrency,
    ratePerKm ,
    setRatePerKm ,
    selectedModelType,
    setSelectedModelType,
    rateExplanation,
    setRateExplanation,
    isReturnRate = false,
    returnCurrency,
    setReturnCurrency,
    returnModelType,
    setReturnModelType,
    selectedReturnCurrency,
    setSelectedReturnCurrency,
    selectedReturnModelType,
    setSelectedReturnModelType
}) => {
    // Handle both naming conventions for backward compatibility
    const currency = isReturnRate ? (returnCurrency || selectedReturnCurrency) : selectedCurrency;
    const setCurrency = isReturnRate ? (setReturnCurrency || setSelectedReturnCurrency) : setSelectedCurrency;
    const model = isReturnRate ? (returnModelType || selectedReturnModelType) : selectedModelType;
    const setModel = isReturnRate ? (setReturnModelType || setSelectedReturnModelType) : setSelectedModelType;

    
    const handleRateChange = async (value: string) => {
        setRate(value);

        const usdPrice = await convertToUSD(
            Number(value),
            selectedCurrency.name
        );

        const calculatedRate = calculateRatePerKm(
            usdPrice,
            distance
        );

        setRatePerKm(calculatedRate);
    };

    // Ensure we have valid setter functions
    const safeSetCurrency = setCurrency || (() => { });
    const safeSetModel = setModel || (() => { });
    const rateLabel = isReturnRate ? "Return Price" : "Price";
    const explanationLabel = isReturnRate ? "Return Terms" : "Explain rate";

    // Ensure currency and model have valid defaults
    const safeCurrency = currency && currency.id && currency.name ? currency : { id: 1, name: 'USD' };
    const safeModel = model && model.id && model.name ? model : { id: 1, name: 'Solid' };



    // Auto-sync return currency with main currency when main currency changes
    useEffect(() => {
        if (isReturnRate && selectedCurrency && safeSetCurrency) {
            safeSetCurrency(selectedCurrency);
        }
    }, [selectedCurrency, isReturnRate, safeSetCurrency]);

    // Ensure return currency and model are properly initialized
    useEffect(() => {
        if (isReturnRate) {
            if (!currency || !currency.id || !currency.name) {
                safeSetCurrency({ id: 1, name: 'USD' });
            }
            if (!model || !model.id || !model.name) {
                safeSetModel({ id: 1, name: 'Solid' });
            }
        }
    }, [isReturnRate, currency, model, safeSetCurrency, safeSetModel]);

    return (
        <View>
            <ThemedText>
                {rateLabel} <ThemedText color="red">*</ThemedText>
            </ThemedText>

            <View style={styles.row}>
                <View style={{ width: wp(27.5), marginRight: wp(2) }}>
                    <ThemedText type="defaultSemiBold">Currency</ThemedText>
                    <DropDownItem
                        allData={CURRENCY_OPTIONS}
                        selectedItem={safeCurrency}
                        setSelectedItem={safeSetCurrency}
                        placeholder=""
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
                        {rateLabel}
                    </ThemedText>
                    <Input
                        value={rate}
                        onChangeText={handleRateChange}
                        style={{ height: 45.5 }}
                        keyboardType='numeric'
                    />


                    <View style={{ flexDirection: "row", alignItems: "center", position:"absolute", left :-17, bottom:-7 ,  }}>
                        <ThemedText
                            style={{
                                fontSize: 12,
                                fontWeight: "500",
                                marginRight: 6,
                            }}
                        >
                            Calc: price ÷ (distance × 2)
                        </ThemedText>

                        <ThemedText
                            style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color:
                                    ratePerKm < 2
                                        ? '#EF4444'
                                        : ratePerKm < 2.5
                                            ? '#EAB308'
                                            : '#22C55E',
                            }}
                        >
                            ${ratePerKm.toFixed(2)}/km
                        </ThemedText>
                    </View>

                </View>
                <View style={{ width: wp(28), marginLeft: wp(2) }}>
                    <ThemedText type="defaultSemiBold">Model</ThemedText>
                    <DropDownItem
                        allData={MODEL_OPTIONS}
                        selectedItem={safeModel}
                        setSelectedItem={safeSetModel}
                        placeholder=""
                    />
                </View>
            </View>

            {!isReturnRate && (
                <>
                    <ThemedText>
                        {explanationLabel}
                        <ThemedText style={{ fontStyle: "italic" }}>
                            {isReturnRate ? "" : " like link and triaxle rate"}
                        </ThemedText>
                    </ThemedText>
                    <Input
                        placeholder={isReturnRate ? "Enter return terms" : "explain rate if neccesary"}
                        value={rateExplanation}
                        onChangeText={setRateExplanation}
                        style={{ height: 45.5 }}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
});
