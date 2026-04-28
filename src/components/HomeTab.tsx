import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plane, ArrowRight, Sparkles, Trash2, AlertCircle, Pencil, Plus, X, Heart } from 'lucide-react';
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

export const HomeTab: React.FC<HomeTabProps> = ({ currentUser, destination, origin, goalAmount, totalSaved, deposits, targetDate, addToast }) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<string | null>(null);
  const [depositToEdit, setDepositToEdit] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="space-y-10 pb-24 pt-6 px-6 max-w-md mx-auto relative">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-text/60 font-bold">Pote Sagrado</h2>
        <div className="font-serif text-5xl text-cookbook-primary">
          <AnimatedNumber value={totalSaved} />
        </div>
        <p className="font-serif italic text-cookbook-text/70 text-sm">
          de {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goalAmount)}
        </p>
      </div>

      {/* Daily Motivational Quote */}
      <div className="text-center bg-cookbook-mural/50 border border-cookbook-border/50 rounded-xl px-5 py-3 -mt-4">
        <span className="text-lg mr-1.5">{dailyQuote.emoji}</span>
        <span className="font-serif italic text-xs text-cookbook-text/60">{dailyQuote.text}</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-cookbook-border rounded-full overflow-hidden">
          <div
            className="h-full bg-cookbook-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
            {progress.toFixed(1)}% concluído
          </div>
          {paceMessage && (
            <div className="font-sans text-[9px] uppercase tracking-widest text-cookbook-primary font-bold bg-cookbook-primary/10 px-2 py-0.5 rounded">
              {paceMessage}
            </div>
          )}
        </div>
      </div>

      {/* Countdown Widget */}
      {targetDate && (
        <CountdownWidget targetDate={targetDate} />
      )}

      {/* AI Assistant Trigger */}
      <div className="space-y-4">
        <a
          href={flightsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all active:scale-[0.98] relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-dashed border-cookbook-primary/20 flex items-center justify-center font-serif text-[11px] text-cookbook-primary/40 rotate-[15deg]">
            VISTO OK
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-2 text-cookbook-primary opacity-80">
              <Plane size={18} />
              <span className="font-sans text-[10px] uppercase tracking-widest font-medium">Passaporte</span>
            </div>
            <ArrowRight size={14} className="text-cookbook-text/30" />
          </div>
          <h3 className="font-serif text-2xl text-cookbook-text mb-1 relative z-10 font-medium">{destination || 'Defina um destino'}</h3>
          <p className="font-sans text-[10px] text-cookbook-text/40 uppercase tracking-widest relative z-10">Monitorar Passagens</p>
        </a>

        <button
          onClick={() => setShowAIModal(true)}
          className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all active:scale-[0.98] hover:border-cookbook-gold/30 group"
        >
          <div className="flex items-center space-x-4 text-cookbook-text">
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-cookbook-gold bg-cookbook-gold/10 group-hover:bg-cookbook-gold/20">
              <Sparkles size={16} />
            </div>
            <div className="text-left">
              <p className="font-serif text-base text-cookbook-text font-medium">Consultor de Viagem</p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">Análise com IA</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-cookbook-text/30" strokeWidth={2} />
        </button>

        <button
          onClick={() => setShowDateModal(true)}
          className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all active:scale-[0.98] hover:border-cookbook-primary/30 group"
        >
          <div className="flex items-center space-x-4 text-cookbook-text">
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-cookbook-primary bg-cookbook-primary/10 group-hover:bg-cookbook-primary/20">
              <Heart size={16} />
            </div>
            <div className="text-left">
              <p className="font-serif text-base text-cookbook-text font-medium">Gerador de Encontros</p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">Ideias grátis/baratas</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-cookbook-text/30" strokeWidth={2} />
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
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 text-center font-medium">
          Moodboard
        </h3>
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-white/40 dark:border-white/5 bg-black/40 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
              <div className="w-12 h-12 bg-cookbook-bg rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">☕</span>
              </div>
              <p className="font-serif italic text-cookbook-text/70 text-sm mb-1">
                O pote está vazio!
              </p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
                Que tal fazer um café em casa hoje e guardar o valor aqui?
              </p>
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

      {showAIModal && (
        <AIAssistantModal
          destination={destination}
          origin={origin}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {showDateModal && (
        <CheapDateModal onClose={() => setShowDateModal(false)} currentUser={currentUser} />
      )}

      {/* Edit Confirmation Modal */}
      {depositToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md animate-modal-backdrop" onClick={() => setDepositToEdit(null)}>
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-cookbook-text mb-4 font-medium">Editar {depositToEdit.type === 'expense' ? 'Gasto' : 'Economia'}</h3>
            <div className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded py-3 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-red-300 transition-colors"
                />
              </div>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl px-4 py-3 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDepositToEdit(null)}
                className="flex-1 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-white/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                disabled={isEditing}
                className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50 shadow-md active:scale-95"
              >
                {isEditing ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {depositToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md animate-modal-backdrop" onClick={() => setDepositToDelete(null)}>
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl text-cookbook-text mb-2 font-medium">Remover Economia?</h3>
            <p className="font-sans text-xs text-cookbook-text/60 mb-6">
              Tem certeza que deseja excluir este valor do pote? Essa ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDepositToDelete(null)}
                className="flex-1 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-white/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-md active:scale-95"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== FAB Quick Deposit ========== */}
      <button
        onClick={() => setShowQuickDeposit(true)}
        className={`fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-cookbook-primary text-white shadow-lg flex items-center justify-center transition-all hover:shadow-xl hover:scale-105 active:scale-95 ${showQuickDeposit ? 'rotate-45 bg-cookbook-text' : ''
          }`}
        aria-label="Depósito rápido"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Quick Deposit Modal */}
      {showQuickDeposit && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center animate-modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowQuickDeposit(false)}
        >
          <div
            className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cookbook-border/30 rounded-full mx-auto mb-5" />

            <h3 className="font-serif text-lg text-cookbook-text mb-4 text-center">Depósito Rápido</h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setQuickType('income')}
                className={`flex-1 py-3 rounded-2xl font-sans text-[10px] uppercase tracking-widest font-bold border transition-all ${quickType === 'income' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 text-cookbook-text/50'
                  }`}
              >
                ↑ Entrada
              </button>
              <button
                onClick={() => setQuickType('expense')}
                className={`flex-1 py-3 rounded-2xl font-sans text-[10px] uppercase tracking-widest font-bold border transition-all ${quickType === 'expense' ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 text-cookbook-text/50'
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
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded-xl py-4 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                  autoFocus
                />
              </div>
              <input
                type="text"
                value={quickDesc}
                onChange={(e) => setQuickDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl px-4 py-3 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
            </div>

            <button
              onClick={handleQuickDeposit}
              disabled={!quickAmount || isQuickSubmitting || isNaN(Number(quickAmount.replace(',', '.'))) || Number(quickAmount.replace(',', '.')) <= 0}
              className={`w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all active:scale-[0.98] ${quickType === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-cookbook-primary hover:bg-cookbook-primary-hover'
                }`}
            >
              {isQuickSubmitting ? 'Guardando...' : (quickType === 'income' ? 'Guardar no Pote' : 'Registrar Gasto')}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
