import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, Alert, Linking, TouchableOpacity, Platform, Image} from "react-native";
// 1. Adicionado o 'doc' e 'deleteDoc' para o Firebase
import { collection, onSnapshot, query, doc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase"; 
import { themeStyles } from "../constants/themeStyles";

// 2. Importação dos Ícones profissionais do Lucide
import { Calendar, MapPin, Users, FileText, Plus, Trash2 } from "lucide-react-native";

// 3. Recebendo o 'user' via props para controle de privilégios de exclusão
export default function AtasScreen({ irParaCriarAta, user }) {
  const [atas, setAtas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colecaoAtas = collection(db, "atas");
    const q = query(colecaoAtas); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaAtas = [];
      snapshot.forEach((doc) => {
        listaAtas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAtas(listaAtas);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar atas: ", error);
      if (Platform.OS === 'web') alert("Não foi possível carregar as atas.");
      else Alert.alert("Erro", "Não foi possível carregar as atas.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 4. Função nativa de exclusão com travas de segurança
  async function deletarAta(idAta, tituloAta) {
    const executarDelecao = async () => {
      try {
        await deleteDoc(doc(db, "atas", idAta));
        if (Platform.OS === 'web') alert("Ata excluída com sucesso!");
        else Alert.alert("Sucesso", "Ata excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar ata:", error);
        if (Platform.OS === 'web') alert("Erro ao excluir: " + error.message);
        else Alert.alert("Erro", "Não foi possível excluir a ata.");
      }
    };

    // Alerta específico por plataforma
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`Tem certeza que deseja deletar a "${tituloAta}"?`);
      if (confirmar) executarDelecao();
    } else {
      Alert.alert(
        "Excluir Ata",
        `Tem certeza que deseja excluir a "${tituloAta}"? Esta ação não pode ser desfeita.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: executarDelecao }
        ]
      );
    }
  }

  const abrirDocumento = (url) => {
    if (url) {
      const urlDoLeitor = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
      Linking.openURL(urlDoLeitor).catch((err) => {
        if (Platform.OS === 'web') alert("Não foi possível abrir o arquivo anexo.");
        else Alert.alert("Erro", "Não foi possível abrir o arquivo anexo.");
      });
    }
  };

  // 5. Validação flexível do cargo administrativo
  const userRole = user?.role || user?.cargo || "";
  const temPermissao = 
    userRole.toLowerCase() === "presidente" || 
    userRole.toLowerCase() === "secretario" || 
    userRole.toLowerCase() === "admin" ||
    !userRole;

  const renderAta = ({ item }) => (
    <View style={themeStyles.card}>
      <View style={themeStyles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Calendar size={14} color="#E91467" style={{ marginRight: 4 }} />
          <Text style={themeStyles.metaText}>{item.data || "Data não informada"}</Text>
        </View>
        
        {item.urlDocumento ? (
          <TouchableOpacity 
            style={[themeStyles.tagBlue, { flexDirection: "row", alignItems: "center" }]} 
            onPress={() => abrirDocumento(item.urlDocumento)}
          >
            <FileText size={12} color="#0a84ff" style={{ marginRight: 4 }} />
            <Text style={themeStyles.tagTextBlue}>Ver PDF</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Título Alinhado com o botão de Lixeira lateral */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6 }}>
        <Text style={[themeStyles.cardTitle, { flex: 1, marginRight: 10 }]}>
          {item.titulo || "Ata Sem Título"}
        </Text>
        
        {/* Lixeira visível apenas para quem tem permissão */}
        {temPermissao && (
          <TouchableOpacity 
            onPress={() => deletarAta(item.id, item.titulo || "Ata")}
            style={{ padding: 6 }}
          >
            <Trash2 size={18} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 8 }}>
        <MapPin size={14} color="#E91467" style={{ marginRight: 4 }} />
        <Text style={themeStyles.metaText}>{item.local || "Local não informado"}</Text>
      </View>

      <Text style={themeStyles.descText}>{item.conteudo || "Sem conteúdo registrado."}</Text>
      
      {item.nomesPresentes && item.nomesPresentes.length > 0 && (
        <View style={{ marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderColor: "#1e2026" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Users size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[themeStyles.metaText, { fontWeight: "600", color: "#fff" }]}>
              Presenças ({item.quantidadePresentes || item.nomesPresentes.length}):
            </Text>
          </View>
          <Text style={[themeStyles.descText, { marginTop: 0, fontSize: 13, fontStyle: "italic" }]}>
            {item.nomesPresentes.join(", ")}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[themeStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={themeStyles.topbarTitle}>Atas</Text>
                  <Image
                    source={require("../../assets/alegre.png")}
                    style={{ width: 100, height: 50, marginLeft: -30}}
                  />
                </View>
        <TouchableOpacity style={themeStyles.btnAdd} onPress={irParaCriarAta}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Plus size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={themeStyles.btnAddText}>Nova Ata</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {atas.length === 0 ? (
        <View style={themeStyles.empty}>
          <Text style={themeStyles.emptyText}>Nenhuma ata cadastrada no Firestore.</Text>
        </View>
      ) : (
        <FlatList
          data={atas}
          keyExtractor={(item) => item.id}
          renderItem={renderAta}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}