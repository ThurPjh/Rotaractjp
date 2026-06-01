import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from "react-native";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles";
import { formatCurrency, formatDate } from "../utils/formatters";
import { Icon } from 'react-native-elements';
import { Calendar, MapPin, Users, FileText, Plus, Trash2 } from "lucide-react-native";


export default function HomeScreen({ user }) {
  // Estados dinâmicos para dados do Firestore
  const [reunioes, setReunioes] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [financas, setFinancas] = useState([]);
  const [atas, setAtas] = useState([]); 

  // Escuta os dados reais do Firebase em tempo real
  useEffect(() => {
    // 1. Escuta todas as reuniões para alimentar os contadores de avisos/eventos
    const qReunioes = query(collection(db, "reunioes"), orderBy("criadoEm", "desc"));
    const unsubscribeReunioes = onSnapshot(qReunioes, (snapshot) => {
      setReunioes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Escuta apenas as 3 últimas reuniões criadas para o card de "Avisos Recentes"
    const qRecentes = query(collection(db, "reunioes"), orderBy("criadoEm", "desc"), limit(3));
    const unsubscribeRecentes = onSnapshot(qRecentes, (snapshot) => {
      setRecentes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Escuta todo o histórico financeiro para calcular o saldo geral em tempo real
    const qFinancas = query(collection(db, "financas"));
    const unsubscribeFinancas = onSnapshot(qFinancas, (snapshot) => {
      setFinancas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 4. CORREÇÃO: Escuta em tempo real a tabela dedicada de atas
    const qAtas = query(collection(db, "atas"));
    const unsubscribeAtas = onSnapshot(qAtas, (snapshot) => {
      setAtas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Desconecta todos os listeners quando o usuário sai da tela
    return () => {
      unsubscribeReunioes();
      unsubscribeRecentes();
      unsubscribeFinancas();
      unsubscribeAtas();
    };
  }, []);

  // Tratamento resiliente do nome e cargo do usuário logado
  const nomeUsuario = user?.name || user?.nome || "Associado";
  const cargoUsuario = user?.role || user?.cargo || "Membro";

  // Cálculos baseados nos dados em tempo real do banco
  const total = financas.reduce((s, f) => s + f.amount, 0);

  // Mapeamento correto dos contadores do Dashboard
  const totalAvisos = reunioes.length;
  const totalAtas = atas.length; 
  const totalEventos = reunioes.length; 

  return (
    <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      
      <View style={themeStyles.topbar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={themeStyles.topbarTitle}>Rotaract</Text>
          <Image
            source={require("../../assets/alegre.png")}
            style={{ width: 100, height: 50, marginLeft: -30}}
          />
        </View>
        <View style={themeStyles.tagBlue}>
          <Text style={themeStyles.tagTextBlue}>
            {cargoUsuario.charAt(0).toUpperCase() + cargoUsuario.slice(1)}
          </Text>
        </View>
      </View>

      <View style={{ paddingVertical: 12, marginBottom: 16 }}>
        <Text style={[themeStyles.metaText, { fontSize: 13 }]}>Olá, bem-vindo 👋</Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.PRIMARY, marginBottom: 18, marginTop: 4 }}>
          {nomeUsuario.split(" ")[0]}
        </Text>
        
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={[themeStyles.card, { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 }]}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY }}>{totalAvisos}</Text>
            <Text style={[themeStyles.metaText, { fontSize: 10, marginTop: 4, textTransform: "uppercase", fontWeight: "600" }]}>Avisos</Text>
          </View>
          
          <View style={[themeStyles.card, { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 }]}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY }}>{totalAtas}</Text>
            <Text style={[themeStyles.metaText, { fontSize: 10, marginTop: 4, textTransform: "uppercase", fontWeight: "600" }]}>Atas</Text>
          </View>
          
          <View style={[themeStyles.card, { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 }]}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY }}>{totalEventos}</Text>
            <Text style={[themeStyles.metaText, { fontSize: 10, marginTop: 4, textTransform: "uppercase", fontWeight: "600" }]}>Eventos</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={[themeStyles.cardTitle, { marginBottom: 12, fontSize: 16 }]}>Avisos Recentes</Text>
        
        {recentes.length === 0 && (
          <View style={[themeStyles.card, { alignItems: "center", padding: 24 }]}>
            <Text style={themeStyles.emptyText}>🔔 Nenhum aviso ainda</Text>
          </View>
        )}

        {recentes.map(n => (
          <View style={themeStyles.card} key={n.id}>
            <View style={themeStyles.cardHeader}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                {n.title || n.titulo || "Reunião do Clube"}
              </Text>
            </View>
            <Text style={[themeStyles.metaText, { fontSize: 12, marginTop: 2 }]}>
              
              📅 {(n.date || n.data)} {n.location || n.local ? ` · 📌 ${n.location || n.local}` : ""}
            </Text>
            {(n.description || n.desc || n.pauta) ? (
              <Text style={[themeStyles.descText, { marginTop: 8 }]}>
                {n.description || n.desc || n.pauta}
              </Text>
            ) : null}
          </View>
        ))}

        <Text style={[themeStyles.cardTitle, { marginTop: 24, marginBottom: 12, fontSize: 16 }]}>Saldo do Clube</Text>
        <View style={[themeStyles.card, { 
          paddingVertical: 20, 
          alignItems: "center",
          backgroundColor: total >= 0 ? "rgba(52,199,89,0.03)" : "rgba(255,59,48,0.03)",
          borderColor: total >= 0 ? "rgba(52,199,89,0.15)" : "rgba(255,59,48,0.15)"
        }]}>
          <Text style={[themeStyles.metaText, { textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }]}>Saldo Disponível</Text>
          <Text style={{ fontSize: 28, fontWeight: "800", marginTop: 4, color: total >= 0 ? COLORS.GREEN : COLORS.RED }}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    
    </ScrollView>
  );
}