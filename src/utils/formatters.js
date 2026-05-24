export function formatCurrency(v) {
  return "R$ " + Math.abs(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatDate(d) {
  if (!d) return "";
  // Tratamento simples para evitar problemas de fuso horário local no JavaScript do motor mobile
  const parts = d.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR");
}