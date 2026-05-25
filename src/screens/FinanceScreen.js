import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Alert
} from "react-native";
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles"; 
import { formatCurrency, formatDate } from "../utils/formatters";

export default function FinanceScreen({ user }) {
  const [finance, setFinance] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "entrada", desc: "", amount: "", date: "", category: "Geral" });

  // 1. Escuta a coleção 'financas' em tempo real organizada por data de criação
  useEffect(() => {
    const q = query(collection(db, "financas"), orderBy("criadoEm", "desc"));
    return onSnapshot(q, (snapshot) => {
      setFinance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // 2. Validação administrativa flexível (Presidente, Secretário, Tesoureiro ou Admin)
  const userRole = user?.role || user?.cargo || "";
  const canEdit = 
    userRole.toLowerCase() === "presidente" || 
    userRole.toLowerCase() === "secretario" || 
    userRole.toLowerCase() === "tesoureiro" || 
    userRole.toLowerCase() === "admin" ||
    !userRole;

  // 3. Cálculos matemáticos baseados nos documentos dinâmicos do Firebase
  const total = finance.reduce((s, f) => s + f.amount, 0);
  const totalEntradas = finance.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0);
  const totalSaidas = finance.filter(f => f.amount < 0).reduce((s, f) => s + Math.abs(f.amount), 0);

  // 4. Salva a nova movimentação no Firestore
  async function addTransaction() {
    const val = parseFloat(form.amount);
    if (!val || !form.desc || !form.date) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (form.date.length < 10) {
      Alert.alert("Atenção", "Por favor, insira a data completa no formato DD/MM/AAAA.");
      return;
    }

    setLoading(true);
    const amountCalculated = form.type === "saida" ? -Math.abs(val) : Math.abs(val);

    try {
      await addDoc(collection(db, "financas"), {
        desc: form.desc,
        amount: amountCalculated,
        date: form.date, // Salva o formato DD/MM/AAAA padronizado
        category: form.category || "Geral",
        type: form.type,
        criadoEm: serverTimestamp(),
        lancadoPor: user?.name || user?.nome || "Tesouraria"
      });

      setModalVisible(false);
      setForm({ type: "entrada", desc: "", amount: "", date: "", category: "Geral" });
      Alert.alert("Sucesso", "Movimentação financeira lançada no caixa do clube!");
    } catch (error) {
      console.error("Erro ao salvar lançamento financeiro:", error);
      Alert.alert("Erro ao lançar", error.message);
    } finally {
      setLoading(false); // 👈 Destrava o botão perfeitamente aqui
    }
  }

  // 5. Renderização do gráfico mensal blindada contra formatos de data
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthData = months.map((m, i) => {
    const mv = finance.filter(f => {
      if (!f.date) return false;

      let mesDoCard = -1;

      // Trata as datas salvas como string de forma dinâmica
      if (typeof f.date === "string") {
        if (f.date.includes("-")) {
          // Formato americano antigo: AAAA-MM-DD
          mesDoCard = parseInt(f.date.split("-")[1], 10) - 1;
        } else if (f.date.includes("/")) {
          // Formato brasileiro novo: DD/MM/AAAA
          mesDoCard = parseInt(f.date.split("/")[1], 10) - 1;
        }
      } 
      // Caso o Firebase salve como objeto Date ou Timestamp nativo
      else if (f.date.toDate instanceof Function) {
        mesDoCard = f.date.toDate().getMonth();
      } else if (f.date instanceof Date) {
        mesDoCard = f.date.getMonth();
      }

      return mesDoCard === i;
    }).reduce((s, f) => s + f.amount, 0);

    return { m, v: mv };
  });
  
  const maxAbs = Math.max(...monthData.map(d => Math.abs(d.v)), 1);

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.topbar}>
        <Text style={themeStyles.topbarTitle}>Tesouraria</Text>
        {canEdit && (
          <TouchableOpacity style={themeStyles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={themeStyles.btnAddText}>+ Lançar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* Card de Saldo Geral */}
        <View style={[themeStyles.card, { 
          alignItems: "center", 
          paddingVertical: 24,
          backgroundColor: total >= 0 ? "rgba(52,199,89,0.03)" : "rgba(255,59,48,0.03)",
          borderColor: total >= 0 ? "rgba(52,199,89,0.15)" : "rgba(255,59,48,0.15)" 
        }]}>
          <Text style={[themeStyles.metaText, { textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }]}>Saldo Atual</Text>
          <Text style={{ fontSize: 32, fontWeight: "800", color: total >= 0 ? COLORS.GREEN || "#34c759" : COLORS.RED || "#ff3b30", marginTop: 4 }}>
            {formatCurrency(total)}
          </Text>
        </View>

        {/* Entradas e Saídas lado a lado */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={[themeStyles.card, { flex: 1, borderColor: "rgba(52,199,89,0.15)" }]}>
            <Text style={[themeStyles.metaText, { fontSize: 12 }]}>Entradas</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.GREEN || "#34c759", marginTop: 4 }}>
              {formatCurrency(totalEntradas)}
            </Text>
          </View>
          <View style={[themeStyles.card, { flex: 1, borderColor: "rgba(255,59,48,0.15)" }]}>
            <Text style={[themeStyles.metaText, { fontSize: 12 }]}>Saídas</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.RED || "#ff3b30", marginTop: 4 }}>
              {formatCurrency(totalSaidas)}
            </Text>
          </View>
        </View>

        {/* Gráfico de Fluxo Mensal */}
        <View style={themeStyles.card}>
          <Text style={[themeStyles.metaText, { fontWeight: "600", textTransform: "uppercase", fontSize: 11, marginBottom: 14, letterSpacing: 0.5 }]}>Fluxo por Mês</Text>
          {monthData.map(({ m, v }) => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }} key={m}>
              <Text style={[themeStyles.metaText, { width: 32, fontSize: 12 }]}>{m}</Text>
              
              <View style={{ flex: 1, height: 6, backgroundColor: "#111216", borderRadius: 3, overflow: "hidden" }}>
                <View style={{ 
                  height: "100%", 
                  borderRadius: 3,
                  width: `${(Math.abs(v) / maxAbs) * 100}%`,
                  backgroundColor: v >= 0 ? COLORS.GREEN || "#34c759" : COLORS.RED || "#ff3b30" 
                }} />
              </View>
              
              <Text style={{ fontSize: 12, fontWeight: "500", width: 85, textAlign: "right", color: v > 0 ? COLORS.GREEN || "#34c759" : v < 0 ? COLORS.RED || "#ff3b30" : "#4a5568" }}>
                {v !== 0 ? formatCurrency(v) : "—"}
              </Text>
            </View>
          ))}
        </View>

        {/* Histórico Financeiro Dinâmico */}
        <Text style={[themeStyles.cardTitle, { marginTop: 12, marginBottom: 12, fontSize: 16 }]}>Histórico</Text>
        
        {finance.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 20 }}>
            Nenhum lançamento registrado no caixa.
          </Text>
        ) : (
          finance.map(f => (
            <View style={[themeStyles.card, { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, marginBottom: 8 }]} key={f.id}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: f.amount > 0 ? COLORS.GREEN || "#34c759" : COLORS.RED || "#ff3b30" }} />
              
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}>{f.desc}</Text>
                <Text style={[themeStyles.metaText, { fontSize: 12, marginTop: 2 }]}>{formatDate(f.date)}</Text>
              </View>
              
              <Text style={{ fontSize: 14, fontWeight: "600", color: f.amount > 0 ? COLORS.GREEN || "#34c759" : COLORS.RED || "#ff3b30" }}>
                {f.amount > 0 ? "+" : ""}{formatCurrency(f.amount)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Lançamento */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" }}>
          <View style={themeStyles.formBox}>
            <Text style={themeStyles.topbarTitle}>Novo Lançamento</Text>
            
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 4, marginTop: 14 }}>
              <TouchableOpacity 
                style={[{ flex: 1, padding: 12, backgroundColor: "#111216", borderRadius: 12, alignItems: "center" }, form.type === "entrada" && { backgroundColor: COLORS.GREEN || "#34c759" }]} 
                onPress={()=>setForm(p=>({...p,type:"entrada"}))}
                disabled={loading}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Entrada</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[{ flex: 1, padding: 12, backgroundColor: "#111216", borderRadius: 12, alignItems: "center" }, form.type === "saida" && { backgroundColor: COLORS.RED || "#ff3b30" }]} 
                onPress={()=>setForm(p=>({...p,type:"saida"}))}
                disabled={loading}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Saída</Text>
              </TouchableOpacity>
            </View>

            <Text style={themeStyles.label}>Descrição</Text>
            <TextInput style={themeStyles.input} value={form.desc} onChangeText={t=>setForm(p=>({...p,desc:t}))} placeholder="Ex: Venda de rifas" placeholderTextColor="#444" outlineStyle="none" disabled={loading} />

            <Text style={themeStyles.label}>Valor (R$)</Text>
            <TextInput style={themeStyles.input} value={form.amount} onChangeText={t=>setForm(p=>({...p,amount:t}))} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#444" outlineStyle="none" disabled={loading} />

            <Text style={themeStyles.label}>Data</Text>
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
              placeholderTextColor="#444" 
              outlineStyle="none" 
              disabled={loading} 
            />

            <View style={{ flexDirection: "row", gap: 12, marginTop: 28 }}>
              <TouchableOpacity style={{ flex: 1, padding: 14, backgroundColor: "#1e2026", borderRadius: 12, alignItems: "center" }} onPress={() => setModalVisible(false)} disabled={loading}>
                <Text style={{ color: "#a0aec0", fontWeight: "600" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[themeStyles.btnSave, { flex: 2, marginTop: 0, opacity: loading ? 0.6 : 1 }]} onPress={addTransaction} disabled={loading}>
                <Text style={themeStyles.btnSaveText}>{loading ? "Lançando..." : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    //teste
  );
}