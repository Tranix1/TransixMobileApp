import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

type StatRowProps = {
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    textColor: string;
    accent: string;
};

export const LoadLyfCyleStatsCompent = ({
    title,
    value,
    icon,
    iconColor,
    textColor,
    accent,
}: StatRowProps) => {
    return (
        <View style={styles.loadRow}>
            <View style={styles.leftSection}>
                <Ionicons
                    name={icon}
                    size={18}
                    color={iconColor ?? accent}
                />
                <ThemedText
                    style={[styles.loadText, { color: textColor }]}
                    numberOfLines={1}
                >
                    {title}
                </ThemedText>
            </View>

            <ThemedText
                style={[styles.valueText, { color: accent }]}
            >
                {value}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    loadRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    loadText: {
        fontSize: 15,
        flexShrink: 1,
    },
    valueText: {
        fontSize: 16,
        fontWeight: "700",
        minWidth: 40,
        textAlign: "right",
    },
});