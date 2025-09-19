import React from 'react';
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
    returnCurrency?: { id: number, name: string };
    setReturnCurrency?: (currency: { id: number, name: string }) => void;
    returnModelType?: { id: number, name: string };
    setReturnModelType?: (model: { id: number, name: string }) => void;
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
    setReturnModelType
}) => {
    const currency = isReturnRate ? returnCurrency : selectedCurrency;
    const setCurrency = isReturnRate ? setReturnCurrency : setSelectedCurrency;
    const model = isReturnRate ? returnModelType : selectedModelType;
    const setModel = isReturnRate ? setReturnModelType : setSelectedModelType;
    const rateLabel = isReturnRate ? "Return Rate" : "Rate";
    const explanationLabel = isReturnRate ? "Return Terms" : "Explain rate";

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
                        selectedItem={currency!}
                        setSelectedItem={setCurrency!}
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
                        selectedItem={model!}
                        setSelectedItem={setModel!}
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
