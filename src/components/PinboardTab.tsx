import React, { useState } from 'react';
import { Pin, Plus, ExternalLink } from 'lucide-react';
import FlowingMenu from './FlowingMenu';

interface PinboardTabProps {
  addToast: (title: string, message: string, type: 'info' | 'success' | 'milestone') => void;
}

export const PinboardTab: React.FC<PinboardTabProps> = ({ addToast }) => {
  const [links, setLinks] = useState([
    { link: 'https://airbnb.com', text: 'Chalé em Campos', image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=600&h=400&fit=crop' },
    { link: 'https://tiktok.com', text: 'Dica de Restaurante', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop' },
    { link: 'https://decolar.com', text: 'Passagens Promocionais', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    if (!newTitle || !newUrl) return;
    
    // Auto generated image for demo purposes based on title
    const imageUrl = `https://loremflickr.com/600/400/${encodeURIComponent(newTitle.split(' ')[0])}/all`;
    
    setLinks([{ link: newUrl, text: newTitle, image: imageUrl }, ...links]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
    addToast('Adicionado', 'Link salvo no mural!', 'success');
  };

  return (
    <div className="space-y-6 pb-32 pt-6 px-6 max-w-md mx-auto relative min-h-screen">
      <div className="text-center space-y-2 mb-8">
        <Pin size={32} className="text-cookbook-primary mx-auto mb-2" />
        <h2 className="font-serif text-3xl text-cookbook-text">Nossos Sonhos</h2>
        <p className="font-sans text-xs uppercase tracking-widest text-cookbook-text/60 font-bold">
          Mural de Inspirações
        </p>
      </div>

      <button 
        onClick={() => setIsAdding(true)}
        className="w-full border-2 border-dashed border-cookbook-border hover:border-cookbook-primary text-cookbook-text/50 hover:text-cookbook-primary py-4 rounded-xl flex flex-col items-center justify-center transition-colors mb-6"
      >
        <Plus size={24} className="mb-1" />
        <span className="font-sans text-[10px] uppercase tracking-widest font-bold">Salvar novo link</span>
      </button>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl border border-cookbook-border shadow-sm mb-6 space-y-3 animate-modal-enter">
          <input
            type="text"
            placeholder="Título (ex: Chalé Romântico)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-transparent border-b border-cookbook-border pb-2 text-cookbook-text font-serif italic focus:outline-none focus:border-cookbook-primary placeholder:text-cookbook-text/30"
          />
          <input
            type="url"
            placeholder="Link (https://...)"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="w-full bg-transparent border-b border-cookbook-border pb-2 text-cookbook-text font-sans text-xs focus:outline-none focus:border-cookbook-primary placeholder:text-cookbook-text/30"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold hover:bg-black/5 rounded">Cancelar</button>
            <button onClick={handleAdd} className="px-3 py-1.5 text-[10px] uppercase tracking-widest bg-cookbook-primary text-white font-bold rounded shadow-sm hover:scale-95 transition-transform">Adicionar</button>
          </div>
        </div>
      )}

      {/* Render Flowing Menu for the links */}
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-cookbook-border overflow-hidden" style={{ minHeight: '400px' }}>
        {links.length > 0 ? (
          <FlowingMenu 
            items={links} 
            speed={20}
            textColor="var(--theme-text)"
            marqueeBgColor="var(--theme-primary)"
            marqueeTextColor="#FFF"
            borderColor="var(--theme-border)"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-cookbook-text/40 font-sans text-xs uppercase tracking-widest p-8 text-center">
            Nenhum link salvo ainda. Adicione o primeiro destino dos sonhos!
          </div>
        )}
      </div>
      
    </div>
  );
};
