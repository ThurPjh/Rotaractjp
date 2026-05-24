import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
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
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Notificações</Text>
        {canAdd && (
          <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnAddText}>+ Criar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
        {notifications.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>🔔 Nenhuma notificação criada</Text></View>
        )}
        {notifications.slice().reverse().map(n => (
          <View style={styles.card} key={n.id}>
            <View style={styles.cardHeader}>
              <View style={[styles.tag, n.type === "reuniao" ? styles.tagPink : styles.tagBlue]}>
                <Text style={styles.tagText}>{n.type === "reuniao" ? "📍 Reunião" : "📄 Ata"}</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(n.date)}</Text>
            </View>
            <Text style={styles.cardTitle}>{n.title}</Text>
            {n.location ? <Text style={styles.locationText}>📌 {n.location}</Text> : null}
            {n.description ? <Text style={styles.descText}>{n.description}</Text> : null}
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Notificação</Text>
            
            <Text style={styles.label}>Título</Text>
            <TextInput style={styles.input} value={form.title} onChangeText={t=>setForm(p=>({...p,title:t}))} placeholder="Ex: Reunião Ordinária" placeholderTextColor="#444" />
            
            <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} value={form.date} onChangeText={t=>setForm(p=>({...p,date:t}))} placeholder="Ex: 2026-05-27" placeholderTextColor="#444" />

            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} value={form.location} onChangeText={t=>setForm(p=>({...p,location:t}))} placeholder="Ex: Sede" placeholderTextColor="#444" />

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, { height: 60 }]} multiline value={form.description} onChangeText={t=>setForm(p=>({...p,description:t}))} placeholder="Detalhes..." placeholderTextColor="#444" />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={addNotif}>
                <Text style={styles.btnSaveText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  topbarTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  scroll: { flex: 1 },
  btnAdd: { backgroundColor: COLORS.PRIMARY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnAddText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  card: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  tagPink: { backgroundColor: "rgba(233,20,103,0.15)" },
  tagBlue: { backgroundColor: "rgba(10,132,255,0.15)" },
  tagText: { fontSize: 11, fontWeight: "600", color: COLORS.PRIMARY_LIGHT },
  dateText: { fontSize: 12, color: "#555" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#fff", marginBottom: 4 },
  locationText: { fontSize: 13, color: COLORS.TEXT_MUTED },
  descText: { fontSize: 13, color: "#777", marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.CARD_BG, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 16 },
  label: { fontSize: 12, color: "#888", marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: COLORS.INPUT_BORDER, borderRadius: 12, padding: 12, color: "#fff" },
  modalFooter: { flexDirection: "row", gap: 10, marginTop: 24 },
  btnCancel: { flex: 1, padding: 14, backgroundColor: "#222", borderRadius: 12, alignItems: "center" },
  btnCancelText: { color: "#888", fontWeight: "600" },
  btnSave: { flex: 2, padding: 14, backgroundColor: COLORS.PRIMARY, borderRadius: 12, alignItems: "center" },
  btnSaveText: { color: "#fff", fontWeight: "600" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#555" }
});