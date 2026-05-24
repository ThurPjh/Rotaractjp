import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const q = query(collection(db, 'usuarios'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userData = { uid: credential.user.uid, ...snap.docs[0].data() };
        onLogin(userData);
      } else {
        setErr("Usuário não encontrado no banco.");
      }
    } catch (e) {
      console.log("ERRO:", e.code, e.message);
      setErr("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require("../../assets/rotaract.logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="seu@email.com" 
            placeholderTextColor="#444"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            value={pass} 
            onChangeText={setPass} 
            placeholder="••••••" 
            placeholderTextColor="#444"
            secureTextEntry
          />
        </View>

        {err ? <Text style={styles.errorText}>{err}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.BACKGROUND, alignItems: "center", padding: 24, paddingTop: 40 },
  logo: { width: 700, height: 300, marginBottom: 16, alignSelf: "center", marginLeft: 80 },
  form: { width: "100%", gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 },
  input: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.INPUT_BORDER, borderRadius: 12, padding: 14, color: COLORS.TEXT_WHITE, fontSize: 15 },
  button: { backgroundColor: COLORS.PRIMARY, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorText: { color: COLORS.RED, fontSize: 13 },
});
