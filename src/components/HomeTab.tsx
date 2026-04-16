import React, { useState, useEffect, useMemo } from 'react';
import { Plane, ArrowRight, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { AnimatedNumber } from './AnimatedNumber';
import Carousel from './Carousel';
import { formatDistanceToNow, differenceInMonths, differenceInWeeks, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AIAssistantModal } from './AIAssistantModal';
import CircularGallery from './CircularGallery';
import { UserBadges } from './UserBadges';

interface HomeTabProps {
  currentUser: any;
  destination: string;
  origin: string;
  goalAmount: number;
  totalSaved: number;
  deposits: any[];
  targetDate?: string;
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ currentUser, destination, origin, goalAmount, totalSaved, deposits, targetDate, addToast }) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<string | null>(null);

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

  return (
    <div className="space-y-10 pb-24 pt-6 px-6 max-w-md mx-auto">
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

      {/* AI Assistant Trigger */}
      <div className="space-y-3">
        <a 
          href={flightsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border border-cookbook-border border-b-4 border-b-cookbook-primary rounded p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-transform active:scale-[0.98] relative overflow-hidden"
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
      </div>

      {/* Badges / Conquistas */}
      <UserBadges 
        deposits={deposits} 
        currentUser={currentUser} 
        goalAmount={goalAmount} 
      />

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
            <div className="text-center py-8 px-4 bg-white border border-cookbook-border border-dashed rounded w-full">
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
                    <button 
                      onClick={() => setDepositToDelete(deposit.id)}
                      className="text-cookbook-text/30 hover:text-red-500 transition-colors p-2 bg-white/80 rounded-full backdrop-blur-sm shadow-sm"
                      title="Remover registro"
                    >
                      <Trash2 size={16} />
                    </button>
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

      {/* Delete Confirmation Modal */}
      {depositToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/80 backdrop-blur-sm">
          <div className="bg-white border border-cookbook-border rounded w-full max-w-sm p-6 shadow-2xl relative text-center">
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
        </div>
      )}
    </div>
  );
};
