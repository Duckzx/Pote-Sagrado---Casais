import { LoveCard } from '../types';

/**
 * Static deck of Love Cards inspired by Gottman Love Maps.
 * 4 categories × 5 levels = ~80 cards.
 * Only interactions/progress are stored in Firestore.
 */

// ========================================
// Amor & Romance
// ========================================
const loveRomance: LoveCard[] = [
  // Level 1 — Light & Playful
  { id: 'lr-1-1', title: 'Elogio Surpresa', description: 'Diga ao seu parceiro(a) 3 coisas que adora nele(a) sem pensar muito.', category: 'love_romance', level: 1, emoji: '💕' },
  { id: 'lr-1-2', title: 'Memória Favorita', description: 'Qual é a sua memória mais doce juntos? Conte em detalhes.', category: 'love_romance', level: 1, emoji: '🌸' },
  { id: 'lr-1-3', title: 'Primeira Impressão', description: 'O que pensou quando viu seu parceiro(a) pela primeira vez?', category: 'love_romance', level: 1, emoji: '✨' },
  { id: 'lr-1-4', title: 'Música do Casal', description: 'Se tivessem uma música tema, qual seria? Explique porquê.', category: 'love_romance', level: 1, emoji: '🎵' },
  // Level 2 — Warming Up
  { id: 'lr-2-1', title: 'Carta de Amor', description: 'Escreva uma mini carta de amor de 3 frases para o seu parceiro(a).', category: 'love_romance', level: 2, emoji: '💌' },
  { id: 'lr-2-2', title: 'Momento Perfeito', description: 'Descreva o encontro perfeito que gostaria de ter juntos.', category: 'love_romance', level: 2, emoji: '🌙' },
  { id: 'lr-2-3', title: 'Gesto Marcante', description: 'Qual gesto do seu parceiro(a) mais te emocionou?', category: 'love_romance', level: 2, emoji: '🥹' },
  { id: 'lr-2-4', title: 'Superpoder do Amor', description: 'Se o vosso amor fosse um superpoder, qual seria e porquê?', category: 'love_romance', level: 2, emoji: '⚡' },
  // Level 3 — Going Deeper
  { id: 'lr-3-1', title: 'Admiração Profunda', description: 'Qual qualidade do seu parceiro(a) te inspira a ser uma pessoa melhor?', category: 'love_romance', level: 3, emoji: '💎' },
  { id: 'lr-3-2', title: 'Ritual Sagrado', description: 'Que ritual diário gostariam de criar juntos? (ex: café juntos, caminhada)', category: 'love_romance', level: 3, emoji: '☕' },
  { id: 'lr-3-3', title: 'Sonho a Dois', description: 'Onde se veem juntos daqui a 10 anos? Descreva em detalhe.', category: 'love_romance', level: 3, emoji: '🏡' },
  { id: 'lr-3-4', title: 'Porto Seguro', description: 'Em que momento difícil o seu parceiro(a) foi o seu porto seguro?', category: 'love_romance', level: 3, emoji: '⚓' },
  // Level 4 — Vulnerable
  { id: 'lr-4-1', title: 'Pedido do Coração', description: 'O que gostaria de pedir ao seu parceiro(a) mas nunca teve coragem?', category: 'love_romance', level: 4, emoji: '💗' },
  { id: 'lr-4-2', title: 'Cicatriz Curada', description: 'Que ferida emocional o vosso amor ajudou a sarar?', category: 'love_romance', level: 4, emoji: '🩹' },
  { id: 'lr-4-3', title: 'Promessa Eterna', description: 'Se pudesse fazer uma única promessa para o resto da vida, qual seria?', category: 'love_romance', level: 4, emoji: '💍' },
  { id: 'lr-4-4', title: 'Vulnerabilidade', description: 'Qual é o seu maior medo em relação a esta relação?', category: 'love_romance', level: 4, emoji: '🦋' },
  // Level 5 — Deep Intimacy
  { id: 'lr-5-1', title: 'Confissão Guardada', description: 'Partilhe algo sobre os seus sentimentos que nunca disse em voz alta.', category: 'love_romance', level: 5, emoji: '🔮' },
  { id: 'lr-5-2', title: 'Alma Nua', description: 'Se o seu parceiro(a) pudesse ler a sua mente por 1 minuto, o que encontraria?', category: 'love_romance', level: 5, emoji: '🪞' },
  { id: 'lr-5-3', title: 'Herança do Amor', description: 'Se pudesse deixar uma única lição sobre amor para os vossos filhos/netos, qual seria?', category: 'love_romance', level: 5, emoji: '📜' },
  { id: 'lr-5-4', title: 'Gratidão Absoluta', description: 'Por que razão profunda é grato(a) por esta pessoa existir na sua vida?', category: 'love_romance', level: 5, emoji: '🙏' },
];

