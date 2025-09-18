
import { initializeApp } from "firebase/app";


import { getFirestore, } from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyD9lbKyl6QTiOZLEm7005VHI8lDgoYHTQA",
//   authDomain: "truckers-cace6.firebaseapp.com",
//   projectId: "truckers-cace6",
//   storageBucket: "truckers-cace6.appspot.com",
//   messagingSenderId: "355769728168",
//   appId: "1:355769728168:web:0960c6b40f0fcdfd58569d",
//   measurementId: "G-CJPGMZJBSD"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDY9dgj43xzhjfOLtW2rqPeUNOvXQTy_dw",
  authDomain: "transix-470b3.firebaseapp.com",
  projectId: "transix-470b3",
  storageBucket: "transix-470b3.firebasestorage.app",
  messagingSenderId: "426143331819",
  appId: "1:426143331819:web:658f6bd5a92a62508e55ae",
  measurementId: "G-95BHLPFXLG"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const storage = getStorage(app)

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const vertexAI = getVertexAI(app);
export const model = getGenerativeModel(vertexAI, {
    model: "gemini-2.5-flash", // or "gemini-2.5-flash"

});



