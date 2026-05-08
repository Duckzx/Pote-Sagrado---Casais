import { 
  Plane, 
  Car, 
  Bike, 
  Home, 
  Heart, 
  ShieldCheck, 
  Target 
} from "lucide-react";
import { GoalType } from "../types";

export interface GoalCategory {
  id: GoalType;
  label: string;
  icon: any;
  placeholder: string;
  motivationalQuotes: { text: string; emoji: string }[];
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: "travel",
    label: "Viagem",
    icon: Plane,
    placeholder: "Paris, Praia, Disney...",
    motivationalQuotes: [
      { text: "Quem economiza hoje, viaja amanhã.", emoji: "✈️" },
      { text: "Cada centavo é um passo mais perto do destino.", emoji: "👣" },
      { text: "Pequenas escolhas, grandes viagens.", emoji: "🌍" },
    ],
  },
  {
    id: "car",
    label: "Carro",
    icon: Car,
    placeholder: "Nosso primeiro carro, SUV...",
    motivationalQuotes: [
      { text: "Acelerando rumo ao nosso novo carro!", emoji: "🚗" },
      { text: "Cada quilômetro de economia nos aproxima da garagem.", emoji: "⛽" },
      { text: "Conforto e liberdade estão chegando.", emoji: "🛣️" },
    ],
  },
  {
    id: "motorcycle",
    label: "Moto",
    icon: Bike,
    placeholder: "Nossa moto, Scooter...",
    motivationalQuotes: [
      { text: "Sentindo o vento da liberdade chegar!", emoji: "🏍️" },
      { text: "Economizando para as curvas da vida.", emoji: "🏁" },
      { text: "Duas rodas, um só objetivo.", emoji: "🤘" },
    ],
  },
  {
    id: "house",
    label: "Casa",
    icon: Home,
    placeholder: "Nosso apartamento, Reforma...",
    motivationalQuotes: [
      { text: "Construindo o nosso lar, tijolo por tijolo.", emoji: "🏠" },
      { text: "Um teto de amor e segurança para nós.", emoji: "🔑" },
      { text: "Nosso canto, nossas regras, nossa conquista.", emoji: "🪴" },
    ],
  },
  {
    id: "wedding",
    label: "Casamento",
    icon: Heart,
    placeholder: "Festa, Lua de Mel, Alianças...",
    motivationalQuotes: [
      { text: "O 'Sim' mais importante está sendo planejado.", emoji: "💍" },
      { text: "Celebrando o nosso amor em cada economia.", emoji: "🥂" },
      { text: "O início do nosso 'felizes para sempre'.", emoji: "👰" },
    ],
  },
  {
    id: "savings",
    label: "Reserva",
    icon: ShieldCheck,
    placeholder: "Fundo de emergência, Investimento...",
    motivationalQuotes: [
      { text: "Nossa segurança financeira é nossa paz.", emoji: "🛡️" },
      { text: "Plantando hoje para colher tranquilidade amanhã.", emoji: "📈" },
      { text: "Poupando por segurança e liberdade.", emoji: "💎" },
    ],
  },
  {
    id: "other",
    label: "Outro",
    icon: Target,
    placeholder: "Qualquer outro sonho...",
    motivationalQuotes: [
      { text: "Qualquer sonho é possível se pouparem juntos.", emoji: "🎯" },
      { text: "Foco no objetivo e o pote crescerá.", emoji: "🚀" },
      { text: "Juntos, transformamos desejos em realidade.", emoji: "✨" },
    ],
  },
];
