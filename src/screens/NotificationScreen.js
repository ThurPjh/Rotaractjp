import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles"; // 👈 Importando o tema unificado
import { can } from "../constants/mockData";
import { formatDate } from "../utils/formatters";

export default function NotificationScreen({ user, notifications, setNotifications }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ type: "reuniao", title: "", date: "", location: "", description: "" });

  function addNotif() {
    if (!form.title || !form.date) return;
    setNotifications(prev => [...prev, { ...form, id: Date.now(), createdBy: user.name }]);
    setModalVisible(false);
    setForm({ type: "reuniao", title: "", date: "", location: "", description: "" });
  }

  const canAdd = can(user.role, "add_notification");

  return (
    <View style={themeStyles.container}>
      {/* Topbar unificada */}
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Notificações</Text>
        {canAdd && (
          <TouchableOpacity style={themeStyles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={themeStyles.btnAddText}>+ Criar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {notifications.length === 0 && (
          <View style={themeStyles.empty}>
            <Text style={themeStyles.emptyText}>🔔 Nenhuma notificação criada</Text>
          </View>
        )}
        
        {notifications.slice().reverse().map(n => (
          <View style={themeStyles.card} key={n.id}>
            <View style={themeStyles.cardHeader}>
              <View style={n.type === "reuniao" ? themeStyles.tagBlue : themeStyles.tagBlue}>
                <Text style={themeStyles.tagTextBlue}>{n.type === "reuniao" ? "📍 Reunião" : "📄 Ata"}</Text>
              </View>
              <Text style={themeStyles.metaText}>{formatDate(n.date)}</Text>
            </View>
            
            <Text style={themeStyles.cardTitle}>{n.title}</Text>
            {n.location ? <Text style={[themeStyles.metaText, { fontSize: 13 }]}>📌 {n.location}</Text> : null}
            {n.description ? <Text style={themeStyles.descText}>{n.description}</Text> : null}
          </View>
        ))}
      </ScrollView>

      {/* Modal de Nova Notificação */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
          <View style={themeStyles.formBox}>
            <Text style={themeStyles.topbarTitle}>Nova Notificação</Text>
            
            <Text style={themeStyles.label}>Título</Text>
            <TextInput style={themeStyles.input} value={form.title} onChangeText={t=>setForm(p=>({...p,title:t}))} placeholder="Ex: Reunião Ordinária" placeholderTextColor="#444" outlineStyle="none" />
            
            <Text style={themeStyles.label}>Data (AAAA-MM-DD)</Text>
            <TextInput style={themeStyles.input} value={form.date} onChangeText={t=>setForm(p=>({...p,date:t}))} placeholder="Ex: 2026-05-27" placeholderTextColor="#444" outlineStyle="none" />

            <Text style={themeStyles.label}>Localização</Text>
            <TextInput style={themeStyles.input} value={form.location} onChangeText={t=>setForm(p=>({...p,location:t}))} placeholder="Ex: Sede" placeholderTextColor="#444" outlineStyle="none" />

            <Text style={themeStyles.label}>Descrição</Text>
            <TextInput style={[themeStyles.input, themeStyles.textArea]} multiline value={form.description} onChangeText={t=>setForm(p=>({...p,description:t}))} placeholder="Detalhes..." placeholderTextColor="#444" outlineStyle="none" />

            <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
              <TouchableOpacity style={{ flex: 1, padding: 14, backgroundColor: "#1e2026", borderRadius: 12, alignItems: "center" }} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#a0aec0", fontWeight: "600" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[themeStyles.btnSave, { flex: 2, marginTop: 0 }]} onPress={addNotif}>
                <Text style={themeStyles.btnSaveText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}