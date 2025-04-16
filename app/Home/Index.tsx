import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { wp } from '@/constants/common'
import { EvilIcons, Ionicons, Octicons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { useThemeColor } from '@/hooks/useThemeColor'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { router } from "expo-router";

const Index = () => {

    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const backgroundColor = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')

    return (

        <View style={{ flex: 1 }}>


            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ marginVertical: wp(4), marginHorizontal: wp(2) }}>

                {/* <View style={{ marginBottom: wp(4) }}>
                        <Button title='Go To Store' />
                    </View> */}

                <View style={{ margin: wp(4), marginTop: 0 }}>
                    <Input placeholder='Search...' Icon={<EvilIcons name='search' size={wp(6)} />} containerStyles={{ backgroundColor: backgroundColor }} />
                </View>
                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#395a4f', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Ionicons name='reader-outline' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#395a4f'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            Long-Term Contracts
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        Secure long-term contracts with trusted partners to ensure consistent and reliable business operations.
                    </ThemedText>
                    <Button
                        colors={{ text: '#395a4f', bg: '#395a4f24' }}
                        title='Learn More'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"#395a4f"} />}
                        onPress={() => router.push('/Logistics/Contracts/Index')}
                    />
                </View>


                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#6bacbf', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Octicons name='verified' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#6bacbf'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            First Level Verification
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        We encourage all legit business to be verified{'\n'}
                        Increase business trust and credibility by verifying your company.
                    </ThemedText>
                    <Button
                        colors={{ text: '#6bacbf', bg: '#6bacbf24' }}
                        title='Get Verified'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"#6bacbf"} />}
                    />
                </View>


                {/* <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: wp(5), paddingHorizontal: wp(2) }}>
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
                </View> */}





                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#fb9274', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Octicons name='verified' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#fb9274'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            GIT (Goods in transit Insuarance)
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        Ensures financial protection for trucks and cargo, keeping your
                        business secure.
                    </ThemedText>
                    <Button
                        colors={{ text: '#fb9274', bg: '#fb927424' }}
                        title='Get Verified'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"#fb9274"} />}
                    />
                </View>

                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#bada5f', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Octicons name='verified' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#bada5f'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            T & L Events
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        Get your tickets now for upcoming transport & logistics events!{'\n'}
                        Featuring : burnouts, car shows, expos, conferences, racing and tournaments!
                    </ThemedText>
                    <Button
                        colors={{ text: '#bada5f', bg: '#bada5f24' }}
                        title='Get Verified'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"##bada5f"} />}
                    />
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
        marginBottom: wp(6),
        borderWidth: 0.5,
        shadowColor: '#3535353b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 13
    }
})