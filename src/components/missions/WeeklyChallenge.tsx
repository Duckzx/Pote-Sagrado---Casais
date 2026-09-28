import React, { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";
import { maskCurrency, parseCurrencyString } from "../../lib/maskUtils";
import { playCoinSound, vibrate } from "../../lib/audio";
import { toDate } from "../../lib/progress";

interface WeekChallenge {
  emoji: string;
  title: string;
  tip: string;
  suggested: number;
}

const CHALLENGES: WeekChallenge[] = [
  { emoji: "🛵", title: "Semana sem delivery", tip: "Cozinhem em casa e guardem o que iria para o app.", suggested: 60 },
  { emoji: "🪙", title: "Guardar o troco", tip: "Todo troco ou arredondamento da semana vai para o pote.", suggested: 20 },
  { emoji: "🛍️", title: "Fim de semana sem gastos", tip: "Programas gratuitos: parque, piquenique, filme em casa.", suggested: 80 },
  { emoji: "☕", title: "Café de casa", tip: "Troque o café da rua pelo de casa a semana toda.", suggested: 40 },
  { emoji: "🧺", title: "Desapego da semana", tip: "Venda algo parado no guarda-roupa ou na estante.", suggested: 50 },
  { emoji: "🚶", title: "Semana sem app de corrida", tip: "Caminhe, pedale ou vá de transporte público.", suggested: 45 },
  { emoji: "📵", title: "Zero compras por impulso", tip: "Antes de comprar, espere 48h. Se ainda quiser, guarde o valor.", suggested: 70 },
  { emoji: "🥗", title: "Marmita a semana toda", tip: "Leve comida de casa e guarde a diferença.", suggested: 90 },
];

/** Monday-based week number, same for everyone in the pot. */
function weekKey(d = new Date()) {
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Math.floor(monday.getTime() / (7 * 24 * 60 * 60 * 1000));
}

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

/** A new money-saving challenge every week, completed with one tap. */
export const WeeklyChallenge: React.FC = () => {
  const casalId = useAppStore((s) => s.casalId);
  const deposits = useAppStore((s) => s.deposits);
  const addToast = useAppStore((s) => s.addToast);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const week = weekKey();
  const challenge = CHALLENGES[week % CHALLENGES.length];
  const action = `Desafio da semana: ${challenge.title}`;

  const doneThisWeek = useMemo(
    () =>
      deposits.filter((d) => {
        const date = toDate(d.createdAt);
        return d.action === action && date && weekKey(date) === week;
      }),
    [deposits, action, week],
  );
  const doneTotal = doneThisWeek.reduce((s, d) => s + (Number(d.amount) || 0), 0);

  const daysLeft = 7 - ((new Date().getDay() + 6) % 7);

  const complete = async () => {
    const user = auth.currentUser;
    const value = parseCurrencyString(amount) || challenge.suggested;
    if (!user || !casalId || !(value > 0)) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, `casais/${casalId}/deposits`), {
        amount: value,
        type: "income",
        action,
        who: user.uid,
        whoName: user.displayName || user.email?.split("@")[0] || "Alguém",
        createdAt: serverTimestamp(),
      });
      useAppStore.getState().showUndo(`+${brl(value)} · ${challenge.title}`, ref.path);
      playCoinSound();
      vibrate([30, 50, 30]);
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 }, colors: ["#C9677F", "#D4A574", "#F5DDE2"] });
      addToast("Desafio cumprido! 🎯", `${challenge.emoji} ${challenge.title}: +${brl(value)} no pote`, "success");
      setAmount("");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `casais/${casalId}/deposits`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 border border-cookbook-border bg-gradient-to-br from-cookbook-gold/15 via-cookbook-bg to-cookbook-primary/10 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-cookbook-primary">Desafio da semana</p>
        <span className="font-sans text-[11px] font-bold text-cookbook-text/70">
          {daysLeft === 1 ? "último dia" : `faltam ${daysLeft} dias`}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-4xl">{challenge.emoji}</span>
        <div>
          <p className="font-serif text-2xl text-cookbook-text leading-tight">{challenge.title}</p>
          <p className="font-sans text-xs text-cookbook-text/70 mt-0.5">{challenge.tip}</p>
        </div>
      </div>

      {doneThisWeek.length > 0 && (
        <p data-money className="mt-3 rounded-2xl bg-emerald-500/10 text-emerald-700 px-3 py-2 font-sans text-xs font-bold">
          ✓ Cumprido {doneThisWeek.length}x esta semana · {brl(doneTotal)} guardados
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <input
          value={amount}
          onChange={(e) => setAmount(maskCurrency(e.target.value))}
          inputMode="numeric"
          placeholder={brl(challenge.suggested)}
          aria-label="Valor economizado no desafio"
          className="flex-1 min-w-0 bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary"
        />
        <button
          onClick={complete}
          disabled={busy}
          className="px-5 rounded-2xl bg-cookbook-primary text-cookbook-on-primary font-sans text-[11px] uppercase tracking-widest font-bold shadow-md disabled:opacity-50"
        >
          {busy ? "..." : "Cumpri!"}
        </button>
      </div>
    </section>
  );
};
