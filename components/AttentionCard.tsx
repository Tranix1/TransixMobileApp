import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { BRAND } from '@/constants/Colors';
import { hp, wp } from '@/constants/common';

type Props = {
    title: string;
    subtitle: string;
    count: number;

    icon: keyof typeof Ionicons.glyphMap;

    color: string;

    background: string;
    border: string;
    textlight: string;

    onPress: () => void;
};

const AttentionCard = ({
    title,
    subtitle,
    count,
    icon,
    color,
    background,
    border,
    textlight,
    onPress,
}: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: background,
                    borderColor: border,
                },
            ]}
        >
            {/* Left */}

            <View style={styles.left}>

                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor: `${color}18`,
                        },
                    ]}
                >
                    <Ionicons
                        name={icon}
                        
                        size={wp(3.8)}
                        color={color}
                    />
                </View>

                <View style={{ flex: 1 }}>

                    <ThemedText style={styles.title}>
                        {title}
                    </ThemedText>

                  <ThemedText
    type="tiny"
    numberOfLines={1}
    style={{
        color: textlight,
        fontSize: wp(2.8),
    }}
>
    {subtitle}
</ThemedText>

                </View>

            </View>

            {/* Right */}

            <View style={styles.right}>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: `${color}18`,
                        },
                    ]}
                >
                    <ThemedText
                        style={[
                            styles.badgeText,
                            {
                                color,
                            },
                        ]}
                    >
                        {count}
                    </ThemedText>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={wp(3.8)}
                    color={textlight}
                />

            </View>

        </TouchableOpacity>
    );
};

export default AttentionCard;

const styles = StyleSheet.create({

    card: {
        borderWidth: 1,
        borderRadius: 14,

        paddingVertical: hp(0.9),
        paddingHorizontal: wp(2.8),

        marginBottom: hp(0.7),

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },


    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },


    iconBox: {
        width: wp(8.5),
        height: wp(8.5),

        borderRadius: wp(2.5),

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: wp(2.2),
    },


    title: {
        fontWeight: '700',
        fontSize: wp(3.5),
    },


    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
    },


    badge: {
        minWidth: wp(6),
        height: wp(6),

        borderRadius: wp(3),

        justifyContent: 'center',
        alignItems: 'center',
    },


    badgeText: {
        fontWeight: '800',
        fontSize: wp(3),
    },

});