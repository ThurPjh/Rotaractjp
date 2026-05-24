import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles"; // 👈 Importando o tema unificado
import { can, ROLES } from "../constants/mockData";
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
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Presença</Text>
      </View>

      {/* Tabs utilizando o estilo de tag unificado */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 12 }}>
        <TouchableOpacity style={[{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }, tab === "reuniao" ? themeStyles.tagBlue : { backgroundColor: "#1e2026" }]} onPress={() => setTab("reuniao")}>
          <Text style={{ color: tab === "reuniao" ? "#fff" : "#a0aec0", fontWeight: "600", fontSize: 13 }}>Reuniões</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }, tab === "projeto" ? themeStyles.tagBlue : { backgroundColor: "#1e2026" }]} onPress={() => setTab("projeto")}>
          <Text style={{ color: tab === "projeto" ? "#fff" : "#a0aec0", fontWeight: "600", fontSize: 13 }}>Projetos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {filtered.length === 0 && (
          <View style={themeStyles.empty}><Text style={themeStyles.emptyText}>✅ Nenhum evento registrado</Text></View>
        )}
        {filtered.slice().reverse().map(ev => {
          const currentEv = presenceEvents.find(e => e.id === ev.id) || ev;
          const total = currentEv.members.length;
          const present = currentEv.members.filter(m => m.present).length;
          const pct = total ? Math.round((present / total) * 100) : 0;
          
          return (
            <TouchableOpacity style={themeStyles.card} key={ev.id} onPress={() => setActiveEvent(currentEv)}>
              <View style={themeStyles.cardHeader}>
                <View>
                  <Text style={themeStyles.cardTitle}>{ev.title}</Text>
                  <Text style={themeStyles.metaText}>{formatDate(ev.date)}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.PRIMARY || "#0a84ff" }}>{pct}%</Text>
                  <Text style={themeStyles.metaText}>{present}/{total}</Text>
                </View>
              </View>
              {/* Barra de progresso integrada ao tema escuro */}
              <View style={{ height: 6, backgroundColor: "#111216", borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: "100%", width: `${pct}%`, backgroundColor: COLORS.PRIMARY || "#0a84ff", borderRadius: 3 }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal de Detalhes e Check-in */}
      <Modal visible={!!activeEvent} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
          <View style={themeStyles.formBox}>
            {activeEvent && (
              <>
                <Text style={themeStyles.topbarTitle}>{activeEvent.title}</Text>
                <Text style={[themeStyles.metaText, { marginBottom: 16 }]}>{canAdd ? "Toque para alterar presença" : "Somente visualização"}</Text>
                
                <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
                  {(presenceEvents.find(e => e.id === activeEvent.id)?.members || []).map(m => (
                    <TouchableOpacity key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#1e2026" }} onPress={() => togglePresence(activeEvent.id, m.id)} disabled={!canAdd}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.PRIMARY || "#0a84ff", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{m.avatar}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, color: "#fff", fontWeight: "500" }}>{m.name}</Text>
                        <Text style={themeStyles.metaText}>{ROLES[m.role]}</Text>
                      </View>
                      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: m.present ? COLORS.PRIMARY : "#4a5568", backgroundColor: m.present ? COLORS.PRIMARY : "transparent" }} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TouchableOpacity style={themeStyles.btnSave} onPress={() => setActiveEvent(null)}>
                  <Text style={themeStyles.btnSaveText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}