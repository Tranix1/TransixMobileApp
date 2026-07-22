import React from "react";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";

import Input from "./Input";
import Divider from "./Divider";

import { ThemedText } from "./ThemedText";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from "@/hooks/useThemeColor";
import { countryCodes } from "@/data/appConstants";

type Props = {
    value: string;
    onChangeText: (text: string) => void;

    countryCode: {
        id: number;
        name: string;
    };

    setCountryCode: (item: {
        id: number;
        name: string;
    }) => void;

    placeholder?: string;
    editable ?: boolean
};

export default function PhoneInput({
    value,
    onChangeText,
    countryCode,
    setCountryCode,
    placeholder = "700 000 000",
    editable ,
}: Props) {

    const background = useThemeColor("background");
    const icon = useThemeColor("icon");

    return (
        <Input
            Icon={
                <>
                    <Dropdown
                        style={{
                            width: wp(15),
                        }}

                        selectedTextStyle={{
                            fontSize: 14,
                            color: icon,
                        }}

                        data={countryCodes}

                        maxHeight={hp(60)}

                        labelField="name"

                        valueField="name"

                        placeholder="+00"

                        value={countryCode?.name}


                        itemContainerStyle={{
                            borderRadius: wp(2),
                            marginHorizontal: wp(1),
                        }}


                        activeColor={background}


                        containerStyle={{
                            borderRadius: wp(3),
                            backgroundColor: background,
                            width: wp(30),
                            borderWidth: 0,

                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 9,
                            },
                            shadowOpacity: 0.5,
                            shadowRadius: 12.35,

                            elevation: 19,

                            paddingVertical: wp(1),
                        }}


                        onChange={(item) => {
                            setCountryCode(item);
                        }}


                        renderRightIcon={() => (
                            <Ionicons
                                name="chevron-down"
                                size={wp(4)}
                                color={icon}
                            />
                        )}


                        renderItem={(item, selected) => (
                            <>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: wp(3),
                                    }}
                                >
                                    <ThemedText
                                        style={[
                                            {
                                                flex: 1,
                                                textAlign: "left",
                                            },

                                            selected && {
                                                color: "#0f9d58",
                                            },
                                        ]}
                                    >
                                        {item.name}
                                    </ThemedText>


                                    {selected && (
                                        <Ionicons
                                            color={icon}
                                            name="checkmark-outline"
                                            size={wp(5)}
                                        />
                                    )}

                                </View>

                                <Divider />
                            </>
                        )}

                    />


                    <ThemedText
                        style={{
                            marginHorizontal: wp(4),
                        }}
                    >
                        |
                    </ThemedText>

                </>
            }


            value={value}

            placeholder={placeholder}

            onChangeText={onChangeText}

            keyboardType="numeric"
            editable ={!editable}
        />
    );
}