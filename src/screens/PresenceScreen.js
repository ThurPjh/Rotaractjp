import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { can, DEMO_USERS, ROLES } from "../constants/mockData";
import { formatDate } from "../utils/formatters";

export default function PresenceScreen({ user, presenceEvents, setPresenceEvents }) {
  const [tab, setTab] = useState("reuniao");
  const [activeEvent, setActiveEvent] = useState(null);

  const canAdd = can(user.role, "add_presence");
  const filtered = presenceEvents.filter(e => e.type === tab);

  function togglePresence(eventId, memberId) {
    if (!canAdd) return;
    setPresenceEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return { 
        ...e, 
        members: e.members.map(m => m.id === memberId ? { ...m, present: !m.present } : m) 
      };
    }));
  }

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>Presença</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === "reuniao" ? styles.tabActive : styles.tabInactive]} onPress={() => setTab("reuniao")}>
          <Text style={{ color: tab === "reuniao" ? "#fff" : "#666" }}>Reuniões</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "projeto" ? styles.tabActive : styles.tabInactive]} onPress={() => setTab("projeto")}>
          <Text style={{ color: tab === "projeto" ? "#fff" : "#666" }}>Projetos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
        {filtered.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>✅ Nenhum evento registrado</Text></View>
        )}
        {filtered.slice().reverse().map(ev => {
          // Garante a sincronia de dados em tempo real no modal
          const currentEv = presenceEvents.find(e => e.id === ev.id) || ev;
          const total = currentEv.members.length;
          const present = currentEv.members.filter(m => m.present).length;
          const pct = total ? Math.round((present / total) * 100) : 0;
          
          return (
            <TouchableOpacity style={styles.card} key={ev.id} onPress={() => setActiveEvent(currentEv)}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{ev.title}</Text>
                  <Text style={styles.cardMeta}>{formatDate(ev.date)}</Text>
                </View>
                <View style={{ alignItems: "end" }}>
                  <Text style={styles.pctText}>{pct}%</Text>
                  <Text style={styles.countText}>{present}/{total}</Text>
                </View>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%` }]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={!!activeEvent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {activeEvent && (
              <>
                <Text style={styles.modalTitle}>{activeEvent.title}</Text>
                <Text style={styles.modalSub}>{canAdd ? "Toque nas linhas para alterar presença" : "Somente visualização"}</Text>
                
                <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
                  {(presenceEvents.find(e => e.id === activeEvent.id)?.members || []).map(m => (
                    <TouchableOpacity key={m.id} style={styles.rowPerson} onPress={() => togglePresence(activeEvent.id, m.id)} disabled={!canAdd}>
                      <View style={styles.avatar}><Text style={styles.avatarText}>{m.avatar}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.personName}>{m.name}</Text>
                        <Text style={styles.personRole}>{ROLES[m.role]}</Text>
                      </View>
                      <View style={[styles.toggleCircle, m.present ? styles.toggleOn : styles.toggleOff]} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.btnClose} onPress={() => setActiveEvent(null)}>
                  <Text style={styles.btnCloseText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  topbar: { padding: 20, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  topbarTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 12 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabActive: { backgroundColor: COLORS.PRIMARY },
  tabInactive: { backgroundColor: "#1e1e1e" },
  scroll: { flex: 1 },
  card: { backgroundColor: COLORS.CARD_BG, borderVertical: 1, borderColor: COLORS.BORDER, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#fff" },
  cardMeta: { fontSize: 12, color: "#555", marginTop: 2 },
  pctText: { fontSize: 18, fontWeight: "700", color: COLORS.PRIMARY },
  countText: { fontSize: 11, color: "#555" },
  track: { height: 4, backgroundColor: "#222", borderRadius: 2 },
  fill: { height: "100%", backgroundColor: COLORS.PRIMARY, borderRadius: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.CARD_BG, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  modalSub: { fontSize: 12, color: "#666", marginBottom: 12 },
  rowPerson: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#1e1e1e" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.PRIMARY, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  personName: { fontSize: 14, color: "#eee", fontWeight: "500" },
  personRole: { fontSize: 12, color: "#666" },
  toggleCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  toggleOn: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  toggleOff: { borderColor: "#444" },
  btnClose: { backgroundColor: COLORS.PRIMARY, padding: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  btnCloseText: { color: "#fff", fontWeight: "600" },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#555" }
});