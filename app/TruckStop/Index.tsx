import React, { useState, useEffect } from "react"
import { View, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert } from "react-native"
import ScreenWrapper from "@/components/ScreenWrapper"
import Heading from "@/components/Heading"
import { ThemedText } from "@/components/ThemedText"
import { useThemeColor } from '@/hooks/useThemeColor'
import { wp, hp } from '@/constants/common'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { openWhatsApp, getContactMessage } from '@/Utilities/whatsappUtils'
import { TruckStopCard } from '@/components/TruckStopCard'
import { TruckStop } from '@/types/types'
import { useAuth } from '@/context/AuthContext'
import { router, useFocusEffect } from 'expo-router'
import { fetchDocuments } from '@/db/operations'
import ImageViewing from 'react-native-image-viewing'
import { TruckStopPaymentModal } from '@/payments'

export default function Index() {
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const background = useThemeColor('background')
    const { user } = useAuth()

    const [truckStops, setTruckStops] = useState<TruckStop[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [lastVisible, setLastVisible] = useState<any>(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [showImageViewer, setShowImageViewer] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [currentImages, setCurrentImages] = useState<string[]>([])
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false)
    const [selectedTruckStop, setSelectedTruckStop] = useState<TruckStop | null>(null)

    useEffect(() => {
        loadTruckStops()
    }, [])

    // Refresh data when screen comes into focus (after adding new truck stop)
    useFocusEffect(
        React.useCallback(() => {
            loadTruckStops()
        }, [])
    )

    const loadTruckStops = async () => {
        setLoading(true)
        try {
            const result = await fetchDocuments('TruckStops', 10)
            if (result && result.data) {
                const truckStopsData = result.data.map((doc: any) => ({
                    id: doc.id,
                    ...doc,
                    createdAt: doc.timeStamp?.toDate() || new Date(),
                    updatedAt: null
                })) as TruckStop[]
                setTruckStops(truckStopsData)
                setLastVisible(result.lastVisible)
            }
        } catch (error) {
            console.error('Error loading truck stops:', error)
            Alert.alert('Error', 'Failed to load truck stops')
        } finally {
            setLoading(false)
        }
    }

    const loadMoreTruckStops = async () => {
        if (loadingMore || !lastVisible) return

        setLoadingMore(true)
        try {
            const result = await fetchDocuments('TruckStops', 10, lastVisible)
            if (result && result.data) {
                const newTruckStops = result.data.map((doc: any) => ({
                    id: doc.id,
                    ...doc,
                    createdAt: doc.timeStamp?.toDate() || new Date(),
                    updatedAt: null
                })) as TruckStop[]
                setTruckStops(prev => [...prev, ...newTruckStops])
                setLastVisible(result.lastVisible)
            }
        } catch (error) {
            console.error('Error loading more truck stops:', error)
        } finally {
            setLoadingMore(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadTruckStops()
        setRefreshing(false)
    }

    const handleAddTruckStop = () => {
        router.push('/TruckStop/AddTruckStop')
    }

    const handleImagePress = (images: string[], index: number) => {
        setCurrentImages(images)
        setCurrentImageIndex(index)
        setShowImageViewer(true)
    }

    const handleContactUs = () => {
        const message = getContactMessage('truckStop');
        openWhatsApp('+263787884434', message);
    };

    const handleTruckStopPayment = (truckStop: TruckStop) => {
        setSelectedTruckStop(truckStop);
        setIsPaymentModalVisible(true);
    };

    return (
        <ScreenWrapper>

            <Heading page='Truck Stop' rightComponent={<TouchableOpacity style={{ marginRight: wp(3) }} onPress={handleAddTruckStop}><ThemedText type='defaultSemiBold'>Add Truck Stop</ThemedText></TouchableOpacity>} />

            {/* Truck Stops List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ThemedText style={[styles.loadingText, { color: icon }]}>
                        Loading truck stops...
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={truckStops}
                    keyExtractor={(item) => item.id || ''}
                    renderItem={({ item }) => (
                        <TruckStopCard
                            truckStop={item}
                            onPress={() => {
                                // Handle truck stop press - could navigate to details
                                console.log('Truck stop pressed:', item.name)
                            }}
                            onImagePress={(images, index) => handleImagePress(images, index)}
                            onPaymentPress={handleTruckStopPayment}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[accent]}
                        />
                    }
                    onEndReached={loadMoreTruckStops}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="local-parking" size={wp(15)} color={icon} />
                            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: icon }]}>
                                No Truck Stops Available
                            </ThemedText>
                            <ThemedText style={[styles.emptyText, { color: icon }]}>
                                Be the first to add a truck stop in your area!
                            </ThemedText>
                        </View>
                    }
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.loadingMoreContainer}>
                                <ThemedText style={[styles.loadingMoreText, { color: icon }]}>
                                    Loading more truck stops...
                                </ThemedText>
                            </View>
                        ) : null
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}





            {/* Image Viewer */}
            <ImageViewing
                images={currentImages.map(uri => ({ uri }))}
                imageIndex={currentImageIndex}
                visible={showImageViewer}
                onRequestClose={() => setShowImageViewer(false)}
                presentationStyle="fullScreen"
                HeaderComponent={() => (
                    <View style={styles.imageViewerHeader}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowImageViewer(false)}
                        >
                            <Ionicons name="close" size={wp(6)} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Truck Stop Payment Modal */}
            <TruckStopPaymentModal
                isVisible={isPaymentModalVisible}
                onClose={() => setIsPaymentModalVisible(false)}
                truckStop={selectedTruckStop}
            />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        margin: wp(4),
        marginBottom: wp(2),
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: wp(10),
    },
    loadingText: {
        fontSize: wp(4),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: wp(15),
        paddingHorizontal: wp(4),
    },
    emptyTitle: {
        fontSize: wp(4.5),
        marginTop: wp(4),
        marginBottom: wp(2),
    },
    emptyText: {
        fontSize: wp(3.5),
        textAlign: 'center',
        lineHeight: wp(5),
    },
    loadingMoreContainer: {
        padding: wp(4),
        alignItems: 'center',
    },
    loadingMoreText: {
        fontSize: wp(3.5),
    },
    imageViewerHeader: {
        position: 'absolute',
        top: wp(12),
        right: wp(4),
        zIndex: 1,
    },
    closeButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: wp(6),
        padding: wp(2),
    },
    contactCard: {
        margin: wp(4),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    contactTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    contactDescription: {
        fontSize: wp(3.8),
        lineHeight: wp(5),
        marginBottom: wp(4),
        textAlign: 'center'
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        gap: wp(2)
    },
    contactButtonText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    placeholderText: {
        textAlign: 'center',
        fontSize: wp(3.5),
        marginTop: wp(4),
        paddingHorizontal: wp(4)
    },
    howItWorksCard: {
        margin: wp(4),
        marginBottom: wp(2),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    howItWorksHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(3),
        gap: wp(2)
    },
    howItWorksTitle: {
        fontWeight: 'bold',
        fontSize: wp(4.5)
    },
    stepsContainer: {
        gap: wp(2)
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3)
    },
    stepNumber: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepNumberText: {
        color: '#fff',
        fontSize: wp(4),
        fontWeight: 'bold'
    },
    stepText: {
        flex: 1,
        fontSize: wp(3.5),
        lineHeight: wp(4.5)
    },
    featuresContainer: {
        marginTop: wp(3),
        marginBottom: wp(3)
    },
    featuresTitle: {
        fontSize: wp(4),
        fontWeight: 'bold',
        marginBottom: wp(2)
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(2)
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.5),
        width: '48%',
        paddingVertical: wp(1)
    },
    featureText: {
        fontSize: wp(3.2),
        flex: 1
    }
})