import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

// Garanta que no seu arquivo colors.js existam essas chaves, 
// ou caso contrário, o código usará os padrões escuros definidos abaixo:
const BG_DARK = "#0d0e12";
const CARD_DARK = "#16171d";
const BORDER_DARK = "#1e2026";
const INPUT_BG = "#111216";

export const themeStyles = StyleSheet.create({
  // Tela principal
  container: { 
    flex: 1, 
    backgroundColor: COLORS.BACKGROUND || BG_DARK,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  
  // Topbar / Cabeçalho superior
  topbar: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 20, 
    borderBottomWidth: 1, 
    borderColor: BORDER_DARK,
    marginBottom: 16
  },
  topbarTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#fff"
  },

  topbarTitleNot: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#fff",
    marginBottom: 16

  },
  
  
  // Botões de Ação Principais (Adicionar/Nova Ata)
  btnAdd: { 
    backgroundColor: COLORS.PRIMARY || "#003399", 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 10 
  },
  btnAddText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 13 
  },

  // Cards de Listagem (Atas, Notificações, etc)
  card: { 
    backgroundColor: COLORS.CARD_BG || CARD_DARK, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER || BORDER_DARK, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12 
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 8,
    alignItems: "center"
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#fff", 
    marginBottom: 4 
  },
  metaText: { 
    fontSize: 13, 
    color: "#a0aec0" // Texto secundário claro
  },
  descText: { 
    fontSize: 14, 
    color: "#718096", // Conteúdo / Resumos
    marginTop: 8,
    lineHeight: 20
  },

  // Tags com opacidade (estilo as de Notificações)
  tagBlue: { 
    backgroundColor: "rgba(10,132,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20
  },
  tagTextBlue: { 
    fontSize: 11, 
    fontWeight: "600", 
    color: "#0a84ff" 
  },

  // Formulários e Telas de Criação
  formBox: {
    backgroundColor: COLORS.CARD_BG || CARD_DARK,
    width: "100%",
    maxWidth: 600, // Centralização perfeita na web
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER || BORDER_DARK,
    alignSelf: "center",
    marginTop: 10
  },
  label: { 
    fontSize: 12, 
    color: "#a0aec0", 
    marginBottom: 6, 
    marginTop: 14,
    fontWeight: "600"
  },
  input: { 
    backgroundColor: INPUT_BG, 
    borderWidth: 1, 
    borderColor: COLORS.INPUT_BORDER || BORDER_DARK, 
    borderRadius: 12, 
    padding: 12, 
    color: "#fff",
    fontSize: 15,
    outlineStyle: "none",
    marginBottom: 16,
  },
  textArea: {
    textAlignVertical: "top",
    height: 120
  },

  ql: { padding: 6 },

  // Botões Grandes de Formulário (Salvar/Gravar)
  btnSave: { 
    padding: 14, 
    backgroundColor: COLORS.PRIMARY || "#003399", 
    borderRadius: 12, 
    alignItems: "center",
    marginTop: 24,
    cursor: "pointer"
  },
  btnSaveText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 16
  },

  // Botões Secundários (Selecionar Arquivo)
  btnSecondary: {
    backgroundColor: "#1e2026",
    borderWidth: 1,
    borderColor: "#2d3139",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    cursor: "pointer"
  },
  btnSecondaryText: {
    color: "#a0aec0",
    fontWeight: "600",
    fontSize: 14
  },
  btnSecondaryActive: {
    borderColor: "#0a84ff",
    backgroundColor: "rgba(10,132,255,0.05)"
  },

  // Estados vazios ou carregamento
  empty: { 
    padding: 40, 
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: { 
    color: "#555",
    fontSize: 15
  }
});