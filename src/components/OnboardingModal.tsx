import React, { useState } from "react";
import { PiggyBank, Target, Trophy, ArrowRight, Check } from "lucide-react";
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
        "O lugar onde vocês guardam dinheiro juntos para realizar a viagem dos sonhos. Cada centavo conta!",
    },
    {
      icon: <Target size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "Bingo de Atitudes",
      description:
        "Pequenas escolhas viram grandes viagens. Evitou o delivery hoje? Fez o café em casa? Registre no Bingo e guarde o valor no Pote!",
    },
    {
      icon: <Trophy size={48} className="text-cookbook-primary mx-auto mb-4" />,
      title: "Disputa Saudável",
      description:
        "Acompanhem quem está guardando mais dinheiro no mês. Que tal o perdedor pagar um lanche no final de semana?",
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-sm">
      {" "}
      <div className="bg-cookbook-bg border border-cookbook-border rounded w-full max-w-sm p-8 shadow-2xl relative overflow-hidden text-center">
        {" "}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />{" "}
        <div className="min-h-[220px] flex flex-col justify-center">
          {" "}
          {steps[step].icon}{" "}
          <h2 className="font-serif text-2xl text-cookbook-text mb-3">
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
  );
};
