import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
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
  const casalId = useAppStore(s => s.casalId);
  const setPremium = useAppStore((s) => s.setPremium);
  const addToast = useAppStore((s) => s.addToast);
  
  const [step, setStep] = React.useState<'plans' | 'checkout' | 'success'>('plans');
  const [plan, setPlan] = React.useState<'monthly' | 'yearly'>('monthly');
  const [method, setMethod] = React.useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubscribe = async () => {
    // Premium feature is coming soon - simulated payment disabled for security
    addToast("Em breve!", "O sistema de pagamentos reais está sendo implementado.", "info");
  };

  const features = [
    {
      icon: <Bot className="text-amber-500" />,
      title: "IA Akinator de Viagens",
      desc: "Destinos perfeitos com I.A.",
    },
    {
      icon: <Palette className="text-purple-500" />,
      title: "Temas Exclusivos",
      desc: "Libere todos os estilos visuais.",
    },
    {
      icon: <MessageCircleHeart className="text-rose-500" />,
      title: "LoveCards Avançados",
      desc: "Perguntas e desafios nível 4 e 5.",
    },
    {
      icon: <ShieldCheck className="text-emerald-500" />,
      title: "Recursos Ilimitados",
      desc: "Metas e desafios sem restrições.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <AnimatePresence mode="wait">
        {step === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-44 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex flex-col items-center justify-center text-white p-6">
              <Crown size={48} className="mb-2 drop-shadow-lg" />
              <h2 className="text-2xl font-serif font-bold">Pote Premium</h2>
              <p className="text-[10px] uppercase tracking-widest font-black opacity-80">Conectando vocês em outro nível</p>
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-8">
              <div className="space-y-4 mb-8">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">{f.icon}</div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{f.title}</h4>
                      <p className="text-[10px] text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl mb-6">
                <button 
                  onClick={() => setPlan('monthly')}
                  className={`py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${plan === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Mensal
                </button>
                <button 
                  onClick={() => setPlan('yearly')}
                  className={`py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all relative ${plan === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Anual
                  <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black animate-pulse">−20%</span>
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-3xl font-serif font-bold text-gray-900">
                  {plan === 'monthly' ? 'R$ 9,90' : 'R$ 7,90'}
                  <span className="text-xs text-gray-400 font-sans ml-1 font-normal">/mês</span>
                </p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">Cobrança única de {plan === 'monthly' ? 'R$ 9,90' : 'R$ 94,80'}</p>
              </div>

              <button 
                onClick={() => setStep('checkout')}
                className="w-full py-5 bg-cookbook-text text-white rounded-2xl font-sans text-xs uppercase tracking-widest font-black shadow-xl shadow-gray-200 active:scale-95 transition-all"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 'checkout' && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep('plans')} className="p-2 bg-gray-100 rounded-full"><X size={18} className="rotate-180" /></button>
              <h2 className="text-xl font-serif font-bold text-gray-900">Pagamento</h2>
            </div>

            <div className="space-y-6">
              {/* Method Selection */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setMethod('card')}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'card' ? 'border-amber-500 bg-amber-50/30' : 'border-gray-100'}`}
                >
                  <Zap size={20} className={method === 'card' ? 'text-amber-500' : 'text-gray-300'} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Cartão</span>
                </button>
                <button 
                  onClick={() => setMethod('pix')}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'pix' ? 'border-amber-500 bg-amber-50/30' : 'border-gray-100'}`}
                >
                  <Sparkles size={20} className={method === 'pix' ? 'text-amber-500' : 'text-gray-300'} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">PIX</span>
                </button>
              </div>

              {method === 'card' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 ml-1">Número do Cartão</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-mono tracking-widest text-gray-400">•••• •••• •••• ••••</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 ml-1">Validade</label>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-mono text-gray-400">MM/AA</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-black text-gray-400 ml-1">CVV</label>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-mono text-gray-400">•••</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-3xl flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white rounded-2xl border border-gray-100 mb-4 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Aponte a câmera para o QR Code</p>
                </div>
              )}

              <button 
                onClick={handleSubscribe}
                disabled={true}
                className="w-full py-5 bg-gray-400 text-white rounded-2xl font-sans text-xs uppercase tracking-widest font-black shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
              >
                Em breve
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-white rounded-[40px] p-12 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
              <Check size={48} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Bem-vindos!</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Agora vocês são membros <span className="text-amber-600 font-bold">Premium</span>. Todas as funções mágicas foram liberadas para o casal!</p>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-cookbook-text text-white rounded-2xl font-sans text-xs uppercase tracking-widest font-black"
            >
              Começar a Usar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
