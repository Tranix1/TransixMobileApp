import { ActivityIndicator, StyleSheet, Text, TouchableHighlight, TouchableHighlightProps, TouchableNativeFeedback, useColorScheme, View } from 'react-native'
import React from 'react'
import { ThemedText } from './ThemedText'
import { green } from 'react-native-reanimated/lib/typescript/Colors'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { TouchableNativeFeedbackProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export type buttonProps = TouchableNativeFeedbackProps & {
    title: string,
    type?: 'red' | 'white',
    containerStyles?: {},
    shadow?: boolean,
    loading?: boolean,
    Icon?: React.ReactElement,
    colors?: {
        bg?: string,
        text?: string
    }
}

const Button = ({
    title = 'Button',
    type = 'white',
    shadow = false,
    loading = false,
    style,
    Icon,
    colors,
    onPress,
    ...rest
}: buttonProps & { onPress?: () => void } ) => {

    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const accentlight = useThemeColor('accentlight');
    const colorscheme = useColorScheme();

    return (
        <View style={[{ overflow: 'hidden', borderRadius: wp(3) }, shadow ? styles.shadow : undefined]}>
            <TouchableNativeFeedback  {...rest} disabled={loading} onPress={onPress} >
                <View
                    style={[
                        styles.overall,
                        type === 'white' ? (colorscheme === 'light' ? styles.white : styles.black) : undefined,
                        type === 'red' ? [styles.green, { backgroundColor: accent }] : undefined,
                        shadow ? styles.shadow : undefined,
                        colors?.bg ? { backgroundColor: colors.bg } : undefined,

                        style,
                    ]}
                    {...rest}
                >
                    <View style={{ flexDirection: 'row', gap: wp(1), justifyContent: 'center', position: 'relative', flex: 1 }}>

                        <ThemedText type='defaultSemiBold'
                            style={[{ verticalAlign: 'middle', textAlign: 'center' },
                            type === 'white' ? { color: '#0f9d58' } : undefined,
                            type === 'red' ? { color: 'white' } : undefined,
                            colors?.text ? { color: colors.text } : undefined,
                            !Icon && { flex: 1 }
                            ]}>
                            {title}
                        </ThemedText>

                        {Icon &&
                            Icon
                        }
                        {loading &&
                            <ActivityIndicator style={{ position: 'absolute', right: 0 }} color={type === 'white' ? '#0f9d58' : 'white'} />
                        }
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};


export default Button

const styles = StyleSheet.create({
    overall: {
        padding: wp(3),
        // width: '98%',
        alignItems: 'center',
        // borderRadius: wp(4)

    },
    green: {

    },
    white: {
        backgroundColor: '#f1f1f1',
    }, black: {
        backgroundColor: '#424242',
    }
    , shadow: {
        elevation: 12,
        shadowColor: '#0c0c0c69'
        // shadowColor: '#4747475e'
    }
})