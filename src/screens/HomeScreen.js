import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { COLORS } from "../constants/colors";
import { themeStyles } from "../constants/themeStyles";
import { formatCurrency } from "../utils/formatters";
import { Calendar, MapPin, Users, FileText, Plus, Trash2 } from "lucide-react-native";


// 1. FUNÇÃO DE BLINDAGEM DA DATA: Calcula se a reunião pertence à semana atual
function isReuniaoNestaSemana(dateString) {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !dateString.includes("/")
  )
    return false;

  try {
    const partes = dateString.split("/");
    if (partes.length !== 3) return false;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    const dataReuniao = new Date(ano, mes - 1, dia);
    if (isNaN(dataReuniao.getTime())) return false;

    const hoje = new Date();
    const diaDaSemanaAtual = hoje.getDay();

    // Início da semana (Domingo 00:00:00)
    const primeiroDiaSemana = new Date(hoje);
    primeiroDiaSemana.setDate(hoje.getDate() - diaDaSemanaAtual);
    primeiroDiaSemana.setHours(0, 0, 0, 0);

    // Fim da semana (Sábado 23:59:59)
    const ultimoDiaSemana = new Date(primeiroDiaSemana);
    ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6);
    ultimoDiaSemana.setHours(23, 59, 59, 999);

    return dataReuniao >= primeiroDiaSemana && dataReuniao <= ultimoDiaSemana;
  } catch (err) {
    return false;
  }
}

