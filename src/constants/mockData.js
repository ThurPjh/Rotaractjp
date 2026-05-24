export const ROLES = {
  associado: "Associado",
  secretaria: "Secretaria",
  tesouraria: "Tesouraria",
  protocolo: "Diretor de Protocolo",
  presidente: "Presidente",
};

export const DEMO_USERS = [
  { id: 1, name: "Ana Lima", email: "ana@rotaract.com", password: "123", role: "associado", avatar: "AL", bio: "Membro desde 2022", phone: "(34) 99999-0001" },
  { id: 2, name: "Bruna Silva", email: "bruna@rotaract.com", password: "123", role: "secretaria", avatar: "BS", bio: "Secretária do clube", phone: "(34) 99999-0002" },
  { id: 3, name: "Carlos Mendes", email: "carlos@rotaract.com", password: "123", role: "tesouraria", avatar: "CM", bio: "Tesoureiro", phone: "(34) 99999-0003" },
  { id: 4, name: "Diana Costa", email: "diana@rotaract.com", password: "123", role: "protocolo", avatar: "DC", bio: "Diretora de Protocolo", phone: "(34) 99999-0004" },
  { id: 5, name: "Eduardo Rocha", email: "eduardo@rotaract.com", password: "123", role: "presidente", avatar: "ER", bio: "Presidente do clube", phone: "(34) 99999-0005" },
];

export const can = (role, action) => {
  const perms = {
    associado: ["view"],
    secretaria: ["view", "add_ata", "add_presence"],
    tesouraria: ["view", "add_finance"],
    protocolo: ["view", "add_notification"],
    presidente: ["view", "add_ata", "add_presence", "add_finance", "add_notification", "admin"],
  };
  return (perms[role] || []).includes(action);
};

export const INITIAL_FINANCE = [
  { id: 1, type: "entrada", desc: "Cota mensal abril", amount: 850, date: "2026-04-15", category: "Cotas" },
  { id: 2, type: "saida", desc: "Material para projeto", amount: -230, date: "2026-04-20", category: "Projetos" },
  { id: 3, type: "entrada", desc: "Venda de rifas", amount: 320, date: "2026-05-02", category: "Arrecadação" },
  { id: 4, type: "saida", desc: "Aluguel salão", amount: -150, date: "2026-05-10", category: "Administrativo" },
];

export const INITIAL_NOTIFS = [
  { id: 1, type: "reuniao", title: "Reunião Ordinária #8", date: "2026-05-27", location: "Sede do Rotaract – Salão Principal", description: "Pauta: projetos do semestre.", createdBy: "Diana Costa" },
  { id: 2, type: "ata", title: "Ata #7 disponível", date: "2026-05-20", location: "", description: "Ata da reunião de 13/05 publicada.", createdBy: "Diana Costa" },
];

export const INITIAL_ATAS = [
  { id: 1, title: "Reunião Ordinária #7", date: "2026-05-13", description: "Aprovado novo projeto social.", fileName: "ata_07_mai26.pdf", createdBy: "Bruna Silva" },
];

export const INITIAL_PRESENCE = [
  { id: 1, type: "reuniao", title: "Reunião Ordinária #7", date: "2026-05-13", members: DEMO_USERS.map((u, i) => ({ ...u, present: i < 3 })) },
];