import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { can, ROLES } from "../constants/mockData";

export default function ProfileScreen({ user, setUser, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, bio: user.bio, phone: user.phone });

  function saveProfile() {
    setUser(prev => ({ ...prev, ...form }));
    setEditing(false);
  }

  const permissionsList = [
    { action: "add_notification", label: "Criar notificações", icon: "🔔" },
    { action: "add_ata", label: "Gerenciar atas", icon: "📋" },
    { action: "add_presence", label: "Controle de presença", icon: "✅" },
    { action: "add_finance", label: "Lançamentos financeiros", icon: "💰" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Perfil</Text>
        <TouchableOpacity style={styles.btnEdit} onPress={editing ? saveProfile : () => setEditing(true)}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>{editing ? "Salvar" : "Editar"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.avatar}</Text></View>
        {editing ? (
          <TextInput style={styles.inputCenter} value={form.name} onChangeText={t=>setForm(p=>({...p,name:t}))} />
        ) : (
          <Text style={styles.profileName}>{user.name}</Text>
        )}
        <View style={styles.roleBadge}><Text style={styles.roleText}>{ROLES[user.role]}</Text></View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={{ fontSize: 18 }}>✉️</Text>
            <View>
              <Text style={styles.fieldLabel}>E-mail</Text>
              <Text style={styles.fieldValue}>{user.email}</Text>
            </View>
          </View>
          
          <View style={styles.fieldRow}>
            <Text style={{ fontSize: 18 }}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Telefone</Text>
              {editing ? (
                <TextInput style={styles.inputInline} value={form.phone} onChangeText={t=>setForm(p=>({...p,phone:t}))} />
              ) : (
                <Text style={styles.fieldValue}>{user.phone || "Não informado"}</Text>
              )}
            </View>
          </View>

          <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
            <Text style={{ fontSize: 18 }}>📝</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Bio</Text>
              {editing ? (
                <TextInput style={styles.inputInline} multiline value={form.bio} onChangeText={t=>setForm(p=>({...p,bio:t}))} />
              ) : (
                <Text style={styles.fieldValue}>{user.bio || "Sem bio"}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.permHeader}>Permissões do cargo</Text>
          {permissionsList.map(p => {
            const hasPerm = can(user.role, p.action);
            return (
              <View key={p.action} style={styles.permRow}>
                <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                <Text style={{ flex: 1, color: "#ccc", fontSize: 14 }}>{p.label}</Text>
                <View style={[styles.permTag, { backgroundColor: hasPerm ? "rgba(52,199,89,0.15)" : "rgba(255,255,255,0.05)" }]}>
                  <Text style={{ color: hasPerm ? COLORS.GREEN : "#666", fontSize: 12, fontWeight: "600" }}>
                    {hasPerm ? "✓ Sim" : "— Não"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.btnLogout} onPress={onLogout}>
          <Text style={styles.btnLogoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  topbarTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  btnEdit: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  hero: { alignItems: "center", paddingVertical: 24, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.PRIMARY, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  profileName: { fontSize: 22, fontWeight: "800", color: "#fff" },
  roleBadge: { backgroundColor: "rgba(233,20,103,0.15)", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
  roleText: { color: COLORS.PRIMARY_LIGHT, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  card: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 16, padding: 16, marginBottom: 12 },
  fieldRow: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e1e1e", alignItems: "center" },
  fieldLabel: { fontSize: 12, color: "#666" },
  fieldValue: { fontSize: 14, color: "#eee", marginTop: 2 },
  permHeader: { fontSize: 13, color: "#666", marginBottom: 12, textTransform: "uppercase" },
  permRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  permTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  inputCenter: { backgroundColor: "#111", color: "#fff", padding: 8, borderRadius: 10, width: "60%", textAlign: "center" },
  inputInline: { backgroundColor: "#111", color: "#fff", padding: 6, borderRadius: 8, marginTop: 4, fontSize: 14 },
  btnLogout: { backgroundColor: "rgba(255,59,48,0.1)", borderWidth: 1, borderColor: "rgba(255,59,48,0.2)", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnLogoutText: { color: COLORS.RED, fontWeight: "600", fontSize: 15 }
});