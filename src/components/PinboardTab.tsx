import React, { useState, useRef } from 'react';
import { Pin, Plus, ExternalLink, Calendar, ArrowUpCircle, ArrowDownCircle, Trash2, Camera, MapPin, Search, PlusCircle, Trophy } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAppContext } from '../context/AppContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface PinboardTabProps {
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

export const PinboardTab: React.FC<PinboardTabProps> = ({ addToast }) => {
  const { deposits } = useAppContext();
  
  // Nossos Sonhos
  const [links, setLinks] = useState([
    { id: 1, link: 'https://airbnb.com', text: 'Chalé em Campos', image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=600&h=400&fit=crop' },
    { id: 2, link: 'https://tiktok.com', text: 'Restaurante X', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop' },
    { id: 3, link: 'https://decolar.com', text: 'Passagens Promo', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop' },
  ]);

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Conquistas
  const [conquistas, setConquistas] = useState([
    { id: 1, title: 'Viagem Natal 2023', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop' }
  ]);

  const handleAddLink = () => {
    if (!newTitle || !newUrl) return;
    
    // Auto generated image for demo
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(newTitle)}/600/400`;
    
    setLinks([{ id: Date.now(), link: newUrl, text: newTitle, image: imageUrl }, ...links]);
    setNewTitle('');
    setNewUrl('');
    setIsAddingLink(false);
    addToast('Adicionado', 'Link salvo no mural!', 'success');
  };

  const handleLinkDelete = (id: number) => {
    setLinks(links.filter(l => l.id !== id));
  }
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (conquistas.length >= 3) {
        addToast('Atenção', 'Máximo de 3 fotos atingido.', 'info');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setConquistas([...conquistas, { id: Date.now(), title: 'Nova Conquista', image: imageUrl }]);
      addToast('Sucesso', 'Mural atualizado com nova foto.', 'success');
    }
  }
  
  const handleRemoveConquista = (id: number) => {
    setConquistas(conquistas.filter(c => c.id !== id));
  }

  // Histórico
  const filteredDeposits = [...deposits].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });

  const formatCurrency = (val: number) =>
    Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatTime = (d: any) => {
    if (!d?.createdAt?.toDate) return '';
    return d.createdAt.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const totals = filteredDeposits.reduce((acc, d) => {
    if (d.type === 'expense') acc.gastos += d.amount;
    else acc.depositos += d.amount;
    return acc;
  }, { depositos: 0, gastos: 0 });

  const saldo = totals.depositos - totals.gastos;

  return (
    <div className="pb-32 pt-6 px-4 max-w-2xl mx-auto space-y-12 animate-fade-in relative min-h-[100dvh]">
      
      {/* Header */}
      <div className="text-center space-y-2 mt-2">
        <Pin size={24} className="text-cookbook-primary mx-auto mb-1 opacity-80" />
        <h2 className="font-serif text-2xl font-medium text-cookbook-text">Mural de Sonhos</h2>
        <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">
          Inspirações, Memórias e Histórico
        </p>
      </div>

      {/* 1. Nossos Sonhos (Roleta / Carrossel de Imagens) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-serif text-lg text-cookbook-text">Projetos & Links</h3>
          <button onClick={() => setIsAddingLink(!isAddingLink)} className="text-cookbook-primary p-2 hover:bg-white/40 dark:hover:bg-white/5 rounded-full backdrop-blur-md border border-white/40 dark:border-white/5 transition-colors shadow-sm">
            <Plus size={20} />
          </button>
        </div>

        {isAddingLink && (
          <div className="bg-white/40 dark:bg-black/10 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl p-4 shadow-sm animate-fade-in">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ex: Chalé em Campos"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/40 dark:border-white/5 font-serif text-cookbook-text focus:outline-none focus:border-cookbook-primary text-sm placeholder:text-cookbook-text/30"
              />
              <input
                type="url"
                placeholder="Link (https://...)"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full bg-white/40 dark:bg-black/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/40 dark:border-white/5 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary placeholder:text-cookbook-text/30"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setIsAddingLink(false)} className="px-5 py-2 text-[10px] uppercase tracking-widest text-cookbook-text/60 font-bold rounded-xl hover:bg-white/40">Cancelar</button>
                <button onClick={handleAddLink} className="px-5 py-2 text-[10px] uppercase tracking-widest bg-cookbook-primary text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform">Adicionar</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4 overflow-y-hidden">
          {links.map((item) => (
            <div key={item.id} className="snap-center shrink-0 w-[240px] group relative">
              <div className="h-40 rounded-3xl overflow-hidden relative shadow-sm border border-white/40 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-sm">
                <img src={item.image} alt={item.text} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <button onClick={() => handleLinkDelete(item.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/20 hover:bg-red-500/80">
                  <Trash2 size={14} />
                </button>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                  <span className="font-serif text-sm font-medium truncate pr-2">{item.text}</span>
                  <ExternalLink size={14} className="shrink-0 opacity-70" />
                </a>
              </div>
            </div>
          ))}
          {links.length === 0 && (
             <div className="w-full h-40 rounded-3xl border-2 border-dashed border-white/40 dark:border-white/5 bg-white/40 dark:bg-black/10 backdrop-blur-md flex items-center justify-center text-cookbook-text/40 font-serif italic text-sm text-center px-4 font-medium shrink-0 shadow-sm">
               Nenhum sonho adicionado.
             </div>
          )}
        </div>
      </section>

      {/* 2. Mural de Conquistas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-cookbook-gold" />
            <h3 className="font-serif text-lg text-cookbook-text">Nossas Conquistas</h3>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-cookbook-text/40 font-medium">
            {conquistas.length} de 3
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {conquistas.map((item) => (
            <div key={item.id} className="aspect-square rounded-3xl overflow-hidden relative group shadow-sm border border-white/40 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-sm">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                 <button onClick={() => handleRemoveConquista(item.id)} className="w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500">
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}
          
          {conquistas.length < 3 && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-3xl border-2 border-dashed border-white/40 dark:border-white/5 flex flex-col items-center justify-center text-cookbook-text/40 hover:text-cookbook-primary hover:bg-cookbook-primary/5 transition-colors group bg-white/40 dark:bg-black/10 backdrop-blur-md"
            >
              <Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[9px] uppercase tracking-widest font-bold">Adicionar Foto</span>
            </button>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handlePhotoUpload} 
        />
        <p className="font-sans text-[10px] text-cookbook-text/40 italic px-2 text-center">
          Você pode fixar até 3 memórias dos potes que já quebrou juntos.
        </p>
      </section>

      {/* 3. Histórico (Extrato simplificado) */}
      <section className="space-y-4">
        <h3 className="font-serif text-lg text-cookbook-text px-2">Histórico do Pote</h3>
        
        <div className="bg-white/40 dark:bg-black/10 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
           <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cookbook-text/50 font-medium mb-1">Saldo Atual</p>
                <p className="font-serif text-2xl text-cookbook-primary font-medium">{formatCurrency(saldo)}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-emerald-600 text-[10px] font-bold">
                   <ArrowUpCircle size={10} /> +{formatCurrency(totals.depositos)}
                </div>
                <div className="flex items-center gap-1 justify-end text-red-500 text-[10px] font-bold mt-1">
                   <ArrowDownCircle size={10} /> -{formatCurrency(totals.gastos)}
                </div>
              </div>
           </div>

           <div className="space-y-4">
             {filteredDeposits.length === 0 ? (
                <div className="text-center py-6 text-cookbook-text/40 font-sans text-xs">
                  Ainda não há histórico de depósitos.
                </div>
             ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto hide-scrollbar pr-2 -mx-2 pl-2">
                  {filteredDeposits.map(d => {
                     const isExpense = d.type === 'expense';
                     return (
                       <div key={d.id} className="flex items-center justify-between py-2 border-b border-white/20 dark:border-white/5 last:border-0 hover:bg-white/40 dark:hover:bg-white/5 px-2 -mx-2 rounded-xl transition-colors cursor-default">
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 backdrop-blur-md border ${isExpense ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                               {isExpense ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                            </div>
                            <div className="min-w-0">
                               <p className="font-serif text-sm text-cookbook-text truncate max-w-[120px] md:max-w-[200px]">{d.action || (isExpense ? 'Gasto' : 'Depósito')}</p>
                               <div className="flex items-center gap-2">
                                 <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40">{d.whoName}</span>
                                 <span className="font-sans text-[9px] text-cookbook-text/30">{formatTime(d)}</span>
                               </div>
                            </div>
                         </div>
                         <div className={`font-serif text-sm font-medium shrink-0 ${isExpense ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isExpense ? '-' : '+'}{formatCurrency(d.amount)}
                         </div>
                       </div>
                     )
                  })}
                </div>
             )}
           </div>
        </div>
      </section>

    </div>
  );
};
