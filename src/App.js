import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { COLORS } from "./constants/colors";

// Importações dos arquivos modularizados e componentes
import { INITIAL_NOTIFS, INITIAL_PRESENCE } from "./constants/mockData";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import NotificationScreen from "./screens/NotificationScreen";
import AtasScreen from "./screens/AtasScreen";
import PresenceScreen from "./screens/PresenceScreen";
import FinanceScreen from "./screens/FinanceScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CriarAtaScreen from "./screens/CriarAtaScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);
  const [presenceEvents, setPresenceEvents] = useState(INITIAL_PRESENCE);

  // Array utilizando Emojis universais de alta compatibilidade
  const navItems = [
    { id: "home", icon: "🏠", label: "Início" },
    { id: "notif", icon: "🔔", label: "Avisos" },
    { id: "atas", icon: "📝", label: "Atas" },
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
        {tab === "home" && <HomeScreen user={user} />}
        {tab === "notif" && <NotificationScreen user={user} notifications={notifications} setNotifications={setNotifications} />}
        {tab === "atas" && <AtasScreen user={user} irParaCriarAta={() => setTab("criarAta")} />}
        {tab === "criarAta" && <CriarAtaScreen irParaListaAtas={() => setTab("atas")} />}
        {tab === "presence" && <PresenceScreen user={user} presenceEvents={presenceEvents} setPresenceEvents={setPresenceEvents} />}
        {tab === "finance" && <FinanceScreen user={user} />}
        {tab === "profile" && <ProfileScreen user={user} setUser={setUser} onLogout={() => setUser(null)} />}
      </View>

      {/* Menu Inferior Estilizado com Feedback de Seleção */}
      <View style={styles.bottomNav}>
        {navItems.map(n => {
          const isActive = tab === n.id;
          return (
            <TouchableOpacity 
              key={n.id} 
              style={[styles.navItem, isActive && styles.navItemActive]} 
              onPress={() => setTab(n.id)}
            >
              {/* O emoji herda a opacidade caso não esteja ativo, criando uma hierarquia visual limpa */}
              <Text style={[styles.navIcon, !isActive && { opacity: 0.4 }]}>
                {n.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && { color: COLORS.PRIMARY, fontWeight: "700" }]}>
                {n.label}
              </Text>
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
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    backgroundColor: "#0f0f0f", 
    borderTopWidth: 1, 
    borderColor: "#1e1e1e", 
    paddingVertical: 12,
    paddingHorizontal: 6
  },
  navItem: { 
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8
  },
  // Dá um efeito sutil de "pílula" cinza escura por trás do botão que estiver ativo
  navItemActive: {
    backgroundColor: "#16161a",
  },
  navIcon: { 
    fontSize: 20, 
    marginBottom: 2 
  },
  navLabel: { 
    fontSize: 10, 
    color: "#666", 
    marginTop: 2, 
    fontWeight: "500" 
  },
});