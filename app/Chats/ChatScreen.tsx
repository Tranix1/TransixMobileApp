import React, { useEffect, useState, useRef } from "react";
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { db } from "@/db/fireBaseConfig";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { readById } from "@/db/operations";
import { hp, wp } from "@/constants/common";

export default function ChatScreen() {
    const params = useLocalSearchParams();
    const chatId = (params as any)?.chatId as string | undefined;
    const { user } = useAuth();
    const router = useRouter();

    const background = useThemeColor("background");
    const accent = useThemeColor("accent");
    const inputBg = useThemeColor("backgroundLight");
    const textColor = useThemeColor("text");

    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState("");
    const [otherProfile, setOtherProfile] = useState<any>(null);
    const flatRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!chatId) return;

        let unsubscribe = () => {};

        const loadChat = async () => {
            try {
                const chatRef = doc(db, "chats", chatId);
                const chatSnap = await getDoc(chatRef);
                const data = chatSnap.exists() ? (chatSnap.data() as any) : null;
                const participants: string[] = Array.isArray(data?.participants)
                    ? data.participants
                    : chatId.split("_");
                const otherId = participants.find((id) => id !== user?.uid);

                if (otherId) {
                    const profile = await readById("personalData", otherId);
                    setOtherProfile(profile || null);
                }

                const messagesRef = collection(db, "chats", chatId, "messages");
                const q = query(messagesRef, orderBy("timeStamp", "asc"));
                unsubscribe = onSnapshot(q, (snap) => {
                    const msgs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
                    setMessages(msgs);
                    setLoading(false);
                    setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 150);
                });
            } catch (error) {
                console.error("Chat load error", error);
                setLoading(false);
            }
        };

        loadChat();

        return () => {
            unsubscribe();
        };
    }, [chatId, user?.uid]);

    const sendMessage = async () => {
        if (!chatId || !messageText.trim() || !user?.uid) return;
        const text = messageText.trim();
        setMessageText("");

        try {
            const messagesRef = collection(db, "chats", chatId, "messages");
            await addDoc(messagesRef, {
                senderId: user.uid,
                text,
                timeStamp: serverTimestamp(),
                type: "text",
            });

            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?.uid;
        return (
            <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
                <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft, { backgroundColor: isMe ? accent : inputBg }]}>
                    <Text style={{ color: textColor }}>{item.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: background, position: 'relative' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText type="defaultSemiBold">Back</ThemedText>
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold">{otherProfile?.fullName || otherProfile?.displayName || "Chat"}</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: hp(6) }} />
            ) : (
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={(m) => m.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: wp(3), paddingBottom: wp(20) }}
                    style={{ flex: 1 }}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={90}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
            >
                <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
                    <TextInput
                        value={messageText}
                        onChangeText={setMessageText}
                        placeholder="Type a message"
                        style={[styles.input, { color: textColor }]}
                    />
                    <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: accent }]}>
                        <ThemedText type="defaultSemiBold" style={{ color: "white" }}>Send</ThemedText>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: hp(7), flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wp(3) },
    messageRow: { marginVertical: wp(1) },
    messageRowLeft: { alignItems: "flex-start" },
    messageRowRight: { alignItems: "flex-end" },
    bubble: { maxWidth: "80%", padding: wp(3), borderRadius: wp(3) },
    bubbleLeft: { borderTopLeftRadius: 4 },
    bubbleRight: { borderTopRightRadius: 4 },
    inputRow: { flexDirection: "row", padding: wp(2), alignItems: "center" },
    input: { flex: 1, height: hp(5), paddingHorizontal: wp(3), fontSize: wp(3.6) },
    sendBtn: { paddingHorizontal: wp(4), paddingVertical: wp(2), borderRadius: wp(2), marginLeft: wp(2) },
});