// ========================================
// Conhecimento Mútuo
// ========================================
const mutualKnowledge: LoveCard[] = [
  // Level 1
  { id: 'mk-1-1', title: 'Comida Favorita', description: 'Qual é o prato favorito do seu parceiro(a)? Acerte sem perguntar!', category: 'mutual_knowledge', level: 1, emoji: '🍝' },
  { id: 'mk-1-2', title: 'Sonho de Infância', description: 'O que o seu parceiro(a) queria ser quando era criança?', category: 'mutual_knowledge', level: 1, emoji: '🧒' },
  { id: 'mk-1-3', title: 'Manias Adoráveis', description: 'Cite 3 manias do seu parceiro(a) que você acha fofas.', category: 'mutual_knowledge', level: 1, emoji: '😊' },
  { id: 'mk-1-4', title: 'Filme Marcante', description: 'Qual filme o seu parceiro(a) assistiria todas as semanas sem cansar?', category: 'mutual_knowledge', level: 1, emoji: '🎬' },
  // Level 2
  { id: 'mk-2-1', title: 'Stress Detector', description: 'Como você percebe que o seu parceiro(a) está stressado(a)? Que sinais mostra?', category: 'mutual_knowledge', level: 2, emoji: '🔍' },
  { id: 'mk-2-2', title: 'Linguagem do Amor', description: 'Qual é a principal linguagem do amor do seu parceiro(a)? (toque, palavras, atos, presentes, tempo)', category: 'mutual_knowledge', level: 2, emoji: '💬' },
  { id: 'mk-2-3', title: 'Dia Perfeito', description: 'Descreva o domingo perfeito para o seu parceiro(a).', category: 'mutual_knowledge', level: 2, emoji: '☀️' },
  { id: 'mk-2-4', title: 'Pet Peeve', description: 'O que mais irrita o seu parceiro(a) no dia-a-dia? (sem ser sobre vocês!)', category: 'mutual_knowledge', level: 2, emoji: '😤' },
  // Level 3
  { id: 'mk-3-1', title: 'Mapa Emocional', description: 'Quando o seu parceiro(a) está triste, o que funciona melhor: espaço, abraço ou conversa?', category: 'mutual_knowledge', level: 3, emoji: '🗺️' },
  { id: 'mk-3-2', title: 'Herói Pessoal', description: 'Quem é a pessoa que o seu parceiro(a) mais admira e porquê?', category: 'mutual_knowledge', level: 3, emoji: '🦸' },
  { id: 'mk-3-3', title: 'Arrependimento', description: 'Qual decisão de vida o seu parceiro(a) mais lamenta?', category: 'mutual_knowledge', level: 3, emoji: '💭' },
  { id: 'mk-3-4', title: 'Gatilho Secreto', description: 'Que tipo de situação deixa o seu parceiro(a) profundamente ansioso(a)?', category: 'mutual_knowledge', level: 3, emoji: '⚠️' },
  // Level 4
  { id: 'mk-4-1', title: 'Trauma Superado', description: 'Qual experiência difícil moldou quem o seu parceiro(a) é hoje?', category: 'mutual_knowledge', level: 4, emoji: '🌱' },
  { id: 'mk-4-2', title: 'Valores Sagrados', description: 'Quais são os 3 valores mais importantes para o seu parceiro(a)?', category: 'mutual_knowledge', level: 4, emoji: '⭐' },
  { id: 'mk-4-3', title: 'Necessidade Oculta', description: 'Qual necessidade emocional do seu parceiro(a) às vezes passa despercebida?', category: 'mutual_knowledge', level: 4, emoji: '🫧' },
  { id: 'mk-4-4', title: 'Criança Interior', description: 'Como era o ambiente familiar do seu parceiro(a) na infância?', category: 'mutual_knowledge', level: 4, emoji: '🏠' },
  // Level 5
  { id: 'mk-5-1', title: 'Espelho d\'Alma', description: 'Que parte de si próprio o seu parceiro(a) ainda está a tentar aceitar?', category: 'mutual_knowledge', level: 5, emoji: '🪞' },
  { id: 'mk-5-2', title: 'Legado Interior', description: 'Que padrão familiar o seu parceiro(a) está conscientemente a tentar quebrar?', category: 'mutual_knowledge', level: 5, emoji: '🔗' },
  { id: 'mk-5-3', title: 'Chave Mestra', description: 'Se pudesse curar uma dor emocional do seu parceiro(a), qual escolheria?', category: 'mutual_knowledge', level: 5, emoji: '🔑' },
  { id: 'mk-5-4', title: 'Compreensão Total', description: 'O que o seu parceiro(a) mais precisa ouvir de si neste momento da vida?', category: 'mutual_knowledge', level: 5, emoji: '👂' },
];

