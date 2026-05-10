import React from 'react';
import { motion } from 'motion/react';
import { Crown, Check, X, Sparkles, Flame, Star } from 'lucide-react';
import { createPortal } from 'react-dom';

interface PremiumModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onSubscribe }) => {
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-modal-backdrop">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-cookbook-bg rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Header Background */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 blur-2xl transform scale-150 rounded-full" />
          <Crown size={48} className="text-white drop-shadow-md mx-auto mb-4 relative z-10" />
          <h2 className="font-serif text-3xl font-bold text-white relative z-10 tracking-tight">Pote Sagrado<br/><span className="text-amber-100">Premium</span></h2>
          <p className="font-sans text-xs text-white/90 relative z-10 mt-2 uppercase tracking-widest font-bold">Eleve o nível do relacionamento</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Flame size={14} />
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-cookbook-text">Modo Sexy e Intimidade</h4>
                <p className="font-sans text-xs text-cookbook-text/60 leading-relaxed">Acesso exclusivo aos baralhos picantes do Love Cards.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Star size={14} />
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-cookbook-text">TopBirdz (Sonhos e Valores)</h4>
                <p className="font-sans text-xs text-cookbook-text/60 leading-relaxed">Perguntas profundas sobre futuro e expectativas financeiras.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={14} />
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-cookbook-text">Assinatura Única (Casal)</h4>
                <p className="font-sans text-xs text-cookbook-text/60 leading-relaxed">Pagou um, os dois viram Premium automaticamente.</p>
              </div>
            </li>
          </ul>

          <div className="space-y-3">
            <button
              onClick={onSubscribe}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Crown size={16} /> Tornar-se Premium
            </button>
            <button
              onClick={onClose}
              className="w-full bg-transparent text-cookbook-text/50 hover:text-cookbook-text hover:bg-cookbook-border/30 font-sans text-[10px] uppercase tracking-widest font-bold py-4 rounded-xl transition-all"
            >
              Continuar no plano grátis
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
