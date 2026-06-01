import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import { themeStyles } from "../constants/themeStyles";
import { ROLES } from "../constants/mockData";
import { Calendar } from "lucide-react-native";

export default function PresenceScreen({ user }) {
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);

  // 1. Monitora a coleção 'reunioes' em tempo real
  useEffect(() => {
    const q = query(collection(db, "reunioes"), orderBy("criadoEm", "desc"));
    return onSnapshot(q, (snapshot) => {
      const listaEtg = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(listaEtg);

      // Mantém o modal atualizado em tempo real se ele estiver aberto
      if (activeEvent) {
        const eventoAtualizado = listaEtg.find(e => e.id === activeEvent.id);
        if (eventoAtualizado) setActiveEvent(eventoAtualizado);
      }
    });
  }, [activeEvent?.id]);

  // 2. Validação de permissão flexível idêntica à tela de notificações
  const userRole = user?.role || user?.cargo || "";
  const podeMarcarPresenca = 
    userRole.toLowerCase() === "presidente" || 
    userRole.toLowerCase() === "secretario" || 
    userRole.toLowerCase() === "admin" ||
    !userRole; // Failsafe para permitir testes caso o objeto venha incompleto

  // 3. Função para alternar a presença no Firestore
  async function togglePresence(memberId, currentStatus) {
    if (!podeMarcarPresenca) {
      alert("Apenas a diretoria pode marcar presença.");
      return;
    }

    try {
      const eventRef = doc(db, "reunioes", activeEvent.id);
      
      // Mapeia os membros invertendo o status da pessoa clicada
      const updatedMembers = (activeEvent.members || []).map(m => 
        m.id === memberId ? { ...m, present: !currentStatus } : m
      );

      // Atualiza o documento diretamente no Firebase
      await updateDoc(eventRef, { members: updatedMembers });
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
      alert("Erro ao salvar presença: " + error.message);
    }
  }

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Presença</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {events.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
            Nenhuma reunião disponível para chamada.
          </Text>
        ) : (
          events.map(ev => {
            // LÓGICA DA BARRA DE PROGRESSO DINÂMICA
            const totalMembros = ev.members?.length || 0;
            const presentes = ev.members?.filter(m => m.present).length || 0;
            
            // Calcula a porcentagem (evita divisão por zero se a lista de membros estiver vazia)
            const porcentagem = totalMembros > 0 ? Math.round((presentes / totalMembros) * 100) : 0;

            return (
              <TouchableOpacity style={themeStyles.card} key={ev.id} onPress={() => setActiveEvent(ev)}>
                
                {/* Linha do Título e Porcentagem lado a lado */}
                <View style={{ flexDirection: "row", justifyContent: "between", alignItems: "center" }}>
                  <Text style={[themeStyles.cardTitle, { flex: 1, marginBottom: 0 }]}>{ev.title}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: porcentagem >= 70 ? "#34c759" : "#ff9500" }}>
                    {porcentagem}%
                  </Text>
                </View>

                {/* Data do Evento */}
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: 12 }}>
                  <Calendar size={14} color="#E91467" style={{ marginRight: 4 }} />
                  <Text style={themeStyles.metaText}>{ev.date}</Text>
                </View>

                {/* BARRA DE PROGRESSO */}
                <View style={{ height: 6, backgroundColor: "#111216", borderRadius: 3, overflow: "hidden" }}>
                  <View style={{ 
                    height: "100%", 
                    borderRadius: 3,
                    width: `${porcentagem}%`,
                    backgroundColor: porcentagem >= 70 ? "#E91467" : "#E91467"
                  }} />
                </View>

                {/* Subtexto Informativo */}
                <Text style={[themeStyles.metaText, { fontSize: 11, marginTop: 4, textAlign: "right" }]}>
                  {presentes} de {totalMembros} presentes
                </Text>

              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal: Lista de Membros e Chamada */}
      <Modal visible={!!activeEvent} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
          <View style={themeStyles.formBox}>
            {activeEvent && (
              <>
                <Text style={themeStyles.topbarTitle}>{activeEvent.title}</Text>
                <ScrollView style={{ maxHeight: 400, marginVertical: 15 }}>
                  {(activeEvent.members || []).map(m => (
                    <View key={m.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#1e2026" }}>
                      
                      {/* Avatar */}
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#0a84ff", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: "#fff", fontWeight: "700" }}>{m.avatar}</Text>
                      </View>
                      
                      {/* Nome e Cargo */}
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: "#fff", fontWeight: "500" }}>{m.name}</Text>
                        <Text style={themeStyles.metaText}>{ROLES[m.role] || m.role}</Text>
                      </View>
                      
                      {/* Botão de Check / Círculo de Presença */}
                      <TouchableOpacity onPress={() => togglePresence(m.id, m.present)}>
                        <View style={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: 12, 
                          borderWidth: 2, 
                          borderColor: m.present ? "#34c759" : "#4a5568", 
                          backgroundColor: m.present ? "#34c759" : "transparent",
                          justifyContent: "center",
                          alignItems: "center"
                        }}>
                          {m.present && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>✓</Text>}
                        </View>
                      </TouchableOpacity>

                    </View>
                  ))}
                </ScrollView>
                
                <TouchableOpacity style={themeStyles.btnSave} onPress={() => setActiveEvent(null)}>
                  <Text style={themeStyles.btnSaveText}>Fechar Chamada</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}