// ========================================
// Picantes (Spicy)
// ========================================
const spicy: LoveCard[] = [
  // Level 1
  { id: 'sp-1-1', title: 'Flerte Ousado', description: 'Envie uma mensagem de flerte ao seu parceiro(a) como se fossem desconhecidos num bar.', category: 'spicy', level: 1, emoji: '😏' },
  { id: 'sp-1-2', title: 'Roupa Fatal', description: 'Qual peça de roupa do seu parceiro(a) te deixa sem fôlego?', category: 'spicy', level: 1, emoji: '👗' },
  { id: 'sp-1-3', title: 'Beijo Cinematográfico', description: 'Descreva o beijo perfeito com o seu parceiro(a) em formato de cena de filme.', category: 'spicy', level: 1, emoji: '🎬' },
  { id: 'sp-1-4', title: 'Olhar Magnético', description: 'Olhe nos olhos do seu parceiro(a) por 60 segundos sem falar. O que sentiu?', category: 'spicy', level: 1, emoji: '👁️' },
  // Level 2
  { id: 'sp-2-1', title: 'Fantasia Leve', description: 'Se pudessem reviver o primeiro encontro, o que fariam diferente?', category: 'spicy', level: 2, emoji: '🌹' },
  { id: 'sp-2-2', title: 'Zona Magnética', description: 'Qual parte do corpo do seu parceiro(a) mais gosta de tocar?', category: 'spicy', level: 2, emoji: '🧲' },
  { id: 'sp-2-3', title: 'Playlist Sensual', description: 'Escolham 3 músicas para a playlist mais íntima do casal.', category: 'spicy', level: 2, emoji: '🎶' },
  { id: 'sp-2-4', title: 'Sussurro', description: 'Sussurre algo ao ouvido do seu parceiro(a) que o faça arrepiar.', category: 'spicy', level: 2, emoji: '🤫' },
  // Level 3
  { id: 'sp-3-1', title: 'Cenário dos Sonhos', description: 'Descreva o cenário perfeito para uma noite romântica especial.', category: 'spicy', level: 3, emoji: '🕯️' },
  { id: 'sp-3-2', title: 'Jogo de Poder', description: 'Quem é mais dominante e quem é mais entregue? Concordam?', category: 'spicy', level: 3, emoji: '🃏' },
  { id: 'sp-3-3', title: 'Desejo Secreto', description: 'Partilhe um desejo romântico que nunca mencionou antes.', category: 'spicy', level: 3, emoji: '🤐' },
  { id: 'sp-3-4', title: 'Massagem Especial', description: 'Dê uma massagem de 5 minutos ao seu parceiro(a) e pergunte o que mais gostou.', category: 'spicy', level: 3, emoji: '💆' },
  // Level 4
  { id: 'sp-4-1', title: 'Limite Explorado', description: 'Qual fronteira gostariam de explorar juntos com confiança mútua?', category: 'spicy', level: 4, emoji: '🔥' },
  { id: 'sp-4-2', title: 'Confissão Quente', description: 'Conte ao seu parceiro(a) o momento em que mais o desejou.', category: 'spicy', level: 4, emoji: '🌡️' },
  { id: 'sp-4-3', title: 'Role Play', description: 'Inventem juntos um cenário imaginário para viverem esta noite.', category: 'spicy', level: 4, emoji: '🎭' },
  { id: 'sp-4-4', title: 'Mapa do Prazer', description: 'Guiem um ao outro, descrevendo exactamente o que mais gostam.', category: 'spicy', level: 4, emoji: '📍' },
  // Level 5
  { id: 'sp-5-1', title: 'Fantasia Suprema', description: 'Partilhem a vossa fantasia mais profunda — sem julgamento.', category: 'spicy', level: 5, emoji: '💫' },
  { id: 'sp-5-2', title: 'Confiança Total', description: 'Um de olhos vendados, o outro guia. Descrevam a experiência.', category: 'spicy', level: 5, emoji: '🙈' },
  { id: 'sp-5-3', title: 'Conexão Suprema', description: 'O que precisam para se sentirem completamente entregues um ao outro?', category: 'spicy', level: 5, emoji: '🔓' },
  { id: 'sp-5-4', title: 'Pacto Secreto', description: 'Criem um código ou sinal secreto entre vocês para comunicar desejo.', category: 'spicy', level: 5, emoji: '🤞' },
];

