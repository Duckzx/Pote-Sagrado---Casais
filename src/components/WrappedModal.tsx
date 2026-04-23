import React, { useState, useEffect } from 'react';
import { X, Trophy, Heart, Map, Sparkles, HandCoins } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface WrappedModalProps {
  onClose: () => void;
  deposits: any[];
  goalAmount: number;
  totalSaved: number;
}

export const WrappedModal: React.FC<WrappedModalProps> = ({ onClose, deposits = [], goalAmount, totalSaved }) => {
  const [slide, setSlide] = useState(0);

  // Statistics Calculation
  const progress = Math.min(100, (totalSaved / goalAmount) * 100);
  
  // Who saved the most?
  let user1 = '';
  let user2 = '';
  let user1Total = 0;
  let user2Total = 0;

  deposits.forEach(d => {
    if (d.type === 'expense') return; // only savings
    if (!user1) {
      user1 = d.whoName;
      user1Total += d.amount;
    } else if (d.whoName === user1) {
      user1Total += d.amount;
    } else {
      user2 = d.whoName;
      user2Total += d.amount;
    }
  });

  const topSaver = user1Total > user2Total ? user1 : user2;
  const bestAmount = Math.max(user1Total, user2Total);
  
  // Biggest single save
  let biggestSave = 0;
  deposits.forEach(d => {
    if (d.type !== 'expense' && d.amount > biggestSave) biggestSave = d.amount;
  });

  const totalSteps = 4;

  useEffect(() => {
    // Auto advance slides
    const timer = setInterval(() => {
      setSlide(s => {
        if (s < totalSteps - 1) return s + 1;
        clearInterval(timer);
        return s;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (slide) {
      case 0:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-slide-up-fade">
            <div className="w-24 h-24 bg-cookbook-gold/20 rounded-full flex items-center justify-center">
              <Sparkles size={40} className="text-cookbook-gold" />
            </div>
            <div>
              <h2 className="font-serif italic text-4xl text-white mb-2">Pote Sagrado<br/>Wrapped</h2>
              <p className="font-sans text-xs uppercase tracking-widest text-white/70">A jornada de vocês</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade">
            <div className="w-20 h-20 bg-cookbook-bg/10 rounded-full flex items-center justify-center">
              <Map size={36} className="text-white" />
            </div>
            <div>
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-white/70 mb-4">Avanço Juntos</h2>
              <p className="font-serif text-5xl text-white mb-2">{progress.toFixed(1)}%</p>
              <p className="font-sans text-xs text-white/80">
                Mais perto da viagem dos sonhos!
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade" key="slide3">
            <div className="w-20 h-20 bg-cookbook-bg/10 rounded-full flex items-center justify-center">
              <Trophy size={36} className="text-white" />
            </div>
            <div>
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-white/70 mb-4">Investidor Mestre</h2>
              <p className="font-serif italic text-4xl text-white mb-2">{topSaver || 'Vocês'}</p>
              <p className="font-sans text-xs text-white/80 max-w-[250px] mx-auto text-balance">
                dominou as doações com {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bestAmount)}.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade">
            <div className="w-20 h-20 bg-cookbook-bg/10 rounded-full flex items-center justify-center">
              <Heart size={36} className="text-white fill-white/20" />
            </div>
            <div>
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-white/70 mb-4">Melhor Aporte</h2>
              <p className="font-serif text-4xl text-white mb-4">
                {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(biggestSave)}
              </p>
              <p className="font-sans text-xs text-white/80 max-w-[250px] mx-auto text-balance">
                Continuem assim! A união faz a força e a viagem!
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-sans text-[10px] uppercase tracking-widest py-3 px-8 rounded-full transition-all active:scale-95 border border-white/30"
            >
              Uhuul!
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-modal-backdrop" onClick={onClose}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E07A5F]/20 via-[#8E7F6D]/50 to-[#C5A059]/30 opacity-50"></div>

      <div 
        className="w-full max-w-sm aspect-[9/16] relative overflow-hidden rounded-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
        style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Simple Progress bars top */}
        <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-20">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
               <div className={`h-full bg-white transition-all duration-[4000ms] ease-linear`} style={{ width: slide > i ? '100%' : slide === i ? '100%' : '0%' }}></div>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-8 right-4 text-white/50 hover:text-white z-20 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="absolute inset-0 p-6 z-10 flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
