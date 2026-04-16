import React, { useState } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const BINGO_ACTIONS = [
  { id: 'jantar_casa', label: 'Jantar Feito em Casa', icon: '🍝' },
  { id: 'no_ifood', label: 'Resistiu ao iFood', icon: '🛵' },
  { id: 'desapego', label: 'Vendeu Desapego', icon: '📦' },
  { id: 'transporte', label: 'Transporte Econômico', icon: '🚌' },
  { id: 'multa', label: 'Multa da Regra Quebrada', icon: '⚖️' },
  { id: 'cafe_casa', label: 'Café em Casa', icon: '☕' },
  { id: 'passeio_gratis', label: 'Passeio Gratuito', icon: '🌳' },
  { id: 'extra', label: 'Renda Extra', icon: '💰' },
  { id: 'promocao', label: 'Aproveitou Promoção', icon: '🏷️' },
];

interface BingoTabProps {
  stats: Record<string, number>;
  customChallenges?: any[];
}

export const BingoTab: React.FC<BingoTabProps> = ({ stats, customChallenges = [] }) => {
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allActions = [...BINGO_ACTIONS, ...customChallenges];

  const handleSave = async () => {
    if (!selectedAction || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      await addDoc(collection(db, 'deposits'), {
        amount: Number(amount),
        action: selectedAction.label,
        who: user.uid,
        whoName: user.displayName || user.email?.split('@')[0] || 'Alguém',
        createdAt: serverTimestamp()
      });

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8E7F6D', '#2C2A26', '#E8E4D9']
      });

      setSelectedAction(null);
      setAmount('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deposits');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-cookbook-text mb-2">Bingo de Atitudes</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Pequenas escolhas, grandes viagens
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {allActions.map((action) => {
          const count = stats[action.label] || 0;
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action)}
              className="relative aspect-square bg-white border border-cookbook-border rounded p-2 flex flex-col items-center justify-center text-center shadow-sm transition-transform active:scale-95 hover:bg-cookbook-primary hover:text-white hover:border-cookbook-primary group"
            >
              <span className="text-2xl mb-2">{action.icon}</span>
              <span className="font-sans text-[9px] uppercase tracking-wider leading-tight font-bold group-hover:text-white text-cookbook-text">
                {action.label}
              </span>
              {count > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cookbook-primary text-white rounded-full flex items-center justify-center font-serif text-xs shadow-md border-2 border-cookbook-bg">
                  {count}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 bg-cookbook-bg/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-cookbook-border rounded w-full max-w-sm p-6 shadow-2xl relative mb-20">
            <button 
              onClick={() => setSelectedAction(null)}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <span className="text-4xl block mb-4">{selectedAction.icon}</span>
              <h3 className="font-serif text-xl text-cookbook-text mb-1">{selectedAction.label}</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
                Qual foi a economia real?
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded py-4 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                  autoFocus
                />
              </div>
              
              <button
                onClick={handleSave}
                disabled={!amount || isSubmitting}
                className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar no Pote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
