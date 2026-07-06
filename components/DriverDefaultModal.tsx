import React, { useEffect, useState } from "react";
import {
    View,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Pressable,
    StyleSheet,
} from "react-native";

import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

import { ThemedText } from "@/components/ThemedText";
import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/useThemeColor";
import { wp, hp } from "@/constants/common";

type Props = {
    visible: boolean;
    onClose: () => void;
    fleetId: string;
    truckId: string;
    onAssigned?: (driver: any) => void;
};

export default function DriverDefaultModal({
    visible,
    onClose,
    fleetId,
    truckId,
    onAssigned,
}: Props) {

    const accent = useThemeColor("accent");
    const backgroundLight = useThemeColor("backgroundLight");
    const icon = useThemeColor("icon");
    const coolGray = useThemeColor("coolGray");

    const [staff, setStaff] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        if (visible) loadStaff();
    }, [visible]);

    // 🔥 LOAD FROM STAFF COLLECTION (YOUR SYSTEM)
    const loadStaff = async () => {
        setLoading(true);

        try {
            const q = query(
                collection(db, "staff"),
                where("fleetId", "==", fleetId),
                where("role", "==", "driver") // IMPORTANT reuse role system
            );

            const snap = await getDocs(q);

            const list: any[] = [];

            snap.forEach((d) => {
                const data = d.data();

                // ❌ ONLY drivers NOT already default on another truck
                if (!data.defaultTruckId || data.defaultTruckId === truckId) {
                    list.push({ id: d.id, ...data });
                }
            });

            setStaff(list);
            setFiltered(list);
        } catch (err) {
            console.log("staff load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);

        const filteredData = staff.filter((d) =>
            d.name?.toLowerCase().includes(text.toLowerCase())
        );

        setFiltered(filteredData);
    };

    // 🔥 ASSIGN DRIVER TO TRUCK (DEFAULT DRIVER LOGIC)
    const setDefaultDriver = async () => {
        if (!selected) return;

        try {
            await updateDoc(doc(db, "staff", selected.id), {
                defaultTruckId: truckId,
            });

            onAssigned?.(selected);
            onClose();
        } catch (err) {
            console.log("assign error:", err);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">

            <Pressable style={styles.overlay} onPress={onClose}>
                <BlurView intensity={80} style={styles.blur}>

                    <Pressable
                        style={[styles.modal, { backgroundColor: backgroundLight }]}
                        onPress={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <View style={styles.header}>
                            <ThemedText type="title">Default Driver</ThemedText>

                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close-circle" size={26} color={icon} />
                            </TouchableOpacity>
                        </View>

                        {/* SEARCH */}
                        <Input
                            placeholder="Search driver..."
                            value={search}
                            onChangeText={handleSearch}
                        />

                        {/* LIST */}
                        {loading ? (
                            <ActivityIndicator style={{ marginTop: wp(5) }} />
                        ) : (
                            <FlatList
                                data={filtered}
                                keyExtractor={(i) => i.id}
                                showsVerticalScrollIndicator={false}
                                style={{ marginTop: wp(3) }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setSelected(item)}
                                        style={[
                                            styles.card,
                                            {
                                                borderColor:
                                                    selected?.id === item.id
                                                        ? accent
                                                        : coolGray,
                                                borderWidth:
                                                    selected?.id === item.id ? 2 : 1,
                                            },
                                        ]}
                                    >

                                        <Ionicons
                                            name="person-circle-outline"
                                            size={28}
                                            color={accent}
                                        />

                                        <View style={{ flex: 1, marginLeft: wp(3) }}>
                                            <ThemedText type="subtitle">
                                                {item.name}
                                            </ThemedText>

                                            <ThemedText style={{ opacity: 0.6 }}>
                                                Driver
                                            </ThemedText>
                                        </View>

                                        {selected?.id === item.id && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={22}
                                                color={accent}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {/* CONFIRM */}
                        <TouchableOpacity
                            disabled={!selected}
                            onPress={setDefaultDriver}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: selected ? accent : coolGray,
                                },
                            ]}
                        >
                            <ThemedText style={{ color: "white", fontWeight: "600" }}>
                                Set Default Driver
                            </ThemedText>
                        </TouchableOpacity>

                    </Pressable>

                </BlurView>
            </Pressable>

        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },

    blur: {
        flex: 1,
        justifyContent: "flex-end",
    },

    modal: {
        width: "100%",
        height: hp(65),
        borderTopLeftRadius: wp(6),
        borderTopRightRadius: wp(6),
        padding: wp(4),
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: wp(3),
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(3),
        borderRadius: wp(3),
        marginBottom: wp(2),
    },

    button: {
        marginTop: wp(3),
        padding: wp(4),
        borderRadius: wp(3),
        alignItems: "center",
    },
});