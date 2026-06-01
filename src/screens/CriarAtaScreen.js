import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { themeStyles } from "../constants/themeStyles";
import { Calendar, MapPin, Users, FileText, Plus, Trash2, Folder } from "lucide-react-native";


// ==========================================
// CONFIGURAÇÃO DO CLOUDINARY
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
    
    // Remove qualquer extensão do nome para evitar o bug do ".pdf.pdf" que bloqueia a entrega
    const nomeLimpo = arquivo.name.replace(/\.[^/.]+$/, "");
    
    if (Platform.OS === 'web') {
      const response = await fetch(arquivo.uri);
      const blob = await response.blob();
      formData.append("file", blob, nomeLimpo);
    } else {
      formData.append("file", {
        uri: arquivo.uri,
        name: nomeLimpo,
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
    return dadosDoUpload.secure_url; // Retorna a URL limpa e original do Cloudinary
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
    <ScrollView contentContainerStyle={[themeStyles.container, { paddingVertical: 20 }]}>
      {/* Box centralizado seguindo o padrão de inputs escuros do seu Modal */}
      <View style={themeStyles.formBox}>
        <Text style={[themeStyles.topbarTitle]}>Registrar Nova Ata</Text>

        <Text style={themeStyles.label}>Título da Ata</Text>
        <TextInput 
          style={themeStyles.input} 
          value={titulo} 
          onChangeText={setTitulo} 
          placeholder="Ex: Ata Reunião 15" 
          placeholderTextColor="#555" 
        />

        <Text style={themeStyles.label}>Data</Text>
        <TextInput 
          style={themeStyles.input} 
          value={data} 
          onChangeText={t => {

            const apenasNumeros = t.replace(/\D/g, "");
            let dataFormatada = apenasNumeros;
            if (apenasNumeros.length > 2) {
              dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
            }
            if (apenasNumeros.length > 4) {
              dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
            }
            setData(dataFormatada);
          }} 
          placeholder="DD/MM/AAAA" 
          maxLength={10} 
          keyboardType="numeric" 
          placeholderTextColor="#555" 
          disabled={enviando}
        />

        <Text style={themeStyles.label}>Local</Text>
        <TextInput 
          style={themeStyles.input} 
          value={local} 
          onChangeText={setLocal} 
          placeholder="Ex: Casa da Amizade" 
          placeholderTextColor="#555" 
        />

        <Text style={themeStyles.label}>Conteúdo da Ata</Text>
        <TextInput 
          style={[themeStyles.input, themeStyles.textArea]} 
          value={conteudo} 
          onChangeText={setConteudo} 
          placeholder="Digite o resumo das discussões..." 
          placeholderTextColor="#555"
          multiline
          numberOfLines={6}
        />

        <Text style={themeStyles.label}>Documento Oficial (PDF do WhatsApp)</Text>
        <TouchableOpacity 
          style={[themeStyles.btnSecondary, documento && themeStyles.btnSecondaryActive]} 
          onPress={selecionarDocumento}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
  <Folder size={18} color="#ffffff" /> 
  <Text style={themeStyles.btnSecondaryText}>
    {documento ? `PDF Selecionado: ${documento.name}` : "Selecionar PDF do Dispositivo"}
  </Text>
</View>
        </TouchableOpacity>

        {enviando ? (
          <ActivityIndicator size="large" color="#0a84ff" style={{ marginTop: 24 }} />
        ) : (
          <TouchableOpacity style={themeStyles.btnSave} onPress={salvarAta}>
            <Text style={themeStyles.btnSaveText}>Gravar Ata no Sistema</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}