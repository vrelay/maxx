// config/firebase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANdA8QnEmPrFVNo_cCuPC_W7Xta_7N5Sg",
  authDomain: "distribution-maxx.firebaseapp.com",
  projectId: "distribution-maxx",
  storageBucket: "distribution-maxx.firebasestorage.app",
  messagingSenderId: "309066651576",
  appId: "1:309066651576:web:45042196ea8102cacd214d",
  measurementId: "G-9GHJT72T7M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
// Initialize Storage
const storage = getStorage(app);

export { auth, storage, db };
export default app;
