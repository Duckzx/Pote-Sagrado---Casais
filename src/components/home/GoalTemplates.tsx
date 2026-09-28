import React, { useState } from "react";
import { IconBadge, type IconName, type IconTone } from "../ui/app-icon";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { GoalType } from "../../types";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { BorderBeam } from "../magicui/border-beam";
import { vibrate } from "../../lib/audio";

interface Template {
  emoji: IconName;
  tone: IconTone;
  label: string;
  goalType: GoalType;
  amount: number;
}

const TEMPLATES: Template[] = [
  { emoji: "travel", tone: "sky", label: "Viagem dos sonhos", goalType: "travel", amount: 5000 },
  { emoji: "shield", tone: "emerald", label: "Reserva de emergência", goalType: "savings", amount: 3000 },
  { emoji: "phone", tone: "violet", label: "Celular novo", goalType: "other", amount: 4000 },
  { emoji: "mic", tone: "rose", label: "Show ou festival", goalType: "other", amount: 800 },
  { emoji: "house", tone: "amber", label: "Nosso cantinho", goalType: "house", amount: 15000 },
  { emoji: "ring", tone: "primary", label: "Casamento", goalType: "wedding", amount: 30000 },
  { emoji: "car", tone: "sky", label: "Carro", goalType: "car", amount: 20000 },
  { emoji: "graduation", tone: "violet", label: "Curso ou intercâmbio", goalType: "other", amount: 6000 },
];

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

/** One-tap goals for people who haven't set one yet. */
export const GoalTemplates: React.FC = () => {
  const casalId = useAppStore((s) => s.casalId);
  const mode = useAppStore((s) => s.mode);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const addToast = useAppStore((s) => s.addToast);
  const [saving, setSaving] = useState<string | null>(null);

  const choose = async (t: Template) => {
    if (!casalId) return;
    setSaving(t.label);
    vibrate(15);
    try {
      await setDoc(
        doc(db, `casais/${casalId}/trip_config`, "main"),
        { goalType: t.goalType, destination: t.label, goalAmount: t.amount, updatedAt: serverTimestamp() },
        { merge: true },
      );
      addToast("Meta criada ✨", `${t.label}: ${brl(t.amount)}. Dá para ajustar em Ajustes.`, "success");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `casais/${casalId}/trip_config`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl p-5 border border-cookbook-primary/30 bg-gradient-to-br from-cookbook-primary/15 via-cookbook-bg to-cookbook-gold/15 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      <p className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-cookbook-primary">Primeiro passo</p>
      <p className="font-serif text-2xl text-cookbook-text leading-tight mt-1">
        {mode === "solo" ? "Qual é o seu sonho?" : mode === "grupo" ? "Qual é o plano da turma?" : "Qual é o sonho de vocês?"}
      </p>
      <p className="font-sans text-xs text-cookbook-text/70 mt-1">Escolha um para começar. Dá para mudar quando quiser.</p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => choose(t)}
            disabled={!!saving}
            className="text-left rounded-2xl p-3 bg-cookbook-bg/80 border border-cookbook-border active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <IconBadge name={t.emoji} tone={t.tone} badgeSize="sm" />
            <p className="font-sans text-xs font-bold text-cookbook-text leading-tight mt-2.5">{saving === t.label ? "Criando..." : t.label}</p>
            <p className="font-sans text-[11px] text-cookbook-text/70">{brl(t.amount)}</p>
          </button>
        ))}
      </div>
      <button
        onClick={() => setActiveTab("config")}
        className="w-full mt-3 py-2.5 font-sans text-[11px] uppercase tracking-widest font-bold text-cookbook-primary"
      >
        Criar a minha do zero →
      </button>
      <BorderBeam size={80} duration={7} colorFrom="var(--theme-primary)" colorTo="var(--theme-gold)" />
    </section>
  );
};
