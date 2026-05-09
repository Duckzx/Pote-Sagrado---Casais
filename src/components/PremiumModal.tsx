import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageCircleHeart,
  Palette,
  Bot
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { playSuccessSound, vibrate } from "../lib/audio";

interface PremiumModalProps {
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose }) => {
  const setPremium = useAppStore((s) => s.setPremium);
  const addToast = useAppStore((s) => s.addToast);

  const handleSubscribe = () => {
    // Simulating subscription success
    setPremium(true);
    playSuccessSound();
    vibrate([50, 100, 50]);
    addToast("Parabéns!", "Agora vocês são membros Premium! ✨", "success");
    onClose();
  };

  const features = [
    {
      icon: <Bot className="text-amber-500" />,
      title: "IA Akinator de Viagens",
      desc: "Descubra o destino perfeito com inteligência artificial.",
      premium: true,
    },
    {
      icon: <Palette className="text-purple-500" />,
      title: "Temas Exclusivos",
      desc: "Libere todos os estilos visuais para o seu pote.",
      premium: true,
    },
    {
      icon: <MessageCircleHeart className="text-rose-500" />,
      title: "LoveCards Nível 4 e 5",
      desc: "Perguntas profundas e desafios picantes exclusivos.",
      premium: true,
    },
    {
      icon: <ShieldCheck className="text-emerald-500" />,
      title: "Sem Limites",
      desc: "Crie metas ilimitadas e desafios personalizados.",
      premium: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Header */}
        <div className="relative h-48 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex flex-col items-center justify-center text-white overflow-hidden">
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-4"
          >
            <Crown size={64} className="drop-shadow-lg" />
          </motion.div>
          
          <h2 className="text-3xl font-serif font-bold tracking-tight">Pote Premium</h2>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mt-1">O ápice da conexão do casal</p>

          {/* Animated Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="absolute top-10 left-10"
            ><Sparkles size={16} /></motion.div>
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-10 right-10"
            ><Sparkles size={12} /></motion.div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-center text-gray-800">
              Escolha o melhor para vocês
            </h3>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-sans text-sm font-bold text-gray-800 flex items-center gap-2">
                      {f.title}
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase tracking-widest font-black">Pro</span>
                    </h4>
                    <p className="font-sans text-[11px] text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 space-y-4">
              <button
                onClick={handleSubscribe}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-sans text-xs uppercase tracking-[0.2em] font-black py-5 rounded-[20px] shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Assinar Agora <Zap size={18} fill="currentColor" />
              </button>
              
              <div className="text-center">
                <span className="font-sans text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Apenas R$ 9,90 / mês
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <p className="font-sans text-[10px] text-gray-400 leading-tight">
                Continuar no <span className="font-bold">Modo Grátis</span>? Algumas funções mágicas permanecerão bloqueadas.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
