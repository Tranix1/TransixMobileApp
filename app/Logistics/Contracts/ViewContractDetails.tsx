import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router'; // Assuming you are using Expo Router
import { useLocalSearchParams } from 'expo-router';


function ViewContractMoreInfo() {
    const { ContractItemG } = useLocalSearchParams();
const item =
  typeof ContractItemG === 'string'
    ? JSON.parse(decodeURIComponent(ContractItemG))
    : null;

    console.log( "contraxt Item", item)

    const [dspRturnnLoads, setDspReturnLoads] = React.useState(false);
    const [dspContractD, setDspContractD] = React.useState(false);
    const [dsoLoadDe, setDspLoadDe] = React.useState(true);
    const router = useRouter();

    const toggleDspReturnLoads = () => {
        setDspReturnLoads(true);
        setDspContractD(false);
        setDspLoadDe(false);
    };

    const toggleDspContractD = () => {
        setDspContractD(true);
        setDspReturnLoads(false);
        setDspLoadDe(false);
    };

    const dspLoadDet = () => {
        setDspLoadDe(true);
        setDspContractD(false);
        setDspReturnLoads(false);
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" style={styles.backIcon} />
                </TouchableOpacity>
                {/* <Text style={styles.headerText}> Contracts in {item.contractLocation} </Text> */}
            </View>

            <View style={styles.card} key={item.id}>
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={dsoLoadDe ? styles.tabButtonActive : styles.tabButtonInactive}
                        onPress={dspLoadDet}
                    >
                        <Text style={dsoLoadDe ? styles.tabTextActive : styles.tabTextInactive}>Load Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleDspContractD}
                        style={dspContractD ? styles.tabButtonActive : styles.tabButtonInactive}
                    >
                        <Text style={dspContractD ? styles.tabTextActive : styles.tabTextInactive}>Contract Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={dspRturnnLoads ? styles.tabButtonActive : styles.tabButtonInactive}
                        onPress={toggleDspReturnLoads}
                    >
                        <Text style={dspRturnnLoads ? styles.tabTextActive : styles.tabTextInactive}>Return Load</Text>
                    </TouchableOpacity>
                </View>

                {/* <Text style={styles.companyName}>{item.companyName} </Text> */}
                <Text style={styles.trucksLeft}>Trucks Left 10 </Text>

                {dsoLoadDe && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}> Commodiy </Text>
                        <View style={styles.textRow}>
                            <Text>i) {item.formData.commodity.frst} </Text>
                            <Text>ii) {item.formData.commodity.scnd} </Text>
                            <Text>iii) {item.formData.commodity.third} </Text>
                            <Text>iV) {item.formData.commodity.forth} </Text>
                        </View>

                        <Text style={styles.sectionTitle}>Rate</Text>
                        <View>
                            <Text style={styles.subSectionTitle}>Solid Rate</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text>i) {item.formData.rate.solidFrst} </Text>
                                <Text>ii) {item.formData.rate.solidScnd} </Text>
                            </View>

                            <Text style={styles.subSectionTitle}>Triaxle</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text>1) {item.formData.rate.triaxleFrst} </Text>
                                <Text>ii){item.formData.rate.triaxlesScnd} </Text>
                            </View>

                            <Text style={styles.subSectionTitle}>Link Rate</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text>i) {item.formData.rate.linksFrst} </Text>
                                <Text>ii) {item.formData.rate.linksScnd} </Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Routes</Text>
                        <View>
                            <View style={styles.smallCard}>
                                <Text style={styles.subSectionTitle}>There are many Routes and how the operate</Text>
                                <Text >{item.manyRoutesAssign} </Text>

                                <Text style={styles.routeDestination}>
                                    The destination for all Routes is <Text style={styles.greenColor}>{item.formData.location.seventh} </Text>
                                </Text>

                                <Text style={styles.subSectionTitle}> How the Routes are allocated</Text>
                                <Text>{item.manyRoutesAllocaton} </Text>

                                <Text style={styles.subSectionTitle}>Explanation of the Routes </Text>
                                <Text>{item.formDataScnd.manyRoutesOperation}</Text>
                            </View>

                            <Text style={styles.subSectionTitle}>Locations</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text> i) {item.formData.location.frst} </Text>
                                <Text>ii) {item.formData.location.scnd} </Text>
                                <Text>iii) {item.formData.location.thrd} </Text>
                                <Text>iv) {item.formData.location.forth} </Text>
                                <Text>v) {item.formData.location.fifth} </Text>
                                <Text>vi) {item.formData.location.sixth} </Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}> Trucks Required </Text>
                        <View style={styles.textRow}>
                            <Text>i) {item.formData.trckRequired.frst}</Text>
                            <Text>ii) {item.formData.trckRequired.scnd}</Text>
                            <Text>iii) {item.formData.trckRequired.third}</Text>
                            <Text>iv) {item.formData.trckRequired.forth}</Text>
                            <Text>v) {item.formData.trckRequired.fifth}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Other Requirements </Text>
                        <View style={styles.textRow}>
                            <Text>i) {item.formData.otherRequirements.frst} </Text>
                            <Text>ii) {item.formData.otherRequirements.scnd} </Text>
                            <Text>iii) {item.formData.otherRequirements.third} </Text>
                            <Text>iv) {item.formData.otherRequirements.forth} </Text>
                        </View>

                           <TouchableOpacity
                        style={styles.bookNowButton}
                        // onPress={() => router.push("/Logistics/Contracts/BookContract")}
                        onPress={()=>router.push({ pathname: '/Logistics/Contracts/BookContract',   params: { contract: JSON.stringify(item) },   })}
                    >
                        <Text style={styles.bookNowText}> Book now due {item.formDataScnd.bookingClosingD} </Text>
                    </TouchableOpacity>

                        <View style={styles.scrollViewBottomPadding} />
                    </ScrollView>
                )}

                {dspRturnnLoads && (
                    <View>
                        <Text style={styles.sectionTitle}>Return Commodiy </Text>
                        <View style={styles.textRow}>
                            <Text>i) {item.formData.returnCommodity?.frst} </Text>
                            <Text>ii) {item.formData.returnCommodity?.scnd} </Text>
                            <Text>iii) {item.formData.returnCommodity?.third} </Text>
                            <Text>iV) {item.formData.returnCommodity?.forth} </Text>
                        </View>

                        <Text style={styles.sectionTitle}>Rate</Text>
                        <View>
                            <Text style={styles.subSectionTitle}>Return Solid Rate</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text>i) {item.formData.returnRate?.solidFrst} </Text>
                                <Text>ii) {item.formData.returnRate?.solidScnd} </Text>
                            </View>

                            <Text style={styles.subSectionTitle}>Return Triaxle rate</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text>1) {item.formData.returnRate?.triaxleFrst} </Text>
                                <Text>ii){item.formData.returnRate?.triaxlesScnd} </Text>
                            </View>

                            <Text style={styles.subSectionTitle}>Return Link Rate</Text>
                            <View style={[styles.textRow, styles.smallCard]}>
                                <Text>i) {item.formData.returnRate?.linksFrst} </Text>
                                <Text>ii) {item.formData.returnRate?.linksScnd} </Text>
                            </View>
                        </View>
                    </View>
                )}

                {dspContractD && (
                    <View style={styles.contractContainer}>
                        <Text style={styles.contractHeader}>9 Months Contract Available</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Starting Date</Text>
                            <Text style={styles.value}>: {item.formDataScnd.startingDate}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Renewal</Text>
                            <Text style={styles.value}>: {item.formDataScnd.contractRenewal}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.label, styles.greenText]}>Payment Terms</Text>
                            <Text style={styles.value}>: {item.formDataScnd.paymentTerms}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.label, styles.greenText]}>Loads/Week</Text>
                            <Text style={styles.value}>: {item.formDataScnd.loadsPerWeek}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.label, styles.greenText]}>Fuel</Text>
                            <Text style={styles.value}>: {item.formDataScnd.fuelAvai}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.label, styles.blueText]}>Alert Message</Text>
                            <Text style={styles.value}>: {item.formDataScnd.alertMsg}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.label, styles.blueText]}>Additional Info</Text>
                            <Text style={styles.value}>: {item.formDataScnd.additionalInfo}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity>
                        
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.bookNowButton}
                        // onPress={() => router.push("/Logistics/Contracts/BookContract")}
                        onPress={()=>router.push({ 
                            pathname: '/Logistics/Contracts/BookContract', 
                              params: { contract: JSON.stringify(item) },

                             })}
                    >
                        <Text style={styles.bookNowText}> Book now due {item.formDataScnd.bookingClosingD} </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}

