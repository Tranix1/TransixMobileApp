import { useEffect, useMemo, useRef, useState } from "react";
import { View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import CustomHeader from "@/components/CustomHeader";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { readById, updateOrCreateDocument } from "@/db/operations";
import { hp, wp } from "@/constants/common";
import UserMenuModal from "@/components/UserMenuModal";

import { doc, getDoc, setDoc, } from "firebase/firestore";

interface ChatSummary {
    id: string;
    participants?: string[];
    lastMessage?: string;
    timeStamp?: any;
    updatedAt?: any;
}

export default function ChatIndex() {
    const { user, currentRole } = useAuth();
    const background = useThemeColor("background");
    const border = useThemeColor("border");
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const router = useRouter();

    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [userCache, setUserCache] = useState<Record<string, any>>({});
    const userCacheRef = useRef<Record<string, any>>({});
    const [fleetDrivers, setFleetDrivers] = useState<any[]>([]);
    const [fleetOwner, setFleetOwner] = useState<any>(null);

    const [driversLoading, setDriversLoading] = useState(true);

    const fleetId =
        typeof currentRole === "object" && currentRole.role === "fleet"
            ? currentRole.fleetId
            : user?.fleetId ?? (Array.isArray(user?.fleets) ? user?.fleets[0]?.fleetId : undefined);

            console.log("Current Role:", currentRole);
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const chatsQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(
            chatsQuery,
            async (snapshot) => {
                const chatDocs = snapshot.docs
                    .map((docItem) => ({ id: docItem.id, ...(docItem.data() as any) }))
                    .filter((chat) => {
                        const participants = Array.isArray(chat.participants)
                            ? chat.participants
                            : chat.id.split("_");
                        return participants.includes(user.uid);
                    });

                setChats(chatDocs);
                setLoading(false);

                const newIds = new Set<string>();
                chatDocs.forEach((chat) => {
                    const participants = Array.isArray(chat.participants)
                        ? chat.participants
                        : chat.id.split("_");
                    participants.forEach((uid: string) => {
                        if (uid && uid !== user.uid && !userCacheRef.current[uid]) {
                            newIds.add(uid);
                        }
                    });
                });

                if (newIds.size > 0) {
                    const profiles = await Promise.all(
                        [...newIds].map(async (uid) => {
                            const profile = await readById("personalData", uid);
                            return { uid, profile };
                        })
                    );

                    const updatedCache = { ...userCacheRef.current };
                    profiles.forEach(({ uid, profile }) => {
                        if (profile) {
                            updatedCache[uid] = profile;
                        }
                    });

                    userCacheRef.current = updatedCache;
                    setUserCache(updatedCache);
                }
            },
            (error) => {
                console.error("Error loading chats", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    

    useEffect(() => {
        if (!fleetId) {
            setDriversLoading(false);
            return;
        }

        const fetchDrivers = async () => {
            setDriversLoading(true);
            try {
                const driversRef = collection(db, "fleets", fleetId, "Drivers");
                const querySnapshot = await getDocs(query(driversRef));
                const drivers = querySnapshot.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as any) }));
                setFleetDrivers(drivers);
            } catch (error) {
                console.error("Error fetching fleet drivers", error);
                setFleetDrivers([]);
            } finally {
                setDriversLoading(false);
            }
        };

        fetchDrivers();




const fetchFleetOwner = async () => {
  try {
    const fleetRef = doc(db, "fleets", fleetId);
    const fleetSnap = await getDoc(fleetRef);

    if (fleetSnap.exists()) {
      const data = fleetSnap.data();

      setFleetOwner({
        id: fleetSnap.id,
        ...data,
      });
    }

  } catch (error) {
    console.error("Error fetching fleet owner", error);
  }
};

fetchFleetOwner();

    }, [fleetId]);





    const startChat = async (person : { userId?: string; ownerId?: string; uid?: string; id?: string }) => {

        console.log("Starting chat with person:", person);

  if (!user?.uid) return;

  const otherUserId =
    person?.userId ??
    person?.ownerId ??
    person?.uid ??
    person?.id;

      console.log("Current:", user.uid);
  console.log("Other:", otherUserId);

  if (!otherUserId) return;

  if (otherUserId === user.uid) {
    console.log("Cannot start a chat with yourself");
    return;
  }



  const chatId = [user.uid, otherUserId]
    .sort()
    .join("_");

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      chatId,
      participants: [user.uid, otherUserId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: null,
      type: "direct",
    });
  }

  router.push({
    pathname: "/Chats/ChatScreen",
    params: { chatId },
  });
};








  
    const [dspMenu, setDspMenu] = useState(false);

    

    return (
        <View style={[styles.wrapper, { backgroundColor: background }]}>
             <UserMenuModal
                            visible={dspMenu}
                            onClose={() => setDspMenu(false)}
                            user={user}
                            onProfileUpdate={() => {}}
                        />
            <CustomHeader pageTitle="Chats" onPressMenu={() => setDspMenu(true)} />

            <View style={[styles.searchContainer, { borderColor: border, backgroundColor: background }]}>
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search chats"
                    placeholderTextColor={icon + "99"}
                    style={[styles.searchInput, { color: useThemeColor("text"), borderColor: border }]}
                />
            </View>





          <FlatList
                            data={[
  fleetOwner,
  ...(fleetDrivers || [])
].filter(Boolean)}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.driverItem, { borderColor: icon, backgroundColor: background }]}
                                    onPress={() => startChat(item)}
                                >
                              <ThemedText> {item.fullName || "Unnamed Driver"} </ThemedText>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingTop: wp(4) }}
                            showsVerticalScrollIndicator={false}
                        />


        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    searchContainer: {
        marginHorizontal: wp(3),
        marginVertical: wp(3),
        borderWidth: 1,
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
    },
    searchInput: {
        height: hp(6),
        fontFamily: "sfregular",
        fontSize: wp(4),
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        marginBottom: wp(3),
    },
    chatLeading: {
        marginRight: wp(3),
    },
    avatar: {
        height: wp(14),
        width: wp(14),
        borderRadius: wp(14) / 2,
        justifyContent: "center",
        alignItems: "center",
    },
    chatBody: {
        flex: 1,
    },
    driverItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        marginTop: wp(3),
    },
    driverBody: {
        flex: 1,
        marginLeft: wp(3),
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: wp(6),
    },
});
