import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { addDoc, arrayUnion, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { Portal } from "../ui/portal";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { playCoinSound, vibrate } from "../../lib/audio";
import { BorderBeam } from "../magicui/border-beam";
import { ShareableWidget } from "../ShareableWidget";
import { Share2 } from "lucide-react";

const TOTAL = 100;
const EMPTY: number[] = [];
const GOAL = (TOTAL * (TOTAL + 1)) / 2; // R$ 5.050
const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

/**
 * "Desafio dos 100 envelopes": each envelope N adds R$ N to the pot.
 * Opened envelopes live on the shared goal document, so everyone in the
 * pot sees the grid update in real time.
 */
export const EnvelopeChallenge: React.FC = () => {
  const casalId = useAppStore((s) => s.casalId);
  const opened = useAppStore((s) => s.tripConfig?.envelopes) || EMPTY;
  const addToast = useAppStore((s) => s.addToast);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const mode = useAppStore((s) => s.mode);

  const openedSet = useMemo(() => new Set(opened), [opened]);
  const saved = useMemo(() => opened.reduce((sum, n) => sum + n, 0), [opened]);
  const pct = Math.round((saved / GOAL) * 100);

  const surprise = () => {
    const remaining = Array.from({ length: TOTAL }, (_, i) => i + 1).filter((n) => !openedSet.has(n));
    if (remaining.length === 0) return;
    setConfirming(remaining[Math.floor(Math.random() * remaining.length)]);
    vibrate(15);
  };

  const openEnvelope = async (n: number) => {
    const user = auth.currentUser;
    if (!user || !casalId || openedSet.has(n)) return;
    setBusy(true);
    try {
      await setDoc(doc(db, `casais/${casalId}/trip_config`, "main"), { envelopes: arrayUnion(n) }, { merge: true });
      await addDoc(collection(db, `casais/${casalId}/deposits`), {
        amount: n,
        type: "income",
        action: `Desafio dos Envelopes #${n}`,
        who: user.uid,
        whoName: user.displayName || user.email?.split("@")[0] || "Alguém",
        createdAt: serverTimestamp(),
      });
      playCoinSound();
      vibrate([20, 40, 20]);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 }, colors: ["#C9677F", "#D4A574", "#F5DDE2"] });
      const total = opened.length + 1;
      addToast(
        total === TOTAL ? "Desafio completo! 🏆" : `Envelope #${n} aberto 💌`,
        total === TOTAL ? `Vocês juntaram ${brl(GOAL)}!` : `+${brl(n)} no pote · ${total}/${TOTAL} envelopes`,
        total === TOTAL ? "milestone" : "success",
      );
      setConfirming(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `casais/${casalId}/trip_config`);
    } finally {
      setBusy(false);
    }
  };

  const visible = expanded ? TOTAL : 30;

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 border border-cookbook-border bg-cookbook-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-cookbook-primary">Desafio viral</p>
          <h3 className="font-serif text-2xl text-cookbook-text leading-tight">100 Envelopes 💌</h3>
          <p className="font-sans text-xs text-cookbook-text/60 mt-1">
            Abra um envelope e guarde o valor dele. No fim: {brl(GOAL)}.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-serif text-3xl text-cookbook-primary leading-none">{pct}%</p>
          <p className="font-sans text-[10px] text-cookbook-text/50 mt-1">{opened.length}/{TOTAL}</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-cookbook-border/50 overflow-hidden mt-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cookbook-primary to-cookbook-gold"
          animate={{ width: `${Math.max(2, pct)}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <p className="font-sans text-[11px] text-cookbook-text/50 mt-1.5">
        {brl(saved)} guardados · faltam {brl(GOAL - saved)}
      </p>

      <div className="grid grid-cols-6 gap-1.5 mt-4">
        {Array.from({ length: visible }, (_, i) => i + 1).map((n) => {
          const done = openedSet.has(n);
          return (
            <button
              key={n}
              onClick={() => (done ? null : setConfirming(n))}
              disabled={done}
              aria-label={done ? `Envelope ${n} aberto` : `Abrir envelope ${n}`}
              className={`aspect-square rounded-xl font-sans text-xs font-bold transition-all active:scale-90 ${
                done
                  ? "bg-gradient-to-br from-cookbook-primary to-cookbook-gold text-white shadow-inner"
                  : "bg-cookbook-primary/[0.06] border border-cookbook-primary/15 text-cookbook-text/70"
              }`}
            >
              {done ? "✓" : n}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 py-3 rounded-full border border-cookbook-border font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text/60"
        >
          {expanded ? "Ver menos" : "Ver todos"}
        </button>
        <button
          onClick={() => setSharing(true)}
          disabled={opened.length === 0}
          className="w-12 shrink-0 rounded-full border border-cookbook-border flex items-center justify-center text-cookbook-primary disabled:opacity-30"
          aria-label="Compartilhar desafio"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={surprise}
          disabled={opened.length >= TOTAL}
          className="flex-[1.4] py-3 rounded-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold shadow-md disabled:opacity-40"
        >
          🎲 Sortear envelope
        </button>
      </div>

      {sharing && (
        <Portal>
          <ShareableWidget
            goalAmount={GOAL}
            totalSaved={saved}
            destination="Desafio dos 100 Envelopes"
            celebration="Mostre o seu desafio 💌"
            override={{
              headline: `${opened.length}/100 envelopes abertos 💌`,
              subline: "Desafio dos 100 Envelopes",
              message: `${mode === "solo" ? "Estou fazendo" : "Estamos fazendo"} o Desafio dos 100 Envelopes no Pote Sagrado: ${opened.length}/100 envelopes e ${brl(saved)} guardados 💌 Faça o seu:`,
            }}
            onClose={() => setSharing(false)}
          />
        </Portal>
      )}

      <Portal>
      <AnimatePresence>
        {confirming !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => !busy && setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.85, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs rounded-[28px] bg-cookbook-mural p-6 text-center overflow-hidden shadow-2xl"
            >
              <p className="text-5xl">💌</p>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-bold text-cookbook-text/50 mt-3">Envelope #{confirming}</p>
              <p className="font-serif text-5xl text-cookbook-primary mt-1">{brl(confirming)}</p>
              <p className="font-sans text-xs text-cookbook-text/60 mt-2">Guarde esse valor e registre no pote.</p>
              <button
                onClick={() => openEnvelope(confirming)}
                disabled={busy}
                className="w-full mt-5 py-3.5 rounded-full bg-cookbook-primary text-white font-sans text-xs uppercase tracking-widest font-bold disabled:opacity-50"
              >
                {busy ? "Guardando..." : "Guardei! Abrir envelope"}
              </button>
              <button onClick={() => setConfirming(null)} className="mt-2 py-2 font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-text/40">
                Agora não
              </button>
              <BorderBeam size={90} duration={5} colorFrom="var(--theme-primary)" colorTo="var(--theme-gold)" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </section>
  );
};
