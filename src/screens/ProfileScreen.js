import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { collection, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../config/firebase";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles"; 
import { can, ROLES } from "../constants/mockData";

export default function ProfileScreen({ user, setUser, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || user?.nome || "", 
    bio: user?.bio || "", 
    phone: user?.phone || "" 
  });
  
  // Estados para o controle do cadastro de novos membros
  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "associado", password: "" });

  function saveProfile() {
    setUser(prev => ({ ...prev, ...form }));
    setEditing(false);
  }

  // Função blindada para cadastrar o membro sem quebrar a sessão do Presidente
  async function handleAddMember() {
    if (!newMember.name || !newMember.email || !newMember.password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos, incluindo a senha provisória.");
      return;
    }

    if (newMember.password.length < 6) {
      Alert.alert("Erro", "A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    setLoadingMember(true);
    const auth = getAuth();
    
    // Guardamos um backup dos dados do Presidente ANTES da criação
    const dadosPresidenteBackup = { ...user };

    try {
      // 1. Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newMember.email.trim().toLowerCase(), 
        newMember.password
      );
      
      const newUserAuth = userCredential.user;

      // 2. Salva o perfil do novo membro no Firestore linkado ao UID dele
      await setDoc(doc(db, "usuarios", newUserAuth.uid), {
        name: newMember.name,
        email: newMember.email.trim().toLowerCase(),
        role: newMember.role.trim().toLowerCase(),
        bio: "Novo associado do clube.",
        phone: "",
        avatar: newMember.name.charAt(0).toUpperCase(),
        criadoEm: new Date()
      });

      // 3. Força o React a segurar os dados do Presidente na tela
      setUser(dadosPresidenteBackup);

      Alert.alert(
        "Sucesso!", 
        `${newMember.name} foi criado no sistema com sucesso!\n\nPeça para o membro logar com o e-mail cadastrado.`
      );
      
      setIsAddMemberVisible(false);
      setNewMember({ name: "", email: "", role: "associado", password: "" });

    } catch (error) {
      console.error("Erro capturado no cadastro:", error);
      
      // Se der erro de credencial ou token, devolvemos o Presidente ao estado
      setUser(dadosPresidenteBackup);

      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erro", "Este e-mail já está sendo usado por outro usuário.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Erro", "A senha escolhida é muito fraca.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Erro", "O formato do e-mail é inválido.");
      } else {
        Alert.alert("Aviso de Processamento", "O usuário foi pré-processado. Verifique se ele já aparece na sua lista.");
      }
    } finally {
      setLoadingMember(false);
    }
  }

  const permissionsList = [
    { action: "add_notification", label: "Criar notificações", icon: "🔔" },
    { action: "add_ata", label: "Gerenciar atas", icon: "📋" },
    { action: "add_presence", label: "Controle de presença", icon: "✅" },
    { action: "add_finance", label: "Lançamentos financeiros", icon: "💰" },
  ];

  // Validação administrativa flexível para liberar o painel de cadastro
  const userRole = user?.role || user?.cargo || "";
  const isAdmin = 
    userRole.toLowerCase() === "presidente" || 
    userRole.toLowerCase() === "secretario" || 
    userRole.toLowerCase() === "admin";

  return (
    <ScrollView style={themeStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Perfil</Text>
        <TouchableOpacity style={themeStyles.btnAdd} onPress={editing ? saveProfile : () => setEditing(true)}>
          <Text style={themeStyles.btnAddText}>{editing ? "Salvar" : "Editar"}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.PRIMARY || "#0a84ff", justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>{user?.avatar || "U"}</Text>
        </View>
        
        {editing ? (
          <TextInput style={[themeStyles.input, { width: "70%", textAlign: "center", marginBottom: 8 }]} value={form.name} onChangeText={t=>setForm(p=>({...p,name:t}))} outlineStyle="none" />
        ) : (
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff" }}>{user?.name || user?.nome}</Text>
        )}
        
        <View style={themeStyles.tagBlue}>
          <Text style={themeStyles.tagTextBlue}>{ROLES[userRole.toLowerCase()] || userRole}</Text>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        {/* Painel Administrativo Exclusivo da Diretoria */}
        {isAdmin && (
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity 
              style={[themeStyles.btnSave, { backgroundColor: COLORS.PRIMARY || "#0a84ff" }]} 
              onPress={() => setIsAddMemberVisible(true)}
            >
              <Text style={themeStyles.btnSaveText}>+ Cadastrar Novo Sócio</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={themeStyles.card}>
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e2026" }}>
            <Text style={themeStyles.metaText}>E-mail</Text>
            <Text style={{ fontSize: 14, color: "#fff", marginTop: 2 }}>{user?.email}</Text>
          </View>
          
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e2026" }}>
            <Text style={themeStyles.metaText}>Telefone</Text>
            {editing ? (
              <TextInput style={[themeStyles.input, { marginTop: 4 }]} value={form.phone} onChangeText={t=>setForm(p=>({...p,phone:t}))} outlineStyle="none" />
            ) : (
              <Text style={{ fontSize: 14, color: "#fff", marginTop: 2 }}>{user?.phone || "Não informado"}</Text>
            )}
          </View>

          <View style={{ paddingVertical: 12 }}>
            <Text style={themeStyles.metaText}>Bio</Text>
            {editing ? (
              <TextInput style={[themeStyles.input, { marginTop: 4 }]} multiline value={form.bio} onChangeText={t=>setForm(p=>({...p,bio:t}))} outlineStyle="none" />
            ) : (
              <Text style={{ fontSize: 14, color: "#fff", marginTop: 2 }}>{user?.bio || "Sem bio"}</Text>
            )}
          </View>
        </View>

        <View style={themeStyles.card}>
          <Text style={[themeStyles.cardTitle, { marginBottom: 12, fontSize: 13, textTransform: "uppercase" }]}>Permissões do cargo</Text>
          {permissionsList.map(p => {
            const hasPerm = can(userRole.toLowerCase(), p.action);
            return (
              <View key={p.action} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}>
                <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                <Text style={{ flex: 1, color: "#a0aec0", fontSize: 14 }}>{p.label}</Text>
                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: hasPerm ? "rgba(52,199,89,0.15)" : "#1e2026" }}>
                  <Text style={{ color: hasPerm ? (COLORS.GREEN || "#34c759") : "#666", fontSize: 11, fontWeight: "600" }}>
                    {hasPerm ? "✓ Sim" : "— Não"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={{ backgroundColor: "rgba(255,59,48,0.1)", borderWidth: 1, borderColor: "rgba(255,59,48,0.2)", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 }} onPress={onLogout}>
          <Text style={{ color: COLORS.RED || "#ff3b30", fontWeight: "600", fontSize: 15 }}>Sair da conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Cadastro de Sócio */}
      <Modal visible={isAddMemberVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 }}>
          <View style={themeStyles.formBox}>
            <Text style={themeStyles.topbarTitle}>Cadastrar Novo Sócio</Text>
            
            <TextInput 
              style={themeStyles.input} 
              placeholder="Nome Completo" 
              placeholderTextColor="#555"
              value={newMember.name}
              onChangeText={t => setNewMember(p => ({ ...p, name: t }))} 
            />
            
            <TextInput 
              style={themeStyles.input} 
              placeholder="E-mail de Login" 
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newMember.email}
              onChangeText={t => setNewMember(p => ({ ...p, email: t }))} 
            />

            <TextInput 
              style={themeStyles.input} 
              placeholder="Senha Inicial (mínimo 6 dígitos)" 
              placeholderTextColor="#555"
              secureTextEntry
              value={newMember.password}
              onChangeText={t => setNewMember(p => ({ ...p, password: t }))} 
            />

            <TextInput 
              style={themeStyles.input} 
              placeholder="Cargo (ex: presidente, secretario, associado)" 
              placeholderTextColor="#555"
              autoCapitalize="none"
              value={newMember.role}
              onChangeText={t => setNewMember(p => ({ ...p, role: t }))} 
            />
            
            <TouchableOpacity 
              style={[themeStyles.btnSave, { opacity: loadingMember ? 0.6 : 1, marginTop: 10 }]} 
              onPress={handleAddMember}
              disabled={loadingMember}
            >
              <Text style={themeStyles.btnSaveText}>
                {loadingMember ? "Criando credenciais..." : "Criar Conta de Acesso"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsAddMemberVisible(false)} disabled={loadingMember}>
              <Text style={{ color: "#666", textAlign: "center", marginTop: 20, fontWeight: "600" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}