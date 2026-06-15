import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Importações corretas para o ecossistema móvel
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Inicialização híbrida (Protege contra o travamento no celular físico)
let configurationsOfAuth;

try {
  configurationsOfAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Caso o Firebase já tenha sido inicializado em outra aba/instância
  configurationsOfAuth = getAuth(app);
}

export const auth = configurationsOfAuth;