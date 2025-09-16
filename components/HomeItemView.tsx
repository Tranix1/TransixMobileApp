import React from 'react';
import { View, useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import Button from './Button';
import { StyleSheet } from 'react-native';

interface HomeItemProps {
    topic: string;
    description: string;
    mainColor: string;
    icon?: string; // legacy, not used anymore
    iconElement?: React.ReactNode;
    buttonTitle: string;
    btnBackground: string;
    btnPressValue: () => void;
    isAvaialble: boolean;
}

const HomeItemView: React.FC<HomeItemProps> = ({
    topic, description, mainColor, btnBackground, iconElement, buttonTitle, isAvaialble, btnPressValue
}) => {
    const colorScheme = useColorScheme();

    return (
        <View style={[styles.homefeature, { borderColor: mainColor, backgroundColor: colorScheme === 'light' ? '#fff' : '#000', overflow: 'hidden', }]}>
            {!isAvaialble &&
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: '125%', alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'light' ? 'rgba(255, 255, 255, 0.6)' : "rgba(0, 0, 0, 0.6)" }}>
                    <ThemedText type='defaultSemiBold'> Coming Soon  </ThemedText>
                    <Ionicons name='time-outline' size={wp(6)} color={colorScheme === 'light' ? "black" : "white"} />
                </View>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                <View style={{ backgroundColor: mainColor, borderRadius: wp(2), padding: wp(1.5) }}>
                    {iconElement ? iconElement : <Octicons name='verified' color={'#fff'} size={wp(4)} />}
                </View>
                <ThemedText type='subtitle' color={mainColor} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                    {topic}
                </ThemedText>
            </View>

            <View>
                <ThemedText
                    type='default'
                    numberOfLines={0}
                    style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}
                >
                    {description}
                </ThemedText>
            </View>

            <Button
                onPress={btnPressValue}
                colors={{ text: mainColor, bg: btnBackground }}
                title={buttonTitle} // ✅ Dynamic title
                Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={mainColor} />} />
        </View>
    );
}

export default HomeItemView;

const styles = StyleSheet.create({
    homefeature: {
        padding: wp(4),
        gap: wp(2),
        marginBottom: wp(4),
        borderWidth: 0.5,
        borderRadius: 8,
        shadowColor: "#0f9d58",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
        elevation: 6
    }
});
