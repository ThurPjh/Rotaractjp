import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { collection, onSnapshot, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { themeStyles } from "../constants/themeStyles";

export default function NotificationScreen({ user }) {
  const [reunioes, setReunioes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", location: "" });

  // 1. Monitora e carrega as reuniões do Firebase em tempo real
  useEffect(() => {
    const q = query(collection(db, "reunioes"), orderBy("criadoEm", "desc"));
    return onSnapshot(q, (snapshot) => {
      setReunioes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // 2. Publica a reunião buscando os usuários reais do banco de dados
  async function publicarReuniao() {
    if (!form.title || !form.date) {
      Alert.alert("Atenção", "Por favor, preencha o título e a data.");
      return;
    }

    setLoading(true);
    
    try {
      // Busca todos os membros cadastrados na coleção 'usuarios'
      const usersSnapshot = await getDocs(collection(db, "usuarios"));
      
      // Mapeia os documentos para o formato que a chamada de presença espera
      const listaMembrosReais = usersSnapshot.docs.map(doc => {
        const dados = doc.data();
        return {
          id: doc.id,
          name: dados.name || dados.nome || "Membro sem nome",
          avatar: dados.avatar || (dados.name ? dados.name.charAt(0).toUpperCase() : "M"),
          role: dados.role || dados.cargo || "associado",
          present: false // Todos iniciam com falta por padrão
        };
      });

      // Validação de segurança caso o banco de dados de usuários esteja vazio
      if (listaMembrosReais.length === 0) {
        Alert.alert(
          "Aviso importante", 
          "A reunião não pôde ser criada porque não existem usuários cadastrados na coleção 'usuarios' do Firebase. Cadastre membros primeiro!"
        );
        setLoading(false);
        return;
      }

      // Cria o documento unificado na coleção 'reunioes'
      await addDoc(collection(db, "reunioes"), {
        title: form.title,
        date: form.date,
        location: form.location || "Não informado",
        criadoEm: serverTimestamp(),
        criadoPor: user?.name || user?.nome || "Diretoria",
        members: listaMembrosReais
      });

      setModalVisible(false);
      setForm({ title: "", date: "", location: "" });
      Alert.alert("Sucesso", "Reunião e lista de chamada geradas com dados reais!");

    } catch (error) {
      console.error("Erro ao integrar com coleção de usuários:", error);
      Alert.alert("Erro ao criar reunião", error.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. Validação flexível de cargos administrativa
  const userRole = user?.role || user?.cargo || "";
  const temPermissao = 
    userRole.toLowerCase() === "presidente" || 
    userRole.toLowerCase() === "secretario" || 
    userRole.toLowerCase() === "admin" ||
    !userRole; 

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Reuniões</Text>
        
        {temPermissao && (
          <TouchableOpacity style={themeStyles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={themeStyles.btnAddText}>+ Nova</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {reunioes.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
            Nenhuma reunião agendada.
          </Text>
        ) : (
          reunioes.map(n => (
            <View style={themeStyles.card} key={n.id}>
              <Text style={themeStyles.cardTitle}>{n.title}</Text>
              <Text style={themeStyles.metaText}>📅 {n.date} • 📍 {n.location}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Criação de Reunião */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 }}>
          <View style={themeStyles.formBox}>
            <Text style={themeStyles.topbarTitleNot}>Agendar Reunião</Text>
            
            <TextInput 
              style={themeStyles.input} 
              placeholder="Título da Reunião" 
              placeholderTextColor="#555" 
              value={form.title} 
              onChangeText={t => setForm(p => ({...p, title: t}))} 
            />
          
            <TextInput 
              style={themeStyles.input} 
              placeholder="Data (DD/MM/AAAA)" 
              placeholderTextColor="#555" 
              value={form.date} 
              onChangeText={t => setForm(p => ({...p, date: t}))} 
            />
            
            <TextInput 
              style={themeStyles.input} 
              placeholder="Local (Ex: Casa da Amizade)" 
              placeholderTextColor="#555" 
              value={form.location} 
              onChangeText={t => setForm(p => ({...p, location: t}))} 
            />
            
            <TouchableOpacity 
              style={[themeStyles.btnSave, { opacity: loading ? 0.6 : 1 }]} 
              onPress={publicarReuniao}
              disabled={loading}
            >
              <Text style={themeStyles.btnSaveText}>
                {loading ? "Processando sócios..." : "Publicar Reunião"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setModalVisible(false)} disabled={loading}>
              <Text style={{ color: "#666", textAlign: "center", marginTop: 20, fontWeight: "600" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}