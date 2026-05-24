import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles"; // 👈 Seu CSS global importado
import { ROLES } from "../constants/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function HomeScreen({ user, notifications, atas, presenceEvents, finance }) {
  const total = finance.reduce((s, f) => s + f.amount, 0);
  const recent = notifications.slice().reverse().slice(0, 3);

  return (
    <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      
      {/* Topbar unificada com o Badge de cargo do usuário */}
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Rotaract</Text>
        <View style={themeStyles.tagBlue}>
          <Text style={themeStyles.tagTextBlue}>{ROLES[user.role]}</Text>
        </View>
      </View>

      {/* Seção Hero de boas-vindas com contadores analíticos */}
      <View style={{ paddingVertical: 12, marginBottom: 16 }}>
        <Text style={[themeStyles.metaText, { fontSize: 13 }]}>Olá, bem-vindo 👋</Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.PRIMARY || "#0a84ff", marginBottom: 18, marginTop: 4 }}>
          {user.name.split(" ")[0]}
        </Text>
        
        {/* Linha com os mini cards indicadores */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={[themeStyles.card, { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 }]}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY || "#0a84ff" }}>{notifications.length}</Text>
            <Text style={[themeStyles.metaText, { fontSize: 10, marginTop: 4, textTransform: "uppercase", fontWeight: "600" }]}>Avisos</Text>
          </View>
          
          <View style={[themeStyles.card, { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 }]}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY || "#0a84ff" }}>{atas.length}</Text>
            <Text style={[themeStyles.metaText, { fontSize: 10, marginTop: 4, textTransform: "uppercase", fontWeight: "600" }]}>Atas</Text>
          </View>
          
          <View style={[themeStyles.card, { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 }]}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY || "#0a84ff" }}>{presenceEvents.length}</Text>
            <Text style={[themeStyles.metaText, { fontSize: 10, marginTop: 4, textTransform: "uppercase", fontWeight: "600" }]}>Eventos</Text>
          </View>
        </View>
      </View>

      {/* Seção de Conteúdos Interativos */}
      <View style={{ marginTop: 8 }}>
        <Text style={[themeStyles.cardTitle, { marginBottom: 12, fontSize: 16 }]}>Avisos Recentes</Text>
        
        {recent.length === 0 && (
          <View style={[themeStyles.card, { alignItems: "center", padding: 24 }]}>
            <Text style={themeStyles.emptyText}>🔔 Nenhum aviso ainda</Text>
          </View>
        )}

        {recent.map(n => (
          <View style={themeStyles.card} key={n.id}>
            <View style={themeStyles.cardHeader}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>{n.title}</Text>
            </View>
            <Text style={[themeStyles.metaText, { fontSize: 12 }]}>
              📅 {formatDate(n.date)} {n.location ? ` · 📌 ${n.location}` : ""}
            </Text>
            {n.description ? (
              <Text style={[themeStyles.descText, { marginTop: 8 }]}>{n.description}</Text>
            ) : null}
          </View>
        ))}

        {/* Caixa de Saldo Consolidado do Clube */}
        <Text style={[themeStyles.cardTitle, { marginTop: 24, marginBottom: 12, fontSize: 16 }]}>Saldo do Clube</Text>
        <View style={[themeStyles.card, { 
          paddingVertical: 20, 
          alignItems: "center",
          backgroundColor: total >= 0 ? "rgba(52,199,89,0.03)" : "rgba(255,59,48,0.03)",
          borderColor: total >= 0 ? "rgba(52,199,89,0.15)" : "rgba(255,59,48,0.15)"
        }]}>
          <Text style={[themeStyles.metaText, { textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }]}>Saldo Disponível</Text>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: "800", 
            marginTop: 4,
            color: total >= 0 ? COLORS.GREEN || "#34c759" : COLORS.RED || "#ff3b30" 
          }}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}