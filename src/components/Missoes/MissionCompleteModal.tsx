import React, { useRef } from "react";
import { Camera, X } from "lucide-react";
import { Mission } from "./MissoesConstants";
import { compressImage } from "../../lib/imageUtils";

interface MissionCompleteModalProps {
  mission: Mission;
  amount: string;
  setAmount: (val: string) => void;
  missionImage: string | null;
  setMissionImage: (val: string | null) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onComplete: () => void;
  addToast: (title: string, msg: string, type: "info" | "success" | "milestone") => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  mission,
  amount,
  setAmount,
  missionImage,
  setMissionImage,
  isSubmitting,
  onClose,
  onComplete,
  addToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setMissionImage(base64);
    } catch (err) {
      console.error("Error compressing image:", err);
      addToast("Erro", "Não foi possível carregar a imagem.", "info");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-cookbook-bg/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-cookbook-bg border border-cookbook-border rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-cookbook-text/40 hover:text-cookbook-text bg-cookbook-text/5 hover:bg-cookbook-text/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cookbook-bg border border-cookbook-border rounded-full flex items-center justify-center text-3xl shadow-inner mx-auto mb-4 relative">
            {mission.icon}
          </div>
          <h3 className="font-serif text-xl text-cookbook-text mb-1">
            {mission.title}
          </h3>
          <p className="font-sans text-xs text-cookbook-text/60 line-clamp-2 px-4">
            {mission.desc}
          </p>
        </div>

        {mission.reward > 0 ? (
          <div className="bg-cookbook-primary/5 border border-cookbook-primary/20 rounded-2xl p-4 text-center mb-6">
            <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold block mb-1">
              Recompensa
            </span>
            <span className="font-serif text-3xl text-cookbook-primary">
              R$ {mission.reward}
            </span>
          </div>
        ) : (
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-2xl">
              R$
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-cookbook-bg border border-cookbook-border rounded-2xl py-4 pl-14 pr-4 font-serif text-3xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors text-right"
              autoFocus
            />
          </div>
        )}

        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          {missionImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-cookbook-border h-40">
              <img
                src={missionImage}
                alt="Comprovante"
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMissionImage(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-cookbook-border rounded-2xl text-cookbook-text/40 hover:text-cookbook-primary hover:border-cookbook-primary/50 hover:bg-cookbook-primary/5 transition-all"
            >
              <Camera size={24} />
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold">
                Adicionar Foto Opcional
              </span>
            </button>
          )}
        </div>

        <button
          onClick={onComplete}
          disabled={isSubmitting || (!mission.reward && !amount)}
          className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold hover:bg-cookbook-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg"
        >
          {isSubmitting ? (
            "Completando..."
          ) : (
            <>Completar Missão</>
          )}
        </button>
      </div>
    </div>
  );
};
