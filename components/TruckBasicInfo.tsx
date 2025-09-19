import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Octicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { Truck } from '@/types/types';

interface TruckBasicInfoProps {
    truckData: Truck;
    onReadMore: (title: string, content: string) => void;
}

export const TruckBasicInfo: React.FC<TruckBasicInfoProps> = ({
    truckData,
    onReadMore
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const coolGray = useThemeColor('coolGray');

    return (
        <View
            style={{
                gap: wp(4),
                paddingHorizontal: wp(2),
                marginBottom: wp(2),
                paddingVertical: wp(5),
                backgroundColor: coolGray,
                borderRadius: wp(4),
                paddingBottom: wp(4),
            }}
        >
            <View style={{}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <ThemedText type="title" style={{ maxWidth: wp(80) }}>
                            {truckData.CompanyName}
                        </ThemedText>
                        <ThemedText>
                            {truckData.name}
                        </ThemedText>
                    </View>
                    {truckData.isVerified && (
                        <View style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            borderRadius: wp(4),
                            alignItems: 'center',
                            gap: wp(2),
                            borderWidth: .4,
                            padding: wp(1),
                            borderColor: coolGray
                        }}>
                            <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                            <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                                Verified
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                    <ThemedText type="tiny" style={{}}>
                        Truck Registered By
                    </ThemedText>
                    <ThemedText type="subtitle" style={{}}>
                        {truckData.ownerName && "Truck Owner"}
                        {truckData.brokerName && "Truck Broker"}
                    </ThemedText>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <ThemedText type="tiny" style={{}}>
                        Truck Type
                    </ThemedText>
                    <ThemedText type="subtitle" style={{}}>
                        {truckData.truckType || '--'}
                    </ThemedText>
                </View>
                <ThemedText type="subtitle" color="#1E90FF">|</ThemedText>
                <View style={{ flex: 1 }}>
                    <ThemedText type="tiny" style={{}}>
                        Cargo Area:
                    </ThemedText>
                    <ThemedText type="subtitle" style={{}}>
                        {truckData.cargoArea !== "Other" ? truckData.cargoArea : truckData.otherCargoArea}
                    </ThemedText>
                </View>
            </View>

            {truckData.cargoArea === "Tanker" && (
                <View style={{}}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Tanker Type
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.tankerType !== "Other" ? truckData.tankerType : truckData.otherTankerType}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            )}

            <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <ThemedText type="tiny" style={{}}>
                        Maximum Load Capacity
                    </ThemedText>
                    <ThemedText type="subtitle" style={{}}>
                        {truckData.maxloadCapacity || '--'}t
                    </ThemedText>
                </View>
                <ThemedText type="subtitle" color="#1E90FF">|</ThemedText>
                <View style={{ flex: 1 }}>
                    <ThemedText type="tiny" style={{}}>
                        Capacity:
                    </ThemedText>
                    <ThemedText type="subtitle" style={{}}>
                        {truckData.truckCapacity || '--'}t
                    </ThemedText>
                </View>
            </View>

            <View style={{}}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <ThemedText type="tiny" style={{}}>
                            Operation Country{truckData.locations?.length > 1 ? 's' : ''}
                        </ThemedText>
                        <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                            {truckData.locations?.join(', ') || '--'}
                        </ThemedText>
                    </View>
                </View>
            </View>

            {truckData.additionalInfo && (
                <View style={{}}>
                    <ThemedText type="tiny" style={{}}>
                        Additional Information:
                    </ThemedText>
                    <ThemedText numberOfLines={3} style={{ paddingTop: 0 }}>
                        {truckData.additionalInfo}
                    </ThemedText>
                    {truckData.additionalInfo.length > 100 && (
                        <TouchableOpacity onPress={() => onReadMore("Additional Information:", truckData.additionalInfo)}>
                            <ThemedText type="tiny" style={{ color: accent, marginTop: wp(1) }}>
                                Read More
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};
