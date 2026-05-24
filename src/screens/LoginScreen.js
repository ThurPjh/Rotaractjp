import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { DEMO_USERS } from "../constants/mockData";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function handleLogin() {
    const user = DEMO_USERS.find(u => u.email === email && u.password === pass);
    if (user) {
      setErr("");
      onLogin(user);
    } else {
      setErr("E-mail ou senha incorretos.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <View style={styles.logoInner} />
      </View>
      <Text style={styles.title}>Rotaract</Text>
      <Text style={styles.subtitle}>João Pinheiro · MG</Text>
      
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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Demo: ana@rotaract.com (senha: 123)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.PRIMARY, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  logoInner: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: "#fff" },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.TEXT_MUTED, marginBottom: 40, letterSpacing: 1 },
  form: { width: "100%", gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 },
  input: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.INPUT_BORDER, borderRadius: 12, padding: 14, color: COLORS.TEXT_WHITE, fontSize: 15 },
  button: { backgroundColor: COLORS.PRIMARY, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorText: { color: COLORS.RED, fontSize: 13 },
  hint: { fontSize: 11, color: "#444", textAlign: "center", marginTop: 24 }
});