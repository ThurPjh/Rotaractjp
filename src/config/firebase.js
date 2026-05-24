import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // adiciona

const firebaseConfig = {
  apiKey: "AIzaSyA71tZIUuUrwa3QLyiNubmskRU9EdumhwM",
  authDomain: "rotaractapp.firebaseapp.com",
  projectId: "rotaractapp",
  storageBucket: "rotaractapp.firebasestorage.app",
  messagingSenderId: "54598466760",
  appId: "1:54598466760:web:7a9d46c8b5bf4f349cf9fd",
  measurementId: "G-ZWDPPC96CW"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // adiciona
