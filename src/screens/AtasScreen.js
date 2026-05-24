import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { can } from "../constants/mockData";
import { formatDate } from "../utils/formatters";

export default function AtasScreen({ user, atas, setAtas, regimento, setRegimento }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", description: "", fileName: "" });

  const canAdd = can(user.role, "add_ata");

  function addAta() {
    if (!form.title || !form.date) return;
    setAtas(prev => [...prev, { ...form, id: Date.now(), createdBy: user.name }]);
    setModalVisible(false);
    setForm({ title: "", date: "", description: "", fileName: "" });
  }

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Atas</Text>
        {canAdd && (
          <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnAddText}>+ Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Atas de Reunião</Text>
        {atas.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>📋 Nenhuma ata registrada</Text></View>
        )}
        {atas.slice().reverse().map(a => (
          <View style={styles.card} key={a.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardMeta}>{formatDate(a.date)} · {a.createdBy}</Text>
                {a.description ? <Text style={styles.cardDesc}>{a.description}</Text> : null}
              </View>
              <Text style={{ fontSize: 24 }}>📄</Text>
            </View>
            {a.fileName ? (
              <View style={styles.attachment}><Text style={styles.attachmentText}>📎 {a.fileName}</Text></View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Ata</Text>
            
            <Text style={styles.label}>Título da Reunião</Text>
            <TextInput style={styles.input} value={form.title} onChangeText={t=>setForm(p=>({...p,title:t}))} placeholder="Ex: Reunião Ordinária #12" placeholderTextColor="#444" />
            
            <Text style={styles.label}>Data</Text>
            <TextInput style={styles.input} value={form.date} onChangeText={t=>setForm(p=>({...p,date:t}))} placeholder="AAAA-MM-DD" placeholderTextColor="#444" />
            
            <Text style={styles.label}>Observações</Text>
            <TextInput style={[styles.input, { height: 60 }]} multiline value={form.description} onChangeText={t=>setForm(p=>({...p,description:t}))} placeholder="Resumo..." placeholderTextColor="#444" />

            <Text style={styles.label}>Nome do Arquivo (Simulado)</Text>
            <TextInput style={styles.input} value={form.fileName} onChangeText={t=>setForm(p=>({...p,fileName:t}))} placeholder="ata_doc.pdf" placeholderTextColor="#444" />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={addAta}>
                <Text style={styles.btnSaveText}>Salvar</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 16 },
  card: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#fff" },
  cardMeta: { fontSize: 12, color: "#555", marginTop: 2 },
  cardDesc: { fontSize: 13, color: "#777", marginTop: 6 },
  attachment: { marginTop: 10, padding: 8, backgroundColor: "#111", borderRadius: 10 },
  attachmentText: { fontSize: 12, color: "#888" },
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
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#555" }
});