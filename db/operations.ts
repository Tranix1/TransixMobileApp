import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, runTransaction, serverTimestamp, startAfter, limit, orderBy, DocumentData, Query, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./fireBaseConfig";
import { getDownloadURL, ref, uploadBytes, } from "firebase/storage";
import { storage } from "./fireBaseConfig";
import { usePushNotifications, sendPushNotification } from "@/Utilities/pushNotification";
import { logAdminAction, getCurrentAdminInfo, ADMIN_ACTIONS } from "@/Utilities/adminActionTracker";
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
 * Update a document with admin tracking
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The ID of the document to update.
 * @param data - The data to update in the document.
 * @param action - The admin action being performed.
 * @param targetType - The type of target being modified.
 * @param targetName - Optional name of the target.
 * @param details - Optional details about the action.
 */
export const updateDocumentWithAdminTracking = async (
    collectionName: string,
    docId: string,
    data: object,
    action: string,
    targetType: 'truck' | 'user' | 'load' | 'account' | 'admin',
    targetName?: string,
    details?: string
) => {
    try {
        // Get current admin info
        const adminInfo = getCurrentAdminInfo();

        // Update the document with admin tracking
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            lastModifiedBy: adminInfo.adminId,
            lastModifiedByEmail: adminInfo.adminEmail,
            lastModifiedAt: new Date().toISOString()
        });

        // Log the admin action
        await logAdminAction({
            action,
            targetType,
            targetId: docId,
            targetName,
            details,
            newData: data
        });

        return true;
    } catch (error) {
        console.error("Error updating document with admin tracking:", error);
        throw error;
    }
};

/**
 * Update a document in a Firestore collection, or create it if it doesn't exist.
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The ID of the document to update or create.
 * @param data - The data to update/set in the document.
 */
export const updateOrCreateDocument = async (collectionName: string, docId: string, data: object) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating/creating document:", error);
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

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Request timed out after 10 seconds. Please check your internet connection."));
            }, 10000); // 10 seconds
        });

        const querySnapshotPromise = getDocs(dataQuery);

        const querySnapshot = await Promise.race([querySnapshotPromise, timeoutPromise]) as any;

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

