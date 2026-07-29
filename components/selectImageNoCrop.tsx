import React from "react";
import {
    View,
    Modal,
    Image,
    TouchableOpacity,
    ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "./ThemedText";
import { wp } from "@/constants/common";
import { useThemeColor } from "@/hooks/useThemeColor";
import { updateDocument, uploadImage } from "@/db/operations";
import { useAuth } from "@/context/AuthContext";
import AccentRingLoader from "./AccentRingLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
    visible: boolean;
    image: any;
    onClose: () => void;
    onChangeImage: () => void;
}


export default function ProfileImageModal({
    visible,
    image,
    onClose,
    onChangeImage,
}: Props) {

    const background = useThemeColor("background");
    const text = useThemeColor("text");
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const [uploadingImageUpdate, setUploadImageUpdate] = React.useState("")
    const { currentRole } = useAuth();
    const [loading, setLoading] = React.useState(false)
console.log(typeof image, )


    async function onSave() {

        try {

            setLoading(true)
            const imagelogo = await uploadImage(image, "Profiles", setUploadImageUpdate, "Profile Image")

            if (!currentRole.organizationId) return

            const accTypeDB = currentRole.accType === "fleet" ? "fleets" : currentRole.accType === "brokerage" ? "brokerages" : currentRole.accType === "driver" ? "drivers" : ""


            if(currentRole.userRole !== "create_Acc"){


            await updateDocument("organizationProfiles", currentRole.organizationId, {
                profilePhoto: imagelogo ? imagelogo || undefined : currentRole.profilePhoto || null,

            })

            await updateDocument("verifiedUsers", currentRole.organizationId, {
                profilePhoto: imagelogo ? imagelogo || undefined : currentRole.profilePhoto || null,

            })

            await updateDocument(accTypeDB, currentRole.organizationId, {
                profilePhoto: imagelogo ? imagelogo || undefined : currentRole.profilePhoto || null,

            })
            }


            const currentRoleAccType = {
                ...currentRole,

                profilePhoto: imagelogo ? imagelogo || undefined : currentRole.profilePhoto || null,

            };
            

            await AsyncStorage.setItem(
                "currentRole",
                JSON.stringify(currentRoleAccType)
            );


            ToastAndroid.show("Profile Added successfully", ToastAndroid.SHORT);
            onClose()
            setLoading(false)

        } catch (e) {
            console.error(e)
            setLoading(false)

        }

    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >

            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                {loading && <View style={{ alignSelf: "center", padding: 5 }}>
                    <AccentRingLoader color={accent} size={32} dotSize={6} />

                </View>}

                <View
                    style={{
                        width: wp(85),
                        backgroundColor: background,
                        borderRadius: wp(5),
                        padding: wp(5),
                        alignItems: "center"
                    }}
                >

                    <ThemedText
                        type="title"
                        style={{
                            marginBottom: wp(5)
                        }}
                    >
                        Profile Photo
                    </ThemedText>


                    <View
                        style={{
                            width: wp(35),
                            height: wp(35),
                            borderRadius: wp(17.5),
                            overflow: "hidden",
                            borderWidth: 2,
                            borderColor: accent,
                            marginBottom: wp(5)
                        }}
                    >

                        {image ? (
                            <Image
                                source={{
                                    uri: image.uri
                                }}
                                style={{
                                    width: "100%",
                                    height: "100%"
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                <Ionicons
                                    name="person"
                                    size={wp(12)}
                                    color={icon}
                                />
                            </View>
                        )}

                    </View>


                    <TouchableOpacity
                        onPress={onChangeImage}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: wp(2),
                            marginBottom: wp(3)
                        }}
                    >

                        <Ionicons
                            name="image-outline"
                            size={wp(5)}
                            color={accent}
                        />

                        <ThemedText
                            style={{
                                marginLeft: wp(2),
                                color: accent
                            }}
                        >
                            Change Image
                        </ThemedText>

                    </TouchableOpacity>


                    <TouchableOpacity
                        onPress={onSave}
                        style={{
                            width: "100%",
                            backgroundColor: accent,
                            paddingVertical: wp(3),
                            borderRadius: wp(4),
                            alignItems: "center"
                        }}
                        disabled={loading}
                    >

                        <ThemedText
                            style={{
                                color: "#fff",
                                fontWeight: "bold"
                            }}
                        >
                            Save Image
                        </ThemedText>

                    </TouchableOpacity>


                </View>

            </View>

        </Modal>
    );
}