export default function HomeScreen({ user }) {
  // Estados dinâmicos para dados do Firestore
  const [reunioes, setReunioes] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [financas, setFinancas] = useState([]);
  const [atas, setAtas] = useState([]);

  // Escuta os dados reais do Firebase em tempo real com tratamentos anti-permissão
  useEffect(() => {
    // 1. Escuta todas as reuniões para alimentar os contadores
    const qReunioes = query(
      collection(db, "reunioes"),
      orderBy("criadoEm", "desc"),
    );
    const unsubscribeReunioes = onSnapshot(
      qReunioes,
      (snapshot) => {
        setReunioes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (err) => console.log("Aguardando permissões de reuniões..."),
    );

    // 2. Escuta apenas as 3 últimas reuniões criadas para o card de "Avisos Recentes"
    const qRecentes = query(
      collection(db, "reunioes"),
      orderBy("criadoEm", "desc"),
      limit(3),
    );
    const unsubscribeRecentes = onSnapshot(
      qRecentes,
      (snapshot) => {
        setRecentes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (err) => console.log("Aguardando permissões de recentes..."),
    );

    // 3. Escuta todo o histórico financeiro para calcular o saldo geral em tempo real
    const qFinancas = query(collection(db, "financas"));
    const unsubscribeFinancas = onSnapshot(
      qFinancas,
      (snapshot) => {
        setFinancas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
      (err) => console.log("Aguardando permissões de finanças..."),
    );

    // 4. Escuta em tempo real a tabela dedicada de atas
    const qAtas = query(collection(db, "atas"));
    const unsubscribeAtas = onSnapshot(
      qAtas,
      (snapshot) => {
        setAtas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.log("Aguardando permissões de atas..."),
    );

    // Desconecta todos os listeners quando o usuário sai da tela
    return () => {
      unsubscribeReunioes();
      unsubscribeRecentes();
      unsubscribeFinancas();
      unsubscribeAtas();
    };
  }, []);

  // Tratamento resiliente do nome e cargo do usuário logado
  const nomeUsuario = user?.name || user?.nome || "Associado";
  const cargoUsuario = user?.role || user?.cargo || "Membro";

  // Cálculos baseados nos dados em tempo real do banco
  const total = financas.reduce((s, f) => s + f.amount, 0);

  // Mapeamento Inteligente dos contadores do Dashboard
  const reunioesNestaSemana = (reunioes || []).filter((ev) => isReuniaoNestaSemana(ev?.date || ev?.data)).length;
  
  // Modificado para usar criadoEm ou a própria data do evento para checar novidades da semana
  const reunioesCriadasEstaSemana = (reunioes || []).filter(ev => isReuniaoNestaSemana(ev?.date || ev?.data)).length;
  const atasCriadasEstaSemana = (atas || []).filter(ata => isReuniaoNestaSemana(ata?.date || ata?.data || ata?.criadoEm)).length;
  const totalNotificacoesSemana = reunioesCriadasEstaSemana + atasCriadasEstaSemana;

  // Junta as últimas Atas e as últimas Reuniões
  const atasFormatadas = atas.map(a => ({ ...a, tipoFeed: "ata" }));
  const reunioesFormatadas = recentes.map(r => ({ ...r, tipoFeed: "reunião" }));

  // Junta os arrays, ordena pelo timestamp do Firebase descrescentemente e limita em 4 itens
  const feedRecente = [...reunioesFormatadas, ...atasFormatadas]
    .sort((a, b) => {
      const tempoA = a.criadoEm?.seconds || 0;
      const tempoB = b.criadoEm?.seconds || 0;
      return tempoB - tempoA;
    })
    .slice(0, 4); 


  return (
    <ScrollView
      style={themeStyles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* TOPBAR COM A LOGO SEM O HÍFEN QUEBRADO */}
      <View style={themeStyles.topbar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={themeStyles.topbarTitle}>Rotaract</Text>
          <Image
            source={require("../../assets/alegre.png")}
            style={{ width: 100, height: 50, marginLeft: -30 }}
          />
        </View>
        <View style={themeStyles.tagBlue}>
          <Text style={themeStyles.tagTextBlue}>
            {cargoUsuario.charAt(0).toUpperCase() + cargoUsuario.slice(1)}
          </Text>
        </View>
      </View>

      {/* SEÇÃO DE BOAS-VINDAS E CARDS CONTADORES */}
      <View
        style={{ paddingVertical: 12, marginBottom: 16, paddingHorizontal: 20 }}
      >
        <Text style={[themeStyles.metaText, { fontSize: 13 }]}>
          Olá, bem-vindo 👋
        </Text>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: COLORS.PRIMARY,
            marginBottom: 18,
            marginTop: 4,
          }}
        >
          {nomeUsuario.split(" ")[0]}
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Card 1: Reuniões */}
          <View
            style={[
              themeStyles.card,
              { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 },
            ]}
          >
            <Text
              style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY }}
            >
              {reunioesNestaSemana}
            </Text>
            <Text
              style={[
                themeStyles.metaText,
                {
                  fontSize: 10,
                  marginTop: 4,
                  textTransform: "uppercase",
                  fontWeight: "600",
                },
              ]}
            >
              {reunioesNestaSemana > 1
                ? "Reuniões na semana"
                : "Reunião na semana"}
            </Text>
          </View>

          {/* Card 2: Notificações da Semana */}
          <View
            style={[
              themeStyles.card,
              { flex: 1, alignItems: "center", padding: 14, marginBottom: 0 },
            ]}
          >
            <Text
              style={{ fontSize: 22, fontWeight: "800", color: COLORS.PRIMARY }}
            >
              {totalNotificacoesSemana}
            </Text>
            <Text
              style={[
                themeStyles.metaText,
                {
                  fontSize: 10,
                  marginTop: 4,
                  textTransform: "uppercase",
                  fontWeight: "600",
                },
              ]}
            >
              Notificações
            </Text>
          </View>
        </View>
      </View>

      {/* SEÇÃO DE AVISOS RECENTES (AGORA REUNINDO ATAS + REUNIÕES) */}
      <View style={{ marginTop: 8, paddingHorizontal: 20 }}>
        <Text
          style={[themeStyles.cardTitle, { marginBottom: 12, fontSize: 16 }]}
        >
          Avisos Recentes
        </Text>

        {feedRecente.length === 0 && (
          <View
            style={[themeStyles.card, { alignItems: "center", padding: 24 }]}
          >
            <Text style={themeStyles.emptyText}>🔔 Nenhuma novidade ainda</Text>
          </View>
        )}

        {feedRecente.map((n) => (
          <View style={themeStyles.card} key={n.id}>
            <View style={[themeStyles.cardHeader, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff", flex: 1 }}>
                {n.tipoFeed === "ata" 
                  ? `${n.title || n.titulo || "Documento de Reunião"}`
                  : `${n.title || n.titulo || "Reunião do Clube"}`}
              </Text>
              
              {/* Tag visual para diferenciar o tipo de aviso de forma limpa */}
              <View style={{ 
                backgroundColor: n.tipoFeed === "ata" ? "rgba(52,199,89,0.15)" : "rgba(0,122,255,0.15)",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4
              }}>
                <Text style={{ 
                  fontSize: 9, 
                  fontWeight: "700", 
                  color: n.tipoFeed === "ata" ? "#34c759" : "#007aff",
                  textTransform: "uppercase"
                }}>
                  {n.tipoFeed}
                </Text>
              </View>
            </View>

            {/* Linha da Data */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
              <Calendar size={13} color="#E91467" />
              <Text style={[themeStyles.metaText, { fontSize: 12, marginTop: 0 }]}>
                {n.date || n.data || "Sem data"}
              </Text>
            </View>

            {/* Linha do Local (Apenas se NÃO for ata e tiver um local preenchido) */}
            {n.tipoFeed !== "ata" && (n.location || n.local) ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <MapPin size={13} color="#E91467" />
                <Text style={[themeStyles.metaText, { fontSize: 12, marginTop: 0 }]}>
                  {n.location || n.local}
                </Text>
              </View>
            ) : null}
            
            {n.description || n.desc || n.pauta || n.name ? (
              <Text style={[themeStyles.descText, { marginTop: 8 }]}>
                {n.description || n.desc || n.pauta || `Arquivo selecionado: ${n.name || ""}`}
              </Text>
            ) : null}
          </View>
        ))}

        {/* SEÇÃO DE SALDO DO CLUBE */}
        <Text
          style={[
            themeStyles.cardTitle,
            { marginTop: 24, marginBottom: 12, fontSize: 16 },
          ]}
        >
          Saldo do Clube
        </Text>
        <View
          style={[
            themeStyles.card,
            {
              paddingVertical: 20,
              alignItems: "center",
              backgroundColor:
                total >= 0 ? "rgba(52,199,89,0.03)" : "rgba(255,59,48,0.03)",
              borderColor:
                total >= 0 ? "rgba(52,199,89,0.15)" : "rgba(255,59,48,0.15)",
            },
          ]}
        >
          <Text
            style={[
              themeStyles.metaText,
              { textTransform: "uppercase", fontSize: 10, letterSpacing: 1 },
            ]}
          >
            Saldo Disponível
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              marginTop: 4,
              color: total >= 0 ? COLORS.GREEN : COLORS.RED,
            }}
          >
            {formatCurrency(total)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}