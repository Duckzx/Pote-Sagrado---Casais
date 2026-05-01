import React from "react";
import { X } from "lucide-react";

interface MissionFormModalProps {
  title: string;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  editReward: string;
  setEditReward: (val: string) => void;
  editIcon: string;
  setEditIcon: (val: string) => void;
  category: "economia" | "desafio" | "custom";
  setCategory?: (val: "economia" | "desafio") => void;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const MissionFormModal: React.FC<MissionFormModalProps> = ({
  title,
  isEditing,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editReward,
  setEditReward,
  editIcon,
  setEditIcon,
  category,
  setCategory,
  isSaving,
  onClose,
  onSave,
}) => {
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
        <h3 className="font-serif text-xl text-cookbook-text mb-5">
          {title}
        </h3>
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={editIcon}
              onChange={(e) => setEditIcon(e.target.value)}
              placeholder="🍱"
              className="w-14 bg-cookbook-bg border border-cookbook-border rounded-lg px-2 py-3 font-serif text-center text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              maxLength={2}
            />
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título"
              className="flex-1 bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
            />
          </div>

          {!isEditing && setCategory && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setCategory("desafio")}
                className={`flex-1 py-2 rounded-lg font-sans text-[10px] uppercase tracking-widest font-bold transition-colors ${
                  category === "desafio"
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                    : "bg-cookbook-bg border border-cookbook-border/50 text-cookbook-text/50"
                }`}
              >
                Desafio
              </button>
              <button
                onClick={() => setCategory("economia")}
                className={`flex-1 py-2 rounded-lg font-sans text-[10px] uppercase tracking-widest font-bold transition-colors ${
                  category === "economia"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    : "bg-cookbook-bg border border-cookbook-border/50 text-cookbook-text/50"
                }`}
              >
                Personalizado
              </button>
            </div>
          )}

          {(category === "desafio" || (isEditing && category === "desafio")) && (
            <>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-lg px-4 py-3 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary transition-colors"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-cookbook-text/50 text-lg">
                  R$
                </span>
                <input
                  type="number"
                  value={editReward}
                  onChange={(e) => setEditReward(e.target.value)}
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
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 rounded-lg font-bold hover:bg-cookbook-primary-hover transition-colors disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};
