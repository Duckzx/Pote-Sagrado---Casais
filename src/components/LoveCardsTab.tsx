import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Flame, Leaf, HelpCircle, Heart, ThumbsUp, Lock, ArrowLeft } from 'lucide-react';
import { AppUser, LoveCardCategory, LoveCard } from '../types';
import { useOptimisticLoveCards } from '../hooks/useOptimisticLoveCards';

interface LoveCardsTabProps {
  currentUser: AppUser;
  casalId: string;
}

interface DeckCategory {
  id: LoveCardCategory;
  title: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  isPremium: boolean;
  isLimited?: boolean;
  daysLeft?: number;
}

const DECKS: DeckCategory[] = [
  {
    id: 'Mapas do Amor',
    title: 'NewBirdz',
    subtitle: 'Nível 1 de intimidade. Construir o "mapa" da vida atual do parceiro.',
    color: 'bg-emerald-500 from-emerald-500 to-teal-600 bg-gradient-to-br',
    icon: <Heart size={32} className="mb-4 opacity-80" />,
    isPremium: false,
  },
  {
    id: 'Modo Sexy & Intimidade',
    title: 'Modo Sexy',
    subtitle: 'Desafios sensuais e perguntas apimentadas.',
    color: 'bg-red-500 from-red-500 to-rose-600 bg-gradient-to-br',
    icon: <Flame size={32} className="mb-4 opacity-80" />,
    isPremium: true,
  },
  {
    id: 'Quem é Mais...?',
    title: 'Quem é Mais...?',
    subtitle: 'Apontem um para o outro e descubram o que pensam.',
    color: 'bg-blue-500 from-blue-500 to-indigo-600 bg-gradient-to-br',
    icon: <HelpCircle size={32} className="mb-4 opacity-80" />,
    isPremium: false,
    isLimited: true,
    daysLeft: 3,
  },
  {
    id: 'Sonhos e Valores',
    title: 'TopBirdz',
    subtitle: 'Perguntas existenciais e profundas.',
    color: 'bg-purple-500 from-purple-500 to-fuchsia-600 bg-gradient-to-br',
    icon: <Crown size={32} className="mb-4 opacity-80" />,
    isPremium: true,
  },
  {
    id: 'Top ou Flop?',
    title: 'Top ou Flop?',
    subtitle: 'Descobrir opiniões polarizadas sobre rotina.',
    color: 'bg-orange-500 from-orange-400 to-amber-500 bg-gradient-to-br',
    icon: <ThumbsUp size={32} className="mb-4 opacity-80" />,
    isPremium: true,
  }
];

import { useAppStore } from "../store/useAppStore";

