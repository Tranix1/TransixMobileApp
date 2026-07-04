import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import Input from "@/components/Input";
import { hp, wp } from "@/constants/common";
import { SelectLocationProp } from '@/types/types';
import { LocationSelector } from "@/components/LocationSelector";
import DateTimePicker from "@react-native-community/datetimepicker";


type Props = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;

    truck?: any;
    driver?: any;
    load?: any;

    initialPickupDate?: string;
    initialDeliveryDate?: string;

    initialPickupLocation?: SelectLocationProp | null;
    initialDeliveryLocation?: SelectLocationProp | null;
};

export default function AssignmentModal({
    visible,
    onClose,
    onConfirm,

    truck,
    driver,
    load,

    initialPickupDate,
    initialDeliveryDate,
    initialPickupLocation,
    initialDeliveryLocation,
}: Props) {

    const [pickupDate, setPickupDate] = useState(initialPickupDate || "");
    const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate || "");
    const [pickupLocation, setPickupLocation] = useState<SelectLocationProp | null>(initialPickupLocation || null);
    const [deliveryLocation, setDeliveryLocation] = useState<SelectLocationProp | null>(initialDeliveryLocation || null);
    const [dspFromLocation, setDspFromLocation] = useState(false);
    const [locationPicKERdSP, setPickLocationOnMap] = useState(false);
    const [dspToLocation, setDspToLocation] = useState(false);
    const [distance, setDistance] = useState("");
    const [duration, setDuration] = useState("");
    const [durationInTraffic, setDurationInTraffic] = useState("");

    const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
    const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

    const backgroundColor = useThemeColor("background");
    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");

    useEffect(() => {
        if (visible) {
            setPickupDate(initialPickupDate || "");
            setDeliveryDate(initialDeliveryDate || "");
            setPickupLocation(initialPickupLocation || null);
            setDeliveryLocation(initialDeliveryLocation || null);
        }
    }, [visible]);

    const handleConfirm = () => {
        onConfirm({
            truckId: truck?.id,
            driverId: driver?.driverId,
            loadId: load?.id,

            pickupDate,
            deliveryDate,
            pickupLocation,
            deliveryLocation,
        });
    };




    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "flex-end",
                }}
            >

                <View
                    style={{
                        backgroundColor: backgroundColor,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 16,
                        maxHeight: "85%",
                    }}
                >

                    {/* HEADER */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: wp(2),
                        }}
                    >

                        {/* CLOSE / CANCEL */}
                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                padding: wp(2),
                            }}
                        >
                            <Ionicons name="close-circle-outline" size={26} color={icon} />
                        </TouchableOpacity>

                        {/* CONFIRM / ACCEPT */}
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={{
                                padding: wp(2),
                            }}
                        >
                            <Ionicons name="checkmark-circle" size={26} color={accent} />
                        </TouchableOpacity>

                    </View>

                    <ScrollView style={{ marginTop: 10 }}>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 12,
                                gap: wp(2),
                            }}
                        >

                            {/* TRUCK INLINE */}
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: wp(1),
                                }}
                            >
                                <Ionicons name="car-outline" size={16} color={icon} />
                                <ThemedText numberOfLines={1} style={{ fontSize: wp(3) }}>
                                    {truck?.truckCapacity} • {truck?.cargoArea} • Plate: {truck?.numberPlate}
                                </ThemedText>
                            </View>

                            {/* DRIVER INLINE */}
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: wp(1),
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Ionicons name="person-outline" size={16} color={icon} />
                                <ThemedText numberOfLines={1} style={{ fontSize: wp(3) }}>
                                    {driver?.driverName} • {driver?.driverPhoneNumber}
                                </ThemedText>
                            </View>

                        </View>


                        {/* PICKUP LOCATION */}








                        <LocationSelector
                            origin={pickupLocation}
                            destination={deliveryLocation}
                            setOrigin={setPickupLocation}
                            setDestination={setDeliveryLocation}
                            dspFromLocation={dspFromLocation}
                            setDspFromLocation={setDspFromLocation}
                            dspToLocation={dspToLocation}
                            setDspToLocation={setDspToLocation}
                            locationPicKERdSP={locationPicKERdSP}
                            setPickLocationOnMap={setPickLocationOnMap}
                            distance={distance}
                            duration={duration}
                            durationInTraffic={durationInTraffic}
                            iconColor={accent}
                        />






                        {/* DELIVERY LOCATION */}

                        {/* PICKUP DATE */}



                        {showPickupDatePicker && (
                            <DateTimePicker
                                value={pickupDate ? new Date(pickupDate) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowPickupDatePicker(false);

                                    if (selectedDate) {
                                        setPickupDate(selectedDate.toISOString());
                                    }
                                }}
                            />
                        )}


                        {showDeliveryDatePicker && (
                            <DateTimePicker
                                value={deliveryDate ? new Date(deliveryDate) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDeliveryDatePicker(false);

                                    if (selectedDate) {
                                        setDeliveryDate(selectedDate.toISOString());
                                    }
                                }}
                            />
                        )}

                        <TouchableOpacity
                            onPress={() => setShowPickupDatePicker(true)}
                            style={{
                                borderWidth: 1,
                                borderColor: icon,
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 10,
                            }}
                        >
                            <ThemedText>
                                {pickupDate
                                    ? new Date(pickupDate).toDateString()
                                    : "Select Pickup Date"}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowDeliveryDatePicker(true)}
                            style={{
                                borderWidth: 1,
                                borderColor: icon,
                                padding: 12,
                                borderRadius: 10,
                            }}
                        >
                            <ThemedText>
                                {deliveryDate
                                    ? new Date(deliveryDate).toDateString()
                                    : "Select Delivery Date"}
                            </ThemedText>
                        </TouchableOpacity>





                    </ScrollView>

                </View>
            </View>
        </Modal>
    );
}