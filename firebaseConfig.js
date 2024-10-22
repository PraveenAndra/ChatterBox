import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAuth} from 'firebase/auth';
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBxDUBChclJWMzHkoSavFfCubYUVzzfteE",
    authDomain: "chatterbox-51b74.firebaseapp.com",
    projectId: "chatterbox-51b74",
    storageBucket: "chatterbox-51b74.appspot.com",
    messagingSenderId: "450170235967",
    appId: "1:450170235967:web:73de41e129dbddc10a9c8a",
    measurementId: "G-Z90TCSJRX0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
