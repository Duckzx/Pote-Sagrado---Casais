import React, { useState, useEffect } from 'react';
import { X, Heart, Loader2, Dice5, Plus, Save, Map, Music, Pizza, Wine, Camera, Tent, Gamepad2, Ticket, Coffee, Star } from 'lucide-react';
import { DATE_IDEAS } from '../data/dateIdeas';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface CheapDateModalProps {
  onClose: () => void;
  currentUser: User | null;
}

const TIERS = [
  { id: 'gratis', label: 'Grátis' },
  { id: '50', label: 'Até R$50' },
  { id: '100', label: 'Até R$100' },
  { id: '200', label: 'Até R$200' },
  { id: 'luxo', label: 'Luxo!' }
];

const ICONS = [
  { id: 'heart', icon: <Heart size={20} /> },
  { id: 'coffee', icon: <Coffee size={20} /> },
  { id: 'pizza', icon: <Pizza size={20} /> },
  { id: 'wine', icon: <Wine size={20} /> },
  { id: 'map', icon: <Map size={20} /> },
  { id: 'music', icon: <Music size={20} /> },
  { id: 'camera', icon: <Camera size={20} /> },
  { id: 'tent', icon: <Tent size={20} /> },
  { id: 'gamepad2', icon: <Gamepad2 size={20} /> },
  { id: 'ticket', icon: <Ticket size={20} /> },
  { id: 'star', icon: <Star size={20} /> }
];

