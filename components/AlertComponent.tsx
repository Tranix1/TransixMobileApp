import { BackHandler, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableHighlight, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { ThemedText } from './ThemedText'
import { hp, wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import Divider from './Divider';
import { MaterialIcons, Octicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';

export type alertProps = {
    title: string,
    message: string,
    visible: boolean,
    buttons?: Alertbutton[]
    type?: 'default' | 'error' | 'success' | 'laoding' | 'destructive';
    onBackPress: () => void;
};


export type Alertbutton = {
    title: string,
    onPress: ((value?: string) => void);
}
const AlertComponent = ({ title, message, buttons, type, visible, onBackPress = () => { } }: alertProps) => {

    const [isVisible, setIsVisible] = useState(visible);



    const background = useThemeColor('background')
    const backgroundLight = useThemeColor('backgroundLight')
    const icon = useThemeColor('icon') + '4d'
    const iconog = useThemeColor('icon')



    const hide = () => {
        setIsVisible(false)
        onBackPress()
        return false;
    }

    useFocusEffect(
        React.useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', hide);
            return () => BackHandler.removeEventListener('hardwareBackPress', hide);
        }, [])
    );
    return (
        <SafeAreaView>
            <Modal statusBarTranslucent visible={isVisible} transparent animationType='fade'>
                <Pressable onPressIn={() => hide()} style={{ flex: 1 }}>
                    <BlurView intensity={10} tint='systemMaterialDark' experimentalBlurMethod='dimezisBlurView' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', flex: 1, padding: wp(6), }}>

                        <View style={{ backgroundColor: background, padding: wp(3), borderRadius: wp(4), gap: wp(2), }}>
                            <ThemedText type='subtitle' style={{ textAlign: 'center', color: type === 'destructive' ? '#ee1133' : iconog }}>
                                {title}
                            </ThemedText>
                            <ThemedText style={{ textAlign: 'center' }} type='default'>
                                {message}
                            </ThemedText>


                            <View style={{ borderTopWidth: .5, borderColor: backgroundLight, marginTop: wp(3) }}>

                                <View style={[buttons?.length === 1 ? { flexDirection: 'row' } : { flexDirection: 'column' }, { marginTop: wp(2), justifyContent: 'space-evenly', gap: wp(2), }]}>
                                    <View style={buttons?.length === 1 && { flex: 1 }}>

                                        <TouchableNativeFeedback onPress={() => hide()}>
                                            <View style={[{ alignItems: 'center', padding: wp(3), borderRadius: wp(2), }]}>
                                                <ThemedText type='defaultSemiBold'>
                                                    {!buttons ?
                                                        'OK' : 'Cancel'
                                                    }
                                                </ThemedText>
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>

                                    {buttons?.length === 1 &&
                                        <View style={{ borderWidth: .3, borderColor: backgroundLight }}></View>
                                    }
                                    {buttons?.map((button, index) =>
                                        <View key={index} style={[buttons?.length === 1 ? { flex: 1 } : { borderTopWidth: .5, borderColor: backgroundLight, paddingTop: wp(1.4), }]}>

                                            <TouchableNativeFeedback onPress={() => {
                                                hide();
                                                button.onPress()
                                            }}>
                                                <View style={[{ alignItems: 'center', padding: wp(3), borderRadius: wp(2) }]} >

                                                    <ThemedText type='defaultSemiBold'>
                                                        {button.title}
                                                    </ThemedText>
                                                </View>

                                            </TouchableNativeFeedback>
                                        </View>

                                    )}

                                </View>
                            </View>
                        </View>
                    </BlurView>

                </Pressable>
            </Modal>
        </SafeAreaView>

    )
}


export default AlertComponent

const styles = StyleSheet.create({})