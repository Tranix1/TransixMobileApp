import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { DropDownItem } from "@/components/DropDown";
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from "@/constants/common";
import { CURRENCY_OPTIONS, MODEL_OPTIONS } from '@/Utilities/loadUtils';

interface RateInputProps {
    rate: string;
    setRate: (rate: string) => void;
    selectedCurrency: { id: number, name: string };
    setSelectedCurrency: (currency: { id: number, name: string }) => void;
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
    selectedCurrency,
    setSelectedCurrency,
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

    // Ensure we have valid setter functions
    const safeSetCurrency = setCurrency || (() => { });
    const safeSetModel = setModel || (() => { });
    const rateLabel = isReturnRate ? "Return Rate" : "Rate";
    const explanationLabel = isReturnRate ? "Return Terms" : "Explain rate";

    // Auto-sync return currency with main currency when main currency changes
    useEffect(() => {
        if (isReturnRate && selectedCurrency && safeSetCurrency) {
            safeSetCurrency(selectedCurrency);
        }
    }, [selectedCurrency, isReturnRate, safeSetCurrency]);

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
                        selectedItem={currency || { id: 0, name: '' }}
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
                        onChangeText={setRate}
                        style={{ height: 45.5 }}
                    />
                </View>
                <View style={{ width: wp(28), marginLeft: wp(2) }}>
                    <ThemedText type="defaultSemiBold">Model</ThemedText>
                    <DropDownItem
                        allData={MODEL_OPTIONS}
                        selectedItem={model || { id: 0, name: '' }}
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