export const isTrackingAgent = async (userId: string) => {
    try {
        const q = query(collection(db, "trackingAgents"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking tracking agent existence:", error);
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
export const getUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "personalData"));
        const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const getUsersByReferrerId = async (referrerId: string) => {
    try {
        const q = query(collection(db, "personalData"), where("referrerId", "==", referrerId));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return users;
    } catch (error) {
        console.error("Error fetching users by referrer ID:", error);
        throw error;
    }
};

export const searchUsersByEmail = async (email: string) => {
    try {
        const q = query(collection(db, "personalData"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
            id: doc.id, // Document ID
            uid: doc.data().uid, // Firebase Auth UID
            ...doc.data()
        }));
        return users;
    } catch (error) {
        console.error("Error searching users by email:", error);
        throw error;
    }
};

export const addTrackingAgent = async (salesmanId: string, agentId: string) => {
    try {
        const agentRef = doc(db, "trackingAgents", agentId);
        await setDoc(agentRef, { userId: agentId, salesmanId: salesmanId, createdAt: serverTimestamp() });
    } catch (error) {
        console.error("Error adding tracking agent:", error);
        throw error;
    }
};

export const isServiceStationOwner = async (userId: string) => {
    try {
        const q = query(collection(db, "serviceStationOwners"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking service station owner existence:", error);
        throw error;
    }
};

export const addServiceStationOwner = async (adminId: string, ownerId: string) => {
    try {
        const ownerRef = doc(db, "serviceStationOwners", ownerId);
        await setDoc(ownerRef, { userId: ownerId, adminId: adminId, createdAt: serverTimestamp() });
    } catch (error) {
        console.error("Error adding service station owner:", error);
        throw error;
    }
};

export const validateReferrer = async (referrerEmail: string) => {
    try {
        const q = query(collection(db, "personalData"), where("email", "==", referrerEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { exists: false, referrerId: null };
        }

        const referrerDoc = querySnapshot.docs[0];
        return {
            exists: true,
            referrerId: referrerDoc.id,
            referrerData: referrerDoc.data()
        };
    } catch (error) {
        console.error("Error validating referrer:", error);
        throw error;
    }
};

export const validateReferrerCode = async (referrerCode: string) => {
    try {
        const q = query(collection(db, "referrers"), where("referrerCode", "==", referrerCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { exists: false, referrerId: null, referrerData: null };
        }

        const referrerDoc = querySnapshot.docs[0];
        return {
            exists: true,
            referrerId: referrerDoc.id,
            referrerData: { id: referrerDoc.id, ...referrerDoc.data() }
        };
    } catch (error) {
        console.error("Error validating referrer code:", error);
        throw error;
    }
};

export const getReferrerByCode = async (referrerCode: string) => {
    try {
        const q = query(collection(db, "referrers"), where("referrerCode", "==", referrerCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { exists: false, referrerData: null };
        }

        const referrerDoc = querySnapshot.docs[0];
        return {
            exists: true,
            referrerData: { id: referrerDoc.id, ...referrerDoc.data() }
        };
    } catch (error) {
        console.error("Error getting referrer by code:", error);
        throw error;
    }
};

/**
 * Get referral code for a specific user
 * @param userId - The ID of the user (can be either document ID or Firebase UID)
 */
export const getReferralCodeByUserId = async (userEmail: string) => {
    try {
        // Direct search for referral using email
        const q = query(collection(db, "referrers"), where("userEmail", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { exists: false, referrerData: null };
        }

        const referrerDoc = querySnapshot.docs[0];
        const data = referrerDoc.data();
        return {
            exists: true,
            referrerData: { id: referrerDoc.id, ...data }
        };
    } catch (error) {
        console.error("Error getting referral code:", error);
        throw error;
    }
};

export const getAllReferrers = async () => {
    try {
        const q = query(collection(db, "referrers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const referrers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return referrers;
    } catch (error) {
        console.error("Error getting all referrers:", error);
        throw error;
    }
};

export const generateUniqueReferrerCode = async (): Promise<string> => {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        // Generate a 6-character alphanumeric code
        code = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            const validation = await validateReferrerCode(code);
            if (!validation.exists) {
                isUnique = true;
            }
        } catch (error) {
            console.error("Error checking code uniqueness:", error);
            // If there's an error checking, assume it's unique to avoid infinite loop
            isUnique = true;
        }

        attempts++;
    }

    if (!isUnique) {
        // Fallback: add timestamp to ensure uniqueness
        code = Math.random().toString(36).substring(2, 6).toUpperCase() + Date.now().toString().slice(-2);
    }

    return code!;
};

export const generateUniqueUserId = async (): Promise<string> => {
    let userId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        // Generate a unique user ID (you can customize this format)
        userId = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        try {
            const q = query(collection(db, "personalData"), where("uid", "==", userId));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                isUnique = true;
            }
        } catch (error) {
            console.error("Error checking user ID uniqueness:", error);
            isUnique = true;
        }

        attempts++;
    }

    if (!isUnique) {
        // Fallback: use timestamp + random string
        userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    }

    return userId!;
};

/**
 * Approve a load
 * @param loadId - The ID of the load to approve
 * @param approvedBy - The ID of the user who approved the load
 */
export const approveLoad = async (loadId: string, approvedBy: string) => {
    try {
        const adminInfo = getCurrentAdminInfo();
        const loadRef = doc(db, 'Cargo', loadId);
        await updateDoc(loadRef, {
            approvalStatus: 'approved',
            isApproved: true,
            approvedAt: Date.now().toString(),
            approvedBy: approvedBy,
            approvedByEmail: adminInfo.adminEmail,
            lastModifiedBy: adminInfo.adminId,
            lastModifiedByEmail: adminInfo.adminEmail,
            lastModifiedAt: new Date().toISOString()
        });

        // Log the admin action
        await logAdminAction({
            action: ADMIN_ACTIONS.APPROVE_LOAD,
            targetType: 'load',
            targetId: loadId,
            details: 'Load approved by admin'
        });

        return true;
    } catch (error) {
        console.error("Error approving load:", error);
        throw error;
    }
};

/**
 * Reject a load
 * @param loadId - The ID of the load to reject
 * @param rejectedBy - The ID of the user who rejected the load
 * @param rejectionReason - The reason for rejection
 */
export const rejectLoad = async (loadId: string, rejectedBy: string, rejectionReason: string) => {
    try {
        const adminInfo = getCurrentAdminInfo();
        const loadRef = doc(db, 'Cargo', loadId);
        await updateDoc(loadRef, {
            approvalStatus: 'rejected',
            isApproved: false,
            rejectedAt: Date.now().toString(),
            rejectedBy: rejectedBy,
            rejectedByEmail: adminInfo.adminEmail,
            rejectionReason: rejectionReason,
            lastModifiedBy: adminInfo.adminId,
            lastModifiedByEmail: adminInfo.adminEmail,
            lastModifiedAt: new Date().toISOString()
        });

        // Log the admin action
        await logAdminAction({
            action: ADMIN_ACTIONS.DECLINE_LOAD,
            targetType: 'load',
            targetId: loadId,
            details: `Load rejected: ${rejectionReason}`
        });

        return true;
    } catch (error) {
        console.error("Error rejecting load:", error);
        throw error;
    }
};

/**
 * Approve a load account
 * @param accountId - The ID of the account to approve
 * @param approvedBy - The ID of the user who approved the account
 */
export const approveLoadAccount = async (accountId: string, approvedBy: string) => {
    try {
        const adminInfo = getCurrentAdminInfo();
        const accountRef = doc(db, 'cargoPersonalDetails', accountId);
        await updateDoc(accountRef, {
            approvalStatus: 'approved',
            isApproved: true,
            approvedAt: Date.now().toString(),
            approvedBy: approvedBy,
            approvedByEmail: adminInfo.adminEmail,
            lastModifiedBy: adminInfo.adminId,
            lastModifiedByEmail: adminInfo.adminEmail,
            lastModifiedAt: new Date().toISOString()
        });

        // Get the account details to find the userId and update all user loads
        const accountDoc = await getDoc(accountRef);
        if (accountDoc.exists()) {
            const accountData = accountDoc.data();
            const userId = accountData.userId;

            if (userId) {
                // Update all loads belonging to this user
                await updateUserLoadsAccountApproval(userId);
            }
        }

        // Log the admin action
        await logAdminAction({
            action: ADMIN_ACTIONS.APPROVE_USER,
            targetType: 'account',
            targetId: accountId,
            details: 'Load account approved by admin'
        });

        return true;
    } catch (error) {
        console.error("Error approving load account:", error);
        throw error;
    }
};

/**
 * Update all loads for a user to set personalAccTypeIsApproved to true
 * @param userId - The ID of the user whose loads should be updated
 */
export const updateUserLoadsAccountApproval = async (userId: string) => {
    try {
        // Update all loads belonging to this user to set personalAccTypeIsApproved to true
        const loadsQuery = query(
            collection(db, 'Cargo'),
            where('userId', '==', userId)
        );
        const loadsSnapshot = await getDocs(loadsQuery);

        if (!loadsSnapshot.empty) {
            const loadUpdatePromises = loadsSnapshot.docs.map(loadDoc =>
                updateDoc(doc(db, 'Cargo', loadDoc.id), {
                    personalAccTypeIsApproved: true
                })
            );
            await Promise.all(loadUpdatePromises);
            console.log(`Updated ${loadsSnapshot.docs.length} loads for user ${userId}`);
        }
        return true;
    } catch (error) {
        console.error("Error updating user loads account approval:", error);
        throw error;
    }
};

/**
 * Reject a load account
 * @param accountId - The ID of the account to reject
 * @param rejectedBy - The ID of the user who rejected the account
 * @param rejectionReason - The reason for rejection
 */
export const rejectLoadAccount = async (accountId: string, rejectedBy: string, rejectionReason: string) => {
    try {
        const accountRef = doc(db, 'cargoPersonalDetails', accountId);
        await updateDoc(accountRef, {
            approvalStatus: 'rejected',
            isApproved: false,
            rejectedAt: Date.now().toString(),
            rejectedBy: rejectedBy,
            rejectionReason: rejectionReason
        });
        return true;
    } catch (error) {
        console.error("Error rejecting load account:", error);
        throw error;
    }
};