import React, { useState } from "react";
import { PiggyBank, Target, Trophy, ArrowRight, Check, Heart, Pin } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { SacredJarIcon } from "./SacredJarIcon";
interface OnboardingModalProps {
  onComplete: () => void;
}
export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      icon: <SacredJarIcon className="w-16 h-16 mx-auto mb-4" />,
      title: "Bem-vindo ao Pote Sagrado",
      description:
        "O Pote Sagrado é o cofrinho digital do casal. O objetivo é ajudar vocês a economizarem juntos para um sonho especial, de forma divertida e gamificada.",
    },
    {
      icon: <PiggyBank size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "O Pote e o Sonho",
      description:
        "Na tela inicial, vocês definem o destino e a meta. O Pote cresce visualmente conforme vocês guardam. Ao atingir a meta, vocês podem 'quebrar' o pote e celebrar!",
    },
    {
      icon: <Target size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "Missões e Bingo",
      description:
        "Evitou um gasto hoje (como um delivery ou café)? Marque no Bingo! O valor economizado vai direto para o Pote. É a economia do cotidiano virando realidade.",
    },
    {
      icon: <Trophy size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "Arena de Disputas",
      description:
        "Uma competição saudável! Vejam quem guardou mais no mês e ganhem prêmios simbólicos. O ranking incentiva ambos a manterem o foco no objetivo do casal.",
    },
    {
      icon: <Pin size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "Mural de Sonhos",
      description:
        "Um espaço para guardar links de hotéis, fotos de inspiração e ver suas medalhas. É o quadro de visualização do futuro de vocês.",
    },
    {
      icon: <Heart size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "LoveCards",
      description:
        "Conexão emocional! Um jogo de cartas com perguntas e desafios para vocês se conhecerem melhor e fortalecerem o laço enquanto economizam.",
    },
  ];
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  return (
    <FocusTrap>
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop"
      >
        {" "}
        <div className="bg-cookbook-bg border border-cookbook-border rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden text-center animate-modal-enter">
          {" "}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />{" "}
          <div className="min-h-[220px] flex flex-col justify-center">
            {" "}
            {steps[step].icon}{" "}
            <h2 id="onboarding-title" className="font-serif text-2xl text-cookbook-text mb-3">
              {" "}
              {steps[step].title}{" "}
            </h2>{" "}
            <p className="font-sans text-sm text-cookbook-text/70 leading-relaxed">
              {" "}
              {steps[step].description}{" "}
            </p>{" "}
          </div>{" "}
          <div className="flex justify-center space-x-2 my-6">
            {" "}
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? "w-6 bg-cookbook-primary" : "w-1.5 bg-cookbook-border"}`}
              />
            ))}{" "}
          </div>{" "}
          <button
            onClick={handleNext}
            aria-label={step === steps.length - 1 ? "Começar a Guardar" : "Próxima etapa"}
            className="w-full flex items-center justify-center space-x-2 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold transition-transform active:scale-95 shadow-md"
          >
            {" "}
            <span>
              {" "}
              {step === steps.length - 1 ? "Começar a Guardar" : "Próximo"}{" "}
            </span>{" "}
            {step === steps.length - 1 ? (
              <Check size={16} />
            ) : (
              <ArrowRight size={16} />
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>
    </FocusTrap>
  );
};
