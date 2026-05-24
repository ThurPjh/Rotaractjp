import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { themeStyles } from "../constants/themeStyles";
import { can } from "../constants/mockData";
import { formatDate } from "../utils/formatters";

export default function NotificationScreen({ user }) {
  const [reunioes, setReunioes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", location: "", description: "" });

  // 1. Escuta em tempo real as reuniões do Firebase
  useEffect(() => {
    const q = query(collection(db, "reunioes"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReunioes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // 2. Função para o admin publicar reunião
  async function publicarReuniao() {
    if (!form.title || !form.date) return;
    await addDoc(collection(db, "reunioes"), {
      ...form,
      criadoEm: serverTimestamp(),
      criadoPor: user.name
    });
    setModalVisible(false);
    setForm({ title: "", date: "", location: "", description: "" });
  }

  const canAdd = can(user.role, "add_notification");

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Reuniões</Text>
        {canAdd && (
          <TouchableOpacity style={themeStyles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={themeStyles.btnAddText}>+ Nova Reunião</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {reunioes.length === 0 ? (
          <View style={themeStyles.empty}><Text style={themeStyles.emptyText}>Nenhuma reunião publicada.</Text></View>
        ) : (
          reunioes.map(n => (
            <View style={themeStyles.card} key={n.id}>
              <View style={themeStyles.cardHeader}>
                <View style={themeStyles.tagBlue}>
                  <Text style={themeStyles.tagTextBlue}>📍 Reunião</Text>
                </View>
                <Text style={themeStyles.metaText}>{n.date}</Text>
              </View>
              <Text style={themeStyles.cardTitle}>{n.title}</Text>
              {n.location ? <Text style={[themeStyles.metaText, { marginTop: 4 }]}>📌 {n.location}</Text> : null}
              {n.description ? <Text style={themeStyles.descText}>{n.description}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal só abre para quem tem permissão */}
      {canAdd && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
            <View style={themeStyles.formBox}>
              <Text style={themeStyles.topbarTitle}>Nova Reunião</Text>
              
              <Text style={themeStyles.label}>Título</Text>
              <TextInput style={themeStyles.input} placeholder="Ex: Reunião Ordinária" value={form.title} onChangeText={t => setForm(p => ({...p, title: t}))} />
              
              <Text style={themeStyles.label}>Data (DD/MM/AAAA)</Text>
              <TextInput style={themeStyles.input} placeholder="24/05/2026" value={form.date} onChangeText={t => setForm(p => ({...p, date: t}))} />

              <Text style={themeStyles.label}>Local</Text>
              <TextInput style={themeStyles.input} placeholder="Casa da Amizade" value={form.location} onChangeText={t => setForm(p => ({...p, location: t}))} />

              <Text style={themeStyles.label}>Descrição</Text>
              <TextInput style={[themeStyles.input, { height: 80 }]} multiline placeholder="Pauta da reunião..." value={form.description} onChangeText={t => setForm(p => ({...p, description: t}))} />

              <TouchableOpacity style={[themeStyles.btnSave, { marginTop: 24 }]} onPress={publicarReuniao}>
                <Text style={themeStyles.btnSaveText}>Publicar Reunião</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}