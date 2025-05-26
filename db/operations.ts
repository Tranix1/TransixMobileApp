import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, runTransaction, serverTimestamp, startAfter, limit, orderBy, DocumentData, Query, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../app/components/config/fireBase";
import { getDownloadURL, ref, uploadBytes, } from "firebase/storage";
import { storage } from "./fireBaseConfig";
/**
 * Add a document to a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param data - The data to add to the collection.
 */


export const addDocument = async (
    collectionName: string,
    data: object

) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            timeStamp: serverTimestamp(),
            userId: auth.currentUser?.uid,
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding document:", error);
        throw error;
    }
};

/**
 * Update a document in a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The ID of the document to update.
 * @param data - The data to update in the document.
 */
export const updateDocument = async (collectionName: string, docId: string, data: object) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
};

/**
 * Delete a document from a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The ID of the document to delete.
 */
export const deleteDocument = async (collectionName: string, docId: string) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
};

/**
 * Fetch documents from a Firestore collection with optional filters.
 * @param collectionName - The name of the Firestore collection.
 * @param filters - Optional filters for the query.
 */
export const fetchDocuments = async (
    collectionName: string,
    limitCount: number = 10,
    startAfterDoc?: any,
    filters: Array<any> = []
) => {
    try {
        let dataQuery: Query<DocumentData> = query(
            collection(db, collectionName),
            orderBy('timeStamp', "desc"), // ensure the field exists
            limit(limitCount),
        );

        if (startAfterDoc) {
            dataQuery = query(dataQuery, startAfter(startAfterDoc));
        }

        if (filters.length > 0) {
            dataQuery = query(dataQuery, ...filters);
        }

        const querySnapshot = await getDocs(dataQuery);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return { data, lastVisible };
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
};


/**
 * Listen to real-time updates in a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param callback - A callback function to handle the updates.
 * @param filters - Optional filters for the query.
 */
export const listenToCollection = (collectionName: string, callback: Function, filters: Array<any> = []) => {
    try {
        let dataQuery: Query<DocumentData> = collection(db, collectionName);
        if (filters.length > 0) {
            dataQuery = query(dataQuery, ...filters);
        }
        return onSnapshot(dataQuery, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callback(data);
        });
    } catch (error) {
        console.error("Error listening to collection:", error);
        throw error;
    }
};

/**
 * Run a Firestore transaction.
 * @param docPath - The path to the document to update in the transaction.
 * @param transactionCallback - A callback function to handle the transaction logic.
 */


type TransactionCallback = (data: any) => { [key: string]: any };

export const runFirestoreTransaction = async (
    docPath: string,
    transactionCallback: TransactionCallback
): Promise<void> => {
    try {
        const docRef = doc(db, docPath);
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(docRef);

            const updatedData = transactionCallback(docSnap.data());
            if (updatedData && typeof updatedData === "object") {
                transaction.update(docRef, updatedData);
            }
        });
    } catch (error) {
        console.error("Error running transaction:", error);
        throw error;
    }
};


/**
 * Paginate through Firestore documents.
 * @param collectionName - The name of the Firestore collection.
 * @param orderByField - The field to order by.
 * @param lastVisible - The last visible document from the previous query.
 * @param limitCount - The number of documents to fetch.
 */
export const paginateDocuments = async (collectionName: string, orderByField: string, lastVisible: any = null, limitCount: number = 1) => {
    try {
        let dataQuery = query(collection(db, collectionName), orderBy(orderByField, "desc"), limit(limitCount));
        if (lastVisible) {
            dataQuery = query(dataQuery, startAfter(lastVisible));
        }
        const querySnapshot = await getDocs(dataQuery);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error paginating documents:", error);
        throw error;
    }
};

/**
 * Check if a document exists in a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param filters - Filters to apply to the query.
 */
export const checkDocumentExists = async (collectionName: string, filters: Array<any>) => {
    try {
        const dataQuery = query(collection(db, collectionName), ...filters);
        const querySnapshot = await getDocs(dataQuery);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking document existence:", error);
        throw error;
    }
};

// export const AddUser = async (userId: string, userData: object) => {
//     try {
//         const userRef = doc(db, "personalData", userId); // Custom ID
//         await setDoc(userRef, userData, { merge: true });

//         return true;
//     } catch (error) {
//         console.error("Error adding user:", error);
//         return false;
//     }
// };

export const setDocuments = async (dbName: string, userData: object) => {
    try {
        if (auth.currentUser) {

            const userRef = doc(db, dbName, auth.currentUser?.uid); // Custom ID
            await setDoc(userRef, userData, { merge: true });

            return true;
        }
    } catch (error) {
        console.error("Error adding user:", error);
        return false;
    }
};

export const getDocById = async (
    dbName: string,
    setDocDetails: React.Dispatch<React.SetStateAction<any>> // use a better type if possible
) => {
    try {
        if (auth.currentUser) {
            const docRef = doc(db, dbName, auth.currentUser.uid);

            onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setDocDetails(docSnap.data()); // ✅ get the actual data
                } else {
                    console.log('No such document!');
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
};




export const readById = async (collectionName: string = 'laods', id: string) => {
    try {
        // Reference to the document by ID
        const postRef = doc(db, collectionName, id);
        // Fetch the document
        const docSnap = await getDoc(postRef);

        if (docSnap.exists()) {
            // Return the document data with its ID
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No document found with the given ID.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        return null;
    }
};





export const uploadImage = async (
    image: { uri: string },
    collectionName: string,
    setUploadImageUpdate: (status: string) => void,
    messageUpdate: string
) => {
    try {
        setUploadImageUpdate(`Adding Image ${messageUpdate}`)
        const response = await fetch(image.uri);
        const blob = await response.blob();

        const fileName = `${collectionName}/${Date.now()}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        setUploadImageUpdate(`Done Adding`)
        return imageUrl;
    } catch (error) {
        console.error('Image upload failed:', error);
        return null;
    }
};


// Example usage of the
// Add a Document
// await addDocument("Loads", { userId: "123", type: "Flatbed", location: "Zimbabwe" });


//Update a Document
// await updateDocument("Loads", "docId123", { location: "South Africa" });

// Delete a Document
// await deleteDocument("Loads", "docId123");

// Fetch Documents
// const loads = await fetchDocuments("Loads", [where("userId", "==", "123")]);

// console.log(loads);
// Listen to Collection
// const unsubscribe = listenToCollection("Loads", (data) => {
//   console.log("Real-time data:", data);
// }, [where("userId", "==", "123")]);
// unsubscribe(); // Call this to stop listening to updates

// Listen to Real - Time Updates
// const unsubscribe = listenToCollection("Loads", (data) => {
//     console.log("Real-time data:", data);
// });


//transaction
// await runFirestoreTransaction("newItems/changeOneByOne", (data) => {
//     data.users["123"] = 0;
//     return data;
// });


// Paginate Documents
// const firstPage = await paginateDocuments("Loads", "timeStamp", null, 10);
// console.log("First page:", firstPage);
// const lastVisible = firstPage[firstPage.length - 1];
// const secondPage = await paginateDocuments("Loads", "timeStamp", lastVisible, 10);
// console.log("Second page:", secondPage);
// const lastVisible = secondPage[secondPage.length - 1];

// const exists = await checkDocumentExists("Loads", [where("userId", "==", "123")]);