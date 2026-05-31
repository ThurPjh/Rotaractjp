import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Linking, 
  TouchableOpacity 
} from "react-native";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../config/firebase"; 
import { themeStyles } from "../constants/themeStyles"; // Importando seu novo CSS global

export default function AtasScreen({ irParaCriarAta }) {
  const [atas, setAtas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conecta na coleção "atas" do seu Firebase Firestore
    const colecaoAtas = collection(db, "atas");
    const q = query(colecaoAtas); 

    // Escuta as mudanças no banco de dados em tempo real
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
      Alert.alert("Erro", "Não foi possível carregar as atas.");
      setLoading(false);
    });

    // Desconecta o listener ao sair da tela para poupar memória
    return () => unsubscribe();
  }, []);

  // Abre o PDF bruto usando o leitor oficial do Google para evitar erros em ambiente Web
  const abrirDocumento = (url) => {
    if (url) {
      const urlDoLeitor = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
      
      Linking.openURL(urlDoLeitor).catch((err) => 
        Alert.alert("Erro", "Não foi possível abrir o arquivo anexo.")
      );
    }
  };

  const renderAta = ({ item }) => (
    <View style={themeStyles.card}>
      <View style={themeStyles.cardHeader}>
        <Text style={themeStyles.metaText}>📅 {item.data || "Data não informada"}</Text>
        
        {item.urlDocumento ? (
          <TouchableOpacity 
            style={themeStyles.tagBlue} 
            onPress={() => abrirDocumento(item.urlDocumento)}
          >
            <Text style={themeStyles.tagTextBlue}>📄 Ver PDF</Text>
          </TouchableOpacity>
        ) : null}
      </View>


      <Text style={themeStyles.cardTitle}>{item.titulo || "Ata Sem Título"}</Text>
      <Text style={themeStyles.metaText}>📍 {item.local || "Local não informado"}</Text>

      {/* Conteúdo/Resumo da Ata */}
      <Text style={themeStyles.descText}>{item.conteudo || "Sem conteúdo registrado."}</Text>
      
      {/* Seção de presenças mapeada com o estilo escuro do tema */}
      {item.nomesPresentes && item.nomesPresentes.length > 0 && (
        <View style={{ marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderColor: "#1e2026" }}>
          <Text style={[themeStyles.metaText, { fontWeight: "600", color: "#fff", marginBottom: 2 }]}>
            👥 Presenças ({item.quantidadePresentes || item.nomesPresentes.length}):
          </Text>
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
      {/* Topbar idêntica à de notificações */}
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Atas das Reuniões</Text>
        <TouchableOpacity style={themeStyles.btnAdd} onPress={irParaCriarAta}>
          <Text style={themeStyles.btnAddText}>➕ Nova Ata</Text>
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
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}