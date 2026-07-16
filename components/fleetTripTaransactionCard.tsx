import React,{useState} from "react";
import { ThemedText, } from "./ThemedText";

import { TouchableOpacity,StyleSheet,View } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import FinancePanel from "./FinancePanel";
import { getRelativeTime } from "@/Utilities/getDateRelativeTime";
import { router } from "expo-router";
import { wp,hp } from "@/constants/common";

 const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_TRANSIT': return '#4CAF50';
            case 'PENDING': return '#FF9800';
            case 'COMPLETED': return '#2196F3';
            case 'rejected': return '#F44336';
            case 'accepted': return '#8BC34A';
            default: return '#666';
        }
    };

export const FleetTripTaransactionCard = (assignmentData: any) => {
    const backgroundLight = useThemeColor("backgroundLight")
    const accent = useThemeColor("accent")

    const [financeView, setFinanceView] = useState(false)


        return (
            <View  style={[styles.cargoItem, { backgroundColor: backgroundLight }]}>




                <View style={styles.cargoHeader}>
                    <ThemedText style={styles.cargoTitle}>
                        {assignmentData?.loadDetails?.productName || 'Load'} - {assignmentData?.truckDetails?.truckName }
                    </ThemedText>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignmentData.status) }]}>
                        <ThemedText style={styles.statusText}>
                            {assignmentData.status.toUpperCase()}
                        </ThemedText>
                    </View>
                </View>



                {/* DETAILS */}
                <View style={styles.cargoDetails}>

                    {/* ROUTE */}
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            {assignmentData?.loadDetails?.pickupLocation?.description || "Origin"} →{" "}
                            {assignmentData?.loadDetails?.deliveryLocation?.description || "Destination"}
                        </ThemedText>
                    </View>

                    {/* TRUCK */}
                    <View style={styles.detailRow}>
                        <Ionicons name="car-sport-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText} numberOfLines={1}>
                            {assignmentData?.truckDetails?.truckCapacity || "N/A"} •{" "}
                            {assignmentData?.truckDetails?.truckType || "N/A"} • Plate:{" "}
                            {assignmentData?.truckDetails?.numberPlate || "N/A"}
                        </ThemedText>
                    </View>

                    {/* DRIVER */}
                    <View style={styles.detailRow}>
                        <Ionicons name="person-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText} numberOfLines={1}>
                            {assignmentData?.driverDetails?.driverName || "Unassigned"} •{" "}
                            {assignmentData?.driverDetails?.driverPhone || "No phone"}
                        </ThemedText>
                    </View>

                    {/* SHIPPER */}
                    {assignmentData?.shipper?.name && (
                        <View style={styles.detailRow}>
                            <Ionicons name="business-outline" size={16} color={accent} />
                            <ThemedText style={styles.detailText} numberOfLines={1}>
                                {assignmentData.shipper.name} •{" "}
                                {assignmentData.shipper.phone || "N/A"}
                            </ThemedText>
                        </View>
                    )}

                    {/* LOADING DATE */}
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Loading:{" "}
                            {assignmentData?.loadDetails?.pickupDate
                                ? new Date(assignmentData.loadDetails.pickupDate).toLocaleDateString()
                                : "TBD"}
                        </ThemedText>
                    </View>

                    {/* DELIVERY DATE */}
                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color={accent} />
                        <ThemedText style={styles.detailText}>
                            Delivery:{" "}
                            {assignmentData?.loadDetails?.deliveryDate
                                ? new Date(assignmentData.loadDetails.deliveryDate).toLocaleDateString()
                                : "TBD"}
                        </ThemedText>
                    </View>

                    {/* CREATED */}

                    <View style={styles.metaRow}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={"#777"}
                        />
                        <ThemedText style={{ marginLeft: 6, fontSize: 12, color: "#777", }}>
                            Assigned {assignmentData.createdAt ? getRelativeTime(parseInt(assignmentData.createdAt)) : 'N/A'}
                        </ThemedText>
                    </View>






                </View>

                {/* ACTION BUTTONS */}
                <View style={{
                    flexDirection: 'row',
                    gap: wp(2),
                    marginTop: wp(2),
                }}>

                    {/* DRIVER */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => { }}
                    >
                        <Ionicons name="person-circle-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>Driver</ThemedText>
                    </TouchableOpacity>

                    {/* LOAD */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            router.push({
                                pathname: "/Logistics/Loads/Index",
                                params: {
                                    cargoId: assignmentData.loadDetails.cargoId || assignmentData.loadDetails.loadId,
                                    cargoVisibilityG: assignmentData.visibility || null
                                },
                            });
                        }}
                    >
                        <Ionicons name="cube-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>Load</ThemedText>
                    </TouchableOpacity>

                    {/* TRUCK */}
                    <TouchableOpacity
                        style={styles.actionButton}

                        onPress={() => router.push({
                            pathname: "/Logistics/Trucks/TruckDetails",
                            params: { truckid: assignmentData.truckDetails.truckId, dspDetails: "false", fleetId: assignmentData.fleetDetails.id || undefined }
                        })}


                    >
                        <Ionicons name="car-sport-outline" size={16} color={accent} />
                        <ThemedText style={styles.actionButtonText}>Truck</ThemedText>
                    </TouchableOpacity>

                </View>

                {/* OPERATION ACTIONS */}
                <View
                    style={{
                        flexDirection: 'row',
                        gap: wp(2),
                        marginTop: wp(2),
                        flexWrap: 'wrap'
                    }}
                >

                    {/* TRACKER - Everyone */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            console.log("Open tracker");
                        }}
                    >
                        <Ionicons name="navigate-circle-outline" size={16} color={accent}
                            onPress={() => {
                                router.push({
                                    pathname: "/Map/VehicleTrackingMap",
                                    params: {
                                        vehicleId: assignmentData.truckDetails.trackingDeviceId,

                                        pickupLati: assignmentData.loadDetails.pickupLocation.latitud,
                                        pickupLongi: assignmentData.loadDetails.pickupLocation.longitude,
                                        pickupName: assignmentData.loadDetails.pickupLocation.description,

                                        dropoffLati: assignmentData.loadDetails.deliveryLocation.latitude,
                                        dropoffLongi: assignmentData.loadDetails.deliveryLocation.longitude,
                                        dropoffName: assignmentData.loadDetails.deliveryLocation.description,

                                        plannedRoutePolyline: assignmentData.loadDetails.deliveryLocation,
                                    },
                                });
                            }}

                        />
                        <ThemedText style={styles.actionButtonText}>
                            Tracker
                        </ThemedText>
                    </TouchableOpacity>



                   
                   

                 




                </View>

               

                <FinancePanel
                 visible={financeView}
                onClose={() => setFinanceView(false)}
                assignmentId={assignmentData.id}               

                rate={assignmentData.loadDetails.rate}
                    cargoRateCurrency={assignmentData.loadDetails.currency}
                    cargoRateModel={assignmentData.loadDetails.model}
                    ratePerKm={Number(assignmentData.loadDetails.ratePerKm)}
                    paymentTerms={assignmentData.loadDetails.paymentTerms}
                
                />

            </View>
        );
    };

    const styles = StyleSheet.create({
        container: { flex: 1 },
        content: { flex: 1 },
        buttonContainer: {
            // flexDirection: 'row',
            // alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 8,
            gap: 8,
        },
        statusButton: {
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 8,
            minWidth: 80,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E0E0E0',
        },
    
        buttonText: { fontSize: 14 },
        activeButtonText: { color: 'white' },
        filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#455A64',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 8,
        },
        filterButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
        filterChipsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 6,
            gap: 8,
        },
        filterChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#2196F3',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
            marginRight: 8,
        },
        filterChipText: { color: 'white', fontSize: 12, fontWeight: '600' },
        clearFiltersButton: {
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        clearFiltersText: { color: '#F44336', fontSize: 12, fontWeight: '700' },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
        cargoList: { flex: 1, paddingHorizontal: 20 },
        cargoItem: {
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        cargoHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        cargoTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
        statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
        statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
        cargoDetails: { gap: 8 },
        detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        detailText: { fontSize: 14, flex: 1 },
        emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
        emptyStateText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 16, marginBottom: 8 },
        emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
        actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8 },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            gap: 4,
        },
        actionButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
        statusActionButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 12 },
        statusActionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            gap: 6,
            minWidth: 100,
        },
        statusActionButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
        expandedDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
        detailSection: { marginBottom: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8 },
        sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', marginBottom: 8 },
    
        // Modals
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        sheetHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        sheetTitle: { fontSize: 18, fontWeight: 'bold' },
    
        filterTypeSheet: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
        },
        filterTypeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.05)',
        },
        filterTypeRowText: { flex: 1, fontSize: 16 },
    
        selectorSheet: {
            height: '75%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
        },
        searchBox: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 12,
        },
        searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
        selectorRow: {
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.05)',
        },
        selectorRowTitle: { fontSize: 15, fontWeight: '600' },
        selectorRowSub: { fontSize: 13, color: '#999', marginTop: 2 },
    
        rejectSheet: {
            margin: 20,
            borderRadius: 16,
            padding: 20,
        },
        reasonInput: {
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
            marginBottom: 16,
            minHeight: 90,
            textAlignVertical: 'top',
            fontSize: 14,
        },
        rejectButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    
    
        metaRow: {
            flexDirection: "row",
            alignItems: "center",
        },
    
        metaText: {
            marginLeft: 6,
            fontSize: 12,
            color: "#777",
        },
        proofOption: {
            flexDirection: "row",
            alignItems: "center",
            gap: wp(3),
            paddingVertical: hp(2),
            borderBottomWidth: 1,
            borderColor: "rgba(128,128,128,0.2)",
        },
        imageContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },
    
        imageWrapper: {
            position: "relative",
        },
    
        thumbnail: {
            width: 80,
            height: 80,
            borderRadius: 8,
        },
    
        removeButton: {
            position: "absolute",
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "red",
        },
    
        removeText: {
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
        },
    });
    