export default React.memo(ViewContractMoreInfo);

const styles = StyleSheet.create({
    mainContainer: {
        paddingTop: 89,
        padding: 10,
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        height: 74,
        paddingLeft: 6,
        paddingRight: 15,
        backgroundColor: '#6a0c0c',
        paddingTop: 15,
        alignItems: 'center',
    },
    backIcon: {
        marginLeft: 10,
        marginRight: 10,
    },
    headerText: {
        fontSize: 20,
        color: 'white',
    },
    card: {
        marginBottom: 8,
        padding: 7,
        borderWidth: 2,
        borderColor: '#6a0c0c',
        borderRadius: 8,
        shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
        overflow: 'hidden',
        paddingTop: 45,
    },
    tabBar: {
        height: 40,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: "#6a0c0c",
        paddingBottom: 7,
        justifyContent: 'space-evenly',
    },
    tabButtonInactive: {
        borderWidth: 1,
        borderColor: '#6a0c0c',
        paddingLeft: 6,
        paddingRight: 6,
        alignSelf: 'center',
        marginLeft: 6,
    },
    tabButtonActive: {
        backgroundColor: '#6a0c0c',
        paddingLeft: 4,
        paddingRight: 4,
        alignSelf: 'center',
    },
    tabTextActive: {
        color: 'white',
    },
    tabTextInactive: {},
    companyName: {
        color: '#9c2828',
        fontWeight: 'bold',
        fontSize: 20,
        alignSelf: 'center',
        marginTop: 5,
    },
    trucksLeft: {
        fontStyle: 'italic',
        fontSize: 14,
        alignSelf: 'center',
        fontWeight: 'bold',
        marginTop: 2,
    },
    sectionTitle: {
        color: '#9c2828',
        fontWeight: 'bold',
        fontSize: 19,
        marginTop: 7,
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 5,
        flexWrap: 'wrap',
        backgroundColor: '#f8f9fa',
        paddingVertical: 5,
    },
    smallCard: {
        backgroundColor: '#f8f9fa',
        marginBottom: 8,
        padding: 7,
        borderWidth: 0.6,
        borderColor: '#6a0c0c',
        borderRadius: 8,
        overflow: 'hidden',
    },
    subSectionTitle: {
        color: '#9c2828',
        fontWeight: 'bold',
        marginTop: 8,
        alignSelf: 'center',
    },
    routeDestination: {
        margin: 6,
    },
    greenColor: {
        color: 'green',
    },
    scrollViewBottomPadding: {
        height: 150
    },
    contractContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
        elevation: 2,
    },
    contractHeader: {
        color: '#9c2828',
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 12,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    label: {
        width: 120,
        fontWeight: '600',
        color: '#B22222',
    },
    value: {
        flex: 1,
        color: '#333',
    },
    greenText: {
        color: '#0B6623',
    },
    blueText: {
        color: '#00509E',
    },
    bottomButtonContainer: {
        marginTop: 14,
    },
    bookNowButton: {
        width: 300,
        height: 30,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#228B22',
        borderRadius: 8,
        alignSelf: 'center',
        margin: 5,
    },
    bookNowText: {
        color: 'white',
    },
});

