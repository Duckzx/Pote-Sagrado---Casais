import React, { useState } from "react";
import { X, Camera } from "lucide-react";
import { Mission } from "./MissoesConstants";
import { compressImage } from "../../lib/imageUtils";

interface MissionCompleteModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, imageUrl: string | null) => Promise<void>;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  mission,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState("");
  const [missionImage, setMissionImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mission) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setMissionImage(base64);
    } catch (err) {
      console.error("Error compressing image:", err);
      // Fallback or toast could be added here if needed
    }
  };

  const handleComplete = async () => {
    let parsedAmount = 0;
    if (amount) {
      parsedAmount = Number(amount.replace(",", "."));
    }
    const finalAmount = mission.reward > 0 ? mission.reward : parsedAmount;

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(finalAmount, missionImage);
      onClose();
      // Reset state for next time
      setAmount("");
      setMissionImage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEconomy = mission.category === "economia";
  const isDesafio = mission.category === "desafio";
  const isCustom = mission.category === "custom";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop"
      style={{
        background: "rgba(253,251,247,0.85)",
        backdropFilter: "blur(6px)",
      }}
      onClick={() => {
        onClose();
        setMissionImage(null);
      }}
    >
      <div
        className="bg-cookbook-bg border border-cookbook-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored accent */}
        <div
          className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
            isEconomy
              ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
              : isDesafio
                ? "bg-gradient-to-r from-amber-400 to-amber-300"
                : "bg-gradient-to-r from-violet-400 to-violet-300"
          }`}
        />
        <button
          onClick={() => {
            onClose();
            setMissionImage(null);
          }}
          className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text transition-colors"
        >
          <X size={20} />
        </button>
        <div className="text-center mb-6 pt-2">
          <span className="text-5xl block mb-4">{mission.icon}</span>
          <h3 className="font-serif italic text-xl text-cookbook-text mb-1">
            {mission.title}
          </h3>
          {mission.desc && (
            <p className="font-sans text-[10px] text-cookbook-text/50 leading-relaxed">
              {mission.desc}
            </p>
          )}
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold mt-3">
            {mission.reward > 0
              ? `Recompensa: R$ ${mission.reward}`
              : "Quanto você economizou?"}
          </p>
        </div>
        <div className="space-y-4">
          {mission.reward === 0 && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">
                R$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-xl py-4 pl-12 pr-4 font-serif text-2xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                autoFocus
              />
            </div>
          )}
          {/* Image Upload for Proof of Save */}
          <div className="mt-2 text-center">
            {missionImage ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-cookbook-border">
                <img
                  src={missionImage}
                  alt="Proof"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setMissionImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-cookbook-border rounded-xl cursor-pointer bg-cookbook-bg hover:bg-cookbook-primary/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-cookbook-text/50" />
                  <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text/60">
                    Anexar Foto de Comprovação
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={
              isSubmitting ||
              (mission.reward === 0 &&
                (!amount ||
                  isNaN(Number(amount.replace(",", "."))) ||
                  Number(amount.replace(",", ".")) <= 0))
            }
            className={`w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold disabled:opacity-50 transition-all active:scale-95 shadow-lg ${
              isEconomy
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500"
                : isDesafio
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500"
                  : "bg-gradient-to-r from-violet-500 to-violet-400 hover:from-violet-600 hover:to-violet-500"
            }`}
          >
            {isSubmitting
              ? "Guardando..."
              : mission.reward > 0
                ? `Guardar R$ ${mission.reward}`
                : "Guardar no Pote"}
          </button>
        </div>
      </div>
    </div>
  );
};