// ========================================
// Verdade ou Desafio
// ========================================
const truthOrDare: LoveCard[] = [
  // Level 1
  { id: 'td-1-1', title: 'Verdade: Crush Famoso', description: '🎯 Verdade: Qual celebridade o seu parceiro(a) acha atraente? Diga sem medo!', category: 'truth_or_dare', level: 1, emoji: '🎯' },
  { id: 'td-1-2', title: 'Desafio: Dança Surpresa', description: '🎲 Desafio: Dance a música favorita do seu parceiro(a) agora mesmo!', category: 'truth_or_dare', level: 1, emoji: '🎲' },
  { id: 'td-1-3', title: 'Verdade: Mentira Inocente', description: '🎯 Verdade: Qual foi a última mentirinha branca que disse ao seu parceiro(a)?', category: 'truth_or_dare', level: 1, emoji: '🤥' },
  { id: 'td-1-4', title: 'Desafio: Selfie Constrangedora', description: '🎲 Desafio: Tirem a selfie mais estranha possível e coloquem como foto de perfil por 1h.', category: 'truth_or_dare', level: 1, emoji: '🤳' },
  // Level 2
  { id: 'td-2-1', title: 'Verdade: Hábito Escondido', description: '🎯 Verdade: Que hábito estranho tem quando o seu parceiro(a) não está a ver?', category: 'truth_or_dare', level: 2, emoji: '👀' },
  { id: 'td-2-2', title: 'Desafio: Cozinheiro Cego', description: '🎲 Desafio: Prepare um lanche para o seu parceiro(a) de olhos vendados!', category: 'truth_or_dare', level: 2, emoji: '🍳' },
  { id: 'td-2-3', title: 'Verdade: Ciúme Confesso', description: '🎯 Verdade: De quem ou do que já sentiu um pouquinho de ciúme?', category: 'truth_or_dare', level: 2, emoji: '😈' },
  { id: 'td-2-4', title: 'Desafio: Poeta Romântico', description: '🎲 Desafio: Improvise um poema de 4 linhas sobre o seu parceiro(a).', category: 'truth_or_dare', level: 2, emoji: '📝' },
  // Level 3
  { id: 'td-3-1', title: 'Verdade: Erro Maior', description: '🎯 Verdade: Qual foi o seu maior erro nesta relação e o que aprendeu?', category: 'truth_or_dare', level: 3, emoji: '💡' },
  { id: 'td-3-2', title: 'Desafio: Sem Telemóvel', description: '🎲 Desafio: Passem as próximas 2 horas sem olhar para o telemóvel — juntos.', category: 'truth_or_dare', level: 3, emoji: '📵' },
  { id: 'td-3-3', title: 'Verdade: Pensamento Proibido', description: '🎯 Verdade: Que pensamento sobre a relação já teve mas nunca partilhou?', category: 'truth_or_dare', level: 3, emoji: '🤔' },
  { id: 'td-3-4', title: 'Desafio: Troca de Papéis', description: '🎲 Desafio: Imitem um ao outro por 10 minutos — manias incluídas!', category: 'truth_or_dare', level: 3, emoji: '🔄' },
  // Level 4
  { id: 'td-4-1', title: 'Verdade: Medo Profundo', description: '🎯 Verdade: Qual é o seu maior medo sobre perder esta relação?', category: 'truth_or_dare', level: 4, emoji: '😰' },
  { id: 'td-4-2', title: 'Desafio: Carta Escrita', description: '🎲 Desafio: Escreva à mão uma carta para o seu parceiro(a) e leia em voz alta.', category: 'truth_or_dare', level: 4, emoji: '✉️' },
  { id: 'td-4-3', title: 'Verdade: Sacrifício', description: '🎯 Verdade: O que já sacrificou por esta relação sem o seu parceiro(a) saber?', category: 'truth_or_dare', level: 4, emoji: '🎁' },
  { id: 'td-4-4', title: 'Desafio: Vulnerável 1 Min', description: '🎲 Desafio: Olhem-se nos olhos e digam algo que nunca disseram — 1 minuto.', category: 'truth_or_dare', level: 4, emoji: '⏱️' },
  // Level 5
  { id: 'td-5-1', title: 'Verdade: Se Pudesse Mudar', description: '🎯 Verdade: Se pudesse mudar uma única coisa no vosso passado juntos, qual seria?', category: 'truth_or_dare', level: 5, emoji: '⏳' },
  { id: 'td-5-2', title: 'Desafio: Perdão Total', description: '🎲 Desafio: Peça perdão genuíno por algo que sabe que magoou — sem defesa.', category: 'truth_or_dare', level: 5, emoji: '🕊️' },
  { id: 'td-5-3', title: 'Verdade: Último Adeus', description: '🎯 Verdade: Se tivesse apenas 1 hora juntos, o que diria e faria?', category: 'truth_or_dare', level: 5, emoji: '🌅' },
  { id: 'td-5-4', title: 'Desafio: Votos Renovados', description: '🎲 Desafio: Escrevam novos votos um para o outro e leiam em voz alta agora.', category: 'truth_or_dare', level: 5, emoji: '💒' },
];

/** All cards combined — 80 total */
export const ALL_LOVE_CARDS: LoveCard[] = [
  ...loveRomance,
  ...mutualKnowledge,
  ...spicy,
  ...truthOrDare,
];

/** Category metadata for UI rendering */
export const CATEGORY_META: Record<LoveCard['category'], { label: string; emoji: string; color: string; bgColor: string }> = {
  love_romance: { label: 'Amor & Romance', emoji: '💕', color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  mutual_knowledge: { label: 'Conhecimento Mútuo', emoji: '🧠', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  spicy: { label: 'Picantes', emoji: '🔥', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  truth_or_dare: { label: 'Verdade ou Desafio', emoji: '🎲', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
};

/** Get cards for a specific category and level */
export const getCardsByLevel = (category: LoveCard['category'], level: number): LoveCard[] => {
  return ALL_LOVE_CARDS.filter(c => c.category === category && c.level === level);
};

/** Get all unlocked cards for a category given a max unlocked level */
export const getUnlockedCards = (category: LoveCard['category'], unlockedLevel: number): LoveCard[] => {
  return ALL_LOVE_CARDS.filter(c => c.category === category && c.level <= unlockedLevel);
};
