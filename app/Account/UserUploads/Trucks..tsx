import React, { useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { auth, db } from '@/db/fireBaseConfig';
import { collection, onSnapshot, where, query, doc, deleteDoc } from 'firebase/firestore';
import AntDesign from 'react-native-vector-icons/AntDesign'; // Corrected import
import AccentRingLoader from '@/components/AccentRingLoader';
// import defaultImage from "../images/logo.jpg" //commented out because it is not used

interface TruckItem {
    id: string;
    CompanyName: string;
    fromLocation: string;
    toLocation: string;
    contact: string;
    imageUrl?: string; // Corrected to imageUrl and made optional
}

function PersonalAccTrucks() {
    const [spinnerItem, setSpinnerItem] = React.useState(false);
    const deleteLoad = async (id: string) => {
        setSpinnerItem(true);
        const loadsDocRef = doc(db, 'Trucks', id);
        await deleteDoc(loadsDocRef);
        setSpinnerItem(false);
    };


    const [loadIterms, setLoadedIterms] = React.useState<TruckItem[]>([]);
    useEffect(() => {
        try {
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const dataQuery = query(collection(db, "Trucks"), where("userId", "==", userId));

                const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
                    let loadedData: TruckItem[] = [];
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added' || change.type === 'modified') {
                            const dataWithId = { id: change.doc.id, ...change.doc.data() } as TruckItem;
                            loadedData.push(dataWithId);
                        }
                    });

                    setLoadedIterms(loadedData);
                });

                // Clean up function to unsubscribe from the listener when the component unmounts
                return () => unsubscribe();
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    const renderItems = loadIterms.map((item) => {
        return (
            <View style={styles.truckItemContainer} key={item.id}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.truckImage} />
                ) : (
                    // <Image source={defaultImage} style={styles.truckImage} /> // Commented out because defaultImage is not used
                    <Text>No Image</Text>
                )}
                <Text style={styles.truckName}>{item.CompanyName} </Text>
                <Text style={styles.location}> From {item.fromLocation} to {item.toLocation} </Text>
                <Text>contact {item.contact}</Text>

                {spinnerItem && <AccentRingLoader color="#007BFF" size={36} dotSize={8} />}
                <TouchableOpacity onPress={() => deleteLoad(item.id)}>
                    <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
            </View>
        );
    });
    return (
        <View style={{ paddingTop: 10 }}>
            <ScrollView>
                {loadIterms.length > 0 ? renderItems : <Text>Loading...... </Text>}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    truckItemContainer: {
        padding: 8,
        marginBottom: 8, //Added marginBottom to separate items
        backgroundColor: '#FFFFFF', // Added background color for better visibility
        borderRadius: 8, // Added border radius for a polished look
    },
    truckImage: {
        height: 250,
        borderRadius: 10,
        width: '100%', //Make image take full width
        resizeMode: 'cover'
    },
    truckName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6a0c0c',
        marginTop: 5,
    },
    location: {
        fontSize: 16,
        color: '#333',
        marginTop: 3,
    },
});

export default PersonalAccTrucks;
