import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform, Image } from "react-native";
import { collection, onSnapshot, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { Calendar, MapPin, Plus, Trash2 } from "lucide-react-native";
import { db } from "../config/firebase";
import { themeStyles } from "../constants/themeStyles";


//import DateTimePicker from '@react-native-community/datetimepicker';

export default function NotificationScreen({ user }) {
  const [reunioes, setReunioes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", location: "" });

  const [dataObjeto, setDataObjeto] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "reunioes"), orderBy("criadoEm", "desc"));
    return onSnapshot(q, (snapshot) => {
      setReunioes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // Função auxiliar para o clique do calendário no celular
  const onChangeDataNativa = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || dataObjeto;
    setShowDatePicker(Platform.OS === 'ios');
    setDataObjeto(currentDate);

    const dia = String(currentDate.getDate()).padStart(2, '0');
    const mes = String(currentDate.getMonth() + 1).padStart(2, '0');
    const ano = currentDate.getFullYear();
    setForm(p => ({ ...p, date: `${dia}/${mes}/${ano}` }));
  };

  const onChangeDataWeb = (textoData) => {
    if (!textoData) return;
    const partes = textoData.split("-");
    if (partes.length === 3) {
      const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
      setForm(p => ({ ...p, date: dataFormatada }));
    }
  };

  async function publicarReuniao() {
    if (!form.title || !form.date) {
      if (Platform.OS === 'web') alert("Por favor, preencha o título e a data.");
      else Alert.alert("Atenção", "Por favor, preencha o título e a data.");
      return;
    }

    setLoading(true);

    try {
      const usersSnapshot = await getDocs(collection(db, "usuarios"));
      const listaMembrosReais = usersSnapshot.docs.map(doc => {
        const dados = doc.data();
        return {
          id: doc.id,
          name: dados.name || dados.nome || "Membro sem nome",
          avatar: dados.avatar || (dados.name ? dados.name.charAt(0).toUpperCase() : "M"),
          role: dados.role || dados.cargo || "associado",
          present: false
        };
      });

      if (listaMembrosReais.length === 0) {
        if (Platform.OS === 'web') alert("A reunião não pôde ser criada porque não existem usuários.");
        else Alert.alert("Aviso importante", "A reunião não pôde ser criada porque não existem usuários cadastrados.");
        setLoading(false);
        return;
      }

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
      if (Platform.OS === 'web') alert("Reunião agendada com sucesso!");
      else Alert.alert("Sucesso", "Reunião e lista de chamada geradas com dados reais!");

    } catch (error) {
      console.error("Erro:", error);
      if (Platform.OS === 'web') alert("Erro ao criar reunião: " + error.message);
      else Alert.alert("Erro ao criar reunião", error.message);
    } finally {
      setLoading(false);
    }
  }

  const userRole = user?.role || user?.cargo || "";
  const temPermissao =
    userRole.toLowerCase() === "presidente" ||
    userRole.toLowerCase() === "secretario" ||
    userRole.toLowerCase() === "admin" ||
    !userRole;

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={themeStyles.topbarTitle}>Reuniões</Text>
            <Image
              source={require("../../assets/alegre.png")}
              style={{ width: 100, height: 50, marginLeft: -30}}
            />
        </View>
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
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                  <Calendar size={14} color="#E91467" style={{ marginRight: 4 }} />
                  <Text style={themeStyles.metaText}> {n.date}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                  <MapPin size={14} color="#E91467" style={{ marginRight: 4 }} />
                  <Text style={themeStyles.metaText}> {n.location}</Text>
                </View>
       
              

              {/* Botão de excluir visível apenas para a diretoria */}
              {temPermissao && (
                <TouchableOpacity
                  onPress={() => deletarReuniao(n.id, n.title)}
                  style={{ marginLeft: 10, alignSelf: "flex-end" }}
                >
                  <Trash2 size={18} color="#ff3b30" />
                </TouchableOpacity>
              )}
            </View>

          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 }}>
          <View style={themeStyles.formBox}>
            <Text style={themeStyles.topbarTitleNot}>Agendar Reunião</Text>

            <TextInput
              style={themeStyles.input}
              placeholder="Título da Reunião"
              placeholderTextColor="#555"
              value={form.title}
              onChangeText={t => setForm(p => ({ ...p, title: t }))}
            />

            {Platform.OS === 'web' ? (
              <TextInput
                style={themeStyles.input}
                value={form.date}
                onChangeText={t => {
                  const apenasNumeros = t.replace(/\D/g, "");
                  let dataFormatada = apenasNumeros;

                  if (apenasNumeros.length > 2) {
                    dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
                  }
                  if (apenasNumeros.length > 4) {
                    dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
                  }

                  setForm(p => ({ ...p, date: dataFormatada }));
                }}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                keyboardType="numeric"
                placeholderTextColor="#555"
                editable={!loading}
              />
            ) : (
              // Calendário Nativo (Android/iOS) 
              <>
                <TouchableOpacity
                  style={[themeStyles.input, { justifyContent: "center" }]}
                  onPress={() => setShowDatePicker(true)}
                  disabled={loading}
                >
                  <Text style={{ color: form.date ? "#fff" : "#555" }}>
                    {form.date ? `📅 Data: ${form.date}` : "Toque para selecionar a Data"}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dataObjeto}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={onChangeDataNativa}
                    minimumDate={new Date()}
                  />
                )}
              </>
            )}

            <TextInput
              style={themeStyles.input}
              placeholder="Local (Ex: Casa da Amizade)"
              placeholderTextColor="#555"
              value={form.location}
              onChangeText={t => setForm(p => ({ ...p, location: t }))}
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

  //Função deletar reunião
  async function deletarReuniao(idReuniao, titulo) {
    // Função auxiliar para executar a deleção após confirmação
    const executarDelecao = async () => {
      try {
        await deleteDoc(doc(db, "reunioes", idReuniao));
        if (Platform.OS === 'web') alert("Reunião excluída com sucesso!");
        else Alert.alert("Sucesso", "Reunião excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        if (Platform.OS === 'web') alert("Erro ao excluir: " + error.message);
      }
    };

    // Alerta de segurança para o Admin não clicar e apagar sem querer
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`Tem certeza que deseja excluir a reunião "${titulo}"?`);
      if (confirmar) executarDelecao();
    } else {
      Alert.alert(
        "Excluir Reunião",
        `Tem certeza que deseja excluir a reunião "${titulo}"? Esta ação não pode ser desfeita.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: executarDelecao }
        ]
      );
    }
  }
}