
import React , { ReactElement, useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity ,TouchableNativeFeedback,Pressable,Modal ,ToastAndroid } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { hp, wp } from "@/constants/common";
import { useThemeColor } from "@/hooks/useThemeColor";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import { useAuth } from "@/context/AuthContext";

import { BlurView } from 'expo-blur';
import { deleteDocument, readById } from "@/db/operations";

import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { truckType } from "@/data/appConstants";

function ViewContractMoreInfo() {
    const { ContractItemG } = useLocalSearchParams();
    const contract = ContractItemG ? JSON.parse(decodeURIComponent(ContractItemG as string)) : null;

    const [activeTab, setActiveTab] = React.useState<"load" | "contract" | "return">("load");

    const accent = useThemeColor("accent");
    const coolGray = useThemeColor("coolGray");
    const icon = useThemeColor("icon");
    const background = useThemeColor("background");
    const backgroundColor = useThemeColor("backgroundLight");
    const backgroundLight = useThemeColor("backgroundLight");

    const { user } = useAuth();

    const [modalVisible, setModalVisible] = React.useState(false);


  const [showAlert, setshowAlert] = React.useState<ReactElement | null>(null);
    function alertBox(title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) {
        setshowAlert(
            <AlertComponent
                visible
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onBackPress={() => setshowAlert(null)}
            />
        )

    }


    if (!contract) {
        return (
            <ScreenWrapper>
                <Heading page="Contract Details" />
                <ThemedText>No contract data available</ThemedText>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>



     <Modal transparent statusBarTranslucent visible={modalVisible} animationType="fade">
                <Pressable onPress={() => setModalVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <BlurView intensity={100} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: backgroundLight, borderRadius: wp(4), padding: wp(4), width: wp(80), gap: wp(3) }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="title" style={{ textAlign: 'center', marginBottom: wp(4) }}>
                                    Manage Truck
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        router.push('/Logistics/Trucks/AddTrucks');
                                    }}
                                    style={{ backgroundColor: accent, alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Edit Truck</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        alertBox(
                                            "Delete Truck",
                                            "Are you sure you want to delete this truck?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            // Add delete logic here
                                                            deleteDocument('loadsContracts', contract.id)
                                                            router.back()
                                                            ToastAndroid.show("Success Contract` deleted successfully", ToastAndroid.SHORT);

                                                        } catch (error) {
                                                            alertBox("Error", "Failed to delete truck", [], "error");
                                                            console.error(error)
                                                        }
                                                    },
                                                },
                                            ],
                                            "destructive"
                                        );
                                    }}
                                    style={{ backgroundColor: '#FF5252', alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Delete Truck</ThemedText>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {showAlert}


            <Heading page={`Contracts in ${contract.contractLocation}`}    rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        { user?.uid === contract.userId &&
                           ( <View style={{ overflow: 'hidden', borderRadius: wp(2.4) }}>
                                <TouchableNativeFeedback onPress={() => setModalVisible(true)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2), padding: wp(1.5) }}>
                                        <Ionicons name='reorder-three-outline' size={wp(6)} color={icon} />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>)
                        }
                    </View>} />

            <ScrollView contentContainerStyle={{ padding: wp(0), paddingBottom: wp(10) }}>
                {/* Main Contract Card */}
                <View
                    style={{
                        backgroundColor: background,
                        borderRadius: wp(0),
                        marginBottom: wp(4),
                        borderWidth: 0,
                    }}
                >
                    {/* Card Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: wp(4),

                            backgroundColor: accent + "10",
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: accent + "30",
                                borderRadius: wp(2),
                                padding: wp(2),
                                marginRight: wp(3),
                            }}
                        >
                            <MaterialCommunityIcons name="file-document-outline" color={accent} size={wp(6)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText
                                type="subtitle"
                                color={accent}
                                style={{ fontWeight: "bold", fontSize: wp(5) }}
                            >
                                {contract.formDataScnd?.contractDuration || "9 Months"} Contract
                            </ThemedText>
                            <ThemedText
                                type="tiny"
                                style={{ color: coolGray, marginTop: wp(0.5) }}
                            >
                                Trucks Left: 10
                            </ThemedText>
                        </View>
                    </View>

                    {/* Tab Navigation */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            marginHorizontal: wp(4),
                            marginTop: wp(2),
                            marginBottom: wp(3),
                            borderBottomWidth: 1,
                            borderBottomColor: coolGray + "30",
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setActiveTab("load")}
                            style={{
                                paddingBottom: wp(2),
                                borderBottomWidth: activeTab === "load" ? 2 : 0,
                                borderBottomColor: activeTab === "load" ? accent : "transparent",
                            }}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: activeTab === "load" ? accent : coolGray,
                                    fontSize: wp(4),
                                }}
                            >
                                Load Details
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab("contract")}
                            style={{
                                paddingBottom: wp(2),
                                borderBottomWidth: activeTab === "contract" ? 2 : 0,
                                borderBottomColor: activeTab === "contract" ? accent : "transparent",
                            }}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: activeTab === "contract" ? accent : coolGray,
                                    fontSize: wp(4),
                                }}
                            >
                                Contract
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab("return")}
                            style={{
                                paddingBottom: wp(2),
                                borderBottomWidth: activeTab === "return" ? 2 : 0,
                                borderBottomColor: activeTab === "return" ? accent : "transparent",
                            }}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: activeTab === "return" ? accent : coolGray,
                                    fontSize: wp(4),
                                }}
                            >
                                Return Load
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Content Sections */}
                    <View style={{ paddingHorizontal: wp(2), paddingBottom: wp(4) }}>
                        {activeTab === "load" && (
                            <>
                                {/* Commodity Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Commodity
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                        }}
                                    >
                                        {(["frst", "scnd", "third", "forth"] as const).map((key, index) => (
                                            contract.formData.commodity[key] && (
                                                <View
                                                    key={key}
                                                    style={{
                                                        flexDirection: "row",
                                                        paddingVertical: wp(1),
                                                        borderTopWidth: index === 0 ? 0 : 1,
                                                        borderTopColor: coolGray + "20",
                                                    }}
                                                >
                                                    <ThemedText type="default" style={{ color: icon }}>
                                                        {index + 1}) {contract.formData.commodity[key]}
                                                    </ThemedText>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>

                                {/* Rate Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Rates
                                    </ThemedText>

                                   
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                            marginBottom: wp(2),
                                        }}
                                    >
                                        {contract.formData.rate.frst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.rate.frst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.rate.scnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.rate.scnd}
                                            </ThemedText>
                                        )}
                                          {contract.formData.rate.thrd && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.rate.thrd}
                                            </ThemedText>
                                        )}
                                        {contract.formData.rate.forth && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.rate.forth}
                                            </ThemedText>
                                        )}
                                    </View>

                                   
                                </View>

                                {/* Routes Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Routes {"  "}
{contract.manyRoutesAssign &&<ThemedText style={{ color: accent, marginBottom: wp(2) ,fontStyle:"italic"}}>There are more than 2</ThemedText>}
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                        }}
                                    >
                                        <ThemedText type="default" style={{ color: icon, marginBottom: wp(1) }}>
                                           Truck Movement    :   {contract.manyRoutesAssign}
                                        </ThemedText>
                                       {contract.formData.location.seventh && <ThemedText type="default" style={{ color: icon, marginBottom: wp(1) }}>
                                            Destination route   :   {' '}
                                            <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                                                {contract.formData.location.seventh}
                                            </ThemedText>
                                        </ThemedText>}

                                        <ThemedText type="default" style={{ color: icon, marginTop: wp(2) }}>
                                          Allocation Type       :  {contract.manyRoutesAllocaton}
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon, marginTop: wp(2) }}>
                                            {contract.formDataScnd.manyRoutesOperation}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Locations Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Locations
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                        }}
                                    >
                                        {(["frst", "scnd", "thrd", "forth", "fifth", "sixth"] as const).map((key, index) => (
                                            contract.formData.location[key] && (
                                                <View
                                                    key={key}
                                                    style={{
                                                        flexDirection: "row",
                                                        paddingVertical: wp(1),
                                                        borderTopWidth: index === 0 ? 0 : 1,
                                                        borderTopColor: coolGray + "20",
                                                    }}
                                                >
                                                    <ThemedText type="default" style={{ color: icon }}>
                                                        {index + 1}) {contract.formData.location[key]}
                                                    </ThemedText>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>

                                {/* Trucks Required Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Trucks Required
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                        }}
                                    >
                                {contract.truckDetails.map((neededTruck: { truckType: { name: string }, capacity: { name: string }, cargoArea: { name: string } }, index: number) => (
                                    <View key={index} style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
                                        <ThemedText>{neededTruck.truckType?.name}</ThemedText>
                                        <ThemedText>{neededTruck.capacity?.name}</ThemedText>
                                        <ThemedText>{neededTruck.cargoArea?.name}</ThemedText>
                                    </View>
                                ))}

                                    </View>
                                </View>

                                {/* Other Requirements Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Other Requirements
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                        }}
                                    >
                                        {(["frst", "scnd", "third", "forth"] as const).map((key, index) => (
                                            contract.formData.otherRequirements[key] && (
                                                <View
                                                    key={key}
                                                    style={{
                                                        flexDirection: "row",
                                                        paddingVertical: wp(1),
                                                        borderTopWidth: index === 0 ? 0 : 1,
                                                        borderTopColor: coolGray + "20",
                                                    }}
                                                >
                                                    <ThemedText type="default" style={{ color: icon }}>
                                                        {index + 1}) {contract.formData.otherRequirements[key]}
                                                    </ThemedText>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}

                        {activeTab === "contract" && (
                            <>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{ color: accent, marginBottom: wp(2), textAlign: "center" }}
                                >
                                    {contract.formDataScnd?.contractDuration || "9 Months"} Contract Available
                                </ThemedText>

                                <View
                                    style={{
                                        backgroundColor: backgroundColor,
                                        borderRadius: wp(2),
                                        padding: wp(3),
                                        borderWidth: 1,
                                        borderColor: coolGray + "20",
                                    }}
                                >
                                    <View style={{ marginBottom: wp(3) }}>
                                        <ThemedText type="tiny" style={{ color: coolGray, marginBottom: wp(0.5) }}>
                                            Starting Date
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.startingDate}
                                        </ThemedText>
                                    </View>

                                    <View style={{ marginBottom: wp(3) }}>
                                        <ThemedText type="tiny" style={{ color: coolGray, marginBottom: wp(0.5) }}>
                                            Renewal
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.contractRenewal}
                                        </ThemedText>
                                    </View>

                                    <View style={{ marginBottom: wp(3) }}>
                                        <ThemedText type="tiny" style={{ color: coolGray, marginBottom: wp(0.5) }}>
                                            Payment Terms
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.paymentTerms}
                                        </ThemedText>
                                    </View>

                                    <View style={{ marginBottom: wp(3) }}>
                                        <ThemedText type="tiny" style={{ color: coolGray, marginBottom: wp(0.5) }}>
                                            Loads/Week
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.loadsPerWeek}
                                        </ThemedText>
                                    </View>

                                    <View style={{ marginBottom: wp(3) }}>
                                        <ThemedText type="tiny" style={{ color: coolGray, marginBottom: wp(0.5) }}>
                                            Fuel
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.fuelAvai}
                                        </ThemedText>
                                    </View>

                                    <View style={{ marginBottom: wp(3) }}>
                                        <ThemedText type="tiny" style={{ color: "#00509E", marginBottom: wp(0.5) }}>
                                            Alert Message
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.alertMsg}
                                        </ThemedText>
                                    </View>

                                    <View>
                                        <ThemedText type="tiny" style={{ color: "#00509E", marginBottom: wp(0.5) }}>
                                            Additional Info
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon }}>
                                            {contract.formDataScnd.additionalInfo}
                                        </ThemedText>
                                    </View>
                                </View>
                            </>
                        )}

                        {activeTab === "return" && (
                            <>
                                {/* Return Commodity Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Return Commodity
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                        }}
                                    >
                                        {(["frst", "scnd", "third", "forth"] as const).map((key, index) => (
                                            contract.formData.returnCommodity?.[key] && (
                                                <View
                                                    key={key}
                                                    style={{
                                                        flexDirection: "row",
                                                        paddingVertical: wp(1),
                                                        borderTopWidth: index === 0 ? 0 : 1,
                                                        borderTopColor: coolGray + "20",
                                                    }}
                                                >
                                                    <ThemedText type="default" style={{ color: icon }}>
                                                        {index + 1}) {contract.formData.returnCommodity[key]}
                                                    </ThemedText>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                </View>

                                {/* Return Rate Section */}
                                <View style={{ marginBottom: wp(4) }}>
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{ color: accent, marginBottom: wp(2) }}
                                    >
                                        Return Rates
                                    </ThemedText>

                                    {/* Solid Rate */}
                                    <ThemedText type="default" style={{ color: coolGray, marginBottom: wp(1) }}>
                                        Return Solid Rate
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                            marginBottom: wp(2),
                                        }}
                                    >
                                        {contract.formData.returnRate?.solidFrst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.returnRate.solidFrst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.returnRate?.solidScnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.returnRate.solidScnd}
                                            </ThemedText>
                                        )}
                                    </View>

                                    {/* Triaxle Rate */}
                                    <ThemedText type="default" style={{ color: coolGray, marginBottom: wp(1) }}>
                                        Return Triaxle Rate
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                            marginBottom: wp(2),
                                        }}
                                    >
                                        {contract.formData.returnRate?.triaxleFrst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.returnRate.triaxleFrst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.returnRate?.triaxlesScnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.returnRate.triaxlesScnd}
                                            </ThemedText>
                                        )}
                                    </View>

                                    {/* Link Rate */}
                                    <ThemedText type="default" style={{ color: coolGray, marginBottom: wp(1) }}>
                                        Return Link Rate
                                    </ThemedText>
                                    <View
                                        style={{
                                            backgroundColor: backgroundColor,
                                            borderRadius: wp(2),
                                            padding: wp(3),
                                            borderWidth: 1,
                                            borderColor: coolGray + "20",
                                            marginBottom: wp(2),
                                        }}
                                    >
                                        {contract.formData.returnRate?.linksFrst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.returnRate.linksFrst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.returnRate?.linksScnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.returnRate.linksScnd}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Book Now Button */}

                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity
                style={{
                    backgroundColor: accent,
                    paddingVertical: wp(4),
                    margin: wp(4),
                    borderRadius: wp(4),
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: wp(2),
                    shadowColor: accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 2,
                }}
                onPress={() => router.push({
                    pathname: '/Logistics/Contracts/BookContract',
                    params: { contract: JSON.stringify(contract) }
                })}
            >
                <ThemedText style={{ color: "#fff", fontWeight: "bold", fontSize: wp(4) }}>
                    Book now - Due {contract.formDataScnd.bookingClosingD}
                </ThemedText>
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

export default React.memo(ViewContractMoreInfo);