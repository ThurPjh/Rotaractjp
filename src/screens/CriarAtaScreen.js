import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { themeStyles } from "../constants/themeStyles";
import { Calendar, MapPin, Users, FileText, Plus, Trash2, Folder } from "lucide-react-native";

// IMPORTAÇÃO DO CALENDÁRIO NATIVO
import DateTimePicker from "@react-native-community/datetimepicker";

// ==========================================
// CONFIGURAÇÃO DO CLOUDINARY
const CLOUD_NAME = "dnicdt3qe"; 
const UPLOAD_PRESET = "s3asftce"; 
// ==========================================

export default function CriarAtaScreen({ irParaListaAtas }) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState(""); // Mantém a string DD/MM/AAAA para o Firebase
  const [documento, setDocumento] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Estados para o controle do calendário nativo
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  // Função que lida com a escolha da data no calendário nativo
  const onChangeData = (event, selectedDate) => {
    setShowCalendar(false);

    if (selectedDate) {
      setDateValue(selectedDate);

      const dia = String(selectedDate.getDate()).padStart(2, '0');
      const mes = String(selectedDate.getMonth() + 1).padStart(2, '0'); 
      const ano = selectedDate.getFullYear();
      
      setData(`${dia}/${mes}/${ano}`);
    }
  };

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
      if (Platform.OS === 'web') alert("Não foi possível selecionar o arquivo.");
      else Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  // Faz o upload do PDF puro para o Cloudinary via raw/upload
  const fazerUploadCloudinary = async (arquivo) => {
    const urlApi = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;
    
    const formData = new FormData();
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
    return dadosDoUpload.secure_url;
  };

  const salvarAta = async () => {
    if (!titulo || !conteudo || !data) {
      if (Platform.OS === 'web') alert("Por favor, preencha Título, Data e Conteúdo da ata.");
      else Alert.alert("Atenção", "Por favor, preencha Título, Data e Conteúdo da ata.");
      return;
    }

    setEnviando(true);
    let urlDocumentoSalvo = "";

    try {
      if (documento) {
        urlDocumentoSalvo = await fazerUploadCloudinary(documento);
      }

      await addDoc(collection(db, "atas"), {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        local: local.trim(),
        data: data.trim(),
        urlDocumento: urlDocumentoSalvo,
        criadoEm: new Date(),
        nomesPresentes: [], 
        quantidadePresentes: 0
      });

      if (Platform.OS === 'web') alert("Ata registrada com sucesso!");
      else Alert.alert("Sucesso", "Ata registrada com sucesso!");
      
      setTitulo("");
      setConteudo("");
      setLocal("");
      setData("");
      setDocumento(null);
      setDateValue(new Date());
      
      irParaListaAtas();
      
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      if (Platform.OS === 'web') alert("Houve um problema ao salvar a ata no sistema.");
      else Alert.alert("Erro", "Houve um problema ao salvar a ata no sistema.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[themeStyles.container, { paddingVertical: 20 }]}>
      <View style={themeStyles.formBox}>
        <Text style={[themeStyles.topbarTitle]}>Registrar Nova Ata</Text>

        <Text style={themeStyles.label}>Título da Ata</Text>
        <TextInput 
          style={themeStyles.input} 
          value={titulo} 
          onChangeText={setTitulo} 
          placeholder="Ex: Ata 15" 
          placeholderTextColor="#555" 
        />

        <Text style={themeStyles.label}>Data</Text>
        
        {/* 🌐 SE FOR WEB (PC): Renderiza um campo de texto convencional para digitação manual */}
        {Platform.OS === 'web' ? (
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={[themeStyles.input, { paddingRight: 40 }]}
              value={data}
              onChangeText={setData}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#555"
            />
            <Calendar size={18} color={data ? "#0a84ff" : "#555"} style={{ position: 'absolute', right: 15 }} />
          </View>
        ) : (
          /* 📱 SE FOR MOBILE: Mantém o botão touch que abre o modal nativo */
          <TouchableOpacity 
            style={[themeStyles.input, { justifyContent: "center" }]} 
            onPress={() => !enviando && setShowCalendar(true)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: data ? "#ffffff" : "#555", fontSize: 16 }}>
                {data || "Selecionar Data da Reunião"}
              </Text>
              <Calendar size={18} color={data ? "#0a84ff" : "#555"} />
            </View>
          </TouchableOpacity>
        )}

        {/* Componente do Calendário Nativo (Apenas roda no mobile) */}
        {showCalendar && Platform.OS !== 'web' && (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            onChange={onChangeData}
            maximumDate={new Date()} 
          />
        )}

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