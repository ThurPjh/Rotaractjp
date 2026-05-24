import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { COLORS } from "./constants/colors";

// Importações dos novos arquivos modularizados
import { INITIAL_FINANCE, INITIAL_NOTIFS, INITIAL_ATAS, INITIAL_PRESENCE } from "./constants/mockData";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import NotificationScreen from "./screens/NotificationScreen";
import AtasScreen from "./screens/AtasScreen";
import PresenceScreen from "./screens/PresenceScreen";
import FinanceScreen from "./screens/FinanceScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);
  const [atas, setAtas] = useState(INITIAL_ATAS);
  const [regimento, setRegimento] = useState(null);
  const [presenceEvents, setPresenceEvents] = useState(INITIAL_PRESENCE);
  const [finance, setFinance] = useState(INITIAL_FINANCE);

  const navItems = [
    { id: "home", icon: "🏠", label: "Início" },
    { id: "notif", icon: "🔔", label: "Avisos" },
    { id: "atas", icon: "📋", label: "Atas" },
    { id: "presence", icon: "✅", label: "Presença" },
    { id: "finance", icon: "💰", label: "Tesouro" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
        <StatusBar barStyle="light-content" />
        <LoginScreen onLogin={setUser} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.mainContent}>
        {tab === "home" && <HomeScreen user={user} notifications={notifications} atas={atas} presenceEvents={presenceEvents} finance={finance} />}
        {tab === "notif" && <NotificationScreen user={user} notifications={notifications} setNotifications={setNotifications} />}
        {tab === "atas" && <AtasScreen user={user} atas={atas} setAtas={setAtas} regimento={regimento} setRegimento={setRegimento} />}
        {tab === "presence" && <PresenceScreen user={user} presenceEvents={presenceEvents} setPresenceEvents={setPresenceEvents} />}
        {tab === "finance" && <FinanceScreen user={user} finance={finance} setFinance={setFinance} />}
        {tab === "profile" && <ProfileScreen user={user} setUser={setUser} onLogout={() => setUser(null)} />}
      </View>

      <View style={styles.bottomNav}>
        {navItems.map(n => {
          const isActive = tab === n.id;
          return (
            <TouchableOpacity key={n.id} style={styles.navItem} onPress={() => setTab(n.id)}>
              <Text style={[styles.navIcon, isActive && { color: COLORS.PRIMARY }]}>{n.icon}</Text>
              <Text style={[styles.navLabel, isActive && { color: COLORS.PRIMARY }]}>{n.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  mainContent: { flex: 1, paddingBottom: 10 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#0f0f0f", borderTopWidth: 1, borderColor: "#1e1e1e", paddingVertical: 10 },
  navItem: { alignItems: "center", justifyContent: "center" },
  navIcon: { fontSize: 20, color: "#444" },
  navLabel: { fontSize: 10, color: "#444", marginTop: 4, fontWeight: "500" },
});