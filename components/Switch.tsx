import { hp, wp } from '@/constants/common';
import React from 'react';
import {
    Pressable,
    SafeAreaView,
    View,
    StyleSheet,
    Button,
} from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';

interface SwitchProps {
    value: Animated.SharedValue<number>; // Accepting SharedValue<number> directly
    onPress: () => void;
    style?: object;
    duration?: number;
    trackColors?: { on: string; off: string };
}

const Switch = ({
    value,
    onPress,
    style,
    duration = 400,
    trackColors = { on: '#82cab2', off: Colors.dark.coolGray },
}: SwitchProps): React.JSX.Element => {
    const height = useSharedValue(0);
    const width = useSharedValue(0);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            value.value,
            [0, 1],
            [trackColors.off, trackColors.on]
        );
        const colorValue = withTiming(color, { duration });

        return {
            backgroundColor: colorValue,
            borderRadius: height.value / 2,
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(
            Number(value.value),
            [0, 1],
            [0, width.value - height.value]
        );
        const translateValue = withTiming(moveValue, { duration });

        return {
            transform: [{ translateX: translateValue }],
            borderRadius: height.value / 2,
        };
    });

    return (
        <Pressable onPress={onPress}>
            <Animated.View
                onLayout={(e) => {
                    height.value = e.nativeEvent.layout.height;
                    width.value = e.nativeEvent.layout.width;
                }}
                style={[switchStyles.track, style, trackAnimatedStyle]}>
                <Animated.View
                    style={[switchStyles.thumb, thumbAnimatedStyle]}></Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const switchStyles = StyleSheet.create({
    track: {
        alignItems: 'flex-start',
        width: 100,
        height: 40,
        padding: 5,
    },
    thumb: {
        height: '100%',
        aspectRatio: 1,
        backgroundColor: 'white',
    },
});

export default function SwithComponent({ title = '', value = false, handlePress = () => { } }) {
    const sharedValue = useSharedValue(value ? 1 : 0);


    return (
        <View style={styles.container}>
            <ThemedText type='subtitle' style={{ flex: 1, }}>
                {title}
            </ThemedText>
            <Switch value={sharedValue} onPress={() => {
                sharedValue.value = sharedValue.value === 1 ? 0 : 1;
                handlePress();
            }} style={styles.switch} />

        </View>
    );
}

const styles = StyleSheet.create({
    switch: {
        width: hp(8),
        height: hp(4),
        padding: 10,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: wp(2),

    },

});