export const LoveCardsTab: React.FC<LoveCardsTabProps> = ({ currentUser, casalId }) => {
  const tripConfig = useAppStore(s => s.tripConfig);
  const isUserPremium = !!tripConfig?.isPremium;
  const [selectedDeck, setSelectedDeck] = useState<LoveCardCategory | null>(null);
  
  const { cards, interactions, respondToCard, loading } = useOptimisticLoveCards(casalId, currentUser);

  const handleDeckClick = (deck: DeckCategory) => {
    if (deck.isPremium && !isUserPremium) {
      alert('Este modo é exclusivo para assinantes Premium! 👑\nAssine para desbloquear.');
      return;
    }
    setSelectedDeck(deck.id);
  };

  if (selectedDeck) {
    const deckInfo = DECKS.find(d => d.id === selectedDeck);
    return (
      <CardSwiper 
        category={selectedDeck} 
        onBack={() => setSelectedDeck(null)} 
        cards={cards} 
        interactions={interactions} 
        respondToCard={respondToCard}
        deckInfo={deckInfo}
      />
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar Status */}
      <div className="flex items-center justify-between bg-cookbook-bg rounded-full p-2 shadow-sm border border-cookbook-border mb-6">
        <div className="flex items-center gap-4 px-2">
          <div className="flex items-center gap-1 font-bold text-orange-500">
            <Flame size={18} fill="currentColor" />
            <span>12</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-emerald-500">
            <Leaf size={18} fill="currentColor" />
            <span>250</span>
          </div>
        </div>
        <button className="bg-gradient-to-r from-amber-400 to-yellow-500 p-1.5 rounded-full text-white shadow-md active:scale-95 transition-transform">
          <Crown size={18} fill="currentColor" />
        </button>
      </div>

      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="font-serif text-3xl text-cookbook-text mb-1">LovCards</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Conexão em forma de jogo
        </p>
      </div>

      {loading && (
         <div className="opacity-50 text-center text-xs py-4">Carregando baralhos...</div>
      )}

      {/* Baralhos */}
      <div className="space-y-4">
        {DECKS.map((deck) => (
          <button
            key={deck.id}
            onClick={() => handleDeckClick(deck)}
            className={`w-full relative overflow-hidden rounded-3xl p-6 flex flex-col text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-md text-white group ${deck.color}`}
          >
            {deck.icon}

            {/* Badges de Premium e Tempo Limitado */}
            <div className="flex gap-2 mb-4 z-10">
              {deck.isPremium && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-sans text-[9px] uppercase tracking-widest font-bold shadow-sm text-white">
                  <Crown size={10} />
                  <span>Premium</span>
                </div>
              )}
              {deck.isLimited && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-sans text-[9px] uppercase tracking-widest font-bold shadow-sm text-white">
                  <Flame size={10} />
                  <span>Fim: {deck.daysLeft} dias</span>
                </div>
              )}
            </div>

            {/* Texto do Baralho */}
            <h3 className="font-serif text-2xl font-bold mb-1 z-10 tracking-tight group-hover:scale-[1.02] transition-transform origin-left text-white">
              {deck.title}
            </h3>
            <p className="font-sans text-xs opacity-90 z-10 max-w-[85%] leading-relaxed text-white">
              {deck.subtitle}
            </p>

            {/* Ícone de Cadeado */}
            {deck.isPremium && !isUserPremium && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/20 p-3 rounded-full backdrop-blur-md">
                <Lock size={20} className="text-white" />
              </div>
            )}
            
            {/* Efeito de brilho hover */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
};

interface CardSwiperProps {
  category: LoveCardCategory;
  onBack: () => void;
  cards: LoveCard[];
  interactions: Record<string, any>;
  respondToCard: (cardId: string, response: 'answered' | 'skipped') => void;
  deckInfo?: DeckCategory;
}

const CardSwiper: React.FC<CardSwiperProps> = ({ category, onBack, cards, interactions, respondToCard, deckInfo }) => {
  const filteredCards = useMemo(() => {
    return cards.filter(c => c.category === category).sort((a, b) => a.level - b.level);
  }, [cards, category]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeCard = filteredCards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!activeCard) return;
    const response = direction === 'right' ? 'answered' : 'skipped';
    respondToCard(activeCard.id, response);
    
    setTimeout(() => {
      if (currentIndex < filteredCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Deck concluído
        setCurrentIndex(filteredCards.length);
      }
    }, 300);
  };

  return (
    <div className="flex flex-col h-full pt-6 px-4 pb-28 max-w-lg mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Header Back Button */}
      <div className="flex flex-col items-center justify-center mb-8 relative">
        <button 
          onClick={onBack}
          className="absolute left-0 p-2 text-cookbook-text/60 hover:bg-cookbook-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold mb-1">
          Baralho
        </span>
        <h2 className="font-serif text-2xl text-cookbook-text">{deckInfo?.title || category}</h2>
      </div>

      {/* Stack Area */}
      <div className="relative flex-1 min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {activeCard ? (
            <motion.div
              key={activeCard.id}
              initial={{ scale: 0.9, y: 50, opacity: 0, rotateX: 45 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, y: -50, opacity: 0, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`absolute w-full h-[400px] rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20 bg-cookbook-bg/90 backdrop-blur-md cursor-grab active:cursor-grabbing text-white ${deckInfo?.color || 'bg-slate-800'}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe > 100) {
                  handleSwipe('right');
                } else if (swipe < -100) {
                  handleSwipe('left');
                }
              }}
            >
              <div className="absolute top-6 left-6 font-sans text-[9px] uppercase tracking-widest text-white/50 font-bold bg-black/20 px-3 py-1 rounded-full">
                Nível {activeCard.level}
              </div>
              <div className="absolute top-6 right-6 opacity-50">
                {deckInfo?.icon}
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-8">
                {activeCard.questionOrChallenge}
              </h3>

              <div className="absolute bottom-8 w-full px-8 flex justify-between gap-4">
                 <button onClick={() => handleSwipe('left')} className="flex-1 bg-black/20 hover:bg-black/30 w-14 h-14 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform backdrop-blur-sm" aria-label="Skip">
                    ✕
                 </button>
                 <button onClick={() => handleSwipe('right')} className="flex-1 bg-white hover:bg-white/90 w-14 h-14 rounded-full flex items-center justify-center text-slate-900 active:scale-95 transition-transform font-bold" aria-label="Answer">
                    Responder
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center flex flex-col items-center justify-center h-full p-8 rounded-3xl bg-cookbook-bg border border-cookbook-border"
            >
              <Heart size={48} className="text-cookbook-primary/20 mb-4" />
              <h3 className="font-serif text-xl text-cookbook-text mb-2">Baralho Concluído!</h3>
              <p className="font-sans text-xs text-cookbook-text/50 uppercase tracking-widest">
                Vocês completaram este nível de conexão.
              </p>
              <button onClick={onBack} className="mt-8 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 px-6 rounded-full font-bold shadow-md">
                Voltar aos Baralhos
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Hints */}
      {activeCard && (
        <div className="mt-8 text-center animate-in fade-in delay-300">
            <p className="font-sans text-xs text-cookbook-text/40 flex items-center justify-center gap-2">
               Arraste para os lados ou use os botões
            </p>
        </div>
      )}
    </div>
  );
};

