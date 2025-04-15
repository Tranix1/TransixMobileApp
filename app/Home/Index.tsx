import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { wp } from '@/constants/common'
import { Ionicons, Octicons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { useThemeColor } from '@/hooks/useThemeColor'
import Button from '@/components/Button'
import { router } from "expo-router";

const Index = () => {

    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const backgroundColor = useThemeColor('backgroundLight')
   
    return (

        <View style={{ flex: 1 }}>


            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ marginVertical: wp(4), marginHorizontal: wp(2) }}>

                {/* <View style={{ marginBottom: wp(4) }}>
                        <Button title='Go To Store' />
                    </View> */}
                <View style={[styles.homefeature, { backgroundColor }]}>
                    <View style={[{ flexDirection: 'row', gap: wp(2) }]}>
                        <Ionicons name='reader-outline' color={accent} size={wp(5)} />
                        <ThemedText type='subtitle' color={accent}>
                            Long-Term Contracts
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0}>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fugit distinctio odit amet iusto cupiditate ea porro, culpa hic laborum neque! Consequuntur rem corporis esse!
                    </ThemedText>

                            <Button title='Open' onPress={() => router.push('/Logistics/Contracts/Index')} loading={false} />


                </View>
                <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: wp(5), paddingHorizontal: wp(2) }}>
                    <View style={{ borderWidth: .5, borderColor: accent, padding: wp(3), borderRadius: wp(6), flex: 1, alignItems: 'center' }}>
                        <ThemedText color={accent}>
                            Add Logistics
                        </ThemedText>
                    </View>
                    <View style={{
                        borderWidth: .5, borderColor: accent, padding: wp(3), borderRadius: wp(6), flex: 1, alignItems: 'center'
                    }}>
                        <ThemedText color={accent}>
                            Add To Store
                        </ThemedText>
                    </View>
                </View>
                <View style={[styles.homefeature, { backgroundColor }]}>
                    <View style={[{ flexDirection: 'row', gap: wp(2) }]}>
                        <Octicons name='verified' color={accent} size={wp(5)} />
                        <ThemedText type='subtitle' color={accent}>
                            First Level Verification
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} >
                        We encourage all legit business to be verified{'\n'}
                        Increase business trust and credibility by verifying your company.
                    </ThemedText>

                    <Button title='Get Verified' />
                    {/* <View style={{ borderWidth: .5, borderColor: accent, padding: wp(2), borderRadius: wp(2) }}>

                        </View> */}
                </View>

                <View style={[styles.homefeature, { backgroundColor }]}>
                    <View style={[{ flexDirection: 'row', gap: wp(2) }]}>
                        <Ionicons name='shield-checkmark-outline' color={accent} size={wp(5)} />
                        <ThemedText type='subtitle' color={accent}>
                            GIT (Goods in transit Insuarance)
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} >
                        Ensures financial protection for trucks and cargo, keeping your
                        business secure.
                    </ThemedText>

                    <Button title='Get Git Now' />
                    {/* <View style={{ borderWidth: .5, borderColor: accent, padding: wp(2), borderRadius: wp(2) }}>

                        </View> */}
                </View>


                <View style={[styles.homefeature, { backgroundColor }]}>
                    <View style={[{ flexDirection: 'row', gap: wp(2) }]}>
                        <Ionicons name='calendar-outline' color={accent} size={wp(5)} />
                        <ThemedText type='subtitle' color={accent}>
                            T & L Events
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} >
                        Get your tickets now for upcoming transport & logistics events!{'\n'}
                        Featuring : burnouts, car shows, expos, conferences, racing and tournaments!
                    </ThemedText>

                    <Button title='Get Git Now' />
                    {/* <View style={{ borderWidth: .5, borderColor: accent, padding: wp(2), borderRadius: wp(2) }}>

                        </View> */}
                </View>
            </ScrollView>

        </View>
    )
}

export default Index

const styles = StyleSheet.create({
    homefeature: {
        padding: wp(4),
        borderRadius: wp(6),
        gap: wp(2),
        marginBottom: wp(6)
    }
})