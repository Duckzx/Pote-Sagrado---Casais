import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Plane, Hotel, Utensils, Ticket, Car, ShoppingBag, Plus, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const EXPENSE_CATEGORIES = [
  { id: 'voo', label: 'Passagens', icon: <Plane size={24} /> },
  { id: 'hospedagem', label: 'Hospedagem', icon: <Hotel size={24} /> },
  { id: 'alimentacao', label: 'Alimentação', icon: <Utensils size={24} /> },
  { id: 'passeios', label: 'Passeios', icon: <Ticket size={24} /> },
  { id: 'transporte', label: 'Transporte', icon: <Car size={24} /> },
  { id: 'compras', label: 'Compras', icon: <ShoppingBag size={24} /> },
];

interface ExpensesTabProps {
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ addToast }) => {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!selectedCategory || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      await addDoc(collection(db, 'deposits'), {
        type: 'expense',
        amount: Number(amount),
        action: `${selectedCategory.label}${description ? `: ${description}` : ''}`,
        who: user.uid,
        whoName: user.displayName || user.email?.split('@')[0] || 'Alguém',
        createdAt: serverTimestamp()
      });

      addToast('Gasto Registrado', 'O valor foi abatido do seu pote.', 'success');
      
      setSelectedCategory(null);
      setAmount('');
      setDescription('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deposits');
      addToast('Erro', 'Não foi possível registrar o gasto.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-cookbook-text mb-2">Gastos da Viagem</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
          Registre o que já foi pago
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className="bg-cookbook-bg border border-cookbook-border rounded p-4 flex flex-col items-center justify-center text-center shadow-sm transition-transform active:scale-95 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-cookbook-text group"
          >
            <div className="mb-2 text-cookbook-text/70 group-hover:text-red-500 transition-colors">
              {cat.icon}
            </div>
            <span className="font-sans text-[10px] uppercase tracking-wider font-bold">
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-start pt-20 justify-center p-4 overflow-y-auto animate-modal-backdrop bg-cookbook-bg/90 backdrop-blur-[4px]">
          <div className="bg-cookbook-bg border border-cookbook-border rounded-xl w-full max-w-sm p-6 shadow-2xl relative mb-20 animate-modal-enter">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4 text-red-500">
                {selectedCategory.icon}
              </div>
              <h3 className="font-serif text-xl text-cookbook-text mb-1">{selectedCategory.label}</h3>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
                Qual foi o valor gasto?
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
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded py-4 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-red-300 transition-colors"
                  autoFocus
                />
              </div>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-red-300 transition-colors shadow-sm"
              />
              
              <button
                onClick={handleSave}
                disabled={!amount || isSubmitting}
                className="w-full bg-red-500 text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold disabled:opacity-50 transition-opacity hover:bg-red-600"
              >
                {isSubmitting ? 'Registrando...' : 'Abater do Pote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
