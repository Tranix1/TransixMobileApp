import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { hp, wp } from "@/constants/common";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";

function ViewContractMoreInfo() {
    const { ContractItemG } = useLocalSearchParams();
    const contract = ContractItemG ? JSON.parse(decodeURIComponent(ContractItemG as string)) : null;

    const [activeTab, setActiveTab] = React.useState<"load" | "contract" | "return">("load");

    const accent = useThemeColor("accent");
    const coolGray = useThemeColor("coolGray");
    const icon = useThemeColor("icon");
    const background = useThemeColor("background");
    const backgroundColor = useThemeColor("backgroundLight");

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
            <Heading page={`Contracts in ${contract.contractLocation}`} />

            <ScrollView contentContainerStyle={{ padding: wp(4), paddingBottom: wp(10) }}>
                {/* Main Contract Card */}
                <View
                    style={{
                        backgroundColor: background,
                        borderRadius: wp(4),
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 4,
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
                            borderTopLeftRadius: wp(4),
                            borderTopRightRadius: wp(4),
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
                    <View style={{ paddingHorizontal: wp(4), paddingBottom: wp(4) }}>
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

                                    {/* Solid Rate */}
                                    <ThemedText type="default" style={{ color: coolGray, marginBottom: wp(1) }}>
                                        Solid Rate
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
                                        {contract.formData.rate.solidFrst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.rate.solidFrst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.rate.solidScnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.rate.solidScnd}
                                            </ThemedText>
                                        )}
                                    </View>

                                    {/* Triaxle Rate */}
                                    <ThemedText type="default" style={{ color: coolGray, marginBottom: wp(1) }}>
                                        Triaxle Rate
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
                                        {contract.formData.rate.triaxleFrst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.rate.triaxleFrst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.rate.triaxlesScnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.rate.triaxlesScnd}
                                            </ThemedText>
                                        )}
                                    </View>

                                    {/* Link Rate */}
                                    <ThemedText type="default" style={{ color: coolGray, marginBottom: wp(1) }}>
                                        Link Rate
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
                                        {contract.formData.rate.linksFrst && (
                                            <ThemedText type="default" style={{ color: icon }}>
                                                1) {contract.formData.rate.linksFrst}
                                            </ThemedText>
                                        )}
                                        {contract.formData.rate.linksScnd && (
                                            <ThemedText type="default" style={{ color: icon, marginTop: wp(1) }}>
                                                2) {contract.formData.rate.linksScnd}
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
                                        Routes
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
                                            {contract.manyRoutesAssign}
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon, marginBottom: wp(1) }}>
                                            The destination for all Routes is{' '}
                                            <ThemedText type="defaultSemiBold" style={{ color: accent }}>
                                                {contract.formData.location.seventh}
                                            </ThemedText>
                                        </ThemedText>
                                        <ThemedText type="default" style={{ color: icon, marginTop: wp(2) }}>
                                            {contract.manyRoutesAllocaton}
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
                                        {(["frst", "scnd", "third", "forth", "fifth"] as const).map((key, index) => (
                                            contract.formData.trckRequired[key] && (
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
                                                        {index + 1}) {contract.formData.trckRequired[key]}
                                                    </ThemedText>
                                                </View>
                                            )
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