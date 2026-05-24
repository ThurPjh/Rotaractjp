import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { can } from "../constants/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function FinanceScreen({ user, finance, setFinance }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ type: "entrada", desc: "", amount: "", date: "", category: "" });

  const canEdit = can(user.role, "add_finance");
  const total = finance.reduce((s, f) => s + f.amount, 0);
  const totalEntradas = finance.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0);
  const totalSaidas = finance.filter(f => f.amount < 0).reduce((s, f) => s + Math.abs(f.amount), 0);

  function addTransaction() {
    const val = parseFloat(form.amount);
    if (!val || !form.desc || !form.date) return;
    const amount = form.type === "saida" ? -Math.abs(val) : Math.abs(val);
    setFinance(prev => [...prev, { ...form, amount, id: Date.now() }]);
    setModalVisible(false);
    setForm({ type: "entrada", desc: "", amount: "", date: "", category: "" });
  }

  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthData = months.map((m, i) => {
    const mv = finance.filter(f => new Date(f.date).getMonth() === i).reduce((s, f) => s + f.amount, 0);
    return { m, v: mv };
  });
  const maxAbs = Math.max(...monthData.map(d => Math.abs(d.v)), 1);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Tesouraria</Text>
        {canEdit && (
          <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnAddText}>+ Lançar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.card, styles.cardPink]}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={[styles.balanceVal, { color: total >= 0 ? COLORS.GREEN : COLORS.RED }]}>{formatCurrency(total)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.subCard, { borderColor: "rgba(52,199,89,0.2)" }]}>
            <Text style={styles.subCardLabel}>Entradas</Text>
            <Text style={[styles.subCardVal, { color: COLORS.GREEN }]}>{formatCurrency(totalEntradas)}</Text>
          </View>
          <View style={[styles.subCard, { borderColor: "rgba(255,59,48,0.2)" }]}>
            <Text style={styles.subCardLabel}>Saídas</Text>
            <Text style={[styles.subCardVal, { color: COLORS.RED }]}>{formatCurrency(totalSaidas)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.chartHeader}>Fluxo por Mês</Text>
          {monthData.map(({ m, v }) => (
            <View style={styles.chartRow} key={m}>
              <Text style={styles.chartLabel}>{m}</Text>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, { 
                  width: `${(Math.abs(v) / maxAbs) * 100}%`,
                  backgroundColor: v >= 0 ? COLORS.GREEN : COLORS.RED 
                }]} />
              </View>
              <Text style={[styles.chartVal, { color: v > 0 ? COLORS.GREEN : v < 0 ? COLORS.RED : "#555" }]}>
                {v !== 0 ? formatCurrency(v) : "—"}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Histórico</Text>
        {finance.slice().reverse().map(f => (
          <View style={styles.historyItem} key={f.id}>
            <View style={[styles.dot, { backgroundColor: f.amount > 0 ? COLORS.GREEN : COLORS.RED }]} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#ddd", fontSize: 14 }}>{f.desc}</Text>
              <Text style={{ color: "#555", fontSize: 12 }}>{formatDate(f.date)}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: f.amount > 0 ? COLORS.GREEN : COLORS.RED }}>
              {f.amount > 0 ? "+" : ""}{formatCurrency(f.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Lançamento</Text>
            
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <TouchableOpacity style={[styles.typeBtn, form.type === "entrada" && { backgroundColor: COLORS.GREEN }]} onPress={()=>setForm(p=>({...p,type:"entrada"}))}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, form.type === "saida" && { backgroundColor: COLORS.RED }]} onPress={()=>setForm(p=>({...p,type:"saida"}))}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Saída</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={styles.input} value={form.desc} onChangeText={t=>setForm(p=>({...p,desc:t}))} placeholder="Ex: Venda de rifas" placeholderTextColor="#444" />

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput style={styles.input} value={form.amount} onChangeText={t=>setForm(p=>({...p,amount:t}))} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#444" />

            <Text style={styles.label}>Data</Text>
            <TextInput style={styles.input} value={form.date} onChangeText={t=>setForm(p=>({...p,date:t}))} placeholder="AAAA-MM-DD" placeholderTextColor="#444" />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={addTransaction}>
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
  card: { backgroundColor: COLORS.CARD_BG, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardPink: { backgroundColor: "rgba(233,20,103,0.05)", borderColor: "rgba(233,20,103,0.2)", alignItems: "center" },
  balanceLabel: { fontSize: 12, color: "#888", textTransform: "uppercase", marginBottom: 6 },
  balanceVal: { fontSize: 32, fontWeight: "800" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  subCard: { flex: 1, backgroundColor: COLORS.CARD_BG, borderWidth: 1, padding: 14, borderRadius: 14 },
  subCardLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  subCardVal: { fontSize: 16, fontWeight: "700" },
  chartHeader: { fontSize: 12, fontWeight: "600", color: "#888", marginBottom: 12, textTransform: "uppercase" },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  chartLabel: { fontSize: 12, color: "#666", width: 30 },
  chartTrack: { flex: 1, height: 6, backgroundColor: "#222", borderRadius: 3, overflow: "hidden" },
  chartFill: { height: "100%", borderRadius: 3 },
  chartVal: { fontSize: 11, width: 70, textAlign: "right" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 12 },
  historyItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.CARD_BG, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, backgroundColor: "#222", borderRadius: 10, alignItems: "center" },
  label: { fontSize: 12, color: "#888", marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#111", borderWidth: 1, borderColor: COLORS.INPUT_BORDER, borderRadius: 12, padding: 12, color: "#fff" },
  modalFooter: { flexDirection: "row", gap: 10, marginTop: 24 },
  btnCancel: { flex: 1, padding: 14, backgroundColor: "#222", borderRadius: 12, alignItems: "center" },
  btnCancelText: { color: "#888", fontWeight: "600" },
  btnSave: { flex: 2, padding: 14, backgroundColor: COLORS.PRIMARY, borderRadius: 12, alignItems: "center" },
  btnSaveText: { color: "#fff", fontWeight: "600" }
});