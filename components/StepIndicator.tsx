import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from "@/constants/common";

interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
    onStepPress: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    steps,
    currentStep,
    onStepPress
}) => {
    const accent = useThemeColor('accent');

    return (
        <View style={styles.container}>
            {steps.map((stepLabel, index) => (
                <View key={index} style={[styles.stepContainer, { flex: index > 0 ? 1 : 0 }]}>
                    {index > 0 && (
                        <View
                            style={[
                                styles.connector,
                                {
                                    borderColor: currentStep >= index ? '#0f9d58' : '#ccc',
                                }
                            ]}
                        />
                    )}
                    <TouchableOpacity onPress={() => onStepPress(index)} style={styles.stepButton}>
                        <View
                            style={[
                                styles.stepCircle,
                                {
                                    backgroundColor: currentStep >= index ? accent : '#ccc',
                                }
                            ]}
                        >
                            {currentStep > index ? (
                                <Ionicons name="checkmark" size={wp(4)} color={'white'} />
                            ) : (
                                <ThemedText style={styles.stepNumber}>{index}</ThemedText>
                            )}
                        </View>
                        <ThemedText
                            type="tiny"
                            style={[
                                styles.stepLabel,
                                {
                                    color: currentStep >= index ? '#0f9d58' : '#ccc',
                                    fontWeight: currentStep >= index ? 'bold' : 'normal',
                                }
                            ]}
                        >
                            {stepLabel}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: wp(6),
        alignItems: 'center',
    },
    stepContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    connector: {
        borderWidth: 1,
        borderRadius: wp(40),
        marginHorizontal: wp(2),
        flex: 1,
        marginBottom: wp(5),
    },
    stepButton: {
        alignItems: 'center',
    },
    stepCircle: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp(1),
    },
    stepNumber: {
        color: 'white',
        fontWeight: 'bold',
    },
    stepLabel: {
        maxWidth: wp(12),
        textAlign: 'center',
    },
});
