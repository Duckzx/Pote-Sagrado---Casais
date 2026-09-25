import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAppStore } from "../store/useAppStore";
import { MODE_OPTIONS, MODE_TABS } from "../lib/mode";
import { PoteMode } from "../types";
import { BlurFade } from "./magicui/blur-fade";
import { ShimmerButton } from "./magicui/shimmer-button";
import { BorderBeam } from "./magicui/border-beam";
import { vibrate } from "../lib/audio";

interface ModePickerProps {
  /** When opened from Settings it can be dismissed */
  onClose?: () => void;
}

/**
 * "How will you use the pot?" — solo, couple or a group of friends.
 * Saved on the shared pot document, so everyone in it sees the same mode.
 */
export const ModePicker: React.FC<ModePickerProps> = ({ onClose }) => {
  const casalId = useAppStore((s) => s.casalId);
  const currentMode = useAppStore((s) => s.mode);
  const currentGroupName = useAppStore((s) => s.groupName);
  const needsModeChoice = useAppStore((s) => s.needsModeChoice);
  const setModeInfo = useAppStore((s) => s.setModeInfo);
  const addToast = useAppStore((s) => s.addToast);

  const [selected, setSelected] = useState<PoteMode | null>(needsModeChoice ? null : currentMode);
  const [groupName, setGroupName] = useState(currentGroupName);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!selected || !casalId) return;
    setIsSaving(true);
    const name = selected === "grupo" ? groupName.trim().slice(0, 40) : "";
    try {
      await setDoc(doc(db, "casais", casalId), { mode: selected, groupName: name }, { merge: true });
      setModeInfo({ mode: selected, groupName: name, needsModeChoice: false });
      const { activeTab, setActiveTab } = useAppStore.getState();
      if (!MODE_TABS[selected].includes(activeTab)) setActiveTab("home");
      vibrate([20, 40, 20]);
      onClose?.();
    } catch (e) {
      console.error(e);
      addToast("Ops!", "Não foi possível salvar o modo agora.", "info");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[240] bg-cookbook-bg/95 backdrop-blur-xl overflow-y-auto">
      <div className="min-h-full flex flex-col justify-center px-6 py-10 max-w-md mx-auto">
        <BlurFade delay={0.05}>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-cookbook-primary text-center">
            {needsModeChoice ? "Bem-vinda(o) ✨" : "Modo de uso"}
          </p>
        </BlurFade>
        <BlurFade delay={0.12}>
          <h2 className="font-serif text-4xl text-cookbook-text text-center leading-tight mt-2">
            Como você vai usar <span className="italic text-cookbook-primary">o pote?</span>
          </h2>
        </BlurFade>
        <BlurFade delay={0.18}>
          <p className="font-sans text-sm text-cookbook-text/60 text-center mt-3">
            Dá para mudar depois em Ajustes.
          </p>
        </BlurFade>

        <div className="mt-8 space-y-3">
          {MODE_OPTIONS.map((option, i) => {
            const isActive = selected === option.id;
            return (
              <BlurFade key={option.id} delay={0.25 + i * 0.08}>
                <button
                  onClick={() => {
                    setSelected(option.id);
                    vibrate(10);
                  }}
                  className={`relative w-full text-left rounded-3xl p-5 border overflow-hidden transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-cookbook-primary bg-cookbook-bg shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                      : "border-cookbook-border bg-cookbook-bg/70"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-60 pointer-events-none`} />
                  <div className="relative flex items-center gap-4">
                    <span className="text-4xl">{option.emoji}</span>
                    <div className="flex-1">
                      <p className="font-serif text-2xl text-cookbook-text leading-tight">{option.title}</p>
                      <p className="font-sans text-xs text-cookbook-text/60 mt-1 leading-snug">{option.subtitle}</p>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isActive ? "bg-cookbook-primary border-cookbook-primary text-white" : "border-cookbook-border"
                      }`}
                    >
                      {isActive && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                  {isActive && <BorderBeam size={90} duration={5} colorFrom="var(--theme-primary)" colorTo="var(--theme-gold)" borderWidth={2} />}
                </button>
              </BlurFade>
            );
          })}
        </div>

        <AnimatePresence>
          {selected === "grupo" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="block mt-5">
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text/50">
                  Nome do grupo
                </span>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={40}
                  placeholder="Ex: Viagem pra Bahia 🌴"
                  className="mt-2 w-full bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3 font-serif text-xl text-cookbook-text focus:outline-none focus:border-cookbook-primary"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-3">
          <ShimmerButton
            onClick={save}
            disabled={!selected || isSaving}
            background="var(--theme-primary)"
            shimmerColor="#ffffff"
            className="w-full py-4 font-sans text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-40"
          >
            {isSaving ? "Salvando..." : "Continuar"}
          </ShimmerButton>
          {onClose && (
            <button
              onClick={onClose}
              className="font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text/40 py-2"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
