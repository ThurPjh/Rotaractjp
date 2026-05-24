import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA71tZIUuUrwa3QLyiNubmskRU9EdumhwM",
  authDomain: "rotaractapp.firebaseapp.com",
  projectId: "rotaractapp",
  storageBucket: "rotaractapp.firebasestorage.app",
  messagingSenderId: "54598466760",
  appId: "1:54598466760:web:7a9d46c8b5bf4f349cf9fd",
  measurementId: "G-ZWDPPC96CW"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Firestore 
export const db = getFirestore(app);