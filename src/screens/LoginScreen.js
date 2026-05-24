import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Demo: ana@rotaract.com (senha: 123)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, alignItems: "center", padding: 24, paddingTop: 40 },

  logo: { width: 700, height: 300, marginBottom: 16, alignSelf: "center", marginLeft: 80 },
  
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