import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, Sparkles, ChevronLeft, ChevronRight, Check, CheckCheck, Send, RefreshCw, X, Share2 } from 'lucide-react';
import { useOptimisticLoveCards } from '../hooks/useOptimisticLoveCards';
import { useAppStore } from '../store/useAppStore';
import { LoveCardCategory } from '../types';
import { ALL_LOVE_CARDS, CATEGORY_META, getCardsByLevel, getUnlockedCards } from '../data/loveCards';
import { cn } from '../lib/utils';

// ========================================
// Sub-components
// ========================================

/** Category pill selector */
const CategoryPills: React.FC<{
  active: LoveCardCategory;
  onChange: (c: LoveCardCategory) => void;
  progress: Record<LoveCardCategory, number>;
}> = ({ active, onChange, progress }) => {
  const categories = Object.keys(CATEGORY_META) as LoveCardCategory[];
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
      {categories.map(cat => {
        const meta = CATEGORY_META[cat];
        const isActive = active === cat;
        return (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(cat)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl border whitespace-nowrap transition-all duration-300 font-sans text-[10px] uppercase tracking-widest font-bold shrink-0',
              isActive
                ? 'bg-cookbook-text text-cookbook-bg border-cookbook-text shadow-lg'
                : 'bg-cookbook-bg/80 text-cookbook-text/60 border-cookbook-border hover:border-cookbook-text/20'
            )}
          >
            <span className="text-base">{meta.emoji}</span>
            <span>{meta.label}</span>
            <span className={cn(
              'text-[8px] px-1.5 py-0.5 rounded-full',
              isActive ? 'bg-cookbook-bg/20 text-cookbook-bg' : 'bg-cookbook-text/5 text-cookbook-text/40'
            )}>
              Nv.{progress[cat] || 1}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

/** Level progress indicator */
const LevelProgress: React.FC<{
  level: number;
  done: number;
  total: number;
}> = ({ level, done, total }) => {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-bold">
            Nível {level}
          </span>
          <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-bold">
            {done}/{total} cartas
          </span>
        </div>
        <div className="h-1.5 bg-cookbook-text/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cookbook-primary to-cookbook-gold rounded-full"
          />
        </div>
      </div>
      {done === total && total > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-6 h-6 rounded-full bg-cookbook-gold/20 flex items-center justify-center"
        >
          <Check size={12} className="text-cookbook-gold" />
        </motion.div>
      )}
    </div>
  );
};

/** Answer modal / drawer */
const AnswerDrawer: React.FC<{
  isOpen: boolean;
  cardTitle: string;
  cardDescription: string;
  cardEmoji: string;
  onSubmit: (answer?: string) => void;
  onClose: () => void;
  needsText: boolean;
}> = ({ isOpen, cardTitle, cardDescription, cardEmoji, onSubmit, onClose, needsText }) => {
  const [answer, setAnswer] = useState('');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-cookbook-bg rounded-t-[2rem] p-6 pb-10 shadow-2xl border-t border-cookbook-border"
      >
        <div className="w-10 h-1 bg-cookbook-border rounded-full mx-auto mb-6" />

        <button onClick={onClose} className="absolute top-5 right-5 text-cookbook-text/30 hover:text-cookbook-text">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl block mb-3">{cardEmoji}</span>
          <h3 className="font-serif text-xl text-cookbook-text mb-2">{cardTitle}</h3>
          <p className="font-sans text-sm text-cookbook-text/60">{cardDescription}</p>
        </div>

        {needsText ? (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Escreva a sua resposta..."
              rows={3}
              className="w-full bg-cookbook-text/5 border border-cookbook-border rounded-2xl p-4 font-sans text-sm text-cookbook-text placeholder:text-cookbook-text/30 focus:outline-none focus:border-cookbook-primary/50 resize-none"
            />
            <button
              onClick={() => { onSubmit(answer); setAnswer(''); }}
              disabled={!answer.trim()}
              className="w-full bg-cookbook-text text-cookbook-bg font-sans text-[10px] uppercase tracking-widest py-4 rounded-2xl font-bold disabled:opacity-30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Send size={14} /> Enviar Resposta
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSubmit()}
            className="w-full bg-cookbook-text text-cookbook-bg font-sans text-[10px] uppercase tracking-widest py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check size={14} /> Completar Desafio
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// ========================================
// Main Component
// ========================================

export const LoveCardsTab: React.FC = () => {
  const casalId = useAppStore(s => s.casalId);
  const {
    interactions,
    progress,
    goldDust,
    isLoading,
    loadInitial,
    refreshInteractions,
    respondToCard,
    hasUserResponded,
    isMatch,
    getCompletionCount,
  } = useOptimisticLoveCards(casalId);

  const [activeCategory, setActiveCategory] = useState<LoveCardCategory>('love_romance');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drawerCard, setDrawerCard] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setExitDirection(null);
  }, [activeCategory]);

  // Current level and cards
  const currentLevel = progress[activeCategory] || 1;
  const cards = useMemo(
    () => getCardsByLevel(activeCategory, currentLevel),
    [activeCategory, currentLevel]
  );
  const completion = getCompletionCount(activeCategory, currentLevel);
  const currentCard = cards[currentIndex] || null;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setExitDirection('left');
    setTimeout(() => {
      setCurrentIndex(i => Math.min(i + 1, cards.length - 1));
      setExitDirection(null);
    }, 200);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setExitDirection('right');
    setTimeout(() => {
      setCurrentIndex(i => Math.max(i - 1, 0));
      setExitDirection(null);
    }, 200);
  }, []);

  const handleDragEnd = useCallback((_: any, info: any) => {
    const swipeThreshold = 80;
    if (info.offset.x < -swipeThreshold && currentIndex < cards.length - 1) {
      handleNext();
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      handlePrev();
    }
  }, [currentIndex, cards.length, handleNext, handlePrev]);

  const handleRespond = useCallback(async (answer?: string) => {
    if (!currentCard) return;
    setDrawerCard(null);
    setIsFlipped(false);
    await respondToCard(currentCard.id, answer);
  }, [currentCard, respondToCard]);

  // Share Partner Invite
  const handleShare = useCallback(async () => {
    const text = "Vem jogar Cartas do Amor comigo! 💕 Temos várias cartas para descobrir juntos no Pote Sagrado.";
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cartas do Amor',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Link copiado para a área de transferência!");
    }
  }, []);

  const meta = CATEGORY_META[activeCategory];

  // Locked levels preview
  const lockedLevels = useMemo(() => {
    const levels: number[] = [];
    for (let i = currentLevel + 1; i <= 5; i++) levels.push(i);
    return levels;
  }, [currentLevel]);

  if (isLoading) {
    return (
      <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
        <div className="h-8 bg-cookbook-border/30 rounded-lg animate-pulse w-48 mx-auto" />
        <div className="h-12 bg-cookbook-border/20 rounded-xl animate-pulse" />
        <div className="h-80 bg-cookbook-border/20 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const drawerCardData = drawerCard ? ALL_LOVE_CARDS.find(c => c.id === drawerCard) : null;

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center relative"
      >
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <Heart size={20} className="text-cookbook-primary/80" fill="currentColor" />
          <h2 className="font-serif text-2xl text-cookbook-text">Cartas do Amor</h2>
          <Heart size={20} className="text-cookbook-primary/80" fill="currentColor" />
        </div>
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/50 font-bold">
          Inspirado nos Mapas do Amor de Gottman
        </p>
      </motion.div>

      {/* Gold Dust + Refresh */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cookbook-gold/10 to-cookbook-mural/30 rounded-full border border-cookbook-gold/20">
          <Sparkles size={14} className="text-cookbook-gold" />
          <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-gold font-bold">
            {goldDust} Pó de Ouro
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cookbook-text/5 border border-cookbook-border hover:bg-cookbook-text/10 transition-colors active:scale-95 text-cookbook-primary"
          >
            <Share2 size={12} />
            <span className="font-sans text-[9px] uppercase tracking-widest font-bold">Convidar Parceiro(a)</span>
          </button>
          <button
            onClick={refreshInteractions}
            className="p-2 rounded-full bg-cookbook-text/5 border border-cookbook-border hover:bg-cookbook-text/10 transition-colors active:scale-95"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className="text-cookbook-text/40" />
          </button>
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CategoryPills active={activeCategory} onChange={setActiveCategory} progress={progress} />
      </motion.div>

      {/* Level progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-cookbook-bg/80 backdrop-blur-xl border border-cookbook-border rounded-2xl p-4 shadow-sm"
      >
        <LevelProgress level={currentLevel} done={completion.done} total={completion.total} />
      </motion.div>

      {/* Card stack area */}
      <div className="relative" style={{ perspective: 1200, minHeight: 360 }}>
        {/* Background stacked cards */}
        {cards.length > 1 && (
          <>
            <div className="absolute inset-x-3 top-2 h-full bg-cookbook-border/20 rounded-[2rem] border border-cookbook-border/30" />
            <div className="absolute inset-x-1.5 top-1 h-full bg-cookbook-border/10 rounded-[2rem] border border-cookbook-border/20" />
          </>
        )}

        {/* Main card */}
        <AnimatePresence mode="wait">
          {currentCard ? (
            <motion.div
              key={currentCard.id + currentIndex}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
              exit={{ 
                opacity: 0, 
                x: exitDirection === 'left' ? -300 : exitDirection === 'right' ? 300 : 0, 
                rotate: exitDirection === 'left' ? -15 : exitDirection === 'right' ? 15 : 0,
                scale: 0.9,
                transition: { duration: 0.2 } 
              }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
              className="relative cursor-pointer select-none"
              style={{ transformStyle: 'preserve-3d' }}
              drag="x"
              dragSnapToOrigin
              onDragEnd={handleDragEnd}
              whileTap={{ cursor: 'grabbing' }}
              onClick={() => !hasUserResponded(currentCard.id) && setIsFlipped(f => !f)}
            >
              <motion.div
                className="relative"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 30 }}
                  style={{ transformStyle: 'preserve-3d' } as any}
                >
                  {/* FRONT */}
                  <div
                    className="bg-cookbook-bg/95 backdrop-blur-2xl border border-cookbook-border rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden min-h-[320px] flex flex-col"
                    style={{ backfaceVisibility: 'hidden' } as any}
                  >
                    {/* Glow */}
                    <div className={cn('absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20', meta.bgColor)} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cookbook-primary/5 rounded-full blur-3xl" />

                    {/* Status badges */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className={cn('px-3 py-1 rounded-full font-sans text-[9px] uppercase tracking-widest font-bold border', meta.bgColor, meta.color, 'border-current/10')}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="px-2.5 py-1 bg-cookbook-text/5 rounded-full font-sans text-[9px] uppercase tracking-widest font-bold text-cookbook-text/40 border border-cookbook-border/50">
                        Nv.{currentCard.level}
                      </span>
                    </div>

                    {/* Emoji */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                      <motion.span
                        className="text-6xl block mb-6"
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {currentCard.emoji}
                      </motion.span>
                      <h3 className="font-serif text-xl text-cookbook-text mb-3">{currentCard.title}</h3>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/30 font-bold">
                        Toque para virar ↻
                      </p>
                    </div>

                    {/* Interaction status */}
                    <div className="flex justify-center gap-2 mt-4 relative z-10">
                      {hasUserResponded(currentCard.id) && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full font-sans text-[9px] uppercase tracking-widest font-bold border border-emerald-500/20">
                          <Check size={10} /> Você respondeu
                        </span>
                      )}
                      {isMatch(currentCard.id) && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-cookbook-gold/10 text-cookbook-gold rounded-full font-sans text-[9px] uppercase tracking-widest font-bold border border-cookbook-gold/20">
                          <CheckCheck size={10} /> Match!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 bg-cookbook-bg/95 backdrop-blur-2xl border border-cookbook-border rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center text-center min-h-[320px]"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' } as any}
                  >
                    <div className={cn('absolute top-0 left-0 w-full h-1.5 rounded-t-[2rem]', meta.bgColor.replace('/10', ''))} />

                    <span className="text-3xl mb-4">{currentCard.emoji}</span>
                    <h3 className="font-serif text-lg text-cookbook-text mb-4">{currentCard.title}</h3>
                    <p className="font-sans text-sm text-cookbook-text/70 leading-relaxed mb-8 max-w-[280px]">
                      {currentCard.description}
                    </p>

                    {!hasUserResponded(currentCard.id) ? (
                      <button
                        onClick={e => { e.stopPropagation(); setDrawerCard(currentCard.id); setIsFlipped(false); }}
                        className="bg-cookbook-text text-cookbook-bg font-sans text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
                      >
                        <Send size={12} /> Responder
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 text-emerald-600 font-sans text-[10px] uppercase tracking-widest font-bold">
                        <Check size={14} /> Já respondeu
                      </span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-cookbook-bg/80 backdrop-blur-xl border-2 border-dashed border-cookbook-border rounded-[2rem] p-12 text-center min-h-[320px] flex flex-col items-center justify-center"
            >
              <span className="text-4xl mb-4 opacity-30">{meta.emoji}</span>
              <p className="font-serif italic text-cookbook-text/40 text-sm">Nenhuma carta neste nível.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-cookbook-bg border border-cookbook-border shadow-sm disabled:opacity-20 active:scale-90 transition-all hover:bg-cookbook-text/5"
          >
            <ChevronLeft size={18} className="text-cookbook-text" />
          </button>
          <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
            {currentIndex + 1} / {cards.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="p-3 rounded-full bg-cookbook-bg border border-cookbook-border shadow-sm disabled:opacity-20 active:scale-90 transition-all hover:bg-cookbook-text/5"
          >
            <ChevronRight size={18} className="text-cookbook-text" />
          </button>
        </div>
      )}

      {/* Locked levels preview */}
      {lockedLevels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-sans text-[9px] uppercase tracking-[0.2em] text-cookbook-text/30 font-bold text-center flex items-center justify-center gap-2">
            <Lock size={10} /> Próximos Níveis <Lock size={10} />
          </h3>
          <div className="flex gap-2 justify-center">
            {lockedLevels.map(lvl => (
              <div
                key={lvl}
                className="px-4 py-3 bg-cookbook-text/3 border border-cookbook-border/50 rounded-2xl flex items-center gap-2 opacity-40"
              >
                <Lock size={10} className="text-cookbook-text/30" />
                <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40 font-bold">
                  Nível {lvl}
                </span>
                <span className="text-xs">{getCardsByLevel(activeCategory, lvl).length} cartas</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Answer drawer */}
      <AnimatePresence>
        {drawerCardData && (
          <AnswerDrawer
            isOpen={!!drawerCard}
            cardTitle={drawerCardData.title}
            cardDescription={drawerCardData.description}
            cardEmoji={drawerCardData.emoji}
            needsText={drawerCardData.category === 'truth_or_dare' || drawerCardData.category === 'mutual_knowledge'}
            onSubmit={handleRespond}
            onClose={() => setDrawerCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
