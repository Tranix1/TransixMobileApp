import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet, ToastAndroid
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import TruckDefaultModal from "./TruckDefaultModal";
import DriverDefaultModal from "./DriverDefaultModal";
import AssignmentActivityPanel from "./AssignmentActivityPanel";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getRelativeTime } from "@/Utilities/getDateRelativeTime";
import { wp, hp } from "@/constants/common";
import { updateDoc } from "firebase/firestore";
import { ImagePickerAsset } from 'expo-image-picker';
import { fetchDocuments, updateDocument, uploadImage } from '@/db/operations';
import { arrayUnion } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { takePhoto, selectMultipleImages } from '@/Utilities/photoPickerUtils';
import GetTrackerModal from "./GetTrackerModal";
import { notifyUserById } from "@/Utilities/pushNotification";



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

export default function AssignmentCard({ assignmentData }: any) {


    const accent = useThemeColor("accent")
    const backgroundLight = useThemeColor("backgroundLight")
    const background = useThemeColor("background")
    const icon = useThemeColor("icon")

    const { user, currentRole } = useAuth()

    const scopeId = currentRole.accType === 'brokerage' ? currentRole?.organizationId : currentRole?.fleetId;

    const [proofTargetId, setProofTargetId] = useState<string | null>(null);
    const [proofImages, setProofImages] = useState<Record<string, ImagePickerAsset[]>>({});

    const [dspAssignDriverModaal, setDspAssignDriverModal] = useState(false)
    const [dspAssignTruckModl, setDspAssignTruckModal] = useState(false)


    const [uploadingImageUpdate, setUploadImageUpdate] = useState("")

    const [getTrackerModal, setGetTrackerModal] = useState(false)


    const handleTrackTruck = (truckTrackerId?: string | null) => {

        if (truckTrackerId) {
            console.log("hiiii")
            // router.push(`/Tracking/${truckTrackerId}`);
            //   {
            //                     router.push({
            //                         pathname: "/Map/VehicleTrackingMap",
            //                         params: {
            //                             vehicleId: assignmentData.truckDetails.trackingDeviceId || "UNASSIGNED",

            //                             pickupLati: assignmentData.loadDetails.pickupLocation.latitud,
            //                             pickupLongi: assignmentData.loadDetails.pickupLocation.longitude,
            //                             pickupName: assignmentData.loadDetails.pickupLocation.description,

            //                             dropoffLati: assignmentData.loadDetails.deliveryLocation.latitude,
            //                             dropoffLongi: assignmentData.loadDetails.deliveryLocation.longitude,
            //                             dropoffName: assignmentData.loadDetails.deliveryLocation.description,

            //                             plannedRoutePolyline: assignmentData.loadDetails.deliveryLocation,
            //                         },
            //                     });
            //                 }
        } else {
            console.log("Byee")

            setGetTrackerModal(true);
        }
    };



    const startTrip = async (
        assignmentId: string,
        externalLoad: boolean,
        fleetCoordinatorId: string,
        cargoCoordinatorId?: string
    ) => {
        if (!assignmentId) return
        try {
            await updateDocument(
                `fleets/${scopeId}/assignments`,
                assignmentId,
                {
                    status: "IN_TRANSIT",

                    updatedAt: Date.now(),
                    updatedBy: user?.uid ?? "",
                    updatedByName: user?.displayName ?? "User",
                    updatedByRole: currentRole?.userRole ?? "",
                    updatedByAcc: currentRole?.accType ?? "",

                    statusHistory: arrayUnion({
                        fromStatus: "PENDING",
                        toStatus: "IN_TRANSIT",

                        changedAt: Date.now(),

                        changedBy: user?.uid ?? "",
                        changedByName: user?.displayName ?? "User",
                        changedByRole: currentRole?.userRole ?? "",
                        changedByAcc: currentRole?.accType ?? "",
                    })
                }
            );




            // Notify fleet coordinator
            if (fleetCoordinatorId) {
                await notifyUserById(
                    fleetCoordinatorId,
                    "Load Started 🚚",
                    `Trip ${assignmentId} is now in transit. The truck has started the delivery.`,
                    {
                        pathname: "/Fleet/AssignmentDetails",
                        params: {
                            assignmentId,
                        },
                    },
                    {
                        type: "load_in_transit",
                        assignmentId,
                    }
                );
            }

            // Notify cargo coordinator only for external loads
            if (externalLoad && cargoCoordinatorId) {
                await notifyUserById(
                    cargoCoordinatorId,
                    "Load In Transit 🚚",
                    `Your load is now in transit. The assigned truck has started the delivery.`,
                    {
                        pathname: "/Cargo/AssignmentDetails",
                        params: {
                            assignmentId,
                        },
                    },
                    {
                        type: "load_in_transit",
                        assignmentId,
                    }
                );
            }
            

            ToastAndroid.show(
                "Trip started • Now In Transit 🚚",
                ToastAndroid.SHORT
            );

        } catch (error) {

            console.log("Start trip error:", error);
            ToastAndroid.show(
                "Failed to start trip",
                ToastAndroid.SHORT
            );
        }

    };





    const finishTrip = async (
        assignmentId: string,
        externalLoad: boolean,
        fleetCoordinatorId: string,
        cargoCoordinatorId?: string
    ) => {
        try {
            const images = proofImages[assignmentId] || [];

            const uploadedUrls = await Promise.all(
                images.map(image =>
                    uploadImage(
                        image,
                        `assignments/${assignmentId}/proof`,
                        setUploadImageUpdate,
                        "POD"
                    )
                )
            );

            const proofFiles = uploadedUrls.filter(
                (url): url is string => url !== null
            );

            await updateDocument(
                `fleets/${scopeId}/assignments`,
                assignmentId,
                {
                    status: "Awaiting Confirmation",

                    completedAt: Date.now(),
                    completedBy: user?.uid ?? "",
                    completedByName: user?.displayName ?? "User",
                    completedByRole: currentRole?.userRole ?? "",

                    proofOfDelivery: {
                        uploaded: proofFiles.length > 0,
                        files: proofFiles,
                    },

                    updatedAt: Date.now(),
                    updatedBy: user?.uid ?? "",

                    statusHistory: arrayUnion({
                        fromStatus: "IN_TRANSIT",
                        toStatus: "AWAITING_OWNER_CONFIRMATION",

                        changedAt: Date.now(),

                        changedBy: user?.uid ?? "",
                        changedByName: user?.displayName ?? "User",
                        changedByRole: currentRole?.userRole ?? "",
                        changedByAcc: currentRole?.accType ?? "",
                    }),
                }
            );

            setProofImages(prev => {
                const updated = { ...prev };
                delete updated[assignmentId];
                return updated;
            });

            // Notify fleet coordinator
            if (fleetCoordinatorId) {
                await notifyUserById(
                    fleetCoordinatorId,
                    "Load Completed ✅",
                    `Trip ${assignmentId} has been completed and POD has been submitted.`,
                    {
                        pathname: "/Fleet/AssignmentDetails",
                        params: {
                            assignmentId,
                        },
                    },
                    {
                        type: "load_completed",
                        assignmentId,
                    }
                );
            }


            // Notify cargo coordinator only for external loads
            if (externalLoad && cargoCoordinatorId) {
                await notifyUserById(
                    cargoCoordinatorId,
                    "Load Delivered ✅",
                    `The load has been delivered and POD has been submitted.`,
                    {
                        pathname: "/Cargo/AssignmentDetails",
                        params: {
                            assignmentId,
                        },
                    },
                    {
                        type: "load_completed",
                        assignmentId,
                    }
                );
            }

            ToastAndroid.show(
                "Trip completed. POD submitted successfully.",
                ToastAndroid.LONG
            );

        } catch (error) {
            console.log("Proof upload error:", error);

            ToastAndroid.show(
                "Failed to complete trip. Please try again.",
                ToastAndroid.LONG
            );
        }
    };





    const cargoOwnerConfirmation = async (assignmentId: string, shipper?: any) => {
        try {

            if (!shipper) {

                await updateDocument(
                    `fleets/${scopeId}/assignments`,
                    assignmentId,
                    {
                        status: "COMPLETED",

                        updatedAt: Date.now(),
                        updatedBy: user?.uid ?? "",
                        updatedByName: user?.displayName ?? "User",
                        updatedByRole: currentRole?.userRole ?? "",
                        updatedByAcc: currentRole?.accType ?? "",

                        statusHistory: arrayUnion({
                            fromStatus: "AWAITING_OWNER_CONFIRMATION",
                            toStatus: "COMPLETED",

                            changedAt: Date.now(),

                            changedBy: user?.uid ?? "",
                            changedByName: user?.displayName ?? "User",
                            changedByRole: currentRole?.userRole ?? "",
                            changedByAcc: currentRole?.accType ?? "",
                        })
                    }
                );
            } else if (shipper) {

                let path = shipper.accType === "fleet" ? `fleets/${shipper?.organizationId}/assignments` : `brokerages/${shipper?.organizationId}/assignments`

                await updateDocument(
                    path,
                    assignmentId,
                    {
                        status: "COMPLETED",

                        updatedAt: Date.now(),
                        updatedBy: user?.uid ?? "",
                        updatedByName: user?.displayName ?? "User",
                        updatedByRole: currentRole?.userRole ?? "",
                        updatedByAcc: currentRole?.accType ?? "",

                        statusHistory: arrayUnion({
                            fromStatus: "AWAITING_OWNER_CONFIRMATION",
                            toStatus: "COMPLETED",

                            changedAt: Date.now(),

                            changedBy: user?.uid ?? "",
                            changedByName: user?.displayName ?? "User",
                            changedByRole: currentRole?.userRole ?? "",
                            changedByAcc: currentRole?.accType ?? "",
                        })
                    }
                );

                await updateDocument(
                    `fleets/${scopeId}/assignments`,
                    assignmentId,
                    {
                        status: "COMPLETED",

                        updatedAt: Date.now(),
                        updatedBy: user?.uid ?? "",
                        updatedByName: user?.displayName ?? "User",
                        updatedByRole: currentRole?.userRole ?? "",
                        updatedByAcc: currentRole?.accType ?? "",

                        statusHistory: arrayUnion({
                            fromStatus: "AWAITING_OWNER_CONFIRMATION",
                            toStatus: "COMPLETED",

                            changedAt: Date.now(),

                            changedBy: user?.uid ?? "",
                            changedByName: user?.displayName ?? "User",
                            changedByRole: currentRole?.userRole ?? "",
                            changedByAcc: currentRole?.accType ?? "",
                        })
                    }
                );
            }



        } catch (error) {
            console.log("Start trip error:", error);
        }
    };




    return (
        <View key={assignmentData.id} style={[styles.cargoItem, { backgroundColor: backgroundLight }]}>



            <GetTrackerModal visible={getTrackerModal} onClose={() => setGetTrackerModal(false)} />

            <TruckDefaultModal

                visible={dspAssignTruckModl}
                onClose={() => setDspAssignTruckModal(false)}
                fleetId={currentRole?.organizationId ? currentRole?.organizationId : ""}
                typeOfAction="Assign Truck"
                assignmentId={assignmentData.id}
                assignmentSource={assignmentData.externalLoad ? "brokerage" : "fleet"}
            />

            <DriverDefaultModal
                visible={dspAssignDriverModaal}
                onClose={() => setDspAssignDriverModal(false)}
                fleetId={currentRole?.organizationId ? currentRole?.organizationId : ""}
                truckId={assignmentData?.truckDetails?.truckId || "UNASSIGNED"}
                numberPlate={assignmentData?.truckDetails?.numberPlate}
                onAssigned={(driver) => {
                    console.log("Assigned:", driver);
                }}
                typeOfAction="Assign Driver"
                assignmentId={assignmentData.id}
                brokerageId={assignmentData.brokerageCoordinator?.organizationId || ""}
                assignmentSource={assignmentData.externalLoad ? "brokerage" : "fleet"}
            />


            {/* HEADER */}

            {(proofTargetId === assignmentData.id) && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        justifyContent: 'flex-end',
                        zIndex: 999,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: backgroundLight || '#1c1c1e',
                            padding: wp(6),
                            paddingBottom: 0,
                            borderTopLeftRadius: wp(6),
                            borderTopRightRadius: wp(6),
                        }}
                    >
                        <ThemedText style={{ fontSize: 18, fontWeight: "700", marginBottom: wp(4) }}>
                            Upload Delivery Proof
                        </ThemedText>

                        <TouchableOpacity
                            style={styles.proofOption}
                            onPress={() => {
                                const targetId = proofTargetId;
                                setProofTargetId(null);
                                takePhoto((image) => {
                                    if (!targetId) return;
                                    setProofImages(prev => ({
                                        ...prev,
                                        [targetId]: [...(prev[targetId] || []), image],
                                    }));
                                });
                            }}
                        >
                            <Ionicons name="camera-outline" size={24} color={accent} />
                            <ThemedText>Take Photo</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.proofOption}
                            onPress={() => {
                                const targetId = proofTargetId;
                                setProofTargetId(null);
                                selectMultipleImages((images) => {
                                    if (!targetId) return;
                                    setProofImages(prev => ({
                                        ...prev,
                                        [targetId]: [...(prev[targetId] || []), ...images],
                                    }));
                                });
                            }}
                        >
                            <Ionicons name="images-outline" size={24} color={accent} />
                            <ThemedText>Choose from Gallery</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.proofOption, { marginTop: wp(2) }]}
                            onPress={() => setProofTargetId(null)}
                        >
                            <Ionicons name="close-outline" size={24} color="#F44336" />
                            <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}




            <View style={styles.cargoHeader}>
                <ThemedText style={styles.cargoTitle}>
                    {assignmentData?.loadDetails?.productName || 'Load'} - {assignmentData?.truckDetails?.truckName || "UNASSIGNED"}
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


                {<View style={styles.imageContainer}>
                    {(assignmentData.proofOfDelivery?.files || []).map(
                        (image: string, index: number) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: image }}
                                    style={styles.thumbnail}
                                />
                            </View>
                        )
                    )}
                </View>}


                <View style={styles.imageContainer}>
                    {(proofImages[assignmentData.id] || []).map((image, index) => (
                        <View key={index} style={styles.imageWrapper}>

                            <Image
                                source={{ uri: image.uri }}
                                style={styles.thumbnail}
                            />

                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => {
                                    setProofImages(prev => ({
                                        ...prev,
                                        [assignmentData.id]: prev[assignmentData.id].filter(
                                            (_, i) => i !== index
                                        )
                                    }));
                                }}
                            >
                                <ThemedText style={styles.removeText}>
                                    ×
                                </ThemedText>
                            </TouchableOpacity>

                        </View>
                    ))}
                </View>



            </View>

            {/* ACTION BUTTONS */}
            <View style={{
                flexDirection: 'row',
                gap: wp(2),
                marginTop: wp(2),
            }}>


                {!assignmentData.truckDetails && currentRole.accType === "fleet" && currentRole.accType === "fleet" && <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setDspAssignTruckModal(true)}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Assign Truck
                    </ThemedText>

                </TouchableOpacity>}

                {/* DRIVER */}
                {assignmentData.driverDetails && <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        router.push({
                            pathname: "/Driver/Details/Index",
                            params: {
                                driverId: assignmentData.driverDetails.driverId,
                            },
                        });
                    }}
                >
                    <Ionicons name="person-circle-outline" size={16} color={accent} />
                    <ThemedText style={styles.actionButtonText}>Driver</ThemedText>
                </TouchableOpacity>}

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


                {!assignmentData.driverDetails && currentRole.accType === "fleet" && <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setDspAssignDriverModal(true)}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Assign Driver
                    </ThemedText>

                </TouchableOpacity>}


                {/* TRUCK */}
                {assignmentData.truckDetails && <TouchableOpacity
                    style={styles.actionButton}

                    onPress={() => router.push({
                        pathname: "/Logistics/Trucks/TruckDetails",
                        params: { truckid: assignmentData.truckDetails.truckId, dspDetails: "false", fleetId: assignmentData.fleetDetails.id || undefined }
                    })}


                >
                    <Ionicons name="car-sport-outline" size={16} color={accent} />
                    <ThemedText style={styles.actionButtonText}>Truck</ThemedText>
                </TouchableOpacity>}

            </View>

            {/* ERATION ACTIONS */}
            <View
                style={{
                    flexDirection: 'row',
                    gap: wp(2),
                    marginTop: wp(2),
                    flexWrap: 'wrap'
                }}
            >

                {/* TRACKER - Everyone */}
                {(assignmentData.status !== "UNASSIGNED") && <TouchableOpacity
                    style={styles.actionButton}

                    onPress={() => handleTrackTruck(assignmentData?.truckDetails?.trackingDeviceId)}
                >
                    <Ionicons name="navigate-circle-outline" size={16} color={accent}


                    />
                    <ThemedText style={styles.actionButtonText}>
                        Tracker
                    </ThemedText>
                </TouchableOpacity>}



                {/* DRIVER ACTION */}
                {currentRole.accType === "driver" && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {

                            if (assignmentData.status === "PENDING") {
                                startTrip(
                                    assignmentData.id,
                                    assignmentData.externalLoad,
                                    assignmentData.fleetCoordinatorId.id,
                                    assignmentData.cargoCoordinator.id
                                );
                            }

                            else if (assignmentData.status === "IN_TRANSIT") {
                                // uploadProof(assignmentData.id);
                                // pickProofImage();
                                setProofTargetId(assignmentData.id);

                            }

                        }}
                    >
                        <Ionicons
                            name={
                                assignmentData.status === "PENDING"
                                    ? "play-circle-outline"
                                    : assignmentData.status === "IN_TRANSIT"
                                        ? "camera-outline"
                                        : "checkmark-circle-outline"
                            }
                            size={16}
                            color={accent}
                        />

                        <ThemedText style={styles.actionButtonText}>
                            {
                                assignmentData.status === "PENDING"
                                    ? "Start Trip"
                                    : assignmentData.status === "IN_TRANSIT"
                                        ? "Upload POD"
                                        : "Completed"
                            }
                        </ThemedText>

                    </TouchableOpacity>
                )}

                {(proofImages[assignmentData.id]?.length || 0) > 0 && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.7}
                        onPress={() => finishTrip(
                            assignmentData.id,
                            assignmentData.externalLoad,
                            assignmentData.fleetCoordinatorId.id,
                            assignmentData.cargoCoordinator.id
                        )}
                    >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                        <ThemedText style={styles.actionButtonText}>
                            Complete
                        </ThemedText>
                    </TouchableOpacity>
                )}


                {/* OWNER / BROKER CONFIRM */}
                {(currentRole.accType === "fleet" || currentRole.accType === "brokerage") &&
                    assignmentData.status === "delivery_submitted" && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                console.log("Confirm delivery");
                            }}
                        >
                            <Ionicons
                                name="checkmark-done-circle-outline"
                                size={16}
                                color={accent}
                            />

                            <ThemedText style={styles.actionButtonText}>
                                Confirm
                            </ThemedText>

                        </TouchableOpacity>
                    )}



                {/* HANDLE ISSUES */}
                {assignmentData.status === "IN_TRANSIT" && (currentRole.accType === "fleet" || currentRole.accType === "brokerage") && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            console.log("Open dispute");
                        }}
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={16}
                            color={accent}
                        />

                        <ThemedText style={styles.actionButtonText}>
                            reolve Issues
                        </ThemedText>

                    </TouchableOpacity>
                )}



                {assignmentData.status === 'ASSIGNED' && currentRole.accType === "fleet" && <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        console.log("Open dispute");
                    }}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Reject Load
                    </ThemedText>

                </TouchableOpacity>}


                {assignmentData.status === "COMPLETED" && assignmentData.externalLoad && currentRole.accType === "brokerage" && <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => cargoOwnerConfirmation(
                        assignmentData.id,
                        assignmentData.shipper)}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Confrim Delivered
                    </ThemedText>

                </TouchableOpacity>}


                {assignmentData.status === "COMPLETED" && assignmentData.source === "Fleet" && currentRole.accType === "fleet" && <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {

                    }}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Confrim Delivered
                    </ThemedText>

                </TouchableOpacity>}




            </View>

            {/* NOTES + ISSUES (persisted to Firestore, per-assignment) */}
            <AssignmentActivityPanel
                assignmentId={assignmentData.id}
                fleetId={assignmentData?.fleetDetails?.id}
                initialNotesCount={assignmentData.notesCount}
                initialIssuesCount={assignmentData.issuesCount}
                cargoRate={assignmentData.loadDetails.rate}
                cargoRateCurrency={assignmentData.loadDetails.currency}
                cargoRateModel={assignmentData.loadDetails.model}
                cargoRatePerKm={assignmentData.loadDetails.ratePerKm}
                cargoPaymentTerms={assignmentData.loadDetails.paymentTerms}
                fleetCoordinator={assignmentData.fleetCoordinator}
                numberPlate={assignmentData.truckDetails.numberPlate}
                truckId={assignmentData.truckDetails.truckId}
            />

        </View>
    );

}
const styles = StyleSheet.create({
    cargoItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    cargoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    cargoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },

    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    statusText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },

    cargoDetails: {
        gap: 8,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    detailText: {
        fontSize: 14,
        flex: 1,
    },

    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },

    actionButtonText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },

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
