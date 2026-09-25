import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store/useAppStore";
import { MODE_TABS } from "../lib/mode";
import { 
  ArrowRight, 
  Check, 
  X, 
  Home as HomeIcon, 
  Target, 
  Trophy, 
  Pin, 
  Heart,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { SacredJarIcon } from "./SacredJarIcon";
import { TabId } from "../types";

interface Step {
  id: number;
  tab: TabId;
  title: string;
  description: string;
  icon: any;
  highlight?: string; // CSS selector to highlight
}

export const GuidedTutorial: React.FC = () => {
  const showOnboarding = useAppStore((s) => s.showOnboarding);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  
  const [currentStep, setCurrentStep] = useState(0);
  const mode = useAppStore((s) => s.mode);
  const needsModeChoice = useAppStore((s) => s.needsModeChoice);
  const together = mode === "solo" ? "você" : "vocês";

  const allSteps: Step[] = [
    {
      id: 0,
      tab: "home",
      title: mode === "solo" ? "Bem-vinda(o) ao Pote Sagrado!" : "Bem-vindos ao Pote Sagrado!",
      description:
        mode === "solo"
          ? "Seu cofrinho digital. Aqui você transforma sonhos em realidade, guardando dinheiro de um jeito leve e divertido."
          : mode === "grupo"
            ? "O cofrinho digital da turma. Juntem dinheiro para a viagem, a festa ou qualquer plano, cada um no seu ritmo."
            : "Este é o cofrinho digital do casal. Aqui vocês vão transformar sonhos em realidade, poupando juntos de um jeito divertido.",
      icon: <SacredJarIcon className="w-16 h-16 text-cookbook-primary" />,
    },
    {
      id: 1,
      tab: "home",
      title: "Defina sua Meta",
      description: `Seja uma viagem, um carro novo ou o sonho da casa própria. ${together === "você" ? "Você define" : "Vocês definem"} o objetivo e acompanha o pote crescer a cada depósito.`,
      icon: <Target size={48} className="text-cookbook-primary" />,
    },
    {
      id: 2,
      tab: "missoes",
      title: "Bingo de Atitudes",
      description: "Economia real no dia a dia! Evitou um gasto desnecessário? Marque no Bingo e veja o valor ir direto para o pote.",
      icon: <Target size={48} className="text-cookbook-primary" />,
    },
    {
      id: 3,
      tab: "disputa",
      title: "Arena de Disputas",
      description: mode === "grupo"
        ? "Quem mais contribuiu no mês? O ranking da turma mostra cada pessoa e deixa a vaquinha divertida."
        : "Quem é o mestre da economia do mês? Acompanhem o duelo e vejam quem está contribuindo mais para o sonho comum.",
      icon: <Trophy size={48} className="text-cookbook-primary" />,
    },
    {
      id: 4,
      tab: "mural",
      title: "Mural de Sonhos",
      description: "Fotos, links, medalhas e a Cápsula do Tempo: cartas lacradas para abrir no futuro.",
      icon: <Pin size={48} className="text-cookbook-primary" />,
    },
    {
      id: 5,
      tab: "lovecards",
      title: "LoveCards",
      description: "Conexão além do dinheiro. Jogos e perguntas para vocês se conhecerem melhor e fortalecerem o laço emocional.",
      icon: <Heart size={48} className="text-cookbook-primary" />,
    },
  ];

  const steps = allSteps.filter((step) => MODE_TABS[mode].includes(step.tab));
  const isVisible = showOnboarding && !needsModeChoice;

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      setActiveTab(steps[currentStep].tab);
    }
  }, [currentStep, isVisible, setActiveTab, steps.length]);

  if (!isVisible || !steps[currentStep]) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center p-6">
      {/* Overlay Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
        onClick={completeOnboarding}
      />

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl pointer-events-auto flex flex-col items-center text-center overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
            <motion.div 
              className="h-full bg-cookbook-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <button 
            onClick={completeOnboarding}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mt-4 mb-6 p-4 rounded-2xl bg-cookbook-primary/5">
            {step.icon}
          </div>

          <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
            {step.title}
          </h3>

          <p className="font-sans text-sm text-gray-500 leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="w-full flex items-center justify-between gap-4 mt-auto">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-all ${
                currentStep === 0 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ChevronLeft size={18} /> Voltar
            </button>

            <button
              onClick={handleNext}
              className="flex-1 bg-cookbook-primary text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cookbook-primary/20 hover:bg-cookbook-primary-hover active:scale-95 transition-all"
            >
              {currentStep === steps.length - 1 ? (
                <>Começar <Check size={16} /></>
              ) : (
                <>Próximo <ChevronRight size={16} /></>
              )}
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-1.5 mt-6">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? "w-6 bg-cookbook-primary" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Instructions for non-technical users */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-sans text-[10px] uppercase tracking-widest font-medium"
      >
        Toque fora para pular o tutorial
      </motion.div>
    </div>
  );
};
