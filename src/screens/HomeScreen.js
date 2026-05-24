import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { ROLES } from "../constants/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function HomeScreen({ user, notifications, atas, presenceEvents, finance }) {
  const total = finance.reduce((s, f) => s + f.amount, 0);
  const recent = notifications.slice().reverse().slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Rotaract</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{ROLES[user.role]}</Text></View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.greeting}>Olá, bem-vindo 👋</Text>
        <Text style={styles.name}>{user.name.split(" ")[0]}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Avisos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{atas.length}</Text>
            <Text style={styles.statLabel}>Atas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{presenceEvents.length}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avisos Recentes</Text>
        {recent.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>🔔 Nenhum aviso ainda</Text></View>
        )}
        {recent.map(n => (
          <View style={styles.card} key={n.id}>
            <Text style={styles.notifTitle}>{n.title}</Text>
            <Text style={styles.notifMeta}>{formatDate(n.date)} {n.location ? `· 📌 ${n.location}` : ""}</Text>
            {n.description ? <Text style={styles.notifDesc}>{n.description}</Text> : null}
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Saldo do Clube</Text>
        <View style={[styles.card, styles.cardPink]}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={[styles.balanceValue, { color: total >= 0 ? COLORS.GREEN : COLORS.RED }]}>
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  contentContainer: { paddingBottom: 32 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  topbarTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  badge: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  hero: { padding: 20, backgroundColor: "rgba(233,20,103,0.03)" },
  greeting: { fontSize: 13, color: COLORS.TEXT_MUTED },
  name: { fontSize: 24, fontWeight: "800", color: COLORS.PRIMARY, marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 14, padding: 14, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY },
  statLabel: { fontSize: 11, color: COLORS.TEXT_MUTED, marginTop: 2, textTransform: "uppercase" },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 12 },
  card: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardPink: { backgroundColor: "rgba(233,20,103,0.05)", borderColor: "rgba(233,20,103,0.2)" },
  notifTitle: { fontSize: 14, fontWeight: "600", color: "#fff" },
  notifMeta: { fontSize: 12, color: COLORS.TEXT_MUTED, marginTop: 4 },
  notifDesc: { fontSize: 13, color: "#888", marginTop: 6 },
  balanceLabel: { fontSize: 11, color: COLORS.TEXT_MUTED, textAlign: "center", textTransform: "uppercase", marginBottom: 4 },
  balanceValue: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#555", fontSize: 14 }
});