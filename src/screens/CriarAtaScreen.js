import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLORS } from "../constants/colors";

// ==========================================
// CONFIGURAÇÃO DO CLOUDINARY (Garanta que suas chaves estão aqui!)
const CLOUD_NAME = "dnicdt3qe"; 
const UPLOAD_PRESET = "s3asftce"; 
// ==========================================

export default function CriarAtaScreen({ irParaListaAtas }) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [documento, setDocumento] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Seleciona o PDF baixado do WhatsApp
  const selecionarDocumento = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        setDocumento(resultado.assets[0]);
      }
    } catch (err) {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  // Faz o upload do PDF puro para o Cloudinary via raw/upload
  const fazerUploadCloudinary = async (arquivo) => {
    const urlApi = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;
    
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      const response = await fetch(arquivo.uri);
      const blob = await response.blob();
      formData.append("file", blob, arquivo.name);
    } else {
      formData.append("file", {
        uri: arquivo.uri,
        name: arquivo.name,
        type: arquivo.mimeType || "application/pdf",
      });
    }
    
    formData.append("upload_preset", UPLOAD_PRESET);

    const resposta = await fetch(urlApi, {
      method: "POST",
      body: formData,
    });

    if (!resposta.ok) {
      const erroResposta = await resposta.json();
      console.error("Erro detalhado do Cloudinary:", erroResposta);
      throw new Error("Falha no upload");
    }

    const dadosDoUpload = await resposta.json();
    return dadosDoUpload.secure_url; // Retorna a URL limpa e original
  };

  const salvarAta = async () => {
    // Validação básica dos campos obrigatórios
    if (!titulo || !conteudo || !data) {
      Alert.alert("Atenção", "Por favor, preencha Título, Data e Conteúdo da ata.");
      return;
    }

    setEnviando(true);
    let urlDocumentoSalvo = "";

    try {
      // 1. Se tem documento, faz o upload e pega a URL original
      if (documento) {
        urlDocumentoSalvo = await fazerUploadCloudinary(documento);
      }

      // 2. Salva no Firebase Firestore exatamente os campos que a sua lista precisa
      await addDoc(collection(db, "atas"), {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        local: local.trim(),
        data: data.trim(),
        urlDocumento: urlDocumentoSalvo, // URL salva sem nenhuma alteração perigosa
        criadoEm: new Date(),
        nomesPresentes: [], 
        quantidadePresentes: 0
      });

      Alert.alert("Sucesso", "Ata registrada com sucesso!");
      
      // Limpa o formulário
      setTitulo("");
      setConteudo("");
      setLocal("");
      setData("");
      setDocumento(null);
      
      // Volta para a lista de atas
      irParaListaAtas();
      
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      Alert.alert("Erro", "Houve um problema ao salvar a ata no sistema.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Título da Reunião *</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex: Reunião Ordinária 15" />

      <Text style={styles.label}>Data *</Text>
      <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="Ex: 24/05/2026" />

      <Text style={styles.label}>Local</Text>
      <TextInput style={styles.input} value={local} onChangeText={setLocal} placeholder="Ex: Casa da Amizade" />

      <Text style={styles.label}>Conteúdo da Ata *</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={conteudo} 
        onChangeText={setConteudo} 
        placeholder="Digite o resumo das discussões..." 
        multiline
        numberOfLines={6}
      />

      <Text style={styles.label}>Documento Oficial (PDF do WhatsApp)</Text>
      <TouchableOpacity style={styles.fileButton} onPress={selecionarDocumento}>
        <Text style={styles.fileButtonText}>
          {documento ? `📎 PDF Selecionado: ${documento.name}` : "📂 Selecionar PDF do Dispositivo"}
        </Text>
      </TouchableOpacity>

      {enviando ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY || "#003399"} style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={salvarAta}>
          <Text style={styles.saveButtonText}>💾 Gravar Ata no Sistema</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, fontSize: 15, backgroundColor: "#f9f9f9" },
  textArea: { textAlignVertical: "top", height: 120 },
  fileButton: { backgroundColor: "#f0f0f0", padding: 12, borderRadius: 6, alignItems: "center", borderStyle: "dashed", borderWidth: 1, borderColor: "#999", marginTop: 4 },
  fileButtonText: { color: "#555", fontWeight: "600" },
  saveButton: { backgroundColor: COLORS.PRIMARY || "#003399", padding: 15, borderRadius: 6, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});