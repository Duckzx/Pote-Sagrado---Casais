export interface Mission {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: "economia" | "desafio" | "custom";
  reward: number;
  recurrence?: "livre" | "diaria" | "semanal" | "mensal";
}

export type FilterType = "todas" | "economia" | "desafio" | "custom";

export const FILTERS: { id: FilterType; label: string; emoji: string }[] = [
  { id: "todas", label: "Todas", emoji: "🎯" },
  { id: "economia", label: "Economia", emoji: "💚" },
  { id: "desafio", label: "Desafios", emoji: "⚔️" },
  { id: "custom", label: "Minhas", emoji: "⭐" },
];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: "jantar_casa",
    title: "Jantar em Casa",
    desc: "Cozinharam juntos ao invés de pedir delivery.",
    icon: "🍝",
    category: "economia",
    reward: 0,
  },
  {
    id: "no_ifood",
    title: "Resistiu ao iFood",
    desc: "Venceram a tentação do delivery hoje.",
    icon: "🛵",
    category: "economia",
    reward: 0,
  },
  {
    id: "cafe_casa",
    title: "Café em Casa",
    desc: "Fizeram café ao invés de comprar na rua.",
    icon: "☕",
    category: "economia",
    reward: 0,
  },
  {
    id: "transporte",
    title: "Transporte Econômico",
    desc: "Usaram transporte público ou foram a pé.",
    icon: "🚌",
    category: "economia",
    reward: 0,
  },
  {
    id: "desapego",
    title: "Vendeu Desapego",
    desc: "Venderam algo que não usam mais.",
    icon: "📦",
    category: "economia",
    reward: 0,
  },
  {
    id: "passeio_gratis",
    title: "Passeio Gratuito",
    desc: "Encontraram diversão sem gastar nada.",
    icon: "🌳",
    category: "economia",
    reward: 0,
  },
  {
    id: "extra",
    title: "Renda Extra",
    desc: "Conseguiram uma graninha a mais!",
    icon: "💰",
    category: "economia",
    reward: 0,
  },
  {
    id: "promocao",
    title: "Aproveitou Promoção",
    desc: "Economizaram comprando em promoção.",
    icon: "🏷️",
    category: "economia",
    reward: 0,
  },
  {
    id: "multa",
    title: "Multa da Regra",
    desc: "Alguém quebrou uma regra e paga a multa!",
    icon: "⚖️",
    category: "economia",
    reward: 0,
  },
  {
    id: "c1",
    title: "Marmita Week",
    desc: "Levar marmita todos os dias úteis da semana.",
    icon: "🍱",
    category: "desafio",
    reward: 100,
    recurrence: "semanal",
  },
  {
    id: "c2",
    title: "Sexta Caseira",
    desc: "Trocar o barzinho por um jantar a dois em casa.",
    icon: "🍷",
    category: "desafio",
    reward: 80,
    recurrence: "semanal",
  },
  {
    id: "c3",
    title: "Faxina a Dois",
    desc: "Limpar a casa juntos no fim de semana.",
    icon: "🧹",
    category: "desafio",
    reward: 150,
    recurrence: "semanal",
  },
  {
    id: "c4",
    title: "Desafio do Café",
    desc: "Fazer café em casa a semana toda.",
    icon: "☕",
    category: "desafio",
    reward: 35,
    recurrence: "semanal",
  },
];
