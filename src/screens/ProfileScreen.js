import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles"; // 👈 CSS global
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
    <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Perfil</Text>
        <TouchableOpacity style={themeStyles.btnAdd} onPress={editing ? saveProfile : () => setEditing(true)}>
          <Text style={themeStyles.btnAddText}>{editing ? "Salvar" : "Editar"}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.PRIMARY || "#0a84ff", justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>{user.avatar}</Text>
        </View>
        
        {editing ? (
          <TextInput style={[themeStyles.input, { width: "70%", textAlign: "center", marginBottom: 8 }]} value={form.name} onChangeText={t=>setForm(p=>({...p,name:t}))} outlineStyle="none" />
        ) : (
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{user.name}</Text>
        )}
        
        <View style={themeStyles.tagBlue}>
          <Text style={themeStyles.tagTextBlue}>{ROLES[user.role]}</Text>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={themeStyles.card}>
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e2026" }}>
            <Text style={themeStyles.metaText}>E-mail</Text>
            <Text style={{ fontSize: 14, color: "#fff", marginTop: 2 }}>{user.email}</Text>
          </View>
          
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e2026" }}>
            <Text style={themeStyles.metaText}>Telefone</Text>
            {editing ? (
              <TextInput style={[themeStyles.input, { marginTop: 4 }]} value={form.phone} onChangeText={t=>setForm(p=>({...p,phone:t}))} outlineStyle="none" />
            ) : (
              <Text style={{ fontSize: 14, color: "#fff", marginTop: 2 }}>{user.phone || "Não informado"}</Text>
            )}
          </View>

          <View style={{ paddingVertical: 12 }}>
            <Text style={themeStyles.metaText}>Bio</Text>
            {editing ? (
              <TextInput style={[themeStyles.input, { marginTop: 4 }]} multiline value={form.bio} onChangeText={t=>setForm(p=>({...p,bio:t}))} outlineStyle="none" />
            ) : (
              <Text style={{ fontSize: 14, color: "#fff", marginTop: 2 }}>{user.bio || "Sem bio"}</Text>
            )}
          </View>
        </View>

        <View style={themeStyles.card}>
          <Text style={[themeStyles.cardTitle, { marginBottom: 12, fontSize: 13, textTransform: "uppercase" }]}>Permissões do cargo</Text>
          {permissionsList.map(p => {
            const hasPerm = can(user.role, p.action);
            return (
              <View key={p.action} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}>
                <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                <Text style={{ flex: 1, color: "#a0aec0", fontSize: 14 }}>{p.label}</Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: hasPerm ? "rgba(52,199,89,0.15)" : "#1e2026" }}>
                  <Text style={{ color: hasPerm ? (COLORS.GREEN || "#34c759") : "#666", fontSize: 11, fontWeight: "600" }}>
                    {hasPerm ? "✓ Sim" : "— Não"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={{ backgroundColor: "rgba(255,59,48,0.1)", borderWidth: 1, borderColor: "rgba(255,59,48,0.2)", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 }} onPress={onLogout}>
          <Text style={{ color: COLORS.RED || "#ff3b30", fontWeight: "600", fontSize: 15 }}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}