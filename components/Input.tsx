import { ActivityIndicator, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TouchableHighlight, View, ViewProps } from 'react-native'
import React, { FunctionComponent, ReactElement, useState } from 'react'
import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { FontAwesome, Ionicons, Octicons } from '@expo/vector-icons'
import { ThemedText } from './ThemedText'

export type InputProps = TextInputProps & {
    sending?: boolean,
    loading?: boolean,
    onSend?: () => void,
    Icon?: ReactElement<any, any>
    rightItem?: ReactElement<any, any>
    containerStyles?: {},
    isPassword?: boolean,
    isDynamicwidth?: boolean,
    refcomp?: React.LegacyRef<TextInput> | undefined
}

const Input = ({
    rightItem,
    containerStyles,
    Icon,
    sending,
    loading,
    onSend,
    isPassword,
    isDynamicwidth,
    refcomp,
    ...rest
}: InputProps) => {


    const color = useThemeColor('textlight')
    const placeholder = useThemeColor('textPlaceholder')
    const icon = useThemeColor('icon')
    const accent = useThemeColor('accent')
    const accentlight = useThemeColor('accentlight')

    const [showPassword, setShowPassword] = useState(true)

    return (
        <View style={[isDynamicwidth ? { flex: 1, flexDirection: 'row', } : styles.outter, { alignItems: rest.multiline ? 'flex-end' : 'center', }]}>
            <View style={[styles.container, sending ? { width: '86%' } : { flex: 1 }, containerStyles && containerStyles]}>
                {Icon}
                <TextInput ref={refcomp} cursorColor={accent} secureTextEntry={showPassword && isPassword} passwordRules={'minlength: 6;'} editable={!loading} placeholderTextColor={icon + 'a1'} {...rest} style={[styles.input, { color }, rest.style && rest.style]} />
                {
                    isPassword &&
                    <TouchableHighlight onPress={() => setShowPassword(!showPassword)}
                        style={{
                            padding: wp(1.5), borderRadius: wp(3)
                        }}>
                        <ThemedText>
                            {showPassword ?
                                <Ionicons
                                    color={icon}
                                    name='eye-outline'
                                    size={wp(5)}
                                />
                                :
                                <Ionicons
                                    color={icon}
                                    name='eye-off-outline'
                                    size={wp(5)}
                                />
                            }

                        </ThemedText>
                    </TouchableHighlight>
                }
                {rightItem}

            </View>
            {sending &&
                <TouchableHighlight underlayColor={accentlight} disabled={loading} onPress={onSend} style={[styles.sendBTN, { backgroundColor: accent, marginBottom: rest.multiline ? wp(1) : 0 }]}>
                    {loading ?
                        <ActivityIndicator color={'white'} size={wp(3.5)} />
                        :
                        <Octicons name='paper-airplane' color={'white'} size={wp(3.5)} />
                    }
                </TouchableHighlight>
            }
        </View>
    )
}

export default Input

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontFamily: 'sfregular',
        fontSize: wp(4),
        minHeight: hp(5)

    },
    container: {
        paddingVertical: wp(1),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: wp(1),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,

    }, sendBTN: {
        padding: wp(1),
        borderRadius: wp(3.5),
        flexDirection: 'column',
        height: wp(8),
        width: wp(10),
        justifyContent: 'center',
        alignItems: 'center',
    }, outter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: wp(2),
        width: '100%'
    }
})