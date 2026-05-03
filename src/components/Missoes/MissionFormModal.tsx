import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Mission } from "./MissoesConstants";

interface MissionFormModalProps {
  mission?: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (missionData: Partial<Mission> & { isNew: boolean }) => Promise<void>;
}

export const MissionFormModal: React.FC<MissionFormModalProps> = ({
  mission,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEdit = !!mission;

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [category, setCategory] = useState<"economia" | "desafio" | "custom">("desafio");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mission) {
        setTitle(mission.title);
        setDesc(mission.desc || "");
        setReward(mission.reward > 0 ? mission.reward.toString() : "");
        setIcon(mission.icon);
        setCategory(mission.category);
      } else {
        setTitle("");
        setDesc("");
        setReward("");
        setIcon("⭐");
        setCategory("desafio");
      }
      setIsSaving(false);
    }
  }, [isOpen, mission]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        desc: desc.trim(),
        reward: Number(reward) || 0,
        icon: icon || "⭐",
        category,
        isNew: !isEdit,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-modal-backdrop"
      style={{
        background: "rgba(253,251,247,0.85)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="bg-cookbook-bg border border-cookbook-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="font-serif text-xl text-cookbook-text mb-5">
          {isEdit ? "Editar Missão" : "Criar Missão"}
        </h3>

        {!isEdit && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCategory("desafio")}
              className={`flex-1 py-2.5 rounded-xl font-sans text-[9px] uppercase tracking-widest font-bold border backdrop-blur-md transition-all ${
                category === "desafio"
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-700 "
                  : "bg-cookbook-bg border-white/20 text-cookbook-text/50 hover:bg-cookbook-border/30"
              }`}
            >
              ⚔️ Desafio
            </button>
            <button
              onClick={() => setCategory("economia")}
              className={`flex-1 py-2.5 rounded-xl font-sans text-[9px] uppercase tracking-widest font-bold border backdrop-blur-md transition-all ${
                category === "economia"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 "
                  : "bg-cookbook-bg border-white/20 text-cookbook-text/50 hover:bg-cookbook-border/30"
              }`}
            >
              💚 Economia
            </button>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🍱"
              className="w-14 bg-cookbook-bg border border-cookbook-border rounded-lg px-2 py-3 font-serif text-center text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              maxLength={2}
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
            />
          </div>

          {category !== "economia" && (
            <>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">
                  R$
                </span>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="100"
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg py-3 pl-12 pr-4 font-serif text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-cookbook-border/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};
