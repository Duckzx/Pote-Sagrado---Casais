import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plane, ArrowRight, Sparkles, Trash2, AlertCircle, Pencil, Plus, X, Heart, Trophy, Camera, Star, Share2 } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import confetti from 'canvas-confetti';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { AnimatedNumber } from './AnimatedNumber';
import Carousel from './Carousel';
import { formatDistanceToNow, differenceInMonths, differenceInWeeks, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AIAssistantModal } from './AIAssistantModal';
import CircularGallery from './CircularGallery';
import { UserBadges } from './UserBadges';
import { CountdownWidget } from './CountdownWidget';
import { SavingsChart } from './SavingsChart';
import { CheapDateModal } from './CheapDateModal';
import { playCoinSound, vibrate } from '../lib/audio';
import { WrappedModal } from './WrappedModal';
import { SacredPot } from './SacredPot';
import { ShareableWidget } from './ShareableWidget';

interface HomeTabProps {
  currentUser: any;
  destination: string;
  origin: string;
  goalAmount: number;
  totalSaved: number;
  deposits: any[];
  achievements?: any[];
  targetDate?: string;
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

const MOTIVATIONAL_QUOTES = [
  { text: 'Quem economiza hoje, viaja amanhã.', emoji: '✈️' },
  { text: 'Cada centavo é um passo mais perto do destino.', emoji: '👣' },
  { text: 'Pequenas escolhas, grandes viagens.', emoji: '🌍' },
  { text: 'O paraíso está a um depósito de distância.', emoji: '🏝️' },
  { text: 'Juntos, até o impossível fica perto.', emoji: '💑' },
  { text: 'O pote de hoje é a passagem de amanhã.', emoji: '🎫' },
  { text: 'Disciplina é o combustível das aventuras.', emoji: '⛽' },
  { text: 'Economizar a dois é dobrar a felicidade.', emoji: '💛' },
  { text: 'Sua próxima memória inesquecível começa agora.', emoji: '📸' },
  { text: 'Não é sobre gastar menos, é sobre viver mais.', emoji: '🌅' },
];

import { WaterSpill } from './WaterSpill';
import { compressImage } from '../lib/imageUtils';
import { useAppContext } from '../context/AppContext';

import { maskCurrency, parseCurrencyString } from '../lib/maskUtils';

const MilestoneTracker = ({ totalSaved, goalAmount, onRewardClick }: { totalSaved: number, goalAmount: number, onRewardClick: () => void }) => {
  if (goalAmount <= 0) return null;
  const pct = (totalSaved / goalAmount) * 100;
  
  const milestones = [
    { threshold: 25, label: "25%" },
    { threshold: 50, label: "Metade!" },
    { threshold: 75, label: "75%" }
  ];

  // Highest achieved
  const activeMilestone = milestones.slice().reverse().find(m => pct >= m.threshold);

  if (!activeMilestone || pct >= 100) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300 rounded-xl p-4 shadow-sm animate-fade-in -mt-4 relative z-10 text-center">
      <div className="flex justify-center mb-2">
        <Star size={24} className="text-amber-500 fill-amber-500" />
      </div>
      <h4 className="font-serif italic text-lg text-cookbook-text">Parabéns! Pote chegou a {activeMilestone.label}</h4>
      <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-3">
        Vocês merecem uma recompensa pelo esforço!
      </p>
      <button 
        onClick={onRewardClick}
        className="bg-amber-500 text-white font-sans text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-amber-600 active:scale-95 transition-all w-full flex items-center justify-center gap-2"
      >
        <Heart size={14} className="fill-white" />
        Gerar "Mini Date" Especial
      </button>
    </div>
  );
};