export const CheapDateModal: React.FC<CheapDateModalProps> = ({ onClose, currentUser }) => {
  const [selectedTier, setSelectedTier] = useState<string>('50');
  const [result, setResult] = useState<{ title: string; idea: string; cost: string; icon: React.ReactNode } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [customDates, setCustomDates] = useState<any[]>([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newIconId, setNewIconId] = useState('heart');

  // Load custom dates on mount
  useEffect(() => {
    if (!currentUser) return;
    const fetchCustomDates = async () => {
      try {
        const q = query(collection(db, 'users', currentUser.uid, 'customDates'));
        const querySnapshot = await getDocs(q);
        const fetchedDates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomDates(fetchedDates);
      } catch (err) {
        console.error("Error fetching custom dates:", err);
      }
    };
    fetchCustomDates();
  }, [currentUser]);

  const handleGenerate = () => {
    setIsSpinning(true);
    setResult(null);
    
    setTimeout(() => {
      // Base ideas
      const ideas = [...(DATE_IDEAS[selectedTier] || [])];
      
      // Incorporate custom ideas for the selected tier
      const customForTier = customDates.filter(d => d.tier === selectedTier).map(c => {
        const iconMatch = ICONS.find(i => i.id === c.iconId)?.icon || <Star size={24} />;
        return {
          title: c.title,
          idea: c.idea,
          cost: c.cost,
          icon: React.cloneElement(iconMatch as React.ReactElement<any>, { size: 24 })
        };
      });

      const allIdeas = [...ideas, ...customForTier];
      const randomIdea = allIdeas.length > 0 
        ? allIdeas[Math.floor(Math.random() * allIdeas.length)]
        : { title: 'Nada definido', idea: 'Não há ideias para esse limite ainda.', cost: '-', icon: <Star size={24} /> };
        
      setResult(randomIdea);
      setIsSpinning(false);
    }, 1200);
  };

  const handleSaveCustom = async () => {
    if (!currentUser || !newTitle || !newIdea) return;
    setIsLoadingCustom(true);
    try {
      const newCustomDate = {
        title: newTitle,
        idea: newIdea,
        cost: newCost || '-',
        iconId: newIconId,
        tier: selectedTier
      };
      
      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'customDates'), newCustomDate);
      
      setCustomDates(prev => [...prev, { id: docRef.id, ...newCustomDate }]);
      setNewTitle('');
      setNewIdea('');
      setNewCost('');
      setIsAdding(false);
    } catch (err) {
      console.error("Erro ao salvar encontro:", err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  // If we are showing the add form
  if (isAdding) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md animate-modal-backdrop" onClick={() => setIsAdding(false)}>
        <div 
          className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-modal-enter h-[80vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />
          
          <div className="flex items-center justify-between mb-4 border-b border-cookbook-border/30 pb-2">
            <h3 className="font-serif text-lg text-cookbook-text font-medium">Adicionar Encontro</h3>
            <button onClick={() => setIsAdding(false)} className="text-cookbook-text/40 hover:text-cookbook-text">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 px-1 custom-scrollbar">
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-1">
                Categoria (Budget)
              </label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`px-3 py-1.5 rounded-full font-sans text-[9px] uppercase tracking-widest font-bold transition-colors border ${
                      selectedTier === tier.id 
                        ? 'bg-cookbook-primary text-white border-cookbook-primary shadow-sm' 
                        : 'bg-cookbook-bg text-cookbook-text/60 border-cookbook-border'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-1">
                Título do Encontro
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Jantar à luz de velas na varanda"
                maxLength={40}
                className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl p-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-1">
                Descrição
              </label>
              <textarea
                value={newIdea}
                onChange={e => setNewIdea(e.target.value)}
                placeholder="Como vai ser?"
                maxLength={150}
                className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl p-3 font-serif text-sm text-cookbook-text h-20 resize-none focus:outline-none focus:border-cookbook-primary transition-colors"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-1">
                  Ícone
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1">
                  {ICONS.map(i => (
                    <button
                      key={i.id}
                      onClick={() => setNewIconId(i.id)}
                      title={i.id}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        newIconId === i.id 
                          ? 'bg-cookbook-primary/20 text-cookbook-primary border-[1.5px] border-cookbook-primary shadow-sm scale-110' 
                          : 'bg-cookbook-bg text-cookbook-text/40 border border-cookbook-border hover:bg-cookbook-border/30 hover:text-cookbook-text'
                      }`}
                    >
                      {i.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold mb-1">
                  Custo (Opcional)
                </label>
                <input
                  type="text"
                  value={newCost}
                  onChange={e => setNewCost(e.target.value)}
                  placeholder="Ex: R$ 0"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg p-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-cookbook-border/30">
            <button
              onClick={handleSaveCustom}
              disabled={isLoadingCustom || !newTitle || !newIdea || !currentUser}
              className="w-full bg-cookbook-primary hover:bg-cookbook-primary-hover text-white font-sans text-[10px] uppercase tracking-widest py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingCustom ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Salvar Ideia</span>
            </button>
            {!currentUser && (
              <p className="text-[10px] text-center text-red-400 mt-2">Você precisa estar logado para criar encontros.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md animate-modal-backdrop" onClick={onClose}>
      <div 
        className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-modal-enter"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text z-10"
        >
          <X size={20} />
        </button>

        <div className="mt-2 text-center">
          <div className="w-14 h-14 bg-cookbook-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cookbook-primary/20 shadow-sm relative group cursor-pointer" onClick={() => setIsAdding(true)}>
            <Heart size={24} className="text-cookbook-primary" />
            <div className="absolute inset-0 bg-cookbook-primary rounded-full text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity shadow-lg">
              <Plus size={20} />
            </div>
          </div>
          
          <h3 className="font-serif text-xl text-cookbook-text mb-2">Roleta de Encontros</h3>
          <p className="font-sans text-xs text-cookbook-text/60 mb-5">
            A viagem é prioridade, mas não precisamos deixar de viver! Qual o limite (budget) para o deite de hoje?
          </p>

          {!result && !isSpinning && (
            <div className="space-y-5 animate-badge-text-reveal">
              {/* Seletor de Tiers */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`px-3 py-1.5 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold transition-colors border ${
                      selectedTier === tier.id 
                        ? 'bg-cookbook-primary text-white border-cookbook-primary shadow-md' 
                        : 'bg-white/40 dark:bg-black/10 backdrop-blur-md text-cookbook-text/60 border-white/40 dark:border-white/5 hover:border-cookbook-primary/50'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-cookbook-primary hover:bg-cookbook-primary-hover text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Dice5 size={16} />
                  <span>Sortear Ideia</span>
                </button>
                
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 hover:border-cookbook-primary/30 hover:bg-cookbook-primary/5 text-cookbook-text/80 hover:text-cookbook-primary font-sans text-[9px] uppercase tracking-widest py-3 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  <span>Adicionar Personalizado</span>
                </button>
              </div>
            </div>
          )}

          {isSpinning && (
            <div className="py-8 space-y-4">
              <Loader2 size={32} className="text-cookbook-primary animate-spin mx-auto" />
              <p className="font-serif italic text-cookbook-text/60 animate-pulse">Girando a roleta mágica...</p>
            </div>
          )}

          {result && !isSpinning && (
            <div className="space-y-4 pt-2 animate-badge-unlock-card absolute-center w-full">
              <div className="w-12 h-12 bg-cookbook-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-cookbook-primary">
                {result.icon}
              </div>
              <div className="inline-block bg-cookbook-primary/10 text-cookbook-primary border border-cookbook-primary/20 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold mb-2">
                Budget: {result.cost}
              </div>
              <h3 className="font-serif italic text-2xl text-cookbook-text">
                {result.title}
              </h3>
              <p className="font-sans text-xs text-cookbook-text/70 leading-relaxed max-w-[280px] mx-auto text-balance">
                {result.idea}
              </p>
              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 bg-white/40 dark:bg-black/10 backdrop-blur-md border border-white/40 dark:border-white/5 text-cookbook-text hover:bg-white/60 font-sans text-[9px] uppercase tracking-widest py-3 rounded-2xl font-bold transition-colors shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-sm"
                >
                  Voltar
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 bg-cookbook-primary/10 border border-cookbook-primary/20 text-cookbook-primary hover:bg-cookbook-primary/20 font-sans text-[9px] uppercase tracking-widest py-3 rounded-2xl font-bold transition-colors shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-sm"
                >
                  Sortear Outro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
