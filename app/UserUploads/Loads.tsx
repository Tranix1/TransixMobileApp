import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { auth, db } from '../components/config/fireBase';
import { collection, onSnapshot, where, query, doc, deleteDoc } from 'firebase/firestore';
import AntDesign from 'react-native-vector-icons/AntDesign'; // Corrected import


interface LoadItem {
    id: string;
    companyName: string;
    contact: string;
    typeofLoad: string;
    fromLocation: string;
    toLocation: string;
    ratePerTonne: string;
    paymentTerms: string;
    requirements: string;
    additionalInfo: string;
    timeStamp: number;
}

function PersonalAccLoads() {
    const [spinnerItem, setSpinnerItem] = React.useState(false);
    const deleteLoad = async (id: string) => {
        setSpinnerItem(true);
        const loadsDocRef = doc(db, 'Loads', id);
        await deleteDoc(loadsDocRef);
        setSpinnerItem(false);
    };

    const [loadIterms, setLoadedIterms] = React.useState<LoadItem[]>([]);
    useEffect(() => {
        try {
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const dataQuery = query(collection(db, "Loads"), where("userId", "==", userId));

                const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
                    let loadedData: LoadItem[] = [];
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added' || change.type === 'modified') {
                            const dataWithId = { id: change.doc.id, ...change.doc.data() } as LoadItem;
                            loadedData.push(dataWithId);
                        }
                    });

                    loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
                    setLoadedIterms(loadedData);
                });

                // Clean up function to unsubscribe from the listener when the component unmounts
                return () => unsubscribe();
            }
        } catch (err) {
            console.error(err);
        }
    }, [spinnerItem]);


    const renderItems = loadIterms.map((item) => {
        return (
            <View style={{ backgroundColor: "#DDDDDD", marginBottom: 8, padding: 6 }} key={item.id}>
                <Text style={{ color: '#6a0c0c', fontSize: 17, textAlign: 'center' }}>{item.companyName}</Text>
                <Text>Contact : {item.contact}</Text>
                <Text>type of load {item.typeofLoad} </Text>
                <Text>from {item.fromLocation} to {item.toLocation} </Text>
                <Text>Rate {item.ratePerTonne} </Text>
                <Text> payment terms {item.paymentTerms} </Text>
                <Text>Requirements {item.requirements} </Text>
                <Text>additional info {item.additionalInfo} </Text>

                {spinnerItem && <ActivityIndicator size={36} />}
                <TouchableOpacity onPress={() => deleteLoad(item.id)}>
                    <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
            </View>
        );
    });

    return (
        <View style={{ paddingTop: 10 }}>
            <ScrollView>
                {loadIterms.length > 0 ? renderItems : <Text>Loading.....</Text>}
            </ScrollView>
        </View>
    );
}
export default React.memo(PersonalAccLoads);