export const HomeTab: React.FC<HomeTabProps> = ({ currentUser, destination, origin, goalAmount, totalSaved, deposits, achievements = [], targetDate, addToast }) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<string | null>(null);
  const [depositToEdit, setDepositToEdit] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Animation states for Pot Breaking
  const [isPotBreaking, setIsPotBreaking] = useState(false);
  const [isPotBroken, setIsPotBroken] = useState(false);
  const [showBreakConfirm, setShowBreakConfirm] = useState(false);
  
  const { 
    handleCompleteOnboarding, 
    setShowShareWidget 
  } = useAppContext();
  
  // FAB quick deposit
  const [showQuickDeposit, setShowQuickDeposit] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickType, setQuickType] = useState<'income' | 'expense'>('income');
  const [quickImage, setQuickImage] = useState<string | null>(null);
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Daily motivational quote (deterministic based on day of year)
  const dailyQuote = useMemo(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setQuickImage(base64);
    } catch (err) {
      console.error("Error compressing image:", err);
      addToast('Erro', 'Não foi possível carregar a imagem.', 'info');
    }
  };

  const handleQuickDeposit = async () => {
    const parsedAmount = parseCurrencyString(quickAmount);
    if (!quickAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;
    setIsQuickSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      
      const depositData: any = {
        amount: parsedAmount,
        type: quickType,
        action: quickDesc || (quickType === 'income' ? 'Depósito rápido' : 'Gasto rápido'),
        who: user.uid,
        whoName: user.displayName || user.email?.split('@')[0] || 'Alguém',
        createdAt: serverTimestamp()
      };

      if (quickImage) {
        depositData.imageUrl = quickImage;
      }

      await addDoc(collection(db, 'deposits'), depositData);
      
      // Haptic and audio feedback
      vibrate([30, 50, 30]);
      if (quickType === 'income') {
        playCoinSound();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#8E7F6D', '#C5A059', '#E8E4D9'] });
        addToast('Booooooooa!', `+R$ ${parsedAmount.toFixed(2)} no pote. Um passo mais perto da viagem!`, 'success');
      } else {
        addToast('Tudo bem, acontece...', `-R$ ${parsedAmount.toFixed(2)}. Da próxima a gente pensa duas vezes!`, 'info');
      }
      setShowQuickDeposit(false);
      setQuickAmount('');
      setQuickDesc('');
      setQuickType('income');
      setQuickImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deposits');
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const galleryItems = useMemo(() => [
    { image: `https://loremflickr.com/400/600/${encodeURIComponent(destination || 'travel')},landscape/all?random=1`, text: 'Paisagem' },
    { image: `https://loremflickr.com/400/600/${encodeURIComponent(destination || 'travel')},architecture/all?random=2`, text: 'Arquitetura' },
    { image: `https://loremflickr.com/400/600/${encodeURIComponent(destination || 'travel')},food/all?random=3`, text: 'Gastronomia' },
    { image: `https://loremflickr.com/400/600/${encodeURIComponent(destination || 'travel')},nature/all?random=4`, text: 'Natureza' }
  ], [destination]);

  const progress = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
  const flightsUrl = `https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || 'Brasil')}+para+${encodeURIComponent(destination)}`;

  let paceMessage = '';
  if (targetDate && goalAmount > 0 && totalSaved < goalAmount) {
    const remaining = goalAmount - totalSaved;
    const date = parseISO(targetDate);
    const now = new Date();
    const months = differenceInMonths(date, now);
    const weeks = differenceInWeeks(date, now);
    const days = differenceInDays(date, now);

    if (months > 1) {
      const perMonth = remaining / months;
      paceMessage = `Ritmo ideal: ${Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(perMonth)} por mês`;
    } else if (weeks > 0) {
      const perWeek = remaining / weeks;
      paceMessage = `Ritmo ideal: ${Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(perWeek)} por semana`;
    } else if (days > 0) {
      const perDay = remaining / days;
      paceMessage = `Ritmo ideal: ${Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(perDay)} por dia`;
    } else {
      paceMessage = 'A viagem é hoje ou já passou!';
    }
  }

  const confirmDelete = async () => {
    if (!depositToDelete) return;
    try {
      await deleteDoc(doc(db, 'deposits', depositToDelete));
      addToast('Excluído', 'A economia foi removida com sucesso.', 'info');
    } catch (error) {
      console.error("Error deleting deposit:", error);
      addToast('Erro', 'Não foi possível excluir. Você só pode excluir suas próprias economias.', 'info');
    } finally {
      setDepositToDelete(null);
    }
  };

  const handleEditClick = (deposit: any) => {
    setDepositToEdit(deposit);
    setEditAmount(maskCurrency(deposit.amount.toFixed(2).replace('.', '')));
    setEditDescription(deposit.action || '');
  };

  const confirmEdit = async () => {
    const parsedAmount = parseCurrencyString(editAmount);
    if (!depositToEdit || !editAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;
    
    setIsEditing(true);
    try {
      await setDoc(doc(db, 'deposits', depositToEdit.id), {
        amount: parsedAmount,
        action: editDescription
      }, { merge: true });
      
      addToast('Atualizado', 'O valor foi atualizado com sucesso.', 'success');
      setDepositToEdit(null);
    } catch (error) {
      console.error("Error updating deposit:", error);
      addToast('Erro', 'Não foi possível atualizar.', 'info');
    } finally {
      setIsEditing(false);
    }
  };

  const confirmBreakPot = async () => {
    setShowBreakConfirm(false);
    
    // Start breaking animation
    setIsPotBreaking(true);
    if (vibrate) vibrate([30, 50, 30]);
    
    // Crack the pot after short delay
    setTimeout(() => {
      setIsPotBroken(true);
    }, 600);
    
    // Execute database operations while water spills
    setTimeout(async () => {
      try {
        // 1. Add achievement
        await addDoc(collection(db, 'achievements'), {
          destination: destination || 'Nossa Viagem',
          amount: Number(totalSaved),
          goalAmount: Number(goalAmount),
          createdAt: serverTimestamp(),
        });
        
        // 2. Clear all deposits
        for (const deposit of deposits) {
          try {
            await deleteDoc(doc(db, 'deposits', deposit.id));
          } catch(e) {
            console.error("Could not delete deposit", deposit.id, e);
          }
        }
        
        addToast('Conquista!', 'O Pote foi quebrado e virou história!', 'milestone');
      } catch (error: any) {
        console.error("Error breaking pot:", error);
        addToast('Erro', `Não foi possível quebrar o pote (${error.message || 'Desconhecido'})`, 'info');
      } finally {
        setTimeout(() => {
          setIsPotBroken(false);
          setIsPotBreaking(false);
        }, 2000);
      }
    }, 1500);
  };

  const handleBreakPotClick = () => {
    setShowBreakConfirm(true);
  };

  return (
    <div className="space-y-10 pb-24 pt-6 px-6 max-w-md mx-auto relative">
      <WaterSpill isSpilling={isPotBroken} />
      
      <div className="text-center space-y-1 relative">
        <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/60 font-bold">Reserva de Casal</h2>
        <button 
          onClick={() => setShowShareWidget(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-cookbook-gold/10 text-cookbook-gold rounded-full hover:bg-cookbook-gold/20 active:scale-95 transition-all shadow-sm"
          title="Compartilhar Status / PWA"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* The Animated Pot */}
      <SacredPot 
        totalSaved={totalSaved} 
        goalAmount={goalAmount} 
        achievements={achievements} 
        isBreaking={isPotBreaking} 
        isBroken={isPotBroken} 
      />

      <MilestoneTracker 
        totalSaved={totalSaved} 
        goalAmount={goalAmount} 
        onRewardClick={() => setShowDateModal(true)} 
      />

      {paceMessage && (
        <div className="flex justify-center -mt-6 relative z-20">
          <div className="font-sans text-[9px] uppercase tracking-widest text-cookbook-primary font-bold bg-cookbook-primary/10 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
            {paceMessage}
          </div>
        </div>
      )}

      {/* Break Pot Button if reached goal */}
      {totalSaved >= goalAmount && goalAmount > 0 && (
        <div className="animate-pulse-slow">
          <button 
            onClick={handleBreakPotClick}
            className="w-full bg-cookbook-gold text-white font-sans text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_8px_20px_rgba(197,160,89,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] font-bold flex items-center justify-center space-x-2 border-2 border-white/20"
          >
            <Sparkles size={18} />
            <span>Quebrar e Historiar Pote!</span>
          </button>
        </div>
      )}

      {/* Daily Motivational Quote */}
      <div className="text-center bg-cookbook-mural/50 border border-cookbook-border/50 rounded-xl px-5 py-3 -mt-4">
        <span className="text-lg mr-1.5">{dailyQuote.emoji}</span>
        <span className="font-serif italic text-xs text-cookbook-text/80">{dailyQuote.text}</span>
      </div>

      {/* Countdown Widget */}
      {targetDate && (
        <CountdownWidget targetDate={targetDate} />
      )}

      {/* Wrapped Button */}
      <div className="flex justify-center mt-6 mb-2">
        <button 
          onClick={() => setShowWrapped(true)}
          className="w-full bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary text-white border-none rounded-xl p-4 flex items-center justify-between shadow-lg transition-transform active:scale-[0.98] animate-pulse-slow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-serif italic text-sm text-white">Nosso Momento Wrapped</p>
              <p className="font-sans text-[9px] uppercase tracking-widest text-white/70 font-bold">Resumo do Casal</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-white/50" />
        </button>
      </div>

      {/* AI Assistant Trigger */}
      <div className="space-y-3">
        <a 
          href={flightsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-cookbook-bg border border-cookbook-border border-b-4 border-b-cookbook-primary rounded p-6 shadow-sm transition-transform active:scale-[0.98] relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full border-2 border-dashed border-cookbook-primary flex items-center justify-center font-serif italic text-[10px] text-cookbook-primary rotate-[15deg] bg-cookbook-bg">
            VISTO OK
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-2 text-cookbook-primary">
              <Plane size={18} />
              <span className="font-sans text-xs uppercase tracking-widest font-bold">Passaporte</span>
            </div>
            <ArrowRight size={16} className="text-cookbook-text/30" />
          </div>
          <h3 className="font-serif italic text-2xl text-cookbook-text mb-1 relative z-10">{destination || 'Defina um destino'}</h3>
          <p className="font-sans text-xs text-cookbook-text/50 uppercase tracking-wider relative z-10">Monitorar Passagens</p>
        </a>

        <button 
          onClick={() => setShowAIModal(true)}
          className="w-full bg-cookbook-mural border border-cookbook-gold/30 rounded p-4 flex items-center justify-between shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center space-x-3 text-cookbook-text">
            <div className="w-8 h-8 rounded-full bg-cookbook-gold/20 flex items-center justify-center">
              <Sparkles size={16} className="text-cookbook-gold" />
            </div>
            <div className="text-left">
              <p className="font-serif italic text-sm text-cookbook-text">Consultor de Viagem</p>
              <p className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-bold">Análise com IA</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-cookbook-text/30" />
        </button>

        <button 
          onClick={() => setShowDateModal(true)}
          className="w-full bg-cookbook-mural border border-cookbook-border rounded p-4 flex items-center justify-between shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center space-x-3 text-cookbook-text">
            <div className="w-8 h-8 rounded-full bg-cookbook-primary/20 flex items-center justify-center">
              <Heart size={16} className="text-cookbook-primary" />
            </div>
            <div className="text-left">
              <p className="font-serif italic text-sm text-cookbook-text">Gerador de Encontros</p>
              <p className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/60 font-bold">Ideias grátis/baratas</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-cookbook-text/30" />
        </button>
      </div>

      {/* Badges / Conquistas */}
      <UserBadges 
        deposits={deposits} 
        currentUser={currentUser} 
        goalAmount={goalAmount} 
      />

      {/* Savings Evolution Chart */}
      <SavingsChart deposits={deposits} goalAmount={goalAmount} />

      {/* Inspirações (Circular Gallery) */}
      <div className="space-y-4">
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 text-center font-bold">
          Moodboard
        </h3>
        <div className="relative h-64 w-full overflow-hidden rounded border border-cookbook-border bg-cookbook-bg shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <CircularGallery items={galleryItems} bend={3} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02} />
        </div>
      </div>

      {/* Feed (Mural) */}
      <div className="space-y-4">
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 text-center font-bold">
          Diário de Bordo
        </h3>
        <div className="w-full flex justify-center">
          {deposits.length === 0 ? (
            <div className="text-center py-8 px-4 bg-cookbook-bg border border-cookbook-border border-dashed rounded w-full">
              <div className="w-12 h-12 bg-cookbook-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">☕</span>
              </div>
              <p className="font-serif italic text-cookbook-text/70 text-sm mb-1">
                O pote está vazio!
              </p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold mb-4">
                Peguem leve na rua e guardem o valor aqui.
              </p>
              <button 
                onClick={() => setShowQuickDeposit(true)}
                className="bg-cookbook-primary/10 text-cookbook-primary font-sans text-[9px] uppercase tracking-widest px-4 py-2 rounded-full font-bold transition-colors hover:bg-cookbook-primary hover:text-white"
              >
                + Guardar primeiro valor
              </button>
            </div>
          ) : (
            <Carousel
              baseWidth={320}
              autoplay={false}
              loop={false}
              items={deposits.map(deposit => {
                const isExpense = deposit.type === 'expense';
                return {
                  id: deposit.id,
                  icon: isExpense ? '💸' : '💰',
                  image: deposit.imageUrl,
                  title: (
                    <span className={isExpense ? 'text-red-500' : ''}>
                      {deposit.whoName} {isExpense ? 'gastou' : 'guardou'} {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deposit.amount)}
                    </span>
                  ),
                  description: `"${deposit.action}" • ${deposit.createdAt?.toDate ? formatDistanceToNow(deposit.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 'agora'}`,
                  actionNode: deposit.who === currentUser?.uid ? (
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditClick(deposit)}
                        className="text-cookbook-text/40 hover:text-cookbook-primary transition-colors p-2 bg-cookbook-bg/80 rounded-full backdrop-blur-sm shadow-sm"
                        title="Editar registro"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => setDepositToDelete(deposit.id)}
                        className="text-cookbook-text/40 hover:text-red-500 transition-colors p-2 bg-cookbook-bg/80 rounded-full backdrop-blur-sm shadow-sm"
                        title="Remover registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : null
                };
              })}
            />
          )}
        </div>
      </div>

      {showAIModal && createPortal(
        <AIAssistantModal 
          destination={destination} 
          origin={origin}
          onClose={() => setShowAIModal(false)} 
        />,
        document.getElementById('portal-root')!
      )}

      {showDateModal && createPortal(
        <CheapDateModal onClose={() => setShowDateModal(false)} currentUser={currentUser} />,
        document.getElementById('portal-root')!
      )}

      {/* Edit Confirmation Modal */}
      {depositToEdit && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-cookbook-bg border border-cookbook-border rounded-xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter">
            <h3 className="font-serif text-xl text-cookbook-text mb-4">Editar {depositToEdit.type === 'expense' ? 'Gasto' : 'Economia'}</h3>
            <div className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={(e) => setEditAmount(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded py-3 pr-4 font-serif text-2xl text-center text-cookbook-text focus:outline-none focus:border-red-300 transition-colors"
                />
              </div>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-sm"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDepositToEdit(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-cookbook-border/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                disabled={isEditing}
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
              >
                {isEditing ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root')!
      )}

      {/* Delete Confirmation Modal */}
      {depositToDelete && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-cookbook-bg border border-cookbook-border rounded-xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl text-cookbook-text mb-2">Remover Economia?</h3>
            <p className="font-sans text-xs text-cookbook-text/60 mb-6">
              Tem certeza que deseja excluir este valor do pote? Essa ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDepositToDelete(null)}
                className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-cookbook-border/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:bg-red-600 transition-colors"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root')!
      )}

      {/* Modals placed inside HomeTab directly instead of via absolute inside container, or safely using portal */}
      {showBreakConfirm && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowBreakConfirm(false)}
        >
          <div 
            className="w-full max-w-sm bg-cookbook-bg/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl animate-modal-enter text-center space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl text-white">Prontos para quebrar o pote?</h3>
            <p className="font-sans text-xs uppercase tracking-widest text-white/70">
              Isso guardará esta conquista no histórico e zerará o pote. Deseja continuar?
            </p>
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => setShowBreakConfirm(false)}
                className="flex-1 py-3 bg-white/10 text-white font-sans text-[10px] uppercase tracking-widest font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmBreakPot}
                className="flex-1 py-3 bg-cookbook-gold text-white font-sans text-[10px] uppercase tracking-widest font-bold rounded-xl flex items-center justify-center space-x-2"
              >
                <Sparkles size={14} />
                <span>Quebrar Pote!</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========== FAB Quick Deposit ========== */}
      <button
        onClick={() => setShowQuickDeposit(true)}
        className={`fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-cookbook-primary text-white shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:scale-105 active:scale-95 ${
          showQuickDeposit ? 'rotate-45 bg-cookbook-text' : ''
        }`}
        aria-label="Depósito rápido"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Quick Deposit Modal */}
      {showQuickDeposit && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center animate-modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => {
            setShowQuickDeposit(false);
            setQuickImage(null);
          }}
        >
          <div 
            className="bg-cookbook-bg border-t border-cookbook-border rounded-t-2xl w-full max-w-md p-6 shadow-2xl animate-modal-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cookbook-border rounded-full mx-auto mb-5" />
            
            <h3 className="font-serif text-lg text-cookbook-text mb-4 text-center">Depósito Rápido</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setQuickType('income')}
                className={`flex-1 py-2 rounded-lg font-sans text-[10px] uppercase tracking-widest font-bold border transition-all ${
                  quickType === 'income' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-cookbook-bg border-cookbook-border text-cookbook-text/50'
                }`}
              >
                ↑ Entrada
              </button>
              <button
                onClick={() => setQuickType('expense')}
                className={`flex-1 py-2 rounded-lg font-sans text-[10px] uppercase tracking-widest font-bold border transition-all ${
                  quickType === 'expense' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-cookbook-bg border-cookbook-border text-cookbook-text/50'
                }`}
              >
                ↓ Saída
              </button>
            </div>
            
            <div className="space-y-3 mb-5">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded-xl py-4 pr-4 font-serif text-3xl text-cookbook-text text-center focus:outline-none focus:border-cookbook-primary transition-colors"
                  autoFocus
                />
              </div>
              <input
                type="text"
                value={quickDesc}
                onChange={(e) => setQuickDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-xl px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />

              {/* Image Upload Area */}
              {quickType === 'income' && (
                <div className="mt-4">
                  {quickImage ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-cookbook-border">
                      <img src={quickImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setQuickImage(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full backdrop-blur-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-cookbook-border rounded-xl cursor-pointer bg-cookbook-bg hover:bg-cookbook-primary/5 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Camera size={20} className="text-cookbook-text/40 mb-1" />
                        <p className="font-sans text-[9px] uppercase tracking-widest font-bold text-cookbook-text/50">
                          Adicionar Foto (Opcional)
                        </p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={handleQuickDeposit}
              disabled={!quickAmount || isQuickSubmitting || isNaN(parseCurrencyString(quickAmount)) || parseCurrencyString(quickAmount) <= 0}
              className={`w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all active:scale-[0.98] ${
                quickType === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-cookbook-primary hover:bg-cookbook-primary-hover'
              }`}
            >
              {isQuickSubmitting ? 'Guardando...' : (quickType === 'income' ? 'Guardar no Pote' : 'Registrar Gasto')}
            </button>
          </div>
        </div>,
        document.body
      )}

      {showWrapped && createPortal(
        <WrappedModal 
          onClose={() => setShowWrapped(false)} 
          deposits={deposits}
          goalAmount={goalAmount}
          totalSaved={totalSaved}
        />,
        document.body
      )}

      {/* ShareableWidget removed from here, moved to App.tsx root */}
    </div>
  );
};
