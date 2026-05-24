import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Linking, 
  TouchableOpacity 
} from "react-native";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../config/firebase"; 
import { COLORS } from "../constants/colors";

export default function AtasScreen({ irParaCriarAta }) {
  const [atas, setAtas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conecta na coleção "atas" do seu Firebase
    const colecaoAtas = collection(db, "atas");
    const q = query(colecaoAtas); 

    // Escuta mudanças no banco em tempo real
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

  // Função para abrir o documento anexo (link do Cloudinary ou Web)
  const abrirDocumento = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => 
        Alert.alert("Erro", "Não foi possível abrir o arquivo anexo.")
      );
    }
  };

  const renderAta = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.titulo || "Ata Sem Título"}</Text>
      
      <View style={styles.metaRow}>
        <Text style={styles.date}>📅 {item.data || "Data não informada"}</Text>
        <Text style={styles.location}>📍 {item.local || "Local não informado"}</Text>
      </View>

      <Text style={styles.content}>{item.conteudo || "Sem conteúdo registrado."}</Text>
      
      {/* Botão de anexo: Só aparece se houver um link de documento salvo */}
      {item.urlDocumento ? (
        <TouchableOpacity 
          style={styles.documentButton} 
          onPress={() => abrirDocumento(item.urlDocumento)}
        >
          <Text style={styles.documentButtonText}>📄 Visualizar Documento Anexo (PDF/Word)</Text>
        </TouchableOpacity>
      ) : null}
      
      {/* Seção de presenças do clube */}
      {item.nomesPresentes && item.nomesPresentes.length > 0 && (
        <View style={styles.presenceBox}>
          <Text style={styles.presenceTitle}>
            👥 Presenças ({item.quantidadePresentes || item.nomesPresentes.length}):
          </Text>
          <Text style={styles.presenceList}>
            {item.nomesPresentes.join(", ")}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY || "#003399"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho com o título da tela e o botão de criar nova ata */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Atas das Reuniões</Text>
        <TouchableOpacity style={styles.addButton} onPress={irParaCriarAta}>
          <Text style={styles.addButtonText}>➕ Nova Ata</Text>
        </TouchableOpacity>
      </View>
      
      {atas.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma ata cadastrada no Firestore.</Text>
      ) : (
        <FlatList
          data={atas}
          keyExtractor={(item) => item.id}
          renderItem={renderAta}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND || "#f5f5f5", padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 8 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: COLORS.PRIMARY || "#003399" },
  addButton: { backgroundColor: COLORS.PRIMARY || "#003399", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 20 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  date: { fontSize: 12, color: "#666" },
  location: { fontSize: 12, color: "#666" },
  content: { fontSize: 14, color: "#444", marginTop: 4, lineHeight: 20 },
  documentButton: { backgroundColor: "#e74c3c", padding: 10, borderRadius: 6, marginTop: 12, alignItems: "center" },
  documentButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  presenceBox: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eee" },
  presenceTitle: { fontSize: 13, fontWeight: "bold", color: COLORS.PRIMARY || "#003399" },
  presenceList: { fontSize: 13, color: "#555", marginTop: 2, fontStyle: "italic" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 }
});